import React, { useState } from 'react';
import { Plus, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { useAppContext } from '../../context/AppContext';

const fixedCategories = [
  'Google',
  'Expert comptable',
  'ChatGPT',
  'Logiciel',
  'Téléphone',
  'Kandbazz',
  'Bureau',
  'Assurance maladie',
  'Frais bancaires',
  'LinkedIn',
  'Voiture',
  'Assurance voiture',
  'Assurance société',
  'Mutuelle',
  'Retraite',
  'Autre'
];

const variableCategories = [
  'Essence',
  'Péage',
  'Formation',
  'Outils',
  'Hôtel',
  'Vêtements',
  'TVA',
  'Autre'
];

const payrollCategories = ['Salaire', 'Charges', 'Prime performance', 'Autre'];

interface FormState {
  category: string;
  amount: number;
  comment: string;
}

interface SectionProps {
  title: string;
  type: 'fixed' | 'variable' | 'payroll';
  costs: any[];
  monthDate: Date;
}

const Section: React.FC<SectionProps> = ({ title, type, costs, monthDate }) => {
  const { addCost, deleteCost } = useAppContext();
  const categories =
    type === 'fixed'
      ? fixedCategories
      : type === 'variable'
      ? variableCategories
      : payrollCategories;

  const [form, setForm] = useState<FormState>({
    category: categories[0],
    amount: 0,
    comment: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.amount <= 0) return;
    addCost({
      clientId: 'office',
      clientName: 'Charges Bureau',
      invoiceId: '',
      description: form.comment,
      amount: form.amount,
      category: 'office',
      officeType: type,
      officeCategory: form.category,
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
    });
    setForm({ ...form, amount: 0, comment: '' });
  };

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-gray-900">{title}</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
        <div>
          <label className="text-sm font-medium text-gray-700">Catégorie</label>
          <select
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Montant (€)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Commentaire</label>
          <input
            type="text"
            value={form.comment}
            onChange={e => setForm({ ...form, comment: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button type="submit" className="flex items-center justify-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
          <Plus className="h-4 w-4 mr-2" /> Ajouter
        </button>
      </form>
      {costs.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commentaire</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {costs.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-900">{c.officeCategory}</td>
                  <td className="px-4 py-2 text-sm font-semibold text-red-600">{c.amount.toLocaleString('fr-FR')} €</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{c.description}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => deleteCost(c.id)} className="text-red-600 hover:text-red-800">
                      <Trash className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const MonthlyOfficeCosts: React.FC = () => {
  const { costs } = useAppContext();
  const officeCosts = costs.filter(c => c.category === 'office');
  const months = Array.from({ length: 12 }, (_, i) => new Date(2025, i, 1));
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      {months.map((m, idx) => {
        const label = format(m, 'MMMM yyyy');
        const monthCosts = officeCosts.filter(c => format(c.date, 'yyyy-MM') === format(m, 'yyyy-MM'));
        const fixed = monthCosts.filter(c => c.officeType === 'fixed');
        const variable = monthCosts.filter(c => c.officeType === 'variable');
        const payroll = monthCosts.filter(c => c.officeType === 'payroll');
        const isOpen = open === idx;
        return (
          <div key={idx} className="border rounded-lg">
            <button
              className="w-full text-left px-4 py-3 bg-gray-100 font-semibold"
              onClick={() => setOpen(isOpen ? null : idx)}
            >
              {label}
            </button>
            {isOpen && (
              <div className="p-4 space-y-6">
                <Section title="Frais fixes" type="fixed" costs={fixed} monthDate={m} />
                <Section title="Frais variables" type="variable" costs={variable} monthDate={m} />
                <Section title="Salaires & Charges" type="payroll" costs={payroll} monthDate={m} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MonthlyOfficeCosts;
