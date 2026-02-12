/**
 * Bollinger Bands Calculator
 * candles: [{ time, close }]
 * params: { period, stdDev }
 *
 * Returns:
 * [
 *   {
 *     time,
 *     basis,
 *     upper,
 *     lower
 *   }
 * ]
 */

export default function bbCalculator(candles, params = {}) {
  const period = Number(params.period || 20);
  const stdDevMultiplier = Number(params.stdDev || 2);

  const result = [];

  if (!Array.isArray(candles) || candles.length < period) {
    return result;
  }

  const closes = candles.map(c => Number(c.close)).filter(Number.isFinite);

  for (let i = period - 1; i < closes.length; i++) {
    const slice = closes.slice(i - period + 1, i + 1);

    // --- Calculate SMA (Basis) ---
    const sum = slice.reduce((acc, val) => acc + val, 0);
    const basis = sum / period;

    // --- Calculate Standard Deviation ---
    const variance =
      slice.reduce((acc, val) => acc + Math.pow(val - basis, 2), 0) / period;

    const stdDev = Math.sqrt(variance);

    const upper = basis + stdDevMultiplier * stdDev;
    const lower = basis - stdDevMultiplier * stdDev;

    if (
      Number.isFinite(basis) &&
      Number.isFinite(upper) &&
      Number.isFinite(lower)
    ) {
      result.push({
        time: Number(candles[i].time),
        basis: Number(basis.toFixed(4)),
        upper: Number(upper.toFixed(4)),
        lower: Number(lower.toFixed(4)),
      });
    }
  }

  return result;
}
