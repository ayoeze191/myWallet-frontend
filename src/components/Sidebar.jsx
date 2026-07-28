import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import {
  HomeIcon,
  WalletIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  UserIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const [activeItem, setActiveItem] = useState("dashboard");

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: HomeIcon },
    { id: "wallet", label: "My Wallet", icon: WalletIcon },
    { id: "fund", label: "Fund Wallet", icon: ArrowUpIcon },
    { id: "transfer", label: "Send Money", icon: ArrowDownIcon },
    { id: "history", label: "History", icon: ClockIcon },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={`sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon">
              <WalletIcon size={24} color="#fff" />
            </div>
            <div>
              <h2 className="brand-name">Wallet Ledger</h2>
              <span className="brand-sub">FORM 7-A · CONTINUOUS</span>
            </div>
          </div>
          <button className="sidebar-close" onClick={onClose}>
            <XIcon size={20} />
          </button>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            <UserIcon size={24} />
          </div>
          <div className="user-info">
            <p className="user-name">{user?.name || "User"}</p>
            <p className="user-email">{user?.email}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeItem === item.id ? "nav-item-active" : ""}`}
              onClick={() => setActiveItem(item.id)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={logout}>
            <LogOutIcon size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
