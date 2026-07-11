# macOS Tahoe Liquid Glass Redesign — Design

**Date:** 2026-07-11
**Status:** Approved (design), pending implementation plan

## Summary

Restyle the desktop portfolio to the modern **macOS Tahoe "Liquid Glass"** aesthetic, with
lucide icons throughout: a generated scenic wallpaper, frosted translucent surfaces (menu bar,
dock, windows), glass desktop widgets (calendar + weather), and right-edge desktop folder
shortcuts. Presentation-only — the window state machine, context, and app logic are untouched.

This is a **faithful, documented redo** of the design already shipped in PR #2
(`feat/liquid-glass-tahoe`). It exists so the redesign is backed by a spec + plan and lands as
a clean, standalone PR; PR #2 will be closed as superseded.

## Goals

- Replace the flat purple gradient with a photographic-feeling, self-generated wallpaper.
- A cohesive Liquid Glass surface system reused across every chrome surface.
- lucide icons everywhere (menu-bar status cluster, dock, widgets, folders, window controls).
- Keep it presentation-only: zero changes to `workflows/`, `context/`, or app feature logic,
  so the existing 12 unit tests still fully cover behavior.
- Preserve i18n (EN + Persian/RTL) and the mobile experience.

## Non-Goals

- Dark mode / theme toggle (light Liquid Glass only).
- New apps, boot/login splash, or window open/close animations.
- Any change to window drag/resize/focus logic or the contact form.
- Multi-instance windows or new desktop behaviors.

## Chosen Approach

**Reproduce PR #2's proven, reviewed components** (cherry-pick its single self-contained
redesign commit) rather than rewrite them differently. A faithful redo means identical code;
re-authoring from scratch would only risk visual drift and re-introduce already-fixed lint/a11y
issues. The spec + plan add the documentation layer; the implementation mirrors the verified
#2 result and re-runs the same gates.

## Liquid Glass surface system

Encoded once as CSS utilities in `app/globals.css` and reused everywhere. The "vibrancy" look
is three stacked effects: `backdrop-filter: blur() saturate()` (pulls color from the wallpaper
behind), a hairline top inner-highlight (`inset 0 1px 0 rgba(255,255,255,.x)`), and a soft drop
shadow for float.

- `.lg-glass` — window bodies (opaque-ish frosted white).
- `.lg-panel` — menu bar + dock (thinner, more see-through, stronger blur).
- `.lg-chip` — widgets, dock tooltips, small tiles.
- `.lg-titlebar` — frosted window title bar gradient.
- `.lg-scroll` — thin translucent macOS-style scrollbars.

## Components

### Wallpaper (`features/desktop/components/Wallpaper.tsx`) — new
Full-bleed, `-z-10`, `aria-hidden` SVG scene: graded sky, radial sun glow, three hazy
mountain ranges (far ones lighter for atmospheric depth) with a snow line, a lake with a sun
reflection, and a grain + vignette overlay for a photographic finish. No copyrighted asset.

### Menu bar (`MenuBar.tsx`) — restyle
`.lg-panel`-style frosted bar. Left: lucide `Apple` + active app name (or translated
"Finder"). Right cluster (lucide): `Wifi`, `BatteryMedium`, `SlidersHorizontal` (control
center), `Search` (Spotlight), then the language switcher (`setUserLocale` server action +
`router.refresh()`) and the live clock. Dark text for legibility on the light wallpaper.

### Dock (`Dock.tsx`) — restyle
`.lg-panel` rounded dock. Each app is a rounded gradient **tile** (per-app accent from the
registry) with a white lucide icon, hover **magnification** (`-translate-y` + `scale`), a glass
tooltip, and a running-app **dot** under open apps.

### Window chrome (`Window.tsx`) — restyle only
`.lg-glass` body + `.lg-titlebar`, rounded-2xl. Traffic lights (`#ff5f57`/`#febc2e`/`#28c840`)
reveal lucide `X` / `Minus` / `Plus` glyphs on title-bar hover; content uses `.lg-scroll`.
**Drag/resize/focus/close/minimize logic is unchanged** — only classes and the hover glyphs.

### Desktop widgets (`Widgets.tsx`) — new
Top-start glass cards: a **calendar** (locale-aware month/weekday headers via `Intl`, Monday
start, today highlighted red) and a **weather** card (city + condition from a new `widgets`
message namespace, big temperature via `Intl.NumberFormat`, lucide `Sun`). Stable map keys.

### Desktop folders (`DesktopIcons.tsx`) — new
Right-edge (`end`) vertical stack of folder shortcuts (lucide `Folder`) that open their app on
click, labels shadowed for legibility over the wallpaper.

### Registry + mobile
- `lib/apps.config.tsx`: add a `tile` (Tailwind gradient classes) field per app for the dock /
  desktop / mobile icon tiles.
- `MobileHome.tsx`: restyle the home grid tiles with the per-app gradients and render the
  full-screen app view as frosted glass over the wallpaper (RTL-aware back chevron).
- `Desktop.tsx`: render `Wallpaper` behind everything; add `Widgets` + `DesktopIcons` to the
  desktop (non-mobile) branch; drop the purple gradient.

## Internationalization

- Add a `widgets` namespace to `messages/en.json` and `messages/fa.json`
  (`weatherCity`, `weatherCondition`, `high`, `low`) at full key parity.
- Calendar text is derived from `Intl` (locale-aware), not message keys.
- All display copy stays in next-intl; RTL uses Tailwind logical properties (`ps/pe/start/end`)
  so Persian mirrors correctly.

## Files

```
Create:
  features/desktop/components/Wallpaper.tsx
  features/desktop/components/Widgets.tsx
  features/desktop/components/DesktopIcons.tsx
Modify:
  app/globals.css                              # Liquid Glass utilities
  lib/apps.config.tsx                          # per-app `tile` accent
  features/desktop/components/MenuBar.tsx       # status cluster + glass
  features/desktop/components/Dock.tsx          # glass tiles + magnify + dots
  features/desktop/components/Window.tsx        # glass chrome + hover glyphs
  features/desktop/components/Desktop.tsx        # wallpaper + widgets + icons
  features/desktop/components/MobileHome.tsx     # glass tiles over wallpaper
  messages/en.json, messages/fa.json            # widgets namespace
```

## Logistics

- Branch `feat/tahoe-liquid-glass` off `feat/macos-portfolio`; PR targets `feat/macos-portfolio`
  (independent of PR #2).
- On completion, offer to close PR #2 as superseded.

## Verification

- `npx tsc --noEmit` clean; `npm run lint` (Biome) 0 errors (decorative `Wallpaper` SVG carries
  `aria-hidden`; calendar uses stable keys); `npm run build` succeeds; `npm test` still 12/12.
- Live browser pass: desktop renders wallpaper + widgets + folders + glass dock/menu bar;
  windows open as frosted glass with correct z-order + running dots; EN↔FA (RTL) and the mobile
  home + full-screen app all render; no console errors.

## Extensibility Notes

- Typography intentionally stays on Geist (SF-like) — authenticity over flair for a macOS clone.
- Dark mode later = a `.dark` variant of the `.lg-*` utilities + a menu-bar toggle.
- A future Games app inherits the glass dock tile + folder + mobile styling for free via the
  registry `tile` field.
