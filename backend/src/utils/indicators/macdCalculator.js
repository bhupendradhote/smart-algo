import emaCalculator from "./emaCalculator.js";

export default function macdCalculator(candles, params) {
  const fast = Number(params.fastPeriod || 12);
  const slow = Number(params.slowPeriod || 26);
  const signal = Number(params.signalPeriod || 9);

  if (candles.length < slow) return [];

  const emaFast = emaCalculator(candles, { period: fast });
  const emaSlow = emaCalculator(candles, { period: slow });

  const emaFastMap = new Map(emaFast.map(e => [e.time, e.value]));
  const emaSlowMap = new Map(emaSlow.map(e => [e.time, e.value]));

  const macdLine = [];

  for (const [time, fastVal] of emaFastMap.entries()) {
    if (emaSlowMap.has(time)) {
      macdLine.push({
        time,
        value: fastVal - emaSlowMap.get(time),
      });
    }
  }

  const signalLine = emaCalculator(
    macdLine.map(m => ({ time: m.time, close: m.value })),
    { period: signal }
  );

  const signalMap = new Map(signalLine.map(s => [s.time, s.value]));

  return macdLine.map(m => ({
    time: m.time,
    value: Number((m.value - (signalMap.get(m.time) || 0)).toFixed(2)),
  }));
}
