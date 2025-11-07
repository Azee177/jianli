from __future__ import annotations

import httpx
import logging
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)


class Job51Adapter:
    """前程无忧适配器"""
    
    def __init__(self):
        self.base_url = "https://search.51job.com"
        self.client = httpx.AsyncClient(
            timeout=30.0,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Referer": "https://www.51job.com/",
            }
        )

    def is_available(self) -> bool:
        return True

    async def search_jd(
        self,
        company: Optional[str] = None,
        title: Optional[str] = None,
        city: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """搜索职位"""
        try:
            params = {
                "keyword": title or "",
                "searchType": "2",
                "pageSize": min(limit, 50),
                "pageNum": "1"
            }
            
            if city:
                params["workArea"] = self._get_area_code(city)
            if company:
                params["companyName"] = company

            response = await self.client.get(
                f"{self.base_url}/api/job/search_result.php",
                params=params
            )
            response.raise_for_status()
            
            data = response.json()
            
            if "resultList" in data:
                jobs = data["resultList"]
                return [self._normalize_job(job) for job in jobs]
            
            return []
                
        except Exception as e:
            logger.error(f"51job搜索失败: {e}")
            return []

    async def fetch_jd_by_url(self, url: str) -> Optional[Dict[str, Any]]:
        """通过URL获取职位详情"""
        # 51job的详情页面需要解析HTML
        try:
            response = await self.client.get(url)
            response.raise_for_status()
            
            # 简单的HTML解析（实际应该用BeautifulSoup）
            html = response.text
            return self._parse_job_detail_html(html, url)
                
        except Exception as e:
            logger.error(f"51job获取详情失败: {e}")
            return None

    def _normalize_job(self, job: Dict[str, Any]) -> Dict[str, Any]:
        """标准化职位数据"""
        return {
            "id": f"job51_{job.get('jobId', '')}",
            "company": job.get("companyName", ""),
            "title": job.get("jobName", ""),
            "location": job.get("workArea", ""),
            "jd_text": job.get("jobDescription", ""),
            "must_have_skills": self._extract_skills(job.get("jobDescription", "")),
            "nice_to_have": [],
            "source_url": job.get("jobHref", "")
        }

    def _extract_skills(self, description: str) -> List[str]:
        """提取技能"""
        skill_keywords = [
            "Python", "Java", "JavaScript", "Go", "C++", "React", "Vue", "Node.js",
            "MySQL", "Redis", "MongoDB", "Docker", "Kubernetes", "Git"
        ]
        
        found_skills = []
        if description:
            desc_lower = description.lower()
            for skill in skill_keywords:
                if skill.lower() in desc_lower:
                    found_skills.append(skill)
        
        return found_skills

    def _get_area_code(self, city_name: str) -> str:
        """获取地区代码"""
        area_map = {
            "北京": "010000",
            "上海": "020000",
            "广州": "030200", 
            "深圳": "040000",
            "杭州": "080200",
            "成都": "090200"
        }
        return area_map.get(city_name, "000000")

    def _parse_job_detail_html(self, html: str, url: str) -> Optional[Dict[str, Any]]:
        """解析职位详情HTML"""
        # 简化的HTML解析逻辑
        # 实际应该使用BeautifulSoup
        try:
            import re
            
            # 提取公司名
            company_match = re.search(r'<title>([^-]+)-', html)
            company = company_match.group(1).strip() if company_match else "未知公司"
            
            # 提取职位名
            title_match = re.search(r'<h1[^>]*>([^<]+)</h1>', html)
            title = title_match.group(1).strip() if title_match else "未知职位"
            
            # 提取职位描述
            desc_match = re.search(r'<div[^>]*class="[^"]*job_msg[^"]*"[^>]*>(.*?)</div>', html, re.DOTALL)
            description = desc_match.group(1) if desc_match else ""
            
            return {
                "id": f"job51_{hash(url)}",
                "company": company,
                "title": title,
                "location": "",
                "jd_text": description,
                "must_have_skills": self._extract_skills(description),
                "nice_to_have": [],
                "source_url": url
            }
            
        except Exception as e:
            logger.error(f"解析51job HTML失败: {e}")
            return None

    async def close(self):
        await self.client.aclose()