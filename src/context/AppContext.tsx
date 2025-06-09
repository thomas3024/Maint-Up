import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Client,
  Invoice,
  Cost,
  User,
  MonthlyData,
  AnnualReport,
  MonthlyClientData
} from '../types';
import { format, subMonths, getMonth, getYear } from 'date-fns';

const API_URL = 'http://localhost:3000';

interface AppContextType {
  // User management
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  
  // Data management
  clients: Client[];
  invoices: Invoice[];
  costs: Cost[];
  
  // CRUD operations
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'totalInvoices' | 'totalCosts' | 'totalProfit'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  addInvoice: (invoice: Omit<Invoice, 'id' | 'amountTTC'>) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  
  addCost: (cost: Omit<Cost, 'id'>) => void;
  updateCost: (id: string, cost: Partial<Cost>) => void;
  deleteCost: (id: string) => void;
  
  // Analytics
  getMonthlyData: () => MonthlyData[];
  getTotalRevenue: () => number;
  getTotalCosts: () => number;
  getTotalProfit: () => number;
  getClientProfit: (clientId: string) => number;
  getClientMonthlyData: (clientId: string) => MonthlyClientData[];
  getAnnualReport: (year: number) => AnnualReport;
  exportToPDF: () => Promise<string | void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: '1',
    name: 'Admin User',
    email: 'admin@maintup.fr',
    role: 'admin'
  });

  // Données chargées depuis l'API backend
  const [clients, setClients] = useState<Client[]>([]);

  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [costs, setCosts] = useState<Cost[]>([]);

  useEffect(() => {
    fetch('http://localhost:3000/clients')
      .then(res => res.json())
      .then(data =>
        setClients(
          data.map((c: any) => ({ ...c, createdAt: new Date(c.createdAt) }))
        )
      );
    fetch('http://localhost:3000/invoices')
      .then(res => res.json())
      .then(data =>
        setInvoices(
          data.map((inv: any) => ({
            ...inv,
            issueDate: new Date(inv.issueDate),
            dueDate: new Date(inv.dueDate)
          }))
        )
      );
    fetch('http://localhost:3000/costs')
      .then(res => res.json())
      .then(data =>
        setCosts(
          data.map((cost: any) => ({ ...cost, date: new Date(cost.date) }))
        )
      );
  }, []);



  // Client operations
  const addClient = async (
    clientData: Omit<Client, 'id' | 'createdAt' | 'totalInvoices' | 'totalCosts' | 'totalProfit'>
  ) => {
    const res = await fetch(`${API_URL}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData)
    });
    const newClient: Client = await res.json();
    newClient.createdAt = new Date(newClient.createdAt);
    setClients(prev => [...prev, newClient]);
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    const res = await fetch(`${API_URL}/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (res.ok) {
      const updated: Client = await res.json();
      updated.createdAt = new Date(updated.createdAt);
      setClients(prev => prev.map(client => (client.id === id ? updated : client)));
    }
  };

  const deleteClient = async (id: string) => {
    await fetch(`${API_URL}/clients/${id}`, { method: 'DELETE' });
    setClients(prev => prev.filter(client => client.id !== id));
    setInvoices(prev => prev.filter(invoice => invoice.clientId !== id));
    setCosts(prev => prev.filter(cost => cost.clientId !== id));
  };

  // Invoice operations
  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'amountTTC'>) => {
    const res = await fetch(`${API_URL}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceData)
    });
    const newInvoice: Invoice = await res.json();
    newInvoice.issueDate = new Date(newInvoice.issueDate);
    newInvoice.dueDate = new Date(newInvoice.dueDate);
    setInvoices(prev => [...prev, newInvoice]);
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    const res = await fetch(`${API_URL}/invoices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (res.ok) {
      const updated: Invoice = await res.json();
      updated.issueDate = new Date(updated.issueDate);
      updated.dueDate = new Date(updated.dueDate);
      setInvoices(prev => prev.map(inv => (inv.id === id ? updated : inv)));
    }
  };

  const deleteInvoice = async (id: string) => {
    await fetch(`${API_URL}/invoices/${id}`, { method: 'DELETE' });
    setInvoices(prev => prev.filter(invoice => invoice.id !== id));
    setCosts(prev => prev.filter(cost => cost.invoiceId !== id));
  };

  // Cost operations
  const addCost = async (costData: Omit<Cost, 'id'>) => {
    const res = await fetch(`${API_URL}/costs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(costData)
    });
    const newCost: Cost = await res.json();
    newCost.date = new Date(newCost.date);
    setCosts(prev => [...prev, newCost]);
  };

  const updateCost = async (id: string, updates: Partial<Cost>) => {
    const res = await fetch(`${API_URL}/costs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (res.ok) {
      const updated: Cost = await res.json();
      updated.date = new Date(updated.date);
      setCosts(prev => prev.map(cost => (cost.id === id ? updated : cost)));
    }
  };

  const deleteCost = async (id: string) => {
    await fetch(`${API_URL}/costs/${id}`, { method: 'DELETE' });
    setCosts(prev => prev.filter(cost => cost.id !== id));
  };

  // Analytics
  const getMonthlyData = (): MonthlyData[] => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(new Date(), 11 - i);
      return format(date, 'MMM yyyy');
    });

    return months.map(month => {
      const monthRevenue = invoices
        .filter(inv => inv.status === 'paid' && format(inv.issueDate, 'MMM yyyy') === month)
        .reduce((sum, inv) => sum + inv.amountHT, 0);
      
      const monthCosts = costs
        .filter(cost => format(cost.date, 'MMM yyyy') === month)
        .reduce((sum, cost) => sum + cost.amount, 0);

      const profit = monthRevenue - monthCosts;
      const margin = monthRevenue > 0 ? (profit / monthRevenue) * 100 : 0;

      return {
        month,
        revenue: monthRevenue,
        costs: monthCosts,
        profit,
        margin
      };
    });
  };

  const getTotalRevenue = () => {
    return invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amountHT, 0);
  };

  const getTotalCosts = () => {
    return costs.reduce((sum, cost) => sum + cost.amount, 0);
  };

  const getTotalProfit = () => {
    return getTotalRevenue() - getTotalCosts();
  };

  const getClientProfit = (clientId: string) => {
    const clientInvoices = invoices.filter(inv => inv.clientId === clientId && inv.status === 'paid');
    const clientCosts = costs.filter(cost => cost.clientId === clientId);
    
    const revenue = clientInvoices.reduce((sum, inv) => sum + inv.amountHT, 0);
    const totalCosts = clientCosts.reduce((sum, cost) => sum + cost.amount, 0);
    
    return revenue - totalCosts;
  };

  const getClientMonthlyData = (clientId: string): MonthlyClientData[] => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(new Date(), 11 - i);
      return {
        month: format(date, 'MMM'),
        year: getYear(date)
      };
    });

    return months.map(({ month, year }) => {
      const monthKey = `${month} ${year}`;
      
      const clientInvoices = invoices.filter(inv => 
        inv.clientId === clientId && 
        inv.status === 'paid' && 
        format(inv.issueDate, 'MMM yyyy') === monthKey
      );
      
      const clientCosts = costs.filter(cost => 
        cost.clientId === clientId && 
        format(cost.date, 'MMM yyyy') === monthKey
      );

      const revenue = clientInvoices.reduce((sum, inv) => sum + inv.amountHT, 0);
      const costsTotal = clientCosts.reduce((sum, cost) => sum + cost.amount, 0);
      const profit = revenue - costsTotal;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

      return {
        month: monthKey,
        year,
        revenue,
        costs: costsTotal,
        profit,
        margin,
        invoicesCount: clientInvoices.length
      };
    });
  };

  const getAnnualReport = (year: number): AnnualReport => {
    const yearInvoices = invoices.filter(inv => 
      inv.status === 'paid' && getYear(inv.issueDate) === year
    );
    const yearCosts = costs.filter(cost => getYear(cost.date) === year);

    const totalRevenue = yearInvoices.reduce((sum, inv) => sum + inv.amountHT, 0);
    const totalCosts = yearCosts.reduce((sum, cost) => sum + cost.amount, 0);
    const totalProfit = totalRevenue - totalCosts;
    const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    const clientsData = clients.map(client => {
      const clientInvoices = yearInvoices.filter(inv => inv.clientId === client.id);
      const clientCosts = yearCosts.filter(cost => cost.clientId === client.id);
      
      const revenue = clientInvoices.reduce((sum, inv) => sum + inv.amountHT, 0);
      const costs = clientCosts.reduce((sum, cost) => sum + cost.amount, 0);
      const profit = revenue - costs;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

      return {
        clientId: client.id,
        clientName: client.name,
        revenue,
        costs,
        profit,
        margin,
        invoicesCount: clientInvoices.length
      };
    });

    const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
      const month = format(new Date(year, i, 1), 'MMM yyyy');
      
      const monthRevenue = yearInvoices
        .filter(inv => format(inv.issueDate, 'MMM yyyy') === month)
        .reduce((sum, inv) => sum + inv.amountHT, 0);
      
      const monthCosts = yearCosts
        .filter(cost => format(cost.date, 'MMM yyyy') === month)
        .reduce((sum, cost) => sum + cost.amount, 0);

      const profit = monthRevenue - monthCosts;
      const margin = monthRevenue > 0 ? (profit / monthRevenue) * 100 : 0;

      return {
        month,
        revenue: monthRevenue,
        costs: monthCosts,
        profit,
        margin
      };
    });

    return {
      year,
      totalRevenue,
      totalCosts,
      totalProfit,
      averageMargin,
      clientsData,
      monthlyBreakdown
    };
  };

  const exportToPDF = async (): Promise<string | void> => {
    const element = document.getElementById('annual-report');
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    const pdfUrl = pdf.output('bloburl');
    return pdfUrl;
  };

  const value: AppContextType = {
    currentUser,
    setCurrentUser,
    clients,
    invoices,
    costs,
    addClient,
    updateClient,
    deleteClient,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    addCost,
    updateCost,
    deleteCost,
    getMonthlyData,
    getTotalRevenue,
    getTotalCosts,
    getTotalProfit,
    getClientProfit,
    getClientMonthlyData,
    getAnnualReport,
    exportToPDF
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};