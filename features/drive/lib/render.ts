// Canvas renderer. Everything is drawn at a tiny internal resolution and
// scaled up with `image-rendering: pixelated`, so every fillRect is one pixel.
//
// Depth comes from sprite stacking: an object is a pile of 1px-tall horizontal
// slices, each drawn 1px higher than the last. Static objects (buildings,
// trees, lamps) are baked into one image at startup; only the car is
// re-stacked each frame because it rotates.

import {
  BUILDINGS,
  type Car,
  type CarModel,
  COLS,
  hash,
  LANDMARKS,
  LIGHTHOUSE,
  lamps,
  PIAZZA,
  padCenter,
  ROADS,
  ROWS,
  type SectionId,
  type Structure,
  TILE,
  tileAt,
  trees,
  WORLD_H,
  WORLD_W,
} from "@/workflows/driveWorld";

type Ctx = CanvasRenderingContext2D;

export type Theme = "day" | "sunset" | "night";
export const THEMES: Theme[] = ["sunset", "night", "day"];

// [lit window, unlit window, lamp bulb]
const WINDOWS: Record<Theme, [string, string, string]> = {
  day: ["#b8d4ef", "#7f9cc4", "#cfc6bd"],
  sunset: ["#ffd884", "#5b6a8f", "#ffe9a0"],
  night: ["#ffe9a0", "#2c3350", "#fff6c8"],
};

function canvas(w: number, h: number): [HTMLCanvasElement, Ctx] {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!];
}

const px = (g: Ctx, color: string, x: number, y: number, w = 1, h = 1) => {
  g.fillStyle = color;
  g.fillRect(x, y, w, h);
};

// A filled pixel disc in one stack slice.
function disc(g: Ctx, color: string, cx: number, cy: number, r: number) {
  g.fillStyle = color;
  for (let dy = -r; dy <= r; dy++) {
    const half = Math.round(Math.sqrt(r * r - dy * dy));
    g.fillRect(cx - half, cy + dy, half * 2 + 1, 1);
  }
}

const C = {
  water: "#38408c",
  waterHi: "#4a56b0",
  foam: "#f3e6d3",
  glint: "#ffb98a",
  sand: "#efc07e",
  sandDk: "#d9a066",
  grass: "#5d8d3c",
  grass2: "#59873a",
  grassHi: "#79a94b",
  grassDk: "#47752f",
  road: "#3d3850",
  roadHi: "#47425c",
  line: "#d9c8a6",
  dash: "#f6d36b",
  shadow: "#1e0a2c",
  stone: "#ddd3c4",
  stoneDk: "#c9bdab",
  stoneHi: "#eee6da",
};

// ---------- ground (baked once, includes static shadows) ----------

function buildGround() {
  const [c, g] = canvas(WORLD_W, WORLD_H);
  for (let ty = 0; ty < ROWS; ty++)
    for (let tx = 0; tx < COLS; tx++) {
      const t = tileAt(tx, ty);
      const x = tx * TILE;
      const y = ty * TILE;
      const r = (s: number) => Math.floor(hash(tx, ty, s) * 14) + 1;
      if (t === "water") {
        px(g, C.water, x, y, TILE, TILE);
        px(g, C.waterHi, x + r(5), y + r(6), 3, 1);
        // Foam where water meets land.
        const land = (dx: number, dy: number) =>
          tileAt(tx + dx, ty + dy) !== "water";
        if (land(0, -1))
          for (let i = 0; i < TILE; i += 2)
            px(g, C.foam, x + i, y + (i % 4 ? 0 : 1));
        if (land(0, 1))
          for (let i = 0; i < TILE; i += 2)
            px(g, C.foam, x + i, y + TILE - 1 - (i % 4 ? 0 : 1));
        if (land(-1, 0))
          for (let i = 0; i < TILE; i += 2)
            px(g, C.foam, x + (i % 4 ? 0 : 1), y + i);
        if (land(1, 0))
          for (let i = 0; i < TILE; i += 2)
            px(g, C.foam, x + TILE - 1 - (i % 4 ? 0 : 1), y + i);
      } else if (t === "sand") {
        px(g, C.sand, x, y, TILE, TILE);
        for (let i = 0; i < 4; i++)
          px(g, C.sandDk, x + r(10 + i), y + r(20 + i));
      } else if (t === "grass") {
        px(g, hash(tx, ty, 7) < 0.5 ? C.grass : C.grass2, x, y, TILE, TILE);
        for (let i = 0; i < 3; i++)
          px(g, C.grassHi, x + r(30 + i), y + r(40 + i), 1, 2);
        for (let i = 0; i < 2; i++)
          px(g, C.grassDk, x + r(50 + i), y + r(60 + i));
      } else if (t === "plaza") {
        // Piazza del Duomo paving: pale stone, an 8px grid, a diamond per tile.
        px(g, C.stone, x, y, TILE, TILE);
        px(g, C.stoneDk, x, y, TILE, 1);
        px(g, C.stoneDk, x, y + 8, TILE, 1);
        px(g, C.stoneDk, x, y, 1, TILE);
        px(g, C.stoneDk, x + 8, y, 1, TILE);
        for (let k = 0; k < 3; k++)
          px(g, C.stoneHi, x + 4 - k, y + 4 - (2 - k), 1 + 2 * k, 1);
      } else {
        px(g, C.road, x, y, TILE, TILE);
        for (let i = 0; i < 3; i++)
          px(g, C.roadHi, x + r(70 + i), y + r(80 + i));
        const off = (dx: number, dy: number) =>
          tileAt(tx + dx, ty + dy) !== "road";
        if (off(0, -1)) px(g, C.line, x, y + 1, TILE, 1);
        if (off(0, 1)) px(g, C.line, x, y + TILE - 2, TILE, 1);
        if (off(-1, 0)) px(g, C.line, x + 1, y, 1, TILE);
        if (off(1, 0)) px(g, C.line, x + TILE - 2, y, 1, TILE);
      }
    }

  // Dashed centre lines, skipped through intersections.
  for (const r of ROADS) {
    const horiz = r.w > r.h;
    const len = (horiz ? r.w : r.h) * TILE;
    for (let d = 2 * TILE; d < len - 2 * TILE; d += 12) {
      const tx = horiz ? r.x + Math.floor(d / TILE) : r.x;
      const ty = horiz ? r.y : r.y + Math.floor(d / TILE);
      const cross = horiz
        ? tileAt(tx, ty - 1) === "road" || tileAt(tx, ty + 2) === "road"
        : tileAt(tx - 1, ty) === "road" || tileAt(tx + 2, ty) === "road";
      if (cross) continue;
      if (horiz) px(g, C.dash, r.x * TILE + d, (r.y + 1) * TILE - 1, 6, 2);
      else px(g, C.dash, (r.x + 1) * TILE - 1, r.y * TILE + d, 2, 6);
    }
  }

  // Tram tracks across the piazza, under the parked tram.
  const tram = LANDMARKS.find((l) => l.kind === "tram")!;
  for (const dy of [5, 11])
    px(g, "#8d8f99", PIAZZA.x * TILE, tram.y * TILE + dy, PIAZZA.w * TILE, 1);

  // Long sunset shadows (sun low in the west → shadows fall east). Drawn
  // opaque on their own layer, then blended once, so overlaps stay even.
  const [s, sg] = canvas(WORLD_W, WORLD_H);
  sg.fillStyle = C.shadow;
  for (const b of [...BUILDINGS, ...LANDMARKS]) {
    const len = b.height * 0.9;
    for (let k = 0; k <= len; k++)
      sg.fillRect(
        b.x * TILE + k,
        b.y * TILE - k * 0.35,
        b.w * TILE,
        b.h * TILE,
      );
  }
  for (const t of [
    ...trees,
    { tx: LIGHTHOUSE.tx, ty: LIGHTHOUSE.ty, palm: false },
  ]) {
    const cx = t.tx * TILE + 8;
    const cy = t.ty * TILE + 10;
    const tall = t.tx === LIGHTHOUSE.tx && t.ty === LIGHTHOUSE.ty ? 40 : 12;
    for (let k = 0; k <= tall; k++)
      sg.fillRect(cx - 4 + k, cy - 3 - k * 0.35, 7, 5);
  }
  g.globalAlpha = 0.32;
  g.drawImage(s, 0, 0);
  g.globalAlpha = 1;
  return c;
}

