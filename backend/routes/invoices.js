const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { authMiddleware } = require("../middleware/auth");
const logger = require("../utils/logger");

// Get all invoices
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM invoices ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    logger.error("Get invoices error:", error);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

// Get single invoice
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const invoiceResult = await pool.query(
      "SELECT * FROM invoices WHERE id = $1",
      [req.params.id]
    );

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const itemsResult = await pool.query(
      "SELECT * FROM invoice_items WHERE invoice_id = $1",
      [req.params.id]
    );

    res.json({
      ...invoiceResult.rows[0],
      items: itemsResult.rows,
    });
  } catch (error) {
    logger.error("Get invoice error:", error);
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
});

// Create invoice
router.post("/", authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const {
      customerName,
      customerEmail,
      customerPhone,
      items,
      subtotal,
      taxRate,
      taxAmount,
      grandTotal,
      paymentMethod,
      notes,
      status,
    } = req.body;

    // Validate required fields
    if (!customerName || !items || items.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create invoice
    const invoiceResult = await client.query(
      `INSERT INTO invoices 
       (invoice_number, customer_name, customer_email, customer_phone, subtotal, tax_rate, tax_amount, grand_total, payment_method, notes, status, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
       RETURNING *`,
      [
        `INV-${Date.now()}`,
        customerName,
        customerEmail,
        customerPhone,
        subtotal,
        taxRate,
        taxAmount,
        grandTotal,
        paymentMethod,
        notes,
        status || "pending",
        req.user.id,
      ]
    );

    const invoiceId = invoiceResult.rows[0].id;

    // Insert invoice items
    for (const item of items) {
      await client.query(
        `INSERT INTO invoice_items 
         (invoice_id, part_id, quantity, unit_price, line_total)
         VALUES ($1, $2, $3, $4, $5)`,
        [invoiceId, item.id, item.quantity, item.cost, item.lineTotal]
      );

      // Update part quantity
      await client.query(
        "UPDATE parts SET quantity = quantity - $1 WHERE id = $2",
        [item.quantity, item.id]
      );
    }

    // Create audit log
    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [req.user.id, "CREATE", "INVOICE", invoiceId]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Invoice created successfully",
      invoice: invoiceResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error("Create invoice error:", error);
    res.status(500).json({ error: "Failed to create invoice" });
  } finally {
    client.release();
  }
});

// Update invoice status
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    const result = await pool.query(
      "UPDATE invoices SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json({
      message: "Invoice updated successfully",
      invoice: result.rows[0],
    });
  } catch (error) {
    logger.error("Update invoice error:", error);
    res.status(500).json({ error: "Failed to update invoice" });
  }
});

// Delete invoice
router.delete("/:id", authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get invoice items to revert quantities
    const itemsResult = await client.query(
      "SELECT * FROM invoice_items WHERE invoice_id = $1",
      [req.params.id]
    );

    // Revert part quantities
    for (const item of itemsResult.rows) {
      await client.query(
        "UPDATE parts SET quantity = quantity + $1 WHERE id = $2",
        [item.quantity, item.part_id]
      );
    }

    // Delete invoice items
    await client.query("DELETE FROM invoice_items WHERE invoice_id = $1", [
      req.params.id,
    ]);

    // Delete invoice
    const result = await client.query(
      "DELETE FROM invoices WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Invoice not found" });
    }

    await client.query("COMMIT");
    res.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error("Delete invoice error:", error);
    res.status(500).json({ error: "Failed to delete invoice" });
  } finally {
    client.release();
  }
});

module.exports = router;
