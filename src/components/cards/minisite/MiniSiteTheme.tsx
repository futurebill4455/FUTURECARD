"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type MiniSiteColorMode = "dark" | "light";

type Ctx = {
  mode: MiniSiteColorMode;
  toggle: () => void;
  setMode: (m: MiniSiteColorMode) => void;
};

const MiniSiteThemeContext = createContext<Ctx | null>(null);

export function MiniSiteThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<MiniSiteColorMode>("dark");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("fc-minisite-theme");
      if (saved === "light" || saved === "dark") setMode(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const persist = useCallback((m: MiniSiteColorMode) => {
    setMode(m);
    try {
      localStorage.setItem("fc-minisite-theme", m);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      mode,
      setMode: persist,
      toggle: () => persist(mode === "dark" ? "light" : "dark"),
    }),
    [mode, persist],
  );

  return (
    <MiniSiteThemeContext.Provider value={value}>
      {children}
    </MiniSiteThemeContext.Provider>
  );
}

export function useMiniSiteTheme() {
  const ctx = useContext(MiniSiteThemeContext);
  if (!ctx) {
    return {
      mode: "dark" as const,
      toggle: () => undefined,
      setMode: () => undefined,
    };
  }
  return ctx;
}

export function MiniSiteThemeToggle({ className }: { className?: string }) {
  const { mode, toggle } = useMiniSiteTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={
        className ||
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xs font-bold text-cyan-100 shadow-[0_0_0_0_rgba(34,211,238,0)] backdrop-blur-md transition duration-300 hover:scale-110 hover:border-cyan-300/40 hover:bg-white/10 hover:shadow-[0_0_24px_rgba(34,211,238,0.35)] active:scale-95"
      }
    >
      {mode === "dark" ? "◐" : "☀"}
    </button>
  );
}
