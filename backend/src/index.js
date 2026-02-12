// backend/src/index.js

import dotenv from "dotenv";
import "dotenv/config";
dotenv.config();

import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketIO } from "socket.io";
import session from "express-session"; 
import MySQLStoreFactory from "express-mysql-session"; // ✨ ADDED: MySQL Sessions
import rateLimit from "express-rate-limit"; // ✨ ADDED: Rate Limiting

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/users/user.routes.js";
import angelRoutes from "./routes/angel/angel.routes.js";
import angelWsRoutes from "./routes/angel/angel.ws.routes.js";
import indicatordRoutes from "./routes/indicators/indicatordRoutes.js";

const app = express();

/* -------------------- Security & Proxy -------------------- */
// ✨ CRITICAL FOR PRODUCTION: Tells Express to trust secure cookies if behind a proxy/load balancer (like Nginx, Render, AWS)
app.set('trust proxy', 1);

/* -------------------- CORS Configuration -------------------- */
const allowedOrigins = [
  "http://localhost:5173", 
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL // ✨ Pulls your live startup domain from .env
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy violation'), false);
    }
    return callback(null, true);
  },
  credentials: true 
}));

/* -------------------- Rate Limiting -------------------- */
// ✨ Prevents brute-force attacks and API spamming
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  message: { success: false, message: "Too many requests, please try again later." }
});

const tradingLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Stricter limit for Angel API routes to prevent getting banned by Angel One
  message: { success: false, message: "Trading API rate limit exceeded." }
});

app.use("/api/", globalLimiter);
app.use("/api/angel", tradingLimiter);

/* -------------------- Body Parsers -------------------- */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

/* -------------------- MySQL Session Store -------------------- */
const MySQLStore = MySQLStoreFactory(session);

const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  clearExpired: true, // Automatically removes expired sessions from the database
  checkExpirationInterval: 15 * 60 * 1000, // Check every 15 minutes
  expiration: 24 * 60 * 60 * 1000 // Sessions last 24 hours
});

app.use(session({
  key: 'smart_algo_session', // Name of the cookie
  secret: process.env.SESSION_SECRET || "smart-algo-super-secret-key",
  store: sessionStore, // ✨ Saves sessions to your MySQL DB instead of memory!
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production", // True in production (requires HTTPS)
    httpOnly: true, 
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax' // 'none' required for cross-domain HTTPS
  }
}));

/* -------------------- Routes -------------------- */
app.use("/api/indicators", indicatordRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/angel", angelRoutes);
app.use("/api/angel", angelWsRoutes);

/* -------------------- Health Check -------------------- */
app.get("/", (req, res) => {
  res.send("Smart Algo Backend Running Securely 🚀");
});

/* -------------------- HTTP + SOCKET -------------------- */
const PORT = process.env.PORT || 5000;

console.log("🚀 Starting backend...");
await connectDB();
console.log("🎯 Database connected");

const server = http.createServer(app);

/* ---- Socket.IO Setup ---- */
export const io = new SocketIO(server, {
  cors: {
    origin: allowedOrigins, 
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("join", ({ userId }) => {
    if (!userId) return;
    socket.join(`angel_${userId}`);
    console.log(`👤 User ${userId} joined room angel_${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

/* -------------------- START -------------------- */
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});