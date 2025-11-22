require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const http = require("http");
const socketIo = require("socket.io");
const logger = require("./utils/logger");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/inventory", require("./routes/inventory"));
app.use("/api/invoices", require("./routes/invoices"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/customers", require("./routes/customers"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/users", require("./routes/users"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// WebSocket connection handling
io.on("connection", (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Join room for real-time updates
  socket.on("join-inventory", (userId) => {
    socket.join(`inventory-${userId}`);
    logger.info(`User ${userId} joined inventory room`);
  });

  // Listen for inventory updates from client
  socket.on("inventory-update", (data) => {
    // Broadcast to all connected clients in the user's room
    io.to(`inventory-${data.userId}`).emit("inventory-updated", data);
  });

  // Listen for invoice updates
  socket.on("invoice-update", (data) => {
    io.to(`inventory-${data.userId}`).emit("invoice-updated", data);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });

  socket.on("error", (error) => {
    logger.error(`Socket error for ${socket.id}: ${error}`);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = { app, io };
