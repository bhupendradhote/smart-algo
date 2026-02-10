import { calculateWMA } from "./wma.service.js";

export const calculateHMA = ({ candles, period }) => {
  const half = Math.floor(period / 2);
  const sqrt = Math.floor(Math.sqrt(period));

  const wmaHalf = calculateWMA({ candles, period: half });
  const wmaFull = calculateWMA({ candles, period });

  const diff = candles.map((c, i) => ({
    time: c.time,
    close:
      wmaHalf[i]?.value !== null && wmaFull[i]?.value !== null
        ? 2 * wmaHalf[i].value - wmaFull[i].value
        : null,
  }));

  return calculateWMA({
    candles: diff.map(d => ({ time: d.time, close: d.close })),
    period: sqrt,
  });
};