// ---------- buildings ----------

type BuildingSprite = {
  b: Structure;
  img: HTMLCanvasElement;
  glow: HTMLCanvasElement; // lit windows only — punched through the night overlay
  x: number;
  y: number;
  smoke: { x: number; y: number }[]; // world coords of chimney tops
};

const UP = 40; // headroom above the walls for roofs, chimneys, antennas
const FRONT = 18; // room in front for awnings, tables, steps, flagpoles

// How far above the wall top the floating sign should sit.
const LABEL_LIFT: Record<Structure["kind"], number> = {
  house: 12,
  office: 12,
  factory: 16,
  garage: 2,
  cafe: 2,
  postoffice: 4,
  duomo: 6,
  galleria: 8,
  monument: 0,
  tram: 0,
  bosco: 4,
  velasca: 4,
  unicredit: 6,
};
export const labelTop = (b: Structure) =>
  b.y * TILE - b.height - LABEL_LIFT[b.kind];

function bakeBuilding(b: Structure, theme: Theme): BuildingSprite {
  const w = b.w * TILE;
  const d = b.h * TILE;
  const H = b.height;
  const Y0 = UP + H; // image y of the footprint's back edge at ground level
  const [c, g] = canvas(w, Y0 + d + FRONT);
  const [glow, gg] = canvas(w, Y0 + d + FRONT);
  const [lit, unlit] = WINDOWS[theme];
  const smoke: { x: number; y: number }[] = [];

  // A stacked box in footprint space: (x, gy) on the ground, slices z0..z1-1.
  const box = (
    x: number,
    gy: number,
    bw: number,
    bd: number,
    z0: number,
    z1: number,
    side: string,
    top = side,
  ) => {
    for (let z = z0; z < z1; z++) {
      px(g, z === z1 - 1 ? top : side, x, Y0 + gy - z, bw, bd);
      gg.clearRect(x, Y0 + gy - z, bw, bd);
    }
  };
  // Only each slice's bottom row survives the slice above it: that row is
  // the visible front wall, so `face` paints the wall at height z.
  // `faceAt` = the same for a box whose front edge sits at footprint row `gy`.
  const faceAt = (
    gy: number,
    z: number,
    x: number,
    fw: number,
    color: string,
  ) => px(g, color, x, Y0 + gy - z, fw, 1);
  const face = (z: number, x: number, fw: number, color: string) =>
    faceAt(d - 1, z, x, fw, color);
  const glowAtRow = (gy: number, z: number, x: number, fw: number) =>
    px(gg, "#000", x, Y0 + gy - z, fw, 1);
  const glowAt = (z: number, x: number, fw: number) =>
    px(gg, "#000", x, Y0 + d - 1 - z, fw, 1);
  const windowRect = (
    z0: number,
    z1: number,
    x: number,
    fw: number,
    forceOn = false,
  ) => {
    const on = forceOn || hash(x, z0, b.x) < 0.7;
    for (let z = z0; z < z1; z++) {
      face(z, x, fw, on ? lit : unlit);
      if (on) glowAt(z, x, fw);
    }
    face(z0, x, fw, "#00000040"); // sill
  };
  const roofY = Y0 - (H - 1); // image y of the flat roof's back edge

  switch (b.kind) {
    case "house": {
      box(0, 0, w, d, 0, H, "#ead6b2");
      face(0, 0, w, "#7a5a48");
      face(1, 0, w, "#7a5a48");
      windowRect(4, 10, 8, 14);
      windowRect(4, 10, w - 22, 14);
      for (let z = 0; z < 11; z++) face(z, w / 2 - 5, 10, "#6b3b2a");
      face(5, w / 2 + 2, 1, "#ffd884");
      windowRect(14, 21, 8, 12);
      windowRect(14, 21, w - 20, 12);
      windowRect(12, 21, w / 2 - 6, 12, true); // balcony door
      // Gable roof: each slice is 2px shallower front and back → a ridge.
      for (let k = 0; 4 * k < d + 2; k++)
        box(
          0,
          2 * k - 2,
          w,
          d + 4 - 4 * k,
          H + k,
          H + k + 1,
          k % 2 ? "#b53a30" : "#c4463a",
          4 * (k + 1) >= d + 2 ? "#8e2c25" : undefined,
        );
      box(w - 22, 14, 6, 6, H + 8, H + 22, "#8a5a48", "#3b2a3a"); // chimney
      // Balcony: a floating slab, posts, rail and two potted plants.
      box(w / 2 - 20, d, 40, 6, 11, 13, "#b9a68a", "#d9c6a8");
      box(w / 2 - 18, d + 1, 3, 2, 13, 17, "#3f8f45", "#5fb35a");
      box(w / 2 + 15, d + 1, 3, 2, 13, 17, "#3f8f45", "#ff7eb6");
      for (let x = w / 2 - 20; x < w / 2 + 20; x += 3)
        box(x, d + 5, 1, 1, 13, 18, "#3b2a3a");
      box(w / 2 - 20, d + 5, 40, 1, 18, 19, "#3b2a3a");
      // Front path.
      box(w / 2 - 4, d, 8, 16, 0, 1, "#cfc6bd");
      break;
    }
    case "office": {
      box(0, 0, w, d, 0, H, "#6d8fc0", "#3f4f7a");
      for (let z = 0; z < H - 1; z++)
        for (let x = 0; x < w; x++) {
          if (x % 10 === 0) face(z, x, 1, "#d9e2ef");
          else if (z % 6 === 0) face(z, x, 1, "#4a5d82");
          else if (z < 7) face(z, x, 1, "#2c3350");
          else {
            const on = hash(Math.floor(x / 10), Math.floor(z / 6), 99) < 0.65;
            const shine = theme !== "night" && ((x - z) & 31) < 4;
            face(z, x, 1, shine ? "#c8dcf5" : on ? lit : unlit);
            if (on) glowAt(z, x, 1);
          }
        }
      windowRect(0, 6, w / 2 - 6, 12, true); // lobby doors
      // Helipad.
      disc(g, "#2c3350", w / 2, roofY + d / 2, 16);
      disc(g, "#3f4f7a", w / 2, roofY + d / 2, 14);
      px(g, "#ffcf5c", w / 2 - 5, roofY + d / 2 - 6, 2, 12);
      px(g, "#ffcf5c", w / 2 + 3, roofY + d / 2 - 6, 2, 12);
      px(g, "#ffcf5c", w / 2 - 3, roofY + d / 2 - 1, 6, 2);
      box(w - 12, 10, 1, 1, H, H + 16, "#cfc6bd"); // antenna
      px(g, "#ff4d4d", w - 12, Y0 + 10 - H - 16, 1, 1);
      px(gg, "#000", w - 12, Y0 + 10 - H - 16, 1, 1);
      break;
    }
    case "factory": {
      box(0, 0, w, d, 0, H, "#a5523e", "#8d8f99");
      for (let z = 0; z < H - 1; z++)
        for (let x = 0; x < w; x++)
          if (z % 3 === 0 || (x + (Math.floor(z / 3) % 2) * 4) % 8 === 0)
            face(z, x, 1, "#7d3a2c"); // bricks
      // Big gridded factory windows.
      for (let k = 0; k < 5; k++) {
        if (k === 2) continue;
        const x0 = 8 + k * 28;
        for (let z = 5; z < 18; z++) face(z, x0, 19, "#3b2a3a");
        for (let p = 0; p < 3; p++)
          for (let q = 0; q < 3; q++)
            windowRect(6 + q * 4, 9 + q * 4, x0 + 1 + p * 6, 5);
      }
      for (let z = 0; z < 15; z++)
        face(
          z,
          w / 2 - 12,
          24,
          z === 14 ? "#3b2a3a" : z % 2 ? "#8d8f99" : "#a3a6b1",
        ); // loading door
      // Sawtooth roof: each column rises in a ramp, glass on the steep side.
      for (let x = 0; x < w; x++) {
        const rel = x % 24;
        const zt = Math.floor(rel / 3);
        const shade = [
          "#7c8190",
          "#838897",
          "#8b909e",
          "#9297a5",
          "#999eac",
          "#a0a5b3",
          "#a7acba",
          "#aeb3c1",
        ][zt];
        box(x, 0, 1, d, H, H + zt + 1, rel >= 21 ? "#9fd3ff" : shade);
      }
      for (const [cx, gy] of [
        [w - 18, 18],
        [w - 40, 12],
      ]) {
        for (let z = H; z < H + 30; z++)
          disc(
            g,
            Math.floor((z - H) / 5) % 2 ? "#f2ece0" : "#d2423a",
            cx,
            Y0 + gy - z,
            3,
          );
        disc(g, "#1b1622", cx, Y0 + gy - H - 30, 2);
        smoke.push({ x: cx, y: Y0 + gy - H - 32 });
      }
      break;
    }
    case "garage": {
      box(0, 0, w, d, 0, H, "#c98a4b", "#6b3e2e");
      for (let z = 0; z < H - 1; z++)
        for (let x = 0; x < w; x += 4) face(z, x, 1, "#b0763d");
      for (const [x0, open] of [
        [8, false],
        [50, true],
      ] as const) {
        for (let z = 0; z < 15; z++)
          face(
            z,
            x0,
            36,
            z === 14
              ? "#3b2a3a"
              : open && z < 9
                ? "#2a2233"
                : z % 2
                  ? "#9aa0aa"
                  : "#80858f",
          );
        if (open)
          for (let z = 1; z < 4; z++)
            face(z, x0 + 10, 16, z === 3 ? "#ef6150" : "#d8433f"); // a car inside
      }
      windowRect(6, 12, w - 16, 10);
      for (let z = 16; z < 20; z++)
        for (let x = 8; x < w - 26; x++)
          face(z, x, 1, (x + z) % 8 < 4 ? "#ffcf5c" : "#1d1530"); // hazard sign
      for (const sx of [10, 46, 82]) px(g, "#9fd3ff", sx, roofY + 10, 18, 6); // skylights
      for (let z = 0; z < 8; z++)
        disc(g, z % 2 ? "#1b1622" : "#2a2233", w - 10, Y0 + d + 7 - z, 3); // tyre stack
      disc(g, "#3b3346", w - 10, Y0 + d + 7 - 8, 1);
      box(w - 22, d + 4, 5, 4, 0, 8, "#2f6db5", "#4f8dd5"); // oil drum
      break;
    }
    case "cafe": {
      box(0, 0, w, d, 0, H, "#f2b5c4", "#a8435f");
      face(0, 0, w, "#7a3b4f");
      face(1, 0, w, "#7a3b4f");
      for (const x0 of [6, w / 2 + 8]) {
        windowRect(2, 11, x0, w / 2 - 14, true);
        for (let x = x0; x < x0 + w / 2 - 14; x += 10)
          for (let z = 2; z < 11; z++) face(z, x, 1, "#7a3b4f");
      }
      for (let z = 0; z < 12; z++) face(z, w / 2 - 5, 10, "#7a3b4f");
      for (const x of [10, 34, 54, 78]) {
        windowRect(14, 18, x, 8);
        face(13, x - 1, 10, "#3f8f45");
        face(13, x + 1, 1, "#ff4d4d");
        face(13, x + 6, 1, "#ffcf5c");
      }
      // Striped awning sloping out over the pavement.
      for (let j = 0; j < 8; j++)
        for (let x = 4; x < w - 4; x++)
          box(
            x,
            d + j,
            1,
            1,
            13 - (j >> 1),
            14 - (j >> 1),
            Math.floor(x / 6) % 2 ? "#fff3e8" : "#d94f78",
          );
      // Outdoor tables with umbrellas.
      for (const tx of [14, w - 22]) {
        box(tx - 3, d + 13, 2, 2, 0, 3, "#3b2a3a");
        box(tx + 7, d + 13, 2, 2, 0, 3, "#3b2a3a");
        box(tx, d + 12, 6, 3, 0, 4, "#6b4226", "#8a5a33");
        box(tx + 3, d + 13, 1, 1, 4, 11, "#cfc6bd");
        disc(g, "#ffcf5c", tx + 3, Y0 + d + 13 - 11, 5);
        disc(g, "#ff7eb6", tx + 3, Y0 + d + 13 - 11, 2);
      }
      break;
    }
    case "postoffice": {
      box(0, 0, w, d, 0, H, "#e9e1c9", "#2f6db5");
      face(0, 0, w, "#9a8f86");
      face(1, 0, w, "#9a8f86");
      for (let x0 = 8; x0 < w - 8; x0 += 16)
        if (Math.abs(x0 + 3 - w / 2) > 10) windowRect(6, 18, x0, 6);
      for (let x = 0; x < w; x++) {
        const m = x % 16;
        if (m >= 2 && m <= 5)
          for (let z = 2; z < H - 4; z++)
            face(z, x, 1, m === 5 ? "#cfc6bd" : "#fffaf0"); // columns
      }
      for (let z = H - 4; z < H - 1; z++) face(z, 0, w, "#cfc6bd");
      for (let x = 0; x < w; x += 3) face(H - 4, x, 1, "#9a8f86");
      for (let z = 0; z < 15; z++) face(z, w / 2 - 7, 14, "#2f4f7a");
      windowRect(12, 15, w / 2 - 7, 14, true); // transom
      // Clock above the door.
      for (let dz = -3; dz <= 3; dz++) {
        const half = Math.round(Math.sqrt(9 - dz * dz));
        face(19 + dz, w / 2 - half, half * 2 + 1, "#fffaf0");
      }
      face(19, w / 2, 3, "#1d1530");
      face(20, w / 2, 1, "#1d1530");
      face(21, w / 2, 1, "#1d1530");
      box(w / 2 - 16, d, 32, 3, 0, 2, "#cfc6bd", "#e9e1c9"); // steps
      box(w / 2 - 12, d + 3, 24, 2, 0, 1, "#cfc6bd");
      box(8, d + 6, 1, 1, 0, 44, "#cfc6bd"); // flagpole + flag
      for (let z = 36; z < 44; z++)
        box(
          9,
          d + 6,
          12,
          1,
          z,
          z + 1,
          z < 38 ? "#2f6db5" : z < 41 ? "#fffaf0" : "#ff9a5c",
        );
      box(w - 16, d + 6, 5, 4, 0, 9, "#d2423a", "#a8322f"); // post box
      break;
    }

    // ---------- Milan ----------
    case "duomo": {
      const marble = "#efe6dc";
      const marbleHi = "#fbf6ee";
      const marbleDk = "#d9ccbd";
      const glass = theme === "night" ? lit : "#6f7fc0";
      box(0, 0, w, d, 0, H, marble, "#cfc4b6");
      box(16, 8, w - 32, d - 16, H, H + 4, marbleDk, "#c4b8a8"); // raised nave roof
      // Five bronze portals, a tall stained-glass window over each.
      for (const [cx, dw, dh] of [
        [w / 2, 14, 14],
        [w / 2 - 46, 8, 10],
        [w / 2 + 46, 8, 10],
        [w / 2 - 80, 8, 10],
        [w / 2 + 80, 8, 10],
      ]) {
        for (let z = 0; z < dh; z++) {
          const fw = z > dh - 4 ? dw - 2 * (z - (dh - 4)) : dw;
          face(z, cx - fw / 2, fw, "#6b4f3a");
        }
        for (let z = dh + 3; z < dh + 12; z++) {
          const fw = z > dh + 9 ? 2 : 4;
          face(z, cx - fw / 2, fw, glass);
          glowAt(z, cx - fw / 2, fw);
        }
      }
      // Pilasters that rise past the roofline into spires (guglie).
      for (let x = 2; x < w; x += 23) {
        for (let z = 0; z < H; z++) face(z, x, 3, marbleHi);
        box(x, d - 3, 3, 3, H, H + 10, marbleHi);
        box(x + 1, d - 2, 1, 1, H + 10, H + 14, marbleHi);
      }
      // Front gable.
      for (let k = 0; k < 15; k++)
        box(
          w / 2 - 30 + 2 * k,
          d - 2,
          60 - 4 * k,
          2,
          H + k,
          H + k + 1,
          k % 3 ? marble : marbleHi,
        );
      // The forest of spires along the roof.
      for (let x = 10; x < w - 8; x += 12)
        for (const gy of [6, d - 14])
          box(
            x,
            gy,
            2,
            2,
            H,
            H + 12 + Math.floor(hash(x, gy, 5) * 6),
            marbleHi,
          );
      // Tiburio + main spire with the golden Madonnina on top.
      for (let z = H + 4; z < H + 14; z++)
        disc(g, z % 3 ? marble : marbleDk, w / 2, Y0 + d / 2 - z, 6);
      for (let z = H + 14; z < H + 36; z++)
        disc(
          g,
          z % 4 ? marbleHi : marbleDk,
          w / 2,
          Y0 + d / 2 - z,
          Math.max(0, Math.round(3 - (z - H - 14) / 8)),
        );
      px(g, "#ffd24a", w / 2, Y0 + d / 2 - H - 38, 1, 2);
      px(gg, "#000", w / 2, Y0 + d / 2 - H - 38, 1, 2);
      box(w / 2 - 40, d, 80, 6, 0, 2, marbleDk, marble); // steps
      break;
    }
    case "galleria": {
      const ochre = "#e8c48a";
      box(0, 0, w, d, 0, H, ochre, "#b98f5a");
      for (let z = H - 5; z < H - 2; z++) face(z, 0, w, "#f3dcb0"); // cornice
      // The great triumphal arch, shops glowing inside.
      for (let z = 0; z < 22; z++) {
        const half =
          z <= 13
            ? 13
            : Math.round(Math.sqrt(Math.max(0, 169 - ((z - 13) * 1.45) ** 2)));
        if (!half) continue;
        face(z, w / 2 - half, half * 2, z < 10 ? lit : "#7d8fb0");
        if (z < 10) glowAt(z, w / 2 - half, half * 2);
      }
      for (const x of [5, w - 13]) {
        windowRect(4, 9, x, 8, true);
        windowRect(14, 20, x, 8);
      }
      box(w / 2 - 16, d - 2, 32, 2, H, H + 6, ochre, "#f3dcb0"); // parapet over the arch
      // Glass barrel vaults in a cross (as seen from above), a glass dome where they meet.
      for (let k = 0; k < 9; k++) {
        const half = Math.round(Math.sqrt(81 - k * k));
        const top = k === 8 ? "#d6ecf8" : "#9fc6e0";
        box(w / 2 - half, 2, half * 2, d - 6, H + k, H + k + 1, "#9fc6e0", top);
        box(2, d / 2 - half, w - 4, half * 2, H + k, H + k + 1, "#9fc6e0", top);
      }
      // Iron ribs arching over the glass every 8px.
      for (let gy = 4; gy < d - 4; gy += 8)
        for (let dx = -9; dx <= 9; dx++)
          px(
            g,
            "#5a6a8a",
            w / 2 + dx,
            Y0 + gy - H - Math.round(Math.sqrt(81 - dx * dx)),
            1,
            1,
          );
      for (let k = 0; k < 10; k++)
        disc(
          g,
          k === 0 ? "#5a6a8a" : k > 7 ? "#d6ecf8" : "#9fc6e0",
          w / 2,
          Y0 + d / 2 - (H + 8 + k),
          Math.round(Math.sqrt(100 - k * k)),
        );
      break;
    }
    case "monument": {
      // Vittorio Emanuele II on horseback, in green bronze.
      box(3, 3, 10, 9, 0, 8, "#cfc6bd", "#e3dcd2");
      for (const lx of [5, 10]) box(lx, 7, 1, 2, 8, 11, "#3f5a4a");
      box(4, 6, 8, 3, 11, 14, "#4f6b5a", "#5f7d6a");
      box(11, 6, 2, 2, 14, 17, "#4f6b5a", "#5f7d6a");
      box(7, 6, 2, 3, 14, 20, "#4f6b5a", "#5f7d6a");
      break;
    }
    case "tram": {
      // A "Ventotto": Milan's orange 1928 tram, still in service.
      box(6, 5, 4, 7, 0, 1, "#1b1622");
      box(38, 5, 4, 7, 0, 1, "#1b1622");
      box(2, 4, 44, 9, 1, H, "#f29a2e", "#c9c3b8");
      faceAt(12, 3, 2, 44, "#f6e3c0");
      for (let x = 5; x < 44; x += 6)
        for (let z = 6; z < 10; z++) {
          faceAt(12, z, x, 4, theme === "night" ? lit : "#3a4a6a");
          if (theme === "night") glowAtRow(12, z, x, 4);
        }
      box(22, 7, 1, 1, H, H + 5, "#3b3346"); // pantograph
      box(18, 7, 9, 1, H + 5, H + 6, "#3b3346");
      break;
    }
    case "bosco": {
      // Bosco Verticale: two towers wearing a forest on every balcony.
      const tower = (x0: number, gy0: number, h: number) => {
        box(x0, gy0, 32, 32, 0, h, "#8f8a84", "#6f6a66");
        const fy = gy0 + 31;
        for (let z = 0; z < h; z++) {
          const rel = z % 6;
          for (let x = 0; x < 32; x++) {
            const n = hash(x0 + x, z, 77);
            if (rel === 0) faceAt(fy, z, x0 + x, 1, "#c9c3b8");
            else if (rel <= 2)
              faceAt(
                fy,
                z,
                x0 + x,
                1,
                n < 0.45
                  ? "#3f8f45"
                  : n < 0.75
                    ? "#5fb35a"
                    : n < 0.85
                      ? "#2f6a35"
                      : "#6f6a66",
              );
            else if (x % 8 < 6) {
              const on =
                hash(Math.floor((x0 + x) / 8), Math.floor(z / 6), 78) < 0.6;
              faceAt(fy, z, x0 + x, 1, on ? lit : unlit);
              if (on) glowAtRow(fy, z, x0 + x, 1);
            }
          }
        }
        for (let k = 0; k < 6; k++)
          disc(
            g,
            k % 2 ? "#5fb35a" : "#3f8f45",
            x0 + 6 + k * 4,
            Y0 + gy0 + 6 + (k % 3) * 8 - h - 1,
            2,
          ); // roof garden
      };
      tower(0, 0, H);
      tower(46, 14, H - 14);
      break;
    }
    case "velasca": {
      // Torre Velasca: a slim shaft under a wider "mushroom" top on splayed struts.
      const brick = "#c99a7a";
      box(6, 6, 36, 34, 0, 44, brick, "#a87c62");
      for (let z = 0; z < 44; z++)
        for (let x = 6; x < 42; x++) {
          if (x % 6 === 0) faceAt(39, z, x, 1, "#e0b898");
          else if (z % 4 === 1 || z % 4 === 2) {
            const on = hash(Math.floor(x / 6), Math.floor(z / 4), 88) < 0.55;
            faceAt(39, z, x, 1, on ? lit : unlit);
            if (on) glowAtRow(39, z, x, 1);
          }
        }
      for (const x of [6, 18, 28, 40])
        for (let k = 0; k < 7; k++) box(x, 39 + k, 2, 1, 37 + k, 44, "#e0b898");
      box(0, 0, w, d, 44, H, brick, "#8a6a5a");
      for (let z = 44; z < H - 1; z++)
        for (let x = 0; x < w; x++) {
          if (x % 6 === 0) face(z, x, 1, "#e0b898");
          else if (z % 4 === 1 || z % 4 === 2) {
            const on = hash(Math.floor(x / 6), Math.floor(z / 4), 89) < 0.55;
            face(z, x, 1, on ? lit : unlit);
            if (on) glowAt(z, x, 1);
          }
        }
      box(10, 10, 12, 10, H, H + 5, "#8a6a5a", "#6f5548");
      box(28, 26, 10, 10, H, H + 3, "#8a6a5a", "#6f5548");
      break;
    }
    case "unicredit": {
      // UniCredit Tower: a curved glass crown sweeping up into the spire.
      box(4, 4, 40, 40, 0, H, "#6f9fd8", "#4f78a8");
      for (let z = 0; z < H; z++)
        for (let x = 4; x < 44; x++) {
          if (z % 4 === 0) {
            faceAt(43, z, x, 1, "#4f78a8");
            continue;
          }
          const on = hash(Math.floor(x / 5), Math.floor(z / 4), 66) < 0.6;
          const shine = theme !== "night" && ((x - z) & 31) < 4;
          faceAt(
            43,
            z,
            x,
            1,
            shine
              ? "#d0e4f8"
              : theme === "night"
                ? on
                  ? lit
                  : unlit
                : "#8fb8e8",
          );
          if (theme === "night" && on) glowAtRow(43, z, x, 1);
        }
      for (let k = 0; k < 10; k++)
        box(
          4 + k * 3,
          4,
          40 - k * 3,
          40,
          H + k,
          H + k + 1,
          "#6f9fd8",
          "#9fc6f0",
        );
      box(40, 22, 2, 2, H + 9, H + 28, "#e0e6ee");
      box(40, 22, 1, 1, H + 28, H + 38, "#e0e6ee");
      px(g, "#ff4d4d", 40, Y0 + 22 - H - 38, 1, 1);
      px(gg, "#000", 40, Y0 + 22 - H - 38, 1, 1);
      break;
    }
  }

  const x = b.x * TILE;
  const y = b.y * TILE - Y0;
  return {
    b,
    img: c,
    glow,
    x,
    y,
    smoke: smoke.map((p) => ({ x: x + p.x, y: y + p.y })),
  };
}

