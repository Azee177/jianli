"""岗位推荐服务"""
from __future__ import annotations

import asyncio
import logging
from typing import Optional, List
from dataclasses import dataclass
from datetime import datetime

logger = logging.getLogger(__name__)


@dataclass
class ResumeAnalysis:
    """简历分析结果"""
    skills: List[str]
    experience_years: Optional[float]
    education_level: str  # '本科', '硕士', '博士'
    industries: List[str]  # 行业领域
    roles: List[str]  # 历史职位
    strengths: List[str]  # 优势领域
    suggested_positions: List[str]  # 建议岗位方向
    

@dataclass
class JobSuggestion:
    """岗位建议"""
    id: str
    title: str  # 岗位名称
    company: str  # 公司名称
    location: str  # 工作地点
    salary_range: Optional[str]  # 薪资范围
    requirements: List[str]  # 岗位要求
    match_score: float  # 匹配度 0.0-1.0
    match_reasons: List[str]  # 匹配原因
    source: str  # 来源：'official_site', 'job_board', 'recommended'
    

class JobRecommendationService:
    """岗位推荐服务"""
    
    def __init__(self):
        self._analysis_cache = {}
        
    async def analyze_resume_background(self, resume_id: str, resume_text: str) -> ResumeAnalysis:
        """分析用户简历背景
        
        Args:
            resume_id: 简历ID
            resume_text: 简历文本
            
        Returns:
            ResumeAnalysis
        """
        # 检查缓存
        if resume_id in self._analysis_cache:
            return self._analysis_cache[resume_id]
        
        # 模拟LLM分析过程
        await asyncio.sleep(1)
        
        # 这里应该调用LLM进行分析，现在用简单规则模拟
        analysis = self._mock_analyze_resume(resume_text)
        
        # 缓存结果
        self._analysis_cache[resume_id] = analysis
        
        return analysis
    
    def _mock_analyze_resume(self, resume_text: str) -> ResumeAnalysis:
        """模拟简历分析（实际应该调用LLM）"""
        # 简单的关键词提取
        skills = []
        if 'Python' in resume_text or 'python' in resume_text:
            skills.append('Python')
        if 'Java' in resume_text or 'java' in resume_text:
            skills.append('Java')
        if 'React' in resume_text or 'react' in resume_text:
            skills.append('React')
        if '算法' in resume_text or 'Algorithm' in resume_text:
            skills.append('算法')
        if '机器学习' in resume_text or 'Machine Learning' in resume_text:
            skills.append('机器学习')
        
        # 推断教育水平
        education_level = '本科'
        if '博士' in resume_text or 'PhD' in resume_text:
            education_level = '博士'
        elif '硕士' in resume_text or 'Master' in resume_text:
            education_level = '硕士'
        
        # 推断经验年限
        experience_years = 3.0
        if '5年' in resume_text or '5 years' in resume_text:
            experience_years = 5.0
        
        # 建议岗位方向
        suggested_positions = ['软件工程师', '后端开发工程师', '算法工程师']
        
        return ResumeAnalysis(
            skills=skills or ['Python', 'Java', 'SQL'],
            experience_years=experience_years,
            education_level=education_level,
            industries=['互联网', '软件开发'],
            roles=['软件工程师', '开发工程师'],
            strengths=['后端开发', '系统设计'],
            suggested_positions=suggested_positions
        )
    
    async def recommend_positions(
        self,
        resume_analysis: ResumeAnalysis,
        user_preferences: dict
    ) -> List[str]:
        """基于简历分析和用户偏好推荐岗位
        
        Args:
            resume_analysis: 简历分析结果
            user_preferences: 用户偏好（岗位方向、公司、城市等）
            
        Returns:
            推荐的岗位列表
        """
        # 结合用户偏好和简历分析
        position = user_preferences.get('position', '')
        
        if position:
            # 用户指定了岗位
            return [position]
        else:
            # 使用分析出的建议岗位
            return resume_analysis.suggested_positions
    
    async def fetch_job_suggestions(
        self,
        position: str,
        company: Optional[str] = None,
        city: Optional[str] = None,
        limit: int = 8
    ) -> List[JobSuggestion]:
        """获取岗位建议（5-8条）
        
        Args:
            position: 岗位名称
            company: 目标公司（可选）
            city: 工作城市（可选）
            limit: 返回数量
            
        Returns:
            JobSuggestion列表
        """
        # 模拟从各个渠道抓取岗位
        await asyncio.sleep(1.5)
        
        suggestions = []
        
        # 如果指定了目标公司，优先返回该公司的岗位
        if company:
            suggestions.append(JobSuggestion(
                id=f"job_{company}_1",
                title=position,
                company=company,
                location=city or "北京",
                salary_range="25K-45K",
                requirements=[
                    "3-5年相关工作经验",
                    "熟练掌握主流技术栈",
                    "良好的沟通能力"
                ],
                match_score=0.95,
                match_reasons=[
                    "岗位要求与您的技能高度匹配",
                    "公司文化与您的价值观相符",
                    "薪资范围符合预期"
                ],
                source="official_site"
            ))
        
        # 添加其他相似岗位
        companies = ["字节跳动", "腾讯", "阿里巴巴", "百度", "美团", "京东", "拼多多"]
        for i, comp in enumerate(companies[:limit-1]):
            if comp == company:
                continue
                
            suggestions.append(JobSuggestion(
                id=f"job_{comp}_{i}",
                title=position,
                company=comp,
                location=city or "北京",
                salary_range=f"{20+i*2}K-{35+i*3}K",
                requirements=[
                    f"{2+i}年以上相关经验",
                    "技术基础扎实",
                    "有团队协作精神"
                ],
                match_score=0.85 - i * 0.05,
                match_reasons=[
                    "岗位要求匹配",
                    "行业领先公司"
                ],
                source="job_board"
            ))
            
            if len(suggestions) >= limit:
                break
        
        return suggestions
    
    async def confirm_single_target(
        self,
        job_id: str,
        user_id: str
    ) -> dict:
        """确认唯一目标岗位
        
        Args:
            job_id: 岗位ID
            user_id: 用户ID
            
        Returns:
            确认结果
        """
        # 这里应该保存到数据库
        logger.info(f"User {user_id} confirmed target job {job_id}")
        
        return {
            "success": True,
            "job_id": job_id,
            "user_id": user_id,
            "confirmed_at": datetime.utcnow().isoformat()
        }

