# macOS-Style Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal portfolio as an interactive macOS desktop clone (draggable/resizable/minimizable windows, menu bar, dock) whose content is presented as "apps" — About, Projects, Contact — with a feature-based architecture, shadcn/ui on Base UI, next-intl (EN + Persian/RTL), and pure UI state machines in a `workflows/` layer.

**Architecture:** Pure logic (`workflows/`) → React wiring (`context/`) → presentation (`features/*`) → primitives (`components/ui/`). The window system is hand-rolled around a pure reducer; a `WindowManager` context exposes it; the desktop shell and apps consume it. A single app registry (`lib/apps.config.tsx`) is the source of truth for the dock, menu bar, and window layer.

**Tech Stack:** Next.js 16 (App Router, React 19), TypeScript, Tailwind CSS v4, shadcn/ui on Base UI (`--base base --rtl`), next-intl, Vitest (unit tests for pure logic), Biome (lint/format), lucide icons.

**Conventions:**
- Path alias `@/*` → `./*` (already configured in `tsconfig.json`).
- Per `AGENTS.md`: this is a modified Next.js. Before writing any routing/middleware/layout code, read the relevant guide under `node_modules/next/dist/docs/01-app/`.
- Single-instance windows: one open window per app; `window.id === appId`.
- Commit after each task with the message shown in its final step.

---

## File Structure

```
app/
  layout.tsx          # root: <html lang dir> from cookie locale, fonts, NextIntlClientProvider
  page.tsx            # renders <Desktop/>
  globals.css         # Tailwind v4 + shadcn tokens + macOS tokens (shadcn may edit)
next.config.ts        # wrapped with createNextIntlPlugin()
components.json        # shadcn config (created by init)
vitest.config.ts

i18n/                  # cookie-based, no URL routing, no middleware
  config.ts           # locales (en default + fa), defaultLocale, Locale type
  request.ts          # getRequestConfig: read cookie locale, load messages/{locale}.json
  locale.ts           # "use server": getUserLocale / setUserLocale (NEXT_LOCALE cookie)
messages/
  en.json
  fa.json

types/
  index.ts            # AppId + shared types

workflows/
  windowManager.ts        # pure reducer + actions + initial state
  windowManager.test.ts
  contactForm.ts          # pure submit state machine
  contactForm.test.ts

context/
  WindowManagerContext.tsx

hooks/
  useMediaQuery.ts
  useIsMobile.ts

lib/
  apps.config.tsx     # app registry (id, titleKey, icon, component, geometry)
  content.ts          # structured, non-translatable data (projects, socials)
  utils.ts            # cn() (created by shadcn)

components/
  ui/                 # shadcn/Base UI primitives (button, input, textarea, label)

features/
  desktop/
    components/       # Desktop, MenuBar, Dock, Window, WindowLayer, MobileHome
    hooks/            # useDrag, useClock
    index.ts
  about/
    components/AboutApp.tsx
    index.ts
  projects/
    components/ProjectsApp.tsx
    index.ts
  contact/
    components/ContactApp.tsx
    hooks/useContactForm.ts
    index.ts
```

---

## Task 1: Tooling — Vitest, next-intl, shadcn/Base UI

**Files:**
- Modify: `package.json` (scripts + deps)
- Create: `vitest.config.ts`
- Create: `components.json` (via shadcn init)
- Modify: `next.config.ts`
- Create: `lib/utils.ts` (via shadcn init)

- [ ] **Step 1: Install runtime + dev dependencies**

Run:
```bash
npm install next-intl
npm install -D vitest
```
Expected: both install without peer-dependency errors.

- [ ] **Step 2: Add test scripts to `package.json`**

In the `"scripts"` block add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Verify the test runner works (no tests yet)**

Run: `npm test`
Expected: Vitest reports "No test files found" (exit 0) — runner is wired up.

- [ ] **Step 5: Initialize shadcn/ui on Base UI with RTL**

Run:
```bash
npx shadcn@latest init --base base --rtl --yes
```
Expected: creates `components.json`, `lib/utils.ts` (with `cn`), updates `app/globals.css` with theme tokens, and sets `iconLibrary` to lucide. If prompted about the existing `app/globals.css`, allow it.

- [ ] **Step 6: Point the `ui` alias at `components/ui`**

Open `components.json` and confirm/set the `aliases` block:
```json
"aliases": {
  "components": "@/components",
  "utils": "@/lib/utils",
  "ui": "@/components/ui",
  "lib": "@/lib",
  "hooks": "@/hooks"
}
```

- [ ] **Step 7: Add the primitives the apps need**

Run:
```bash
npx shadcn@latest add button input textarea label --yes
```
Expected: files appear under `components/ui/`.

- [ ] **Step 8: Wrap `next.config.ts` with the next-intl plugin**

Replace `next.config.ts` with:
```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
```

- [ ] **Step 9: Verify the build tooling still compiles**

