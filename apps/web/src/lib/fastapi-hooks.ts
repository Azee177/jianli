import useSWR from "swr";
import { Resume, JD, Task } from "./types";

// FastAPI后端配置
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3002';

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