# Handoff: Phase UI-fidelity-7 Visual Review P1 cards

Date: 2026-05-19

## 1. Task Goal

docs/77 §4-1 (P1) と docs/handoff/0154 §8 で残していた Visual Review P1 を実装。Rubric / Notes / Prompt 全文 / FilePaths / CampaignContext / consolidated Actions の 7 card + FilterBar URL searchParams sync + AssetCard fallback chain 強化 (latest v00N) を 1 batch で。実 write actions は依然 scope 外 (Phase 2B)。

## 2. Constraints Followed

- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ publish-package files 不変
- ✅ assets/visuals 不変
- ✅ patches 不変
- ✅ deploy なし
- ✅ auto-post なし
- ✅ package 追加なし、shadcn 追加なし
- ✅ 23 routes 動作維持 (dashboard TypeScript clean、build green)
- ✅ Sanity Studio 7.6s clean
- ✅ `/publish-package/[slug]` v0.2 unchanged
- ✅ `/configurator`, `/publish`, `/outputs`, `/campaigns/[slug]`, `/` unchanged (shared common: PageHeader / KpiCard / PlatformBadge / StatusBadge / CopyButton のみ reuse)
- ✅ Phase 2B write actions 未実装、Visual Register external link 経由 + DeferredActionButton placeholder のみ

## 3. Changed Files

### 新規 (8)

- `dashboard/src/lib/visualAssets/inboxLookup.ts` (helper)
- `dashboard/src/components/visual-review/PromptSummaryCard.tsx`
- `dashboard/src/components/visual-review/RubricChecklistCard.tsx`
- `dashboard/src/components/visual-review/RubricScoresCard.tsx`
- `dashboard/src/components/visual-review/NotesCard.tsx`
- `dashboard/src/components/visual-review/CampaignContextCard.tsx`
- `dashboard/src/components/visual-review/FilePathsCard.tsx`
- `dashboard/src/components/visual-review/ActionsCard.tsx`

### 更新 (5)

- `dashboard/src/app/visual-assets/page.tsx` — searchParams 受領 + initialFilter resolve + buildLatestInboxPaths (Promise.all) + props pass-through
- `dashboard/src/app/visual-assets/[assetId]/page.tsx` — 旧 inline PathRow + 旧 Actions section → P1 cards (CampaignContext / RubricChecklist / FilePaths / Actions / PromptSummary)
- `dashboard/src/app/visual-assets/[assetId]/candidates/page.tsx` — `readPromptBody` を Promise.all で並列 fetch、CandidateFocusLayout に promptBody pass-through
- `dashboard/src/components/visual-review/CandidateFocusLayout.tsx` — 内部の inline Actions / PromptContextCard を P1 cards に置換 (PromptSummary / RubricScores / Notes / Actions)
- `dashboard/src/components/visual-review/AssetCard.tsx` + `AssetCardGrid.tsx` — `latestInboxPath` props 追加、thumbnail に source label chip
- `dashboard/src/components/visual-review/VisualAssetsListView.tsx` — `initialFilter` props + URL replace useEffect、`latestInboxPaths` pass-through

### 不変 (touch なし)

