import { useState, useEffect, useCallback } from "react";
import DataSync from "../utils/DataSync";

/**
 * Custom hook for syncing data across components
 * Usage: const { inventory, updateInventory } = useDataSync("inventory");
 */
export const useDataSync = (dataType) => {
  const [data, setData] = useState([]);

  // Subscribe to changes
  useEffect(() => {
    // Set initial data
    if (dataType === "inventory") {
      setData(DataSync.getInventory());
    } else if (dataType === "invoices") {
      setData(DataSync.getInvoices());
    } else if (dataType === "payments") {
      setData(DataSync.getPayments());
    } else if (dataType === "transactions") {
      setData(DataSync.getTransactions());
    }

    // Subscribe to updates
    const unsubscribe = DataSync.subscribe(dataType, (updatedData) => {
      setData(updatedData);
    });

    return unsubscribe;
  }, [dataType]);

  return data;
};

/**
 * Hook for inventory operations
 */
export const useInventorySync = () => {
  const inventory = useDataSync("inventory");

  const updateQuantity = useCallback((itemId, quantityChange, type = "buy") => {
    try {
      DataSync.updateInventoryQuantity(itemId, quantityChange, type);
      return true;
    } catch (error) {
      console.error("Error updating quantity:", error);
      return false;
    }
  }, []);

  const sellItems = useCallback((items) => {
    try {
      DataSync.sellInventoryItems(items);
      return true;
    } catch (error) {
      console.error("Error selling items:", error);
      throw error;
    }
  }, []);

  const getItem = useCallback((itemId) => {
    return DataSync.getInventoryItem(itemId);
  }, []);

  const getStats = useCallback(() => {
    return DataSync.getInventoryStats();
  }, []);

  return {
    inventory,
    updateQuantity,
    sellItems,
    getItem,
    getStats,
  };
};

/**
 * Hook for invoice operations
 */
export const useInvoiceSync = () => {
  const invoices = useDataSync("invoices");

  const createInvoice = useCallback((invoiceData) => {
    try {
      DataSync.createInvoice(invoiceData);
      return true;
    } catch (error) {
      console.error("Error creating invoice:", error);
      throw error;
    }
  }, []);

  const updateStatus = useCallback((invoiceId, status) => {
    try {
      DataSync.updateInvoiceStatus(invoiceId, status);
      return true;
    } catch (error) {
      console.error("Error updating invoice status:", error);
      return false;
    }
  }, []);

  const getByStatus = useCallback((status) => {
    return DataSync.getInvoicesByStatus(status);
  }, []);

  const getOutstanding = useCallback(() => {
    return DataSync.getOutstandingInvoices();
  }, []);

  return {
    invoices,
    createInvoice,
    updateStatus,
    getByStatus,
    getOutstanding,
  };
};

/**
 * Hook for payment operations
 */
export const usePaymentSync = () => {
  const payments = useDataSync("payments");

  const recordPayment = useCallback((paymentData) => {
    try {
      DataSync.recordPayment(paymentData);
      return true;
    } catch (error) {
      console.error("Error recording payment:", error);
      throw error;
    }
  }, []);

  const getByInvoice = useCallback((invoiceId) => {
    return DataSync.getPaymentsByInvoice(invoiceId);
  }, []);

  return {
    payments,
    recordPayment,
    getByInvoice,
  };
};

/**
 * Hook for analytics and reporting
 */
export const useDataAnalytics = () => {
  const [stats, setStats] = useState({
    inventory: {},
    sales: {},
    payments: {},
    outstanding: 0,
  });

  const updateStats = useCallback(() => {
    setStats({
      inventory: DataSync.getInventoryStats(),
      sales: DataSync.getSalesStats(),
      payments: DataSync.getPaymentStats(),
      outstanding: DataSync.getTotalOutstanding(),
    });
  }, []);

  useEffect(() => {
    updateStats();

    // Subscribe to all data changes
    const unsubInv = DataSync.subscribe("inventory", updateStats);
    const unsubInv2 = DataSync.subscribe("invoices", updateStats);
    const unsubPay = DataSync.subscribe("payments", updateStats);

    return () => {
      unsubInv();
      unsubInv2();
      unsubPay();
    };
  }, [updateStats]);

  return stats;
};
