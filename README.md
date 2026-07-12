# Portfolio OS — an interactive macOS-style portfolio

A personal portfolio built as a faithful, interactive **macOS desktop** in the browser.
Visitors land on a desktop with a menu bar, a dock, and draggable / resizable / minimizable
windows, and explore the content as "apps". Styled with a macOS **Tahoe "Liquid Glass"**
aesthetic — a generated scenic wallpaper, frosted translucent surfaces, and desktop widgets —
and fully internationalized (English + Persian, right-to-left).

## Features

- **A real windowing desktop** — open apps from the dock; windows drag from the title bar,
  resize from the corner, minimize/close via the traffic lights, and raise to front on click
  (single instance per app, proper z-order and focus).
- **Apps** — About, Projects, and Contact, each a self-contained feature. Adding a new app is
  a single registry entry plus one component.
- **Liquid Glass UI** — a generated SVG wallpaper (sky, mountains, lake — no copyrighted
  assets), frosted glass menu bar / dock / windows, a live calendar + weather widget, and
  desktop folder shortcuts. Icons throughout are [lucide](https://lucide.dev).
- **Internationalized** — English and Persian via [next-intl](https://next-intl.dev), with the
  locale stored in a cookie (**no locale in the URL**) and correct RTL mirroring.
- **Responsive** — on phones the desktop becomes a stacked home screen with full-screen apps.
- **Containerized + CI/CD** — a multi-stage Docker image (Next.js standalone, non-root) and a
  GitHub Actions pipeline that lints, type-checks, tests, builds & smoke-tests the image on
  every PR, and publishes to GHCR on `main`.

## Tech stack

| Area | Choice |
|------|--------|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui on Base UI |
| i18n | next-intl (cookie-based, EN + FA/RTL) |
| Icons | lucide-react |
| Tests | Vitest (pure logic) |
| Lint/format | Biome |
| Container | Docker (multi-stage, standalone), GitHub Actions → GHCR |

## How to run

### Prerequisites

- **Node.js 20+** (CI and the Docker image pin Node 22)
- **npm** (ships with Node)

### 1. Development

```bash
git clone https://github.com/AmirrezaJolani/new-portfolio.git
cd new-portfolio
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the page hot-reloads as you edit.

### 2. Production build

```bash
npm run build   # compile the standalone server
npm start       # serve it at http://localhost:3000
```

### 3. Docker

```bash
docker compose up --build   # build + run → http://localhost:3000
```

…or run the image published by CI (see [Docker](#docker) for details):

```bash
docker run --rm -p 3000:3000 ghcr.io/amirrezajolani/new-portfolio:latest
```

### Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (standalone output) |
| `npm start` | Serve the production build |
| `npm test` | Run unit tests (Vitest) |
| `npm run lint` | Lint with Biome |
| `npm run format` | Format with Biome |

## Architecture

The codebase is **feature-first** with a one-directional dependency flow:

```
workflows/   pure state machines (no React/DOM, unit-tested)   e.g. windowManager
   ↓
context/     React wiring around a workflow (provider + hook)   e.g. WindowManagerContext
   ↓
features/*   presentation; each owns components/ hooks/ types/  desktop, about, projects, contact
   ↓
components/ui  shared shadcn/Base UI primitives only
```

Supporting folders: `lib/` (the app registry `apps.config.tsx` + structured `content.ts`),
`hooks/` (shared composables), `types/`, `i18n/` (cookie-based next-intl config), and
`messages/` (`en.json` / `fa.json` translation catalogs, kept at full key parity).

```
app/                     # App Router entry (layout, page, globals.css)
components/ui/            # shadcn/Base UI primitives
context/                 # React context providers
features/
  desktop/               # the OS shell: menu bar, dock, windows, wallpaper, widgets, mobile
  about/ projects/ contact/
workflows/               # pure reducers + tests (window manager, contact form)
hooks/  lib/  types/  i18n/  messages/
Dockerfile  docker-compose.yml  .github/workflows/docker.yml
```

### Conventions

- All user-facing copy comes from next-intl; `en.json` and `fa.json` stay at key parity.
- RTL uses Tailwind **logical** properties (`ps/pe/start/end`), so Persian mirrors correctly.
- Window / contact logic lives in `workflows/` as pure, unit-tested reducers.

### Window management

Every window is driven by a single **pure reducer** (`workflows/windowManager.ts`) wrapped by
`WindowManagerContext`. Data flows one way: a UI action (open / focus / move / resize /
minimize / close) dispatches to the reducer, which returns the next state, and the desktop
re-renders. Apps are **single-instance** — re-opening "About" focuses the existing window
rather than spawning a duplicate — and depth is managed via `zIndex`. Focus lives in a single
`focusedId` (not a per-window flag), and the reducer is unit-tested.

Each window is tracked as:

| Field | Type | Description |
|-------|------|-------------|
| `appId` | `AppId` | Which app (`about` / `projects` / `contact`) |
| `x`, `y` | `number` | Position on the desktop |
| `width`, `height` | `number` | Dimensions |
| `zIndex` | `number` | Stack order relative to other windows |
| `isMinimized` | `boolean` | Hidden to the dock |

### Liquid Glass surface system

The macOS Tahoe vibrancy is encoded as reusable CSS utilities in `app/globals.css` — backdrop
blur + saturation, a hairline top highlight, and a soft float shadow — in three tiers:

| Class | Used for | Characteristics |
|-------|----------|-----------------|
| `.lg-glass` | app windows | 28px blur, 180% saturate, drop shadow, light border |
| `.lg-panel` | menu bar + dock | 34px blur, more translucent, 190% saturate |
| `.lg-chip` | widgets, tooltips, tiles | 20px blur, tuned for small surfaces |

The scenic wallpaper (`Wallpaper.tsx`), the calendar + weather widgets (`Widgets.tsx`), and the
desktop folder shortcuts (`DesktopIcons.tsx`) — all under `features/desktop/components/` — are
generated in code (no copyrighted assets).

## Docker

Run the production image locally:

```bash
docker compose up --build          # → http://localhost:3000
# or
docker build -t portfolio .
docker run --rm -p 3000:3000 portfolio
```

The image is a multi-stage build on Next.js **standalone** output and runs as a non-root user.
CI publishes it to the GitHub Container Registry on pushes to `main`
(`ghcr.io/<owner>/<repo>:latest` + a short-SHA tag).

## Internationalization

The active locale lives in a `NEXT_LOCALE` cookie (there is **no `/en` or `/fa` URL segment**).
Switch languages from the menu bar; the choice persists and the layout flips `dir` to `rtl` for
Persian. Add a locale by adding `messages/<locale>.json` and one entry in `i18n/config.ts`.

## Testing

Pure logic in `workflows/` (window z-order/focus/minimize, the contact-form flow) is covered by
Vitest. UI is verified via the build and browser. Run `npm test`.
