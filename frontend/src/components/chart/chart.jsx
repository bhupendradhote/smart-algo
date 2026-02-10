/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
// frontend/src/components/angel-chart/Chart.jsx
import React, { useEffect, useRef, useState } from "react";
import { createChart, ColorType, CandlestickSeries } from "lightweight-charts";
import useChartData from "./useChartData";
import useIndicators from "./useIndicators";
import "./Chart.css";

const SYMBOL_MAP = {
  SBIN: "3045",
  RELIANCE: "2885",
  TCS: "11536",
  NIFTY: "99926000",
  BANKNIFTY: "99926009",
};

export default function Chart() {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);

  const [symbol, setSymbol] = useState("SBIN");
  const [interval, setInterval] = useState("ONE_DAY");
  const symbolToken = SYMBOL_MAP[symbol] || SYMBOL_MAP.SBIN;

  const { candles, marketData, loading, error, lastUpdated, credsPresent, refresh } = useChartData(symbolToken, interval);

  // init chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#071124" },
        textColor: "#c7d2e0",
      },
      grid: {
        vertLines: { color: "#081020" },
        horzLines: { color: "#081020" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 520,
      timeScale: { timeVisible: true, secondsVisible: false, borderColor: "#0b1220" },
      rightPriceScale: { visible: true }, 
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#16a34a",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#16a34a",
      wickDownColor: "#ef4444",
      priceScaleId: "right", 
    });

    chartRef.current = chart;
    candleSeriesRef.current = series;

    const handleResize = () => {
      try {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      } catch (e) {}
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      try {
        chart.remove();
      } catch (e) {}
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    const safe = Array.isArray(candles)
      ? candles.map((c) => ({ ...c, time: typeof c.time === "string" ? Number(c.time) : c.time }))
      : [];
    try {
      candleSeriesRef.current?.setData(safe);
      chartRef.current?.timeScale().fitContent();
    } catch (e) {
      // ignore
    }
  }, [candles]);

  useIndicators({
    chartRef,
    candles,
    enabled: true,
  });

  const onRefresh = () => refresh();

  return (
    <div className="chart-page">
      <div className="chart-card">
        <div className="chart-header">
          <div className="title-row">
            <h3 className="chart-title">📈 Market Chart</h3>
            <div className="live-badge">{credsPresent ? "Live" : "Disconnected"}</div>
          </div>

          <div className="chart-controls">
            <select className="chart-select" value={symbol} onChange={(e) => setSymbol(e.target.value)}>
              <option value="SBIN">SBIN</option>
              <option value="RELIANCE">RELIANCE</option>
              <option value="TCS">TCS</option>
              <option value="NIFTY">NIFTY 50</option>
              <option value="BANKNIFTY">BANKNIFTY</option>
            </select>

            <select className="chart-select" value={interval} onChange={(e) => setInterval(e.target.value)}>
              <option value="ONE_MINUTE">1 Minute</option>
              <option value="THREE_MINUTE">3 Minute</option>
              <option value="FIVE_MINUTE">5 Minute</option>
              <option value="TEN_MINUTE">10 Minute</option>
              <option value="FIFTEEN_MINUTE">15 Minute</option>
              <option value="THIRTY_MINUTE">30 Minute</option>
              <option value="ONE_HOUR">1 Hour</option>
              <option value="ONE_DAY">1 Day</option>
            </select>

            <button className="chart-btn" onClick={onRefresh} disabled={loading}>
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>

        <div className="meta-row">
          <div className="meta-info">{loading ? "Loading data…" : error ? error : lastUpdated ? `Updated ${new Date(lastUpdated).toLocaleString()}` : "No data"}</div>
          <div className="meta-price">{marketData?.ltp ? `LTP ₹${marketData.ltp}` : candles?.length ? `Last: ₹${candles[candles.length - 1].close}` : "—"}</div>
        </div>

        <div className="chart-wrap">
          <div ref={chartContainerRef} className="chart-container" />

          {!credsPresent && !loading && (
            <div className="chart-overlay">
              <div className="overlay-card">
                <div className="overlay-title">Connect account to load real data</div>
                <div className="overlay-desc">No demo data — connect Angel account to fetch historical candles & LTP.</div>
              </div>
            </div>
          )}

          {!error && !loading && candles?.length === 0 && credsPresent && (
            <div className="chart-overlay">
              <div className="overlay-card">
                <div className="overlay-title">No data for selected symbol/timeframe</div>
                <div className="overlay-desc">Try changing timeframe, symbol or refresh.</div>
                <button onClick={onRefresh} className="small-btn">
                  Try Again
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="error-box">
              <div style={{ fontWeight: 700 }}>Error</div>
              <div style={{ color: "#ffdede", marginTop: 6 }}>{error}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
