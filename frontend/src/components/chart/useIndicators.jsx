/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// frontend/src/components/angel-chart/useIndicators.jsx
import { useEffect, useRef } from "react";
import { LineSeries, HistogramSeries, AreaSeries } from "lightweight-charts";
import { computeIndicators } from "../../services/indicator/indicatorsdService";

export default function useIndicators({
  chartRef,
  getIndicatorPayload,
  candles,
  enabled = true,
  opts = {},
}) {
  const seriesMapRef = useRef({}); // mapKey -> { series, type, meta }
  const debug = Boolean(opts.debug);
  const autoFit = opts.autoFit !== undefined ? Boolean(opts.autoFit) : true;
  const defaultLineWidth = opts.defaultLineWidth || 2.5;
  const areaOpacity = opts.areaOpacity || 0.12;

  useEffect(() => {
    if (!enabled) return;
    if (!chartRef?.current) return;

    // Helper to build the payload we send to computeIndicators
    const buildPayload = () => {
      if (typeof getIndicatorPayload === "function") {
        try {
          return getIndicatorPayload({ includeDerived: true, mapTimeToMs: false });
        } catch (e) {
          if (debug) console.warn("getIndicatorPayload threw:", e);
        }
      }

      // fallback: map candles (ensure we include volume/derived if present)
      if (!Array.isArray(candles)) return [];
      return candles.map((c) => ({
        time: c.time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume || 0,
        // derived fields (if available)
        hl2: c.hl2,
        hlc3: c.hlc3,
        ohlc4: c.ohlc4,
        typical: c.typical,
      }));
    };

    // if no candle data, clear series and exit
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
        const payload = buildPayload();
        if (debug) console.log("computeIndicators payload sample:", payload?.slice?.(0, 2));

        const resp = await computeIndicators(payload);
        if (cancelled) return;

        const indicators = resp?.indicators || [];
        const incoming = new Set();

        for (const ind of indicators) {
          // normalize meta
          const indicatorCode = (ind.code || `ind_${ind.id || Math.random()}`).toString();
          const seriesArr = Array.isArray(ind.series) ? ind.series : [];
          const defaultColor = ind.default_color || "#2196f3";

          for (const sMeta of seriesArr) {
            // map series_key (DB) -> unique map key per indicator series
            const skeyRaw = sMeta.series_key || sMeta.seriesName || Math.random();
            const skey = String(skeyRaw).toLowerCase();
            const mapKey = `${indicatorCode}::${skey}`;
            incoming.add(mapKey);

            // determine visual type
            const rawType = (sMeta.series_type || "line").toString().toLowerCase();
            const seriesType = rawType === "histogram" ? "histogram" : rawType === "area" ? "area" : "line";

            // color and axis
            const color = sMeta.color || defaultColor;
            const visible = sMeta.visible === undefined ? true : Boolean(sMeta.visible);
            const yAxis = (sMeta.y_axis || "right").toString().toLowerCase(); // 'left' or 'right'

            // convert and sanitize data points: only include finite numbers
            const rawPoints = Array.isArray(sMeta.data) ? sMeta.data : [];
            const points = rawPoints
              .map((p) => {
                if (!p || p.time === undefined || p.value === undefined || p.value === null) return null;
                const t = typeof p.time === "string" ? Number(p.time) : p.time;
                const v = Number(p.value);
                if (!Number.isFinite(t) || !Number.isFinite(v)) return null;
                return { time: Number(t), value: v };
              })
              .filter(Boolean)
              .sort((a, b) => a.time - b.time);

            // if series exists but type changed, remove & recreate
            const existing = seriesMapRef.current[mapKey];
            if (existing && existing.type !== seriesType) {
              try {
                chartRef.current.removeSeries(existing.series);
              } catch (e) {
                if (debug) console.warn("removeSeries failed:", e);
              }
              delete seriesMapRef.current[mapKey];
            }

            // create series if missing
            if (!seriesMapRef.current[mapKey]) {
              try {
                let created;
                const priceScaleId = yAxis === "left" ? "left" : "right";

                if (seriesType === "histogram") {
                  created = chartRef.current.addSeries(HistogramSeries, {
                    color,
                    priceFormat: { type: "volume" },
                    priceScaleId,
                    priceLineVisible: false,
                  });
                } else if (seriesType === "area") {
                  const top = color;
                  const hex = (color || "#2196f3").replace("#", "");
                  const r = parseInt(hex.substring(0, 2), 16) || 33;
                  const g = parseInt(hex.substring(2, 4), 16) || 150;
                  const b = parseInt(hex.substring(4, 6), 16) || 243;
                  const bottomColor = `rgba(${r}, ${g}, ${b}, ${areaOpacity})`;

                  created = chartRef.current.addSeries(AreaSeries, {
                    topColor: top,
                    bottomColor,
                    lineColor: color,
                    lineWidth: defaultLineWidth,
                    priceScaleId,
                    priceLineVisible: false,
                  });
                } else {
                  // line series (default)
                  created = chartRef.current.addSeries(LineSeries, {
                    color,
                    lineWidth: defaultLineWidth,
                    priceScaleId,
                    lastValueVisible: true,
                    priceLineVisible: false,
                  });
                }

                seriesMapRef.current[mapKey] = {
                  series: created,
                  type: seriesType,
                  meta: { indicatorCode, skey, yAxis },
                };
              } catch (err) {
                console.error("useIndicators: addSeries failed", err);
                continue;
              }
            }

            try {
              if (!visible) {
                seriesMapRef.current[mapKey].series.setData([]);
              } else {
                seriesMapRef.current[mapKey].series.setData(points);
              }
            } catch (err) {
              console.error(`useIndicators: setData failed for ${mapKey}`, err);
            }
          } 
        } 

        // remove series that are no longer present
        Object.keys(seriesMapRef.current).forEach((existingKey) => {
          if (!incoming.has(existingKey)) {
            try {
              chartRef.current.removeSeries(seriesMapRef.current[existingKey].series);
            } catch (e) {
              if (debug) console.warn("removeSeries on cleanup failed", e);
            }
            delete seriesMapRef.current[existingKey];
          }
        });

        // auto fit time/price (optional)
        if (autoFit && chartRef.current && typeof chartRef.current.timeScale === "function") {
          try {
            chartRef.current.timeScale().fitContent();
          } catch (e) {
            if (debug) console.warn("timeScale.fitContent failed", e);
          }
        }
      } catch (err) {
        console.error("useIndicators: computeIndicators error", err);
      }
    };

    fetchAndRender();

    return () => {
      cancelled = true;
    };
  }, [chartRef, candles, enabled, getIndicatorPayload, JSON.stringify(opts)]);

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

  // hook returns nothing — it mutates the chartRef directly
}
