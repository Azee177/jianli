'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { RegisterCredentials } from '@/types/auth';
import { EnhancedButton } from '@/components/ui/EnhancedButton';
import { EnhancedInput } from '@/components/ui/EnhancedInput';
import { EnhancedCard } from '@/components/ui/EnhancedCard';

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { register, isLoading } = useAuth();
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    email: '',
    password: '',
    name: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!credentials.email || !credentials.password || !credentials.name) {
      setError('请填写所有字段');
      return;
    }

    if (credentials.password !== confirmPassword) {
      setError('密码确认不匹配');
      return;
    }

    if (credentials.password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }

    try {
      await register(credentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败');
    }
  };

  const handleChange = (field: keyof RegisterCredentials) => (
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
          注册简历助手
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          创建您的账户开始使用
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            姓名
          </label>
          <EnhancedInput
            id="name"
            type="text"
            value={credentials.name}
            onChange={handleChange('name')}
            placeholder="请输入您的姓名"
            disabled={isLoading}
            required
          />
        </div>

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
            placeholder="请输入密码（至少6位）"
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            确认密码
          </label>
          <EnhancedInput
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(value) => setConfirmPassword(value)}
            placeholder="请再次输入密码"
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
          {isLoading ? '注册中...' : '注册'}
        </EnhancedButton>
      </form>

      {onSwitchToLogin && (
        <div className="text-center mt-4">
          <p className="text-gray-600 dark:text-gray-400">
            已有账户？{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-600 dark:text-blue-400 hover:underline"
              disabled={isLoading}
            >
              立即登录
            </button>
          </p>
        </div>
      )}
    </EnhancedCard>
  );
}