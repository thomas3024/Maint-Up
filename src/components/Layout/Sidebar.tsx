import React from 'react';
import { 
  BarChart3,
  Users,
  Receipt,
  DollarSign,
  TrendingUp,
  FileText,
  Home,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: string;
  onViewChange: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeView, onViewChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: BarChart3, color: 'text-blue-600' },
    { id: 'clients', label: 'Clients', icon: Users, color: 'text-green-600' },
    { id: 'invoices', label: 'Factures', icon: Receipt, color: 'text-red-600' },
    { id: 'costs', label: 'Coûts', icon: DollarSign, color: 'text-blue-600' },
    { id: 'office-costs', label: 'Charges bureau', icon: Home, color: 'text-indigo-600' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'text-purple-600' },
    { id: 'reports', label: 'Rapports', icon: FileText, color: 'text-gray-600' },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 flex flex-col bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:shadow-none
        `}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 lg:hidden">
          <h2 className="text-xl font-bold text-gray-900">Menu</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <nav className="mt-6">
          <ul className="space-y-2 px-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onViewChange(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-primary-600' : item.color}`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto p-4">
          <div className="bg-pastel-blue p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-1">Maint Up Pro</h3>
            <p className="text-sm text-gray-600">
              Comptabilité moderne et intuitive
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;