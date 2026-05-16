# Devlog 0101 — Admin Phase 1 Batch C: Visual Assets list + Publish Packages + Diagnostics + Activity Log

Date: 2026-05-15
Status: **8-routes-rendering / batch-c-complete / read-only-maintained / thumbnails-deferred-to-batch-d**

## 今日の判断

[Batch B](0100-admin-phase-1-batch-b-dashboard-home-gates.md) で 5 route まで広げた dashboard を、ops console として実用レベルへ。Visual Assets を stub から full listing に置き換え、Publish Packages（fs walk）/ Diagnostics（`npm run local:check` server-side 実行）/ Activity Log（devlog + handoff markdown 一覧）の 3 新規 page を追加。AppNav に active route highlight も入れた。

`/diagnostics` は本物の child process を server-side で動かす（hardcoded command `npm run local:check`、execFile、cwd は `repoRoot()`、timeout 60s、user input 受けない）。`/publish-packages` と `/activity-log` は server-side fs walk。すべて dev-only な前提で、Batch D で deploy 時に disable / cached snapshot に切り替える方針を README と handoff に明記。

## なぜその設計にしたか

- **`/visual-assets` を bucket 分割**: schema 上の status enum は 10 値あるが、boss 視点で意味のある粒度は `done / pending / progress / planned / other` の5バケット。schema を変えず UI 層で集約。
- **`/publish-packages` を fs walk にする**: publish-packages は Sanity 外の filesystem 真実なので、GROQ ではなく fs。dev-only に絞ることで Sanity write を経由せず読める。
- **`/diagnostics` を execFile（exec ではなく）で**: shell expansion なし、ユーザ入力なし、コマンドは hardcoded。`maxBuffer: 5MB`、`timeout: 60s`、`cwd: repoRoot()`。production deploy では disable する前提（README + handoff §「Note」）。
- **`/activity-log` を markdown raw 読みで**: 重い markdown renderer を入れず、`# title` / `Date:` / `Status:` / 本文 excerpt（最初 400 char）のみ抽出。boss は title / status / 日付で「最近何があった」を辿れる。
- **AppNav に active route highlight**: pathname-based、`'use client'` 必須（usePathname は client hook）。`/campaigns/[slug]` も active と判定するために startsWith マッチ。
- **共通 component を 4 件追加**（SummaryCard / EmptyState / FilePathBlock / SectionHeader）: Batch C で 4 page が同じパターンを繰り返すので、最小限で再利用。
- **`lib/repoRoot.ts` を切り出す**: `process.cwd()` から `..` を解決する helper を 1 箇所に。3 page から import される。
- **thumbnail は deferred**: assets/visuals 配下の image を Next.js から serve するには静的ファイル handler が必要。Batch C scope を超えるので明示的に Batch D で扱う、Visual Assets page に黄色注意ボックスを出す。

## Codex と Claude Code の役割分担（再確認）

| 役割 | 担当 |
| --- | --- |
| 4 page + 4 component + GROQ 1 件 + AppNav update | **Claude Code（本バッチ）** |
| `.env.local` 設定 / SANITY_READ_TOKEN | 人間（既に Batch A 時に完了済） |
| dataset の record 更新 | 人間（Studio 経由） |
| Visual Register / publish-package CLI 実行 | 人間（dashboard からは read-only） |
| deploy / Auth / thumbnail handler | 別バッチ（Batch D） |

## API なしで済ませた理由（再確認）

- `@sanity/client` の write helper / mutation を import していない（grep 0 hits）
- LLM API / 画像 API クライアントを追加していない（grep 0 hits）
- `npx sanity documents create` 等の Sanity CLI を auto-exec していない
- 画像生成: 0 件
- Auth 機構: 未実装
- `/diagnostics` の child_process は repo root の **既存 npm script** を呼ぶだけで、外部 API なし

## このバッチで作ったもの / 変更したもの

### Added — `dashboard/src/components/`

- `SummaryCard.tsx`
- `EmptyState.tsx`
- `FilePathBlock.tsx`
- `SectionHeader.tsx`

### Added — `dashboard/src/lib/`

- `repoRoot.ts`（`repoRoot()` / `repoPath(...)` helper）

### Added — `dashboard/src/app/`

- `publish-packages/page.tsx`（fs walk）
- `diagnostics/page.tsx`（execFile + JSON parse + raw fallback）
- `activity-log/page.tsx`（markdown excerpt × 2 source）

### Modified — `dashboard/src/`

- `app/visual-assets/page.tsx`（stub → full listing、5 bucket、thumbnail-deferred 注意ボックス）
- `components/AppNav.tsx`（`'use client'` + `usePathname` + active highlight + 3 new links）
- `lib/groq/campaign.ts`（`visualAssetPlanListQuery` 追加 + `VisualAssetPlanListItem` 型）

### Modified — `dashboard/README.md`

- Batch A / B / C のカバー範囲記述
- Routes 表（8 行）
- Project layout に新規 component / lib / route を追加
- Next batches で Batch C 完了マーク
- thumbnail / `/diagnostics` の deploy 注意点を Batch D に倒す

### Added — docs/

- `docs/devlog/0101-admin-phase-1-batch-c-ops-pages.md`（本ファイル）
- `docs/handoff/0112-admin-phase-1-batch-c-ops-pages.md`

