/**
 * Pure fisheye model for the dock magnification effect. Kept free of React/DOM
 * so it can be unit-tested and reasoned about in isolation — the component only
 * feeds it a pointer position and paints the resulting transforms.
 */

/** One dock item's visual transform under the magnification "fisheye". */
export interface DockItemTransform {
  /** Uniform scale applied to the icon (1 = resting size). */
  scale: number;
  /** Horizontal shift (px) that spreads magnified neighbours apart. */
  translateX: number;
  /** Vertical lift (px, negative = up) so the icon rises above the dock. */
  translateY: number;
}

export interface DockMagnifyConfig {
  /** Resting icon edge length in px. */
  base: number;
  /** Horizontal gap between resting icons in px. */
  gap: number;
  /** Peak scale reached directly under the pointer. */
  maxScale: number;
  /** Influence radius, in item-index units, of the fisheye falloff. */
  spread: number;
  /** Peak upward lift in px at the pointer focus. */
  lift: number;
}

export const DEFAULT_DOCK_MAGNIFY: DockMagnifyConfig = {
  base: 56,
  gap: 10,
  maxScale: 1.55,
  spread: 1.8,
  lift: 8,
};

/** Smoothstep easing on [0,1]: flat tails, steep middle. */
function smoothstep(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t * t * (3 - 2 * t);
}

/** Collapse a signed zero to +0 (−0 === 0, so this leaves real values intact). */
const zero = (n: number): number => (n === 0 ? 0 : n);

/**
 * Given the pointer's *fractional* item index (`active`; e.g. 1.5 = midway
 * between items 1 and 2, `null` = pointer away from the dock), return a
 * transform for every item. Icons scale by proximity and shift outward so
 * magnified neighbours don't overlap. Everything is expressed as a transform,
 * so the DOM never reflows and the fractional-index mapping stays exact.
 *
 * Works in *visual* left-to-right index space; the caller is responsible for
 * mapping logical items to visual slots under RTL.
 */
export function dockTransforms(
  active: number | null,
  count: number,
  cfg: DockMagnifyConfig = DEFAULT_DOCK_MAGNIFY,
): DockItemTransform[] {
  const { base, gap, maxScale, spread, lift } = cfg;

  // Per-item scale + lift from the fisheye falloff.
  const scales: number[] = [];
  const lifts: number[] = [];
  for (let i = 0; i < count; i++) {
    const eased =
      active === null ? 0 : smoothstep(1 - Math.abs(i - active) / spread);
    scales.push(1 + (maxScale - 1) * eased);
    lifts.push(-lift * eased);
  }

  // Resting centres (start-at-0 frame): centreᵢ = i·(base+gap) + base/2.
  const pitch = base + gap;
  const restCenter = (i: number) => i * pitch + base / 2;
  const restMid = (restCenter(0) + restCenter(count - 1)) / 2;

  // Magnified centres: lay the scaled widths out left→right with the same gap.
  const magCenter: number[] = [];
  let cursor = 0;
  for (let i = 0; i < count; i++) {
    const w = base * scales[i];
    magCenter.push(cursor + w / 2);
    cursor += w + gap;
  }
  const magMid = (magCenter[0] + magCenter[count - 1]) / 2;

  // translateX keeps the cluster centred on the same midpoint, so the ends
  // spread outward symmetrically instead of the whole row drifting sideways.
  return scales.map((scale, i) => ({
    scale,
    translateX: zero(magCenter[i] - magMid - (restCenter(i) - restMid)),
    translateY: zero(lifts[i]),
  }));
}
