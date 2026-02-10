// frontend/src/pages/angel/AngelChart.jsx
import React, { useState, useEffect } from "react";
import { getBrokerAccounts } from "../../services/angelServices/brokerAccountService";
import { getSavedTokenData } from "../../services/angelServices/connectService";
import useAngelChart from "../../hooks/useAngelChart";
import "./../../assets/styles/connect.css";

const INTERVAL_MAX_DAYS = {
  ONE_MINUTE: 30,
  THREE_MINUTE: 60,
  FIVE_MINUTE: 100,
  TEN_MINUTE: 100,
  FIFTEEN_MINUTE: 200,
  THIRTY_MINUTE: 200,
  ONE_HOUR: 400,
  ONE_DAY: 2000,
};

const AngelChart = () => {
  // --- STATE (UI-level) ---
  const [loadingCreds, setLoadingCreds] = useState(true);
  const [error, setError] = useState("");
  const [creds, setCreds] = useState({ apiKey: "", jwtToken: "" });
  const [marketDataFromHook, setMarketDataFromHook] = useState(null);

  // Filters
  const [symbolToken, setSymbolToken] = useState("3045");
  const [symbolName, setSymbolName] = useState("SBIN");
  const [interval, setIntervalState] = useState("ONE_DAY");

  // Indicators UI toggles & settings
  const [showSMA, setShowSMA] = useState(true);
  const [smaPeriod, setSmaPeriod] = useState(20);

  const [showEMA, setShowEMA] = useState(false);
  const [emaPeriod, setEmaPeriod] = useState(20);

  const [showWMA, setShowWMA] = useState(false);
  const [wmaPeriod, setWmaPeriod] = useState(20);

  const [showMACD, setShowMACD] = useState(false);
  const [macdFast, setMacdFast] = useState(12);
  const [macdSlow, setMacdSlow] = useState(26);
  const [macdSignal, setMacdSignal] = useState(9);

  const [showRSI, setShowRSI] = useState(false);
  const [rsiPeriod, setRsiPeriod] = useState(14);

  const [showBB, setShowBB] = useState(false);
  const [bbPeriod, setBbPeriod] = useState(20);
  const [bbStdDev, setBbStdDev] = useState(2);

  const [showATR, setShowATR] = useState(false);
  const [atrPeriod, setAtrPeriod] = useState(14);

  // --- Load credentials once (keeps same behavior you had) ---
  useEffect(() => {
    const loadCredentials = async () => {
      setLoadingCreds(true);
      try {
        const tokenData = getSavedTokenData();
        const jwt = tokenData?.jwtToken;
        const accounts = await getBrokerAccounts();
        const list = Array.isArray(accounts) ? accounts : (accounts.data || []);
        const angelAccount = list.find((acc) => acc.broker_name?.toLowerCase().includes("angel"));

        if (angelAccount && jwt) {
          setCreds({ apiKey: angelAccount.api_key, jwtToken: jwt });
        } else {
          setError("Please connect your Angel One account first.");
        }
      } catch (err) {
        console.error("Failed to load credentials", err);
        setError("Error loading account details.");
      } finally {
        setLoadingCreds(false);
      }
    };
    loadCredentials();
  }, []);

  // --- Hook: chart & data logic ---
  const {
    refs,
    loading,
    error: hookError,
    marketData,
    fetchData,
  } = useAngelChart({
    creds,
    symbolToken,
    interval,
    // indicators config
    indicators: {
      showSMA,
      smaPeriod,
      showEMA,
      emaPeriod,
      showWMA,
      wmaPeriod,
      showMACD,
      macdFast,
      macdSlow,
      macdSignal,
      showRSI,
      rsiPeriod,
      showBB,
      bbPeriod,
      bbStdDev,
      showATR,
      atrPeriod,
    },
    intervalMaxDays: INTERVAL_MAX_DAYS,
  });

  // Mirror hook error / marketData to local state for UI if desired
  useEffect(() => {
    if (hookError) setError(hookError);
    setMarketDataFromHook(marketData);
  }, [hookError, marketData]);

  // handlers
  const handleSymbolChange = (e) => {
    const tokenMap = {
      SBIN: "3045",
      RELIANCE: "2885",
      TCS: "11536",
      NIFTY: "99926000",
      BANKNIFTY: "99926009",
    };
    const name = e.target.value;
    setSymbolName(name);
    setSymbolToken(tokenMap[name] || "3045");
  };

  const handleIntervalChange = (e) => {
    setIntervalState(e.target.value);
  };

  return (
    <div className="connect-page" style={{ flexDirection: "column", padding: "20px", alignItems: "stretch" }}>
      <div className="connect-card" style={{ maxWidth: "100%", marginBottom: "20px" }}>
        <div className="card-header" style={{ flexWrap: "wrap", gap: "15px" }}>
          <h2 style={{ margin: 0 }}>📈 {symbolName} Chart</h2>
          {marketDataFromHook && (
            <div className="status-badge active" style={{ fontSize: "14px", padding: "6px 12px" }}>
              LTP: <strong style={{ marginLeft: "5px" }}>₹{marketDataFromHook.ltp}</strong>
            </div>
          )}
        </div>

        <div className="modern-form" style={{ flexDirection: "row", flexWrap: "wrap", gap: "15px", alignItems: "end" }}>
          <div className="input-group" style={{ flex: "1 1 150px" }}>
            <label style={{ color: "#94a3b8", fontSize: "12px" }}>Symbol</label>
            <select value={symbolName} onChange={handleSymbolChange} style={inputStyle}>
              <option value="SBIN">SBIN</option>
              <option value="RELIANCE">RELIANCE</option>
              <option value="TCS">TCS</option>
              <option value="NIFTY">NIFTY 50</option>
              <option value="BANKNIFTY">BANKNIFTY</option>
            </select>
          </div>

          <div className="input-group" style={{ flex: "1 1 150px" }}>
            <label style={{ color: "#94a3b8", fontSize: "12px" }}>Timeframe</label>
            <select value={interval} onChange={handleIntervalChange} style={inputStyle}>
              <option value="ONE_MINUTE">1 Minute</option>
              <option value="THREE_MINUTE">3 Minute</option>
              <option value="FIVE_MINUTE">5 Minute</option>
              <option value="TEN_MINUTE">10 Minute</option>
              <option value="FIFTEEN_MINUTE">15 Minute</option>
              <option value="THIRTY_MINUTE">30 Minute</option>
              <option value="ONE_HOUR">1 Hour</option>
              <option value="ONE_DAY">1 Day</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            {/* SMA */}
            <label style={{ color: "#94a3b8", fontSize: "12px", display: "flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" checked={showSMA} onChange={() => setShowSMA((s) => !s)} /> SMA
            </label>
            <input type="number" min={1} value={smaPeriod} onChange={(e) => setSmaPeriod(Number(e.target.value || 20))} style={{ ...inputStyle, width: 90 }} title="SMA period" />

            {/* EMA */}
            <label style={{ color: "#94a3b8", fontSize: "12px", display: "flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" checked={showEMA} onChange={() => setShowEMA((s) => !s)} /> EMA
            </label>
            <input type="number" min={1} value={emaPeriod} onChange={(e) => setEmaPeriod(Number(e.target.value || 20))} style={{ ...inputStyle, width: 90 }} title="EMA period" />

            {/* WMA */}
            <label style={{ color: "#94a3b8", fontSize: "12px", display: "flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" checked={showWMA} onChange={() => setShowWMA((s) => !s)} /> WMA
            </label>
            <input type="number" min={1} value={wmaPeriod} onChange={(e) => setWmaPeriod(Number(e.target.value || 20))} style={{ ...inputStyle, width: 90 }} title="WMA period" />

            {/* Bollinger */}
            <label style={{ color: "#94a3b8", fontSize: "12px", display: "flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" checked={showBB} onChange={() => setShowBB((s) => !s)} /> BBands
            </label>
            <input type="number" min={1} value={bbPeriod} onChange={(e) => setBbPeriod(Number(e.target.value || 20))} style={{ ...inputStyle, width: 70 }} title="BB period" />
            <input type="number" min={1} value={bbStdDev} onChange={(e) => setBbStdDev(Number(e.target.value || 2))} style={{ ...inputStyle, width: 70 }} title="BB stdDev" />

            {/* MACD */}
            <label style={{ color: "#94a3b8", fontSize: "12px", display: "flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" checked={showMACD} onChange={() => setShowMACD((s) => !s)} /> MACD
            </label>
            <input type="number" min={1} value={macdFast} onChange={(e) => setMacdFast(Number(e.target.value || 12))} style={{ ...inputStyle, width: 60 }} title="MACD fast" />
            <input type="number" min={1} value={macdSlow} onChange={(e) => setMacdSlow(Number(e.target.value || 26))} style={{ ...inputStyle, width: 60 }} title="MACD slow" />
            <input type="number" min={1} value={macdSignal} onChange={(e) => setMacdSignal(Number(e.target.value || 9))} style={{ ...inputStyle, width: 60 }} title="MACD signal" />

            {/* RSI */}
            <label style={{ color: "#94a3b8", fontSize: "12px", display: "flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" checked={showRSI} onChange={() => setShowRSI((s) => !s)} /> RSI
            </label>
            <input type="number" min={1} value={rsiPeriod} onChange={(e) => setRsiPeriod(Number(e.target.value || 14))} style={{ ...inputStyle, width: 70 }} title="RSI period" />

            {/* ATR */}
            <label style={{ color: "#94a3b8", fontSize: "12px", display: "flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" checked={showATR} onChange={() => setShowATR((s) => !s)} /> ATR
            </label>
            <input type="number" min={1} value={atrPeriod} onChange={(e) => setAtrPeriod(Number(e.target.value || 14))} style={{ ...inputStyle, width: 70 }} title="ATR period" />

            <button onClick={fetchData} disabled={loading || loadingCreds} className="btn btn-primary" style={{ height: "42px", minWidth: "100px" }}>
              {loading || loadingCreds ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {error && <p style={{ color: "#ef4444", marginTop: "10px" }}>{error}</p>}
      </div>

      {/* CHART CONTAINERS - refs come from hook */}
      <div className="connect-card" style={{ maxWidth: "100%", flex: 1, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", gap: 8 }}>
        <div ref={refs.chartContainerRef} style={{ width: "100%", height: "450px", flex: "0 0 auto" }} />

        {/* MACD pane */}
        <div ref={refs.macdContainerRef} style={{ width: "100%", height: showMACD ? "140px" : 0, transition: "height 200ms" }} />

        {/* RSI pane */}
        <div ref={refs.rsiContainerRef} style={{ width: "100%", height: showRSI ? "120px" : 0, transition: "height 200ms" }} />

        {/* ATR pane */}
        <div ref={refs.atrContainerRef} style={{ width: "100%", height: showATR ? "100px" : 0, transition: "height 200ms" }} />
      </div>
    </div>
  );
};

const inputStyle = {
  background: "#020617",
  color: "#fff",
  border: "1px solid #334155",
  padding: "8px",
  borderRadius: "6px",
};

export default AngelChart;
