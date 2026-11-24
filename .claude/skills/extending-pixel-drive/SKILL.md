---
name: extending-pixel-drive
description: Use when adding or changing anything in the Pixel Drive homepage game — an achievement, a landmark or building, a floating sign, a car, a map area, physics, HUD controls, or game styling.
---

# Extending Pixel Drive

## Overview

The game is a canvas world plus a React HUD.

| Layer | File | Rule |
|-------|------|------|
| World model (tiles, buildings, landmarks, cars, physics) | `workflows/driveWorld.ts` | Pure, no DOM. Tested in `driveWorld.test.ts`. |
| Drawing | `features/drive/lib/render.ts` | `switch (kind)` per building/car kind |
| Loop, input, achievements, HUD | `features/drive/components/Game.tsx` | |
| Panels (sections, map, trophies, garage) | `features/drive/components/Panel.tsx` | |
| Copy | `messages/*.json` → `drive.*` | All four locales |
| Styles | `app/globals.css`, Pixel Drive block | Scoped under `.drive-root` |

1 tile = 16 px; 1 px = 0.25 m (`METERS_PER_PX`). Saves go to localStorage `sunset-island:v1`.

## Recipes

**Achievement**
1. `features/drive/lib/achievements.ts`: `{ id, icon }`.
2. `drive.achievements.<id>.{title,desc}` in all four catalogs.
3. Call `unlock("<id>")` at the trigger in `Game.tsx` (frame loop for driving events, a
   handler for UI events). It's idempotent, so no guard is needed.

**Landmark / scenery building**
1. Add a `BuildingKind`, then a `LANDMARKS` entry `{ kind, x, y, w, h, height, sign? }` in
   tile units. Keep it off `ROADS` and the `PIAZZA`.
2. Add a `case "<kind>"` in `render.ts`.
3. `sign: true` → `drive.signs.<kind>` in all catalogs.

**Section building** (opens a panel): add the `SectionId`, a `BUILDINGS` entry with a `pad`, a
`Panel.tsx` case, `drive.menu.<id>` + `drive.signs.<id>`. The `grand-tour` achievement counts
`BUILDINGS.length` automatically.

**Car**: `CARS` entry (only `id, top, accel, turn, offroad`), a `render.ts` case, and
`drive.cars.<id>.{name,desc}`.

**Physics** (`stepCar`): `speed` is along the nose, `side` is the sideways slide. Grip (per
surface, lower when braking at speed) shrinks `side` each step. Tune grip numbers there; extend
the drift tests in `driveWorld.test.ts`.

**Opening stops**: driving onto a pad only sets `zone`; Enter (keyboard) or the prompt button
calls `open(id)`. Fast travel from the map opens directly.

**World size / new terrain**: change `COLS`/`ROWS` and the tile bake in `driveWorld.ts`, then
extend `driveWorld.test.ts`: spawn on road, buildings solid, pads reachable.

## Gotchas

- Colours are `--px-*` tokens (the section accent is `--px-accent`). Never add unscoped CSS;
  prefix with `.drive-root`. See `styling-ui`.
- The world layer is `dir="ltr"`, the HUD is not; see `translating-copy` for the RTL rules.
- Biome rejects `forEach` returning values, `arr.map((x, i) => <El key={i}/>)`, `role="meter"`
  (use `<meter>`) and buttons without `type="button"`.
- Touch: the joystick is `aria-hidden`; every action it offers must also exist as a real button.

## Verify

`npm test` → **REQUIRED SUB-SKILL:** `verifying-a-change` (drive to the thing; check it in `fa`).
