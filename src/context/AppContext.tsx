import React, { createContext, useContext, useState, ReactNode } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Client, Invoice, Cost, User, MonthlyData, AnnualReport, MonthlyClientData, MonthlyInvoiceTotals } from '../types';
import { format, getYear } from 'date-fns';

interface AppContextType {
  // User management
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  
  // Data management
  clients: Client[];
  invoices: Invoice[];
  costs: Cost[];
  
  // CRUD operations
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'totalInvoices' | 'totalCosts' | 'totalProfit' | 'monthlyData'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  addInvoice: (invoice: Omit<Invoice, 'id' | 'amountTTC'>) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  
  addCost: (cost: Omit<Cost, 'id'>) => void;
  updateCost: (id: string, cost: Partial<Cost>) => void;
  deleteCost: (id: string) => void;
  
  // Analytics
  getMonthlyData: (year?: number) => MonthlyData[];
  getTotalRevenue: () => number;
  getTotalCosts: () => number;
  getTotalProfit: () => number;
  getClientProfit: (clientId: string) => number;
  getClientMonthlyData: (clientId: string, year?: number) => MonthlyClientData[];
  getInvoicesByMonth: (year: number) => MonthlyInvoiceTotals[];
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

  // Sample data with enhanced structure
  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      name: 'Entreprise Alpha',
      email: 'contact@alpha.fr',
      phone: '01 23 45 67 89',
      address: '123 Rue de la Paix, 75001 Paris',
      createdAt: new Date('2024-01-15'),
      totalInvoices: 18000,
      totalCosts: 9500,
      totalProfit: 8500,
      monthlyData: []
    },
    {
      id: '2',
      name: 'Société Beta',
      email: 'info@beta.fr',
      phone: '01 98 76 54 32',
      address: '456 Avenue des Champs, 69000 Lyon',
      createdAt: new Date('2024-02-20'),
      totalInvoices: 32000,
      totalCosts: 18000,
      totalProfit: 14000,
      monthlyData: []
    },
    {
      id: '3',
      name: 'Groupe Gamma',
      email: 'contact@gamma.fr',
      phone: '01 55 44 33 22',
      address: '789 Boulevard Haussmann, 75008 Paris',
      createdAt: new Date('2024-03-10'),
      totalInvoices: 25000,
      totalCosts: 12000,
      totalProfit: 13000,
      monthlyData: []
    }
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      clientId: '1',
      clientName: 'Entreprise Alpha',
      number: 'INV-2024-001',
      amountHT: 5000,
      tva: 1000,
      amountTTC: 6000,
      status: 'paid',
      issueDate: new Date('2024-01-15'),
      dueDate: new Date('2024-02-15'),
      description: 'Maintenance préventive Q1'
    },
    {
      id: '2',
      clientId: '1',
      clientName: 'Entreprise Alpha',
      number: 'INV-2024-002',
      amountHT: 7500,
      tva: 1500,
      amountTTC: 9000,
      status: 'pending',
      issueDate: new Date('2024-02-01'),
      dueDate: new Date('2024-03-01'),
      description: 'Réparation équipement industriel'
    },
    {
      id: '3',
      clientId: '2',
      clientName: 'Société Beta',
      number: 'INV-2024-003',
      amountHT: 12000,
      tva: 2400,
      amountTTC: 14400,
      status: 'paid',
      issueDate: new Date('2024-01-20'),
      dueDate: new Date('2024-02-20'),
      description: 'Installation nouvelle ligne de production'
    },
    {
      id: '4',
      clientId: '2',
      clientName: 'Société Beta',
      number: 'INV-2024-004',
      amountHT: 8000,
      tva: 1600,
      amountTTC: 9600,
      status: 'paid',
      issueDate: new Date('2024-03-15'),
      dueDate: new Date('2024-04-15'),
      description: 'Maintenance trimestrielle'
    },
    {
      id: '5',
      clientId: '3',
      clientName: 'Groupe Gamma',
      number: 'INV-2024-005',
      amountHT: 15000,
      tva: 3000,
      amountTTC: 18000,
      status: 'paid',
      issueDate: new Date('2024-03-10'),
      dueDate: new Date('2024-04-10'),
      description: 'Audit et optimisation système'
    },
    {
      id: '6',
      clientId: '1',
      clientName: 'Entreprise Alpha',
      number: 'INV-2025-001',
      amountHT: 7000,
      tva: 1400,
      amountTTC: 8400,
      status: 'paid',
      issueDate: new Date('2025-01-05'),
      dueDate: new Date('2025-02-05'),
      description: 'Contrat annuel 2025'
    },
    {
      id: '7',
      clientId: '2',
      clientName: 'Société Beta',
      number: 'INV-2025-002',
      amountHT: 10000,
      tva: 2000,
      amountTTC: 12000,
      status: 'pending',
      issueDate: new Date('2025-02-10'),
      dueDate: new Date('2025-03-10'),
      description: 'Extension de garantie'
    }
  ]);

  const [costs, setCosts] = useState<Cost[]>([
    {
      id: '1',
      clientId: '1',
      clientName: 'Entreprise Alpha',
      invoiceId: '1',
      description: 'Salaire technicien',
      amount: 2500,
      category: 'salaries',
      date: new Date('2024-01-16')
    },
    {
      id: '2',
      clientId: '1',
      clientName: 'Entreprise Alpha',
      invoiceId: '2',
      description: 'Pièces de rechange',
      amount: 1800,
      category: 'materials',
      date: new Date('2024-02-02')
    },
    {
      id: '3',
      clientId: '2',
      clientName: 'Société Beta',
      invoiceId: '3',
      description: 'Sous-traitance spécialisée',
      amount: 4000,
      category: 'subcontracting',
      date: new Date('2024-01-21')
    },
    {
      id: '4',
      clientId: '2',
      clientName: 'Société Beta',
      invoiceId: '4',
      description: 'Charges sociales',
      amount: 1200,
      category: 'charges',
      date: new Date('2024-03-16')
    },
    {
      id: '5',
      clientId: '3',
      clientName: 'Groupe Gamma',
      invoiceId: '5',
      description: 'Équipement diagnostic',
      amount: 3500,
      category: 'materials',
      date: new Date('2024-03-11')
    },
    {
      id: '6',
      clientId: '1',
      clientName: 'Entreprise Alpha',
      invoiceId: '6',
      description: 'Main-d\'œuvre janvier',
      amount: 3000,
      category: 'salaries',
      date: new Date('2025-01-06')
    },
    {
      id: '7',
      clientId: '2',
      clientName: 'Société Beta',
      invoiceId: '7',
      description: 'Fournitures février',
      amount: 2500,
      category: 'materials',
      date: new Date('2025-02-11')
    }
  ]);

  // Client operations
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'totalInvoices' | 'totalCosts' | 'totalProfit' | 'monthlyData'>) => {
    const newClient: Client = {
      ...clientData,
      id: Date.now().toString(),
      createdAt: new Date(),
      totalInvoices: 0,
      totalCosts: 0,
      totalProfit: 0,
      monthlyData: []
    };
    setClients(prev => [...prev, newClient]);
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(client => 
      client.id === id ? { ...client, ...updates } : client
    ));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(client => client.id !== id));
    setInvoices(prev => prev.filter(invoice => invoice.clientId !== id));
    setCosts(prev => prev.filter(cost => cost.clientId !== id));
  };

  // Invoice operations
  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'amountTTC'>) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: Date.now().toString(),
      amountTTC: invoiceData.amountHT + invoiceData.tva
    };
    setInvoices(prev => [...prev, newInvoice]);
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(invoice => {
      if (invoice.id === id) {
        const updated = { ...invoice, ...updates };
        if (updates.amountHT !== undefined || updates.tva !== undefined) {
          updated.amountTTC = (updates.amountHT || invoice.amountHT) + (updates.tva || invoice.tva);
        }
        return updated;
      }
      return invoice;
    }));
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(invoice => invoice.id !== id));
    setCosts(prev => prev.filter(cost => cost.invoiceId !== id));
  };

  // Cost operations
  const addCost = (costData: Omit<Cost, 'id'>) => {
    const newCost: Cost = {
      ...costData,
      id: Date.now().toString()
    };
    setCosts(prev => [...prev, newCost]);
  };

  const updateCost = (id: string, updates: Partial<Cost>) => {
    setCosts(prev => prev.map(cost => 
      cost.id === id ? { ...cost, ...updates } : cost
    ));
  };

  const deleteCost = (id: string) => {
    setCosts(prev => prev.filter(cost => cost.id !== id));
  };

  // Analytics
  const getMonthlyData = (year: number = new Date().getFullYear()): MonthlyData[] => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(year, i, 1);
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

  const getClientMonthlyData = (
    clientId: string,
    year: number = new Date().getFullYear()
  ): MonthlyClientData[] => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(year, i, 1);
      return {
        month: format(date, 'MMM'),
        year
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

  const getInvoicesByMonth = (year: number): MonthlyInvoiceTotals[] => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthLabel = format(new Date(year, i, 1), 'MMM yyyy');
      const monthInvoices = invoices.filter(inv =>
        inv.status === 'paid' && format(inv.issueDate, 'MMM yyyy') === monthLabel
      );

      const totalHT = monthInvoices.reduce((sum, inv) => sum + inv.amountHT, 0);
      const totalTTC = monthInvoices.reduce((sum, inv) => sum + inv.amountTTC, 0);

      return {
        month: monthLabel,
        totalHT,
        totalTTC
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
    getInvoicesByMonth,
    getAnnualReport,
    exportToPDF
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};