import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Plus,
  Download,
  Eye,
  Trash2,
  X,
  Search,
  Edit2,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const InvoiceManager = ({ inventory, theme, onClose }) => {
  const [invoices, setInvoices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Load invoices from localStorage
  useEffect(() => {
    const savedInvoices = localStorage.getItem("invoices");
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    }
  }, []);

  // Save invoices to localStorage
  useEffect(() => {
    if (invoices.length > 0) {
      localStorage.setItem("invoices", JSON.stringify(invoices));
    }
  }, [invoices]);

  const generateInvoiceNumber = useCallback(() => {
    const date = new Date();
    const timestamp = date.getTime();
    return `INV-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${timestamp.toString().slice(-6)}`;
  }, []);

  const handleAddInvoice = useCallback(
    (invoiceData) => {
      const newInvoice = {
        ...invoiceData,
        id: Date.now(),
        invoiceNumber: generateInvoiceNumber(),
        createdAt: new Date().toISOString(),
        status: "pending",
      };
      setInvoices((prev) => [...prev, newInvoice]);
    },
    [generateInvoiceNumber]
  );

  const handleUpdateInvoice = useCallback((updatedInvoice) => {
    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === updatedInvoice.id ? updatedInvoice : invoice
      )
    );
  }, []);

  const handleDeleteInvoice = useCallback((id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      setInvoices((prev) => prev.filter((invoice) => invoice.id !== id));
    }
  }, []);

  const handleExportPDF = useCallback((invoice) => {
    const element = document.getElementById(`invoice-${invoice.id}`);
    if (!element) return;

    html2canvas(element).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`${invoice.invoiceNumber}.pdf`);
    });
  }, []);

  const handleExportExcel = useCallback(() => {
    const exportData = invoices.map((invoice) => ({
      "Invoice Number": invoice.invoiceNumber,
      Date: new Date(invoice.createdAt).toLocaleDateString(),
      Customer: invoice.customerName,
      Email: invoice.customerEmail,
      Phone: invoice.customerPhone,
      Total: invoice.total,
      Tax: invoice.taxAmount,
      "Grand Total": invoice.grandTotal,
      Status: invoice.status,
      Notes: invoice.notes,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoices");
    XLSX.writeFile(wb, "invoices_export.xlsx");
  }, [invoices]);

  // Memoize filtered invoices to avoid recalculation
  const filteredInvoices = useMemo(() => {
    if (!searchTerm) return invoices;
    const lowerSearch = searchTerm.toLowerCase();
    return invoices.filter(
      (invoice) =>
        invoice.invoiceNumber?.toLowerCase().includes(lowerSearch) ||
        invoice.customerName?.toLowerCase().includes(lowerSearch) ||
        invoice.customerEmail?.toLowerCase().includes(lowerSearch)
    );
  }, [invoices, searchTerm]);

  const bgClass =
    theme === "dark"
      ? "bg-gray-800 border border-gray-700"
      : "bg-white border border-gray-200";

  const textClass = theme === "dark" ? "text-gray-100" : "text-gray-800";
  const subtextClass = theme === "dark" ? "text-gray-300" : "text-gray-600";

  return (
    <div className={`${bgClass} rounded-2xl shadow-xl p-6`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-3xl font-bold ${textClass}`}>Invoice Manager</h2>
          <p className={`text-sm ${subtextClass}`}>
            Manage customer invoices and track payments
          </p>
        </div>
        <button
          onClick={onClose}
          className={`p-2 rounded-lg hover:bg-gray-200 ${
            theme === "dark" ? "hover:bg-gray-700" : ""
          }`}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div
          className={`p-4 rounded-lg ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-50"
          }`}
        >
          <div className={`text-sm ${subtextClass} mb-1`}>Total Invoices</div>
          <div className={`text-2xl font-bold ${textClass}`}>
            {invoices.length}
          </div>
        </div>
        <div
          className={`p-4 rounded-lg ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-50"
          }`}
        >
          <div className={`text-sm ${subtextClass} mb-1`}>Total Revenue</div>
          <div className={`text-2xl font-bold text-green-600`}>
            ₹
            {invoices
              .reduce((sum, inv) => sum + (inv.grandTotal || 0), 0)
              .toFixed(2)}
          </div>
        </div>
        <div
          className={`p-4 rounded-lg ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-50"
          }`}
        >
          <div className={`text-sm ${subtextClass} mb-1`}>Pending</div>
          <div className={`text-2xl font-bold text-yellow-600`}>
            {invoices.filter((inv) => inv.status === "pending").length}
          </div>
        </div>
        <div
          className={`p-4 rounded-lg ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-50"
          }`}
        >
          <div className={`text-sm ${subtextClass} mb-1`}>Paid</div>
          <div className={`text-2xl font-bold text-green-600`}>
            {invoices.filter((inv) => inv.status === "paid").length}
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search invoices..."
              className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={() => {
            setEditingInvoice(null);
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Invoice
        </button>

        <button
          onClick={handleExportExcel}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export
        </button>
      </div>

      {/* Invoices List */}
      <div
        className={`overflow-x-auto border rounded-lg ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <table className="w-full text-sm">
          <thead
            className={`border-b ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600"
                : "bg-gray-100 border-gray-200"
            }`}
          >
            <tr>
              <th className={`px-6 py-3 text-left font-medium ${textClass}`}>
                Invoice #
              </th>
              <th className={`px-6 py-3 text-left font-medium ${textClass}`}>
                Customer
              </th>
              <th className={`px-6 py-3 text-left font-medium ${textClass}`}>
                Date
              </th>
              <th className={`px-6 py-3 text-right font-medium ${textClass}`}>
                Amount
              </th>
              <th className={`px-6 py-3 text-left font-medium ${textClass}`}>
                Status
              </th>
              <th className={`px-6 py-3 text-center font-medium ${textClass}`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className={`border-b ${
                    theme === "dark"
                      ? "border-gray-700 hover:bg-gray-700"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <td className={`px-6 py-4 font-medium ${textClass}`}>
                    {invoice.invoiceNumber}
                  </td>
                  <td className={`px-6 py-4 ${subtextClass}`}>
                    {invoice.customerName}
                  </td>
                  <td className={`px-6 py-4 ${subtextClass}`}>
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </td>
                  <td
                    className={`px-6 py-4 text-right font-medium ${textClass}`}
                  >
                    ₹{invoice.grandTotal?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        invoice.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {invoice.status === "paid" ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setShowPreview(true);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                        title="Preview"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleExportPDF(invoice)}
                        className="text-green-600 hover:text-green-700"
                        title="Export as PDF"
                      >
                        <FileText className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingInvoice(invoice);
                          setShowModal(true);
                        }}
                        className="text-purple-600 hover:text-purple-700"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteInvoice(invoice.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className={`px-6 py-8 text-center ${subtextClass}`}
                >
                  No invoices found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Invoice Modal */}
      {showModal && (
        <InvoiceFormModal
          invoice={editingInvoice}
          inventory={inventory}
          theme={theme}
          onSave={editingInvoice ? handleUpdateInvoice : handleAddInvoice}
          onClose={() => {
            setShowModal(false);
            setEditingInvoice(null);
          }}
        />
      )}

      {/* Preview Modal */}
      {showPreview && selectedInvoice && (
        <InvoicePreview
          invoice={selectedInvoice}
          theme={theme}
          onClose={() => setShowPreview(false)}
          onExportPDF={() => handleExportPDF(selectedInvoice)}
        />
      )}
    </div>
  );
};

// Invoice Form Modal Component
const InvoiceFormModal = ({ invoice, inventory, theme, onSave, onClose }) => {
  const [formData, setFormData] = useState(
    invoice || {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      items: [],
      taxRate: 18,
      paymentMethod: "cash",
      notes: "",
      status: "pending",
    }
  );

  const [selectedPart, setSelectedPart] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const bgClass =
    theme === "dark"
      ? "bg-gray-800 border border-gray-700"
      : "bg-white border border-gray-200";

  const textClass = theme === "dark" ? "text-gray-100" : "text-gray-800";
  const subtextClass = theme === "dark" ? "text-gray-300" : "text-gray-600";

  const handleAddItem = () => {
    if (!selectedPart) return;

    const item = {
      ...selectedPart,
      quantity: parseInt(quantity),
      lineTotal: selectedPart.cost * parseInt(quantity),
    };

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, item],
    }));

    setSelectedPart(null);
    setQuantity(1);
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const subtotal = formData.items.reduce(
    (sum, item) => sum + item.lineTotal,
    0
  );
  const taxAmount = (subtotal * formData.taxRate) / 100;
  const grandTotal = subtotal + taxAmount;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      subtotal,
      taxAmount,
      grandTotal,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className={`${bgClass} rounded-2xl max-w-2xl w-full p-6 my-8`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${textClass}`}>
            {invoice ? "Edit Invoice" : "Create New Invoice"}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-200 ${
              theme === "dark" ? "hover:bg-gray-700" : ""
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Info */}
          <div className="space-y-4">
            <h3 className={`font-semibold ${textClass}`}>
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Customer Name"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customerName: e.target.value,
                  }))
                }
                className={`px-4 py-2 border rounded-lg ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.customerEmail}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customerEmail: e.target.value,
                  }))
                }
                className={`px-4 py-2 border rounded-lg ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.customerPhone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customerPhone: e.target.value,
                  }))
                }
                className={`px-4 py-2 border rounded-lg ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>
          </div>

          {/* Add Items */}
          <div className="space-y-4">
            <h3 className={`font-semibold ${textClass}`}>Invoice Items</h3>
            <div className="flex gap-2">
              <select
                value={selectedPart?.id || ""}
                onChange={(e) => {
                  const part = inventory.find(
                    (p) => p.id === parseInt(e.target.value)
                  );
                  setSelectedPart(part);
                }}
                className={`flex-1 px-4 py-2 border rounded-lg ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="">Select a part...</option>
                {inventory.map((part) => (
                  <option key={part.id} value={part.id}>
                    {part.partName} (₹{part.cost})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={`w-20 px-4 py-2 border rounded-lg ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
              <button
                type="button"
                onClick={handleAddItem}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Items Table */}
            {formData.items.length > 0 && (
              <div
                className={`border rounded-lg overflow-x-auto ${
                  theme === "dark" ? "border-gray-700" : "border-gray-300"
                }`}
              >
                <table className="w-full text-sm">
                  <thead
                    className={`border-b ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600"
                        : "bg-gray-100 border-gray-300"
                    }`}
                  >
                    <tr>
                      <th className={`px-4 py-2 text-left ${textClass}`}>
                        Part
                      </th>
                      <th className={`px-4 py-2 text-right ${textClass}`}>
                        Price
                      </th>
                      <th className={`px-4 py-2 text-right ${textClass}`}>
                        Qty
                      </th>
                      <th className={`px-4 py-2 text-right ${textClass}`}>
                        Total
                      </th>
                      <th className={`px-4 py-2 text-center ${textClass}`}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr
                        key={index}
                        className={`border-b ${
                          theme === "dark"
                            ? "border-gray-700"
                            : "border-gray-300"
                        }`}
                      >
                        <td className={`px-4 py-2 ${subtextClass}`}>
                          {item.partName}
                        </td>
                        <td className={`px-4 py-2 text-right ${subtextClass}`}>
                          ₹{item.cost?.toFixed(2) || "0.00"}
                        </td>
                        <td className={`px-4 py-2 text-right ${subtextClass}`}>
                          {item.quantity}
                        </td>
                        <td
                          className={`px-4 py-2 text-right font-medium ${textClass}`}
                        >
                          ₹{item.lineTotal?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Totals and Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium ${textClass} mb-2`}
                >
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.taxRate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      taxRate: parseFloat(e.target.value),
                    }))
                  }
                  className={`w-full px-4 py-2 border rounded-lg ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-100"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium ${textClass} mb-2`}
                >
                  Payment Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      paymentMethod: e.target.value,
                    }))
                  }
                  className={`w-full px-4 py-2 border rounded-lg ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-100"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Credit Card</option>
                  <option value="check">Check</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium ${textClass} mb-2`}
                >
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className={`w-full px-4 py-2 border rounded-lg ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-100"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg space-y-3 ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-50"
              }`}
            >
              <div className="flex justify-between">
                <span className={subtextClass}>Subtotal:</span>
                <span className={`font-medium ${textClass}`}>
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={subtextClass}>Tax ({formData.taxRate}%):</span>
                <span className={`font-medium ${textClass}`}>
                  ₹{taxAmount.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-gray-400 pt-3 flex justify-between">
                <span className={`font-bold ${textClass}`}>Grand Total:</span>
                <span className="font-bold text-green-600 text-lg">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows="3"
              className={`w-full px-4 py-2 border rounded-lg ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              placeholder="Additional notes for the invoice..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2 rounded-lg border ${
                theme === "dark"
                  ? "border-gray-600 text-gray-100 hover:bg-gray-700"
                  : "border-gray-300 text-gray-900 hover:bg-gray-100"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formData.items.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <DollarSign className="w-5 h-5" />
              {invoice ? "Update Invoice" : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Invoice Preview Component
const InvoicePreview = ({ invoice, theme, onClose, onExportPDF }) => {
  const bgClass =
    theme === "dark"
      ? "bg-gray-800 border border-gray-700"
      : "bg-white border border-gray-200";

  const textClass = theme === "dark" ? "text-gray-100" : "text-gray-800";
  const subtextClass = theme === "dark" ? "text-gray-300" : "text-gray-600";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className={`${bgClass} rounded-2xl max-w-3xl w-full p-8 my-8`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${textClass}`}>Invoice Preview</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-200 ${
              theme === "dark" ? "hover:bg-gray-700" : ""
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div
          id={`invoice-${invoice.id}`}
          className={`p-8 rounded-lg border-2 ${
            theme === "dark"
              ? "bg-gray-700 border-gray-600"
              : "bg-gray-50 border-gray-300"
          } mb-6`}
        >
          {/* Invoice Header */}
          <div className="flex justify-between mb-8">
            <div>
              <h1 className={`text-4xl font-bold ${textClass}`}>INVOICE</h1>
              <p className={`text-sm ${subtextClass} mt-2`}>
                {invoice.invoiceNumber}
              </p>
            </div>
            <div className={`text-right text-sm ${subtextClass}`}>
              <p>
                <span className="font-semibold">Date:</span>{" "}
                {new Date(invoice.createdAt).toLocaleDateString()}
              </p>
              <p>
                <span className="font-semibold">Payment Method:</span>{" "}
                {invoice.paymentMethod}
              </p>
              <p>
                <span className="font-semibold">Status:</span> {invoice.status}
              </p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-8">
            <p className={`text-sm font-semibold ${textClass} mb-1`}>
              Bill To:
            </p>
            <p className={`text-sm ${subtextClass}`}>{invoice.customerName}</p>
            {invoice.customerEmail && (
              <p className={`text-sm ${subtextClass}`}>
                {invoice.customerEmail}
              </p>
            )}
            {invoice.customerPhone && (
              <p className={`text-sm ${subtextClass}`}>
                {invoice.customerPhone}
              </p>
            )}
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full text-sm">
              <thead
                className={`border-b-2 ${
                  theme === "dark" ? "border-gray-600" : "border-gray-300"
                }`}
              >
                <tr>
                  <th className={`text-left py-2 font-semibold ${textClass}`}>
                    Item
                  </th>
                  <th className={`text-right py-2 font-semibold ${textClass}`}>
                    Price
                  </th>
                  <th className={`text-right py-2 font-semibold ${textClass}`}>
                    Qty
                  </th>
                  <th className={`text-right py-2 font-semibold ${textClass}`}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr
                    key={index}
                    className={`border-b ${
                      theme === "dark" ? "border-gray-600" : "border-gray-300"
                    }`}
                  >
                    <td className={`py-2 ${subtextClass}`}>{item.partName}</td>
                    <td className={`text-right py-2 ${subtextClass}`}>
                      ₹{item.cost?.toFixed(2)}
                    </td>
                    <td className={`text-right py-2 ${subtextClass}`}>
                      {item.quantity}
                    </td>
                    <td className={`text-right py-2 font-medium ${textClass}`}>
                      ₹{item.lineTotal?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mb-8 flex justify-end w-full">
            <div className="w-64">
              <div
                className={`flex justify-between py-2 border-t ${
                  theme === "dark" ? "border-gray-600" : "border-gray-300"
                }`}
              >
                <span className={subtextClass}>Subtotal:</span>
                <span className={textClass}>
                  ₹{invoice.subtotal?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className={subtextClass}>Tax:</span>
                <span className={textClass}>
                  ₹{invoice.taxAmount?.toFixed(2)}
                </span>
              </div>
              <div
                className={`flex justify-between py-2 border-t-2 font-bold text-lg ${
                  theme === "dark" ? "border-gray-600" : "border-gray-300"
                }`}
              >
                <span className={textClass}>Total:</span>
                <span className="text-green-600">
                  ₹{invoice.grandTotal?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div
              className={`border-t pt-4 ${
                theme === "dark" ? "border-gray-600" : "border-gray-300"
              }`}
            >
              <p className={`text-sm font-semibold ${textClass} mb-1`}>
                Notes:
              </p>
              <p className={`text-sm ${subtextClass}`}>{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg border ${
              theme === "dark"
                ? "border-gray-600 text-gray-100 hover:bg-gray-700"
                : "border-gray-300 text-gray-900 hover:bg-gray-100"
            }`}
          >
            Close
          </button>
          <button
            onClick={onExportPDF}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceManager;
