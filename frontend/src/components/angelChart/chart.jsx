/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
/* eslint-disable react-hooks/exhaustive-deps */
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
import IndicatorSettings from "./IndicatorSettings";
import { getIndicatorList, saveIndicatorSettings } from "../../services/indicator/indicatorsdService";

import "./chart.css"

const SYMBOL_MAP = { SBIN: "3045", RELIANCE: "2885", TCS: "11536", NIFTY: "99926000", BANKNIFTY: "99926009" };
const TIMEFRAMES = [{ label: "1m", value: "ONE_MINUTE" }, { label: "5m", value: "FIVE_MINUTE" }, { label: "15m", value: "FIFTEEN_MINUTE" }, { label: "30m", value: "THIRTY_MINUTE" }, { label: "1H", value: "ONE_HOUR" }, { label: "D", value: "ONE_DAY" }];

export default function Chart() {
  const containerRef = useRef(null);
  const chartRef = useRef(null); 
  const mainPaneRef = useRef(null); 
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);

  const [symbol, setSymbol] = useState("SBIN");
  const [interval, setInterval] = useState("ONE_DAY");
  const symbolToken = SYMBOL_MAP[symbol] || SYMBOL_MAP.SBIN;

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState(null);
  const [availableIndicators, setAvailableIndicators] = useState([]); 
  const [activeConfigs, setActiveConfigs] = useState({}); 

  const { candles, marketData, loading, error, lastUpdated, credsPresent, refresh, getIndicatorPayload } = useChartData(symbolToken, interval);

  // 1. Fetch User Configs on Mount
  useEffect(() => {
    loadIndicators();
  }, []);

  const loadIndicators = async () => {
    try {
        const list = await getIndicatorList(); 
        setAvailableIndicators(list || []);
        
        const initialConfigs = {};
        list.forEach(ind => {
            if (ind.is_active) {
                const pObj = {};
                (ind.params || []).forEach(p => { pObj[p.key] = p.value; });
                initialConfigs[ind.code] = { params: pObj };
            }
        });
        setActiveConfigs(initialConfigs);
    } catch(e) { console.error(e); }
  };

  // 2. Toggle Handler (Updates State & Saves to DB)
  const handleToggle = async (code) => {
    const ind = availableIndicators.find(i => i.code === code);
    if (!ind) return;

    const willBeActive = !activeConfigs[code];

    setActiveConfigs(prev => {
        const next = { ...prev };
        if (willBeActive) {
            const pObj = {};
            ind.params.forEach(p => { pObj[p.key] = p.value; });
            next[code] = { params: pObj };
        } else {
            delete next[code];
        }
        return next;
    });

    const pObj = {};
    ind.params.forEach(p => { pObj[p.key] = p.value; });
    await saveIndicatorSettings(code, pObj, willBeActive);
  };

  // 3. Save Settings Handler (From Modal)
  const handleSaveSettings = async (code, newParams) => {
    setAvailableIndicators(prev => prev.map(ind => {
        if (ind.code === code) {
            return {
                ...ind,
                params: ind.params.map(p => ({ ...p, value: newParams[p.key] }))
            };
        }
        return ind;
    }));

    // 2. Update activeConfigs if active
    if (activeConfigs[code]) {
        setActiveConfigs(prev => ({
            ...prev,
            [code]: { params: newParams }
        }));
    }

    // 3. Persist to DB
    const isActive = !!activeConfigs[code];
    await saveIndicatorSettings(code, newParams, isActive);
  };

  // Chart Initialization
  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      layout: { background: { type: ColorType.Solid, color: "#0f1220" }, textColor: "#d1d4dc" },
      grid: { vertLines: { color: "#20242e" }, horzLines: { color: "#20242e" } },
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: { borderColor: "#20242e", timeVisible: true, secondsVisible: false, barSpacing: 6, minBarSpacing: 2, rightOffset: 5 },
      rightPriceScale: { borderColor: "#20242e", visible: true, scaleMargins: { top: 0.1, bottom: 0.2 } },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
    });
    chartRef.current = chart;
    mainPaneRef.current = chart.panes()[0];
    candleSeriesRef.current = mainPaneRef.current.addSeries(CandlestickSeries, {
      upColor: "#06b081", downColor: "#f23645", borderVisible: false, priceScaleId: "right",
    });

    const volPane = chart.addPane();
    volPane.setStretchFactor(0.2);
    volumeSeriesRef.current = volPane.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" }, priceScaleId: "vol_scale", color: "rgba(38,166,154,0.6)", priceLineVisible: false,
    });
    try { volPane.priceScale("vol_scale").applyOptions({ scaleMargins: { top: 0, bottom: 0 }, visible: false }); } catch(e){}

    const handleResize = () => { if (containerRef.current && chartRef.current) chartRef.current.applyOptions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight }); };
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); try { chart.remove(); } catch (e) {} chartRef.current = null; };
  }, []);

  useEffect(() => {
    if (!chartRef.current || !candleSeriesRef.current || !candles.length) return;
    const candleData = candles.map((c) => ({ time: c.time, open: c.open, high: c.high, low: c.low, close: c.close }));
    const volData = candles.map((c) => ({ time: c.time, value: c.volume || 0, color: c.close >= c.open ? "rgba(8,153,129,0.4)" : "rgba(242,54,69,0.4)" }));
    try { candleSeriesRef.current.setData(candleData); volumeSeriesRef.current.setData(volData); } catch (e) {}
  }, [candles]);

  // Connect Indicators with ACTIVE CONFIGS
  useIndicators({
    chartApiRef: chartRef,
    mainPaneRef,
    getIndicatorPayload,
    candles,
    activeConfigs: Object.keys(activeConfigs).map(key => ({ code: key, params: activeConfigs[key].params })), 
    enabled: true,
  });

