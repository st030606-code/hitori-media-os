# Handoff: Admin Phase 1 — Batch A (Next.js scaffold + Campaign Detail page)

Date: 2026-05-15
Status: **scaffold-complete / dashboard-build-green / campaign-detail-render-blocked-by-private-dataset / awaiting-human-token-or-dataset-public-decision**

## 1. Task Goal

[docs/59](../59-admin-phase-1-implementation-plan.md) §9 Batch A の通り、`dashboard/` subdirectory に Next.js scaffold + 6 component + `/campaigns/[slug]` 1 画面を作る。読み専用 Sanity client、最小限の dependencies、root の Sanity Studio build を壊さない。

## 2. Constraints Followed

- Next.js を `dashboard/` 配下にのみ scaffold（既存 root の `package.json` / `node_modules` 不変）。
- Auth を実装していない。
- paid API integration を追加していない（`@sanity/client` のみ依存追加）。
- OpenAI / Anthropic クライアントを追加していない。
- auto-postingを実装していない。
- Sanity direct write をコードに実装していない（read-only client、`useCdn: !readToken`、mutate/patch ヘルパー export なし）。
- Sanity write token を仕込んでいない（`SANITY_READ_TOKEN` のみオプショナル）。
- 既存 active schemas / `sanity.config.ts` / `structure/index.ts` / `tools/` / 既存 `package.json` を変更していない。
- 画像 candidate を生成していない。
- `assets/visuals/...` / `patches/...` / `assets/inbox/`を変更していない。
- publish-packages を本バッチで変更していない。
- Dashboard Home / Campaign list は本バッチで作っていない（Batch A の scope 通り、1 画面のみ）。
- 既存 root `npm run build`（Sanity Studio）green を維持（最終確認 7,512 ms）。

## 3. Changed Files

### Added — `dashboard/` 配下（新規）

| Path | 役割 |
| --- | --- |
| `dashboard/` | Next.js 16.2.6 scaffold（`npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*" --use-npm --eslint --no-turbopack --yes`） |
| `dashboard/package.json` | dependencies: `next@16.2.6`, `react@19.2.4`, `react-dom@19.2.4`, `@sanity/client@^7.22.0` |
| `dashboard/next.config.ts` | `turbopack.root` を `__dirname` に pin（lockfile auto-detect 警告解消） |
| `dashboard/.gitignore` | scaffold 由来、`.env*` 除外 |
| `dashboard/src/lib/sanity.ts` | read-only `@sanity/client`、`SANITY_READ_TOKEN` 対応、`useCdn: !readToken`、`studioDocumentUrl()` helper |
| `dashboard/src/lib/groq/campaign.ts` | `campaignDetailBySlugQuery` / `campaignListQuery` + TS 型 11 件 |
| `dashboard/src/components/StatusBadge.tsx` | 共通 state tone（done / progress / pending / blocked / idle / info） |
| `dashboard/src/components/CampaignStatusCard.tsx` | header + progress summary |
| `dashboard/src/components/SelectedPlatformChips.tsx` | platform / priority / contentDepth chips |
| `dashboard/src/components/HumanReviewGateList.tsx` | 9 段 gate ordered list + state symbol |
| `dashboard/src/components/VisualAssetStatusTable.tsx` | requiredVisualAssets 7 行 table |
| `dashboard/src/components/PromptTemplateSummary.tsx` | promptTemplateSelections + dereferenced template |
| `dashboard/src/components/PublishPackageLinks.tsx` | publishPackagePaths + releaseReviewPath |
| `dashboard/src/components/ManualPublishingStatusList.tsx` | publishedUrl / publishedAt / reactionNotes（optional） |
| `dashboard/src/app/campaigns/[slug]/page.tsx` | Server Component、`async params`、`dynamic = 'force-dynamic'`、Read-only banner / 11 section |
| `dashboard/README.md` | Setup / Environment / Dataset access / Tech stack / Project layout / Related docs / Next batches |
| `dashboard/AGENTS.md` / `dashboard/CLAUDE.md` | scaffold 由来（Next.js 16 注意） |

`dashboard/node_modules/`（360 + 5 packages） も追加。

### Added — docs/

- `docs/devlog/0099-admin-phase-1-batch-a-campaign-detail.md`
- `docs/handoff/0110-admin-phase-1-batch-a-campaign-detail.md`

### Modified

- `docs/handoff/latest.md` — 本 0110 にミラー

### Confirmed unchanged

- `schemas/` 全件（active 16）
- `sanity.config.ts` / `structure/index.ts` / `tools/`
- root `package.json` / `package-lock.json`
- 既存 seed / outputs / publish-packages / private / ai-blog-db 関連
- `assets/visuals/` / `patches/` / `assets/inbox/`
- 既存 12 schema 種別の dataset record（contentIdea / platformOutput / visualAssetPlan / etc）
- 直近投入の 4 record（brandProfile / visualStyleProfile / promptTemplate / campaignPlan）— 追加変更なし

## 4. Summary of Changes

### A. Tech stack 実装

