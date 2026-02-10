// backend/src/controllers/angelController/websocketController.js
import wsManager from "../../services/angelServices/websocket.service.js";


// CONNECT ANGEL WEBSOCKET
export const connectWS = async (req, res) => {
  try {
    // 🔐 User from auth middleware
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized (user not found)",
      });
    }

console.log("🔥 RAW BODY =", req.body, "HEADERS =", req.headers["content-type"]);

    const { apiKey, jwtToken, feedToken, clientCode } = req.body || {};

    if (
      typeof apiKey !== "string" ||
      typeof jwtToken !== "string" ||
      typeof feedToken !== "string" ||
      typeof clientCode !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "apiKey, clientCode, jwtToken and feedToken are required",
      });
    }

    await wsManager.createConnection(userId, {
      apiKey,
      jwtToken,
      feedToken,
      clientCode,
    });

    console.log(`🔌 Angel WS CONNECTED for user ${userId}`);

    return res.status(200).json({
      success: true,
      message: "WebSocket connected",
    });
  } catch (err) {
    console.error("❌ connectWS error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to connect WebSocket",
    });
  }
};

// SUBSCRIBE / FETCH DATA
export const fetchData = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    console.log("🔎 WS FETCH req.body =", req.body);

    const { jsonReq } = req.body || {};

    if (!jsonReq || typeof jsonReq !== "object") {
      return res.status(400).json({
        success: false,
        message: "jsonReq object is required",
      });
    }

    const conn = wsManager.getConnection(userId);

    if (!conn) {
      return res.status(400).json({
        success: false,
        message: "WebSocket not connected. Call /ws/connect first.",
      });
    }

    await conn.fetchData(jsonReq);

    console.log(`📡 Subscription sent for user ${userId}`, jsonReq);

    return res.status(200).json({
      success: true,
      message: "Subscription request sent",
    });
  } catch (err) {
    console.error("❌ fetchData error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch data",
    });
  }
};

// DISCONNECT WEBSOCKET
export const disconnectWS = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await wsManager.disconnect(userId);

    console.log(`🔌 Angel WS DISCONNECTED for user ${userId}`);

    return res.status(200).json({
      success: true,
      message: "Disconnected",
    });
  } catch (err) {
    console.error("❌ disconnectWS error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to disconnect",
    });
  }
};
