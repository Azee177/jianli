"""
简历渲染路由 - 返回格式化的HTML简历
"""
from __future__ import annotations

from typing import Optional
import logging

from fastapi import APIRouter, HTTPException, status, Depends, Header
from fastapi.responses import HTMLResponse, JSONResponse

from ..services import ResumeService
from ..services.template_filler import fill_resume_template
from ..templates import RESUME_TEMPLATE_HTML

logger = logging.getLogger(__name__)


def create_router(service: ResumeService) -> APIRouter:
    router = APIRouter()

    def get_service() -> ResumeService:
        return service

    @router.get(
        "/resumes/{resume_id}/render",
        response_class=HTMLResponse,
        summary="渲染简历为HTML"
    )
    def render_resume_html(
        resume_id: str,
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        svc: ResumeService = Depends(get_service),
    ) -> HTMLResponse:
        """
        将简历渲染为格式化的HTML
        
        这个端点会：
        1. 获取解析后的简历数据
        2. 应用模板填充
        3. 返回格式化的HTML
        """
        try:
            # 获取简历数据
            resume = svc.get_resume(resume_id, user_id)
            
            # 从存储中获取完整记录
            record = svc.store.get(resume_id)
            if not record:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="简历不存在"
                )
            
            # 重新构建ParsedResume对象
            from ..parser import ParsedResume
            parsed_resume = ParsedResume(
                normalized=record.raw_text,
                blocks=record.parsed_blocks,
                contacts=record.contacts,
                skills=record.skills,
                language=record.metadata.language if record.metadata else "zh"
            )
            
            # 填充模板
            logger.info(f"渲染简历 {resume_id}")
            html_content = fill_resume_template(RESUME_TEMPLATE_HTML, parsed_resume)
            
            return HTMLResponse(content=html_content)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"渲染简历失败: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"渲染失败: {str(e)}"
            )

    @router.get(
        "/resumes/{resume_id}/structured",
        response_class=JSONResponse,
        summary="获取结构化简历数据"
    )
    def get_structured_resume(
        resume_id: str,
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        svc: ResumeService = Depends(get_service),
    ) -> JSONResponse:
        """
        获取简历的结构化数据（LLM解析后的详细数据）
        
        返回包含教育、项目、技能等详细分类的结构化数据
        """
        try:
            # 获取简历记录
            record = svc.store.get(resume_id)
            if not record:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="简历不存在"
                )
            
            # 检查是否有结构化数据（LLM解析的结果）
            structured_data = {}
            
            # 如果有metadata中的额外字段，提取出来
            if hasattr(record, 'structured_sections'):
                structured_data = record.structured_sections
            else:
                # 如果没有LLM解析的结构化数据，从blocks构建基础结构
                structured_data = {
                    "personal_info": {
                        "name": record.contacts.name,
                        "email": record.contacts.email,
                        "phone": record.contacts.phone,
                        "location": record.contacts.location,
                    },
                    "sections": []
                }
                
                for block in record.parsed_blocks:
                    structured_data["sections"].append({
                        "type": block.type,
                        "content": block.text
                    })
            
            return JSONResponse(content={
                "resume_id": resume_id,
                "structured_data": structured_data,
                "skills": record.skills,
                "contacts": {
                    "name": record.contacts.name,
                    "email": record.contacts.email,
                    "phone": record.contacts.phone,
                    "location": record.contacts.location,
                    "website": record.contacts.website,
                },
                "metadata": {
                    "language": record.metadata.language if record.metadata else None,
                    "parsing_method": getattr(record, 'parsing_method', 'rule-based'),
                    "confidence_score": getattr(record, 'confidence_score', None),
                }
            })
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"获取结构化数据失败: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"获取数据失败: {str(e)}"
            )

    return router

