// src/components/VehicleManager/VehicleManager.js
import React, { useState } from "react";
import useData from "../../hooks/useData";
import VehicleForm from "./VehicleForm";
import VehicleList from "./VehicleList";
import VehicleFilters from "./VehicleFilters";
import "./VehicleManager.css";

const VehicleManager = () => {
  const { data: vehicles, loading, error, updateData } = useData("vehicles");
  const [filters, setFilters] = useState({
    make: "",
    model: "",
    minPrice: "",
    maxPrice: "",
    status: "",
  });
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Filter vehicles based on current filters
  const filteredVehicles = vehicles.filter((vehicle) => {
    return (
      (filters.make === "" ||
        vehicle.make.toLowerCase().includes(filters.make.toLowerCase())) &&
      (filters.model === "" ||
        vehicle.model.toLowerCase().includes(filters.model.toLowerCase())) &&
      (filters.minPrice === "" ||
        vehicle.price >= parseInt(filters.minPrice)) &&
      (filters.maxPrice === "" ||
        vehicle.price <= parseInt(filters.maxPrice)) &&
      (filters.status === "" || vehicle.status === filters.status)
    );
  });

  const handleAddVehicle = (newVehicle) => {
    const newVehicles = [
      ...vehicles,
      {
        ...newVehicle,
        id: Date.now(), // Simple ID generation
      },
    ];
    updateData(newVehicles);
    setShowForm(false);
  };

  const handleEditVehicle = (updatedVehicle) => {
    const newVehicles = vehicles.map((vehicle) =>
      vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle
    );
    updateData(newVehicles);
    setEditingVehicle(null);
    setShowForm(false);
  };

  const handleDeleteVehicle = (id) => {
    const newVehicles = vehicles.filter((vehicle) => vehicle.id !== id);
    updateData(newVehicles);
  };

  if (loading) return <div className="loading">Loading vehicles...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="vehicle-manager">
      <h1>Vehicle Inventory Management</h1>

      <div className="vehicle-manager-controls">
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          Add New Vehicle
        </button>

        <VehicleFilters filters={filters} onFilterChange={setFilters} />
      </div>

      {showForm && (
        <VehicleForm
          vehicle={editingVehicle}
          onSubmit={editingVehicle ? handleEditVehicle : handleAddVehicle}
          onCancel={() => {
            setShowForm(false);
            setEditingVehicle(null);
          }}
        />
      )}

      <VehicleList
        vehicles={filteredVehicles}
        onEdit={(vehicle) => {
          setEditingVehicle(vehicle);
          setShowForm(true);
        }}
        onDelete={handleDeleteVehicle}
      />
    </div>
  );
};

export default VehicleManager;
