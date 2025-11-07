from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi import status

from ..schemas import (
    PresignRequest,
    PresignResponse
)
from ..services import UploadService


def create_upload_router(upload_service: UploadService) -> APIRouter:
    router = APIRouter()

    def get_service() -> UploadService:
        return upload_service

    @router.post("/uploads/presign", response_model=PresignResponse)
    async def presign_upload(
        request: PresignRequest,
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        svc: UploadService = Depends(get_service),
    ) -> PresignResponse:
        """生成预签名上传URL"""
        return await svc.generate_presign_url(request, user_id)

    @router.post("/resumes/from-upload", response_model=dict)
    async def create_resume_from_upload(
        object_key: str,
        title: Optional[str] = None,
        template_key: Optional[str] = None,
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        svc: UploadService = Depends(get_service),
    ) -> dict:
        """从上传的文件创建简历并触发OCR"""
        return await svc.create_resume_from_upload(
            object_key, user_id, title, template_key
        )

    return router