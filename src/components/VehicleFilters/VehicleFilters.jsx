// src/components/VehicleFilters/VehicleFilters.js
import React from "react";
import "./VehicleFilters.css";

const VehicleFilters = ({ filters, onFilterChange }) => {
  const handleInputChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const clearFilters = () => {
    onFilterChange({
      make: "",
      model: "",
      minPrice: "",
      maxPrice: "",
      status: "",
    });
  };

  return (
    <div className="vehicle-filters">
      <h3>Filters</h3>

      <div className="filter-group">
        <input
          type="text"
          placeholder="Make"
          value={filters.make}
          onChange={(e) => handleInputChange("make", e.target.value)}
        />

        <input
          type="text"
          placeholder="Model"
          value={filters.model}
          onChange={(e) => handleInputChange("model", e.target.value)}
        />
      </div>

      <div className="filter-group">
        <input
          type="number"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={(e) => handleInputChange("minPrice", e.target.value)}
        />

        <input
          type="number"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={(e) => handleInputChange("maxPrice", e.target.value)}
        />
      </div>

      <div className="filter-group">
        <select
          value={filters.status}
          onChange={(e) => handleInputChange("status", e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
          <option value="reserved">Reserved</option>
          <option value="maintenance">Maintenance</option>
        </select>

        <button onClick={clearFilters} className="btn btn-secondary">
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default VehicleFilters;