- Sanity schema (`schemas/`) / Sanity write tools / publish-package / assets/visuals / patches
- /api/asset-thumb route (P0 で 2-prefix 拡張済み、本 batch では touch なし)
- /api/visual-review/* routes
- Sidebar nav (既に「図解レビュー」)
- 旧 import 0 component (VisualAssetHeader / CandidateGrid / CandidateCard / CandidatePreview / CandidateStatusBadge / SummaryCard / SectionHeader / EmptyState / FilePathBlock) — dead-code-cleanup batch で別途削除予定

### 新規 docs

- `docs/devlog/0144-ui-fidelity-7-visual-review-p1.md`
- `docs/handoff/0155-ui-fidelity-7-visual-review-p1.md` (本ファイル)
- `docs/handoff/latest.md` (mirror)

## 4. Summary of Changes

### 4-1. Dependencies changed

**なし**。lucide-react は既存、shadcn 追加なし、native HTML + Tailwind のみ。

### 4-2. Components created (7 cards + 1 helper)

| File | 種別 | 主用途 |
|---|---|---|
| `lib/visualAssets/inboxLookup.ts` | helper | `getLatestInboxCandidate` / `expectedPatchPath` / `readPromptBody` |
| `PromptSummaryCard.tsx` | server | inbox prompt.md frontmatter + 本文 800字 抜粋 + 全文 CopyButton |
| `RubricChecklistCard.tsx` | server | rubricScale / rubricMaxScore / rubricAxes chips / recommended / humanDecision / reviewStatus |
| `RubricScoresCard.tsx` | server | 選択 candidate の総合点 (色分け) + axes 一覧 + Codex notes |
| `NotesCard.tsx` | server | candidate.notes + humanDecision の 2 ソース統合表示 |
| `CampaignContextCard.tsx` | server | sourceCampaign / sourceContentIdea / platform / placement / slugs / coreThesis |
| `FilePathsCard.tsx` | server | 任意 path 配列 + CopyButton each |
| `ActionsCard.tsx` | server | Visual Register primary CTA + Phase 2B DeferredActionButton 配列 + 推奨 chip |

### 4-3. Detail page changes (`/visual-assets/[assetId]`)

- `Promise.all([readAssetCandidates, readPromptBody, getLatestInboxCandidate])` で inbox を並列 fetch (enableLocalFsRoutes 時のみ)
- Left column: `AssetPreviewCard` + `PlanMetadataCard` + **`PromptSummaryCard` (P1 new)**
- Right column: **`CampaignContextCard`** + **`RubricChecklistCard`** + **`FilePathsCard` (9 行)** + **`ActionsCard`** (全 P1 new)
- `AssetPreviewCard` の `inboxFallbackPath` は `getLatestInboxCandidate` の結果優先

### 4-4. Candidates page changes (`/visual-assets/[assetId]/candidates`)

- `readPromptBody` を `Promise.all` で並列 fetch
- `CandidateFocusLayout` に `promptBody` props を新規追加
- `CandidateFocusLayout` 内部を:
  - Left: BigPreview + ThumbStrip + **PromptSummary**
  - Right: SelectedMeta + **RubricScores** + **Notes** + **Actions** + warnings
- 旧 inline PromptContext + inline Actions ブロック削除

### 4-5. Filter URL sync behavior

| 状態 | 表現 |
|---|---|
| 初期 | server が `searchParams` を read、`initialFilter` を resolve → ListView の useState 初期値に渡る → SSR + 初回 hydration で同じ DOM (mismatch なし) |
| 変更 | useEffect が `router.replace(pathname?qs)` を `scroll: false` で実行 |
| DEFAULT 値 | URL に出さない (`?` 短く保つ) |
| 不明値 | bucket が enum 外 / sort が enum 外 → DEFAULT に fall back |
| 配列値 | `?platform=a&platform=b` のような重複は最初の値だけ採用 |

Sync された軸 (5 全部):
- `bucket` (all / candidates / approved / needs-regen / saved)
- `platform`
- `assetType`
- `sort` (updated-desc / updated-asc / status / platform)
- `q` (free text search)

### 4-6. Asset thumbnail fallback behavior

| 優先順位 | 条件 | 表示 chip |
|---|---|---|
| 1 | `localAssetPath` が `assets/visuals/` 配下 | `最終` |
| 2 | server-precomputed `latestInboxPath` あり | `最新候補` |
| 3 | `visualAssetPlan.<campaign>.<asset>` ID から派生した v001 path | `v001` |
| 4 | 上記いずれも該当しない、または production mode (`!enableLocalFsRoutes`) | ImageIcon placeholder (chip なし) |

list page は `enableLocalFsRoutes` 時に全 plan の `getLatestInboxCandidate` を `Promise.all` で並列実行 → `Record<plan._id, relativePath>` を構築して AssetCardGrid に渡す。

`/api/asset-thumb` の prefix lock / extension whitelist / 8 MB cap / traversal rejection / `enableLocalFsRoutes` ガードは **P0 から不変**。

### 4-7. Build validation

```
cd dashboard && npm run build  → ✓ TypeScript clean、23 routes (unchanged)
npm run build (sanity)         → ✓ Build Sanity Studio (7595ms) clean
```

## 5. Key Decisions

- **`readPromptBody` を page で read**: server-side で読んで client wrapper に string props 渡し。新 endpoint を増やさず round-trip 0
- **`PromptSummaryCard` 内で truncate (800 字)**: 集約ロジックを 1 か所に、CopyButton で全文コピー可能
- **`getLatestInboxCandidate` は YAML 解析なし**: list page で N 件の plan に並列呼び出しするので、cheap な readdir + regex match で十分
- **score 捏造禁止**: per-axis score は現 review.md schema にないので "—" 表示、総合点 (candidate.score) もなければ "—"
- **`ActionsCard` の API 設計**: `deferred: DeferredAction[]` + `visualRegisterLabel` + `helperText` で再利用、推奨 candidate chip も optional
- **FilterBar URL sync の "初期 server / 以降 client" 方式**: hydration mismatch なし + URL shareable の両立
- **AssetCard thumbnail label chip**: subtle (slate-700 + 白半透明) で boss が画像の source を 1 視野で把握できる
- **削除候補 component の touch なし**: 本 batch で diff を読みやすく保つ、import 0 になった旧 component (VisualAssetHeader 等) は別 dead-code-cleanup batch で削除

## 6. Human Review Questions

1. **PromptSummaryCard 800 字 truncate**: 短すぎ / 長すぎないか? boss が「もう少し見たい」なら 1200 字 / 1600 字 microbatch
2. **RubricScoresCard で per-axis score "—"**: schema 拡張せず「—」を出すか、それとも本 batch で per-axis ui を非表示にするか?
3. **CampaignContextCard の coreThesis line-clamp-3**: 3 行で trim、boss が「全文見たい」なら details 化
4. **FilePathsCard の 9 行**: 多すぎる / 必要な情報か?「最終 + inbox フォルダ + patch JSON だけ」に絞る選択肢
5. **AssetCard label chip**: 「最終 / 最新候補 / v001」の文言は適切か? boss feedback で変更可能
6. **URL sync の DEFAULT 値**: 「bucket=all / sort=updated-desc は URL に出さない」設計、boss が「全状態を明示したい」なら microbatch
7. **detail page の `<PromptSummaryCard>`**: 左列の最後にあるが、boss は「右列 (Actions の下) に置きたい」希望ある?
8. **Visual Register CTA の文言**: 「Visual Register を開く」vs「Visual Register で承認」、page によって変えているが揃えたい?

## 7. Risks or Uncertainties

- **`router.replace` の useEffect timing**: 初回マウントでも 1 回 fire する → 初期 URL に `?` がない場合は 1 回 replace される。`scroll: false` 指定で UX は保つが、history に no-op エントリは入らない (replace なので戻る押下で影響なし)
- **`buildLatestInboxPaths` の並列度**: 7 plan 想定で `Promise.all` 一度に。大量 (>100) の場合は I/O 飽和の懸念、ただし現 dataset では非問題
- **production build で `latestInboxPaths` が空**: `enableLocalFsRoutes=false` で常に `{}`、AssetCard は placeholder。「真っ白」感は Phase 2 build-time snapshot で解消想定
- **`PromptSummaryCard` の collapsible 初期 closed**: 一目で本文見たい boss は `<details open>` 化 microbatch 候補
- **`RubricScoresCard` per-axis "—" は冗長**: axes の数が多い (5+) と「—」だらけになる。boss が違和感感じれば axes を簡素な chip 一覧に簡略化
- **削除候補 component 残置**: import 0 だがファイル残置。Linter / Knip 等は warning 出すかも
- **`/api/asset-thumb` 拡張は P0 で完了**: 本 batch では touch なし、security model に変更なし

## 8. Remaining Gaps

- **dead code cleanup 未実施**: VisualAssetHeader / CandidateGrid / CandidateCard / CandidatePreview / CandidateStatusBadge / SummaryCard / SectionHeader / EmptyState / FilePathBlock / AppNav が import 0
- **`/analytics`, `/knowledge`, `/settings` fidelity spec 未実装**
- **Phase 2B 実 write 未実装**: Approve & register / Regenerate prompt / Mark needs regeneration / Sanity controlled write
- **Activity log への自動記録 未実装**: 承認 / 再生成のたびに `/activity-log` に書く
- **build-time snapshot** (Batch D2): production build で thumbnail を出すための長期施策
- **promptTemplate dataset 投入** (boss 担当): `/configurator` RecommendedTemplatesCard を埋めるため
- **AssetCard label chip の `published` 表示**: 「最終」を「公開済み」に分岐する選択肢、P1 microbatch

## 9. Next Recommended Step

**Option A — Dead code cleanup batch (推奨、軽い)**

import 0 になった旧 component (VisualAssetHeader / CandidateGrid / CandidateCard / CandidatePreview / CandidateStatusBadge / SummaryCard / SectionHeader / EmptyState / FilePathBlock / AppNav) を一括削除する batch。回帰リスク極小、1 batch で完了。

```text
Implement dead code cleanup batch.

Use:
- docs/handoff/0155-ui-fidelity-7-visual-review-p1.md (this handoff, §8)

Hard Rules:
- Do NOT modify Sanity schema
- Do NOT write to Sanity
- Do NOT modify publish-package / assets/visuals / patches
- Do NOT add packages
- Do NOT deploy
- 23 routes 動作維持
- 削除前に各 component の import 数を grep で確認、0 のもののみ削除

Tasks:
1. grep "from '@/components/visual-review/VisualAssetHeader'" etc → import 0 を確認
2. 削除候補 (確認後):
   - dashboard/src/components/visual-review/VisualAssetHeader.tsx
   - dashboard/src/components/visual-review/CandidateGrid.tsx
   - dashboard/src/components/visual-review/CandidateCard.tsx
   - dashboard/src/components/visual-review/CandidatePreview.tsx
   - dashboard/src/components/visual-review/CandidateStatusBadge.tsx
   - dashboard/src/components/SummaryCard.tsx
   - dashboard/src/components/SectionHeader.tsx
   - dashboard/src/components/EmptyState.tsx
   - dashboard/src/components/FilePathBlock.tsx
   - dashboard/src/components/AppNav.tsx
3. cd dashboard && npm run build → 23 routes 維持
4. npm run build (Sanity Studio) → clean
5. Write docs/devlog/0145 + docs/handoff/0156 + latest mirror
```

**Option B — `/analytics`, `/knowledge`, `/settings` fidelity spec**

残り fidelity 系 3 route の audit + spec docs only batch。Visual Review が完成したので tone は確立済み、3 route の理想 screenshot があれば同様の spec を作れる。

**Option C — Phase 2B 議論**

Approve & register / Regenerate / Sanity controlled write を boss と議論し、Phase 2B 実装計画を確定する。
