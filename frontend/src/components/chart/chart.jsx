/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  CrosshairMode,
  CandlestickSeries,
  HistogramSeries,
} from "lightweight-charts";
import useChartData from "./useChartData";
import useIndicators from "./useIndicators";
import Sidebar from "./Sidebar"; 
import { getIndicatorList } from "../../services/indicator/indicatorsdService";
import "./chart.css";

const SYMBOL_MAP = {
  SBIN: "3045",
  RELIANCE: "2885",
  TCS: "11536",
  NIFTY: "99926000",
  BANKNIFTY: "99926009",
};

const TIMEFRAMES = [
  { label: "1m", value: "ONE_MINUTE" },
  { label: "5m", value: "FIVE_MINUTE" },
  { label: "15m", value: "FIFTEEN_MINUTE" },
  { label: "30m", value: "THIRTY_MINUTE" },
  { label: "1H", value: "ONE_HOUR" },
  { label: "D", value: "ONE_DAY" },
];

export default function Chart() {
  const containerRef = useRef(null);
  const chartRef = useRef(null); // ChartApi
  const mainPaneRef = useRef(null); // IPaneApi for main price pane
  const candleSeriesRef = useRef(null);
  const volumePaneRef = useRef(null);
  const volumeSeriesRef = useRef(null);

  const [symbol, setSymbol] = useState("SBIN");
  const [interval, setInterval] = useState("ONE_DAY");
  const symbolToken = SYMBOL_MAP[symbol] || SYMBOL_MAP.SBIN;

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [availableIndicators, setAvailableIndicators] = useState([]);
  const [activeIndicators, setActiveIndicators] = useState([]); // List of codes e.g. ['SMA', 'RSI']

  const {
    candles,
    marketData,
    loading,
    error,
    lastUpdated,
    credsPresent,
    refresh,
    getIndicatorPayload,
  } = useChartData(symbolToken, interval);

  // 1. Fetch available indicators on mount
  useEffect(() => {
    const fetchList = async () => {
      try {
        const list = await getIndicatorList();
        setAvailableIndicators(list || []);
      } catch (e) {
        console.error("Failed to load indicator list", e);
      }
    };
    fetchList();
  }, []);

  // 2. Toggle Handler for Sidebar
  const toggleIndicator = (code) => {
    setActiveIndicators((prev) => {
      if (prev.includes(code)) return prev.filter((c) => c !== code); // Remove
      return [...prev, code]; // Add
    });
  };

  // 3. Initialize Chart
  useEffect(() => {
    if (!containerRef.current) return;

    // create chart
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0f1220" },
        textColor: "#d1d4dc",
      },
      grid: {
        vertLines: { color: "#20242e" },
        horzLines: { color: "#20242e" },
      },
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: {
        borderColor: "#20242e",
        timeVisible: true,
        secondsVisible: false,
        barSpacing: 12, // Default width of candles
        minBarSpacing: 2,
        rightOffset: 5,
      },
      rightPriceScale: {
        borderColor: "#20242e",
        visible: true,
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      localization: {
        priceFormatter: (p) => {
          if (!Number.isFinite(p)) return "";
          if (Math.abs(p) < 1) return p.toFixed(5);
          if (Math.abs(p) < 10) return p.toFixed(3);
          return p.toFixed(2);
        },
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
    });

    chartRef.current = chart;

    // Get main pane
    const panes = chart.panes();
    mainPaneRef.current = panes[0];

    // Add candle series
    const candleSeries = mainPaneRef.current.addSeries(CandlestickSeries, {
      upColor: "#06b081",
      downColor: "#f23645",
      wickUpColor: "#06b081",
      wickDownColor: "#f23645",
      borderVisible: false,
      priceScaleId: "right",
    });
    candleSeriesRef.current = candleSeries;

    // Add volume pane
    const volPane = chart.addPane();
    volPane.setStretchFactor(0.2);
    volumePaneRef.current = volPane;

    const volSeries = volPane.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "vol_scale",
      color: "rgba(38,166,154,0.6)",
      priceLineVisible: false,
    });

    try {
      volPane.priceScale("vol_scale").applyOptions({
        scaleMargins: { top: 0, bottom: 0 },
        visible: false,
      });
    } catch (e) {
      console.warn(e);
    }

    volumeSeriesRef.current = volSeries;

    // Responsive resize
    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      try {
        chart.remove();
      } catch (e) {
        // ignore
      }
      chartRef.current = null;
    };
  }, []);

  // 4. Feed Candles + Volume
  useEffect(() => {
    if (!chartRef.current || !candleSeriesRef.current || !Array.isArray(candles))
      return;

    const candleData = candles.map((c) => ({
      time: c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    const volData = candles.map((c) => ({
      time: c.time,
      value: c.volume || 0,
      color: c.close >= c.open ? "rgba(8,153,129,0.4)" : "rgba(242,54,69,0.4)",
    }));

    try {
      candleSeriesRef.current.setData(candleData);
      volumeSeriesRef.current.setData(volData);
    } catch (e) {
      console.error("setData error:", e);
    }
  }, [candles]);

  // 5. Connect Indicators Hook (Passing activeIndicators)
  useIndicators({
    chartApiRef: chartRef,
    mainPaneRef,
    getIndicatorPayload,
    candles,
    activeIndicators, 
    enabled: true,
    opts: { debug: false },
  });

 return (
  <div className="chart-container">
    {/* Sidebar */}
    <Sidebar
      isOpen={isSidebarOpen}
      onClose={() => setSidebarOpen(false)}
      availableIndicators={availableIndicators}
      activeIndicators={activeIndicators}
      onToggle={toggleIndicator}
    />

    {/* Toolbar */}
    <div className="chart-toolbar">
      <div className="chart-symbol">{symbol}</div>

      <div className="chart-btn-group">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.value}
            onClick={() => setInterval(tf.value)}
            className={`chart-tf-btn ${
              interval === tf.value ? "active" : ""
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Indicators Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="chart-indicator-btn"
      >
        fx Indicators
      </button>

      <select
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        className="chart-select"
      >
        {Object.keys(SYMBOL_MAP).map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
        <span
          className={
            credsPresent ? "status-connected" : "status-offline"
          }
        >
          {credsPresent ? "● Connected" : "● Offline"}
        </span>

        <button
          onClick={() => refresh()}
          className="chart-indicator-btn"
          style={{ background: "#2962ff", color: "#fff" }}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>
    </div>

    {/* Chart Area */}
    <div className="chart-area">
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {(error || (loading && (!candles || candles.length === 0))) && (
        <div className="chart-loading-overlay">
          {error || "Loading Market Data..."}
        </div>
      )}
    </div>

    {/* Status Bar */}
    <div className="chart-status">
      <div>
        Price:{" "}
        {marketData?.ltp ??
          (candles?.length
            ? candles[candles.length - 1].close
            : "--")}
      </div>
      <div>
        Last Updated:{" "}
        {lastUpdated
          ? lastUpdated.toLocaleTimeString()
          : "--"}
      </div>
    </div>
  </div>
);

}