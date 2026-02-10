// backend/src/services/indicators/macd.service.js
import { calculateEMA } from "./ema.service.js";

export const calculateMACD = ({ candles, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9 }) => {
  if (!Array.isArray(candles)) throw new Error("Candles must be an array");
  if (!fastPeriod || !slowPeriod || fastPeriod <= 0 || slowPeriod <= 0) throw new Error("Invalid MACD periods");

  // compute EMA fast and slow
  const fast = calculateEMA({ candles, period: fastPeriod });
  const slow = calculateEMA({ candles, period: slowPeriod });

  const macdLine = [];
  for (let i = 0; i < candles.length; i++) {
    const time = candles[i].time;
    const fastVal = fast[i]?.value ?? null;
    const slowVal = slow[i]?.value ?? null;
    const macd = (fastVal !== null && slowVal !== null) ? +(fastVal - slowVal).toFixed(6) : null;
    macdLine.push({ time, macd });
  }

  // build array of macd numbers (skip nulls for signal calc)
  const macdValuesForSignal = macdLine.map(m => ({ time: m.time, value: m.macd }));
  const signalArray = calculateEMA({ candles: macdValuesForSignal.map(m => ({ time: m.time, close: m.value ?? 0 })), period: signalPeriod });

  // assemble result with macd, signal, histogram
  const result = macdLine.map((m, idx) => {
    const signalVal = signalArray[idx]?.value ?? null;
    const histogram = (m.macd !== null && signalVal !== null) ? +(m.macd - signalVal).toFixed(6) : null;
    return {
      time: m.time,
      macd: m.macd,
      signal: signalVal,
      histogram,
    };
  });

  return result;
};
