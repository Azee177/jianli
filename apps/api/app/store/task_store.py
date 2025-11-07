from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional, Any
from uuid import uuid4

from ..schemas import TaskResponse, TaskStatus, TaskType


class TaskStore:
    """任务存储层"""
    
    def __init__(self):
        self._tasks: Dict[str, TaskResponse] = {}
        self._user_tasks: Dict[str, List[str]] = {}  # user_id -> task_ids

    def create_task(
        self,
        task_id: str,
        task_type: TaskType,
        user_id: str,
        status: TaskStatus = TaskStatus.QUEUED
    ) -> TaskResponse:
        """创建任务"""
        task = TaskResponse(
            id=task_id,
            type=task_type,
            status=status,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        self._tasks[task_id] = task
        
        if user_id not in self._user_tasks:
            self._user_tasks[user_id] = []
        self._user_tasks[user_id].append(task_id)
        
        return task

    def get_task(self, task_id: str) -> Optional[TaskResponse]:
        """获取任务"""
        return self._tasks.get(task_id)

    def update_task_status(
        self,
        task_id: str,
        status: TaskStatus,
        progress: Optional[int] = None
    ) -> Optional[TaskResponse]:
        """更新任务状态"""
        task = self._tasks.get(task_id)
        if not task:
            return None
            
        task.status = status
        task.updated_at = datetime.utcnow()
        
        if progress is not None:
            task.progress = progress
            
        return task

    def update_task_result(
        self,
        task_id: str,
        status: TaskStatus,
        result: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None,
        cost: Optional[float] = None,
        latency_ms: Optional[int] = None
    ) -> Optional[TaskResponse]:
        """更新任务结果"""
        task = self._tasks.get(task_id)
        if not task:
            return None
            
        task.status = status
        task.updated_at = datetime.utcnow()
        
        if result is not None:
            task.result = result
        if error is not None:
            task.error = error
        if cost is not None:
            task.cost = cost
        if latency_ms is not None:
            task.latency_ms = latency_ms
            
        return task

    def list_by_user(
        self,
        user_id: str,
        task_type: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 50
    ) -> List[TaskResponse]:
        """获取用户的任务列表"""
        task_ids = self._user_tasks.get(user_id, [])
        tasks = [self._tasks[task_id] for task_id in task_ids if task_id in self._tasks]
        
        # 过滤
        if task_type:
            tasks = [t for t in tasks if t.type == task_type]
        if status:
            tasks = [t for t in tasks if t.status == status]
        
        # 按创建时间倒序
        tasks.sort(key=lambda t: t.created_at, reverse=True)
        
        return tasks[:limit]

    def generate_id(self, prefix: str = "task") -> str:
        """生成任务ID"""
        return f"{prefix}_{uuid4().hex[:8]}"