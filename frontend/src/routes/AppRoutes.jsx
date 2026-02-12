// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import LoginSignup from "../pages/auth/loginSignup";
import Dashboard from "../pages/dashboard";
import Connect from "../pages/connect";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../components/layouts/MainLayout";
import TestApi from "../components/TestApi";
import AngelLive from "../components/AngelLive";
import Chart from "../components/chart/chart";

const AppRoutes = () => {
  return (
    <Routes>


<Route path="/test-api" element={<TestApi />} />



      {/* Public Routes */}
      <Route path="/auth" element={<LoginSignup />} />
          <Route path="/chart" element={<Chart />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/test-ws" element={<AngelLive />} />

        </Route>
      </Route>

      {/* Redirects & 404 */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<h1>404 - Page Not Found</h1>} />
    </Routes>
  );
};

export default AppRoutes;