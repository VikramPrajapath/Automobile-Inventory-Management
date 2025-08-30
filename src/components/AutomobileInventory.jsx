import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Download,
  Upload,
  Search,
  Moon,
  Sun,
  Activity,
  X,
} from "lucide-react";
import InventoryCard from "./InventoryCard";
import InventoryModal from "./InventoryModal";
import Statistics from "./Statistics";

const AutomobileInventory = () => {
  // Theme state
  const [theme, setTheme] = useState("light");

  // Existing states
  const [inventory, setInventory] = useState([
    {
      id: 1,
      partName: "Brake Pads",
      partNumber: "BP-001",
      brand: "Bosch",
      cost: 2500,
      discount: 10,
      quantity: 25,
      features: "Ceramic compound, Low noise, Long-lasting",
      image: null,
    },
    {
      id: 2,
      partName: "Air Filter",
      partNumber: "AF-002",
      brand: "Mann Filter",
      cost: 850,
      discount: 5,
      quantity: 40,
      features: "High filtration efficiency, Durable material",
      image: null,
    },
  ]);

  const [filteredInventory, setFilteredInventory] = useState(inventory);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [viewingImage, setViewingImage] = useState(null);

  // New real-time states
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());

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
          item.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (brandFilter) {
      filtered = filtered.filter((item) => item.brand === brandFilter);
    }

    setFilteredInventory(filtered);
  }, [inventory, searchTerm, brandFilter]);

  // Updated handlers with real-time updates
  const handleAddItem = useCallback((newItem) => {
    const item = {
      ...newItem,
      id: Date.now(),
      cost: parseFloat(newItem.cost),
      discount: parseFloat(newItem.discount),
      quantity: parseInt(newItem.quantity),
    };
    setInventory((prev) => [...prev, item]);
    setLastUpdate(new Date());
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
  }, []);

  const handleDeleteItem = useCallback((id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setInventory((prev) => prev.filter((item) => item.id !== id));
      setLastUpdate(new Date());
    }
  }, []);

  // Theme toggle function
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const exportToExcel = () => {
    const exportData = inventory.map((item) => ({
      "Part Name": item.partName,
      "Part Number": item.partNumber,
      Brand: item.brand,
      "Cost (₹)": item.cost,
      "Discount (%)": item.discount,
      "Final Price (₹)": ((item.cost * (100 - item.discount)) / 100).toFixed(2),
      Quantity: item.quantity,
      Features: item.features,
    }));

    console.log("Exporting data:", exportData);
    alert(
      "Export functionality would download Excel file in a real environment"
    );
  };

  const importFromExcel = (e) => {
    const file = e.target.files[0];
    if (file) {
      alert(
        "Import functionality would process Excel file in a real environment"
      );
    }
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
          {/* Animated background effect */}
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

            {/* Search and Filter Controls */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-400"
                    } w-5 h-5`}
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

            {/* Action Buttons with futuristic design */}
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
                  onChange={importFromExcel}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Statistics with real-time updates */}
        <Statistics
          inventory={inventory}
          uniqueBrands={uniqueBrands}
          theme={theme}
        />

        {/* Real-time inventory status */}
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

        {/* Inventory Grid with enhanced animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {filteredInventory.map((item, index) => (
            <div
              key={item.id}
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
              />
            </div>
          ))}
        </div>

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

        {/* Enhanced Image Viewer Modal */}
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
    </div>
  );
};

export default AutomobileInventory;
