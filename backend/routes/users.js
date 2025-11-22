const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { authMiddleware, roleMiddleware } = require("../middleware/auth");
const logger = require("../utils/logger");

// Get users (admin only)
router.get("/", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    logger.error("Get users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Update user role (admin only)
router.patch(
  "/:id/role",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const { role } = req.body;

      if (!["admin", "manager", "employee"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      const result = await pool.query(
        "UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, name, role",
        [role, req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        message: "User role updated successfully",
        user: result.rows[0],
      });
    } catch (error) {
      logger.error("Update user role error:", error);
      res.status(500).json({ error: "Failed to update user role" });
    }
  }
);

// Delete user (admin only)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const result = await pool.query(
        "DELETE FROM users WHERE id = $1 RETURNING id",
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      logger.error("Delete user error:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  }
);

module.exports = router;
