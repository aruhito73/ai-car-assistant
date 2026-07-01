import React from 'react';
import { 
  LayoutDashboard, 
  Car, 
  Wrench, 
  DollarSign, 
  Cpu, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Package,
  FileText,
  Fuel,
  Search,
  Settings
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export const Sidebar = ({ 
  collapsed, 
  setCollapsed, 
  mobileOpen, 
  setMobileOpen, 
  currentView, 
  onViewChange 
}) => {
  const { glassmorphism, t } = useTheme();

  const menuItems = [
    { id: 'dashboard', name: t('Панель приборов', 'Dashboard'), icon: LayoutDashboard },
    { id: 'profile', name: t('Профиль авто', 'Vehicle Profile'), icon: Car },
    { id: 'parts', name: t('Запчасти и каталоги', 'Parts & Catalogs'), icon: Package },
    { id: 'services', name: t('Сервисная книжка', 'Maintenance Book'), icon: Wrench },
    { id: 'finance', name: t('Расходы и финансы', 'Finance & Expenses'), icon: DollarSign },
    { id: 'documents', name: t('Документы', 'Documents'), icon: FileText },
    { id: 'fuel', name: t('Журнал заправок', 'Fuel Diary'), icon: Fuel },
    { id: 'obd', name: t('Поиск OBD-2', 'OBD-2 Finder'), icon: Search },
    { id: 'chat', name: t('ИИ-Механик', 'AI Mechanic'), icon: Cpu },
    { id: 'settings', name: t('Настройки', 'Settings'), icon: Settings }
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-out-expo
    ${glassmorphism 
      ? 'bg-white/70 border-r border-slate-200/50 dark:bg-darkBg/80 dark:border-white/[0.08] backdrop-blur-xl' 
      : 'bg-white border-r border-slate-200 dark:bg-[#09090b] dark:border-white/[0.08]'}
    ${collapsed ? 'w-20' : 'w-64'}
    ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:static'}
  `;

  const handleNavClick = (viewId) => {
    onViewChange(viewId);
    setMobileOpen(false); // Close mobile panel
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Sidebar Header Title */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-200/50 dark:border-white/[0.08]">
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              AI <span className="text-neonCyan">CAR</span>
            </span>
          )}
          {collapsed && (
            <span className="text-lg font-bold text-neonCyan mx-auto">AC</span>
          )}
          
          {/* Close button - Mobile only */}
          <button 
            className="p-1.5 text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-white md:hidden rounded-lg transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Expand/Collapse Toggle - Desktop only */}
          <button 
            className="hidden md:block p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 dark:text-slate-500 dark:hover:text-white dark:hover:bg-white/[0.08] transition-colors"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 space-y-1.5 p-3 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`
                  relative flex w-full items-center gap-3 rounded-xl p-3 text-sm font-medium transition-all duration-300 ease-spring group
                  ${isActive 
                    ? 'text-neonCyan bg-neonCyan/10 dark:bg-neonCyan/10' 
                    : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-white'}
                `}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-neonCyan rounded-r-full" />
                )}
                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-active:scale-95'}`} />
                {(!collapsed || mobileOpen) && <span className="tracking-wide">{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* Version details footer */}
        <div className="p-5 text-center">
          {(!collapsed || mobileOpen) && (
            <span className="text-xs font-medium tracking-wider text-slate-400/80 dark:text-slate-500/80">v0.1.0</span>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
