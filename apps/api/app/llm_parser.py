"""基于LLM的智能简历解析器"""
from __future__ import annotations

import json
import re
import logging
from typing import Optional, Dict, Any, List
from dataclasses import dataclass

from .schemas import ResumeBlock, ResumeContacts
from .agents.llm_service import get_llm_service

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class EnhancedParsedResume:
    """增强版解析结果"""
    normalized: str
    blocks: list[ResumeBlock]
    contacts: ResumeContacts
    skills: list[str]
    language: str
    # 新增字段
    structured_sections: Dict[str, Any]  # 结构化章节数据
    confidence_score: float  # 解析置信度
    parsing_method: str  # 解析方法：llm或rule-based


class LLMResumeParser:
    """使用LLM进行智能简历解析"""
    
    def __init__(self):
        self.llm_service = get_llm_service()
    
    async def parse_resume(
        self,
        text: str,
        use_llm: bool = True,
        fallback_to_rules: bool = True
    ) -> EnhancedParsedResume:
        """
        智能解析简历
        
        Args:
            text: 简历文本
            use_llm: 是否使用LLM
            fallback_to_rules: LLM失败时是否降级到规则解析
            
        Returns:
            增强版解析结果
        """
        normalized = self._normalize_text(text)
        
        # 尝试使用LLM解析
        if use_llm:
            try:
                logger.info("使用LLM进行简历解析")
                result = await self._llm_parse(normalized)
                result.parsing_method = "llm"
                return result
            except Exception as e:
                logger.error(f"LLM解析失败: {e}")
                if not fallback_to_rules:
                    raise
                logger.info("降级到规则解析")
        
        # 规则解析作为备选
        logger.info("使用规则进行简历解析")
        return self._rule_based_parse(normalized)
    
    async def _llm_parse(self, text: str) -> EnhancedParsedResume:
        """使用LLM进行解析"""
        
        # 1. 整体结构化解析
        structured_data = await self._llm_extract_structure(text)
        
        # 2. 提取联系信息
        contacts = await self._llm_extract_contacts(text, structured_data)
        
        # 3. 提取技能
        skills = await self._llm_extract_skills(text, structured_data)
        
        # 4. 检测语言
        language = self._detect_language(text)
        
        # 5. 创建blocks
        blocks = self._create_blocks_from_structure(structured_data)
        
        # 6. 计算置信度
        confidence = self._calculate_confidence(structured_data)
        
        return EnhancedParsedResume(
            normalized=text,
            blocks=blocks,
            contacts=contacts,
            skills=skills,
            language=language,
            structured_sections=structured_data,
            confidence_score=confidence,
            parsing_method="llm"
        )
    
    async def _llm_extract_structure(self, text: str) -> Dict[str, Any]:
        """使用LLM提取简历整体结构"""
        
        system_message = """你是一个专业的简历解析助手。请分析给定的简历文本，提取以下信息：

1. 个人信息（姓名、性别、年龄、联系方式等）
2. 教育背景（学校、专业、时间、学位等）
3. 工作经历（公司、职位、时间、工作内容等）
4. 项目经历（项目名称、时间、角色、技术栈、成果等）
5. 技能特长
6. 荣誉奖项
7. 其他相关信息

请严格按照以下JSON格式返回：
```json
{
  "personal_info": {
    "name": "姓名",
    "gender": "性别",
    "age": "年龄",
    "location": "所在地",
    "raw_text": "个人信息原始文本"
  },
  "education": [
    {
      "school": "学校名称",
      "major": "专业",
      "degree": "学位",
      "start_time": "开始时间",
      "end_time": "结束时间",
      "gpa": "GPA（如果有）",
      "description": "其他说明",
      "raw_text": "原始文本"
    }
  ],
  "work_experience": [
    {
      "company": "公司名称",
      "position": "职位",
      "start_time": "开始时间",
      "end_time": "结束时间或'至今'",
      "responsibilities": ["职责1", "职责2"],
      "achievements": ["成就1", "成就2"],
      "raw_text": "原始文本"
    }
  ],
  "projects": [
    {
      "name": "项目名称",
      "role": "角色",
      "start_time": "开始时间",
      "end_time": "结束时间",
      "description": "项目描述",
      "technologies": ["技术1", "技术2"],
      "achievements": ["成果1", "成果2"],
      "raw_text": "原始文本"
    }
  ],
  "skills": {
    "programming_languages": ["语言1", "语言2"],
    "frameworks": ["框架1", "框架2"],
    "tools": ["工具1", "工具2"],
    "other": ["其他技能"],
    "raw_text": "原始文本"
  },
  "awards": [
    {
      "name": "奖项名称",
      "time": "获奖时间",
      "level": "级别",
      "description": "描述",
      "raw_text": "原始文本"
    }
  ],
  "summary": "简历整体总结（可选）",
  "other": "其他信息"
}
```

注意：
- 如果某个字段不存在，使用null
- 保留原始文本在raw_text字段中
- 时间格式尽量统一
- 数组字段如果为空则返回空数组[]
"""
        
        prompt = f"""请解析以下简历文本：

{text}

请严格按照JSON格式返回解析结果。"""
        
        try:
            # 调用LLM
            response = await self.llm_service.complete(
                prompt=prompt,
                system_message=system_message,
                temperature=0.1,  # 低温度保证稳定性
                max_tokens=4000,
                response_format="json"
            )
            
            # 尝试解析JSON
            # 移除可能的markdown代码块标记
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.startswith("```"):
                response = response[3:]
            if response.endswith("```"):
                response = response[:-3]
            response = response.strip()
            
            data = json.loads(response)
            logger.info("LLM结构化解析成功")
            return data
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON解析失败: {e}")
            logger.error(f"LLM响应: {response[:500]}")
            raise ValueError(f"LLM返回的JSON格式错误: {e}")
        except Exception as e:
            logger.error(f"LLM调用失败: {e}")
            raise
    
    async def _llm_extract_contacts(
        self,
        text: str,
        structured_data: Dict[str, Any]
    ) -> ResumeContacts:
        """从结构化数据中提取联系信息"""
        
        personal_info = structured_data.get("personal_info", {})
        
        # 从结构化数据获取
        name = personal_info.get("name")
        location = personal_info.get("location")
        
        # 使用正则表达式提取联系方式（作为补充）
        email_match = re.search(
            r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
            text
        )
        phone_match = re.search(
            r"(?:\+?86[-\s]?)?1[3-9]\d{9}|(?:\d{3,4}[-\s]\d{7,8})",
            text
        )
        website_match = re.search(r"https?://[^\s]+", text)
        
        return ResumeContacts(
            name=name,
            email=email_match.group(0) if email_match else None,
            phone=phone_match.group(0) if phone_match else None,
            location=location,
            website=website_match.group(0) if website_match else None
        )
    
    async def _llm_extract_skills(
        self,
        text: str,
        structured_data: Dict[str, Any]
    ) -> List[str]:
        """从结构化数据中提取技能"""
        
        skills_data = structured_data.get("skills", {})
        all_skills = []
        
        # 收集所有技能类别
        for category in ["programming_languages", "frameworks", "tools", "other"]:
            category_skills = skills_data.get(category, [])
            if isinstance(category_skills, list):
                all_skills.extend(category_skills)
        
        # 从项目中提取技术栈
        projects = structured_data.get("projects", [])
        for project in projects:
            if isinstance(project, dict):
                technologies = project.get("technologies", [])
                if isinstance(technologies, list):
                    all_skills.extend(technologies)
        
        # 去重并排序
        return sorted(list(set(filter(None, all_skills))))
    
    def _create_blocks_from_structure(
        self,
        structured_data: Dict[str, Any]
    ) -> List[ResumeBlock]:
        """从结构化数据创建blocks"""
        
        blocks = []
        
        # 个人信息
        personal_info = structured_data.get("personal_info", {})
        if personal_info and personal_info.get("raw_text"):
            blocks.append(ResumeBlock(
                type="header",
                text=personal_info.get("raw_text", "")
            ))
        
        # 教育背景
        education = structured_data.get("education", [])
        if education:
            edu_texts = []
            for edu in education:
                if isinstance(edu, dict) and edu.get("raw_text"):
                    edu_texts.append(edu["raw_text"])
            if edu_texts:
                blocks.append(ResumeBlock(
                    type="education",
                    text="\n\n".join(edu_texts)
                ))
        
        # 工作经历
        work_exp = structured_data.get("work_experience", [])
        if work_exp:
            work_texts = []
            for work in work_exp:
                if isinstance(work, dict) and work.get("raw_text"):
                    work_texts.append(work["raw_text"])
            if work_texts:
                blocks.append(ResumeBlock(
                    type="experience",
                    text="\n\n".join(work_texts)
                ))
        
        # 项目经历
        projects = structured_data.get("projects", [])
        if projects:
            project_texts = []
            for project in projects:
                if isinstance(project, dict) and project.get("raw_text"):
                    project_texts.append(project["raw_text"])
            if project_texts:
                blocks.append(ResumeBlock(
                    type="project",
                    text="\n\n".join(project_texts)
                ))
        
        # 技能
        skills = structured_data.get("skills", {})
        if skills and skills.get("raw_text"):
            blocks.append(ResumeBlock(
                type="skills",
                text=skills.get("raw_text", "")
            ))
        
        # 荣誉奖项
        awards = structured_data.get("awards", [])
        if awards:
            award_texts = []
            for award in awards:
                if isinstance(award, dict) and award.get("raw_text"):
                    award_texts.append(award["raw_text"])
            if award_texts:
                blocks.append(ResumeBlock(
                    type="awards",
                    text="\n\n".join(award_texts)
                ))
        
        return blocks
    
    def _calculate_confidence(self, structured_data: Dict[str, Any]) -> float:
        """计算解析置信度"""
        
        confidence = 0.0
        total_checks = 0
        
        # 检查个人信息完整性
        personal_info = structured_data.get("personal_info", {})
        if personal_info:
            total_checks += 1
            if personal_info.get("name"):
                confidence += 0.2
        
        # 检查教育背景
        education = structured_data.get("education", [])
        if education:
            total_checks += 1
            confidence += 0.2
        
        # 检查工作或项目经历
        work_exp = structured_data.get("work_experience", [])
        projects = structured_data.get("projects", [])
        if work_exp or projects:
            total_checks += 1
            confidence += 0.2
        
        # 检查技能
        skills = structured_data.get("skills", {})
        if skills and any(skills.values()):
            total_checks += 1
            confidence += 0.2
        
        # 检查数据完整性
        if total_checks >= 3:
            confidence += 0.2
        
        return min(confidence, 1.0)
    
    def _rule_based_parse(self, text: str) -> EnhancedParsedResume:
        """规则解析（降级方案）"""
        from .parser import (
            split_into_blocks,
            extract_contacts,
            extract_skills,
            detect_language
        )
        
        blocks = split_into_blocks(text)
        contacts = extract_contacts(text)
        skills = extract_skills(text)
        language = detect_language(text)
        
        # 简单的结构化数据
        structured_sections = {
            "personal_info": {"name": contacts.name},
            "education": [],
            "work_experience": [],
            "projects": [],
            "skills": {"other": skills},
            "awards": []
        }
        
        return EnhancedParsedResume(
            normalized=text,
            blocks=blocks,
            contacts=contacts,
            skills=skills,
            language=language,
            structured_sections=structured_sections,
            confidence_score=0.5,  # 规则解析给较低的置信度
            parsing_method="rule-based"
        )
    
    def _normalize_text(self, text: str) -> str:
        """标准化文本"""
        return (
            text.replace("\r\n", "\n")
            .replace("\u00a0", " ")
            .replace("\u2022", "-")
            .strip()
        )
    
    def _detect_language(self, text: str) -> str:
        """检测语言"""
        chinese = len(re.findall(r"[\u4e00-\u9fff]", text))
        latin = len(re.findall(r"[A-Za-z]", text))
        if chinese == 0 and latin == 0:
            return "unknown"
        return "zh" if chinese >= latin else "en"


# 全局解析器实例
_llm_parser: Optional[LLMResumeParser] = None


def get_llm_parser() -> LLMResumeParser:
    """获取LLM解析器单例"""
    global _llm_parser
    if _llm_parser is None:
        _llm_parser = LLMResumeParser()
    return _llm_parser

