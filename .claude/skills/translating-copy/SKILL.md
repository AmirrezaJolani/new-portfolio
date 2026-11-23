---
name: translating-copy
description: Use when adding or renaming a user-facing string, adding a new language, or when a page shows a raw message key, the Persian layout is mirrored wrong, or the language picker doesn't list a locale.
---

# Translating copy (next-intl, cookie locale)

## Overview

Locale is a `NEXT_LOCALE` cookie, **not** a URL segment (no `/en`, `/fa`). Every string comes
from `messages/<locale>.json`; all catalogs must have identical keys, and
`i18n/messages.test.ts` enforces it. The language list has one source of truth:
`i18n/config.ts`.

## Adding a string

1. Add the key to `messages/en.json`, then the same path to `fa`, `de`, `it`.
2. Read it with `useTranslations("<namespace>")` (client) or `getTranslations` (server).
   Dynamic keys are fine: ``t(`experience.${id}.role`)``.
3. `npm test`.

## Adding a language

| Step | File |
|------|------|
| Add id to `locales`; add to `rtlLocales` if right-to-left | `i18n/config.ts` |
| Add `{ id, labelKey }` to `localeOptions` | `i18n/config.ts` |
| Create catalog, **same key order as en** | `messages/<id>.json` |
| Add `menu.<labelKey>` (the language's own name, e.g. "Italiano") to **every** catalog | `messages/*.json` |
| Update the language lists in docs | `README.md`, `AGENTS.md`, `.claude/README.md`, `.claude/agents/i18n-translator.md`, `.agent/README.md` |

Nothing else: the game picker (`features/drive/components/LanguagePicker.tsx`), desktop menu
bar and Settings pane all map over `localeOptions`; `app/layout.tsx` derives `dir` from
`rtlLocales`; `next.config.ts` traces `./messages/*.json` into the standalone build.

Fast parity check while translating (last arg = locale):

```bash
node -e 'const k=(o,p="")=>Object.entries(o).flatMap(([a,v])=>typeof v=="string"?[p+a]:k(v,p+a+"."));const en=new Set(k(require("./messages/en.json")));const x=k(require(`./messages/${process.argv[1]}.json`));console.log("missing",[...en].filter(a=>!x.includes(a)),"extra",x.filter(a=>!en.has(a)))' it
```

## RTL rules

- Tailwind **logical** properties only: `ps-/pe-/ms-/me-/start-/end-/text-start`. Never `left/right/pl/pr`.
- Mixed-direction values (`€1M→4M`, `+6`, handles, km/h) get `dir="ltr"` on their element.
- The game's canvas layer is `dir="ltr"` on purpose (physical world coords). Text inside it
  that may be RTL goes in an inner `<span dir="auto">` — never put `dir` on the positioned
  element itself, it flips its own `start-0`.

## Common mistakes

- Hardcoding a string "because it's just an emoji label": aria-labels are copy too.
- Machine translations shipped silently: say in the PR that de/it/fa need a native read.
- Adding `/de` routes or middleware: this project deliberately has no locale routing.
