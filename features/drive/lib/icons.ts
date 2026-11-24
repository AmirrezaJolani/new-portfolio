// Pixel icons: public/icons/<name>.svg, 16×16 grid, crisp edges, literal colours.
// Add the SVG file first, then its name here (icons.test.ts checks both sides).
export const ICONS = [
  "arrow",
  "beach",
  "bolt",
  "boom",
  "brake",
  "car",
  "check",
  "flag",
  "globe",
  "italy",
  "key",
  "keyboard",
  "lighthouse",
  "lock",
  "map",
  "moon",
  "mute",
  "note",
  "phone",
  "pin",
  "ring",
  "road",
  "rocket",
  "sparkle",
  "sun",
  "sunset",
  "trophy",
  "wave",
] as const;

export type IconName = (typeof ICONS)[number];

export const iconSrc = (name: IconName) => `/icons/${name}.svg`;
