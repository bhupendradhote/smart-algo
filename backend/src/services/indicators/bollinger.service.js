// backend/src/services/indicators/bollinger.service.js
import { calculateSMA } from "./sma.service.js";

export const calculateBollingerBands = ({ candles, period = 20, stdDev = 2 }) => {
  if (!Array.isArray(candles)) throw new Error("Candles must be an array");
  if (!period || period <= 0) throw new Error("Invalid period");
  if (!stdDev || stdDev <= 0) throw new Error("Invalid stdDev");

  const result = [];
  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      result.push({ time: candles[i].time, middle: null, upper: null, lower: null });
      continue;
    }
    const slice = candles.slice(i - period + 1, i + 1);
    const mean = slice.reduce((s, c) => s + c.close, 0) / period;
    const variance = slice.reduce((s, c) => s + Math.pow(c.close - mean, 2), 0) / period;
    const sd = Math.sqrt(variance);
    const upper = mean + stdDev * sd;
    const lower = mean - stdDev * sd;
    result.push({
      time: candles[i].time,
      middle: +mean.toFixed(4),
      upper: +upper.toFixed(4),
      lower: +lower.toFixed(4),
    });
  }
  return result;
};
