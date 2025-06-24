import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import CostGridForm from './CostGridForm';

const CostGridsManager: React.FC = () => {
  const { costGrids, currentUser } = useAppContext();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [showForm, setShowForm] = useState(false);

  const filtered = costGrids.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    (g.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Grilles de Coûts</h2>
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle grille de coûts</span>
          </button>
        )}
      </div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher une grille..."
        className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
      <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-200">
        {filtered.map(grid => (
          <div key={grid.id}>
            <button
              className="w-full flex items-center justify-between px-4 py-3 text-left"
              onClick={() => setOpen(prev => ({ ...prev, [grid.id]: !prev[grid.id] }))}
            >
              <div className="flex items-center gap-2">
                {open[grid.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <span className="font-medium text-gray-900">{grid.name}</span>
                {grid.category && <span className="text-sm text-gray-500">({grid.category})</span>}
              </div>
            </button>
            {open[grid.id] && (
              <div className="px-8 py-4 space-y-2 bg-gray-50">
                {grid.clients.map(c => (
                  <div key={c.clientId} className="flex items-center justify-between">
                    <span className="text-gray-700">{c.clientName}{c.notes && <span className='text-xs text-gray-500 ml-2'>{c.notes}</span>}</span>
                    <span className="font-semibold text-gray-900">{c.rate.toLocaleString('fr-FR')} €</span>
                  </div>
                ))}
                {grid.clients.length === 0 && (
                  <p className="text-sm text-gray-500">Aucun client associé</p>
                )}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="px-4 py-6 text-center text-gray-500">Aucune grille trouvée</div>
        )}
      </div>
      {showForm && <CostGridForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default CostGridsManager;
