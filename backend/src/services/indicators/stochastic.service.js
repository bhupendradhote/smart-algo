export const calculateStochastic = ({ candles, period = 14, smooth = 3 }) => {
  const k = [];
  const d = [];

  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      k.push({ time: candles[i].time, value: null });
      d.push({ time: candles[i].time, value: null });
      continue;
    }

    const slice = candles.slice(i - period + 1, i + 1);
    const high = Math.max(...slice.map(c => c.high));
    const low = Math.min(...slice.map(c => c.low));
    const value = ((candles[i].close - low) / (high - low)) * 100;

    k.push({ time: candles[i].time, value: +value.toFixed(2) });

    if (k.length < smooth) {
      d.push({ time: candles[i].time, value: null });
    } else {
      const avg =
        k.slice(-smooth).reduce((s, x) => s + (x.value ?? 0), 0) / smooth;
      d.push({ time: candles[i].time, value: +avg.toFixed(2) });
    }
  }

  return { k, d };
};
