export const calculateDonchian = ({ candles, period = 20 }) => {
  const upper = [];
  const lower = [];

  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      upper.push({ time: candles[i].time, value: null });
      lower.push({ time: candles[i].time, value: null });
      continue;
    }

    const slice = candles.slice(i - period + 1, i + 1);
    upper.push({
      time: candles[i].time,
      value: Math.max(...slice.map(c => c.high)),
    });
    lower.push({
      time: candles[i].time,
      value: Math.min(...slice.map(c => c.low)),
    });
  }

  return { upper, lower };
};
