import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

function Header() {
  return (
    <header className="header">
      <nav>
        <Link to="/">Home</Link>
        <Link to="/inventory">Inventory</Link>
      </nav>
    </header>
  );
}

export default Header;
