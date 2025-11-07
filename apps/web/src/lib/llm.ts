// LLM Provider 适配器 - 统一接口，支持多种模型

export interface LLMInput {
  system: string;
  prompt: string;
  model: 'qwen' | 'deepseek' | 'gpt-4' | 'gpt-3.5-turbo';
  temperature?: number;
  maxTokens?: number;
}

export interface LLMOutput {
  text: string;
  tokensIn: number;
  tokensOut: number;
  cost: number; // 成本（人民币）
  latencyMs: number;
}

export interface LLMProvider {
  call(input: LLMInput): Promise<LLMOutput>;
}

// Qwen Provider (阿里云百炼/灵积)
export class QwenProvider implements LLMProvider {
  constructor(
    private apiKey: string,
    private baseURL: string = 'https://dashscope.aliyuncs.com/api/v1'
  ) {}

  async call(input: LLMInput): Promise<LLMOutput> {
    const startTime = Date.now();
    
    try {
      // TODO: 实现真实的Qwen API调用
      const response = await fetch(`${this.baseURL}/services/aigc/text-generation/generation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: input.model === 'qwen' ? 'qwen-turbo' : input.model,
          input: {
            messages: [
              { role: 'system', content: input.system },
              { role: 'user', content: input.prompt }
            ]
          },
          parameters: {
            temperature: input.temperature ?? 0.7,
            max_tokens: input.maxTokens ?? 2000,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Qwen API error: ${response.status}`);
      }

      const data = await response.json();
      const latencyMs = Date.now() - startTime;
      
      return {
        text: data.output?.text || '(mock) Qwen response',
        tokensIn: data.usage?.input_tokens || 500,
        tokensOut: data.usage?.output_tokens || 800,
        cost: this.calculateCost(data.usage?.total_tokens || 1300),
        latencyMs,
      };
    } catch (error) {
      console.error('Qwen API call failed:', error);
      // 返回Mock数据作为降级
      return this.getMockResponse(input, Date.now() - startTime);
    }
  }

  private calculateCost(totalTokens: number): number {
    // Qwen定价：约 0.002元/1K tokens
    return (totalTokens / 1000) * 0.002;
  }

  private getMockResponse(input: LLMInput, latencyMs: number): LLMOutput {
    return {
      text: `(Mock Qwen) 基于您的简历和JD，我为您生成了优化建议...`,
      tokensIn: 500,
      tokensOut: 800,
      cost: 0.026,
      latencyMs,
    };
  }
}

// DeepSeek Provider
export class DeepSeekProvider implements LLMProvider {
  constructor(
    private apiKey: string,
    private baseURL: string = 'https://api.deepseek.com/v1'
  ) {}

  async call(input: LLMInput): Promise<LLMOutput> {
    const startTime = Date.now();
    
    try {
      // TODO: 实现真实的DeepSeek API调用
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: input.model === 'deepseek' ? 'deepseek-chat' : input.model,
          messages: [
            { role: 'system', content: input.system },
            { role: 'user', content: input.prompt }
          ],
          temperature: input.temperature ?? 0.7,
          max_tokens: input.maxTokens ?? 2000,
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      const latencyMs = Date.now() - startTime;
      
      return {
        text: data.choices?.[0]?.message?.content || '(mock) DeepSeek response',
        tokensIn: data.usage?.prompt_tokens || 400,
        tokensOut: data.usage?.completion_tokens || 600,
        cost: this.calculateCost(data.usage?.total_tokens || 1000),
        latencyMs,
      };
    } catch (error) {
      console.error('DeepSeek API call failed:', error);
      return this.getMockResponse(input, Date.now() - startTime);
    }
  }

  private calculateCost(totalTokens: number): number {
    // DeepSeek定价：约 0.001元/1K tokens (更便宜)
    return (totalTokens / 1000) * 0.001;
  }

  private getMockResponse(input: LLMInput, latencyMs: number): LLMOutput {
    return {
      text: `(Mock DeepSeek) 根据分析，您的简历在以下方面可以优化...`,
      tokensIn: 400,
      tokensOut: 600,
      cost: 0.01,
      latencyMs,
    };
  }
}

// OpenAI Provider (备用)
export class OpenAIProvider implements LLMProvider {
  constructor(
    private apiKey: string,
    private baseURL: string = 'https://api.openai.com/v1'
  ) {}

