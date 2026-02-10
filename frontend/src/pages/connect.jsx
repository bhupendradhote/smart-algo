import { useEffect, useState, useCallback } from "react";
import {
  connectAngel,
  getSavedTokenData,
  initializeAngelService,
  disconnect as svcDisconnect,
  clearSavedTokenData,
} from "../services/angelServices/connectService";
import {
  addBrokerAccount,
  getBrokerAccounts,
  deleteBrokerAccount,
} from "../services/angelServices/brokerAccountService";
import "./../assets/styles/connect.css";

const brokers = [
  { id: "angel", name: "Angel One", description: "SmartAPI – Algo trading", status: "active" },
  { id: "zerodha", name: "Zerodha", description: "Kite Connect (Coming Soon)", status: "disabled" },
  { id: "upstox", name: "Upstox", description: "Upstox API (Coming Soon)", status: "disabled" },
];

const mask = (s = "", n = 6) => {
  if (!s) return "";
  if (s.length <= n) return "•".repeat(s.length);
  return s.slice(0, n) + "..." + s.slice(-4);
};

const Connect = () => {
  const [selectedBroker, setSelectedBroker] = useState("angel");
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Data States
  const [tokenPreview, setTokenPreview] = useState(null);
  const [savedAccount, setSavedAccount] = useState(null);

  // Forms
  const [formData, setFormData] = useState({
    apiKey: "",
    clientCode: "",
    password: "",
    totp: "",
    totpSecret: "",
  });
  const [reconnectMpin, setReconnectMpin] = useState("");

  const isSessionActive = !!(tokenPreview && tokenPreview.jwtToken);

  // 1. DATA FETCHING
  const checkData = useCallback(async () => {
    try {
      initializeAngelService();
      
      const savedToken = getSavedTokenData();
      if (savedToken) {
        setTokenPreview(savedToken);
      }

      const response = await getBrokerAccounts();
      let accountList = [];
      
      if (Array.isArray(response)) {
        accountList = response;
      } else if (response && Array.isArray(response.data)) {
        accountList = response.data;
      } else if (response && response.brokerAccounts) {
        accountList = response.brokerAccounts;
      }

      const angelAccount = accountList.find((acc) => 
        acc.broker_name === "ANGEL" || acc.broker_name === "angel"
      );

      setSavedAccount(angelAccount || null);

    } catch (err) {
      console.error("DEBUG: Failed to load connect data", err);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    checkData();
  }, [checkData]);

  // 2. HANDLERS
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Connect New Account
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const { success, data, error } = await connectAngel(formData, { persist: true });

      if (!success) throw new Error(error || "Failed to connect Angel Smart");

      if (!savedAccount) {
          const payload = {
            broker_name: "ANGEL",
            api_key: formData.apiKey,
            client_code: formData.clientCode,
            totp_secret: formData.totpSecret || undefined
          };
          await addBrokerAccount(payload);
      }

      setMessage({ type: "success", text: "Connected & Saved Successfully!" });
      
      const saved = getSavedTokenData() || data?.tokenData;
      setTokenPreview(saved);
      await checkData();
      setFormData({ apiKey:"", clientCode:"", password:"", totp:"", totpSecret:"" });

    } catch (err) {
      console.error("Connect Error", err);
      setMessage({ type: "error", text: err.message || "Connection failed" });
    } finally {
      setLoading(false);
    }
  };

  // Reconnect (MPIN Only)
  const handleReconnect = async (e) => {
    e.preventDefault();
    if (!savedAccount) return;
    
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
        const secret = savedAccount.totp_secret || savedAccount.totp_secret_hash || savedAccount.totpSecret;

        if (!secret) {
            throw new Error("TOTP Secret not found in saved account. Please remove and re-add the account.");
        }

        const reconnectPayload = {
            apiKey: savedAccount.api_key,
            clientCode: savedAccount.client_code,
            totpSecret: secret, 
            password: reconnectMpin,          
        };

        const { success, data, error } = await connectAngel(reconnectPayload, { persist: true });

        if (!success) throw new Error(error || "Reconnection failed. Check MPIN.");

        setMessage({ type: "success", text: "Session Restored!" });
        
        const saved = getSavedTokenData() || data?.tokenData;
        setTokenPreview(saved);
        setReconnectMpin(""); 

    } catch (err) {
        console.error("Reconnect Error", err);
        setMessage({ type: "error", text: err.message || "Reconnection failed" });
    } finally {
        setLoading(false);
    }
  };

  // Logout (Session Only)
  const handleLogout = async () => {
    setLoading(true);
    try {
      await svcDisconnect(true); 
      clearSavedTokenData();     
      setTokenPreview(null);     
      setMessage({ type: "success", text: "Logged out successfully." });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Logout failed" });
    } finally {
      setLoading(false);
    }
  };

  // Delete Account (DB + Session)
  const handleDeleteAccount = async () => {
    if(!window.confirm("Are you sure you want to permanently delete this account? You will need to re-enter API keys.")) return;
    setLoading(true);

    try {
      await svcDisconnect(true);
      clearSavedTokenData();
      setTokenPreview(null);

      if (savedAccount?.id) {
        await deleteBrokerAccount(savedAccount.id);
        setSavedAccount(null);
      }
      
      setMessage({ type: "success", text: "Account removed successfully." });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Delete failed" });
    } finally {
      setLoading(false);
    }
  };

  // 3. RENDER
  
  return (
    <div className="connect-page">
      <div className="connect-card">
        
        <div className="card-header">
          <h2>Connect Broker</h2>
          <div className={`status-badge ${isSessionActive ? "active" : "inactive"}`}>
            <span className="dot"></span>
            {isSessionActive ? "Session Active" : "Session Inactive"}
          </div>
        </div>

        <div className="broker-grid">
          {brokers.map((broker) => (
            <div
              key={broker.id}
              className={`broker-card ${selectedBroker === broker.id ? "selected" : ""} ${broker.status === "disabled" ? "disabled" : ""}`}
              onClick={() => broker.status === "active" && setSelectedBroker(broker.id)}
            >
              <div className="broker-icon">{broker.name[0]}</div>
              <div className="broker-info">
                <h4>{broker.name}</h4>
                <span>{broker.status === "disabled" ? "Coming Soon" : "Available"}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="divider"></div>

        <div className="content-area">
            
            {initialLoading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading account details...</p>
                </div>
            ) : (
                <>
                {selectedBroker === "angel" && (
                    <div className="angel-container fade-in">
                        
                        {/* CASE A: Fully Connected */}
                        {savedAccount && isSessionActive ? (
                            <div className="active-account-view">
                                <div className="success-banner">
                                    <span className="icon">✓</span>
                                    <div>
                                        <strong>Connected</strong>
                                        <p>Your trading session is active.</p>
                                    </div>
                                </div>
                                
                                <div className="details-list">
                                    <div className="detail-item">
                                        <label>Client Code</label>
                                        <span>{savedAccount.client_code}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>API Key</label>
                                        <span>{mask(savedAccount.api_key)}</span>
                                    </div>
                                </div>

                                <div className="button-group">
                                    <button onClick={handleLogout} className="btn btn-primary" style={{flex: 1}} disabled={loading}>
                                        {loading ? "Processing..." : "Logout Session"}
                                    </button>
                                </div>
                                <div style={{textAlign: 'center', marginTop: '10px'}}>
                                    <button onClick={handleDeleteAccount} className="btn btn-text-danger" disabled={loading}>
                                        Remove Account Permanently
                                    </button>
                                </div>
                            </div>
                        ) : savedAccount && !isSessionActive ? (
                        
                        /* CASE B: Reconnect (MPIN) */
                            <div className="reconnect-view">
                                <div className="info-banner">
                                    <span className="icon">⚠</span>
                                    <div>
                                        <strong>Session Expired</strong>
                                        <p>Enter MPIN for <b>{savedAccount.client_code}</b> to reconnect.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleReconnect} className="modern-form">
                                    <div className="input-group">
                                        <input 
                                            type="password" 
                                            placeholder="Enter 4-digit MPIN"
                                            value={reconnectMpin} 
                                            onChange={(e) => setReconnectMpin(e.target.value)} 
                                            required 
                                            maxLength={6}
                                        />
                                    </div>
                                    
                                    <div className="button-group">
                                        <button type="submit" disabled={loading} className="btn btn-primary">
                                            {loading ? "Verifying..." : "Reconnect Session"}
                                        </button>
                                        <button type="button" onClick={handleDeleteAccount} className="btn btn-text-danger" disabled={loading}>
                                            Remove Account
                                        </button>
                                    </div>
                                </form>
                            </div>

                        ) : (
                        
                        /* CASE C: New Connection */
                            <form onSubmit={handleSubmit} className="modern-form">
                                <div className="input-group">
                                    <input name="apiKey" placeholder="SmartAPI Key" value={formData.apiKey} onChange={handleChange} required />
                                </div>
                                <div className="input-row">
                                    <input name="clientCode" placeholder="Client Code" value={formData.clientCode} onChange={handleChange} required />
                                    <input type="password" name="password" placeholder="MPIN" value={formData.password} onChange={handleChange} required />
                                </div>
                                <div className="input-row">
                                    <input name="totpSecret" placeholder="TOTP Secret" value={formData.totpSecret} onChange={handleChange} />
                                    <input name="totp" placeholder="TOTP (Current Code)" value={formData.totp} onChange={handleChange} />
                                </div>
                                
                                <button type="submit" disabled={loading} className="btn btn-primary full-width">
                                    {loading ? "Connecting..." : "Link Account"}
                                </button>
                            </form>
                        )}
                    </div>
                )}
                </>
            )}

            {message.text && (
                <div className={`message-box ${message.type} fade-in`}>
                    {message.text}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Connect;