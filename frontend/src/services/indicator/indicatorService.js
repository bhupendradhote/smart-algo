// frontend/src/services/indicator/indicatorService.js
import API from "../api/axios";

/**
 * Each function posts to the backend endpoint:
 * payload shape: { candles: [...], period, ...otherOptions }
 * Returns: backend's data field (array)
 */

const post = async (path, payload) => {
  const { data } = await API.post(`/indicators/${path}`, payload);
  return data.data;
};

export const getSMA = async ({ candles, period }) => {
  return post("sma", { candles, period });
};

export const getEMA = async ({ candles, period }) => {
  return post("ema", { candles, period });
};

export const getWMA = async ({ candles, period }) => {
  return post("wma", { candles, period });
};

export const getMACD = async ({ candles, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9 }) => {
  return post("macd", { candles, fastPeriod, slowPeriod, signalPeriod });
};

export const getRSI = async ({ candles, period = 14 }) => {
  return post("rsi", { candles, period });
};

export const getBollinger = async ({ candles, period = 20, stdDev = 2 }) => {
  return post("bbands", { candles, period, stdDev });
};

export const getATR = async ({ candles, period = 14 }) => {
  return post("atr", { candles, period });
};
