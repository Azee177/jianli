'use client';

import { ReactNode, useCallback } from 'react';
import { X, MessageSquare, Sparkles } from 'lucide-react';

interface SmartAssistantProps {
  width: number;
  onResize: (width: number) => void;
  onToggle: () => void;
  children?: ReactNode;
  minWidth?: number;
  maxWidth?: number;
}

export function SmartAssistant({
  width,
  onResize,
  onToggle,
  children,
  minWidth = 320,
  maxWidth = 600
}: SmartAssistantProps) {
  const handleResizeStart = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const startX = event.clientX;
      const startWidth = width;
      const handle = event.currentTarget;

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const delta = startX - moveEvent.clientX;
        const nextWidth = Math.min(
          maxWidth,
          Math.max(minWidth, startWidth + delta),
        );
        onResize(nextWidth);
      };

      const cleanup = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', cleanup);
        window.removeEventListener('pointercancel', cleanup);
        try {
          handle.releasePointerCapture(event.pointerId);
        } catch {
          // Ignore if capture was not set
        }
      };

      try {
        handle.setPointerCapture(event.pointerId);
      } catch {
        // setPointerCapture may throw if the pointer is already captured
      }

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', cleanup);
      window.addEventListener('pointercancel', cleanup);
    },
    [maxWidth, minWidth, width, onResize],
  );

  const handleDoubleClick = () => {
    onResize(400); // Reset to default width
  };

  return (
    <div className="relative flex h-full flex-col border-l border-white/10 bg-[rgba(10,12,20,0.95)] shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/20 border border-sky-500/30">
            <Sparkles className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-slate-200">智能助手</h2>
            <p className="text-xs text-slate-400">AI 简历优化顾问</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          title="隐藏助手面板"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        {children || <DefaultAssistantContent />}
      </div>

      {/* Resize handle */}
      <div
        className="absolute -left-2 top-0 bottom-0 w-3 cursor-col-resize rounded-r-full transition-all duration-200 hover:bg-sky-500/30"
        onPointerDown={handleResizeStart}
        onDoubleClick={handleDoubleClick}
      />
    </div>
  );
}

function DefaultAssistantContent() {
  return (
    <div className="p-4 space-y-4">
      <div className="text-center py-8">
        <MessageSquare className="w-12 h-12 mx-auto text-slate-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-200 mb-2">
          欢迎使用智能助手
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          我是你的专属简历优化顾问，可以帮助你：
        </p>
        <div className="space-y-2 text-left">
          <div className="flex items-start gap-2 text-sm">
            <span className="text-sky-400">•</span>
            <span className="text-slate-300">分析目标岗位需求</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <span className="text-sky-400">•</span>
            <span className="text-slate-300">优化简历内容匹配度</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <span className="text-sky-400">•</span>
            <span className="text-slate-300">准备面试重点问题</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <span className="text-sky-400">•</span>
            <span className="text-slate-300">提供学习资源推荐</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h4 className="text-sm font-medium text-slate-200 mb-2">快速开始</h4>
        <p className="text-xs text-slate-400 mb-3">
          选择简历中的任意内容，我会为你提供针对性的优化建议
        </p>
        <button className="w-full py-2 px-3 bg-sky-500/20 border border-sky-500/30 rounded-lg text-sm text-sky-200 hover:bg-sky-500/30 transition-colors">
          开始对话
        </button>
      </div>
    </div>
  );
}
