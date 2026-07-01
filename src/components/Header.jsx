import React from 'react';
import { Menu, Sun, Moon, Layers, Layers3, AlertTriangle } from 'lucide-react';
import { useCar } from '@/context/CarContext';
import { useTheme } from '@/context/ThemeContext';

export const Header = ({ currentView, onMenuToggle, onViewChange }) => {
  const { car } = useCar();
  const { theme, toggleTheme, glassmorphism, toggleGlassmorphism, t } = useTheme();

  const viewTitles = {
    dashboard: t('Обзор автомобиля', 'Vehicle Overview'),
    profile: t('Профиль автомобиля', 'Vehicle Profile'),
    parts: t('Запчасти и каталоги', 'Parts & Catalogs'),
    services: t('Журнал обслуживания', 'Maintenance Log'),
    finance: t('Финансовая аналитика', 'Financial Analytics'),
    chat: t('ИИ-Консультант', 'AI Assistant')
  };

  return (
    <header className={`
      flex h-16 items-center justify-between px-4 md:px-6 border-b z-30
      ${glassmorphism 
        ? 'bg-white/40 border-slate-200/50 dark:bg-darkCard/40 dark:border-white/5 backdrop-blur-md' 
        : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800'}
    `}>
      {/* Menu Hamburger Trigger & Page Title */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuToggle}
          className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold md:text-xl text-slate-800 dark:text-slate-200">
          {viewTitles[currentView] || t('ИИ Автоассистент', 'AI Car Assistant')}
        </h1>
      </div>

      {/* Car Quick Spec Widget + System theme/glass controls */}
      <div className="flex items-center gap-4">
        {/* active car widget */}
        <div 
          onClick={() => onViewChange('profile')}
          className={`
            hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200
            ${car 
              ? 'bg-emerald-50 dark:bg-neonEmerald/10 border border-emerald-200 dark:border-neonEmerald/30 text-emerald-700 dark:text-neonEmerald hover:bg-emerald-100 dark:hover:bg-neonEmerald/20' 
              : 'bg-rose-50 dark:bg-neonRose/10 border border-rose-200 dark:border-neonRose/30 text-rose-700 dark:text-neonRose hover:bg-rose-100 dark:hover:bg-neonRose/20'}
          `}
        >
          {car ? (
            <span>
              {car.make} {car.model} • {car.currentMileage?.toLocaleString()} {t('км', 'km')}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> {t('Нет автомобиля', 'No vehicle')}
            </span>
          )}
        </div>

        {/* Theme/Layout controls */}
        <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-white/10 pl-4">
          {/* Glass Toggle */}
          <button 
            onClick={toggleGlassmorphism}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${glassmorphism 
                ? 'text-cyan-600 bg-cyan-50 dark:text-neonCyan dark:bg-neonCyan/10 hover:bg-cyan-100 dark:hover:bg-neonCyan/20' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'}
            `}
            title="Toggle Glassmorphism"
          >
            {glassmorphism ? <Layers className="w-4 h-4" /> : <Layers3 className="w-4 h-4" />}
          </button>

          {/* Theme Mode Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
