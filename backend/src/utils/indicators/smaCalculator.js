export default function smaCalculator(candles, params) {
  const period = Number(params.period || 20);
  const result = [];

  if (!Array.isArray(candles) || candles.length < period) {
    return result;
  }

  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;

    for (let j = i - period + 1; j <= i; j++) {
      sum += candles[j].close;
    }

    const value = sum / period;

    if (Number.isFinite(value)) {
      result.push({
        time: candles[i].time,
        value: Number(value.toFixed(2)),
      });
    }
  }

  return result;
}
