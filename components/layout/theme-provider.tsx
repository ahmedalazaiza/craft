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
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Freeze all CSS transitions on all elements during theme toggle
 * to ensure 100% 0ms instantaneous repaint with zero frame drops or stutter.
 */
function applyThemeInstantly(resolved: "light" | "dark") {
  if (typeof document === "undefined") return;

  const css = document.createElement("style");
  css.id = "craft-theme-freeze";
  css.appendChild(
    document.createTextNode(
      `*, *::before, *::after {
        -webkit-transition: none !important;
        -moz-transition: none !important;
        -o-transition: none !important;
        -ms-transition: none !important;
        transition: none !important;
      }`
    )
  );
  document.head.appendChild(css);

  // Set the attribute synchronously
  document.documentElement.setAttribute("data-theme", resolved);

  // Force layout flush so the new theme colors apply immediately without transition
  if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    window.getComputedStyle(document.documentElement).opacity;
  }

  // Remove the transition blocker on the next frame so normal hover transitions resume cleanly
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const el = document.getElementById("craft-theme-freeze");
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  });
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Current user request: lock to Light mode across entire site for now, keeping theme engine preserved
  const [theme, setThemeState] = useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Force light theme on mount
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    setThemeState("light");
    setResolvedTheme("light");

    /* PRESERVED FOR FUTURE RE-ACTIVATION:
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
        applyThemeInstantly(sys);
      }
    };

    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
    */
  }, []);

  // Instantaneous theme changer kept intact for future re-activation
  const setTheme = useCallback((newTheme: Theme) => {
    const resolved = newTheme === "system" ? getSystemTheme() : newTheme;
    applyThemeInstantly(resolved);
    try {
      localStorage.setItem("craft-theme", newTheme);
    } catch {
      // ignore
    }
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
