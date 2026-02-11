import api from "../api/axios";


export const getIndicatorList = async () => {
  // Calls GET /api/indicators/list
  const response = await api.get("/indicators/list");
  return response.data;
};

export const computeIndicators = async (candles) => {
  // Calls POST /api/indicators/compute
  const response = await api.post("/indicators/compute", { candles });
  return response.data;
};