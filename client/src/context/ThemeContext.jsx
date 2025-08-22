import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (!saved) return false;

    // Handle both old string format ("dark"/"light") and new boolean format
    if (saved === "dark") return true;
    if (saved === "light") return false;

    try {
      return JSON.parse(saved);
    } catch (error) {
      console.warn(
        "Invalid theme value in localStorage, defaulting to light theme"
      );
      return false;
    }
  });

  useEffect(() => {
    console.log("Theme changed:", isDark ? "dark" : "light");
    localStorage.setItem("theme", JSON.stringify(isDark));
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => {
    console.log(
      "Toggling theme from:",
      isDark ? "dark" : "light",
      "to:",
      !isDark ? "dark" : "light"
    );
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
