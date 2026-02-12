/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import { LineSeries, HistogramSeries, AreaSeries } from "lightweight-charts";
import { computeIndicators } from "../../services/indicator/indicatorsdService";

export default function useIndicators({
  chartApiRef,
  mainPaneRef,
  getIndicatorPayload,
  candles,
  activeConfigs = [], 
  enabled = true,
  opts = {},
}) {
  const seriesMapRef = useRef({}); 
  const paneMapRef = useRef({}); 
  const debug = Boolean(opts.debug);

  useEffect(() => {
    if (!enabled) return;
    const chartApi = chartApiRef?.current;
    const mainPane = mainPaneRef?.current;
    if (!chartApi || !mainPane) return;

    // 1. Prepare Payload
    const buildPayload = () => {
      if (typeof getIndicatorPayload === "function") {
        try { return getIndicatorPayload({ includeDerived: true }); } catch (e) {}
      }
      if (!Array.isArray(candles)) return [];
      return candles.map((c) => ({
        time: c.time, open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume || 0,
        hl2: c.hl2, hlc3: c.hlc3, ohlc4: c.ohlc4, typical: c.typical,
      }));
    };

    if (!Array.isArray(candles) || candles.length === 0) return;

    let cancelled = false;

    const fetchAndRender = async () => {
      try {
        const payload = buildPayload();
        
        // 2. Compute - Sending specific CONFIGS to backend
        const resp = await computeIndicators(payload, activeConfigs);
        
        if (cancelled) return;
        
        const indicators = resp?.indicators || [];
        const incomingSeriesKeys = new Set(); 

        // 3. Render Loop
        for (const ind of indicators) {
          const indicatorCode = (ind.code || `ind_${ind.id}`).toString();
          const chartType = (ind.chart_type || "overlay").toString().toLowerCase(); 
          const seriesArr = Array.isArray(ind.series) ? ind.series : [];
          const defaultColor = ind.default_color || "#2196f3";

          // Pane Selection
          let paneForIndicator = null;
          let isMainPane = false;

          if (chartType === "overlay") {
            paneForIndicator = mainPane;
            isMainPane = true;
          } else {
            paneForIndicator = paneMapRef.current[indicatorCode];
            if (!paneForIndicator) {
              try {
                paneForIndicator = chartApi.addPane();
                paneForIndicator.setStretchFactor(0.2); 
                paneMapRef.current[indicatorCode] = paneForIndicator;
              } catch (e) {
                paneForIndicator = mainPane;
                isMainPane = true;
              }
            }
          }

          // Series Logic
          for (const sMeta of seriesArr) {
            const skey = String(sMeta.series_key || sMeta.seriesName || Math.random()).toLowerCase();
            const mapKey = `${indicatorCode}::${skey}`;
            
            incomingSeriesKeys.add(mapKey);

            const seriesType = (sMeta.series_type || "line").toLowerCase() === "histogram" ? "histogram" : 
                               (sMeta.series_type || "line").toLowerCase() === "area" ? "area" : "line";
            
            const color = sMeta.color || defaultColor; 
            const points = (sMeta.data || []).map(p => ({ time: Number(p.time), value: Number(p.value) }))
                                             .filter(p => p.time && p.value !== null)
                                             .sort((a, b) => a.time - b.time);

            if (seriesMapRef.current[mapKey] && seriesMapRef.current[mapKey].type !== seriesType) {
              try { chartApi.removeSeries(seriesMapRef.current[mapKey].series); } catch(e){}
              delete seriesMapRef.current[mapKey];
            }

            if (!seriesMapRef.current[mapKey]) {
              try {
                const uniqueScaleId = isMainPane ? 'right' : `scale_${indicatorCode}`;
                const seriesOpts = {
                  color, lineWidth: 1, priceLineVisible: false, lastValueVisible: true, // indicator editing
                  title: sMeta.series_name || sMeta.displayName || skey,
                  priceScaleId: uniqueScaleId, 
                };

                const SeriesClass = seriesType === "histogram" ? HistogramSeries : seriesType === "area" ? AreaSeries : LineSeries;
                
                const createdSeries = paneForIndicator.addSeries 
                                      ? paneForIndicator.addSeries(SeriesClass, seriesOpts) 
                                      : chartApi.addSeries(SeriesClass, seriesOpts);
                
                seriesMapRef.current[mapKey] = { series: createdSeries, type: seriesType, pane: paneForIndicator };

                if (!isMainPane && paneForIndicator.priceScale) {
                   try { paneForIndicator.priceScale(uniqueScaleId).applyOptions({ autoScale: true, scaleMargins: { top: 0.1, bottom: 0.1 } }); } catch(e){}
                }
              } catch (err) { console.error(err); continue; }
            }

            const target = seriesMapRef.current[mapKey].series;
            if (target) target.setData(points);
          } 
        }

        Object.keys(seriesMapRef.current).forEach((key) => {
          if (!incomingSeriesKeys.has(key)) {
            try { chartApi.removeSeries(seriesMapRef.current[key].series); } catch(e) {}
            delete seriesMapRef.current[key];
          }
        });
        
      } catch (err) { console.error(err); }
    };

    fetchAndRender();
    return () => { cancelled = true; };
  }, [chartApiRef, mainPaneRef, candles, enabled, getIndicatorPayload, JSON.stringify(activeConfigs)]); 

  useEffect(() => {
    return () => {
      const chartApi = chartApiRef?.current;
      if (!chartApi) return;
      Object.values(seriesMapRef.current).forEach(({ series }) => { try { chartApi.removeSeries(series); } catch (e) {} });
      seriesMapRef.current = {};
      Object.values(paneMapRef.current).forEach((pane) => { try { chartApi.removePane(pane.paneIndex()); } catch(e){} });
      paneMapRef.current = {};
    };
  }, [chartApiRef]);
}