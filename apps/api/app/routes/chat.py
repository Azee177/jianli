"""通用对话路由 - 支持多轮对话和会话记忆"""
from __future__ import annotations

import logging
from typing import Optional, List, Dict
from datetime import datetime
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel

from ..agents.llm_service import get_llm_service

logger = logging.getLogger(__name__)


# 内存存储会话历史（生产环境应该用Redis或数据库）
_conversation_sessions: Dict[str, List[Dict[str, str]]] = {}


class ChatMessage(BaseModel):
    """聊天消息"""
    role: str  # 'user' or 'assistant' or 'system'
    content: str


class ChatRequest(BaseModel):
    """对话请求"""
    message: str
    session_id: Optional[str] = None  # 会话ID，用于保持上下文
    system_message: Optional[str] = None  # 可选的系统提示词
    temperature: float = 0.7
    max_tokens: int = 2000
    provider: Optional[str] = None  # 指定LLM提供者 (qwen/deepseek/openai)


class ChatHistoryRequest(BaseModel):
    """获取对话历史请求"""
    session_id: str


class ResetSessionRequest(BaseModel):
    """重置会话请求"""
    session_id: str


def create_chat_router() -> APIRouter:
    """创建对话路由"""
    router = APIRouter()
    
    @router.post("/message")
    async def send_message(
        request: ChatRequest,
        user_id: Optional[str] = Header(default=None, alias="x-user-id")
    ):
        """
        发送对话消息并获取AI回复
        
        支持多轮对话，自动管理conversation history
        """
        try:
            user = user_id or "demo-user"
            session_id = request.session_id or f"session_{user}_{datetime.utcnow().timestamp()}"
            
            # 获取或创建会话历史
            if session_id not in _conversation_sessions:
                _conversation_sessions[session_id] = []
                
                # 如果有系统消息，添加到历史开头
                if request.system_message:
                    _conversation_sessions[session_id].append({
                        "role": "system",
                        "content": request.system_message
                    })
                else:
                    # 默认系统消息
                    _conversation_sessions[session_id].append({
                        "role": "system",
                        "content": "你是一个专业的简历优化助手。你善于帮助用户优化简历内容，提供针对性的建议，并用清晰、友好的语言与用户交流。"
                    })
            
            # 添加用户消息到历史
            _conversation_sessions[session_id].append({
                "role": "user",
                "content": request.message
            })
            
            # 调用LLM服务
            llm_service = get_llm_service()
            
            logger.info(f"Calling LLM for session {session_id}, history length: {len(_conversation_sessions[session_id])}")
            
            response = await llm_service.chat(
                messages=_conversation_sessions[session_id],
                temperature=request.temperature,
                max_tokens=request.max_tokens,
                provider=request.provider
            )
            
            # 添加助手回复到历史
            _conversation_sessions[session_id].append({
                "role": "assistant",
                "content": response
            })
            
            # 限制历史长度（保留最近20条消息，避免token过多）
            if len(_conversation_sessions[session_id]) > 21:  # system + 20条
                system_msg = _conversation_sessions[session_id][0]
                _conversation_sessions[session_id] = [system_msg] + _conversation_sessions[session_id][-20:]
            
            return {
                "success": True,
                "session_id": session_id,
                "message": response,
                "history_length": len(_conversation_sessions[session_id]) - 1,  # 不计算system message
                "provider": request.provider or "default"
            }
            
        except Exception as e:
            logger.error(f"Chat error: {e}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"对话失败: {str(e)}"
            )
    
    @router.post("/history")
    async def get_chat_history(
        request: ChatHistoryRequest,
        user_id: Optional[str] = Header(default=None, alias="x-user-id")
    ):
        """获取对话历史"""
        if request.session_id not in _conversation_sessions:
            return {
                "success": True,
                "session_id": request.session_id,
                "messages": []
            }
        
        # 返回历史（不包括system message）
        messages = _conversation_sessions[request.session_id][1:]
        
        return {
            "success": True,
            "session_id": request.session_id,
            "messages": messages
        }
    
    @router.post("/reset")
    async def reset_session(
        request: ResetSessionRequest,
        user_id: Optional[str] = Header(default=None, alias="x-user-id")
    ):
        """重置会话，清空对话历史"""
        if request.session_id in _conversation_sessions:
            del _conversation_sessions[request.session_id]
        
        return {
            "success": True,
            "message": "会话已重置"
        }
    
    @router.get("/sessions")
    async def list_sessions(
        user_id: Optional[str] = Header(default=None, alias="x-user-id")
    ):
        """列出所有活跃会话"""
        user = user_id or "demo-user"
        
        # 筛选该用户的会话
        user_sessions = [
            {
                "session_id": sid,
                "message_count": len(messages) - 1,  # 不计算system message
                "last_message": messages[-1]["content"][:50] if len(messages) > 1 else ""
            }
            for sid, messages in _conversation_sessions.items()
            if user in sid
        ]
        
        return {
            "success": True,
            "sessions": user_sessions
        }
    
    return router

