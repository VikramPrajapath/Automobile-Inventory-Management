import React, { useState } from 'react';

const EditVehicleForm = ({ vehicle, onUpdate }) => {
  const [formData, setFormData] = useState(vehicle);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Vehicle</h2>
      <div>
        <label>Make:</label>
        <input
          type="text"
          name="make"
          value={formData.make}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Model:</label>
        <input
          type="text"
          name="model"
          value={formData.model}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Year:</label>
        <input
          type="number"
          name="year"
          value={formData.year}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Price:</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit">Update Vehicle</button>
    </form>
  );
};

export default EditVehicleForm;