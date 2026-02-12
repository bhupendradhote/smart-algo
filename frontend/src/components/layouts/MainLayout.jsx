import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../includes/Sidebar";
import Header from "../includes/Header";
import { getAuthUser, logoutUser } from "../../services/userServices/authService"; 
import "../../assets/styles/dashboard.css";

const MainLayout = () => {
  const navigate = useNavigate();
  const [user] = useState(() => getAuthUser());

  // Redirect if user data is missing (Double check safety)
  useEffect(() => {
    if (!user) {
      navigate("/auth", { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logoutUser();
    navigate("/auth", { replace: true });
  };

  if (!user) return null;

  return (
    <div className="dashboard-root">
      <Sidebar onLogout={handleLogout} />
      <div className="dash-main">
        <Header user={user} onLogout={handleLogout} />
        
        <main className="dash-content">
          {/* This renders the Connect page, Dashboard page, etc. */}
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default MainLayout;