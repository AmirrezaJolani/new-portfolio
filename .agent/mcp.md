# MCP tooling

Vendor-neutral summary. The machine-readable config is [`../.mcp.json`](../.mcp.json); the full
rationale is in [`../.claude/mcp.md`](../.claude/mcp.md).

| Server | Package | Use it for |
|--------|---------|-----------|
| **context7** | `@upstash/context7-mcp` | Current docs for the fast-moving stack — Next.js 16 App Router, next-intl v4, shadcn/Base UI, Tailwind v4. Query BEFORE coding framework APIs; `AGENTS.md` warns this Next.js differs from training data. |
| **playwright** | `@playwright/mcp` | Drive a real browser against `npm run dev` to verify interaction: open/drag/resize/minimize windows, dock focus + z-order, locale switch → `<html dir="rtl">`, and the sub-768px `MobileHome` view. |

Optional (enable with a token when there's a real design source): **figma**
(`figma-developer-mcp`) for design↔code.

## Adding a server

1. Add it to [`../.mcp.json`](../.mcp.json) under `mcpServers` (prefer `npx -y <package>`).
2. Document it in [`../.claude/mcp.md`](../.claude/mcp.md) and add a row above.
3. Keep tokens out of the JSON — reference an env var and note it in the markdown.
