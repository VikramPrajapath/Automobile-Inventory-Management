import React, { memo, useMemo } from "react";
import { Edit, Trash2, Eye, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const InventoryCard = memo(
  ({ item, onEdit, onDelete, onImageView, theme, filters }) => {
    // Memoize calculated values
    const finalPrice = useMemo(
      () => ((item.cost * (100 - item.discount)) / 100).toFixed(2),
      [item.cost, item.discount]
    );

    const isLowStock = useMemo(() => item.quantity < 5, [item.quantity]);

    // Theme-aware classes
    const cardClass =
      theme === "dark"
        ? "bg-gray-800 border border-gray-700 hover:border-gray-600"
        : "bg-white border border-gray-200 hover:border-gray-300";

    const textClass = theme === "dark" ? "text-gray-100" : "text-gray-800";
    const subtextClass = theme === "dark" ? "text-gray-300" : "text-gray-600";

    // Animation variants - memoized to prevent recreations
    const cardVariants = useMemo(
      () => ({
        hidden: {
          opacity: 0,
          scale: 0.8,
          transition: { duration: 0.3 },
        },
        visible: {
          opacity: 1,
          scale: 1,
          transition: {
            duration: 0.5,
            type: "spring",
            stiffness: 300,
            damping: 20,
          },
        },
      }),
      []
    );

    return (
      <motion.div
        key={`card-${item.id}`}
        variants={cardVariants}
        initial="visible"
        animate="visible"
        className={`${cardClass} rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative`}
      >
        {/* Low Stock Warning */}
        {item.quantity < 5 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse flex items-center gap-1 z-10"
          >
            <AlertTriangle className="w-3 h-3" />
            Low Stock
          </motion.div>
        )}

        {/* Image Section */}
        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
          {item.image ? (
            <motion.img
              src={item.image}
              alt={item.partName}
              className="w-full h-full object-cover cursor-pointer"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
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
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`font-bold text-lg ${textClass} mb-3 truncate`}
          >
            {item.partName}
          </motion.h3>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`space-y-2 text-sm ${subtextClass}`}
          >
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
          </motion.div>

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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
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
                  ₹{finalPrice}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons with hover effects */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-2 mt-5"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEdit}
              className="flex-极狐 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-sm transition-all duration-300"
            >
              <Edit className="w-4 h-4" />
              Edit
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDelete}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-sm transition-all duration-300"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for memo optimization
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.partName === nextProps.item.partName &&
      prevProps.item.cost === nextProps.item.cost &&
      prevProps.item.discount === nextProps.item.discount &&
      prevProps.item.quantity === nextProps.item.quantity &&
      prevProps.item.image === nextProps.item.image &&
      prevProps.theme === nextProps.theme &&
      prevProps.filters.searchTerm === nextProps.filters.searchTerm &&
      prevProps.filters.brandFilter === nextProps.filters.brandFilter
    );
  }
);

InventoryCard.displayName = "InventoryCard";

export default InventoryCard;