return (
  <div className="chart-container">
    <Sidebar 
      isOpen={isSidebarOpen} 
      onClose={() => setSidebarOpen(false)}
      availableIndicators={availableIndicators}
      activeConfigs={activeConfigs}
      onToggle={handleToggle}
      onEdit={setEditingIndicator}
    />

    {editingIndicator && (
      <IndicatorSettings 
        indicator={editingIndicator} 
        onClose={() => setEditingIndicator(null)}
        onSave={handleSaveSettings}
      />
    )}

    {/* ================= TOOLBAR ================= */}
    <div className="chart-toolbar">
      <div className="chart-symbol">{symbol}</div>

      <div className="chart-btn-group">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.value}
            onClick={() => setInterval(tf.value)}
            className={`chart-tf-btn ${interval === tf.value ? "active" : ""}`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      <button
        onClick={() => setSidebarOpen(true)}
        className="chart-indicator-btn"
      >
        <span>fx</span> Indicators
      </button>

      <select
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        className="chart-select"
      >
        {Object.keys(SYMBOL_MAP).map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
        <span
          style={{
            fontSize: 12,
            color: credsPresent ? "#06b081" : "#f23645",
            display: "flex",
            alignItems: "center"
          }}
        >
          {credsPresent ? "● Connected" : "● Offline"}
        </span>

        <button
          onClick={() => refresh()}
          className="chart-select"
          style={{ background: "#2962ff", color: "white", border: "none" }}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>
    </div>

    {/* ================= CHART AREA ================= */}
    <div className="chart-area">
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {(error || (loading && !candles.length)) && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            color: "#9aa0aa",
            background: "#12141a",
            padding: 18,
            borderRadius: 8
          }}
        >
          {error || "Loading Market Data..."}
        </div>
      )}
    </div>

    {/* ================= STATUS BAR ================= */}
    <div className="chart-status">
      <div>
        Price: {marketData?.ltp ?? (candles?.length ? candles[candles.length - 1].close : "--")}
      </div>
      <div>
        Last Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : "--"}
      </div>
    </div>
  </div>
);

}