# Hitori Media OS — Admin Dashboard (Phase Admin 1)

Read-only Next.js dashboard for the Sanity AI Content OS / Hitori Media OS workflow.

This dashboard now covers **Batch A + B + C + D1 + D2** of
[Phase Admin 1](../docs/58-admin-dashboard-phase-plan.md):

- **Batch A**: scaffold + Campaign Detail page (`/campaigns/[slug]`).
- **Batch B**: top nav, Dashboard Home (`/`), Campaigns list (`/campaigns`),
  Human Review Gates aggregator (`/human-review-gates`), Visual Assets stub
  (`/visual-assets`), and a reusable `NextActionSummary` for "what to do next".
- **Batch C**: full Visual Assets listing, Publish Packages filesystem walk
  (`/publish-packages`), Diagnostics page that runs `npm run local:check` at
  request time (`/diagnostics`), Activity Log that renders the latest
  `docs/devlog/*.md` and `docs/handoff/*.md` (`/activity-log`).
- **Batch D1**: feature flags so dev-only routes (`/diagnostics`,
  `/publish-packages`, `/api/asset-thumb`) 404 in production by default,
  AppNav hides those links automatically, `/visual-assets` thumbnails via the
  safe `/api/asset-thumb` handler, and an activity-log snapshot script that
  feeds `/activity-log` in production. See **Feature flags** below and
  [docs/60](../docs/60-admin-phase-1-batch-d-deploy-plan.md) for the deploy plan.
- **Batch D2**: Basic Auth proxy (`src/proxy.ts`) for protected preview
  deploys. Vercel project / env / DNS steps for `app.hitorimedia.com` are
  documented in [docs/61](../docs/61-admin-phase-1-batch-d2-vercel-setup.md);
  the actual deploy is intentionally still manual.

## Setup

```bash
cd dashboard
# .env.local must be created manually (see "Environment" below).
# Dependencies are installed when scaffolding via `npx create-next-app`,
# so a fresh `npm install` is only needed after pulling new changes.
```

If you skipped install, run:

```bash
npm install
```

## Feature flags

Phase Admin 1 — Batch D1 introduces three env-controlled flags that decide
which dev-only surfaces are reachable. They are read once at module load by
[`src/lib/featureFlags.ts`](src/lib/featureFlags.ts).

| Env var | Default (dev) | Default (production) | Effect when active |
| --- | --- | --- | --- |
| `ENABLE_DIAGNOSTICS` | enabled | disabled | `/diagnostics` page + AppNav link |
| `ENABLE_LOCAL_FS_ROUTES` | enabled | disabled | `/publish-packages` page + AppNav link, `/api/asset-thumb` handler, `<img>` thumbnails on `/visual-assets` |
| `ACTIVITY_LOG_MODE` | `fs` | `snapshot` | `fs` reads `docs/devlog/*.md` + `docs/handoff/*.md` from the repo on each request; `snapshot` reads `dashboard/public/activity-snapshot.json` |

Notes:

- "dev" = `NODE_ENV !== 'production'`. `npm run dev` with no flag set keeps
  the pre-D1 behavior so nothing breaks for localhost work.
- "production" defaults are safe: a deploy without configuration cannot
  accidentally expose filesystem-backed routes.
- Setting `ENABLE_DIAGNOSTICS=false` or `ENABLE_LOCAL_FS_ROUTES=false`
  explicitly always wins, even on localhost.

Example commands:

```bash
# Local dev with everything visible (default; explicit form for clarity)
ENABLE_DIAGNOSTICS=true ENABLE_LOCAL_FS_ROUTES=true ACTIVITY_LOG_MODE=fs npm run dev

# Production-like sanity check on localhost (mirrors what app.hitorimedia.com will do)
npm run build:activity-snapshot
ENABLE_DIAGNOSTICS=false ENABLE_LOCAL_FS_ROUTES=false ACTIVITY_LOG_MODE=snapshot npm run dev
```

## `/api/asset-thumb` (local-only image serving)

When `ENABLE_LOCAL_FS_ROUTES=true`, the dashboard exposes a Node-runtime route
handler at `/api/asset-thumb?path=...` that streams images out of the repo's
`assets/visuals/` tree so `/visual-assets` can show small previews.

Hard rules enforced by the handler:

- request must be `?path=<relative-path>`
- path must begin with `assets/visuals/`
- absolute paths rejected (`400`)
- `..` segments rejected after `path.normalize` (`400`)
- double-encoded traversal (`..%252F...`) rejected before normalize (`403`)
- extension whitelist: `.png` / `.jpg` / `.jpeg` / `.webp` / `.gif` (`415`)
- size cap: 8 MB (`413`)
- missing file: `404`
- response sets `Cache-Control: private, no-store` and
  `X-Content-Type-Options: nosniff`

