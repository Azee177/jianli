'use client';

import React from 'react';
import { useSettings } from '@/hooks/useSettings';
import { EnhancedCard } from '@/components/ui/EnhancedCard';
import { EnhancedButton } from '@/components/ui/EnhancedButton';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { 
    settings, 
    updateTheme, 
    updateLanguage, 
    updateAutoSave,
    isLoading 
  } = useSettings();

  if (!isOpen || !settings) return null;

  const handleThemeChange = async (theme: 'dark' | 'light' | 'auto') => {
    try {
      await updateTheme(theme);
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };

  const handleLanguageChange = async (language: 'zh' | 'en') => {
    try {
      await updateLanguage(language);
    } catch (error) {
      console.error('Failed to update language:', error);
    }
  };

  const handleAutoSaveChange = async (enabled: boolean) => {
    try {
      await updateAutoSave(enabled);
    } catch (error) {
      console.error('Failed to update auto-save:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        <EnhancedCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-200">设置</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">加载设置中...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Theme Settings */}
              <div>
                <h3 className="text-lg font-medium text-slate-200 mb-3">外观</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      主题
                    </label>
                    <div className="flex gap-2">
                      {(['light', 'dark', 'auto'] as const).map((theme) => (
                        <button
                          key={theme}
                          onClick={() => handleThemeChange(theme)}
                          className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                            settings.theme === theme
                              ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                              : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          {theme === 'light' ? '浅色' : theme === 'dark' ? '深色' : '自动'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      语言
                    </label>
                    <div className="flex gap-2">
                      {(['zh', 'en'] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => handleLanguageChange(lang)}
                          className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                            settings.language === lang
                              ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                              : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          {lang === 'zh' ? '中文' : 'English'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Auto-save Settings */}
              <div>
                <h3 className="text-lg font-medium text-slate-200 mb-3">编辑器</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-slate-300">
                        自动保存
                      </label>
                      <p className="text-xs text-slate-400 mt-1">
                        自动保存您的编辑内容
                      </p>
                    </div>
                    <button
                      onClick={() => handleAutoSaveChange(!settings.autoSave)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.autoSave ? 'bg-sky-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.autoSave ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {settings.autoSave && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        自动保存间隔: {settings.autoSaveInterval} 秒
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="300"
                        step="5"
                        value={settings.autoSaveInterval}
                        onChange={(e) => updateAutoSave(settings.autoSave, parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>5秒</span>
                        <span>5分钟</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <EnhancedButton
                  variant="secondary"
                  onClick={onClose}
                >
                  关闭
                </EnhancedButton>
              </div>
            </div>
          )}
        </EnhancedCard>
      </div>
    </div>
  );
}