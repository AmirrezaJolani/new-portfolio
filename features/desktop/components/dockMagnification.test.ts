import { describe, expect, it } from "vitest";
import { DEFAULT_DOCK_MAGNIFY, dockTransforms } from "./dockMagnification";

const COUNT = 4;

describe("dockTransforms", () => {
  it("rests flat when the pointer is away", () => {
    for (const t of dockTransforms(null, COUNT)) {
      expect(t.scale).toBe(1);
      expect(t.translateX).toBe(0);
      expect(t.translateY).toBe(0);
    }
  });

  it("peaks at the item directly under the pointer", () => {
    const t = dockTransforms(2, COUNT);
    expect(t[2].scale).toBeCloseTo(DEFAULT_DOCK_MAGNIFY.maxScale);
    expect(t[2].translateY).toBeCloseTo(-DEFAULT_DOCK_MAGNIFY.lift);
    // The focused item is the largest of all.
    for (let i = 0; i < COUNT; i++) {
      if (i !== 2) expect(t[i].scale).toBeLessThan(t[2].scale);
    }
  });

  it("keeps every scale within [1, maxScale]", () => {
    for (const active of [0, 1.5, 3, -0.5]) {
      for (const t of dockTransforms(active, COUNT)) {
        expect(t.scale).toBeGreaterThanOrEqual(1);
        expect(t.scale).toBeLessThanOrEqual(
          DEFAULT_DOCK_MAGNIFY.maxScale + 1e-9,
        );
      }
    }
  });

  it("falls back to resting size beyond the influence spread", () => {
    // Item 0 is >spread away from a pointer focused on the last item.
    const t = dockTransforms(3, COUNT);
    expect(t[0].scale).toBe(1);
    expect(t[0].translateY).toBe(0);
  });

  it("spreads symmetrically and stays centred at the midpoint", () => {
    const t = dockTransforms(1.5, COUNT); // exact centre of 4 items
    expect(t[0].scale).toBeCloseTo(t[3].scale);
    expect(t[1].scale).toBeCloseTo(t[2].scale);
    // Neighbours are pushed apart: left half shifts left, right half right.
    expect(t[0].translateX).toBeLessThan(0);
    expect(t[3].translateX).toBeGreaterThan(0);
    expect(t[0].translateX).toBeCloseTo(-t[3].translateX);
    // No net horizontal drift.
    const sum = t.reduce((acc, x) => acc + x.translateX, 0);
    expect(sum).toBeCloseTo(0);
  });
});
