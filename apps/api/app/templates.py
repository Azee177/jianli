from __future__ import annotations

from .schemas import ResumeTemplate

TSINGHUA_TEMPLATE = """
<!-- 组件1：左上角校徽区 -->
<div style="position: absolute; left: 30px; top: 20px; width: 60px; height: 60px;">
  <img src="https://dummyimage.com/60x60/663399/fff&text=清华" alt="清华大学校徽" style="width: 100%; height: 100%; object-fit: contain;" />
</div>

<!-- 组件2：右上角照片区 -->
<div style="position: absolute; right: 30px; top: 20px; width: 102px; height: 136px; border: 1px solid #000;">
  <img src="{{photo_url}}" alt="证件照" style="width: 100%; height: 100%; object-fit: cover;" />
</div>

<!-- 顶部个人信息区域 -->
<div style="margin-left: 100px; margin-right: 150px; margin-top: 25px; font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;">
  <!-- 姓名居中 -->
  <div style="text-align: center; margin-bottom: 8px;">
    <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 4px;">{{name}}</h1>
  </div>
  
  <!-- 联系方式居中 -->
  <div style="text-align: center; font-size: 12px; margin-bottom: 12px;">
    <div style="margin-bottom: 2px;">📞：{{phone}}</div>
    <div>邮箱：{{email}}</div>
  </div>
</div>

<!-- 组件3：分割线 -->
<hr style="margin: 15px 0; border: 0; height: 1px; background: #000;" />


<!-- 教育背景 -->
<section style="margin-bottom: 15px; font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;">
  <h2 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #663399;">教育背景</h2>
  <div style="height: 1px; background: #663399; margin-bottom: 8px;"></div>
  
  <div style="font-size: 12px; line-height: 1.6;">
    {{education_content}}
  </div>
</section>


<!-- 项目经历 -->
<section style="margin-bottom: 15px; font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;">
  <h2 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #663399;">项目经历</h2>
  <div style="height: 1px; background: #663399; margin-bottom: 8px;"></div>
  
  <div style="font-size: 12px;">
    {{project_content}}
  </div>
</section>


<!-- 科研经历 -->
<section style="margin-bottom: 15px; font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;">
  <h2 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #663399;">科研经历</h2>
  <div style="height: 1px; background: #663399; margin-bottom: 8px;"></div>
  
  <div style="font-size: 12px;">
    {{research_content}}
  </div>
</section>


<!-- 实习经历 -->
<section style="margin-bottom: 15px; font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;">
  <h2 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #663399;">实习经历</h2>
  <div style="height: 1px; background: #663399; margin-bottom: 8px;"></div>
  
  <div style="font-size: 12px;">
    {{internship_content}}
  </div>
</section>


<!-- 综合素养 -->
<section style="margin-bottom: 15px; font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;">
  <h2 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #663399;">综合素养</h2>
  <div style="height: 1px; background: #663399; margin-bottom: 8px;"></div>
  
  <div style="font-size: 12px;">
    {{comprehensive_content}}
  </div>
</section>
"""

EN_TEMPLATE = """\
# Contact
- Name:
- Email:
- Phone:
- Links (GitHub / Portfolio):

## Professional Summary
- Summarise your unique impact in 2-3 bullet points.

## Experience
- Company / Role / Period
  - Achievement: quantify impact with metrics.

## Projects
- Project / Role / Period
  - Context -> Action -> Result.

## Education
- School / Degree / Period / GPA

## Skills
- Programming Languages:
- Frameworks / Tools:
- Languages / Certifications:
"""

# 导出默认HTML模板供渲染使用
RESUME_TEMPLATE_HTML = TSINGHUA_TEMPLATE


def load_templates() -> list[ResumeTemplate]:
  return [
    ResumeTemplate(
      id="modern-cn",
      name="现代中文 · 紫调模板",
      locale="zh-CN",
      description="参考清华紫配色的一页式现代中文简历版式。",
      defaultTitle="个人简历",
      markdown=TSINGHUA_TEMPLATE.strip(),
    ),
    ResumeTemplate(
      id="simple-en",
      name="Simple English Template",
      locale="en-US",
      description="A concise English resume scaffold for overseas applications.",
      defaultTitle="Resume",
      markdown=EN_TEMPLATE.strip(),
    ),
  ]

