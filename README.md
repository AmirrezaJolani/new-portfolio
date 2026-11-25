# Pixel Drive — a portfolio you drive through

**Live:** [amirrezajolani.app](https://www.amirrezajolani.app)

A personal portfolio built as a pixel-art driving game. Visitors drive a car around a small
island; each building is a chapter of the portfolio (about, experience, projects, skills,
testimonials, contact). Park on a building's glowing pad and press **Enter** (or tap the button
on a phone) to open it.

## Features

- **Canvas game** — sprite-stacked buildings, five cars, drift and momentum physics with skid
  marks, day / sunset / night themes, a chiptune soundtrack and 14 achievements.
- **A Milan district** — the Duomo, the Galleria, Bosco Verticale, Torre Velasca and the
  UniCredit Tower, drawn by hand.
- **Pixel icons** — 28 hand-drawn 16×16 SVGs in [`public/icons/`](public/icons) replace every
  emoji; icons that carry state (visited, locked) are announced to screen readers.
- **Works on phones** — a touch joystick, a brake pedal and an on-screen button to open stops.
- **Four languages** — English, Persian (right-to-left), German and Italian via
  [next-intl](https://next-intl.dev). The locale lives in a cookie (**no locale in the URL**)
  and the game has a language picker in its top bar.
- **Containerized + CI/CD** — a multi-stage Docker image (Next.js standalone, non-root) and a
  GitHub Actions pipeline that lints, type-checks, tests, builds and smoke-tests the image on
  every PR, and publishes to GHCR on `main`.

## Tech stack

| Area | Choice |
|------|--------|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript |
| Rendering | HTML canvas (world) + React (HUD, panels) |
| Styling | Tailwind CSS v4 + a small pixel design system ([`DESIGN.md`](DESIGN.md)) |
| i18n | next-intl (cookie-based, EN / FA (RTL) / DE / IT) |
| Tests | Vitest (pure logic) |
| Lint/format | Biome |
| Container | Docker (multi-stage, standalone), GitHub Actions → GHCR |
| Hosting | Vercel (production from `main`, a preview per pull request) |
| Versioning | SemVer in `appversion.json` + `package.json`, [`CHANGELOG.md`](CHANGELOG.md), `v*` tags |

## How to run

Prerequisites: **Node.js 20+** (CI and the Docker image use Node 22) and npm.

```bash
git clone https://github.com/AmirrezaJolani/new-portfolio.git
cd new-portfolio
npm install
npm run dev        # → http://localhost:3000, hot-reloads as you edit
```

Production build, or Docker:

```bash
npm run build && npm start      # standalone server on :3000
docker compose up --build       # same, in the production image
docker run --rm -p 3000:3000 ghcr.io/amirrezajolani/new-portfolio:latest   # image from CI
```

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (standalone output) |
| `npm start` | Serve the production build |
| `npm test` | Run unit tests (Vitest) |
| `npm run lint` | Lint with Biome |
| `npm run format` | Format with Biome |

## Architecture

```
app/                      layout (locale + dir), page (metadata), globals.css
features/drive/
  components/             Game (loop, input, HUD), Panel (sections), TouchControls,
                          LanguagePicker, PixelMe, Icon, DrivePage (fonts)
  lib/                    render.ts (canvas drawing), audio.ts, achievements.ts,
                          icons.ts (icon names, + test), content.ts (CV data that doesn't translate)
public/icons/             pixel-art SVG icons (16×16 grid)
workflows/driveWorld.ts   pure world model: map, buildings, landmarks, cars, physics (+ tests)
i18n/                     cookie-based next-intl config (+ catalog parity test)
messages/                 en / fa / de / it catalogs
```

Data flows one way: `workflows/driveWorld.ts` (pure, no DOM, unit-tested) → `features/drive/lib`
(drawing, sound) → `features/drive/components` (React). Portfolio prose lives in
`messages/*.json` under `drive.*`, keyed by the ids in `features/drive/lib/content.ts`.

### Physics

The car stores its forward speed and a separate sideways speed. Each frame the two are turned
into one world velocity, the nose turns, and the velocity is split again relative to the new
heading. Momentum doesn't turn with the nose, so the car slides; tyre grip (lower on grass and
sand, and when braking mid-turn) shrinks the slide back to zero.

## Internationalization

The active locale lives in a `NEXT_LOCALE` cookie (there is **no `/en` or `/fa` URL segment**).
Switch languages from the game's top bar; the choice persists and the layout flips `dir` to
`rtl` for Persian. To add a locale, add `messages/<locale>.json`, its id to `locales` and a
`localeOptions` entry in `i18n/config.ts` (plus `rtlLocales` if it is right-to-left), and its
name under `languages.*` in every catalog. The parity test fails until all of that matches.

## Icons

Every icon is a 16×16 grid of whole-pixel `<rect>`s with `shape-rendering="crispEdges"`, drawn
at 16, 32 or 48 px so pixels stay square. To add one, save `public/icons/<name>.svg`, add
`<name>` to `ICONS` in `features/drive/lib/icons.ts`, and render `<Icon name="<name>" />`. Pass
`label` when the icon itself means something (it becomes the `alt` text). No emoji: the icon
test fails on them.

## Deployment

- **Vercel** builds every pull request as a preview and deploys `main` to production. No
  environment variables are needed.
- **Docker** — see below; the same app runs anywhere as a standalone Node server.
- **Releases** — the version lives in `appversion.json` (kept in sync with `package.json`).
  Each release adds a section to [`CHANGELOG.md`](CHANGELOG.md), a `vX.Y.Z` tag and a GitHub
  Release.

## Docker

The image is a multi-stage build on Next.js **standalone** output and runs as a non-root user.
CI publishes it to the GitHub Container Registry on pushes to `main`
(`ghcr.io/<owner>/<repo>:latest` + a short-SHA tag).

## Testing

`npm test` runs Vitest over:

- the world model: spawn, collisions, pads, joystick, drift and grip;
- the translation catalogs: every locale has exactly the English keys;
- the icons: the folder matches `ICONS`, each SVG is a crisp 16×16 pixel grid, achievements
  use registered icons, and no emoji are left in copy or game components.
