---
name: styling-ui
description: Use when choosing colours, fonts, spacing, shadows, corners or animation for any UI in this portfolio, adding a CSS class or token, building a new HUD element or panel, or when something looks off-brand or blurry.
---

# Styling UI

**REQUIRED:** read [`DESIGN.md`](../../../DESIGN.md) first. It is the design system; this skill
is the checklist for applying it.

## Checklist

- [ ] No new hex literal in a component. Use a token (`text-(--px-amber)`,
      `bg-(--px-ink)`), or add one to `app/globals.css` **and** its row in `DESIGN.md`.
- [ ] Reuse `.pixel-box`, `.pixel-btn`, `.font-pixel` before writing new CSS.
- [ ] Square corners, hard 0-blur shadows, `steps()` motion.
- [ ] New CSS lives under `.drive-root`.
- [ ] Logical properties only; `dir="ltr"` on numbers and handles; the canvas layer stays LTR.
- [ ] A visible focus style and a reduced-motion fallback for anything animated.
- [ ] Touch targets of at least 44px.
- [ ] Canvas art (`render.ts`, `PixelMe.tsx`) is the only place literal colours are fine.

Then **REQUIRED SUB-SKILL:** `verifying-a-change`. Screenshot `en` + `fa`, and a 390×844 touch
viewport if the HUD changed.
