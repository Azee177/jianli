'use client';

import { useState, useCallback, useEffect } from 'react';
import { uploadResume, parseJD, runPipeline, useTask } from '@/lib/hooks';
import { Resume, JD, Task } from '@/lib/types';

export interface WorkflowState {
  // 数据状态
  resume: Resume | null;
  jd: JD | null;
  task: Task | null;
  
  // UI 状态
  isUploading: boolean;
  isParsingJD: boolean;
  isRunning: boolean;
  
  // 错误状态
  uploadError: string | null;
  jdError: string | null;
  runError: string | null;
}

export function useWorkflow() {
  const [state, setState] = useState<WorkflowState>({
    resume: null,
    jd: null,
    task: null,
    isUploading: false,
    isParsingJD: false,
    isRunning: false,
    uploadError: null,
    jdError: null,
    runError: null,
  });

  // 使用 useTask hook 来轮询任务状态
  const { task: taskData, isLoading: isTaskLoading } = useTask(state.task?.id);

  useEffect(() => {
    if (!taskData) {
      return;
    }
    setState(prev => {
      if (!prev.task || prev.task.id !== taskData.id) {
        return { ...prev, task: taskData };
      }
      if (
        prev.task.status === taskData.status &&
        prev.task.error === taskData.error &&
        prev.task.output === taskData.output
      ) {
        return prev;
      }
      return { ...prev, task: taskData };
    });
  }, [taskData]);

  const handleUploadResume = useCallback(async (input: { file?: File; text?: string }) => {
    setState(prev => ({ ...prev, isUploading: true, uploadError: null }));
    
    try {
      const resume = await uploadResume(input);
      setState(prev => ({ 
        ...prev, 
        resume, 
        isUploading: false 
      }));
      return resume;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '简历上传失败';
      setState(prev => ({ 
        ...prev, 
        isUploading: false, 
        uploadError: errorMessage 
      }));
      throw error;
    }
  }, []);

  const handleParseJD = useCallback(async (input: { url?: string; text?: string }) => {
    setState(prev => ({ ...prev, isParsingJD: true, jdError: null }));
    
    try {
      const jd = await parseJD(input);
      setState(prev => ({ 
        ...prev, 
        jd, 
        isParsingJD: false 
      }));
      return jd;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'JD解析失败';
      setState(prev => ({ 
        ...prev, 
        isParsingJD: false, 
        jdError: errorMessage 
      }));
      throw error;
    }
  }, []);

  const handleRunPipeline = useCallback(async () => {
    if (!state.resume || !state.jd) {
      throw new Error('请先上传简历和解析JD');
    }

    setState(prev => ({ ...prev, isRunning: true, runError: null }));
    
    try {
      const task = await runPipeline(state.resume.id, state.jd.id);
      setState(prev => ({ 
        ...prev, 
        task, 
        isRunning: false 
      }));
      return task;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '流水线启动失败';
      setState(prev => ({ 
        ...prev, 
        isRunning: false, 
        runError: errorMessage 
      }));
      throw error;
    }
  }, [state.resume, state.jd]);

  const resetWorkflow = useCallback(() => {
    setState({
      resume: null,
      jd: null,
      task: null,
      isUploading: false,
      isParsingJD: false,
      isRunning: false,
      uploadError: null,
      jdError: null,
      runError: null,
    });
  }, []);

  // 计算派生状态
  const latestTask = taskData ?? state.task;

  const canRunPipeline = Boolean(state.resume && state.jd && !state.isRunning);
  const isProcessing =
    state.isUploading || state.isParsingJD || state.isRunning || isTaskLoading;
  const hasOutput = latestTask?.status === 'done' && latestTask.output;
  const hasError = Boolean(
    state.uploadError ||
      state.jdError ||
      state.runError ||
      latestTask?.error,
  );

  return {
    // 状态
    ...state,
    task: latestTask ?? null,
    
    // 派生状态
    canRunPipeline,
    isProcessing,
    hasOutput,
    hasError,
    
    // 操作
    uploadResume: handleUploadResume,
    parseJD: handleParseJD,
    runPipeline: handleRunPipeline,
    resetWorkflow,
  };
}
