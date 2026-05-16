# 61 — Admin Phase 1 Batch D2: Vercel Setup (human steps)

Date: 2026-05-15
Status: **ready-for-human-deploy**, no deploy executed yet

This doc lists the **exact manual steps** a human runs to bring the dashboard
up at `app.hitorimedia.com`. Claude Code prepared the code (proxy / feature
flags / asset-thumb / activity snapshot / README), but Vercel project creation,
env value entry, and DNS changes are intentionally manual.

Prereqs (already done by earlier batches):

- [docs/60-admin-phase-1-batch-d-deploy-plan.md](60-admin-phase-1-batch-d-deploy-plan.md) — overall design
- [docs/handoff/0114](handoff/0114-admin-phase-1-batch-d1-flags-thumbs-snapshot.md) — Batch D1 (flags + thumb + snapshot)
- `dashboard/src/proxy.ts` — Basic Auth proxy (Batch D2)
- `dashboard/public/activity-snapshot.json` — committed snapshot used in production mode

> **Do not** disclose values for `SANITY_READ_TOKEN` or
> `ADMIN_BASIC_AUTH_PASSWORD` in this doc, in PRs, or in screenshots. Keep them
> in Vercel's encrypted env-var store only.

---

## A. Refresh the activity snapshot (before pushing)

The dashboard ships `public/activity-snapshot.json`. It's a generated file
committed to git on purpose: Vercel's "Root Directory: dashboard/" setting
excludes `docs/devlog/` and `docs/handoff/` from the build context, so a
build-time snapshot script would silently produce an empty result.

Run before every deploy push:

```bash
cd dashboard
npm run build:activity-snapshot
# Stage and commit public/activity-snapshot.json with the rest of the deploy.
```

If you forget, `/activity-log` in production will keep showing the previous
snapshot until the next push.

---

## B. Create the Vercel project

Open <https://vercel.com/new> and import the repository.

| Setting | Value |
| --- | --- |
| Framework Preset | **Next.js** |
| Root Directory | **`dashboard/`** |
| Build Command | `npm run build` (default) |
| Install Command | `npm install` (default) |
| Output Directory | `.next` (default) |
| Node.js Version | 20.x or later (Next.js 16 minimum is Node 20.9) |
| Production Branch | `main` |

After import, **do not** click Deploy yet — set env vars and the domain
first, otherwise the first build will deploy without protection.

---

## C. Environment variables

In **Project Settings → Environment Variables**, add each entry below for
**Production**, **Preview**, and **Development** scopes (you can paste once
and tick all three boxes per Vercel UI).

### Public Sanity config

| Key | Value | Scope |
| --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `5f79ed6q` | Production, Preview, Development |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` | Production, Preview, Development |
| `NEXT_PUBLIC_SANITY_API_VERSION` | `2025-08-15` | Production, Preview, Development |

### Sanity read token (server-only)

| Key | Value | Scope |
| --- | --- | --- |
| `SANITY_READ_TOKEN` | *paste the Viewer token created at <https://sanity.io/manage> → project `5f79ed6q` → API → Tokens. Do not commit, do not share in chat.* | Production, Preview, Development |

### Basic Auth credentials

Generate a long random password (e.g.
`openssl rand -base64 24 | tr -d '/+=' | head -c 24`) and pick a short
username:

| Key | Value | Scope |
| --- | --- | --- |
| `ADMIN_BASIC_AUTH_USER` | *your chosen short username* | Production, Preview |
| `ADMIN_BASIC_AUTH_PASSWORD` | *long random password* | Production, Preview |

Leave both **unset for Development scope** so `npm run dev` on your laptop
stays friction-free. The proxy passes traffic through when either variable
is missing.

### Production-safe feature flags

| Key | Value | Scope |
| --- | --- | --- |
| `ENABLE_DIAGNOSTICS` | `false` | Production, Preview |
| `ENABLE_LOCAL_FS_ROUTES` | `false` | Production, Preview |
| `ACTIVITY_LOG_MODE` | `snapshot` | Production, Preview |

These mirror the defaults baked into [`src/lib/featureFlags.ts`](../dashboard/src/lib/featureFlags.ts),
so even if you forget to set them the dashboard stays safe. Setting them
explicitly is belt-and-suspenders.

### What **NOT** to set

- `SANITY_WRITE_TOKEN` — Phase Admin 1 stays read-only.
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` — paid LLM/image APIs aren't used.
- Any other Sanity token type (Deploy Studio, Editor, etc).