| 層 | 選定 |
| --- | --- |
| framework | Next.js 16.2.6 (App Router, Turbopack default) |
| view | React 19.2.4 |
| styling | Tailwind CSS v4 |
| data | `@sanity/client` v7.22, `useCdn: !readToken`, `perspective: 'published'` |
| Auth | **なし** |
| testing | スキップ（Batch A） |
| typing | TypeScript 5、`async params: Promise<{slug: string}>` per Next 16 規約 |

### B. GROQ — string ID dereference パターン

`campaignDetailBySlugQuery` は以下を含む:

- `sourceContentIdea->{...}` / `brandProfile->{...}`（**Sanity reference**、`->` で OK）
- `visualAssetDetails[]{plan: *[_id == ^.visualAssetPlanId][0]{...}}`（**string ID**、`*[_id == ^.X][0]` 必須）
- `promptTemplateDetails[]{template: *[_id == ^.promptTemplateId][0]{..., brand: brandProfile->{}, style: visualStyleProfile->{}}}`（**string ID + 中で 2 段 reference deref**）
- `recordDetails[]{doc: *[_id == ^.recordId][0]{_id, _type, status}}`（**cross-type string ID**）

### C. Page composition — Campaign Detail (`/campaigns/[slug]`)

11 section、すべて read-only:

1. Read-only banner（"Phase Admin 1 is read-only..."）
2. `CampaignStatusCard`（title / slug / status / type / mode / auto / coreThesis / progress 4 軸）
3. Source Content Idea（dereferenced contentIdea）
4. Brand Profile（dereferenced brandProfile）
5. `SelectedPlatformChips`（4 platforms）
6. `HumanReviewGateList`（9 段）
7. `VisualAssetStatusTable`（7 行）
8. `PromptTemplateSummary`（template + brand + style 各 deref）
9. `PublishPackageLinks`（4 paths + release-review）
10. `ManualPublishingStatusList`（optional、空なら非表示）
11. External Links（Studio deep link + Visual Register localhost:3334）

### D. Build / Render Results

| Check | Result |
| --- | --- |
| `cd dashboard && npm run build` | ✓ 1063 ms compile + 1047 ms TS + 167 ms static gen |
| `cd dashboard && npm run dev` | ✓ Ready in 239 ms (localhost:3000) |
| `curl http://localhost:3000/campaigns/building-hitori-media-os` | **HTTP 404**（→ §5 で詳述） |
| root `npm run build` (Sanity Studio) | ✓ 7,512 ms（green） |
| root `npm run local:check` | ✓ 17/17 green |
| direct Sanity write code grep | 0 hits |
| paid LLM/image API SDK in repo | 0 hits |

## 5. 発生した issue — Dataset is private

### 観察

- `npx sanity documents query` で campaignPlan は返る（CLI は user 認証 token を使うため）
- `curl https://5f79ed6q.api.sanity.io/v2025-08-15/data/query/production?query=...` は anonymous で `{"result": null}` を返す
- `curl https://5f79ed6q.apicdn.sanity.io/...` も同様
- → **dataset `production` は private**、anonymous read 不可

### 対応

`src/lib/sanity.ts` を `SANITY_READ_TOKEN` 対応に修正:

- token が set されていれば `useCdn: false` で live API へ
- token が無ければ従来通り `useCdn: true`（公開 dataset 用）

**`.env.local` への token 書き込みは Claude Code 側で sandbox 拒否**（`.env*` への write は denied）。→ **人間アクション必須**。

`dashboard/README.md` に「Option A: read token / Option B: dataset を public 化」の手順を追記。

### Phase Admin 1 trigger 状態への影響

Phase Admin 0 → 1 trigger 4 条件は変わらず達成済 ([batch 0097/0108](0108-insert-campaign-generation-seeds.md))。Batch A は **scaffold + build green** 段階まで完走、**実機 render は dataset access 解消後**。

## 6. Important Decisions

- **`dashboard/` を同 repo の subdirectory に配置**: schema / env を共有しやすい、Phase Admin 1 完了時に分離判断
- **`useCdn: !readToken` の自動切替**: 公開 dataset では CDN（速い・安い）、private dataset + token では live API（CDN は token 無視のため）
- **Page を `dynamic = 'force-dynamic'` + `revalidate = 0`**: campaignPlan は頻繁に変わる前提、毎回 fetch。ISR は Phase Admin 2 で再評価
- **`StatusBadge` を 1 component に集約**: state enum tone マップを 1 箇所に
- **`turbopack.root` を pin**: `~/package-lock.json` の auto-detect 警告を抑制
- **`.env.local` を Claude Code が作らない**: sandbox 制限 + secret hygiene、人間が手動で
- **GROQ で `*[_id == ^.X][0]` を使う**: string ID 配列を deref。Sanity reference の `->` は使えない（type 違い）

## 7. Human Review Questions

- Dataset access の Option A (read token) と Option B (public dataset) のどちらを取るか？（推奨: A、building-in-public でも dataset 内に下書きが残るため）
- Option A の場合、`SANITY_READ_TOKEN` を `dashboard/.env.local` に追加して `npm run dev` で localhost:3000/campaigns/building-hitori-media-os が render することを確認できるか？
- render 確認後、Batch B（Dashboard Home + Campaigns list + Human Review Gates）に進むか、それとも Campaign Detail を運用しながら微調整を入れるか？
- `dashboard/` を将来別 repo にする判断は Phase Admin 1 完了時でよいか、それとももっと早く？

