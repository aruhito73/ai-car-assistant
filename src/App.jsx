import React, { useState, useEffect } from 'react';
import ThemeProvider from '@/context/ThemeContext';
import CarProvider from '@/context/CarContext';
import Layout from '@/components/Layout';

// View components
import DashboardView from '@/views/DashboardView';
import ProfileView from '@/views/ProfileView';
import ServiceView from '@/views/ServiceView';
import FinanceView from '@/views/FinanceView';
import ChatView from '@/views/ChatView';
import PartsView from '@/views/PartsView';

import { useCar } from '@/context/CarContext';

function AppContent() {
  const { car } = useCar();
  // Hash-based client-side router
  const [currentView, setCurrentView] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    const validViews = ['dashboard', 'profile', 'parts', 'services', 'finance', 'chat'];
    return validViews.includes(hash) ? hash : 'dashboard';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validViews = ['dashboard', 'profile', 'parts', 'services', 'finance', 'chat'];
      if (validViews.includes(hash)) {
        setCurrentView(hash);
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    // Set default hash if not present
    if (!window.location.hash) {
      window.location.hash = 'dashboard';
    }
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const restrictedViews = ['chat', 'services', 'finance'];
    if (!car && restrictedViews.includes(currentView)) {
      setCurrentView('dashboard');
      window.location.hash = 'dashboard';
    }
  }, [car, currentView]);



  const handleViewChange = (newView) => {
    window.location.hash = newView;
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'profile':
        return <ProfileView />;
      case 'parts':
        return <PartsView />;
      case 'services':
        return <ServiceView />;
      case 'finance':
        return <FinanceView />;
      case 'chat':
        return <ChatView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={handleViewChange}>
      {renderView()}
    </Layout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <CarProvider>
        <AppContent />
      </CarProvider>
    </ThemeProvider>
  );
}
