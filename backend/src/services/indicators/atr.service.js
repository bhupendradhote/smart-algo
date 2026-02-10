// backend/src/services/indicators/atr.service.js
export const calculateATR = ({ candles, period = 14 }) => {
  if (!Array.isArray(candles)) throw new Error("Candles must be an array");
  if (!period || period <= 0) throw new Error("Invalid period");

  const result = [];
  const trValues = [];

  for (let i = 0; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = i > 0 ? candles[i - 1].close : null;

    if (high == null || low == null) {
      result.push({ time: candles[i].time, value: null });
      continue;
    }

    const trCandidates = [
      high - low,
    ];
    if (prevClose != null) {
      trCandidates.push(Math.abs(high - prevClose));
      trCandidates.push(Math.abs(low - prevClose));
    }
    const tr = Math.max(...trCandidates);
    trValues.push(tr);

    if (i < period) {
      result.push({ time: candles[i].time, value: null });
      continue;
    }
    if (i === period) {
      // initial ATR = average TR of first 'period' values (trValues indices 1..period)
      const initialTRSlice = trValues.slice(1, period + 1); // since trValues started at i=0 (first TR maybe 0)
      const initialATR = initialTRSlice.reduce((s, v) => s + v, 0) / period;
      result.push({ time: candles[i].time, value: +initialATR.toFixed(4), _atr: initialATR });
    } else {
      // Wilder smoothing
      const prev = result[result.length - 1];
      const prevAtr = prev?._atr ?? prev?.value ?? 0;
      const atr = (prevAtr * (period - 1) + tr) / period;
      result.push({ time: candles[i].time, value: +atr.toFixed(4), _atr: atr });
    }
  }

  // strip internal fields
  return result.map(r => ({ time: r.time, value: r.value }));
};
