import React from 'react';
import InventoryList from '../components/InventoryList';

const Inventory = () => {
  const vehicles = [
    // Sample vehicle data
    { id: 1, make: 'Toyota', model: 'Camry', year: 2020 },
    { id: 2, make: 'Honda', model: 'Civic', year: 2019 },
    { id: 3, make: 'Ford', model: 'Mustang', year: 2021 },
  ];

  return (
    <div className="inventory">
      <h1>Vehicle Inventory</h1>
      <InventoryList vehicles={vehicles} />
    </div>
  );
};

export default Inventory;