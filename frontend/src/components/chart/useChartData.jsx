/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState, useCallback } from "react";
import { getHistoricalData, getMarketData } from "../../services/angelServices/historicalQuoteService";
import { getBrokerAccounts } from "../../services/angelServices/brokerAccountService";
import { getSavedTokenData } from "../../services/angelServices/connectService";

export default function useChartData(symbolToken, interval) {
  const [creds, setCreds] = useState({ apiKey: "", jwtToken: "" });
  const [loadingCreds, setLoadingCreds] = useState(true);

  const [candles, setCandles] = useState([]);
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const mountedRef = useRef(true);
  const inFlightRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      inFlightRef.current = null;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingCreds(true);
        const tokenData = getSavedTokenData?.();
        const jwt = tokenData?.jwtToken;
        const accounts = await getBrokerAccounts();
        const list = Array.isArray(accounts) ? accounts : accounts?.data || [];
        const angelAccount = list.find((acc) => acc.broker_name?.toLowerCase().includes("angel"));

        if (!mounted) return;
        if (angelAccount && jwt) {
          setCreds({ apiKey: angelAccount.api_key, jwtToken: jwt });
          setError("");
        } else {
          setCreds({ apiKey: "", jwtToken: "" });
          setError("No Angel credentials found — connect an account to load real data.");
        }
      } catch (e) {
        if (!mounted) return;
        console.warn("useChartData: failed to load credentials", e);
        setCreds({ apiKey: "", jwtToken: "" });
        setError("Failed to load credentials.");
      } finally {
        if (mounted) setLoadingCreds(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const formatAngelDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  const getMaxDays = (tf) => {
    switch (tf) {
      case "ONE_MINUTE":
        return 5;
      case "THREE_MINUTE":
      case "FIVE_MINUTE":
      case "TEN_MINUTE":
      case "FIFTEEN_MINUTE":
        return 30;
      case "THIRTY_MINUTE":
      case "ONE_HOUR":
        return 120;
      case "ONE_DAY":
      default:
        return 400;
    }
  };

  const toLightweight = (raw = []) =>
    raw
      .map((item) => {
        const t = item?.time ? Math.floor(new Date(item.time).getTime() / 1000) : null;
        return t !== null && item.close !== undefined
          ? { time: t, open: item.open, high: item.high, low: item.low, close: item.close }
          : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.time - b.time);

  const fetch = useCallback(
    async (opts = { force: false }) => {
      if (!creds?.apiKey || !creds?.jwtToken) {
        setCandles([]);
        setMarketData(null);
        setLastUpdated(null);
        if (!error) setError("Please connect Angel account to load market data.");
        return;
      }

      if (inFlightRef.current && !opts.force) return;
      inFlightRef.current = true;
      setLoading(true);
      setError("");

      try {
        const maxDays = getMaxDays(interval);
        const now = new Date();
        const fromDt = new Date(now.getTime() - maxDays * 24 * 60 * 60 * 1000);
        const fromDateStr = formatAngelDate(fromDt);
        const toDateStr = formatAngelDate(now);

        const histResponse = await getHistoricalData({
          apiKey: creds.apiKey,
          jwtToken: creds.jwtToken,
          exchange: "NSE",
          symbolToken,
          interval,
          fromDate: fromDateStr,
          toDate: toDateStr,
        });

        const raw = histResponse?.data || [];
        const lw = toLightweight(raw);

        if (!mountedRef.current) return;
        setCandles(lw);

        try {
          const mkt = await getMarketData({
            apiKey: creds.apiKey,
            jwtToken: creds.jwtToken,
            mode: "LTP",
            exchangeTokens: { NSE: [symbolToken] },
          });
          const actual = mkt?.data?.fetched?.[0] || mkt?.data?.data?.fetched?.[0] || mkt?.data || null;
          if (actual && mountedRef.current) setMarketData(actual);
        } catch (merr) {
          console.warn("useChartData: LTP fetch failed", merr);
        }

        if (mountedRef.current) setLastUpdated(new Date());
      } catch (err) {
        console.error("useChartData fetch error:", err);
        if (mountedRef.current) setError("Unable to load data. Check network or credentials.");
      } finally {
        inFlightRef.current = null;
        if (mountedRef.current) setLoading(false);
      }
    },
    [creds, symbolToken, interval, error]
  );

  useEffect(() => {
    fetch();
  }, [creds.apiKey, symbolToken, interval]);

  const refresh = useCallback(() => {
    fetch({ force: true });
  }, [fetch]);

  return {
    candles,
    marketData,
    loading: loading || loadingCreds,
    error,
    lastUpdated,
    credsPresent: Boolean(creds?.apiKey && creds?.jwtToken),

    refresh,
  };
}
