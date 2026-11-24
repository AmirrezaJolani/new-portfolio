# .claude — project agent configuration

Claude Code configuration for the Pixel Drive portfolio.

## Contents

- [`agents/`](./agents): dispatchable subagents scoped to this codebase:
  - **i18n-translator**: next-intl copy, parity across en/fa/de/it, RTL, cookie-based locale.
- [`skills/`](./skills): project skills, loaded on demand when a task matches the skill's `description`:
  - **editing-portfolio-content**: CV data (`content.ts`) plus `drive.*` prose in all locales.
  - **translating-copy**: new strings, new languages, parity, RTL rules.
  - **extending-pixel-drive**: achievements, landmarks, signs, cars, physics, world, game CSS.
  - **styling-ui**: the checklist for applying the design system in [`../DESIGN.md`](../DESIGN.md).
  - **verifying-a-change**: the local CI checks, plus a locale-cookie browser check.
- [`mcp.md`](./mcp.md): MCP servers this project uses and why (config in [`../.mcp.json`](../.mcp.json)).
- `settings.local.json`: local, machine-specific settings (not shared).

## How subagents work

Each file in `agents/` is a real subagent, not just docs. The YAML frontmatter drives it:

```yaml
---
name: i18n-translator       # id used to dispatch
description: Use when ...    # tells Claude WHEN to delegate here
tools: Read, Edit, Grep      # optional — omit to inherit all tools (least-privilege otherwise)
model: sonnet                # optional — pick the cheapest model that fits
---
The markdown body is the agent's system prompt.
```

## Source of truth

- Repo-wide agent rules + project context: [`../AGENTS.md`](../AGENTS.md) (read it — this is a modified Next.js).
- Design system: [`../DESIGN.md`](../DESIGN.md).
- Docker CI/CD design + plan: [`../docs/superpowers/`](../docs/superpowers).
- User-facing docs: [`../README.md`](../README.md).

Architecture in one line: **`workflows/driveWorld.ts` (pure world + physics) → `features/drive/lib/` (renderer, audio, data) → `features/drive/components/` (React HUD and panels)**, with cookie-based EN/FA/DE/IT i18n and a Docker + GitHub Actions pipeline.
