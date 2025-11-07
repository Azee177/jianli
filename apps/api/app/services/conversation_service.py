"""对话式引导服务"""
from __future__ import annotations

import asyncio
import logging
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, field
from datetime import datetime
from uuid import uuid4

logger = logging.getLogger(__name__)


@dataclass
class ConversationSession:
    """对话会话"""
    session_id: str
    resume_id: str
    user_id: str
    state: str  # 'collecting', 'recommending', 'completed'
    collected_info: Dict[str, Any] = field(default_factory=dict)
    messages: List[Dict[str, str]] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    

@dataclass
class ConversationMessage:
    """对话消息"""
    role: str  # 'assistant' or 'user'
    content: str
    suggestions: Optional[List[str]] = None  # 建议选项（如果有）
    timestamp: datetime = field(default_factory=datetime.utcnow)
    

class ConversationService:
    """对话式引导服务"""
    
    def __init__(self):
        self._sessions = {}  # session_id -> ConversationSession
        
    async def start_intent_session(
        self,
        resume_id: str,
        user_id: str,
        resume_analysis: Optional[dict] = None
    ) -> ConversationSession:
        """开始意图收集会话
        
        Args:
            resume_id: 简历ID
            user_id: 用户ID
            resume_analysis: 简历分析结果（可选）
            
        Returns:
            ConversationSession
        """
        session_id = f"session_{uuid4().hex[:12]}"
        
        session = ConversationSession(
            session_id=session_id,
            resume_id=resume_id,
            user_id=user_id,
            state='collecting',
            collected_info={}
        )
        
        # 生成初始问候消息
        greeting = self._generate_greeting(resume_analysis)
        session.messages.append({
            'role': 'assistant',
            'content': greeting,
            'suggestions': None
        })
        
        # 生成第一个引导问题
        first_question = await self._generate_first_question(resume_analysis)
        session.messages.append({
            'role': 'assistant',
            'content': first_question['content'],
            'suggestions': first_question.get('suggestions')
        })
        
        self._sessions[session_id] = session
        
        return session
    
    def _generate_greeting(self, resume_analysis: Optional[dict]) -> str:
        """生成问候消息"""
        if resume_analysis and resume_analysis.get('suggested_positions'):
            positions = resume_analysis['suggested_positions']
            return f"您好！我已经分析了您的简历，看起来您在{positions[0]}等领域有不错的经验。让我帮您找到最适合的目标岗位。"
        else:
            return "您好！让我帮您找到最适合的目标岗位。"
    
    async def _generate_first_question(self, resume_analysis: Optional[dict]) -> dict:
        """生成第一个引导问题"""
        suggestions = None
        
        if resume_analysis and resume_analysis.get('suggested_positions'):
            suggestions = resume_analysis['suggested_positions']
            content = "根据您的简历，我为您推荐了几个可能适合的岗位方向。您想应聘哪个方向的岗位？"
        else:
            suggestions = ["软件工程师", "产品经理", "数据分析师", "算法工程师", "前端工程师"]
            content = "您想应聘什么岗位？"
        
        return {
            'content': content,
            'suggestions': suggestions
        }
    
    async def chat(
        self,
        session_id: str,
        user_message: str
    ) -> Dict[str, Any]:
        """对话交互
        
        Args:
            session_id: 会话ID
            user_message: 用户消息
            
        Returns:
            助手回复和状态
        """
        session = self._sessions.get(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        # 记录用户消息
        session.messages.append({
            'role': 'user',
            'content': user_message
        })
        
        # 解析用户回答
        parsed_info = await self._parse_user_response(user_message, session)
        
        # 更新收集的信息
        session.collected_info.update(parsed_info)
        
        # 生成下一个问题或完成收集
        if self._is_collection_complete(session):
            session.state = 'recommending'
            response = {
                'content': "太好了！我已经收集到足够的信息。现在让我为您推荐一些合适的岗位。",
                'suggestions': None,
                'state': 'recommending',
                'collected_info': session.collected_info
            }
        else:
            # 生成后续问题
            next_question = await self._generate_followup_question(session)
            response = {
                'content': next_question['content'],
                'suggestions': next_question.get('suggestions'),
                'state': 'collecting',
                'collected_info': session.collected_info
            }
        
        # 记录助手回复
        session.messages.append({
            'role': 'assistant',
            'content': response['content'],
            'suggestions': response.get('suggestions')
        })
        
        session.updated_at = datetime.utcnow()
        
        return response
    
    async def _parse_user_response(
        self,
        response: str,
        session: ConversationSession
    ) -> dict:
        """解析用户回答
        
        Args:
            response: 用户回答
            session: 当前会话
            
        Returns:
            解析出的信息
        """
        # 这里应该调用LLM进行智能解析，现在用简单规则
        parsed = {}
        
        # 判断当前缺少什么信息
        if 'position' not in session.collected_info:
            # 正在收集岗位信息
            parsed['position'] = response.strip()
            
        elif 'company' not in session.collected_info:
            # 正在收集目标公司
            if '不确定' in response or '任何' in response or '都可以' in response:
                parsed['company'] = None
            else:
                parsed['company'] = response.strip()
                
        elif 'city' not in session.collected_info:
            # 正在收集城市
            parsed['city'] = response.strip()
            
        elif 'level' not in session.collected_info:
            # 正在收集级别
            parsed['level'] = response.strip()
        
        return parsed
    
    async def _generate_followup_question(
        self,
        session: ConversationSession
    ) -> dict:
        """生成后续引导问题
        
        Args:
            session: 当前会话
            
        Returns:
            问题和建议选项
        """
        collected = session.collected_info
        
        # 根据已收集的信息决定下一个问题
        if 'position' in collected and 'company' not in collected:
            return {
                'content': f"很好！您想应聘{collected['position']}岗位。您有心仪的目标公司吗？（如果没有特定目标，可以说'不确定'）",
                'suggestions': ["字节跳动", "腾讯", "阿里巴巴", "百度", "不确定"]
            }
        
        elif 'company' in collected and 'city' not in collected:
            return {
                'content': "您希望在哪个城市工作？",
                'suggestions': ["北京", "上海", "深圳", "杭州", "广州"]
            }
        
        elif 'city' in collected and 'level' not in collected:
            return {
                'content': "您期望的岗位级别是？",
                'suggestions': ["初级", "中级", "高级", "专家"]
            }
        
        else:
            return {
                'content': "还有其他要求吗？比如薪资期望、工作内容偏好等",
                'suggestions': None
            }
    
    def _is_collection_complete(self, session: ConversationSession) -> bool:
        """判断信息收集是否完成
        
        Args:
            session: 当前会话
            
        Returns:
            是否完成
        """
        collected = session.collected_info
        
        # 至少需要岗位信息
        required_fields = ['position']
        
        # 检查必需字段
        for field in required_fields:
            if field not in collected:
                return False
        
        # 如果有城市信息，认为收集完成
        if 'city' in collected:
            return True
        
        return False
    
    async def generate_job_cards(
        self,
        session_id: str,
        job_suggestions: List[dict]
    ) -> List[dict]:
        """生成岗位卡片
        
        Args:
            session_id: 会话ID
            job_suggestions: 岗位建议列表
            
        Returns:
            岗位卡片列表
        """
        session = self._sessions.get(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        cards = []
        for job in job_suggestions:
            cards.append({
                'id': job.get('id'),
                'title': job.get('title'),
                'company': job.get('company'),
                'location': job.get('location'),
                'salary_range': job.get('salary_range'),
                'match_score': job.get('match_score'),
                'match_reasons': job.get('match_reasons'),
                'source': job.get('source')
            })
        
        return cards
    
    def get_session(self, session_id: str) -> Optional[ConversationSession]:
        """获取会话"""
        return self._sessions.get(session_id)
    
    def get_collected_info(self, session_id: str) -> dict:
        """获取已收集的信息"""
        session = self._sessions.get(session_id)
        if not session:
            return {}
        return session.collected_info

