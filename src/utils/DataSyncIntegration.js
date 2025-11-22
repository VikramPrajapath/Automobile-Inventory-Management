/**
 * DataSyncIntegration.js - Integrate DataSync with existing components
 * Provides factory functions to wrap components with DataSync functionality
 */

import DataSync from "../utils/DataSync";

/**
 * Integrate invoice creation with inventory sync
 */
export const handleCreateInvoiceWithSync = async (
  invoiceData,
  onSuccess,
  onError
) => {
  try {
    // Validate inventory availability
    if (invoiceData.items && invoiceData.items.length > 0) {
      for (const item of invoiceData.items) {
        const inventoryItem = DataSync.getInventoryItem(item.id || item.itemId);
        if (!inventoryItem) {
          throw new Error(`Item ${item.partName} not found in inventory`);
        }
        if (inventoryItem.quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for ${inventoryItem.partName}. Available: ${inventoryItem.quantity}, Required: ${item.quantity}`
          );
        }
      }
    }

    // Create invoice and automatically update inventory
    const invoice = DataSync.createInvoice({
      ...invoiceData,
      items: invoiceData.items.map((item) => ({
        ...item,
        itemId: item.id || item.itemId,
      })),
    });

    if (onSuccess) {
      onSuccess(invoice);
    }

    return invoice;
  } catch (error) {
    console.error("Error creating invoice with sync:", error);
    if (onError) {
      onError(error);
    }
    throw error;
  }
};

/**
 * Integrate payment recording with invoice sync
 */
export const handleRecordPaymentWithSync = async (
  paymentData,
  onSuccess,
  onError
) => {
  try {
    // Record payment and automatically update invoice status
    const payment = DataSync.recordPayment(paymentData);

    if (onSuccess) {
      onSuccess(payment);
    }

    return payment;
  } catch (error) {
    console.error("Error recording payment with sync:", error);
    if (onError) {
      onError(error);
    }
    throw error;
  }
};

/**
 * Get inventory status for invoice creation
 */
export const getInventoryForInvoice = () => {
  return DataSync.getInventory().map((item) => ({
    id: item.id,
    partName: item.partName,
    partNumber: item.partNumber,
    brand: item.brand,
    cost: item.cost,
    discount: item.discount,
    quantity: item.quantity,
    availableQuantity: item.quantity,
  }));
};

/**
 * Get invoice summary with sync status
 */
export const getInvoiceSummary = () => {
  const invoices = DataSync.getInvoices();
  return {
    totalInvoices: invoices.length,
    paidInvoices: invoices.filter((i) => i.status === "paid").length,
    pendingInvoices: invoices.filter((i) => i.status === "pending").length,
    partialInvoices: invoices.filter((i) => i.status === "partial").length,
    totalRevenue: invoices.reduce((sum, i) => sum + (i.grandTotal || 0), 0),
    totalPaid: invoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0),
    totalOutstanding: DataSync.getTotalOutstanding(),
  };
};

/**
 * Get payment summary with sync status
 */
export const getPaymentSummary = () => {
  const stats = DataSync.getPaymentStats();
  return {
    totalPayments: stats.totalPayments,
    totalAmount: stats.totalAmount,
    averagePayment: stats.averagePayment,
    pendingAmount: stats.pendingAmount,
  };
};

/**
 * Bulk update inventory from selling multiple items
 */
export const bulkSellItems = async (items, onProgress, onSuccess, onError) => {
  try {
    const results = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const result = DataSync.sellInventoryItems([items[i]]);
        results.push({ success: true, item: items[i], result });

        if (onProgress) {
          onProgress((i + 1) / items.length);
        }
      } catch (error) {
        results.push({ success: false, item: items[i], error });
      }
    }

    if (onSuccess) {
      onSuccess(results);
    }

    return results;
  } catch (error) {
    console.error("Error in bulk sell:", error);
    if (onError) {
      onError(error);
    }
    throw error;
  }
};

/**
 * Generate comprehensive report with all sync data
 */
export const generateSyncReport = () => {
  return {
    timestamp: new Date().toISOString(),
    inventory: {
      ...DataSync.getInventoryStats(),
      items: DataSync.getInventory(),
    },
    invoices: {
      summary: getInvoiceSummary(),
      all: DataSync.getInvoices(),
      outstanding: DataSync.getOutstandingInvoices(),
    },
    payments: {
      summary: getPaymentSummary(),
      all: DataSync.getPayments(),
    },
    transactions: {
      recent: DataSync.getTransactions(50),
      byType: {
        buy: DataSync.getTransactionsByType("buy"),
        sell: DataSync.getTransactionsByType("sell"),
        payment: DataSync.getTransactionsByType("payment"),
      },
    },
    sales: DataSync.getSalesStats(),
  };
};

const DataSyncIntegration = {
  handleCreateInvoiceWithSync,
  handleRecordPaymentWithSync,
  getInventoryForInvoice,
  getInvoiceSummary,
  getPaymentSummary,
  bulkSellItems,
  generateSyncReport,
};

export default DataSyncIntegration;
