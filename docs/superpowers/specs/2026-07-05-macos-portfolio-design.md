# macOS-Style Portfolio — Design

**Date:** 2026-07-05
**Status:** Approved (design), pending implementation plan

## Summary

A personal portfolio built as a faithful, interactive **macOS desktop clone**. Visitors
land on a desktop with a menu bar, a dock, and draggable/resizable/minimizable windows.
Portfolio content is presented as "apps": **About Me**, **Projects**, and **Contact**. The
window system is hand-rolled (no windowing dependency). Mobile devices get a simplified
stacked/full-screen view of the same apps.

The codebase uses a **feature-based architecture** (feature folders own all app-specific UI;
the only thing in `components/` is the shared primitive layer), **shadcn/ui built on Base UI
primitives** for the reusable UI layer, **next-intl**
for internationalization (English + Persian with RTL), and a **workflows** layer that holds
UI state machines separate from presentation.

Games are **out of scope for this build** but the app registry is structured so a Games app
can be added later with a single registry entry plus one component.

## Goals

- A signature "wow" desktop experience: overlapping windows, focus/z-order, dock, menu bar.
- Zero windowing dependencies — full control over the macOS feel, clean bundle.
- Feature-based architecture: each feature owns its components, hooks, and types.
- Reusable primitives via shadcn/ui + Base UI, isolated in `components/ui/`.
- Full i18n plumbing (next-intl), English + Persian, with correct RTL handling.
- UI orchestration logic lives in a `workflows/` layer (state machines), not in components.
- Content is placeholder now but trivially swappable (structured data + message catalogs).
- Works on mobile via a simplified shell that reuses the same feature components.
- Repo tooling (`.claude/`, `.agent/`) set up to assist development (not user-facing).

## Non-Goals

- Mini-games (deferred; registry kept extensible for later).
- Real bio/project/contact content (placeholders now; owner swaps in later).
- Pixel-perfect Apple asset reproduction (use original gradients/icons, no copyrighted art).
- A boot/login animation (not in this build).
- Server-side persistence / database (contact form is a placeholder submit flow).

## Chosen Approach

**Hand-rolled windowing (Option A).** A `WindowManager` React Context is the React wiring
around a **pure window state machine** (in `workflows/`); a `Window` component renders macOS
chrome and uses a Pointer Events drag/resize hook. Rejected alternatives: `react-rnd` (extra
dependency, styling friction) and prebuilt "web OS" kits (someone else's design system, hard
to customize).

## Tech Stack

- **Next.js 16** (App Router, React 19) — per `AGENTS.md`, read `node_modules/next/dist/docs/`
  before writing framework-touching code.
- **Tailwind CSS v4** — styling + design tokens.
- **shadcn/ui on Base UI** — `npx shadcn@latest init --base base --rtl`. Base UI is the current
  shadcn default primitive library; `--rtl` wires RTL-aware primitives for Persian. The `ui`
  alias in `components.json` points at `@/components/ui`; `hooks` alias points at the top-level
  `hooks/` folder. Icons via `lucide`.
- **next-intl** — i18n for the App Router; `[locale]` route segment; middleware for locale
  routing; English (`en`) default + Persian (`fa`, RTL).
- **Biome** — existing lint/format toolchain.

## Architecture & File Structure

Feature-first. Every feature owns its app-specific UI. The `components/` folder holds ONLY the
shared, cross-feature primitive layer (`components/ui/`, managed by shadcn); shared
logic/types/hooks live in dedicated top-level folders.

```
app/
  [locale]/
    layout.tsx        # locale-aware root: sets <html lang dir>, NextIntlClientProvider, fonts
    page.tsx          # renders <Desktop/> (client island)
  globals.css         # Tailwind v4 + shadcn/Base UI tokens + macOS design tokens
middleware.ts         # next-intl locale routing

features/
  desktop/            # the OS shell feature
    components/       # Desktop, MenuBar, Dock, Window, WindowLayer, MobileHome
    hooks/            # useDrag (pointer events), useClock
    types/            # feature-local types (re-exported from index)
    index.ts          # public surface of the feature
  about/
    components/       # AboutApp
    index.ts
  projects/
    components/       # ProjectsApp, ProjectCard
    types/
    index.ts
  contact/
    components/       # ContactApp, ContactForm
    hooks/            # useContactForm (binds to the contact workflow)
    types/
    index.ts

components/
  ui/                 # shadcn/ui primitives on Base UI (button, dialog, input, tooltip, ...)

context/              # React context providers (the "wiring" layer)
  WindowManagerContext.tsx   # provides window state machine to the tree

workflows/            # UI state machines — framework-agnostic logic, no JSX
  windowManager.ts    # pure reducer/state machine: open, focus, z-order, minimize, close
  contactForm.ts      # submit flow: idle -> submitting -> success | error

hooks/                # shared/global composables (custom hooks)
  useMediaQuery.ts
  useIsMobile.ts

types/                # shared/global TypeScript types
  index.ts

i18n/                 # next-intl configuration
  routing.ts          # locales, defaultLocale, localePrefix
  request.ts          # getRequestConfig (loads messages per request)
  navigation.ts       # locale-aware Link/useRouter wrappers

messages/             # translation catalogs (user-facing copy)
  en.json
  fa.json

lib/
  apps.config.tsx     # app registry: id, titleKey, icon, component, default geometry
  content.ts          # non-translatable structured data (project URLs, tags, social links)
  utils.ts            # cn() and shadcn helpers
```

