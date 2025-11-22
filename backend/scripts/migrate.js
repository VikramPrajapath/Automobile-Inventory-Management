require("dotenv").config();
const pool = require("../config/database");
const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

const runMigrations = async () => {
  const client = await pool.connect();
  try {
    logger.info("Starting database migrations...");

    // Read schema file
    const schemaPath = path.join(__dirname, "..", "database", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Execute schema
    await client.query(schema);

    logger.info("Database migrations completed successfully");
  } catch (error) {
    logger.error("Migration failed:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

runMigrations();
