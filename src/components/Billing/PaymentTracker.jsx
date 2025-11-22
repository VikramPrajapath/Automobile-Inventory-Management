import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  X,
  Search,
  CreditCard,
  DollarSign,
  CheckCircle,
} from "lucide-react";

const PaymentTracker = ({ theme, onClose }) => {
  const [payments, setPayments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  // Load payments from localStorage
  useEffect(() => {
    const savedPayments = localStorage.getItem("payments");
    if (savedPayments) {
      setPayments(JSON.parse(savedPayments));
    }
  }, []);

  // Save payments to localStorage
  useEffect(() => {
    if (payments.length > 0) {
      localStorage.setItem("payments", JSON.stringify(payments));
    }
  }, [payments]);

  const handleAddPayment = (paymentData) => {
    const newPayment = {
      ...paymentData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: "confirmed",
    };
    setPayments((prev) => [...prev, newPayment]);
  };

  const handleDeletePayment = (id) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      setPayments((prev) => prev.filter((payment) => payment.id !== id));
    }
  };

  const filteredPayments = payments.filter(
    (payment) =>
      payment.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.payerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = payments.reduce(
    (sum, payment) => sum + (payment.amount || 0),
    0
  );

  const bgClass =
    theme === "dark"
      ? "bg-gray-800 border border-gray-700"
      : "bg-white border border-gray-200";

  const textClass = theme === "dark" ? "text-gray-100" : "text-gray-800";
  const subtextClass = theme === "dark" ? "text-gray-300" : "text-gray-600";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        className={`${bgClass} rounded-2xl shadow-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className={`text-3xl font-bold ${textClass}`}>
              Payment Tracker
            </h2>
            <p className={`text-sm ${subtextClass}`}>
              Track and manage all payment transactions
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div
            className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-50"
            }`}
          >
            <div className={`text-sm ${subtextClass} mb-1`}>Total Payments</div>
            <div className={`text-2xl font-bold ${textClass}`}>
              {payments.length}
            </div>
          </div>
          <div
            className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-50"
            }`}
          >
            <div className={`text-sm ${subtextClass} mb-1`}>Total Amount</div>
            <div className={`text-2xl font-bold text-green-600`}>
              ₹{totalAmount.toFixed(2)}
            </div>
          </div>
          <div
            className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-50"
            }`}
          >
            <div className={`text-sm ${subtextClass} mb-1`}>This Month</div>
            <div className={`text-2xl font-bold text-blue-600`}>
              ₹
              {payments
                .filter((p) => {
                  const paymentDate = new Date(p.createdAt);
                  const today = new Date();
                  return (
                    paymentDate.getMonth() === today.getMonth() &&
                    paymentDate.getFullYear() === today.getFullYear()
                  );
                })
                .reduce((sum, p) => sum + (p.amount || 0), 0)
                .toFixed(2)}
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
                placeholder="Search payments..."
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

          <select
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            className={`px-4 py-2 border rounded-lg ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-gray-100"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            <option value="">All Methods</option>
            <option value="cash">Cash</option>
            <option value="card">Credit Card</option>
            <option value="check">Check</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>

          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Payment
          </button>
        </div>

        {/* Payments Table */}
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
                  Payer
                </th>
                <th className={`px-6 py-3 text-left font-medium ${textClass}`}>
                  Method
                </th>
                <th className={`px-6 py-3 text-right font-medium ${textClass}`}>
                  Amount
                </th>
                <th className={`px-6 py-3 text-left font-medium ${textClass}`}>
                  Date
                </th>
                <th className={`px-6 py-3 text-left font-medium ${textClass}`}>
                  Status
                </th>
                <th
                  className={`px-6 py-3 text-center font-medium ${textClass}`}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className={`border-b ${
                      theme === "dark"
                        ? "border-gray-700 hover:bg-gray-700"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <td className={`px-6 py-4 font-medium ${textClass}`}>
                      {payment.invoiceNumber || "N/A"}
                    </td>
                    <td className={`px-6 py-4 ${subtextClass}`}>
                      {payment.payerName}
                    </td>
                    <td className={`px-6 py-4 ${subtextClass}`}>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          payment.paymentMethod === "cash"
                            ? "bg-green-100 text-green-700"
                            : payment.paymentMethod === "card"
                            ? "bg-blue-100 text-blue-700"
                            : payment.paymentMethod === "check"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        <CreditCard className="w-3 h-3" />
                        {payment.paymentMethod || "N/A"}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-medium ${textClass}`}
                    >
                      ₹{payment.amount?.toFixed(2) || "0.00"}
                    </td>
                    <td className={`px-6 py-4 ${subtextClass}`}>
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        Confirmed
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDeletePayment(payment.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className={`px-6 py-8 text-center ${subtextClass}`}
                  >
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Payment Modal */}
        {showModal && (
          <PaymentFormModal
            theme={theme}
            onSave={handleAddPayment}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </div>
  );
};

// Payment Form Modal Component
const PaymentFormModal = ({ theme, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    payerName: "",
    paymentMethod: "cash",
    amount: "",
    reference: "",
    notes: "",
  });

  const bgClass =
    theme === "dark"
      ? "bg-gray-800 border border-gray-700"
      : "bg-white border border-gray-200";

  const textClass = theme === "dark" ? "text-gray-100" : "text-gray-800";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.payerName && formData.amount) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`${bgClass} rounded-2xl max-w-md w-full p-6`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${textClass}`}>Record Payment</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-200 ${
              theme === "dark" ? "hover:bg-gray-700" : ""
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>
              Invoice Number (Optional)
            </label>
            <input
              type="text"
              value={formData.invoiceNumber}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  invoiceNumber: e.target.value,
                }))
              }
              className={`w-full px-4 py-2 border rounded-lg ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              placeholder="INV-2024-001"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>
              Payer Name
            </label>
            <input
              type="text"
              value={formData.payerName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  payerName: e.target.value,
                }))
              }
              className={`w-full px-4 py-2 border rounded-lg ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              required
              placeholder="Customer name"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, amount: e.target.value }))
              }
              className={`w-full px-4 py-2 border rounded-lg ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              required
              placeholder="0.00"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>
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
            <label className={`block text-sm font-medium ${textClass} mb-2`}>
              Reference Number
            </label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  reference: e.target.value,
                }))
              }
              className={`w-full px-4 py-2 border rounded-lg ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              placeholder="Cheque/Transaction ID"
            />
          </div>

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
              placeholder="Additional notes..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 justify-end pt-4">
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <DollarSign className="w-5 h-5" />
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentTracker;