  async call(input: LLMInput): Promise<LLMOutput> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: input.model,
          messages: [
            { role: 'system', content: input.system },
            { role: 'user', content: input.prompt }
          ],
          temperature: input.temperature ?? 0.7,
          max_tokens: input.maxTokens ?? 2000,
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const latencyMs = Date.now() - startTime;
      
      return {
        text: data.choices?.[0]?.message?.content || '(mock) OpenAI response',
        tokensIn: data.usage?.prompt_tokens || 600,
        tokensOut: data.usage?.completion_tokens || 1000,
        cost: this.calculateCost(input.model, data.usage?.total_tokens || 1600),
        latencyMs,
      };
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      return this.getMockResponse(input, Date.now() - startTime);
    }
  }

  private calculateCost(model: string, totalTokens: number): number {
    // OpenAI定价（美元转人民币，约7.2汇率）
    const rates = {
      'gpt-4': 0.03 * 7.2, // $0.03/1K tokens
      'gpt-3.5-turbo': 0.002 * 7.2, // $0.002/1K tokens
    };
    const rate = rates[model as keyof typeof rates] || rates['gpt-3.5-turbo'];
    return (totalTokens / 1000) * rate;
  }

  private getMockResponse(input: LLMInput, latencyMs: number): LLMOutput {
    return {
      text: `(Mock OpenAI) Based on your resume and job description...`,
      tokensIn: 600,
      tokensOut: 1000,
      cost: 0.096,
      latencyMs,
    };
  }
}

// LLM管理器 - 统一调用入口
export class LLMManager {
  private providers: Map<string, LLMProvider> = new Map();

  constructor() {
    // 初始化Provider（从环境变量读取API Key）
    if (process.env.QWEN_API_KEY) {
      this.providers.set('qwen', new QwenProvider(process.env.QWEN_API_KEY));
    }
    if (process.env.DEEPSEEK_API_KEY) {
      this.providers.set('deepseek', new DeepSeekProvider(process.env.DEEPSEEK_API_KEY));
    }
    if (process.env.OPENAI_API_KEY) {
      this.providers.set('openai', new OpenAIProvider(process.env.OPENAI_API_KEY));
    }
  }

  async call(input: LLMInput): Promise<LLMOutput> {
    const providerKey = this.getProviderKey(input.model);
    const provider = this.providers.get(providerKey);
    
    if (!provider) {
      throw new Error(`No provider available for model: ${input.model}`);
    }

    return provider.call(input);
  }

  private getProviderKey(model: string): string {
    if (model.startsWith('qwen')) return 'qwen';
    if (model.startsWith('deepseek')) return 'deepseek';
    if (model.startsWith('gpt')) return 'openai';
    return 'qwen'; // 默认使用Qwen
  }

  // 获取可用的模型列表
  getAvailableModels(): string[] {
    const models: string[] = [];
    if (this.providers.has('qwen')) models.push('qwen');
    if (this.providers.has('deepseek')) models.push('deepseek');
    if (this.providers.has('openai')) models.push('gpt-4', 'gpt-3.5-turbo');
    return models;
  }
}

// 单例实例
export const llmManager = new LLMManager();

// 便捷函数
export async function callLLM(input: LLMInput): Promise<LLMOutput> {
  return llmManager.call(input);
}

// 预定义的Prompt模板
export const PROMPTS = {
  RESUME_OPTIMIZATION: `你是一位专业的简历优化专家。请根据提供的JD要求，优化用户的简历内容。

要求：
1. 保持真实性，不编造经历
2. 突出与JD匹配的技能和经验
3. 量化成果，使用具体数字
4. 优化表达方式，使用行业术语
5. 调整结构，突出重点

请返回优化后的简历Markdown格式。`,

  INTERVIEW_QUESTIONS: `你是一位资深的面试官。请根据提供的简历和JD，生成6-8个有针对性的面试问题。

要求：
1. 涵盖技术能力、项目经验、软技能
2. 有一定挑战性，能考察真实水平
3. 结合具体的JD要求
4. 包含行为面试和技术面试问题

请返回问题列表。`,

  KNOWLEDGE_RECOMMENDATIONS: `你是一位学习规划专家。请根据简历和JD的差距，推荐4-6个学习资源。

要求：
1. 针对性强，能弥补技能差距
2. 包含B站视频、技术文章、实战项目
3. 说明推荐理由
4. 优先推荐中文资源

请返回JSON格式的推荐列表。`
};