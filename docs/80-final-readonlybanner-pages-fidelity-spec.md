# Final ReadOnlyBanner Pages Fidelity Spec — /campaigns, /human-review-gates, /publish-package/[slug]

最終更新: 2026-05-20
ステータス: Implementation spec (audit-only batch、コード変更なし)
対象 routes:
- `/campaigns` (campaign list、`<ReadOnlyBanner />` × 1)
- `/human-review-gates` (gate aggregator、`<ReadOnlyBanner />` × 1)
- `/publish-package/[slug]` (worker-facing copy UI、`<ReadOnlyBanner />` × 2)

依存: docs/68 (design system) / docs/69 (Phase UI plan) / docs/handoff/0162 (latest tone after final placeholder pages)

## 戦略的目的

handoff/0160 §6 / handoff/0162 §8 で「中期 cleanup 候補」とされた `ReadOnlyBanner.tsx` の削除に到達するための fidelity batch。実装後に `ReadOnlyBanner` import が 0 件になり、後続 microbatch で `rm` できる状態を作る。

**range of touch**:
- `/campaigns`: 既に PageHeader 採用済 → 軽い fidelity 改善 (Breadcrumb + KpiCardsRow 追加 + ReadOnlyBanner 削除) のみ
- `/human-review-gates`: 古い `<header>` + h1 + `max-w-6xl` → 完全 fidelity 再構成
- `/publish-package/[slug]`: boss が **「触らない」と明示した copy-friendly UI** → ReadOnlyBanner 削除のみの "surgical" touch、layout は無変更

3 page をまとめて 1 batch で実装、その直後の cleanup microbatch で `ReadOnlyBanner.tsx` を `rm`。Hitori Media OS UI fidelity cycle の完全終了。

---

## A. `/campaigns` (list) fidelity spec

### A-1. Current structure

`dashboard/src/app/campaigns/page.tsx` (143 行)。

```
[ReadOnlyBanner (no-op)]
[PageHeader title="キャンペーン" description="N 件 ... 管理しています。"]
  // 既に PageHeader を使用 (Phase UI-1 着手時から)
[<section> empty state OR <table>:
  thead: タイトル / 状態 / 媒体 / 進捗 / (actions)
  tbody: CampaignRow per campaign
]

[CampaignRow]:
  - tr (hover:bg-slate-50)
  - title + slug + sourceContentIdea
  - StatusBadge + automationLevel
  - PlatformBadge list (max 6 + overflow count)
  - progress bar (公開済 vs 画像進捗) + label
  - ChevronRight icon link to /campaigns/[slug]
```

**評価**: 既に `max-w-[1280px]` + PageHeader + StatusBadge + PlatformBadge + table 構造で fidelity tone とほぼ整合。残る不足は (1) ReadOnlyBanner の no-op call、(2) Breadcrumb なし、(3) KpiCardsRow なし、(4) `actions` placeholder column が空。

### A-2. Current data sources

| Source | Field |
|---|---|
| `campaignListQuery` (lib/groq/campaign.ts、既存) | campaign list with `selectedPlatforms` / `manualPublishingDoneCount` / `manualPublishingNotStartedCount` / `doneVisualsCount` / `totalVisualsCount` / `status` / `automationLevel` / `sourceContentIdea` |

データ取得ロジックは **fidelity batch でも変更なし**。

### A-3. ReadOnlyBanner usage

- 1 件 (`page.tsx:5` import + `page.tsx:22` 呼び出し)
- 既存 `<ReadOnlyBanner />` は `return null` の no-op。Topbar の `<ReadOnlyPill />` が代替表示
- 削除のみで動作変化なし

### A-4. Target structure

