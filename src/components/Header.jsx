import React from 'react';
import { Menu, Sun, Moon, Layers, Layers3, AlertTriangle } from 'lucide-react';
import { useCar } from '@/context/CarContext';
import { useTheme } from '@/context/ThemeContext';

export const Header = ({ currentView, onMenuToggle, onViewChange, isScrolled = false }) => {
  const { car } = useCar();
  const { theme, toggleTheme, glassmorphism, toggleGlassmorphism, t } = useTheme();

  const viewTitles = {
    dashboard: t('Обзор автомобиля', 'Vehicle Overview'),
    profile: t('Профиль автомобиля', 'Vehicle Profile'),
    parts: t('Запчасти и каталоги', 'Parts & Catalogs'),
    services: t('Журнал обслуживания', 'Maintenance Log'),
    finance: t('Финансовая аналитика', 'Financial Analytics'),
    chat: t('ИИ-Консультант', 'AI Assistant'),
    documents: t('Документы автомобиля', 'Vehicle Documents'),
    fuel: t('Журнал заправок', 'Fuel Diary'),
    obd: t('Справочник OBD-2', 'OBD-2 Finder'),
    settings: t('Настройки приложения', 'Settings'),
    tires: t('Шинный калькулятор', 'Tire Calculator'),
    checklists: t('Чек-листы подготовки авто', 'Car Checklists'),
    fluids: t('Состояние тех. жидкостей', 'Technical Fluids'),
    savings: t('Калькулятор окупаемости', 'Savings Simulator')
  };

  const headerBgClass = glassmorphism
    ? isScrolled 
      ? 'bg-white/70 border-slate-200/50 dark:bg-darkBg/80 dark:border-white/[0.08] backdrop-blur-xl shadow-sm'
      : 'bg-transparent border-transparent dark:border-transparent'
    : isScrolled
      ? 'bg-white border-slate-200 dark:bg-[#09090b] dark:border-white/[0.08] shadow-sm'
      : 'bg-transparent border-transparent dark:border-transparent';

  return (
    <header className={`
      flex h-16 items-center justify-between px-4 md:px-8 z-30 transition-all duration-500 ease-out-expo border-b
      ${headerBgClass}
    `}>
      {/* Menu Hamburger Trigger & Page Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuToggle}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.08] md:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          {viewTitles[currentView] || t('ИИ Автоассистент', 'AI Car Assistant')}
        </h1>
      </div>

      {/* Car Quick Spec Widget + System theme/glass controls */}
      <div className="flex items-center gap-5">
        {/* active car widget */}
        <div 
          onClick={() => onViewChange('profile')}
          className={`
            hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-300 ease-spring hover:scale-[1.02] active:scale-95
            ${car 
              ? 'bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20' 
              : 'bg-rose-500/10 dark:bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'}
          `}
        >
          {car ? (
            <span>
              {car.make} {car.model} • <span className="opacity-80">{car.currentMileage?.toLocaleString()} {t('км', 'km')}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> {t('Нет автомобиля', 'No vehicle')}
            </span>
          )}
        </div>

        {/* Theme/Layout controls */}
        <div className="flex items-center gap-1 sm:border-l border-slate-200 dark:border-white/[0.08] sm:pl-5 transition-colors duration-500">
          {/* Glass Toggle */}
          <button 
            onClick={toggleGlassmorphism}
            className={`
              p-2 rounded-full transition-all duration-300 hover:scale-105 active:scale-95
              ${glassmorphism 
                ? 'text-neonCyan bg-neonCyan/10 hover:bg-neonCyan/20' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.08]'}
            `}
            title="Toggle Glassmorphism"
          >
            {glassmorphism ? <Layers className="w-4 h-4" /> : <Layers3 className="w-4 h-4" />}
          </button>

          {/* Theme Mode Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.08] transition-all duration-300 hover:scale-105 active:scale-95"
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
