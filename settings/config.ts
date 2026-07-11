export type Theme = "light" | "dark" | "auto";
export type WallpaperId = "day" | "night" | "aurora";

export interface Settings {
  theme: Theme;
  wallpaper: WallpaperId;
  reduceTransparency: boolean;
  reduceMotion: boolean;
  largerText: boolean;
}

export const defaultSettings: Settings = {
  theme: "auto",
  wallpaper: "day",
  reduceTransparency: false,
  reduceMotion: false,
  largerText: false,
};

export const SETTINGS_COOKIE = "app-settings";

const THEMES: Theme[] = ["light", "dark", "auto"];
const WALLPAPERS: WallpaperId[] = ["day", "night", "aurora"];

export function parseSettings(raw?: string | null): Settings {
  if (!raw) return defaultSettings;
  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(raw);
  } catch {
    return defaultSettings;
  }
  if (typeof obj !== "object" || obj === null) return defaultSettings;

  const theme = THEMES.includes(obj.theme as Theme)
    ? (obj.theme as Theme)
    : defaultSettings.theme;
  const wallpaper = WALLPAPERS.includes(obj.wallpaper as WallpaperId)
    ? (obj.wallpaper as WallpaperId)
    : defaultSettings.wallpaper;

  return {
    theme,
    wallpaper,
    reduceTransparency: Boolean(obj.reduceTransparency),
    reduceMotion: Boolean(obj.reduceMotion),
    largerText: Boolean(obj.largerText),
  };
}
