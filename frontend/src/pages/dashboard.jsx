import React, { useState } from "react";
import { getAuthUser } from "../services/userServices/authService";
import "../assets/styles/dashboard.css";

// Helper component for the stat cards
const StatCard = ({ title, value, hint }) => (
  <div className="stat-card">
    <div className="stat-title">{title}</div>
    <div className="stat-value">{value}</div>
    {hint && <div className="stat-hint">{hint}</div>}
  </div>
);

const Dashboard = () => {
  // We can just grab the user directly since ProtectedRoute 
  // guarantees we are logged in.
  const [user] = useState(() => getAuthUser());

  // Safety check: render nothing if user isn't found (rare case due to ProtectedRoute)
  if (!user) return null;

  return (
    <>
      {/* Top Section: Welcome & Stats */}
      <section className="dash-top">
        <div className="welcome">
          <h1>Welcome back, {user.name.split(" ")[0]} 👋</h1>
          <p className="muted">Here’s a quick overview of your account and activity.</p>
        </div>

        <div className="stats-grid">
          <StatCard title="Account Balance" value="₹ 1,25,452.00" hint="Updated 2h ago" />
          <StatCard title="Open Positions" value="3" hint="Net P&L: ₹ 1,230" />
          <StatCard title="Trades Today" value="12" hint="Win rate 67%" />
          <StatCard title="Active Strategies" value="4" hint="2 running, 2 paused" />
        </div>
      </section>

      {/* Body Section: Activity & Charts */}
      <section className="dash-body">
        {/* Left Panel: Recent Activity */}
        <div className="panel panel-left">
          <h3>Recent Activity</h3>
          <ul className="activity-list">
            <li>
              <div className="act-time">10:24</div>
              <div className="act-desc">Executed BUY order for RELIANCE — 10 qty</div>
            </li>
            <li>
              <div className="act-time">09:18</div>
              <div className="act-desc">Strategy "MeanRevert_v2" signaled SELL</div>
            </li>
            <li>
              <div className="act-time">Yesterday</div>
              <div className="act-desc">Backtest finished: 12% net return</div>
            </li>
          </ul>
        </div>

        {/* Right Panel: Charts & Mini Stats */}
        <div className="panel panel-right">
          <h3>Positions & Charts</h3>
          <div className="chart-placeholder">
            <div className="chart-message">(Charts will appear here)</div>
          </div>

          <div className="mini-cards">
            <div className="mini-card">
              <div className="mini-title">Today P&L</div>
              <div className="mini-value">₹ 1,230</div>
            </div>
            <div className="mini-card">
              <div className="mini-title">Daily Volatility</div>
              <div className="mini-value">1.2%</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;