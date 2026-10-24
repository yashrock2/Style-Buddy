import React from "react";
import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  Shirt,
  MessageCircle,
  Heart,
  ShoppingBag,
  User,
  Settings,
  LogOut,
  Sparkles,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const links = [
  ["/dashboard", "Dashboard", LayoutDashboard],
  ["/closet", "My Closet", Shirt],
  ["/stylist", "AI Stylist", MessageCircle],
  ["/outfits", "Saved Outfits", Heart],
  ["/shop", "Shop the Look", ShoppingBag],
  ["/profile", "My Profile", User],
  ["/settings", "Settings", Settings],
];

export default function Sidebar({ open, onClose }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>

      {/* BRAND / HOME */}
      <div className="brand-row">
        <NavLink
          to="/dashboard"
          onClick={onClose}
          className="brand"
          aria-label="Go to Dashboard"
        >
          <span className="brand-mark">
            <Sparkles size={16} />
          </span>

          StyleBuddy
        </NavLink>

        <button
          className="icon-btn mobile-only"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X />
        </button>
      </div>

      <div className="side-label">
        YOUR STYLE
      </div>

      {/* NAVIGATION */}
      <nav>
        {links.map(([to, label, Icon]) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              isActive
                ? "nav-item active"
                : "nav-item"
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* LOGOUT */}
      <div className="sidebar-bottom">
        <button
          className="nav-item"
          onClick={() => {
            signOut();
            navigate("/");
          }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

    </aside>
  );
}