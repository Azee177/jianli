from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header, BackgroundTasks
from fastapi import status

from ..schemas import (
    OptimizePreviewRequest,
    OptimizePreviewResponse,
    OptimizeApplyRequest,
    StudyPlanResponse,
    InterviewQAResponse,
    TaskResponse,
    ResumeResponse
)
from ..services import OptimizeService


def create_optimize_router(optimize_service: OptimizeService) -> APIRouter:
    router = APIRouter()

    def get_service() -> OptimizeService:
        return optimize_service

    @router.post("/resumes/{resume_id}/optimize/preview", response_model=TaskResponse)
    async def optimize_preview(
        resume_id: str,
        request: OptimizePreviewRequest,
        background_tasks: BackgroundTasks,
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        svc: OptimizeService = Depends(get_service),
    ) -> TaskResponse:
        """生成简历优化预览 - 异步任务"""
        return await svc.optimize_preview_async(
            resume_id, request, user_id, background_tasks
        )

    @router.get("/resumes/{resume_id}/optimize/preview/{preview_id}", response_model=OptimizePreviewResponse)
    def get_optimize_preview(
        resume_id: str,
        preview_id: str,
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        svc: OptimizeService = Depends(get_service),
    ) -> OptimizePreviewResponse:
        """获取优化预览结果"""
        return svc.get_optimize_preview(preview_id, user_id)

    @router.post("/resumes/{resume_id}/optimize/apply", response_model=ResumeResponse)
    async def optimize_apply(
        resume_id: str,
        request: OptimizeApplyRequest,
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        svc: OptimizeService = Depends(get_service),
    ) -> ResumeResponse:
        """应用优化建议，生成新版本简历"""
        return await svc.optimize_apply(resume_id, request, user_id)

    @router.post("/resumes/{resume_id}/study-plan", response_model=TaskResponse)
    async def generate_study_plan(
        resume_id: str,
        background_tasks: BackgroundTasks,
        commonality_id: Optional[str] = None,
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        svc: OptimizeService = Depends(get_service),
    ) -> TaskResponse:
        """生成学习计划 - 异步任务"""
        return await svc.generate_study_plan_async(
            resume_id, commonality_id, user_id, background_tasks
        )

    @router.get("/resumes/{resume_id}/study-plan/{plan_id}", response_model=StudyPlanResponse)
    def get_study_plan(
        resume_id: str,
        plan_id: str,
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        svc: OptimizeService = Depends(get_service),
    ) -> StudyPlanResponse:
        """获取学习计划结果"""
        return svc.get_study_plan(plan_id, user_id)

    @router.post("/resumes/{resume_id}/qa", response_model=TaskResponse)
    async def generate_interview_qa(
        resume_id: str,
        background_tasks: BackgroundTasks,
        commonality_id: Optional[str] = None,
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        svc: OptimizeService = Depends(get_service),
    ) -> TaskResponse:
        """生成面试问答 - 异步任务"""
        return await svc.generate_interview_qa_async(
            resume_id, commonality_id, user_id, background_tasks
        )

    @router.get("/resumes/{resume_id}/qa/{qa_id}", response_model=InterviewQAResponse)
    def get_interview_qa(
        resume_id: str,
        qa_id: str,
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        svc: OptimizeService = Depends(get_service),
    ) -> InterviewQAResponse:
        """获取面试问答结果"""
        return svc.get_interview_qa(qa_id, user_id)

    return router