```
[Breadcrumb: ダッシュボード > キャンペーン]
[PageHeader:
  title「キャンペーン」(現状維持)
  description: 「N 件のキャンペーンプランを管理しています。」(現状維持)
  Actions: なし (P1 で「新規キャンペーン (Studio)」external link 候補)
  Meta: (オプション) アクティブ件数 chip
]
[KpiCardsRow (4):
  - 全キャンペーン (campaigns.length, Rocket, slate)
  - active (status in draft/planning/generating/reviewing, Activity, blue)
  - 公開済み (manualPublishingDone 合計, CheckCircle2, emerald)
  - レビュー待ち (pendingGates 合計、Eye, amber) — 既存 dashboardHomeQuery 流用候補、ただし campaignListQuery には pendingGatesCount フィールドが既にある
]
[既存 table 構造 (現行のまま)]
[empty state: 既存 → border-dashed 改善 (現状でも border-dashed)]
```

### A-5. Component replacements

| Old | New |
|---|---|
| `<ReadOnlyBanner />` | drop (Topbar の ReadOnlyPill が代替) |
| 既存 PageHeader | breadcrumb props 追加 |
| (なし) | KpiCardsRow + 4 KpiCard (新規追加) |
| 既存 table | reuse as-is |
| 既存 CampaignRow | reuse as-is |
| 既存 empty state | reuse、Visual Review 系と tone 揃え (`bg-slate-50` 追加) |

### A-6. Likely files affected

- `dashboard/src/app/campaigns/page.tsx` (update only)
- 新規 component: なし (既存 reuse)

### A-7. P0 / P1 / P2 scope

- **P0**: ReadOnlyBanner 削除 / Breadcrumb 追加 / KpiCardsRow 4 件追加
- **P1**: search + status filter / sort options / 「新規キャンペーン (Studio)」action button
- **P2**: bulk action (archive / status change) — 要 write actions、Phase 2B 議論

---

## B. `/human-review-gates` fidelity spec

### B-1. Current structure

`dashboard/src/app/human-review-gates/page.tsx` (134 行)。

```
[<main max-w-6xl px-4 py-8>]  // fidelity 基準は max-w-[1280px] + py-6
[ReadOnlyBanner (no-op)]
[<header>
  <h1 text-2xl>「Human Review Gates」 (英語タイトル)
  <p>「Aggregated across all campaign plans. {totalActive} gates ...」(英語)
]
[4 セクション (bucket-grouped):
  - Pending review
  - In progress
  - Blocked
  - Not started
  各セクション:
    <section card>
      <header> h2「{title}」+ StatusBadge with count + (right) "No gates ..." note
      <ul divide-y> per-gate:
        gate.gateName + StatusBadge
        meta: campaign link + reviewer + completedAt
        gate.notes (truncate なし)
]
```

**評価**: 最も outdated な fidelity (English title / max-w-6xl / py-8)。完全再構成が妥当。

### B-2. Current data sources

| Source | Field |
|---|---|
| `pendingHumanReviewGatesQuery` (lib/groq/campaign.ts、既存) | per-campaign gates aggregator |

`flatten()` で bucket map に整理、`formatDate()` で ISO → display string。

データ取得ロジックは **fidelity batch でも変更なし**。

### B-3. ReadOnlyBanner usage

- 1 件 (`page.tsx:8` import + `page.tsx:68` 呼び出し)
- 削除のみで動作変化なし

### B-4. Target structure

```
[Breadcrumb: ダッシュボード > 確認待ちゲート]
[PageHeader:
  title「確認待ちゲート」 (日本語 rename、boss 確認推奨)
  description: 「全キャンペーン横断の human review gate を bucket 別に表示します。」
  Meta: 「active: {pending + in-progress + blocked} 件 / not-started: {N} 件」
]
[KpiCardsRow (4):
  - レビュー待ち (pending-review count, Eye, amber)
  - 作業中 (in-progress count, Loader, blue)
  - ブロック (blocked count, AlertOctagon, red)
  - 未着手 (not-started count, Clock, slate)
]
[GateBucketSection per bucket (4 sections):
  - <section card>:
    - inline <header> + h2 + count chip
    - <ul divide-y> per-gate (既存と同型、ただし design tone 揃え):
      - gate.gateName + StatusBadge
      - campaign link to /campaigns/[slug]
      - reviewer / completedAt (tabular-nums)
      - notes (line-clamp-2 + 「全文を見る」collapsible)
]
[Empty state: 全 bucket が 0 件 → inline border-dashed]
```

