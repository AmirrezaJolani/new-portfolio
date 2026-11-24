# MCP servers for this project

Model Context Protocol (MCP) servers give agents extra, project-relevant capabilities. The
machine-readable config lives in [`.mcp.json`](../.mcp.json) at the repo root (checked in and
shared with everyone who clones). This file explains **why each server is here and how to use
it** for the Pixel Drive portfolio.

> Config vs. rationale: `.mcp.json` is what the tooling loads; this markdown is the human/agent
> reasoning. Keep them in sync — if you add a server to `.mcp.json`, document it here.

## Enabled servers

### context7 — up-to-date library documentation
- **Package:** `@upstash/context7-mcp`
- **Why:** This repo pins fast-moving libraries — Next.js 16 (App Router), next-intl v4,
  Tailwind v4. `AGENTS.md` explicitly warns that this Next.js differs
  from training data. context7 fetches current docs so agents don't code from stale memory.
- **Use it before:** writing next-intl config, App Router layouts/rendering, or any
  Tailwind v4 API. Resolve the library id, then query a single focused
  concept (e.g. "next-intl cookie-based locale without routing").

### playwright — drive a real browser to verify the game
- **Package:** `@playwright/mcp`
- **Why:** The portfolio's value is interaction — driving, the pad prompt, panels, the touch
  joystick and LTR↔RTL mirroring. Unit tests cover the world model, not what's on screen.
- **Use it for:** opening `npm run dev`, closing the intro, fast-travelling with the map (M),
  checking the pad prompt and Enter, switching the locale cookie and asserting
  `<html dir="rtl">`, and a 390×844 touch viewport for the mobile controls.

## Optional (not enabled by default)

### figma — design ↔ code
- **Package:** `figma-developer-mcp` (needs a Figma access token)
- **Why:** If the game's HUD or panels get designed in Figma, this bridges design and code
  both ways. Enable it only when there's an actual Figma source;
  otherwise it's noise. Add it to `.mcp.json` with your token when needed.

## Adding a server

1. Add the entry to `.mcp.json` under `mcpServers`.
2. Document it here: package, why it belongs in THIS project, and when to reach for it.
3. Prefer `npx -y <package>` so no global install is required.
4. Keep secrets (tokens) out of `.mcp.json` — reference an env var and document it here.

## Related agent docs

Project subagents that pair with these servers live in [`agents/`](./agents):
`i18n-translator`.
