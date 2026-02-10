/* eslint-disable no-unused-vars */
// frontend/src/services/angelServices/connectService.js

import API from "../api/axios"; 

const STORAGE_KEY = "angel_tokenData";

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

export const persistTokenData = (tokenData) => {
  try {
    if (!tokenData) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokenData));
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

export const initializeAngelService = () => {
  const saved = getSavedTokenData();
  if (saved) {
    console.log("Angel Service Initialized with saved data");
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

    const tokenData = body?.data?.tokenData ?? body?.tokenData ?? body;
    const profile = body?.data?.profile ?? body?.profile ?? null;

    if (persist && tokenData) {
  const angelDataToStore = {
    apiKey,                 // ✅ REQUIRED for WS
    clientCode,             // ✅ REQUIRED for WS
    jwtToken: tokenData.jwtToken,
    refreshToken: tokenData.refreshToken,
    feedToken: tokenData.feedToken,
  };

  persistTokenData(angelDataToStore);
}


    return { success: true, data: { tokenData, profile } };

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

    const tokenData = body?.data?.tokenData ?? body?.tokenData ?? null;
    if (tokenData) persistTokenData(tokenData);
    
    return { success: true, data: { tokenData } };
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