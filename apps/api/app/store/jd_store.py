from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional
from uuid import uuid4

from ..schemas import JDResponse


class JDStore:
    """JD存储层"""
    
    def __init__(self):
        self._jds: Dict[str, JDResponse] = {}
        self._user_jds: Dict[str, List[str]] = {}  # user_id -> jd_ids

    def create_jd(self, jd: JDResponse, user_id: str) -> JDResponse:
        """创建JD记录"""
        self._jds[jd.id] = jd
        
        if user_id not in self._user_jds:
            self._user_jds[user_id] = []
        self._user_jds[user_id].append(jd.id)
        
        return jd

    def get_jd(self, jd_id: str) -> Optional[JDResponse]:
        """获取JD"""
        return self._jds.get(jd_id)

    def list_by_user(self, user_id: str) -> List[JDResponse]:
        """获取用户的JD列表"""
        jd_ids = self._user_jds.get(user_id, [])
        return [self._jds[jd_id] for jd_id in jd_ids if jd_id in self._jds]

    def search_jd(
        self,
        user_id: str,
        company: Optional[str] = None,
        title: Optional[str] = None,
        city: Optional[str] = None,
        limit: int = 20
    ) -> List[JDResponse]:
        """搜索JD"""
        jds = self.list_by_user(user_id)
        
        # 简单的过滤逻辑
        filtered_jds = []
        for jd in jds:
            match = True
            
            if company and company.lower() not in jd.company.lower():
                match = False
            if title and title.lower() not in jd.title.lower():
                match = False
            if city and city.lower() not in (jd.location or "").lower():
                match = False
                
            if match:
                filtered_jds.append(jd)
        
        return filtered_jds[:limit]

    def generate_id(self) -> str:
        """生成JD ID"""
        return f"jd_{uuid4().hex[:8]}"