## 8. Risks or Uncertainties

- **README の手順を踏まずに `npm run dev` を起動すると 404 が出る**: ユーザーが「dashboard 壊れてる」と勘違いするリスク。README の Dataset access 節を最初に読む流れを徹底
- **Next.js 16 + React 19.2 Canary は新しめ**: 突然の breaking change のリスク（`dashboard/AGENTS.md` がそれを Codex / Claude Code に注意させる）
- **Token を `.env.local` に書いた後の事故**: Claude Code が誤って token を含むファイルを git add / commit する経路は基本ない（`.gitignore` で `.env*` 除外、コマンド権限で `git add -A` は使わない方針）が、人間が他の context で誤コミットするリスクは別
- **同 repo に Next.js 16 を入れたことで root `node_modules` と衝突しないか**: `dashboard/node_modules` は subdirectory に独立、root の Sanity build は green を維持。ただし将来 monorepo tooling（npm workspace 等）を入れる場合は再設計
- **string ID dereference の typo**: GROQ で typo すると `plan: null` が silent に出る。dashboard UI で「Reference not in dataset」表示 + Studio 直リンクを既に提供 (`VisualAssetStatusTable` / `PromptTemplateSummary` の empty state)

## 9. Recommended Next Step

### Immediate Human Actions（順序厳守）

1. **`dashboard/README.md` の "Dataset access" を読む**
2. **Option A**: <https://sanity.io/manage> → project `5f79ed6q` → API → Tokens → 新規 viewer token 作成 → 値をコピー
3. **`dashboard/.env.local` を手動作成** + 4 行を貼る:
   ```text
   NEXT_PUBLIC_SANITY_PROJECT_ID=5f79ed6q
   NEXT_PUBLIC_SANITY_DATASET=production
   NEXT_PUBLIC_SANITY_API_VERSION=2025-08-15
   SANITY_READ_TOKEN=<paste>
   ```
4. `cd dashboard && npm run dev`
5. ブラウザで `http://localhost:3000/campaigns/building-hitori-media-os` を開いて 11 section の render を確認
6. 違和感があれば（typo / 表記 / カラー）docs/59 §6 と diff を取って Claude Code に修正依頼

### Next Implementation Batches

1. **Batch B**: Dashboard Home + Campaigns list + `/human-review-gates`（残り 3 component: `PublishPackageLinks` は既存、`BrandProfileSummary` / `DiagnosticsSummary` は新規）
2. **Batch C**: `/visual-assets` / `/publish-packages` / `/diagnostics` / `/activity-log`
3. **Batch D**: Vercel deploy + DNS (`app.hitorimedia.com`) + Basic Auth or middleware
4. （任意・並走）`structure/index.ts` `directGroupedTypes` に `campaignPlan` 追加で "Content Ideas → By Content Idea → Campaign Plans" view
5. （任意・並走）`tools/codex-workflow/` に diff watcher script

### Deferred（永続）

- paid LLM / image API integration
- auto-posting / automated publish
- AI auto-review of drafts
- multi-user / collaboration
- billing / paid tier
- analytics fetch / charts

## 10. Exact Prompt to Give Codex Next

```text
Verify Batch A render and proceed to Batch B (Dashboard Home + Campaigns list + Human Review Gates).

Prerequisite (human action):
- dashboard/.env.local must include SANITY_READ_TOKEN (or dataset is public).
- `cd dashboard && npm run dev` must render http://localhost:3000/campaigns/building-hitori-media-os.

Hard Rules:
- Stay within dashboard/ subdirectory.
- Do NOT modify schemas/, structure/, sanity.config.ts, tools/.
- Do NOT add Auth.
- Do NOT add Sanity write token usage.
- Do NOT add OpenAI / Anthropic API clients.
- Do NOT auto-post.
- Do NOT modify assets/visuals/... or patches/...
- Do NOT generate images.
- Do NOT break existing dashboard render or root Sanity Studio build.

Use:
- docs/59-admin-phase-1-implementation-plan.md (§7, §8, §9 Batch B)
- dashboard/src/lib/groq/campaign.ts (extend with list / gates / dashboard home queries)

Steps:
1. Verify /campaigns/[slug] renders end-to-end (curl + screenshot description).
2. Add `BrandProfileSummary` component (reusable summary block).
3. Add `DiagnosticsSummary` component (npm run local:check + dataset counts).
4. Implement Dashboard Home at `src/app/page.tsx` (replace default scaffold landing).
5. Implement `src/app/campaigns/page.tsx` (campaign list).
6. Implement `src/app/human-review-gates/page.tsx` (pending gates aggregator across all campaigns).
7. Wire navigation: a minimal top nav linking to Home / Campaigns / Human Review Gates / Visual Assets (Visual Assets is a stub until Batch C).
8. dashboard `npm run build` + `npm run dev` + curl each new route.
9. Update docs/devlog/0100-* and docs/handoff/0111-* with results.
```
