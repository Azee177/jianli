"""
智能模板填充服务
自动将解析的简历内容填充到HTML模板中
"""
from __future__ import annotations

from typing import Dict, List, Optional
import re

from ..parser import ParsedResume
from ..schemas import ResumeBlock, ResumeContacts


class TemplateFiller:
    """模板填充器"""
    
    @staticmethod
    def fill_template(template: str, parsed_resume: ParsedResume) -> str:
        """
        将解析的简历内容填充到模板中
        
        Args:
            template: HTML模板（包含{{变量}}占位符）
            parsed_resume: 解析后的简历数据
            
        Returns:
            填充后的HTML内容
        """
        # 提取各个部分的内容
        sections = TemplateFiller._extract_sections(parsed_resume.blocks)
        
        # 准备填充数据
        fill_data = {
            'photo_url': 'https://dummyimage.com/102x136/f0f0f0/666&text=照片',
            'name': parsed_resume.contacts.name or '姓名',
            'phone': parsed_resume.contacts.phone or '电话',
            'email': parsed_resume.contacts.email or '邮箱',
            'education_content': TemplateFiller._format_section_content(
                sections.get('education', [])
            ),
            'project_content': TemplateFiller._format_project_content(
                sections.get('project', [])
            ),
            'research_content': TemplateFiller._format_section_content(
                sections.get('research', [])
            ),
            'internship_content': TemplateFiller._format_experience_content(
                sections.get('experience', [])
            ),
            'comprehensive_content': TemplateFiller._format_section_content(
                sections.get('skills', []) + sections.get('awards', [])
            ),
        }
        
        # 替换模板变量
        result = template
        for key, value in fill_data.items():
            placeholder = f"{{{{{key}}}}}"
            result = result.replace(placeholder, value)
        
        return result
    
    @staticmethod
    def _extract_sections(blocks: List[ResumeBlock]) -> Dict[str, List[ResumeBlock]]:
        """
        将块按类型分组
        
        Returns:
            {'education': [blocks], 'project': [blocks], ...}
        """
        sections: Dict[str, List[ResumeBlock]] = {}
        
        for block in blocks:
            block_type = block.type
            if block_type not in sections:
                sections[block_type] = []
            sections[block_type].append(block)
        
        # 将experience细分为实习和工作
        if 'experience' in sections:
            exp_blocks = sections['experience']
            research_blocks = []
            
            for block in exp_blocks:
                # 检查是否包含研究/科研关键词
                if any(keyword in block.text for keyword in ['研究', '科研', '论文', '学术']):
                    research_blocks.append(block)
            
            if research_blocks:
                sections['research'] = research_blocks
        
        return sections
    
    @staticmethod
    def _format_section_content(blocks: List[ResumeBlock]) -> str:
        """格式化普通章节内容"""
        if not blocks:
            return '<div style="margin-left: 20px; color: #999;">暂无相关信息</div>'
        
        html_parts = []
        for block in blocks:
            # 清理文本
            text = block.text.strip()
            if not text:
                continue
            
            # 将换行转换为HTML
            lines = text.split('\n')
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                html_parts.append(f'<div style="margin-bottom: 4px;">{line}</div>')
        
        return '\n    '.join(html_parts) if html_parts else '<div>暂无信息</div>'
    
    @staticmethod
    def _format_project_content(blocks: List[ResumeBlock]) -> str:
        """
        格式化项目经历内容
        提取项目名称、时间、目标、工具等信息
        """
        if not blocks:
            return '<div style="margin-left: 20px; color: #999;">暂无项目经历</div>'
        
        html_parts = []
        
        for block in blocks:
            text = block.text.strip()
            if not text:
                continue
            
            # 尝试提取项目标题和时间
            lines = text.split('\n')
            
            # 第一行通常是项目标题
            if lines:
                title_line = lines[0].strip()
                
                # 尝试提取时间（YYYY.MM-YYYY.MM格式）
                time_match = re.search(r'(\d{4}\.\d{1,2}\s*-\s*\d{4}\.\d{1,2})', title_line)
                time_str = time_match.group(1) if time_match else ''
                
                # 移除时间后的标题
                if time_str:
                    title = title_line.replace(time_str, '').strip()
                else:
                    title = title_line
                
                html_parts.append('<div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 4px; margin-top: 12px;">')
                html_parts.append(f'  <span>{title}</span>')
                if time_str:
                    html_parts.append(f'  <span>{time_str}</span>')
                html_parts.append('</div>')
            
            # 处理剩余内容
            for i, line in enumerate(lines[1:], 1):
                line = line.strip()
                if not line:
                    continue
                
                # 检查是否是特殊标签（目标、工具等）
                if any(keyword in line for keyword in ['目标：', '工具：', '技术栈：', '成果：']):
                    html_parts.append(f'<div style="margin-bottom: 4px;">')
                    html_parts.append(f'  {line}')
                    html_parts.append('</div>')
                else:
                    # 普通内容缩进
                    html_parts.append(f'<div style="margin-bottom: 4px; margin-left: 20px;">')
                    html_parts.append(f'  {line}')
                    html_parts.append('</div>')
        
        return '\n    '.join(html_parts) if html_parts else '<div>暂无信息</div>'
    
    @staticmethod
    def _format_experience_content(blocks: List[ResumeBlock]) -> str:
        """
        格式化工作/实习经历
        """
        if not blocks:
            return '<div style="margin-left: 20px; color: #999;">暂无实习经历</div>'
        
        html_parts = []
        
        for block in blocks:
            text = block.text.strip()
            if not text:
                continue
            
            lines = text.split('\n')
            
            # 第一行通常是公司和时间
            if lines:
                header_line = lines[0].strip()
                
                # 尝试提取时间
                time_match = re.search(r'(\d{4}\.\d{1,2}\s*-\s*(?:\d{4}\.\d{1,2}|至今))', header_line)
                time_str = time_match.group(1) if time_match else ''
                
                company = header_line.replace(time_str, '').strip()
                
                html_parts.append('<div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 4px; margin-top: 12px;">')
                html_parts.append(f'  <span>{company}</span>')
                if time_str:
                    html_parts.append(f'  <span>{time_str}</span>')
                html_parts.append('</div>')
            
            # 处理职位和工作内容
            for line in lines[1:]:
                line = line.strip()
                if not line:
                    continue
                
                if any(keyword in line for keyword in ['职位：', '工作内容：', '主要职责：']):
                    html_parts.append(f'<div style="margin-bottom: 4px;">{line}</div>')
                else:
                    html_parts.append(f'<div style="margin-left: 20px; margin-bottom: 2px;">{line}</div>')
        
        return '\n    '.join(html_parts) if html_parts else '<div>暂无信息</div>'


def fill_resume_template(template: str, parsed_resume: ParsedResume) -> str:
    """
    便捷函数：填充简历模板
    
    Args:
        template: HTML模板字符串
        parsed_resume: 解析后的简历数据
        
    Returns:
        填充后的HTML
    """
    filler = TemplateFiller()
    return filler.fill_template(template, parsed_resume)











