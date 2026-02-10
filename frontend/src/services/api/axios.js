import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token") || localStorage.getItem("token");

    if (token) {
      console.log("✅ Interceptor: Attaching Token:", token.substring(0, 10) + "...");
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("⚠️ Interceptor: No token found in localStorage!");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;