import express from "express";

import {
  // Moving averages
  getSMA,
  getEMA,
  getWMA,
  getSMMA,
  getHMA,
  getVWAP,

  // Momentum / Trend
  getMACD,
  getRSI,
  getStochastic,
  getCCI,

  // Volatility
  getBBands,
  getATR,
  getDonchian,
} from "../../controllers/indicators/indicators.js";

const router = express.Router();

/* ================= Moving Averages ================= */

router.post("/sma", getSMA);
router.post("/ema", getEMA);
router.post("/wma", getWMA);
router.post("/smma", getSMMA);
router.post("/hma", getHMA);
router.post("/vwap", getVWAP);

/* ================= Momentum / Trend ================= */

router.post("/macd", getMACD);
router.post("/rsi", getRSI);
router.post("/stochastic", getStochastic);
router.post("/cci", getCCI);

/* ================= Volatility ================= */

router.post("/bbands", getBBands);
router.post("/atr", getATR);
router.post("/donchian", getDonchian);

export default router;
