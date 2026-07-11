# System Settings App + Theming Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a macOS-style System Settings app plus the theming engine it drives — real light/dark/auto mode, a wallpaper picker, and functional accessibility toggles — persisted in a cookie with no flash.

**Architecture:** A `settings/` domain (pure config + a cookie server action) mirrors `i18n/`. A client `SettingsContext` applies changes instantly to `<html>` (class + data-attributes) and persists them; the root layout reads the cookie server-side for a no-flash initial paint. Dark + accessibility styling lives in `globals.css` keyed off the `.dark` class and `data-*` attributes. The Settings window is a sidebar+detail UI in `features/settings/`.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4 (`@custom-variant dark` already configured), next-intl (cookie locale), Vitest, Biome, lucide.

**PREREQUISITE (PR A):** This is PR B, stacked on the Liquid Glass redesign (PR A). Before Task 1, the redesign must be implemented on `feat/tahoe-liquid-glass`, and this work happens on a branch **`feat/settings-app`** created off it. The tasks below modify the *redesigned* components (menu bar/dock/window/widgets/desktop-icons/mobile) and the `.lg-*` glass utilities — these exist only after PR A lands.

**Conventions:**
- `@/*` → repo root. Commit after each task with the message in its final step.
- Gates per task: `npx tsc --noEmit` (0), and `npm test` where a test exists. Full `npm run lint` + `npm run build` at the end.
- All user-facing copy via next-intl (`en`/`fa` parity). RTL uses logical Tailwind props.

---

## File Structure

```
Create:
  settings/config.ts                 # pure types, defaults, parseSettings()
  settings/config.test.ts            # parseSettings unit tests
  settings/cookies.ts                # "use server" setSettingsCookie
  context/SettingsContext.tsx        # provider + useSettings (apply-to-DOM + persist)
  features/settings/components/SettingsApp.tsx
  features/settings/components/AppearancePane.tsx
  features/settings/components/WallpaperPane.tsx
  features/settings/components/AccessibilityPane.tsx
  features/settings/components/LanguagePane.tsx
  features/settings/components/Toggle.tsx        # small styled switch
  features/settings/index.ts
Modify:
  app/layout.tsx                     # read cookie, set <html> attrs, no-flash script, provider
  app/globals.css                    # dark .lg-* variants + accessibility CSS
  features/desktop/components/Wallpaper.tsx      # id-driven (day/night/aurora)
  features/desktop/components/Desktop.tsx        # wallpaper by useSettings().wallpaper
  features/desktop/components/{MenuBar,Dock,Window,Widgets,DesktopIcons,MobileHome}.tsx  # dark: variants
  lib/apps.config.tsx                # register settings app
  features/desktop/components/appRegistry.tsx    # settings -> SettingsApp
  types/index.ts                     # AppId += "settings"
  messages/en.json, messages/fa.json # settings namespace + apps.settings
```

---

## Task 1: Settings config (pure logic, TDD)

**Files:**
- Create: `settings/config.ts`
- Test: `settings/config.test.ts`

- [ ] **Step 1: Write the failing test**

`settings/config.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { parseSettings, defaultSettings } from "./config";

describe("parseSettings", () => {
  it("returns defaults for undefined/null/empty", () => {
    expect(parseSettings(undefined)).toEqual(defaultSettings);
    expect(parseSettings(null)).toEqual(defaultSettings);
    expect(parseSettings("")).toEqual(defaultSettings);
  });

  it("returns defaults for invalid JSON", () => {
    expect(parseSettings("{not json")).toEqual(defaultSettings);
  });

  it("parses a full valid object", () => {
    const raw = JSON.stringify({
      theme: "dark",
      wallpaper: "night",
      reduceTransparency: true,
      reduceMotion: true,
      largerText: true,
    });
    expect(parseSettings(raw)).toEqual({
      theme: "dark",
      wallpaper: "night",
      reduceTransparency: true,
      reduceMotion: true,
      largerText: true,
    });
  });

  it("falls back per-field for invalid enum values", () => {
    const raw = JSON.stringify({ theme: "neon", wallpaper: "beach" });
    const s = parseSettings(raw);
    expect(s.theme).toBe(defaultSettings.theme);
    expect(s.wallpaper).toBe(defaultSettings.wallpaper);
  });

  it("merges partial objects with defaults", () => {
    const s = parseSettings(JSON.stringify({ theme: "light" }));
    expect(s.theme).toBe("light");
    expect(s.wallpaper).toBe(defaultSettings.wallpaper);
    expect(s.reduceMotion).toBe(false);
  });

  it("coerces non-boolean flags to a boolean", () => {
    const s = parseSettings(JSON.stringify({ largerText: "yes" }));
    expect(s.largerText).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- settings/config.test.ts`