// ---------- small props ----------

function bakeTree(): HTMLCanvasElement {
  const [c, g] = canvas(16, 30);
  const base = 22;
  for (let i = 0; i < 5; i++) px(g, "#6b4226", 7, base - i, 2, 2);
  const radii = [4, 5, 6, 7, 7, 7, 6, 6, 5, 4, 2];
  const shades = [
    "#2f5f2c",
    "#2f5f2c",
    "#3b7233",
    "#3b7233",
    "#4a853b",
    "#4a853b",
    "#5b9a42",
    "#5b9a42",
    "#6fae4a",
    "#7fbf55",
    "#8fcf5f",
  ];
  for (const [k, r] of radii.entries()) disc(g, shades[k], 8, base - 5 - k, r);
  return c;
}

function bakePalm(): HTMLCanvasElement {
  const [c, g] = canvas(20, 32);
  const base = 26;
  for (let i = 0; i < 15; i++)
    px(
      g,
      i % 3 ? "#8a5a33" : "#a06d3f",
      9 + Math.round(i * 0.2),
      base - i,
      2,
      2,
    );
  const cx = 12;
  const cy = base - 16;
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
  ];
  for (const [layer, color] of [
    [0, "#2f7a3c"],
    [1, "#4f9f4a"],
  ] as const)
    for (const [dx, dy] of dirs)
      for (let k = 1; k <= 7; k++)
        px(g, color, cx + dx * k, cy - layer + dy * k + (k > 4 ? 1 : 0), 2, 1);
  px(g, "#6b4a2a", cx - 1, cy - 1, 3, 2); // coconuts
  return c;
}

