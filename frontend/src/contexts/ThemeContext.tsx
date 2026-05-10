import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "fe_theme";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === "light" || raw === "dark") return raw;
    } catch {
      /* ignore */
    }

    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  });

  // Apply CSS variables for the selected theme immediately
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }

    const root = document.documentElement;
    const darkTheme = theme === "dark";

    // Direct color values - no getComputedStyle lookup
    const colors = darkTheme
      ? {
          bg: "#0f172a",
          cardBg: "#0b1220",
          text: "#e5e7eb",
          muted: "#9ca3af",
          border: "#1f2937",
          inputBg: "#041023",
          inputText: "#e5e7eb",
          placeholder: "#9ca3af",
        }
      : {
          bg: "#f9fafb",
          cardBg: "#ffffff",
          text: "#1f2937",
          muted: "#6b7280",
          border: "#e5e7eb",
          inputBg: "#ffffff",
          inputText: "#111827",
          placeholder: "#9ca3af",
        };

    root.style.setProperty("--bg", colors.bg);
    root.style.setProperty("--card-bg", colors.cardBg);
    root.style.setProperty("--text", colors.text);
    root.style.setProperty("--muted", colors.muted);
    root.style.setProperty("--border", colors.border);
    root.style.setProperty("--input-bg", colors.inputBg);
    root.style.setProperty("--input-text", colors.inputText);
    root.style.setProperty("--placeholder", colors.placeholder);
  }, [theme]);

  const toggleTheme = () =>
    setThemeState((t) => (t === "dark" ? "light" : "dark"));
  const setTheme = (t: Theme) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

export default ThemeContext;
