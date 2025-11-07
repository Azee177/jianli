'use client';

import { ArrowRight, CheckCircle, Circle, Clock } from 'lucide-react';

export interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  onStepClick?: (stepId: string) => void;
  className?: string;
}

export function ProgressIndicator({
  steps,
  onStepClick,
  className = 'p-4',
}: ProgressIndicatorProps) {
  const completedCount = steps.filter(step => step.status === 'completed').length;
  const progressPercentage =
    steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  const statusStyles = {
    completed:
      'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-200',
    current:
      'bg-sky-500/10 border-sky-500/30 hover:bg-sky-500/20 text-sky-200',
    pending: 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400',
  } as const;

  const dotStyles = {
    completed: 'bg-emerald-400',
    current: 'bg-sky-400 animate-pulse',
    pending: 'bg-slate-500/70',
  } as const;

  const descriptionStyles = {
    completed: 'text-emerald-300/70',
    current: 'text-sky-300/70',
    pending: 'text-slate-500',
  } as const;

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="mb-1 text-sm font-medium text-slate-200">项目进度</h3>
        <p className="text-xs text-slate-400">简历定制化流程</p>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          return (
            <div key={step.id} className="relative">
              <button
                type="button"
                onClick={() => onStepClick?.(step.id)}
                className={`w-full rounded-lg border p-3 text-left transition-all duration-200 ${
                  statusStyles[step.status]
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {step.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                    ) : step.status === 'current' ? (
                      <Clock className="h-5 w-5 text-sky-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">{step.title}</h4>
                      {step.status === 'current' && (
                        <ArrowRight className="h-3 w-3 text-sky-400 animate-pulse" />
                      )}
                    </div>
                    <p className={`mt-1 text-xs ${descriptionStyles[step.status]}`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              </button>

              {!isLast && (
                <div className="absolute left-6 top-12 h-3 w-px bg-white/10" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-slate-400">整体进度</span>
          <span className="text-xs text-slate-300">{progressPercentage}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/10">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export const defaultProgressSteps: ProgressStep[] = [
  {
    id: 'upload',
    title: '简历上传',
    description: 'PDF 解析与 OCR 识别',
    status: 'pending',
  },
  {
    id: 'analysis',
    title: '岗位分析',
    description: '目标公司与职位确认',
    status: 'pending',
  },
  {
    id: 'matching',
    title: 'JD 匹配',
    description: '需求分析与共性提炼',
    status: 'pending',
  },
  {
    id: 'optimization',
    title: '简历优化',
    description: '内容调整与针对性改进',
    status: 'pending',
  },
  {
    id: 'interview',
    title: '面试准备',
    description: '重点问题与学习资源',
    status: 'pending',
  },
  {
    id: 'delivery',
    title: '投递跟踪',
    description: '导出简历与投递记录',
    status: 'pending',
  },
];
