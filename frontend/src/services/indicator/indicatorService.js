import API from "../api/axios";

/* -------------------- helper -------------------- */

const post = async (path, payload) => {
  const res = await API.post(`/indicators/${path}`, payload);
  if (!res.data?.success) return null;
  return res.data.data;
};

const cleanLine = (arr) =>
  Array.isArray(arr)
    ? arr.filter(p => typeof p?.value === "number")
    : [];

/* -------------------- Moving Averages -------------------- */

export const getSMA = async ({ candles, period }) =>
  cleanLine(await post("sma", { candles, period }));

export const getEMA = async ({ candles, period }) =>
  cleanLine(await post("ema", { candles, period }));

export const getWMA = async ({ candles, period }) =>
  cleanLine(await post("wma", { candles, period }));

export const getSMMA = async ({ candles, period }) =>
  cleanLine(await post("smma", { candles, period }));

export const getHMA = async ({ candles, period }) =>
  cleanLine(await post("hma", { candles, period }));

export const getVWAP = async ({ candles }) =>
  cleanLine(await post("vwap", { candles }));

/* -------------------- Momentum / Trend -------------------- */

export const getMACD = async ({
  candles,
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9,
}) => {
  const raw = await post("macd", {
    candles,
    fastPeriod,
    slowPeriod,
    signalPeriod,
  });

  if (!Array.isArray(raw)) return { hist: [], signal: [] };

  return {
    hist: raw
      .filter(m => typeof m.histogram === "number")
      .map(m => ({
        time: m.time,
        value: m.histogram,
        color: m.histogram >= 0 ? "#22c55e" : "#ef4444",
      })),
    signal: raw
      .filter(m => typeof m.signal === "number")
      .map(m => ({ time: m.time, value: m.signal })),
  };
};

export const getRSI = async ({ candles, period = 14 }) =>
  cleanLine(await post("rsi", { candles, period }));

export const getStochastic = async ({
  candles,
  period = 14,
  smooth = 3,
}) => {
  const raw = await post("stochastic", { candles, period, smooth });
  if (!raw) return { k: [], d: [] };

  return {
    k: cleanLine(raw.k),
    d: cleanLine(raw.d),
  };
};

export const getCCI = async ({ candles, period = 20 }) =>
  cleanLine(await post("cci", { candles, period }));

/* -------------------- Volatility -------------------- */

export const getBollinger = async ({
  candles,
  period = 20,
  stdDev = 2,
}) => {
  const raw = await post("bbands", { candles, period, stdDev });
  if (!Array.isArray(raw)) return { upper: [], middle: [], lower: [] };

  return {
    upper: raw
      .filter(b => typeof b.upper === "number")
      .map(b => ({ time: b.time, value: b.upper })),
    middle: raw
      .filter(b => typeof b.middle === "number")
      .map(b => ({ time: b.time, value: b.middle })),
    lower: raw
      .filter(b => typeof b.lower === "number")
      .map(b => ({ time: b.time, value: b.lower })),
  };
};

export const getATR = async ({ candles, period = 14 }) =>
  cleanLine(await post("atr", { candles, period }));

export const getDonchian = async ({ candles, period = 20 }) => {
  const raw = await post("donchian", { candles, period });
  if (!raw) return { upper: [], lower: [] };

  return {
    upper: cleanLine(raw.upper),
    lower: cleanLine(raw.lower),
  };
};