function bakeLighthouse(): HTMLCanvasElement {
  const [c, g] = canvas(16, 62);
  const base = 54;
  for (let i = 0; i < 48; i++) {
    const r =
      i < 4
        ? 6
        : i < 40
          ? Math.round(5 - (i - 4) / 24)
          : i < 44
            ? 3
            : i < 46
              ? 4
              : 2;
    const color =
      i < 4
        ? "#9a8f86"
        : i < 40
          ? Math.floor((i - 4) / 7) % 2
            ? "#f2ece0"
            : "#d2423a"
          : i < 44
            ? "#ffe27a"
            : "#3b3346";
    disc(g, color, 8, base - i, r);
  }
  return c;
}

const LAMP_BASE = 22;
function bakeLamp(theme: Theme): HTMLCanvasElement {
  const [c, g] = canvas(8, 26);
  px(g, "#3b3346", 2, LAMP_BASE, 3, 1);
  for (let z = 0; z < 19; z++) px(g, "#3b3346", 3, LAMP_BASE - z, 1, 1);
  px(g, "#3b3346", 3, LAMP_BASE - 19, 4, 2);
  px(g, WINDOWS[theme][2], 5, LAMP_BASE - 17, 2, 1);
  return c;
}

// ---------- me ----------

// Shared with the HOME portrait (components/PixelMe.tsx) so both match.
export const ME_PALETTE: Record<string, string> = {
  K: "#1b1424", // outline
  H: "#2b1d18", // hair
  h: "#4a3328", // hair highlight
  S: "#eab48e", // skin
  s: "#c88a68", // skin shade
  E: "#1b1424", // eyes
  B: "#c49579", // stubble
  M: "#8f4a44", // mouth
  J: "#2a2534", // sweater
  j: "#3d3750", // sweater highlight
  k: "#17131f", // sweater shadow
  D: "#4170b0", // jeans
  d: "#2e5288", // jeans seam
  l: "#6a95cf", // jeans light
};

