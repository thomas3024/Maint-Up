import React from 'react';
import { Menu, User, Settings, LogOut } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { currentUser, setCurrentUser } = useAppContext();

  const handleRoleToggle = () => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        role: currentUser.role === 'admin' ? 'viewer' : 'admin'
      });
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Maint Up</h1>
            <p className="text-sm text-gray-500">Comptabilité & Analytics</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
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

          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Settings className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;