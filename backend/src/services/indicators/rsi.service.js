// backend/src/services/indicators/rsi.service.js
export const calculateRSI = ({ candles, period = 14 }) => {
  if (!Array.isArray(candles)) throw new Error("Candles must be an array");
  if (!period || period <= 0) throw new Error("Invalid period");

  const result = [];
  let gains = 0;
  let losses = 0;

  for (let i = 0; i < candles.length; i++) {
    if (i === 0) {
      result.push({ time: candles[i].time, value: null });
      continue;
    }
    const change = candles[i].close - candles[i - 1].close;
    const gain = Math.max(change, 0);
    const loss = Math.max(-change, 0);

    if (i <= period) {
      gains += gain;
      losses += loss;
      if (i < period) {
        result.push({ time: candles[i].time, value: null });
        continue;
      } else {
        // i === period
        let avgGain = gains / period;
        let avgLoss = losses / period;
        const rs = avgLoss === 0 ? (avgGain === 0 ? 0 : Infinity) : avgGain / avgLoss;
        const rsi = avgLoss === 0 && avgGain === 0 ? 50 : 100 - 100 / (1 + rs);
        result.push({ time: candles[i].time, value: +rsi.toFixed(4), _avgGain: avgGain, _avgLoss: avgLoss });
        continue;
      }
    } else {
      // Wilder smoothing
      const prev = result[result.length - 1];
      let prevAvgGain = prev._avgGain ?? 0;
      let prevAvgLoss = prev._avgLoss ?? 0;
      const avgGain = (prevAvgGain * (period - 1) + gain) / period;
      const avgLoss = (prevAvgLoss * (period - 1) + loss) / period;
      const rs = avgLoss === 0 ? (avgGain === 0 ? 0 : Infinity) : avgGain / avgLoss;
      const rsi = avgLoss === 0 && avgGain === 0 ? 50 : 100 - 100 / (1 + rs);
      result.push({ time: candles[i].time, value: +rsi.toFixed(4), _avgGain: avgGain, _avgLoss: avgLoss });
    }
  }

  // strip internal fields
  return result.map(r => ({ time: r.time, value: r.value }));
};
