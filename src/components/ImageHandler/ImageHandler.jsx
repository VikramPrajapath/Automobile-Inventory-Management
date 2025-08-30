// src/components/ImageHandler/ImageHandler.js
import React, { useState } from "react";
import { getVehicleImagePath } from "../../config/paths";
import "./ImageHandler.css";

const ImageHandler = ({ vehicleId, alt = "Vehicle image", className = "" }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  if (imageError) {
    return (
      <div className={`image-placeholder ${className}`}>
        <span>No Image Available</span>
      </div>
    );
  }

  return (
    <img
      src={getVehicleImagePath(vehicleId)}
      alt={alt}
      className={`vehicle-image ${className}`}
      onError={handleImageError}
    />
  );
};

export default ImageHandler;
