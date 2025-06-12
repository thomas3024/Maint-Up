import React from 'react';
import { Menu, User, Settings, LogOut, Sun, Moon } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface HeaderProps {
  onMenuToggle: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  activeView: string;
  onViewChange: (view: string) => void;
  onSettingsOpen: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, theme, onThemeToggle, activeView, onViewChange, onSettingsOpen }) => {
  const { currentUser, setCurrentUser } = useAppContext();

  const handleRoleToggle = () => {
    if (!currentUser) return;
    if (currentUser.role === 'admin') {
      setCurrentUser({ ...currentUser, role: 'viewer' });
    } else {
      const pwd = window.prompt('Entrez le mot de passe administrateur');
      if (pwd === 'THABARY') {
        setCurrentUser({ ...currentUser, role: 'admin' });
      } else if (pwd !== null) {
        alert('Mot de passe incorrect');
      }
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Maint Up Comptabilité</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Comptabilité & Analytics</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={activeView}
            onChange={(e) => onViewChange(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            <option value="invoices">Factures</option>
            <option value="costs">Coûts</option>
            <option value="clients">Clients</option>
          </select>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Mode:</span>
            <button
              onClick={handleRoleToggle}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                currentUser?.role === 'admin'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {currentUser?.role === 'admin' ? 'Administrateur' : 'Visualisation'}
            </button>
          </div>

          <button
            onClick={onThemeToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {currentUser?.name}
            </span>
          </div>

          <button onClick={onSettingsOpen} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
