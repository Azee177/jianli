"""简历对齐服务 - 生成草稿、差距分析、改进建议"""
from __future__ import annotations

import asyncio
import logging
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, field
from datetime import datetime
from uuid import uuid4

logger = logging.getLogger(__name__)


@dataclass
class GapAnalysisItem:
    """差距分析项"""
    dimension: str  # 对应的共性维度
    current_level: str  # 当前水平描述
    required_level: str  # 要求水平描述
    gap_description: str  # 差距描述
    severity: str  # 'high', 'medium', 'low'
    

@dataclass
class ImprovementSuggestion:
    """改进建议"""
    id: str
    target_section: str  # 目标段落 'experience', 'skills', 'project'
    suggestion_type: str  # 'add', 'modify', 'enhance', 'quantify'
    original_text: Optional[str]  # 原始文本
    suggested_text: str  # 建议文本
    reason: str  # 改进原因
    priority: int  # 优先级 1-5
    

@dataclass
class ResumeDraft:
    """简历草稿"""
    id: str
    version: int  # 版本号
    resume_id: str
    content: str  # Markdown格式的简历内容
    sections: Dict[str, str]  # 各个章节的内容
    changes_from_previous: Optional[List[str]]  # 与上一版本的变化
    created_at: datetime = field(default_factory=datetime.utcnow)
    