Path aliases (`@/*`) are configured in `tsconfig.json` so `ui`, `hooks`, `features`,
`workflows`, etc. import cleanly.

## Layer Responsibilities (isolation & clarity)

- **`workflows/`** — pure logic. Given current state + an action, returns next state. No React,
  no DOM. Unit-testable in isolation. Example: `windowManager` decides z-order and focus.
- **`context/`** — React wiring. Wraps a workflow in a provider + hooks (`useWindowManager`).
  Turns pure logic into something components consume.
- **`features/*`** — presentation. Each feature reads from context/hooks and renders UI. A
  feature can be understood without reading other features.
- **`components/ui/`** — dumb, reusable primitives (shadcn/Base UI). No app knowledge.
- **`lib/` + `messages/`** — data. Structured config in `lib/`; translatable copy in `messages/`.

This keeps each unit answerable: what it does, how you use it, what it depends on.

## Component & Logic Design

### Window state machine (`workflows/windowManager.ts`)

State per window: `id`, `appId`, `x`, `y`, `width`, `height`, `zIndex`, `isMinimized`,
`isFocused`. Actions: `open(appId)`, `close(id)`, `minimize(id)`, `focus(id)`,
`moveTo(id, x, y)`, `resize(id, w, h)`. Pure reducer — no DOM. Rules:

- `focus(id)` raises the window to the top z-index and marks it focused (others unfocused).
- Opening an already-open app focuses the existing window (single-instance per app).
- `close` removes the window; `minimize` hides it but keeps it in state (dock shows it).

### `context/WindowManagerContext.tsx`

Wraps the reducer via `useReducer`, exposes a typed `useWindowManager()` hook. This is the only
place the window machine meets React.

### `features/desktop`

- **Window**: macOS title bar with red/yellow/green **traffic lights** (close/minimize/maximize);
  drag from title bar; resize from bottom-right; clicking anywhere calls `focus(id)`; body
  renders the app component resolved from `lib/apps.config`.
- **useDrag**: Pointer Events (mouse+touch+trackpad from one path); updates batched via
  `requestAnimationFrame`; viewport clamping so windows never get lost off-screen.
- **MenuBar**: frosted-glass bar; Apple logo, active app name, live clock (`useClock`),
  language switcher.
- **Dock**: centered rounded glass bar; icons launch apps; dot indicates open windows;
  hover magnify effect.
- **Desktop**: composes wallpaper + menu bar + dock + window layer; switches to `MobileHome`
  below the mobile breakpoint (`useIsMobile`).

### Apps (`features/about`, `features/projects`, `features/contact`)

Presentational components reading copy from next-intl messages and structured data from
`lib/content.ts`. Registered once in `lib/apps.config.tsx` (id, title key, icon, component,
default geometry). The Dock, menu bar, and window layer all read this registry — one source of
truth. **Adding a future Games app = one registry entry + one feature folder.**

The contact form is driven by `workflows/contactForm.ts` (idle → submitting → success | error);
for this build the submit is a placeholder (no backend), surfaced through `useContactForm`.

## Internationalization

- Locales: `en` (default), `fa` (Persian, RTL). `localePrefix` on the `[locale]` segment.
- `middleware.ts` handles locale detection/routing; `app/[locale]/layout.tsx` sets
  `<html lang dir>` (`dir="rtl"` for `fa`) and wraps children in `NextIntlClientProvider`.
- All user-facing strings come from `messages/{locale}.json`. A language switcher lives in the
  menu bar.
- RTL is handled by Tailwind logical properties + shadcn's `--rtl` init, so the whole desktop
  (menu bar, dock, windows) mirrors correctly.

## Mobile Behavior

Below a breakpoint, `Desktop` renders `MobileHome`:
- Dock/home becomes a simple app grid.
- Tapping an app opens it **full-screen** (no drag/resize).
- Back button/gesture returns to the home grid.
- Same feature components as desktop — content authored once.

## Data / Content Model

- **Translatable copy** (bio, project descriptions, UI labels, form labels): `messages/en.json`
  and `messages/fa.json`.
- **Structured, non-translatable data** (project URLs, tech tags, social links, icons, default
  window geometry): `lib/content.ts` and `lib/apps.config.tsx`, fully typed via `types/`.

Swapping real content = edit the message catalogs + `lib/content.ts`. No component changes.

## Repo Tooling (`.claude/` + `.agent/`)

Development-only configuration to assist building this project (never shipped/served):
- `.claude/`: a project-scoped agent plus a small number of skills/commands relevant to the
  desktop UI work.
- `.agent/`: agent config folder.

These are ignored by the app build and have no runtime effect on the site.

## Testing & Verification

- **Unit**: `workflows/windowManager.ts` (open/focus/z-order/minimize/close) and
  `workflows/contactForm.ts` — pure, DOM-independent.
- **Manual**: dev server verification for drag/resize feel, dock behavior, the mobile stacked
  layout, and `en`/`fa` (LTR/RTL) rendering.
- Per `AGENTS.md`, read the Next.js 16 docs in `node_modules/next/dist/docs/` before writing
  any framework-touching code (routing, middleware, layouts).

## Extensibility Notes

- Adding a Games app later: one entry in `lib/apps.config.tsx` + one folder in `features/`.
  No changes to the window system, dock, or menu bar.
- Adding a locale: one `messages/<locale>.json` + one entry in `i18n/routing.ts`.
- Theming (light/dark, alternate wallpaper) is driven by design tokens in `globals.css`.
