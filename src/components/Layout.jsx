import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export const Layout = ({ children, currentView, onViewChange }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const mainRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (mainRef.current) {
        setIsScrolled(mainRef.current.scrollTop > 10);
      }
    };
    const mainEl = mainRef.current;
    if (mainEl) {
      mainEl.addEventListener('scroll', handleScroll);
      return () => mainEl.removeEventListener('scroll', handleScroll);
    }
  }, [currentView]); // Reset scroll on view change

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-darkBg dark:text-slate-100 font-sans selection:bg-neonCyan selection:text-white tabular-nums">
      {/* Collapsible Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        currentView={currentView}
        onViewChange={onViewChange}
      />
      
      {/* Viewport Frame */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <Header 
          currentView={currentView}
          onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onViewChange={onViewChange}
          isScrolled={isScrolled}
        />
        
        {/* Scroll Content Block */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 dark:bg-darkBg/50 relative z-0 custom-scrollbar">
          <div className="max-w-7xl mx-auto h-full animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
