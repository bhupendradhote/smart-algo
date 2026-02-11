// backend/src/controllers/indicators/indicatorController.js

import { getDB } from "../../config/db.js";
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

// --- 1. GET LIST (Merged with User Preferences) ---
export const listIndicators = async (req, res) => {
  try {
    const userId = req.query.userId || 1; 
    
    const indicators = await getEnabledIndicators();
    
    // Fetch user-specific settings
    let userSettings = [];
    try {
        const [rows] = await getDB().query(
            "SELECT indicator_code, params, is_active FROM user_indicator_settings WHERE user_id = ?", 
            [userId]
        );
        userSettings = rows;
    } catch(e) {
    }

    const fullList = await Promise.all(indicators.map(async (ind) => {
      const paramDefs = await getIndicatorParams(ind.id);
      
      const userConfig = userSettings.find(u => u.indicator_code === ind.code);

      return {
        id: ind.id,
        code: ind.code,
        name: ind.name,
        type: ind.chart_type || 'overlay',
        default_color: ind.default_color,
        // Active state: User pref > Default false
        is_active: userConfig ? Boolean(userConfig.is_active) : false,
        params: paramDefs.map(p => {
            let currentValue = p.default_value;
            if (userConfig && userConfig.params) {
                const parsedParams = typeof userConfig.params === 'string' 
                    ? JSON.parse(userConfig.params) 
                    : userConfig.params;
                
                if (parsedParams[p.param_key] !== undefined) {
                    currentValue = parsedParams[p.param_key];
                }
            }

            return {
                key: p.param_key,
                label: p.param_label || p.param_key, 
                type: p.param_type,
                default_value: p.default_value,
                value: currentValue
            };
        })
      };
    }));

    res.json(fullList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to list indicators" });
  }
};

// --- 2. SAVE SETTINGS ---

export const saveIndicatorSettings = async (req, res) => {
    try {
        const { userId, code, params, isActive } = req.body;

        console.log("Saving settings:", { userId, code, isActive }); // Debug log

        if (!code) return res.status(400).json({ message: "Indicator code required" });

        const paramsString = typeof params === 'object' ? JSON.stringify(params) : params;

        await getDB().query(
            `INSERT INTO user_indicator_settings (user_id, indicator_code, params, is_active)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
             params = VALUES(params), 
             is_active = VALUES(is_active)`,
            [userId || 1, code, paramsString, isActive ? 1 : 0]
        );

        res.json({ success: true });
    } catch (e) {
        // Log the REAL error to your terminal
        console.error("SQL Save Error:", e.sqlMessage || e.message); 
        res.status(500).json({ message: "Database save failed", error: e.message });
    }
};

// --- 3. COMPUTE ---
export const computeIndicators = async (req, res) => {
  try {
    const { candles, configurations } = req.body; 

    if (!Array.isArray(candles) || candles.length === 0) {
      return res.status(400).json({ message: "Candles array is required", indicators: [] });
    }

    const safeCandles = candles.map(c => ({
        time: Number(c.time), 
        open: Number(c.open || c.close || 0), 
        high: Number(c.high || c.close || 0), 
        low: Number(c.low || c.close || 0), 
        close: Number(c.close), 
        volume: Number(c.volume || 0),
        hl2: c.hl2 !== undefined ? Number(c.hl2) : undefined,
        hlc3: c.hlc3 !== undefined ? Number(c.hlc3) : undefined,
        ohlc4: c.ohlc4 !== undefined ? Number(c.ohlc4) : undefined,
    })).filter(c => Number.isFinite(c.close));

    const activeConfigs = configurations || [];
    const allIndicators = await getEnabledIndicators(); 
    const output = [];

    for (const config of activeConfigs) {
        const indicatorDB = allIndicators.find(i => i.code === config.code);
        if (!indicatorDB) continue;

        const handlerRow = await getIndicatorHandler(indicatorDB.id);
        if (!handlerRow || handlerRow.is_active === 0) continue;

        const handlerFn = INDICATOR_HANDLERS[handlerRow.handler];
        if (!handlerFn) continue;

        const dbParamsDefs = await getIndicatorParams(indicatorDB.id);
        const finalParams = {};
        
        dbParamsDefs.forEach(p => {
            const val = (config.params && config.params[p.param_key] !== undefined)
                        ? config.params[p.param_key]
                        : p.default_value;
            
            if (p.param_type === 'int') finalParams[p.param_key] = parseInt(val, 10);
            else if (p.param_type === 'float') finalParams[p.param_key] = parseFloat(val);
            else if (p.param_type === 'bool') finalParams[p.param_key] = (val === true || val === "true" || val === "1");
            else finalParams[p.param_key] = val;
        });

        let calculatedData = [];
        try {
            calculatedData = await handlerFn(safeCandles, finalParams);
        } catch(e) {
            continue;
        }

        const seriesMetaArr = await getIndicatorSeries(indicatorDB.id);
        const seriesList = seriesMetaArr.map(sMeta => {
            const data = calculatedData.map(row => {
                if (!row) return null;
                const val = (row[sMeta.series_key] !== undefined) ? row[sMeta.series_key] : row.value;
                return { 
                    time: Number(row.time), 
                    value: Number.isFinite(val) ? Number(val) : null 
                };
            }).filter(Boolean);

            return {
                series_key: sMeta.series_key,
                series_name: sMeta.series_name,
                series_type: sMeta.series_type,
                color: sMeta.color || indicatorDB.default_color,
                visible: true,
                y_axis: sMeta.y_axis,
                data
            };
        });

        output.push({
            id: indicatorDB.id,
            code: indicatorDB.code,
            name: indicatorDB.name,
            chart_type: indicatorDB.chart_type,
            default_color: indicatorDB.default_color,
            series: seriesList
        });
    }

    res.json({ indicators: output });
  } catch (err) {
    res.status(500).json({ message: "Computation error", indicators: [] });
  }
};