Expected: FAIL — cannot import from `./config`.

- [ ] **Step 3: Implement `settings/config.ts`**

```ts
export type Theme = "light" | "dark" | "auto";
export type WallpaperId = "day" | "night" | "aurora";

export interface Settings {
  theme: Theme;
  wallpaper: WallpaperId;
  reduceTransparency: boolean;
  reduceMotion: boolean;
  largerText: boolean;
}

export const defaultSettings: Settings = {
  theme: "auto",
  wallpaper: "day",
  reduceTransparency: false,
  reduceMotion: false,
  largerText: false,
};

export const SETTINGS_COOKIE = "app-settings";

const THEMES: Theme[] = ["light", "dark", "auto"];
const WALLPAPERS: WallpaperId[] = ["day", "night", "aurora"];

export function parseSettings(raw?: string | null): Settings {
  if (!raw) return defaultSettings;
  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(raw);
  } catch {
    return defaultSettings;
  }
  if (typeof obj !== "object" || obj === null) return defaultSettings;

  const theme = THEMES.includes(obj.theme as Theme)
    ? (obj.theme as Theme)
    : defaultSettings.theme;
  const wallpaper = WALLPAPERS.includes(obj.wallpaper as WallpaperId)
    ? (obj.wallpaper as WallpaperId)
    : defaultSettings.wallpaper;

  return {
    theme,
    wallpaper,
    reduceTransparency: Boolean(obj.reduceTransparency),
    reduceMotion: Boolean(obj.reduceMotion),
    largerText: Boolean(obj.largerText),
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- settings/config.test.ts`
Expected: PASS (6 tests). Then `npx tsc --noEmit` → exit 0.

- [ ] **Step 5: Commit**

```bash
git add settings/config.ts settings/config.test.ts
git commit -m "feat: add settings config + parseSettings with tests"
```

---

## Task 2: Settings cookie server action

**Files:**
- Create: `settings/cookies.ts`

- [ ] **Step 1: Create `settings/cookies.ts`**

```ts
"use server";

import { cookies } from "next/headers";
import { SETTINGS_COOKIE, type Settings } from "./config";

export async function setSettingsCookie(settings: Settings) {
  (await cookies()).set(SETTINGS_COOKIE, JSON.stringify(settings), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
```

- [ ] **Step 2: Verify compile**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add settings/cookies.ts
git commit -m "feat: add settings cookie server action"
```

---

## Task 3: SettingsContext (apply-to-DOM + persist)

**Files:**
- Create: `context/SettingsContext.tsx`

- [ ] **Step 1: Create `context/SettingsContext.tsx`**

```tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { setSettingsCookie } from "@/settings/cookies";
import type { Settings, Theme, WallpaperId } from "@/settings/config";

interface SettingsValue {
  settings: Settings;
  resolvedTheme: "light" | "dark";
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const SettingsContext = createContext<SettingsValue | null>(null);

function systemPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function resolveTheme(theme: Theme, systemDark: boolean): "light" | "dark" {
  if (theme === "auto") return systemDark ? "dark" : "light";
  return theme;
}

/** Reflect the settings onto <html> so all CSS keys off it. */
function applyToDom(settings: Settings, systemDark: boolean) {
  const el = document.documentElement;
  const resolved = resolveTheme(settings.theme, systemDark);
  el.classList.toggle("dark", resolved === "dark");
  el.dataset.wallpaper = settings.wallpaper;
  el.toggleAttribute("data-reduce-transparency", settings.reduceTransparency);
  el.toggleAttribute("data-reduce-motion", settings.reduceMotion);
  el.toggleAttribute("data-larger-text", settings.largerText);
}

export function SettingsProvider({
  initial,
  children,
}: {
  initial: Settings;
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<Settings>(initial);
  const [systemDark, setSystemDark] = useState<boolean>(systemPrefersDark);

  // Track the OS preference (only matters when theme === "auto").
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Re-apply whenever settings or the system preference change.
  useEffect(() => {
    applyToDom(settings, systemDark);
  }, [settings, systemDark]);

  const setSetting = useCallback<SettingsValue["setSetting"]>((key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      setSettingsCookie(next);
      return next;
    });
  }, []);

