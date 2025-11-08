"""
增强版模板填充器 - 使用LLM解析的结构化数据
"""
from __future__ import annotations

from typing import Dict, Any, List, Optional
import re
import logging

logger = logging.getLogger(__name__)


class EnhancedTemplateFiller:
    """增强版模板填充器 - 利用LLM解析的完整结构化数据"""
    
    @staticmethod
    def fill_template_with_structured_data(
        template: str,
        structured_sections: Dict[str, Any],
        contacts: Dict[str, Optional[str]],
        photo_url: Optional[str] = None
    ) -> str:
        """
        使用结构化数据填充模板
        
        Args:
            template: HTML模板
            structured_sections: LLM解析的结构化章节数据
            contacts: 联系信息
            photo_url: 照片URL
            
        Returns:
            填充后的HTML
        """
        logger.info("使用结构化数据填充模板")
        
        # 提取个人信息
        personal_info = structured_sections.get('personal_info', {})
        name = contacts.get('name') or personal_info.get('name') or '姓名'
        
        # 准备填充数据
        fill_data = {
            'photo_url': photo_url or 'https://dummyimage.com/102x136/f0f0f0/666&text=照片',
            'name': name,
            'phone': contacts.get('phone') or '电话',
            'email': contacts.get('email') or '邮箱',
            'education_content': EnhancedTemplateFiller._format_education(
                structured_sections.get('education', [])
            ),
            'project_content': EnhancedTemplateFiller._format_projects(
                structured_sections.get('projects', [])
            ),
            'research_content': EnhancedTemplateFiller._format_research(
                structured_sections.get('work_experience', []),
                structured_sections.get('projects', [])
            ),
            'internship_content': EnhancedTemplateFiller._format_work_experience(
                structured_sections.get('work_experience', [])
            ),
            'comprehensive_content': EnhancedTemplateFiller._format_comprehensive(
                structured_sections.get('skills', {}),
                structured_sections.get('awards', [])
            ),
        }
        
        # 替换模板变量
        result = template
        for key, value in fill_data.items():
            placeholder = f"{{{{{key}}}}}"
            result = result.replace(placeholder, value)
        
        logger.info("模板填充完成")
        return result
    
    @staticmethod
    def _format_education(education_list: List[Dict[str, Any]]) -> str:
        """格式化教育背景"""
        if not education_list:
            return '<div style="margin-left: 20px; color: #999;">暂无教育信息</div>'
        
        html_parts = []
        
        for edu in education_list:
            if not isinstance(edu, dict):
                continue
            
            school = edu.get('school', '')
            major = edu.get('major', '')
            degree = edu.get('degree', '')
            start_time = edu.get('start_time', '')
            end_time = edu.get('end_time', '')
            gpa = edu.get('gpa', '')
            description = edu.get('description', '')
            
            # 时间段
            time_str = ''
            if start_time and end_time:
                time_str = f'{start_time}-{end_time}'
            elif start_time:
                time_str = start_time
            
            # 学校和时间（加粗，左右布局）
            if school:
                html_parts.append(
                    '<div style="display: flex; justify-content: space-between; '
                    'font-weight: bold; margin-bottom: 4px; margin-top: 8px;">'
                )
                html_parts.append(f'  <span>{school}</span>')
                if time_str:
                    html_parts.append(f'  <span>{time_str}</span>')
                html_parts.append('</div>')
            
            # 专业和学位
            details = []
            if major:
                details.append(major)
            if degree:
                details.append(degree)
            if gpa:
                details.append(f'GPA: {gpa}')
            
            if details:
                html_parts.append(
                    f'<div style="margin-bottom: 4px;">{" · ".join(details)}</div>'
                )
            
            # 其他说明
            if description:
                html_parts.append(
                    f'<div style="margin-left: 20px; margin-bottom: 4px; '
                    f'color: #666;">{description}</div>'
                )
            
            # 荣誉
            honors = edu.get('honors', [])
            if honors and isinstance(honors, list):
                for honor in honors:
                    html_parts.append(
                        f'<div style="margin-left: 20px; margin-bottom: 2px;">'
                        f'• {honor}</div>'
                    )
        
        return '\n    '.join(html_parts) if html_parts else '<div>暂无教育信息</div>'
    
    @staticmethod
    def _format_projects(projects_list: List[Dict[str, Any]]) -> str:
        """格式化项目经历"""
        if not projects_list:
            return '<div style="margin-left: 20px; color: #999;">暂无项目经历</div>'
        
        html_parts = []
        
        for project in projects_list:
            if not isinstance(project, dict):
                continue
            
            name = project.get('name', '')
            role = project.get('role', '')
            start_time = project.get('start_time', '')
            end_time = project.get('end_time', '')
            description = project.get('description', '')
            responsibilities = project.get('responsibilities', [])
            achievements = project.get('achievements', [])
            technologies = project.get('technologies', [])
            
            # 时间段
            time_str = ''
            if start_time and end_time:
                time_str = f'{start_time} - {end_time}'
            elif start_time:
                time_str = start_time
            
            # 项目名称和时间（加粗）
            if name:
                html_parts.append(
                    '<div style="display: flex; justify-content: space-between; '
                    'font-weight: bold; margin-bottom: 4px; margin-top: 12px;">'
                )
                title = f'{name}'
                if role:
                    title += f' · {role}'
                html_parts.append(f'  <span>{title}</span>')
                if time_str:
                    html_parts.append(f'  <span style="font-weight: normal;">{time_str}</span>')
                html_parts.append('</div>')
            
            # 项目描述
            if description:
                html_parts.append(
                    f'<div style="margin-bottom: 4px;">{description}</div>'
                )
            
            # 职责
            if responsibilities and isinstance(responsibilities, list):
                for resp in responsibilities:
                    html_parts.append(
                        f'<div style="margin-left: 20px; margin-bottom: 2px;">• {resp}</div>'
                    )
            
            # 成果
            if achievements and isinstance(achievements, list):
                for achievement in achievements:
                    html_parts.append(
                        f'<div style="margin-left: 20px; margin-bottom: 2px; '
                        f'color: #663399;">✓ {achievement}</div>'
                    )
            
            # 技术栈
            if technologies and isinstance(technologies, list):
                tech_str = '、'.join(technologies)
                html_parts.append(
                    f'<div style="margin-left: 20px; margin-bottom: 4px; '
                    f'font-style: italic; color: #666;">'
                    f'技术栈: {tech_str}</div>'
                )
        
        return '\n    '.join(html_parts) if html_parts else '<div>暂无项目经历</div>'
    
    @staticmethod
    def _format_research(
        work_experience: List[Dict[str, Any]],
        projects: List[Dict[str, Any]]
    ) -> str:
        """格式化科研经历（从工作经历和项目中提取）"""
        html_parts = []
        
        # 从工作经历中找科研相关
        for work in work_experience:
            if not isinstance(work, dict):
                continue
            
            position = work.get('position', '')
            company = work.get('company', '')
            
            # 检查是否是科研相关
            research_keywords = ['研究', '科研', 'Research', '实验室', 'Lab']
            is_research = any(keyword in position or keyword in company 
                            for keyword in research_keywords)
            
            if is_research:
                html_parts.append(
                    EnhancedTemplateFiller._format_single_work_item(work)
                )
        
        # 从项目中找科研项目
        for project in projects:
            if not isinstance(project, dict):
                continue
            
            name = project.get('name', '')
            description = project.get('description', '')
            
            research_keywords = ['研究', '论文', '学术', 'Paper', 'Research']
            is_research = any(keyword in name or keyword in description 
                            for keyword in research_keywords)
            
            if is_research:
                # 格式化为科研条目
                name = project.get('name', '')
                role = project.get('role', '')
                time_str = ''
                if project.get('start_time') and project.get('end_time'):
                    time_str = f"{project['start_time']} - {project['end_time']}"
                
                if name:
                    html_parts.append(
                        '<div style="display: flex; justify-content: space-between; '
                        'font-weight: bold; margin-bottom: 4px; margin-top: 12px;">'
                    )
                    title = name
                    if role:
                        title += f' · {role}'
                    html_parts.append(f'  <span>{title}</span>')
                    if time_str:
                        html_parts.append(f'  <span style="font-weight: normal;">{time_str}</span>')
                    html_parts.append('</div>')
                
                if description:
                    html_parts.append(f'<div style="margin-bottom: 4px;">{description}</div>')
                
                achievements = project.get('achievements', [])
                if achievements:
                    for ach in achievements:
                        html_parts.append(
                            f'<div style="margin-left: 20px; margin-bottom: 2px;">• {ach}</div>'
                        )
        
        if not html_parts:
            return '<div style="margin-left: 20px; color: #999;">暂无科研经历</div>'
        
        return '\n    '.join(html_parts)
    
    @staticmethod
    def _format_work_experience(work_list: List[Dict[str, Any]]) -> str:
        """格式化工作/实习经历"""
        if not work_list:
            return '<div style="margin-left: 20px; color: #999;">暂无实习经历</div>'
        
        html_parts = []
        
        for work in work_list:
            if not isinstance(work, dict):
                continue
            
            # 过滤掉科研相关（已在科研经历中显示）
            position = work.get('position', '')
            company = work.get('company', '')
            research_keywords = ['研究', '科研', 'Research', '实验室', 'Lab']
            is_research = any(keyword in position or keyword in company 
                            for keyword in research_keywords)
            
            if not is_research:
                html_parts.append(
                    EnhancedTemplateFiller._format_single_work_item(work)
                )
        
        if not html_parts:
            return '<div style="margin-left: 20px; color: #999;">暂无实习经历</div>'
        
        return '\n    '.join(html_parts)
    
    @staticmethod
    def _format_single_work_item(work: Dict[str, Any]) -> str:
        """格式化单个工作项"""
        parts = []
        
        company = work.get('company', '')
        position = work.get('position', '')
        start_time = work.get('start_time', '')
        end_time = work.get('end_time', '')
        location = work.get('location', '')
        description = work.get('description', [])
        achievements = work.get('achievements', [])
        technologies = work.get('technologies', [])
        
        # 时间段
        time_str = ''
        if start_time and end_time:
            time_str = f'{start_time} - {end_time}'
        elif start_time:
            time_str = start_time
        
        # 公司和时间（加粗）
        if company:
            parts.append(
                '<div style="display: flex; justify-content: space-between; '
                'font-weight: bold; margin-bottom: 4px; margin-top: 12px;">'
            )
            parts.append(f'  <span>{company}</span>')
            if time_str:
                parts.append(f'  <span style="font-weight: normal;">{time_str}</span>')
            parts.append('</div>')
        
        # 职位和地点
        position_line = []
        if position:
            position_line.append(position)
        if location:
            position_line.append(location)
        if position_line:
            parts.append(
                f'<div style="margin-bottom: 4px;">{" · ".join(position_line)}</div>'
            )
        
        # 工作描述
        if description:
            if isinstance(description, list):
                for desc in description:
                    parts.append(
                        f'<div style="margin-left: 20px; margin-bottom: 2px;">• {desc}</div>'
                    )
            elif isinstance(description, str):
                parts.append(
                    f'<div style="margin-left: 20px; margin-bottom: 4px;">{description}</div>'
                )
        
        # 成果
        if achievements and isinstance(achievements, list):
            for achievement in achievements:
                parts.append(
                    f'<div style="margin-left: 20px; margin-bottom: 2px; '
                    f'color: #663399;">✓ {achievement}</div>'
                )
        
        # 技术栈
        if technologies and isinstance(technologies, list):
            tech_str = '、'.join(technologies)
            parts.append(
                f'<div style="margin-left: 20px; margin-bottom: 4px; '
                f'font-style: italic; color: #666;">'
                f'技术栈: {tech_str}</div>'
            )
        
        return '\n    '.join(parts)
    
    @staticmethod
    def _format_comprehensive(
        skills: Dict[str, Any],
        awards: List[Dict[str, Any]]
    ) -> str:
        """格式化综合素养（技能+奖项）"""
        html_parts = []
        
        # 技能部分
        if skills:
            skill_categories = {
                'programming_languages': '编程语言',
                'frameworks': '框架',
                'tools': '工具',
                'other': '其他技能'
            }
            
            for key, label in skill_categories.items():
                skill_list = skills.get(key, [])
                if skill_list and isinstance(skill_list, list):
                    skill_str = '、'.join(skill_list)
                    html_parts.append(
                        f'<div style="margin-bottom: 4px;">'
                        f'<strong>{label}:</strong> {skill_str}'
                        f'</div>'
                    )
        
        # 奖项部分
        if awards:
            html_parts.append(
                '<div style="margin-top: 12px; font-weight: bold; margin-bottom: 4px;">'
                '荣誉奖项</div>'
            )
            
            for award in awards:
                if not isinstance(award, dict):
                    continue
                
                name = award.get('name', '')
                time = award.get('time', '')
                level = award.get('level', '')
                description = award.get('description', '')
                
                award_line = []
                if time:
                    award_line.append(time)
                if name:
                    award_line.append(name)
                if level:
                    award_line.append(f'({level})')
                
                if award_line:
                    html_parts.append(
                        f'<div style="margin-left: 20px; margin-bottom: 2px;">'
                        f'• {" ".join(award_line)}</div>'
                    )
                
                if description:
                    html_parts.append(
                        f'<div style="margin-left: 40px; margin-bottom: 4px; '
                        f'color: #666; font-size: 11px;">{description}</div>'
                    )
        
        if not html_parts:
            return '<div style="margin-left: 20px; color: #999;">暂无相关信息</div>'
        
        return '\n    '.join(html_parts)


def fill_template_with_structured_data(
    template: str,
    structured_sections: Dict[str, Any],
    contacts: Dict[str, Optional[str]],
    photo_url: Optional[str] = None
) -> str:
    """
    便捷函数：使用结构化数据填充模板
    """
    return EnhancedTemplateFiller.fill_template_with_structured_data(
        template, structured_sections, contacts, photo_url
    )

