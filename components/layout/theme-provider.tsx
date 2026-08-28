"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");

  // Read initial theme synchronously on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("craft-theme") as Theme | null;
      const initialTheme: Theme =
        stored === "light" || stored === "dark" || stored === "system"
          ? stored
          : "system";
      
      const resolved = initialTheme === "system" ? getSystemTheme() : initialTheme;
      setThemeState(initialTheme);
      setResolvedTheme(resolved);
      document.documentElement.setAttribute("data-theme", resolved);
    } catch {
      // ignore
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem("craft-theme");
      if (!stored || stored === "system") {
        const sys = e.matches ? "dark" : "light";
        setResolvedTheme(sys);
        document.documentElement.setAttribute("data-theme", sys);
      }
    };

    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, []);

  // Instantaneous synchronous theme changer - 0ms latency
  const setTheme = useCallback((newTheme: Theme) => {
    const resolved = newTheme === "system" ? getSystemTheme() : newTheme;

    // 1. Immediately apply to DOM (instant style recalculation with 0 frame drop)
    document.documentElement.setAttribute("data-theme", resolved);

    // 2. Persist in storage
    try {
      localStorage.setItem("craft-theme", newTheme);
    } catch {
      // ignore
    }

    // 3. Update React context in single batch
    setThemeState(newTheme);
    setResolvedTheme(resolved);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
