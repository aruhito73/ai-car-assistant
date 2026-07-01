import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export const GlassButton = ({ 
  children, 
  variant = 'primary', // primary, secondary, danger, success, warning
  size = 'md',        // sm, md, lg
  className = '', 
  onClick, 
  disabled = false,
  icon: Icon,
  ...props 
}) => {
  const { glassmorphism } = useTheme();
  
  const variantStyles = {
    primary: glassmorphism 
      ? 'bg-neonCyan/10 dark:bg-neonCyan/20 text-cyan-600 dark:text-neonCyan hover:bg-neonCyan/20 dark:hover:bg-neonCyan/30 border border-cyan-400/30 dark:border-neonCyan/30 focus:ring-neonCyan/50 shadow-neon-cyan/5 dark:shadow-neon-cyan/10'
      : 'bg-cyan-600 text-white dark:bg-neonCyan dark:text-darkBg hover:bg-cyan-500 dark:hover:bg-cyan-400 font-semibold focus:ring-neonCyan/50',
    secondary: glassmorphism
      ? 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 focus:ring-slate-500'
      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-700 focus:ring-slate-500',
    danger: glassmorphism
      ? 'bg-neonRose/10 dark:bg-neonRose/20 text-rose-600 dark:text-neonRose hover:bg-neonRose/20 dark:hover:bg-neonRose/30 border border-rose-400/30 dark:border-neonRose/30 focus:ring-neonRose/50 shadow-neon-rose/5 dark:shadow-neon-rose/10'
      : 'bg-rose-600 text-white dark:bg-neonRose dark:text-white hover:bg-rose-500 dark:hover:bg-rose-700 focus:ring-neonRose/50',
    success: glassmorphism
      ? 'bg-neonEmerald/10 dark:bg-neonEmerald/20 text-emerald-600 dark:text-neonEmerald hover:bg-neonEmerald/20 dark:hover:bg-neonEmerald/30 border border-emerald-400/30 dark:border-neonEmerald/30 focus:ring-neonEmerald/50 shadow-neon-emerald/5 dark:shadow-neon-emerald/10'
      : 'bg-emerald-600 text-white dark:bg-neonEmerald dark:text-white hover:bg-emerald-500 dark:hover:bg-emerald-700 focus:ring-neonEmerald/50',
    warning: glassmorphism
      ? 'bg-neonAmber/10 dark:bg-neonAmber/20 text-amber-700 dark:text-neonAmber hover:bg-neonAmber/20 dark:hover:bg-neonAmber/30 border border-amber-400/30 dark:border-neonAmber/30 focus:ring-neonAmber/50 shadow-neon-amber/5 dark:shadow-neon-amber/10'
      : 'bg-amber-600 text-white dark:bg-neonAmber dark:text-darkBg hover:bg-amber-500 dark:hover:bg-amber-400 font-semibold focus:ring-neonAmber/50'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl'
  };

  const disabledStyle = 'opacity-50 cursor-not-allowed pointer-events-none';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 focus:outline-none focus:ring-2 ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? disabledStyle : ''} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      {children}
    </button>
  );
};

export default GlassButton;
