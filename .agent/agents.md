# Agent roster

Specialist agents for this codebase. The **canonical, dispatchable definitions** (with
frontmatter and system prompts) live in [`../.claude/agents/`](../.claude/agents); this is the
vendor-neutral summary of who does what and when to reach for each.

| Agent | Use it when | Scope |
|-------|-------------|-------|
| **portfolio-ui** | Building/changing the desktop UI — shell, menu bar, dock, window chrome, an app window, styling, wiring copy | `features/*`, `components/ui/`, `lib/apps.config.tsx`, `app/` |
| **window-system** | Changing window behavior (focus, z-order, minimize/restore, move/resize) or the contact-form flow — **works test-first** | `workflows/`, `context/` |
| **i18n-translator** | Adding/editing copy, parity across en/fa/de/it, RTL correctness, the cookie-based locale switcher | `i18n/`, `messages/`, the menu-bar switcher |

## Picking an agent

- Changing what a window *does* → **window-system** (pure logic, TDD).
- Changing what the user *sees* → **portfolio-ui** (presentation).
- Changing the *words* the user reads → **i18n-translator** (messages + parity).

Cross-cutting work (e.g. "add a Notes app") typically touches **portfolio-ui** for the feature
+ registry, and **i18n-translator** for its copy; only involves **window-system** if it needs
new window behavior.

## Conventions every agent follows

- Read [`../AGENTS.md`](../AGENTS.md) and the relevant `node_modules/next/dist/docs/01-app/`
  guide before framework code.
- Definition of done: `npx tsc --noEmit` clean, `npm test` green (if logic changed),
  `npm run lint` clean for touched files, and message parity across all catalogs for any new copy.
- Match the surrounding code's naming, idioms, and comment density.
