# Docker CI/CD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Containerize the Next.js 16 portfolio and add a GitHub Actions pipeline that runs quality checks on PRs and publishes a Docker image to GHCR on push to `main`.

**Architecture:** A multi-stage Dockerfile built on Next.js `output: "standalone"` (deps → builder → runner, non-root) produces a lean image. A `docker.yml` workflow runs a `test` job (lint/type-check/test) and a `docker` job that builds the image on every PR (no push) and pushes `latest` + short-SHA tags to GHCR on `main`. A `docker-compose.yml` runs the image locally.

**Tech Stack:** Docker (BuildKit, multi-stage), Next.js 16 standalone output, GitHub Actions (docker/* actions), GHCR, Node 22 (pinned).

**Conventions:**
- This is infrastructure/config — there are no unit tests. "Verification" means building & running the image and confirming HTTP behavior, plus CI going green on a PR.
- Base image and CI both pin **Node 22** (LTS). Local dev Node is 26; do not pin images on it.
- Commit after each task with the message in its final step.
- Work on branch `feat/docker-cicd` (already created off `feat/macos-portfolio`). Do NOT switch branches.
- Action version note: the pinned `docker/*` and `actions/*` majors below are known-good as of 2026-07. If CI reports a deprecation or a newer major, bump it (Docker's 2026 docs also show `setup-buildx@v4`, `login@v4`, `metadata@v6`, `build-push@v7`).

---

## File Structure

```
next.config.ts                 # + output: "standalone" + messages tracing include
.dockerignore                  # lean build context
Dockerfile                     # multi-stage standalone build (deps → builder → runner)
docker-compose.yml             # local run: build + serve on :3000
.github/workflows/docker.yml   # test job + docker build/push job
```

---

## Task 1: Enable Next.js standalone output

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Replace `next.config.ts`**

```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  output: "standalone",
  // i18n/request.ts loads catalogs via a template-literal dynamic import, which
  // Next's file tracing can miss; force them into the standalone bundle.
  outputFileTracingIncludes: {
    "/": ["./messages/*.json"],
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
```

- [ ] **Step 2: Build and verify the standalone server + messages are emitted**

Run:
```bash
npm run build
test -f .next/standalone/server.js && echo "server.js OK"
ls .next/standalone/messages/*.json
```
Expected: `server.js OK`, and both `en.json` and `fa.json` listed under
`.next/standalone/messages/`. If the messages are missing, the tracing include is not matching —
stop and report (do not proceed to the Dockerfile with a broken bundle).

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat: enable Next.js standalone output for Docker"
```

---

## Task 2: Add `.dockerignore`

**Files:**
- Create: `.dockerignore`

- [ ] **Step 1: Create `.dockerignore`**

```gitignore
node_modules
.next
.git
.github
docs
coverage
*.md
.env*
*.log
.DS_Store
.vscode
.idea
.claude
.agent
Dockerfile
.dockerignore
docker-compose.yml
```

- [ ] **Step 2: Commit**

```bash
git add .dockerignore
git commit -m "chore: add .dockerignore"
```

---

## Task 3: Multi-stage Dockerfile

**Files:**
- Create: `Dockerfile`

- [ ] **Step 1: Create `Dockerfile`**

```dockerfile
# syntax=docker/dockerfile:1

# --- deps: install production + build deps ---
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- builder: compile the standalone server ---
FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- runner: minimal image that serves the standalone output ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root runtime user (busybox/alpine flags)
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

- [ ] **Step 2: Build the image**

Run:
```bash
docker build -t portfolio:local .
```
Expected: build completes successfully through all three stages.

- [ ] **Step 3: Run the container and verify HTTP + both locales**

Run:
```bash
docker run -d --rm -p 3000:3000 --name portfolio-test portfolio:local
sleep 3
echo "default:" && curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
echo "fa dir:" && curl -s --cookie "NEXT_LOCALE=fa" http://localhost:3000/ | grep -o 'dir="rtl"' | head -1
docker rm -f portfolio-test
```
Expected: `default: 200`, and `fa dir: dir="rtl"` (proves the `fa` catalog is bundled — a
missing catalog would 500 before rendering `dir`). If `fa` returns 500 or no `dir="rtl"`,
the messages are not in the image: stop and report (revisit Task 1's tracing include).

- [ ] **Step 4: Verify the container runs as non-root**

Run:
```bash
docker run --rm --entrypoint whoami portfolio:local
```
Expected: `nextjs`.

- [ ] **Step 5: Commit**

```bash
git add Dockerfile
git commit -m "feat: add multi-stage standalone Dockerfile"
```

---

## Task 4: docker-compose for local runs

**Files:**
- Create: `docker-compose.yml`

- [ ] **Step 1: Create `docker-compose.yml`**

```yaml
services:
  web:
    build: .
    image: portfolio:local
    ports:
      - "3000:3000"
    restart: unless-stopped
```

- [ ] **Step 2: Verify compose builds and serves**

Run:
```bash
docker compose up --build -d
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
docker compose down
```
Expected: `200`, then compose tears down cleanly.

- [ ] **Step 3: Commit**

```bash
git add docker-compose.yml
git commit -m "feat: add docker-compose for local runs"
```

---

## Task 5: GitHub Actions workflow

**Files:**
- Create: `.github/workflows/docker.yml`

- [ ] **Step 1: Create `.github/workflows/docker.yml`**

```yaml
name: Docker

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm test

  docker:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3

      - name: Log in to GHCR
        if: github.event_name != 'pull_request'
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Docker metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=raw,value=latest,enable={{is_default_branch}}
            type=sha,format=short

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

Notes:
- `docker/metadata-action` lowercases the image reference, so the mixed-case
  `github.repository` (`AmirrezaJolani/new-portfolio`) becomes a valid lowercase GHCR name.
- On PRs the `docker` job builds but does not push (no login, `push: false`), verifying the
  Dockerfile in CI. On `main` it logs in with the built-in `GITHUB_TOKEN` and pushes.

- [ ] **Step 2: Validate the workflow YAML locally**

Run:
```bash
python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/docker.yml')); print('yaml OK')"
```
Expected: `yaml OK`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/docker.yml
git commit -m "ci: add Docker build/push workflow (GHCR)"
```

---

## Task 6: Push, open PR, and confirm CI

**Files:** none (integration/verification)

- [ ] **Step 1: Push the branch**

```bash
git push -u origin feat/docker-cicd
```

- [ ] **Step 2: Open a PR against the app branch**

```bash
gh pr create --base feat/macos-portfolio --head feat/docker-cicd \
  --title "feat: Docker CI/CD (GHCR)" \
  --body "Multi-stage standalone Dockerfile, .dockerignore, docker-compose, and a GitHub Actions workflow that checks PRs and publishes latest + SHA images to GHCR on main."
```

- [ ] **Step 3: Confirm the pipeline is green on the PR**

Run:
```bash
gh pr checks --watch
```
Expected: both `test` and `docker` (build-only on the PR) succeed. If an action version errors,
bump it per the header note and push again.

- [ ] **Step 4: Post-merge check (manual, after this PR and #1 merge to `main`)**

After the branch reaches `main`, confirm the image published:
```bash
gh api "/users/AmirrezaJolani/packages/container/new-portfolio/versions" --jq '.[0].metadata.container.tags'
```
Expected: tags include `latest` and a `sha-<short>` tag. (The package may be private by default;
make it public in GHCR settings if desired.)

---

## Self-Review Notes (against the spec)

- **Multi-stage standalone Dockerfile, non-root** → Task 3. ✅
- **`.dockerignore`** → Task 2. ✅
- **`docker-compose.yml` local run** → Task 4. ✅
- **`.github/workflows/docker.yml`: test + docker jobs, PR = build-only, main = push latest+SHA to GHCR** → Task 5. ✅
- **`output: "standalone"` + i18n messages tracing safeguard** → Task 1 (with explicit bundle verification). ✅
- **Node 22 pinned (image + CI)** → Tasks 3 & 5. ✅
- **Verification: image builds, runs non-root, serves 200, both locales, CI green, GHCR publish** → Tasks 3 & 6. ✅
- **Non-goals respected:** no deploy job, single-arch, no semver tags, no env/secrets wiring.

**Consistency:** image name `ghcr.io/${{ github.repository }}` (lowercased by metadata-action);
tags `latest` + `sha-<short>`; port `3000`; user `nextjs`; Node `22` used identically in the
Dockerfile and the workflow.
