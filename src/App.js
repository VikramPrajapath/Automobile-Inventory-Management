import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Inventory from "./pages/Inventory";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" exact component={Home} />
          <Route path="/inventory" component={Inventory} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
