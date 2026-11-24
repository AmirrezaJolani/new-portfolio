---
name: verifying-a-change
description: Use before claiming any change in this portfolio repo is done, before committing or opening a PR, or when CI (lint, tsc, test, Docker smoke test) fails.
---

# Verifying a change

## Overview

CI runs `lint → tsc → test → docker build + GET / == 200`. Run the same locally, then look at
the page in a real browser. Passing unit tests don't show a mirrored layout or a raw message key.

## 1. Checks (CI parity)

```bash
npm run lint && npx tsc --noEmit && npm test && npm run build
```

- `npm run lint` is `biome check`. Errors fail CI. The existing warnings (`noImportantStyles`,
  `noDescendingSpecificity`, `noNonNullAssertion`) are known; don't add new error-level ones.
- `npm run build` uses `output: "standalone"`. After it, `.next/standalone/messages/` must hold
  every locale's JSON. If not, fix `outputFileTracingIncludes` in `next.config.ts`.
- Docker (only when Dockerfile, next.config or deps changed): `docker compose up --build`, then
  `curl -fsS localhost:3000/`.

## 2. Look at it

```bash
npx next start -p 3124   # after build; or npm run dev (port 3000)
```

Use Playwright (MCP browser tools or a script). Switch locale with the cookie, not a URL:

```js
await context.addCookies([{ name: "NEXT_LOCALE", value: "fa", url: "http://localhost:3124" }]);
await page.goto("http://localhost:3124/");   // intro panel opens on first visit; Esc closes it
// M opens the map: fast-travel to a stop, Esc, then Enter re-opens it from the pad.
```

Checklist:
- [ ] The page you changed, in `en` **and** `fa` (`<html dir="rtl">`); add `de`/`it` if the copy is long
- [ ] No console errors
- [ ] Touch viewport (390×844, `hasTouch: true`) if you touched the HUD or controls
- [ ] No raw keys (`drive.…`) visible

Stop the server when done.

## Common mistakes

- Reporting "build passes" from `next dev`: dev doesn't exercise standalone tracing.
- Screenshotting only English: most layout bugs here are RTL bugs.
- A strict-mode selector clash in Playwright (`getByRole(..., { name: /…/ })` matching two
  buttons): narrow with `exact: true` or a parent locator.
