export const calculateVWAP = ({ candles }) => {
  let cumulativePV = 0;
  let cumulativeVolume = 0;

  return candles.map(c => {
    const typical = (c.high + c.low + c.close) / 3;
    cumulativePV += typical * (c.volume || 1);
    cumulativeVolume += (c.volume || 1);

    return {
      time: c.time,
      value: +(cumulativePV / cumulativeVolume).toFixed(4),
    };
  });
};
