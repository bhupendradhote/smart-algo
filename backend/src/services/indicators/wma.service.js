// backend/src/services/indicators/wma.service.js
export const calculateWMA = ({ candles, period }) => {
  if (!Array.isArray(candles)) throw new Error("Candles must be an array");
  if (!period || period <= 0) throw new Error("Invalid period");

  const result = [];
  const denom = (period * (period + 1)) / 2; // sum of weights

  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      result.push({ time: candles[i].time, value: null });
      continue;
    }
    let weightedSum = 0;
    for (let j = 0; j < period; j++) {
      const weight = period - j;
      weightedSum += candles[i - j].close * weight;
    }
    const wma = weightedSum / denom;
    result.push({ time: candles[i].time, value: +wma.toFixed(4) });
  }
  return result;
};
