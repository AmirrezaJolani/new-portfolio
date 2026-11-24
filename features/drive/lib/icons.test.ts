import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACHIEVEMENTS } from "./achievements";
import { ICONS } from "./icons";

const ROOT = join(__dirname, "../../..");
const DIR = join(ROOT, "public/icons");
const files = readdirSync(DIR).filter((f) => f.endsWith(".svg"));

// Pictographs (🚗 🗺 ☀ ⌨…), except the ▶/◀ text arrows on the DRIVE/START buttons.
const EMOJI = /(?![▶◀])\p{Extended_Pictographic}/u;

describe("pixel icons", () => {
  it("every registered icon has an SVG, and every SVG is registered", () => {
    expect(new Set(ICONS).size).toBe(ICONS.length);
    expect(files.map((f) => f.replace(/\.svg$/, "")).sort()).toEqual(
      [...ICONS].sort(),
    );
  });

  it.each(files)("%s is a crisp 16×16 pixel grid", (file) => {
    const svg = readFileSync(join(DIR, file), "utf8");
    expect(svg).toMatch(/^<svg [^>]*viewBox="0 0 16 16"/);
    expect(svg).toContain('shape-rendering="crispEdges"');
    // Only whole-pixel rects inside the grid: no paths, scripts or links.
    const body = svg.replace(/^<svg[^>]*>|<\/svg>\s*$/g, "");
    const rects = body.match(/<rect [^>]*\/>/g) ?? [];
    expect(rects.length).toBeGreaterThan(0);
    expect(rects.join("")).toBe(body);
    for (const r of rects) {
      const n = (k: string) =>
        Number(r.match(new RegExp(`${k}="(\\d+)"`))?.[1]);
      expect(Number.isInteger(n("x")) && Number.isInteger(n("width"))).toBe(
        true,
      );
      expect(n("x") + n("width")).toBeLessThanOrEqual(16);
      expect(n("y") + n("height")).toBeLessThanOrEqual(16);
    }
  });

  it("achievements use registered icons", () => {
    for (const a of ACHIEVEMENTS) expect(ICONS).toContain(a.icon);
  });

  it("no emoji left in copy or game components (use <Icon>)", () => {
    const sources = [
      ...readdirSync(join(ROOT, "messages")).map((f) => join("messages", f)),
      ...readdirSync(join(ROOT, "features/drive/components")).map((f) =>
        join("features/drive/components", f),
      ),
      "features/drive/lib/achievements.ts",
      "features/drive/lib/content.ts",
    ];
    const hits = sources.filter((f) =>
      EMOJI.test(readFileSync(join(ROOT, f), "utf8")),
    );
    expect(hits).toEqual([]);
  });
});
