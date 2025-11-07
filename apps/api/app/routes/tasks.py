from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi import status

from ..schemas import TaskResponse
from ..services import TaskService


def create_task_router(task_service: TaskService) -> APIRouter:
    router = APIRouter()

    def get_service() -> TaskService:
        return task_service

    @router.get("/tasks/{task_id}", response_model=TaskResponse)
    def get_task(
        task_id: str,
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        svc: TaskService = Depends(get_service),
    ) -> TaskResponse:
        """查询任务状态"""
        return svc.get_task(task_id, user_id)

    @router.get("/tasks", response_model=list[TaskResponse])
    def list_tasks(
        task_type: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 50,
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        svc: TaskService = Depends(get_service),
    ) -> list[TaskResponse]:
        """获取任务列表"""
        return svc.list_tasks(user_id, task_type, status, limit)

    return router