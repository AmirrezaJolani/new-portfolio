// Pure world model for the pixel-drive homepage: tile map, buildings, decor and car physics. No DOM here,
// so it runs under `node --test`.

export const TILE = 16;
export const COLS = 56;
export const ROWS = 54; // rows 29–46: the Milan district
export const WORLD_W = COLS * TILE;
export const WORLD_H = ROWS * TILE;

export type Tile = "water" | "sand" | "grass" | "road" | "plaza";
export type SectionId =
  | "about"
  | "experience"
  | "projects"
  | "skills"
  | "testimonials"
  | "contact";
export type Rect = { x: number; y: number; w: number; h: number }; // in tiles

export type BuildingKind =
  | "house"
  | "office"
  | "factory"
  | "garage"
  | "cafe"
  | "postoffice"
  | "duomo"
  | "galleria"
  | "monument"
  | "tram"
  | "bosco"
  | "velasca"
  | "unicredit";

// Anything baked as a stacked building. Landmarks are pure scenery.
export type Structure = Rect & {
  kind: BuildingKind;
  sign?: boolean; // floating sign; its text is messages drive.signs.<id | kind>
  height: number; // wall height in px (roofs, spires etc. add on top)
};

export type Building = Structure & { id: SectionId; accent: string; pad: Rect };

export const BUILDINGS: Building[] = [
  {
    id: "about",
    kind: "house",
    x: 11,
    y: 10,
    w: 6,
    h: 4,
    height: 24,
    accent: "#ff9a5c",
    pad: { x: 12, y: 15, w: 4, h: 2 },
  },
  {
    id: "experience",
    kind: "office",
    x: 20,
    y: 9,
    w: 5,
    h: 5,
    height: 60,
    accent: "#7fb3ff",
    pad: { x: 20, y: 15, w: 4, h: 2 },
  },
  {
    id: "projects",
    kind: "factory",
    x: 32,
    y: 10,
    w: 9,
    h: 4,
    height: 22,
    accent: "#5ee0c4",
    pad: { x: 34, y: 15, w: 5, h: 2 },
  },
  {
    id: "skills",
    kind: "garage",
    x: 11,
    y: 20,
    w: 7,
    h: 4,
    height: 22,
    accent: "#ffcf5c",
    pad: { x: 12, y: 25, w: 4, h: 2 },
  },
  {
    id: "testimonials",
    kind: "cafe",
    x: 30,
    y: 20,
    w: 6,
    h: 4,
    height: 20,
    accent: "#ff7eb6",
    pad: { x: 31, y: 25, w: 4, h: 2 },
  },
  {
    id: "contact",
    kind: "postoffice",
    x: 39,
    y: 20,
    w: 6,
    h: 4,
    height: 26,
    accent: "#9cd7ff",
    pad: { x: 40, y: 25, w: 4, h: 2 },
  },
];

// Milan, south of the old town: Piazza del Duomo on the left, the skyline on the right.
export const PIAZZA: Rect = { x: 9, y: 37, w: 18, h: 8 };
export const LANDMARKS: Structure[] = [
  // Set back from the road above: tall things rise "up" the screen and would cover it.
  { kind: "duomo", sign: true, x: 14, y: 32, w: 12, h: 4, height: 30 },
  { kind: "galleria", sign: true, x: 9, y: 32, w: 4, h: 4, height: 28 },
  { kind: "monument", x: 17, y: 40, w: 1, h: 1, height: 8 },
  { kind: "tram", x: 20, y: 43, w: 3, h: 1, height: 12 },
  { kind: "bosco", sign: true, x: 30, y: 35, w: 5, h: 3, height: 70 },
  { kind: "velasca", sign: true, x: 37, y: 36, w: 3, h: 3, height: 64 },
  { kind: "unicredit", sign: true, x: 42, y: 35, w: 3, h: 3, height: 72 },
];

export const ROADS: Rect[] = [
  { x: 7, y: 7, w: 42, h: 2 },
  { x: 7, y: 17, w: 42, h: 2 },
  { x: 7, y: 27, w: 42, h: 2 },
  { x: 7, y: 45, w: 42, h: 2 },
  { x: 7, y: 7, w: 2, h: 40 },
  { x: 27, y: 7, w: 2, h: 40 },
  { x: 47, y: 7, w: 2, h: 40 },
];