### B-5. Component replacements

| Old | New |
|---|---|
| `<ReadOnlyBanner />` | drop |
| `<header>` + h1 「Human Review Gates」 | `<PageHeader title="確認待ちゲート" breadcrumb={...} meta={...} />` |
| `max-w-6xl py-8` | `max-w-[1280px] py-6` |
| 英語 "Pending review / In progress / Blocked / Not started" | 日本語 4 ラベル (KpiCard label と整合) |
| section header (h2 + StatusBadge) | inline `<header>` + h2 + count chip (Visual Review pattern) |
| gate.notes 直表示 | line-clamp-2 + `<details>` で全文 |

### B-6. Likely files affected

- `dashboard/src/app/human-review-gates/page.tsx` (rewrite)
- 内部 `flatten()` + `formatDate()` helper は維持
- (option) `dashboard/src/components/human-review-gates/GateBucketSection.tsx` 新規 — または inline で OK (1 file 完結)

### B-7. P0 / P1 / P2 scope

- **P0**: PageHeader + Breadcrumb / max-w / 4 KpiCard / 日本語 rename / inline `<header>` + line-clamp / ReadOnlyBanner 削除
- **P1**: campaign filter (特定 campaign の gates のみ表示) / sort by reviewer or completedAt / GateBucketSection 共通化
- **P2**: gate state change (write action、Phase 2B 議論)

---

## C. `/publish-package/[slug]` fidelity spec

### C-1. Current structure

`dashboard/src/app/publish-package/[slug]/page.tsx` (740 行) — 最大の page。boss が **「触らない」と明示** している copy-friendly worker UI。

```
[enableLocalFsRoutes === false ブランチ (404 代替):
  <main max-w-4xl py-10>
  <ReadOnlyBanner />
  <section amber-300> warning「ローカル環境専用」+ 起動コマンド説明
]

[通常ブランチ:
  <main max-w-5xl py-8>
  <ReadOnlyBanner />  ← 2 回目
  <PageHeader pkg={pkg} publishState={publishState} />
  <PlatformOverviewCards pkg={pkg} publishState={publishState} />
  <XSection pkg={pkg} platformState={...} />
  <ThreadsSection ... />
  <NoteSection ... />
  <SubstackSection ... />
  <ReleaseReviewFooter pkg={pkg} />
]
```

各 Section (X / Threads / note / Substack) は CopyButton + 投稿文 + 画像 + 公開済 URL/badges などを含む。**boss の workflow に密接に最適化されている**。

### C-2. Current data sources

| Source | Field |
|---|---|
| `readPublishPackage(slug)` (fs reader、既存) | publish-packages/<platform>/<slug>/ から content + image を組み立て |
| `publishPackageStateBySlugQuery` (lib/groq/publishPackage、既存) | campaign の `manualPublishingStatus` aggregation |
| `enableLocalFsRoutes` flag | production では fs reader を skip、disabled ブランチに分岐 |

データ取得ロジックは **fidelity batch でも完全に変更なし**。

### C-3. ReadOnlyBanner usage

- 2 件 (`page.tsx:4` import + `page.tsx:42` 呼び出し + `page.tsx:64` 呼び出し)
- それぞれ disabled ブランチと通常ブランチで重複
- 削除のみで動作変化なし

### C-4. Target structure (minimal surgical change)

**boss 指示**: copy-friendly behavior と publish package parsing は無変更。layout も触らない。`ReadOnlyBanner` 削除のみが本 batch のスコープ。

```
[enableLocalFsRoutes === false ブランチ:
  <main max-w-4xl py-10>  // そのまま維持
  // <ReadOnlyBanner /> 削除
  <section amber-300> ...  // そのまま維持
]

[通常ブランチ:
  <main max-w-5xl py-8>  // そのまま維持
  // <ReadOnlyBanner /> 削除
  <PageHeader pkg={pkg} publishState={publishState} />  // そのまま維持
  ... (以下すべて維持)
]
```

