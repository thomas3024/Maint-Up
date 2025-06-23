import React, { useState } from 'react';
import { Plus, Trash } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { format } from 'date-fns';
import { useAppContext } from '../../context/AppContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const OFFICE_CLIENT_ID = 'office';
const OFFICE_CLIENT_NAME = 'Charges Bureau';

interface FormState {
  date: string;
  category: string;
  amount: number;
}

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
  'Autre'
];

const payrollCategories = ['Salaire', 'Charges', 'Prime performance', 'Autre'];

const OfficeCosts: React.FC = () => {
  const { costs, addCost, deleteCost } = useAppContext();
  const officeCosts = costs.filter(c => c.category === 'office');

  const fixedCosts = officeCosts.filter(c => c.officeType === 'fixed');
  const variableCosts = officeCosts.filter(c => c.officeType === 'variable');
  const payrollCosts = officeCosts.filter(c => c.officeType === 'payroll');

  const [fixedForm, setFixedForm] = useState<FormState>({
    date: new Date().toISOString().split('T')[0],
    category: fixedCategories[0],
    amount: 0
  });

  const [variableForm, setVariableForm] = useState<FormState>({
    date: new Date().toISOString().split('T')[0],
    category: variableCategories[0],
    amount: 0
  });

  const [payrollForm, setPayrollForm] = useState<FormState>({
    date: new Date().toISOString().split('T')[0],
    category: payrollCategories[0],
    amount: 0
  });

  const handleSubmit = (type: 'fixed' | 'variable' | 'payroll', form: FormState) => {
    if (form.amount <= 0) return;
    addCost({
      clientId: OFFICE_CLIENT_ID,
      clientName: OFFICE_CLIENT_NAME,
      invoiceId: '',
      description: form.category,
      amount: form.amount,
      category: 'office',
      officeType: type,
      officeCategory: form.category,
      date: new Date(form.date)
    });
  };

  const months = Array.from({ length: 12 }, (_, i) => format(new Date(2025, i, 1), 'MMM yyyy'));

  const computeTotals = (data: typeof officeCosts) =>
    months.map(m =>
      data
        .filter(c => format(c.date, 'MMM yyyy') === m)
        .reduce((sum, c) => sum + c.amount, 0)
    );

  const fixedTotals = computeTotals(fixedCosts);
  const variableTotals = computeTotals(variableCosts);
  const payrollTotals = computeTotals(payrollCosts);

  const barData = {
    labels: months,
    datasets: [
      { label: 'Frais fixes', data: fixedTotals, backgroundColor: '#6366F1' },
      { label: 'Frais variables', data: variableTotals, backgroundColor: '#F59E0B' },
      { label: 'Salaires & Charges', data: payrollTotals, backgroundColor: '#10B981' }
    ]
  };

  const globalTotal = fixedCosts.reduce((s, c) => s + c.amount, 0) +
    variableCosts.reduce((s, c) => s + c.amount, 0) +
    payrollCosts.reduce((s, c) => s + c.amount, 0);

  const pieData = {
    labels: ['Frais fixes', 'Frais variables', 'Salaires & Charges'],
    datasets: [
      {
        data: [
          fixedCosts.reduce((s, c) => s + c.amount, 0),
          variableCosts.reduce((s, c) => s + c.amount, 0),
          payrollCosts.reduce((s, c) => s + c.amount, 0)
        ],
        backgroundColor: ['#6366F1', '#F59E0B', '#10B981']
      }
    ]
  };

  return (
    <div className="space-y-8">
      {/* Fixed costs */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Frais fixes</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSubmit('fixed', fixedForm);
            setFixedForm({ ...fixedForm, amount: 0 });
          }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="month"
              value={fixedForm.date}
              onChange={e => setFixedForm({ ...fixedForm, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select
              value={fixedForm.category}
              onChange={e => setFixedForm({ ...fixedForm, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {fixedCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={fixedForm.amount}
              onChange={e => setFixedForm({ ...fixedForm, amount: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button type="submit" className="flex items-center justify-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" /> Ajouter
          </button>
        </form>

        {fixedCosts.length > 0 && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {fixedCosts.map(cost => (
                  <tr key={cost.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">{format(cost.date, 'MM/yyyy')}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{cost.officeCategory}</td>
                    <td className="px-4 py-2 text-sm font-semibold text-red-600">{cost.amount.toLocaleString('fr-FR')} €</td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => deleteCost(cost.id)} className="text-red-600 hover:text-red-800">
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

      {/* Variable costs */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Frais variables</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSubmit('variable', variableForm);
            setVariableForm({ ...variableForm, amount: 0 });
          }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="month"
              value={variableForm.date}
              onChange={e => setVariableForm({ ...variableForm, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select
              value={variableForm.category}
              onChange={e => setVariableForm({ ...variableForm, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {variableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={variableForm.amount}
              onChange={e => setVariableForm({ ...variableForm, amount: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button type="submit" className="flex items-center justify-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" /> Ajouter
          </button>
        </form>

        {variableCosts.length > 0 && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {variableCosts.map(cost => (
                  <tr key={cost.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">{format(cost.date, 'MM/yyyy')}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{cost.officeCategory}</td>
                    <td className="px-4 py-2 text-sm font-semibold text-red-600">{cost.amount.toLocaleString('fr-FR')} €</td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => deleteCost(cost.id)} className="text-red-600 hover:text-red-800">
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

      {/* Payroll */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Salaires & Charges</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSubmit('payroll', payrollForm);
            setPayrollForm({ ...payrollForm, amount: 0 });
          }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="month"
              value={payrollForm.date}
              onChange={e => setPayrollForm({ ...payrollForm, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select
              value={payrollForm.category}
              onChange={e => setPayrollForm({ ...payrollForm, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {payrollCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={payrollForm.amount}
              onChange={e => setPayrollForm({ ...payrollForm, amount: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button type="submit" className="flex items-center justify-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" /> Ajouter
          </button>
        </form>

        {payrollCosts.length > 0 && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payrollCosts.map(cost => (
                  <tr key={cost.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">{format(cost.date, 'MM/yyyy')}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{cost.officeCategory}</td>
                    <td className="px-4 py-2 text-sm font-semibold text-red-600">{cost.amount.toLocaleString('fr-FR')} €</td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => deleteCost(cost.id)} className="text-red-600 hover:text-red-800">
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

      {/* Charts */}
      {globalTotal > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Évolution mensuelle 2025</h2>
            <div className="h-80">
              <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Répartition</h2>
            <div className="h-80">
              <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficeCosts;
