// src/hooks/useData.js
import { useState, useEffect } from "react";
import dataHandler from "../utils/dataHandler";

const useData = (dataType) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await dataHandler.loadData(dataType);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataType]);

  const updateData = async (newData) => {
    try {
      const success = await dataHandler.saveData(dataType, newData);
      if (success) {
        setData(newData);
      }
      return success;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return { data, loading, error, updateData };
};

export default useData;
