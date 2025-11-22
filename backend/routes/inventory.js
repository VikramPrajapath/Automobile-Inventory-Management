const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { authMiddleware } = require("../middleware/auth");
const logger = require("../utils/logger");

// Get all inventory items
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM parts ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    logger.error("Get inventory error:", error);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

// Get single part
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM parts WHERE id = $1", [
      req.params.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Part not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error("Get part error:", error);
    res.status(500).json({ error: "Failed to fetch part" });
  }
});

// Create new part
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      partName,
      partNumber,
      brand,
      cost,
      discount,
      quantity,
      category,
      supplier,
      features,
      minStockLevel,
    } = req.body;

    // Validate required fields
    if (!partName || !partNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await pool.query(
      `INSERT INTO parts 
       (part_name, part_number, brand, cost, discount, quantity, category, supplier, features, min_stock_level, created_by, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()) 
       RETURNING *`,
      [
        partName,
        partNumber,
        brand,
        cost,
        discount,
        quantity,
        category,
        supplier,
        features,
        minStockLevel,
        req.user.id,
      ]
    );

    res.status(201).json({
      message: "Part created successfully",
      part: result.rows[0],
    });
  } catch (error) {
    logger.error("Create part error:", error);
    res.status(500).json({ error: "Failed to create part" });
  }
});

// Update part
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const {
      partName,
      partNumber,
      brand,
      cost,
      discount,
      quantity,
      category,
      supplier,
      features,
      minStockLevel,
    } = req.body;

    const result = await pool.query(
      `UPDATE parts 
       SET part_name = COALESCE($1, part_name),
           part_number = COALESCE($2, part_number),
           brand = COALESCE($3, brand),
           cost = COALESCE($4, cost),
           discount = COALESCE($5, discount),
           quantity = COALESCE($6, quantity),
           category = COALESCE($7, category),
           supplier = COALESCE($8, supplier),
           features = COALESCE($9, features),
           min_stock_level = COALESCE($10, min_stock_level),
           updated_at = NOW()
       WHERE id = $11
       RETURNING *`,
      [
        partName,
        partNumber,
        brand,
        cost,
        discount,
        quantity,
        category,
        supplier,
        features,
        minStockLevel,
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Part not found" });
    }

    res.json({
      message: "Part updated successfully",
      part: result.rows[0],
    });
  } catch (error) {
    logger.error("Update part error:", error);
    res.status(500).json({ error: "Failed to update part" });
  }
});

// Delete part
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM parts WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Part not found" });
    }

    res.json({ message: "Part deleted successfully" });
  } catch (error) {
    logger.error("Delete part error:", error);
    res.status(500).json({ error: "Failed to delete part" });
  }
});

// Search parts
router.get("/search/:query", authMiddleware, async (req, res) => {
  try {
    const searchTerm = `%${req.params.query}%`;
    const result = await pool.query(
      `SELECT * FROM parts 
       WHERE part_name ILIKE $1 OR part_number ILIKE $1 OR brand ILIKE $1
       ORDER BY created_at DESC`,
      [searchTerm]
    );

    res.json(result.rows);
  } catch (error) {
    logger.error("Search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

// Get low stock items
router.get("/low-stock/items", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM parts WHERE quantity <= min_stock_level ORDER BY quantity ASC`
    );
    res.json(result.rows);
  } catch (error) {
    logger.error("Low stock error:", error);
    res.status(500).json({ error: "Failed to fetch low stock items" });
  }
});

module.exports = router;
