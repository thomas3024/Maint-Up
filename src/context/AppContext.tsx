import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Client,
  Invoice,
  Cost,
  User,
  MonthlyData,
  AnnualReport,
  MonthlyClientData,
  MonthlyReport,
  CostGrid,
} from "../types";
import { format, subMonths, addMonths, getYear } from "date-fns";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_TOKEN = import.meta.env.VITE_API_TOKEN;
const AUTH_HEADER = API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {};
const LOCAL_STORAGE_KEY = "maintup-data";

interface AppContextType {
  // User management
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Data management
  clients: Client[];
  invoices: Invoice[];
  costs: Cost[];
  costGrids: CostGrid[];

  // CRUD operations
  addClient: (
    client: Omit<
      Client,
      "id" | "createdAt" | "totalInvoices" | "totalCosts" | "totalProfit"
    >,
  ) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  addInvoice: (invoice: Omit<Invoice, "id" | "amountTTC">) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;

  addCostGrid: (grid: Omit<CostGrid, "id">) => void;
  updateCostGrid: (id: string, grid: Partial<CostGrid>) => void;
  deleteCostGrid: (id: string) => void;

  addCost: (cost: Omit<Cost, "id">) => void;
  updateCost: (id: string, cost: Partial<Cost>) => void;
  deleteCost: (id: string) => void;

  // Manual sync
  syncData: () => Promise<void>;

