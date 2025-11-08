from __future__ import annotations

from typing import Optional

from fastapi import (
  APIRouter,
  Body,
  Depends,
  File,
  Form,
  Header,
  Request,
  UploadFile,
)

from ..schemas import (
  DraftListResponse,
  DraftSummary,
  InstantiateTemplateResponse,
  ResumeListResponse,
  ResumeResponse,
  TemplateListResponse,
)
from ..services import ResumeService


def create_router(service: ResumeService) -> APIRouter:
  router = APIRouter()

  def get_service() -> ResumeService:
    return service

  @router.post("/resumes", response_model=ResumeResponse)
  async def upload_resume(
    request: Request,
    file: UploadFile | None = File(default=None),
    text: str | None = Form(default=None),
    template_key: str | None = Form(default=None, alias="templateKey"),
    title: str | None = Form(default=None),
    use_llm: bool = Form(default=False, alias="useLlm"),  # 新增：是否使用LLM解析（默认关闭避免VPN问题）
    user_id: Optional[str] = Header(default=None, alias="x-user-id"),
    svc: ResumeService = Depends(get_service),
  ) -> ResumeResponse:
    content_type = request.headers.get("content-type", "")

    text_val = text
    template_key_val = template_key
    title_val = title
    use_llm_val = use_llm

    if "application/json" in content_type:
      body = await request.json()
      if isinstance(body, dict):
        text_val = body.get("text", text_val)
        template_key_val = body.get("templateKey", template_key_val)
        title_val = body.get("title", title_val)
        use_llm_val = body.get("useLlm", use_llm_val)

    file_bytes = await file.read() if file is not None else None

    return await svc.create_resume(
      user_id=user_id,
      text=text_val,
      file_bytes=file_bytes,
      file_name=file.filename if file else None,
      mime_type=file.content_type if file else None,
      template_key=template_key_val,
      title=title_val,
      use_llm=use_llm_val,
    )

  @router.get("/resumes", response_model=ResumeListResponse)
  def list_resumes(
    user_id: Optional[str] = Header(default=None, alias="x-user-id"),
    svc: ResumeService = Depends(get_service),
  ) -> ResumeListResponse:
    items = svc.list_resumes(user_id)
    return ResumeListResponse(items=items)

  @router.get("/resumes/{resume_id}", response_model=ResumeResponse)
  def get_resume(
    resume_id: str,
    user_id: Optional[str] = Header(default=None, alias="x-user-id"),
    svc: ResumeService = Depends(get_service),
  ) -> ResumeResponse:
    return svc.get_resume(resume_id, user_id)

  @router.get("/resumes/drafts", response_model=DraftListResponse)
  def list_drafts(
    user_id: Optional[str] = Header(default=None, alias="x-user-id"),
    svc: ResumeService = Depends(get_service),
  ) -> DraftListResponse:
    drafts = svc.list_drafts(user_id)
    return DraftListResponse(drafts=drafts)

  @router.get("/resumes/latest", response_model=DraftSummary | None)
  def latest_draft(
    user_id: Optional[str] = Header(default=None, alias="x-user-id"),
    svc: ResumeService = Depends(get_service),
  ) -> DraftSummary | None:
    return svc.latest_draft(user_id)

  @router.get("/resumes/templates", response_model=TemplateListResponse)
  def list_templates(
    svc: ResumeService = Depends(get_service),
  ) -> TemplateListResponse:
    templates = svc.list_templates()
    return TemplateListResponse(templates=templates)

  @router.post(
    "/resumes/templates/{template_id}/instantiate",
    response_model=InstantiateTemplateResponse,
  )
  async def instantiate_template(
    template_id: str,
    title: str | None = Body(default=None),
    user_id: Optional[str] = Header(default=None, alias="x-user-id"),
    svc: ResumeService = Depends(get_service),
  ) -> InstantiateTemplateResponse:
    return await svc.instantiate_template(
      template_id=template_id,
      user_id=user_id,
      title=title,
    )

  return router
