// backend/src/socket.js
import { Server } from "socket.io";

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*", // adjust later for production
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    const { userId } = socket.handshake.query;

    if (userId) {
      socket.join(`angel_${userId}`);
      console.log(`👤 User ${userId} joined room angel_${userId}`);
    }

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  return io;
};

export { io };