  // Analytics
  getMonthlyData: () => MonthlyData[];
  getTotalRevenue: () => number;
  getTotalCosts: () => number;
  getTotalProfit: () => number;
  getClientRevenue: (clientId: string) => number;
  getClientProfit: (clientId: string) => number;
  getClientMonthlyData: (
    clientId: string,
    year?: number,
  ) => MonthlyClientData[];
  getAnnualReport: (year: number) => AnnualReport;
  getMonthlyReport: (month: number, year: number) => MonthlyReport;
  exportToPDF: () => Promise<string | void>;
  exportMonthlyPDF: () => Promise<string | void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: "1",
    name: "Admin User",
    email: "admin@maintup.fr",
    role: "viewer",
  });

  // Données chargées depuis l'API backend ou le localStorage
  const [clients, setClients] = useState<Client[]>([]);

  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [costs, setCosts] = useState<Cost[]>([]);

  const [costGrids, setCostGrids] = useState<CostGrid[]>([]);

  const [apiAvailable, setApiAvailable] = useState(true);
  const [unsynced, setUnsynced] = useState(false);

  const persist = (
    c?: Client[],
    i?: Invoice[],
    co?: Cost[],
    cg?: CostGrid[],
    dirty?: boolean,
  ) => {
    if (dirty !== undefined) setUnsynced(dirty);
    const data = {
      clients: c ?? clients,
      invoices: i ?? invoices,
      costs: co ?? costs,
      costGrids: cg ?? costGrids,
      unsynced: dirty ?? unsynced,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  };

  useEffect(() => {
    const loadData = async () => {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      const storedData = stored ? JSON.parse(stored) : null;
      if (storedData && typeof storedData.unsynced === "boolean") {
        setUnsynced(storedData.unsynced);
      }
      try {
        const [cRes, iRes, coRes, cgRes] = await Promise.all([
          fetch(`${API_URL}/clients`),
          fetch(`${API_URL}/invoices`),
          fetch(`${API_URL}/costs`),
          fetch(`${API_URL}/costGrids`),
        ]);

        if (!cRes.ok) throw new Error("api");

        const clientsData = await cRes.json();
        const invoicesData = await iRes.json();
        const costsData = await coRes.json();
        const costGridsData = await cgRes.json();

        const c = clientsData.map((cl: any) => ({
          ...cl,
          createdAt: new Date(cl.createdAt),
        }));
        const i = invoicesData.map((inv: any) => ({
          ...inv,
          issueDate: new Date(inv.issueDate),
          dueDate: new Date(inv.dueDate),
        }));
        const co = costsData.map((cost: any) => ({
          ...cost,
          date: new Date(cost.date),
        }));
        const cg = costGridsData.map((grid: any) => ({
          ...grid,
        }));

        if (storedData?.unsynced) {
          const localClients = storedData.clients.map((cl: any) => ({
            ...cl,
            createdAt: new Date(cl.createdAt),
          }));
          const localInvoices = storedData.invoices.map((inv: any) => ({
            ...inv,
            issueDate: new Date(inv.issueDate),
            dueDate: new Date(inv.dueDate),
          }));
          const localCosts = storedData.costs.map((cost: any) => ({
            ...cost,
            date: new Date(cost.date),
          }));
          const localGrids = storedData.costGrids || [];

          setClients(localClients);
          setInvoices(localInvoices);
          setCosts(localCosts);
          setCostGrids(localGrids);
          await syncData(localClients, localInvoices, localCosts, localGrids);
        } else {
          setClients(c);
          setInvoices(i);
          setCosts(co);
          setCostGrids(cg);
          persist(c, i, co, cg, false);
        }
      } catch (err) {
        setApiAvailable(false);
        if (storedData) {
          const { clients: c, invoices: i, costs: co, costGrids: cg } = storedData;
          setClients(
            c.map((cl: any) => ({ ...cl, createdAt: new Date(cl.createdAt) })),
          );
          setInvoices(
            i.map((inv: any) => ({
              ...inv,
              issueDate: new Date(inv.issueDate),
              dueDate: new Date(inv.dueDate),
            })),
          );
          setCosts(
            co.map((cost: any) => ({ ...cost, date: new Date(cost.date) })),
          );
          setCostGrids(cg || []);
        }
      }
    };

    loadData();
  }, []);

  // Client operations
  const addClient = async (
    clientData: Omit<
      Client,
      "id" | "createdAt" | "totalInvoices" | "totalCosts" | "totalProfit"
    >,
  ) => {
    try {
      const res = await fetch(`${API_URL}/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...AUTH_HEADER },
        body: JSON.stringify(clientData),
      });
      if (!res.ok) throw new Error("api");
      const newClient: Client = await res.json();
      newClient.createdAt = new Date(newClient.createdAt);
      setClients((prev) => {
        const updated = [...prev, newClient];
        persist(updated, undefined, undefined, undefined, true);
        return updated;
      });
    } catch (e) {
      const newClient: Client = {
        id: Date.now().toString(),
        createdAt: new Date(),
        totalInvoices: 0,
        totalCosts: 0,
        totalProfit: 0,
        ...clientData,
      };
      setClients((prev) => {
        const updated = [...prev, newClient];
        persist(updated, undefined, undefined, undefined);
        return updated;
      });
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const res = await fetch(`${API_URL}/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...AUTH_HEADER },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("api");
      const updated: Client = await res.json();
      updated.createdAt = new Date(updated.createdAt);
        setClients((prev) => {
          const updatedList = prev.map((client) =>
            client.id === id ? updated : client,
          );
          persist(updatedList, undefined, undefined, undefined);
          return updatedList;
        });
    } catch (e) {
        setClients((prev) => {
          const updatedList = prev.map((client) =>
            client.id === id ? { ...client, ...updates } : client,
          );
          persist(updatedList, undefined, undefined, undefined, true);
          return updatedList;
        });
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await fetch(`${API_URL}/clients/${id}`, {
        method: "DELETE",
        headers: AUTH_HEADER,
      });
    } catch (e) {
      // offline, just update local data
      setUnsynced(true);
    }
      setClients((prev) => {
        const updated = prev.filter((client) => client.id !== id);
        persist(updated, undefined, undefined, undefined, true);
        return updated;
      });
      setInvoices((prev) => {
        const updated = prev.filter((invoice) => invoice.clientId !== id);
        persist(undefined, updated, undefined, undefined, true);
        return updated;
      });
      setCosts((prev) => {
        const updated = prev.filter((cost) => cost.clientId !== id);
        persist(undefined, undefined, updated, undefined, true);
        return updated;
      });
  };

  // Invoice operations
  const addInvoice = async (invoiceData: Omit<Invoice, "id" | "amountTTC">) => {
    try {
      const res = await fetch(`${API_URL}/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...AUTH_HEADER },
        body: JSON.stringify(invoiceData),
      });
      if (!res.ok) throw new Error("api");
      const newInvoice: Invoice = await res.json();
      newInvoice.issueDate = new Date(newInvoice.issueDate);
      newInvoice.dueDate = new Date(newInvoice.dueDate);
        setInvoices((prev) => {
          const updated = [...prev, newInvoice];
          persist(undefined, updated, undefined, undefined);
          return updated;
        });
    } catch (e) {
      const newInvoice: Invoice = {
        id: Date.now().toString(),
        amountTTC: invoiceData.amountHT + invoiceData.tva,
        ...invoiceData,
        issueDate: invoiceData.issueDate,
        dueDate: invoiceData.dueDate,
      };
        setInvoices((prev) => {
          const updated = [...prev, newInvoice];
          persist(undefined, updated, undefined, undefined, true);
          return updated;
        });
      setUnsynced(true);
    }
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    try {
      const res = await fetch(`${API_URL}/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...AUTH_HEADER },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("api");
      const updated: Invoice = await res.json();
      updated.issueDate = new Date(updated.issueDate);
      updated.dueDate = new Date(updated.dueDate);
        setInvoices((prev) => {
          const updatedList = prev.map((inv) => (inv.id === id ? updated : inv));
          persist(undefined, updatedList, undefined, undefined);
          return updatedList;
        });
    } catch (e) {
        setInvoices((prev) => {
          const updatedList = prev.map((inv) =>
            inv.id === id ? { ...inv, ...updates } : inv,
          );
          persist(undefined, updatedList, undefined, undefined, true);
          return updatedList;
        });
      setUnsynced(true);
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      await fetch(`${API_URL}/invoices/${id}`, {
        method: "DELETE",
        headers: AUTH_HEADER,
      });
    } catch (e) {
      // offline
      setUnsynced(true);
    }
      setInvoices((prev) => {
        const updated = prev.filter((invoice) => invoice.id !== id);
        persist(undefined, updated, undefined, undefined, true);
        return updated;
      });
      setCosts((prev) => {
        const updated = prev.filter((cost) => cost.invoiceId !== id);
        persist(undefined, undefined, updated, undefined, true);
        return updated;
      });
  };

  // Cost operations
  const addCost = async (costData: Omit<Cost, "id">) => {
    try {
      const res = await fetch(`${API_URL}/costs`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...AUTH_HEADER },
        body: JSON.stringify(costData),
      });
      if (!res.ok) throw new Error("api");
      const newCost: Cost = await res.json();
      newCost.date = new Date(newCost.date);
        setCosts((prev) => {
          const updated = [...prev, newCost];
          persist(undefined, undefined, updated, undefined);
          return updated;
        });
    } catch (e) {
      const newCost: Cost = { id: Date.now().toString(), ...costData };
        setCosts((prev) => {
          const updated = [...prev, newCost];
          persist(undefined, undefined, updated, undefined, true);
          return updated;
        });
      setUnsynced(true);
    }
  };

  const updateCost = async (id: string, updates: Partial<Cost>) => {
    try {
      const res = await fetch(`${API_URL}/costs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...AUTH_HEADER },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("api");
      const updated: Cost = await res.json();
      updated.date = new Date(updated.date);
        setCosts((prev) => {
          const updatedList = prev.map((cost) =>
            cost.id === id ? updated : cost,
          );
          persist(undefined, undefined, updatedList, undefined);
          return updatedList;
        });
    } catch (e) {
        setCosts((prev) => {
          const updatedList = prev.map((cost) =>
            cost.id === id ? { ...cost, ...updates } : cost,
          );
          persist(undefined, undefined, updatedList, undefined, true);
          return updatedList;
        });
      setUnsynced(true);
    }
  };

  const deleteCost = async (id: string) => {
    try {
      await fetch(`${API_URL}/costs/${id}`, {
        method: "DELETE",
        headers: AUTH_HEADER,
      });
    } catch (e) {
      // offline
      setUnsynced(true);
    }
      setCosts((prev) => {
        const updated = prev.filter((cost) => cost.id !== id);
        persist(undefined, undefined, updated, undefined, true);
        return updated;
      });
  };

  // Cost grid operations
  const addCostGrid = async (gridData: Omit<CostGrid, "id">) => {
    try {
      const res = await fetch(`${API_URL}/costGrids`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...AUTH_HEADER },
        body: JSON.stringify(gridData),
      });
      if (!res.ok) throw new Error("api");
      const newGrid: CostGrid = await res.json();
      setCostGrids((prev) => {
        const updated = [...prev, newGrid];
        persist(undefined, undefined, undefined, updated);
        return updated;
      });
    } catch (e) {
      const newGrid: CostGrid = { id: Date.now().toString(), ...gridData };
      setCostGrids((prev) => {
        const updated = [...prev, newGrid];
        persist(undefined, undefined, undefined, updated, true);
        return updated;
      });
      setUnsynced(true);
    }
  };

  const updateCostGrid = async (id: string, updates: Partial<CostGrid>) => {
    try {
      const res = await fetch(`${API_URL}/costGrids/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...AUTH_HEADER },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("api");
      const updatedGrid: CostGrid = await res.json();
      setCostGrids((prev) => {
        const updatedList = prev.map((g) => (g.id === id ? updatedGrid : g));
        persist(undefined, undefined, undefined, updatedList);
        return updatedList;
      });
    } catch (e) {
      setCostGrids((prev) => {
        const updatedList = prev.map((g) =>
          g.id === id ? { ...g, ...updates } : g,
        );
        persist(undefined, undefined, undefined, updatedList, true);
        return updatedList;
      });
      setUnsynced(true);
    }
  };

  const deleteCostGrid = async (id: string) => {
    try {
      await fetch(`${API_URL}/costGrids/${id}`, {
        method: "DELETE",
        headers: AUTH_HEADER,
      });
    } catch (e) {
      setUnsynced(true);
    }
    setCostGrids((prev) => {
      const updated = prev.filter((g) => g.id !== id);
      persist(undefined, undefined, undefined, updated, true);
      return updated;
    });
  };

  // Analytics
  const getMonthlyData = (): MonthlyData[] => {
    // Always display data starting from January 2025
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(2025, i, 1);
      return format(date, "MMM yyyy");
    });

    return months.map((month) => {
      const monthRevenue = invoices
        .filter(
          (inv) =>
            (inv.status === "paid" || inv.status === "pending") &&
            format(inv.issueDate, "MMM yyyy") === month,
        )
        .reduce((sum, inv) => sum + inv.amountHT, 0);

      const monthCosts = costs
        .filter((cost) => format(cost.date, "MMM yyyy") === month)
        .reduce((sum, cost) => sum + cost.amount, 0);

      const profit = monthRevenue - monthCosts;
      const margin = monthRevenue > 0 ? (profit / monthRevenue) * 100 : 0;

      return {
        month,
        revenue: monthRevenue,
        costs: monthCosts,
        profit,
        margin,
      };
    });
  };

  const getTotalRevenue = () => {
    return invoices
      .filter((inv) => inv.status === "paid" || inv.status === "pending")
      .reduce((sum, inv) => sum + inv.amountHT, 0);
  };

  const getTotalCosts = () => {
    return costs.reduce((sum, cost) => sum + cost.amount, 0);
  };

  const getTotalProfit = () => {
    return getTotalRevenue() - getTotalCosts();
  };

  const getClientRevenue = (clientId: string) => {
    return invoices
      .filter(
        (inv) =>
          inv.clientId === clientId &&
          (inv.status === "paid" || inv.status === "pending"),
      )
      .reduce((sum, inv) => sum + inv.amountHT, 0);
  };

  const getClientProfit = (clientId: string) => {
    const clientInvoices = invoices.filter(
      (inv) =>
        inv.clientId === clientId &&
        (inv.status === "paid" || inv.status === "pending"),
    );
    const clientCosts = costs.filter((cost) => cost.clientId === clientId);

    const revenue = clientInvoices.reduce((sum, inv) => sum + inv.amountHT, 0);
    const totalCosts = clientCosts.reduce((sum, cost) => sum + cost.amount, 0);

    return revenue - totalCosts;
  };

  const getClientMonthlyData = (
    clientId: string,
    year = 2025,
  ): MonthlyClientData[] => {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 1);

    const months: { month: string; year: number }[] = [];
    let current = new Date(startDate);
    while (current <= endDate) {
      months.push({ month: format(current, "MMM"), year: getYear(current) });
      current = addMonths(current, 1);
    }

    return months.map(({ month, year }) => {
      const monthKey = `${month} ${year}`;

      const clientInvoices = invoices.filter(
        (inv) =>
          inv.clientId === clientId &&
          (inv.status === "paid" || inv.status === "pending") &&
          format(inv.issueDate, "MMM yyyy") === monthKey,
      );

      const clientCosts = costs.filter(
        (cost) =>
          cost.clientId === clientId &&
          format(cost.date, "MMM yyyy") === monthKey,
      );

      const revenue = clientInvoices.reduce(
        (sum, inv) => sum + inv.amountHT,
        0,
      );
      const costsTotal = clientCosts.reduce(
        (sum, cost) => sum + cost.amount,
        0,
      );
      const profit = revenue - costsTotal;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

      return {
        month: monthKey,
        year,
        revenue,
        costs: costsTotal,
        profit,
        margin,
        invoicesCount: clientInvoices.length,
      };
    });
  };

  const getAnnualReport = (year: number): AnnualReport => {
    const yearInvoices = invoices.filter(
      (inv) =>
        (inv.status === "paid" || inv.status === "pending") &&
        getYear(inv.issueDate) === year,
    );
    const yearCosts = costs.filter((cost) => getYear(cost.date) === year);

    const totalRevenue = yearInvoices.reduce(
      (sum, inv) => sum + inv.amountHT,
      0,
    );
    const totalCosts = yearCosts.reduce((sum, cost) => sum + cost.amount, 0);
    const totalProfit = totalRevenue - totalCosts;
    const averageMargin =
      totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    const clientsData = clients.map((client) => {
      const clientInvoices = yearInvoices.filter(
        (inv) => inv.clientId === client.id,
      );
      const clientCosts = yearCosts.filter(
        (cost) => cost.clientId === client.id,
      );

      const revenue = clientInvoices.reduce(
        (sum, inv) => sum + inv.amountHT,
        0,
      );
      const costs = clientCosts.reduce((sum, cost) => sum + cost.amount, 0);
      const profit = revenue - costs;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
      const revenueShare =
        totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;

      return {
        clientId: client.id,
        clientName: client.name,
        revenue,
        costs,
        profit,
        margin,
        revenueShare,
        invoicesCount: clientInvoices.length,
      };
    });

    // Add office costs as a separate entry if any
    const officeCosts = yearCosts.filter((cost) => cost.category === "office");
    if (officeCosts.length > 0) {
      const officeTotal = officeCosts.reduce((sum, c) => sum + c.amount, 0);
      clientsData.push({
        clientId: "office",
        clientName: "Charges Bureau",
        revenue: 0,
        costs: officeTotal,
        profit: -officeTotal,
        margin: 0,
        revenueShare: 0,
        invoicesCount: 0,
      });
    }

    const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
      const month = format(new Date(year, i, 1), "MMM yyyy");

      const monthRevenue = yearInvoices
        .filter((inv) => format(inv.issueDate, "MMM yyyy") === month)
        .reduce((sum, inv) => sum + inv.amountHT, 0);

      const monthCosts = yearCosts
        .filter((cost) => format(cost.date, "MMM yyyy") === month)
        .reduce((sum, cost) => sum + cost.amount, 0);

      const profit = monthRevenue - monthCosts;
      const margin = monthRevenue > 0 ? (profit / monthRevenue) * 100 : 0;

      return {
        month,
        revenue: monthRevenue,
        costs: monthCosts,
        profit,
        margin,
      };
    });

    return {
      year,
      totalRevenue,
      totalCosts,
      totalProfit,
      averageMargin,
      clientsData,
      monthlyBreakdown,
    };
  };

  const getMonthlyReport = (month: number, year: number): MonthlyReport => {
    const key = format(new Date(year, month, 1), "MMM yyyy");

    const monthInvoices = invoices.filter(
      (inv) =>
        (inv.status === "paid" || inv.status === "pending") &&
        format(inv.issueDate, "MMM yyyy") === key,
    );

    const monthCosts = costs.filter(
      (cost) => format(cost.date, "MMM yyyy") === key,
    );

    const revenue = monthInvoices.reduce((sum, inv) => sum + inv.amountHT, 0);
    const costsTotal = monthCosts.reduce((sum, c) => sum + c.amount, 0);
    const profit = revenue - costsTotal;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      month: key,
      revenue,
      costs: costsTotal,
      profit,
      margin,
      invoices: monthInvoices,
      costsList: monthCosts,
    };
  };

  const exportToPDF = async (): Promise<string | void> => {
    const element = document.getElementById("annual-report");
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    const pdfUrl = pdf.output("bloburl");
    return pdfUrl;
  };

  const exportMonthlyPDF = async (): Promise<string | void> => {
    const element = document.getElementById("monthly-report");
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    const pdfUrl = pdf.output("bloburl");
    return pdfUrl;
  };

  const syncData = useCallback(
    async (
      c: Client[] = clients,
      i: Invoice[] = invoices,
      co: Cost[] = costs,
      cg: CostGrid[] = costGrids,
    ): Promise<void> => {
      try {
        await fetch(`${API_URL}/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...AUTH_HEADER },
          body: JSON.stringify({ clients: c, invoices: i, costs: co, costGrids: cg }),
        });
        persist(c, i, co, cg, false);
        setApiAvailable(true);
      } catch (e) {
        console.error("Sync failed", e);
        setApiAvailable(false);
        persist(c, i, co, cg, true);
      }
    },
    [clients, invoices, costs, costGrids],
  );

  useEffect(() => {
    const handleOnline = async () => {
      try {
        await syncData();
        setApiAvailable(true);
      } catch (e) {
        setApiAvailable(false);
      }
    };

    window.addEventListener("online", handleOnline);

    let interval: NodeJS.Timeout | undefined;
    if (!apiAvailable) {
      interval = setInterval(handleOnline, 30000);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      if (interval) clearInterval(interval);
    };
  }, [apiAvailable, syncData]);

  const value: AppContextType = {
    currentUser,
    setCurrentUser,
    clients,
    invoices,
    costs,
    costGrids,
    addClient,
    updateClient,
    deleteClient,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    addCost,
    updateCost,
    deleteCost,
    addCostGrid,
    updateCostGrid,
    deleteCostGrid,
    getMonthlyData,
    getTotalRevenue,
    getTotalCosts,
    getTotalProfit,
    getClientRevenue,
    getClientProfit,
    getClientMonthlyData,
    getAnnualReport,
    getMonthlyReport,
    exportToPDF,
    exportMonthlyPDF,
    syncData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
