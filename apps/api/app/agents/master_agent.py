"""Master Agent - 总控Agent，负责意图识别和流程编排"""
from __future__ import annotations

from typing import Dict, Any, Optional, List
import logging

from .base_agent import BaseAgent, AgentContext, JourneyStage, StateMachine

logger = logging.getLogger(__name__)

INTENT_RECOGNITION_SYSTEM_MESSAGE = """
你是一个智能助手的大脑，负责理解用户意图并决定下一步行动。

你需要：
1. 理解用户当前想要做什么
2. 判断当前处于哪个流程阶段
3. 决定应该调用哪个Agent
4. 判断是否需要额外信息

可用的Agents：
- ResumeParser: 解析上传的简历
- JobRecommendation: 通过对话推荐岗位
- JDAnalysis: 抓取和分析JD，提取共性
- ResumeOptimization: 优化简历内容
- InterviewPrep: 生成面试准备材料

流程阶段：
- upload: 用户上传简历
- parsing: 正在解析简历
- parse_complete: 解析完成
- intent_collecting: 收集岗位意向
- target_confirmed: 确认目标岗位
- jd_analyzing: 分析JD
- dims_locked: 共性维度已锁定
- optimizing: 正在优化简历
- prep_generating: 生成面试准备
- complete: 完成
"""

INTENT_RECOGNITION_PROMPT_TEMPLATE = """
当前状态：
- 流程阶段：{current_stage}
- 用户ID：{user_id}
- 已有数据：{available_data}

用户输入：
```
{user_input}
```

请分析用户意图，返回以下JSON格式：

{{
  "intent": "用户意图（简短描述）",
  "required_agent": "需要调用的Agent名称",
  "parameters": {{
    "参数名": "参数值"
  }},
  "next_stage": "下一个流程阶段",
  "user_response": "给用户的回复（如果需要）",
  "requires_user_input": true/false
}}

可选的Agent：ResumeParser, JobRecommendation, JDAnalysis, ResumeOptimization, InterviewPrep, None

如果当前不需要调用Agent，required_agent设为null。
"""


