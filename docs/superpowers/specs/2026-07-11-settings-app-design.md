# System Settings App + Theming — Design

**Date:** 2026-07-11
**Status:** Approved (design), pending implementation plan

## Summary

Add a macOS-style **System Settings** app to the desktop portfolio, plus the **theming engine**
it drives: a real **light/dark/auto** mode, a **wallpaper** picker, and functional
**accessibility** toggles (reduce transparency, reduce motion, larger text). Settings persist in
a cookie and apply with no flash. A **Language & Region** pane centralizes the existing locale
switch.

This is **PR B**, stacked on **PR A** (the Liquid Glass redesign, `feat/tahoe-liquid-glass`).
PR A supplies the glass components; PR B adds their dark variants + the settings system.

## Goals

- A recognizable macOS Settings window (sidebar + detail) with 4 functional panes.
- Genuine light/dark/auto theming that re-themes the entire desktop and persists across reloads
  with no FOUC.
- Wallpaper switching between several generated (no-copyright) scenes.
- Accessibility toggles that actually change the UI (transparency, motion, text size).
- Reuse the project's layering: a `settings/` domain (like `i18n/`), a `SettingsContext`, and a
  `features/settings/` UI. Presentation + client-state only — no changes to window/contact logic
  (the 12 unit tests stay green).

## Non-Goals

- Persisting settings server-side / per-user accounts (cookie only).
- Every macOS Settings pane — only Appearance, Wallpaper, Accessibility, Language & Region.
- New wallpapers beyond the three below; no user-uploaded wallpapers.
- Changing window drag/resize/focus logic or the contact form.

## Dependencies & Ordering

PR B assumes PR A (redesign) is in place: it adds `dark:` variants to PR A's glass components and
dark variants to the `.lg-*` utilities. Build order: land PR A first, branch `feat/settings-app`
off it, then implement PR B.

## Architecture

### `settings/` domain
- **`settings/config.ts`** — pure types + defaults:
  - `Theme = "light" | "dark" | "auto"`, default `"auto"`.
  - `WallpaperId = "day" | "night" | "aurora"`, default `"day"`.
  - `Settings` = `{ theme, wallpaper, reduceTransparency, reduceMotion, largerText }` with
    defaults (booleans default `false`).
  - `COOKIE_NAME = "app-settings"`; `parseSettings(raw?: string): Settings` (safe JSON parse +
    validation, falls back to defaults).
- **`settings/cookies.ts`** — `"use server"` `setSettingsCookie(settings: Settings)` writing the
  JSON cookie (1-year max-age). Reading happens inline in the layout via `next/headers`.

### Persistence & no-flash application
- **`app/layout.tsx`** (server): reads the `app-settings` cookie, `parseSettings`, and sets on
  `<html>`: `class` includes `dark` when the resolved theme is dark; `data-reduce-transparency`,
  `data-reduce-motion`, `data-larger-text` reflect the flags; `data-wallpaper` holds the id.
- **No-flash `auto`:** the server can't read the OS preference, so a tiny **pre-hydration inline
  script** in `<head>` reads the cookie; if theme is `auto`, it checks
  `matchMedia("(prefers-color-scheme: dark)")` and toggles the `dark` class before first paint.
  For explicit light/dark the server already set the class (no script needed).
- **`context/SettingsContext.tsx`** (client): `SettingsProvider` initialized from the cookie
  (passed as a prop from the server layout to avoid a client re-read); `useSettings()` returns
  the current `Settings` + a `setSetting(key, value)`/`setSettings(partial)` API. Each change:
  1. updates React state, 2. applies to `document.documentElement` (toggle `dark` class /
  data-attributes / `data-wallpaper`) for instant feedback, 3. persists via `setSettingsCookie`.
  No `router.refresh` — the change is pure client CSS state (unlike locale, which needs a server
  re-fetch).

### Theming (dark Liquid Glass + accessibility) in `globals.css`
- Dark variants of `.lg-glass / .lg-panel / .lg-chip / .lg-titlebar` under the existing
  `@custom-variant dark` (dark translucent surfaces, adjusted borders/highlights).
- `.lg-scroll` dark thumb.
- Accessibility CSS:
  - `[data-reduce-transparency] .lg-glass, … { backdrop-filter: none; background-color: <opaque>; }`
  - `[data-reduce-motion] * { transition: none !important; animation: none !important; }`
    (also honor `@media (prefers-reduced-motion: reduce)`).
  - `[data-larger-text] { font-size: 1.125rem; }` on the root.

