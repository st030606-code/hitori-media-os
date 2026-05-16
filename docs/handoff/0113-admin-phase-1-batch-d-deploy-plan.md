# Handoff: Admin Phase 1 — Batch D Deploy Plan (design only)

Date: 2026-05-15
Status: **design-only / no-vercel-project / no-dns-change / no-middleware-code / no-env-set / batch-d1-d2-d3-spec-ready**

## 1. Task Goal

dashboard を localhost-only から `app.hitorimedia.com` の preview deploy へ
移すために必要な選択を **deploy 前に 1 doc で確定**する。実装はしない。後続
Batch D1 / D2 / D3 で順番に着地させる。

## 2. Constraints Followed

- deploy していない（Vercel project 0 / DNS 変更 0 / middleware 実装 0 / env 入力 0）
- `schemas/` / `structure/` / `sanity.config.ts` / `tools/` を変更していない
- Auth 実装を本バッチで追加していない（推奨方針のみ記述）
- Sanity write token / mutation を追加していない
- OpenAI / Anthropic / paid image API クライアント追加 0
- auto-postingを実装していない
- `assets/visuals/...` / `patches/...` / `assets/inbox/` を変更していない
- 画像生成 0
- 既存 8 route を破壊していない（dashboard コードは未変更）
- root `npm run build`（Sanity Studio）green 維持

## 3. Changed Files

### Added

- `docs/60-admin-phase-1-batch-d-deploy-plan.md`（12 節の design doc）
- `docs/devlog/0102-admin-phase-1-batch-d-deploy-plan.md`
- `docs/handoff/0113-admin-phase-1-batch-d-deploy-plan.md`

### Modified

- `docs/handoff/latest.md`（本 0113 にミラー）
- `dashboard/README.md`（Next batches セクションに docs/60 への pointer 1 行）

### Confirmed unchanged

- `schemas/` 全件 / `sanity.config.ts` / `structure/index.ts` / `tools/`
- root `package.json` / `package-lock.json`
- dashboard `package.json` / `package-lock.json` / `src/**` / `public/**`
- 既存 seed / outputs / publish-packages / private / ai-blog-db 関連
- `assets/visuals/` / `patches/` / `assets/inbox/`
- DNS / hosting / Auth: 触れていない

## 4. Summary of Decisions

### A. 推奨 hosting provider — **Vercel**

Cloudflare Pages / Fly.io と比較し Vercel を採用:

- Next.js 16 + Turbopack 親和性が最も高い
- env vars を Production / Preview / Development で別 scope に分けやすい
- managed cert / custom domain が Hobby Free でも使える
- Pro 契約時は Password Protection も 1 click
- public site `hitorimedia.com` を別途立てるときも揃えやすい

