# Agent roster

Specialist agents for this codebase. The **canonical, dispatchable definitions** (with
frontmatter and system prompts) live in [`../.claude/agents/`](../.claude/agents); this is the
vendor-neutral summary of who does what and when to reach for each.

| Agent | Use it when | Scope |
|-------|-------------|-------|
| **i18n-translator** | Adding/editing copy, parity across en/fa/de/it, RTL correctness, the cookie-based locale switcher | `i18n/`, `messages/`, `features/drive/components/LanguagePicker.tsx` |

Game work (world, physics, rendering, HUD) has no dedicated agent: follow the
`extending-pixel-drive` playbook in [`../.claude/skills/`](../.claude/skills).

## Conventions every agent follows

- Read [`../AGENTS.md`](../AGENTS.md) and the relevant `node_modules/next/dist/docs/01-app/`
  guide before framework code.
- Definition of done: `npx tsc --noEmit` clean, `npm test` green (if logic changed),
  `npm run lint` clean for touched files, and message parity across all catalogs for any new copy.
- Match the surrounding code's naming, idioms, and comment density.
