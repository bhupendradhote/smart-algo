export const calculateCCI = ({ candles, period = 20 }) => {
  const result = [];

  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      result.push({ time: candles[i].time, value: null });
      continue;
    }

    const slice = candles.slice(i - period + 1, i + 1);
    const tp = slice.map(c => (c.high + c.low + c.close) / 3);
    const sma = tp.reduce((a, b) => a + b, 0) / period;
    const meanDev =
      tp.reduce((s, v) => s + Math.abs(v - sma), 0) / period;

    const cci = (tp[tp.length - 1] - sma) / (0.015 * meanDev);
    result.push({ time: candles[i].time, value: +cci.toFixed(2) });
  }

  return result;
};
