// src/components/Statistics.js
import React from "react";

const Statistics = ({ inventory, uniqueBrands }) => {
  const totalItems = inventory.length;
  const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = inventory.reduce(
    (sum, item) => sum + item.cost * item.quantity,
    0
  );
  const totalBrands = uniqueBrands.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-500">Total Items</h3>
        <p className="text-2xl font-bold text-blue-600">{totalItems}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-500">Total Quantity</h3>
        <p className="text-2xl font-bold text-green-600">{totalQuantity}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
        <p className="text-2xl font-bold text-purple-600">
          ₹{totalValue.toLocaleString("en-IN")}
        </p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-500">Unique Brands</h3>
        <p className="text-2xl font-bold text-orange-600">{totalBrands}</p>
      </div>
    </div>
  );
};

export default Statistics;
