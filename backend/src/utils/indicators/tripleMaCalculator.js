/**
 * Triple Moving Average (Fast + Medium + Slow EMA)
 *
 * candles: [{ time, close }]
 * params: { fastPeriod, mediumPeriod, slowPeriod }
 *
 * Returns:
 * [
 *   {
 *     time,
 *     fast,
 *     medium,
 *     slow
 *   }
 * ]
 */

export default function tripleMaCalculator(candles, params = {}) {
  const fastPeriod = Number(params.fastPeriod || 9);
  const mediumPeriod = Number(params.mediumPeriod || 21);
  const slowPeriod = Number(params.slowPeriod || 50);

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
  const mediumEMA = calculateEMA(closes, mediumPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);

  const maxPeriod = slowPeriod;
  const fastOffset = maxPeriod - fastPeriod;
  const mediumOffset = maxPeriod - mediumPeriod;

  for (let i = 0; i < slowEMA.length; i++) {
    const fastIndex = i + fastOffset;
    const mediumIndex = i + mediumOffset;

    if (
      fastIndex < fastEMA.length &&
      mediumIndex < mediumEMA.length
    ) {
      const candleIndex = maxPeriod - 1 + i;

      if (safeCandles[candleIndex]) {
        result.push({
          time: safeCandles[candleIndex].time,
          fast: Number(fastEMA[fastIndex].toFixed(4)),
          medium: Number(mediumEMA[mediumIndex].toFixed(4)),
          slow: Number(slowEMA[i].toFixed(4)),
        });
      }
    }
  }

  return result;
}
