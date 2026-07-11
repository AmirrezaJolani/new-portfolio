"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Settings, Theme, WallpaperId } from "@/settings/config";
import { setSettingsCookie } from "@/settings/cookies";

interface SettingsValue {
  settings: Settings;
  resolvedTheme: "light" | "dark";
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const SettingsContext = createContext<SettingsValue | null>(null);

function systemPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function resolveTheme(theme: Theme, systemDark: boolean): "light" | "dark" {
  if (theme === "auto") return systemDark ? "dark" : "light";
  return theme;
}

/** Reflect the settings onto <html> so all CSS keys off it. */
function applyToDom(settings: Settings, systemDark: boolean) {
  const el = document.documentElement;
  const resolved = resolveTheme(settings.theme, systemDark);
  el.classList.toggle("dark", resolved === "dark");
  el.dataset.wallpaper = settings.wallpaper;
  el.toggleAttribute("data-reduce-transparency", settings.reduceTransparency);
  el.toggleAttribute("data-reduce-motion", settings.reduceMotion);
  el.toggleAttribute("data-larger-text", settings.largerText);
}

export function SettingsProvider({
  initial,
  children,
}: {
  initial: Settings;
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<Settings>(initial);
  const [systemDark, setSystemDark] = useState<boolean>(systemPrefersDark);

  // Track the OS preference (only matters when theme === "auto").
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Re-apply whenever settings or the system preference change.
  useEffect(() => {
    applyToDom(settings, systemDark);
  }, [settings, systemDark]);

  const setSetting = useCallback<SettingsValue["setSetting"]>((key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      setSettingsCookie(next);
      return next;
    });
  }, []);

  const value = useMemo<SettingsValue>(
    () => ({
      settings,
      resolvedTheme: resolveTheme(settings.theme, systemDark),
      setSetting,
    }),
    [settings, systemDark, setSetting],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
}

export type { WallpaperId };
