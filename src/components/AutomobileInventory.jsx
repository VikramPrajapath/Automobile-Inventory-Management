import React, { useState, useEffect } from "react";
import { Plus, Download, Upload, Search } from "lucide-react";
import * as XLSX from "xlsx";
import InventoryCard from "./InventoryCard";
import InventoryModal from "./InventoryModal";
import Statistics from "./Statistics";

const AutomobileInventory = () => {
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

  const handleAddItem = (newItem) => {
    const item = {
      ...newItem,
      id: Date.now(),
      cost: parseFloat(newItem.cost),
      discount: parseFloat(newItem.discount),
      quantity: parseInt(newItem.quantity),
    };
    setInventory((prev) => [...prev, item]);
  };

  const handleUpdateItem = (updatedItem) => {
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
  };

  const handleDeleteItem = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setInventory((prev) => prev.filter((item) => item.id !== id));
    }
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

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(
      wb,
      `automobile_inventory_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const importFromExcel = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const importedItems = jsonData.map((row, index) => ({
          id: Date.now() + index,
          partName: row["Part Name"] || "",
          partNumber: row["Part Number"] || "",
          brand: row["Brand"] || "",
          cost: parseFloat(row["Cost (₹)"]) || 0,
          discount: parseFloat(row["Discount (%)"]) || 0,
          quantity: parseInt(row["Quantity"]) || 0,
          features: row["Features"] || "",
          image: null,
        }));

        setInventory((prev) => [...prev, ...importedItems]);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Automobile Inventory Management
          </h1>

          {/* Search and Filter Controls */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by part name, number, or brand..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add New Item
            </button>

            <button
              onClick={exportToExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export to Excel
            </button>

            <label className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
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

        {/* Statistics */}
        <Statistics inventory={inventory} uniqueBrands={uniqueBrands} />

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {filteredInventory.map((item) => (
            <InventoryCard
              key={item.id}
              item={item}
              onEdit={() => {
                setEditingItem(item);
                setShowModal(true);
              }}
              onDelete={() => handleDeleteItem(item.id)}
              onImageView={setViewingImage}
            />
          ))}
        </div>

        {filteredInventory.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No items found matching your criteria.
            </p>
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
          />
        )}

        {/* Image Viewer Modal */}
        {viewingImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={() => setViewingImage(null)}
                className="absolute top-4 right-4 bg-white text-gray-800 rounded-full p-2 hover:bg-gray-100 transition-colors"
              >
                {/* <X className="w-6 h-6" /> */}
              </button>
              <img
                src={viewingImage}
                alt="Full size view"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutomobileInventory;
