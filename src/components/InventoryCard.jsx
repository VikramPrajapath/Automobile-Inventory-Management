// src/components/InventoryCard.js
import React from "react";
import { Edit, Trash2, Eye } from "lucide-react";

const InventoryCard = ({ item, onEdit, onDelete, onImageView }) => {
  const calculateFinalPrice = (cost, discount) => {
    return ((cost * (100 - discount)) / 100).toFixed(2);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image Section */}
      <div className="h-48 bg-gray-100 relative">
        {item.image ? (
          <img
            src={item.image}
            alt={item.partName}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => onImageView(item.image)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                <Eye className="w-8 h-8" />
              </div>
              <p className="text-sm">No Image</p>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-2">
          {item.partName}
        </h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <span className="font-semibold">Part No:</span> {item.partNumber}
          </p>
          <p>
            <span className="font-semibold">Brand:</span> {item.brand}
          </p>
          <p>
            <span className="font-semibold">Quantity:</span> {item.quantity}
          </p>
          <p>
            <span className="font-semibold">Features:</span> {item.features}
          </p>
        </div>

        {/* Pricing */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Original Price</p>
              <p className="font-semibold text-gray-800">₹{item.cost}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Discount: {item.discount}%
              </p>
              <p className="font-bold text-green-600">
                ₹{calculateFinalPrice(item.cost, item.discount)}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onEdit}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md flex items-center justify-center gap-1 text-sm transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md flex items-center justify-center gap-1 text-sm transition-colors"
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