**変更点**: import 削除 + 2 箇所の `<ReadOnlyBanner />` 削除のみ。**それ以外は完全 untouched**。

### C-5. Component replacements

| Old | New |
|---|---|
| `<ReadOnlyBanner />` (×2) | drop only |
| (それ以外すべて) | **触らない** |

### C-6. Likely files affected

- `dashboard/src/app/publish-package/[slug]/page.tsx` (surgical edit — import 削除 + 2 行削除のみ)
- 内部の PageHeader / PlatformOverviewCards / XSection / ThreadsSection / NoteSection / SubstackSection / ReleaseReviewFooter / Pair / PublishedBadge / PublishedStatusBlock 等 すべて維持

### C-7. P0 / P1 / P2 scope

- **P0**: ReadOnlyBanner import 削除 + 2 箇所削除のみ (3 行変更)
- **P1**: なし (boss 指示で触らない)
- **P2**: Phase 2B 議論 (`manualPublishingStatus` 書き込み等)

**理由**: この page は 740 行の手作業最適化済 UI で、boss が「これで動いている」と明示。fidelity tone と完全に揃っていなくても、boss の publishing workflow を壊すリスクを取らない方が ROI 高い。

---

## D. Cleanup chain

### D-1. Phase UI-fidelity-10 実装直後の状態

3 page で `<ReadOnlyBanner />` の呼び出しと import が 0 件になる:

```bash
grep -rn "ReadOnlyBanner" dashboard/src
# → 0 lines (component definition `ReadOnlyBanner.tsx` のみ残置)
```

### D-2. その後の cleanup microbatch (follow-up)

```text
Delete ReadOnlyBanner after Phase UI-fidelity-10.

Use:
- docs/handoff/0163-final-readonlybanner-pages-fidelity-spec.md (latest tone)
- Phase UI-fidelity-10 完了後の grep 結果

Hard Rules:
- 削除前に import count 0 を grep で確認
- Do NOT touch active components

Tasks:
1. Re-verify: grep -rn "ReadOnlyBanner" dashboard/src → 0 lines
2. Delete dashboard/src/components/ReadOnlyBanner.tsx
3. cd dashboard && npm run build → 23 routes 維持
4. npm run build (Sanity Studio) → clean
5. Write docs/devlog/0154-readonlybanner-final-delete.md + docs/handoff/0165 + latest mirror
```

実装 batch + cleanup microbatch の **2 段で連鎖完了**。`ReadOnlyBanner.tsx` 削除をもって **Hitori Media OS UI fidelity の dead-code cleanup が完全終了**。

### D-3. 連鎖の最終状態

| Component | 削除タイミング |
|---|---|
| `SummaryCard.tsx` | Phase UI-fidelity-8 cleanup (完了済) |
| `SectionHeader.tsx` | 同上 |
| `EmptyState.tsx` | 同上 |
| `FilePathBlock.tsx` | 同上 |
| `EmptyCandidateState.tsx` | Phase UI-fidelity-8 final microbatch (完了済) |
| `AppNav.tsx` | Phase UI-fidelity-7 cleanup (完了済) |
| `ReadOnlyBanner.tsx` | **本 spec → Phase UI-fidelity-10 → 追加 microbatch で完了予定** |
| (旧 VisualAssetHeader / CandidateGrid 等) | Phase UI-fidelity-7 (完了済) |

---

## E. Implementation Order

### Option A (推奨): `/campaigns` → `/human-review-gates` → `/publish-package/[slug]`

**理由**:
1. **`/campaigns`** は **最も軽い** (既に PageHeader、改善は Breadcrumb + KpiCardsRow + ReadOnlyBanner 削除の 3 アイテム)。pilot として最適
2. **`/human-review-gates`** は最も outdated で、4 bucket 構造を KpiCardsRow + section 群に再構成する **中規模**。pattern は `/campaigns` で確認後に展開
3. **`/publish-package/[slug]`** は最も慎重に。surgical edit (3 行) のみで他は完全 untouched

**1 batch でまとめて実装** (Phase UI-fidelity-1〜9 と同じ規模感)。

