require("dotenv").config();
const { Pool } = require("pg");
const logger = require("./logger");

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "automobile_inventory",
});

pool.on("error", (err) => {
  logger.error("Unexpected error on idle client", err);
});

// Test connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    logger.error("Database connection failed:", err);
  } else {
    logger.info("Database connected successfully");
  }
});

module.exports = pool;
