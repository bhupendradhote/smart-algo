// backend/src/routes/indicators/indicators.routes.js

import express from "express";

// SMA (existing – unchanged)
import { getSMA } from "../../controllers/indicators/sma.js";

// New indicators
import {
  getEMA,
  getWMA,
  getMACD,
  getRSI,
  getBBands,
  getATR,
} from "../../controllers/indicators/indicators.js";

const router = express.Router();

/**
 * Moving Averages
 */
router.post("/sma", getSMA);      // Simple Moving Average
router.post("/ema", getEMA);      // Exponential Moving Average
router.post("/wma", getWMA);      // Weighted Moving Average

/**
 * Momentum / Trend
 */
router.post("/macd", getMACD);    // MACD
router.post("/rsi", getRSI);      // Relative Strength Index

/**
 * Volatility
 */
router.post("/bbands", getBBands); // Bollinger Bands
router.post("/atr", getATR);       // Average True Range

export default router;
