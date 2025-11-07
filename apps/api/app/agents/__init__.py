"""智能Agent系统"""
from .master_agent import MasterAgent
from .resume_parser_agent import ResumeParserAgent
from .job_recommendation_agent import JobRecommendationAgent
from .jd_analysis_agent import JDAnalysisAgent
from .resume_optimization_agent import ResumeOptimizationAgent
from .interview_prep_agent import InterviewPrepAgent

__all__ = [
    'MasterAgent',
    'ResumeParserAgent',
    'JobRecommendationAgent',
    'JDAnalysisAgent',
    'ResumeOptimizationAgent',
    'InterviewPrepAgent'
]