  const value = useMemo<SettingsValue>(
    () => ({
      settings,
      resolvedTheme: resolveTheme(settings.theme, systemDark),
      setSetting,
    }),
    [settings, systemDark, setSetting],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
}

export type { WallpaperId };
```

- [ ] **Step 2: Verify compile**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add context/SettingsContext.tsx
git commit -m "feat: add SettingsContext (apply-to-DOM + cookie persistence)"
```

---

## Task 4: Root layout — cookie read, no-flash script, provider

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { cookies } from "next/headers";
import { SettingsProvider } from "@/context/SettingsContext";
import { parseSettings, SETTINGS_COOKIE } from "@/settings/config";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portfolio OS",
  description: "An interactive macOS-style portfolio.",
};

// Runs before paint: resolves `auto` against the OS preference so there is no
// dark-mode flash. Explicit light/dark is already set server-side below.
const NO_FLASH = `(function(){try{var m=document.cookie.match(/(?:^|; )app-settings=([^;]*)/);var s=m?JSON.parse(decodeURIComponent(m[1])):{};var t=s.theme||"auto";var dark=t==="dark"||(t==="auto"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",dark);}catch(e){}})();`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dir = locale === "fa" ? "rtl" : "ltr";
  const settings = parseSettings((await cookies()).get(SETTINGS_COOKIE)?.value);
  const serverDark = settings.theme === "dark"; // `auto` corrected by NO_FLASH

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased ${serverDark ? "dark" : ""}`}
      data-wallpaper={settings.wallpaper}
      data-reduce-transparency={settings.reduceTransparency ? "" : undefined}
      data-reduce-motion={settings.reduceMotion ? "" : undefined}
      data-larger-text={settings.largerText ? "" : undefined}
    >
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: pre-hydration no-flash theme script */}
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
      </head>
      <body className="min-h-full">
        <NextIntlClientProvider>
          <SettingsProvider initial={settings}>{children}</SettingsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit && npm run build`
Expected: tsc exit 0; build succeeds (route `ƒ /` dynamic).

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: wire settings cookie + no-flash theme into root layout"
```

---

## Task 5: Dark glass + accessibility CSS

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Append dark + accessibility rules to `app/globals.css`**

Add at the end of the file (after the existing `.lg-*` and `.lg-scroll` blocks):

```css
/* ─── Dark Liquid Glass ──────────────────────────────────────────────── */
.dark .lg-glass {
  background-color: rgb(28 30 38 / 0.55);
  border-color: rgb(255 255 255 / 0.12);
  box-shadow:
    0 18px 50px -12px rgb(0 0 0 / 0.6),
    0 2px 8px -2px rgb(0 0 0 / 0.4),
    inset 0 1px 0 0 rgb(255 255 255 / 0.14);
}
.dark .lg-panel {
  background-color: rgb(22 24 30 / 0.45);
  border-color: rgb(255 255 255 / 0.1);
  box-shadow:
    0 12px 40px -8px rgb(0 0 0 / 0.55),
    inset 0 1px 0 0 rgb(255 255 255 / 0.12);
}
.dark .lg-chip {
  background-color: rgb(40 42 50 / 0.5);
  border-color: rgb(255 255 255 / 0.12);
  box-shadow:
    0 10px 30px -10px rgb(0 0 0 / 0.5),
    inset 0 1px 0 0 rgb(255 255 255 / 0.12);
}
.dark .lg-titlebar {
  background: linear-gradient(rgb(255 255 255 / 0.08), rgb(255 255 255 / 0.02));
  box-shadow: inset 0 1px 0 0 rgb(255 255 255 / 0.1);
}
.dark .lg-scroll::-webkit-scrollbar-thumb {
  background-color: rgb(255 255 255 / 0.22);
}

/* ─── Accessibility: Reduce Transparency ─────────────────────────────── */
[data-reduce-transparency] .lg-glass,
[data-reduce-transparency] .lg-panel,
[data-reduce-transparency] .lg-chip,
[data-reduce-transparency] .lg-titlebar {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
[data-reduce-transparency] .lg-glass,
[data-reduce-transparency] .lg-panel,
[data-reduce-transparency] .lg-chip {
  background-color: rgb(244 246 250 / 0.98);
}
.dark[data-reduce-transparency] .lg-glass,
.dark[data-reduce-transparency] .lg-panel,
.dark[data-reduce-transparency] .lg-chip {
  background-color: rgb(24 26 32 / 0.98);
}

/* ─── Accessibility: Reduce Motion ───────────────────────────────────── */
[data-reduce-motion] *,
[data-reduce-motion] *::before,
[data-reduce-motion] *::after {
  transition-duration: 0.001ms !important;
  animation-duration: 0.001ms !important;
  animation-iteration-count: 1 !important;
}
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition-duration: 0.001ms !important;
    animation-duration: 0.001ms !important;
  }
}

