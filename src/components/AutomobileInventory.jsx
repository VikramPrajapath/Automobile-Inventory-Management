import React, { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
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
  Settings,
} from "lucide-react";
import InventoryCard from "./InventoryCard";
import InventoryModal from "./InventoryModal";
import Statistics from "./Statistics";
import DataHandler from "../utils/dataHandler";
import dataPaths from "../config/paths";
import FuturisticSnackbar from "../utils/FuturisticSnackbar";

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

  // Snackbar notifications
  const [snackbars, setSnackbars] = useState([]);

  // Real-time states
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());

  // Add a new snackbar
  const addSnackbar = (message, type = "info") => {
    const id = Date.now();
    setSnackbars((prev) => [...prev, { id, message, type }]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeSnackbar(id);
    }, 5000);
  };

  // Remove a snackbar
  const removeSnackbar = (id) => {
    setSnackbars((prev) => prev.filter((snackbar) => snackbar.id !== id));
  };

  // Load inventory using DataHandler
  useEffect(() => {
    const savedData = DataHandler.loadData("vehicles");
    if (savedData && savedData.length > 0) {
      setInventory(savedData);
      addSnackbar("Inventory data loaded successfully", "success");
    } else {
      addSnackbar("No saved inventory found. Start by adding items.", "info");
    }
  }, []);

  // Save inventory using DataHandler when it changes
  useEffect(() => {
    if (inventory.length > 0) {
      DataHandler.saveData("vehicles", inventory);
    }
  }, [inventory]);

  // Real-time clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Get unique brands for filter dropdown
  const uniqueBrands = [...new Set(inventory.map((item) => item.brand))];

  // Filter inventory based on search and brand filter
  useEffect(() => {
    let filtered = inventory;

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.partName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.partNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (brandFilter) {
      filtered = filtered.filter((item) => item.brand === brandFilter);
    }

    setFilteredInventory(filtered);
  }, [inventory, searchTerm, brandFilter]);

  // Handlers with persistence
  const handleAddItem = useCallback((newItem) => {
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
  }, []);

  const handleUpdateItem = useCallback((updatedItem) => {
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
  }, []);

  const handleDeleteItem = useCallback((id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setInventory((prev) => prev.filter((item) => item.id !== id));
      setLastUpdate(new Date());
      addSnackbar("Item deleted successfully", "success");
    }
  }, []);

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
      const exportData = inventory.map((item) => {
        // Create a safe version of features that won't exceed Excel limits
        let safeFeatures = item.features || "";

        // Check if features exceed Excel limit and truncate if needed
        if (safeFeatures.length > 32000) {
          safeFeatures = safeFeatures.substring(0, 32000) + "... [truncated]";
          addSnackbar(
            `Some features were truncated for Excel compatibility`,
            "warning"
          );
        }

        return {
          ID: item.id,
          "Part Name": item.partName,
          "Part Number": item.partNumber,
          Brand: item.brand,
          "Cost (₹)": item.cost,
          "Discount (%)": item.discount,
          "Final Price (₹)": (
            (item.cost * (100 - item.discount)) /
            100
          ).toFixed(2),
          Quantity: item.quantity,
          Features: safeFeatures,
          "Image Available": item.image ? "Yes" : "No",
        };
      });

      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths for better readability
      const columnWidths = [
        { wch: 10 }, // ID
        { wch: 25 }, // Part Name
        { wch: 15 }, // Part Number
        { wch: 15 }, // Brand
        { wch: 10 }, // Cost
        { wch: 12 }, // Discount
        { wch: 15 }, // Final Price
        { wch: 10 }, // Quantity
        { wch: 50 }, // Features (wider for text)
        { wch: 15 }, // Image Available
      ];

      ws["!cols"] = columnWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inventory");
      XLSX.writeFile(
        wb,
        `inventory_export_${new Date().toISOString().slice(0, 10)}.xlsx`
      );
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

  // Enhanced Excel import with better validation and unique IDs
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
                    <Sun className="w-6 h-6" />
                  ) : (
                    <Moon className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-64">
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
            <InventoryCard
              key={`inventory-card-${item.id}-${index}`}
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
          ))}
        </div>

        {/* Empty state */}
        {filteredInventory.length === 0 && (
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
