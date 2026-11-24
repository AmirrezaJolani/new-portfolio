# .agent — agent onboarding

Tool-agnostic working notes for any AI agent operating in this repo. (Claude Code's
functional config lives in [`../.claude/`](../.claude); this folder is the vendor-neutral
mirror + onboarding.) Repo-wide rules are in [`../AGENTS.md`](../AGENTS.md) — **read it first**;
this is a modified Next.js and you must consult `node_modules/next/dist/docs/01-app/` before
writing routing/layout/rendering code.

## What this project is

A personal portfolio built as **Pixel Drive**, a pixel-art driving game on one page (`/`). You
drive around an island; parking on a building's glowing pad and pressing Enter (or tapping the
prompt on a phone) opens that chapter: about, experience, projects, skills, testimonials,
contact. It has drift physics, achievements, a garage of five cars, day/sunset/night themes
and a Milan district.

Step-by-step playbooks for common tasks live in [`../.claude/skills/`](../.claude/skills)
(plain Markdown; usable by any agent). They cover editing content, translating, extending the
game, styling, and verifying a change. The design system is [`../DESIGN.md`](../DESIGN.md).

## Stack

- Next.js 16 (App Router, React 19), TypeScript, Tailwind CSS v4
- HTML canvas for the world, React for the HUD and panels
- next-intl **without locale routing** — locale in a `NEXT_LOCALE` cookie (no `/en` `/fa` URLs),
  English, Persian (RTL), German, Italian
- Docker (multi-stage, standalone, non-root) + GitHub Actions CI publishing to GHCR on `main`
- Vitest for pure logic, Biome for lint/format

## Architecture (one direction of flow)

```
workflows/driveWorld.ts      pure world model: map, buildings, cars, physics (unit-tested)
features/drive/lib/          render.ts (canvas), audio.ts, achievements.ts, content.ts (data)
features/drive/components/   Game (loop, input, HUD), Panel, TouchControls, LanguagePicker
i18n/ messages/              cookie-based next-intl config + en/fa/de/it catalogs
```

## Commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Unit tests | `npm test` (Vitest) |
| Type-check | `npx tsc --noEmit` |
| Lint | `npm run lint` (Biome) |
| Format | `npm run format` |
| Prod build | `npm run build` |
| Run the container | `docker compose up --build` (→ http://localhost:3000) |

## Guardrails

1. Logic that doesn't need the DOM goes in `workflows/driveWorld.ts`, with a test.
2. All display copy comes from next-intl (`messages/{en,fa,de,it}.json`, kept in
   parity; `npm test` checks it). Never hardcode strings.
3. Use Tailwind **logical** properties (`ps-/pe-/start-/end-`) so Persian mirrors correctly;
   the canvas layer stays `dir="ltr"`.
4. Styles use the `--px-*` tokens and pixel classes under `.drive-root` ([`../DESIGN.md`](../DESIGN.md)).

See [`agents.md`](./agents.md) for the specialist roster and [`mcp.md`](./mcp.md) for tooling.
