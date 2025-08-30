import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const InventoryModal = ({ editingItem, onClose, onSave, theme }) => {
  const [formData, setFormData] = useState({
    partName: "",
    partNumber: "",
    brand: "",
    cost: "",
    discount: "",
    quantity: "",
    features: "",
    image: null,
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        partName: editingItem.partName,
        partNumber: editingItem.partNumber,
        brand: editingItem.brand,
        cost: editingItem.cost.toString(),
        discount: editingItem.discount.toString(),
        quantity: editingItem.quantity.toString(),
        features: editingItem.features,
        image: editingItem.image,
      });
    }
  }, [editingItem]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingItem) {
      onSave({ ...formData, id: editingItem.id });
    } else {
      onSave(formData);
    }

    onClose();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({ ...prev, image: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateFinalPrice = (cost, discount) => {
    return ((cost * (100 - discount)) / 100).toFixed(2);
  };

  // Theme-aware classes
  const modalClass =
    theme === "dark"
      ? "bg-gray-800 border border-gray-700"
      : "bg-white border border-gray-200";

  const inputClass =
    theme === "dark"
      ? "bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500"
      : "bg-white border-gray-300 text-gray-900 focus:border-blue-500";

  const textClass = theme === "dark" ? "text-gray-100" : "text-gray-800";
  const subtextClass = theme === "dark" ? "text-gray-300" : "text-gray-600";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className={`${modalClass} rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2
              className={`text-2xl font-bold ${
                theme === "dark" ? "text-gray-100" : "text-gray-800"
              } bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent`}
            >
              {editingItem ? "Edit Item" : "Add New Item"}
            </h2>
            <button
              onClick={onClose}
              className={`${
                theme === "dark"
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-400 hover:text-gray-600"
              } transition-colors hover:rotate-90 duration-300`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className={`block text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                } mb-1`}
              >
                Part Name *
              </label>
              <input
                type="text"
                required
                className={`w-full px-4 py-3 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500 ${inputClass}`}
                value={formData.partName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, partName: e.target.value }))
                }
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                } mb-1`}
              >
                Part Number *
              </label>
              <input
                type="text"
                required
                className={`w-full px-4 py-3 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500 ${inputClass}`}
                value={formData.partNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    partNumber: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                } mb-1`}
              >
                Brand *
              </label>
              <input
                type="text"
                required
                className={`w-full px-4 py-3 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500 ${inputClass}`}
                value={formData.brand}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, brand: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className={`block text-sm font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  } mb-1`}
                >
                  Cost (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500 ${inputClass}`}
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, cost: e.target.value }))
                  }
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  } mb-1`}
                >
                  Discount (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500 ${inputClass}`}
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      discount: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                } mb-1`}
              >
                Quantity *
              </label>
              <input
                type="number"
                required
                min="0"
                className={`w-full px-4 py-3 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500 ${inputClass}`}
                value={formData.quantity}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, quantity: e.target.value }))
                }
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                } mb-1`}
              >
                Features
              </label>
              <textarea
                rows="3"
                className={`w-full px-4 py-3 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500 resize-none ${inputClass}`}
                value={formData.features}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, features: e.target.value }))
                }
                placeholder="Enter part features and specifications..."
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                } mb-1`}
              >
                Part Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className={`w-full px-4 py-3 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500 ${inputClass}`}
              />
              {formData.image && (
                <div className="mt-3">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg border-2 border-blue-500 shadow-lg"
                  />
                </div>
              )}
            </div>

            {/* Real-time Price Preview */}
            {formData.cost && (
              <div
                className={`${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600"
                    : "bg-gray-50 border-gray-200"
                } p-4 rounded-lg border`}
              >
                <p className={`text-sm ${subtextClass} mb-2`}>
                  Live Price Preview:
                </p>
                <div className="flex justify-between items-center">
                  <span className={`text-lg ${textClass}`}>
                    Original: ₹{formData.cost}
                  </span>
                  <span className="text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                    Final: ₹
                    {calculateFinalPrice(
                      parseFloat(formData.cost) || 0,
                      parseFloat(formData.discount) || 0
                    )}
                  </span>
                </div>
                {formData.discount > 0 && (
                  <div className="mt-2 text-center">
                    <span className="inline-block bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold animate-pulse">
                      SAVE ₹
                      {(
                        (parseFloat(formData.cost) *
                          parseFloat(formData.discount)) /
                        100
                      ).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 font-medium"
              >
                {editingItem ? "Update Item" : "Add Item"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 ${
                  theme === "dark"
                    ? "bg-gray-600 hover:bg-gray-700"
                    : "bg-gray-500 hover:bg-gray-600"
                } text-white py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 font-medium`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InventoryModal;
