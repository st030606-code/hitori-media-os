# Hitori Media OS — Admin Dashboard

Read-only Next.js dashboard for the Sanity AI Content OS / Hitori Media OS
workflow. **23 routes, all in current fidelity tone** after the
Phase UI-fidelity-1〜11 cycle.

## Current state (post UI-fidelity-11)

- All **23 routes are fidelity-aligned**: `PageHeader` + `Breadcrumb` +
  `KpiCard` + design system are the baseline; no route is still on a
  Phase 1 placeholder.
- **Sidebar has 9 fidelity nav items**: ダッシュボード / キャンペーン /
  出力コンフィギュレーター / 出力管理 / 公開管理 / 図解レビュー /
  ナレッジDB / アナリティクス / 設定.
- **Phase Admin 1 Batch A/B/C legacy components are fully removed**
  (14 old components deleted across two cleanup cycles —
  ReadOnlyBanner cycle and the Phase Admin 1 cleanup).
- **B fixes (Codex review)** removed demo data hardcoding from `/`,
  `/publish`, and `/settings`. See
  [docs/handoff/0167-codex-b-fixes-applied.md](../docs/handoff/0167-codex-b-fixes-applied.md).
- **Codex independent review** confirmed **0 blocking issues** and 8
  Explicitly OK items (security, a11y, secret handling). See
  [docs/handoff/0166-codex-code-review-ui-fidelity.md](../docs/handoff/0166-codex-code-review-ui-fidelity.md).
- **`/campaigns/[slug]` is page-local-section based** after UI-fidelity-11.
  Old single-purpose components (PublishPackageLinks /
  ManualPublishingStatusList / etc.) were replaced by page-local sections
  in the same file; the shared helper `computeNextActions` now lives at
  [`src/lib/campaign/nextActions.ts`](src/lib/campaign/nextActions.ts).
- **Sanity schema and data-fetch logic were not changed** during any of
  the cleanup cycles. GROQ queries in `src/lib/groq/*` are stable.
- **Phase 2B write actions are not implemented yet** — the dashboard
  remains read-only. Write paths still go through Sanity Studio,
  Visual Register CLI, or controlled `tools/sanity/reflect-*.mjs`
  scripts.

The historical Batch A → D1 → D2 phase plan from
[docs/58](../docs/58-admin-dashboard-phase-plan.md) landed long ago; the
relevant rolling history is in `docs/handoff/` (latest:
[docs/handoff/latest.md](../docs/handoff/latest.md)).

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

Phase Admin 1 — Batch D1 introduces three env-controlled flags for dev-only
surfaces. Phase 2B-1 adds one **opt-in** flag for controlled Sanity writes.
All four are read once at module load by
[`src/lib/featureFlags.ts`](src/lib/featureFlags.ts).

| Env var | Default (dev) | Default (production) | Effect when active |
| --- | --- | --- | --- |
| `ENABLE_DIAGNOSTICS` | enabled | disabled | `/diagnostics` page + Sidebar link |
| `ENABLE_LOCAL_FS_ROUTES` | enabled | disabled | `/publish-packages` page + Sidebar link, `/api/asset-thumb` handler, `<img>` thumbnails on `/visual-assets` |
| `ACTIVITY_LOG_MODE` | `fs` | `snapshot` | `fs` reads `docs/devlog/*.md` + `docs/handoff/*.md` from the repo on each request; `snapshot` reads `dashboard/public/activity-snapshot.json` |
| `ENABLE_WRITE_ACTIONS` | **disabled** | **disabled** | Phase 2B-1 (`/analytics` reactionNotes), 2B-2 (`/human-review-gates` state), 2B-3 (`/visual-assets/[assetId]/candidates` approve via CLI bridge). 2B-1 / 2B-2 additionally require `SANITY_WRITE_TOKEN`; 2B-3 additionally requires `ENABLE_LOCAL_FS_ROUTES=true` and the Visual Register CLI running on `:3334`. **Never set this on Vercel.** |

Notes:

- "dev" = `NODE_ENV !== 'production'`. `npm run dev` with no flag set keeps
  the pre-D1 behavior so nothing breaks for localhost work.
- "production" defaults are safe: a deploy without configuration cannot
  accidentally expose filesystem-backed routes.
- Setting `ENABLE_DIAGNOSTICS=false` or `ENABLE_LOCAL_FS_ROUTES=false`
  explicitly always wins, even on localhost.
