// backend/src/services/indicators/ema.service.js

export const calculateEMA = ({ candles, period }) => {
  if (!Array.isArray(candles)) {
    throw new Error("Candles must be an array");
  }
  if (!Number.isInteger(period) || period <= 0) {
    throw new Error("Invalid period");
  }

  const result = [];
  const multiplier = 2 / (period + 1);

  let ema = 0;
  let sum = 0;

  for (let i = 0; i < candles.length; i++) {
    const close = candles[i].close;

    // Build initial SMA manually (not calling SMA)
    if (i < period) {
      sum += close;
      result.push({ time: candles[i].time, value: null });

      if (i === period - 1) {
        ema = sum / period;
        result[i] = {
          time: candles[i].time,
          value: +ema.toFixed(4),
        };
      }
      continue;
    }

    ema = (close - ema) * multiplier + ema;

    result.push({
      time: candles[i].time,
      value: +ema.toFixed(4),
    });
  }

  return result;
};
