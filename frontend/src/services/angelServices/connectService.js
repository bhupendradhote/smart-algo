/* eslint-disable no-unused-vars */
import API from "../api/axios"; 

// ✨ CHANGED: We no longer store raw tokens, just UI state
const STORAGE_KEY = "angel_session_state";

// --- Token Management Utilities ---

export const getSavedTokenData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn("getSavedTokenData parse error", err);
    return null;
  }
};

export const persistTokenData = (sessionState) => {
  try {
    if (!sessionState) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionState));
  } catch (err) {
    console.warn("persistTokenData error", err);
  }
};

export const clearSavedTokenData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    // ignore
  }
};

// --- Initialization ---

// --- Initialization ---
export const initializeAngelService = () => {
  // ✨ ADDED: Force-delete the dangerous legacy tokens for all users
  localStorage.removeItem("angel_tokenData"); 

  const saved = getSavedTokenData();
  if (saved) {
    console.log("Angel Service Initialized with secure session state");
  }
};

// --- API Calls (Using Shared API Instance) ---

export const connectAngel = async (
  { apiKey, clientCode, password, totp, totpSecret },
  { persist = true } = {}
) => {
  if (!apiKey || !clientCode || !password) {
    return {
      success: false,
      error: "apiKey, clientCode and password are required",
    };
  }

  const payload = { apiKey, clientCode, password, totp, totpSecret };
  
  try {
    const res = await API.post("/angel/connect", payload);
    const body = res?.data ?? {};

    if (body?.success === false) {
      return { success: false, error: body?.message || "Connection failed" };
    }

    // ✨ CHANGED: Backend now returns sessionActive flag instead of tokenData
    const profile = body?.data?.profile ?? body?.profile ?? null;
    const sessionState = { sessionActive: true, connectedAt: new Date().toISOString() };

    if (persist) {
      persistTokenData(sessionState);
    }

    return { success: true, data: { sessionState, profile } };

  } catch (err) {
    console.error("Connect Angel Error:", err);

    const serverMsg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Failed to connect to backend";

    return { success: false, error: serverMsg };
  }
};

export const refreshSession = async () => {
  try {
    const res = await API.post("/angel/refresh");
    const body = res?.data ?? {};
    
    if (body?.success === false) {
      return { success: false, error: body?.message || "Refresh failed" };
    }

    const sessionState = { sessionActive: true, refreshedAt: new Date().toISOString() };
    persistTokenData(sessionState);
    
    return { success: true, data: { sessionState } };
  } catch (err) {
    const serverMsg =
      err?.response?.data?.message || err?.message || "Failed to refresh session";
    return { success: false, error: serverMsg };
  }
};

export const disconnect = async (callBackend = true) => {
  let backendErr = null;
  
  if (callBackend) {
    try {
      await API.post("/angel/disconnect");
    } catch (err) {
      backendErr = err?.response?.data?.message || err.message;
    }
  }

  clearSavedTokenData();
  
  return { success: true, backendError: backendErr };
};

export default {
  connectAngel,
  getSavedTokenData,
  persistTokenData,
  clearSavedTokenData,
  refreshSession,
  disconnect,
  initializeAngelService,
};