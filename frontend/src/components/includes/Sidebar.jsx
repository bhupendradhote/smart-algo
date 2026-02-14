import React, { useState } from "react";
import { NavLink } from "react-router-dom";
// I'm using lucide-react for icons, but you can use any library (like FontAwesome)
import { 
  LayoutDashboard, 
  Network, 
  BarChart2, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";
import "../../assets/styles/Sidebar.css"; 

const Sidebar = ({ onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { path: "/connect", label: "Connect", icon: <Network size={20} /> },
    { path: "/chart", label: "Chart", icon: <BarChart2 size={20} /> },
    { path: "/broker", label: "Brokers", icon: <Users size={20} /> },
    { path: "/reports", label: "Reports", icon: <FileText size={20} /> },
    { path: "/settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  return (
    <aside className={`dash-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <span className="icon">{item.icon}</span>
                {!isCollapsed && <span className="label">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="sidebar-bottom">
          <button className="sidebar-logout" onClick={onLogout}>
            <LogOut size={20} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;