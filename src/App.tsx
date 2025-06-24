import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import ClientsManager from './components/Clients/ClientsManager';
import InvoicesManager from './components/Invoices/InvoicesManager';
import CostsManager from './components/Costs/CostsManager';
import MonthlyOfficeCosts from './components/Costs/MonthlyOfficeCosts';
import ClientAnalytics from './components/Analytics/ClientAnalytics';
import AnnualReport from './components/Reports/AnnualReport';
import SettingsModal from './components/Settings/SettingsModal';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);

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
      case 'office-costs':
        return <MonthlyOfficeCosts />;
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
      <div className="min-h-screen bg-gray-50 text-gray-900 lg:pl-64">
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
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
