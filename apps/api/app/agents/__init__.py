"""智能Agent系统"""
# 只导入存在的agent
from .base_agent import BaseAgent
from .llm_service import LLMService, get_llm_service

# 以下agent待实现
# from .master_agent import MasterAgent
# from .resume_parser_agent import ResumeParserAgent
# from .job_recommendation_agent import JobRecommendationAgent
# from .jd_analysis_agent import JDAnalysisAgent
# from .resume_optimization_agent import ResumeOptimizationAgent
# from .interview_prep_agent import InterviewPrepAgent

__all__ = [
    'BaseAgent',
    'LLMService',
    'get_llm_service',
]

