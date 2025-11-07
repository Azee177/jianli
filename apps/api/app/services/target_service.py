from __future__ import annotations

from datetime import datetime
from typing import Optional, List
from uuid import uuid4

from ..schemas import TargetRequest, TargetResponse
from ..store import TaskStore

DEFAULT_USER_ID = "demo-user"


class TargetService:
    """目标岗位服务"""
    
    def __init__(self, task_store: TaskStore):
        self.task_store = task_store
        self._targets = {}  # 简单内存存储

    def create_target(self, request: TargetRequest, user_id: Optional[str]) -> TargetResponse:
        """创建目标岗位"""
        user = user_id or DEFAULT_USER_ID
        target_id = f"target_{uuid4().hex[:8]}"
        
        target = TargetResponse(
            id=target_id,
            company=request.company,
            title=request.title,
            city=request.city,
            description=request.description,
            created_at=datetime.utcnow()
        )
        
        # 保存到内存
        if user not in self._targets:
            self._targets[user] = []
        self._targets[user].append(target)
        
        return target

    def list_targets(self, user_id: Optional[str]) -> List[TargetResponse]:
        """获取目标岗位列表"""
        user = user_id or DEFAULT_USER_ID
        return self._targets.get(user, [])