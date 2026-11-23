---
name: styling-ui
description: Use when choosing colours, fonts, spacing, shadows, corners or animation for any UI in this portfolio, adding a CSS class or token, building a new component, or when something looks off-brand, washed out in dark mode, or wrong under Reduce Transparency.
---

# Styling UI

**REQUIRED:** read [`DESIGN.md`](../../../DESIGN.md) first. It is the design system; this skill
is the checklist for applying it.

## Decide the language first

| You're editing… | Language | Use |
|---|---|---|
| `features/drive/**`, `app/page.tsx` | Pixel | `--px-*` tokens, `.pixel-box`, `.pixel-btn`, `.font-pixel` |
| `features/desktop/**`, `about`, `projects`, `contact`, `settings` | Liquid Glass | shadcn tokens, `.lg-glass/.lg-panel/.lg-chip`, `components/ui/*` |

## Checklist

- [ ] No new hex literal in a component. Use `text-(--px-amber)` / `bg-primary`, or add a
      token to `app/globals.css` **and** its row in `DESIGN.md`.
- [ ] Pixel: square corners, hard 0-blur shadows, `steps()` motion, and CSS scoped under `.drive-root`.
- [ ] Glass: reuse an `.lg-*` surface; no new `backdrop-filter`. Check it with `.dark` and with
      Reduce Transparency on (Settings app).
- [ ] Logical properties only; `dir="ltr"` on numbers and handles.
- [ ] A visible focus style and a reduced-motion fallback for anything animated.
- [ ] Canvas art (`render.ts`, `PixelMe.tsx`) is the only place literal colours are fine.

Then **REQUIRED SUB-SKILL:** `verifying-a-change`. Screenshot `en` + `fa`; on the desktop,
light and dark too.
