# Devlog 0103 — Admin Phase 1 Batch D1: Feature Flags + Asset-Thumb Handler + Activity Snapshot

Date: 2026-05-15
Status: **batch-d1-complete / read-only-maintained / no-deploy / dual-mode-validated / 14-of-14-security-checks-pass**

## 今日の判断

[Batch D 設計](0102-admin-phase-1-batch-d-deploy-plan.md) で確定した「deploy 前に踏むべき D1 ステップ」を実装。Vercel project は触らず、middleware も書かず、**localhost で production-like 動作を模擬できる状態**を作った。

- `lib/featureFlags.ts` を起点に、`ENABLE_DIAGNOSTICS` / `ENABLE_LOCAL_FS_ROUTES` / `ACTIVITY_LOG_MODE` の 3 flag を一箇所に集約
- `/diagnostics` と `/publish-packages` を `notFound()` で flag 制御
- AppNav を server layout から flag prop で受け取って **dev-only link を hide**
- `/api/asset-thumb` route handler を実装、`assets/visuals/` prefix 強制 + 11 種のセキュリティチェック
- `scripts/build-activity-snapshot.mjs` で `docs/devlog/` + `docs/handoff/` の latest 20/kind を `public/activity-snapshot.json` に書き出す
- `/activity-log` を fs / snapshot の二系統切替
- `/visual-assets` で flag on のときだけ `<img src="/api/asset-thumb?...">` を表示
- README に flag 表 + 実行コマンド + security rules を追記

## なぜその設計にしたか

- **flag を server-side で評価して props として client コンポーネントに渡す**: AppNav は `usePathname` のため client component だが、flag を `NEXT_PUBLIC_*` で client に inline するのは原則を増やすので避けた。layout（server）が `getNavFlags()` を呼んで props で渡す → 1 source of truth、disagreement なし。
- **production safe defaults を flag の core ロジックに焼く**: `NODE_ENV === 'production'` を起点に、flag が未設定なら disabled。明示的に `true` / `false` のどちらも override 可。手動 deploy ミスで filesystem-route が公開される事故を防止。
- **asset-thumb の hard rules を多層化**:
  1. encoded traversal を decode 前に検知（`..%252F`）
  2. 絶対パスを reject
  3. canonical prefix を normalize 前後で 2 度確認
  4. `path.normalize` 後の差分検査
  5. `..` セグメント分割でも reject
  6. ext 白名簿（5 種のみ）
  7. resolve 後 `allowedRoot + sep` で再確認（`assets/visuals-evil/x.png` を弾く）
  8. file 存在 / file 種別 / size 上限
  9. response に `no-store` + `nosniff`
  - 「1 つの check に依存しない」防御で、curl テスト 14/14 通過を確認。
- **activity snapshot は build には chain しない**: D1 では「手動で `npm run build:activity-snapshot` を打つ」が現実解。Batch D2 で Vercel の build hook に組み込むか改めて判断。今 build chain に入れると CI で必須化される副作用が大きい。
- **`/activity-log` の fs / snapshot で excerpt 長を変える**: fs (localhost) は 400 char で boss が文脈読める、snapshot (production) は 120 char で軽量。private 情報の漏出リスクを下げる効果も。
- **thumbnail は native `<img>`**: `next/image` を使うと最適化サーバーを噛んで latency↑ + dev-only 局面でメリットがない。`/api/asset-thumb` 自体が path validate と size cap を持つので生 `<img>` で OK。`eslint-disable @next/next/no-img-element` で警告抑制を明示。

## Codex と Claude Code の役割分担（再確認）

| 役割 | 担当 |
| --- | --- |
| featureFlags / route guards / asset-thumb / snapshot script / activity-log 切替 / visual-assets thumb 表示 / README | **Claude Code（本バッチ）** |
| 実環境での env 入力 / Vercel project 作成 / DNS / middleware Basic Auth | 人間 + Batch D2 |
| dataset の状態更新（campaignPlan stale 等） | 人間（dashboard は read-only） |
| Visual Register での承認 | 人間 |

## API なしで済ませた理由（再確認）

- `@sanity/client` の write / mutate を使っていない（grep 0 hits）
- OpenAI / Anthropic / 画像生成 API クライアントを追加していない（grep 0 hits）
- `npx sanity documents create` 等の Sanity CLI を実行していない
- `/api/asset-thumb` は **node:fs + Buffer** のみ、外部 API ゼロ
- `scripts/build-activity-snapshot.mjs` も **node:fs** のみで完結

## このバッチで作ったもの / 変更したもの

