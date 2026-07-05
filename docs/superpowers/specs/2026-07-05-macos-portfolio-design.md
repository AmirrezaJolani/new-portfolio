# macOS-Style Portfolio — Design

**Date:** 2026-07-05
**Status:** Approved (design), pending implementation plan

## Summary

A personal portfolio built as a faithful, interactive **macOS desktop clone**. Visitors
land on a desktop with a menu bar, a dock, and draggable/resizable/minimizable windows.
Portfolio content is presented as "apps": **About Me**, **Projects**, and **Contact**. The
window system is hand-rolled (no windowing dependency). Mobile devices get a simplified
stacked/full-screen view of the same apps.

Games are **out of scope for this build** but the app registry is structured so a Games app
can be added later with a single registry entry plus one component.

## Goals

- A signature "wow" desktop experience: overlapping windows, focus/z-order, dock, menu bar.
- Zero windowing dependencies — full control over the macOS feel, clean bundle.
- Content is placeholder now but trivially swappable via a single content module.
- Works on mobile via a simplified shell that reuses the same app components.
- Repo tooling (`.claude/`, `.agent/`) set up to assist development (not user-facing).

## Non-Goals

- Mini-games (deferred; registry kept extensible for later).
- Real bio/project/contact content (placeholders now; owner swaps in later).
- Pixel-perfect Apple asset reproduction (use original gradients/icons, no copyrighted art).
- A boot/login animation (not in this build).

## Chosen Approach

**Hand-rolled windowing (Option A).** A `WindowManager` React Context is the single source of
truth for window state; a `Window` component renders macOS chrome and uses a Pointer
Events drag/resize hook. Rejected alternatives: `react-rnd` (extra dependency, styling
friction) and prebuilt "web OS" kits (someone else's design system, hard to customize).

## Architecture & File Structure

```
app/
  layout.tsx          # root (metadata, fonts) — server component
  page.tsx            # renders <Desktop/> (client island)
  globals.css         # Tailwind v4 + macOS design tokens

components/os/
  Desktop.tsx         # top-level: wallpaper, menu bar, dock, window layer; mobile switch
  MenuBar.tsx         # top bar: Apple logo, active app name, live clock
  Dock.tsx            # bottom dock: app icons, open/minimized indicators, hover magnify
  Window.tsx          # draggable/resizable/minimizable chrome (traffic lights)
  WindowManager.tsx   # React Context: open windows, z-order, focus, minimize, close
  useDrag.ts          # pointer-events hook (drag + resize; mouse + touch)

components/apps/
  AboutApp.tsx        # bio / skills (Finder-style)
  ProjectsApp.tsx     # project gallery
  ContactApp.tsx      # Mail-style contact form + links

lib/
  apps.config.ts      # registry: id, title, icon, component, default size/position
  content.ts          # ALL placeholder content (bio, projects, links) — single swap point
```

## Component Design

### WindowManager (Context)

State per window:

- `id` (unique instance id)
- `appId` (which app registry entry)
- `x`, `y`, `width`, `height`
- `zIndex`
- `isMinimized`
- `isFocused`

Actions: `open(appId)`, `close(id)`, `minimize(id)`, `focus(id)`, `moveTo(id, x, y)`,
`resize(id, w, h)`. The state transitions (open/focus/z-order/minimize/close) are implemented
as a **pure reducer** so they can be unit-tested independently of the DOM.

Rules:
- `focus(id)` raises the window to the top z-index and marks it focused (others unfocused).
- Opening an app that is already open focuses the existing window (single-instance per app).
- `close` removes the window; `minimize` hides it but keeps it in state (dock shows it).

### Window

- macOS title bar with red/yellow/green **traffic lights** = close / minimize / maximize.
- Drag from the title bar; resize from the bottom-right corner.
- Clicking anywhere in the window calls `focus(id)`.
- Body renders the app component resolved from the registry.

### useDrag

- Pointer Events (covers mouse, touch, trackpad from one path).
- Position updates batched via `requestAnimationFrame` for smooth ~60fps drag.
- Viewport clamping so a window can never be dragged fully off-screen.

### Apps

Each app is a presentational component reading from `lib/content.ts`. Apps are registered once
in `lib/apps.config.ts` (id, title, icon, component, default geometry). The Dock, menu bar,
and window layer all read from this registry — one source of truth.

### Desktop chrome

- **Menu bar**: frosted-glass bar; Apple logo, active app name, live clock (right-aligned).
- **Dock**: centered rounded glass bar; icons launch apps; a dot indicates open windows;
  hover-scale ("magnify") effect.
- **Wallpaper**: macOS-style gradient (original, no copyrighted image), swappable.

## Mobile Behavior

Below a breakpoint, `Desktop` renders a **stacked mode**:
- Dock becomes a simple app grid / home screen.
- Tapping an app opens it **full-screen** (no drag/resize).
- Back button/gesture returns to the home screen.
- Same app components as desktop — content authored once.

## Data / Content Model

`lib/content.ts` exports typed placeholder data:
- `about`: name, role, bio paragraphs, skills, (optional) avatar.
- `projects`: array of `{ title, description, tags, links }`.
- `contact`: email, social links, form target (placeholder).

Swapping real content = editing this one file. No component changes required.

## Repo Tooling (`.claude/` + `.agent/`)

Development-only configuration to assist building this project (never shipped/served):
- `.claude/`: a project-scoped agent plus a small number of skills/commands relevant to the
  desktop UI work.
- `.agent/`: agent config folder.

These are ignored by the app build and have no runtime effect on the site.

## Testing & Verification

- **Unit**: the WindowManager reducer (open / focus / z-order / minimize / close) — pure,
  DOM-independent.
- **Manual**: dev server verification for drag/resize feel, dock behavior, and the mobile
  stacked layout.
- Per `AGENTS.md`, read the Next.js 16 docs in `node_modules/next/dist/docs/` before writing
  any framework-touching code.

## Extensibility Notes

- Adding a Games app later: one entry in `apps.config.ts` + one component in
  `components/apps/`. No changes to the window system, dock, or menu bar.
- Theming (e.g., light/dark, alternate wallpaper) is driven by design tokens in `globals.css`.
