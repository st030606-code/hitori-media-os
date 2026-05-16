# Handoff: Admin Phase 1 — Batch D1 (Feature Flags + Asset-Thumb + Activity Snapshot)

Date: 2026-05-15
Status: **batch-d1-complete / dual-mode-validated / 14-security-checks-pass / no-deploy / ready-for-batch-d2**

## 1. Task Goal

[docs/60 §9.1](../60-admin-phase-1-batch-d-deploy-plan.md) で確定した Batch D1 を実装。Vercel / middleware / DNS には触れず、**localhost で production-like 動作を模擬できる** 状態を作る。

## 2. Constraints Followed

- `dashboard/` subdirectory 内で完結（docs / handoff のみ root の docs/）
- deploy していない（Vercel project 0、DNS 変更 0、middleware 実装 0）
- Auth 実装ゼロ（middleware も書かない）
- Sanity write token usage 追加 0
- Sanity mutation 0 件（grep 0 hits）
- OpenAI / Anthropic / paid image API クライアント追加 0
- auto-postingゼロ
- `schemas/` / `structure/` / `sanity.config.ts` / `tools/` 不変
- `assets/visuals/...` / `patches/...` / `assets/inbox/` 不変
- 画像生成 0 件
- 既存 8 route 全て **生きたまま**（dev 設定で）

## 3. Changed Files

### Added — `dashboard/src/`

| Path | 役割 |
| --- | --- |
| `lib/featureFlags.ts` | `enableDiagnostics` / `enableLocalFsRoutes` / `activityLogMode` / `getNavFlags()` |
| `app/api/asset-thumb/route.ts` | local-only image streaming under `assets/visuals/`、11 セキュリティチェック付き |

### Added — `dashboard/`

- `scripts/build-activity-snapshot.mjs`（docs/devlog + docs/handoff を JSON snapshot 化）
- `public/activity-snapshot.json`（script 出力、20 devlog + 20 handoff entry）

### Modified — `dashboard/`

- `src/app/layout.tsx` — `getNavFlags()` → `AppNav` props
- `src/components/AppNav.tsx` — props で flag 受取、dev-only link を hide、active highlight 維持
- `src/app/diagnostics/page.tsx` — `enableDiagnostics` で `notFound()` ガード
- `src/app/publish-packages/page.tsx` — `enableLocalFsRoutes` で `notFound()` ガード
- `src/app/activity-log/page.tsx` — `activityLogMode` で fs / snapshot 切替、snapshot missing 時 EmptyState
- `src/app/visual-assets/page.tsx` — flag on で `<img src="/api/asset-thumb?path=...">` 表示、enabled/disabled banner 切替
- `package.json` — `"build:activity-snapshot": "node scripts/build-activity-snapshot.mjs"` script 追加
- `README.md` — Feature flags / asset-thumb rules / activity snapshot / Routes 表 / Project layout / Next batches 更新

### Added — `docs/`

- `docs/devlog/0103-admin-phase-1-batch-d1-flags-thumbs-snapshot.md`
- `docs/handoff/0114-admin-phase-1-batch-d1-flags-thumbs-snapshot.md`

### Modified — `docs/`

- `docs/handoff/latest.md`（本 0114 にミラー）

### Confirmed unchanged

- `schemas/` 全件（active 16）
- `sanity.config.ts` / `structure/index.ts` / `tools/`
- root `package.json` / `package-lock.json`
- 既存 seed / outputs / publish-packages / private / ai-blog-db 関連
- `assets/visuals/` / `patches/` / `assets/inbox/`
- 既存 dataset record（dashboard は read-only）
- middleware（未作成）
- Vercel project / DNS / Auth（未設定）

## 4. Summary of Changes

### A. featureFlags.ts

3 flag を server-side で 1 度だけ評価。production safe defaults を flag core に焼き込み。

```ts
ENABLE_DIAGNOSTICS         // dev: enabled / prod: disabled / explicit true|false が常に勝つ
ENABLE_LOCAL_FS_ROUTES     // 同上
ACTIVITY_LOG_MODE          // 'fs' | 'snapshot' / dev: 'fs' / prod: 'snapshot'
```

`getNavFlags()` で AppNav 用の boolean 2 個を export。`NEXT_PUBLIC_*` を増やさず、1 source of truth で nav 表示と route guard が **必ず一致**。

### B. Route guards

```tsx
// /diagnostics
if (!enableDiagnostics) notFound()

// /publish-packages
if (!enableLocalFsRoutes) notFound()
```

