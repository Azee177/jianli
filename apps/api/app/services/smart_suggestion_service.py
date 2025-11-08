"""
智能建议服务 - 基于LLM提供简历优化建议
"""
from __future__ import annotations

import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

from ..agents.llm_service import get_llm_service

logger = logging.getLogger(__name__)


@dataclass
class Suggestion:
    """建议数据结构"""
    type: str  # "improvement", "warning", "tip"
    section: str  # "education", "project", "skills", etc.
    title: str
    description: str
    priority: int  # 1-5, 5最高
    example: Optional[str] = None


@dataclass
class ResumeAnalysis:
    """简历分析结果"""
    overall_score: float  # 0-100
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[Suggestion]
    completeness: Dict[str, float]  # 各部分完整度
    keyword_match: Optional[Dict[str, Any]] = None  # JD关键词匹配


class SmartSuggestionService:
    """智能建议服务"""
    
    def __init__(self):
        self.llm_service = get_llm_service()
    
    async def analyze_resume(
        self,
        resume_text: str,
        structured_data: Optional[Dict[str, Any]] = None,
        target_jd: Optional[str] = None
    ) -> ResumeAnalysis:
        """
        分析简历并生成建议
        
        Args:
            resume_text: 简历文本
            structured_data: 结构化数据（如果有）
            target_jd: 目标职位描述（可选）
            
        Returns:
            ResumeAnalysis 分析结果
        """
        try:
            logger.info("开始分析简历")
            
            # 构建分析提示词
            analysis_prompt = self._build_analysis_prompt(
                resume_text,
                structured_data,
                target_jd
            )
            
            # 调用LLM进行分析
            result = await self.llm_service.complete_json(
                prompt=analysis_prompt,
                system_message="你是一位专业的简历优化顾问，擅长分析简历并提供改进建议。",
                temperature=0.3,
                max_tokens=3000
            )
            
            # 解析结果
            analysis = self._parse_analysis_result(result)
            logger.info(f"简历分析完成，整体评分: {analysis.overall_score}")
            
            return analysis
            
        except Exception as e:
            logger.error(f"简历分析失败: {e}", exc_info=True)
            # 返回基础分析
            return self._get_fallback_analysis()
    
    async def get_section_suggestions(
        self,
        section_type: str,
        section_content: str,
        target_jd: Optional[str] = None
    ) -> List[Suggestion]:
        """
        获取特定章节的优化建议
        
        Args:
            section_type: 章节类型（education, project, experience等）
            section_content: 章节内容
            target_jd: 目标职位描述（可选）
            
        Returns:
            List[Suggestion] 建议列表
        """
        try:
            prompt = f"""请分析以下简历的【{section_type}】部分，提供3-5条具体的优化建议。

内容：
{section_content}

{f"目标职位：{target_jd[:500]}" if target_jd else ""}

请以JSON格式返回建议：
```json
{{
  "suggestions": [
    {{
      "title": "建议标题",
      "description": "详细描述",
      "priority": 3,
      "example": "示例（可选）"
    }}
  ]
}}
```

建议类型：
- improvement: 改进建议
- warning: 需要注意的问题
- tip: 小技巧

优先级：1（低）到5（高）
"""
            
            result = await self.llm_service.complete_json(
                prompt=prompt,
                system_message="你是专业的简历顾问，提供实用的优化建议。",
                temperature=0.4
            )
            
            suggestions = []
            for item in result.get("suggestions", []):
                suggestions.append(Suggestion(
                    type="improvement",
                    section=section_type,
                    title=item.get("title", ""),
                    description=item.get("description", ""),
                    priority=item.get("priority", 3),
                    example=item.get("example")
                ))
            
            return suggestions
            
        except Exception as e:
            logger.error(f"获取章节建议失败: {e}")
            return []
    
    async def optimize_text(
        self,
        original_text: str,
        context: str = "",
        target_jd: Optional[str] = None
    ) -> str:
        """
        优化文本内容
        
        Args:
            original_text: 原始文本
            context: 上下文（章节类型等）
            target_jd: 目标职位描述（可选）
            
        Returns:
            str 优化后的文本
        """
        try:
            prompt = f"""请优化以下简历内容，使其更专业、更有吸引力。

原文：
{original_text}

{f"上下文：{context}" if context else ""}
{f"目标职位：{target_jd[:300]}" if target_jd else ""}

优化要求：
1. 使用动词开头（如"负责"、"开发"、"实现"等）
2. 量化成果（数字、百分比、规模等）
3. 突出核心技能和成就
4. 语言精炼、专业
5. 保持原意，不夸大

请直接返回优化后的文本，不要添加解释。
"""
            
            optimized = await self.llm_service.complete(
                prompt=prompt,
                system_message="你是专业的简历文本优化专家。",
                temperature=0.5,
                max_tokens=1000
            )
            
            return optimized.strip()
            
        except Exception as e:
            logger.error(f"文本优化失败: {e}")
            return original_text
    
    async def generate_summary(
        self,
        resume_text: str,
        target_position: Optional[str] = None
    ) -> str:
        """
        生成个人总结/求职意向
        
        Args:
            resume_text: 简历全文
            target_position: 目标职位
            
        Returns:
            str 生成的个人总结
        """
        try:
            prompt = f"""基于以下简历内容，生成一段精炼的个人总结（50-100字）。

简历内容：
{resume_text[:1000]}

{f"目标职位：{target_position}" if target_position else ""}

要求：
1. 突出核心优势和特长
2. 体现职业目标
3. 语言简洁专业
4. 2-3句话概括

请直接返回个人总结文本。
"""
            
            summary = await self.llm_service.complete(
                prompt=prompt,
                system_message="你是专业的简历撰写专家。",
                temperature=0.6,
                max_tokens=200
            )
            
            return summary.strip()
            
        except Exception as e:
            logger.error(f"生成总结失败: {e}")
            return ""
    
    def _build_analysis_prompt(
        self,
        resume_text: str,
        structured_data: Optional[Dict[str, Any]],
        target_jd: Optional[str]
    ) -> str:
        """构建分析提示词"""
        
        prompt = f"""请全面分析以下简历，提供详细的评估和改进建议。

简历内容：
{resume_text}

{f"结构化数据：{structured_data}" if structured_data else ""}
{f"目标职位描述：{target_jd[:500]}" if target_jd else ""}

请从以下维度分析并以JSON格式返回：

```json
{{
  "overall_score": 75,  // 整体评分 0-100
  "strengths": [
    "优势1",
    "优势2"
  ],
  "weaknesses": [
    "不足1",
    "不足2"
  ],
  "completeness": {{
    "personal_info": 0.9,  // 0-1
    "education": 0.8,
    "experience": 0.7,
    "projects": 0.6,
    "skills": 0.8
  }},
  "suggestions": [
    {{
      "type": "improvement",  // improvement/warning/tip
      "section": "education",
      "title": "建议标题",
      "description": "详细描述",
      "priority": 4,  // 1-5
      "example": "示例（可选）"
    }}
  ],
  "keyword_match": {{
    "matched": ["关键词1", "关键词2"],
    "missing": ["缺失关键词1"],
    "match_rate": 0.6
  }}
}}
```

评分标准：
- 90-100: 优秀
- 75-89: 良好
- 60-74: 及格
- 60以下: 需要大幅改进

建议优先级：
- 5: 必须修改
- 4: 强烈建议
- 3: 建议改进
- 2: 可选优化
- 1: 微小调整
"""
        
        return prompt
    
    def _parse_analysis_result(self, result: Dict[str, Any]) -> ResumeAnalysis:
        """解析LLM返回的分析结果"""
        
        suggestions = []
        for item in result.get("suggestions", []):
            suggestions.append(Suggestion(
                type=item.get("type", "improvement"),
                section=item.get("section", "general"),
                title=item.get("title", ""),
                description=item.get("description", ""),
                priority=item.get("priority", 3),
                example=item.get("example")
            ))
        
        return ResumeAnalysis(
            overall_score=result.get("overall_score", 70.0),
            strengths=result.get("strengths", []),
            weaknesses=result.get("weaknesses", []),
            suggestions=suggestions,
            completeness=result.get("completeness", {}),
            keyword_match=result.get("keyword_match")
        )
    
    def _get_fallback_analysis(self) -> ResumeAnalysis:
        """获取降级分析结果"""
        return ResumeAnalysis(
            overall_score=70.0,
            strengths=["简历内容完整"],
            weaknesses=["暂无详细分析"],
            suggestions=[
                Suggestion(
                    type="tip",
                    section="general",
                    title="建议使用LLM分析",
                    description="当前为降级模式，建议配置LLM以获取更详细的分析。",
                    priority=3
                )
            ],
            completeness={
                "personal_info": 0.8,
                "education": 0.7,
                "experience": 0.7,
                "projects": 0.6,
                "skills": 0.7
            }
        )


# 全局服务实例
_suggestion_service: Optional[SmartSuggestionService] = None


def get_suggestion_service() -> SmartSuggestionService:
    """获取建议服务单例"""
    global _suggestion_service
    if _suggestion_service is None:
        _suggestion_service = SmartSuggestionService()
    return _suggestion_service

