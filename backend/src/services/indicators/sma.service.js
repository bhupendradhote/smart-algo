// backend/src/services/indicators/sma.service.js

export const calculateSMA = ({ candles, period }) => {
  if (!Array.isArray(candles)) {
    throw new Error("Candles must be an array");
  }
  if (!Number.isInteger(period) || period <= 0) {
    throw new Error("Invalid period");
  }

  const result = [];
  let sum = 0;

  for (let i = 0; i < candles.length; i++) {
    const close = candles[i].close;

    sum += close;

    if (i >= period) {
      sum -= candles[i - period].close;
    }

    if (i < period - 1) {
      result.push({ time: candles[i].time, value: null });
    } else {
      result.push({
        time: candles[i].time,
        value: +(sum / period).toFixed(4),
      });
    }
  }

  return result;
};
