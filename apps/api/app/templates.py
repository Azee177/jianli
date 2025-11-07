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

    <section style="margin-top: 32px;">
      <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 14px;">
        <h2 style="font-size: 18px; margin: 0; color: #5c2aa3;">项目经历</h2>
        <span style="font-size: 12px; color: #8375b8;">Projects</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 18px;">
        <div style="border: 1px solid #e3d8ff; border-radius: 14px; padding: 18px 22px;">
          <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 600; color: #3c2a6e;">
            <span>自主执行任务的 Mobile phone Agent（Agent · 多模态）</span>
            <span>2025.2 - 2025.4</span>
          </div>
          <div style="margin-top: 8px; font-size: 13px; color: #4a3b7d;">
            负责多模态 Agent 系统的整体方案设计与工程实现，构建「语音 + 视觉 + 动作」闭环，支持用户通过手机自然对话完成任务调度。
          </div>
          <div style="margin-top: 6px; font-size: 12.5px; color: #775ebe;">工具栈：Python · cv2 · YOLO · adb · 多模态检索推理链 · LlamaFactory</div>
          <ul style="margin: 12px 0 0 18px; padding: 0; font-size: 13px; color: #463979;">
            <li>对接 OmniParser、Even-Map 等 5 种多模态接口，构建任务分解与流程管控模块，闭环成功率由 56% 提升至 <strong>85%</strong>。</li>
            <li>自研任务优先级调度 + 错误恢复机制，使多任务并发效率提升 <strong>38%</strong>，终端响应时间缩短 <strong>27%</strong>。</li>
          </ul>
        </div>
        <div style="border: 1px solid #e3d8ff; border-radius: 14px; padding: 18px 22px;">
          <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 600; color: #3c2a6e;">
            <span>Prompt 协同优化演示工具（Prompt 迭代、微调、Agent 协作）</span>
            <span>2024.9 - 2024.10</span>
          </div>
          <div style="margin-top: 8px; font-size: 13px; color: #4a3b7d;">
            搭建 Prompt 迭代与团队协作平台，支持多角色协作与一键复盘，显著提升大模型交互的可解释性与稳定性。
          </div>
          <div style="margin-top: 6px; font-size: 12.5px; color: #775ebe;">工具栈：AutoDL · Ubuntu22.04 · Python3.10 · LangChain · Ollama · LlamaFactory · Streamlit</div>
          <ul style="margin: 12px 0 0 18px; padding: 0; font-size: 13px; color: #463979;">
            <li>将 Prompt 策略沉淀为模板市场，月活创作数增长 <strong>2.6 倍</strong>，关键转化率提升 <strong>38%</strong>。</li>
            <li>实现任务链路可视化与高频错误提示，大幅降低新手操作门槛；引入协同评分与经验复盘机制。</li>
          </ul>
        </div>
        <div style="border: 1px solid #e3d8ff; border-radius: 14px; padding: 18px 22px;">
          <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 600; color: #3c2a6e;">
            <span>智能助手（AI 应用 · MCP）</span>
            <span>2025.1 - 2025.2</span>
          </div>
          <div style="margin-top: 8px; font-size: 13px; color: #4a3b7d;">
            负责前后端一体化架构设计，实现知识查询、任务拆解、自动总结与多模态记忆管理，帮助业务同学快速复用最佳实践。
          </div>
          <div style="margin-top: 6px; font-size: 12.5px; color: #775ebe;">工具栈：Python · Vue3 · Electron · TailwindCSS · Vite · Axios</div>
          <ul style="margin: 12px 0 0 18px; padding: 0; font-size: 13px; color: #463979;">
            <li>上线首周人均使用时长 6.8h，主动推荐推送准确率 72%；支持自定义知识图谱与多模态速览。</li>
            <li>构建 LLM 能力评测体系与任务回放功能，使多场景调试效率提升 <strong>45%</strong>。</li>
          </ul>
        </div>
      </div>
    </section>

    <section style="margin-top: 32px;">
      <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 14px;">
        <h2 style="font-size: 18px; margin: 0; color: #5c2aa3;">科研经历</h2>
        <span style="font-size: 12px; color: #8375b8;">Research</span>
      </div>
      <div style="border: 1px solid #e3d8ff; border-radius: 14px; padding: 18px 22px; font-size: 13px; color: #463979;">
        <div style="display: flex; justify-content: space-between; font-weight: 600; color: #3c2a6e;">
          <span>气动夹持器：基于可控折痕的模块化体积变形（软件机器人）</span>
          <span>2023.8 - 2024.6</span>
        </div>
        <ul style="margin: 10px 0 0 18px; padding: 0;">
          <li>提出折痕可调 + 多腔体耦合设计，夹持成功率提升 <strong>30%</strong>，成果录用 ICRA 2024。</li>
          <li>搭建有限元仿真 + 实体迭代 5 轮验证体系，获得国家级创新创业大赛一等奖。</li>
        </ul>
      </div>
    </section>

    <section style="margin-top: 32px;">
      <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 14px;">
        <h2 style="font-size: 18px; margin: 0; color: #5c2aa3;">实习经历</h2>
        <span style="font-size: 12px; color: #8375b8;">Internship</span>
      </div>
      <div style="border: 1px solid #e3d8ff; border-radius: 14px; padding: 18px 22px; font-size: 13px; color: #463979;">
        <div style="display: flex; justify-content: space-between; font-weight: 600; color: #3c2a6e;">
          <span>清华大学 AI 智能产业研究院 · 算法研发实习生</span>
          <span>2024.7 - 2024.11</span>
        </div>
        <ul style="margin: 10px 0 0 18px; padding: 0;">
          <li>负责工业质检大模型部署与推理优化，单张处理时长缩短 <strong>65%</strong>，上线 4 个行业示范项目。</li>
          <li>建立视觉质检标注与评测闭环，形成模型迭代 SOP，推动模型更新周期从月级降至周级。</li>
        </ul>
      </div>
    </section>

    <section style="margin-top: 32px;">
      <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 14px;">
        <h2 style="font-size: 18px; margin: 0; color: #5c2aa3;">综合素质</h2>
        <span style="font-size: 12px; color: #8375b8;">Honors & Skills</span>
      </div>
      <div style="background: #f9f6ff; border: 1px solid #e3d8ff; border-radius: 14px; padding: 18px 22px; font-size: 13px; color: #463979;">
        <ul style="margin: 0 0 0 18px; padding: 0;">
          <li>学生工作：院学生会执行主席，发起“AI+创新节”系列活动，覆盖 500+ 名师生。</li>
          <li>学术竞赛：华为软件精英挑战赛全国二等奖、百度数据竞赛三等奖、互联网+ 创新创业省赛银奖。</li>
          <li>个人特长：善于跨团队沟通与技术讲解，具备摄影、攀岩、AIGC 绘画等兴趣，追踪前沿多模态技术。</li>
        </ul>
      </div>
    </section>
  </div>
</div>
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

