import { describe, expect, it } from "vitest";
import { defaultSettings, parseSettings } from "./config";

describe("parseSettings", () => {
  it("returns defaults for undefined/null/empty", () => {
    expect(parseSettings(undefined)).toEqual(defaultSettings);
    expect(parseSettings(null)).toEqual(defaultSettings);
    expect(parseSettings("")).toEqual(defaultSettings);
  });

  it("returns defaults for invalid JSON", () => {
    expect(parseSettings("{not json")).toEqual(defaultSettings);
  });

  it("parses a full valid object", () => {
    const raw = JSON.stringify({
      theme: "dark",
      wallpaper: "night",
      reduceTransparency: true,
      reduceMotion: true,
      largerText: true,
    });
    expect(parseSettings(raw)).toEqual({
      theme: "dark",
      wallpaper: "night",
      reduceTransparency: true,
      reduceMotion: true,
      largerText: true,
    });
  });

  it("falls back per-field for invalid enum values", () => {
    const raw = JSON.stringify({ theme: "neon", wallpaper: "beach" });
    const s = parseSettings(raw);
    expect(s.theme).toBe(defaultSettings.theme);
    expect(s.wallpaper).toBe(defaultSettings.wallpaper);
  });

  it("merges partial objects with defaults", () => {
    const s = parseSettings(JSON.stringify({ theme: "light" }));
    expect(s.theme).toBe("light");
    expect(s.wallpaper).toBe(defaultSettings.wallpaper);
    expect(s.reduceMotion).toBe(false);
  });

  it("coerces non-boolean flags to a boolean", () => {
    const s = parseSettings(JSON.stringify({ largerText: "yes" }));
    expect(s.largerText).toBe(true);
  });
});
