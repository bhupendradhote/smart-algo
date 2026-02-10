/* eslint-disable no-unused-vars */
// frontend/src/hooks/useIndicators.js
import { useEffect, useRef, useState } from "react";
import {
  getSMA,
  getEMA,
  getWMA,
  getMACD,
  getRSI,
  getBollinger,
  getATR,
} from "../services/indicator/indicatorService";

/**
 * useIndicators
 *
 * - inputs:
 *    - priceOnlyCandles: [{time, close}, ...]   // for SMA/EMA/WMA/MACD/RSI/BB (BB uses close too)
 *    - fullCandles: [{time, open, high, low, close}, ...] // for ATR (needs high/low)
 *    - config: { showSMA, smaPeriod, showEMA, emaPeriod, showWMA, wmaPeriod, showMACD, macdFast, macdSlow, macdSignal, showRSI, rsiPeriod, showBB, bbPeriod, bbStdDev, showATR, atrPeriod }
 *
 * - returns:
 *    - { data: { sma, ema, wma, macd, rsi, bbands, atr }, loading, error }
 *
 * Notes:
 *  - The hook uses a request token to ignore stale results.
 *  - Results are sanitized: only numeric values are returned to avoid lightweight-charts assertion errors.
 *  - Calls run in parallel where possible.
 */

const isNumber = (v) => typeof v === "number" && Number.isFinite(v);

const sanitizeLine = (arr) =>
  Array.isArray(arr)
    ? arr
        .filter((p) => p && isNumber(p.value))
        .map((p) => ({ time: p.time, value: p.value }))
    : [];

const sanitizeMACDSignal = (arr) =>
  Array.isArray(arr)
    ? arr
        .filter((p) => p && isNumber(p.signal))
        .map((p) => ({ time: p.time, value: p.signal }))
    : [];

const sanitizeMACDHist = (arr) =>
  Array.isArray(arr)
    ? arr
        .filter((p) => p && isNumber(p.histogram))
        .map((p) => ({ time: p.time, value: p.histogram, color: p.histogram >= 0 ? "#22c55e" : "#ef4444" }))
    : [];