### Option B: `/publish-package/[slug]` を先

surgical edit が一番リスク低い → 真っ先にやって ReadOnlyBanner import 数を 4 → 2 に減らす。続いて `/campaigns` (3 → 1)、最後 `/human-review-gates` (1 → 0)。順番に grep 結果を確認しやすい。

**推奨**: Option A (`/campaigns` を pilot)。理由: `/publish-package/[slug]` は boss が触らない方針なので、最後に短時間で済ませて Phase 2B 議論への接続を切らない。

---

## F. Constraints (本 spec & 実装 batch)

- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ publish-package files 不変
- ✅ assets/visuals / patches 不変
- ✅ deploy なし
- ✅ auto-post なし
- ✅ package 追加なし、shadcn 追加なし
- ✅ 23 routes 動作維持
- ✅ **`/publish-package/[slug]` の copy-friendly behavior 完全保護** (boss 指示)
- ✅ publish package parsing (`readPublishPackage`) は touch なし
- ✅ データ取得ロジック (`campaignListQuery` / `pendingHumanReviewGatesQuery` / `readPublishPackage` / `publishPackageStateBySlugQuery`) は完全 touch なし
- ✅ 既存 fidelity 化済 page (Phase UI-fidelity-1〜9) は unchanged (shared common: PageHeader / KpiCard / Breadcrumb / StatusBadge / PlatformBadge のみ reuse)
- ✅ Phase 2B write actions は scope 外

---

## G. Boss Decision Points (Phase UI-fidelity-10 着手前)

1. **`/human-review-gates` の rename**: 「Human Review Gates」 → 「確認待ちゲート」 / 「人間レビュー」 / 「レビューゲート」のいずれにするか?
2. **`/campaigns` の Actions**: 「新規キャンペーン (Studio)」external link を P0 で含めるか、P1 まで delay か?
3. **`/human-review-gates` の bucket 並び順**: pending-review → in-progress → blocked → not-started で boss の優先順位と合致するか?
4. **`/publish-package/[slug]` の Breadcrumb 追加**: surgical edit に Breadcrumb を 1 行追加するか?「触らない」を厳格に守るか?
   - 推奨: 追加しない (boss 指示厳守)
5. **`/human-review-gates` の GateBucketSection 共通化**: 4 bucket で同じ pattern を繰り返すので、1 sub-component に抽出するか、それとも inline で 1 file 完結?
   - 推奨: inline (YAGNI)
6. **`/campaigns` の KpiCard 4 件**: 「全キャンペーン / active / 公開済み / レビュー待ち」で boss 視点と合致するか?

---

## H. Out of scope

- AppShell / Sidebar / Topbar (UI-1 完成)
- Sanity schema 変更
- `/publish-package/[slug]` の layout 改変 (boss 指示で触らない)
- publish package parsing (`readPublishPackage`) の改修
- gate state 書き込み (Phase 2B)
- campaign 新規作成 / archive 等の write actions
- ReadOnlyBanner.tsx 本体の削除 (本 spec ではなく、follow-up microbatch で実行)

---

## I. Phase UI-fidelity-10 着手後の状態

実装完了後:

- ✅ 23 routes すべて fidelity 化済 (Phase UI-fidelity-1〜10)
- ✅ Sidebar 9 nav items 全 fidelity、加えて `/campaigns` list / `/human-review-gates` / `/publish-package/[slug]` も fidelity tone に整合
- ✅ `ReadOnlyBanner` import 数 = 0、follow-up microbatch で `rm` 可能
- ✅ **Hitori Media OS UI fidelity cycle が完全終了**

残る作業:
- ❌ ReadOnlyBanner.tsx 本体削除 (follow-up microbatch)
- ❌ dashboard/README.md 全体書き直し
- ❌ Phase Admin 1 Batch A/B/C 時代 component audit (CampaignStatusCard 等)
- ❌ Phase 2B 議論 (実 write actions)
- ❌ 外部 analytics API integration (Phase Analytics-2)
- ❌ promptTemplate dataset 投入 (boss 担当)
