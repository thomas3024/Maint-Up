export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
  totalInvoices: number;
  totalCosts: number;
  totalProfit: number;
}

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  number: string;
  amountHT: number;
  tva: number;
  amountTTC: number;
  status: 'pending' | 'paid' | 'overdue';
  issueDate: Date;
  dueDate: Date;
  description: string;
  pdfUrl?: string;
}

export interface Cost {
  id: string;
  clientId: string;
  clientName: string;
  invoiceId?: string;
  description: string;
  amount: number;
  category: 'office' | 'salaries' | 'charges' | 'subcontracting' | 'materials' | 'transport' | 'housing' | 'other';
  date: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'viewer';
}

export interface MonthlyData {
  month: string;
  revenue: number;
  costs: number;
  profit: number;
  margin: number;
}

export interface MonthlyClientData {
  month: string;
  year: number;
  revenue: number;
  costs: number;
  profit: number;
  margin: number;
  invoicesCount: number;
}

export interface AnnualReport {
  year: number;
  totalRevenue: number;
  totalCosts: number;
  totalProfit: number;
  averageMargin: number;
  clientsData: ClientAnnualData[];
  monthlyBreakdown: MonthlyData[];
}

export interface ClientAnnualData {
  clientId: string;
  clientName: string;
  revenue: number;
  costs: number;
  profit: number;
  margin: number;
  /** Part du chiffre d'affaires total sur l'année (en %) */
  revenueShare: number;
  invoicesCount: number;
}