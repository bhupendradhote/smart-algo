// backend/src/services/angelServices/historicalQuote.service.js
import axios from "axios";
import { SmartAPI } from "smartapi-javascript";

const ANGEL_BASE_URL = "https://apiconnect.angelbroking.com";

const INTERVAL_LIMITS = {
  ONE_MINUTE: 30,
  THREE_MINUTE: 60,
  FIVE_MINUTE: 100,
  TEN_MINUTE: 100,
  FIFTEEN_MINUTE: 200,
  THIRTY_MINUTE: 200,
  ONE_HOUR: 400,
  ONE_DAY: 2000,
};

function toAngelString(dateObj) {
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(dateObj.getTime() + istOffset);
  
  const yyyy = istDate.getUTCFullYear();
  const mm = String(istDate.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(istDate.getUTCDate()).padStart(2, "0");
  const hh = String(istDate.getUTCHours()).padStart(2, "0");
  const min = String(istDate.getUTCMinutes()).padStart(2, "0");
  
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function parseAngelString(dateStr) {
  const [datePart, timePart] = dateStr.split(" ");
  const [yyyy, mm, dd] = datePart.split("-").map(Number);
  const [hh, min] = timePart.split(":").map(Number);
  
  const utcDate = new Date(Date.UTC(yyyy, mm - 1, dd, hh, min));
  
  return new Date(utcDate.getTime() - 5.5 * 60 * 60 * 1000);
}

// Fetch Historical Candle Data with Chunking & Parallel Execution
export const getHistoricalDataService = async ({
  apiKey,
  jwtToken,
  exchange,
  symbolToken,
  interval,
  fromDate,
  toDate,
}) => {
  if (!apiKey || !jwtToken) throw new Error("API Key and JWT Token are required");
  if (!exchange || !symbolToken || !interval) throw new Error("Missing exchange, symbolToken or interval");

  // 1. Determine Chunk Size
  const maxDays = INTERVAL_LIMITS[interval] || 30;
  
  // 2. Parse Dates
  const startDt = parseAngelString(fromDate);
  const endDt = parseAngelString(toDate);

  if (startDt > endDt) throw new Error("fromDate cannot be after toDate");

  // 3. Create Date Chunks
  const chunks = [];
  let currentStart = new Date(startDt);

  while (currentStart <= endDt) {
    let currentEnd = new Date(currentStart.getTime() + (maxDays * 24 * 60 * 60 * 1000));
    
    if (currentEnd > endDt) {
      currentEnd = new Date(endDt);
    }

    chunks.push({
      from: toAngelString(currentStart),
      to: toAngelString(currentEnd),
    });

    currentStart = new Date(currentEnd.getTime() + 60 * 1000);
  }

  const fetchChunk = async (chunk) => {
    try {
      const response = await axios.post(
        `${ANGEL_BASE_URL}/rest/secure/angelbroking/historical/v1/getCandleData`,
        {
          exchange,
          symboltoken: String(symbolToken),
          interval,
          fromdate: chunk.from,
          todate: chunk.to,
        },
        {
          headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "X-PrivateKey": apiKey,
            "X-UserType": "USER",
            "X-SourceID": "WEB",
            "X-ClientLocalIP": "127.0.0.1",
            "X-ClientPublicIP": "127.0.0.1",
            "X-MACAddress": "00:00:00:00:00:00",
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        }
      );
      
      return response.data?.data || [];
    } catch (err) {
      console.error(`Chunk failed [${chunk.from} to ${chunk.to}]:`, err.message);
      return []; 
    }
  };

  console.log(`Fetching historical data in ${chunks.length} chunks...`);
  const results = await Promise.all(chunks.map(fetchChunk));

  const allCandles = [];
  const seenTimes = new Set();

  results.flat().forEach((c) => {
    if (Array.isArray(c) && c.length >= 6) {
      const timeStr = c[0];
      if (!seenTimes.has(timeStr)) {
        seenTimes.add(timeStr);
        allCandles.push({
          time: c[0],
          open: c[1],
          high: c[2],
          low: c[3],
          close: c[4],
          volume: c[5],
        });
      }
    }
  });

  return allCandles.sort((a, b) => new Date(a.time) - new Date(b.time));
};

// Fetch Market Data (LTP, OHLC)
export const getMarketDataService = async ({
  apiKey,
  jwtToken,
  mode,
  exchangeTokens,
}) => {
  try {
    if (!apiKey || !jwtToken) throw new Error("API Key and JWT Token are required");

    const smart_api = new SmartAPI({ api_key: apiKey });
    smart_api.access_token = jwtToken;

    const payload = {
      mode: mode || "LTP",
      exchangeTokens: exchangeTokens,
    };

    const response = await smart_api.marketData(payload);

    if (response.status === false) {
      throw new Error(response.message || "Failed to fetch market data");
    }

    return response.data;
  } catch (error) {
    console.error("Market Data Service Error:", error.message);
    throw error;
  }
};