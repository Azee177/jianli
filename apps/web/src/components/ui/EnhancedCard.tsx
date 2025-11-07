'use client';

import { forwardRef, HTMLAttributes } from 'react';

interface EnhancedCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'neon' | 'gradient' | 'minimal';
  glowEffect?: boolean;
  hoverEffect?: boolean;
  className?: string;
}

export const EnhancedCard = forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ 
    variant = 'glass', 
    glowEffect = false, 
    hoverEffect = true,
    className = '',
    children,
    ...props 
  }, ref) => {
    // 简化的类名组合
    let cardClasses = 'relative overflow-hidden transition-all duration-300 ease-out transform-gpu backface-visibility-hidden rounded-xl';
    
    // Variants
    if (variant === 'default') {
      cardClasses += ' bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm';
    } else if (variant === 'glass') {
      cardClasses += ' bg-white/5 border border-white/10 backdrop-blur-xl';
    } else if (variant === 'neon') {
      cardClasses += ' bg-slate-900 border-2 border-sky-500/30';
    } else if (variant === 'gradient') {
      cardClasses += ' bg-gradient-to-br from-slate-800/80 via-slate-900/90 to-slate-800/80 border border-slate-700/30';
    } else if (variant === 'minimal') {
      cardClasses += ' bg-transparent border border-slate-600/20';
    }
    
    // Effects
    if (hoverEffect) {
      cardClasses += ' hover:scale-[1.02] hover:shadow-xl';
      
      if (variant === 'neon') {
        cardClasses += ' hover:border-sky-400/50 hover:shadow-[0_0_30px_rgba(14,165,233,0.3)]';
      } else if (variant === 'gradient') {
        cardClasses += ' hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]';
      }
    }
    
    if (className) {
      cardClasses += ` ${className}`;
    }

    return (
      <div
        ref={ref}
        className={cardClasses}
        {...props}
      >
        {/* Glow effect */}
        {glowEffect && (
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-sky-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);

EnhancedCard.displayName = 'EnhancedCard';