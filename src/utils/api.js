import axios from 'axios';

const API_URL = 'http://localhost:5000/api/vehicles';

export const fetchVehicles = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw new Error('Error fetching vehicles: ' + error.message);
  }
};

export const addVehicle = async (vehicle) => {
  try {
    const response = await axios.post(API_URL, vehicle);
    return response.data;
  } catch (error) {
    throw new Error('Error adding vehicle: ' + error.message);
  }
};

export const updateVehicle = async (id, vehicle) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, vehicle);
    return response.data;
  } catch (error) {
    throw new Error('Error updating vehicle: ' + error.message);
  }
};

export const deleteVehicle = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    throw new Error('Error deleting vehicle: ' + error.message);
  }
};