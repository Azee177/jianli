'use client';

import { Menu, Sparkles, User, LogOut, Settings } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { SettingsPanel } from '@/components/settings/SettingsPanel';

import type { ProgressStep } from './ProgressIndicator';

interface HeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
  progressSteps?: ProgressStep[];
  onProgressSelect?: (stepId: string) => void;
}

export function Header({
  onMenuToggle,
  isMenuOpen,
  progressSteps = [],
  onProgressSelect,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/30 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm hover:bg-white/10"
            type="button"
          >
            <Menu className="h-4 w-4" />
            <span className="hidden md:inline">
              {isMenuOpen ? 'Hide Panel' : 'Show Panel'}
            </span>
          </button>

          <div className="flex items-center gap-2 text-slate-100">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold tracking-wide">Resume Copilot</span>
          </div>
        </div>

        {progressSteps.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto">
            {progressSteps.map((step, index) => {
              const chipClasses =
                step.status === 'completed'
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25'
                  : step.status === 'current'
                  ? 'border-sky-500/40 bg-sky-500/15 text-sky-100 hover:bg-sky-500/25'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10';

              const dotClasses =
                step.status === 'completed'
                  ? 'bg-emerald-400'
                  : step.status === 'current'
                  ? 'bg-sky-400 animate-pulse'
                  : 'bg-slate-500/70';

              return (
                <div key={step.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onProgressSelect?.(step.id)}
                    title={step.description}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${chipClasses}`}
                  >
                    <span
                      className={`inline-block h-2.5 w-2.5 rounded-full ${dotClasses}`}
                    />
                    <span>{step.title}</span>
                  </button>
                  {index < progressSteps.length - 1 && (
                    <span className="h-px w-6 bg-white/15" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* User Menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition-colors"
            >
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <User className="w-4 h-4" />
              )}
              <span className="hidden md:inline text-slate-200">{user.name}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-xl">
                <div className="p-3 border-b border-white/10">
                  <p className="text-sm font-medium text-slate-200">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                  {user.subscription && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {user.subscription.plan.toUpperCase()}
                    </span>
                  )}
                </div>
                
                <div className="p-1">
                  <button
                    onClick={() => {
                      setShowSettings(true);
                      setShowUserMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    设置
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    登出
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <SettingsPanel 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </header>
  );
}
