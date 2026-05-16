# Devlog 0099 — Admin Phase 1 Batch A: Next.js scaffold + Campaign Detail page

Date: 2026-05-15
Status: **scaffold-complete / dashboard-build-green / route-render-blocked-by-private-dataset**

## 今日の判断

[docs/59](../59-admin-phase-1-implementation-plan.md) §9 Batch A の通り、`dashboard/` subdirectory に Next.js scaffold + 6 component + `/campaigns/[slug]` 1 画面を作った。`npm run build` は dashboard / root（Sanity Studio）両方 green。ただし **dev server で `/campaigns/building-hitori-media-os` を curl すると 404** が出る。原因は **Sanity dataset `production` が private** で、anonymous read が `null` を返すこと（CDN / live API どちらも）。

`src/lib/sanity.ts` を `SANITY_READ_TOKEN` 対応にし、README に「token 追加 or dataset public 化」の手順を追記。**実際の token 追加 / dataset 公開判断は人間アクション**（`.env.local` への書き込みは sandbox により Claude Code 側でブロック）。

## なぜその設計にしたか

- **dashboard を同 repo の subdirectory に置く**: 別 repo にすると env / schema 同期コストが増える。Phase Admin 1 終了時点で分離判断する余地を残す。
- **`useCdn: !readToken`**: 公開 dataset では CDN を使う（cost↓、latency↓）。private dataset で token を入れた場合、CDN は token を無視するため live API に自動切替（さもないと token を入れても null）。
- **page で `dynamic = 'force-dynamic'` + `revalidate = 0`**: campaignPlan は人間操作で頻繁に変わる前提なので、毎回 fetch。ISR は Phase Admin 2 以降で再評価。
- **6 component を read-only な dumb component に固定**: state なし、props で描画するだけ。Phase Admin 2 で write が入ったときに container/presenter 分離しやすい構造。
- **`StatusBadge` を共通化**: state enum（draft / done / pending-review / blocked 等）が 5 component で共通に出てくるので、tone マップを 1 箇所に集約。
- **GROQ で `*[_id == ^.X][0]` を使う**: campaignPlan の `requiredVisualAssets[].visualAssetPlanId` / `promptTemplateSelections[].promptTemplateId` / `requiredRecords[].recordId` は string ID（Sanity reference ではない）なので、`->` 構文が使えない。

## Codex と Claude Code の役割分担（再確認）

| 役割 | 担当 |
| --- | --- |
| Next.js scaffold + component + GROQ + page | **Claude Code（本バッチ）** |
| `.env.local` 作成 / read token 取得 | **人間アクション**（sandbox 制限） |
| dataset 公開判断 | 人間（trade-off あり） |
| dev server 起動 / 目視確認 | 人間（次のステップ） |

## API なしで済ませた理由（再確認）

- LLM API / 画像 API クライアントを repo に追加していない（grep 0 hits）。
- `npx sanity documents create` 0 回（読み取り query のみ）。
- write token なし、auto-posting なし、画像生成なし。
- 既存 schemas / `assets/visuals/` / `patches/` / `seed/` / `publish-packages/` 不変。

## このバッチで作ったもの / 変更したもの

### Added — `dashboard/` 配下

- `dashboard/` Next.js scaffold（Next.js 16.2.6 + React 19.2 + Tailwind v4 + TypeScript 5、`npx create-next-app@latest` 標準）
- `dashboard/.gitignore`（`.env*` 含む、scaffold 由来）
- `dashboard/next.config.ts`（`turbopack.root` を pin して lockfile 警告を消す）
- `dashboard/src/lib/sanity.ts`（read-only `@sanity/client`、`SANITY_READ_TOKEN` 対応、`useCdn: !readToken`）
- `dashboard/src/lib/groq/campaign.ts`（campaign detail / list クエリ + TS 型 11 件）
- `dashboard/src/components/StatusBadge.tsx`（共通 state tone）
- `dashboard/src/components/CampaignStatusCard.tsx`
- `dashboard/src/components/SelectedPlatformChips.tsx`
- `dashboard/src/components/HumanReviewGateList.tsx`
- `dashboard/src/components/VisualAssetStatusTable.tsx`
- `dashboard/src/components/PromptTemplateSummary.tsx`
- `dashboard/src/components/PublishPackageLinks.tsx`
- `dashboard/src/components/ManualPublishingStatusList.tsx`
- `dashboard/src/app/campaigns/[slug]/page.tsx`（Server Component、`async params` per Next 16 規約）
- `dashboard/README.md`（Setup / Environment / Dataset access / 構造 / 何を実装しない、書き直し）
- `dashboard/package.json` / `dashboard/package-lock.json`（`@sanity/client@^7.22.0` 追加）

