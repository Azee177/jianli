'use client';

import { LucideIcon, Sparkles, FolderOpen } from 'lucide-react';
import { useState } from 'react';
import { ProjectSelector } from '@/components/project/ProjectSelector';

export interface NavigationItem {
  key: string;
  label: string;
  icon: LucideIcon;
}

interface ActivityBarProps {
  activePanel: string | null;
  onPanelChange: (panel: string | null) => void;
  navItems: NavigationItem[];
}

export function ActivityBar({ activePanel, onPanelChange, navItems }: ActivityBarProps) {
  const [showProjects, setShowProjects] = useState(false);
  return (
    <>
      <aside 
        className="fixed left-0 top-[56px] w-[56px] h-[calc(100vh-56px)] border-r border-white/10 z-10 bg-[rgba(10,12,20,0.95)] backdrop-blur-xl"
        role="navigation"
        aria-label="工作流导航"
      >
        <div className="flex h-full flex-col items-center gap-2 p-2">
          <div 
            className="mt-1 mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10"
            role="img"
            aria-label="Resume Copilot Logo"
          >
            <Sparkles className="h-4 w-4" />
          </div>

          {/* Projects Button */}
          <button
            title="项目管理"
            onClick={() => setShowProjects(!showProjects)}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50 ${
              showProjects
                ? 'border-sky-500/30 bg-sky-500/10 text-sky-200'
                : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
            }`}
            type="button"
            aria-label={`项目管理${showProjects ? ' (当前激活)' : ''}`}
            aria-pressed={showProjects}
          >
            <FolderOpen className="h-4 w-4" />
          </button>
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = activePanel === item.key;
          return (
            <button
              key={item.key}
              title={item.label}
              onClick={() =>
                onPanelChange(active ? null : item.key)
              }
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50 ${
                active
                  ? 'border-sky-500/30 bg-sky-500/10 text-sky-200'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
              }`}
              type="button"
              aria-label={`${item.label}${active ? ' (当前激活)' : ''}`}
              aria-pressed={active}
              tabIndex={0}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
        </div>
      </aside>

      {/* Projects Panel */}
      {showProjects && (
        <div className="fixed left-[56px] top-[56px] w-80 h-[calc(100vh-56px)] border-r border-white/10 z-10 bg-[rgba(10,12,20,0.95)] backdrop-blur-xl overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-slate-200">项目管理</h2>
            <button
              onClick={() => setShowProjects(false)}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              aria-label="关闭项目面板"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ProjectSelector />
        </div>
      )}
    </>
  );
}