'use client';

import { BookOpen, ExternalLink, CheckCircle2, Clock } from 'lucide-react';
import { Task } from '@/lib/types';

interface KnowledgePanelProps {
  task: Task | null;
  isProcessing: boolean;
}

export function KnowledgePanel({ task, isProcessing }: KnowledgePanelProps) {
  const knowledgeItems = task?.output?.knowledge_items || [];
  const hasKnowledge = knowledgeItems.length > 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <BookOpen className="h-4 w-4" />
        知识点推荐
      </div>
      
      {isProcessing && (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5 animate-pulse" />
          正在生成学习资源...
        </div>
      )}

      {task?.status === 'done' && hasKnowledge && (
        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          已推荐 {knowledgeItems.length} 个学习资源
        </div>
      )}

      {hasKnowledge ? (
        <ul className="mt-3 space-y-3 text-sm">
          {knowledgeItems.map((item, index) => (
            <li key={index} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="font-medium text-slate-200">{item.title}</div>
                  <div className="mt-1 text-xs text-slate-400">{item.why}</div>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-xs text-sky-200 hover:bg-sky-500/20"
                >
                  <ExternalLink className="h-3 w-3" />
                  学习
                </a>
              </div>
            </li>
          ))}
        </ul>
      ) : !isProcessing && (
        <div className="mt-3 text-xs text-slate-500">
          完成简历优化后将推荐相关学习资源
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