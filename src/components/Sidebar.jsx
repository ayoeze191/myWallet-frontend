import { NavLink, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  HomeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  UsersIcon,
  UserIcon,
  LogOutIcon,
  XIcon,
} from "lucide-react";

// Wallet views live on the dashboard as tabs, so those entries carry a ?tab=
// and the dashboard reads it back. Ajo has pages of its own.
const MENU = [
  { to: "/", label: "Dashboard", icon: HomeIcon, tab: "overview" },
  { to: "/contributions", label: "My Ajo", icon: UsersIcon },
  { to: "/?tab=fund", label: "Fund Wallet", icon: ArrowUpIcon, tab: "fund" },
  { to: "/?tab=transfer", label: "Send Money", icon: ArrowDownIcon, tab: "transfer" },
  { to: "/?tab=history", label: "History", icon: ClockIcon, tab: "history" },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const currentTab = searchParams.get("tab") || "overview";

  function isActive(item) {
    if (item.tab) {
      return location.pathname === "/" && currentTab === item.tab;
    }
    return location.pathname.startsWith(item.to);
  }

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
              <UsersIcon size={24} color="#fff" />
            </div>
            <div>
              <h2 className="brand-name">Ajo</h2>
              <span className="brand-sub">SAVE TOGETHER</span>
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
          {MENU.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`nav-item ${isActive(item) ? "nav-item-active" : ""}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
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