詳細比較は [docs/60 §3](../60-admin-phase-1-batch-d-deploy-plan.md#3-hosting-provider-選定) 参照。

### B. Dev-only routes の production 挙動

| Route | Production | localhost |
| --- | --- | --- |
| `/diagnostics` | **disabled (404)** when `ENABLE_DIAGNOSTICS != "true"` | enabled (`ENABLE_DIAGNOSTICS=true`) |
| `/publish-packages` | **disabled (404)** when `ENABLE_LOCAL_FS_ROUTES != "true"` | enabled |
| `/activity-log` | **snapshot mode**（`docs/devlog/` + `docs/handoff/` を build 時に JSON 化、`public/activity-snapshot.json` を読む） | fs mode（実 fs walk） |

AppNav は flag に応じて link 表示 / 非表示。

### C. Thumbnail support — `/api/asset-thumb`

- spec を [docs/60 §5](../60-admin-phase-1-batch-d-deploy-plan.md#5-thumbnail-supportapiasset-thumb) で確定
- production default: **404**（`ENABLE_LOCAL_FS_ROUTES != "true"`）
- localhost: `assets/visuals/...` 配下のみ、ext 白名簿（png/jpg/jpeg/webp/gif）、size cap 8MB、`..` traversal reject、prefix 制限
- production で thumbnail を見せたい場合は将来 build-time snapshot（採用済み visual のみ `public/visuals/` に copy）を Batch D2 で再評価

### D. Auth 推奨

| 状況 | 推奨 |
| --- | --- |
| Vercel Pro 契約あり | Vercel Password Protection（1 click） |
| Vercel Hobby Free（典型） | **Next.js middleware Basic Auth**（推奨デフォルト） |
| 将来 multi-user | Phase Admin 2 で本物の Auth provider（別 design） |

Spec: `middleware.ts` で `ADMIN_BASIC_AUTH_USER` / `ADMIN_BASIC_AUTH_PASSWORD` env を要求、未設定なら素通り（localhost）。詳細 [docs/60 §6](../60-admin-phase-1-batch-d-deploy-plan.md#6-auth--protection-推奨)。

### E. DNS / domain

- `hitorimedia.com` = public site（後で別途、本バッチ scope 外）
- **`app.hitorimedia.com` = admin dashboard**（Vercel project に CNAME / A）
- Vercel managed certificate（HTTPS 自動）
- root ドメインは取得元 DNS に保持、`app.` だけ Vercel に向ける

### F. 環境変数戦略

**必須**:

```text
NEXT_PUBLIC_SANITY_PROJECT_ID=5f79ed6q
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-08-15
SANITY_READ_TOKEN=<viewer-token>     # server-only
```

**任意（Auth）**:

```text
ADMIN_BASIC_AUTH_USER=<short>
ADMIN_BASIC_AUTH_PASSWORD=<long-random>
```

**任意（feature flags）**:

```text
ENABLE_DIAGNOSTICS=false            # production default
ENABLE_LOCAL_FS_ROUTES=false        # production default
ACTIVITY_LOG_MODE=snapshot          # snapshot | fs
```

**禁止**: `SANITY_WRITE_TOKEN` / `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / その他 paid LLM・画像 API key。

### G. Follow-up batches

| Batch | 内容 | 状態 |
| --- | --- | --- |
| D1 | feature flags 実装 + AppNav link 制御 + `/api/asset-thumb` route handler + activity snapshot script + `/activity-log` の flag 切替 | **次バッチ** |
| D2 | Vercel project 作成 + env vars 設定 + middleware Basic Auth + 初回 preview deploy + DNS（`app.hitorimedia.com`） | D1 後 |
| D3 | post-deploy verification checklist（HTTP status / nav 表示 / cookie / Auth header / DNS cert / secret 漏れ） | D2 後 |

### H. Validation Results

- root `npm run build` (Sanity Studio): ✓ green
- root `npm run local:check`: ✓ 17/17
- dashboard `npm run build`: ✓ 既存 9 routes 不変
- direct Sanity write の grep: 0 hits（不変）
- paid LLM / image API SDK の grep: 0 hits（不変）
- `assets/visuals/` / `patches/` / 既存 dataset / publish-packages 内容: 不変

## 5. Important Decisions

- **deploy しない、design batch を 1 つ挟む**: 「dev で動いた」と「production で動く」の間にある dev-only routes / Auth / DNS / cert の選択肢を 1 doc で確定
- **dev-only routes は flag で disable する**: serverless runtime に存在しない依存（npm / fs）に依存する route を production で動かさない方針
- **`/activity-log` だけは production でも見せる**: snapshot 経路で。boss が deploy 後の dashboard でも変更履歴を辿れる
- **Auth は middleware Basic Auth がデフォルト**: Hobby Free でも回せる、Pro なら Password Protection に切替可
- **thumbnail handler の spec を完全に書き切る**: path normalize / prefix / ext / size cap / 404 / 403 / 413 / 415 を 1 ヶ所で
- **Vercel project は同 repo の `dashboard/` subdir で build**: Phase Admin 1 では別 repo にしない（同期 cost を最小に）

## 6. Human Review Questions

- Vercel Hobby Free で進めるか、Pro 契約済みなら Password Protection に切替えるか？
- middleware Basic Auth の `ADMIN_BASIC_AUTH_USER` / `ADMIN_BASIC_AUTH_PASSWORD` の値は **deploy 直前に人間が Vercel UI で設定** する想定で良いか？（Claude Code は `.env*` を書けないが、Vercel CLI / UI 経由なら可能）
- `/activity-log` snapshot の excerpt は **title + status + date + 100 char** で十分か、もっと欲しいか？
- thumbnail を production でも見せる必要があるか？（「ない」が現状の前提）
- `app.hitorimedia.com` の DNS 切替は誰が（人間 / Claude Code）どこで行うか？ Vercel UI の指示通り、ドメイン購入元の管理画面でレコード追加する手順だけ Claude Code が支援する想定で良いか？

## 7. Risks or Uncertainties

- **Vercel build context に repo root の docs / publish-packages を含めない設定**: Vercel project の Root Directory を `dashboard/` に設定すれば自動的に含まれない。snapshot script が build 時に親 dir を読む場合は Root Directory を repo root にしないと届かない。Batch D1 で明確化する。
- **middleware の matcher で `_next/static` を除外する書式**: Next.js 16 で動作するか確認必要（Batch D2 着手時、`node_modules/next/dist/docs/` で確認）
- **Vercel の `SANITY_READ_TOKEN` を Preview と Production の両 scope に設定する必要**: ブランチ deploy も Auth + token 必要。Batch D2 で人間が UI で設定する手順
- **DNS の TTL / 反映**: `app.hitorimedia.com` の CNAME 設定後、5〜30 分の伝播時間を見越して deploy → DNS → verify の順序を Batch D2 で踏む
- **dashboard の `next.config.ts` の `turbopack.root` が build context と整合するか**: `path.resolve(__dirname)` を pin しているが、Vercel が `dashboard/` を Root Directory として認識すれば問題ない。Batch D2 で確認

## 8. Recommended Next Step

### Immediate Human Actions

- [docs/60](../60-admin-phase-1-batch-d-deploy-plan.md) を読み、§3 / §4 / §6 の選定が運用と合うか確認
- Vercel Hobby Free か Pro か方針決定
- `dashboard/` を **同 repo subdir のままでよいか** 再確認（推奨: 同 repo）
- `/activity-log` snapshot の excerpt 長さの方針確認

### Next Implementation Batch — **Batch D1**

[§9](#9-exact-prompt-to-give-codex-next) の exact prompt を Codex / Claude Code に渡して着手。

### Mid-term

- Batch D2 で Vercel + DNS + middleware Basic Auth
- Batch D3 で post-deploy verification
- 残り 5 visual の生成サイクル
- Phase Admin 2（Auth 本格化 / Visual Register dashboard 統合）の design

### Deferred（永続）

- paid LLM / image API integration
- auto-posting / automated publish
- AI auto-review of drafts
- multi-user / collaboration
- billing / paid tier
- analytics fetch / charts
- public site `hitorimedia.com` 本実装

## 9. Exact Prompt to Give Codex Next

```text
Implement Phase Admin 1 — Batch D1: feature flags + asset-thumb handler + activity snapshot script.

Hard Rules:
- Stay within dashboard/ subdirectory except docs/handoff/devlog updates.
- Do NOT deploy yet.
- Do NOT touch Vercel project, DNS, or middleware.ts in this batch.
- Do NOT add Auth implementation.
- Do NOT add Sanity write token usage.
- Do NOT add Sanity mutations.
- Do NOT add OpenAI / Anthropic API clients.
- Do NOT add paid API integrations.
- Do NOT auto-post.
- Do NOT modify schemas/, structure/, sanity.config.ts, tools/.
- Do NOT modify assets/visuals/... or patches/...
- Do NOT generate images.
- Do NOT break existing dashboard routes:
  - /
  - /campaigns
  - /campaigns/[slug]
  - /human-review-gates
  - /visual-assets
  - /publish-packages
  - /diagnostics
  - /activity-log

Use:
- docs/60-admin-phase-1-batch-d-deploy-plan.md (especially §4, §5, §8)
- dashboard/src/app/diagnostics/page.tsx
- dashboard/src/app/publish-packages/page.tsx
- dashboard/src/app/activity-log/page.tsx
- dashboard/src/app/visual-assets/page.tsx
- dashboard/src/components/AppNav.tsx
- dashboard/src/lib/repoRoot.ts

Tasks:

1. Feature flag module
   - Create dashboard/src/lib/featureFlags.ts:
       export const enableDiagnostics = process.env.ENABLE_DIAGNOSTICS === 'true'
       export const enableLocalFsRoutes = process.env.ENABLE_LOCAL_FS_ROUTES === 'true'
       export const activityLogMode: 'fs' | 'snapshot' =
         process.env.ACTIVITY_LOG_MODE === 'fs' ? 'fs' : 'snapshot'
     localhost default should keep current behavior. Decide and document defaults.

2. Route guards
   - In /diagnostics: if !enableDiagnostics → notFound() (404).
   - In /publish-packages: if !enableLocalFsRoutes → notFound().
   - In /api/asset-thumb (created in step 4): same guard.
   - Existing localhost dev (no envs set) must still render these pages.

3. AppNav link visibility
   - AppNav reads featureFlags. Hide Diagnostics / Publish Packages links when flags off.
   - Activity Log link stays visible (snapshot or fs both work).

4. /api/asset-thumb route handler
   - Implement dashboard/src/app/api/asset-thumb/route.ts per docs/60 §5.1 spec.
   - Path validation: prefix assets/visuals/, no .., ext whitelist, size cap 8MB.
   - 404 when flag off.
   - Use createReadStream → Response (or Buffer if simpler under Next.js 16).
   - Local mode only.

5. Activity snapshot script
   - Create dashboard/scripts/build-activity-snapshot.mjs.
   - Reads ../docs/devlog/*.md and ../docs/handoff/*.md from repo root.
   - Writes dashboard/public/activity-snapshot.json.
   - Excerpt: title + status + date + first 120 chars of body.
   - Sort: latest by filename desc, capped per kind (e.g. 20).
   - Update dashboard/package.json scripts:
       "build:activity-snapshot": "node scripts/build-activity-snapshot.mjs"
   - Decide whether to chain it into "build" or leave manual.

6. /activity-log mode switch
   - Read activityLogMode flag.
   - fs mode = existing behavior (read docs/ on request).
   - snapshot mode = read /activity-snapshot.json (public path) and render same UI.

7. Update VisualAssetStatusTable on /visual-assets
   - When enableLocalFsRoutes, show <img src="/api/asset-thumb?path=..."> next to localAssetPath rows.
   - When flag off, fall back to path text only (current behavior).
   - Keep "Thumbnails are deferred" notice but conditionally hide when localhost mode is on.

8. README + docs
   - Update dashboard/README.md: env vars table, feature flags, snapshot script, thumbnail handler.
   - Create docs/devlog/0103-admin-phase-1-batch-d1-flags-thumbs-snapshot.md.
   - Create docs/handoff/0114-admin-phase-1-batch-d1-flags-thumbs-snapshot.md.
   - Mirror to docs/handoff/latest.md.

9. Validation
   - Root npm run build + npm run local:check still green.
   - Dashboard npm run build still green.
   - Run snapshot script manually, confirm public/activity-snapshot.json exists.
   - Start dashboard in localhost mode with ENABLE_DIAGNOSTICS=true ENABLE_LOCAL_FS_ROUTES=true ACTIVITY_LOG_MODE=fs, curl all 8 routes → 200.
   - Start dashboard with ENABLE_DIAGNOSTICS=false ENABLE_LOCAL_FS_ROUTES=false ACTIVITY_LOG_MODE=snapshot, curl /diagnostics + /publish-packages → 404, /activity-log → 200 from snapshot, /api/asset-thumb?path=... → 404.

End-of-run output:
- routes guarded
- snapshot script run result
- which envs were tested
- next batch (D2: Vercel + middleware + DNS).
```
