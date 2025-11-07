# 智能简历助手 - Agent架构设计

## 核心理念

使用LLM作为大脑，通过多Agent协作完成整个简历优化流程。每个Agent专注于特定领域，Master Agent负责意图识别和流程编排。

## Agent层级结构

```
┌─────────────────────────────────────────┐
│         Master Agent (总控)              │
│    - 意图识别                            │
│    - 流程编排                            │
│    - 状态管理                            │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌────▼──────────┐
│ Sub-Agents  │  │  Specialized  │
│             │  │     Tools     │
└─────────────┘  └───────────────┘
```

## Agent详细设计

### 1. Master Agent (主控智能体)

**职责：**
- 理解用户意图
- 决定调用哪个Sub-Agent
- 管理整个流程状态
- 协调多个Agent之间的数据流转

**核心能力：**
- Intent Recognition（意图识别）
- Context Management（上下文管理）
- Workflow Orchestration（流程编排）
- Decision Making（决策制定）

**工具集：**
- get_current_stage(): 获取当前流程阶段
- transition_to_stage(stage): 转换到新阶段
- get_user_context(): 获取用户上下文
- delegate_to_agent(agent_name, task): 委托给子Agent

---

### 2. Resume Parser Agent (简历解析智能体)

**职责：**
- 从OCR文本中提取结构化信息
- 识别简历各个部分（基本信息、教育、工作、技能等）
- 提取照片信息
- 生成简历元数据

**输入：** 
- OCR提取的原始文本
- PDF字节流（用于提取照片）

**输出：**
```json
{
  "basic_info": {
    "name": "张三",
    "phone": "138****1234",
    "email": "zhangsan@example.com",
    "wechat": "zhangsan_wx",
    "github": "zhangsan",
    "linkedin": "zhangsan"
  },
  "photo": {
    "extracted": true,
    "photo_id": "photo_123",
    "confidence": 0.95
  },
  "education": [
    {
      "school": "清华大学",
      "degree": "硕士",
      "major": "计算机科学",
      "start_date": "2018-09",
      "end_date": "2021-06"
    }
  ],
  "work_experience": [
    {
      "company": "字节跳动",
      "position": "后端工程师",
      "start_date": "2021-07",
      "end_date": "2024-01",
      "description": ["负责推荐系统开发", "..."],
      "achievements": ["提升性能30%", "..."]
    }
  ],
  "skills": ["Python", "Java", "Go", "MySQL", "Redis"],
  "projects": [...],
  "analysis": {
    "experience_years": 3.5,
    "education_level": "硕士",
    "industries": ["互联网", "软件开发"],
    "strengths": ["后端开发", "系统设计"],
    "suggested_positions": ["高级后端工程师", "技术专家"]
  }
}
```

**LLM Prompt模板：**
```
你是一个专业的简历解析专家。请从以下OCR提取的文本中，提取并结构化所有信息。

要求：
1. 提取基本信息（姓名、联系方式等）
2. 提取教育背景（学校、学历、专业、时间）
3. 提取工作经历（公司、职位、时间、职责、成果）
4. 提取技能列表
5. 提取项目经验
6. 分析候选人的优势和适合的岗位方向

OCR文本：
{ocr_text}

请以JSON格式返回结构化结果。
```

---

### 3. Job Recommendation Agent (岗位推荐智能体)

**职责：**
- 通过对话收集用户意图
- 基于简历分析推荐岗位
- 生成引导性问题
- 确认目标岗位

**工作流程：**
```
1. 分析简历背景
   ↓
2. 生成初始问候和第一个问题
   ↓
3. 对话循环：
   - 解析用户回答
   - 提取关键信息（岗位、公司、城市、级别）
   - 生成下一个问题
   ↓
4. 信息收集完成
   ↓
5. 推荐5-8个岗位
   ↓
6. 用户确认唯一目标
```

**LLM Prompt模板：**
```
你是一个职业规划顾问。基于候选人的简历分析，通过对话帮助他们明确目标岗位。

候选人背景：
{resume_analysis}

当前对话状态：
{conversation_state}

已收集信息：
{collected_info}

任务：
1. 如果还缺少关键信息（岗位方向/目标公司/期望城市），生成一个自然的引导问题
2. 如果信息已收集完整，推荐5-8个匹配的岗位
3. 保持对话自然、专业、有帮助

请返回下一步行动的JSON：
{
  "action": "ask_question" | "recommend_jobs",
  "content": "问题内容或推荐说明",
  "suggestions": ["选项1", "选项2", ...]
}
```

---

### 4. JD Analysis Agent (JD分析智能体)

**职责：**
- 从15条JD中提取原子能力点
- 聚合为4-5条核心共性维度
- 分析各维度的重要性和频率

**工作流程：**
```
1. 接收15条JD文本
   ↓
2. 逐条分析，提取能力要求
   ↓
3. 对能力点进行聚类
   ↓
4. 提炼出4-5条核心共性
   ↓
5. 为每条共性提供证据句
```

**LLM Prompt模板：**
```
你是一个招聘分析专家。请分析以下15条相同岗位的JD，提炼出核心共性要求。

JD列表：
{jd_list}

任务：
1. 识别所有岗位要求（技能、经验、学历、软技能等）
2. 统计每个要求出现的频率
3. 将相似要求聚合
4. 提炼出4-5条最核心的共性维度
5. 每条共性需要：
   - 清晰的标题
   - 具体描述
   - 重要性评分（0-1）
   - 出现频率
   - 原始JD中的证据句

返回JSON格式：
{
  "atomic_requirements": [...],
  "commonalities": [
    {
      "title": "技术能力要求",
      "description": "熟练掌握Python/Java等主流编程语言",
      "importance": 0.95,
      "frequency": 14,
      "total_jds": 15,
      "evidence_sentences": [...]
    }
  ]
}
```

