import dotenv from "dotenv";
import "dotenv/config";
dotenv.config();

import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketIO } from "socket.io";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/users/user.routes.js";
import angelRoutes from "./routes/angel/angel.routes.js";
import angelWsRoutes from "./routes/angel/angel.ws.routes.js";

import indicatorRoutes from "./routes/indicators/indicators.routes.js";


const app = express();

/* -------------------- Middlewares -------------------- */
app.use(cors());
app.use(express.json());

/* -------------------- Routes -------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/angel", angelRoutes);
app.use("/api/indicators", indicatorRoutes);
app.use("/api/angel", angelWsRoutes);


/* -------------------- Health Check -------------------- */
app.get("/", (req, res) => {
  res.send("Smart Algo Backend Running 🚀");
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
    origin: "*", // tighten in production
    methods: ["GET", "POST"]
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