/* ─── Accessibility: Larger Text ─────────────────────────────────────── */
[data-larger-text] {
  font-size: 1.125rem;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds (Tailwind compiles the CSS).

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: add dark glass + accessibility CSS"
```

---

## Task 6: Id-driven Wallpaper (day / night / aurora)

**Files:**
- Modify: `features/desktop/components/Wallpaper.tsx`

- [ ] **Step 1: Replace `features/desktop/components/Wallpaper.tsx`**

Keep the existing day scene; wrap it in a `switch` on `id` and add `night` (dark palette) and `aurora` (gradient mesh). The `day` scene is the current SVG (unchanged); `night` reuses the same paths with a dark palette; `aurora` is a layered radial-gradient mesh.

```tsx
import type { WallpaperId } from "@/settings/config";

export function Wallpaper({ id = "day" }: { id?: WallpaperId }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {id === "aurora" ? (
        <Aurora />
      ) : (
        <Scene palette={id === "night" ? NIGHT : DAY} />
      )}
    </div>
  );
}

interface Palette {
  sky: [string, string, string, string];
  sun: string;
  lake: [string, string, string, string];
  far: string;
  mid: string;
  snow: string;
  near: string;
  vignette: string;
  vignetteOpacity: number;
}

const DAY: Palette = {
  sky: ["#4aa3e6", "#8fc9f0", "#cfe9f8", "#eaf5fc"],
  sun: "#fff4d6",
  lake: ["#bfe6f2", "#79c1de", "#3f9ac6", "#2b6f96"],
  far: "#9dc4e0",
  mid: "#6fa0c4",
  snow: "#eef6fb",
  near: "#4f7f79",
  vignette: "#0b2540",
  vignetteOpacity: 0.28,
};

const NIGHT: Palette = {
  sky: ["#0a1430", "#122247", "#1c2d54", "#243a63"],
  sun: "#2a3a66",
  lake: ["#1b2c4a", "#152640", "#0f1d32", "#0a1424"],
  far: "#26385d",
  mid: "#1c2b4a",
  snow: "#c9d6ec",
  near: "#16233b",
  vignette: "#000008",
  vignetteOpacity: 0.55,
};

function Scene({ palette: p }: { palette: Palette }) {
  return (
    <svg
      aria-hidden="true"
      className="h-full w-full"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="wp-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.sky[0]} />
          <stop offset="42%" stopColor={p.sky[1]} />
          <stop offset="72%" stopColor={p.sky[2]} />
          <stop offset="100%" stopColor={p.sky[3]} />
        </linearGradient>
        <radialGradient id="wp-sun" cx="78%" cy="20%" r="26%">
          <stop offset="0%" stopColor={p.sun} stopOpacity="0.9" />
          <stop offset="100%" stopColor={p.sun} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="wp-lake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.lake[0]} />
          <stop offset="18%" stopColor={p.lake[1]} />
          <stop offset="60%" stopColor={p.lake[2]} />
          <stop offset="100%" stopColor={p.lake[3]} />
        </linearGradient>
        <radialGradient id="wp-vig" cx="50%" cy="42%" r="75%">
          <stop offset="60%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor={p.vignette} stopOpacity={p.vignetteOpacity} />
        </radialGradient>
      </defs>
      <rect width="1440" height="640" fill="url(#wp-sky)" />
      <rect width="1440" height="640" fill="url(#wp-sun)" />
      <path d="M0 470 L150 430 L320 468 L470 410 L640 460 L820 405 L1010 458 L1200 415 L1440 452 L1440 640 L0 640 Z" fill={p.far} opacity="0.65" />
      <path d="M0 520 L180 452 L330 512 L520 440 L700 516 L900 448 L1120 520 L1320 462 L1440 500 L1440 660 L0 660 Z" fill={p.mid} opacity="0.85" />
      <path d="M520 440 L560 470 L600 452 L640 486 L700 516 L520 516 Z M900 448 L940 478 L985 458 L1030 492 L900 500 Z M180 452 L214 480 L250 462 L286 492 L180 500 Z" fill={p.snow} opacity="0.9" />
      <path d="M0 596 L220 540 L430 598 L640 548 L860 602 L1080 552 L1300 606 L1440 566 L1440 640 L0 640 Z" fill={p.near} opacity="0.92" />
      <rect y="612" width="1440" height="288" fill="url(#wp-lake)" />
      <rect y="612" width="1440" height="3" fill="#ffffff" opacity="0.25" />
      <rect width="1440" height="900" fill="url(#wp-vig)" />
    </svg>
  );
}

