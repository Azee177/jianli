"""
智能建议路由 - 提供简历优化建议
"""
from __future__ import annotations

from typing import Optional
import logging

from fastapi import APIRouter, HTTPException, status, Body
from pydantic import BaseModel

from ..services.smart_suggestion_service import get_suggestion_service
from ..services import ResumeService

logger = logging.getLogger(__name__)


class AnalyzeRequest(BaseModel):
    """分析请求"""
    resume_id: str
    target_jd: Optional[str] = None


class OptimizeTextRequest(BaseModel):
    """文本优化请求"""
    text: str
    context: Optional[str] = None
    target_jd: Optional[str] = None


class GenerateSummaryRequest(BaseModel):
    """生成总结请求"""
    resume_id: str
    target_position: Optional[str] = None


class SectionSuggestionsRequest(BaseModel):
    """章节建议请求"""
    section_type: str
    section_content: str
    target_jd: Optional[str] = None


def create_router(resume_service: ResumeService) -> APIRouter:
    router = APIRouter()
    suggestion_service = get_suggestion_service()

    @router.post("/suggestions/analyze", summary="分析简历并生成建议")
    async def analyze_resume(request: AnalyzeRequest = Body(...)):
        """
        分析简历并返回优化建议
        
        返回：
        - overall_score: 整体评分
        - strengths: 优势列表
        - weaknesses: 不足列表
        - suggestions: 具体建议
        - completeness: 各部分完整度
        """
        try:
            # 获取简历
            record = resume_service.store.get(request.resume_id)
            if not record:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="简历不存在"
                )
            
            # 获取结构化数据（如果有）
            structured_data = getattr(record, 'structured_sections', None)
            
            # 分析简历
            analysis = await suggestion_service.analyze_resume(
                resume_text=record.raw_text,
                structured_data=structured_data,
                target_jd=request.target_jd
            )
            
            return {
                "overall_score": analysis.overall_score,
                "strengths": analysis.strengths,
                "weaknesses": analysis.weaknesses,
                "suggestions": [
                    {
                        "type": s.type,
                        "section": s.section,
                        "title": s.title,
                        "description": s.description,
                        "priority": s.priority,
                        "example": s.example
                    }
                    for s in analysis.suggestions
                ],
                "completeness": analysis.completeness,
                "keyword_match": analysis.keyword_match
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"分析简历失败: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"分析失败: {str(e)}"
            )

    @router.post("/suggestions/section", summary="获取章节优化建议")
    async def get_section_suggestions(request: SectionSuggestionsRequest = Body(...)):
        """
        获取特定章节的优化建议
        """
        try:
            suggestions = await suggestion_service.get_section_suggestions(
                section_type=request.section_type,
                section_content=request.section_content,
                target_jd=request.target_jd
            )
            
            return {
                "suggestions": [
                    {
                        "type": s.type,
                        "section": s.section,
                        "title": s.title,
                        "description": s.description,
                        "priority": s.priority,
                        "example": s.example
                    }
                    for s in suggestions
                ]
            }
            
        except Exception as e:
            logger.error(f"获取章节建议失败: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"获取建议失败: {str(e)}"
            )

    @router.post("/suggestions/optimize-text", summary="优化文本内容")
    async def optimize_text(request: OptimizeTextRequest = Body(...)):
        """
        优化简历文本内容
        """
        try:
            optimized = await suggestion_service.optimize_text(
                original_text=request.text,
                context=request.context or "",
                target_jd=request.target_jd
            )
            
            return {
                "original": request.text,
                "optimized": optimized
            }
            
        except Exception as e:
            logger.error(f"文本优化失败: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"优化失败: {str(e)}"
            )

    @router.post("/suggestions/generate-summary", summary="生成个人总结")
    async def generate_summary(request: GenerateSummaryRequest = Body(...)):
        """
        生成个人总结/求职意向
        """
        try:
            # 获取简历
            record = resume_service.store.get(request.resume_id)
            if not record:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="简历不存在"
                )
            
            summary = await suggestion_service.generate_summary(
                resume_text=record.raw_text,
                target_position=request.target_position
            )
            
            return {
                "summary": summary
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"生成总结失败: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"生成失败: {str(e)}"
            )

    return router

