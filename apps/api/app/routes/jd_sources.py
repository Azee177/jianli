from __future__ import annotations

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Header, BackgroundTasks
from fastapi import status

from ..schemas import (
    JDRequest, 
    JDResponse, 
    JDListResponse,
    TargetRequest,
    TargetResponse,
    CommonalityRequest,
    CommonalityResponse,
    TaskResponse
)
from ..services import JDService, TargetService, CommonalityService


def create_jd_router(
    jd_service: JDService,
    target_service: TargetService, 
    commonality_service: CommonalityService
) -> APIRouter:
    router = APIRouter()

    def get_jd_service() -> JDService:
        return jd_service
    
    def get_target_service() -> TargetService:
        return target_service
        
    def get_commonality_service() -> CommonalityService:
        return commonality_service

    @router.post("/jd/fetch", response_model=TaskResponse)
    async def fetch_jd(
        request: JDRequest,
        background_tasks: BackgroundTasks,
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        svc: JDService = Depends(get_jd_service),
    ) -> TaskResponse:
        """抓取JD - 支持URL或文本输入"""
        return await svc.fetch_jd_async(request, user_id, background_tasks)

    @router.post("/jd/search", response_model=JDListResponse)
    async def search_jd(
        company: Optional[str] = None,
        title: Optional[str] = None,
        city: Optional[str] = None,
        limit: int = 20,
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        svc: JDService = Depends(get_jd_service),
    ) -> JDListResponse:
        """搜索JD - 多源聚合"""
        return await svc.search_jd(
            company=company,
            title=title, 
            city=city,
            limit=limit,
            user_id=user_id
        )

    @router.get("/jd", response_model=JDListResponse)
    def list_jd(
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        svc: JDService = Depends(get_jd_service),
    ) -> JDListResponse:
        """获取用户的JD列表"""
        items = svc.list_jd(user_id)
        return JDListResponse(items=items)

    @router.get("/jd/{jd_id}", response_model=JDResponse)
    def get_jd(
        jd_id: str,
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        svc: JDService = Depends(get_jd_service),
    ) -> JDResponse:
        """获取单个JD详情"""
        return svc.get_jd(jd_id, user_id)

    @router.post("/targets", response_model=TargetResponse)
    def create_target(
        request: TargetRequest,
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        svc: TargetService = Depends(get_target_service),
    ) -> TargetResponse:
        """创建目标岗位"""
        return svc.create_target(request, user_id)

    @router.get("/targets", response_model=List[TargetResponse])
    def list_targets(
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        svc: TargetService = Depends(get_target_service),
    ) -> List[TargetResponse]:
        """获取目标岗位列表"""
        return svc.list_targets(user_id)

    @router.post("/jd/commonalities", response_model=TaskResponse)
    async def extract_commonalities(
        request: CommonalityRequest,
        background_tasks: BackgroundTasks,
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        svc: CommonalityService = Depends(get_commonality_service),
    ) -> TaskResponse:
        """提炼JD共性 - 异步任务"""
        return await svc.extract_commonalities_async(request, user_id, background_tasks)

    @router.get("/jd/commonalities/{commonality_id}", response_model=CommonalityResponse)
    def get_commonality(
        commonality_id: str,
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        svc: CommonalityService = Depends(get_commonality_service),
    ) -> CommonalityResponse:
        """获取共性提炼结果"""
        return svc.get_commonality(commonality_id, user_id)

    return router