import React, { forwardRef } from 'react';
import { useTheme } from '@/context/ThemeContext';

export const InputField = forwardRef(({
  label,
  error,
  helperText,
  id,
  type = 'text',
  className = '',
  ...props
}, ref) => {
  const { glassmorphism } = useTheme();

  const inputBase = glassmorphism
    ? 'bg-slate-100/50 dark:bg-white/5 border-slate-200/50 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-white/10 focus:border-neonCyan/50 focus:ring-neonCyan/30'
    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-neonCyan focus:ring-neonCyan/30';
  
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        type={type}
        className={`w-full px-4 py-2 text-sm rounded-xl outline-none transition-all duration-300 focus:ring-2 ${inputBase} ${error ? 'border-neonRose focus:border-neonRose focus:ring-neonRose/30' : 'border'}`}
        {...props}
      />
      {error && <span className="text-xs text-neonRose mt-0.5">{error}</span>}
      {!error && helperText && <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{helperText}</span>}
    </div>
  );
});

InputField.displayName = 'InputField';
export default InputField;
