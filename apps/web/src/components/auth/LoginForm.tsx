'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { LoginCredentials } from '@/types/auth';
import { EnhancedButton } from '@/components/ui/EnhancedButton';
import { EnhancedInput } from '@/components/ui/EnhancedInput';
import { EnhancedCard } from '@/components/ui/EnhancedCard';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { login, isLoading } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!credentials.email || !credentials.password) {
      setError('请填写所有字段');
      return;
    }

    try {
      await login(credentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    }
  };

  const handleChange = (field: keyof LoginCredentials) => (
    value: string
  ) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <EnhancedCard className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          登录简历助手
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          使用您的账户继续
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            邮箱地址
          </label>
          <EnhancedInput
            id="email"
            type="email"
            value={credentials.email}
            onChange={handleChange('email')}
            placeholder="请输入邮箱地址"
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            密码
          </label>
          <EnhancedInput
            id="password"
            type="password"
            value={credentials.password}
            onChange={handleChange('password')}
            placeholder="请输入密码"
            disabled={isLoading}
            required
          />
        </div>

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
            {error}
          </div>
        )}

        <EnhancedButton
          type="submit"
          className="w-full"
          disabled={isLoading}
          loading={isLoading}
        >
          {isLoading ? '登录中...' : '登录'}
        </EnhancedButton>
      </form>

      {onSwitchToRegister && (
        <div className="text-center mt-4">
          <p className="text-gray-600 dark:text-gray-400">
            还没有账户？{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-blue-600 dark:text-blue-400 hover:underline"
              disabled={isLoading}
            >
              立即注册
            </button>
          </p>
        </div>
      )}
    </EnhancedCard>
  );
}