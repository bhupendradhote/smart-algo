import api from "../api/axios";
import { getAuthUser } from "../userServices/authService"; // Import your Auth Service

// Helper to safely get ID
const getCurrentUserId = () => {
  const user = getAuthUser();
  return user?.id || 1; // Fallback to 1 if no user (or handle error)
};

export const getIndicatorList = async () => {
  const userId = getCurrentUserId();
  const response = await api.get(`/indicators/list?userId=${userId}`);
  return response.data;
};

export const computeIndicators = async (candles, configurations) => {
  // configurations: [{ code: 'SMA', params: { period: 10 } }]
  const response = await api.post("/indicators/compute", { candles, configurations });
  return response.data;
};

export const saveIndicatorSettings = async (code, params, isActive) => {
  const userId = getCurrentUserId();
  const response = await api.post("/indicators/save", { 
      userId,
      code, 
      params, 
      isActive 
  });
  return response.data;
};