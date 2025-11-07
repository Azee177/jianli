'use client';

import { MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import { Task } from '@/lib/types';

interface InterviewPanelProps {
  task: Task | null;
  isProcessing: boolean;
}

export function InterviewPanel({ task, isProcessing }: InterviewPanelProps) {
  const questions = task?.output?.interview_questions || [];
  const hasQuestions = questions.length > 0;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <MessageSquare className="h-4 w-4" />
        模拟面试题
      </div>
      
      {isProcessing && (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5 animate-pulse" />
          正在生成面试问题...
        </div>
      )}

      {task?.status === 'done' && hasQuestions && (
        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          已生成 {questions.length} 个面试问题
        </div>
      )}

      {hasQuestions ? (
        <ul className="mt-3 space-y-2 text-sm">
          {questions.map((question, index) => (
            <li key={index} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-slate-200">{question}</div>
              <div className="text-xs mt-1 text-slate-400">
                问题 {index + 1}
              </div>
            </li>
          ))}
        </ul>
      ) : !isProcessing && (
        <div className="mt-3 text-xs text-slate-500">
          完成简历优化后将自动生成面试问题
        </div>
      )}

      {task?.error && (
        <div className="mt-3 text-xs text-red-400">
          生成失败: {task.error}
        </div>
      )}
    </div>
  );
}