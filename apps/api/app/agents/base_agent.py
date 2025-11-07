"""Agent基类"""
from __future__ import annotations

import logging
from typing import Dict, Any, Optional, List
from abc import ABC, abstractmethod
from enum import Enum

from .llm_service import LLMService, get_llm_service

logger = logging.getLogger(__name__)


class JourneyStage(str, Enum):
    """用户旅程阶段"""
    UPLOAD = "upload"
    PARSING = "parsing"
    PARSE_COMPLETE = "parse_complete"
    INTENT_COLLECTING = "intent_collecting"
    TARGET_CONFIRMED = "target_confirmed"
    JD_ANALYZING = "jd_analyzing"
    DIMS_LOCKED = "dims_locked"
    OPTIMIZING = "optimizing"
    PREP_GENERATING = "prep_generating"
    COMPLETE = "complete"


class AgentContext:
    """Agent上下文"""
    
    def __init__(
        self,
        user_id: str,
        journey_id: str,
        current_stage: JourneyStage = JourneyStage.UPLOAD
    ):
        self.user_id = user_id
        self.journey_id = journey_id
        self.current_stage = current_stage
        self.data: Dict[str, Any] = {}
        self.history: List[Dict[str, Any]] = []
    
    def set(self, key: str, value: Any):
        """设置上下文数据"""
        self.data[key] = value
    
    def get(self, key: str, default: Any = None) -> Any:
        """获取上下文数据"""
        return self.data.get(key, default)
    
    def add_history(self, action: str, result: Any):
        """添加历史记录"""
        self.history.append({
            "action": action,
            "result": result,
            "stage": self.current_stage
        })


class BaseAgent(ABC):
    """Agent基类"""
    
    def __init__(
        self,
        name: str,
        description: str,
        llm_service: Optional[LLMService] = None
    ):
        self.name = name
        self.description = description
        self.llm_service = llm_service or get_llm_service()
        self.logger = logging.getLogger(f"agent.{name}")
    
    @abstractmethod
    async def execute(
        self,
        task: Dict[str, Any],
        context: AgentContext
    ) -> Dict[str, Any]:
        """
        执行Agent任务
        
        Args:
            task: 任务参数
            context: 执行上下文
            
        Returns:
            执行结果
        """
        pass
    
    async def call_llm(
        self,
        prompt: str,
        system_message: Optional[str] = None,
        temperature: float = 0.7,
        response_format: Optional[str] = None
    ) -> str:
        """调用LLM"""
        self.logger.info(f"Calling LLM for {self.name}")
        return await self.llm_service.complete(
            prompt=prompt,
            system_message=system_message,
            temperature=temperature,
            response_format=response_format
        )
    
    async def call_llm_json(
        self,
        prompt: str,
        system_message: Optional[str] = None,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """调用LLM并返回JSON"""
        self.logger.info(f"Calling LLM (JSON) for {self.name}")
        return await self.llm_service.complete_json(
            prompt=prompt,
            system_message=system_message,
            temperature=temperature
        )
    
    def log_info(self, message: str):
        """记录信息"""
        self.logger.info(f"[{self.name}] {message}")
    
    def log_error(self, message: str):
        """记录错误"""
        self.logger.error(f"[{self.name}] {message}")


class StateMachine:
    """状态机"""
    
    def __init__(self):
        # 定义允许的状态转换
        self.transitions = {
            JourneyStage.UPLOAD: [JourneyStage.PARSING],
            JourneyStage.PARSING: [JourneyStage.PARSE_COMPLETE],
            JourneyStage.PARSE_COMPLETE: [JourneyStage.INTENT_COLLECTING],
            JourneyStage.INTENT_COLLECTING: [JourneyStage.TARGET_CONFIRMED, JourneyStage.INTENT_COLLECTING],
            JourneyStage.TARGET_CONFIRMED: [JourneyStage.JD_ANALYZING],
            JourneyStage.JD_ANALYZING: [JourneyStage.DIMS_LOCKED],
            JourneyStage.DIMS_LOCKED: [JourneyStage.OPTIMIZING],
            JourneyStage.OPTIMIZING: [JourneyStage.PREP_GENERATING, JourneyStage.OPTIMIZING],
            JourneyStage.PREP_GENERATING: [JourneyStage.COMPLETE],
            JourneyStage.COMPLETE: [JourneyStage.INTENT_COLLECTING]  # 允许重新开始
        }
    
    def can_transition(
        self,
        from_stage: JourneyStage,
        to_stage: JourneyStage
    ) -> bool:
        """检查是否可以转换"""
        return to_stage in self.transitions.get(from_stage, [])
    
    def transition(
        self,
        context: AgentContext,
        to_stage: JourneyStage
    ) -> bool:
        """执行状态转换"""
        if self.can_transition(context.current_stage, to_stage):
            logger.info(
                f"State transition: {context.current_stage} -> {to_stage}"
            )
            context.current_stage = to_stage
            return True
        else:
            logger.warning(
                f"Invalid transition: {context.current_stage} -> {to_stage}"
            )
            return False
    
    def get_next_stages(self, current_stage: JourneyStage) -> List[JourneyStage]:
        """获取当前阶段可以转换到的下一阶段"""
        return self.transitions.get(current_stage, [])

