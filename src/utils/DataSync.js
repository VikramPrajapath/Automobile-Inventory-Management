/**
 * DataSync.js - Centralized data synchronization for inventory, invoices, and payments
 * Manages automatic updates across all components when data changes
 */

class DataSync {
  constructor() {
    this.listeners = {
      inventory: [],
      invoices: [],
      payments: [],
      transactions: [],
    };
    this.data = {
      inventory: [],
      invoices: [],
      payments: [],
      transactions: [],
    };
    this.initializeData();
  }

  // Initialize data from localStorage
  initializeData() {
    try {
      this.data.inventory = JSON.parse(
        localStorage.getItem("vehicles") || "[]"
      );
      this.data.invoices = JSON.parse(localStorage.getItem("invoices") || "[]");
      this.data.payments = JSON.parse(localStorage.getItem("payments") || "[]");
      this.data.transactions = JSON.parse(
        localStorage.getItem("transactions") || "[]"
      );
    } catch (error) {
      console.error("Error initializing DataSync:", error);
    }
  }

  // Subscribe to data changes
  subscribe(dataType, callback) {
    if (this.listeners[dataType]) {
      this.listeners[dataType].push(callback);
      // Return unsubscribe function
      return () => {
        this.listeners[dataType] = this.listeners[dataType].filter(
          (cb) => cb !== callback
        );
      };
    }
    return () => {};
  }

