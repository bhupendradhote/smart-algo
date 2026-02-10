export const calculateSMMA = ({ candles, period }) => {
  const result = [];
  let smma = 0;

  for (let i = 0; i < candles.length; i++) {
    const close = candles[i].close;

    if (i < period) {
      smma += close;
      result.push({ time: candles[i].time, value: null });
      if (i === period - 1) {
        smma /= period;
        result[i] = { time: candles[i].time, value: +smma.toFixed(4) };
      }
      continue;
    }

    smma = (smma * (period - 1) + close) / period;
    result.push({ time: candles[i].time, value: +smma.toFixed(4) });
  }

  return result;
};
