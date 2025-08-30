// src/utils/dataHandler.js
import { dataPaths } from "../config/paths";

class DataHandler {
  constructor() {
    this.version = "1.0";
  }

  // Load data from localStorage with error handling
  loadData(dataType) {
    try {
      const data = localStorage.getItem(
        dataPaths[dataType] || dataPaths.vehicles
      );
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error loading ${dataType} data:`, error);
      return [];
    }
  }

  // Save data to localStorage with backup
  saveData(dataType, data) {
    try {
      // Create backup before saving
      this.createBackup(dataType);

      localStorage.setItem(
        dataPaths[dataType] || dataPaths.vehicles,
        JSON.stringify(data)
      );
      return true;
    } catch (error) {
      console.error(`Error saving ${dataType} data:`, error);
      return false;
    }
  }

  // Create a backup of current data
  createBackup(dataType) {
    try {
      const currentData = this.loadData(dataType);
      const backupKey = `${dataPaths[dataType]}_backup_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(currentData));

      // Clean up old backups (keep only last 5)
      this.cleanupBackups(dataType);
    } catch (error) {
      console.error("Error creating backup:", error);
    }
  }

  // Clean up old backups
  cleanupBackups(dataType) {
    try {
      const backupKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${dataPaths[dataType]}_backup_`)) {
          backupKeys.push(key);
        }
      }

      // Sort by timestamp (newest first)
      backupKeys.sort((a, b) => {
        const aTime = parseInt(a.split("_").pop());
        const bTime = parseInt(b.split("_").pop());
        return bTime - aTime;
      });

      // Remove backups beyond the 5 most recent
      if (backupKeys.length > 5) {
        for (let i = 5; i < backupKeys.length; i++) {
          localStorage.removeItem(backupKeys[i]);
        }
      }
    } catch (error) {
      console.error("Error cleaning up backups:", error);
    }
  }

  // Export data to JSON file
  exportToJSON(dataType, fileName) {
    try {
      const data = this.loadData(dataType);
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || `${dataType}_export.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error("Error exporting data:", error);
      return false;
    }
  }

  // Import data from JSON file
  importFromJSON(dataType, file, mode = "merge") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target.result);
          if (!Array.isArray(importedData)) {
            reject(new Error("Invalid JSON format: Expected an array"));
            return;
          }

          if (mode === "replace") {
            this.saveData(dataType, importedData);
          } else {
            // Merge mode - combine existing and imported data
            const existingData = this.loadData(dataType);
            const existingIds = new Set(existingData.map((item) => item.id));
            const newItems = importedData.filter(
              (item) => !existingIds.has(item.id)
            );
            this.saveData(dataType, [...existingData, ...newItems]);
          }

          resolve(true);
        } catch (error) {
          reject(new Error("Invalid JSON file: " + error.message));
        }
      };

      reader.onerror = () => reject(new Error("Error reading file"));
      reader.readAsText(file);
    });
  }
}

export default new DataHandler();
