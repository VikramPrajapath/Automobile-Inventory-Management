import React from "react";
import { Edit, Trash2, Eye } from "lucide-react";

const InventoryCard = ({ item, onEdit, onDelete, onImageView, theme }) => {
  const calculateFinalPrice = (cost, discount) => {
    return ((cost * (100 - discount)) / 100).toFixed(2);
  };

  // Theme-aware classes
  const cardClass =
    theme === "dark"
      ? "bg-gray-800 border border-gray-700 hover:border-gray-600"
      : "bg-white border border-gray-200 hover:border-gray-300";

  const textClass = theme === "dark" ? "text-gray-100" : "text-gray-800";
  const subtextClass = theme === "dark" ? "text-gray-300" : "text-gray-600";

  return (
    <div
      className={`${cardClass} rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
    >
      {/* Image Section */}
      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.partName}
            className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-300"
            onClick={() => onImageView(item.image)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div
                className={`w-16 h-16 mx-auto mb-2 ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                } rounded-full flex items-center justify-center`}
              >
                <Eye className="w-8 h-8" />
              </div>
              <p className="text-sm">No Image</p>
            </div>
          </div>
        )}

        {/* Animated border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        <h3 className={`font-bold text-lg ${textClass} mb-3 truncate`}>
          {item.partName}
        </h3>

        <div className={`space-y-2 text-sm ${subtextClass}`}>
          <p className="flex justify-between">
            <span className="font-semibold">Part No:</span>
            <span
              className={`font-mono text-xs px-2 py-1 rounded ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              {item.partNumber}
            </span>
          </p>
          <p className="flex justify-between">
            <span className="font-semibold">Brand:</span>
            <span className="font-medium text-blue-500">{item.brand}</span>
          </p>
          <p className="flex justify-between">
            <span className="font-semibold">Quantity:</span>
            <span
              className={`font-bold ${
                item.quantity < 10 ? "text-red-500" : "text-green-500"
              }`}
            >
              {item.quantity}
            </span>
          </p>
        </div>

        <div
          className={`mt-3 pt-3 border-t ${
            theme === "dark" ? "border-gray-600" : "border-gray-200"
          }`}
        >
          <p className={`text-xs ${subtextClass} mb-2 line-clamp-2`}>
            <span className="font-semibold">Features:</span> {item.features}
          </p>
        </div>

        {/* Pricing with animated gradient */}
        <div
          className={`mt-4 pt-4 border-t ${
            theme === "dark" ? "border-gray-600" : "border-gray-200"
          }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className={`text-xs ${subtextClass}`}>Original Price</p>
              <p className={`font-semibold ${textClass} line-through`}>
                ₹{item.cost}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-orange-500 font-medium">
                {item.discount}% OFF
              </p>
              <p className="font-bold text-xl bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                ₹{calculateFinalPrice(item.cost, item.discount)}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons with hover effects */}
        <div className="flex gap-2 mt-5">
          <button
            onClick={onEdit}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-sm transition-all duration-300 transform hover:scale-105"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-sm transition-all duration-300 transform hover:scale-105"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryCard;
