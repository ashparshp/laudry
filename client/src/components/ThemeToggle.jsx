import React from "react";
import { useTheme } from "../context/ThemeContext.jsx";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = ({ className = "", size = 20, showLabel = false }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center space-x-2 p-3 rounded-full bg-gradient-to-r from-indigo-500 to-caribbean-500 text-white hover:from-indigo-600 hover:to-caribbean-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 ${className}`}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun size={size} /> : <Moon size={size} />}
      {showLabel && (
        <span className="text-sm font-medium">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