export const POND: Rect = { x: 20, y: 20, w: 5, h: 4 };
export const LIGHTHOUSE = { tx: 52, ty: 3 };
export const SPAWN = { x: 18 * TILE, y: 18 * TILE, angle: Math.PI / 2 };

// Deterministic per-tile noise, so the island looks the same on every load.
export function hash(x: number, y: number, seed = 0) {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const inRect = (r: Rect, x: number, y: number) =>
  x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;

export const tiles: Tile[] = [];
const solid = new Uint8Array(COLS * ROWS);
export const trees: { tx: number; ty: number; palm: boolean }[] = [];
export const lamps: { x: number; y: number }[] = [];

(function buildMap() {
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++) {
      const edge = Math.min(x, y, COLS - 1 - x, ROWS - 1 - y);
      // Ragged coastline: the outermost sand/grass rings get nibbled by noise.
      let t: Tile = edge < 2 ? "water" : edge < 4 ? "sand" : "grass";
      if (edge === 2 && hash(x, y, 1) < 0.35) t = "water";
      if (edge === 4 && hash(x, y, 2) < 0.3) t = "sand";
      if (inRect(POND, x, y)) t = "water";
      if (inRect(PIAZZA, x, y)) t = "plaza";
      if (ROADS.some((r) => inRect(r, x, y))) t = "road";
      tiles.push(t);
      if (t === "water") solid[y * COLS + x] = 1;
    }

  // Footprint + the yard row in front of it (tables, steps, flagpole live there).
  for (const b of [...BUILDINGS, ...LANDMARKS])
    for (let y = b.y; y <= b.y + b.h; y++)
      for (let x = b.x; x < b.x + b.w; x++) solid[y * COLS + x] = 1;
  solid[LIGHTHOUSE.ty * COLS + LIGHTHOUSE.tx] = 1;

  // Keep a one-tile clearance around anything you can drive to or into.
  const busy = (x: number, y: number) => {
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const t = tileAt(x + dx, y + dy);
        if (t === "road" || t === "plaza" || solid[(y + dy) * COLS + x + dx])
          return true;
        if (BUILDINGS.some((b) => inRect(b.pad, x + dx, y + dy))) return true;
      }
    return false;
  };
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++) {
      const t = tileAt(x, y);
      const palm = t === "sand" && hash(x, y, 3) < 0.14;
      const tree = t === "grass" && hash(x, y, 4) < 0.2;
      if ((palm || tree) && !busy(x, y)) {
        trees.push({ tx: x, ty: y, palm });
        solid[y * COLS + x] = 1;
      }
    }

  // Street lamps every 6 tiles on the grass verge; thin poles, so not solid.
  for (const r of ROADS) {
    const horiz = r.w > r.h;
    for (let d = 3; d < (horiz ? r.w : r.h) - 2; d += 6)
      for (const side of [-1, horiz ? r.h : r.w]) {
        const tx = horiz ? r.x + d : r.x + side;
        const ty = horiz ? r.y + side : r.y + d;
        if (
          tileAt(tx, ty) !== "grass" ||
          solid[ty * COLS + tx] ||
          padAt((tx + 0.5) * TILE, (ty + 0.5) * TILE)
        )
          continue;
        lamps.push({ x: tx * TILE + 8, y: ty * TILE + (side < 0 ? 12 : 4) });
      }
  }
})();

export function tileAt(tx: number, ty: number): Tile {
  if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return "water";
  return tiles[ty * COLS + tx];
}

export function solidAt(px: number, py: number) {
  const tx = Math.floor(px / TILE);
  const ty = Math.floor(py / TILE);
  if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return true;
  return solid[ty * COLS + tx] === 1;
}

export function padAt(px: number, py: number): SectionId | null {
  const tx = px / TILE;
  const ty = py / TILE;
  return BUILDINGS.find((b) => inRect(b.pad, tx, ty))?.id ?? null;
}

export const padCenter = (b: Building) => ({
  x: (b.pad.x + b.pad.w / 2) * TILE,
  y: (b.pad.y + b.pad.h / 2) * TILE,
});

// ---------- car ----------