`enableLocalFsRoutes` は `/api/asset-thumb` でも同じ意味で使う。

### C. AppNav 修正

`'use client'` に flag prop を渡し、`buildItems({enableDiagnostics, enableLocalFsRoutes}).filter(it => it.enabled)` で表示制御。

### D. `/api/asset-thumb` route handler

Rules（route.ts 内、11 step）:

1. flag off → 404
2. missing query → 400
3. `decodeURIComponent` 失敗 → 400
4. 絶対パス（`/...` / `C:\...`）→ 400
5. canonical prefix `assets/visuals/` 必須 → 403
6. `path.normalize` で変化 or `..` 残存 → 400
7. normalize 後も prefix 維持 → 403
8. ext 白名簿（png/jpg/jpeg/webp/gif）→ 415
9. `path.resolve(repoRoot(), normalized)` が `allowedRoot + sep` で始まる → 403
10. file 存在 / `isFile()` / size <= 8 MB → 404 / 403 / 413
11. response headers: `Cache-Control: private, no-store` / `X-Content-Type-Options: nosniff`

### E. `scripts/build-activity-snapshot.mjs`

repo root の `docs/devlog/*.md` + `docs/handoff/*.md` を読み、各 entry から:

- title（first `#` 行）
- status（first `Status:` 行）
- date（first `Date:` 行、なければ filename の `YYYY-MM-DD` prefix）
- excerpt（最初 120 char、heading / metadata / 空行除く）

を抽出して `dashboard/public/activity-snapshot.json` に書き出す。latest 20 per kind。

実行: `npm run build:activity-snapshot`（dashboard cwd で）。**build には chain しない**（Batch D2 で Vercel hook を判断）。

### F. `/activity-log` 切替

```ts
const mode = activityLogMode
if (mode === 'fs') {
  // 従来の fs walk
} else {
  // public/activity-snapshot.json を fs.readFile
}
```

snapshot 不在時は EmptyState で「`npm run build:activity-snapshot` を実行してください」を表示。fs mode は excerpt 400 char、snapshot mode は 120 char。

### G. `/visual-assets` thumbnail

`enableLocalFsRoutes` が true かつ `localAssetPath` が `assets/visuals/` で始まる場合のみ:

```tsx
<img
  src={`/api/asset-thumb?path=${encodeURIComponent(localAssetPath)}`}
  alt={...}
  className="h-14 w-24 rounded border ..."
  loading="lazy"
/>
```

native `<img>` を使用（`next/image` を避ける、local-only 局面でメリットなし）。`eslint-disable @next/next/no-img-element` で警告抑制を明示。Table header にも `Thumb` 列を thumbsEnabled の時だけ追加。

banner 表示は enabled / disabled で文言と色を切替（緑 / 黄）。

## 5. Validation Results

### Dashboard build

- `cd dashboard && npm run build` → ✓ **10 routes generated**（前回 9 → `/api/asset-thumb` 新規追加）

### Local mode（flags ON、ACTIVITY_LOG_MODE=fs）

| Route | HTTP | 備考 |
| --- | --- | --- |
| `/` | 200 | Dashboard Home |
| `/campaigns` | 200 | list |
| `/campaigns/building-hitori-media-os` | 200 | detail |
| `/human-review-gates` | 200 | aggregator |
| `/visual-assets` | 200 | enabled banner / `<img>` 1 件 |
| `/publish-packages` | 200 | fs walk |
| `/diagnostics` | 200 | local:check 実行 |
| `/activity-log` | 200 | fs mode |
| `/api/asset-thumb?path=...x-hook-main-v1.png` | **200**, 655,963 B, `image/png`, 1200×675 | happy path |

AppNav: Diagnostics / Publish Packages / Activity Log / Visual Assets 4 link すべて存在。

### Production-like mode（flags OFF、ACTIVITY_LOG_MODE=snapshot）

| Route | HTTP | 備考 |
| --- | --- | --- |
| `/diagnostics` | **404** | gated by `enableDiagnostics` |
| `/publish-packages` | **404** | gated by `enableLocalFsRoutes` |
| `/api/asset-thumb?path=...` | **404** | gated by `enableLocalFsRoutes` |
| `/` | 200 | |
| `/campaigns` | 200 | |
| `/campaigns/building-hitori-media-os` | 200 | |
| `/human-review-gates` | 200 | |
| `/visual-assets` | 200 | disabled banner / `<img>` 0 件 |
| `/activity-log` | 200 | **snapshot mode**、devlog 0102 を JSON 由来で表示 |