### Added — `dashboard/src/`

| Path | 役割 |
| --- | --- |
| `lib/featureFlags.ts` | `enableDiagnostics` / `enableLocalFsRoutes` / `activityLogMode` / `getNavFlags()` |
| `app/api/asset-thumb/route.ts` | local-only image serving、11 種のセキュリティチェック付き |

### Added — `dashboard/`

- `scripts/build-activity-snapshot.mjs`
- `public/activity-snapshot.json`（script で生成、git で追跡する/しないは Batch D2 で判断）

### Modified — `dashboard/`

- `src/app/layout.tsx` — `getNavFlags()` を呼んで AppNav に props 渡し
- `src/components/AppNav.tsx` — props で flag を受け取って dev-only link を hide
- `src/app/diagnostics/page.tsx` — `enableDiagnostics` で `notFound()`
- `src/app/publish-packages/page.tsx` — `enableLocalFsRoutes` で `notFound()`
- `src/app/activity-log/page.tsx` — `activityLogMode` で fs / snapshot 切替（snapshot 不在時の EmptyState 含む）
- `src/app/visual-assets/page.tsx` — flag on で `<img src="/api/asset-thumb?path=...">` 表示、banner も切替
- `package.json` — `build:activity-snapshot` script 追加
- `README.md` — Feature flags / asset-thumb rules / activity snapshot / Routes 表 / Project layout / Next batches を更新

### Modified — `docs/`

- `docs/devlog/0103-admin-phase-1-batch-d1-flags-thumbs-snapshot.md`（本ファイル）
- `docs/handoff/0114-admin-phase-1-batch-d1-flags-thumbs-snapshot.md`
- `docs/handoff/latest.md`（0114 にミラー）

### Confirmed unchanged

- `schemas/` 全件 / `sanity.config.ts` / `structure/index.ts` / `tools/`
- root `package.json` / `package-lock.json`
- 既存 seed / outputs / publish-packages / private / ai-blog-db 関連
- `assets/visuals/` / `patches/` / `assets/inbox/`
- 既存 Sanity dataset record
- middleware（未作成）
- Vercel project / DNS / Auth（未設定）

## Validation Results

### Dashboard build

- `cd dashboard && npm run build` → ✓ 10 routes generated（前回 9 + `/api/asset-thumb` 新規）

### Local mode（flags ON、ACTIVITY_LOG_MODE=fs）

8 page route + `/api/asset-thumb` 全部 HTTP 200:

| Route | HTTP |
| --- | --- |
| `/` | 200 |
| `/campaigns` | 200 |
| `/campaigns/building-hitori-media-os` | 200 |
| `/human-review-gates` | 200 |
| `/visual-assets` | 200（thumbnail enabled banner + `<img>` 1 件） |
| `/publish-packages` | 200 |
| `/diagnostics` | 200 |
| `/activity-log` | 200（fs mode） |
| `/api/asset-thumb?path=assets/visuals/.../x-hook-main-v1.png` | 200, 655,963 bytes, `image/png`, 1200x675 PNG |

AppNav に Diagnostics / Publish Packages / Activity Log / Visual Assets 4 link すべて存在。

### Production-like mode（flags OFF、ACTIVITY_LOG_MODE=snapshot）

期待通り:

| Route | HTTP | 確認 |
| --- | --- | --- |
| `/diagnostics` | **404** | gated by `enableDiagnostics` |
| `/publish-packages` | **404** | gated by `enableLocalFsRoutes` |
| `/api/asset-thumb?path=...` | **404** | gated by `enableLocalFsRoutes` |
| `/` | 200 | unchanged |
| `/campaigns` | 200 | unchanged |
| `/campaigns/building-hitori-media-os` | 200 | unchanged |
| `/human-review-gates` | 200 | unchanged |
| `/visual-assets` | 200 | thumbnail disabled banner、`<img>` 0 件 |
| `/activity-log` | 200 | snapshot mode、devlog 0102 を JSON snapshot 由来で表示 |

AppNav: `/diagnostics` link / `/publish-packages` link **消滅**（grep 0 hits）、`/activity-log` / `/visual-assets` / `/campaigns` は残る。

### `/api/asset-thumb` security checks（14/14 pass）

