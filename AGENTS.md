<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Portfolio OS — project context

An interactive **macOS-style desktop** portfolio: menu bar, dock, and draggable/resizable/
minimizable windows presenting content as "apps" (About, Projects, Contact). Styled with a
macOS Tahoe **Liquid Glass** system; internationalized (English + Persian/RTL); containerized
with Docker + CI.

**Architecture** — feature-first, one-directional flow:
`workflows/` (pure, unit-tested state machines) → `context/` (React wiring) → `features/*`
(presentation) → `components/ui/` (shadcn/Base UI primitives). Supporting: `lib/`
(`apps.config.tsx` app registry + `content.ts`), `hooks/`, `types/`, `i18n/` (cookie-based
next-intl) + `messages/` (`en`/`fa`, kept at key parity).

**Non-negotiables**
- App UI lives in `features/<feature>/components/`; only shadcn primitives in `components/ui/`.
- One source of truth for apps: `lib/apps.config.tsx` + `features/desktop/components/appRegistry.tsx`.
- All user-facing copy via next-intl; `en.json` and `fa.json` must stay at key parity.
- RTL uses Tailwind **logical** properties (`ps/pe/start/end`), never physical `left/right`.
- Business rules stay pure in `workflows/` (Vitest-tested); keep `context/` thin.
- `shadcn` is a **devDependency on purpose** (`app/globals.css` imports `shadcn/tailwind.css`).
- Don't break `output: "standalone"` — the Docker image depends on it.

Deeper, role-specific guidance lives in [`.claude/agents/`](.claude/agents) (portfolio-ui,
i18n-translator, window-system) and the vendor-neutral mirror in [`.agent/`](.agent).
