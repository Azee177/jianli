'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';

interface EnhancedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  glowEffect?: boolean;
  className?: string;
}

export const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    glowEffect = true,
    disabled,
    className = '',
    children,
    ...props 
  }, ref) => {
    // 简化的类名组合
    let buttonClasses = 'relative inline-flex items-center justify-center font-medium transition-all duration-300 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900';
    
    // Variants
    if (variant === 'primary') {
      buttonClasses += ' bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 focus:ring-sky-500';
    } else if (variant === 'secondary') {
      buttonClasses += ' bg-gradient-to-r from-slate-700 to-slate-600 text-slate-200 hover:from-slate-600 hover:to-slate-500 focus:ring-slate-500';
    } else if (variant === 'ghost') {
      buttonClasses += ' bg-transparent text-slate-300 hover:bg-white/10 hover:text-white focus:ring-slate-500';
    } else if (variant === 'danger') {
      buttonClasses += ' bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 focus:ring-red-500';
    } else if (variant === 'success') {
      buttonClasses += ' bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-500 hover:to-green-600 focus:ring-green-500';
    }
    
    // Sizes
    if (size === 'sm') {
      buttonClasses += ' px-3 py-1.5 text-sm';
    } else if (size === 'md') {
      buttonClasses += ' px-4 py-2 text-base';
    } else if (size === 'lg') {
      buttonClasses += ' px-6 py-3 text-lg';
    }
    
    // States
    if (disabled || loading) {
      buttonClasses += ' opacity-50 cursor-not-allowed';
    } else {
      buttonClasses += ' cursor-pointer hover:scale-105 active:scale-95';
    }
    
    if (className) {
      buttonClasses += ` ${className}`;
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={buttonClasses}
        {...props}
      >
        {/* Glow effect */}
        {glowEffect && !disabled && !loading && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-500/20 via-blue-500/20 to-sky-500/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
        
        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {loading && (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          )}
          {children}
        </span>
      </button>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';