// backend/src/routes/angel.routes.js
import express from "express";
import { connectController } from "../../controllers/angelController/connectController.js";
import {
  addBrokerAccount,
  getBrokerAccounts,
  updateBrokerStatus,
  deleteBrokerAccount,
} from "../../controllers/angelController/brokerAccountsController.js";
import {
  getHistoricalData,
  getMarketData
} from "../../controllers/angelController/historicalQuoteController.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// --- CONNECTION ---
router.post("/connect", authMiddleware, connectController);

// --- BROKER ACCOUNTS MANAGEMENT ---

// Add broker account
router.post(
  "/broker-accounts",
  authMiddleware,
  addBrokerAccount
);

// Get logged-in user's broker accounts
router.get(
  "/broker-accounts",
  authMiddleware,
  getBrokerAccounts
);

// Update broker account status
router.patch(
  "/broker-accounts/:id/status",
  authMiddleware,
  updateBrokerStatus
);

// Delete broker account
router.delete(
  "/broker-accounts/:id",
  authMiddleware,
  deleteBrokerAccount
);

// --- MARKET & HISTORICAL DATA ---

// Get Historical Candle Data
router.post(
  "/historical-data", 
  authMiddleware, 
  getHistoricalData
);

// Get Market Data (LTP / Quotes)
router.post(
  "/market-data", 
  authMiddleware, 
  getMarketData
);

export default router;