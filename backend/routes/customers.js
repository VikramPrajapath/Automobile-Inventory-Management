const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { authMiddleware } = require("../middleware/auth");
const logger = require("../utils/logger");

// Get all customers
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT customer_name, customer_email, customer_phone 
       FROM invoices
       ORDER BY customer_name ASC`
    );
    res.json(result.rows);
  } catch (error) {
    logger.error("Get customers error:", error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// Get customer purchase history
router.get("/:customerId/history", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, 
              COUNT(ii.id) as item_count,
              SUM(ii.quantity) as total_items
       FROM invoices i
       LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
       WHERE i.customer_name = $1
       GROUP BY i.id
       ORDER BY i.created_at DESC`,
      [req.params.customerId]
    );

    res.json(result.rows);
  } catch (error) {
    logger.error("Get customer history error:", error);
    res.status(500).json({ error: "Failed to fetch customer history" });
  }
});

// Get customer statistics
router.get("/:customerId/statistics", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        customer_name,
        COUNT(*) as total_invoices,
        SUM(grand_total) as total_spent,
        AVG(grand_total) as average_invoice,
        MAX(created_at) as last_purchase
       FROM invoices
       WHERE customer_name = $1
       GROUP BY customer_name`,
      [req.params.customerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error("Get customer statistics error:", error);
    res.status(500).json({ error: "Failed to fetch customer statistics" });
  }
});

module.exports = router;
