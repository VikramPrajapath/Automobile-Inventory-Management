import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  X,
} from "lucide-react";

const BillingDashboard = ({ theme, onClose }) => {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [dateRange, setDateRange] = useState("month");

  // Load invoices and payments from localStorage
  useEffect(() => {
    const savedInvoices = localStorage.getItem("invoices");
    const savedPayments = localStorage.getItem("payments");

    if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
    if (savedPayments) setPayments(JSON.parse(savedPayments));
  }, []);

  // Memoized helper functions
  const getDaysForRange = useCallback(() => {
    switch (dateRange) {
      case "week":
        return 7;
      case "month":
        return 30;
      case "quarter":
        return 90;
      case "year":
        return 365;
      default:
        return 30;
    }
  }, [dateRange]);

  // Memoized filter data function
  const getFilteredData = useCallback((data, days) => {
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return data.filter((item) => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= startDate && itemDate <= now;
    });
  }, []);

  // Memoize filtered invoices and payments
  const filteredInvoices = useMemo(
    () => getFilteredData(invoices, getDaysForRange()),
    [invoices, getDaysForRange, getFilteredData]
  );

  const filteredPayments = useMemo(
    () => getFilteredData(payments, getDaysForRange()),
    [payments, getDaysForRange, getFilteredData]
  );

  // Memoize metrics calculations
  const metrics = useMemo(() => {
    const totalRevenue = filteredInvoices.reduce(
      (sum, inv) => sum + (inv.grandTotal || 0),
      0
    );
    const totalPaid = filteredPayments.reduce(
      (sum, pay) => sum + (pay.amount || 0),
      0
    );
    const totalPending = totalRevenue - totalPaid;
    const invoiceCount = filteredInvoices.length;
    const paidInvoices = filteredInvoices.filter(
      (inv) => inv.status === "paid"
    ).length;

    return {
      totalRevenue,
      totalPaid,
      totalPending,
      invoiceCount,
      paidInvoices,
    };
  }, [filteredInvoices, filteredPayments]);

  const { totalRevenue, totalPaid, totalPending, invoiceCount, paidInvoices } =
    metrics;

  // Memoize payment methods breakdown
  const paymentMethods = useMemo(
    () =>
      filteredPayments.reduce((acc, payment) => {
        const method = payment.paymentMethod || "cash";
        acc[method] = (acc[method] || 0) + payment.amount;
        return acc;
      }, {}),
    [filteredPayments]
  );

  // Memoize daily revenue calculation
  const dailyRevenue = useMemo(() => {
    const days = {};
    filteredInvoices.forEach((invoice) => {
      const date = new Date(invoice.createdAt).toLocaleDateString();
      days[date] = (days[date] || 0) + (invoice.grandTotal || 0);
    });
    return Object.entries(days).sort((a, b) => new Date(a[0]) - new Date(b[0]));
  }, [filteredInvoices]);

  const maxDailyRevenue = useMemo(
    () => Math.max(...dailyRevenue.map(([_, amount]) => amount), 1),
    [dailyRevenue]
  );

  const bgClass =
    theme === "dark"
      ? "bg-gray-800 border border-gray-700"
      : "bg-white border border-gray-200";

  const textClass = theme === "dark" ? "text-gray-100" : "text-gray-800";
  const subtextClass = theme === "dark" ? "text-gray-300" : "text-gray-600";
  const cardBg =
    theme === "dark"
      ? "bg-gray-700 border-gray-600"
      : "bg-gray-50 border-gray-200";

  return (
    <div className={`${bgClass} rounded-2xl shadow-xl p-6 max-w-6xl mx-auto`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-3xl font-bold ${textClass}`}>
            Billing Dashboard
          </h2>
          <p className={`text-sm ${subtextClass}`}>
            Financial overview and revenue analytics
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

      {/* Date Range Filter */}
      <div className="flex gap-2 mb-6">
        {["week", "month", "quarter", "year"].map((range) => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={`px-4 py-2 rounded-lg capitalize font-medium transition-all ${
              dateRange === range
                ? "bg-blue-600 text-white"
                : theme === "dark"
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Revenue */}
        <div className={`${cardBg} border rounded-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${subtextClass} mb-1`}>Total Revenue</p>
              <p className={`text-3xl font-bold text-green-600`}>
                ₹{totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Paid */}
        <div className={`${cardBg} border rounded-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${subtextClass} mb-1`}>Total Paid</p>
              <p className={`text-3xl font-bold text-blue-600`}>
                ₹{totalPaid.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Pending Amount */}
        <div className={`${cardBg} border rounded-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${subtextClass} mb-1`}>Pending Amount</p>
              <p className={`text-3xl font-bold text-yellow-600`}>
                ₹{totalPending.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Invoice Statistics */}
        <div className={`${cardBg} border rounded-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${subtextClass} mb-1`}>Invoices</p>
              <p className={`text-3xl font-bold text-purple-600`}>
                {invoiceCount}
              </p>
              <p className={`text-xs ${subtextClass} mt-1`}>
                {paidInvoices} paid
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Chart */}
        <div className={`${cardBg} border rounded-lg p-6`}>
          <h3 className={`text-lg font-semibold ${textClass} mb-4`}>
            Daily Revenue
          </h3>
          <div className="space-y-2">
            {dailyRevenue.slice(-7).map(([date, amount]) => (
              <div key={date} className="flex items-center gap-3">
                <span className={`text-xs ${subtextClass} w-20`}>{date}</span>
                <div className="flex-1 bg-gray-300 h-6 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{
                      width: `${(amount / maxDailyRevenue) * 100}%`,
                    }}
                  ></div>
                </div>
                <span
                  className={`text-sm font-medium ${textClass} w-24 text-right`}
                >
                  ₹{amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods Distribution */}
        <div className={`${cardBg} border rounded-lg p-6`}>
          <h3 className={`text-lg font-semibold ${textClass} mb-4`}>
            Payment Methods
          </h3>
          <div className="space-y-3">
            {Object.entries(paymentMethods).length > 0 ? (
              Object.entries(paymentMethods).map(([method, amount]) => {
                const percentage = ((amount / totalPaid) * 100).toFixed(1);
                const colors = {
                  cash: "from-green-500 to-green-600",
                  card: "from-blue-500 to-blue-600",
                  check: "from-yellow-500 to-yellow-600",
                  bank_transfer: "from-purple-500 to-purple-600",
                };

                return (
                  <div key={method}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-sm capitalize ${subtextClass}`}>
                        {method}
                      </span>
                      <span className={`text-sm font-medium ${textClass}`}>
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 h-2 rounded-lg overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${
                          colors[method] || "from-gray-500 to-gray-600"
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className={`text-xs ${subtextClass} mt-1`}>
                      ₹{amount.toFixed(2)}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className={`text-sm ${subtextClass}`}>
                No payment data available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Status */}
      <div className={`${cardBg} border rounded-lg p-6 mt-6`}>
        <h3 className={`text-lg font-semibold ${textClass} mb-4`}>
          Invoice Status Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <p className={`text-sm ${subtextClass} mb-2`}>Total Invoices</p>
            <p className={`text-2xl font-bold text-blue-600`}>{invoiceCount}</p>
          </div>
          <div
            className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <p className={`text-sm ${subtextClass} mb-2`}>Paid</p>
            <p className={`text-2xl font-bold text-green-600`}>
              {paidInvoices}
            </p>
          </div>
          <div
            className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <p className={`text-sm ${subtextClass} mb-2`}>Pending</p>
            <p className={`text-2xl font-bold text-yellow-600`}>
              {invoiceCount - paidInvoices}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className={`${cardBg} border rounded-lg p-6 mt-6`}>
        <h3 className={`text-lg font-semibold ${textClass} mb-4`}>
          Summary Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className={`text-sm ${subtextClass}`}>Average Invoice Value</p>
            <p className={`text-2xl font-bold text-blue-600`}>
              ₹
              {invoiceCount > 0
                ? (totalRevenue / invoiceCount).toFixed(2)
                : "0.00"}
            </p>
          </div>
          <div>
            <p className={`text-sm ${subtextClass}`}>Collection Rate</p>
            <p className={`text-2xl font-bold text-green-600`}>
              {totalRevenue > 0
                ? ((totalPaid / totalRevenue) * 100).toFixed(1)
                : "0"}
              %
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingDashboard;
