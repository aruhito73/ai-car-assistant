import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export const GlassCard = ({ 
  children, 
  className = '', 
  hover = false, 
  onClick, 
  ...props 
}) => {
  const { glassmorphism } = useTheme();
  
  const baseStyle = glassmorphism 
    ? 'bg-white/70 dark:bg-darkCard backdrop-blur-xl border border-slate-200/50 dark:border-white/[0.08] shadow-sm dark:shadow-none text-slate-800 dark:text-slate-100'
    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-900 dark:text-slate-100';
    
  const hoverStyle = hover 
    ? 'transition-all duration-300 ease-spring hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-glass-hover hover:border-slate-300 dark:hover:border-white/[0.15] active:scale-[0.98]' 
    : '';

  return (
    <div 
      className={`${baseStyle} rounded-2xl p-6 ${hoverStyle} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
