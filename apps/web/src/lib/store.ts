import { JD, JDSchema, Output, OutputSchema, Resume, ResumeSchema, Task } from "./types";

const mem = {
  resumes: new Map<string, Resume>(),
  jds: new Map<string, JD>(),
  tasks: new Map<string, Task>(),
  outputs: new Map<string, Output>(),
};

const rid = () => Math.random().toString(36).slice(2, 10);

export function saveResume(raw_text: string): Resume {
  const r: Resume = ResumeSchema.parse({ 
    id: `r_${rid()}`, 
    raw_text, 
    parsed_blocks: [], 
    skills: [], 
    contacts: {} 
  });
  mem.resumes.set(r.id, r);
  return r;
}

export function saveJD(input: Partial<JD> & { jd_text: string }): JD {
  const j: JD = JDSchema.parse({
    id: `j_${rid()}`,
    company: input.company ?? "Unknown Co.",
    title: input.title ?? "Unknown Title",
    jd_text: input.jd_text,
    must_have_skills: extractSkills(input.jd_text).must,
    nice_to_have: extractSkills(input.jd_text).nice,
  });
  mem.jds.set(j.id, j);
  return j;
}

export function createTask(resume_id: string, jd_id: string): Task {
  const t: Task = { id: `t_${rid()}`, status: "queued" };
  mem.tasks.set(t.id, t);
  // 模拟异步流水线
  setTimeout(() => {
    t.status = "running";
    setTimeout(() => {
      const out = synthesizeOutput(resume_id, jd_id);
      mem.outputs.set(out.id, out);
      t.status = "done";
      (t as any).output = out;
      (t as any).latency_ms = 1500 + Math.floor(Math.random() * 800);
      (t as any).cost = Number((Math.random() * 0.08 + 0.02).toFixed(3));
    }, 1200);
  }, 300);
  return t;
}

export function getTask(id: string): Task | undefined {
  return mem.tasks.get(id);
}

// —— 朴素技能抽取 ——
function extractSkills(text: string) {
  const must: string[] = [];
  const nice: string[] = [];
  const dict = [
    "Python", "Go", "Java", "TypeScript", "JavaScript", "React", "Vue", "Node.js",
    "MySQL", "Redis", "MongoDB", "PostgreSQL", "Docker", "Kubernetes",
    "LLM", "LangChain", "OpenAI", "Qwen", "DeepSeek", "CV", "NLP", "AI",
    "产品经理", "数据分析", "项目管理", "用户体验", "增长", "运营"
  ];
  dict.forEach((k) => (text.toLowerCase().includes(k.toLowerCase()) ? must.push(k) : null));
  return { must, nice };
}

// —— 生成假结果（可替换为真实 LLM） ——
function synthesizeOutput(resume_id: string, jd_id: string): Output {
  const r = mem.resumes.get(resume_id);
  const j = mem.jds.get(jd_id);
  const id = `o_${rid()}`;
  
  const resume_md = `# 优化后简历（面向 ${j?.company}·${j?.title}）

## 个人信息
- 姓名：张三
- 邮箱：zhangsan@example.com
- 电话：138-0000-0000

## 核心技能匹配
${j?.must_have_skills.slice(0, 5).map(skill => `- **${skill}**：具备丰富实战经验`).join('\n')}

## 工作经历

### 高级产品经理 | 腾讯科技 | 2022.03 - 至今
- 负责政企数据产品规划，**DAU 提升 +25%**，用户留存率 **+18%**
- 推动跨部门协作项目，平均项目交付周期 **缩短 30%**
- 构建完整的业务指标体系，实现数据驱动的产品决策

### 产品经理 | 字节跳动 | 2020.06 - 2022.02  
- 负责 ToB 产品线规划与执行，年度营收 **+40%**
- 优化用户体验流程，客户满意度 **提升至 95%**
- 建立敏捷开发流程，产品迭代效率 **提升 50%**

## 项目经历

### 政企数据平台重构项目
- **背景**：原有系统性能瓶颈，用户体验差
- **方案**：重新设计架构，引入微服务和容器化部署
- **成果**：系统响应时间 **降低 60%**，故障率 **下降 80%**

## 教育背景
- 硕士 | 计算机科学与技术 | 清华大学 | 2018-2020
- 学士 | 软件工程 | 北京理工大学 | 2014-2018`;

  const interview_questions = [
    "请详细阐述你在政企数据产品项目中如何将 DAU 提升 25% 的具体策略和实验设计？",
    `针对 ${j?.company} 的业务特点，你认为在 ${j?.title} 岗位上最大的挑战是什么？如何应对？`,
    "描述一次你推动跨部门协作的复杂项目经历，遇到了哪些阻力？如何解决的？",
    "如何构建一个完整的产品指标体系？请结合你的实际经验说明。",
    "在 ToB 产品设计中，如何平衡客户需求的个性化与产品标准化？",
    "谈谈你对数据驱动产品决策的理解，以及在实际工作中是如何应用的？"
  ];

  const knowledge_items = [
    { 
      title: "B站｜产品经理必备：数据分析与指标体系构建", 
      url: "https://www.bilibili.com/video/BV1xx411c7mu", 
      why: "岗位强调数据驱动能力，需要掌握完整的指标体系设计方法" 
    },
    { 
      title: "B站｜ToB产品设计实战：从0到1搭建企业级产品", 
      url: "https://www.bilibili.com/video/BV1yy4y1a7Km", 
      why: "目标公司专注政企业务，需要深入理解 ToB 产品特点" 
    },
    { 
      title: "B站｜跨部门协作与项目管理：大厂产品经理必修课", 
      url: "https://www.bilibili.com/video/BV1zz4y1d7Xx", 
      why: "JD 明确要求跨部门协调能力，这是常见面试考察点" 
    },
    { 
      title: "极客时间｜腾讯产品方法论：如何做好用户增长", 
      url: "https://time.geekbang.org/column/intro/100056701", 
      why: "目标公司是腾讯，了解其产品文化和方法论很重要" 
    }
  ];

  return OutputSchema.parse({ id, resume_md, interview_questions, knowledge_items });
}