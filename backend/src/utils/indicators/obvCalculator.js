/**
 * OBV (On-Balance Volume)
 * candles: [{ time, close, volume }]
 * params: {}
 *
 * Returns:
 * [
 *   {
 *     time,
 *     value
 *   }
 * ]
 */

export default function obvCalculator(candles) {
  const result = [];

  if (!Array.isArray(candles) || candles.length < 2) {
    return result;
  }

  const safeCandles = candles.map(c => ({
    time: Number(c.time),
    close: Number(c.close),
    volume: Number(c.volume || 0),
  })).filter(c =>
    Number.isFinite(c.close) &&
    Number.isFinite(c.volume)
  );

  if (safeCandles.length < 2) return result;

  let obv = 0;

  for (let i = 1; i < safeCandles.length; i++) {
    const current = safeCandles[i];
    const previous = safeCandles[i - 1];

    if (current.close > previous.close) {
      obv += current.volume;
    } else if (current.close < previous.close) {
      obv -= current.volume;
    }
    // if equal, OBV unchanged

    result.push({
      time: current.time,
      value: Number(obv.toFixed(4)),
    });
  }

  return result;
}