// Mini me standing in HOME's front yard: idle, then two wave frames.
const MINI_ME = [
  [
    "..KKK....",
    ".KHhHK...",
    "KHHHHHK..",
    "KSESESK..",
    ".KSSSK...",
    ".KjJjK...",
    "KJJJJJK..",
    "KJJJJJK..",
    "KSJJJSK..",
    ".KDdDK...",
    ".KDKDK...",
    ".KK.KK...",
  ],
  [
    "..KKK....",
    ".KHhHK.KS",
    "KHHHHHKJK",
    "KSESESKJ.",
    ".KSSSKJ..",
    ".KjJjJ...",
    "KJJJJJK..",
    "KJJJJJK..",
    "KSJJJJK..",
    ".KDdDK...",
    ".KDKDK...",
    ".KK.KK...",
  ],
];
// Wave frame 2: hand swings from overhead out to the side.
MINI_ME.push(
  MINI_ME[1].map(
    (r, y) => [r, ".KHhHK...", "KHHHHHK..", "KSESESK.S", ".KSSSKJK."][y] ?? r,
  ),
);
export const ME_SPOT = { x: 11 * TILE + 52, y: 14 * TILE + 12 }; // feet, beside HOME's path

function bakeGrid(rows: string[]): HTMLCanvasElement {
  const [c, g] = canvas(rows[0].length, rows.length);
  for (const [y, row] of rows.entries())
    for (const [x, ch] of [...row].entries())
      if (ch !== ".") px(g, ME_PALETTE[ch], x, y);
  return c;
}

