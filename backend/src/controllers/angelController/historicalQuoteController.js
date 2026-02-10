// src/controllers/angelController/historicalQuoteController.js
import {
  getHistoricalDataService,
  getMarketDataService,
} from "../../services/angelServices/historicalQuote.service.js";

// GET HISTORICAL DATA
export const getHistoricalData = async (req, res) => {
  try {
    const {
      apiKey,
      jwtToken,
      exchange,
      symbolToken,
      interval,
      fromDate,
      toDate,
    } = req.body;

    // Validation
    if (!apiKey || !jwtToken) {
      return res.status(401).json({ success: false, message: "Unauthorized: Missing API Key or Token" });
    }
    if (!symbolToken || !interval || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "Missing parameters: symbolToken, interval, fromDate, or toDate",
      });
    }

    const data = await getHistoricalDataService({
      apiKey,
      jwtToken,
      exchange: exchange || "NSE",
      symbolToken,
      interval,
      fromDate,
      toDate,
    });

    return res.status(200).json({
      success: true,
      message: `Fetched ${data.length} candles successfully`,
      data: data,
    });
  } catch (error) {
    console.error("Controller Historical Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// GET MARKET DATA
export const getMarketData = async (req, res) => {
  try {
    const { apiKey, jwtToken, mode, exchangeTokens } = req.body;

    if (!apiKey || !jwtToken || !exchangeTokens) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (apiKey, jwtToken, exchangeTokens)",
      });
    }

    const data = await getMarketDataService({
      apiKey,
      jwtToken,
      mode,
      exchangeTokens,
    });

    return res.status(200).json({
      success: true,
      message: "Market data fetched successfully",
      data: data,
    });
  } catch (error) {
    console.error("Controller MarketData Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};