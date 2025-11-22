require("dotenv").config();
const pool = require("../config/database");
const bcryptjs = require("bcryptjs");
const logger = require("../utils/logger");

const seedDatabase = async () => {
  const client = await pool.connect();
  try {
    logger.info("Starting database seeding...");
    await client.query("BEGIN");

    // Seed users
    const hashedPassword = await bcryptjs.hash("password123", 10);

    const userResult = await client.query(
      `INSERT INTO users (email, password, name, role) VALUES 
       ($1, $2, $3, $4),
       ($5, $6, $7, $8),
       ($9, $10, $11, $12)
       RETURNING id`,
      [
        "admin@example.com",
        hashedPassword,
        "Admin User",
        "admin",
        "manager@example.com",
        hashedPassword,
        "Manager User",
        "manager",
        "employee@example.com",
        hashedPassword,
        "Employee User",
        "employee",
      ]
    );

    const adminId = userResult.rows[0].id;

    // Seed parts
    const partsData = [
      [
        "Engine Block",
        "EB-001",
        "Toyota",
        5000,
        10,
        5,
        "Engine",
        "Supplier A",
        "High quality aluminum block",
        2,
        adminId,
      ],
      [
        "Transmission Assembly",
        "TA-002",
        "Suzuki",
        15000,
        5,
        3,
        "Transmission",
        "Supplier B",
        "Automatic transmission",
        1,
        adminId,
      ],
      [
        "Alternator",
        "ALT-003",
        "Maruti",
        3000,
        15,
        10,
        "Electrical",
        "Supplier C",
        "120A alternator",
        3,
        adminId,
      ],
      [
        "Brake Pads (Set)",
        "BP-004",
        "Hyundai",
        800,
        20,
        25,
        "Brakes",
        "Supplier A",
        "Semi-metallic pads",
        5,
        adminId,
      ],
      [
        "Air Filter",
        "AF-005",
        "Tata",
        200,
        25,
        50,
        "Air Intake",
        "Supplier D",
        "High efficiency filter",
        10,
        adminId,
      ],
    ];

    for (const part of partsData) {
      await client.query(
        `INSERT INTO parts (part_name, part_number, brand, cost, discount, quantity, category, supplier, features, min_stock_level, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        part
      );
    }

    await client.query("COMMIT");
    logger.info("Database seeding completed successfully");
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error("Seeding failed:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

seedDatabase();