Run: `npx tsc --noEmit`
Expected: no type errors (the plugin default looks for `./i18n/request.ts`, created in Task 2 — this step only checks TS compiles; Next won't run yet).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: add vitest, next-intl, shadcn/Base UI tooling"
```

---

## Task 2: Internationalization plumbing (next-intl, EN + FA/RTL)

Read first: `node_modules/next/dist/docs/01-app` layout/rendering guides. This uses next-intl
**without i18n routing** — locale comes from a cookie, NOT the URL. No `[locale]` segment, no
middleware.

**Files:**
- Create: `i18n/config.ts`, `i18n/request.ts`, `i18n/locale.ts`
- Create: `messages/en.json`, `messages/fa.json`
- Modify: `app/layout.tsx` (replace the starter root layout)
- Replace: `app/page.tsx` (temporary i18n verification page)

- [ ] **Step 1: Create `i18n/config.ts`**

```ts
export const locales = ["en", "fa"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
```

- [ ] **Step 2: Create `i18n/locale.ts` (server action for the cookie)**

```ts
"use server";

import { cookies } from "next/headers";
import { hasLocale } from "next-intl";
import { defaultLocale, locales, type Locale } from "./config";

const COOKIE_NAME = "NEXT_LOCALE";

export async function getUserLocale(): Promise<Locale> {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  return hasLocale(locales, value) ? value : defaultLocale;
}

export async function setUserLocale(locale: Locale) {
  (await cookies()).set(COOKIE_NAME, locale);
}
```

- [ ] **Step 3: Create `i18n/request.ts`**

```ts
import { getRequestConfig } from "next-intl/server";
import { getUserLocale } from "./locale";

export default getRequestConfig(async () => {
  const locale = await getUserLocale();

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 4: Create `messages/en.json`**

```json
{
  "apps": {
    "about": "About Me",
    "projects": "Projects",
    "contact": "Contact"
  },
  "menu": {
    "language": "Language",
    "english": "English",
    "persian": "فارسی"
  },
  "about": {
    "role": "Software Engineer",
    "bio": "I build thoughtful, well-crafted software for the web. This desktop is my portfolio — open the apps in the dock to look around.",
    "skillsTitle": "Skills"
  },
  "projects": {
    "intro": "A few things I've built.",
    "p1": { "title": "Project One", "description": "A placeholder project. Swap this copy in messages/." },
    "p2": { "title": "Project Two", "description": "Another placeholder project with its own description." },
    "p3": { "title": "Project Three", "description": "A third placeholder to show the gallery layout." }
  },
  "contact": {
    "title": "Get in touch",
    "name": "Name",
    "email": "Email",
    "message": "Message",
    "send": "Send",
    "sending": "Sending…",
    "success": "Thanks — this is a demo form, nothing was actually sent.",
    "error": "Something went wrong. Please try again."
  }
}
```

- [ ] **Step 5: Create `messages/fa.json`**

```json
{
  "apps": {
    "about": "درباره من",
    "projects": "پروژه‌ها",
    "contact": "تماس"
  },
  "menu": {
    "language": "زبان",
    "english": "English",
    "persian": "فارسی"
  },
  "about": {
    "role": "مهندس نرم‌افزار",
    "bio": "من نرم‌افزارهای باکیفیت و کاربردی برای وب می‌سازم. این دسکتاپ نمونه‌کار من است — از داک برنامه‌ها را باز کنید.",
    "skillsTitle": "مهارت‌ها"
  },
  "projects": {
    "intro": "چند نمونه از ساخته‌هایم.",
    "p1": { "title": "پروژه یک", "description": "یک پروژه نمونه. این متن را در messages تغییر دهید." },
    "p2": { "title": "پروژه دو", "description": "پروژه نمونه دیگری با توضیحات خودش." },
    "p3": { "title": "پروژه سه", "description": "سومین نمونه برای نمایش چیدمان گالری." }
  },
  "contact": {
    "title": "در تماس باشید",
    "name": "نام",
    "email": "ایمیل",
    "message": "پیام",
    "send": "ارسال",
    "sending": "در حال ارسال…",
    "success": "ممنون — این فرم نمایشی است و چیزی ارسال نشد.",
    "error": "مشکلی پیش آمد. دوباره تلاش کنید."
  }
}
```

- [ ] **Step 6: Replace `app/layout.tsx` (root layout, cookie locale)**

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portfolio OS",
  description: "An interactive macOS-style portfolio.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dir = locale === "fa" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Replace `app/page.tsx` (temporary i18n verification page)**

```tsx
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("apps");
  return <main className="p-8">{t("about")} · i18n works.</main>;
}
```

- [ ] **Step 8: Verify build + locale rendering**

Run: `npx tsc --noEmit` → exit 0.
Run: `npm run build` → succeeds (no `[locale]` route; single root route).
Optionally `npm run dev` and visit `http://localhost:3000/` → shows "About Me · i18n works."
(Default locale `en`; there is NO `/en` or `/fa` URL — locale lives in the `NEXT_LOCALE`
cookie.) Do NOT leave a dev server running.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add cookie-based next-intl i18n (en + fa/rtl, no url locale)"
```

---

## Task 3: Shared types + content + app registry (skeleton)

**Files:**
- Create: `types/index.ts`
- Create: `lib/content.ts`
- Create: `lib/apps.config.tsx`

- [ ] **Step 1: Create `types/index.ts`**

```ts
export type AppId = "about" | "projects" | "contact";

export interface Geometry {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

- [ ] **Step 2: Create `lib/content.ts`**

```ts
export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  /** matches the message key under `projects.<id>` */
  id: "p1" | "p2" | "p3";
  tags: string[];
  links: ProjectLink[];
}

export interface SocialLink {
  label: string;
  href: string;
}

export const projects: Project[] = [
  { id: "p1", tags: ["TypeScript", "Next.js"], links: [{ label: "GitHub", href: "https://github.com" }] },
  { id: "p2", tags: ["React", "Tailwind"], links: [{ label: "Live", href: "https://example.com" }] },
  { id: "p3", tags: ["Node", "API"], links: [{ label: "GitHub", href: "https://github.com" }] },
];

export const skills: string[] = [
  "TypeScript", "React", "Next.js", "Node.js", "Tailwind CSS", "PostgreSQL",
];

export const socials: SocialLink[] = [
  { label: "GitHub", href: "https://github.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
];

export const contactEmail = "you@example.com";
```

- [ ] **Step 3: Create `lib/apps.config.tsx` (registry, apps wired in later tasks)**

```tsx
import type { LucideIcon } from "lucide-react";
import { Mail, User, FolderKanban } from "lucide-react";
import type { AppId, Geometry } from "@/types";

export interface DesktopApp {
  id: AppId;
  /** message key under `apps.<id>` */
  titleKey: AppId;
  icon: LucideIcon;
  defaultGeometry: Geometry;
}

export const apps: DesktopApp[] = [
  { id: "about", titleKey: "about", icon: User, defaultGeometry: { x: 120, y: 90, width: 520, height: 380 } },
  { id: "projects", titleKey: "projects", icon: FolderKanban, defaultGeometry: { x: 200, y: 130, width: 640, height: 460 } },
  { id: "contact", titleKey: "contact", icon: Mail, defaultGeometry: { x: 280, y: 160, width: 460, height: 480 } },
];

export function getApp(id: AppId): DesktopApp {
  const app = apps.find((a) => a.id === id);
  if (!app) throw new Error(`Unknown app: ${id}`);
  return app;
}
```

- [ ] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add shared types, content data, and app registry"
```

---

## Task 4: Window state machine (pure reducer, TDD)

**Files:**
- Create: `workflows/windowManager.ts`
- Test: `workflows/windowManager.test.ts`

- [ ] **Step 1: Write the failing test**

`workflows/windowManager.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import {
  windowReducer,
  initialWindowState,
  type WindowManagerState,
} from "./windowManager";
import type { Geometry } from "@/types";

const geo: Geometry = { x: 10, y: 10, width: 300, height: 200 };

function open(state: WindowManagerState, appId = "about") {
  return windowReducer(state, { type: "open", appId, geometry: geo });
}

describe("windowReducer", () => {
  it("opens a window, focuses it, and assigns a z-index", () => {
    const s = open(initialWindowState);
    expect(s.windows).toHaveLength(1);
    expect(s.windows[0].appId).toBe("about");
    expect(s.focusedId).toBe("about");
    expect(s.windows[0].zIndex).toBeGreaterThan(0);
  });

  it("is single-instance: re-opening focuses and restores the existing window", () => {
    let s = open(initialWindowState);
    s = windowReducer(s, { type: "minimize", id: "about" });
    s = open(s, "about");
    expect(s.windows).toHaveLength(1);
    expect(s.windows[0].isMinimized).toBe(false);
    expect(s.focusedId).toBe("about");
  });

  it("focus raises z-index above all others and sets focusedId", () => {
    let s = open(initialWindowState, "about");
    s = open(s, "projects");
    const projectsZ = s.windows.find((w) => w.appId === "projects")!.zIndex;
    s = windowReducer(s, { type: "focus", id: "about" });
    const aboutZ = s.windows.find((w) => w.appId === "about")!.zIndex;
    expect(aboutZ).toBeGreaterThan(projectsZ);
    expect(s.focusedId).toBe("about");
  });

  it("minimize hides the window and clears focus if it was focused", () => {
    let s = open(initialWindowState, "about");
    s = windowReducer(s, { type: "minimize", id: "about" });
    expect(s.windows[0].isMinimized).toBe(true);
    expect(s.focusedId).toBeNull();
  });

  it("close removes the window", () => {
    let s = open(initialWindowState, "about");
    s = windowReducer(s, { type: "close", id: "about" });
    expect(s.windows).toHaveLength(0);
    expect(s.focusedId).toBeNull();
  });

  it("move and resize update geometry", () => {
    let s = open(initialWindowState, "about");
    s = windowReducer(s, { type: "move", id: "about", x: 50, y: 60 });
    s = windowReducer(s, { type: "resize", id: "about", width: 400, height: 300 });
    const w = s.windows[0];
    expect([w.x, w.y, w.width, w.height]).toEqual([50, 60, 400, 300]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot import from `./windowManager` (module not found).

- [ ] **Step 3: Implement `workflows/windowManager.ts`**

```ts
import type { AppId, Geometry } from "@/types";

export interface WindowState extends Geometry {
  /** instance id — equals appId (single instance per app) */
  id: string;
  appId: AppId;
  zIndex: number;
  isMinimized: boolean;
}

export interface WindowManagerState {
  windows: WindowState[];
  focusedId: string | null;
  nextZIndex: number;
}

export const initialWindowState: WindowManagerState = {
  windows: [],
  focusedId: null,
  nextZIndex: 1,
};

export type WindowAction =
  | { type: "open"; appId: AppId; geometry: Geometry }
  | { type: "close"; id: string }
  | { type: "minimize"; id: string }
  | { type: "restore"; id: string }
  | { type: "focus"; id: string }
  | { type: "move"; id: string; x: number; y: number }
  | { type: "resize"; id: string; width: number; height: number };

function bringToFront(
  state: WindowManagerState,
  id: string,
): WindowManagerState {
  const z = state.nextZIndex;
  return {
    ...state,
    focusedId: id,
    nextZIndex: z + 1,
    windows: state.windows.map((w) =>
      w.id === id ? { ...w, zIndex: z, isMinimized: false } : w,
    ),
  };
}

export function windowReducer(
  state: WindowManagerState,
  action: WindowAction,
): WindowManagerState {
  switch (action.type) {
    case "open": {
      const existing = state.windows.find((w) => w.id === action.appId);
      if (existing) return bringToFront(state, action.appId);
      const win: WindowState = {
        id: action.appId,
        appId: action.appId,
        ...action.geometry,
        zIndex: state.nextZIndex,
        isMinimized: false,
      };
      return {
        windows: [...state.windows, win],
        focusedId: win.id,
        nextZIndex: state.nextZIndex + 1,
      };
    }
    case "close": {
      const windows = state.windows.filter((w) => w.id !== action.id);
      return {
        ...state,
        windows,
        focusedId: state.focusedId === action.id ? null : state.focusedId,
      };
    }
    case "minimize":
      return {
        ...state,
        focusedId: state.focusedId === action.id ? null : state.focusedId,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, isMinimized: true } : w,
        ),
      };
    case "restore":
    case "focus":
      return bringToFront(state, action.id);
    case "move":
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, x: action.x, y: action.y } : w,
        ),
      };
    case "resize":
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id
            ? { ...w, width: action.width, height: action.height }
            : w,
        ),
      };
    default:
      return state;
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — all 6 tests green.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add pure window-manager state machine with tests"
```

---

## Task 5: WindowManager context (React wiring)

**Files:**
- Create: `context/WindowManagerContext.tsx`

- [ ] **Step 1: Create `context/WindowManagerContext.tsx`**

```tsx
"use client";

import { createContext, useContext, useMemo, useReducer } from "react";
import type { AppId, Geometry } from "@/types";
import {
  initialWindowState,
  windowReducer,
  type WindowState,
} from "@/workflows/windowManager";

interface WindowManagerValue {
  windows: WindowState[];
  focusedId: string | null;
  open: (appId: AppId, geometry: Geometry) => void;
  close: (id: string) => void;
  minimize: (id: string) => void;
  focus: (id: string) => void;
  move: (id: string, x: number, y: number) => void;
  resize: (id: string, width: number, height: number) => void;
  isOpen: (appId: AppId) => boolean;
}

const WindowManagerContext = createContext<WindowManagerValue | null>(null);

export function WindowManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(windowReducer, initialWindowState);

  const value = useMemo<WindowManagerValue>(
    () => ({
      windows: state.windows,
      focusedId: state.focusedId,
      open: (appId, geometry) => dispatch({ type: "open", appId, geometry }),
      close: (id) => dispatch({ type: "close", id }),
      minimize: (id) => dispatch({ type: "minimize", id }),
      focus: (id) => dispatch({ type: "focus", id }),
      move: (id, x, y) => dispatch({ type: "move", id, x, y }),
      resize: (id, width, height) =>
        dispatch({ type: "resize", id, width, height }),
      isOpen: (appId) => state.windows.some((w) => w.id === appId),
    }),
    [state],
  );

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  );
}

export function useWindowManager(): WindowManagerValue {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) {
    throw new Error("useWindowManager must be used within WindowManagerProvider");
  }
  return ctx;
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add WindowManager context provider and hook"
```

---

## Task 6: Shared + desktop hooks (useMediaQuery, useIsMobile, useClock, useDrag)

**Files:**
- Create: `hooks/useMediaQuery.ts`, `hooks/useIsMobile.ts`
- Create: `features/desktop/hooks/useClock.ts`, `features/desktop/hooks/useDrag.ts`

- [ ] **Step 1: Create `hooks/useMediaQuery.ts`**

```ts
"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
```

- [ ] **Step 2: Create `hooks/useIsMobile.ts`**

```ts
"use client";

import { useMediaQuery } from "./useMediaQuery";

/** Below Tailwind's md breakpoint (768px) we use the stacked mobile shell. */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}
```

- [ ] **Step 3: Create `features/desktop/hooks/useClock.ts`**

```ts
"use client";

import { useEffect, useState } from "react";

export function useClock(locale: string): string {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(id);
  }, []);

  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);
}
```

- [ ] **Step 4: Create `features/desktop/hooks/useDrag.ts`**

```ts
"use client";

import { useCallback, useRef } from "react";

interface UseDragOptions {
  onDrag: (dx: number, dy: number) => void;
  onStart?: () => void;
}

/**
 * Pointer-events drag. Reports frame-batched deltas from the drag origin.
 * Works for both window moving and resizing (caller applies the delta).
 */
export function useDrag({ onDrag, onStart }: UseDragOptions) {
  const frame = useRef<number | null>(null);
  const pending = useRef<{ dx: number; dy: number } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      onStart?.();
      const startX = e.clientX;
      const startY = e.clientY;
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      const flush = () => {
        frame.current = null;
        if (pending.current) {
          onDrag(pending.current.dx, pending.current.dy);
          pending.current = null;
        }
      };

      const onMove = (ev: PointerEvent) => {
        pending.current = { dx: ev.clientX - startX, dy: ev.clientY - startY };
        if (frame.current === null) {
          frame.current = requestAnimationFrame(flush);
        }
      };

      const onUp = (ev: PointerEvent) => {
        target.releasePointerCapture(ev.pointerId);
        target.removeEventListener("pointermove", onMove);
        target.removeEventListener("pointerup", onUp);
        if (frame.current !== null) cancelAnimationFrame(frame.current);
        frame.current = null;
        pending.current = null;
      };

      target.addEventListener("pointermove", onMove);
      target.addEventListener("pointerup", onUp);
    },
    [onDrag, onStart],
  );

  return { onPointerDown };
}
```

- [ ] **Step 5: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add media-query, clock, and pointer-drag hooks"
```

---

## Task 7: Window chrome component

**Files:**
- Create: `features/desktop/components/Window.tsx`

- [ ] **Step 1: Create `features/desktop/components/Window.tsx`**

```tsx
"use client";

import { useTranslations } from "next-intl";
import { useWindowManager } from "@/context/WindowManagerContext";
import { getApp } from "@/lib/apps.config";
import type { WindowState } from "@/workflows/windowManager";
import { useDrag } from "@/features/desktop/hooks/useDrag";

const MIN_W = 320;
const MIN_H = 240;

export function Window({
  win,
  children,
}: {
  win: WindowState;
  children: React.ReactNode;
}) {
  const t = useTranslations("apps");
  const { move, resize, focus, close, minimize, focusedId } = useWindowManager();
  const app = getApp(win.appId);
  const isFocused = focusedId === win.id;

  const startPos = { x: win.x, y: win.y };
  const startSize = { w: win.width, h: win.height };

  const titleDrag = useDrag({
    onStart: () => focus(win.id),
    onDrag: (dx, dy) => {
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 40;
      const x = Math.min(Math.max(startPos.x + dx, -win.width + 120), maxX);
      const y = Math.min(Math.max(startPos.y + dy, 28), maxY);
      move(win.id, x, y);
    },
  });

  const resizeDrag = useDrag({
    onStart: () => focus(win.id),
    onDrag: (dx, dy) =>
      resize(win.id, Math.max(MIN_W, startSize.w + dx), Math.max(MIN_H, startSize.h + dy)),
  });

  if (win.isMinimized) return null;

  return (
    <div
      role="dialog"
      aria-label={t(app.titleKey)}
      onPointerDown={() => focus(win.id)}
      style={{ left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.zIndex }}
      className={`absolute flex flex-col overflow-hidden rounded-xl border border-black/10 bg-white/90 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/90 ${
        isFocused ? "ring-1 ring-black/10" : "opacity-95"
      }`}
    >
      <div
        onPointerDown={titleDrag.onPointerDown}
        className="flex h-9 shrink-0 items-center gap-2 border-b border-black/5 bg-zinc-100/80 px-3 dark:border-white/5 dark:bg-zinc-800/80"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Close"
            onClick={() => close(win.id)}
            onPointerDown={(e) => e.stopPropagation()}
            className="size-3 rounded-full bg-red-500 transition hover:brightness-90"
          />
          <button
            type="button"
            aria-label="Minimize"
            onClick={() => minimize(win.id)}
            onPointerDown={(e) => e.stopPropagation()}
            className="size-3 rounded-full bg-yellow-500 transition hover:brightness-90"
          />
          <span className="size-3 rounded-full bg-green-500/70" />
        </div>
        <span className="pointer-events-none mx-auto pe-12 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          {t(app.titleKey)}
        </span>
      </div>

      <div className="flex-1 overflow-auto p-5 text-zinc-800 dark:text-zinc-100">
        {children}
      </div>

      <div
        onPointerDown={resizeDrag.onPointerDown}
        className="absolute bottom-0 end-0 size-4 cursor-nwse-resize"
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add draggable/resizable Window chrome"
```

---

## Task 8: App feature components (About, Projects, Contact)

**Files:**
- Create: `features/about/components/AboutApp.tsx`, `features/about/index.ts`
- Create: `features/projects/components/ProjectsApp.tsx`, `features/projects/index.ts`
- Create: `workflows/contactForm.ts` + `workflows/contactForm.test.ts`
- Create: `features/contact/hooks/useContactForm.ts`
- Create: `features/contact/components/ContactApp.tsx`, `features/contact/index.ts`

- [ ] **Step 1: Create `features/about/components/AboutApp.tsx`**

```tsx
"use client";

import { useTranslations } from "next-intl";
import { skills } from "@/lib/content";

export function AboutApp() {
  const t = useTranslations("about");
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{t("role")}</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("bio")}</p>
      </div>
      <div>
        <h3 className="text-sm font-semibold">{t("skillsTitle")}</h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {skills.map((s) => (
            <li key={s} className="rounded-full bg-zinc-200 px-3 py-1 text-xs dark:bg-zinc-700">
              {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `features/about/index.ts`**

```ts
export { AboutApp } from "./components/AboutApp";
```

- [ ] **Step 3: Create `features/projects/components/ProjectsApp.tsx`**

```tsx
"use client";

import { useTranslations } from "next-intl";
import { projects } from "@/lib/content";

export function ProjectsApp() {
  const t = useTranslations("projects");
  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("intro")}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((p) => (
          <article key={p.id} className="rounded-lg border border-black/10 p-4 dark:border-white/10">
            <h3 className="font-semibold">{t(`${p.id}.title`)}</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{t(`${p.id}.description`)}</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {p.tags.map((tag) => (
                <li key={tag} className="rounded bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">{tag}</li>
              ))}
            </ul>
            <div className="mt-3 flex gap-3 text-sm">
              {p.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                  {l.label}
                </a>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `features/projects/index.ts`**

```ts
export { ProjectsApp } from "./components/ProjectsApp";
```

- [ ] **Step 5: Write the failing contact-form workflow test**

`workflows/contactForm.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { contactReducer, initialContactState } from "./contactForm";

describe("contactReducer", () => {
  it("starts idle", () => {
    expect(initialContactState.status).toBe("idle");
  });

  it("submit -> submitting -> success", () => {
    let s = contactReducer(initialContactState, { type: "submit" });
    expect(s.status).toBe("submitting");
    s = contactReducer(s, { type: "resolve" });
    expect(s.status).toBe("success");
  });

  it("submit -> reject sets error", () => {
    let s = contactReducer(initialContactState, { type: "submit" });
    s = contactReducer(s, { type: "reject" });
    expect(s.status).toBe("error");
  });

  it("reset returns to idle", () => {
    let s = contactReducer(initialContactState, { type: "submit" });
    s = contactReducer(s, { type: "reset" });
    expect(s.status).toBe("idle");
  });
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `npm test`
Expected: FAIL — `./contactForm` not found.

- [ ] **Step 7: Implement `workflows/contactForm.ts`**

```ts
export type ContactStatus = "idle" | "submitting" | "success" | "error";

export interface ContactState {
  status: ContactStatus;
}

export const initialContactState: ContactState = { status: "idle" };

export type ContactAction =
  | { type: "submit" }
  | { type: "resolve" }
  | { type: "reject" }
  | { type: "reset" };

export function contactReducer(
  state: ContactState,
  action: ContactAction,
): ContactState {
  switch (action.type) {
    case "submit":
      return { status: "submitting" };
    case "resolve":
      return { status: "success" };
    case "reject":
      return { status: "error" };
    case "reset":
      return { status: "idle" };
    default:
      return state;
  }
}
```

- [ ] **Step 8: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — window-manager + contact-form suites green.

- [ ] **Step 9: Create `features/contact/hooks/useContactForm.ts`**

```ts
"use client";

import { useReducer } from "react";
import {
  contactReducer,
  initialContactState,
} from "@/workflows/contactForm";

export function useContactForm() {
  const [state, dispatch] = useReducer(contactReducer, initialContactState);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    dispatch({ type: "submit" });
    // Demo: no backend. Simulate a round-trip.
    await new Promise((r) => setTimeout(r, 700));
    dispatch({ type: "resolve" });
  }

  return { status: state.status, submit, reset: () => dispatch({ type: "reset" }) };
}
```

- [ ] **Step 10: Create `features/contact/components/ContactApp.tsx`**

```tsx
"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactEmail, socials } from "@/lib/content";
import { useContactForm } from "../hooks/useContactForm";

export function ContactApp() {
  const t = useTranslations("contact");
  const { status, submit } = useContactForm();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t("title")}</h2>
      <form onSubmit={submit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="c-name">{t("name")}</Label>
          <Input id="c-name" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="c-email">{t("email")}</Label>
          <Input id="c-email" type="email" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="c-msg">{t("message")}</Label>
          <Textarea id="c-msg" required rows={4} />
        </div>
        <Button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? t("sending") : t("send")}
        </Button>
        {status === "success" && <p className="text-sm text-green-600">{t("success")}</p>}
        {status === "error" && <p className="text-sm text-red-600">{t("error")}</p>}
      </form>
      <div className="border-t border-black/10 pt-3 text-sm dark:border-white/10">
        <a href={`mailto:${contactEmail}`} className="text-blue-600 hover:underline dark:text-blue-400">
          {contactEmail}
        </a>
        <div className="mt-2 flex gap-3">
          {socials.map((s) => (
            <a key={s.href} href={s.href} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 11: Create `features/contact/index.ts`**

```ts
export { ContactApp } from "./components/ContactApp";
```

- [ ] **Step 12: Verify compile + tests**

Run: `npx tsc --noEmit && npm test`
Expected: no type errors; all tests pass.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat: add About, Projects, and Contact app features"
```

---

## Task 9: Wire apps into the registry (component resolver)

**Files:**
- Create: `features/desktop/components/appRegistry.tsx`

- [ ] **Step 1: Create the appId → component map `features/desktop/components/appRegistry.tsx`**

```tsx
import { AboutApp } from "@/features/about";
import { ProjectsApp } from "@/features/projects";
import { ContactApp } from "@/features/contact";
import type { AppId } from "@/types";

export const appComponents: Record<AppId, React.ComponentType> = {
  about: AboutApp,
  projects: ProjectsApp,
  contact: ContactApp,
};
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: map app ids to feature components"
```

---

## Task 10: Menu bar and Dock

**Files:**
- Create: `features/desktop/components/MenuBar.tsx`
- Create: `features/desktop/components/Dock.tsx`

- [ ] **Step 1: Create `features/desktop/components/MenuBar.tsx`**

```tsx
"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Apple } from "lucide-react";
import { setUserLocale } from "@/i18n/locale";
import type { Locale } from "@/i18n/config";
import { useClock } from "@/features/desktop/hooks/useClock";
import { useWindowManager } from "@/context/WindowManagerContext";
import { getApp } from "@/lib/apps.config";
import type { AppId } from "@/types";

export function MenuBar() {
  const locale = useLocale();
  const tApps = useTranslations("apps");
  const tMenu = useTranslations("menu");
  const clock = useClock(locale);
  const router = useRouter();
  const [, startTransition] = useTransition();
  const { focusedId } = useWindowManager();

  const activeTitle = focusedId
    ? tApps(getApp(focusedId as AppId).titleKey)
    : "Finder";

  function changeLocale(next: string) {
    startTransition(async () => {
      await setUserLocale(next as Locale);
      router.refresh();
    });
  }

  return (
    <header className="fixed inset-x-0 top-0 z-[9999] flex h-7 items-center justify-between bg-black/20 px-4 text-sm text-white backdrop-blur-md">
      <div className="flex items-center gap-4">
        <Apple className="size-4" />
        <span className="font-semibold">{activeTitle}</span>
      </div>
      <div className="flex items-center gap-4">
        <label className="sr-only" htmlFor="lang">{tMenu("language")}</label>
        <select
          id="lang"
          value={locale}
          onChange={(e) => changeLocale(e.target.value)}
          className="bg-transparent text-white outline-none"
        >
          <option className="text-black" value="en">{tMenu("english")}</option>
          <option className="text-black" value="fa">{tMenu("persian")}</option>
        </select>
        <span>{clock}</span>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create `features/desktop/components/Dock.tsx`**

```tsx
"use client";

import { useTranslations } from "next-intl";
import { apps } from "@/lib/apps.config";
import { useWindowManager } from "@/context/WindowManagerContext";

export function Dock() {
  const t = useTranslations("apps");
  const { open, isOpen } = useWindowManager();

  return (
    <nav className="fixed inset-x-0 bottom-3 z-[9999] flex justify-center">
      <ul className="flex items-end gap-3 rounded-2xl border border-white/20 bg-white/20 px-3 py-2 shadow-xl backdrop-blur-2xl">
        {apps.map((app) => {
          const Icon = app.icon;
          return (
            <li key={app.id} className="group relative">
              <button
                type="button"
                aria-label={t(app.titleKey)}
                onClick={() => open(app.id, app.defaultGeometry)}
                className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-b from-white/80 to-white/50 text-zinc-800 shadow transition-transform duration-150 group-hover:-translate-y-1 group-hover:scale-110"
              >
                <Icon className="size-6" />
              </button>
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/70 px-2 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100">
                {t(app.titleKey)}
              </span>
              {isOpen(app.id) && (
                <span className="absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-zinc-800" />
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add macOS menu bar and dock"
```

---

## Task 11: Desktop shell, window layer, and mobile home

**Files:**
- Create: `features/desktop/components/WindowLayer.tsx`
- Create: `features/desktop/components/MobileHome.tsx`
- Create: `features/desktop/components/Desktop.tsx`
- Create: `features/desktop/index.ts`

- [ ] **Step 1: Create `features/desktop/components/WindowLayer.tsx`**

```tsx
"use client";

import { createElement } from "react";
import { useWindowManager } from "@/context/WindowManagerContext";
import { Window } from "./Window";
import { appComponents } from "./appRegistry";

export function WindowLayer() {
  const { windows } = useWindowManager();
  return (
    <>
      {windows.map((win) => (
        <Window key={win.id} win={win}>
          {createElement(appComponents[win.appId])}
        </Window>
      ))}
    </>
  );
}
```

- [ ] **Step 2: Create `features/desktop/components/MobileHome.tsx`**

```tsx
"use client";

import { createElement, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft } from "lucide-react";
import { apps, getApp } from "@/lib/apps.config";
import type { AppId } from "@/types";
import { appComponents } from "./appRegistry";

export function MobileHome() {
  const t = useTranslations("apps");
  const [active, setActive] = useState<AppId | null>(null);

  if (active) {
    const app = getApp(active);
    return (
      <div className="flex min-h-dvh flex-col bg-white dark:bg-zinc-900">
        <div className="flex h-12 items-center gap-2 border-b border-black/10 px-3 dark:border-white/10">
          <button type="button" onClick={() => setActive(null)} className="flex items-center gap-1 text-blue-600">
            <ChevronLeft className="size-5" />
          </button>
          <span className="font-medium">{t(app.titleKey)}</span>
        </div>
        <div className="flex-1 overflow-auto p-5">{createElement(appComponents[active])}</div>
      </div>
    );
  }

  return (
    <div className="grid min-h-dvh grid-cols-3 content-start gap-6 p-8 pt-16">
      {apps.map((app) => {
        const Icon = app.icon;
        return (
          <button key={app.id} type="button" onClick={() => setActive(app.id)} className="flex flex-col items-center gap-2">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-white/80 text-zinc-800 shadow">
              <Icon className="size-8" />
            </span>
            <span className="text-xs text-white">{t(app.titleKey)}</span>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Create `features/desktop/components/Desktop.tsx`**

```tsx
"use client";

import { WindowManagerProvider } from "@/context/WindowManagerContext";
import { useIsMobile } from "@/hooks/useIsMobile";
import { MenuBar } from "./MenuBar";
import { Dock } from "./Dock";
import { WindowLayer } from "./WindowLayer";
import { MobileHome } from "./MobileHome";

export function Desktop() {
  const isMobile = useIsMobile();

  return (
    <WindowManagerProvider>
      <main className="relative h-dvh w-full overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        {isMobile ? (
          <MobileHome />
        ) : (
          <>
            <MenuBar />
            <WindowLayer />
            <Dock />
          </>
        )}
      </main>
    </WindowManagerProvider>
  );
}
```

- [ ] **Step 4: Create `features/desktop/index.ts`**

```ts
export { Desktop } from "./components/Desktop";
```

- [ ] **Step 5: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add desktop shell, window layer, and mobile home"
```

---

## Task 12: Mount the desktop + final verification

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace `app/page.tsx` with the real desktop**

```tsx
import { Desktop } from "@/features/desktop";

export default function Home() {
  return <Desktop />;
}
```

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: PASS — window-manager and contact-form suites green.

- [ ] **Step 3: Lint + type-check**

Run: `npm run lint && npx tsc --noEmit`
Expected: Biome clean, no type errors. Fix any reported issues.

- [ ] **Step 4: Manual verification (desktop)**

Run: `npm run dev`, visit `http://localhost:3000/` (no locale in the URL):
- Dock shows three apps; clicking each opens a window.
- Windows drag from the title bar and resize from the bottom-right corner.
- Clicking a background window brings it to front (z-order).
- Red closes, yellow minimizes (dock dot remains; clicking the dock icon restores).
- Clock and language selector show in the menu bar.

- [ ] **Step 5: Manual verification (RTL + mobile)**

- Switch language to فارسی: layout mirrors (dock/menu/windows), `<html dir="rtl">`.
- Resize the browser below 768px (or DevTools device mode): the stacked `MobileHome` grid appears; tapping an app opens it full-screen; back returns to the grid.

- [ ] **Step 6: Production build sanity check**

Run: `npm run build`
Expected: build succeeds for both locales.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: mount interactive macOS desktop portfolio"
```

---

## Task 13: Repo tooling (`.claude/` + `.agent/`)

Development-only config to assist building/maintaining this project. Not served to users.

**Files:**
- Create: `.claude/README.md`
- Create: `.claude/agents/portfolio-ui.md`
- Create: `.agent/config.md`

- [ ] **Step 1: Create `.claude/README.md`**

```markdown
# .claude — project tooling

Project-scoped Claude Code configuration for the macOS-portfolio codebase.
See `docs/superpowers/specs/2026-07-05-macos-portfolio-design.md` for the design and
`docs/superpowers/plans/2026-07-05-macos-portfolio.md` for the implementation plan.

Architecture: workflows/ (pure logic) → context/ (React wiring) → features/* (UI) → components/ui/ (primitives).
```

- [ ] **Step 2: Create `.claude/agents/portfolio-ui.md`**

```markdown
---
name: portfolio-ui
description: Assists with the macOS-style portfolio UI — feature-based structure, window system, i18n (en/fa RTL).
---

You work in a feature-based Next.js 16 codebase.

Rules:
- New app-specific UI goes under `features/<feature>/components`, never a flat `components/` folder.
- Shared primitives live in `components/ui` (shadcn/Base UI) — add via `npx shadcn@latest add <name>`.
- Window/orchestration logic is pure and lives in `workflows/`; wire it through `context/`.
- All user-facing copy goes through next-intl messages (`messages/en.json`, `messages/fa.json`); never hardcode strings.
- Respect RTL: use Tailwind logical properties (ps-/pe-/start-/end-), not left/right.
- Per AGENTS.md, read `node_modules/next/dist/docs/01-app` before touching routing/middleware/layouts.
```

- [ ] **Step 3: Create `.agent/config.md`**

```markdown
# .agent

Agent workspace config for the macOS-portfolio project.

Key commands:
- `npm run dev` — start the dev server
- `npm test` — run Vitest unit tests (pure logic in `workflows/`)
- `npm run lint` — Biome check
- `npx tsc --noEmit` — type-check

Adding an app: add an entry to `lib/apps.config.tsx`, a component under `features/`, and map it in
`features/desktop/components/appRegistry.tsx`. A future Games app plugs in the same way.
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: add .claude and .agent project tooling"
```

---

## Self-Review Notes (verification against spec)

- **Feature architecture** → Tasks 8–11 (features/*), no flat components folder. ✅
- **shadcn on Base UI in `components/ui`** → Task 1 (init `--base base --rtl`, alias `@/components/ui`). ✅
- **i18n en + fa/RTL (cookie, no URL locale)** → Task 2 (config/request/locale + messages, `dir="rtl"`). ✅
- **workflows/ state machines** → Task 4 (windowManager) + Task 8 (contactForm), both TDD. ✅
- **context/, hooks/, types/, lib/** → Tasks 3, 5, 6. ✅
- **Draggable/resizable/minimizable windows, menu bar, dock** → Tasks 6–11. ✅
- **Mobile simplified view** → Task 11 (MobileHome via useIsMobile). ✅
- **Content placeholders, single swap point** → messages/ + lib/content.ts (Tasks 2–3). ✅
- **Extensible for a future Games app** → registry + appRegistry map (Tasks 3, 9). ✅
- **.claude / .agent tooling** → Task 13. ✅

**Type consistency:** `AppId`, `Geometry` (types/), `WindowState`/`windowReducer`/`initialWindowState`
(workflows/windowManager), `ContactState`/`contactReducer`/`initialContactState`
(workflows/contactForm), `useWindowManager()` surface, and `apps`/`getApp`/`DesktopApp`
(lib/apps.config) are defined once and reused verbatim across tasks.
