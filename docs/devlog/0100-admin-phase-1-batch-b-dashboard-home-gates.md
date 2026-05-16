# Devlog 0100 — Admin Phase 1 Batch B: Dashboard Home + Campaigns List + Human Review Gates + Next Action Summary

Date: 2026-05-15
Status: **5-routes-rendering / 4-new-pages / 1-stub / nextActionSummary-detects-staleness / read-only-maintained**

## 今日の判断

[Batch A](0099-admin-phase-1-batch-a-campaign-detail.md) で 1 画面（Campaign Detail）だけだった dashboard を、boss 視点の運用ビューに広げた。3 新規 page + 1 stub + 共通 AppNav + 共通 `ReadOnlyBanner` + 新規 component `NextActionSummary` の追加。Sanity 書き込み / Auth / paid API / mutation はゼロ。

`NextActionSummary` の **staleness detection** が building-hitori-media-os の既知の癖（`x-hook-main-v1` の seed-side state は `pending-review` だが、被参照 `visualAssetPlan` は `saved`）を検出して "CampaignPlan may be stale" 警告として Dashboard Home / Campaign Detail の両方で表示することを curl で確認済み。

## なぜその設計にしたか

- **`NextActionSummary` を 1 component に集約**: Dashboard Home（最新 campaign）と Campaign Detail で同じ component を使い回す。boss が「次にやること」を 1 箇所で把握できる。
- **staleness detection を schema 設計の "ズレ" の自動診断にする**: campaignPlan の `requiredVisualAssets[].state` は seed の凍結値、`visualAssetPlan.status` が dataset の生きた値、という2層構造を `NextActionSummary` で reconcile。手動同期や `tools/campaign-plan/sync-state.mjs`（仮）を将来作るまで、UI レベルで気づける。
- **Human Review Gates ページを「バケット」分割**: pending-review / in-progress / blocked / not-started の 4 セクションで配置。pending-review と blocked が boss の即対応対象、in-progress は他人 / 進行中、not-started は予定。
- **共通 `ReadOnlyBanner` component の抽出**: Phase Admin 1 のすべての page で同じ警告を出すために component 化。Phase Admin 2 で write が入ったとき、この component を 1 箇所いじれば外せる。
- **Visual Assets は stub**: 完全実装は Batch C。Batch B では top nav の整合性のためだけに置く（404 を出さない、boss を Visual Register / Campaign Detail に誘導）。
- **GROQ で集約クエリを 3 件追加**: dashboard 用に `campaignListQuery` / `dashboardHomeQuery` / `pendingHumanReviewGatesQuery`。すべて read-only、参照 dereference は既存 detail query と同じパターン。
- **Internal ID を muted に**: Campaign Row / Gate item で title を先、`<code>{slug}</code>` を 2 行目の `text-slate-500` に。boss-friendly に user-facing labels が前面、developer-friendly な ID は補助情報として残す。

## Codex と Claude Code の役割分担（再確認）

| 役割 | 担当 |
| --- | --- |
| Next.js 4 page + 共通 component + GROQ 3 件追加 | **Claude Code（本バッチ）** |
| dataset 投入 / Sanity 編集 | 人間（dashboard は read-only） |
| Visual Register 操作 | 人間（外部リンクで誘導） |
| dataset state の手動更新（stale x-hook-main-v1 を done へ） | 人間（Studio 経由） |

## API なしで済ませた理由（再確認）

- `@sanity/client` の write helper / mutation を import していない（grep で `.create|.patch|.delete|.commit|.transaction|.mutate` 0 hits）
- LLM API / 画像 API クライアントを追加していない（grep 0 hits）
- Auth / Cookie / session の実装ゼロ
- 既存 schemas / `tools/` / `sanity.config.ts` / `structure/index.ts` 不変

## このバッチで作ったもの / 変更したもの

### Added — `dashboard/src/components/`

- `AppNav.tsx` — top nav 4 links（Home / Campaigns / Human Review Gates / Visual Assets）+ ブランド表示
- `ReadOnlyBanner.tsx` — Phase Admin 1 警告（再利用可）
- `NextActionSummary.tsx` — campaign state から「やること」を 5 tone（now / soon / later / warn / done）で算出
  - staleness detection: `plan.status in ["saved","reviewed","approved","packaged","published"]` かつ `requiredVisualAssets[].state` が active なら warn
  - active human review gates 列挙（blocked → warn、それ以外 → now）
  - priority 順に not-done visuals を top 3 まで（残りは "see table below"）
  - pending publish packages / pending manual publishing
  - 全部 done なら "No immediate blockers"

### Added — `dashboard/src/app/`

- `page.tsx` — Dashboard Home（4 overview cards + latest campaign with NextActionSummary + 外部リンク 4）
- `campaigns/page.tsx` — Campaigns list（card 1 個ずつ + metric 4 軸 + selected platform chips）
- `human-review-gates/page.tsx` — 4 バケット集約（pending-review / in-progress / blocked / not-started）
- `visual-assets/page.tsx` — Phase Admin 1 stub（Visual Register / Campaign Detail への誘導）

### Modified — `dashboard/src/`

- `app/layout.tsx` — `AppNav` を全 page に注入、metadata の title/description を Hitori Media OS 用に
- `app/campaigns/[slug]/page.tsx` — `NextActionSummary` を `CampaignStatusCard` 直後に挿入、inline `ReadOnlyBanner` 関数を component import に置換
- `lib/groq/campaign.ts` — `campaignListQuery` を拡張、`dashboardHomeQuery` / `pendingHumanReviewGatesQuery` を追加、TS 型 `CampaignListItem` / `DashboardHomeData` / `PendingGatesByCampaign` を新規

