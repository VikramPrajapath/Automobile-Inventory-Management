import React from 'react';

function InventoryItem({ vehicle }) {
  return (
    <div className="inventory-item">
      <h3>{vehicle.make} {vehicle.model}</h3>
      <p>Year: {vehicle.year}</p>
      <p>Price: ${vehicle.price}</p>
      <p>Description: {vehicle.description}</p>
    </div>
  );
}

export default InventoryItem;