| # | Case | Expected | Actual |
| --- | --- | --- | --- |
| 1 | happy: `assets/visuals/.../x-hook-main-v1.png` | 200 | 200 ✓ |
| 2 | traversal: `../package.json` | 403 | 403 ✓ |
| 3 | traversal-in-prefix: `assets/visuals/../package.json` | 400 | 400 ✓ |
| 4 | double-encoded: `..%252F..%252Fpackage.json` | 403 | 403 ✓ |
| 5 | absolute: `/etc/passwd` | 400 | 400 ✓ |
| 6 | absolute: `/Users/sugawaratakuya` | 400 | 400 ✓ |
| 7 | wrong prefix: `assets/inbox/.../v001.png` | 403 | 403 ✓ |
| 8 | wrong prefix: `schemas/index.ts` | 403 | 403 ✓ |
| 9 | wrong prefix: `package.json` | 403 | 403 ✓ |
| 10 | lookalike: `assets/visuals-evil/x.png` | 403 | 403 ✓ |
| 11 | bad ext: `assets/visuals/...md` | 415 | 415 ✓ |
| 12 | bad ext: `assets/visuals/...ts` | 415 | 415 ✓ |
| 13 | missing file: `assets/visuals/.../does-not-exist.png` | 404 | 404 ✓ |
| 14 | no `path` query | 400 | 400 ✓ |

### Root validation

- `npm run build` (Sanity Studio): ✓ green
- `npm run local:check`: ✓ 17 ok / 0 fail
- direct Sanity write grep (dashboard/src): 0 hits
- paid LLM/image API SDK in dashboard: 0 hits
- SANITY_WRITE_TOKEN / writeToken grep: 0 hits

## Known issues

1. **`public/activity-snapshot.json` の git 追跡方針が未確定**: Batch D2 で Vercel build pipeline に組み込むなら commit 不要、手動 deploy なら commit 必要。`.gitignore` 設定は D2 で決める。
2. **fs と snapshot で excerpt 長が異なる**（fs: 400 char、snapshot: 120 char）: 意図的だが、boss が production と localhost で見比べたとき短い方が「壊れて見える」可能性。README で説明済。
3. **`/visual-assets` のサムネ表示は `localAssetPath` が `assets/visuals/` で始まる場合のみ**: 共有 master（`assets/visuals/<slug>/shared/...png`）と final（`assets/visuals/<slug>/x/hook/...png`）の両方を含む現運用で機能している。expected path（保存前）には thumbnail を出さない設計。
4. **`/diagnostics` を localhost で開いたままだと、毎回 `npm run local:check` が走る**: dev サーバー hot reload 中に重い、と感じる場面があるかも。`revalidate` を入れるかは Batch D2 で再検討。
5. **AppNav が client component**: `'use client'` 必須（`usePathname`）。server component で active state を出すなら別アプローチが必要だが、今回は実用上問題なし。

## 連番について

- devlog: 0102 → **0103**
- handoff: 0113 → **0114**

## 発信ネタになりそうな切り口

1. **「production-like mode を localhost で立てる」**: `ENABLE_DIAGNOSTICS=false ENABLE_LOCAL_FS_ROUTES=false ACTIVITY_LOG_MODE=snapshot npm run dev` 一発で、deploy 前に「production がどう見えるか」を確かめられる開発パターン。
2. **「feature flag を 1 ファイルに集約する」**: AppNav の見え方とサーバー guard の挙動が disagree しないように、`featureFlags.ts` が唯一の真実。`NEXT_PUBLIC_*` を増やさない判断。
3. **「path traversal を多層で防ぐ」**: 1 つの check に依存せず、decode → prefix → normalize → 2 段の resolve check で 14/14 pass。テストを curl で書ける軽さ。
4. **「activity snapshot を作る判断」**: production で `docs/` が存在しない前提を、build script で吸収する。boss が deploy 後の dashboard でも変更履歴を辿れる仕組み。
5. **「localhost 専用 API route」**: `/api/asset-thumb` を localhost-only にする設計。production では 404 で消し、build artefacts に repo asset を含めない方針との一貫性。

## Safety Verified

- direct Sanity write の grep（dashboard/src）: 0 hits
- paid LLM / image API SDK の grep（dashboard）: 0 hits
- SANITY_WRITE_TOKEN / writeToken の grep: 0 hits
- `npm run local:check`（root）: 17 ok / 0 fail
- root `npm run build`（Sanity Studio）: 成功
- dashboard `npm run build`（Next.js）: 成功（10 routes、`/api/asset-thumb` 含む）
- `/api/asset-thumb` security: 14/14 pass
- 画像生成: 0 件
- schema 変更: 0 件
- assets/visuals / patches / publish-packages / seed: 不変
- middleware: 未作成
- Vercel project / DNS / Auth: 触れていない
- ai-blog-db 関連: 不変
