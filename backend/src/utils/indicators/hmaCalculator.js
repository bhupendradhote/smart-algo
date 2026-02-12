/**
 * HMA (Hull Moving Average)
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

export default function hmaCalculator(candles, params = {}) {
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

  const halfPeriod = Math.floor(period / 2);
  const sqrtPeriod = Math.floor(Math.sqrt(period));

  // ---- WMA helper ----
  const calculateWMA = (data, length) => {
    const values = [];
    const weightSum = (length * (length + 1)) / 2;

    for (let i = length - 1; i < data.length; i++) {
      let weightedSum = 0;
      let weight = 1;

      for (let j = i - length + 1; j <= i; j++) {
        weightedSum += data[j] * weight;
        weight++;
      }

      values.push(weightedSum / weightSum);
    }

    return values;
  };

  const closes = safeCandles.map(c => c.close);

  const wmaHalf = calculateWMA(closes, halfPeriod);
  const wmaFull = calculateWMA(closes, period);

  if (!wmaHalf.length || !wmaFull.length) return result;

  // Align indexes
  const diffSeries = [];

  const offset = period - halfPeriod;

  for (let i = 0; i < wmaFull.length; i++) {
    const halfIndex = i + offset;
    if (halfIndex < wmaHalf.length) {
      diffSeries.push(2 * wmaHalf[halfIndex] - wmaFull[i]);
    }
  }

  if (diffSeries.length < sqrtPeriod) return result;

  const hmaValues = calculateWMA(diffSeries, sqrtPeriod);

  const startIndex =
    period - 1 + (sqrtPeriod - 1);

  for (let i = 0; i < hmaValues.length; i++) {
    const candleIndex = startIndex + i;

    if (safeCandles[candleIndex]) {
      result.push({
        time: safeCandles[candleIndex].time,
        value: Number(hmaValues[i].toFixed(4)),
      });
    }
  }

  return result;
}
