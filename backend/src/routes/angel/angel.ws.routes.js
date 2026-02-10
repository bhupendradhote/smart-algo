import express from "express";
import {
  connectWS,
  fetchData,
  disconnectWS
} from "../../controllers/angelController/websocketController.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";


const router = express.Router();

// WebSocket routes

router.post("/ws/connect", authMiddleware, connectWS);
router.post("/ws/fetch", authMiddleware, fetchData);
router.post("/ws/disconnect", authMiddleware, disconnectWS);


export default router;
