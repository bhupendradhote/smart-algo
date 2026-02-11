// backend/src/controllers/indicators/indicatorController.js
import {
  getEnabledIndicators,
  getIndicatorParams,
  getIndicatorHandler,
  getIndicatorSeries,
} from "../../models/indicatorModel.js";

import smaCalculator from "../../utils/indicators/smaCalculator.js";
import emaCalculator from "../../utils/indicators/emaCalculator.js";
import rsiCalculator from "../../utils/indicators/rsiCalculator.js";
import macdCalculator from "../../utils/indicators/macdCalculator.js";
import vwapCalculator from "../../utils/indicators/vwapCalculator.js";


const INDICATOR_HANDLERS = {
  smaCalculator,
  emaCalculator,
  rsiCalculator,
  macdCalculator,
  vwapCalculator,
};

const buildParamsFromRows = (paramsArr) => {
  const params = {};
  (paramsArr || []).forEach((p) => {
    const key = p.param_key;
    const type = (p.param_type || "int").toLowerCase();
    const raw = p.default_value;

    if (type === "int") params[key] = Number.parseInt(raw, 10) || 0;
    else if (type === "float") params[key] = Number.parseFloat(raw) || 0;
    else if (type === "bool") params[key] = raw === "1" || raw === "true";
    else params[key] = raw;
  });
  return params;
};


const evaluateExpression = (expr, ctx) => {
  if (!expr) return NaN;
  const replaced = expr.replace(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g, (id) => {
    if (Object.prototype.hasOwnProperty.call(ctx, id)) {
      const v = ctx[id];
      return Number.isFinite(v) ? String(v) : "0";
    }
    return "0";
  });

  if (!/^[0-9+\-*/().\s]+$/.test(replaced)) {
    return NaN;
  }

  try {
    const fn = new Function(`return (${replaced});`);
    const result = fn();
    return Number.isFinite(result) ? result : NaN;
  } catch (e) {
    return NaN;
  }
};


const buildSeriesPoint = (outRow, seriesMeta) => {
  if (!outRow) return { time: null, value: null };

  if (seriesMeta.value_expression) {
    const v = evaluateExpression(seriesMeta.value_expression, outRow);
    return { time: outRow.time, value: Number.isFinite(v) ? Number(v) : null };
  }

  const key = seriesMeta.series_key;
  if (Object.prototype.hasOwnProperty.call(outRow, key)) {
    const v = outRow[key];
    return { time: outRow.time, value: Number.isFinite(v) ? Number(v) : null };
  }

  if (Object.prototype.hasOwnProperty.call(outRow, "value")) {
    const v = outRow.value;
    return { time: outRow.time, value: Number.isFinite(v) ? Number(v) : null };
  }

  return { time: outRow.time, value: null };
};

export const computeIndicators = async (req, res) => {
  try {
    const { candles } = req.body;

    if (!Array.isArray(candles) || candles.length === 0) {
      return res.status(400).json({
        message: "Candles array is required",
        indicators: [],
      });
    }

    // IMPORTANT: preserve volume and other OHLC fields
    const safeCandles = candles
      .map((c) => ({
        time: Number(c.time),
        open: Number(c.open || c.close || 0),
        high: Number(c.high || c.close || 0),
        low: Number(c.low || c.close || 0),
        close: Number(c.close),
        volume: Number(c.volume || 0),
        hl2: c.hl2 !== undefined ? Number(c.hl2) : undefined,
        hlc3: c.hlc3 !== undefined ? Number(c.hlc3) : undefined,
        ohlc4: c.ohlc4 !== undefined ? Number(c.ohlc4) : undefined,
      }))
      .filter((c) => Number.isFinite(c.time) && Number.isFinite(c.close));

    if (safeCandles.length === 0) {
      return res.status(400).json({
        message: "Invalid candle format",
        indicators: [],
      });
    }

    const indicators = await getEnabledIndicators();
    const output = [];

    for (const indicator of indicators) {
      const paramsArr = await getIndicatorParams(indicator.id);
      const handlerRow = await getIndicatorHandler(indicator.id);
      const seriesMetaArr = await getIndicatorSeries(indicator.id);

      if (!handlerRow) {
        console.warn("No handler for indicator:", indicator.code);
        continue;
      }

      if (handlerRow.is_active === 0) {
        console.info(`Indicator logic for ${indicator.code} is disabled (is_active=0)`);
        continue;
      }

      const handlerFn = INDICATOR_HANDLERS[handlerRow.handler];
      if (!handlerFn) {
        console.warn("Handler function not found for:", handlerRow.handler);
        continue;
      }

      const params = buildParamsFromRows(paramsArr);

      let handlerOutput = [];
      try {
        handlerOutput = await handlerFn(safeCandles, params);

        if (!Array.isArray(handlerOutput)) {
          console.warn("Handler output not an array for", indicator.code);
          continue;
        }
      } catch (calcErr) {
        console.error(`Indicator ${indicator.code} failed`, calcErr);
        continue;
      }

      if ((indicator.code || "").toUpperCase() === "VWAP") {
        try {
          console.log("DEBUG VWAP output sample:", handlerOutput.slice(0, 5));
        } catch (e) {
          // ignore
        }
      }

      const normalized = handlerOutput
        .map((r) => {
          if (!r || r.time === undefined || r.time === null) return null;
          return { ...r, time: Number(r.time) };
        })
        .filter(Boolean);

      const seriesList = [];

      if (!seriesMetaArr || seriesMetaArr.length === 0) {
        const fallbackData = normalized.map((r) => ({
          time: r.time,
          value: Number.isFinite(r.value) ? r.value : null,
        }));
        seriesList.push({
          series_key: indicator.code.toLowerCase(),
          series_name: indicator.name,
          series_type: indicator.series_type || "line",
          color: indicator.default_color,
          y_axis: "left",
          data: fallbackData,
        });
      } else {
        for (const sMeta of seriesMetaArr) {
          const sData = normalized.map((r) => {
            const p = buildSeriesPoint(r, sMeta);
            return { time: p.time, value: p.value };
          });

          seriesList.push({
            series_key: sMeta.series_key,
            series_name: sMeta.series_name,
            series_type: sMeta.series_type,
            color: sMeta.color || indicator.default_color,
            visible: Boolean(sMeta.visible),
            y_axis: sMeta.y_axis || "left",
            data: sData,
          });
        }
      }

      output.push({
        id: indicator.id,
        code: indicator.code,
        name: indicator.name,
        chart_type: indicator.chart_type,
        default_color: indicator.default_color,
        series: seriesList,
      });
    }

    return res.json({ indicators: output });
  } catch (err) {
    console.error("computeIndicators fatal error:", err);
    return res.status(500).json({
      message: "Internal indicator computation error",
      indicators: [],
    });
  }
};
