'use client';

import { Menu, User, LogOut, Settings } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { Logo } from '@/components/common/Logo';

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
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            type="button"
          >
            <Menu className="h-4 w-4" />
            <span className="hidden md:inline">
              {isMenuOpen ? 'Hide Panel' : 'Show Panel'}
            </span>
          </button>

          <div className="flex items-center gap-2 text-gray-900">
            <Logo className="w-7 h-7" />
            <span className="font-semibold tracking-wide">Resume Copilot</span>
          </div>
        </div>

        {progressSteps.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto">
            {progressSteps.map((step, index) => {
              const chipClasses =
                step.status === 'completed'
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : step.status === 'current'
                  ? 'border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100';

              const dotClasses =
                step.status === 'completed'
                  ? 'bg-emerald-500'
                  : step.status === 'current'
                  ? 'bg-blue-600 animate-pulse'
                  : 'bg-gray-400';

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
                    <span className="h-px w-6 bg-gray-200" />
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
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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
              <span className="hidden md:inline">{user.name}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-gray-200 bg-white backdrop-blur-xl shadow-xl">
                <div className="p-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-600">{user.email}</p>
                  {user.subscription && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 border border-blue-300">
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
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    设置
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
