"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "obsidian" | "midnight" | "forest" | "dawn";

interface ThemeCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeCtx>({ theme: "obsidian", setTheme: () => {} });

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("st-theme") ?? "obsidian") as Theme;
    }
    return "obsidian";
  });

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("st-theme", t);
    document.documentElement.setAttribute("data-theme", t);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