class MasterAgent(BaseAgent):
    """主控Agent"""
    
    def __init__(self, sub_agents: Dict[str, BaseAgent]):
        super().__init__(
            name="Master",
            description="总控Agent，负责意图识别和流程编排"
        )
        self.sub_agents = sub_agents
        self.state_machine = StateMachine()
    
    async def execute(
        self,
        task: Dict[str, Any],
        context: AgentContext
    ) -> Dict[str, Any]:
        """
        执行主控逻辑
        
        Args:
            task: {
                "user_input": "用户输入",
                "action_type": "上传简历/对话/确认/优化等"
            }
            context: Agent上下文
            
        Returns:
            执行结果
        """
        user_input = task.get("user_input", "")
        action_type = task.get("action_type", "general")
        
        self.log_info(f"处理用户请求: {action_type}")
        
        # 根据action_type直接路由
        if action_type == "upload_resume":
            return await self._handle_resume_upload(task, context)
        
        elif action_type == "start_intent_collection":
            return await self._handle_start_intent(task, context)
        
        elif action_type == "chat":
            return await self._handle_chat(task, context)
        
        elif action_type == "confirm_target":
            return await self._handle_confirm_target(task, context)
        
        elif action_type == "analyze_jd":
            return await self._handle_jd_analysis(task, context)
        
        elif action_type == "optimize_resume":
            return await self._handle_optimization(task, context)
        
        else:
            # 通用处理 - 使用LLM识别意图
            return await self._handle_general_intent(user_input, context)
    
    async def _handle_resume_upload(
        self,
        task: Dict[str, Any],
        context: AgentContext
    ) -> Dict[str, Any]:
        """处理简历上传"""
        self.log_info("处理简历上传")
        
        # 转换状态
        self.state_machine.transition(context, JourneyStage.PARSING)
        
        # 调用ResumeParser Agent
        parser = self.sub_agents.get("ResumeParser")
        if not parser:
            return {"success": False, "error": "ResumeParser not available"}
        
        result = await parser.execute(
            task={
                "ocr_text": task.get("ocr_text"),
                "pdf_bytes": task.get("pdf_bytes")
            },
            context=context
        )
        
        if result.get("success"):
            # 转换到解析完成状态
            self.state_machine.transition(context, JourneyStage.PARSE_COMPLETE)
            
            return {
                "success": True,
                "stage": JourneyStage.PARSE_COMPLETE,
                "resume_data": result.get("resume_data"),
                "photo_info": result.get("photo_info"),
                "next_action": "start_intent_collection",
                "message": "简历解析完成！现在让我帮您找到最适合的目标岗位。"
            }
        else:
            return result
    
    async def _handle_start_intent(
        self,
        task: Dict[str, Any],
        context: AgentContext
    ) -> Dict[str, Any]:
        """开始意图收集"""
        self.log_info("开始意图收集")
        
        # 转换状态
        self.state_machine.transition(context, JourneyStage.INTENT_COLLECTING)
        
        # 调用JobRecommendation Agent
        job_agent = self.sub_agents.get("JobRecommendation")
        if not job_agent:
            return {"success": False, "error": "JobRecommendation not available"}
        
        result = await job_agent.execute(
            task={
                "action": "start",
                "resume_data": context.get("resume_data")
            },
            context=context
        )
        
        return result
    
    async def _handle_chat(
        self,
        task: Dict[str, Any],
        context: AgentContext
    ) -> Dict[str, Any]:
        """处理对话"""
        self.log_info("处理对话消息")
        
        job_agent = self.sub_agents.get("JobRecommendation")
        if not job_agent:
            return {"success": False, "error": "JobRecommendation not available"}
        
        result = await job_agent.execute(
            task={
                "action": "chat",
                "message": task.get("message")
            },
            context=context
        )
        
        return result
    
    async def _handle_confirm_target(
        self,
        task: Dict[str, Any],
        context: AgentContext
    ) -> Dict[str, Any]:
        """确认目标岗位"""
        self.log_info("确认目标岗位")
        
        # 转换状态
        self.state_machine.transition(context, JourneyStage.TARGET_CONFIRMED)
        
        # 保存目标岗位信息
        context.set("target_job", task.get("job_info"))
        
        return {
            "success": True,
            "stage": JourneyStage.TARGET_CONFIRMED,
            "next_action": "analyze_jd",
            "message": "目标岗位已确认！接下来我将分析相关JD，提取核心要求。"
        }
    
    async def _handle_jd_analysis(
        self,
        task: Dict[str, Any],
        context: AgentContext
    ) -> Dict[str, Any]:
        """处理JD分析"""
        self.log_info("开始JD分析")
        
        # 转换状态
        self.state_machine.transition(context, JourneyStage.JD_ANALYZING)
        
        jd_agent = self.sub_agents.get("JDAnalysis")
        if not jd_agent:
            return {"success": False, "error": "JDAnalysis not available"}
        
        target_job = context.get("target_job")
        
        result = await jd_agent.execute(
            task={
                "position": target_job.get("title"),
                "company": target_job.get("company"),
                "city": target_job.get("location")
            },
            context=context
        )
        
        if result.get("success"):
            # 转换到维度锁定状态
            self.state_machine.transition(context, JourneyStage.DIMS_LOCKED)
            
            return {
                "success": True,
                "stage": JourneyStage.DIMS_LOCKED,
                "commonalities": result.get("commonalities"),
                "next_action": "optimize_resume",
                "message": "JD分析完成！已提取核心共性要求。"
            }
        else:
            return result
    
    async def _handle_optimization(
        self,
        task: Dict[str, Any],
        context: AgentContext
    ) -> Dict[str, Any]:
        """处理简历优化"""
        self.log_info("开始简历优化")
        
        # 转换状态
        self.state_machine.transition(context, JourneyStage.OPTIMIZING)
        
        opt_agent = self.sub_agents.get("ResumeOptimization")
        if not opt_agent:
            return {"success": False, "error": "ResumeOptimization not available"}
        
        result = await opt_agent.execute(
            task={
                "resume_data": context.get("resume_data"),
                "commonalities": context.get("commonalities"),
                "optimization_type": task.get("optimization_type", "draft_v1")
            },
            context=context
        )
        
        return result
    
    async def _handle_general_intent(
        self,
        user_input: str,
        context: AgentContext
    ) -> Dict[str, Any]:
        """通用意图处理 - 使用LLM识别"""
        self.log_info("识别用户意图")
        
        # 准备上下文信息
        available_data = {
            "resume_parsed": context.get("resume_data") is not None,
            "target_confirmed": context.get("target_job") is not None,
            "jd_analyzed": context.get("commonalities") is not None
        }
        
        prompt = INTENT_RECOGNITION_PROMPT_TEMPLATE.format(
            current_stage=context.current_stage,
            user_id=context.user_id,
            available_data=available_data,
            user_input=user_input
        )
        
        try:
            intent_result = await self.call_llm_json(
                prompt=prompt,
                system_message=INTENT_RECOGNITION_SYSTEM_MESSAGE,
                temperature=0.3
            )
            
            self.log_info(f"识别到意图: {intent_result.get('intent')}")
            
            # 根据识别结果调用相应的Agent
            required_agent = intent_result.get("required_agent")
            
            if required_agent and required_agent in self.sub_agents:
                agent = self.sub_agents[required_agent]
                result = await agent.execute(
                    task=intent_result.get("parameters", {}),
                    context=context
                )
                return result
            else:
                return {
                    "success": True,
                    "intent": intent_result.get("intent"),
                    "response": intent_result.get("user_response"),
                    "requires_user_input": intent_result.get("requires_user_input")
                }
                
        except Exception as e:
            self.log_error(f"意图识别失败: {e}")
            return {
                "success": False,
                "error": "无法理解您的请求，请重新表述"
            }
    
    def get_available_actions(self, context: AgentContext) -> List[str]:
        """获取当前阶段可用的操作"""
        stage = context.current_stage
        
        actions_map = {
            JourneyStage.UPLOAD: ["upload_resume"],
            JourneyStage.PARSE_COMPLETE: ["start_intent_collection"],
            JourneyStage.INTENT_COLLECTING: ["chat", "confirm_target"],
            JourneyStage.TARGET_CONFIRMED: ["analyze_jd"],
            JourneyStage.DIMS_LOCKED: ["optimize_resume"],
            JourneyStage.OPTIMIZING: ["optimize_selection", "generate_draft"],
            JourneyStage.PREP_GENERATING: ["generate_prep", "generate_interview"],
        }
        
        return actions_map.get(stage, [])

