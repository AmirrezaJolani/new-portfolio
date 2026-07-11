# .agent — agent onboarding

Tool-agnostic working notes for any AI agent operating in this repo. (Claude Code's
functional config lives in [`../.claude/`](../.claude); this folder is the vendor-neutral
mirror + onboarding.) Repo-wide rules are in [`../AGENTS.md`](../AGENTS.md) — **read it first**;
this is a modified Next.js and you must consult `node_modules/next/dist/docs/01-app/` before
writing routing/layout/rendering code.

## What this project is

A personal portfolio rendered as an interactive **macOS desktop**: a menu bar, a dock, and
draggable/resizable/minimizable windows. Portfolio content is presented as "apps" — **About**,
**Projects**, **Contact**. Mobile devices get a simplified stacked/full-screen view. A Games
app is intentionally deferred but the app registry is built to accept one later.

## Stack

- Next.js 16 (App Router, React 19), TypeScript, Tailwind CSS v4
- shadcn/ui on **Base UI** primitives (`components/ui/`), lucide icons
- next-intl **without locale routing** — locale in a `NEXT_LOCALE` cookie (no `/en` `/fa` URLs),
  English + Persian (RTL)
- Vitest for pure logic, Biome for lint/format

## Architecture (one direction of flow)

```
workflows/   pure state machines (no React/DOM, unit-tested)   e.g. windowManager, contactForm
context/     React wiring around a workflow (provider + hook)   e.g. WindowManagerContext
features/*   presentation; each owns components/ hooks/ types/  desktop, about, projects, contact
components/ui shadcn/Base UI primitives only
lib/         apps.config.tsx (app registry) + content.ts (structured, non-translatable data)
hooks/ types/ shared composables and shared types
i18n/ messages/  cookie-based next-intl config + en/fa catalogs
```

## Commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Unit tests | `npm test` (Vitest, pure logic in `workflows/`) |
| Type-check | `npx tsc --noEmit` |
| Lint | `npm run lint` (Biome) |
| Format | `npm run format` |
| Prod build | `npm run build` |
| Add a UI primitive | `npx shadcn@latest add <name>` |

## Guardrails

1. App-specific UI goes under `features/<feature>/components/`, never a flat `components/`.
   Only shadcn primitives live in `components/ui/`.
2. The dock, menu bar, window layer, and mobile home all read `lib/apps.config.tsx`. Add an
   app there + one feature folder + one line in `features/desktop/components/appRegistry.tsx`.
3. All display copy comes from next-intl (`messages/en.json` + `messages/fa.json`, kept in
   parity). Never hardcode strings.
4. Use Tailwind **logical** properties (`ps-/pe-/start-/end-`) so Persian mirrors correctly.
5. Keep business rules in `workflows/` (pure, testable); keep `context/` thin.
6. `shadcn` is a **devDependency on purpose** — `app/globals.css` imports `shadcn/tailwind.css`,
   so removing the package breaks the build. Do not "clean it up."

See [`agents.md`](./agents.md) for the specialist roster and [`mcp.md`](./mcp.md) for tooling.