In production (`ENABLE_LOCAL_FS_ROUTES != 'true'`) the route returns **404**
without touching the filesystem. Batch D2 will revisit whether a build-time
snapshot of approved visuals belongs in `public/visuals/` instead.

## Activity Log snapshot

In `snapshot` mode `/activity-log` reads `public/activity-snapshot.json`,
produced by:

```bash
npm run build:activity-snapshot
```

The script ([`scripts/build-activity-snapshot.mjs`](scripts/build-activity-snapshot.mjs))
reads `docs/devlog/*.md` and `docs/handoff/*.md` from the repo root, extracts
title / `Date:` / `Status:` / a ~120-char excerpt, and writes the latest 20
entries per kind to `dashboard/public/activity-snapshot.json`.

Run it manually before a deploy. `dashboard/public/activity-snapshot.json` is
**committed to git on purpose**: Vercel's "Root Directory: `dashboard/`"
setting excludes the repo's `docs/` from the build context, so a build-time
generation step would silently produce an empty snapshot. The lifecycle is:

1. Land new `docs/devlog/*.md` or `docs/handoff/*.md` entries on `main`.
2. `cd dashboard && npm run build:activity-snapshot`.
3. Commit the regenerated `public/activity-snapshot.json` and push.
4. Vercel rebuild picks up the fresh snapshot.

There is intentionally **no `prebuild` hook** that runs the script — adding
one would make every clean install dependent on `docs/` being present, which
breaks the Vercel layout.

In `fs` mode (localhost default) the page ignores the snapshot and reads the
repo filesystem live, with the longer ~400-char excerpts.

## Basic Auth proxy (Batch D2)

