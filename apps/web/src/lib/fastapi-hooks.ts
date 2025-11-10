import useSWR from "swr";
import { Resume, JD, Task } from "./types";

// FastAPI后端配置
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// 通用请求头
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'X-User-ID': 'demo-user', // 临时用户ID
});

export async function uploadResume(input: { file?: File; text?: string }): Promise<Resume> {
  if (input.file) {
    const fd = new FormData();
    fd.append("file", input.file);
    fd.append("title", "上传的简历");
    
    return fetch(`${API_BASE}/resumes`, { 
      method: "POST", 
      body: fd,
      headers: {
        'X-User-ID': 'demo-user'
      }
    }).then((r) => r.json());
  }
  
  return fetch(`${API_BASE}/resumes`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ text: input.text || "" }),
  }).then((r) => r.json());
}

export async function parseJD(input: { url?: string; text?: string }): Promise<JD> {
  // 使用FastAPI的JD抓取接口
  const response = await fetch(`${API_BASE}/jd/fetch`, { 
    method: "POST", 
    headers: getHeaders(),
    body: JSON.stringify(input) 
  });
  
  const task = await response.json();
  
  // 轮询任务结果
  return new Promise((resolve, reject) => {
    const pollTask = async () => {
      try {
        const taskResponse = await fetch(`${API_BASE}/tasks/${task.id}`, {
          headers: getHeaders()
        });
        const taskData = await taskResponse.json();
        
        if (taskData.status === 'done' && taskData.result?.jd_results?.length > 0) {
          resolve(taskData.result.jd_results[0]);
        } else if (taskData.status === 'error') {
          reject(new Error(taskData.error || 'JD解析失败'));
        } else {
          // 继续轮询
          setTimeout(pollTask, 1000);
        }
      } catch (error) {
        reject(error);
      }
    };
    
    pollTask();
  });
}

export async function runPipeline(resume_id: string, jd_id: string): Promise<Task> {
  // 创建共性提炼任务
  const commonalityResponse = await fetch(`${API_BASE}/jd/commonalities`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ jd_ids: [jd_id] }),
  });
  
  const commonalityTask = await commonalityResponse.json();
  
  // 等待共性提炼完成，然后启动优化任务
  return new Promise((resolve, reject) => {
    const pollCommonality = async () => {
      try {
        const taskResponse = await fetch(`${API_BASE}/tasks/${commonalityTask.id}`, {
          headers: getHeaders()
        });
        const taskData = await taskResponse.json();
        
        if (taskData.status === 'done') {
          // 启动简历优化
          const optimizeResponse = await fetch(`${API_BASE}/resumes/${resume_id}/optimize/preview`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ 
              commonality_id: taskData.result.commonality_id 
            }),
          });
          
          const optimizeTask = await optimizeResponse.json();
          resolve(optimizeTask);
        } else if (taskData.status === 'error') {
          reject(new Error(taskData.error || '流水线执行失败'));
        } else {
          setTimeout(pollCommonality, 1000);
        }
      } catch (error) {
        reject(error);
      }
    };
    
    pollCommonality();
  });
}

export function useTask(task_id?: string) {
  const shouldFetch = Boolean(task_id);
  const { data, error, isLoading } = useSWR(
    shouldFetch ? `${API_BASE}/tasks/${task_id}` : null, 
    fetcher, 
    { refreshInterval: 1200 }
  );
  return { task: data as Task, error, isLoading } as const;
}

// 新增：获取学习计划
export async function getStudyPlan(resume_id: string): Promise<any> {
  const response = await fetch(`${API_BASE}/resumes/${resume_id}/study-plan`, {
    method: "POST",
    headers: getHeaders(),
  });
  
  const task = await response.json();
  
  // 轮询任务结果
  return new Promise((resolve, reject) => {
    const pollTask = async () => {
      try {
        const taskResponse = await fetch(`${API_BASE}/tasks/${task.id}`, {
          headers: getHeaders()
        });
        const taskData = await taskResponse.json();
        
        if (taskData.status === 'done') {
          const planResponse = await fetch(`${API_BASE}/resumes/${resume_id}/study-plan/${taskData.result.plan_id}`, {
            headers: getHeaders()
          });
          resolve(await planResponse.json());
        } else if (taskData.status === 'error') {
          reject(new Error(taskData.error || '学习计划生成失败'));
        } else {
          setTimeout(pollTask, 1000);
        }
      } catch (error) {
        reject(error);
      }
    };
    
    pollTask();
  });
}

