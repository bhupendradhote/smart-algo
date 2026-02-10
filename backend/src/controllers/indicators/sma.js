// backend\src\controllers\indicators\ma.js

import { calculateSMA } from "../../services/indicators/sma.service.js";

export const getSMA = async (req, res) => {
  try {
    const { candles, period } = req.body;

    if (!candles || !period) {
      return res.status(400).json({
        success: false,
        message: "candles and period are required",
      });
    }

    const data = calculateSMA({ candles, period });

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