### Modified — docs/

- `docs/handoff/latest.md`（本 handoff 0112 にミラー）

### Confirmed unchanged

- `schemas/` 全件（active 16）
- `sanity.config.ts` / `structure/index.ts` / `tools/`
- root `package.json` / `package-lock.json`
- 既存 seed / outputs / publish-packages（**dashboard は read-only**、配下 fs walk のみ）
- `private/` / ai-blog-db
- `assets/visuals/` / `patches/` / `assets/inbox/`
- 既存 dataset record（dashboard は read-only Sanity 接続のみ）

## Build / Render Results

| Route | HTTP | Size | Key content |
| --- | --- | --- | --- |
| `/` | **200** | 38,194 B | Dashboard heading / NextActionSummary（unchanged） |
| `/campaigns` | **200** | 25,863 B | Campaigns list（unchanged） |
| `/campaigns/building-hitori-media-os` | **200** | 109,655 B | Detail（unchanged） |
| `/human-review-gates` | **200** | 32,923 B | 4 buckets（unchanged） |
| `/visual-assets` | **200** | 95,776 B | Full listing / Planned bucket / x-hook-main-v1 / campaign-hero / thumbnails deferred warning |
| `/publish-packages` | **200** | 175,421 B | building-hitori-media-os / x-hook-main-v1.png / campaign-hero-v1.png / release-review / files |
| `/diagnostics` | **200** | 45,425 B | Diagnostics heading / Checks green / Overall / Raw output / local:check |
| `/activity-log` | **200** | 154,746 B | Activity Log / Devlog / Handoff / Admin Phase 1 / 0100 / 0099 |

dashboard `npm run build`: ✓ 9 routes generated（前回 6 → 9）
root `npm run build` (Sanity Studio): ✓ 7,387 ms green
root `npm run local:check`: ✓ 17 / 0
direct Sanity write code grep (dashboard/src): 0 hits
paid LLM/image API SDK grep (dashboard): 0 hits
SANITY_WRITE_TOKEN / writeToken grep (dashboard/src): 0 hits

## Known issues

1. **Thumbnails on `/visual-assets` are deferred**: `assets/visuals/` 配下を Next.js から serve する static file handler を作るのは Batch D scope。現状は path 表示のみで boss は外部エディタや Visual Register で確認する流れ。
2. **`/diagnostics` runs a real process on every request**: localhost only 前提。Batch D の deploy 時に disable / cached snapshot に切り替える必要（README §「Note」と本 handoff §「Risks」参照）。
3. **`/publish-packages` と `/activity-log` も dev fs 依存**: deploy 環境では filesystem に publish-packages や docs が無いので、空 listing or 404 になる。Batch D で「dev-only routes」をどう扱うか判断（disable / build-time snapshot / hide from nav）。
4. **`Pending review` bucket on `/visual-assets` shows 0**: 現 dataset では schema 上の `generated-needs-save` ステータスがある visualAssetPlan が無いため。bucket logic は schema enum と一致しているので動作正しい、表示はゼロ件の bucket を隠す挙動。
5. **AppNav は client component**: `'use client'` + `usePathname`。SSR Streaming に影響なし。

## 連番について

- devlog: 0100 → **0101**
- handoff: 0111 → **0112**

## 発信ネタになりそうな切り口

1. **「dashboard で `npm run local:check` を実機実行する判断」**: Diagnostics page は本物の child_process を server-side で動かす。localhost-only という制約と引き換えに、"今 ok か？" を1クリックで見られる即時性。
2. **「Sanity dataset を真実とする情報 vs filesystem を真実とする情報」**: visualAssetPlan は dataset 由来、publish-packages と docs は filesystem 由来。dashboard で両方を 1 UI に統合する設計判断。
3. **「Batch D の "deploy する前にやらないといけないこと" リスト」**: thumbnail handler / `/diagnostics` 切替 / dev-only routes の扱い / Basic Auth。実装ではなく "削減する作業" の整理が design batch の本質。
4. **「Markdown を render せず読む」**: heavy parser を入れず、`# title` と `Status:` と `Date:` の3行 + 最初 400 char の excerpt だけで Activity Log が boss にとって useful になる。後で markdown renderer を入れるかは別判断。
5. **「Empty state を component 化する」**: `EmptyState` を共通化することで、dataset 接続失敗 / 空 dataset / fs 失敗 / API timeout を同じ UI で表現できる。早期 dashboard では「壊れたときどう見えるか」を decoupling するのが速い。

## Safety Verified

- direct Sanity write の grep（dashboard/src）: 0 hits
- paid LLM / image API SDK の grep（dashboard）: 0 hits
- SANITY_WRITE_TOKEN / writeToken の grep（dashboard/src）: 0 hits
- `npm run local:check`（root）: 17 ok / 0 fail
- root `npm run build`（Sanity Studio）: 成功
- dashboard `npm run build`（Next.js）: 成功（9 routes）
- 画像生成: 0 件
- schema 変更: 0 件
- assets/visuals / patches / publish-packages / seed: 不変
- Auth 機構: 未実装
- `npx sanity documents create` 実行: 0 回
- DNS / hosting: 触れていない
- ai-blog-db 関連: 不変
