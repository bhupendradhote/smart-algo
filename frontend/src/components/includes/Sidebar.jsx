import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = ({ onLogout }) => {
  return (
    <aside className="dash-sidebar">
      <nav>
        <ul>
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/connect" className={({ isActive }) => (isActive ? "active" : "")}>
              Connect
            </NavLink>
          </li>
          <li>
            <NavLink to="/chart" className={({ isActive }) => (isActive ? "active" : "")}>
              Chart
            </NavLink>
          </li>
          <li>
            <NavLink to="/broker" className={({ isActive }) => (isActive ? "active" : "")}>
              Brokers
            </NavLink>
          </li>
          <li>
            <NavLink to="/reports" className={({ isActive }) => (isActive ? "active" : "")}>
              Reports
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" className={({ isActive }) => (isActive ? "active" : "")}>
              Settings
            </NavLink>
          </li>
        </ul>

        <div className="sidebar-bottom">
          <button className="sidebar-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;