// frontend/src/hooks/useAngelChart.js
import { useEffect, useRef, useCallback, useState } from "react";
import { createChart, ColorType, CandlestickSeries, LineSeries, HistogramSeries } from "lightweight-charts";
import { getHistoricalData, getMarketData } from "../services/angelServices/historicalQuoteService";
import { getSMA, getEMA, getWMA, getMACD, getRSI, getBollinger, getATR } from "../services/indicator/indicatorService";

export default function useAngelChart(options) {
  const {
    creds = { apiKey: "", jwtToken: "" },
    symbolToken = "3045",
    interval = "ONE_DAY",
    indicators = {},
    intervalMaxDays = {},
  } = options;

  // refs for DOM containers
  const chartContainerRef = useRef(null);
  const chartInstance = useRef(null);
  const seriesInstance = useRef(null);

  const smaSeriesRef = useRef(null);
  const emaSeriesRef = useRef(null);
  const wmaSeriesRef = useRef(null);

  // sub-charts & series refs
  const macdContainerRef = useRef(null);
  const macdChartRef = useRef(null);
  const macdHistRef = useRef(null);
  const macdSignalRef = useRef(null);

  const rsiContainerRef = useRef(null);
  const rsiChartRef = useRef(null);
  const rsiSeriesRef = useRef(null);

  const atrContainerRef = useRef(null);
  const atrChartRef = useRef(null);
  const atrSeriesRef = useRef(null);

  // state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [marketData, setMarketData] = useState(null);

  const sanitizeLineData = (arr) =>
    Array.isArray(arr) ? arr.filter((p) => p && typeof p.value === "number") : [];

  // initialize charts once
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0f172a" },
        textColor: "#94a3b8",
      },
      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 450,
      timeScale: { timeVisible: true, secondsVisible: false, borderColor: "#334155" },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    const smaSeries = chart.addSeries(LineSeries, { color: "#facc15", lineWidth: 2 });
    const emaSeries = chart.addSeries(LineSeries, { color: "#60a5fa", lineWidth: 2 });
    const wmaSeries = chart.addSeries(LineSeries, { color: "#a78bfa", lineWidth: 2 });

    seriesInstance.current = series;
    smaSeriesRef.current = smaSeries;
    emaSeriesRef.current = emaSeries;
    wmaSeriesRef.current = wmaSeries;
    chartInstance.current = chart;

    // MACD
    if (macdContainerRef.current) {
      const macdChart = createChart(macdContainerRef.current, {
        layout: { background: { type: ColorType.Solid, color: "#071124" }, textColor: "#94a3b8" },
        width: macdContainerRef.current.clientWidth,
        height: 140,
        timeScale: { visible: false, borderColor: "#334155" },
      });
      const hist = macdChart.addSeries(HistogramSeries, { priceFormat: { type: "volume" }, priceScaleId: "right", scaleMargins: { top: 0.7, bottom: 0 } });
      const sig = macdChart.addSeries(LineSeries, { color: "#f97316", lineWidth: 2 });
      macdChartRef.current = macdChart;
      macdHistRef.current = hist;
      macdSignalRef.current = sig;
    }

    // RSI
    if (rsiContainerRef.current) {
      const rsiChart = createChart(rsiContainerRef.current, {
        layout: { background: { type: ColorType.Solid, color: "#071124" }, textColor: "#94a3b8" },
        width: rsiContainerRef.current.clientWidth,
        height: 120,
        timeScale: { visible: false, borderColor: "#334155" },
      });
      const rsiSeries = rsiChart.addSeries(LineSeries, { color: "#10b981", lineWidth: 2 });
      rsiChartRef.current = rsiChart;
      rsiSeriesRef.current = rsiSeries;
    }

    // ATR
    if (atrContainerRef.current) {
      const atrChart = createChart(atrContainerRef.current, {
        layout: { background: { type: ColorType.Solid, color: "#071124" }, textColor: "#94a3b8" },
        width: atrContainerRef.current.clientWidth,
        height: 100,
        timeScale: { visible: false, borderColor: "#334155" },
      });
      const atrSeries = atrChart.addSeries(LineSeries, { color: "#ef4444", lineWidth: 2 });
      atrChartRef.current = atrChart;
      atrSeriesRef.current = atrSeries;
    }

    const handleResize = () => {
      if (chartContainerRef.current && chartInstance.current) chartInstance.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      if (macdContainerRef.current && macdChartRef.current) macdChartRef.current.applyOptions({ width: macdContainerRef.current.clientWidth });
      if (rsiContainerRef.current && rsiChartRef.current) rsiChartRef.current.applyOptions({ width: rsiContainerRef.current.clientWidth });
      if (atrContainerRef.current && atrChartRef.current) atrChartRef.current.applyOptions({ width: atrContainerRef.current.clientWidth });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      macdChartRef.current?.remove();
      rsiChartRef.current?.remove();
      atrChartRef.current?.remove();

      seriesInstance.current = null;
      smaSeriesRef.current = null;
      emaSeriesRef.current = null;
      wmaSeriesRef.current = null;
      macdHistRef.current = null;
      macdSignalRef.current = null;
      rsiSeriesRef.current = null;
      atrSeriesRef.current = null;
      chartInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // helper to format Angel date (same logic you used originally)
  const formatAngelDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  // main fetch function (stable ref via useCallback)
  const fetchData = useCallback(async () => {
    if (!creds?.apiKey || !creds?.jwtToken) return;

    setLoading(true);
    setError("");

    try {
      const maxDays = intervalMaxDays[interval] || 30;
      const now = new Date();
      const fromDt = new Date(now.getTime() - maxDays * 24 * 60 * 60 * 1000);
      const fromDateStr = formatAngelDate(fromDt);
      const toDateStr = formatAngelDate(now);

      // 1) Historical candles from backend
      const histResponse = await getHistoricalData({
        apiKey: creds.apiKey,
        jwtToken: creds.jwtToken,
        exchange: "NSE",
        symbolToken: symbolToken,
        interval,
        fromDate: fromDateStr,
        toDate: toDateStr,
      });

      const rawData = histResponse.data || [];

      // Convert backend candles to lightweight-charts format (time in seconds)
      const formattedData = rawData
        .map((item) => ({
          time: Math.floor(new Date(item.time).getTime() / 1000),
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }))
        .sort((a, b) => a.time - b.time);

      // set candles on chart
      if (seriesInstance.current) {
        if (formattedData.length > 0) {
          seriesInstance.current.setData(formattedData);
          chartInstance.current?.timeScale().fitContent();
        } else {
          seriesInstance.current.setData([]);
        }
      }

      // 2) Market (LTP)
      const marketResponse = await getMarketData({
        apiKey: creds.apiKey,
        jwtToken: creds.jwtToken,
        mode: "LTP",
        exchangeTokens: { NSE: [symbolToken] },
      });

      const actualMarketData =
        marketResponse.data?.fetched?.[0] ||
        marketResponse.data?.data?.fetched?.[0] ||
        marketResponse.data;

      if (actualMarketData) setMarketData(actualMarketData);

      // prepare minimal payloads
      const payloadForMA = formattedData.map((c) => ({ time: c.time, close: c.close }));

      // --- SMA ---
      if (formattedData.length > 0 && indicators.showSMA) {
        try {
          const smaResponse = await getSMA({ candles: payloadForMA, period: Number(indicators.smaPeriod) || 20 });
          const smaFormatted = Array.isArray(smaResponse)
            ? smaResponse.filter((p) => p && p.value !== null && p.value !== undefined).map((p) => ({ time: p.time, value: p.value }))
            : [];
          smaSeriesRef.current?.setData(smaFormatted);
        } catch (smaErr) {
          console.error("SMA fetch error:", smaErr);
          smaSeriesRef.current?.setData([]);
        }
      } else {
        smaSeriesRef.current?.setData([]);
      }

      // --- EMA ---
      if (formattedData.length > 0 && indicators.showEMA) {
        try {
          const emaResponse = await getEMA({ candles: payloadForMA, period: Number(indicators.emaPeriod) || 20 });
          const emaFormatted = Array.isArray(emaResponse)
            ? emaResponse.filter((p) => p && p.value !== null && p.value !== undefined).map((p) => ({ time: p.time, value: p.value }))
            : [];
          emaSeriesRef.current?.setData(emaFormatted);
        } catch (e) {
          console.error("EMA fetch error:", e);
          emaSeriesRef.current?.setData([]);
        }
      } else {
        emaSeriesRef.current?.setData([]);
      }

      // --- WMA ---
      if (formattedData.length > 0 && indicators.showWMA) {
        try {
          const wmaResponse = await getWMA({ candles: payloadForMA, period: Number(indicators.wmaPeriod) || 20 });
          const wmaFormatted = Array.isArray(wmaResponse)
            ? wmaResponse.filter((p) => p && p.value !== null && p.value !== undefined).map((p) => ({ time: p.time, value: p.value }))
            : [];
          wmaSeriesRef.current?.setData(wmaFormatted);
        } catch (e) {
          console.error("WMA fetch error:", e);
          wmaSeriesRef.current?.setData([]);
        }
      } else {
        wmaSeriesRef.current?.setData([]);
      }

      // --- Bollinger Bands ---
      if (formattedData.length > 0 && indicators.showBB) {
        try {
          const bbResponse = await getBollinger({
            candles: payloadForMA,
            period: Number(indicators.bbPeriod) || 20,
            stdDev: Number(indicators.bbStdDev) || 2,
          });
          const bbFormatted = Array.isArray(bbResponse) ? bbResponse : [];
          const middle = bbFormatted.filter((b) => b && b.middle !== null).map((b) => ({ time: b.time, value: b.middle }));
          const upper = bbFormatted.filter((b) => b && b.upper !== null).map((b) => ({ time: b.time, value: b.upper }));
          const lower = bbFormatted.filter((b) => b && b.lower !== null).map((b) => ({ time: b.time, value: b.lower }));

          // create / update upper/lower/middle series on main chart
          if (!chartInstance.current.__bbUpper) {
            chartInstance.current.__bbUpper = chartInstance.current.addSeries(LineSeries, { color: "#60a5fa", lineWidth: 1 });
            chartInstance.current.__bbLower = chartInstance.current.addSeries(LineSeries, { color: "#60a5fa", lineWidth: 1 });
          }
          chartInstance.current.__bbUpper.setData(upper);
          chartInstance.current.__bbLower.setData(lower);

          if (!indicators.showSMA) {
            // reuse SMA series for middle if SMA disabled
            smaSeriesRef.current.setData(middle);
          } else {
            if (!chartInstance.current.__bbMiddle) {
              chartInstance.current.__bbMiddle = chartInstance.current.addSeries(LineSeries, { color: "#f59e0b", lineWidth: 1 });
            }
            chartInstance.current.__bbMiddle.setData(middle);
          }
        } catch (e) {
          console.error("BBands fetch error:", e);
          chartInstance.current.__bbUpper?.setData([]);
          chartInstance.current.__bbLower?.setData([]);
          chartInstance.current.__bbMiddle?.setData([]);
        }
      } else {
        chartInstance.current?.__bbUpper?.setData([]);
        chartInstance.current?.__bbLower?.setData([]);
        chartInstance.current?.__bbMiddle?.setData([]);
      }

      // --- MACD ---
      if (formattedData.length > 0 && indicators.showMACD && macdHistRef.current && macdSignalRef.current) {
        try {
          const macdResponse = await getMACD({
            candles: payloadForMA,
            fastPeriod: Number(indicators.macdFast) || 12,
            slowPeriod: Number(indicators.macdSlow) || 26,
            signalPeriod: Number(indicators.macdSignal) || 9,
          });

          const macdFormattedHist = Array.isArray(macdResponse)
            ? macdResponse.map((m) => ({ time: m.time, value: typeof m.histogram === "number" ? m.histogram : 0, color: (m.histogram >= 0 ? "#22c55e" : "#ef4444") }))
            : [];
          const macdSignalFormatted = Array.isArray(macdResponse) ? macdResponse.map((m) => ({ time: m.time, value: m.signal ?? null })) : [];

          macdHistRef.current.setData(macdFormattedHist);
          macdSignalRef.current.setData(macdSignalFormatted.filter((p) => p.value !== null));
        } catch (e) {
          console.error("MACD fetch error:", e);
          macdHistRef.current.setData([]);
          macdSignalRef.current.setData([]);
        }
      } else {
        macdHistRef.current?.setData([]);
        macdSignalRef.current?.setData([]);
      }

      // --- RSI ---
      if (formattedData.length > 0 && indicators.showRSI && rsiSeriesRef.current) {
        try {
          const rsiResponse = await getRSI({ candles: payloadForMA, period: Number(indicators.rsiPeriod) || 14 });
          const rsiFormatted = Array.isArray(rsiResponse) ? sanitizeLineData(rsiResponse.map((r) => ({ time: r.time, value: r.value }))) : [];
          rsiSeriesRef.current.setData(rsiFormatted);
        } catch (e) {
          console.error("RSI fetch error:", e);
          rsiSeriesRef.current.setData([]);
        }
      } else {
        rsiSeriesRef.current?.setData([]);
      }

      // --- ATR ---
      if (formattedData.length > 0 && indicators.showATR && atrSeriesRef.current) {
        try {
          const atrResponse = await getATR({
            candles: formattedData.map((c) => ({ time: c.time, high: c.high, low: c.low, close: c.close })),
            period: Number(indicators.atrPeriod) || 14,
          });
          const atrFormatted = Array.isArray(atrResponse) ? sanitizeLineData(atrResponse.map((a) => ({ time: a.time, value: a.value }))) : [];
          atrSeriesRef.current.setData(atrFormatted);
        } catch (e) {
          console.error("ATR fetch error:", e);
          atrSeriesRef.current.setData([]);
        }
      } else {
        atrSeriesRef.current?.setData([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch data. Check network or date range.");
    } finally {
      setLoading(false);
    }
  },
  // dependencies: all inputs used inside
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [creds, symbolToken, interval, JSON.stringify(indicators), JSON.stringify(intervalMaxDays)]);

  // automatically call fetchData if credentials are present (like original)
  useEffect(() => {
    if (creds?.apiKey) {
      fetchData();
    }
  }, [fetchData, creds?.apiKey]);

  return {
    refs: {
      chartContainerRef,
      macdContainerRef,
      rsiContainerRef,
      atrContainerRef,
    },
    loading,
    error,
    marketData,
    fetchData,
  };
}
