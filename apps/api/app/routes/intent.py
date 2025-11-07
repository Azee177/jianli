"""意图收集路由"""
from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel

from ..services.job_recommendation_service import JobRecommendationService
from ..services.conversation_service import ConversationService


class StartIntentRequest(BaseModel):
    """开始意图收集请求"""
    resume_id: str
    resume_text: Optional[str] = None


class ChatRequest(BaseModel):
    """对话请求"""
    session_id: str
    message: str


class ConfirmJobRequest(BaseModel):
    """确认岗位请求"""
    job_id: str
    

class GetSuggestionsRequest(BaseModel):
    """获取岗位建议请求"""
    session_id: str


def create_intent_router(
    job_service: JobRecommendationService,
    conversation_service: ConversationService
) -> APIRouter:
    """创建意图收集路由"""
    router = APIRouter()
    
    def get_job_service() -> JobRecommendationService:
        return job_service
    
    def get_conversation_service() -> ConversationService:
        return conversation_service
    
    @router.post("/start")
    async def start_intent_collection(
        request: StartIntentRequest,
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        job_svc: JobRecommendationService = Depends(get_job_service),
        conv_svc: ConversationService = Depends(get_conversation_service)
    ):
        """开始意图收集"""
        user = user_id or "demo-user"
        
        # 分析简历背景
        resume_analysis = None
        if request.resume_text:
            analysis = await job_svc.analyze_resume_background(
                request.resume_id,
                request.resume_text
            )
            resume_analysis = {
                'skills': analysis.skills,
                'experience_years': analysis.experience_years,
                'education_level': analysis.education_level,
                'suggested_positions': analysis.suggested_positions
            }
        
        # 开始对话会话
        session = await conv_svc.start_intent_session(
            resume_id=request.resume_id,
            user_id=user,
            resume_analysis=resume_analysis
        )
        
        return {
            "session_id": session.session_id,
            "messages": session.messages,
            "state": session.state
        }
    
    @router.post("/chat")
    async def chat_interaction(
        request: ChatRequest,
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        conv_svc: ConversationService = Depends(get_conversation_service)
    ):
        """对话交互"""
        try:
            response = await conv_svc.chat(
                session_id=request.session_id,
                user_message=request.message
            )
            
            return {
                "success": True,
                "message": response['content'],
                "suggestions": response.get('suggestions'),
                "state": response['state'],
                "collected_info": response.get('collected_info')
            }
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
    
    @router.post("/suggestions")
    async def get_job_suggestions(
        request: GetSuggestionsRequest,
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        job_svc: JobRecommendationService = Depends(get_job_service),
        conv_svc: ConversationService = Depends(get_conversation_service)
    ):
        """获取岗位建议"""
        # 获取会话信息
        collected_info = conv_svc.get_collected_info(request.session_id)
        
        if not collected_info.get('position'):
            raise HTTPException(
                status_code=400,
                detail="尚未收集到足够的信息，请先完成对话"
            )
        
        # 获取岗位建议
        suggestions = await job_svc.fetch_job_suggestions(
            position=collected_info['position'],
            company=collected_info.get('company'),
            city=collected_info.get('city'),
            limit=8
        )
        
        # 转换为卡片格式
        cards = await conv_svc.generate_job_cards(
            request.session_id,
            [
                {
                    'id': s.id,
                    'title': s.title,
                    'company': s.company,
                    'location': s.location,
                    'salary_range': s.salary_range,
                    'match_score': s.match_score,
                    'match_reasons': s.match_reasons,
                    'source': s.source
                }
                for s in suggestions
            ]
        )
        
        return {
            "success": True,
            "suggestions": cards,
            "count": len(cards)
        }
    
    @router.post("/confirm")
    async def confirm_target_job(
        request: ConfirmJobRequest,
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        job_svc: JobRecommendationService = Depends(get_job_service)
    ):
        """确认唯一目标岗位"""
        user = user_id or "demo-user"
        
        result = await job_svc.confirm_single_target(
            job_id=request.job_id,
            user_id=user
        )
        
        return {
            "success": True,
            "message": "目标岗位已确认",
            "job_id": result['job_id'],
            "confirmed_at": result['confirmed_at']
        }
    
    @router.post("/reselect")
    async def reselect_target(
        session_id: str,
        user_id: Optional[str] = Header(default=None, alias="x-user-id"),
        conv_svc: ConversationService = Depends(get_conversation_service)
    ):
        """重新选择目标岗位（清空下游数据）"""
        # 获取会话
        session = conv_svc.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="会话不存在")
        
        # 重置会话状态
        session.state = 'collecting'
        session.collected_info = {}
        
        return {
            "success": True,
            "message": "已重新开始选择，下游数据将被清空",
            "warning": "重新选择将清空已生成的JD分析、简历优化等数据"
        }
    
    return router

