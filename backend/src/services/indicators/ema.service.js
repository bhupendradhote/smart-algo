// backend/src/services/indicators/ema.service.js
import { calculateSMA } from "./sma.service.js";

export const calculateEMA = ({ candles, period }) => {
  if (!Array.isArray(candles)) throw new Error("Candles must be an array");
  if (!period || period <= 0) throw new Error("Invalid period");

  // Use SMA of first 'period' values as initial EMA
  const result = [];
  const k = 2 / (period + 1);
  let prevEma = null;

  for (let i = 0; i < candles.length; i++) {
    const close = candles[i].close;
    if (i < period - 1) {
      result.push({ time: candles[i].time, value: null });
      continue;
    }
    if (i === period - 1) {
      // initial EMA = SMA of first period
      const slice = candles.slice(0, period);
      const sma = slice.reduce((s, c) => s + c.close, 0) / period;
      prevEma = sma;
      result.push({ time: candles[i].time, value: +prevEma.toFixed(4) });
      continue;
    }
    const ema = (close - prevEma) * k + prevEma;
    prevEma = ema;
    result.push({ time: candles[i].time, value: +ema.toFixed(4) });
  }

  return result;
};
