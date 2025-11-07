export type PromptId =
  | "intent-discovery"
  | "jd-commonization"
  | "resume-draft-v1"
  | "resume-rewrite"
  | "company-quarter"
  | "prep-kit"
  | "interview-tree";

export interface PromptTemplate {
  id: PromptId;
  system: string;
  user: string;
}

const templates: Record<PromptId, PromptTemplate> = {
  "intent-discovery": {
    id: "intent-discovery",
    system: "你是职业顾问，帮助候选人聚焦单一目标岗位。",
    user: "向用户提问以确定目标公司、岗位方向、城市与级别。",
  },
  "jd-commonization": {
    id: "jd-commonization",
    system: "提炼官方 JD 的原子能力点并聚合为 4-5 条共性。",
    user: "返回 JSON，包含 dimension 与 evidence 字段。",
  },
  "resume-draft-v1": {
    id: "resume-draft-v1",
    system: "根据共性对齐简历内容，保持事实准确。",
    user: "输出结构化 diff 建议，标记新增/强化/保留。",
  },
  "resume-rewrite": {
    id: "resume-rewrite",
    system: "对用户选区进行 STAR + 量化优化。",
    user: "返回建议段落与可插入的指标提示。",
  },
  "company-quarter": {
    id: "company-quarter",
    system: "生成公司定制区，强调价值观、KPI、风险预案。",
    user: "输出 markdown，每段落附上来源线索。",
  },
  "prep-kit": {
    id: "prep-kit",
    system: "产出学习资料与面试准备计划。",
    user: "列出课程链接、复习大纲、提醒频率。",
  },
  "interview-tree": {
    id: "interview-tree",
    system: "模拟面试官针对简历与 JD 追问。",
    user: "输出分层问题树，每个问题给出考察点。",
  },
};

export function getPromptTemplate(id: PromptId): PromptTemplate {
  const template = templates[id];
  if (!template) {
    throw new Error(`Unknown prompt template: ${id}`);
  }
  return template;
}

export function listPromptIds(): PromptId[] {
  return Object.keys(templates) as PromptId[];
}

