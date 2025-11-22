const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { authMiddleware } = require("../middleware/auth");
const logger = require("../utils/logger");

// Get sales report
router.get("/sales/summary", authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as invoice_count,
        SUM(grand_total) as total_revenue,
        AVG(grand_total) as average_invoice,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_invoices
      FROM invoices
    `;

    const params = [];

    if (startDate && endDate) {
      query += " WHERE created_at >= $1 AND created_at <= $2";
      params.push(startDate, endDate);
    }

    query += " GROUP BY DATE(created_at) ORDER BY DATE(created_at) DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    logger.error("Sales report error:", error);
    res.status(500).json({ error: "Failed to fetch sales report" });
  }
});

// Get inventory report
router.get("/inventory/summary", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        category,
        COUNT(*) as total_parts,
        SUM(quantity) as total_quantity,
        SUM(quantity * cost) as total_value,
        COUNT(CASE WHEN quantity <= min_stock_level THEN 1 END) as low_stock_items
       FROM parts
       GROUP BY category
       ORDER BY total_value DESC`
    );

    res.json(result.rows);
  } catch (error) {
    logger.error("Inventory report error:", error);
    res.status(500).json({ error: "Failed to fetch inventory report" });
  }
});

// Get payment report
router.get("/payments/summary", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        payment_method,
        COUNT(*) as total_payments,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount
       FROM payments
       GROUP BY payment_method
       ORDER BY total_amount DESC`
    );

    res.json(result.rows);
  } catch (error) {
    logger.error("Payment report error:", error);
    res.status(500).json({ error: "Failed to fetch payment report" });
  }
});

// Get audit log
router.get("/audit/logs", authMiddleware, async (req, res) => {
  try {
    const limit = req.query.limit || 100;
    const offset = req.query.offset || 0;

    const result = await pool.query(
      `SELECT 
        al.id,
        al.action,
        al.entity_type,
        al.entity_id,
        al.created_at,
        u.name as user_name
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json(result.rows);
  } catch (error) {
    logger.error("Audit log error:", error);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

// Get dashboard summary
router.get("/dashboard/overview", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM parts) as total_parts,
        (SELECT COUNT(*) FROM invoices) as total_invoices,
        (SELECT COUNT(*) FROM payments) as total_payments,
        (SELECT SUM(grand_total) FROM invoices WHERE status = 'paid') as total_paid,
        (SELECT SUM(grand_total) FROM invoices WHERE status = 'pending') as total_pending,
        (SELECT COUNT(*) FROM parts WHERE quantity <= min_stock_level) as low_stock_items,
        (SELECT SUM(quantity * cost) FROM parts) as inventory_value
    `);

    res.json(result.rows[0]);
  } catch (error) {
    logger.error("Dashboard overview error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard overview" });
  }
});

module.exports = router;
