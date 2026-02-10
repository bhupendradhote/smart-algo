// backend/src/services/angelServices/websocket.service.js
import { WebSocketV2 } from "smartapi-javascript";
import { io } from "../../socket.js"; // 👈 your socket.io instance

class AngelWebSocketManager {
  constructor() {
    this.connections = new Map();
  }

  async createConnection(userId, { apiKey, clientCode, feedToken, jwtToken }) {
    if (this.connections.has(userId)) {
      return this.connections.get(userId);
    }

    console.log("🚀 Creating Angel WS with:", {
      clientCode,
      hasFeedToken: !!feedToken,
      hasJwtToken: !!jwtToken,
    });

    const ws = new WebSocketV2({
      clientCode,
      feedToken,
      authToken: jwtToken,
      apiKey,
    });

    ws.on("open", () => {
      console.log(`🔌 Angel WS CONNECTED for user ${userId}`);
    });

    ws.on("message", (tick) => {
      // 🔥 THIS IS THE MAGIC
      io.to(`angel_${userId}`).emit("angel:tick", tick);

      console.log("📊 LIVE TICK:", tick);
    });

    ws.on("error", (err) => {
      console.error("❌ Angel WS ERROR:", err);
    });

    ws.on("close", () => {
      console.log(`🔌 Angel WS CLOSED for user ${userId}`);
      this.connections.delete(userId);
    });

    this.connections.set(userId, ws);
    return ws;
  }

  getConnection(userId) {
    return this.connections.get(userId);
  }

  async send(userId, jsonReq) {
    const ws = this.connections.get(userId);
    if (!ws) throw new Error("WS not connected");

    ws.send(jsonReq);
    console.log("📡 Subscription sent for user", userId, jsonReq);
  }

  async disconnect(userId) {
    const ws = this.connections.get(userId);
    if (ws) {
      ws.close();
      this.connections.delete(userId);
    }
  }
}

export default new AngelWebSocketManager();
