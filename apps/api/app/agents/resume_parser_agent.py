"""简历解析Agent - 使用LLM提取结构化信息"""
from __future__ import annotations

from typing import Dict, Any
import asyncio

from .base_agent import BaseAgent, AgentContext

RESUME_PARSER_SYSTEM_MESSAGE = """
你是一个专业的简历解析专家，擅长从OCR提取的文本中识别并结构化各种信息。

你的任务是将非结构化的简历文本转换为结构化的JSON格式。

要求：
1. 准确识别基本信息（姓名、联系方式）
2. 提取教育背景（学校、学历、专业、时间段）
3. 提取工作经历（公司、职位、时间段、职责描述、成果）
4. 识别技能列表
5. 提取项目经验
6. 分析候选人的优势和适合的岗位方向

注意事项：
- 如果某些信息缺失，使用null而不是猜测
- 时间格式统一为YYYY-MM
- 提取量化数据（如"提升30%性能"）
- 识别STAR格式的描述
"""

RESUME_PARSER_PROMPT_TEMPLATE = """
请从以下OCR提取的简历文本中，提取并结构化所有信息。

OCR文本：
```
{ocr_text}
```

请返回以下JSON格式：

{{
  "basic_info": {{
    "name": "姓名",
    "phone": "手机号",
    "email": "邮箱",
    "wechat": "微信号（如果有）",
    "github": "GitHub用户名（如果有）",
    "linkedin": "LinkedIn（如果有）",
    "location": "所在城市"
  }},
  "education": [
    {{
      "school": "学校名称",
      "degree": "学历（本科/硕士/博士）",
      "major": "专业",
      "start_date": "开始时间（YYYY-MM）",
      "end_date": "结束时间（YYYY-MM）",
      "gpa": "GPA（如果有）",
      "honors": ["荣誉列表"]
    }}
  ],
  "work_experience": [
    {{
      "company": "公司名称",
      "position": "职位",
      "start_date": "开始时间（YYYY-MM）",
      "end_date": "结束时间（YYYY-MM或'至今'）",
      "location": "工作地点",
      "description": ["职责描述1", "职责描述2"],
      "achievements": ["成果1（包含量化数据）", "成果2"],
      "technologies": ["使用的技术栈"]
    }}
  ],
  "projects": [
    {{
      "name": "项目名称",
      "role": "担任角色",
      "start_date": "开始时间",
      "end_date": "结束时间",
      "description": "项目描述",
      "responsibilities": ["负责内容"],
      "achievements": ["项目成果"],
      "technologies": ["技术栈"]
    }}
  ],
  "skills": {{
    "programming_languages": ["编程语言"],
    "frameworks": ["框架"],
    "databases": ["数据库"],
    "tools": ["工具"],
    "soft_skills": ["软技能"]
  }},
  "analysis": {{
    "experience_years": 工作年限（数字）,
    "education_level": "最高学历",
    "industries": ["行业领域"],
    "core_competencies": ["核心能力"],
    "strengths": ["优势描述"],
    "suggested_positions": ["建议应聘的岗位方向"],
    "career_stage": "职业阶段（初级/中级/高级/专家）"
  }}
}}

请仔细分析文本，准确提取所有信息。如果某些字段无法从文本中获取，请使用null或空数组。
"""


