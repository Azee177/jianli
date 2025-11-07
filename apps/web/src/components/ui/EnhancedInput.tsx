'use client';

import { useState } from 'react';

interface EnhancedInputProps {
  id?: string;
  type?: 'text' | 'email' | 'password' | 'search';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  error?: string;
  success?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function EnhancedInput({
  id,
  type = 'text',
  placeholder,
  value = '',
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  error,
  success = false,
  required = false,
  autoFocus = false,
  className = '',
  ...props
}: EnhancedInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  // 简化的类名组合
  let inputClasses = 'w-full px-4 py-3 text-base bg-white/5 border rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 backdrop-blur-sm text-slate-200 placeholder-slate-400';
  
  if (error) {
    inputClasses += ' border-red-500 focus:border-red-400 focus:ring-red-500/50';
  } else if (success) {
    inputClasses += ' border-green-500 focus:border-green-400 focus:ring-green-500/50';
  } else {
    inputClasses += ' border-slate-600 focus:border-sky-500 focus:ring-sky-500/50';
  }
  
  if (disabled) {
    inputClasses += ' opacity-50 cursor-not-allowed';
  }

  if (className) {
    inputClasses += ` ${className}`;
  }

  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
        className={inputClasses}
        {...props}
      />
      
      {/* Error/Success message */}
      {error && (
        <p className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
      {success && !error && (
        <p className="mt-2 text-sm text-green-400">
          输入有效
        </p>
      )}
    </div>
  );
}