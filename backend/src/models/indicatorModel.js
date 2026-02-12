// backend/src/models/indicatorModel.js
import { getDB } from "../config/db.js";

// Get all enabled indicators (basic metadata)
export const getEnabledIndicators = async () => {
  const [rows] = await getDB().query(
    `SELECT id, code, name, indicator_type, default_color, chart_type, display_order, enabled
     FROM indicators
     WHERE enabled = 1
     ORDER BY indicator_type ASC, display_order ASC`
  );
  return rows;
};


// Get parameters for an indicator
export const getIndicatorParams = async (indicatorId) => {
  const [rows] = await getDB().query(
    `SELECT param_key, param_type, default_value
     FROM indicator_params
     WHERE indicator_id = ?`,
    [indicatorId]
  );
  return rows;
};

// Get handler (logic) info for an indicator
export const getIndicatorHandler = async (indicatorId) => {
  const [rows] = await getDB().query(
    `SELECT handler, module_path, returns, description
     FROM indicator_logic
     WHERE indicator_id = ?`,
    [indicatorId]
  );
  return rows[0] || null;
};

// Get series metadata for an indicator
export const getIndicatorSeries = async (indicatorId) => {
  const [rows] = await getDB().query(
    `SELECT series_key, series_name, series_type, color, visible, y_axis, display_order, value_expression
     FROM indicator_series
     WHERE indicator_id = ?
     ORDER BY display_order ASC`,
    [indicatorId]
  );
  return rows;
};
