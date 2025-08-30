import React, { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === "admin@test.com" && password === "1234") {
      onLogin();
    } else {
      setError("⚠ Invalid credentials!");
    }
  };

  return (
    <div className="relative h-screen w-screen flex items-center justify-center overflow-hidden bg-black">
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
