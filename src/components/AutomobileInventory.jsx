import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from "react";
import * as XLSX from "xlsx";
import { debounce } from "../utils/performanceOptimization";
import {
  Plus,
  Download,
  Upload,
  Search,
  Moon,
  Sun,
  Activity,
  X,
  Database,
  Trash2,
  BarChart3,
  DollarSign,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import InventoryCard from "./InventoryCard";
import InventoryModal from "./InventoryModal";
import Statistics from "./Statistics";
import DataHandler from "../utils/dataHandler";
import FuturisticSnackbar from "../utils/FuturisticSnackbar";
import DataSync from "../utils/DataSync";

// Lazy load components for better performance
const AnalyticsDashboard = lazy(() =>
  import("../components/Analytics/AnalyticsDashboard")
);
const InvoiceManager = lazy(() => import("./Billing/InvoiceManager"));
const PaymentTracker = lazy(() => import("./Billing/PaymentTracker"));
const BillingDashboard = lazy(() => import("./Billing/BillingDashboard"));

const AutomobileInventory = () => {
  // Theme state
  const [theme, setTheme] = useState("light");

  // Dynamic states (no static data)
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [viewingImage, setViewingImage] = useState(null);
  const [showDataManagement, setShowDataManagement] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showInvoiceManager, setShowInvoiceManager] = useState(false);
  const [showPaymentTracker, setShowPaymentTracker] = useState(false);
  const [showBillingDashboard, setShowBillingDashboard] = useState(false);
  // Snackbar notifications
  const [snackbars, setSnackbars] = useState([]);

  // Real-time states
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());

  // Remove a snackbar
  const removeSnackbar = useCallback((id) => {
    setSnackbars((prev) => prev.filter((snackbar) => snackbar.id !== id));
  }, []);

  // Add a new snackbar with useCallback
  const addSnackbar = useCallback(
    (message, type = "info") => {
      const id = Date.now();
      setSnackbars((prev) => [...prev, { id, message, type }]);

      // Auto remove after 5 seconds
      setTimeout(() => {
        removeSnackbar(id);
      }, 5000);
    },
    [removeSnackbar]
  );

  // Load inventory with DataSync sync
  useEffect(() => {
    // Load from DataSync (which pulls from localStorage)
    const savedData = DataSync.getInventory();
    if (savedData && savedData.length > 0) {
      setInventory(savedData);
      addSnackbar("Inventory data loaded successfully", "success");
    } else {
      const fallbackData = DataHandler.loadData("vehicles");
      if (fallbackData && fallbackData.length > 0) {
        setInventory(fallbackData);
        addSnackbar("Inventory data loaded successfully", "success");
      } else {
        addSnackbar("No saved inventory found. Start by adding items.", "info");
      }
    }

    // Subscribe to inventory changes from DataSync
    const unsubscribe = DataSync.subscribe("inventory", (updatedInventory) => {
      setInventory(updatedInventory);
    });

    return unsubscribe;
  }, [addSnackbar]);

  // Save inventory using DataHandler when it changes
  useEffect(() => {
    if (inventory.length > 0) {
      DataHandler.saveData("vehicles", inventory);
      // Also sync with DataSync
      DataSync.importData("inventory", inventory);
    }
  }, [inventory]);

  // Real-time clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Memoize unique brands to avoid recalculation
  const uniqueBrands = useMemo(
    () => [...new Set(inventory.map((item) => item.brand))],
    [inventory]
  );

  // Debounced filter function for better performance
  const debouncedFilter = useMemo(
    () =>
      debounce((searchValue, brandValue, inventoryData) => {
        let filtered = inventoryData;

        if (searchValue) {
          const lowerSearch = searchValue.toLowerCase();
          filtered = filtered.filter(
            (item) =>
              item.partName?.toLowerCase().includes(lowerSearch) ||
              item.partNumber?.toLowerCase().includes(lowerSearch) ||
              item.brand?.toLowerCase().includes(lowerSearch)
          );
        }

        if (brandValue) {
          filtered = filtered.filter((item) => item.brand === brandValue);
        }

        setFilteredInventory(filtered);
      }, 200),
    []
  );

  // Filter inventory with debounce
  useEffect(() => {
    debouncedFilter(searchTerm, brandFilter, inventory);
  }, [inventory, searchTerm, brandFilter, debouncedFilter]);

  // Handlers with persistence
  const handleAddItem = useCallback(
    (newItem) => {
      const item = {
        ...newItem,
        id: Date.now() + Math.floor(Math.random() * 1000), // More unique ID
        cost: parseFloat(newItem.cost),
        discount: parseFloat(newItem.discount),
        quantity: parseInt(newItem.quantity),
      };
      setInventory((prev) => [...prev, item]);
      setLastUpdate(new Date());
      addSnackbar("Item added successfully", "success");
    },
    [addSnackbar]
  );

  const handleUpdateItem = useCallback(
    (updatedItem) => {
      setInventory((prev) =>
        prev.map((item) =>
          item.id === updatedItem.id
            ? {
                ...updatedItem,
                cost: parseFloat(updatedItem.cost),
                discount: parseFloat(updatedItem.discount),
                quantity: parseInt(updatedItem.quantity),
              }
            : item
        )
      );
      setLastUpdate(new Date());
      addSnackbar("Item updated successfully", "success");
    },
    [addSnackbar]
  );

  const handleDeleteItem = useCallback(
    (id) => {
      if (window.confirm("Are you sure you want to delete this item?")) {
        setInventory((prev) => prev.filter((item) => item.id !== id));
        setLastUpdate(new Date());
        addSnackbar("Item deleted successfully", "success");
      }
    },
    [addSnackbar]
  );

  // Clear all data function
  const handleClearAllData = () => {
    if (
      window.confirm(
        "Are you sure you want to clear ALL data? This action cannot be undone!"
      )
    ) {
      // Clear localStorage
      localStorage.removeItem("vehicles");

      // Clear state
      setInventory([]);
      setSearchTerm("");
      setBrandFilter("");

      // Reset last update timestamp
      setLastUpdate(new Date());

      // Show success message
      addSnackbar("All data has been cleared successfully", "success");
    }
  };

  // Theme toggle
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    addSnackbar(
      `Theme changed to ${theme === "light" ? "dark" : "light"} mode`,
      "info"
    );
  };

  // Export to Excel
  const exportToExcel = () => {
    try {
      const exportData = inventory.map((item) => ({
        ID: item.id,
        "Part Name": item.partName,
        "Part Number": item.partNumber,
        Brand: item.brand,
        "Cost (₹)": item.cost,
        "Discount (%)": item.discount,
        "Final Price (₹)": ((item.cost * (100 - item.discount)) / 100).toFixed(
          2
        ),
        Quantity: item.quantity,
        // Truncate features to avoid Excel cell limit
        Features: item.features ? item.features.substring(0, 32000) : "",
        Image: item.image || "",
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inventory");
      XLSX.writeFile(wb, "inventory_export.xlsx");
      addSnackbar("Data exported to Excel successfully", "success");
    } catch (error) {
      console.error("Error exporting to Excel:", error);

      if (
        error.message.includes("Text length must not exceed 32767 characters")
      ) {
        addSnackbar(
          "Export failed: Some text fields are too long for Excel",
          "error"
        );
      } else {
        addSnackbar("Failed to export data to Excel", "error");
      }
    }
  };

  // Enhanced Excel import with better validation
  const importFromExcel = (e, mode = "merge") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        // Generate unique IDs using a counter to avoid duplicates
        let idCounter = Date.now();
        const imported = rows.map((row) => ({
          id: row["ID"] || idCounter++,
          partName: row["Part Name"] || "Unknown Part",
          partNumber: row["Part Number"] || "N/A",
          brand: row["Brand"] || "Unknown Brand",
          cost: parseFloat(row["Cost (₹)"]) || 0,
          discount: parseFloat(row["Discount (%)"]) || 0,
          quantity: parseInt(row["Quantity"], 10) || 0,
          features: row["Features"] || "",
          image: row["Image"] || null,
        }));

        if (mode === "merge") {
          setInventory((prev) => {
            const existingIds = new Set(prev.map((i) => i.id));
            const newOnes = imported.filter((i) => !existingIds.has(i.id));
            return [...prev, ...newOnes];
          });
        } else {
          setInventory(imported);
        }

        setLastUpdate(new Date());
        addSnackbar(
          `Successfully imported ${imported.length} items`,
          "success"
        );
      } catch (error) {
        console.error("Error importing Excel file:", error);
        addSnackbar("Failed to import Excel file", "error");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // JSON export function
  const exportToJSON = () => {
    const success = DataHandler.exportToJSON(
      "vehicles",
      "inventory_backup.json"
    );
    if (success) {
      addSnackbar("Data exported to JSON successfully", "success");
    } else {
      addSnackbar("Failed to export data to JSON", "error");
    }
  };

  // JSON import function
  const importFromJSON = (e, mode = "merge") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input
    e.target.value = "";

    DataHandler.importFromJSON("vehicles", file, mode)
      .then(() => {
        // Reload data from localStorage
        const savedData = DataHandler.loadData("vehicles");
        setInventory(savedData);
        setLastUpdate(new Date());
        addSnackbar("Data imported from JSON successfully", "success");
      })
      .catch((error) => {
        addSnackbar(error.message, "error");
      });
  };

  // Theme-aware classes
  const bgClass =
    theme === "dark"
      ? "min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
      : "min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50";

  const headerClass =
    theme === "dark"
      ? "bg-gray-800 border border-gray-700 backdrop-blur-sm bg-opacity-90"
      : "bg-white border border-gray-200 backdrop-blur-sm bg-opacity-90";

  const modalClass =
    theme === "dark"
      ? "bg-gray-800 border border-gray-700"
      : "bg-white border border-gray-200";

  const textClass = theme === "dark" ? "text-gray-100" : "text-gray-800";
  const subtextClass = theme === "dark" ? "text-gray-300" : "text-gray-600";

  return (
    <div
      className={`${bgClass} p-6 transition-all duration-500 ${
        theme === "dark" ? "dark" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header with real-time clock */}
        <div
          className={`${headerClass} rounded-2xl shadow-xl p-6 mb-6 relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1
                  className={`text-4xl font-bold ${
                    theme === "dark" ? "text-gray-100" : "text-gray-800"
                  } mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent`}
                >
                  Automobile Inventory Management
                </h1>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  } flex items-center gap-2`}
                >
                  <Activity className="w-4 h-4" />
                  Live System • Last Updated: {lastUpdate.toLocaleTimeString()}
                </p>
              </div>

              <div className="text-right">
                <div
                  className={`text-lg font-mono ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  } mb-2`}
                >
                  {currentTime.toLocaleTimeString()}
                </div>
                <button
                  onClick={toggleTheme}
                  className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
                    theme === "dark"
                      ? "bg-yellow-500 hover:bg-yellow-400 text-gray-900"
                      : "bg-gray-800 hover:bg-gray-700 text-yellow-400"
                  } shadow-lg hover:shadow-xl`}
                >
                  {theme === "dark" ? (
                    <Sun className="w-极狐-6" />
                  ) : (
                    <Moon className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min极狐-64">
                <div className="relative">
                  <Search
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`}
                  />
                  <input
                    type="text"
                    placeholder="Search by part name, number, or brand..."
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500 ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <select
                className={`px-4 py-3 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500 ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
              >
                <option value="">All Brands</option>
                {uniqueBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Add New Item
              </button>

              <button
                onClick={exportToExcel}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Download className="w-5 h-5" />
                Export to Excel
              </button>

              <label className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                <Upload className="w-5 h-5" />
                Import from Excel
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => importFromExcel(e, "merge")}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => setShowDataManagement(true)}
                className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Database className="w-5 h-5" />
                Data Management
              </button>

              {/* Clear All Data Button */}
              <button
                onClick={handleClearAllData}
                className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Trash2 className="w-5 h-5" />
                Clear All Data
              </button>

              {/* Billing Buttons */}
              <button
                onClick={() => setShowInvoiceManager(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <DollarSign className="w-5 h-5" />
                Invoices
              </button>

              <button
                onClick={() => setShowPaymentTracker(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <CreditCard className="w-5 h-5" />
                Payments
              </button>

              <button
                onClick={() => setShowBillingDashboard(true)}
                className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <TrendingUp className="w-5 h-5" />
                Billing Dashboard
              </button>

              <button
                onClick={() => setShowAnalytics(true)}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <BarChart3 className="w-5 h-5" />
                Analytics Dashboard
              </button>
            </div>
          </div>
        </div>
        {/* Statistics */}
        <Statistics
          inventory={inventory}
          uniqueBrands={uniqueBrands}
          theme={theme}
        />

        {/* System Status */}
        <div className={`${headerClass} rounded-xl shadow-lg p-4 mt-6 mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                System Status: Online • {filteredInventory.length} items
                displayed
              </span>
            </div>
            <div
              className={`text-xs ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              } font-mono`}
            >
              Real-time sync active
            </div>
          </div>
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {filteredInventory.map((item, index) => (
            <div
              key={`inventory-card-${item.id}-${index}`}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <InventoryCard
                item={item}
                onEdit={() => {
                  setEditingItem(item);
                  setShowModal(true);
                }}
                onDelete={() => handleDeleteItem(item.id)}
                onImageView={setViewingImage}
                theme={theme}
                filters={{ searchTerm, brandFilter }}
              />
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredInventory.length === 0 && inventory.length > 0 && (
          <div className="text-center py-16">
            <div
              className={`inline-block p-8 rounded-2xl ${
                theme === "dark"
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-white border border-gray-200"
              } shadow-xl`}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-600" />
              </div>
              <p
                className={`${
                  theme === "dark" ? "text-gray-300" : "text-gray-500"
                } text-lg font-medium`}
              >
                No items found matching your criteria.
              </p>
              <p
                className={`${
                  theme === "dark" ? "text-gray-400" : "text-gray-400"
                } text-sm mt-2`}
              >
                Try adjusting your search or filters
              </p>
            </div>
          </div>
        )}

        {/* Completely empty state (no items at all) */}
        {inventory.length === 0 && (
          <div className="text-center py-16">
            <div
              className={`inline-block p-8 rounded-2xl ${
                theme === "dark"
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-white border border-gray-200"
              } shadow-xl`}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-300 to-purple-400 rounded-full flex items-center justify-center">
                <Database className="w-8 h-8 text-white" />
              </div>
              <p
                className={`${
                  theme === "dark" ? "text-gray-300" : "text-gray-500"
                } text-lg font-medium`}
              >
                Your inventory is empty.
              </p>
              <p
                className={`${
                  theme === "dark" ? "text-gray-400" : "text-gray-400"
                } text-sm mt-2`}
              >
                Click "Add New Item" to get started
              </p>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <InventoryModal
            editingItem={editingItem}
            onClose={() => {
              setShowModal(false);
              setEditingItem(null);
            }}
            onSave={editingItem ? handleUpdateItem : handleAddItem}
            theme={theme}
          />
        )}

        {/* Data Management Modal */}
        {showDataManagement && (
          <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className={`${modalClass} rounded-2xl max-w-md w-full p-6`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${textClass}`}>
                  Data Management
                </h2>
                <button
                  onClick={() => setShowDataManagement(false)}
                  className={textClass}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className={`font-medium ${subtextClass} mb-2`}>
                    Export Data
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={exportToExcel}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                    >
                      Export to Excel
                    </button>
                    <button
                      onClick={exportToJSON}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                    >
                      Export to JSON
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className={`font-medium ${subtextClass} mb-2`}>
                    Import Data
                  </h3>
                  <div className="space-y-2">
                    <label className="block">
                      <span className="sr-only">Import Excel</span>
                      <div className="flex items-center">
                        <span className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-l">
                          Excel File
                        </span>
                        <label className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-r cursor-pointer">
                          Browse
                          <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={(e) => importFromExcel(e, "merge")}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </label>

                    <label className="block">
                      <span className="sr-only">Import JSON</span>
                      <div className="flex items-center">
                        <span className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-l">
                          JSON File
                        </span>
                        <label className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-r cursor-pointer">
                          Browse
                          <input
                            type="file"
                            accept=".json"
                            onChange={(e) => importFromJSON(e, "merge")}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className={`font-medium ${subtextClass} mb-2`}>
                    Clear Data
                  </h3>
                  <button
                    onClick={handleClearAllData}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                  >
                    Clear All Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Viewer */}
        {viewingImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={() => setViewingImage(null)}
                className="absolute -top-12 right-0 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-full p-3 hover:bg-opacity-30 transition-all duration-300 transform hover:scale-110"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src={viewingImage}
                  alt="Full size view"
                  className="max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Dashboards - Analytics Style */}
      {showAnalytics && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="text-center py-8 text-gray-500">
                Loading Analytics...
              </div>
            </div>
          }
        >
          <AnalyticsDashboard
            inventory={inventory}
            theme={theme}
            onClose={() => setShowAnalytics(false)}
          />
        </Suspense>
      )}

      {showInvoiceManager && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="text-center py-8 text-gray-500">
                Loading Invoice Manager...
              </div>
            </div>
          }
        >
          <InvoiceManager
            inventory={inventory}
            theme={theme}
            onClose={() => setShowInvoiceManager(false)}
          />
        </Suspense>
      )}

      {showPaymentTracker && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="text-center py-8 text-gray-500">
                Loading Payment Tracker...
              </div>
            </div>
          }
        >
          <PaymentTracker
            theme={theme}
            onClose={() => setShowPaymentTracker(false)}
          />
        </Suspense>
      )}

      {showBillingDashboard && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="text-center py-8 text-gray-500">
                Loading Billing Dashboard...
              </div>
            </div>
          }
        >
          <BillingDashboard
            theme={theme}
            onClose={() => setShowBillingDashboard(false)}
          />
        </Suspense>
      )}

      {/* Snackbar container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {snackbars.map((snackbar) => (
          <FuturisticSnackbar
            key={snackbar.id}
            message={snackbar.message}
            type={snackbar.type}
            onClose={() => removeSnackbar(snackbar.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default AutomobileInventory;
