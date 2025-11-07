import { ResumeData } from '@/types/resume';

export type PanelKey =
  | 'upload'
  | 'intent'
  | 'jd'
  | 'company'
  | 'prep'
  | 'interview'
  | 'export'
  | 'draft';

export const DEFAULT_RESUME_CONTENT = `
<!-- 组件1：左上角校徽区 -->
<div style="position: absolute; left: 30px; top: 20px; width: 60px; height: 60px;">
  <img src="https://dummyimage.com/60x60/663399/fff&text=清华" alt="清华大学校徽" style="width: 100%; height: 100%; object-fit: contain;" />
</div>

<!-- 组件2：右上角照片区 -->
<div style="position: absolute; right: 30px; top: 20px; width: 102px; height: 136px; border: 1px solid #000;">
  <img src="https://dummyimage.com/102x136/f0f0f0/666&text=照片" alt="证件照" style="width: 100%; height: 100%; object-fit: cover;" />
</div>

<!-- 顶部个人信息区域 -->
<div style="margin-left: 100px; margin-right: 150px; margin-top: 25px; font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;">
  <!-- 姓名居中 -->
  <div style="text-align: center; margin-bottom: 8px;">
    <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 4px;">叶美如</h1>
  </div>
  
  <!-- 联系方式居中 -->
  <div style="text-align: center; font-size: 12px; margin-bottom: 12px;">
    <div style="margin-bottom: 2px;">📞：19825000780</div>
    <div>邮箱：yemr22@mails.tsinghua.edu.cn</div>
  </div>
</div>

<!-- 组件3：分割线 -->
<hr style="margin: 15px 0; border: 0; height: 1px; background: #000;" />

<!-- 教育背景 -->
<section style="margin-bottom: 15px; font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;">
  <h2 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #663399;">教育背景</h2>
  <div style="height: 1px; background: #663399; margin-bottom: 8px;"></div>
  
  <div style="font-size: 12px; line-height: 1.6;">
      <div style="margin-bottom: 4px;">
        <span style="font-weight: bold;">南京理工大学</span>
        <span style="margin-left: 200px;">测控技术与仪器</span>
        <span style="margin-left: 80px; font-weight: bold;">本科 (2018.9-2022.6)</span>
      </div>
      <div style="margin-bottom: 4px; margin-left: 20px;">
        <span style="font-weight: bold;">专业排名：1</span>
        <span style="margin-left: 180px;">前0.6%</span>
        <span style="margin-left: 80px;">学院排名：3/521</span>
      </div>
      <div style="margin-bottom: 4px;">
        <span style="font-weight: bold;">清华大学</span>
        <span style="margin-left: 210px;">智能制造</span>
        <span style="margin-left: 90px; font-weight: bold;">硕士 (2022.9-2025.6)</span>
      </div>
      <div style="margin-left: 20px; margin-bottom: 4px;">
        <span>GPA: 3.99/4.0</span>
        <span style="margin-left: 160px;">管理制造</span>
        <span style="margin-left: 80px;">排名：33/1215</span>
      </div>
      
      <div style="margin-top: 8px;">
        <span style="font-weight: bold;">在校期间获奖2018-2019年度国家奖学金；2019-2020年度国家奖学金；古丰特等奖学金等；</span>
      </div>
      <div style="margin-top: 4px;">
        <span style="font-weight: bold;">数学相关：</span>全国大学生数学竞赛一等奖（国家级）；江苏省数学竞赛一等奖（省级）；MathorCup高校数学建模挑战赛一等奖（国家级）；
      </div>
      <div style="margin-top: 4px;">
        高等数学（100）；工程数学（99）；概率与统计（99）；线性代数（97）
      </div>
      <div style="margin-top: 4px;">
        <span style="font-weight: bold;">编程相关：</span>人工智能；数学建模；机器人学；VisualC++；数据库原理；体系与系统；智能制造；现代控制理论
      </div>
      <div style="margin-top: 4px;">
        熟练 python、C++、机器学习、深度学习以及强化学习
      </div>
      <div style="margin-top: 4px;">
        熟练掌握深度学习框架 pytorch；熟练Linux开发环境，掌握Git版本、Docker、Conda虚拟环境搭建等
      </div>
      <div style="margin-top: 4px;">
        熟练掌握 RAG、Agent 技术及 LLaMA-Factory、XTuner 微调框架；
      </div>
      <div style="margin-top: 4px;">
        熟练掌握 vim、lmdeploy 部署以及 OpenCompass 评测技术；
      </div>
      <div style="margin-top: 4px;">
        熟练 RoPE、MHA/MQA/GQA/DCA/MLA/KVC、RMSNorm、FNN/MoE、LoRA、DPO、PPO、GPPO
      </div>
    </div>
  </div>
</section>

<!-- 项目经历 -->
<section style="margin-bottom: 15px; font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;">
  <h2 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #663399;">项目经历</h2>
  <div style="height: 1px; background: #663399; margin-bottom: 8px;"></div>
  
  <div style="font-size: 12px;">
      <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 4px;">
        <span>自主执行任务的Mobile phone Agent（Agent、多模态）</span>
        <span>2025.2-2025.4</span>
      </div>
      <div style="margin-bottom: 4px;">
        <span style="font-weight: bold;">目标：</span>以自然语言操控手机完成任务，减少用户手动操作，提高效率
      </div>
      <div style="margin-bottom: 8px; margin-left: 20px;">
        项目背景：利用 OmniParser-v2.0、qwen-max 等多模块联动实现自主执行系统，包含任务分解、进度追踪与状态管理等，且具有
        任务分解的功能，这些进度追踪和状态管理功能，对于 892 条数据集训练 Florence-2-base 模型，构建 892 条数据集，用于训练 icon 含义的理解，
        收集 398 条样本进行 LoRA 微调实验，验证了 LLMs 在任务执行上的效果，对于 streamlit 的上线交互
      </div>
      <div style="margin-bottom: 4px;">
        <span style="font-weight: bold;">工具：</span>python、cv2、yolo、adb、多模态监督微调、llama factory
      </div>
      
      <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 4px; margin-top: 12px;">
        <span>双层结构化自动化提示词工具（Prompt、微调、Agent协作）</span>
        <span>2024.9-2024.10</span>
      </div>
      <div style="margin-bottom: 4px;">
        <span style="font-weight: bold;">目标：</span>自动化提示词生成与优化
      </div>
      <div style="margin-bottom: 8px; margin-left: 20px;">
        项目背景：开发了基于双层结构的提示词工程，对于结构化的提示词，收集了 398 条样本进行 LoRA 微调实验，对于 LLMs 在任务执行上的效果优于仅用结构化提示词，对于 streamlit 的上线交互，
        基于文档提取的问答，设计并开发了基于文档×人工智能体的一套智能体协作的自动化提示词工程，在 streamlit 的上线交互
      </div>
      <div style="margin-bottom: 4px;">
        <span style="font-weight: bold;">工具：</span>AutoDL、ubuntu22.04、python3.10、langchain、ollama、LLaMA-Factory、streamlit
      </div>
      
      <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 4px; margin-top: 12px;">
        <span>智能微信助手（AI应用、MCP）</span>
        <span>2025.1-2025.2</span>
      </div>
      <div style="margin-bottom: 4px;">
        <span style="font-weight: bold;">目标：</span>开发一款智能微信助手，利用LLMs本来未来微信聊天效果，提高聊天效率
      </div>
      <div style="margin-bottom: 8px; margin-left: 20px;">
        项目背景：开发基于微信的智能助手，实现聊天效果的智能化，消息自动回复及聊天记录的智能分析，用户可以通过自然语言进行
        聊天交互，收集微信聊天记录进行智能分析，收集微信聊天记录进行智能分析，收集微信聊天记录进行智能分析，用户可以通过自然语言进行
        聊天交互，收集微信聊天记录进行智能分析
      </div>
      <div style="margin-bottom: 4px;">
        <span style="font-weight: bold;">工具：</span>Python、微信开发者工具、Vue.js、Electron、TailwindCSS、Vite、Axios
      </div>
  </div>
</section>

<!-- 科研经历 -->
<section style="margin-bottom: 15px; font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;">
  <h2 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #663399;">科研经历</h2>
  <div style="height: 1px; background: #663399; margin-bottom: 8px;"></div>
  
  <div style="font-size: 12px;">
      <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 4px;">
        <span>气动关节：基于可控折痕的模块化执行器（软体机器人）</span>
        <span>2023.8-2024.6</span>
      </div>
      <div style="margin-bottom: 4px;">
        <span style="font-weight: bold;">项目背景：</span>自然软体机器人的折痕可调整性研究，导师指导下进行的研究项目，因此提出了一种"万能
        折痕"方案来实现软体机器人的可调整性
      </div>
      <div style="margin-bottom: 8px; margin-left: 20px;">
        <span style="font-weight: bold;">主要内容：</span>从折痕可调整性的角度，探索了折痕可调整性对软体机器人性能的影响，依据手工制作的软体机器人，对于 892 条数据集训练 Florence-2-base 模型，构建 892 条数据集，用于训练 icon 含义的理解，
        收集 398 条样本进行 LoRA 微调实验，验证了 LLMs 在任务执行上的效果，对于 streamlit 的上线交互，基于文档提取的问答，设计并开发了基于文档×人工智能体的一套智能体协作的自动化提示词工程，在 streamlit 的上线交互
      </div>
      <div style="margin-bottom: 4px;">
        <span style="font-weight: bold;">成果：</span>
      </div>
      <div style="margin-left: 20px;">
        期刊一作：Soft Robotics在投（IF：8，预计影响因子）；白皮书影响因子：High Load-to-Weight Ratio and Large-Deformation pneumatic
        Actuator；车辆一作：202311702185.6
      </div>
  </div>
</section>

<!-- 实习经历 -->
<section style="margin-bottom: 15px; font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;">
  <h2 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #663399;">实习经历</h2>
  <div style="height: 1px; background: #663399; margin-bottom: 8px;"></div>
  
  <div style="font-size: 12px;">
      <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 4px;">
        <span>清华大学AIR智能产业研究院</span>
        <span>2024.7-2024.11</span>
      </div>
      <div style="margin-bottom: 4px;">
        <span style="font-weight: bold;">职位：</span>探索LMM能力边界与落地场景
      </div>
      <div style="margin-left: 20px;">
        <span style="font-weight: bold;">工作内容：</span>探索LMM能力边界与落地场景；上线多项示范应用
      </div>
  </div>
</section>

<!-- 综合素养 -->
<section style="margin-bottom: 15px; font-family: 'Microsoft YaHei', '微软雅黑', sans-serif;">
  <h2 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #663399;">综合素养</h2>
  <div style="height: 1px; background: #663399; margin-bottom: 8px;"></div>
  
  <div style="font-size: 12px;">
      <div style="margin-bottom: 4px;">
        <span style="font-weight: bold;">编程技能：</span>C++、C、python、MATLAB
      </div>
      <div style="margin-bottom: 4px;">
        <span style="font-weight: bold;">外语水平：</span>CET6（日常会话）
      </div>
      <div style="margin-bottom: 4px;">
        <span style="font-weight: bold;">校园工作：</span>2019 年入选南京理工大学本科生"先锋计划"；
      </div>
      <div style="margin-bottom: 4px;">
        <span style="font-weight: bold;">个人评价：</span>具有较强的分析问题和解决问题的能力；善于学习新技术的能力；学习能力强，能够快速掌握新知识；
        试验、探索上进心强，能够承受一定的工作压力
      </div>
  </div>
</section>
`;

const nowIso = new Date().toISOString();

export const DEFAULT_RESUME_DATA: ResumeData = {
  title: '叶美如简历模板',
  templateId: 'yemeirui-template',
  content: DEFAULT_RESUME_CONTENT,
  rawText: DEFAULT_RESUME_CONTENT,
  parsedBlocks: [],
  skills: [],
  metadata: {
    templateKey: 'yemeirui-template',
    title: '叶美如简历模板',
    language: 'zh',
  },
  createdAt: nowIso,
  updatedAt: nowIso,
  source: 'template',
};