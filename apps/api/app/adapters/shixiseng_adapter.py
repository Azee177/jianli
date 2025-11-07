from __future__ import annotations

import time
import base64
import hashlib
import httpx
import logging
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)


class ShixiSengAdapter:
    """实习僧开放平台适配器"""
    
    def __init__(self, app_id: str, app_secret: str, base_url: str = "https://hr-open.shixiseng.com"):
        self.app_id = app_id
        self.app_secret = app_secret
        self.base_url = base_url
        self.client = httpx.AsyncClient(timeout=30.0)

    def is_available(self) -> bool:
        """检查适配器是否可用"""
        return bool(self.app_id and self.app_secret)

    def _make_auth_headers(self) -> tuple[Dict[str, str], str]:
        """生成认证头和签名"""
        ts = str(int(time.time()))
        auth = base64.b64encode(f"{self.app_id}:{ts}".encode()).decode()
        sign_src = f"{self.app_id}{self.app_secret}{ts}"
        sign = hashlib.md5(sign_src.encode()).hexdigest().upper()
        
        headers = {
            "Authorization": auth,
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        return headers, sign

    async def search_jd(
        self,
        company: Optional[str] = None,
        title: Optional[str] = None,
        city: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """搜索职位"""
        try:
            headers, sign = self._make_auth_headers()
            
            params = {
                "page": 1,
                "limit": min(limit, 50),  # 实习僧限制
                "sign": sign
            }
            
            # 添加搜索条件
            if company:
                params["company_name"] = company
            if title:
                params["job_name"] = title
            if city:
                params["city"] = city

            response = await self.client.get(
                f"{self.base_url}/v1/jobs",
                params=params,
                headers=headers
            )
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("code") == 200 and "data" in data:
                jobs = data["data"].get("list", [])
                return [self._normalize_job(job) for job in jobs]
            else:
                logger.error(f"实习僧API返回错误: {data}")
                return []
                
        except Exception as e:
            logger.error(f"实习僧搜索失败: {e}")
            return []

    async def fetch_jd_by_url(self, url: str) -> Optional[Dict[str, Any]]:
        """通过URL获取职位详情"""
        # 从URL中提取job_id
        job_id = self._extract_job_id_from_url(url)
        if not job_id:
            return None
            
        try:
            headers, sign = self._make_auth_headers()
            
            params = {
                "job_id": job_id,
                "sign": sign
            }
            
            response = await self.client.get(
                f"{self.base_url}/v1/job",
                params=params,
                headers=headers
            )
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("code") == 200 and "data" in data:
                job = data["data"]
                return self._normalize_job(job)
            else:
                logger.error(f"实习僧获取职位详情失败: {data}")
                return None
                
        except Exception as e:
            logger.error(f"实习僧获取职位详情异常: {e}")
            return None

    def _normalize_job(self, job: Dict[str, Any]) -> Dict[str, Any]:
        """标准化职位数据"""
        return {
            "id": f"sxs_{job.get('id', '')}",
            "company": job.get("company_name", ""),
            "title": job.get("job_name", ""),
            "location": job.get("city_name", ""),
            "jd_text": job.get("job_description", ""),
            "must_have_skills": self._extract_skills(job.get("job_description", "")),
            "nice_to_have": [],
            "source_url": job.get("job_url", "")
        }

    def _extract_skills(self, description: str) -> List[str]:
        """从职位描述中提取技能"""
        # 简单的技能提取逻辑
        skill_keywords = [
            "Python", "Java", "JavaScript", "Go", "C++", "React", "Vue", "Node.js",
            "MySQL", "Redis", "MongoDB", "Docker", "Kubernetes", "Git"
        ]
        
        found_skills = []
        desc_lower = description.lower()
        
        for skill in skill_keywords:
            if skill.lower() in desc_lower:
                found_skills.append(skill)
        
        return found_skills

    def _extract_job_id_from_url(self, url: str) -> Optional[str]:
        """从URL中提取job_id"""
        # 实习僧URL格式: https://www.shixiseng.com/intern/inn_xxx
        import re
        match = re.search(r'/inn_(\w+)', url)
        return match.group(1) if match else None

    async def close(self):
        """关闭HTTP客户端"""
        await self.client.aclose()