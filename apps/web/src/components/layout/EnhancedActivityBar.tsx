'use client';

import { LucideIcon, Sparkles } from 'lucide-react';
import { EnhancedTooltip } from '../ui/EnhancedTooltip';
// 本地cn函数
function cn(baseClasses: string, conditionalClasses?: Record<string, boolean>): string {
  let classes = baseClasses;
  if (conditionalClasses) {
    Object.entries(conditionalClasses).forEach(([className, condition]) => {
      if (condition) {
        classes += ` ${className}`;
      }
    });
  }
  return classes;
}

export interface NavigationItem {
  key: string;
  label: string;
  icon: LucideIcon;
}

interface EnhancedActivityBarProps {
  activePanel: string | null;
  onPanelChange: (panel: string | null) => void;
  navItems: NavigationItem[];
}

export function EnhancedActivityBar({ 
  activePanel, 
  onPanelChange, 
  navItems 
}: EnhancedActivityBarProps) {
  return (
    <aside 
      className="fixed left-0 top-[56px] w-[56px] h-[calc(100vh-56px)] border-r border-white/10 z-10 bg-[rgba(10,12,20,0.95)] backdrop-blur-xl panel-slide-in-left"
      role="navigation"
      aria-label="工作流导航"
    >
      <div className="flex h-full flex-col items-center gap-2 p-2">
        {/* Logo */}
        <div 
          className="mt-1 mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 pulse-glow float-animation"
          role="img"
          aria-label="Resume Copilot Logo"
        >
          <Sparkles className="h-4 w-4" />
        </div>

        {/* Navigation Items */}
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = activePanel === item.key;
          
          return (
            <EnhancedTooltip
              key={item.key}
              content={item.label}
              position="right"
              variant="neon"
            >
              <button
                onClick={() => onPanelChange(active ? null : item.key)}
                className={cn(
                  'group relative inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500/50 magnetic-btn',
                  {
                    'border-sky-500/30 bg-sky-500/10 text-sky-200 shadow-[0_0_15px_rgba(14,165,233,0.3)]': active,
                    'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:scale-105 hover:shadow-lg': !active,
                  }
                )}
                type="button"
                aria-label={`${item.label}${active ? ' (当前激活)' : ''}`}
                aria-pressed={active}
                tabIndex={0}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* 背景光效 */}
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 via-blue-500/20 to-sky-500/20 rounded-lg animate-pulse" />
                )}
                
                {/* 图标 */}
                <Icon className={cn(
                  'h-4 w-4 transition-all duration-300 relative z-10',
                  {
                    'text-sky-200 drop-shadow-[0_0_8px_rgba(14,165,233,0.8)]': active,
                    'text-slate-400 group-hover:text-slate-200': !active,
                  }
                )} />
                
                {/* 活跃状态指示器 */}
                {active && (
                  <div className="absolute -right-1 -top-1 w-2 h-2 bg-sky-400 rounded-full animate-ping" />
                )}
                
                {/* 悬停光效 */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-full group-hover:translate-x-full" 
                     style={{ transition: 'transform 0.6s ease-out, opacity 0.3s ease-out' }} />
              </button>
            </EnhancedTooltip>
          );
        })}

        {/* 底部装饰 */}
        <div className="mt-auto mb-2 w-8 h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />
      </div>
    </aside>
  );
}