from __future__ import annotations

import httpx
import logging
from typing import Optional, List, Dict, Any
from urllib.parse import urlencode

logger = logging.getLogger(__name__)


class ZhaopinAdapter:
    """智联招聘适配器（前端JSON接口）"""
    
    def __init__(self):
        self.base_url = "https://fe-api.zhaopin.com"
        self.client = httpx.AsyncClient(
            timeout=30.0,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Referer": "https://www.zhaopin.com/",
                "Accept": "application/json, text/plain, */*"
            }
        )

    def is_available(self) -> bool:
        """检查适配器是否可用"""
        return True  # 智联前端接口通常可用

    async def search_jd(
        self,
        company: Optional[str] = None,
        title: Optional[str] = None,
        city: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """搜索职位"""
        try:
            # 构建搜索参数
            params = {
                "pageSize": min(limit, 90),  # 智联限制
                "pageIndex": 1,
                "sortType": "publish_date",  # 按发布时间排序
            }
            
            # 关键词搜索
            if title:
                params["kw"] = title
            if company:
                params["companyName"] = company
            if city:
                params["cityId"] = self._get_city_id(city)

            response = await self.client.get(
                f"{self.base_url}/c/i/sou",
                params=params
            )
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("code") == 200 and "data" in data:
                results = data["data"].get("results", [])
                return [self._normalize_job(job) for job in results]
            else:
                logger.warning(f"智联API返回异常: {data}")
                return []
                
        except Exception as e:
            logger.error(f"智联搜索失败: {e}")
            return []

    async def fetch_jd_by_url(self, url: str) -> Optional[Dict[str, Any]]:
        """通过URL获取职位详情"""
        # 从URL中提取职位ID
        job_id = self._extract_job_id_from_url(url)
        if not job_id:
            return None
            
        try:
            # 智联职位详情接口
            response = await self.client.get(
                f"{self.base_url}/c/i/jobs/{job_id}"
            )
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("code") == 200 and "data" in data:
                job = data["data"]
                return self._normalize_job(job)
            else:
                logger.error(f"智联获取职位详情失败: {data}")
                return None
                
        except Exception as e:
            logger.error(f"智联获取职位详情异常: {e}")
            return None

    def _normalize_job(self, job: Dict[str, Any]) -> Dict[str, Any]:
        """标准化职位数据"""
        # 智联数据结构适配
        company_info = job.get("company", {})
        position_info = job.get("positionInfo", {}) or job
        
        return {
            "id": f"zp_{job.get('number', job.get('jobId', ''))}",
            "company": company_info.get("name", job.get("companyName", "")),
            "title": position_info.get("positionName", job.get("jobName", "")),
            "location": self._format_location(job.get("city", {})),
            "jd_text": job.get("positionDescription", job.get("jobDescription", "")),
            "must_have_skills": self._extract_skills(job.get("positionDescription", "")),
            "nice_to_have": [],
            "source_url": f"https://jobs.zhaopin.com/CZ{job.get('number', '')}.htm"
        }

    def _extract_skills(self, description: str) -> List[str]:
        """从职位描述中提取技能"""
        skill_keywords = [
            "Python", "Java", "JavaScript", "Go", "C++", "React", "Vue", "Node.js",
            "MySQL", "Redis", "MongoDB", "Docker", "Kubernetes", "Git",
            "产品经理", "数据分析", "项目管理", "用户体验"
        ]
        
        found_skills = []
        if description:
            desc_lower = description.lower()
            for skill in skill_keywords:
                if skill.lower() in desc_lower:
                    found_skills.append(skill)
        
        return found_skills

    def _get_city_id(self, city_name: str) -> str:
        """获取城市ID"""
        # 智联城市ID映射（部分）
        city_map = {
            "北京": "530",
            "上海": "538", 
            "广州": "763",
            "深圳": "765",
            "杭州": "653",
            "成都": "801",
            "武汉": "736",
            "西安": "854"
        }
        return city_map.get(city_name, "530")  # 默认北京

    def _format_location(self, city_info: Dict[str, Any]) -> str:
        """格式化地点信息"""
        if isinstance(city_info, dict):
            return city_info.get("display", "")
        return str(city_info) if city_info else ""

    def _extract_job_id_from_url(self, url: str) -> Optional[str]:
        """从URL中提取职位ID"""
        # 智联URL格式: https://jobs.zhaopin.com/CZ123456789.htm
        import re
        match = re.search(r'/CZ(\d+)\.htm', url)
        return match.group(1) if match else None

    async def close(self):
        """关闭HTTP客户端"""
        await self.client.aclose()