class ResumeAlignmentService:
    """简历对齐服务"""
    
    def __init__(self):
        self._drafts = {}  # draft_id -> ResumeDraft
        self._gap_analyses = {}  # analysis_id -> List[GapAnalysisItem]
        self._suggestions = {}  # suggestion_set_id -> List[ImprovementSuggestion]
        
    async def generate_draft_v1(
        self,
        resume_id: str,
        resume_content: str,
        common_dimensions: List[dict]
    ) -> ResumeDraft:
        """生成首轮草稿
        
        Args:
            resume_id: 简历ID
            resume_content: 原始简历内容
            common_dimensions: 共性维度列表
            
        Returns:
            ResumeDraft
        """
        logger.info(f"Generating draft v1 for resume {resume_id}")
        
        # 模拟LLM生成过程
        await asyncio.sleep(2)
        
        # 解析原始简历
        sections = self._parse_resume_sections(resume_content)
        
        # 根据共性维度对齐简历
        aligned_sections = await self._align_sections_to_dimensions(
            sections,
            common_dimensions
        )
        
        # 生成草稿
        draft_id = f"draft_{resume_id}_{uuid4().hex[:8]}"
        draft = ResumeDraft(
            id=draft_id,
            version=1,
            resume_id=resume_id,
            content=self._sections_to_markdown(aligned_sections),
            sections=aligned_sections,
            changes_from_previous=None
        )
        
        self._drafts[draft_id] = draft
        
        return draft
    
    def _parse_resume_sections(self, content: str) -> Dict[str, str]:
        """解析简历各章节"""
        # 简单的章节分割
        sections = {
            'header': '',
            'summary': '',
            'experience': '',
            'education': '',
            'skills': '',
            'projects': '',
            'others': ''
        }
        
        # 这里应该用更智能的方式解析
        # 现在简单地将内容放入experience
        sections['experience'] = content
        
        return sections
    
    async def _align_sections_to_dimensions(
        self,
        sections: Dict[str, str],
        common_dimensions: List[dict]
    ) -> Dict[str, str]:
        """将简历各章节对齐到共性维度
        
        Args:
            sections: 简历章节
            common_dimensions: 共性维度
            
        Returns:
            对齐后的章节
        """
        # 模拟LLM对齐过程
        await asyncio.sleep(1)
        
        aligned = sections.copy()
        
        # 根据共性维度增强各章节
        # 这里应该调用LLM，现在用简单逻辑模拟
        for dim in common_dimensions:
            title = dim.get('title', '')
            description = dim.get('description', '')
            
            if '技术' in title or '能力' in title:
                # 增强技能章节
                if aligned['skills']:
                    aligned['skills'] += f"\n- {description}"
                else:
                    aligned['skills'] = f"- {description}"
            
            elif '经验' in title:
                # 在工作经历中体现
                if aligned['experience']:
                    aligned['experience'] += f"\n\n相关经验：{description}"
        
        return aligned
    
    def _sections_to_markdown(self, sections: Dict[str, str]) -> str:
        """将章节转换为Markdown格式"""
        markdown = ""
        
        if sections.get('header'):
            markdown += sections['header'] + "\n\n"
        
        if sections.get('summary'):
            markdown += "## 个人简介\n\n" + sections['summary'] + "\n\n"
        
        if sections.get('experience'):
            markdown += "## 工作经历\n\n" + sections['experience'] + "\n\n"
        
        if sections.get('projects'):
            markdown += "## 项目经历\n\n" + sections['projects'] + "\n\n"
        
        if sections.get('skills'):
            markdown += "## 技能特长\n\n" + sections['skills'] + "\n\n"
        
        if sections.get('education'):
            markdown += "## 教育背景\n\n" + sections['education'] + "\n\n"
        
        return markdown.strip()
    
    async def analyze_gap(
        self,
        resume_content: str,
        common_dimensions: List[dict]
    ) -> str:
        """差距分析
        
        Args:
            resume_content: 简历内容
            common_dimensions: 共性维度
            
        Returns:
            analysis_id
        """
        logger.info("Analyzing gap between resume and requirements")
        
        # 模拟LLM分析过程
        await asyncio.sleep(1.5)
        
        gap_items = []
        
        for dim in common_dimensions:
            title = dim.get('title', '')
            description = dim.get('description', '')
            importance = dim.get('importance', 0.5)
            
            # 检查简历中是否体现了这个维度
            is_mentioned = self._check_dimension_coverage(resume_content, description)
            
            if not is_mentioned:
                # 存在差距
                severity = 'high' if importance > 0.9 else ('medium' if importance > 0.7 else 'low')
                
                gap_items.append(GapAnalysisItem(
                    dimension=title,
                    current_level="简历中未体现或体现不足",
                    required_level=description,
                    gap_description=f"需要在简历中补充或加强关于'{title}'的描述",
                    severity=severity
                ))
        
        # 保存分析结果
        analysis_id = f"gap_analysis_{uuid4().hex[:8]}"
        self._gap_analyses[analysis_id] = gap_items
        
        return analysis_id
    
    def _check_dimension_coverage(self, resume_content: str, dimension_desc: str) -> bool:
        """检查简历是否覆盖了某个维度"""
        # 简单的关键词匹配（实际应该用语义匹配）
        keywords = dimension_desc.split()
        
        coverage_count = 0
        for keyword in keywords:
            if len(keyword) > 2 and keyword in resume_content:
                coverage_count += 1
        
        return coverage_count >= len(keywords) * 0.3
    
    def get_gap_analysis(self, analysis_id: str) -> List[GapAnalysisItem]:
        """获取差距分析结果"""
        return self._gap_analyses.get(analysis_id, [])
    
    async def suggest_improvements(
        self,
        resume_content: str,
        gap_analysis_items: List[GapAnalysisItem]
    ) -> str:
        """生成改进建议
        
        Args:
            resume_content: 简历内容
            gap_analysis_items: 差距分析项
            
        Returns:
            suggestion_set_id
        """
        logger.info("Generating improvement suggestions")
        
        # 模拟LLM生成建议
        await asyncio.sleep(1.5)
        
        suggestions = []
        
        for gap in gap_analysis_items:
            # 根据差距生成改进建议
            priority = 5 if gap.severity == 'high' else (3 if gap.severity == 'medium' else 1)
            
            suggestion = ImprovementSuggestion(
                id=f"suggestion_{uuid4().hex[:8]}",
                target_section='experience',
                suggestion_type='add',
                original_text=None,
                suggested_text=f"建议添加：{gap.required_level}",
                reason=f"填补差距：{gap.gap_description}",
                priority=priority
            )
            
            suggestions.append(suggestion)
        
        # 保存建议
        suggestion_set_id = f"suggestions_{uuid4().hex[:8]}"
        self._suggestions[suggestion_set_id] = suggestions
        
        return suggestion_set_id
    
    def get_suggestions(self, suggestion_set_id: str) -> List[ImprovementSuggestion]:
        """获取改进建议"""
        return self._suggestions.get(suggestion_set_id, [])
    
    async def rewrite_section(
        self,
        section_content: str,
        style: str,
        target_dimension: Optional[str] = None
    ) -> str:
        """重写特定段落
        
        Args:
            section_content: 段落内容
            style: 风格 'professional', 'technical', 'concise'
            target_dimension: 目标维度（可选）
            
        Returns:
            重写后的内容
        """
        logger.info(f"Rewriting section with style: {style}")
        
        # 模拟LLM重写
        await asyncio.sleep(1)
        
        # 简单的重写模拟
        rewritten = section_content
        
        if style == 'professional':
            rewritten = "以专业的方式重写：" + section_content
        elif style == 'technical':
            rewritten = "以技术导向的方式重写：" + section_content
        elif style == 'concise':
            rewritten = "精简版：" + section_content[:len(section_content)//2]
        
        return rewritten
    
    async def apply_star_method(self, experience_text: str) -> str:
        """应用STAR法则重写经历
        
        Args:
            experience_text: 经历文本
            
        Returns:
            STAR格式的文本
        """
        logger.info("Applying STAR method to experience")
        
        # 模拟LLM应用STAR法则
        await asyncio.sleep(1)
        
        star_format = f"""
**情境（Situation）**: 描述项目背景和面临的挑战
**任务（Task）**: 明确你负责的具体任务和目标
**行动（Action）**: 详细说明采取的行动和方法
**结果（Result）**: 量化展示达成的成果和影响

{experience_text}
        """.strip()
        
        return star_format
    
    async def add_quantification(self, text: str) -> str:
        """添加量化指标
        
        Args:
            text: 原始文本
            
        Returns:
            添加了量化指标的文本
        """
        logger.info("Adding quantification to text")
        
        # 模拟LLM添加量化
        await asyncio.sleep(0.8)
        
        # 简单的量化示例
        quantified = text
        
        if '提升' in text and '性能' in text:
            quantified = text.replace('提升性能', '提升性能30%')
        if '优化' in text:
            quantified = quantified.replace('优化', '优化（响应时间减少50%）')
        if '用户' in text:
            quantified += "，服务用户数达10万+"
        
        return quantified
    
    def get_draft(self, draft_id: str) -> Optional[ResumeDraft]:
        """获取草稿"""
        return self._drafts.get(draft_id)
    
    async def create_new_version(
        self,
        previous_draft_id: str,
        modifications: Dict[str, str]
    ) -> ResumeDraft:
        """创建新版本
        
        Args:
            previous_draft_id: 上一版本ID
            modifications: 修改内容
            
        Returns:
            新版本草稿
        """
        previous = self._drafts.get(previous_draft_id)
        if not previous:
            raise ValueError(f"Draft {previous_draft_id} not found")
        
        # 创建新版本
        new_sections = previous.sections.copy()
        new_sections.update(modifications)
        
        # 记录变化
        changes = []
        for section, content in modifications.items():
            if previous.sections.get(section) != content:
                changes.append(f"修改了{section}章节")
        
        new_draft = ResumeDraft(
            id=f"draft_{previous.resume_id}_{uuid4().hex[:8]}",
            version=previous.version + 1,
            resume_id=previous.resume_id,
            content=self._sections_to_markdown(new_sections),
            sections=new_sections,
            changes_from_previous=changes
        )
        
        self._drafts[new_draft.id] = new_draft
        
        return new_draft

