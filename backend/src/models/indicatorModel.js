import { getDB } from "../config/db.js";

// Get all enabled indicators

export const getEnabledIndicators = async () => {
  const [rows] = await getDB().query(
    `SELECT * FROM indicators WHERE enabled = 1`
  );
  return rows;
};

//Get parameters for an indicator
export const getIndicatorParams = async (indicatorId) => {
  const [rows] = await getDB().query(
    `SELECT param_key, param_type, default_value
     FROM indicator_params
     WHERE indicator_id = ?`,
    [indicatorId]
  );
  return rows;
};

//  Get handler info
export const getIndicatorHandler = async (indicatorId) => {
  const [rows] = await getDB().query(
    `SELECT handler FROM indicator_logic WHERE indicator_id = ?`,
    [indicatorId]
  );
  return rows[0];
};


