// src/utils/indicators/macdCalculator.js
import emaCalculator from "./emaCalculator.js";

/**
 * New macdCalculator returns array of objects:
 * [{ time, macd, signal, hist }, ...]
 *
 * macd = ema(fast) - ema(slow)
 * signal = ema(macd, signalPeriod)
 * hist = macd - signal
 */
export default function macdCalculator(candles, params = {}) {
  const fast = Number(params.fastPeriod || params.fast || 12);
  const slow = Number(params.slowPeriod || params.slow || 26);
  const signal = Number(params.signalPeriod || params.signal || 9);

  if (!Array.isArray(candles) || candles.length < slow) return [];

  // compute ema arrays: emaCalculator returns [{time, value}, ...] where value is EMA
  const emaFast = emaCalculator(candles, { period: fast });
  const emaSlow = emaCalculator(candles, { period: slow });

  const emaFastMap = new Map(emaFast.map((e) => [Number(e.time), e.value]));
  const emaSlowMap = new Map(emaSlow.map((e) => [Number(e.time), e.value]));

  // Build macd line (time -> macd value)
  const macdLine = [];
  for (const [time, fastVal] of emaFastMap.entries()) {
    if (emaSlowMap.has(time)) {
      const macdVal = fastVal - emaSlowMap.get(time);
      macdLine.push({ time: Number(time), macd: macdVal });
    }
  }

  // compute signal line as EMA over macd values
  // prepare fake candles for emaCalculator: { time, close: macd }
  const fakeCandles = macdLine.map((m) => ({ time: m.time, close: m.macd }));
  const signalLine = emaCalculator(fakeCandles, { period: signal }); // returns {time, value}

  const signalMap = new Map(signalLine.map((s) => [Number(s.time), s.value]));

  // Final output: list of { time, macd, signal, hist }
  return macdLine.map((m) => {
    const sig = signalMap.get(m.time) ?? 0;
    const hist = m.macd - sig;
    return {
      time: Number(m.time),
      macd: Number(m.macd),
      signal: Number(sig),
      hist: Number(Number(hist).toFixed(8)), // keep precision
    };
  });
}
