# -*- coding: utf-8 -*-
from pathlib import Path
text = """
<div style="max-width: 794px; margin: 0 auto; background: #ffffff; border: 1px solid #d7cff9; box-shadow: 0 20px 60px rgba(102, 77, 223, 0.12); border-radius: 16px; padding: 40px 48px; font-family: 'Microsoft YaHei', 'PingFang SC', Arial, sans-serif; color: #31265c; line-height: 1.75;">
  <div style="display: flex; gap: 32px; border-bottom: 3px solid #b7a3ff; padding-bottom: 20px; margin-bottom: 26px;">
    <div style="flex: 1;">
      <h1 style="font-size: 32px; margin: 0; letter-spacing: 2px; color: #4f2ac8;">姓 名</h1>
      <div style="margin-top: 6px; font-size: 15px; color: #6a58d3;">目标岗位：产品经理 / 数据产品</div>
      <div style="margin-top: 18px; font-size: 13px; color: #4b3a7c; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 24px;">
        <div>毕业院校：XXXX大学</div>
        <div>专业：信息工程</div>
        <div>邮箱：example@email.com</div>
        <div>电话：138-0000-0000</div>
        <div>GPA：3.9 / 4.0</div>
        <div>排名：前 3%</div>
      </div>
    </div>
    <div style="width: 150px; text-align: right;">
      <div style="width: 140px; height: 180px; border: 4px solid #cdbdff; border-radius: 12px; background: url('https://dummyimage.com/140x180/dcd3ff/4f2ac8&text=Photo') center/cover no-repeat;"></div>
      <div style="margin-top: 12px; font-size: 12px; color: #7565cf;">求职意向 · 投递 2025</div>
    </div>
  </div>

  <section style="margin-bottom: 24px;">
    <h2 style="font-size: 18px; margin: 0 0 12px; color: #4f2ac8; border-left: 6px solid #b7a3ff; padding-left: 12px;">教育背景</h2>
    <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 600; color: #2f235a;">
      <span>XXXX大学 · 测控技术与仪器</span>
      <span>本科（2018.9-2022.6）</span>
    </div>
    <ul style="margin: 12px 0 0; padding-left: 18px; font-size: 13px; color: #43367a;">
      <li>核心课程：信号处理、视觉计算、智能控制、数据分析</li>
      <li>荣誉奖项：国家奖学金（2x）、挑战杯国赛二等奖、MathorCup 商业数据挑战一等奖</li>
    </ul>
  </section>

  <section style="margin-bottom: 24px;">
    <h2 style="font-size: 18px; margin: 0 0 12px; color: #4f2ac8; border-left: 6px solid #b7a3ff; padding-left: 12px;">专业技能</h2>
    <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 28px; font-size: 13px; color: #43367a;">
      <div><strong>编程：</strong>Python、C++、SQL、TypeScript</div>
      <div><strong>模型：</strong>LLM 调优、图像识别、推荐系统</div>
      <div><strong>工具：</strong>PyTorch、LangChain、Airflow、Tableau、Figma</div>
      <div><strong>语言：</strong>英语六级（600）、托业 900</div>
    </div>
  </section>

  <section style="margin-bottom: 24px;">
    <h2 style="font-size: 18px; margin: 0 0 12px; color: #4f2ac8; border-left: 6px solid #b7a3ff; padding-left: 12px;">项目经历</h2>
    <div style="margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 600; color: #2f235a;">
        <span>自主执行任务的多模态 Mobile Agent</span>
        <span>2025.2 - 2025.4</span>
      </div>
      <div style="margin: 6px 0; font-size: 13px; color: #43367a;">
        设计「语音+视觉+动作」多模态闭环，Agent 成功率由 56% 提升至 <strong>85%</strong>；搭建任务拆解与执行调度中台，平均处理时长缩短 <strong>43%</strong>。
      </div>
      <div style="font-size: 12.5px; color: #5b4d94;"><strong>技术栈：</strong>Python · LangChain · OpenAI · TTS/STT · FastAPI</div>
    </div>
    <div style="margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 600; color: #2f235a;">
        <span>Prompt 协同优化平台</span>
        <span>2024.9 - 2024.10</span>
      </div>
      <div style="margin: 6px 0; font-size: 13px; color: #43367a;">
        构建“多角色协作 + 反馈回路”工作流，使关键转化率提升 <strong>38%</strong>；上线提示工程模板市场，月活创作数增长 <strong>2.6x</strong>。
      </div>
      <div style="font-size: 12.5px; color: #5b4d94;"><strong>技术栈：</strong>React · Next.js · Supabase · OpenAI Function · TailwindCSS</div>
    </div>
    <div>
      <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 600; color: #2f235a;">
        <span>智能助手（AI 应用 · MCP）</span>
        <span>2025.1 - 2025.2</span>
      </div>
      <div style="margin: 6px 0; font-size: 13px; color: #43367a;">
        负责前后端整体架构，构建多模态笔记压缩与复习策略生成模块；上线首周活跃度达 6.8h/人，主动推荐覆盖率 72%。
      </div>
      <div style="font-size: 12.5px; color: #5b4d94;"><strong>技术栈：</strong>Vue · TailwindCSS · Flask · Neo4j · PaddleOCR</div>
    </div>
  </section>

  <section style="margin-bottom: 24px;">
    <h2 style="font-size: 18px; margin: 0 0 12px; color: #4f2ac8; border-left: 6px solid #b7a3ff; padding-left: 12px;">科研经历</h2>
    <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 600; color: #2f235a;">
      <span>气动夹持器：可控折痕模块优化（软体机器人）</span>
      <span>2023.8 - 2024.6</span>
    </div>
    <ul style="margin: 10px 0 0; padding-left: 18px; font-size: 13px; color: #43367a;">
      <li>提出“折痕可调 + 多腔体耦合”设计，使抓取成功率提升 <strong>30%</strong>；核心成果发表于 ICRA 2024。</li>
      <li>完成有限元仿真与实体迭代 5 轮，获得 <strong>国家级创新创业大赛一等奖</strong>。</li>
    </ul>
  </section>

  <section style="margin-bottom: 24px;">
    <h2 style="font-size: 18px; margin: 0 0 12px; color: #4f2ac8; border-left: 6px solid #b7a3ff; padding-left: 12px;">实习 / 工作经历</h2>
    <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 600; color: #2f235a;">
      <span>清华大学 AI 智能产业研究院 · 算法研发实习生</span>
      <span>2024.7 - 2024.11</span>
    </div>
    <ul style="margin: 10px 0 0; padding-left: 18px; font-size: 13px; color: #43367a;">
      <li>负责工业质检大模型部署，构建轻量推理流水线，单张处理时长缩短 <strong>65%</strong>。</li>
      <li>协同产品、运营完成 4 套行业 Demo（消费电子、能源、制造、金融）落地。</li>
    </ul>
  </section>

  <section>
    <h2 style="font-size: 18px; margin: 0 0 12px; color: #4f2ac8; border-left: 6px solid #b7a3ff; padding-left: 12px;">综合素质</h2>
    <ul style="margin: 10px 0 0; padding-left: 18px; font-size: 13px; color: #43367a;">
      <li>学生工作：曾任院学生会执行主席，发起“AI+创新节”影响 500+ 学生。</li>
      <li>竞赛获奖：华为软件精英挑战赛全国二等奖、百度数据竞赛三等奖。</li>
      <li>兴趣爱好：攀岩、摄影、AIGC 绘画。</li>
    </ul>
  </section>
</div>
"""

print(text.encode('unicode_escape').decode('ascii'))
