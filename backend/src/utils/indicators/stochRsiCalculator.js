/**
 * Stochastic RSI
 * candles: [{ time, close }]
 * params: { rsiPeriod, stochPeriod, kPeriod, dPeriod }
 */

export default function stochRsiCalculator(candles, params = {}) {
  const rsiPeriod = Number(params.rsiPeriod || 14);
  const stochPeriod = Number(params.stochPeriod || 14);
  const kPeriod = Number(params.kPeriod || 3);
  const dPeriod = Number(params.dPeriod || 3);

  const result = [];

  if (!Array.isArray(candles) || candles.length < rsiPeriod + stochPeriod) {
    return result;
  }

  const closes = candles.map(c => Number(c.close)).filter(Number.isFinite);
  if (closes.length < rsiPeriod + stochPeriod) return result;

  // ---------- STEP 1: Calculate RSI ----------
  const rsiValues = [];

  let gain = 0;
  let loss = 0;

  for (let i = 1; i <= rsiPeriod; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gain += diff;
    else loss += Math.abs(diff);
  }

  let avgGain = gain / rsiPeriod;
  let avgLoss = loss / rsiPeriod;

  let rs = avgLoss === 0 ? 0 : avgGain / avgLoss;
  rsiValues.push(100 - (100 / (1 + rs)));

  for (let i = rsiPeriod + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const currentGain = diff > 0 ? diff : 0;
    const currentLoss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (rsiPeriod - 1) + currentGain) / rsiPeriod;
    avgLoss = (avgLoss * (rsiPeriod - 1) + currentLoss) / rsiPeriod;

    rs = avgLoss === 0 ? 0 : avgGain / avgLoss;
    rsiValues.push(100 - (100 / (1 + rs)));
  }

  // ---------- STEP 2: Calculate Stochastic of RSI ----------
  const stochRsi = [];

  for (let i = stochPeriod - 1; i < rsiValues.length; i++) {
    const slice = rsiValues.slice(i - stochPeriod + 1, i + 1);
    const minRsi = Math.min(...slice);
    const maxRsi = Math.max(...slice);

    const value =
      maxRsi - minRsi === 0
        ? 0
        : (rsiValues[i] - minRsi) / (maxRsi - minRsi);

    stochRsi.push(value * 100);
  }

  // ---------- STEP 3: Smooth K ----------
  const kValues = [];
  for (let i = kPeriod - 1; i < stochRsi.length; i++) {
    const slice = stochRsi.slice(i - kPeriod + 1, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / kPeriod;
    kValues.push(avg);
  }

  // ---------- STEP 4: Smooth D ----------
  for (let i = dPeriod - 1; i < kValues.length; i++) {
    const slice = kValues.slice(i - dPeriod + 1, i + 1);
    const d = slice.reduce((a, b) => a + b, 0) / dPeriod;

    const candleIndex =
      rsiPeriod + stochPeriod - 1 + i;

    if (candles[candleIndex]) {
      result.push({
        time: Number(candles[candleIndex].time),
        k: Number(kValues[i].toFixed(4)),
        d: Number(d.toFixed(4)),
      });
    }
  }

  return result;
}
