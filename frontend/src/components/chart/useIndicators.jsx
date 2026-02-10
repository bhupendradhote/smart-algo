/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// frontend/src/components/angel-chart/useIndicators.jsx
import { useEffect, useRef } from "react";
import { LineSeries, HistogramSeries } from "lightweight-charts";
import { computeIndicators } from "../../services/indicator/indicatorsdService";

export default function useIndicators({ chartRef, candles, enabled = true }) {
  const seriesMapRef = useRef({}); 

  useEffect(() => {
    if (!enabled) return;
    if (!chartRef?.current) return;

    if (!Array.isArray(candles) || candles.length === 0) {
      Object.values(seriesMapRef.current).forEach(({ series }) => {
        try {
          series.setData([]);
        } catch (e) {
          // ignore
        }
      });
      return;
    }

    let cancelled = false;

    const fetchAndRender = async () => {
      try {

        const payload = candles.map((c) => ({
          time: c.time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));

        const data = await computeIndicators(payload);
        if (cancelled) return;

        const indicators = data?.indicators || [];

        const incoming = new Set();

        for (const ind of indicators) {
          const code = ind.code;
          const seriesType = ind.series_type || "line";
          const color = ind.color || "#f59e0b";
          const points = Array.isArray(ind.data) ? ind.data : [];

          incoming.add(code);

          // create series if not exists
          if (!seriesMapRef.current[code]) {
            try {
              let s;
              if (seriesType === "histogram") {
                s = chartRef.current.addSeries(HistogramSeries, {
                  color,
                  priceFormat: { type: "volume" },
                  priceScaleId: "right",
                });
              } else {
                s = chartRef.current.addSeries(LineSeries, {
                  color,
                  lineWidth: 2,
                  priceScaleId: "right", 
                });
              }
              seriesMapRef.current[code] = { series: s, seriesType };
            } catch (err) {
              console.error("useIndicators: addSeries failed", err);
              continue;
            }
          }

          // sanitize and set data
          const safe = points
            .map((p) => {
              const t = typeof p.time === "string" ? Number(p.time) : p.time;
              const v = p.value !== undefined ? Number(p.value) : null;
              return t && v !== null && !Number.isNaN(v) ? { time: t, value: v } : null;
            })
            .filter(Boolean);

          try {
            seriesMapRef.current[code].series.setData(safe);
          } catch (err) {
            console.error(`useIndicators: setData failed for ${code}`, err);
          }
        }

        Object.keys(seriesMapRef.current).forEach((existing) => {
          if (!incoming.has(existing)) {
            try {
              chartRef.current.removeSeries(seriesMapRef.current[existing].series);
            } catch (e) {
              // ignore
            }
            delete seriesMapRef.current[existing];
          }
        });
      } catch (err) {
        console.error("useIndicators: computeIndicators error", err);
      }
    };

    fetchAndRender();

    return () => {
      cancelled = true;
    };
  }, [chartRef, candles, enabled]);
  
  useEffect(() => {
    return () => {
      if (!chartRef?.current) return;
      Object.values(seriesMapRef.current).forEach(({ series }) => {
        try {
          chartRef.current.removeSeries(series);
        } catch (e) {
          // ignore
        }
      });
      seriesMapRef.current = {};
    };
  }, [chartRef]);
}
