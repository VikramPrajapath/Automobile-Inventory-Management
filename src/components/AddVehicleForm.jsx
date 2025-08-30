import React, { useState } from 'react';

const AddVehicleForm = ({ onAddVehicle }) => {
  const [vehicle, setVehicle] = useState({
    make: '',
    model: '',
    year: '',
    price: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehicle({ ...vehicle, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (vehicle.make && vehicle.model && vehicle.year && vehicle.price) {
      onAddVehicle(vehicle);
      setVehicle({ make: '', model: '', year: '', price: '' });
    } else {
      alert('Please fill in all fields');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="make"
        placeholder="Make"
        value={vehicle.make}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="model"
        placeholder="Model"
        value={vehicle.model}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="year"
        placeholder="Year"
        value={vehicle.year}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="price"
        placeholder="Price"
        value={vehicle.price}
        onChange={handleChange}
        required
      />
      <button type="submit">Add Vehicle</button>
    </form>
  );
};

export default AddVehicleForm;