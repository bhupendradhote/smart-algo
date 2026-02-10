// backend/src/services/indicators/sma.service.js
export const calculateSMA = ({ candles, period }) => {
  if (!Array.isArray(candles)) throw new Error("Candles must be an array");
  if (!period || period <= 0) throw new Error("Invalid period");

  const result = [];
  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      result.push({ time: candles[i].time, value: null });
      continue;
    }
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += candles[j].close;
    }
    result.push({
      time: candles[i].time,
      value: +(sum / period).toFixed(4),
    });
  }
  return result;
};