### Modified — `dashboard/README.md`

- 概要を Batch A + B 両方に拡張
- Routes 表を追加（5 route）
- Project layout に新規 component / route を追記
- Next batches セクションで Batch B 完了マーク

### Added — docs/

- `docs/devlog/0100-admin-phase-1-batch-b-dashboard-home-gates.md`（本ファイル）
- `docs/handoff/0111-admin-phase-1-batch-b-dashboard-home-gates.md`

### Modified — docs/

- `docs/handoff/latest.md`（本 handoff 0111 にミラー）

### Confirmed unchanged

- `schemas/` 全件（active 16）
- `sanity.config.ts` / `structure/index.ts` / `tools/`
- root `package.json` / `package-lock.json`
- 既存 seed / outputs / publish-packages / private / ai-blog-db 関連
- `assets/visuals/` / `patches/` / `assets/inbox/`
- 既存 dataset record（4 投入済 record も含む、本バッチで読むだけ）
- DNS / hosting / Auth: 不変

## Build / Render Results

| Check | Result |
| --- | --- |
| `cd dashboard && npm run build` | ✓（5 routes generated: `/`, `/_not-found`, `/campaigns`, `/campaigns/[slug]`, `/human-review-gates`, `/visual-assets`） |
| `cd dashboard && npm run dev` | ✓ Ready in 224ms |
| `curl http://localhost:3000/` | HTTP 200 (38,453 bytes) — Dashboard heading / Next Actions / Latest active campaign / **Staleness warning** all rendered |
| `curl http://localhost:3000/campaigns` | HTTP 200 (26,032 bytes) — Campaigns heading / building-hitori-media-os link |
| `curl http://localhost:3000/campaigns/building-hitori-media-os` | HTTP 200 (110,471 bytes) — Next Actions + **Staleness warning** + coreThesis |
| `curl http://localhost:3000/human-review-gates` | HTTP 200 (33,112 bytes) — 4 buckets all rendered |
| `curl http://localhost:3000/visual-assets` | HTTP 200 (19,843 bytes) — Stub + Visual Register link |
| root `npm run build` (Sanity Studio) | ✓ green |
| root `npm run local:check` | ✓ 17/17 |
| direct Sanity write grep (dashboard/src) | 0 hits |
| paid LLM/image API SDK in dashboard | 0 hits |

## NextActionSummary の actual output（building-hitori-media-os, 観察）

curl で取った HTML を見ると、現状で生成される actions（推定、順序通り）:

1. **warn — CampaignPlan may be stale: x-hook-main-v1**（plan.status=saved だが seed-side state=pending-review）
2. **now — Review gate: x-hook-main-v1 Visual Register approve**（state=pending-review）
3. **now — Review gate: x-hook-main-v1 Sanity 反映**（state=not-started で active 対象外なのでこれは not now）— 実際は active 3 件 (pending-review / in-progress / blocked) のみ
4. **soon — Generate visual: x-hook-main-v1 / threads-support-diagram-v1 / note-inline-content-os-flow-v1**（priority 順 top 3）
5. **later — 1 more visual asset not done**（残り 1 件、note-inline-human-judgment-v1 or substack-inline-reader-system-v1）
6. **later — Manual publishing pending: 4 platforms**（x / threads / note / substack）
7. **later — Publish packages still pending: N**（state != done のもの）

最終的に「全部 done なら No immediate blockers」だが、現状は active が多いので所定の優先順で出る。

## 連番について

- devlog: 0099 → **0100**
- handoff: 0110 → **0111**

## 発信ネタになりそうな切り口

1. **「boss-friendly な dashboard は "次にやること" を最初に見せる」**: data dump ではなく action focus。Next Actions component を上に置く効用。
2. **「seed の凍結状態 vs dataset の生きた状態の "ズレ" を UI 層で検出」**: campaignPlan.requiredVisualAssets[].state（seed 凍結）と visualAssetPlan.status（dataset 生きた状態）を `NextActionSummary` で reconcile。手動同期 cron が無くても UI で気づける。
3. **「Human Review Gates をバケット表示」**: 「待ち」「進行中」「ブロック」「未着手」の 4 バケットに分けることで、boss は最上段の "待ち" だけ見ればよい。脳の負荷↓。
4. **「Phase Admin 1 を localhost-only で完結」**: Auth なしで boss が daily で見る dashboard、deploy は Batch D で。早期 production 化を避ける trade-off。
5. **「Visual Asset を stub 化する判断」**: Batch C で完成させる予定の機能を、Batch B でナビ整合のためだけに stub にする。404 を出さない、Visual Register 外部リンクで誘導。

## Safety Verified

- direct Sanity write の grep（dashboard/src）: 0 hits
- paid LLM / image API SDK / OpenAI / Anthropic client の grep（dashboard）: 0 hits
- `npm run local:check`（root）: 17 ok / 0 fail
- root `npm run build`（Sanity Studio）: 成功
- dashboard `npm run build`（Next.js）: 成功（5 routes）
- 画像生成: 0 件
- schema 変更: 0 件
- assets/visuals / patches / publish-packages / seed: 不変
- Auth 機構: 未実装
- `npx sanity documents create` 実行: 0 回
- DNS / hosting: 触れていない
- ai-blog-db 関連: 不変
