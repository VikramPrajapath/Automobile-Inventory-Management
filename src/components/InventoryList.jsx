import React from 'react';
import InventoryItem from './InventoryItem';

const InventoryList = ({ vehicles }) => {
  return (
    <div className="inventory-list">
      {vehicles.length === 0 ? (
        <p>No vehicles available in the inventory.</p>
      ) : (
        vehicles.map(vehicle => (
          <InventoryItem key={vehicle.id} vehicle={vehicle} />
        ))
      )}
    </div>
  );
};

export default InventoryList;