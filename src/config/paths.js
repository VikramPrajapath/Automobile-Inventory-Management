// src/config/paths.js
export const dataPaths = {
  vehicles: "automobile_inventory_vehicles",
  customers: "automobile_inventory_customers", // For future expansion
  sales: "automobile_inventory_sales", // For future expansion
  settings: "automobile_inventory_settings",
};

export const getImagePath = (vehicleId, imageName = "default.jpg") => {
  return `/assets/images/vehicles/${vehicleId}/${imageName}`;
};

export const exportPaths = {
  excel: "inventory_export.xlsx",
  json: "inventory_backup.json",
};

export default dataPaths;