  // Notify all listeners of data changes
  notifyListeners(dataType, data) {
    if (this.listeners[dataType]) {
      this.listeners[dataType].forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for ${dataType}:`, error);
        }
      });
    }
  }

  // ==================== INVENTORY OPERATIONS ====================

  // Update inventory (buying/receiving stock)
  updateInventoryQuantity(itemId, quantityChange, type = "buy") {
    try {
      const inventory = this.data.inventory;
      const item = inventory.find((i) => i.id === itemId);

      if (!item) {
        throw new Error("Item not found");
      }

      const oldQuantity = item.quantity;
      item.quantity += quantityChange;

      // Ensure quantity doesn't go below 0
      if (item.quantity < 0) {
        item.quantity = 0;
      }

      // Save to localStorage
      localStorage.setItem("vehicles", JSON.stringify(inventory));
      this.data.inventory = inventory;

      // Create transaction record
      this.createTransaction({
        type,
        itemId,
        itemName: item.partName,
        quantityBefore: oldQuantity,
        quantityAfter: item.quantity,
        quantityChanged: quantityChange,
        timestamp: new Date().toISOString(),
      });

      // Notify listeners
      this.notifyListeners("inventory", inventory);

      return item;
    } catch (error) {
      console.error("Error updating inventory quantity:", error);
      throw error;
    }
  }

  // Sell items from inventory
  sellInventoryItems(items) {
    try {
      const inventory = this.data.inventory;
      const soldItems = [];

      items.forEach((saleItem) => {
        // Handle both item.id and item.itemId formats
        const itemId = saleItem.itemId || saleItem.id;
        const invItem = inventory.find((i) => i.id === itemId);

        if (!invItem) {
          throw new Error(`Item with ID ${itemId} not found in inventory`);
        }

        if (invItem.quantity < saleItem.quantity) {
          throw new Error(
            `Insufficient quantity for ${invItem.partName}. Available: ${invItem.quantity}, Requested: ${saleItem.quantity}`
          );
        }

        const oldQuantity = invItem.quantity;
        invItem.quantity -= saleItem.quantity;

        console.log(
          `Sold: ${invItem.partName}, Qty: ${saleItem.quantity}, Old: ${oldQuantity}, New: ${invItem.quantity}`
        );

        // Create transaction record
        this.createTransaction({
          type: "sell",
          itemId: saleItem.itemId || saleItem.id,
          itemName: invItem.partName,
          quantityBefore: oldQuantity,
          quantityAfter: invItem.quantity,
          quantityChanged: -saleItem.quantity,
          amount: saleItem.totalPrice || 0,
          timestamp: new Date().toISOString(),
        });

        soldItems.push(invItem);
      });

      localStorage.setItem("vehicles", JSON.stringify(inventory));
      this.data.inventory = inventory;
      this.notifyListeners("inventory", inventory);

      return soldItems;
    } catch (error) {
      console.error("Error selling inventory items:", error);
      throw error;
    }
  }

  // Get inventory item
  getInventoryItem(itemId) {
    return this.data.inventory.find((i) => i.id === itemId);
  }

  // Get all inventory
  getInventory() {
    return [...this.data.inventory];
  }

  // ==================== INVOICE OPERATIONS ====================

  // Create invoice and update inventory
  createInvoice(invoiceData) {
    try {
      const invoice = {
        ...invoiceData,
        id: invoiceData.id || Date.now(),
        createdAt: invoiceData.createdAt || new Date().toISOString(),
        status: invoiceData.status || "pending",
      };

      // Validate and update inventory
      if (invoiceData.items && invoiceData.items.length > 0) {
        this.sellInventoryItems(
          invoiceData.items.map((item) => ({
            itemId: item.id || item.itemId,
            quantity: item.quantity,
            totalPrice: item.lineTotal,
          }))
        );
      }

      // Save invoice
      const invoices = this.data.invoices;
      invoices.push(invoice);
      localStorage.setItem("invoices", JSON.stringify(invoices));
      this.data.invoices = invoices;

      this.notifyListeners("invoices", invoices);

      return invoice;
    } catch (error) {
      console.error("Error creating invoice:", error);
      throw error;
    }
  }

  // Update invoice status
  updateInvoiceStatus(invoiceId, status) {
    try {
      const invoices = this.data.invoices;
      const invoice = invoices.find((i) => i.id === invoiceId);

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      invoice.status = status;
      localStorage.setItem("invoices", JSON.stringify(invoices));
      this.data.invoices = invoices;

      this.notifyListeners("invoices", invoices);

      return invoice;
    } catch (error) {
      console.error("Error updating invoice status:", error);
      throw error;
    }
  }

  // Get invoices by status
  getInvoicesByStatus(status) {
    return this.data.invoices.filter((i) => i.status === status);
  }

  // Get all invoices
  getInvoices() {
    return [...this.data.invoices];
  }

  // ==================== PAYMENT OPERATIONS ====================

  // Record payment and update invoice
  recordPayment(paymentData) {
    try {
      const payment = {
        ...paymentData,
        id: paymentData.id || Date.now(),
        createdAt: paymentData.createdAt || new Date().toISOString(),
        status: "confirmed",
      };

      // Update invoice to paid/partial status
      if (paymentData.invoiceId) {
        const invoice = this.data.invoices.find(
          (i) => i.id === paymentData.invoiceId
        );

        if (invoice) {
          // Calculate total paid for this invoice
          const totalPaidForInvoice = this.data.payments
            .filter((p) => p.invoiceId === paymentData.invoiceId)
            .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

          const newTotalPaid =
            totalPaidForInvoice + parseFloat(payment.amount || 0);
          const invoiceTotal = invoice.grandTotal || invoice.totalAmount || 0;

          if (newTotalPaid >= invoiceTotal) {
            invoice.status = "paid";
            invoice.paidAmount = newTotalPaid;
          } else if (newTotalPaid > 0) {
            invoice.status = "partial";
            invoice.paidAmount = newTotalPaid;
          }

          localStorage.setItem("invoices", JSON.stringify(this.data.invoices));
          this.notifyListeners("invoices", this.data.invoices);
        }
      }

      // Save payment
      const payments = this.data.payments;
      payments.push(payment);
      localStorage.setItem("payments", JSON.stringify(payments));
      this.data.payments = payments;

      // Create transaction record
      this.createTransaction({
        type: "payment",
        invoiceId: paymentData.invoiceId,
        invoiceNumber: paymentData.invoiceNumber,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        timestamp: new Date().toISOString(),
      });

      this.notifyListeners("payments", payments);

      return payment;
    } catch (error) {
      console.error("Error recording payment:", error);
      throw error;
    }
  }

  // Get payments by invoice
  getPaymentsByInvoice(invoiceId) {
    return this.data.payments.filter((p) => p.invoiceId === invoiceId);
  }

  // Get all payments
  getPayments() {
    return [...this.data.payments];
  }

  // ==================== TRANSACTION HISTORY ====================

  // Create transaction record
  createTransaction(transactionData) {
    try {
      const transaction = {
        ...transactionData,
        id: Date.now(),
        timestamp: transactionData.timestamp || new Date().toISOString(),
      };

      const transactions = this.data.transactions;
      transactions.push(transaction);

      // Keep only last 1000 transactions
      if (transactions.length > 1000) {
        transactions.splice(0, transactions.length - 1000);
      }

      localStorage.setItem("transactions", JSON.stringify(transactions));
      this.data.transactions = transactions;

      this.notifyListeners("transactions", transactions);

      return transaction;
    } catch (error) {
      console.error("Error creating transaction:", error);
    }
  }

  // Get transaction history
  getTransactions(limit = 100) {
    return this.data.transactions.slice(-limit).reverse();
  }

  // Get transactions by type
  getTransactionsByType(type) {
    return this.data.transactions.filter((t) => t.type === type);
  }

  // ==================== ANALYTICS & REPORTING ====================

  // Get inventory statistics
  getInventoryStats() {
    const inventory = this.data.inventory;
    const totalItems = inventory.length;
    const totalQuantity = inventory.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const totalValue = inventory.reduce(
      (sum, item) => sum + item.cost * item.quantity,
      0
    );
    const lowStockCount = inventory.filter((item) => item.quantity < 5).length;

    return {
      totalItems,
      totalQuantity,
      totalValue,
      lowStockCount,
      averageValue: totalItems > 0 ? totalValue / totalItems : 0,
    };
  }

  // Get sales statistics
  getSalesStats(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const relevantTransactions = this.data.transactions.filter(
      (t) => t.type === "sell" && new Date(t.timestamp) >= cutoffDate
    );

    const totalSales = relevantTransactions.length;
    const totalAmount = relevantTransactions.reduce(
      (sum, t) => sum + (t.amount || 0),
      0
    );
    const totalQuantitySold = relevantTransactions.reduce(
      (sum, t) => sum + Math.abs(t.quantityChanged),
      0
    );

    return {
      totalSales,
      totalAmount,
      totalQuantitySold,
      averageSaleValue: totalSales > 0 ? totalAmount / totalSales : 0,
    };
  }

  // Get payment statistics
  getPaymentStats(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const relevantPayments = this.data.payments.filter(
      (p) => new Date(p.createdAt) >= cutoffDate
    );

    const totalPayments = relevantPayments.length;
    const totalAmount = relevantPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount || 0),
      0
    );
    const pendingAmount = this.data.invoices
      .filter((i) => i.status !== "paid")
      .reduce(
        (sum, i) =>
          sum + (i.grandTotal || i.totalAmount || 0) - (i.paidAmount || 0),
        0
      );

    return {
      totalPayments,
      totalAmount,
      pendingAmount,
      averagePayment: totalPayments > 0 ? totalAmount / totalPayments : 0,
    };
  }

  // Get outstanding invoices
  getOutstandingInvoices() {
    return this.data.invoices.filter((i) => i.status !== "paid");
  }

  // Get total outstanding amount
  getTotalOutstanding() {
    return this.getOutstandingInvoices().reduce(
      (sum, i) =>
        sum + (i.grandTotal || i.totalAmount || 0) - (i.paidAmount || 0),
      0
    );
  }

  // ==================== BULK OPERATIONS ====================

  // Import data and sync
  importData(type, data) {
    try {
      if (type === "inventory") {
        this.data.inventory = Array.isArray(data) ? data : this.data.inventory;
        localStorage.setItem("vehicles", JSON.stringify(this.data.inventory));
        this.notifyListeners("inventory", this.data.inventory);
      } else if (type === "invoices") {
        this.data.invoices = Array.isArray(data) ? data : this.data.invoices;
        localStorage.setItem("invoices", JSON.stringify(this.data.invoices));
        this.notifyListeners("invoices", this.data.invoices);
      } else if (type === "payments") {
        this.data.payments = Array.isArray(data) ? data : this.data.payments;
        localStorage.setItem("payments", JSON.stringify(this.data.payments));
        this.notifyListeners("payments", this.data.payments);
      }
      return true;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  }

  // Export all data
  exportAllData() {
    return {
      inventory: this.data.inventory,
      invoices: this.data.invoices,
      payments: this.data.payments,
      transactions: this.data.transactions,
      exportDate: new Date().toISOString(),
    };
  }

  // Clear all data (with confirmation)
  clearAllData(confirmMessage = true) {
    if (
      confirmMessage &&
      !window.confirm(
        "Are you sure you want to delete ALL data? This action cannot be undone."
      )
    ) {
      return false;
    }

    try {
      this.data = {
        inventory: [],
        invoices: [],
        payments: [],
        transactions: [],
      };

      localStorage.removeItem("vehicles");
      localStorage.removeItem("invoices");
      localStorage.removeItem("payments");
      localStorage.removeItem("transactions");

      Object.keys(this.listeners).forEach((key) => {
        this.notifyListeners(key, []);
      });

      return true;
    } catch (error) {
      console.error("Error clearing data:", error);
      return false;
    }
  }
}

// Create singleton instance
const dataSyncInstance = new DataSync();

export default dataSyncInstance;
