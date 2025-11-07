from __future__ import annotations

import asyncio
from datetime import datetime
from typing import Optional, List
from uuid import uuid4
from fastapi import BackgroundTasks

from ..schemas import (
    CommonalityRequest, 
    CommonalityResponse, 
    CommonalityItem,
    TaskResponse,
    TaskStatus,
    TaskType
)
from ..store import JDStore, TaskStore

DEFAULT_USER_ID = "demo-user"


class CommonalityService:
    """共性提炼服务"""
    
    def __init__(self, jd_store: JDStore, task_store: TaskStore):
        self.jd_store = jd_store
        self.task_store = task_store
        self._commonalities = {}  # 简单内存存储

    async def extract_commonalities_async(
        self,
        request: CommonalityRequest,
        user_id: Optional[str],
        background_tasks: BackgroundTasks
    ) -> TaskResponse:
        """异步提炼共性"""
        user = user_id or DEFAULT_USER_ID
        task_id = f"commonality_{uuid4().hex[:8]}"
        
        # 创建任务
        task = self.task_store.create_task(
            task_id=task_id,
            task_type=TaskType.COMMONALITY,
            user_id=user,
            status=TaskStatus.QUEUED
        )
        
        # 添加后台任务
        background_tasks.add_task(
            self._extract_commonalities_background,
            task_id,
            request,
            user
        )
        
        return task

    async def _extract_commonalities_background(
        self,
        task_id: str,
        request: CommonalityRequest,
        user_id: str
    ):
        """后台执行共性提炼"""
        try:
            # 更新任务状态
            self.task_store.update_task_status(task_id, TaskStatus.RUNNING)
            
            # 获取JD文本
            jd_texts = []
            for jd_id in request.jd_ids:
                jd = self.jd_store.get_jd(jd_id)
                if jd:
                    jd_texts.append(jd.jd_text)
            
            # 模拟LLM处理
            await asyncio.sleep(2)  # 模拟处理时间
            
            # 生成共性结果
            commonality_id = f"common_{uuid4().hex[:8]}"
            commonality = self._generate_mock_commonality(commonality_id, jd_texts, request)
            
            # 保存结果
            self._commonalities[commonality_id] = commonality
            
            # 更新任务结果
            self.task_store.update_task_result(
                task_id,
                TaskStatus.DONE,
                {"commonality_id": commonality_id, "commonality": commonality.model_dump()}
            )
            
        except Exception as e:
            self.task_store.update_task_result(
                task_id,
                TaskStatus.ERROR,
                error=str(e)
            )

    def get_commonality(self, commonality_id: str, user_id: Optional[str]) -> CommonalityResponse:
        """获取共性提炼结果"""
        commonality = self._commonalities.get(commonality_id)
        if not commonality:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="共性提炼结果不存在")
        
        return commonality

    def _generate_mock_commonality(
        self, 
        commonality_id: str, 
        jd_texts: List[str], 
        request: CommonalityRequest
    ) -> CommonalityResponse:
        """生成模拟的共性提炼结果"""
        
        # 模拟15条共性
        items_15 = [
            CommonalityItem(text="具备3-5年相关工作经验", frequency=8, importance=0.9),
            CommonalityItem(text="熟练掌握主流技术栈", frequency=7, importance=0.85),
            CommonalityItem(text="具备良好的沟通协调能力", frequency=6, importance=0.8),
            CommonalityItem(text="有团队合作精神", frequency=6, importance=0.75),
            CommonalityItem(text="学习能力强，适应性好", frequency=5, importance=0.7),
            CommonalityItem(text="有项目管理经验", frequency=5, importance=0.65),
            CommonalityItem(text="熟悉敏捷开发流程", frequency=4, importance=0.6),
            CommonalityItem(text="有数据分析能力", frequency=4, importance=0.55),
            CommonalityItem(text="英语读写能力良好", frequency=3, importance=0.5),
            CommonalityItem(text="有创新思维", frequency=3, importance=0.45),
            CommonalityItem(text="抗压能力强", frequency=3, importance=0.4),
            CommonalityItem(text="有客户服务意识", frequency=2, importance=0.35),
            CommonalityItem(text="熟悉行业标准", frequency=2, importance=0.3),
            CommonalityItem(text="有持续学习意愿", frequency=2, importance=0.25),
            CommonalityItem(text="具备问题解决能力", frequency=2, importance=0.2),
        ]
        
        # 前5个作为核心共性
        top_5 = items_15[:5]
        
        return CommonalityResponse(
            id=commonality_id,
            query_info={
                "jd_count": len(jd_texts),
                "company_preference": request.company_preference,
                "processed_at": datetime.utcnow().isoformat()
            },
            items_15=items_15,
            top_5=top_5,
            created_at=datetime.utcnow()
        )