---

### 5. Resume Optimization Agent (简历优化智能体)

**职责：**
- 对比简历和共性维度，进行差距分析
- 生成优化建议
- 重写简历段落（STAR法则、量化等）
- 生成多版本供选择

**核心能力：**
- Gap Analysis（差距分析）
- Content Generation（内容生成）
- STAR Method Application（STAR法则应用）
- Quantification（量化）
- Style Adaptation（风格适配）

**LLM Prompt模板：**
```
你是一个资深简历优化专家。

当前简历：
{resume_content}

目标岗位共性要求：
{common_dimensions}

任务：分析简历与岗位要求的差距，并生成优化建议。

步骤：
1. 差距分析：
   - 哪些要求在简历中体现不足
   - 哪些经历可以更好地呈现
   - 哪些内容需要量化

2. 生成具体建议：
   - 标题：建议类型
   - 原文：需要优化的原始文本
   - 优化后：三个版本（稳健/平衡/激进）
   - 原因：为什么这样优化
   - 优先级：1-5

3. 应用STAR法则重写工作经历

返回JSON格式的分析和建议。
```

---

### 6. Interview Prep Agent (面试准备智能体)

**职责：**
- 生成面试问题树
- 根据简历和JD生成可能的面试问题
- 提供答案提纲
- 模拟追问

**LLM Prompt模板：**
```
你是一个面试教练。基于候选人的简历和目标岗位要求，生成面试准备材料。

简历：{resume}
岗位要求：{jd_requirements}

任务：
1. 生成面试问题树（基础/进阶/挑战三个层级）
2. 为每个问题提供：
   - 问题内容
   - 考察点
   - 答案提纲（基于候选人经历）
   - 可能的追问
   - 注意事项

重点关注：
- 技术深度问题
- 项目经验挖掘
- 行为面试问题（STAR）
- 场景题

返回结构化的面试准备材料。
```

---

## 技术实现

### LangChain Agent框架

```python
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.tools import Tool
from langchain.memory import ConversationBufferMemory
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder

class MasterAgent:
    def __init__(self, llm, tools, sub_agents):
        self.llm = llm
        self.tools = tools
        self.sub_agents = sub_agents
        self.memory = ConversationBufferMemory()
        self.state_machine = StateMachine()
    
    def run(self, user_input: str, context: dict):
        # 1. 意图识别
        intent = self.recognize_intent(user_input, context)
        
        # 2. 选择Agent
        agent = self.select_agent(intent)
        
        # 3. 执行任务
        result = agent.execute(user_input, context)
        
        # 4. 更新状态
        self.state_machine.transition(result)
        
        return result
```

### 统一LLM服务

```python
class LLMService:
    """统一的LLM调用服务"""
    
    def __init__(self):
        self.providers = {
            'openai': OpenAIProvider(),
            'qwen': QwenProvider(),
            'deepseek': DeepSeekProvider()
        }
        self.default_provider = 'qwen'
    
    async def complete(
        self,
        prompt: str,
        system_message: str = None,
        temperature: float = 0.7,
        response_format: str = 'json',
        provider: str = None
    ):
        """通用completion调用"""
        provider = provider or self.default_provider
        return await self.providers[provider].complete(
            prompt=prompt,
            system_message=system_message,
            temperature=temperature,
            response_format=response_format
        )
```

---

## 数据流转示意

```
用户上传PDF
    ↓
OCR提取文本 ──────────┐
    ↓                 │
Resume Parser Agent   │ (并行)
    ↓                 │
简历分析完成 ←────────┘
    ↓
Master Agent (判断意图)
    ↓
Job Recommendation Agent
    ↓
确认目标岗位
    ↓
JD Analysis Agent (抓取15条JD，分析共性)
    ↓
Resume Optimization Agent (优化简历)
    ↓
Interview Prep Agent (生成面试材料)
    ↓
完成
```

---

## 状态机设计

```python
class JourneyState(Enum):
    UPLOAD = "upload"
    PARSING = "parsing"
    PARSE_COMPLETE = "parse_complete"
    INTENT_COLLECTING = "intent_collecting"
    TARGET_CONFIRMED = "target_confirmed"
    JD_ANALYZING = "jd_analyzing"
    DIMS_LOCKED = "dims_locked"
    OPTIMIZING = "optimizing"
    PREP_GENERATING = "prep_generating"
    COMPLETE = "complete"

class StateMachine:
    def __init__(self):
        self.current_state = JourneyState.UPLOAD
        self.transitions = self._build_transitions()
    
    def can_transition(self, to_state: JourneyState) -> bool:
        return to_state in self.transitions[self.current_state]
    
    def transition(self, to_state: JourneyState):
        if self.can_transition(to_state):
            self.current_state = to_state
        else:
            raise InvalidTransitionError()
```

---

## 优势

1. **智能化**：LLM理解语义，准确提取信息
2. **并行处理**：OCR后立即开始分析
3. **模块化**：每个Agent专注单一职责
4. **可扩展**：易于添加新Agent
5. **上下文感知**：Master Agent管理全局状态
6. **灵活编排**：根据用户意图动态调整流程

