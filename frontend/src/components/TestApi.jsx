import React, { useState, useEffect } from "react";
import { getSavedTokenData } from "../services/angelServices/connectService";
import { getHistoricalData, getMarketData } from "../services/angelServices/historicalQuoteService";
import { getBrokerAccounts } from "../services/angelServices/brokerAccountService";
import "./../assets/styles/connect.css"; // Reusing your existing styles

const TestApi = () => {
  // --- STATE ---
  const [creds, setCreds] = useState({
    apiKey: "",
    jwtToken: "",
  });

  const [histParams, setHistParams] = useState({
    exchange: "NSE",
    symbolToken: "3045", // SBIN
    interval: "ONE_DAY",
    fromDate: "2023-01-01 09:15",
    toDate: "2023-01-10 15:30",
  });

  const [marketParams, setMarketParams] = useState({
    mode: "LTP",
    exchange: "NSE",
    symbolToken: "3045", // SBIN
  });

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- INITIALIZATION: Auto-fill Credentials ---
  useEffect(() => {
    const loadCreds = async () => {
      try {
        // 1. Get JWT from Local Storage
        const tokenData = getSavedTokenData();
        const jwt = tokenData?.jwtToken || "";

        // 2. Get API Key from Backend (Saved Account)
        // Note: This assumes the first account is the one you want to test
        let key = "";
        try {
          const accounts = await getBrokerAccounts();
          const list = Array.isArray(accounts) ? accounts : (accounts.data || []);
          const angel = list.find(a => a.broker_name.toLowerCase().includes("angel"));
          if (angel) key = angel.api_key;
        } catch (e) {
          console.warn("Could not fetch saved accounts for auto-fill");
        }

        setCreds({ apiKey: key, jwtToken: jwt });
      } catch (err) {
        console.error(err);
      }
    };
    loadCreds();
  }, []);

  // --- HANDLERS ---
  const handleCredsChange = (e) => setCreds({ ...creds, [e.target.name]: e.target.value });
  const handleHistChange = (e) => setHistParams({ ...histParams, [e.target.name]: e.target.value });
  const handleMarketChange = (e) => setMarketParams({ ...marketParams, [e.target.name]: e.target.value });

  // TEST: Historical Data
  const testHistorical = async () => {
    setLoading(true);
    setError("");
    setResponse(null);
    try {
      const data = await getHistoricalData({
        ...creds,
        ...histParams
      });
      setResponse(data);
    } catch (err) {
      setError(err.message || "Failed to fetch historical data");
    } finally {
      setLoading(false);
    }
  };

  // TEST: Market Data
  const testMarket = async () => {
    setLoading(true);
    setError("");
    setResponse(null);
    try {
      // Construct exchangeTokens object: { "NSE": ["3045"] }
      const exchangeTokens = {
        [marketParams.exchange]: [marketParams.symbolToken]
      };

      const data = await getMarketData({
        apiKey: creds.apiKey,
        jwtToken: creds.jwtToken,
        mode: marketParams.mode,
        exchangeTokens: exchangeTokens
      });
      setResponse(data);
    } catch (err) {
      setError(err.message || "Failed to fetch market data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="connect-page" style={{ padding: '20px', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. CREDENTIALS PANEL */}
      <div className="connect-card">
        <div className="card-header">
          <h2>🔐 API Credentials</h2>
        </div>
        <div className="modern-form">
          <div className="input-group">
            <label style={{color:'#94a3b8', fontSize:'12px'}}>API Key (From DB)</label>
            <input name="apiKey" value={creds.apiKey} onChange={handleCredsChange} placeholder="Enter SmartAPI Key" />
          </div>
          <div className="input-group">
            <label style={{color:'#94a3b8', fontSize:'12px'}}>JWT Token (From Login)</label>
            <input name="jwtToken" value={creds.jwtToken} onChange={handleCredsChange} placeholder="Enter Active JWT Token" />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', width: '100%', maxWidth: '1000px' }}>
        
        {/* 2. HISTORICAL DATA FORM */}
        <div className="connect-card" style={{ flex: 1 }}>
          <div className="card-header">
            <h2>📊 Historical Data</h2>
          </div>
          <div className="modern-form">
            <div className="input-row">
              <input name="exchange" value={histParams.exchange} onChange={handleHistChange} placeholder="Exchange (NSE)" />
              <input name="symbolToken" value={histParams.symbolToken} onChange={handleHistChange} placeholder="Token (e.g. 3045)" />
            </div>
            <div className="input-group">
              <select 
                name="interval" 
                value={histParams.interval} 
                onChange={handleHistChange}
                style={{
                  width: '100%', 
                  background: '#020617', 
                  border: '1px solid #1e293b', 
                  color: '#fff', 
                  padding: '12px', 
                  borderRadius: '8px'
                }}
              >
                <option value="ONE_MINUTE">1 Minute</option>
                <option value="FIVE_MINUTE">5 Minute</option>
                <option value="ONE_HOUR">1 Hour</option>
                <option value="ONE_DAY">1 Day</option>
              </select>
            </div>
            <div className="input-row">
              <input name="fromDate" value={histParams.fromDate} onChange={handleHistChange} placeholder="From (YYYY-MM-DD HH:mm)" />
              <input name="toDate" value={histParams.toDate} onChange={handleHistChange} placeholder="To (YYYY-MM-DD HH:mm)" />
            </div>
            <button onClick={testHistorical} disabled={loading} className="btn btn-primary full-width">
              {loading ? "Fetching..." : "Get Candles"}
            </button>
          </div>
        </div>

        {/* 3. MARKET DATA FORM */}
        <div className="connect-card" style={{ flex: 1 }}>
          <div className="card-header">
            <h2>⚡ Market Data (LTP)</h2>
          </div>
          <div className="modern-form">
             <div className="input-group">
              <select 
                name="mode" 
                value={marketParams.mode} 
                onChange={handleMarketChange}
                style={{
                  width: '100%', 
                  background: '#020617', 
                  border: '1px solid #1e293b', 
                  color: '#fff', 
                  padding: '12px', 
                  borderRadius: '8px'
                }}
              >
                <option value="LTP">LTP (Price Only)</option>
                <option value="OHLC">OHLC (Open High Low Close)</option>
                <option value="FULL">FULL (Market Depth)</option>
              </select>
            </div>
            <div className="input-row">
              <input name="exchange" value={marketParams.exchange} onChange={handleMarketChange} placeholder="Exchange (NSE)" />
              <input name="symbolToken" value={marketParams.symbolToken} onChange={handleMarketChange} placeholder="Token (e.g. 3045)" />
            </div>
            <button onClick={testMarket} disabled={loading} className="btn btn-primary full-width">
              {loading ? "Fetching..." : "Get Market Data"}
            </button>
          </div>
        </div>
      </div>

      {/* 4. RESULTS OUTPUT */}
      {(response || error) && (
        <div className="connect-card" style={{ maxWidth: '1000px' }}>
          <div className="card-header">
            <h2>📝 Response Data</h2>
            {error && <span style={{color: '#ef4444'}}>Error</span>}
            {response && <span style={{color: '#22c55e'}}>Success</span>}
          </div>
          
          <div style={{ 
            background: '#000', 
            padding: '15px', 
            borderRadius: '8px', 
            overflow: 'auto', 
            maxHeight: '400px',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: error ? '#ef4444' : '#22c55e'
          }}>
            {error ? error : JSON.stringify(response, null, 2)}
          </div>
        </div>
      )}

    </div>
  );
};

export default TestApi;