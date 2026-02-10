// frontend/src/services/angelServices/angelWebsocketClient.js
import API from "../api/axios";
import { io } from "socket.io-client";

let socket = null;

export const startBackendWS = async ({ apiKey, jwtToken, feedToken, clientCode }) => {
  const body = { apiKey, jwtToken, feedToken, clientCode };
  const res = await API.post("/angel/ws/connect", body);
  return res.data;
};

export const subscribeTokens = async (jsonReq) => {
  const res = await API.post("/angel/ws/fetch", { jsonReq });
  return res.data;
};

export const stopBackendWS = async () => {
  const res = await API.post("/angel/ws/disconnect");
  return res.data;
};

export const initSocketClient = (userId, onTickCb) => {
  if (socket) socket.disconnect();

  socket = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000");

  socket.on("connect", () => {
    console.log("🔌 socket connected:", socket.id);
    socket.emit("join", { userId }); // ✅ REQUIRED
  });

  socket.on("angel:tick", (tick) => {
    console.log("📊 LIVE TICK:", tick);
    if (typeof onTickCb === "function") onTickCb(tick);
  });

  socket.on("disconnect", () => {
    console.log("❌ socket disconnected");
  });

  return socket;
};