function Aurora() {
  return (
    <div className="h-full w-full bg-[#0b1026]">
      <div
        className="h-full w-full"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 20%, rgba(56,189,248,0.55), transparent 60%)," +
            "radial-gradient(55% 45% at 80% 25%, rgba(168,85,247,0.5), transparent 60%)," +
            "radial-gradient(65% 55% at 60% 85%, rgba(16,185,129,0.45), transparent 60%)," +
            "radial-gradient(50% 45% at 30% 80%, rgba(236,72,153,0.4), transparent 60%)",
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify compile**

Run: `npx tsc --noEmit`
Expected: exit 0. (Note: `Desktop.tsx` still calls `<Wallpaper />` with no props — valid, defaults to `day` — until Task 7 wires the id.)

- [ ] **Step 3: Commit**

```bash
git add features/desktop/components/Wallpaper.tsx
git commit -m "feat: make Wallpaper id-driven (day/night/aurora)"
```

---

## Task 7: Register the Settings app + wire wallpaper by id

**Files:**
- Modify: `types/index.ts`, `lib/apps.config.tsx`, `features/desktop/components/appRegistry.tsx`, `features/desktop/components/Desktop.tsx`

- [ ] **Step 1: Add `"settings"` to `AppId` in `types/index.ts`**

Change the `AppId` union to include settings:
```ts
export type AppId = "about" | "projects" | "contact" | "settings";
```
(Leave `Geometry` unchanged.)

- [ ] **Step 2: Register the app in `lib/apps.config.tsx`**

Add the `Settings` icon to the lucide import and append an entry to `apps`:
```tsx
import { FolderKanban, Mail, Settings, User } from "lucide-react";
```
Append to the `apps` array:
```tsx
  {
    id: "settings",
    titleKey: "settings",
    icon: Settings,
    tile: "from-slate-400 to-slate-600",
    defaultGeometry: { x: 240, y: 110, width: 720, height: 480 },
  },
```

- [ ] **Step 3: Map it in `features/desktop/components/appRegistry.tsx`**

```tsx
import { AboutApp } from "@/features/about";
import { ContactApp } from "@/features/contact";
import { ProjectsApp } from "@/features/projects";
import { SettingsApp } from "@/features/settings";
import type { AppId } from "@/types";

export const appComponents: Record<AppId, React.ComponentType> = {
  about: AboutApp,
  projects: ProjectsApp,
  contact: ContactApp,
  settings: SettingsApp,
};
```

- [ ] **Step 4: Drive the wallpaper from settings in `features/desktop/components/Desktop.tsx`**

Add `"use client"` is already present. Import `useSettings` and pass the id:
```tsx
import { useSettings } from "@/context/SettingsContext";
```
Inside `Desktop`, read it and pass to `Wallpaper`:
```tsx
  const { settings } = useSettings();
```
Change `<Wallpaper />` to:
```tsx
        <Wallpaper id={settings.wallpaper} />
```
(The `SettingsProvider` is in the layout from Task 4, so `useSettings` resolves. Do NOT add another provider here.)

- [ ] **Step 5: Verify compile (expect a known gap)**

Run: `npx tsc --noEmit`
Expected: FAILS only on the missing `@/features/settings` module and the missing `apps.settings` message key type — both created in Tasks 8–9. If any OTHER error appears, fix it. (This task's files are otherwise correct.)

- [ ] **Step 6: Commit**

```bash
git add types/index.ts lib/apps.config.tsx features/desktop/components/appRegistry.tsx features/desktop/components/Desktop.tsx
git commit -m "feat: register Settings app + drive wallpaper from settings"
```

---

## Task 8: Settings app UI (window + panes)

**Files:**
- Create: `features/settings/components/Toggle.tsx`, `AppearancePane.tsx`, `WallpaperPane.tsx`, `AccessibilityPane.tsx`, `LanguagePane.tsx`, `SettingsApp.tsx`, and `features/settings/index.ts`

- [ ] **Step 1: Create `features/settings/components/Toggle.tsx`**

```tsx
"use client";

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
          checked ? "bg-blue-500" : "bg-black/20 dark:bg-white/20"
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${
            checked ? "start-[1.125rem]" : "start-0.5"
          }`}
        />
      </button>
    </label>
  );
}
```

- [ ] **Step 2: Create `features/settings/components/AppearancePane.tsx`**

```tsx
"use client";