AppNav: `/diagnostics` / `/publish-packages` link **消滅**（grep 0 hits）、`/activity-log` / `/visual-assets` / `/campaigns` は残る。

### `/api/asset-thumb` security checks

**14 / 14 pass**:

| # | Case | Expected | Actual |
| --- | --- | --- | --- |
| 1 | happy: `assets/visuals/...x-hook-main-v1.png` | 200 | 200 ✓ |
| 2 | `../package.json` | 403 | 403 ✓ |
| 3 | `assets/visuals/../package.json` | 400 | 400 ✓ |
| 4 | double-encoded `..%252F..%252Fpackage.json` | 403 | 403 ✓ |
| 5 | `/etc/passwd` | 400 | 400 ✓ |
| 6 | `/Users/sugawaratakuya` | 400 | 400 ✓ |
| 7 | wrong prefix `assets/inbox/.../v001.png` | 403 | 403 ✓ |
| 8 | wrong prefix `schemas/index.ts` | 403 | 403 ✓ |
| 9 | wrong prefix `package.json` | 403 | 403 ✓ |
| 10 | lookalike `assets/visuals-evil/x.png` | 403 | 403 ✓ |
| 11 | bad ext `...md` | 415 | 415 ✓ |
| 12 | bad ext `...ts` | 415 | 415 ✓ |
| 13 | missing file `assets/visuals/.../does-not-exist.png` | 404 | 404 ✓ |
| 14 | no `path` query | 400 | 400 ✓ |

### Root validation

- `npm run build` (Sanity Studio): ✓ green
- `npm run local:check`: ✓ 17 ok / 0 fail
- direct Sanity write grep（dashboard/src）: 0 hits
- paid LLM/image API SDK in dashboard: 0 hits
- `SANITY_WRITE_TOKEN` / `writeToken` grep: 0 hits

## 6. Important Decisions

- **`getNavFlags()` で nav と route guard を 1 source に**: AppNav が prop で flag を受け取る形にして、`NEXT_PUBLIC_*` を増やさない。`/diagnostics` を 404 にする条件と link 隠す条件が同じ flag。
- **production safe defaults を core に焼く**: `NODE_ENV === 'production'` で自動的に disabled、明示的 `true`/`false` は常に勝つ。
- **asset-thumb の hard rules を多層化**: 1 つの check に依存しない（decode 前 / prefix / normalize / resolve）。テストを curl で書ける軽さ。
- **activity snapshot を build に chain しない**: Batch D1 では手動実行、D2 で Vercel hook 判断。
- **fs と snapshot で excerpt 長を変える**: fs = 400 char（boss が文脈読める）、snapshot = 120 char（軽量 + 漏洩リスク↓）。
- **thumbnail は native `<img>` を使う**: `next/image` の最適化 server を localhost で噛む意味がない。`/api/asset-thumb` 自体で path validate + size cap 済み。

## 7. Human Review Questions

- `public/activity-snapshot.json` を git で追跡する / しないどちらが運用上良いか？（Batch D2 で `.gitignore` 設定）
- fs 400 char / snapshot 120 char の excerpt 長は妥当か、揃えるべきか？
- `/diagnostics` の hot reload 中の負荷は気になるか？（毎 request で `npm run local:check` を fork）
- `/visual-assets` の thumbnail サイズ（h-14 w-24 = 56×96）は読みやすいか？
- AppNav の active highlight は引き続き有用か？

## 8. Risks or Uncertainties

- **`public/activity-snapshot.json` を毎 deploy 前に再生成する手順を忘れる**: Batch D2 で Vercel build hook に組み込むか、`prebuild` script に挟むかを判断（README に明記済）
- **`/api/asset-thumb` が将来 production で「採用済み visual のみ」snapshot 経路で動くようになる可能性**: 現状は localhost only、Batch D2 で snapshot 経路の design を再検討
- **`enableLocalFsRoutes` が両方の用途（`/publish-packages` と `/api/asset-thumb`）をカバーしている**: 別々に制御したくなった場合は flag 分割が必要
- **production mode で AppNav が変わる**: deploy 直後に boss が「あれ、link が減った？」と戸惑う可能性。README で明示済
- **`/activity-log` snapshot は `public/` 経由で配信される**: production でも snapshot が直接 URL でアクセス可能（`/activity-snapshot.json`）。中身は title + status + date + 120 char excerpt なので深刻ではないが、private 情報の管理粒度として認識しておく

