'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

interface EnhancedTooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'default' | 'glass' | 'neon';
  delay?: number;
  disabled?: boolean;
  className?: string;
}

export function EnhancedTooltip({
  content,
  children,
  position = 'top',
  variant = 'default',
  delay = 500,
  disabled = false,
  className = '',
}: EnhancedTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (disabled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Position classes
  const getPositionClasses = () => {
    switch (actualPosition) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  // Arrow classes
  const getArrowClasses = () => {
    switch (actualPosition) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent';
    }
  };

  // Tooltip classes
  let tooltipClasses = 'absolute z-50 px-3 py-2 text-sm rounded-lg pointer-events-none transform transition-all duration-200 ease-out max-w-xs break-words';
  
  // Variants
  if (variant === 'default') {
    tooltipClasses += ' bg-slate-800 text-slate-200 border border-slate-600 shadow-lg';
  } else if (variant === 'glass') {
    tooltipClasses += ' bg-black/80 text-white border border-white/20 backdrop-blur-md shadow-2xl';
  } else if (variant === 'neon') {
    tooltipClasses += ' bg-slate-900 text-sky-200 border border-sky-500/50 shadow-[0_0_20px_rgba(14,165,233,0.3)]';
  }
  
  // Visibility
  if (!isVisible) {
    tooltipClasses += ' opacity-0 scale-95 translate-y-1';
  } else {
    tooltipClasses += ' opacity-100 scale-100 translate-y-0';
  }
  
  // Position
  tooltipClasses += ` ${getPositionClasses()}`;
  
  if (className) {
    tooltipClasses += ` ${className}`;
  }

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={tooltipClasses}
        role="tooltip"
      >
        {content}
        
        {/* Arrow */}
        <div
          className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`}
          style={{
            borderTopColor: variant === 'neon' ? 'rgb(14 165 233 / 0.5)' : 
                           variant === 'glass' ? 'rgba(255, 255, 255, 0.2)' : 
                           'rgb(71 85 105)',
          }}
        />
      </div>
    </div>
  );
}