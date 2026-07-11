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

- Design spec: [`../docs/superpowers/specs/2026-07-05-macos-portfolio-design.md`](../docs/superpowers/specs/2026-07-05-macos-portfolio-design.md)
- Implementation plan: [`../docs/superpowers/plans/2026-07-05-macos-portfolio.md`](../docs/superpowers/plans/2026-07-05-macos-portfolio.md)
- Repo-wide agent rules: [`../AGENTS.md`](../AGENTS.md) (read it — this is a modified Next.js).

Architecture in one line: **workflows/ (pure logic) → context/ (React wiring) → features/\* (UI) → components/ui/ (shadcn/Base UI primitives)**.
