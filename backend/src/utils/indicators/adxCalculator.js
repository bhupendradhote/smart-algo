/**
 * ADX (Average Directional Index)
 * candles: [{ time, high, low, close }]
 * params: { period }
 *
 * Returns:
 * [
 *   {
 *     time,
 *     adx,
 *     plusDI,
 *     minusDI
 *   }
 * ]
 */

export default function adxCalculator(candles, params = {}) {
  const period = Number(params.period || 14);
  const result = [];

  if (!Array.isArray(candles) || candles.length < period + 1) {
    return result;
  }

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

  const trList = [];
  const plusDMList = [];
  const minusDMList = [];

  for (let i = 1; i < safeCandles.length; i++) {
    const curr = safeCandles[i];
    const prev = safeCandles[i - 1];

    const highDiff = curr.high - prev.high;
    const lowDiff = prev.low - curr.low;

    const plusDM = (highDiff > lowDiff && highDiff > 0) ? highDiff : 0;
    const minusDM = (lowDiff > highDiff && lowDiff > 0) ? lowDiff : 0;

    const tr = Math.max(
      curr.high - curr.low,
      Math.abs(curr.high - prev.close),
      Math.abs(curr.low - prev.close)
    );

    trList.push(tr);
    plusDMList.push(plusDM);
    minusDMList.push(minusDM);
  }

  // ---- Initial smoothing ----
  let trSum = 0;
  let plusDMSum = 0;
  let minusDMSum = 0;

  for (let i = 0; i < period; i++) {
    trSum += trList[i];
    plusDMSum += plusDMList[i];
    minusDMSum += minusDMList[i];
  }

  let prevTR = trSum;
  let prevPlusDM = plusDMSum;
  let prevMinusDM = minusDMSum;

  const dxList = [];

  for (let i = period; i < trList.length; i++) {
    prevTR = prevTR - (prevTR / period) + trList[i];
    prevPlusDM = prevPlusDM - (prevPlusDM / period) + plusDMList[i];
    prevMinusDM = prevMinusDM - (prevMinusDM / period) + minusDMList[i];

    const plusDI = (prevPlusDM / prevTR) * 100;
    const minusDI = (prevMinusDM / prevTR) * 100;

    const dx =
      Math.abs(plusDI - minusDI) /
      (plusDI + minusDI) *
      100;

    dxList.push({
      time: safeCandles[i + 1].time,
      plusDI,
      minusDI,
      dx,
    });
  }

  if (dxList.length < period) return result;

  // ---- Initial ADX ----
  let adxSum = 0;
  for (let i = 0; i < period; i++) {
    adxSum += dxList[i].dx;
  }

  let prevADX = adxSum / period;

  result.push({
    time: dxList[period - 1].time,
    adx: Number(prevADX.toFixed(4)),
    plusDI: Number(dxList[period - 1].plusDI.toFixed(4)),
    minusDI: Number(dxList[period - 1].minusDI.toFixed(4)),
  });

  // ---- Wilder smoothing for ADX ----
  for (let i = period; i < dxList.length; i++) {
    const adx = ((prevADX * (period - 1)) + dxList[i].dx) / period;

    result.push({
      time: dxList[i].time,
      adx: Number(adx.toFixed(4)),
      plusDI: Number(dxList[i].plusDI.toFixed(4)),
      minusDI: Number(dxList[i].minusDI.toFixed(4)),
    });

    prevADX = adx;
  }

  return result;
}
