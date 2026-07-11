# .claude — project agent configuration

Claude Code configuration for the macOS-style portfolio.

## Contents

- [`agents/`](./agents) — dispatchable subagents scoped to this codebase:
  - **portfolio-ui** — feature-based desktop UI work (shell, dock, windows, shadcn/Base UI, copy).
  - **window-system** — pure state machines in `workflows/` + their context wiring (test-first).
  - **i18n-translator** — next-intl copy, English/Persian parity, RTL, cookie-based locale.
- [`mcp.md`](./mcp.md) — MCP servers this project uses and why (config in [`../.mcp.json`](../.mcp.json)).
- `settings.local.json` — local, machine-specific settings (not shared).

## How subagents work

Each file in `agents/` is a real subagent, not just docs. The YAML frontmatter drives it:

```yaml
---
name: portfolio-ui          # id used to dispatch
description: Use when ...    # tells Claude WHEN to delegate here
tools: Read, Edit, Grep      # optional — omit to inherit all tools (least-privilege otherwise)
model: sonnet                # optional — pick the cheapest model that fits
---
The markdown body is the agent's system prompt.
```

## Source of truth

- Design specs + implementation plans: [`../docs/superpowers/specs/`](../docs/superpowers/specs) and [`../docs/superpowers/plans/`](../docs/superpowers/plans) (portfolio, Docker CI/CD, and further features each have their own).
- Repo-wide agent rules + project context: [`../AGENTS.md`](../AGENTS.md) (read it — this is a modified Next.js).
- User-facing docs: [`../README.md`](../README.md).

Architecture in one line: **workflows/ (pure logic) → context/ (React wiring) → features/\* (UI) → components/ui/ (shadcn/Base UI primitives)**, with a macOS Tahoe **Liquid Glass** surface system (`.lg-*` utilities in `app/globals.css`), cookie-based EN/FA i18n, and a Docker + GitHub Actions pipeline.