- **`ENABLE_WRITE_ACTIONS` is opt-in.** The dev default is **disabled** (unlike
  the other flags). Even after enabling it, every write surface still requires
  `SANITY_WRITE_TOKEN` to be present — the flag and the token are AND-gated.
  See [Phase 2B write actions](#phase-2b-write-actions) below.

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
handler at `/api/asset-thumb?path=...` that streams images out of the repo so
`/visual-assets` and friends can show small previews.

Two allowed prefixes (extended in Phase UI-fidelity-6 to surface inbox
candidates as well as final assets):

- `assets/visuals/` — approved final assets
- `assets/inbox/generated/` — inbox v00N candidate images

Hard rules enforced by the handler (per request, a single prefix is matched
and locked for the rest of the validation chain):

- request must be `?path=<relative-path>`
- path must begin with one of the two allowed prefixes
- absolute paths rejected (`400`)
- `..` segments rejected after `path.normalize` (`400`)
- double-encoded traversal (`..%252F...`) rejected before normalize (`403`)
- extension whitelist: `.png` / `.jpg` / `.jpeg` / `.webp` / `.gif` (`415`)
- size cap: 8 MB (`413`)
- missing file: `404`
- response sets `Cache-Control: private, no-store` and
  `X-Content-Type-Options: nosniff`

In production (`ENABLE_LOCAL_FS_ROUTES != 'true'`) the route returns **404**
without touching the filesystem. A build-time snapshot of approved visuals
under `public/visuals/` remains a future option (Phase D2 follow-up).

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
- `SANITY_WRITE_TOKEN` (Phase 2B) is **opt-in** for the `/analytics`
  reactionNotes editor (2B-1) and the `/human-review-gates` +
  `/campaigns/[slug]` gate-state controls (2B-2). It is server-only (no
  `NEXT_PUBLIC_` prefix), must be an Editor-role token, and is paired with
  `ENABLE_WRITE_ACTIONS=true`. See
  [Phase 2B write actions](#phase-2b-write-actions). **Never set this on
  Vercel** (production / preview / development scopes).
- **Do not** add `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or any image-API key to
  this file.
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

## Phase 2B write actions

Phase 2B adds controlled Sanity write surfaces, one batch at a time. They
all share the same enablement env vars, the same fail-closed safety model,
and the same in-memory 10-second undo toast.

| Batch | Surface(s) | Mutation | Spec |
| --- | --- | --- | --- |
| **Phase 2B-1** | `/analytics` 反応ノート / 反応メモ待ち | Sanity: `campaignPlan.manualPublishingStatus[_key].reactionNotes` | [`docs/specs/phase-2b-1-reaction-notes.md`](../docs/specs/phase-2b-1-reaction-notes.md) |
| **Phase 2B-2** | `/human-review-gates`, `/campaigns/[slug]` 「確認ゲート」 tab (read-only) | Sanity: `campaignPlan.humanReviewGates[_key].state` (state enum only) | [`docs/specs/phase-2b-2-human-review-gates.md`](../docs/specs/phase-2b-2-human-review-gates.md) |
| **Phase 2B-3** | `/visual-assets/[assetId]/candidates` | Filesystem (via Visual Register CLI bridge): `assets/visuals/...`, `patches/visual-assets/...`, `review-manifest.json`. **No Sanity write** — that lives in Phase 2B-3.1. | [`docs/specs/phase-2b-3-visual-approve-register.md`](../docs/specs/phase-2b-3-visual-approve-register.md) |
| **Phase 2B-3.1** | `/visual-assets/[assetId]/candidates`, `/visual-assets/[assetId]` | Sanity: `visualAssetPlan.{localAssetPath, status, updatedAt, reviewNotes}` (exactly 4 fields, sourced from the Phase 2B-3 patch JSON at `patches/visual-assets/<slug>/<asset>.json`). | [`docs/specs/phase-2b-3-1-visual-asset-sanity-reflect.md`](../docs/specs/phase-2b-3-1-visual-asset-sanity-reflect.md) |

### Enablement (localhost only)

Add the relevant values to `dashboard/.env.local`:

```text
# Phase 2B-1 + 2B-2 + 2B-3.1 (Sanity writes)
ENABLE_WRITE_ACTIONS=true
SANITY_WRITE_TOKEN=<editor-role-token-from-sanity-manage>

# Phase 2B-3 + 2B-3.1 (filesystem reads, plus Phase 2B-3 file copy via CLI)
ENABLE_LOCAL_FS_ROUTES=true
```

- `SANITY_WRITE_TOKEN` must be an **Editor** role token, freshly issued from
  <https://sanity.io/manage> → API → Tokens. It is **separate** from
  `SANITY_READ_TOKEN`. Required for 2B-1 / 2B-2 / **2B-3.1**; not required
  for 2B-3 alone (file pipeline only).
- `ENABLE_LOCAL_FS_ROUTES=true` is required for 2B-3 and 2B-3.1 because both
  need to read repo-root files (the inbox for 2B-3, `patches/visual-assets/`
  for 2B-3.1). Production deploys keep it off.
- All env values are server-only (no `NEXT_PUBLIC_` prefix); Next.js never
  inlines them into the client bundle.
- Restart the dev server after editing `.env.local`.
- Phase 2B-3 additionally requires the Visual Register CLI to be running on
  `localhost:3334` before approve/register can fire. Start it with
  `npm run visual:register` from the repo root. The dashboard never
  spawns this CLI — it expects you to start it manually. Phase 2B-3.1
  does **not** need the CLI (it only reads the patch JSON file the CLI
  already produced).

### Vercel: never set these

Both `ENABLE_WRITE_ACTIONS` and `SANITY_WRITE_TOKEN` must be **absent** from
all Vercel scopes (production, preview, development). The runtime fail-closes
to read-only when either is missing: server actions return `write-disabled`
or `missing-token` before touching Sanity, and the editor / dropdown
controls render disabled.

### Safety layers (in order)

**Common to 2B-1 / 2B-2 (Sanity field writes)**

1. `enableWriteActions` env flag (cheapest reject path)
2. `SANITY_WRITE_TOKEN` env var presence
3. Hard input validation (regex / enum / length cap / `_rev` format)
4. `expectedRevision` is **required** — `_rev` mismatch returns `conflict`
   (no last-write-wins, no 3-way merge)
5. Server re-fetches the target doc and verifies the array item exists by
   `_key`, plus a per-surface invariant: Phase 2B-1 verifies the
   `manualPublishingStatus` `platform` matches; Phase 2B-2 verifies the
   `humanReviewGates` `state` matches the client's `currentState` and
   that the requested `(currentState, nextState)` is on the transition
   allow-list (defense-in-depth alongside the UI filter)
6. The patch touches a single array-element field
   (`humanReviewGates[_key=="<key>"].state` for 2B-2,
   `manualPublishingStatus[_key=="<key>"].reactionNotes` for 2B-1); nothing
   else, ever

**Phase 2B-3.1 additional layers (patch JSON → Sanity reflect)**

1. `enableWriteActions` env flag (shared)
2. `SANITY_WRITE_TOKEN` env var presence (Sanity write returns)
3. `enableLocalFsRoutes` env flag (we read `patches/visual-assets/...`)
4. Hard input validation: `visualAssetPlanId` regex
   (`^visualAssetPlan\.[a-z0-9][a-z0-9._-]+$`), `patchJsonPath` regex
   (`^patches/visual-assets/<slug>/<asset>\.json$`), `expectedRevision` regex
5. Patch JSON path allowlist + traversal rejection (mirrors the 2B-3
   pattern, applied to `patches/visual-assets/`)
6. Patch JSON shape validation: `_id` must equal the input
   `visualAssetPlanId`; `set` must contain exactly the 4 fields
   (`localAssetPath` / `status` / `updatedAt` / `reviewNotes`) all as
   strings; `meta.directSanityWrite` must be exactly `false`
7. `expectedRevision` required; server re-fetches and rejects on
   `_rev` mismatch (no last-write-wins)
8. Field allow-list at patch construction — the `set` object passed to
   `client.patch()` always contains exactly the 4 fields, never more
9. Post-write verification — refetch the doc and check the 4 fields
   actually match the patch JSON

**Phase 2B-3 additional layers (CLI bridge for file ops)**

1. `enableWriteActions` env flag (shared with 2B-1 / 2B-2)
2. `enableLocalFsRoutes` env flag (filesystem ops require this; production
   deploys keep it off)
3. Hard input validation: `assetId`, `campaignSlug`, `assetSlug`, candidate
   filename (`v\d+\.(png|jpg|jpeg|webp)$`), and full candidate relative path
4. Path allowlist: candidate must live under `assets/inbox/generated/`;
   absolute paths, `..` segments, and URL-encoded traversal (`%2e%2e`,
   `%2f`, `%5c`) are rejected
5. Visual Register CLI must be running on `localhost:3334` (the dashboard
   probes `/api/health` before any write). The dashboard **never** spawns
   the CLI itself — `npm run visual:register` is a boss-controlled step.
6. The endpoint URL is **hardcoded** (`http://localhost:3334/api/inbox/approve-and-register`).
   No env override, no DNS lookup, no remote hostnames.
7. Preview vs execute: `mode='preview'` runs validation only and returns a
   structured plan; `mode='execute'` is what calls the CLI. Existing-asset
   overwrite requires an explicit checkbox tick on the preview panel.
8. `tools/visual-register/server.mjs` is the file pipeline owner — it
   performs the `copyFile` + patch JSON write + manifest update inside a
   single handler. The dashboard never touches the filesystem directly.

### Phase 2B-2 state transitions

Schema is unchanged; the six values in
`schemas/campaignPlan.ts:humanReviewGates[].state` are the controlled
vocabulary. `approved` is operationally `done`; `rejected` is operationally
`blocked` (差し戻し) or `skipped` (放棄). The dropdown only offers the
following transitions (terminal targets prompt a confirm modal):

| From | Allowed targets |
| --- | --- |
| `not-started` (未着手) | `in-progress`, `pending-review`, `skipped`✱ |
| `in-progress` (作業中) | `pending-review`, `blocked`, `done`✱, `skipped`✱ |
| `pending-review` (レビュー待ち) | `in-progress`, `done`✱, `blocked`, `skipped`✱ |
| `blocked` (ブロック) | `in-progress`, `skipped`✱ |
| `done` (完了) | (terminal — reopen via Studio) |
| `skipped` (スキップ) | (terminal — reopen via Studio) |

✱ = confirm modal. Undo (10s, in-memory) bypasses the allow-list because
the reverse patch is intentional.

### Out of scope

- Auto-post (X / note / Substack / Threads) — never
- `publish-package/` mutation — owned by `tools/publish-package-builder/`
- Sanity schema changes — none
- Audit-log document schema — deferred (Phase 2B uses in-memory undo +
  server `console.log` for local debugging only)
- Automatic devlog generation — manual `docs/devlog/` commits remain the
  source of truth
- Reviewer / notes / completedAt editing on gates — Phase 2B-2.1 candidate
- Sanity `visualAssetPlan.status` reflection after register — **implemented
  in Phase 2B-3.1** (4 fields only; the dashboard reads the patch JSON
  produced by Phase 2B-3 and applies it to Sanity via a separate server
  action, never creating new docs)
- Auto-trigger of `npm run publish:package` after register — Phase 2B-3.2
  candidate (the 2B-3 success panel surfaces the command instead)
- Multi-candidate / batch approve — Phase 2B-3.2 candidate (2B-3 is
  strictly one candidate per transaction)
- Full reimplementation of Visual Register inside the dashboard — option B,
  not selected; `tools/visual-register/server.mjs` remains the file
  pipeline owner

## Develop locally

```bash
npm run dev
# Open http://localhost:3000
```

Routes (23 total, page routes + API routes; all fidelity-aligned):

**Main surface (Sidebar nav):**

| Path | Source | Purpose |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | ダッシュボード — KpiCardsRow + lifecycle + today's tasks + recent outputs |
| `/campaigns` | `src/app/campaigns/page.tsx` | キャンペーン list — table + KPI row |
| `/campaigns/[slug]` | `src/app/campaigns/[slug]/page.tsx` | Campaign Detail — page-local sections + Tabs (8 panels) |
| `/configurator` | `src/app/configurator/page.tsx` | 出力コンフィギュレーター — ideacopy + prompt builder + previews |
| `/outputs` | `src/app/outputs/page.tsx` | 出力管理 — FilterBar + OutputsTable + breakdown |
| `/publish` | `src/app/publish/page.tsx` | 公開管理 — `?slug=` aware, derives default from `campaignListQuery` |
| `/publish-package/[slug]` | `src/app/publish-package/[slug]/page.tsx` | Copy-friendly per-platform publish UI (boss-protected layout) |
| `/visual-assets` | `src/app/visual-assets/page.tsx` | 図解レビュー list — FilterBar + AssetCardGrid; thumbs via `/api/asset-thumb` when enabled |
| `/visual-assets/[assetId]` | `src/app/visual-assets/[assetId]/page.tsx` | Asset detail with PlanMetadata / FilePaths / Actions |
| `/visual-assets/[assetId]/candidates` | `src/app/visual-assets/[assetId]/candidates/page.tsx` | Candidate focus layout with thumb strip |
| `/knowledge` | `src/app/knowledge/page.tsx` | ナレッジDB — Tabs across contentIdea / brandProfile / visualStyleProfile / promptTemplate |
| `/analytics` | `src/app/analytics/page.tsx` | アナリティクス — platform performance + reaction notes (page-side aggregation) |
| `/settings` | `src/app/settings/page.tsx` | 設定 — workspace + feature flags + safety posture |

**Dev-only utility surface:**

| Path | Source | Purpose |
| --- | --- | --- |
| `/human-review-gates` | `src/app/human-review-gates/page.tsx` | 確認待ちゲート — pending gates aggregated across all campaigns |
| `/publish-packages` | `src/app/publish-packages/page.tsx` | 公開パッケージ一覧 — filesystem walk; **404 when `ENABLE_LOCAL_FS_ROUTES != 'true'`** |
| `/activity-log` | `src/app/activity-log/page.tsx` | 作業ログ — `fs` mode reads docs/ live, `snapshot` reads `public/activity-snapshot.json` |
| `/diagnostics` | `src/app/diagnostics/page.tsx` | 診断 — runs `npm run local:check`; **404 when `ENABLE_DIAGNOSTICS != 'true'`** |

**API routes (all dev-only):**

| Path | Source | Purpose |
| --- | --- | --- |
| `/api/asset-thumb` | `src/app/api/asset-thumb/route.ts` | Two-prefix safe image streaming (`assets/visuals/` + `assets/inbox/generated/`); **404 when `ENABLE_LOCAL_FS_ROUTES != 'true'`** |
| `/api/visual-review/inbox` | `src/app/api/visual-review/inbox/route.ts` | Inbox listing for Visual Review |
| `/api/visual-review/candidate-image` | `src/app/api/visual-review/candidate-image/route.ts` | Inbox candidate image streaming |
| `/api/visual-review/review-manifest` | `src/app/api/visual-review/review-manifest/route.ts` | Per-campaign review manifest |
| `/api/visual-review/assets/[assetId]/candidates` | `src/app/api/visual-review/assets/[assetId]/candidates/route.ts` | Asset-scoped candidate bundle |

Plus a Next.js `/_not-found` page is auto-generated.

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

Read-only surface across the Hitori Media OS lifecycle (Idea → Structured →
Draft → Review → Published → Learning):

- Renders `campaignPlan`, `contentIdea`, `brandProfile`, `visualStyleProfile`,
  `promptTemplate`, `visualAssetPlan`, and `platformOutput` documents via the
  Sanity client (`@sanity/client` v7, `useCdn: true` when no read token).
- Dereferences string-ID joins for `requiredVisualAssets[].visualAssetPlanId`
  and `promptTemplateSelections[].promptTemplateId` using GROQ
  `*[_id == ^.X][0]` (not the `->` arrow, because those fields are strings).
- Aggregates `manualPublishingStatus[]` across campaigns for `/analytics`,
  `/publish`, and the Home page (page-side aggregation; no new GROQ added in
  fidelity work).
- Reads inbox candidates (`assets/inbox/generated/<campaign>/<asset>/v00N.png`)
  via `src/lib/inboxReader.ts` and `src/lib/visualAssets/inboxLookup.ts` —
  dev-only, gated by `ENABLE_LOCAL_FS_ROUTES`.
- Links out to:
  - Sanity Studio document (deep link via `studioDocumentUrl`)
  - Visual Register at `http://localhost:3334`
  - `/diagnostics` / `/activity-log` / `/publish-packages` (dev-only routes)

## Current operating model

- **Local-first.** All write surfaces (Sanity Studio, Visual Register, Codex
  CLI) run on `localhost`. The dashboard never reaches a network boundary
  other than Sanity reads.
- **No auto-post.** No code in this dashboard posts to X / Threads / note /
  Substack. The `auto-post: never` chip on `/settings` is a deliberate
  design statement, not an aspiration.
- **No uncontrolled Sanity writes.** No `mutate`, `patch`, or `transaction`
  call lives in the dashboard. The only Sanity writes happen via the
  repo-root `tools/sanity/reflect-*.mjs` scripts (controlled atomic write
  pattern with dry-run + execute stages).
- **`/publish-package/[slug]` copy-friendly behavior is preserved.** The 740-
  line worker UI is boss-protected; only ReadOnlyBanner-style cleanup has
  ever touched it.
- **Phase 2B write actions are future work.** Approve & register, regenerate
  prompt, reactionNotes editing, campaign edit, and any auth-related
  surface remain unimplemented. Disabled placeholder buttons exist on
  multiple pages with explicit "Phase 2B" tooltips.

## Completed UI fidelity history

- **Phase UI-fidelity-1〜11 all completed.** The cycle moved every Sidebar
  nav target plus utility routes onto a shared `PageHeader` + `Breadcrumb`
  + `KpiCard` + design system baseline. See
  [docs/68](../docs/68-hitori-media-os-ui-design-system.md) and
  [docs/69](../docs/69-dashboard-ui-redesign-implementation-plan.md).
- **23 routes are now fidelity-aligned**, including the dev-only utility
  routes (`/publish-packages`, `/activity-log`, `/diagnostics`) and the
  long-tail placeholders (`/knowledge`, `/analytics`, `/settings`).
- **14 old components were deleted** across two cleanup cycles:
  - ReadOnlyBanner cycle (6 files: AppNav, EmptyCandidateState, plus the
    pre-fidelity SummaryCard / SectionHeader / EmptyState / FilePathBlock
    family and ReadOnlyBanner itself)
  - Phase Admin 1 Batch A/B/C cycle (8 files: CampaignStatusCard,
    NextActionChecklist, WorkingPipelineStatus, PublishReadinessBoard,
    SelectedPlatformChips, HumanReviewGateList, VisualAssetStatusTable,
    PromptTemplateSummary, PublishPackageLinks, ManualPublishingStatusList,
    ReleaseReviewLinks, NextActionSummary). Half were deleted directly;
    the rest required the `/campaigns/[slug]` deep refactor first.
- **Phase Admin 1 legacy component cleanup is complete.** Nothing under
  `src/components/` carries forward Phase Admin 1 Batch A/B/C
  single-purpose pre-fidelity components.
- The full chronological trail lives in `docs/devlog/` and `docs/handoff/`.
  Most recent: [docs/handoff/latest.md](../docs/handoff/latest.md).

## What this dashboard intentionally does NOT do

- Does **not** allow editing any record (no Sanity writes, no `mutate`,
  no `patch`, no `transaction`).
- Does **not** carry a Sanity write token. Only a read-only token belongs
  in `.env.local`.
- Does **not** call OpenAI / Anthropic / any paid image API.
- Does **not** trigger AI generation, candidate image generation, or
  publish-package distribution. Use the existing tools at the repo root
  (Visual Register, `npm run publish:package`, `codex exec`, etc.).
- Does **not** post to X / Threads / note / Substack.
- Does **not** provide application-level authentication. Run on `localhost`
  by default, or front it with the Basic Auth proxy in `src/proxy.ts` for
  preview/production deploys.

## Tech stack

- Next.js 16 App Router (Turbopack by default)
- React 19.2
- TypeScript 5
- Tailwind CSS v4
- `@sanity/client` v7 (read-only, CDN)

## Project layout

```
dashboard/
├── README.md                          # this file
├── .env.local                         # (you create this; gitignored)
├── package.json
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── public/
│   └── activity-snapshot.json         # built by npm run build:activity-snapshot
├── scripts/
│   └── build-activity-snapshot.mjs    # writes public/activity-snapshot.json
└── src/
    ├── app/                           # 23 routes — see "Routes" table above
    │   ├── layout.tsx                 # mounts <AppShell>
    │   ├── page.tsx                   # ダッシュボード Home
    │   ├── campaigns/
    │   │   ├── page.tsx
    │   │   └── [slug]/page.tsx        # detail (page-local sections after UI-fidelity-11)
    │   ├── configurator/page.tsx
    │   ├── outputs/page.tsx
    │   ├── publish/page.tsx
    │   ├── publish-package/[slug]/page.tsx   # boss-protected copy-friendly UI
    │   ├── visual-assets/
    │   │   ├── page.tsx
    │   │   └── [assetId]/
    │   │       ├── page.tsx
    │   │       └── candidates/page.tsx
    │   ├── knowledge/page.tsx
    │   ├── analytics/page.tsx
    │   ├── settings/page.tsx
    │   ├── publish-packages/page.tsx          # dev-only, ENABLE_LOCAL_FS_ROUTES
    │   ├── activity-log/page.tsx              # dev-only
    │   ├── diagnostics/page.tsx                # dev-only, ENABLE_DIAGNOSTICS
    │   ├── human-review-gates/page.tsx
    │   └── api/
    │       ├── asset-thumb/route.ts            # two-prefix safe image streaming
    │       └── visual-review/
    │           ├── inbox/route.ts
    │           ├── candidate-image/route.ts
    │           ├── review-manifest/route.ts
    │           └── assets/[assetId]/candidates/route.ts
    ├── components/
    │   ├── CopyButton.tsx                      # clipboard with textarea fallback
    │   ├── StatusBadge.tsx                     # shared semantic badge
    │   ├── app-shell/                          # AppShell + Sidebar + Topbar + ReadOnlyPill + QuickCreateButton + PhasePlaceholder
    │   ├── common/                             # PageHeader / Breadcrumb / KpiCard / KpiCardsRow / LifecyclePipeline / PlatformBadge / Tabs (fidelity baseline)
    │   ├── campaign/                           # NextActionList / PublishReadinessScore / PublishingScheduleTable (campaign-detail fidelity widgets)
    │   ├── dashboard/                          # Home-page cards (ActiveCampaignsCard / ContentOutputConfiguratorCard / EngagementPlaceholder / LearningInsightsCard / RecentOutputsTable / TodayTasksCard)
    │   ├── configurator/                       # ConfiguratorForm + ~10 cards (PromptSummary / Deliverables / etc.)
    │   ├── outputs/                            # OutputsFilterBar / OutputsTable / OutputsView / PlatformBreakdownCard
    │   ├── publish/                            # CampaignSwitcher / ChannelsGrid / IncludedAssetsTable / PackageHeroCard / PostPublishMonitoringCard + more
    │   ├── visual-review/                      # AssetCard / AssetCardGrid / AssetPreviewCard / BigPreviewCard / Candidate* / DeferredActionButton / LocalModeBanner / etc.
    │   ├── knowledge/                          # KnowledgeView (Tabs wrapper) + ContentIdeaCardGrid / BrandList / StyleList / PromptTemplateTable
    │   ├── analytics/                          # PlatformPerformanceCard / CampaignAnalyticsTable / ReactionNotesCard / PendingMonitoringCard / FutureIntegrationCard / LearningInsightsCard
    │   └── settings/                           # WorkspaceCard / FeatureFlagsCard / LocalDevCard / SafetyReadOnlyCard / GenerationSettingsCard / PublishingSettingsCard / FutureIntegrationsCard
    ├── lib/
    │   ├── sanity.ts                           # read-only Sanity client + sanityConfig + studioDocumentUrl
    │   ├── featureFlags.ts                     # ENABLE_DIAGNOSTICS / ENABLE_LOCAL_FS_ROUTES / ACTIVITY_LOG_MODE / isProductionRuntime
    │   ├── navigation.ts                       # Sidebar NAV_ITEMS + active key resolver
    │   ├── repoRoot.ts                         # safe repo path helper for fs reads
    │   ├── inboxReader.ts                      # asset/inbox/generated/ readers (slug-safe, prefix-locked)
    │   ├── publishPackageReader.ts             # publish-packages/<platform>/<campaign>/ readers
    │   ├── frontmatter.ts                      # tiny YAML frontmatter parser used by inbox + activity-log
    │   ├── assetRoleJa.ts                      # asset slug → Japanese role label
    │   ├── statusJa.ts                         # status enum → Japanese label
    │   ├── campaign/
    │   │   └── nextActions.ts                  # computeNextActions helper (moved from old NextActionSummary in UI-fidelity-11)
    │   ├── configurator/
    │   │   ├── options.ts                      # form value types + option lists
    │   │   └── promptBuilder.ts                # buildPrompt + normalizeTextList
    │   ├── visualAssets/
    │   │   ├── buckets.ts                      # VisualBucket helpers
    │   │   └── inboxLookup.ts                  # lightweight inbox lookups (no YAML parse)
    │   └── groq/
    │       ├── campaign.ts                     # campaignList / campaignDetail / dashboardHome / visualAssetPlan / pendingHumanReviewGates
    │       ├── configurator.ts                 # configuratorOptionsQuery (contentIdea + brand + style + promptTemplate)
    │       ├── outputs.ts                      # outputsListQuery + buildOutputRows
    │       └── publishPackage.ts               # publish-package state + helpers
    └── proxy.ts                                # Basic Auth proxy (Next.js 16 file convention)
```

Notes:

- `src/components/` no longer contains any Phase Admin 1 Batch A/B/C
  pre-fidelity component. The 14 deleted files (CampaignStatusCard,
  NextActionChecklist, WorkingPipelineStatus, PublishReadinessBoard,
  SelectedPlatformChips, HumanReviewGateList, VisualAssetStatusTable,
  PromptTemplateSummary, PublishPackageLinks, ManualPublishingStatusList,
  ReleaseReviewLinks, NextActionSummary, EmptyCandidateState, AppNav,
  plus the old SummaryCard / SectionHeader / EmptyState / FilePathBlock /
  ReadOnlyBanner / VisualAssetHeader / CandidateGrid / CandidateCard /
  CandidatePreview / CandidateStatusBadge family — counts vary by how
  you slice it; ~20 component files are gone in total) have been
  superseded by `common/`, `campaign/`, the per-page subdirs, and inline
  page-local sections.
- A handful of files retain comment-only "moved from X" or "replaces X"
  migration breadcrumbs (e.g. `lib/campaign/nextActions.ts` and
  `components/campaign/NextActionList.tsx` mention the old
  `NextActionSummary`). These are intentional grep-aids for anyone reading
  older PRs or docs and are not picked up by the build.

## Related docs (at repo root)

- [docs/56-admin-dashboard-architecture.md](../docs/56-admin-dashboard-architecture.md) — IA + screen plan
- [docs/57-hitorimedia-domain-app-plan.md](../docs/57-hitorimedia-domain-app-plan.md) — root vs app subdomain plan
- [docs/58-admin-dashboard-phase-plan.md](../docs/58-admin-dashboard-phase-plan.md) — Phase Admin 0–4 roadmap
- [docs/59-admin-phase-1-implementation-plan.md](../docs/59-admin-phase-1-implementation-plan.md) — Batch A–D spec

## Next work candidates

Phase Admin 1 Batches A → D2 all landed long ago. After the UI-fidelity
cycle the visible roadmap is roughly:

- **Phase 2B — write actions** (the largest item). Spec + implementation
  for the disabled placeholder buttons spread across the app:
  - Approve & register a visual candidate (currently done in
    Visual Register CLI)
  - Regenerate prompt for a candidate
  - Mark a candidate / asset as needs-regeneration
  - Edit `manualPublishingStatus[].reactionNotes` directly
  - Edit a campaign (Studio is the only write path today)
  - Sanity controlled-write tooling integration (the
    `tools/sanity/reflect-*.mjs` pattern already exists)
- **Tabs integration P1 for `/campaigns/[slug]`.** Today there are 8
  tabs; a further consolidation to ~5-6 (Source / Status / Generation /
  Distribution / External) is a P1 polish opportunity. Tracked in
  [docs/81](../docs/81-campaign-detail-deep-refactor-spec.md) §4 P1.
- **promptTemplate dataset insertion.** `/configurator` and `/knowledge`
  both already render a `promptTemplate` list/table, but the dataset is
  empty so they show empty states. Boss-side data-entry task; once a
  handful of templates exist the surface lights up.
- **External analytics API integration.** Phase Analytics-2 — Plausible /
  GA / X API / note 統計 / Substack 統計. `/analytics` currently shows
  a placeholder card listing the planned integrations.
- **`DeferredActionButton` cleanup.** When Phase 2B write actions land,
  the disabled-with-tooltip buttons across `/visual-assets/*`,
  `/publish`, and `/campaigns/[slug]` should be replaced with the real
  actions. `DeferredActionButton` itself can then be deleted.
- **`LocalModeBanner` cleanup.** When Phase D2's build-time snapshot
  strategy for `assets/visuals/` lands, the "local mode" banner on
  `/visual-assets/*` becomes obsolete.
- **Optional polish:** historical comment breadcrumbs (e.g. "replaces old
  AppNav", "moved from NextActionSummary") can be trimmed once the
  Phase 2B work makes the migration story irrelevant. They're harmless
  today.
