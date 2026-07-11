# Docker CI/CD — Design

**Date:** 2026-07-11
**Status:** Approved (design), pending implementation plan

## Summary

Containerize the Next.js 16 portfolio and wire a GitHub Actions pipeline that runs quality
checks on pull requests and publishes a Docker image to the GitHub Container Registry (GHCR)
on every push to `main`. Deliverables: a multi-stage `Dockerfile` (Next.js **standalone**
output), a `.dockerignore`, a `docker-compose.yml` for local runs, and
`.github/workflows/docker.yml`. No automated deploy step (build + push only).

## Goals

- Reproducible, production-grade container image for the app.
- CI on pull requests: lint, type-check, unit tests, and a Docker build (verify the image
  builds without pushing).
- On push to `main`: build and push the image to GHCR tagged `latest` + the short commit SHA.
- One-command local run via `docker compose up`.
- Lean, secure image: minimal final layer, non-root runtime user, pinned base.

## Non-Goals

- Automated deployment / CD to any host (no SSH, Fly.io, Railway, etc.).
- Multi-arch images (single `linux/amd64` is enough for now).
- Semver/release-tag images (only `latest` + SHA from `main`).
- Secrets/env wiring — the app has no runtime env vars or backend.

## Chosen Approach

**Multi-stage build on Next.js `output: "standalone"`.** Three stages (`deps` → `builder` →
`runner`); the runner copies only the standalone server, static assets, and `public`, and runs
`node server.js` as a non-root user. Rejected: single-stage (ships all `node_modules` + source
→ ~1 GB, slower, less secure) and a distroless runner (marginal gain, more complexity).

## Files

```
Dockerfile                     # multi-stage standalone build
.dockerignore                  # lean build context
docker-compose.yml             # local run: build + serve on :3000
.github/workflows/docker.yml   # CI checks + build/push image
next.config.ts                 # + output: "standalone" + messages tracing safeguard
```

## Component Design

### `next.config.ts` changes

Add standalone output so the Docker runner needs only the traced server bundle:

```ts
const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: { "/": ["./messages/**"] },
};
```

The `outputFileTracingIncludes` line is a **safeguard** (see Risks): `i18n/request.ts` loads
catalogs with a template-literal dynamic import, which Next's file tracing can miss.

### `Dockerfile` (multi-stage)

- **Base:** `node:22-alpine` — pinned LTS. (Local dev uses Node 26, too new to pin an image
  on; the app targets Node 20+.)
- **`deps`:** copy `package.json` + `package-lock.json`; `npm ci`.
- **`builder`:** copy deps + source; `npm run build` (produces `.next/standalone`).
- **`runner`:** `NODE_ENV=production`, `HOSTNAME=0.0.0.0`, `PORT=3000`; create + switch to a
  non-root `nextjs` user; copy `public`, `.next/standalone`, `.next/static`; `EXPOSE 3000`;
  `CMD ["node", "server.js"]`.

### `.dockerignore`

Exclude from the build context: `node_modules`, `.next`, `.git`, `.github`, `docs`, `*.md`,
`coverage`, `.env*`, `*.log`, `.vscode`, `.claude`, `.agent` — smaller context, faster builds,
no secrets.

### `docker-compose.yml`

One `web` service: `build: .`, `ports: ["3000:3000"]`, `restart: unless-stopped`. Lets a
developer run the exact production image with `docker compose up --build`.

### `.github/workflows/docker.yml`

Triggers: `pull_request` and `push` to `main`.

- **Job `test`** (runs on both): `actions/checkout` → `actions/setup-node@v4` (Node 22, npm
  cache) → `npm ci` → `npx biome check` → `npx tsc --noEmit` → `npx vitest run`.
- **Job `docker`** (`needs: test`): `docker/setup-buildx-action` →
  `docker/metadata-action` (tags: `latest` + `sha-<short>`; images:
  `ghcr.io/${{ github.repository }}`) → `docker/build-push-action` with GHA layer cache
  (`cache-from/to: type=gha`).
  - On **pull requests**: `push: false` (build only — verifies the Dockerfile).
  - On **push to `main`**: log in to GHCR via `docker/login-action` using the built-in
    `GITHUB_TOKEN`, then `push: true`.
  - Job permissions: `contents: read`, `packages: write`.

## Data / Control Flow

1. PR opened/updated → `test` runs checks; `docker` builds the image (no push). Both must pass.
2. Merge to `main` → `test` re-runs → `docker` builds and pushes
   `ghcr.io/<owner>/<repo>:latest` and `:sha-<short>` to GHCR.
3. Local: `docker compose up --build` → app served at `http://localhost:3000`.

## Risks & Mitigations

- **i18n messages missing from the standalone bundle.** `i18n/request.ts` uses
  `import(\`../messages/${locale}.json\`)`; Next's tracer may not resolve template-literal
  dynamic imports, so the image could 500 on locale load. **Mitigation:**
  `outputFileTracingIncludes: { "/": ["./messages/**"] }`, then verify in the container
  (curl `/`, and again with a `NEXT_LOCALE=fa` cookie) during implementation.
- **First GHCR push visibility/permissions.** The package is created on first push; the
  `packages: write` permission + `GITHUB_TOKEN` handle auth. Note in the plan that the package
  may default to private (owner can make it public later) — not a blocker.
- **Node version drift.** Image and CI both pin Node 22 to stay reproducible regardless of the
  local Node 26.

## Verification

- `docker build` succeeds; final image runs as non-root and serves 200 on `/`.
- Both locales render in the container (`en` default; `fa` via the `NEXT_LOCALE` cookie →
  `dir="rtl"`).
- `docker compose up --build` serves the app locally.
- A PR shows `test` + `docker` (build-only) green; merging to `main` publishes the image to
  GHCR with `latest` + SHA tags.

## Extensibility Notes

- Adding CD later = one deploy job gated on the `docker` job (target-specific).
- Multi-arch = add `platforms: linux/amd64,linux/arm64` to `build-push-action`.
- Release images = extend `metadata-action` tags with `type=semver` on `push: tags`.