// 新增：获取面试问答
export async function getInterviewQA(resume_id: string): Promise<any> {
  const response = await fetch(`${API_BASE}/resumes/${resume_id}/qa`, {
    method: "POST",
    headers: getHeaders(),
  });
  
  const task = await response.json();
  
  // 轮询任务结果
  return new Promise((resolve, reject) => {
    const pollTask = async () => {
      try {
        const taskResponse = await fetch(`${API_BASE}/tasks/${task.id}`, {
          headers: getHeaders()
        });
        const taskData = await taskResponse.json();
        
        if (taskData.status === 'done') {
          const qaResponse = await fetch(`${API_BASE}/resumes/${resume_id}/qa/${taskData.result.qa_id}`, {
            headers: getHeaders()
          });
          resolve(await qaResponse.json());
        } else if (taskData.status === 'error') {
          reject(new Error(taskData.error || '面试问答生成失败'));
        } else {
          setTimeout(pollTask, 1000);
        }
      } catch (error) {
        reject(error);
      }
    };
    
    pollTask();
  });
}

// 新增：分析简历并生成建议
export async function analyzeSuggestions(resume_id: string, jd_id?: string): Promise<any> {
  const response = await fetch(`${API_BASE}/suggestions/analyze`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ 
      resume_id,
      jd_id 
    }),
  });
  
  return response.json();
}

// 新增：获取章节优化建议
export async function getSectionSuggestions(resume_id: string, section: string, jd_id?: string): Promise<any> {
  const response = await fetch(`${API_BASE}/suggestions/section`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ 
      resume_id,
      section,
      jd_id 
    }),
  });
  
  return response.json();
}

// 新增：优化文本
export async function optimizeText(text: string, context?: string, jd_id?: string): Promise<any> {
  const response = await fetch(`${API_BASE}/suggestions/optimize-text`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ 
      text,
      context,
      jd_id 
    }),
  });
  
  return response.json();
}

// 新增：JD多源搜索
export async function searchJD(params: { 
  company?: string;
  title?: string;
  city?: string;
  limit?: number;
}): Promise<any> {
  const queryParams = new URLSearchParams();
  if (params.company) queryParams.append('company', params.company);
  if (params.title) queryParams.append('title', params.title);
  if (params.city) queryParams.append('city', params.city);
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const response = await fetch(`${API_BASE}/jd/search?${queryParams}`, {
    method: "POST",
    headers: getHeaders(),
  });
  
  return response.json();
}

// 新增：设置目标岗位
export async function setTarget(jd_id: string, user_id?: string): Promise<any> {
  const response = await fetch(`${API_BASE}/targets`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ 
      jd_id,
      user_id: user_id || 'demo-user'
    }),
  });
  
  return response.json();
}

// 新增：获取目标列表
export async function getTargets(user_id?: string): Promise<any> {
  const response = await fetch(`${API_BASE}/targets?user_id=${user_id || 'demo-user'}`, {
    headers: getHeaders(),
  });
  
  return response.json();
}

// ==================== 通用对话API ====================

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface SendChatMessageParams {
  message: string;
  session_id?: string;
  system_message?: string;
  temperature?: number;
  max_tokens?: number;
  provider?: 'qwen' | 'deepseek' | 'openai';
}

export async function sendChatMessage(params: SendChatMessageParams): Promise<any> {
  const response = await fetch(`${API_BASE}/chat/message`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(params),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || '对话失败');
  }
  
  return response.json();
}

export async function getChatHistory(session_id: string): Promise<any> {
  const response = await fetch(`${API_BASE}/chat/history`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ session_id }),
  });
  
  return response.json();
}

export async function resetChatSession(session_id: string): Promise<any> {
  const response = await fetch(`${API_BASE}/chat/reset`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ session_id }),
  });
  
  return response.json();
}

export async function listChatSessions(): Promise<any> {
  const response = await fetch(`${API_BASE}/chat/sessions`, {
    headers: getHeaders(),
  });
  
  return response.json();
}