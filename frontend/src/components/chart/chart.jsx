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


const styles = {
  container: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    background: "#0f1220",
    color: "#d1d4dc",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    padding: "10px 16px",
    borderBottom: "1px solid #20242e",
    background: "#0f1220",
    gap: "12px",
    zIndex: 10,
  },
  symbol: { fontWeight: 700, fontSize: 18, color: "#fff", marginRight: 10 },
  select: {
    background: "#161923",
    color: "#d1d4dc",
    border: "1px solid #2b313a",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
  },
  btnGroup: {
    display: "flex",
    background: "#161923",
    borderRadius: 6,
    overflow: "hidden",
    border: "1px solid #2b313a",
  },
  tfBtn: (active) => ({
    background: active ? "#2962ff" : "transparent",
    color: active ? "#fff" : "#c9cdd4",
    border: "none",
    padding: "6px 12px",
    fontSize: 13,
    cursor: "pointer",
    transition: "0.12s",
  }),
  chartArea: { flex: 1, position: "relative", overflow: "hidden" },
  status: {
    padding: "6px 12px",
    fontSize: 12,
    background: "#0f1220",
    borderTop: "1px solid #20242e",
    color: "#9aa0aa",
    display: "flex",
    justifyContent: "space-between",
  },
  indicatorBtn: {
    background: "transparent",
    border: "1px solid #2962ff",
    color: "#2962ff",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
};

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
    <div style={styles.container}>
      {/* Sidebar Component */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        availableIndicators={availableIndicators}
        activeIndicators={activeIndicators}
        onToggle={toggleIndicator}
      />

      <div style={styles.toolbar}>
        <div style={styles.symbol}>{symbol}</div>

        <div style={styles.btnGroup}>
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setInterval(tf.value)}
              style={styles.tfBtn(interval === tf.value)}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* --- INDICATORS BUTTON --- */}
        <button
          onClick={() => setSidebarOpen(true)}
          style={styles.indicatorBtn}
        >
          <span>fx</span> Indicators
        </button>

        <select
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          style={styles.select}
        >
          {Object.keys(SYMBOL_MAP).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: credsPresent ? "#06b081" : "#f23645",
            }}
          >
            {credsPresent ? "● Connected" : "● Offline"}
          </span>
          <button
            onClick={() => refresh()}
            style={{
              ...styles.select,
              background: "#2962ff",
              color: "white",
              border: "none",
            }}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      <div style={styles.chartArea}>
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

        {(error || (loading && (!candles || candles.length === 0))) && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              color: "#9aa0aa",
              background: "#12141a",
              padding: 18,
              borderRadius: 8,
              boxShadow: "0 6px 18px rgba(0,0,0,0.5)",
              textAlign: "center",
            }}
          >
            {error || "Loading Market Data..."}
          </div>
        )}
      </div>

      <div style={styles.status}>
        <div>
          Price:{" "}
          {marketData?.ltp ??
            (candles?.length ? candles[candles.length - 1].close : "--")}
        </div>
        <div>
          Last Updated:{" "}
          {lastUpdated ? lastUpdated.toLocaleTimeString() : "--"}
        </div>
      </div>
    </div>
  );
}