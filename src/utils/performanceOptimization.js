/**
 * Performance Optimization Utilities
 * Collection of functions to optimize React component performance
 */

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function to limit function calls
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, delay = 300) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

/**
 * Chunk array into smaller arrays
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array} Array of chunks
 */
export const chunkArray = (array, size = 20) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Memoize expensive calculations
 * @param {Function} func - Function to memoize
 * @returns {Function} Memoized function
 */
export const memoize = (func) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func(...args);
    cache.set(key, result);
    return result;
  };
};

/**
 * Deep equality check for objects
 * @param {Object} obj1 - First object
 * @param {Object} obj2 - Second object
 * @returns {boolean} Whether objects are deeply equal
 */
export const deepEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return false;
  if (typeof obj1 !== "object" || typeof obj2 !== "object") return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (let key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
};

/**
 * Filter and sort data efficiently
 * @param {Array} data - Data to filter
 * @param {string} searchTerm - Search term
 * @param {string} filterKey - Key to filter by
 * @returns {Array} Filtered data
 */
export const filterData = (data, searchTerm = "", filterKey = "") => {
  if (!searchTerm && !filterKey) return data;

  return data.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesFilter =
      !filterKey ||
      item.brand?.toLowerCase() === filterKey.toLowerCase() ||
      item.category?.toLowerCase() === filterKey.toLowerCase();

    return matchesSearch && matchesFilter;
  });
};

/**
 * Batch process items with callback
 * @param {Array} items - Items to process
 * @param {Function} callback - Callback function
 * @param {number} batchSize - Batch size
 */
export const batchProcess = async (items, callback, batchSize = 50) => {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await new Promise((resolve) => {
      requestIdleCallback(() => {
        batch.forEach(callback);
        resolve();
      });
    });
  }
};

/**
 * Cache localStorage with expiration
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @param {number} expiryMinutes - Expiry in minutes
 */
export const setCacheWithExpiry = (key, value, expiryMinutes = 60) => {
  const data = {
    value,
    expiry: Date.now() + expiryMinutes * 60 * 1000,
  };
  localStorage.setItem(key, JSON.stringify(data));
};

/**
 * Get cached localStorage value
 * @param {string} key - Storage key
 * @returns {*} Cached value or null
 */
export const getCacheWithExpiry = (key) => {
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  const { value, expiry } = JSON.parse(cached);
  if (Date.now() > expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return value;
};

/**
 * Request animation frame wrapper
 * @param {Function} callback - Callback function
 */
export const rafScheduler = (callback) => {
  return requestAnimationFrame(callback);
};

/**
 * Cancel animation frame
 * @param {number} id - RAF ID
 */
export const cancelRaf = (id) => {
  cancelAnimationFrame(id);
};
