/**
 * EMA (Exponential Moving Average) Calculator
 * candles: [{ time, close }]
 * params: { period }
 */
export default function emaCalculator(candles, params) {
  const period = Number(params.period || 20);
  const result = [];

  if (!Array.isArray(candles) || candles.length < period) {
    return result;
  }

  // Multiplier
  const k = 2 / (period + 1);

  // Step 1: start EMA with SMA of first period
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }

  let prevEma = sum / period;

  result.push({
    time: candles[period - 1].time,
    value: Number(prevEma.toFixed(2)),
  });

  // Step 2: EMA calculation
  for (let i = period; i < candles.length; i++) {
    const close = candles[i].close;
    const ema = close * k + prevEma * (1 - k);

    if (Number.isFinite(ema)) {
      result.push({
        time: candles[i].time,
        value: Number(ema.toFixed(2)),
      });
      prevEma = ema;
    }
  }

  return result;
}
