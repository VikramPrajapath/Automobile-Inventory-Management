import React, { useState, useEffect, useCallback } from "react";
import { Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [timeoutCountdown, setTimeoutCountdown] = useState(60); // 60 seconds warning

  // Timer references
  const inactivityTimer = React.useRef(null);
  const countdownTimer = React.useRef(null);

  // Handle user logout
  const handleLogout = useCallback(() => {
    // Clear all timers
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (countdownTimer.current) clearInterval(countdownTimer.current);

    // Reset states
    setShowTimeoutWarning(false);
    setTimeoutCountdown(60);

    // Call the parent logout function
    onLogin(null);
  }, [onLogin]);

  // Reset all timers
  const resetTimers = useCallback(() => {
    // Clear existing timers
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (countdownTimer.current) clearInterval(countdownTimer.current);

    // Hide warning if shown
    setShowTimeoutWarning(false);
    setTimeoutCountdown(60);

    // Set new inactivity timer (5 minutes = 300000 ms)
    inactivityTimer.current = setTimeout(() => {
      // Show warning 1 minute before logout
      setShowTimeoutWarning(true);

      // Start countdown timer
      countdownTimer.current = setInterval(() => {
        setTimeoutCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimer.current);
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 240000); // 4 minutes (show warning after 4 minutes)
  }, [handleLogout]);

  // Set up event listeners for user activity
  useEffect(() => {
    // Events that indicate user activity
    const events = [
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "mousemove",
    ];

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimers);
    });

    // Initialize the timer
    resetTimers();

    // Clean up event listeners and timers
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimers);
      });

      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      if (countdownTimer.current) clearInterval(countdownTimer.current);
    };
  }, [resetTimers]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === "admin@test.com" && password === "1234") {
      // Reset timers on successful login
      resetTimers();
      onLogin();
    } else {
      setError("⚠ Invalid credentials!");
    }
  };

  // Function to extend the session
  const extendSession = () => {
    resetTimers();
  };

  return (
    <div className="relative h-screen w-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Session Timeout Warning Modal */}
      {showTimeoutWarning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className="bg-gray-900/90 border border-cyan-400/60 rounded-2xl p-8 max-w-md mx-4 shadow-[0_0_40px_rgba(0,255,255,0.7)]"
          >
            <h2 className="text-2xl font-bold text-cyan-400 mb-4 text-center">
              Session Timeout
            </h2>
            <p className="text-gray-300 text-center mb-6">
              Your session is about to expire due to inactivity. You will be
              logged out in {timeoutCountdown} seconds.
            </p>
            <div className="flex justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-6 py-2 border border-red-500/50 rounded-xl text-red-400 hover:bg-red-900/30 transition-colors"
              >
                Log Out
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={extendSession}
                className="px-6 py-2 bg-cyan-500/90 rounded-xl text-white hover:bg-cyan-400 transition-colors"
              >
                Stay Logged In
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Animated Neon Gradient Background */}
      <div className="absolute inset-0 animate-gradient-x bg-gradient-to-r from-purple-800 via-blue-900 to-cyan-700 opacity-70"></div>
      <div className="absolute w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.15)_0%,transparent_70%)] animate-spin-slow"></div>

      {/* Futuristic Glassmorphic Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="relative z-10 bg-white/10 backdrop-blur-md border border-cyan-400/40 shadow-[0_0_30px_rgba(0,255,255,0.5)] rounded-3xl w-[420px] p-10 animate-fade-in"
      >
        {/* Title */}
        <h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent tracking-wider mb-3">
          A.I.M Console
        </h1>
        <p className="text-center text-gray-300 mb-10 tracking-wide">
          Automobile Inventory Management
        </p>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-center font-medium mb-4 animate-fade-in">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email */}
          <div className="flex items-center border border-cyan-400/50 rounded-2xl px-4 py-3 bg-black/40 backdrop-blur-sm transition-all duration-300 hover:scale-105 focus-within:ring-2 focus-within:ring-cyan-400">
            <Mail className="text-cyan-400 mr-3" size={20} />
            <input
              type="email"
              placeholder="Email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-white outline-none placeholder-gray-400"
              required
            />
          </div>

          {/* Password */}
          <div className="flex items-center border border-purple-400/50 rounded-2xl px-4 py-3 bg-black/40 backdrop-blur-sm transition-all duration-300 hover:scale-105 focus-within:ring-2 focus-within:ring-purple-400">
            <Lock className="text-purple-400 mr-3" size={20} />
            <input
              type="password"
              placeholder="Access Code"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent text-white outline-none placeholder-gray-400"
              required
            />
          </div>

          {/* Button */}
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 0px 30px rgba(0,255,255,0.8)",
            }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full py-3 rounded-2xl font-semibold text-lg text-white 
              bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 
              hover:from-purple-600 hover:to-cyan-500 
              transition-all duration-500 shadow-[0_0_20px_rgba(0,255,255,0.6)]"
          >
            ACCESS SYSTEM
          </motion.button>
        </form>

        {/* Extra */}
        <p className="text-center text-sm text-gray-400 mt-10">
          Forgotten credentials?{" "}
          <span className="text-cyan-400 hover:underline cursor-pointer transition-all duration-300">
            Initiate Reset
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
