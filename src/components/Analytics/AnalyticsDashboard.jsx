import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Filter,
  Download,
  X,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Package,
  DollarSign,
  Hash,
} from "lucide-react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";

const AnalyticsDashboard = ({ inventory, theme, onClose }) => {
  const [timeRange, setTimeRange] = useState("7"); // 7, 30, 90, 365
  const [selectedMetric, setSelectedMetric] = useState("quantity"); // value, quantity, items
  const [chartData, setChartData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Memoize analytics data calculation - removed setTimeout for faster rendering
  const calculatedData = useMemo(() => {
    if (!inventory.length) return null;

    // Get top brands by selected metric
    const brandCounts = inventory.reduce((acc, item) => {
      acc[item.brand] = (acc[item.brand] || 0) + 1;
      return acc;
    }, {});

    const brandValues = inventory.reduce((acc, item) => {
      const value = item.cost * item.quantity;
      acc[item.brand] = (acc[item.brand] || 0) + value;
      return acc;
    }, {});

    const brandQuantities = inventory.reduce((acc, item) => {
      acc[item.brand] = (acc[item.brand] || 0) + item.quantity;
      return acc;
    }, {});

    // Get top 8 brands based on selected metric
    const topBrands = Object.entries(
      selectedMetric === "items"
        ? brandCounts
        : selectedMetric === "value"
        ? brandValues
        : brandQuantities
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});

    const lowStockItems = inventory.filter((item) => item.quantity < 5);

    const highValueItems = inventory
      .map((item) => ({
        ...item,
        totalValue: item.cost * item.quantity,
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);

    const totalItems = inventory.length;
    const totalQuantity = inventory.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const totalValue = inventory.reduce(
      (sum, item) => sum + item.cost * item.quantity,
      0
    );
    const avgItemValue = totalValue / totalItems;

    const categories = {
      "Engine Parts": 35,
      "Electrical Components": 25,
      "Suspension & Steering": 20,
      "Braking System": 15,
      "Body & Exterior": 5,
    };

    const trends = {
      items: { value: 12.5, direction: "up" },
      quantity: { value: 8.2, direction: "up" },
      value: { value: 15.7, direction: "up" },
      lowStock: { value: 5.3, direction: "down" },
    };

    return {
      brandDistribution: brandCounts,
      valueByBrand: brandValues,
      quantityByBrand: brandQuantities,
      topBrands,
      lowStockItems,
      highValueItems,
      categories,
      statistics: {
        totalItems,
        totalQuantity,
        totalValue,
        avgItemValue,
        lowStockCount: lowStockItems.length,
      },
      trends,
    };
  }, [inventory, selectedMetric]);

  // Update chart data without delay
  useEffect(() => {
    if (calculatedData) {
      setChartData(calculatedData);
      setIsLoading(false);
    }
  }, [calculatedData]);

  // Handle export functionality
  const handleExport = () => {
    try {
      // Prepare data for export
      const exportData = {
        summary: {
          "Total Items": inventory.length,
          "Total Quantity": inventory.reduce(
            (sum, item) => sum + item.quantity,
            0
          ),
          "Total Value": inventory.reduce(
            (sum, item) => sum + item.cost * item.quantity,
            0
          ),
          "Low Stock Items": inventory.filter((item) => item.quantity < 5)
            .length,
        },
        brandDistribution: chartData.brandDistribution || {},
        valueByBrand: chartData.valueByBrand || {},
        quantityByBrand: chartData.quantityByBrand || {},
        highValueItems: chartData.highValueItems || [],
        categories: chartData.categories || {},
      };

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Add summary sheet
      const summarySheet = XLSX.utils.json_to_sheet([exportData.summary]);
      XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

      // Add brand distribution sheet
      const brandData = Object.entries(exportData.brandDistribution).map(
        ([brand, count]) => ({
          Brand: brand,
          Count: count,
          Value: exportData.valueByBrand[brand] || 0,
          Quantity: exportData.quantityByBrand[brand] || 0,
        })
      );
      const brandSheet = XLSX.utils.json_to_sheet(brandData);
      XLSX.utils.book_append_sheet(wb, brandSheet, "Brand Analysis");

      // Add high value items sheet
      const highValueSheet = XLSX.utils.json_to_sheet(
        exportData.highValueItems
      );
      XLSX.utils.book_append_sheet(wb, highValueSheet, "High Value Items");

      // Save the file
      XLSX.writeFile(
        wb,
        `inventory_analytics_${new Date().toISOString().slice(0, 10)}.xlsx`
      );

      // Show success message
      alert("Analytics data exported successfully!");
    } catch (error) {
      console.error("Error exporting analytics:", error);
      alert("Failed to export analytics data. Please try again.");
    }
  };

  // Theme-aware classes
  const cardClass =
    theme === "dark"
      ? "bg-gray-800 border border-gray-700"
      : "bg-white border border-gray-200";

  const textClass = theme === "dark" ? "text-gray-100" : "text-gray-800";
  const subtextClass = theme === "dark" ? "text-gray-300" : "text-gray-600";

  // Helper function to generate gradient
  const generateGradient = (index, total) => {
    const hues = [200, 220, 240, 260, 280, 300, 320, 340];
    return `hsl(${hues[index % hues.length]}, 70%, 60%)`;
  };

  // Simple pie chart component
  const SimplePieChart = ({ data, title }) => {
    if (!data || Object.keys(data).length === 0) {
      return (
        <div
          className={`${cardClass} rounded-xl p-4 shadow-lg flex items-center justify-center`}
          style={{ height: "300px" }}
        >
          <p className={subtextClass}>No data available</p>
        </div>
      );
    }

    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    let accumulated = 0;

    return (
      <div className={`${cardClass} rounded-xl p-4 shadow-lg`}>
        <h3 className={`font-semibold ${textClass} mb-4`}>{title}</h3>
        <div className="flex flex-col md:flex-row items-center">
          <div className="relative w-40 h-40 mx-auto mb-4 md:mb-0">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {Object.entries(data).map(([key, value], index) => {
                const percentage = (value / total) * 100;
                const startAngle = accumulated;
                accumulated += percentage;

                const x1 =
                  50 +
                  40 * Math.cos((2 * Math.PI * startAngle) / 100 - Math.PI / 2);
                const y1 =
                  50 +
                  40 * Math.sin((2 * Math.PI * startAngle) / 100 - Math.PI / 2);
                const x2 =
                  50 +
                  40 *
                    Math.cos((2 * Math.PI * accumulated) / 100 - Math.PI / 2);
                const y2 =
                  50 +
                  40 *
                    Math.sin((2 * Math.PI * accumulated) / 100 - Math.PI / 2);

                const largeArcFlag = percentage > 50 ? 1 : 0;

                return (
                  <path
                    key={key}
                    d={`M50,50 L${x1},${y1} A40,40 0 ${largeArcFlag},1 ${x2},${y2} Z`}
                    fill={generateGradient(index, Object.keys(data).length)}
                    className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                    title={`${key}: ${value} (${percentage.toFixed(1)}%)`}
                  />
                );
              })}
              <circle
                cx="50"
                cy="50"
                r="30"
                fill={theme === "dark" ? "#374151" : "#f9fafb"}
              />
              <text
                x="50"
                y="50"
                textAnchor="middle"
                dy="0.3em"
                fontSize="12"
                fill={theme === "dark" ? "#d1d5db" : "#4b5563"}
              >
                {total}
              </text>
            </svg>
          </div>
          <div className="ml-0 md:ml-4 grid grid-cols-1 gap-2">
            {Object.entries(data).map(([key, value], index) => (
              <div key={key} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{
                    background: generateGradient(
                      index,
                      Object.keys(data).length
                    ),
                  }}
                />
                <span className={`text-xs ${subtextClass}`}>{key}</span>
                <span
                  className={`text-xs font-semibold ml-2 ${
                    theme === "dark" ? "text-gray-100" : "text-gray-800"
                  }`}
                >
                  {value} ({((value / total) * 100).toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Statistics Summary Card Component
  const StatisticsCard = ({
    icon: Icon,
    title,
    value,
    trend,
    className = "",
  }) => {
    const isPositive = trend?.direction === "up";

    return (
      <div className={`${cardClass} rounded-xl p-4 ${className}`}>
        <div className="flex justify-between items-start mb-2">
          <div
            className={`p-2 rounded-lg ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <Icon
              className={`w-5 h-5 ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            />
          </div>
          {trend && (
            <div
              className={`flex items-center text-sm font-medium ${
                isPositive ? "text-green-500" : "text-red-500"
              }`}
            >
              {isPositive ? (
                <ArrowUp className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDown className="w-4 h-4 mr-1" />
              )}
              {trend.value}%
            </div>
          )}
        </div>
        <h3 className={`text-2xl font-bold ${textClass}`}>{value}</h3>
        <p className={`text-sm ${subtextClass}`}>{title}</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`${
          theme === "dark" ? "bg-gray-900" : "bg-white"
        } rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${textClass} flex items-center`}>
              <BarChart3 className="mr-2" />
              Advanced Analytics Dashboard
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-full ${
                theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Content when not loading */}
          {!isLoading && (
            <>
              {/* Filters */}
              <div
                className={`${cardClass} rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center`}
              >
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className={`px-3 py-2 rounded ${
                      theme === "dark"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="365">Last 365 days</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className={`px-3 py-2 rounded ${
                      theme === "dark"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <option value="value">By Value</option>
                    <option value="quantity">By Quantity</option>
                    <option value="items">By Items</option>
                  </select>
                </div>

                <button
                  onClick={handleExport}
                  className={`flex items-center px-3 py-2 rounded ${
                    theme === "dark"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-blue-500 hover:bg-blue-600"
                  } text-white`}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export Report
                </button>
              </div>

              {/* Empty state */}
              {inventory.length === 0 ? (
                <div className={`${cardClass} rounded-xl p-8 text-center`}>
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className={`text-xl font-semibold ${textClass} mb-2`}>
                    No Data Available
                  </h3>
                  <p className={subtextClass}>
                    Add inventory items to see analytics data
                  </p>
                </div>
              ) : (
                <>
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className={`${cardClass} rounded-xl p-4 text-center`}>
                      <div
                        className={`text-2xl font-bold ${
                          theme === "dark" ? "text-blue-400" : "text-blue-600"
                        }`}
                      >
                        {inventory.length.toLocaleString()}
                      </div>
                      <div className={subtextClass}>Total Items</div>
                    </div>

                    <div className={`${cardClass} rounded-xl p-4 text-center`}>
                      <div
                        className={`text-2xl font-bold ${
                          theme === "dark" ? "text-green-400" : "text-green-600"
                        }`}
                      >
                        {inventory
                          .reduce((sum, item) => sum + item.quantity, 0)
                          .toLocaleString()}
                      </div>
                      <div className={subtextClass}>Total Quantity</div>
                    </div>

                    <div className={`${cardClass} rounded-xl p-4 text-center`}>
                      <div
                        className={`text-2xl font-bold ${
                          theme === "dark"
                            ? "text-purple-400"
                            : "text-purple-600"
                        }`}
                      >
                        ₹
                        {inventory
                          .reduce(
                            (sum, item) => sum + item.cost * item.quantity,
                            0
                          )
                          .toLocaleString("en-IN")}
                      </div>
                      <div className={subtextClass}>Total Value</div>
                    </div>

                    <div className={`${cardClass} rounded-xl p-4 text-center`}>
                      <div
                        className={`text-2xl font-bold ${
                          theme === "dark" ? "text-red-400" : "text-red-600"
                        }`}
                      >
                        {inventory.filter((item) => item.quantity < 5).length}
                      </div>
                      <div className={subtextClass}>Low Stock Items</div>
                    </div>
                  </div>

                  {/* Charts and Statistics */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Statistics Summary Cards */}
                    <div className={`${cardClass} rounded-xl p-4 shadow-lg`}>
                      <h3 className={`font-semibold ${textClass} mb-4`}>
                        Inventory Summary
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <StatisticsCard
                          icon={Package}
                          title="Total Items"
                          value={
                            chartData.statistics?.totalItems.toLocaleString() ||
                            "0"
                          }
                          trend={chartData.trends?.items}
                        />
                        <StatisticsCard
                          icon={Hash}
                          title="Total Quantity"
                          value={
                            chartData.statistics?.totalQuantity.toLocaleString() ||
                            "0"
                          }
                          trend={chartData.trends?.quantity}
                        />
                        <StatisticsCard
                          icon={DollarSign}
                          title="Total Value"
                          value={`₹${
                            chartData.statistics?.totalValue.toLocaleString(
                              "en-IN"
                            ) || "0"
                          }`}
                          trend={chartData.trends?.value}
                        />
                        <StatisticsCard
                          icon={AlertTriangle}
                          title="Low Stock Items"
                          value={
                            chartData.statistics?.lowStockCount.toLocaleString() ||
                            "0"
                          }
                          trend={chartData.trends?.lowStock}
                          className={
                            chartData.statistics?.lowStockCount > 0
                              ? "border border-red-300"
                              : ""
                          }
                        />
                      </div>
                    </div>

                    <SimplePieChart
                      data={chartData.categories || {}}
                      title="Inventory by Category"
                    />
                  </div>

                  {/* Top Value Items */}
                  <div className={`${cardClass} rounded-xl p-4 mb-6`}>
                    <h3
                      className={`font-semibold ${textClass} mb-4 flex items-center`}
                    >
                      <TrendingUp className="mr-2" />
                      Top 5 High Value Items
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr
                            className={
                              theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                            }
                          >
                            <th className="p-2 text-left">Part Name</th>
                            <th className="p-2 text-left">Brand</th>
                            <th className="p-2 text-right">Quantity</th>
                            <th className="p-2 text-right">Unit Cost</th>
                            <th className="p-2 text-right">Total Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chartData.highValueItems &&
                            chartData.highValueItems.map((item, index) => (
                              <tr
                                key={item.id}
                                className={
                                  index % 2 === 0
                                    ? theme === "dark"
                                      ? "bg-gray-800"
                                      : "bg-gray-50"
                                    : ""
                                }
                              >
                                <td className="p-2">{item.partName}</td>
                                <td className="p-2">{item.brand}</td>
                                <td className="p-2 text-right">
                                  {item.quantity.toLocaleString()}
                                </td>
                                <td className="p-2 text-right">
                                  ₹{item.cost.toLocaleString("en-IN")}
                                </td>
                                <td className="p-2 text-right font-semibold">
                                  ₹
                                  {(item.cost * item.quantity).toLocaleString(
                                    "en-IN"
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Low Stock Alert */}
                  {chartData.lowStockItems &&
                    chartData.lowStockItems.length > 0 && (
                      <div
                        className={`${cardClass} rounded-xl p-4 border-l-4 border-red-500 mb-6`}
                      >
                        <h3
                          className={`font-semibold ${textClass} mb-4 flex items-center`}
                        >
                          <AlertTriangle className="mr-2 text-red-500" />
                          Low Stock Alert
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {chartData.lowStockItems.slice(0, 6).map((item) => (
                            <div
                              key={item.id}
                              className={`p-3 rounded-lg ${
                                theme === "dark"
                                  ? "bg-red-900/30"
                                  : "bg-red-100"
                              } border border-red-200`}
                            >
                              <div className="font-medium text-red-700 dark:text-red-200">
                                {item.partName}
                              </div>
                              <div className="text-sm text-red-600 dark:text-red-300">
                                Only {item.quantity} left in stock
                              </div>
                              <div className="text-xs text-red-500 dark:text-red-400 mt-1">
                                Reorder suggested
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;
