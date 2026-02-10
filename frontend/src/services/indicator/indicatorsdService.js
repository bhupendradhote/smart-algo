// frontend/src/services/indicatorsService.js
import api from "../api/axios";

export const computeIndicators = async (candles) => {
  const res = await api.post("/indicators/compute", { candles });
  return res.data;
};