### Wallpaper
- `features/desktop/components/Wallpaper.tsx` becomes **id-driven**: `Wallpaper({ id })` renders
  `day` (current Tahoe scene), `night` (dark palette variant of the same scene), or `aurora`
  (abstract gradient mesh). `Desktop` reads `useSettings().wallpaper` and passes the id.

### Settings app UI (`features/settings/`)
- **`SettingsApp.tsx`** — sidebar (pane list with lucide icons: `SwatchBook`/`Palette`,
  `Image`, `Accessibility`, `Languages`) + detail area; local `useState` for the active pane.
- **`AppearancePane.tsx`** — Light/Dark/Auto segmented control → `setSetting("theme", …)`.
- **`WallpaperPane.tsx`** — three wallpaper thumbnails → `setSetting("wallpaper", …)`.
- **`AccessibilityPane.tsx`** — three switches (shadcn/Base UI or a simple styled toggle) bound
  to the flags.
- **`LanguagePane.tsx`** — EN / فارسی, calling the existing `setUserLocale` server action +
  `router.refresh()` (locale still needs the server round-trip for messages).
- **`index.ts`** — exports `SettingsApp`.

### Registry & wiring
- `types/index.ts`: add `"settings"` to `AppId`.
- `lib/apps.config.tsx`: register `settings` (lucide `Settings` gear icon, gray `tile`,
  default geometry ~ 720×480).
- `features/desktop/components/appRegistry.tsx`: map `settings → SettingsApp`.
- `features/desktop/components/Desktop.tsx`: wrap in `SettingsProvider`; render `Wallpaper`
  with the selected id.
- Dark variants added to `MenuBar`, `Dock`, `Window`, `Widgets`, `DesktopIcons`, `MobileHome`.

## Internationalization

- New `settings` namespace in `messages/en.json` + `fa.json` (pane titles + option labels:
  Appearance/Light/Dark/Auto, Wallpaper names, Accessibility/Reduce Transparency/Reduce
  Motion/Larger Text, Language/Region), at **full key parity**. Add `apps.settings`.
- RTL: the Settings sidebar/detail use logical properties so Persian mirrors.

## Files

```
Create:
  settings/config.ts
  settings/cookies.ts
  context/SettingsContext.tsx
  features/settings/components/SettingsApp.tsx
  features/settings/components/AppearancePane.tsx
  features/settings/components/WallpaperPane.tsx
  features/settings/components/AccessibilityPane.tsx
  features/settings/components/LanguagePane.tsx
  features/settings/index.ts
Modify:
  app/layout.tsx                                # cookie read + no-flash script + <html> attrs
  app/globals.css                               # dark .lg-* + accessibility CSS
  features/desktop/components/Wallpaper.tsx      # id-driven (day/night/aurora)
  features/desktop/components/Desktop.tsx        # SettingsProvider + wallpaper by id
  features/desktop/components/{MenuBar,Dock,Window,Widgets,DesktopIcons,MobileHome}.tsx  # dark: variants
  lib/apps.config.tsx                            # settings app
  features/desktop/components/appRegistry.tsx    # settings -> SettingsApp
  types/index.ts                                 # AppId += "settings"
  messages/en.json, messages/fa.json             # settings namespace + apps.settings
```

## Verification

- `npx tsc --noEmit` clean; `npm run lint` 0 errors; `npm run build` succeeds; `npm test` 12/12.
- Live browser:
  - Appearance: Light ↔ Dark re-themes the whole desktop (menu bar, dock, windows, widgets),
    persists across reload with **no flash**; Auto follows the OS preference.
  - Wallpaper: switching id live-updates the desktop.
  - Accessibility: Reduce Transparency makes glass solid; Reduce Motion stops dock magnify/
    transitions; Larger Text scales up.
  - Language: EN ↔ فارسی from the pane sets the locale (dir=rtl) with no URL change.
  - Works on desktop and mobile; no console errors.

## Extensibility Notes

- Adding a wallpaper = one `WallpaperId` + one branch in `Wallpaper.tsx` + one thumbnail.
- Adding a settings pane = one component + one sidebar entry.
- The theme/data-attribute contract on `<html>` means new components style darkness/a11y purely
  via CSS, no new wiring.
