/**
 * VWMA (Volume Weighted Moving Average)
 *
 * candles: [{ time, close, volume }]
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

export default function vwmaCalculator(candles, params = {}) {
  const period = Number(params.period || 20);
  const result = [];

  if (!Array.isArray(candles) || candles.length < period) {
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

  if (safeCandles.length < period) return result;

  for (let i = period - 1; i < safeCandles.length; i++) {
    let priceVolumeSum = 0;
    let volumeSum = 0;

    for (let j = i - period + 1; j <= i; j++) {
      priceVolumeSum +=
        safeCandles[j].close * safeCandles[j].volume;

      volumeSum += safeCandles[j].volume;
    }

    const vwma =
      volumeSum === 0
        ? 0
        : priceVolumeSum / volumeSum;

    if (Number.isFinite(vwma)) {
      result.push({
        time: safeCandles[i].time,
        value: Number(vwma.toFixed(4)),
      });
    }
  }

  return result;
}
