/**
 * SMMA (Smoothed Moving Average)
 * Also known as RMA (Wilder's MA)
 *
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

export default function smmaCalculator(candles, params = {}) {
  const period = Number(params.period || 14);
  const result = [];

  if (!Array.isArray(candles) || candles.length < period) {
    return result;
  }

  const safeCandles = candles.map(c => ({
    time: Number(c.time),
    close: Number(c.close),
  })).filter(c => Number.isFinite(c.close));

  if (safeCandles.length < period) return result;

  // ---- Step 1: Initial SMA ----
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += safeCandles[i].close;
  }

  let prevSmma = sum / period;

  result.push({
    time: safeCandles[period - 1].time,
    value: Number(prevSmma.toFixed(4)),
  });

  // ---- Step 2: Wilder smoothing ----
  for (let i = period; i < safeCandles.length; i++) {
    const currentClose = safeCandles[i].close;

    const smma =
      ((prevSmma * (period - 1)) + currentClose) / period;

    if (Number.isFinite(smma)) {
      result.push({
        time: safeCandles[i].time,
        value: Number(smma.toFixed(4)),
      });

      prevSmma = smma;
    }
  }

  return result;
}
