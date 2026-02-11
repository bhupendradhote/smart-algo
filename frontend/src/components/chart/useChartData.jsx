/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState, useCallback } from "react";
import { getHistoricalData, getMarketData } from "../../services/angelServices/historicalQuoteService";
import { getBrokerAccounts } from "../../services/angelServices/brokerAccountService";
import { getSavedTokenData } from "../../services/angelServices/connectService";

export default function useChartData(symbolToken, interval) {
  const [creds, setCreds] = useState({ apiKey: "", jwtToken: "" });
  const [candles, setCandles] = useState([]);
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const mountedRef = useRef(true);

  // 1. HELPER: Get Max Days based on your API limits
  const getMaxDaysBack = (tf) => {
    switch (tf) {
      case "ONE_MINUTE": return 30;
      case "THREE_MINUTE": return 60;
      case "FIVE_MINUTE": return 100;
      case "TEN_MINUTE": return 100;
      case "FIFTEEN_MINUTE": return 200;
      case "THIRTY_MINUTE": return 200;
      case "ONE_HOUR": return 400;
      case "ONE_DAY": return 2000;
      default: return 30;
    }
  };

  // 2. Load Credentials
  useEffect(() => {
    mountedRef.current = true;
    const loadCreds = async () => {
      try {
        const tokenData = getSavedTokenData?.();
        const jwt = tokenData?.jwtToken;
        const accounts = await getBrokerAccounts();
        const list = Array.isArray(accounts) ? accounts : accounts?.data || [];
        const angelAccount = list.find((acc) => acc.broker_name?.toLowerCase().includes("angel"));

        if (angelAccount && jwt && mountedRef.current) {
          setCreds({ apiKey: angelAccount.api_key, jwtToken: jwt });
        } else if (mountedRef.current) {
          setError("Please connect your Angel One account.");
        }
      } catch (e) {
        console.warn("Failed to load credentials", e);
      }
    };
    loadCreds();
    return () => { mountedRef.current = false; };
  }, []);

  // 3. Process Data (Sort & Deduplicate for Chart)
  const processData = (rawData) => {
    if (!Array.isArray(rawData)) return [];
    
    const validData = rawData.map(item => {
      // Parse time safely
      let time = item.time;
      if (typeof time === "string") time = new Date(time).getTime();
      // Convert ms to seconds for Lightweight Charts
      time = time / 1000; 

      if (isNaN(time)) return null;

      return {
        time,
        open: Number(item.open),
        high: Number(item.high),
        low: Number(item.low),
        close: Number(item.close),
        volume: Number(item.volume || 0),
      };
    }).filter(Boolean);

    // Deduplicate by time
    const uniqueMap = new Map();
    validData.forEach(item => uniqueMap.set(item.time, item));
    return Array.from(uniqueMap.values()).sort((a, b) => a.time - b.time);
  };

  // 4. Fetch Function
  const fetchData = useCallback(async () => {
    if (!creds.apiKey || !creds.jwtToken) return;

    setLoading(true);
    setError("");

    try {
      const now = new Date();
      const maxDays = getMaxDaysBack(interval);
      const fromDate = new Date(now.getTime() - maxDays * 24 * 60 * 60 * 1000);

      // Angel API Date Format: YYYY-MM-DD HH:MM
      const formatDate = (d) => {
        const pad = n => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };

      const [histRes, mktRes] = await Promise.allSettled([
        getHistoricalData({
          apiKey: creds.apiKey,
          jwtToken: creds.jwtToken,
          exchange: "NSE",
          symbolToken,
          interval,
          fromDate: formatDate(fromDate),
          toDate: formatDate(now),
        }),
        getMarketData({ 
            apiKey: creds.apiKey, 
            jwtToken: creds.jwtToken, 
            mode: "LTP", 
            exchangeTokens: { NSE: [symbolToken] } 
        })
      ]);

      if (mountedRef.current) {
        // Handle Historical Data
        if (histRes.status === "fulfilled" && histRes.value?.data) {
          const cleanCandles = processData(histRes.value.data);
          setCandles(cleanCandles);
        } else {
           // Fallback if data is empty or error
           console.warn("Historical fetch failed or empty", histRes);
        }

        // Handle Live Price
        if (mktRes.status === "fulfilled") {
           const data = mktRes.value?.data?.fetched?.[0] || mktRes.value?.data?.data?.fetched?.[0];
           if (data) setMarketData(data);
        }

        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error(err);
      if (mountedRef.current) setError("Failed to fetch market data.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [creds, symbolToken, interval]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Indicator Payload
  const getIndicatorPayload = useCallback(() => {
    return candles.map(c => ({
      ...c,
      time: c.time, // Seconds
      hl2: (c.high + c.low) / 2,
      hlc3: (c.high + c.low + c.close) / 3,
      ohlc4: (c.open + c.high + c.low + c.close) / 4,
    }));
  }, [candles]);

  return {
    candles,
    marketData,
    loading,
    error,
    lastUpdated,
    credsPresent: !!(creds.apiKey && creds.jwtToken),
    refresh: fetchData,
    getIndicatorPayload,
  };
}