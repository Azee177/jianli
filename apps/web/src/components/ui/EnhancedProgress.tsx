'use client';

import { useEffect, useState } from 'react';

interface EnhancedProgressProps {
  value: number;
  max?: number;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'pink';
  variant?: 'default' | 'gradient' | 'neon' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  glowEffect?: boolean;
  className?: string;
}

export function EnhancedProgress({
  value,
  max = 100,
  color = 'blue',
  variant = 'default',
  size = 'md',
  showLabel = false,
  label,
  animated = true,
  glowEffect = false,
  className = '',
}: EnhancedProgressProps) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayValue(value);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, animated]);

  const percentage = Math.min(Math.max((displayValue / max) * 100, 0), 100);

  // Color classes
  const colorClasses = {
    blue: {
      bg: 'from-blue-500 to-sky-500',
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.5)]',
    },
    green: {
      bg: 'from-green-500 to-emerald-500',
      glow: 'shadow-[0_0_20px_rgba(34,197,94,0.5)]',
    },
    red: {
      bg: 'from-red-500 to-rose-500',
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]',
    },
    yellow: {
      bg: 'from-yellow-500 to-amber-500',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.5)]',
    },
    purple: {
      bg: 'from-purple-500 to-violet-500',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.5)]',
    },
    pink: {
      bg: 'from-pink-500 to-rose-500',
      glow: 'shadow-[0_0_20px_rgba(236,72,153,0.5)]',
    },
  };

  // Size classes
  let sizeClasses = '';
  if (size === 'sm') {
    sizeClasses = 'h-2';
  } else if (size === 'md') {
    sizeClasses = 'h-3';
  } else if (size === 'lg') {
    sizeClasses = 'h-4';
  }

  // Container classes
  let containerClasses = `relative w-full ${sizeClasses} bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm`;
  
  if (className) {
    containerClasses += ` ${className}`;
  }

  // Fill classes
  let fillClasses = 'h-full rounded-full transition-all duration-1000 ease-out relative';
  
  if (variant === 'default' || variant === 'gradient') {
    fillClasses += ` bg-gradient-to-r ${colorClasses[color].bg}`;
  } else if (variant === 'neon') {
    fillClasses += ` bg-gradient-to-r ${colorClasses[color].bg}`;
    if (glowEffect) {
      fillClasses += ` ${colorClasses[color].glow}`;
    }
  } else if (variant === 'pulse') {
    fillClasses += ` bg-gradient-to-r ${colorClasses[color].bg} animate-pulse`;
  }

  return (
    <div className="space-y-2">
      {/* Label */}
      {showLabel && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-300">{label || 'Progress'}</span>
          <span className="text-slate-400">{Math.round(percentage)}%</span>
        </div>
      )}
      
      {/* Progress Bar */}
      <div className={containerClasses}>
        {/* Background glow */}
        {glowEffect && variant === 'neon' && (
          <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses[color].bg} opacity-20 blur-sm`} />
        )}
        
        {/* Fill */}
        <div
          className={fillClasses}
          style={{ width: `${percentage}%` }}
        >
          {/* Shine effect */}
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
          )}
        </div>
        
        {/* Pulse overlay */}
        {variant === 'pulse' && (
          <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses[color].bg} opacity-50 animate-pulse`} />
        )}
      </div>
    </div>
  );
}