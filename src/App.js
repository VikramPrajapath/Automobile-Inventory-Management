import AutomobileInventory from "./components/AutomobileInventory";
import "./App.css";
import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import { WifiOff, AlertCircle } from "lucide-react";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Track online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <>
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white px-4 py-3 flex items-center gap-2 z-[100] shadow-lg">
          <WifiOff className="w-5 h-5" />
          <span>No internet connection. Some features may be limited.</span>
        </div>
      )}
      {loggedIn ? (
        <AutomobileInventory />
      ) : (
        <Login onLogin={() => setLoggedIn(true)} />
      )}
    </>
  );
}

export default App;
