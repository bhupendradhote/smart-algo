import React from "react";

const Header = ({ user, onLogout }) => {
  return (
    <header className="dash-header">
      <div className="dash-logo">SmartAlgo</div>

      <div className="dash-header-right">
        <div className="dash-user">
          <div className="avatar">
            {(user?.name || "U").charAt(0).toUpperCase()}
          </div>
          <div className="user-meta">
            <div className="user-name">{user?.name}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>

        <button className="btn-logout" onClick={onLogout} title="Logout">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;