import { useTranslations } from "next-intl";
import { useSettings } from "@/context/SettingsContext";
import type { Theme } from "@/settings/config";

const OPTIONS: Theme[] = ["light", "dark", "auto"];

export function AppearancePane() {
  const t = useTranslations("settings");
  const { settings, setSetting } = useSettings();
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{t("appearance")}</h2>
      <div className="inline-flex rounded-xl bg-black/10 p-1 dark:bg-white/10">
        {OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setSetting("theme", opt)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
              settings.theme === opt
                ? "bg-white text-slate-900 shadow dark:bg-slate-200"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            {t(`theme_${opt}`)}
          </button>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create `features/settings/components/WallpaperPane.tsx`**

```tsx
"use client";

import { useTranslations } from "next-intl";
import { useSettings } from "@/context/SettingsContext";
import { Wallpaper } from "@/features/desktop/components/Wallpaper";
import type { WallpaperId } from "@/settings/config";

const WALLPAPERS: WallpaperId[] = ["day", "night", "aurora"];

export function WallpaperPane() {
  const t = useTranslations("settings");
  const { settings, setSetting } = useSettings();
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{t("wallpaper")}</h2>
      <div className="grid grid-cols-3 gap-3">
        {WALLPAPERS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setSetting("wallpaper", id)}
            className={`overflow-hidden rounded-xl ring-2 transition ${
              settings.wallpaper === id ? "ring-blue-500" : "ring-transparent"
            }`}
          >
            <span className="relative block aspect-video">
              <Wallpaper id={id} />
            </span>
            <span className="block py-1.5 text-center text-xs font-medium">
              {t(`wallpaper_${id}`)}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create `features/settings/components/AccessibilityPane.tsx`**

```tsx
"use client";

import { useTranslations } from "next-intl";
import { useSettings } from "@/context/SettingsContext";
import { Toggle } from "./Toggle";

export function AccessibilityPane() {
  const t = useTranslations("settings");
  const { settings, setSetting } = useSettings();
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{t("accessibility")}</h2>
      <div className="divide-y divide-black/10 dark:divide-white/10">
        <Toggle
          label={t("reduceTransparency")}
          checked={settings.reduceTransparency}
          onChange={(v) => setSetting("reduceTransparency", v)}
        />
        <Toggle
          label={t("reduceMotion")}
          checked={settings.reduceMotion}
          onChange={(v) => setSetting("reduceMotion", v)}
        />
        <Toggle
          label={t("largerText")}
          checked={settings.largerText}
          onChange={(v) => setSetting("largerText", v)}
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create `features/settings/components/LanguagePane.tsx`**

```tsx
"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Locale } from "@/i18n/config";
import { setUserLocale } from "@/i18n/locale";

const LOCALES: { id: Locale; labelKey: string }[] = [
  { id: "en", labelKey: "english" },
  { id: "fa", labelKey: "persian" },
];

export function LanguagePane() {
  const t = useTranslations("settings");
  const tMenu = useTranslations("menu");
  const locale = useLocale();
  const router = useRouter();
  const [, startTransition] = useTransition();

  function change(next: Locale) {
    startTransition(async () => {
      await setUserLocale(next);
      router.refresh();
    });
  }

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{t("language")}</h2>
      <div className="flex flex-col gap-2">
        {LOCALES.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => change(l.id)}
            className={`rounded-lg px-4 py-2 text-start text-sm transition ${
              locale === l.id
                ? "bg-blue-500 text-white"
                : "bg-black/5 dark:bg-white/10"
            }`}
          >
            {tMenu(l.labelKey)}
          </button>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Create `features/settings/components/SettingsApp.tsx`**

```tsx
"use client";

import {
  Accessibility,
  Image as ImageIcon,
  Languages,
  Palette,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AccessibilityPane } from "./AccessibilityPane";
import { AppearancePane } from "./AppearancePane";
import { LanguagePane } from "./LanguagePane";
import { WallpaperPane } from "./WallpaperPane";

type PaneId = "appearance" | "wallpaper" | "accessibility" | "language";

const PANES: { id: PaneId; icon: typeof Palette; labelKey: string }[] = [
  { id: "appearance", icon: Palette, labelKey: "appearance" },
  { id: "wallpaper", icon: ImageIcon, labelKey: "wallpaper" },
  { id: "accessibility", icon: Accessibility, labelKey: "accessibility" },
  { id: "language", icon: Languages, labelKey: "language" },
];

export function SettingsApp() {
  const t = useTranslations("settings");
  const [active, setActive] = useState<PaneId>("appearance");

  return (
    <div className="-m-5 flex h-[calc(100%+2.5rem)]">
      <nav className="w-48 shrink-0 border-e border-black/10 bg-black/5 p-2 dark:border-white/10 dark:bg-white/5">
        {PANES.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(p.id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm transition ${
                active === p.id
                  ? "bg-blue-500 text-white"
                  : "hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              <Icon className="size-4" />
              {t(p.labelKey)}
            </button>
          );
        })}
      </nav>
      <div className="flex-1 overflow-auto p-6">
        {active === "appearance" && <AppearancePane />}
        {active === "wallpaper" && <WallpaperPane />}
        {active === "accessibility" && <AccessibilityPane />}
        {active === "language" && <LanguagePane />}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Create `features/settings/index.ts`**

```ts
export { SettingsApp } from "./components/SettingsApp";
```

- [ ] **Step 8: Verify compile (expect only the missing message keys)**

Run: `npx tsc --noEmit`
Expected: passes except any `settings`/`apps.settings` message-key type errors resolved in Task 9. Fix any non-message error.

- [ ] **Step 9: Commit**

```bash
git add features/settings
git commit -m "feat: add Settings app window with four panes"
```

---

## Task 9: Messages (settings namespace + apps.settings)

**Files:**
- Modify: `messages/en.json`, `messages/fa.json`

- [ ] **Step 1: Add to `messages/en.json`**

Add `"settings": "Settings"` inside the existing `apps` object, and add a top-level `settings` namespace:
```json
  "settings": {
    "appearance": "Appearance",
    "theme_light": "Light",
    "theme_dark": "Dark",
    "theme_auto": "Auto",
    "wallpaper": "Wallpaper",
    "wallpaper_day": "Tahoe Day",
    "wallpaper_night": "Tahoe Night",
    "wallpaper_aurora": "Aurora",
    "accessibility": "Accessibility",
    "reduceTransparency": "Reduce Transparency",
    "reduceMotion": "Reduce Motion",
    "largerText": "Larger Text",
    "language": "Language & Region"
  }
```

- [ ] **Step 2: Add the mirror to `messages/fa.json`**

Add `"settings": "تنظیمات"` inside `apps`, and:
```json
  "settings": {
    "appearance": "ظاهر",
    "theme_light": "روشن",
    "theme_dark": "تیره",
    "theme_auto": "خودکار",
    "wallpaper": "تصویر زمینه",
    "wallpaper_day": "تاهو روز",
    "wallpaper_night": "تاهو شب",
    "wallpaper_aurora": "شفق",
    "accessibility": "دسترس‌پذیری",
    "reduceTransparency": "کاهش شفافیت",
    "reduceMotion": "کاهش حرکت",
    "largerText": "متن بزرگ‌تر",
    "language": "زبان و منطقه"
  }
```

- [ ] **Step 3: Verify parity + compile**

Run:
```bash
node -e "const en=require('./messages/en.json'),fa=require('./messages/fa.json');const k=o=>Object.keys(o).flatMap(x=>o[x]&&typeof o[x]==='object'?Object.keys(o[x]).map(y=>x+'.'+y):x).sort();console.log('parity:',JSON.stringify(k(en))===JSON.stringify(k(fa)))"
npx tsc --noEmit
```
Expected: `parity: true`; tsc exit 0 (the app now compiles fully).

- [ ] **Step 4: Commit**

```bash
git add messages/en.json messages/fa.json
git commit -m "feat: add settings i18n namespace (en + fa)"
```

---

## Task 10: Dark-mode variants on the glass components

**Files:**
- Modify: `features/desktop/components/MenuBar.tsx`, `Dock.tsx`, `Window.tsx`, `Widgets.tsx`, `DesktopIcons.tsx`, `MobileHome.tsx`

The `.lg-*` utilities already flip via Task 5, so only **text/color** classes need dark variants. Apply these exact additions (append the `dark:` class next to each listed class):

- [ ] **Step 1: `MenuBar.tsx`** — the header uses `text-slate-800`; add `dark:text-slate-100`. Change `bg-white/15` → `bg-white/15 dark:bg-black/25` and `border-white/25` → `border-white/25 dark:border-white/10`.

- [ ] **Step 2: `Dock.tsx`** — the running-app dot `bg-slate-700/80` → add `dark:bg-slate-200/80`. The tooltip text `text-slate-800` → add `dark:text-slate-100`.

- [ ] **Step 3: `Window.tsx`** — title `text-slate-700` → add `dark:text-slate-200`; content wrapper `bg-white/45 text-slate-800` → add `dark:bg-black/30 dark:text-slate-100`.

- [ ] **Step 4: `Widgets.tsx`** — card text `text-slate-800` → add `dark:text-slate-100`; muted `text-slate-500`/`text-slate-600`/`text-slate-700` → add `dark:text-slate-300`/`dark:text-slate-400` respectively; keep the red today-dot and weather gradient as-is.

- [ ] **Step 5: `DesktopIcons.tsx`** — labels are already white with a shadow (legible on both themes); no change needed. (Confirm by reading; do not edit if already `text-white`.)

- [ ] **Step 6: `MobileHome.tsx`** — full-screen header `text-slate-800` → add `dark:text-slate-100`; content `bg-white/60 text-slate-800` → add `dark:bg-black/40 dark:text-slate-100`. Tiles/labels already white — leave.

- [ ] **Step 7: Verify compile**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 8: Commit**

```bash
git add features/desktop/components
git commit -m "feat: add dark-mode variants to glass components"
```

---

## Task 11: Full verification + lint gate

**Files:** none (verification)

- [ ] **Step 1: Type-check + tests**

Run: `npx tsc --noEmit && npm test`
Expected: tsc exit 0; tests pass (12 existing + 6 new `parseSettings` = the settings suite green).

- [ ] **Step 2: Lint gate**

Run: `npx biome check --write features settings context app/globals.css app/layout.tsx messages && npm run lint`
Expected: `npm run lint` exits 0 (warnings only). Fix any real errors (e.g., array-index keys, a11y) surfaced.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: succeeds; route `ƒ /` dynamic.

- [ ] **Step 4: Manual browser verification**

Run `npm run dev`, open `http://localhost:3000/`, open **Settings** from the dock, and confirm:
- **Appearance:** Light/Dark/Auto re-themes the whole desktop (menu bar, dock, window, widgets). Reload the page — the choice persists with **no flash**. Set Auto and toggle the OS appearance — it follows.
- **Wallpaper:** clicking a thumbnail live-updates the desktop background.
- **Accessibility:** Reduce Transparency makes glass solid; Reduce Motion stops the dock hover magnify/transitions; Larger Text scales up.
- **Language & Region:** EN ↔ فارسی switches locale (dir flips) with no URL change.
- No console errors. Shrink below 768px → the settings app opens full-screen in `MobileHome`.

- [ ] **Step 5: Commit (if any lint fixups were applied)**

```bash
git add -A
git commit -m "chore: settings app lint + verification fixups"
```

---

## Self-Review Notes (against the spec)

- **`settings/` domain (config + cookie)** → Tasks 1–2 (parseSettings TDD'd). ✅
- **Cookie persistence + no-flash `<html>` application** → Task 4 (server read + NO_FLASH script) + Task 3 (`applyToDom`). ✅
- **SettingsContext (instant apply + persist, resolvedTheme/auto)** → Task 3. ✅
- **Dark Liquid Glass + accessibility CSS** → Task 5; component dark variants → Task 10. ✅
- **Wallpaper picker (day/night/aurora), id-driven** → Task 6 + Task 8 WallpaperPane + Task 7 Desktop wiring. ✅
- **Four functional panes (Appearance/Wallpaper/Accessibility/Language)** → Task 8. ✅
- **Settings app registered + opened like any app** → Task 7. ✅
- **i18n settings namespace, en/fa parity** → Task 9. ✅
- **Verification (gates + browser, incl. no-flash + mobile)** → Task 11. ✅

**Type/name consistency:** `Settings`, `Theme`, `WallpaperId`, `defaultSettings`, `SETTINGS_COOKIE`, `parseSettings` (config) are used identically in cookies/context/layout. `useSettings()` returns `{ settings, resolvedTheme, setSetting }` — consumed that way in Desktop + every pane. `setSetting<K>(key, value)` signature matches all call sites. `Wallpaper({ id })` prop matches Desktop + WallpaperPane. `settings` message keys match the pane `t(...)` calls and Task 9's catalog.
