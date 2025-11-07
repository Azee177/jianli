from __future__ import annotations

import asyncio
import logging
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)


class BossAdapter:
    """BOSS直聘适配器（使用Playwright）"""
    
    def __init__(self):
        self.playwright = None
        self.browser = None

    def is_available(self) -> bool:
        """检查Playwright是否可用"""
        try:
            import playwright
            return True
        except ImportError:
            return False

    async def _init_browser(self):
        """初始化浏览器"""
        if self.browser is None:
            try:
                from playwright.async_api import async_playwright
                
                self.playwright = await async_playwright().start()
                self.browser = await self.playwright.chromium.launch(
                    headless=True,
                    args=['--no-sandbox', '--disable-dev-shm-usage']
                )
            except Exception as e:
                logger.error(f"初始化浏览器失败: {e}")
                raise

    async def search_jd(
        self,
        company: Optional[str] = None,
        title: Optional[str] = None,
        city: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """搜索职位（通过页面自动化）"""
        try:
            await self._init_browser()
            
            page = await self.browser.new_page()
            
            # 构建搜索URL
            search_url = "https://www.zhipin.com/web/geek/job"
            if title:
                search_url += f"?query={title}"
            if city:
                search_url += f"&city={self._get_city_code(city)}"
            
            await page.goto(search_url, wait_until="networkidle")
            
            # 等待页面加载
            await page.wait_for_selector('.job-list-box', timeout=10000)
            
            # 提取职位信息
            jobs = await page.evaluate("""
                () => {
                    const jobItems = document.querySelectorAll('.job-card-wrapper');
                    const results = [];
                    
                    for (let i = 0; i < Math.min(jobItems.length, 20); i++) {
                        const item = jobItems[i];
                        const titleEl = item.querySelector('.job-name');
                        const companyEl = item.querySelector('.company-name');
                        const locationEl = item.querySelector('.job-area');
                        const linkEl = item.querySelector('a');
                        
                        if (titleEl && companyEl) {
                            results.push({
                                title: titleEl.textContent.trim(),
                                company: companyEl.textContent.trim(),
                                location: locationEl ? locationEl.textContent.trim() : '',
                                url: linkEl ? linkEl.href : ''
                            });
                        }
                    }
                    
                    return results;
                }
            """)
            
            await page.close()
            
            return [self._normalize_job(job) for job in jobs]
            
        except Exception as e:
            logger.error(f"BOSS搜索失败: {e}")
            return []

    async def fetch_jd_by_url(self, url: str) -> Optional[Dict[str, Any]]:
        """通过URL获取职位详情"""
        try:
            await self._init_browser()
            
            page = await self.browser.new_page()
            await page.goto(url, wait_until="networkidle")
            
            # 等待页面加载
            await page.wait_for_selector('.job-sec', timeout=10000)
            
            # 提取职位详情
            job_detail = await page.evaluate("""
                () => {
                    const titleEl = document.querySelector('.name');
                    const companyEl = document.querySelector('.company-name');
                    const locationEl = document.querySelector('.location-address');
                    const descEl = document.querySelector('.job-sec .text');
                    
                    return {
                        title: titleEl ? titleEl.textContent.trim() : '',
                        company: companyEl ? companyEl.textContent.trim() : '',
                        location: locationEl ? locationEl.textContent.trim() : '',
                        description: descEl ? descEl.textContent.trim() : ''
                    };
                }
            """)
            
            await page.close()
            
            if job_detail['title']:
                return self._normalize_job({
                    **job_detail,
                    'url': url
                })
            
            return None
            
        except Exception as e:
            logger.error(f"BOSS获取详情失败: {e}")
            return None

    def _normalize_job(self, job: Dict[str, Any]) -> Dict[str, Any]:
        """标准化职位数据"""
        return {
            "id": f"boss_{hash(job.get('url', job.get('title', '')))}",
            "company": job.get("company", ""),
            "title": job.get("title", ""),
            "location": job.get("location", ""),
            "jd_text": job.get("description", ""),
            "must_have_skills": self._extract_skills(job.get("description", "")),
            "nice_to_have": [],
            "source_url": job.get("url", "")
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

    def _get_city_code(self, city_name: str) -> str:
        """获取城市代码"""
        city_map = {
            "北京": "101010100",
            "上海": "101020100",
            "广州": "101280100",
            "深圳": "101280600",
            "杭州": "101210100",
            "成都": "101270100"
        }
        return city_map.get(city_name, "101010100")

    async def close(self):
        """关闭浏览器"""
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()