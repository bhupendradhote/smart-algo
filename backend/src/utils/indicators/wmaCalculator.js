/**
 * WMA (Weighted Moving Average)
 * candles: [{ time, close }]
 * params: { period }
 *
 * Returns:
 * [
 *   {
 *     time,
 *     value
 *   }
 * ]
 */

export default function wmaCalculator(candles, params = {}) {
  const period = Number(params.period || 20);
  const result = [];

  if (!Array.isArray(candles) || candles.length < period) {
    return result;
  }

  const safeCandles = candles.map(c => ({
    time: Number(c.time),
    close: Number(c.close),
  })).filter(c => Number.isFinite(c.close));

  if (safeCandles.length < period) return result;

  // Pre-calc weight sum: 1+2+...+period
  const weightSum = (period * (period + 1)) / 2;

  for (let i = period - 1; i < safeCandles.length; i++) {
    let weightedSum = 0;
    let weight = 1;

    for (let j = i - period + 1; j <= i; j++) {
      weightedSum += safeCandles[j].close * weight;
      weight++;
    }

    const wma = weightedSum / weightSum;

    if (Number.isFinite(wma)) {
      result.push({
        time: safeCandles[i].time,
        value: Number(wma.toFixed(4)),
      });
    }
  }

  return result;
}
