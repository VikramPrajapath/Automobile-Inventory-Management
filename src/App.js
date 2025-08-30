import AutomobileInventory from "./components/AutomobileInventory";
import "./App.css";
import React, { useState } from "react";
import Login from "./components/Login";
function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return loggedIn ? (
    <AutomobileInventory />
  ) : (
    <Login onLogin={() => setLoggedIn(true)} />
  );
}

export default App;
