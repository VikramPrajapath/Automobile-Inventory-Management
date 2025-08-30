import React, { useState, useEffect } from "react";
import { Activity, Zap } from "lucide-react";

const Statistics = ({ inventory, uniqueBrands, theme }) => {
  const [animatedStats, setAnimatedStats] = useState({
    totalItems: 0,
    totalQuantity: 0,
    totalValue: 0,
    totalBrands: 0,
  });

  const totalItems = inventory.length;
  const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = inventory.reduce(
    (sum, item) => sum + item.cost * item.quantity,
    0
  );
  const totalBrands = uniqueBrands.length;

  // Animate statistics in real-time
  useEffect(() => {
    const animateValue = (start, end, duration, callback) => {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (end - start) * progress);
        callback(current);
        if (progress < 1) requestAnimationFrame(animate);
      };
      animate();
    };

    animateValue(animatedStats.totalItems, totalItems, 500, (val) =>
      setAnimatedStats((prev) => ({ ...prev, totalItems: val }))
    );
    animateValue(animatedStats.totalQuantity, totalQuantity, 600, (val) =>
      setAnimatedStats((prev) => ({ ...prev, totalQuantity: val }))
    );
    animateValue(animatedStats.totalValue, totalValue, 700, (val) =>
      setAnimatedStats((prev) => ({ ...prev, totalValue: val }))
    );
    animateValue(animatedStats.totalBrands, totalBrands, 400, (val) =>
      setAnimatedStats((prev) => ({ ...prev, totalBrands: val }))
    );
  }, [
    totalItems,
    totalQuantity,
    totalValue,
    totalBrands,
    animatedStats.totalItems,
    animatedStats.totalQuantity,
    animatedStats.totalValue,
    animatedStats.totalBrands,
  ]);

  const cardClass =
    theme === "dark"
      ? "bg-gray-800 border border-gray-700 backdrop-blur-sm bg-opacity-80"
      : "bg-white border border-gray-200 backdrop-blur-sm bg-opacity-90";

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div
        className={`${cardClass} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3
            className={`text-sm font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-500"
            }`}
          >
            Total Items
          </h3>
          <Activity className="w-5 h-5 text-blue-500" />
        </div>
        <p className="text-3xl font-bold text-blue-500 animate-pulse">
          {animatedStats.totalItems}
        </p>
      </div>

      <div
        className={`${cardClass} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3
            className={`text-sm font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-500"
            }`}
          >
            Total Quantity
          </h3>
          <Zap className="w-5 h-5 text-green-500" />
        </div>
        <p className="text-3xl font-bold text-green-500">
          {animatedStats.totalQuantity}
        </p>
      </div>

      <div
        className={`${cardClass} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3
            className={`text-sm font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-500"
            }`}
          >
            Total Value
          </h3>
          <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
        </div>
        <p className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          ₹{animatedStats.totalValue.toLocaleString("en-IN")}
        </p>
      </div>

      <div
        className={`${cardClass} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3
            className={`text-sm font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-500"
            }`}
          >
            Unique Brands
          </h3>
          <div className="w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
        </div>
        <p className="text-3xl font-bold text-orange-500">
          {animatedStats.totalBrands}
        </p>
      </div>
    </div>
  );
};

export default Statistics;
