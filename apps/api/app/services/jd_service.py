from __future__ import annotations

import asyncio
import logging
from datetime import datetime
from typing import Optional, List
from uuid import uuid4

from fastapi import HTTPException, status, BackgroundTasks

from ..schemas import (
    JDRequest,
    JDResponse, 
    JDListResponse,
    JDSource,
    TaskResponse,
    TaskStatus,
    TaskType
)
from ..store import JDStore, TaskStore
from ..adapters import (
    ShixiSengAdapter,
    ZhaopinAdapter, 
    Job51Adapter,
    BossAdapter
)

logger = logging.getLogger(__name__)

DEFAULT_USER_ID = "demo-user"


class JDService:
    def __init__(
        self, 
        jd_store: JDStore,
        task_store: TaskStore,
        shixiseng_adapter: ShixiSengAdapter,
        zhaopin_adapter: ZhaopinAdapter,
        job51_adapter: Job51Adapter,
        boss_adapter: BossAdapter
    ):
        self.jd_store = jd_store
        self.task_store = task_store
        self.adapters = {
            JDSource.SHIXISENG: shixiseng_adapter,
            JDSource.ZHAOPIN: zhaopin_adapter,
            JDSource.JOB51: job51_adapter,
            JDSource.BOSS: boss_adapter
        }

    async def fetch_jd_async(
        self, 
        request: JDRequest, 
        user_id: Optional[str],
        background_tasks: BackgroundTasks
    ) -> TaskResponse:
        """异步抓取JD"""
        user = user_id or DEFAULT_USER_ID
        task_id = f"jd_{uuid4().hex[:8]}"
        
        # 创建任务记录
        task = self.task_store.create_task(
            task_id=task_id,
            task_type=TaskType.JD_FETCH,
            user_id=user,
            status=TaskStatus.QUEUED
        )
        
        # 添加后台任务
        background_tasks.add_task(
            self._fetch_jd_background,
            task_id,
            request,
            user
        )
        
        return task

    async def _fetch_jd_background(
        self,
        task_id: str,
        request: JDRequest,
        user_id: str
    ):
        """后台执行JD抓取"""
        try:
            # 更新任务状态
            self.task_store.update_task_status(task_id, TaskStatus.RUNNING)
            
            jd_results = []
            
            # 如果提供了文本，直接解析
            if request.text:
                jd = await self._parse_jd_text(request.text, request, user_id)
                jd_results.append(jd)
            
            # 如果提供了URL，尝试抓取
            elif request.url:
                jd = await self._fetch_jd_from_url(request.url, user_id)
                if jd:
                    jd_results.append(jd)
            
            # 如果提供了搜索条件，多源搜索
            elif request.company or request.title:
                jd_results = await self._search_multi_source(
                    request.company,
                    request.title, 
                    request.city,
                    user_id
                )
            
            # 更新任务结果
            self.task_store.update_task_result(
                task_id,
                TaskStatus.DONE,
                {"jd_results": [jd.model_dump() for jd in jd_results]}
            )
            
        except Exception as e:
            logger.error(f"JD fetch failed for task {task_id}: {e}")
            self.task_store.update_task_result(
                task_id,
                TaskStatus.ERROR,
                error=str(e)
            )

    async def _parse_jd_text(
        self, 
        text: str, 
        request: JDRequest, 
        user_id: str
    ) -> JDResponse:
        """解析JD文本"""
        # 简单的文本解析逻辑
        company = request.company or self._extract_company(text)
        title = request.title or self._extract_title(text)
        skills = self._extract_skills(text)
        
        jd_id = f"jd_{uuid4().hex[:8]}"
        
        jd = JDResponse(
            id=jd_id,
            company=company,
            title=title,
            location=request.city,
            jd_text=text,
            must_have_skills=skills[:5],  # 前5个作为必备技能
            nice_to_have=skills[5:],      # 其余作为加分技能
            source=JDSource.MANUAL,
            created_at=datetime.utcnow()
        )
        
        # 保存到存储
        self.jd_store.create_jd(jd, user_id)
        
        return jd

    async def _fetch_jd_from_url(self, url: str, user_id: str) -> Optional[JDResponse]:
        """从URL抓取JD"""
        # 根据URL判断来源
        source = self._detect_source_from_url(url)
        adapter = self.adapters.get(source)
        
        if not adapter:
            # 使用通用的Boss适配器（Playwright）
            adapter = self.adapters[JDSource.BOSS]
        
        try:
            jd_data = await adapter.fetch_jd_by_url(url)
            if jd_data:
                jd = JDResponse(**jd_data, source=source, created_at=datetime.utcnow())
                self.jd_store.create_jd(jd, user_id)
                return jd
        except Exception as e:
            logger.error(f"Failed to fetch JD from {url}: {e}")
        
        return None

    async def _search_multi_source(
        self,
        company: Optional[str],
        title: Optional[str], 
        city: Optional[str],
        user_id: str,
        limit: int = 20
    ) -> List[JDResponse]:
        """多源搜索JD"""
        results = []
        
        # 并行搜索多个源
        tasks = []
        for source, adapter in self.adapters.items():
            if adapter.is_available():
                task = asyncio.create_task(
                    adapter.search_jd(
                        company=company,
                        title=title,
                        city=city,
                        limit=limit // len(self.adapters)
                    )
                )
                tasks.append((source, task))
        
        # 等待所有搜索完成
        for source, task in tasks:
            try:
                jd_list = await task
                for jd_data in jd_list:
                    jd = JDResponse(**jd_data, source=source, created_at=datetime.utcnow())
                    self.jd_store.create_jd(jd, user_id)
                    results.append(jd)
            except Exception as e:
                logger.error(f"Search failed for {source}: {e}")
        
        # 去重和排序
        results = self._deduplicate_jds(results)
        return results[:limit]

    async def search_jd(
        self,
        company: Optional[str] = None,
        title: Optional[str] = None,
        city: Optional[str] = None,
        limit: int = 20,
        user_id: Optional[str] = None
    ) -> JDListResponse:
        """搜索JD接口"""
        user = user_id or DEFAULT_USER_ID
        
        # 先从本地存储搜索
        local_results = self.jd_store.search_jd(
            user_id=user,
            company=company,
            title=title,
            city=city,
            limit=limit
        )
        
        # 如果本地结果不足，触发在线搜索
        if len(local_results) < limit:
            online_results = await self._search_multi_source(
                company, title, city, user, limit - len(local_results)
            )
            local_results.extend(online_results)
        
        return JDListResponse(items=local_results[:limit])

    def list_jd(self, user_id: Optional[str]) -> List[JDResponse]:
        """获取用户的JD列表"""
        user = user_id or DEFAULT_USER_ID
        return self.jd_store.list_by_user(user)

    def get_jd(self, jd_id: str, user_id: Optional[str]) -> JDResponse:
        """获取单个JD"""
        jd = self.jd_store.get_jd(jd_id)
        if not jd:
            raise HTTPException(status_code=404, detail="JD不存在")
        
        # 权限检查（如果需要）
        # if user_id and jd.user_id != user_id:
        #     raise HTTPException(status_code=403, detail="无权访问")
        
        return jd

    def _detect_source_from_url(self, url: str) -> JDSource:
        """根据URL检测来源"""
        if "shixiseng.com" in url:
            return JDSource.SHIXISENG
        elif "zhaopin.com" in url:
            return JDSource.ZHAOPIN
        elif "51job.com" in url:
            return JDSource.JOB51
        elif "zhipin.com" in url:
            return JDSource.BOSS
        else:
            return JDSource.BOSS  # 默认使用通用适配器

    def _extract_company(self, text: str) -> str:
        """从文本中提取公司名"""
        # 简单的公司名提取逻辑
        lines = text.split('\n')
        for line in lines[:5]:  # 只检查前5行
            if any(keyword in line for keyword in ['公司', '科技', '集团', '有限']):
                return line.strip()
        return "未知公司"

    def _extract_title(self, text: str) -> str:
        """从文本中提取职位名"""
        # 简单的职位提取逻辑
        lines = text.split('\n')
        for line in lines[:3]:  # 只检查前3行
            if any(keyword in line for keyword in ['工程师', '经理', '专员', '主管', '总监']):
                return line.strip()
        return "未知职位"

    def _extract_skills(self, text: str) -> List[str]:
        """从文本中提取技能"""
        # 技能词典
        skill_keywords = [
            "Python", "Java", "JavaScript", "Go", "C++", "React", "Vue", "Node.js",
            "MySQL", "Redis", "MongoDB", "Docker", "Kubernetes", "AWS", "Git",
            "产品经理", "数据分析", "项目管理", "用户体验", "市场营销", "运营"
        ]
        
        found_skills = []
        text_lower = text.lower()
        
        for skill in skill_keywords:
            if skill.lower() in text_lower:
                found_skills.append(skill)
        
        return found_skills

    def _deduplicate_jds(self, jds: List[JDResponse]) -> List[JDResponse]:
        """JD去重"""
        seen = set()
        unique_jds = []
        
        for jd in jds:
            # 使用公司+职位+地点作为去重key
            key = f"{jd.company}_{jd.title}_{jd.location or ''}"
            if key not in seen:
                seen.add(key)
                unique_jds.append(jd)
        
        return unique_jds