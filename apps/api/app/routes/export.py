from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header, BackgroundTasks
from fastapi import status

from ..schemas import (
    ExportRequest,
    ExportResponse,
    TaskResponse
)
from ..services import ExportService


def create_export_router(export_service: ExportService) -> APIRouter:
    router = APIRouter()

    def get_service() -> ExportService:
        return export_service

    @router.post("/exports/pdf", response_model=TaskResponse)
    async def export_pdf(
        request: ExportRequest,
        background_tasks: BackgroundTasks,
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        svc: ExportService = Depends(get_service),
    ) -> TaskResponse:
        """导出PDF - 异步任务"""
        request.format = "pdf"
        return await svc.export_async(request, user_id, background_tasks)

    @router.post("/exports/docx", response_model=TaskResponse)
    async def export_docx(
        request: ExportRequest,
        background_tasks: BackgroundTasks,
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        svc: ExportService = Depends(get_service),
    ) -> TaskResponse:
        """导出DOCX - 异步任务"""
        request.format = "docx"
        return await svc.export_async(request, user_id, background_tasks)

    @router.get("/exports/{export_id}", response_model=ExportResponse)
    def get_export(
        export_id: str,
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        svc: ExportService = Depends(get_service),
    ) -> ExportResponse:
        """获取导出结果"""
        return svc.get_export(export_id, user_id)

    @router.get("/exports", response_model=list[ExportResponse])
    def list_exports(
        resume_id: Optional[str] = None,
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        svc: ExportService = Depends(get_service),
    ) -> list[ExportResponse]:
        """获取导出历史"""
        return svc.list_exports(user_id, resume_id)

    return router