/** speed: along the nose (px/s, negative = reverse). side: sideways slide, + = to the car's right. */
export type Car = {
  x: number;
  y: number;
  angle: number;
  speed: number;
  side?: number;
};
export type Input = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

export type CarModel = {
  id: "coupe" | "taxi" | "van" | "buggy" | "pickup";
  top: number; // road top speed, px/s
  accel: number; // px/s²
  turn: number; // rad/s at full lock
  offroad: number; // grass/sand speed multiplier
};

export const CARS: CarModel[] = [
  { id: "coupe", top: 150, accel: 240, turn: 3, offroad: 1 },
  { id: "taxi", top: 140, accel: 230, turn: 3.3, offroad: 1 },
  { id: "van", top: 115, accel: 170, turn: 2.4, offroad: 1.1 },
  { id: "buggy", top: 135, accel: 260, turn: 3.5, offroad: 1.7 },
  { id: "pickup", top: 130, accel: 200, turn: 2.7, offroad: 1.35 },
];

// Joystick → car controls: push the stick where you want to go; the car
// accelerates and steers toward that heading. (x, y) is a unit-ish vector,
// screen space, y down.
export function stickInput(x: number, y: number, angle: number): Input {
  const none = { up: false, down: false, left: false, right: false };
  if (Math.hypot(x, y) < 0.25) return none;
  let diff = Math.atan2(x, -y) - angle;
  diff = Math.atan2(Math.sin(diff), Math.cos(diff)); // wrap to [-π, π]
  return { up: true, down: false, left: diff < -0.1, right: diff > 0.1 };
}

const CAR_R = 5; // collision half-size, px
const blocked = (x: number, y: number) =>
  solidAt(x - CAR_R, y - CAR_R) ||
  solidAt(x + CAR_R, y - CAR_R) ||
  solidAt(x - CAR_R, y + CAR_R) ||
  solidAt(x + CAR_R, y + CAR_R);

export function stepCar(
  car: Car,
  input: Input,
  dt: number,
  model: CarModel = CARS[0],
): Car {
  const t = tileAt(Math.floor(car.x / TILE), Math.floor(car.y / TILE));
  const paved = t === "road" || t === "plaza";
  // Off-road is slower, unless the car is built for it.
  const max = paved
    ? model.top
    : Math.min(model.top, (t === "sand" ? 60 : 85) * model.offroad);
  let { speed, angle } = car;
  let side = car.side ?? 0;

  if (input.up) speed += model.accel * dt;
  else if (input.down) speed -= (speed > 0 ? 360 : 180) * dt;
  else speed -= speed * Math.min(1, 2 * dt);

  if (speed > max) speed = Math.max(max, speed - 400 * dt);
  speed = Math.max(speed, -60);

  // Grip: tyres kill sideways sliding at this rate (1/s). Loose ground and
  // braking hard at speed (a handbrake turn) let the tail step out.
  let grip = paved ? 9 : (t === "sand" ? 2.5 : 4.5) * model.offroad;
  if (input.down && speed > 60) grip *= 0.35;
  side *= Math.max(0, 1 - grip * dt);

  // World velocity before steering; it carries over, so turning the nose
  // doesn't turn the momentum: that difference is the drift.
  let vx = Math.sin(angle) * speed + Math.cos(angle) * side;
  let vy = -Math.cos(angle) * speed + Math.sin(angle) * side;

  const steer = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  angle +=
    steer *
    model.turn *
    Math.min(1, Math.abs(speed) / 50) *
    Math.sign(speed) *
    dt;

  // Move per axis so the car slides along walls instead of sticking.
  const nx = car.x + vx * dt;
  const ny = car.y + vy * dt;
  let x = car.x;
  let y = car.y;
  let hits = 0;
  if (!blocked(nx, y)) x = nx;
  else [vx, hits] = [0, hits + 1];
  if (!blocked(x, ny)) y = ny;
  else [vy, hits] = [0, hits + 1];
  // Nose-first into a corner: small bounce back, slide killed.
  if (hits === 2) return { x, y, angle, speed: speed * -0.3, side: 0 };

  // Back into the car's own frame (new heading).
  return {
    x,
    y,
    angle,
    speed: Math.sin(angle) * vx - Math.cos(angle) * vy,
    side: Math.cos(angle) * vx + Math.sin(angle) * vy,
  };
}
