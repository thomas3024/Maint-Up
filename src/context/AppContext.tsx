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
import { format, subMonths, addMonths, getYear } from 'date-fns';

const API_URL = 'http://localhost:3000';
const LOCAL_STORAGE_KEY = 'maintup-data';

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
  getClientMonthlyData: (clientId: string, year?: number) => MonthlyClientData[];
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
    role: 'viewer'
  });

  // Données chargées depuis l'API backend ou le localStorage
  const [clients, setClients] = useState<Client[]>([]);

  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [costs, setCosts] = useState<Cost[]>([]);

  const [apiAvailable, setApiAvailable] = useState(true);

  const persist = (c = clients, i = invoices, co = costs) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ clients: c, invoices: i, costs: co }));
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cRes, iRes, coRes] = await Promise.all([
          fetch(`${API_URL}/clients`),
          fetch(`${API_URL}/invoices`),
          fetch(`${API_URL}/costs`)
        ]);

        if (!cRes.ok) throw new Error('api');

        const clientsData = await cRes.json();
        const invoicesData = await iRes.json();
        const costsData = await coRes.json();

        const c = clientsData.map((cl: any) => ({ ...cl, createdAt: new Date(cl.createdAt) }));
        const i = invoicesData.map((inv: any) => ({
          ...inv,
          issueDate: new Date(inv.issueDate),
          dueDate: new Date(inv.dueDate)
        }));
        const co = costsData.map((cost: any) => ({ ...cost, date: new Date(cost.date) }));

        setClients(c);
        setInvoices(i);
        setCosts(co);
        persist(c, i, co);
      } catch (err) {
        setApiAvailable(false);
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          const { clients: c, invoices: i, costs: co } = JSON.parse(stored);
          setClients(c.map((cl: any) => ({ ...cl, createdAt: new Date(cl.createdAt) })));
          setInvoices(i.map((inv: any) => ({
            ...inv,
            issueDate: new Date(inv.issueDate),
            dueDate: new Date(inv.dueDate)
          })));
          setCosts(co.map((cost: any) => ({ ...cost, date: new Date(cost.date) })));
        }
      }
    };

    loadData();
  }, []);



  // Client operations
  const addClient = async (
    clientData: Omit<Client, 'id' | 'createdAt' | 'totalInvoices' | 'totalCosts' | 'totalProfit'>
  ) => {
    try {
      const res = await fetch(`${API_URL}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      });
      if (!res.ok) throw new Error('api');
      const newClient: Client = await res.json();
      newClient.createdAt = new Date(newClient.createdAt);
      setClients(prev => {
        const updated = [...prev, newClient];
        persist(updated);
        return updated;
      });
    } catch (e) {
      const newClient: Client = {
        id: Date.now().toString(),
        createdAt: new Date(),
        totalInvoices: 0,
        totalCosts: 0,
        totalProfit: 0,
        ...clientData
      };
      setClients(prev => {
        const updated = [...prev, newClient];
        persist(updated);
        return updated;
      });
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const res = await fetch(`${API_URL}/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('api');
      const updated: Client = await res.json();
      updated.createdAt = new Date(updated.createdAt);
      setClients(prev => {
        const updatedList = prev.map(client => (client.id === id ? updated : client));
        persist(updatedList);
        return updatedList;
      });
    } catch (e) {
      setClients(prev => {
        const updatedList = prev.map(client =>
          client.id === id ? { ...client, ...updates } : client
        );
        persist(updatedList);
        return updatedList;
      });
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await fetch(`${API_URL}/clients/${id}`, { method: 'DELETE' });
    } catch (e) {
      // offline, just update local data
    }
    setClients(prev => {
      const updated = prev.filter(client => client.id !== id);
      persist(updated);
      return updated;
    });
    setInvoices(prev => {
      const updated = prev.filter(invoice => invoice.clientId !== id);
      persist(undefined, updated);
      return updated;
    });
    setCosts(prev => {
      const updated = prev.filter(cost => cost.clientId !== id);
      persist(undefined, undefined, updated);
      return updated;
    });
  };

  // Invoice operations
  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'amountTTC'>) => {
    try {
      const res = await fetch(`${API_URL}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      });
      if (!res.ok) throw new Error('api');
      const newInvoice: Invoice = await res.json();
      newInvoice.issueDate = new Date(newInvoice.issueDate);
      newInvoice.dueDate = new Date(newInvoice.dueDate);
      setInvoices(prev => {
        const updated = [...prev, newInvoice];
        persist(undefined, updated);
        return updated;
      });
    } catch (e) {
      const newInvoice: Invoice = {
        id: Date.now().toString(),
        amountTTC: invoiceData.amountHT + invoiceData.tva,
        ...invoiceData,
        issueDate: invoiceData.issueDate,
        dueDate: invoiceData.dueDate
      };
      setInvoices(prev => {
        const updated = [...prev, newInvoice];
        persist(undefined, updated);
        return updated;
      });
    }
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    try {
      const res = await fetch(`${API_URL}/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('api');
      const updated: Invoice = await res.json();
      updated.issueDate = new Date(updated.issueDate);
      updated.dueDate = new Date(updated.dueDate);
      setInvoices(prev => {
        const updatedList = prev.map(inv => (inv.id === id ? updated : inv));
        persist(undefined, updatedList);
        return updatedList;
      });
    } catch (e) {
      setInvoices(prev => {
        const updatedList = prev.map(inv => (inv.id === id ? { ...inv, ...updates } : inv));
        persist(undefined, updatedList);
        return updatedList;
      });
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      await fetch(`${API_URL}/invoices/${id}`, { method: 'DELETE' });
    } catch (e) {
      // offline
    }
    setInvoices(prev => {
      const updated = prev.filter(invoice => invoice.id !== id);
      persist(undefined, updated);
      return updated;
    });
    setCosts(prev => {
      const updated = prev.filter(cost => cost.invoiceId !== id);
      persist(undefined, undefined, updated);
      return updated;
    });
  };

  // Cost operations
  const addCost = async (costData: Omit<Cost, 'id'>) => {
    try {
      const res = await fetch(`${API_URL}/costs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(costData)
      });
      if (!res.ok) throw new Error('api');
      const newCost: Cost = await res.json();
      newCost.date = new Date(newCost.date);
      setCosts(prev => {
        const updated = [...prev, newCost];
        persist(undefined, undefined, updated);
        return updated;
      });
    } catch (e) {
      const newCost: Cost = { id: Date.now().toString(), ...costData };
      setCosts(prev => {
        const updated = [...prev, newCost];
        persist(undefined, undefined, updated);
        return updated;
      });
    }
  };

  const updateCost = async (id: string, updates: Partial<Cost>) => {
    try {
      const res = await fetch(`${API_URL}/costs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('api');
      const updated: Cost = await res.json();
      updated.date = new Date(updated.date);
      setCosts(prev => {
        const updatedList = prev.map(cost => (cost.id === id ? updated : cost));
        persist(undefined, undefined, updatedList);
        return updatedList;
      });
    } catch (e) {
      setCosts(prev => {
        const updatedList = prev.map(cost => (cost.id === id ? { ...cost, ...updates } : cost));
        persist(undefined, undefined, updatedList);
        return updatedList;
      });
    }
  };

  const deleteCost = async (id: string) => {
    try {
      await fetch(`${API_URL}/costs/${id}`, { method: 'DELETE' });
    } catch (e) {
      // offline
    }
    setCosts(prev => {
      const updated = prev.filter(cost => cost.id !== id);
      persist(undefined, undefined, updated);
      return updated;
    });
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

  const getClientMonthlyData = (clientId: string, year = 2025): MonthlyClientData[] => {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 1);

    const months: { month: string; year: number }[] = [];
    let current = new Date(startDate);
    while (current <= endDate) {
      months.push({ month: format(current, 'MMM'), year: getYear(current) });
      current = addMonths(current, 1);
    }

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