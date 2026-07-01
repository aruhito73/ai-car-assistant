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
    ? 'bg-white/60 dark:bg-darkCard backdrop-blur-md border border-slate-200/50 dark:border-white/10 shadow-lg dark:shadow-glass text-slate-800 dark:text-slate-100'
    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-lg text-slate-900 dark:text-slate-100';
    
  const hoverStyle = hover 
    ? 'transition-all duration-300 hover:border-cyan-400 dark:hover:border-neonCyan/50 hover:shadow-lg dark:hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
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
