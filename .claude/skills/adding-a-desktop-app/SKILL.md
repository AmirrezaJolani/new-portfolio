---
name: adding-a-desktop-app
description: Use when adding a new app window to the macOS-style /desktop (dock icon, menu-bar entry, mobile home tile), e.g. "add a Games app" or "add a Blog window".
---

# Adding a desktop app

## Overview

The dock, menu bar, window layer and mobile home all read one registry. An app is
**one id + one feature folder + two registry lines + copy**. Never wire an app into the dock
or menu bar by hand.

## Steps

| # | File | Change |
|---|------|--------|
| 1 | `types/index.ts` | Add the id to the `AppId` union |
| 2 | `features/<id>/components/<Name>App.tsx` + `features/<id>/index.ts` | The window body; export `<Name>App` |
| 3 | `lib/apps.config.tsx` | `{ id, titleKey: id, icon, tile, defaultGeometry }`. `icon` is a lucide icon; `tile` is a Tailwind gradient |
| 4 | `features/desktop/components/appRegistry.tsx` | `<id>: <Name>App` (the `Record<AppId, …>` type forces this) |
| 5 | `messages/*.json` | `apps.<id>` title + the app's own namespace, all four locales |

Window behaviour (focus, z-order, minimize) is already handled by `workflows/windowManager.ts`.
If the app needs new window behaviour, change that workflow **test-first**
(`windowManager.test.ts`) and keep `context/` thin.

## Rules

- UI in `features/<id>/components/`; only shadcn primitives in `components/ui/`
  (`npx shadcn@latest add <name>`).
- Surfaces use the Liquid Glass utilities (`.lg-glass`, `.lg-panel`, `.lg-chip`) in `app/globals.css`.
- Logical properties only (Persian mirrors the whole desktop).
- Read `node_modules/next/dist/docs/` before writing routing, layout or metadata code; this
  Next version differs from training data.

## Verify

`npx tsc --noEmit` catches a missing registry line. Then **REQUIRED SUB-SKILL:**
`verifying-a-change`: open `/desktop`, launch the app from the dock and on mobile width.
