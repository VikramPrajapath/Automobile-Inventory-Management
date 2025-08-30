import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  Zap,
  Info,
} from "lucide-react";

const FuturisticSnackbar = ({ message, type, onClose, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <XCircle className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      case "info":
        return <Info className="w-5 h-5" />;
      default:
        return <Zap className="w-5 h-5" />;
    }
  };

  const getBackground = () => {
    switch (type) {
      case "success":
        return "bg-gradient-to-r from-emerald-500/90 to-green-600/90 border-emerald-400/50";
      case "error":
        return "bg-gradient-to-r from-red-500/90 to-rose-600/90 border-red-400/50";
      case "warning":
        return "bg-gradient-to-r from-amber-500/90 to-yellow-600/90 border-amber-400/50";
      case "info":
        return "bg-gradient-to-r from-blue-500/90 to-cyan-600/90 border-blue-400/50";
      default:
        return "bg-gradient-to-r from-purple-500/90 to-indigo-600/90 border-purple-400/50";
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{ type: "spring", damping: 15, stiffness: 300 }}
          className={`${getBackground()} backdrop-blur-md border rounded-xl shadow-2xl overflow-hidden cyber-glow`}
        >
          <div className="flex items-center p-4 pr-8">
            <div className="mr-3 text-white">{getIcon()}</div>
            <p className="text-white font-medium text-sm">{message}</p>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: duration / 1000, ease: "linear" }}
            className="h-1 bg-white/30"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FuturisticSnackbar;
