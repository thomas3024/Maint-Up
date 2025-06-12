import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import ClientsManager from './components/Clients/ClientsManager';
import InvoicesManager from './components/Invoices/InvoicesManager';
import CostsManager from './components/Costs/CostsManager';
import ClientAnalytics from './components/Analytics/ClientAnalytics';
import AnnualReport from './components/Reports/AnnualReport';
import SettingsModal from './components/Settings/SettingsModal';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'clients':
        return <ClientsManager />;
      case 'invoices':
        return <InvoicesManager />;
      case 'costs':
        return <CostsManager />;
      case 'analytics':
        return <ClientAnalytics />;
      case 'reports':
        return <AnnualReport />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 lg:pl-64">
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          theme={theme}
          onThemeToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          activeView={activeView}
          onViewChange={setActiveView}
          onSettingsOpen={() => setSettingsOpen(true)}
        />

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeView={activeView}
          onViewChange={setActiveView}
        />

        <main className="mx-auto max-w-7xl p-6">
          {renderActiveView()}
        </main>
        <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </div>
    </AppProvider>
  );
}

export default App;
