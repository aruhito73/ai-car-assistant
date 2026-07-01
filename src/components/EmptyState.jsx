import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }) => {
  const { t } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center h-[60vh] animate-in fade-in zoom-in-95 duration-500">
      <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center mb-6 shadow-inner">
        <div className="w-16 h-16 rounded-full bg-slate-200/50 dark:bg-white/[0.08] flex items-center justify-center relative">
          <div className="absolute inset-0 bg-neonCyan/20 rounded-full blur-xl animate-pulse" />
          <Icon className="w-8 h-8 text-slate-400 dark:text-slate-500 relative z-10" />
        </div>
      </div>
      
      <h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
        {title}
      </h3>
      
      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-8 leading-relaxed">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <button 
          onClick={onAction}
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ease-spring hover:-translate-y-1 active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
