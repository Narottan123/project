#!/usr/bin/env node

/**
 * MERN Blog Application - Server Entry Point
 */
import dotenv from "dotenv";
dotenv.config();
import app from "../app.js";
import debug from "debug";
import http from "http";
import mongoose from "mongoose";
import notificationIo from "../socket/notification.js";
import { seedDatabase } from "../http/utils/seedData.js";

/**
 * Normalize and bind port
 */
const port = normalizePort(process.env.PORT || "8007");
app.set("port", port);

/**
 * Connect to MongoDB
 */
const mongoUri =
  process.env.DATABASE_URI || "mongodb://127.0.0.1:27017/blog_system_db";

mongoose
  .connect(mongoUri)
  .then(async () => {
    console.log(`[Database] MongoDB successfully connected to ${mongoUri}`);
    // Run initial seed if needed (creates Admin and Regular users with demo posts)
    await seedDatabase();
  })
  .catch((err) => {
    console.error("[Database] MongoDB connection error:", err.message);
  });

/**
 * Create HTTP server and initialize Socket.io
 */
const server = http.createServer(app);

// Attach Socket.io to server
notificationIo.io.attach(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.set("nIO", notificationIo.io);

/**
 * Listen on provided port
 */
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}

function onError(error) {
  if (error.syscall !== "listen") throw error;
  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(
        `\n[ERROR] ${bind} is already in use!\n` +
          `Another instance is already running on port ${port}.\n`
      );
      process.exit(1);
      break;
    default:
      console.error("Server listen error:", error);
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  console.log(`🚀 Blog Backend Server running on ${bind}`);
  debug("Listening on " + bind);
}

export default server;
