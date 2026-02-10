// backend/src/controllers/indicators/indicators.js
import { calculateEMA } from "../../services/indicators/ema.service.js";
import { calculateWMA } from "../../services/indicators/wma.service.js";
import { calculateMACD } from "../../services/indicators/macd.service.js";
import { calculateRSI } from "../../services/indicators/rsi.service.js";
import { calculateBollingerBands } from "../../services/indicators/bollinger.service.js";
import { calculateATR } from "../../services/indicators/atr.service.js";

const sendError = (res, err) => res.status(500).json({ success: false, message: err.message });

export const getEMA = async (req, res) => {
  try {
    const { candles, period } = req.body;
    if (!candles || !period) return res.status(400).json({ success: false, message: "candles and period are required" });
    const data = calculateEMA({ candles, period });
    return res.json({ success: true, data });
  } catch (err) { return sendError(res, err); }
};

export const getWMA = async (req, res) => {
  try {
    const { candles, period } = req.body;
    if (!candles || !period) return res.status(400).json({ success: false, message: "candles and period are required" });
    const data = calculateWMA({ candles, period });
    return res.json({ success: true, data });
  } catch (err) { return sendError(res, err); }
};

export const getMACD = async (req, res) => {
  try {
    const { candles, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9 } = req.body;
    if (!candles) return res.status(400).json({ success: false, message: "candles are required" });
    const data = calculateMACD({ candles, fastPeriod, slowPeriod, signalPeriod });
    return res.json({ success: true, data });
  } catch (err) { return sendError(res, err); }
};

export const getRSI = async (req, res) => {
  try {
    const { candles, period = 14 } = req.body;
    if (!candles) return res.status(400).json({ success: false, message: "candles are required" });
    const data = calculateRSI({ candles, period });
    return res.json({ success: true, data });
  } catch (err) { return sendError(res, err); }
};

export const getBBands = async (req, res) => {
  try {
    const { candles, period = 20, stdDev = 2 } = req.body;
    if (!candles) return res.status(400).json({ success: false, message: "candles are required" });
    const data = calculateBollingerBands({ candles, period, stdDev });
    return res.json({ success: true, data });
  } catch (err) { return sendError(res, err); }
};

export const getATR = async (req, res) => {
  try {
    const { candles, period = 14 } = req.body;
    if (!candles) return res.status(400).json({ success: false, message: "candles are required" });
    const data = calculateATR({ candles, period });
    return res.json({ success: true, data });
  } catch (err) { return sendError(res, err); }
};
