import {
  getEnabledIndicators,
  getIndicatorParams,
  getIndicatorHandler,
} from "../../models/indicatorModel.js";

import smaCalculator from "../../utils/indicators/smaCalculator.js";
import emaCalculator from "../../utils/indicators/emaCalculator.js";
import rsiCalculator from "../../utils/indicators/rsiCalculator.js";
import macdCalculator from "../../utils/indicators/macdCalculator.js";

const INDICATOR_HANDLERS = {
  smaCalculator,
  emaCalculator,
    rsiCalculator,
  macdCalculator,
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

    const safeCandles = candles
      .map((c) => ({
        time: Number(c.time),
        close: Number(c.close),
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

      if (!handlerRow) {
        console.warn("No handler for indicator:", indicator.code);
        continue;
      }

      const handlerFn = INDICATOR_HANDLERS[handlerRow.handler];
      if (!handlerFn) {
        console.warn("Handler not found:", handlerRow.handler);
        continue;
      }

      const params = {};
      paramsArr.forEach((p) => {
        params[p.param_key] = Number(p.default_value);
      });

      let data = [];
      try {
        data = handlerFn(safeCandles, params);
      } catch (calcErr) {
        console.error(`Indicator ${indicator.code} failed`, calcErr);
        continue;
      }

      output.push({
        code: indicator.code,
        name: indicator.name,
        chart_type: indicator.chart_type,
        series_type: indicator.series_type,
        color: indicator.default_color,
        data,
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
