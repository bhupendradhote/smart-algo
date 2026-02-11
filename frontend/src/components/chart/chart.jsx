/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import { 
  createChart, 
  ColorType, 
  CrosshairMode, 
  CandlestickSeries, 
  HistogramSeries 
} from "lightweight-charts";
import useChartData from "./useChartData";
import useIndicators from "./useIndicators";

// Styles for a professional TradingView-like look
const styles = {
  container: { position: 'relative', display: 'flex', flexDirection: 'column', height: '100vh', background: '#131722', color: '#d1d4dc', fontFamily: "-apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif" },
  toolbar: { display: 'flex', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #2a2e39', background: '#131722', gap: '16px', zIndex: 10 },
  symbol: { fontWeight: '700', fontSize: '18px', color: '#fff', marginRight: '10px' },
  select: { background: '#1e222d', color: '#d1d4dc', border: '1px solid #363a45', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
  btnGroup: { display: 'flex', background: '#1e222d', borderRadius: '4px', overflow: 'hidden', border: '1px solid #363a45' },
  tfBtn: (active) => ({ 
    background: active ? '#2962ff' : 'transparent', 
    color: active ? '#fff' : '#d1d4dc', 
    border: 'none', padding: '6px 12px', fontSize: '13px', cursor: 'pointer', transition: '0.2s' 
  }),
  chartArea: { flex: 1, position: 'relative', overflow: 'hidden' },
  status: { padding: '4px 12px', fontSize: '11px', background: '#131722', borderTop: '1px solid #2a2e39', color: '#787b86', display: 'flex', justifyContent: 'space-between' }
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
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);

  const [symbol, setSymbol] = useState("SBIN");
  const [interval, setInterval] = useState("ONE_DAY");
  const symbolToken = SYMBOL_MAP[symbol] || SYMBOL_MAP.SBIN;

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

  // --- 1. Initialize Chart ---
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#131722" },
        textColor: "#d1d4dc",
      },
      grid: {
        vertLines: { color: "#2a2e39" },
        horzLines: { color: "#2a2e39" },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { 
        borderColor: "#2a2e39", 
        visible: true,
        // IMPORTANT: Reserve space at bottom for date axis, but we will adjust margins dynamically in useIndicators
        scaleMargins: {
          top: 0.05,
          bottom: 0.05, 
        }
      },
      timeScale: { 
        borderColor: "#2a2e39", 
        timeVisible: true, 
        secondsVisible: false 
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    });

    // Candles
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#089981",       
      downColor: "#f23645",     
      borderVisible: false,
      wickUpColor: "#089981",
      wickDownColor: "#f23645",
      priceScaleId: 'right', // Main Scale
    });

    // Volume (Pinned to Bottom)
    // We give it a separate scaleId to avoid messing with price, but same visual margins
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: "#26a69a",
      priceFormat: { type: "volume" },
      priceScaleId: "volume_scale", // Custom Scale
    });

    // Configure Volume Scale: Fixed to bottom 15%
    chart.priceScale('volume_scale').applyOptions({
      scaleMargins: {
        top: 0.85, 
        bottom: 0,
      },
      visible: false, // Hide the axis numbers for volume to keep it clean
    });

    chartInstanceRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    // Resize Handler
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight 
        });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // --- 2. Update Data ---
  useEffect(() => {
    if (!chartInstanceRef.current || !candles) return;

    const candleData = candles.map(c => ({
      time: c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close
    }));

    const volumeData = candles.map(c => ({
      time: c.time,
      value: c.volume,
      color: c.close >= c.open ? "rgba(8, 153, 129, 0.4)" : "rgba(242, 54, 69, 0.4)",
    }));

    candleSeriesRef.current?.setData(candleData);
    volumeSeriesRef.current?.setData(volumeData);
    
  }, [candles]);

  // --- 3. Indicators Hook (Manages Panes) ---
  useIndicators({
    chartRef: chartInstanceRef,
    getIndicatorPayload,
    candles,
    enabled: true,
  });

  return (
    <div style={styles.container}>
      {/* Toolbar */}
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

        <select 
          value={symbol} 
          onChange={(e) => setSymbol(e.target.value)}
          style={styles.select}
        >
          {Object.keys(SYMBOL_MAP).map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: credsPresent ? '#089981' : '#f23645' }}>
            {credsPresent ? "● Connected" : "● Offline"}
          </span>
          <button 
            onClick={() => refresh()} 
            style={{ ...styles.select, background: '#2962ff', color: 'white', border: 'none' }}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div style={styles.chartArea}>
        <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
        
        {(error || (loading && candles.length === 0)) && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            color: '#787b86', background: '#1e222d', padding: '20px', borderRadius: '8px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)', textAlign: 'center'
          }}>
            {error ? error : "Loading Market Data..."}
          </div>
        )}
      </div>

      <div style={styles.status}>
        <div>Price: {marketData?.ltp || candles[candles.length - 1]?.close || "--"}</div>
        <div>Last Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : "--"}</div>
      </div>
    </div>
  );
}