const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { authMiddleware } = require("../middleware/auth");
const logger = require("../utils/logger");

// Record payment
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      invoiceId,
      invoiceNumber,
      payerName,
      amount,
      paymentMethod,
      reference,
      notes,
    } = req.body;

    if (!payerName || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await pool.query(
      `INSERT INTO payments 
       (invoice_id, invoice_number, payer_name, amount, payment_method, reference, notes, recorded_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING *`,
      [
        invoiceId,
        invoiceNumber,
        payerName,
        amount,
        paymentMethod,
        reference,
        notes,
        req.user.id,
      ]
    );

    // If invoice is specified, update its status
    if (invoiceId) {
      await pool.query("UPDATE invoices SET status = $1 WHERE id = $2", [
        "paid",
        invoiceId,
      ]);
    }

    res.status(201).json({
      message: "Payment recorded successfully",
      payment: result.rows[0],
    });
  } catch (error) {
    logger.error("Create payment error:", error);
    res.status(500).json({ error: "Failed to record payment" });
  }
});

// Get all payments
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM payments ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    logger.error("Get payments error:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// Get payments for specific invoice
router.get("/invoice/:invoiceId", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM payments WHERE invoice_id = $1 ORDER BY created_at DESC",
      [req.params.invoiceId]
    );
    res.json(result.rows);
  } catch (error) {
    logger.error("Get invoice payments error:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// Get payment statistics
router.get("/statistics/summary", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_payments,
        SUM(amount) as total_amount,
        payment_method,
        DATE(created_at) as payment_date
       FROM payments
       GROUP BY payment_method, DATE(created_at)
       ORDER BY DATE(created_at) DESC`
    );

    res.json(result.rows);
  } catch (error) {
    logger.error("Payment statistics error:", error);
    res.status(500).json({ error: "Failed to fetch payment statistics" });
  }
});

// Delete payment
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM payments WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    logger.error("Delete payment error:", error);
    res.status(500).json({ error: "Failed to delete payment" });
  }
});

module.exports = router;
