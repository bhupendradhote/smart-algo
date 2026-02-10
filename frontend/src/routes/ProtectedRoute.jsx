// src/routes/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("auth_token");

  // If no token, send them to login
  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  // If token exists, render the child routes (Dashboard, Connect, etc.)
  return <Outlet />;
};

export default ProtectedRoute;