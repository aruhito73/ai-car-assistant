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
  Settings,
  Sliders,
  ClipboardList,
  Droplet,
  TrendingUp
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

  const menuGroups = [
    {
      title: t('Основное', 'Main'),
      items: [
        { id: 'dashboard', name: t('Панель приборов', 'Dashboard'), icon: LayoutDashboard },
        { id: 'chat', name: t('ИИ-Механик', 'AI Mechanic'), icon: Cpu }
      ]
    },
    {
      title: t('Гараж', 'Garage'),
      items: [
        { id: 'profile', name: t('Профиль авто', 'Vehicle Profile'), icon: Car },
        { id: 'services', name: t('Сервисная книжка', 'Maintenance Book'), icon: Wrench },
        { id: 'documents', name: t('Документы', 'Documents'), icon: FileText },
        { id: 'fluids', name: t('Ресурс жидкостей', 'Fluid Status'), icon: Droplet },
      ]
    },
    {
      title: t('Инструменты', 'Tools'),
      items: [
        { id: 'finance', name: t('Расходы и финансы', 'Finance & Expenses'), icon: DollarSign },
        { id: 'fuel', name: t('Журнал заправок', 'Fuel Diary'), icon: Fuel },
        { id: 'parts', name: t('Запчасти', 'Parts & Catalogs'), icon: Package },
        { id: 'checklists', name: t('Чек-листы', 'Checklists'), icon: ClipboardList },
        { id: 'obd', name: t('Поиск OBD-2', 'OBD-2 Finder'), icon: Search },
        { id: 'tires', name: t('Шины', 'Tire Calculator'), icon: Sliders },
        { id: 'savings', name: t('Окупаемость', 'Savings'), icon: TrendingUp },
      ]
    },
    {
      title: t('Система', 'System'),
      items: [
        { id: 'settings', name: t('Настройки', 'Settings'), icon: Settings }
      ]
    }
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-out-expo
    ${glassmorphism 
      ? 'bg-white/70 border-r border-slate-200/50 dark:bg-darkBg/80 dark:border-white/[0.08] backdrop-blur-xl' 
      : 'bg-white border-r border-slate-200 dark:bg-[#09090b] dark:border-white/[0.08]'}
    ${collapsed ? 'w-20' : 'w-72'}
    ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:static'}
  `;

  const handleNavClick = (viewId) => {
    onViewChange(viewId);
    setMobileOpen(false);
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
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-200/50 dark:border-white/[0.08] flex-shrink-0">
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate">
              AI <span className="text-neonCyan">CAR</span>
            </span>
          )}
          {collapsed && (
            <span className="text-lg font-bold text-neonCyan mx-auto">AC</span>
          )}
          
          <button 
            className="p-1.5 text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-white md:hidden rounded-lg transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
          
          <button 
            className="hidden md:block p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 dark:text-slate-500 dark:hover:text-white dark:hover:bg-white/[0.08] transition-colors"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 custom-scrollbar">
          {menuGroups.map((group, groupIdx) => (
            <div key={group.title} className={groupIdx > 0 ? 'mt-6' : 'mt-2'}>
              {(!collapsed || mobileOpen) && (
                <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {group.title}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      id={`nav-${item.id}`}
                      onClick={() => handleNavClick(item.id)}
                      title={collapsed ? item.name : undefined}
                      className={`
                        relative flex w-full items-center gap-3 rounded-xl p-2.5 text-sm font-medium transition-all duration-300 ease-spring group
                        ${isActive 
                          ? 'text-neonCyan bg-neonCyan/10 dark:bg-neonCyan/10' 
                          : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-white'}
                        ${collapsed && !mobileOpen ? 'justify-center' : ''}
                      `}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-neonCyan rounded-r-full" />
                      )}
                      <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-active:scale-95'}`} />
                      {(!collapsed || mobileOpen) && <span className="tracking-wide truncate">{item.name}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Version details footer */}
        <div className="p-4 border-t border-slate-200/50 dark:border-white/[0.08] text-center flex-shrink-0">
          {(!collapsed || mobileOpen) && (
            <span className="text-xs font-medium tracking-wider text-slate-400/80 dark:text-slate-500/80">v0.1.0</span>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