### Added — docs

- `docs/devlog/0099-admin-phase-1-batch-a-campaign-detail.md`（本ファイル）
- `docs/handoff/0110-admin-phase-1-batch-a-campaign-detail.md`

### Modified

- `docs/handoff/latest.md` — 0110 にミラー

### Confirmed unchanged

- `schemas/` 全件（active 16）/ `sanity.config.ts` / `structure/index.ts`
- `tools/` / `package.json` / `package-lock.json`（root の方）
- 既存 seed / outputs / publish-packages / private / ai-blog-db 関連
- `assets/visuals/` / `patches/` / `assets/inbox/`
- 既存 12 schema 種別の dataset record
- root `npm run build` (Sanity Studio): ✓ green
- root `npm run local:check`: 17 ok / 0 fail

## 観察された事実 — Dataset access blocker

filesystem audit + curl テストで、以下を確認:

1. **CLI 経由のクエリは成功**（`npx sanity documents query` は user の auth token を使うため）
2. **anonymous curl は null を返す**:
   - `https://5f79ed6q.apicdn.sanity.io/v2025-08-15/data/query/production?...` → `{"result": null, ...}`
   - `https://5f79ed6q.api.sanity.io/v2025-08-15/data/query/production?...` → `{"result": null, ...}`
3. **Next.js dev server 経由の page render** → `notFound()` 発火、HTTP 404

→ **Dataset `production` は private**。Phase Admin 1 を実機で使うには:

- Option A: read-only token を発行 → `dashboard/.env.local` に `SANITY_READ_TOKEN=...` を書く（README に手順）
- Option B: dataset を public に切り替え（manage UI で）

どちらも **人間判断 + 人間アクション**。Claude Code は `.env*` を書けない（sandbox 制限）。

## Build / Render Results

| Check | Result |
| --- | --- |
| `cd dashboard && npm run build` | ✓ 1063 ms compile + 1047 ms typecheck + 167 ms static gen |
| `cd dashboard && npm run dev` | ✓ Ready in 239 ms (localhost:3000) |
| `cd dashboard && curl /campaigns/building-hitori-media-os` | **HTTP 404**（private dataset、token なし） |
| repo root `npm run build` (Sanity Studio) | ✓ 7,512 ms |
| repo root `npm run local:check` | ✓ 17/17 green |

## 連番について

- devlog: 0098 → **0099**
- handoff: 0109 → **0110**

## 発信ネタになりそうな切り口

1. **「scaffold 完了 ≠ render 成功」**: Next.js build green + dev server up でも、データソースの権限で 404 になる。Phase Admin 1 が前提とした「公開 dataset」仮定の見落とし。
2. **「CDN は token を無視する」**: 「Sanity の CDN は速いから使え」をデフォルトにすると、private dataset で token を入れた瞬間ハマる。`useCdn: !readToken` の自動切替パターン。
3. **「`.env.local` を Claude Code は書けない」**: sandbox 制限で `.env*` への書き込みが拒否される。secrets を agent に握らせない設計の副作用。
4. **「string ID dereference」**: `*[_id == ^.field][0]` が大量に出てくる Campaign Detail の GROQ。Sanity reference の方が validation も TS 型生成も楽だが、cross-type 配列を扱うときは string ID + GROQ join の方が柔軟。
5. **「Next.js 16 の async params」**: `params: Promise<{slug: string}>` + `await params`。training data よりも先の breaking change で、`AGENTS.md` がそれを agent に注意させる構造。

## Safety Verified

- direct Sanity write（コード経由）の grep: 0 hits
- paid LLM / image API client/SDK の repo 追加: 0 hits
- `npm run local:check`: 17 ok / 0 fail
- root `npm run build`: 成功
- dashboard `npm run build`: 成功
- 画像生成: 0 件
- schema 変更: 0 件
- assets/visuals / patches / publish-packages / seed: 不変
- Auth 機構: 未実装
- `npx sanity documents create` 実行: 0 回（read query のみ）
- DNS / hosting: 触れていない
- ai-blog-db 関連: 不変
