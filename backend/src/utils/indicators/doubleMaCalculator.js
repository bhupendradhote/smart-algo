/**
 * Double Moving Average (Fast + Slow EMA)
 *
 * candles: [{ time, close }]
 * params: { fastPeriod, slowPeriod }
 *
 * Returns:
 * [
 *   {
 *     time,
 *     fast,
 *     slow
 *   }
 * ]
 */

export default function doubleMaCalculator(candles, params = {}) {
  const fastPeriod = Number(params.fastPeriod || 9);
  const slowPeriod = Number(params.slowPeriod || 21);

  const result = [];

  if (!Array.isArray(candles) || candles.length < slowPeriod) {
    return result;
  }

  const safeCandles = candles.map(c => ({
    time: Number(c.time),
    close: Number(c.close),
  })).filter(c => Number.isFinite(c.close));

  if (safeCandles.length < slowPeriod) return result;

  const calculateEMA = (data, period) => {
    const k = 2 / (period + 1);
    const values = [];

    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += data[i];
    }

    let prevEma = sum / period;
    values.push(prevEma);

    for (let i = period; i < data.length; i++) {
      const ema = data[i] * k + prevEma * (1 - k);
      values.push(ema);
      prevEma = ema;
    }

    return values;
  };

  const closes = safeCandles.map(c => c.close);

  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);

  const offset = slowPeriod - fastPeriod;

  for (let i = 0; i < slowEMA.length; i++) {
    const fastIndex = i + offset;

    if (fastIndex < fastEMA.length) {
      const candleIndex = slowPeriod - 1 + i;

      if (safeCandles[candleIndex]) {
        result.push({
          time: safeCandles[candleIndex].time,
          fast: Number(fastEMA[fastIndex].toFixed(4)),
          slow: Number(slowEMA[i].toFixed(4)),
        });
      }
    }
  }

  return result;
}