// ---------- cars ----------

const CAR_W = 8;
const CAR_LEN: Record<CarModel["id"], number> = {
  coupe: 14,
  taxi: 14,
  van: 16,
  buggy: 12,
  pickup: 16,
};

// Each car is a list of 1px slices, bottom to top, facing up (front = row 0).
function bakeCar(id: CarModel["id"]): HTMLCanvasElement[] {
  const L = CAR_LEN[id];
  const layers: HTMLCanvasElement[] = [];
  const add = (draw: (g: Ctx) => void) => {
    const [c, g] = canvas(CAR_W, L);
    draw(g);
    layers.push(c);
  };
  const body = (g: Ctx, color: string) => {
    px(g, color, 0, 1, CAR_W, L - 2);
    px(g, color, 1, 0, CAR_W - 2, L);
  };
  const wheels = (g: Ctx) => {
    px(g, "#2a2233", 1, 1, CAR_W - 2, L - 2);
    for (const y of [2, L - 5]) {
      px(g, "#141019", 0, y, 1, 3);
      px(g, "#141019", CAR_W - 1, y, 1, 3);
    }
  };
  const lights = (g: Ctx) => {
    px(g, "#fff3b0", 1, 0, 2, 1);
    px(g, "#fff3b0", 5, 0, 2, 1);
    px(g, "#ff4d4d", 1, L - 1, 2, 1);
    px(g, "#ff4d4d", 5, L - 1, 2, 1);
  };
  const glass = (g: Ctx, y: number, h: number) => {
    px(g, "#7bb6e6", 1, y, 6, h);
    px(g, "#bfe4ff", 1, y, 6, 1);
  };
  const sedan = (
    dark: string,
    mid: string,
    hi: string,
    top: (g: Ctx) => void,
  ) => {
    add(wheels);
    add(wheels);
    add((g) => body(g, dark));
    add((g) => {
      body(g, mid);
      lights(g);
    });
    add((g) => {
      body(g, hi);
      top(g);
    });
    add((g) => glass(g, 4, 7));
    add((g) => glass(g, 4, 7));
  };

  switch (id) {
    case "coupe":
      sedan("#a93432", "#d8433f", "#ef6150", (g) =>
        px(g, "#f5e6d3", 3, 0, 2, L),
      );
      add((g) => {
        px(g, "#ef6150", 1, 5, 6, 5);
        px(g, "#f5e6d3", 3, 5, 2, 5); // racing stripe
      });
      break;
    case "taxi":
      sedan("#c9971f", "#f2c230", "#ffd84a", (g) => {
        for (let x = 0; x < CAR_W; x++)
          px(g, x % 2 ? "#1d1530" : "#fff3e8", x, 11, 1, 1); // checker band
      });
      add((g) => px(g, "#ffd84a", 1, 5, 6, 5));
      add((g) => {
        px(g, "#fff3e8", 2, 6, 4, 2); // TAXI sign
        px(g, "#d2423a", 3, 6, 2, 1);
      });
      break;
    case "van":
      add(wheels);
      add(wheels);
      add((g) => body(g, "#4f9e8c"));
      add((g) => {
        body(g, "#7fd6c2");
        lights(g);
      });
      add((g) => body(g, "#7fd6c2"));
      for (let k = 0; k < 2; k++)
        add((g) => {
          body(g, "#f3efe6");
          px(g, "#7bb6e6", 1, 0, 6, 1); // windscreen
          for (let y = 3; y < L - 2; y += 3) {
            px(g, "#7bb6e6", 0, y, 1, 2); // side windows
            px(g, "#7bb6e6", CAR_W - 1, y, 1, 2);
          }
        });
      add((g) => px(g, "#f3efe6", 1, 1, 6, L - 2));
      add((g) => {
        px(g, "#ff9a5c", 2, 2, 4, L - 4); // surfboard
        px(g, "#ffcf5c", 3, 2, 2, L - 4);
      });
      break;
    case "buggy":
      for (let k = 0; k < 3; k++)
        add((g) => {
          for (const [x, y] of [
            [0, 1],
            [6, 1],
            [0, 8],
            [6, 8],
          ])
            px(g, "#141019", x, y, 2, 3); // fat tyres
          px(g, "#3b3346", 2, 2, 4, 1);
          px(g, "#3b3346", 2, 9, 4, 1);
          if (k === 2) px(g, "#d96a22", 1, 0, 6, L);
        });
      add((g) => {
        px(g, "#ff8a3d", 1, 0, 6, L);
        px(g, "#fff3b0", 1, 0, 2, 1);
        px(g, "#fff3b0", 5, 0, 2, 1);
        px(g, "#ff4d4d", 2, L - 1, 4, 1);
        px(g, "#3b2a3a", 2, 4, 4, 4); // seats
        px(g, "#1d1530", 3, 3, 2, 1); // wheel
      });
      for (let k = 0; k < 2; k++)
        add((g) => {
          for (const [x, y] of [
            [1, 4],
            [6, 4],
            [1, 8],
            [6, 8],
          ])
            px(g, "#cfc6bd", x, y); // roll-cage posts
        });
      add((g) => {
        px(g, "#cfc6bd", 1, 4, 6, 1);
        px(g, "#cfc6bd", 1, 8, 6, 1);
        px(g, "#cfc6bd", 1, 4, 1, 5);
        px(g, "#cfc6bd", 6, 4, 1, 5);
      });
      break;
    case "pickup":
      add(wheels);
      add(wheels);
      add((g) => body(g, "#2f5fa8"));
      add((g) => {
        body(g, "#3f7fd6");
        lights(g);
      });
      add((g) => {
        body(g, "#5c9cf0");
        px(g, "#22324f", 1, 9, 6, 6); // open bed
        px(g, "#a06d3f", 2, 10, 3, 3); // crate
      });
      add((g) => {
        glass(g, 3, 5);
        px(g, "#c48a4f", 2, 10, 3, 3);
      });
      add((g) => glass(g, 3, 5));
      add((g) => px(g, "#5c9cf0", 1, 4, 6, 3));
      break;
  }
  return layers;
}

