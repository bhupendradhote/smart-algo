// src/services/auth/auth.service.js
import API from "../api/axios";

// AUTH APIS

export const registerUser = async (payload) => {
  try {
    const { data } = await API.post("/auth/register", payload);
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Registration failed" };
  }
};

export const loginUser = async (payload) => {
  try {
    const { data } = await API.post("/auth/login", payload);

    if (data?.token) {
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};

export const logoutUser = () => {
  // App auth
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  localStorage.removeItem("authToken");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("angel_tokenData");

};


export const getAuthUser = () => {
  const user = localStorage.getItem("auth_user");
  return user ? JSON.parse(user) : null;
};

export const getAuthToken = () => {
  return localStorage.getItem("auth_token");
};