---

## D. Add the domain

In **Project Settings → Domains**:

1. Add `app.hitorimedia.com`.
2. Vercel will display one of:
   - **CNAME** pointing to `cname.vercel-dns.com` (subdomain configuration)
   - or **A/AAAA** records for `76.76.21.21` / IPv6 equivalent.
3. Open your domain registrar's DNS panel, add the record Vercel showed, save.
4. Back in Vercel, wait for the green check next to the domain (5–30 min for
   propagation). Vercel will provision the TLS certificate automatically.
5. The root `hitorimedia.com` stays parked at the registrar for now;
   `app.hitorimedia.com` is the only entry that points at Vercel in Batch D2.

---

## E. First deploy

1. From Vercel UI → **Deployments → Redeploy** the latest commit, **or** push
   a fresh commit to `main` after running
   `npm run build:activity-snapshot` and committing the regenerated snapshot.
2. Watch the build log. Confirm:
   - the framework auto-detected as Next.js 16,
   - the build does **not** print `SANITY_READ_TOKEN` or
     `ADMIN_BASIC_AUTH_PASSWORD` values,
   - it succeeds in under ~2 minutes.

> If the build does print a token value, stop and rotate the token before
> trying again. Vercel's default behavior is to mark env vars as encrypted
> secrets — a leak would point at a custom build step or a
> `console.log(process.env)` somewhere. Neither exists in our codebase, but
> always verify after the first deploy.

---

## F. Post-deploy verification (do these in Batch D3 as well)

Open `https://app.hitorimedia.com/` in an incognito window:

1. Browser shows the Basic Auth prompt. Cancel → see a 401 page.
2. Enter the username/password you set. The dashboard renders.
3. Re-test from a separate device/network: same prompt, same credentials.
4. Visit each public-safe route:
   - `/` (Dashboard Home, NextActionSummary visible)
   - `/campaigns` (list, building-hitori-media-os present)
   - `/campaigns/building-hitori-media-os` (detail)
   - `/human-review-gates`
   - `/visual-assets` (no thumbnails, "Thumbnails are disabled" banner)
   - `/activity-log` (mode shows `snapshot`, devlog and handoff entries listed)
5. Visit the dev-only routes — each must return **404**:
   - `/diagnostics`
   - `/publish-packages`
6. Curl the asset-thumb route, must return **404** (with valid auth):
   ```bash
   curl -u admin:password -i \
     "https://app.hitorimedia.com/api/asset-thumb?path=assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png"
   # → HTTP/2 404
   ```
7. View source on `/`, search for `SANITY_READ_TOKEN`, `OPENAI_API_KEY`,
   `BASIC_AUTH_PASSWORD` — must return zero matches.
8. Open `/sitemap.xml` and `/_next/static/chunks/*` directly (no auth header):
   the static-asset matcher exclusions are working if these return 200/404
   without prompting for credentials.

These steps are repeated and formalized in Batch D3.

---

## G. Operational notes

- **Rotating the Basic Auth password**: change `ADMIN_BASIC_AUTH_PASSWORD`
  in Vercel env, redeploy. Browsers cache Basic Auth credentials per realm;
  to force a re-prompt, increase the realm name (e.g. `"Hitori Media OS
  Admin v2"`) when rotating.
- **Rotating `SANITY_READ_TOKEN`**: generate a new viewer token in Sanity
  manage, swap it into Vercel env, redeploy. Revoke the old token.
- **Adding a second person**: Basic Auth supports one user/pass pair from
  this proxy. For multi-user we move to Phase Admin 2's real auth.
- **Local dev still works**: leave `ADMIN_BASIC_AUTH_*` unset in
  `dashboard/.env.local` so `npm run dev` skips auth entirely.

---

## H. Things that intentionally stay out of scope here

- Multi-user auth / SSO (Phase Admin 2).
- Public site at the root `hitorimedia.com` (separate Vercel project, later).
- Sanity write tokens, image-generation APIs, auto-posting — all permanently
  out of Phase Admin 1.
- `/diagnostics` `/publish-packages` `/api/asset-thumb` in production —
  feature flags keep them 404 by design.

---

## I. Next batch

After the first successful deploy, run through the **Batch D3 verification
checklist** (post-deploy audit: HTTP, nav links, cookies, headers, secrets).
That is the work covered by [docs/handoff/0115](handoff/0115-admin-phase-1-batch-d2-basic-auth-vercel-setup.md)
§"Next batch".
