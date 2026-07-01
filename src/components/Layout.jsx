import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export const Layout = ({ children, currentView, onViewChange }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-darkBg dark:text-slate-100 font-sans">
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
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header 
          currentView={currentView}
          onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onViewChange={onViewChange}
        />
        
        {/* Scroll Content Block */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-darkBg dark:to-slate-950">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