`dashboard/src/proxy.ts` is a [Next.js 16 proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
(the renamed `middleware` convention) that enforces HTTP Basic Auth when
`ADMIN_BASIC_AUTH_USER` and `ADMIN_BASIC_AUTH_PASSWORD` are both set:

- If **either** variable is unset (the localhost default), every request
  passes through unchanged — `npm run dev` keeps working with zero extra
  configuration.
- If **both** are set, every matched request must present a valid
  `Authorization: Basic base64(user:pass)` header. Missing or wrong → 401
  with a `WWW-Authenticate: Basic realm="Hitori Media OS Admin"` header so
  the browser shows the native login prompt.

Matcher excludes Next.js internals (`/_next/static`, `/_next/image`,
`/_next/data`), the favicon, `/robots.txt`, `/sitemap.xml`, and the
`/.well-known/` prefix. Everything else — page routes, API routes including
`/api/asset-thumb` — is protected.

Local test recipe:

```bash
# 1. With auth env unset → traffic passes through
cd dashboard && npm run dev
# curl http://localhost:3000/  → 200

# 2. With auth env set → 401 unless Authorization header is present
ADMIN_BASIC_AUTH_USER=admin ADMIN_BASIC_AUTH_PASSWORD=test-password-only npm run dev
curl -i http://localhost:3000/                                  # 401
curl -i -u admin:test-password-only http://localhost:3000/      # 200
```

The proxy uses a constant-ish-time string compare so the response time
doesn't depend solely on whether the username matched. It never logs the
incoming credentials and never writes anything to cookies.

> **Do not** set `ADMIN_BASIC_AUTH_*` in `.env.local` if you don't need them
> on localhost. The values are only meant for Vercel's Production and
> Preview environment scopes.

## Deploy to app.hitorimedia.com

Step-by-step Vercel + DNS instructions live in
[docs/61-admin-phase-1-batch-d2-vercel-setup.md](../docs/61-admin-phase-1-batch-d2-vercel-setup.md).
Summary of the human-only steps:

1. Run `npm run build:activity-snapshot` and commit the regenerated JSON.
2. Create a Vercel project, **Root Directory: `dashboard/`**.
3. Add env vars per `docs/61 §C` (Sanity, Basic Auth, production-safe flags).
4. Add domain `app.hitorimedia.com`, follow Vercel's DNS instructions at the
   registrar.
5. Trigger the first deploy. Verify the Basic Auth prompt, dev-only routes
   return 404, activity snapshot renders.

## Environment

Create `dashboard/.env.local` with the following:

```text
NEXT_PUBLIC_SANITY_PROJECT_ID=5f79ed6q
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-08-15
# Optional: override the deep-link target for "Edit in Sanity Studio".
# NEXT_PUBLIC_STUDIO_BASE_URL=http://localhost:3333
# REQUIRED if the dataset is private (see "Dataset access" below).
# SANITY_READ_TOKEN=<viewer-or-editor-token-from-sanity-manage>
```

Notes:

- The three `NEXT_PUBLIC_*` values are **public** (`NEXT_PUBLIC_*` is inlined into the client bundle).
- `5f79ed6q` is the Hitori Media OS project ID, sourced from the existing root
  `sanity.config.ts` (`SANITY_STUDIO_PROJECT_ID`). It is not a secret.
- `SANITY_READ_TOKEN` (no `NEXT_PUBLIC_` prefix) is read **only server-side** and never
  inlined into the client bundle. It must be a **read-only** (viewer / editor) token.
  **Do not** put a write token here.
- **Do not** add `SANITY_WRITE_TOKEN`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or any
  image-API key to this file.
- `.env.local` is gitignored by the default `.env*` pattern; do not commit it.
- If `.env.local` is absent, `src/lib/sanity.ts` falls back to the public defaults
  above. The app still builds, but Sanity reads will fail on a private dataset
  (you will see a 404 on `/campaigns/[slug]`).

## Dataset access

The Hitori Media OS dataset (`production`) is currently **private**. Anonymous
reads return `null` even for plain documents, which is what causes the
Campaign Detail page to render 404 in a fresh checkout.

You have two options:

### Option A — Add a read token (recommended for now)

1. Open <https://sanity.io/manage>, select the **Sanity AI Content OS** project
   (ID `5f79ed6q`), and go to **API → Tokens**.
2. Create a new token with role **Viewer** (read-only). Name it something like
   `dashboard-read-only`.
3. Copy the token value once (Sanity won't show it again).
4. Add this line to `dashboard/.env.local`:

   ```text
   SANITY_READ_TOKEN=<paste here>
   ```

5. Restart the dev server (`npm run dev`).

The Sanity client in `src/lib/sanity.ts` auto-switches `useCdn` to `false` when
a token is present (the CDN bypasses tokens, so a private dataset only resolves
via the live API).

### Option B — Make the dataset public

In Sanity manage, change the `production` dataset visibility from Private to
Public. The dashboard will then work without a token. **All content becomes
queryable by anyone with the project ID** — fine for fully building-in-public
projects, less fine if anything in the dataset is sensitive. Decide before
flipping this switch.

## Develop locally

```bash
npm run dev
# Open http://localhost:3000
```

Routes:

| Path | Source | Purpose |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | Dashboard Home — overview cards, latest campaign + `NextActionSummary` |
| `/campaigns` | `src/app/campaigns/page.tsx` | All campaign plans, one row per `campaignPlan` |
| `/campaigns/[slug]` | `src/app/campaigns/[slug]/page.tsx` | Campaign Detail |
| `/human-review-gates` | `src/app/human-review-gates/page.tsx` | Pending review gates aggregated across all campaigns |
| `/visual-assets` | `src/app/visual-assets/page.tsx` | Full `visualAssetPlan` listing; thumbnails via `/api/asset-thumb` when `ENABLE_LOCAL_FS_ROUTES=true` |
| `/publish-packages` | `src/app/publish-packages/page.tsx` | Filesystem walk of `publish-packages/` at the repo root; **404 when `ENABLE_LOCAL_FS_ROUTES != 'true'`** |
| `/diagnostics` | `src/app/diagnostics/page.tsx` | Runs `npm run local:check` server-side; **404 when `ENABLE_DIAGNOSTICS != 'true'`** |
| `/activity-log` | `src/app/activity-log/page.tsx` | `fs` mode reads docs/ live, `snapshot` mode reads `public/activity-snapshot.json` |
| `/api/asset-thumb` | `src/app/api/asset-thumb/route.ts` | Local-only image streaming under `assets/visuals/` (Batch D1); **404 when `ENABLE_LOCAL_FS_ROUTES != 'true'`** |

To open the root Sanity Studio in parallel:

```bash
# From the repo root, in a separate terminal:
npm run dev
# Opens Studio at http://localhost:3333 by default.
```

## Build

```bash
npm run build
```

This runs `next build` and produces a production build of the dashboard app.
It does **not** touch the root Sanity Studio build (`/npm run build` at repo root).

## What this dashboard does

Phase Admin 1 — **read-only only**:

- Renders `campaignPlan` documents from Sanity via `@sanity/client` (`useCdn: true`).
- Dereferences string-ID joins for `requiredVisualAssets[].visualAssetPlanId`
  and `promptTemplateSelections[].promptTemplateId` using GROQ
  `*[_id == ^.X][0]` (not the `->` arrow, because those fields are strings).
- Displays:
  - campaign status / progress
  - source `contentIdea` summary
  - `brandProfile` summary
  - selected platforms (chips)
  - 9-stage `humanReviewGates`
  - visual asset status table
  - prompt template summary
  - publish package paths + release-review path
  - manual publishing status (optional)
- Links out to:
  - Sanity Studio document (deep link)
  - Visual Register at `http://localhost:3334`

## What this dashboard intentionally does NOT do (Phase Admin 1)

- Does **not** scaffold Dashboard Home, campaign list, prompt-template view,
  visual-assets list, diagnostics, activity log, or any other route yet.
  Those land in Batch B / C.
- Does **not** allow editing any record (no Sanity writes, no `mutate`,
  no `patch`, no `transaction`).
- Does **not** carry a Sanity write token.
- Does **not** call OpenAI / Anthropic / any paid image API.
- Does **not** trigger AI generation, candidate image generation, or
  publish-package distribution. Use the existing tools at the repo root
  (Visual Register, `npm run publish:package`, etc.).
- Does **not** post to X / Threads / note / Substack.
- Does **not** have authentication. Run on `localhost` only until Phase Admin 2
  adds Auth.

## Tech stack

- Next.js 16 App Router (Turbopack by default)
- React 19.2
- TypeScript 5
- Tailwind CSS v4
- `@sanity/client` v7 (read-only, CDN)

## Project layout

```
dashboard/
├── README.md
├── .env.local                 # (you create this; gitignored)
├── package.json
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── public/
└── src/
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx           # default landing (not yet customized)
    │   └── campaigns/
    │       └── [slug]/
    │           └── page.tsx   # Campaign Detail (Batch A target)
    ├── components/
    │   ├── AppNav.tsx                 # top navigation (Batch B; active highlight added in C)
    │   ├── CampaignStatusCard.tsx
    │   ├── EmptyState.tsx             # shared empty / error state (Batch C)
    │   ├── FilePathBlock.tsx          # muted monospaced path display (Batch C)
    │   ├── HumanReviewGateList.tsx
    │   ├── ManualPublishingStatusList.tsx
    │   ├── NextActionSummary.tsx      # "what to do next" (Batch B)
    │   ├── PromptTemplateSummary.tsx
    │   ├── PublishPackageLinks.tsx
    │   ├── ReadOnlyBanner.tsx         # shared Phase Admin 1 banner (Batch B)
    │   ├── SectionHeader.tsx          # shared section header (Batch C)
    │   ├── SelectedPlatformChips.tsx
    │   ├── StatusBadge.tsx
    │   ├── SummaryCard.tsx            # shared overview card (Batch C)
    │   └── VisualAssetStatusTable.tsx
    ├── lib/
    │   ├── featureFlags.ts            # ENABLE_DIAGNOSTICS / ENABLE_LOCAL_FS_ROUTES / ACTIVITY_LOG_MODE (Batch D1)
    │   ├── repoRoot.ts                # repo path helper for fs reads (Batch C)
    │   ├── sanity.ts
    │   └── groq/
    │       └── campaign.ts
    └── proxy.ts                       # Basic Auth proxy, Next.js 16 file convention (Batch D2)
```

## Related docs (at repo root)

- [docs/56-admin-dashboard-architecture.md](../docs/56-admin-dashboard-architecture.md) — IA + screen plan
- [docs/57-hitorimedia-domain-app-plan.md](../docs/57-hitorimedia-domain-app-plan.md) — root vs app subdomain plan
- [docs/58-admin-dashboard-phase-plan.md](../docs/58-admin-dashboard-phase-plan.md) — Phase Admin 0–4 roadmap
- [docs/59-admin-phase-1-implementation-plan.md](../docs/59-admin-phase-1-implementation-plan.md) — Batch A–D spec

## Next batches

- **Batch B** ✅ — Dashboard Home, campaign list, Human Review Gates,
  Visual Assets stub, top nav, `NextActionSummary` with staleness detection.
- **Batch C** ✅ — Visual Assets full listing, Publish Packages (filesystem
  walk), Diagnostics (`npm run local:check`), Activity Log
  (`docs/devlog/*.md` + `docs/handoff/*.md`), top-nav active highlight.
- **Batch D1** ✅ — Feature flags, route guards, `/api/asset-thumb` handler,
  activity-log snapshot script, conditional nav links. No deploy.
- **Batch D2** ✅ — Basic Auth proxy at `src/proxy.ts`, Vercel setup doc at
  [docs/61](../docs/61-admin-phase-1-batch-d2-vercel-setup.md). The actual
  Vercel project creation, env entry, and DNS change are still pending —
  intentionally a human task.
- **Batch D3** — Post-deploy verification checklist (HTTP / nav / cookie /
  Auth header / DNS cert / secret leak audit), run after the first
  successful Vercel deploy.
