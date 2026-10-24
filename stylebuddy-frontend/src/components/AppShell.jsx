import React, { useEffect, useState } from "react";
import { Menu, Plus, Sun, Moon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppShell({ children }) {
  const [open, setOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("stylebuddy_theme") === "dark";
  });

  const navigate = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    const theme = darkMode ? "dark" : "light";

    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    localStorage.setItem(
      "stylebuddy_theme",
      theme
    );
  }, [darkMode]);

  return (
    <div className="app-shell">
      <Sidebar
        open={open}
        onClose={() => setOpen(false)}
      />

      <div
        className="mobile-overlay"
        onClick={() => setOpen(false)}
      />

      <main className="main">
        <header className="topbar">

          <button
            className="icon-btn mobile-only"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={19} />
          </button>

          <div className="crumb">
            {loc.pathname
              .replace("/", "")
              .replaceAll("-", " ") || "dashboard"}
          </div>

          <div className="topbar-actions">

            <button
              className="theme-toggle"
              onClick={() => setDarkMode((current) => !current)}
              aria-label={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              title={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              <span className="theme-icon">
                {darkMode ? (
                  <Sun size={17} />
                ) : (
                  <Moon size={17} />
                )}
              </span>

              <span className="theme-text">
                {darkMode ? "Light" : "Dark"}
              </span>
            </button>

            <button
              className="btn btn-dark compact"
              onClick={() =>
                navigate("/closet?upload=1")
              }
            >
              <Plus size={16} />
              Add clothes
            </button>

          </div>
        </header>

        {children}
      </main>
    </div>
  );
}