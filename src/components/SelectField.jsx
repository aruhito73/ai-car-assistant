import React, { forwardRef } from 'react';
import { useTheme } from '@/context/ThemeContext';

export const SelectField = forwardRef(({
  label,
  options = [],
  error,
  helperText,
  id,
  className = '',
  placeholder = 'Select an option',
  ...props
}, ref) => {
  const { glassmorphism } = useTheme();

  const selectBase = glassmorphism
    ? 'bg-slate-100/90 dark:bg-slate-900/90 border-slate-200/50 dark:border-white/10 text-slate-800 dark:text-white focus:border-neonCyan/50 focus:ring-neonCyan/30'
    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:border-neonCyan focus:ring-neonCyan/30';

  const borderState = error
    ? 'border-neonRose focus:border-neonRose focus:ring-neonRose/30'
    : 'border';

  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={id}
          className={`w-full px-4 py-2 pr-10 text-sm rounded-xl outline-none transition-all duration-300 focus:ring-2 cursor-pointer appearance-none ${selectBase} ${borderState}`}
          {...props}
        >
          {placeholder && <option value="" disabled className="bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-450">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white text-slate-800 dark:bg-slate-900 dark:text-white">
              {opt.label}
            </option>
          ))}
        </select>
        
        {/* Custom Arrow overlay */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>
      {error && <span className="text-xs text-neonRose mt-0.5">{error}</span>}
      {!error && helperText && <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{helperText}</span>}
    </div>
  );
});

SelectField.displayName = 'SelectField';
export default SelectField;
