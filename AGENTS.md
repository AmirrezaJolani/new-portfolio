# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
# Pixel Drive portfolio — project context

The site is one page (`/`): **Pixel Drive**, a pixel-art driving game where each building is a
chapter of the portfolio. Internationalized (English, Persian/RTL, German, Italian);
containerized with Docker + CI.

**Architecture** — one-directional flow:
`workflows/driveWorld.ts` (pure world model + physics, Vitest-tested) → `features/drive/lib/`
(canvas renderer, audio, achievements, `content.ts` data) → `features/drive/components/`
(React: game loop, HUD, panels). Supporting: `i18n/` (cookie-based next-intl) + `messages/`
(`en`/`fa`/`de`/`it`, kept at key parity; `i18n/messages.test.ts` enforces it).

**Non-negotiables**
- Game logic that doesn't need the DOM stays pure in `workflows/driveWorld.ts`, with tests.
- All user-facing copy via next-intl (`drive.*`, language names under `languages.*`); every
  `messages/*.json` must stay at key parity.
- The canvas layer is deliberately `dir="ltr"` (world coordinates are physical); the HUD uses
  Tailwind **logical** properties (`ps/pe/start/end`), never physical `left/right`.
- Styles: `--px-*` tokens and pixel classes, scoped under `.drive-root`. No raw hex in
  components; see [`DESIGN.md`](DESIGN.md).
- Locale is the `NEXT_LOCALE` cookie; never add `/[locale]` routes. Languages are listed once, in `i18n/config.ts`.
- Don't break `output: "standalone"` — the Docker image depends on it.

**Done means** CI passes locally — `npm run lint && npx tsc --noEmit && npm test && npm run build` —
and the changed screen was checked in a browser in `en` and `fa` (RTL).

**Skills** (`.claude/skills/`; load the matching one before starting):

| Task | Skill |
|------|-------|
| Change a job, project, skill, testimonial, stat, contact link or the CV | `editing-portfolio-content` |
| Add or rename a string, add a language, fix RTL | `translating-copy` |
| Achievements, landmarks, signs, cars, physics, map or HUD in the game | `extending-pixel-drive` |
| Colours, fonts, any new styling ([`DESIGN.md`](DESIGN.md) is the design system) | `styling-ui` |
| Before saying "done", committing, or when CI fails | `verifying-a-change` |

Copy work can be delegated to the [`i18n-translator`](.claude/agents/i18n-translator.md)
subagent; [`.agent/`](.agent) is the vendor-neutral mirror of this setup.
