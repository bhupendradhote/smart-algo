/**
 * ATR (Average True Range) Calculator
 * candles: [{ time, high, low, close }]
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

export default function atrCalculator(candles, params = {}) {
  const period = Number(params.period || 14);
  const result = [];

  if (!Array.isArray(candles) || candles.length < period + 1) {
    return result;
  }

  // Ensure numeric safety
  const safeCandles = candles.map(c => ({
    time: Number(c.time),
    high: Number(c.high),
    low: Number(c.low),
    close: Number(c.close),
  })).filter(c =>
    Number.isFinite(c.high) &&
    Number.isFinite(c.low) &&
    Number.isFinite(c.close)
  );

  if (safeCandles.length < period + 1) return result;

  const trueRanges = [];

  for (let i = 1; i < safeCandles.length; i++) {
    const current = safeCandles[i];
    const previous = safeCandles[i - 1];

    const tr = Math.max(
      current.high - current.low,
      Math.abs(current.high - previous.close),
      Math.abs(current.low - previous.close)
    );

    trueRanges.push(tr);
  }

  // --- Step 1: Initial ATR (SMA of first period TRs) ---
  let sumTR = 0;
  for (let i = 0; i < period; i++) {
    sumTR += trueRanges[i];
  }

  let prevATR = sumTR / period;

  result.push({
    time: safeCandles[period].time,
    value: Number(prevATR.toFixed(4)),
  });

  // --- Step 2: Wilder Smoothing ---
  for (let i = period; i < trueRanges.length; i++) {
    const atr = ((prevATR * (period - 1)) + trueRanges[i]) / period;

    if (Number.isFinite(atr)) {
      result.push({
        time: safeCandles[i + 1].time,
        value: Number(atr.toFixed(4)),
      });
      prevATR = atr;
    }
  }

  return result;
}