class ResumeParserAgent(BaseAgent):
    """简历解析Agent"""
    
    def __init__(self):
        super().__init__(
            name="ResumeParser",
            description="解析简历，提取结构化信息"
        )
    
    async def execute(
        self,
        task: Dict[str, Any],
        context: AgentContext
    ) -> Dict[str, Any]:
        """
        执行简历解析
        
        Args:
            task: {
                "ocr_text": "OCR提取的文本",
                "pdf_bytes": PDF字节（可选，用于提取照片）
            }
            context: Agent上下文
            
        Returns:
            {
                "success": bool,
                "resume_data": 结构化简历数据,
                "photo_info": 照片信息（如果有）
            }
        """
        self.log_info("开始解析简历")
        
        ocr_text = task.get("ocr_text", "")
        pdf_bytes = task.get("pdf_bytes")
        
        if not ocr_text:
            return {
                "success": False,
                "error": "OCR文本为空"
            }
        
        # 并行执行：解析简历 + 提取照片
        parse_task = self._parse_resume_with_llm(ocr_text)
        photo_task = self._extract_photo(pdf_bytes) if pdf_bytes else None
        
        # 等待两个任务完成
        if photo_task:
            resume_data, photo_info = await asyncio.gather(parse_task, photo_task)
        else:
            resume_data = await parse_task
            photo_info = None
        
        # 保存到上下文
        context.set("resume_data", resume_data)
        context.set("photo_info", photo_info)
        
        self.log_info("简历解析完成")
        
        return {
            "success": True,
            "resume_data": resume_data,
            "photo_info": photo_info
        }
    
    async def _parse_resume_with_llm(self, ocr_text: str) -> Dict[str, Any]:
        """使用LLM解析简历"""
        self.log_info("调用LLM解析简历文本")
        
        prompt = RESUME_PARSER_PROMPT_TEMPLATE.format(ocr_text=ocr_text)
        
        try:
            result = await self.call_llm_json(
                prompt=prompt,
                system_message=RESUME_PARSER_SYSTEM_MESSAGE,
                temperature=0.3  # 低温度保证准确性
            )
            
            self.log_info("LLM解析完成")
            return result
            
        except Exception as e:
            self.log_error(f"LLM解析失败: {e}")
            # 返回基础结构
            return self._get_default_structure()
    
    async def _extract_photo(self, pdf_bytes: bytes) -> Dict[str, Any]:
        """提取照片信息"""
        self.log_info("开始提取照片")
        
        try:
            # 使用photo_service提取照片
            from ..services.photo_service import PhotoService
            photo_service = PhotoService()
            
            result = photo_service.extract_photo_from_pdf(pdf_bytes)
            
            if result:
                # 保存照片
                photo_id = photo_service.save_photo_to_storage(
                    result.photo_bytes,
                    "temp_user",  # 应该从context获取
                    result.photo_format
                )
                
                return {
                    "extracted": True,
                    "photo_id": photo_id,
                    "width": result.width,
                    "height": result.height,
                    "confidence": result.confidence,
                    "page_number": result.page_number
                }
            else:
                return {
                    "extracted": False,
                    "message": "未找到合适的照片"
                }
        except Exception as e:
            self.log_error(f"照片提取失败: {e}")
            return {
                "extracted": False,
                "error": str(e)
            }
    
    def _get_default_structure(self) -> Dict[str, Any]:
        """获取默认数据结构"""
        return {
            "basic_info": {
                "name": None,
                "phone": None,
                "email": None,
                "wechat": None,
                "github": None,
                "linkedin": None,
                "location": None
            },
            "education": [],
            "work_experience": [],
            "projects": [],
            "skills": {
                "programming_languages": [],
                "frameworks": [],
                "databases": [],
                "tools": [],
                "soft_skills": []
            },
            "analysis": {
                "experience_years": 0,
                "education_level": None,
                "industries": [],
                "core_competencies": [],
                "strengths": [],
                "suggested_positions": [],
                "career_stage": "初级"
            }
        }
    
    async def enrich_analysis(
        self,
        resume_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        增强分析 - 基于已提取的数据进行深度分析
        
        Args:
            resume_data: 已解析的简历数据
            
        Returns:
            增强后的分析结果
        """
        self.log_info("开始深度分析")
        
        prompt = f"""
基于以下结构化的简历数据，进行深度分析：

{resume_data}

请分析：
1. 候选人的核心竞争力是什么？
2. 最适合的岗位方向（3-5个）
3. 职业发展轨迹分析
4. 技术栈的深度和广度
5. 可以突出的亮点
6. 可能的短板

返回JSON格式的分析结果。
        """
        
        try:
            analysis = await self.call_llm_json(
                prompt=prompt,
                system_message="你是一个资深的HR和职业规划专家",
                temperature=0.5
            )
            
            return analysis
        except Exception as e:
            self.log_error(f"深度分析失败: {e}")
            return {}

