import React from 'react';
import { Menu, User, Settings } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface HeaderProps {
  onMenuToggle: () => void;
  activeView: string;
  onViewChange: (view: string) => void;
  onSettingsOpen: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, activeView, onViewChange, onSettingsOpen }) => {
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
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Maint Up - Comptabilité</h1>
            <p className="text-sm text-gray-500">Comptabilité & Analytics</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={activeView}
            onChange={(e) => onViewChange(e.target.value)}
            className="border border-gray-300 rounded-md p-2 text-sm bg-white text-gray-700"
          >
            <option value="invoices">Factures</option>
            <option value="costs">Coûts</option>
            <option value="clients">Clients</option>
          </select>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Mode:</span>
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


          <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
            <User className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">
              {currentUser?.name}
            </span>
          </div>

          <button onClick={onSettingsOpen} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Settings className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