const carCache = new Map<CarModel["id"], HTMLCanvasElement[]>();
const carLayers = (id: CarModel["id"]) => {
  if (!carCache.has(id)) carCache.set(id, bakeCar(id));
  return carCache.get(id)!;
};

// Garage preview: the same stacked sprite, drawn into a small canvas.
export function drawCarPreview(
  c: HTMLCanvasElement,
  id: CarModel["id"],
  angle: number,
) {
  const g = c.getContext("2d")!;
  g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, c.width, c.height);
  drawCar(
    g,
    carLayers(id),
    { x: c.width / 2, y: c.height / 2 + 4, angle, speed: 0 },
    0,
    0,
  );
}

// ---------- assets + frame ----------

type Entity = {
  baseY: number;
  draw: (g: Ctx, ox: number, oy: number) => void;
  x: number;
  w: number;
  top: number;
};

export type Assets = {
  theme: Theme;
  ground: HTMLCanvasElement;
  buildings: BuildingSprite[];
  statics: Entity[];
  me: HTMLCanvasElement[];
};

export function createAssets(theme: Theme): Assets {
  const tree = bakeTree();
  const palm = bakePalm();
  const light = bakeLighthouse();
  const lamp = bakeLamp(theme);
  const statics: Entity[] = [];
  const sprite = (
    img: HTMLCanvasElement,
    x: number,
    y: number,
    baseY: number,
  ) =>
    statics.push({
      baseY,
      x,
      w: img.width,
      top: y,
      draw: (g, ox, oy) => g.drawImage(img, x - ox, y - oy),
    });

  const buildings = [...BUILDINGS, ...LANDMARKS].map((b) =>
    bakeBuilding(b, theme),
  );
  for (const s of buildings) sprite(s.img, s.x, s.y, (s.b.y + s.b.h) * TILE);
  for (const t of trees) {
    const img = t.palm ? palm : tree;
    sprite(
      img,
      t.tx * TILE + (t.palm ? -2 : 0),
      t.ty * TILE + 16 - img.height + (t.palm ? 2 : 0),
      t.ty * TILE + 14,
    );
  }
  for (const l of lamps) sprite(lamp, l.x - 3, l.y - LAMP_BASE, l.y);
  sprite(
    light,
    LIGHTHOUSE.tx * TILE,
    LIGHTHOUSE.ty * TILE + 16 - light.height + 4,
    LIGHTHOUSE.ty * TILE + 14,
  );
  return {
    theme,
    ground: buildGround(),
    buildings,
    statics,
    me: MINI_ME.map(bakeGrid),
  };
}

export type Scene = {
  car: Car;
  model: CarModel["id"];
  cam: { x: number; y: number };
  t: number;
  target: { x: number; y: number } | null;
  pad: SectionId | null;
  skids: Skid[];
};

/** Where the car was sliding: world position, heading, time (s). */
export type Skid = { x: number; y: number; a: number; t: number };
const SKID_LIFE = 4; // seconds until a mark has faded out