export default function useIndicators(priceOnlyCandles, fullCandles, config) {
  const requestId = useRef(0);
  const cacheRef = useRef({ key: null, result: null });

  const [state, setState] = useState({
    loading: false,
    error: null,
    data: {
      sma: [],
      ema: [],
      wma: [],
      macd: { hist: [], signal: [] },
      rsi: [],
      bbands: { middle: [], upper: [], lower: [] },
      atr: [],
    },
  });

  // Build a simple key to decide whether inputs changed
  const buildKey = () => {
    try {
      // keep it small: length + last timestamps + config JSON
      const times = (priceOnlyCandles?.length ? priceOnlyCandles[priceOnlyCandles.length - 1]?.time : 0);
      const len = priceOnlyCandles?.length || 0;
      return `${len}:${times}:${JSON.stringify(config)}`;
    } catch (e) {
      return JSON.stringify({ len: priceOnlyCandles?.length || 0, cfg: config });
    }
  };

  useEffect(() => {
    const key = buildKey();

    // If cached and same key, reuse
    if (cacheRef.current.key === key && cacheRef.current.result) {
      setState((s) => ({ ...s, data: cacheRef.current.result }));
      return;
    }

    // Nothing to do if no candles
    if (!Array.isArray(priceOnlyCandles) || priceOnlyCandles.length === 0) {
      setState((s) => ({
        ...s,
        loading: false,
        data: {
          sma: [],
          ema: [],
          wma: [],
          macd: { hist: [], signal: [] },
          rsi: [],
          bbands: { middle: [], upper: [], lower: [] },
          atr: [],
        },
      }));
      return;
    }

    const currentRequest = ++requestId.current;
    setState((s) => ({ ...s, loading: true, error: null }));

    // prepare payloads
    const payloadMA = priceOnlyCandles; // {time, close}
    const payloadFull = fullCandles; // includes high/low

    // Build promises conditionally
    const promises = [];

    if (config.showSMA) {
      promises.push(
        getSMA({ candles: payloadMA, period: Number(config.smaPeriod) || 20 })
          .then((r) => ({ type: "sma", data: r }))
          .catch((err) => ({ type: "sma", err }))
      );
    } else {
      promises.push(Promise.resolve({ type: "sma", data: [] }));
    }

    if (config.showEMA) {
      promises.push(
        getEMA({ candles: payloadMA, period: Number(config.emaPeriod) || 20 })
          .then((r) => ({ type: "ema", data: r }))
          .catch((err) => ({ type: "ema", err }))
      );
    } else {
      promises.push(Promise.resolve({ type: "ema", data: [] }));
    }

    if (config.showWMA) {
      promises.push(
        getWMA({ candles: payloadMA, period: Number(config.wmaPeriod) || 20 })
          .then((r) => ({ type: "wma", data: r }))
          .catch((err) => ({ type: "wma", err }))
      );
    } else {
      promises.push(Promise.resolve({ type: "wma", data: [] }));
    }

    if (config.showMACD) {
      promises.push(
        getMACD({
          candles: payloadMA,
          fastPeriod: Number(config.macdFast) || 12,
          slowPeriod: Number(config.macdSlow) || 26,
          signalPeriod: Number(config.macdSignal) || 9,
        })
          .then((r) => ({ type: "macd", data: r }))
          .catch((err) => ({ type: "macd", err }))
      );
    } else {
      promises.push(Promise.resolve({ type: "macd", data: [] }));
    }

    if (config.showRSI) {
      promises.push(
        getRSI({ candles: payloadMA, period: Number(config.rsiPeriod) || 14 })
          .then((r) => ({ type: "rsi", data: r }))
          .catch((err) => ({ type: "rsi", err }))
      );
    } else {
      promises.push(Promise.resolve({ type: "rsi", data: [] }));
    }

    if (config.showBB) {
      promises.push(
        getBollinger({
          candles: payloadMA,
          period: Number(config.bbPeriod) || 20,
          stdDev: Number(config.bbStdDev) || 2,
        })
          .then((r) => ({ type: "bb", data: r }))
          .catch((err) => ({ type: "bb", err }))
      );
    } else {
      promises.push(Promise.resolve({ type: "bb", data: [] }));
    }

    if (config.showATR) {
      // ATR needs high/low
      if (!Array.isArray(payloadFull) || payloadFull.length === 0) {
        // can't calculate ATR without high/low -> resolve empty
        promises.push(Promise.resolve({ type: "atr", data: [] }));
      } else {
        promises.push(
          getATR({
            candles: payloadFull,
            period: Number(config.atrPeriod) || 14,
          })
            .then((r) => ({ type: "atr", data: r }))
            .catch((err) => ({ type: "atr", err }))
        );
      }
    } else {
      promises.push(Promise.resolve({ type: "atr", data: [] }));
    }

    // Execute all requests in parallel (promises array keeps order but results include type)
    Promise.all(promises)
      .then((results) => {
        // If a new request started meanwhile, ignore this result
        if (currentRequest !== requestId.current) return;

        const out = {
          sma: [],
          ema: [],
          wma: [],
          macd: { hist: [], signal: [] },
          rsi: [],
          bbands: { middle: [], upper: [], lower: [] },
          atr: [],
        };

        for (const res of results) {
          const { type, data, err } = res;
          if (err) {
            // log specific indicator error but keep others
            console.error(`Indicator ${type} error:`, err);
            continue;
          }
          if (type === "sma") {
            out.sma = sanitizeLine(data);
          } else if (type === "ema") {
            out.ema = sanitizeLine(data);
          } else if (type === "wma") {
            out.wma = sanitizeLine(data);
          } else if (type === "macd") {
            // macd returns array of {time, macd, signal, histogram}
            out.macd.hist = sanitizeMACDHist(data);
            out.macd.signal = sanitizeMACDSignal(data);
          } else if (type === "rsi") {
            out.rsi = sanitizeLine(data);
          } else if (type === "bb") {
            // data: [{time, middle, upper, lower}]
            if (Array.isArray(data)) {
              out.bbands.middle = data.filter((b) => b && isNumber(b.middle)).map((b) => ({ time: b.time, value: b.middle }));
              out.bbands.upper = data.filter((b) => b && isNumber(b.upper)).map((b) => ({ time: b.time, value: b.upper }));
              out.bbands.lower = data.filter((b) => b && isNumber(b.lower)).map((b) => ({ time: b.time, value: b.lower }));
            }
          } else if (type === "atr") {
            out.atr = sanitizeLine(data);
          }
        }

        // Cache and set
        cacheRef.current = { key, result: out };
        setState({ loading: false, error: null, data: out });
      })
      .catch((e) => {
        if (currentRequest !== requestId.current) return;
        console.error("Indicators parallel error:", e);
        setState({ loading: false, error: e.message || "Indicator fetch failed", data: state.data });
      });

    // cleanup function - if component unmounts we bump requestId to ignore pending responses
    return () => {
      requestId.current += 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceOnlyCandles?.length ? priceOnlyCandles[priceOnlyCandles.length - 1].time : null, JSON.stringify(config)]);

  return {
    loading: state.loading,
    error: state.error,
    data: state.data,
  };
}
