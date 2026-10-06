import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import main from "./routes/main.js";
import { errorHandler, notFoundHandler } from "./http/middlewares/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
global.__appBaseDir = __dirname;

const app = express();

// Allowed origins for CORS
const allowedOrigins = [
  process.env.APP_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:8007",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during dev
      }
    },
    credentials: true,
  })
);

app.use(
  logger("dev", {
    skip: function (req, res) {
      return res.statusCode === 404 && req.url.includes("/socket.io/");
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// API Ping
app.get("/ping", function (req, res) {
  res.status(200).json({ success: true, message: "Blog API is live!" });
});

// Register all API routes
main.run(app);

// 404 Handler for unmatched routes
app.use(notFoundHandler);

// Centralized error handling middleware
app.use(errorHandler);

export default app;