## 9. Recommended Next Step

### Immediate Human Actions

1. `cd dashboard && npm run build:activity-snapshot` で `public/activity-snapshot.json` を確認
2. **local mode** で `cd dashboard && npm run dev` → 8 route が今まで通り見える + `/visual-assets` で thumbnail 表示
3. **production-like mode** で:
   ```bash
   ENABLE_DIAGNOSTICS=false ENABLE_LOCAL_FS_ROUTES=false ACTIVITY_LOG_MODE=snapshot npm run dev
   ```
   → `/diagnostics` `/publish-packages` `/api/asset-thumb` が 404、`/activity-log` が snapshot で表示
4. `public/activity-snapshot.json` を git で追跡するか判断
5. Batch D2 着手前に flag の運用設計（excerpt 長 / hot reload 負荷 / thumbnail サイズ）を確定

### Next Implementation Batch — **Batch D2**

[docs/60 §9.2](../60-admin-phase-1-batch-d-deploy-plan.md) を着手 prompt として:

1. Vercel project 作成（Root Directory: `dashboard/`）
2. 環境変数 4 種を Production / Preview / Development scope で設定
3. `middleware.ts` を [docs/60 §6.2](../60-admin-phase-1-batch-d-deploy-plan.md) spec で実装
4. `ADMIN_BASIC_AUTH_USER` / `ADMIN_BASIC_AUTH_PASSWORD` を Vercel UI で設定
5. `app.hitorimedia.com` DNS 設定 + Vercel に追加
6. 初回 preview deploy + Basic Auth で守られていること確認
7. `npm run build:activity-snapshot` を prebuild / GitHub Action に組み込むか判断

### Mid-term

- Batch D3 で post-deploy verification
- 残り 5 visual の生成サイクル
- Phase Admin 2（Auth 本格 / Visual Register dashboard 統合）の design

### Deferred（永続）

- paid LLM / image API integration
- auto-posting / automated publish
- AI auto-review of drafts
- multi-user / collaboration
- billing / paid tier
- analytics fetch / charts
- public site `hitorimedia.com` 本実装

## 10. Exact Prompt to Give Codex Next

```text
Implement Phase Admin 1 — Batch D2: Vercel project + middleware Basic Auth + DNS for app.hitorimedia.com.

Hard Rules:
- Stay within dashboard/ subdirectory except docs/handoff/devlog updates.
- Do NOT modify schemas/, structure/, sanity.config.ts, tools/.
- Do NOT add Sanity write token usage.
- Do NOT add Sanity mutations.
- Do NOT add OpenAI / Anthropic API clients.
- Do NOT add paid API integrations.
- Do NOT auto-post.
- Do NOT modify assets/visuals or patches.
- Do NOT generate images.
- Do NOT break existing dashboard routes (8 page routes + /api/asset-thumb).
- The actual Vercel project creation and DNS change must be performed manually by the human; Claude Code prepares the code, config, and step-by-step instructions only.

Use:
- docs/60-admin-phase-1-batch-d-deploy-plan.md (§6, §7, §8, §9.2)
- docs/handoff/0114-admin-phase-1-batch-d1-flags-thumbs-snapshot.md
- dashboard/src/lib/featureFlags.ts
- dashboard/README.md

Tasks:
1. Implement dashboard/middleware.ts per docs/60 §6.2 spec (Basic Auth, matcher excludes _next/static and favicon).
2. Decide whether dashboard/public/activity-snapshot.json should be committed or generated at build time. Add prebuild hook if needed.
3. Write docs/61-admin-phase-1-batch-d2-vercel-setup.md with EXACT human steps:
   - Vercel project creation (Root Directory: dashboard/)
   - environment variable values to set (without disclosing the actual SANITY_READ_TOKEN value)
   - app.hitorimedia.com DNS configuration
   - Basic Auth password generation guidance
4. Update dashboard/README.md to document middleware behavior and deploy steps.
5. dashboard npm run build + root npm run build + npm run local:check all green.
6. Do NOT actually deploy. Stop at "ready to push to Vercel" state.

End-of-run output:
- middleware.ts created and tested locally (curl with/without Authorization header)
- docs/61 deploy steps written
- next batch: D3 post-deploy verification once the human triggers a Vercel deploy
```
