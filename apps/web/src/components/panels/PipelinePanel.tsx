'use client';

import { Play, Pause, RotateCcw, CheckCircle2, Clock, AlertCircle, Zap } from 'lucide-react';
import { Task } from '@/lib/types';

interface PipelinePanelProps {
  canRunPipeline: boolean;
  isProcessing: boolean;
  task: Task | null;
  onRunPipeline: () => Promise<void>;
  onReset: () => void;
}

export function PipelinePanel({ 
  canRunPipeline, 
  isProcessing, 
  task, 
  onRunPipeline, 
  onReset 
}: PipelinePanelProps) {
  const getStatusInfo = () => {
    if (!task) return null;
    
    switch (task.status) {
      case 'queued':
        return { icon: Clock, text: '排队中...', color: 'text-yellow-400' };
      case 'running':
        return { icon: Clock, text: '处理中...', color: 'text-blue-400' };
      case 'done':
        return { icon: CheckCircle2, text: '完成', color: 'text-emerald-400' };
      case 'error':
        return { icon: AlertCircle, text: '失败', color: 'text-red-400' };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Zap className="h-4 w-4" />
        AI 流水线
      </div>
      
      <div className="mt-2 text-xs text-slate-400">
        一键生成简历草稿 + 面试题 + 知识点
      </div>

      <div className="mt-3 space-y-3">
        <button
          onClick={onRunPipeline}
          disabled={!canRunPipeline || isProcessing}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Clock className="h-4 w-4 animate-pulse" />
              处理中...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              启动流水线
            </>
          )}
        </button>

        {task && (
          <button
            onClick={onReset}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-400 hover:bg-white/10"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            重置流程
          </button>
        )}
      </div>

      {/* 状态显示 */}
      {statusInfo && task && (
        <div className="mt-3 space-y-2">
          <div className={`flex items-center gap-2 text-xs ${statusInfo.color}`}>
            <statusInfo.icon className="h-3.5 w-3.5" />
            {statusInfo.text}
          </div>
          
          {task.status === 'done' && (
            <div className="text-xs text-slate-400 space-y-1">
              {task.cost && <div>成本: ¥{task.cost.toFixed(3)}</div>}
              {task.latency_ms && <div>耗时: {(task.latency_ms / 1000).toFixed(1)}s</div>}
            </div>
          )}
          
          {task.error && (
            <div className="text-xs text-red-400">
              错误: {task.error}
            </div>
          )}
        </div>
      )}

      {!canRunPipeline && !task && (
        <div className="mt-3 text-xs text-slate-500">
          请先上传简历并解析JD
        </div>
      )}
    </div>
  );
}
