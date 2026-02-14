import { useEffect, useRef, useState, useCallback } from "react";
import { getHistoricalData, getMarketData } from "../../services/angelServices/historicalQuoteService";
import { getBrokerAccounts } from "../../services/angelServices/brokerAccountService";
import { getSavedTokenData } from "../../services/angelServices/connectService";

export default function useChartData(symbolToken, interval) {
  const [sessionReady, setSessionReady] = useState(false);
  const [candles, setCandles] = useState([]);
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const mountedRef = useRef(true);

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

  // Verify Account and Session
  useEffect(() => {
    mountedRef.current = true;
    const checkSession = async () => {
      try {
        const tokenData = getSavedTokenData?.();
        const isActive = tokenData?.sessionActive;
        
        const accounts = await getBrokerAccounts();
        const list = Array.isArray(accounts) ? accounts : accounts?.data || [];
        const angelAccount = list.find((acc) => acc.broker_name?.toLowerCase().includes("angel"));

        if (angelAccount && isActive && mountedRef.current) {
          setSessionReady(true);
        } else if (mountedRef.current) {
          setError("Please connect your Angel One account.");
        }
      } catch (e) {
        console.warn("Failed to load session state", e);
      }
    };
    checkSession();
    return () => { mountedRef.current = false; };
  }, []);

  // Process Data (Sort & Deduplicate for Chart)
  const processData = (rawData) => {
    if (!Array.isArray(rawData)) return [];
    
    const validData = rawData.map(item => {
      let time = item.time;
      if (typeof time === "string") time = new Date(time).getTime();
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

    const uniqueMap = new Map();
    validData.forEach(item => uniqueMap.set(item.time, item));
    return Array.from(uniqueMap.values()).sort((a, b) => a.time - b.time);
  };

  // Fetch Function ( FIXED: Sequential fetching to prevent race conditions)
  const fetchData = useCallback(async () => {
    if (!sessionReady) return;

    setLoading(true);
    setError("");

    try {
      const now = new Date();
      const maxDays = getMaxDaysBack(interval);
      const fromDate = new Date(now.getTime() - maxDays * 24 * 60 * 60 * 1000);

      const formatDate = (d) => {
        const pad = n => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };

      // 1. Fetch Historical Data FIRST
      try {
        const histRes = await getHistoricalData({
          exchange: "NSE",
          symbolToken,
          interval,
          fromDate: formatDate(fromDate),
          toDate: formatDate(now),
        });
        
        if (histRes?.data && mountedRef.current) {
          const cleanCandles = processData(histRes.data);
          setCandles(cleanCandles);
        } else {
           console.warn("Historical fetch empty");
        }
      } catch (histErr) {
        console.warn("Historical fetch failed:", histErr);
      }

      // 2. Fetch Market Data SECOND (Session is now guaranteed)
      try {
        const mktRes = await getMarketData({ 
          mode: "LTP", 
          exchangeTokens: { NSE: [symbolToken] } 
        });
        
        const data = mktRes?.data?.fetched?.[0] || mktRes?.data?.data?.fetched?.[0];
        if (data && mountedRef.current) {
          setMarketData(data);
        }
      } catch (mktErr) {
        console.warn("Market data fetch failed:", mktErr);
      }

      if (mountedRef.current) setLastUpdated(new Date());

    } catch (err) {
      console.error(err);
      if (mountedRef.current) setError("Failed to fetch data.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [sessionReady, symbolToken, interval]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getIndicatorPayload = useCallback(() => {
    return candles.map(c => ({
      ...c,
      time: c.time, 
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
    credsPresent: sessionReady, 
    refresh: fetchData,
    getIndicatorPayload,
  };
}