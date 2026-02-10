import API from "../api/axios";

// --- API ENDPOINTS ---
const HISTORICAL_URL = "/angel/historical-data";
const MARKET_DATA_URL = "/angel/market-data";


export const getHistoricalData = async (params) => {
  try {
    const { data } = await API.post(HISTORICAL_URL, params);
    return data; 
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch historical data",
      }
    );
  }
};


export const getMarketData = async (params) => {
  try {
    const { data } = await API.post(MARKET_DATA_URL, params);
    return data; 
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch market data",
      }
    );
  }
};