export function renderFrame(
  g: Ctx,
  a: Assets,
  s: Scene,
  vw: number,
  vh: number,
) {
  const ox = Math.round(s.cam.x);
  const oy = Math.round(s.cam.y);
  g.imageSmoothingEnabled = false;
  px(g, C.water, 0, 0, vw, vh);
  g.drawImage(a.ground, -ox, -oy);

  // Sun glints dancing on visible water.
  const tx0 = Math.max(0, Math.floor(ox / TILE));
  const ty0 = Math.max(0, Math.floor(oy / TILE));
  for (let ty = ty0; ty <= Math.min(ROWS - 1, ty0 + vh / TILE + 1); ty++)
    for (let tx = tx0; tx <= Math.min(COLS - 1, tx0 + vw / TILE + 1); tx++) {
      if (tileAt(tx, ty) !== "water") continue;
      const h = hash(tx, ty, 9);
      if (h > 0.25 || (s.t * 1.5 + h * 17) % 3 > 1) continue;
      px(
        g,
        a.theme === "night" ? "#c8d4ff" : C.glint,
        tx * TILE + (Math.floor(h * 40) % 12) - ox,
        ty * TILE + (Math.floor(h * 90) % 14) - oy,
        2,
        1,
      );
    }

  // Parking pads pulse; the one you're on glows solid.
  for (const b of BUILDINGS) {
    const x = b.pad.x * TILE - ox;
    const y = b.pad.y * TILE - oy;
    const w = b.pad.w * TILE;
    const h = b.pad.h * TILE;
    g.globalAlpha = s.pad === b.id ? 0.45 : 0.18 + 0.12 * Math.sin(s.t * 4);
    px(g, b.accent, x, y, w, h);
    g.globalAlpha = 1;
    for (let i = 0; i < w; i += 4) {
      px(g, b.accent, x + i, y, 2, 1);
      px(g, b.accent, x + i, y + h - 1, 2, 1);
    }
    for (let i = 0; i < h; i += 4) {
      px(g, b.accent, x, y + i, 1, 2);
      px(g, b.accent, x + w - 1, y + i, 1, 2);
    }
    const c = padCenter(b);
    const bob = Math.round(Math.sin(s.t * 5) * 1.5);
    for (let k = 0; k < 3; k++)
      px(g, b.accent, c.x - ox - k, c.y - oy - 3 + k + bob, k * 2 + 1, 1); // ▲
  }

  // Skid marks: one dot per rear tyre, 5px behind the centre, 3px either side.
  for (const k of s.skids) {
    const age = s.t - k.t;
    if (age > SKID_LIFE) continue;
    g.globalAlpha = 0.35 * (1 - age / SKID_LIFE);
    const [fx, fy] = [Math.sin(k.a), -Math.cos(k.a)];
    for (const side of [-3, 3])
      px(
        g,
        C.shadow,
        Math.round(k.x - fx * 5 + fy * -side - ox),
        Math.round(k.y - fy * 5 + fx * side - oy),
        2,
        2,
      );
  }
  g.globalAlpha = 1;

  // Y-sorted draw list: everything visible + the car.
  const carEntity: Entity = {
    baseY: s.car.y + 6,
    x: 0,
    w: 0,
    top: 0,
    draw: (gg) => drawCar(gg, carLayers(s.model), s.car, ox, oy),
  };
  const list = a.statics.filter(
    (e) =>
      e.x + e.w > ox && e.x < ox + vw && e.top < oy + vh && e.baseY + 20 > oy,
  );
  list.push(carEntity);
  // Mini me waves while your car is close by.
  const near = Math.hypot(s.car.x - ME_SPOT.x, s.car.y - ME_SPOT.y) < 72;
  const meImg = a.me[near ? 1 + (Math.floor(s.t * 4) % 2) : 0];
  list.push({
    baseY: ME_SPOT.y,
    x: 0,
    w: 0,
    top: 0,
    draw: (gg) =>
      gg.drawImage(meImg, ME_SPOT.x - 3 - ox, ME_SPOT.y - meImg.height - oy),
  });
  list.sort((p, q) => p.baseY - q.baseY);
  for (const e of list) e.draw(g, ox, oy);

  // Factory smoke drifting east with the evening breeze.
  for (const b of a.buildings)
    for (const p of b.smoke)
      for (let k = 0; k < 5; k++) {
        const f = (s.t * 0.35 + k / 5) % 1;
        g.globalAlpha = 0.55 * (1 - f);
        disc(
          g,
          "#d8d2e0",
          Math.round(p.x + f * 16 + Math.sin(s.t * 2 + k) * 1.5 - ox),
          Math.round(p.y - f * 28 - oy),
          Math.round(1 + f * 4),
        );
      }
  g.globalAlpha = 1;

  // Lighthouse lamp glow.
  const lampX = LIGHTHOUSE.tx * TILE + 8 - ox;
  const lampY = LIGHTHOUSE.ty * TILE - 30 - oy;
  g.globalAlpha = 0.25 + 0.2 * Math.sin(s.t * 3);
  disc(g, "#ffe27a", lampX, lampY, 7);
  g.globalAlpha = 1;

  if (a.theme === "night") nightPass(g, a, s, ox, oy, vw, vh);
  if (s.target) drawCompass(g, s.car, s.target, ox, oy, s.t);
}

// Night: darken everything, then punch light back out of the darkness —
// windows (baked glow masks), street lamps, headlights, lighthouse, pads.
let dark: [HTMLCanvasElement, Ctx] | null = null;
function nightPass(
  g: Ctx,
  a: Assets,
  s: Scene,
  ox: number,
  oy: number,
  vw: number,
  vh: number,
) {
  if (!dark || dark[0].width !== vw || dark[0].height !== vh)
    dark = canvas(vw, vh);
  const [dc, d] = dark;
  d.globalCompositeOperation = "source-over";
  d.globalAlpha = 1;
  d.clearRect(0, 0, vw, vh);
  px(d, "rgba(10, 12, 38, 0.74)", 0, 0, vw, vh);
  d.globalCompositeOperation = "destination-out";
  // Three stacked discs = hard-edged, banded pixel light instead of a smooth gradient.
  const light = (x: number, y: number, r: number) => {
    for (const [k, al] of [
      [1, 0.18],
      [0.66, 0.25],
      [0.33, 0.4],
    ]) {
      d.globalAlpha = al;
      disc(
        d,
        "#000",
        Math.round(x - ox),
        Math.round(y - oy),
        Math.round(r * k),
      );
    }
    d.globalAlpha = 1;
  };
  for (const b of a.buildings) {
    d.drawImage(b.glow, b.x - ox, b.y - oy);
    light((b.b.x + b.b.w / 2) * TILE, (b.b.y + b.b.h) * TILE + 6, b.b.w * 3);
  }
  for (const l of lamps) {
    light(l.x + 2, l.y - 2, 15);
    light(l.x + 2, l.y - 17, 3);
  }
  for (const b of BUILDINGS) {
    d.globalAlpha = 0.35;
    px(
      d,
      "#000",
      b.pad.x * TILE - ox,
      b.pad.y * TILE - oy,
      b.pad.w * TILE,
      b.pad.h * TILE,
    );
  }
  for (let k = 1; k <= 3; k++)
    light(
      s.car.x + Math.sin(s.car.angle) * (6 + k * 9),
      s.car.y - Math.cos(s.car.angle) * (6 + k * 9),
      4 + k * 3,
    );
  light(s.car.x, s.car.y, 6);
  // Sweeping lighthouse beam.
  const lx = LIGHTHOUSE.tx * TILE + 8;
  const ly = LIGHTHOUSE.ty * TILE - 30;
  light(lx, ly, 8);
  for (let k = 1; k <= 9; k++)
    light(
      lx + Math.cos(s.t * 0.9) * k * 12,
      ly + Math.sin(s.t * 0.9) * k * 8,
      2 + k,
    );
  g.drawImage(dc, 0, 0);
}

function drawCar(
  g: Ctx,
  layers: HTMLCanvasElement[],
  car: Car,
  ox: number,
  oy: number,
) {
  const CAR_L = layers[0].height;
  const x = Math.round(car.x - ox);
  const y = Math.round(car.y - oy);
  g.save();
  g.translate(x + 2, y + 1);
  g.rotate(car.angle);
  g.globalAlpha = 0.35;
  px(g, C.shadow, -CAR_W / 2, -CAR_L / 2, CAR_W, CAR_L);
  g.restore();
  layers.forEach((layer, i) => {
    g.save();
    g.translate(x, y - i);
    g.rotate(car.angle);
    g.drawImage(layer, -CAR_W / 2, -CAR_L / 2);
    g.restore();
  });
}

function drawCompass(
  g: Ctx,
  car: Car,
  target: { x: number; y: number },
  ox: number,
  oy: number,
  t: number,
) {
  const dx = target.x - car.x;
  const dy = target.y - car.y;
  if (dx * dx + dy * dy < 90 * 90 || Math.floor(t * 3) % 4 === 0) return;
  const a = Math.atan2(dy, dx);
  const cx = car.x - ox + Math.cos(a) * 18;
  const cy = car.y - oy - 6 + Math.sin(a) * 18;
  g.fillStyle = "#ffe27a";
  g.beginPath();
  g.moveTo(cx + Math.cos(a) * 4, cy + Math.sin(a) * 4);
  g.lineTo(cx + Math.cos(a + 2.4) * 4, cy + Math.sin(a + 2.4) * 4);
  g.lineTo(cx + Math.cos(a - 2.4) * 4, cy + Math.sin(a - 2.4) * 4);
  g.fill();
}
