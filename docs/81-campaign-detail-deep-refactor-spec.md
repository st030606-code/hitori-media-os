# /campaigns/[slug] Deep Refactor Fidelity Spec (Phase UI-fidelity-11)

最終更新: 2026-05-20
ステータス: Implementation spec (audit-only batch、コード変更なし)
対象 route: `/campaigns/[slug]` (419 行、Phase UI-fidelity-1 で部分 fidelity 化済、依然 7 件の legacy component を import)

依存: docs/68 / docs/69 / docs/handoff/0145 (Phase UI-fidelity-1 land state) / docs/handoff/0169 (legacy component audit)

## 戦略的目的

handoff/0168 で audit 確定した legacy component の **B バケット 7 件** (`/campaigns/[slug]` 依存) + **C バケット 1 件** (`NextActionSummary` partial dead) を、本 spec の Phase UI-fidelity-11 実装 batch で削除可能な状態に持っていく。実装完了後の follow-up cleanup microbatch で 8 ファイル一括 `rm` → **Phase Admin 1 Batch A/B/C 時代 legacy component 完全終了**。

加えて Home (`/`) で残る `ReleaseReviewLinks` 利用も整理する (本 spec 対象、後述)。

---

## 1. Current Structure Audit (`/campaigns/[slug]/page.tsx` 419 行)

### 1-1. 全体構成

```
[PageHeader (Phase UI-fidelity-1 で fidelity 化済)]
  - title / description / breadcrumb / actions (編集 disabled / 出力を追加 / 公開パッケージへ / 共有 disabled)
  - meta inline (slug / type / mode / auto / StatusBadge)

[KpiCardsRow (Phase UI-fidelity-1)]
  - 公開済み / 確認待ちゲート / 画像・図解 / 選択媒体

[LifecyclePipeline (Phase UI-fidelity-1)]
  - 5 stages、currentStage を `buildLifecycle()` で算出

[2-col grid (lg:grid-cols-[2fr_1fr])]
  Left:
    - CampaignBriefCard (page-local) — coreThesis / targetReader / source idea
    - PublishingScheduleTable (Phase UI-fidelity-1 new) ✓
  Right:
    - PublishReadinessScore (Phase UI-fidelity-1 new) ✓
    - NextActionList (Phase UI-fidelity-1 new) ✓ — but imports `computeNextActions` from legacy `NextActionSummary.tsx`
    - ReleaseReviewLinks ← LEGACY (hardcoded to building-hitori-media-os)

[詳細 section with Tabs (9 tabs)]
  - Content Idea → ContentIdeaSection (page-local) ✓
  - ブランド → BrandProfileSection (page-local) ✓
  - 媒体 → SelectedPlatformChips ← LEGACY
  - 確認ゲート → HumanReviewGateList ← LEGACY
  - 画像・図解 → VisualAssetStatusTable ← LEGACY
  - プロンプト → PromptTemplateSummary ← LEGACY
  - パッケージ → PublishPackageLinks ← LEGACY
  - 公開状況 (詳細) → ManualPublishingStatusList ← LEGACY (PublishingScheduleTable と重複)
  - 外部リンク → ExternalLinks (page-local) ✓

[Helpers (page-local 関数群)]
  - buildLifecycle / CampaignBriefCard / ContentIdeaSection / BrandProfileSection / ExternalLinks
```

### 1-2. Data sources

`campaignDetailBySlugQuery` (lib/groq/campaign.ts、既存) が以下を返す:
- title / slug / campaignType / contentMode / coreThesis / targetReader / status / automationLevel / version
- `selectedPlatforms[]` (媒体 tab)
- `humanReviewGates[]` (確認ゲート tab)
- `manualPublishingStatus[]` (公開状況 tab + main PublishingScheduleTable)
- `visualAssetDetails[]` (画像・図解 tab)
- `promptTemplateDetails[]` (プロンプト tab)
- `publishPackagePaths[]` + `releaseReviewPath` (パッケージ tab + ReleaseReviewLinks 置換に流用可能)
- `sourceContentIdea` (Content Idea tab + CampaignBriefCard)
- `brandProfile` (ブランド tab)

データ取得ロジックは **Phase UI-fidelity-11 でも変更なし**。layout / 表示のみ刷新。

### 1-3. Legacy component map

| Component | File | Used at | redundant? |
|---|---|---|---|
| `SelectedPlatformChips` | `components/SelectedPlatformChips.tsx` | 媒体 tab (line 217) | inline で容易に置換可 |
| `HumanReviewGateList` | `components/HumanReviewGateList.tsx` | 確認ゲート tab (line 220) | inline で置換 + `/human-review-gates` link |
| `VisualAssetStatusTable` | `components/VisualAssetStatusTable.tsx` | 画像・図解 tab (line 223) | inline で置換 + `/visual-assets` link |
| `PromptTemplateSummary` | `components/PromptTemplateSummary.tsx` | プロンプト tab (line 226) | inline で置換 |
| `PublishPackageLinks` | `components/PublishPackageLinks.tsx` | パッケージ tab (line 229) | inline FilePathsCard pattern |
| `ManualPublishingStatusList` | `components/ManualPublishingStatusList.tsx` | 公開状況 (詳細) tab (line 235) | **重複**: main の PublishingScheduleTable と同じデータ source → tab 自体を drop |
| `ReleaseReviewLinks` | `components/ReleaseReviewLinks.tsx` | Right column (line 186) + Home (`/page.tsx:195`) | hardcoded slug、page-local 置換 + Home からも削除 |
| `NextActionSummary` | `components/NextActionSummary.tsx` | NOT imported here directly; helper `computeNextActions` used by `campaign/NextActionList.tsx:13` | helper extract → ファイル削除 |

---

## 2. Target Structure

```
[PageHeader] ← 既存維持
[KpiCardsRow] ← 既存維持
[LifecyclePipeline] ← 既存維持

[2-col grid]
  Left:
    - CampaignBriefCard ← 既存維持
    - PublishingScheduleTable ← 既存維持
  Right:
    - PublishReadinessScore ← 既存維持
    - NextActionList ← 既存維持 (import 元を lib/campaign/nextActions に変更)
    - ReleaseReviewCard (新規 page-local 関数、campaign.releaseReviewPath 駆動) ← LEGACY ReleaseReviewLinks の置換

[詳細 section with Tabs] (9 → 8 tabs)
  - Content Idea → ContentIdeaSection ← 既存維持
  - ブランド → BrandProfileSection ← 既存維持
  - 媒体 → PlatformsSection (新規 page-local、inline PlatformBadge row) ← SelectedPlatformChips 置換
  - 確認ゲート → GatesSection (新規 page-local、inline + `/human-review-gates` link) ← HumanReviewGateList 置換
  - 画像・図解 → VisualsSection (新規 page-local、inline + `/visual-assets` link) ← VisualAssetStatusTable 置換
  - プロンプト → PromptsSection (新規 page-local、inline) ← PromptTemplateSummary 置換
  - パッケージ → PackagePathsSection (新規 page-local、inline FilePathsCard pattern with CopyButton) ← PublishPackageLinks 置換
  - ~~公開状況 (詳細)~~ ← drop (PublishingScheduleTable と重複)
  - 外部リンク → ExternalLinks ← 既存維持

[Helpers] (page-local 関数群、既存 + 6 新規)
```

8 tabs に削減 + sidebar の ReleaseReviewLinks 置換。tab 並びと labels は維持 (boss が慣れている UX を保つ)。

---

## 3. Replacement Strategy (Component-by-Component)

### 3-1. `SelectedPlatformChips` → inline `PlatformsSection`

Current API: `<SelectedPlatformChips platforms={campaign.selectedPlatforms} />`

Replacement (page-local function):

```tsx
function PlatformsSection({platforms}: {platforms?: SelectedPlatform[]}) {
  if (!platforms || platforms.length === 0) {
    return <p className="text-sm text-slate-500">媒体が選択されていません。</p>
  }
  const enabled = platforms.filter((p) => p.enabled !== false)
  const disabled = platforms.filter((p) => p.enabled === false)
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-wrap items-center gap-1.5 text-xs">
        {enabled.map((p, i) => (
          <li key={`${p.platform}-${i}`} className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 ring-1 ring-inset ring-slate-200">
            <PlatformBadge platform={p.platform ?? '—'} />
            <span className="text-slate-800">{platformLabel(p.platform)}</span>
            {p.priority && <span className="text-[10px] text-slate-500">priority: {p.priority}</span>}
            {p.contentDepth && <span className="text-[10px] text-slate-500">depth: {p.contentDepth}</span>}
          </li>
        ))}
      </ul>
      {disabled.length > 0 && (
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">無効化済</div>
          <ul className="mt-1 flex flex-wrap gap-1.5 text-[11px] text-slate-500">
            {disabled.map((p, i) => (
              <li key={i} className="rounded-md bg-slate-100 px-2 py-0.5 ring-1 ring-inset ring-slate-200">
                {p.platform}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
```

Imports needed: `PlatformBadge`, `platformLabel` from `@/components/common/PlatformBadge` (既存)。

### 3-2. `HumanReviewGateList` → inline `GatesSection`

Replacement: 既存の `/human-review-gates` page (Phase UI-fidelity-10) と同じ rendering pattern を縮約。

```tsx
function GatesSection({gates}: {gates?: HumanReviewGate[]}) {
  if (!gates || gates.length === 0) {
    return <p className="text-sm text-slate-500">確認ゲートが設定されていません。</p>
  }
  return (
    <div className="flex flex-col gap-3">
      <ul className="divide-y divide-slate-100">
        {gates.map((g, i) => (
          <li key={i} className="flex flex-col gap-1 py-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-slate-900">{g.gateName ?? '(unnamed gate)'}</span>
              <StatusBadge state={g.state} />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
              {g.reviewer && <span>reviewer: {g.reviewer}</span>}
              {g.completedAt && <span className="tabular-nums">at: {formatIso(g.completedAt)}</span>}
            </div>
            {g.notes && <p className="line-clamp-2 text-xs text-slate-700">{g.notes}</p>}
          </li>
        ))}
      </ul>
      <Link href="/human-review-gates" className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900">
        全 gate を /human-review-gates で確認
        <ChevronRight size={11} aria-hidden="true" />
      </Link>
    </div>
  )
}
```

### 3-3. `VisualAssetStatusTable` → inline `VisualsSection`

Replacement: compact list + StatusBadge + link to `/visual-assets`.

```tsx
function VisualsSection({assets, campaignSlug}: {assets?: RequiredVisualAssetItem[]; campaignSlug: string}) {
  if (!assets || assets.length === 0) {
    return <p className="text-sm text-slate-500">画像・図解が設定されていません。</p>
  }
  return (
    <div className="flex flex-col gap-3">
      <ul className="divide-y divide-slate-100 text-sm">
        {assets.map((v) => (
          <li key={v.visualAssetPlanId ?? v.assetSlug ?? Math.random().toString(36)} className="flex flex-wrap items-center gap-3 py-2">
            <div className="min-w-0 flex-1">
              <div className="font-medium text-slate-900">{v.plan?.title ?? v.assetSlug ?? '(無題)'}</div>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                {v.platform && <PlatformBadge platform={v.platform} />}
                {v.assetType && <span>{v.assetType}</span>}
                {v.priority && <span>{v.priority}</span>}
              </div>
            </div>
            <StatusBadge state={v.state ?? v.plan?.status} label={v.state ?? v.plan?.status ?? '—'} />
          </li>
        ))}
      </ul>
      <Link href="/visual-assets" className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900">
        図解レビューを開く
        <ChevronRight size={11} aria-hidden="true" />
      </Link>
    </div>
  )
}
```

### 3-4. `PromptTemplateSummary` → inline `PromptsSection`

Replacement: compact list of selections.

```tsx
function PromptsSection({selections}: {selections?: PromptTemplateSelection[]}) {
  if (!selections || selections.length === 0) {
    return <p className="text-sm text-slate-500">プロンプトテンプレートが選択されていません。</p>
  }
  return (
    <ul className="divide-y divide-slate-100 text-sm">
      {selections.map((s, i) => (
        <li key={s.promptTemplateId ?? i} className="flex flex-wrap items-center gap-3 py-2">
          <div className="min-w-0 flex-1">
            <div className="font-medium text-slate-900">{s.template?.title ?? s.promptTemplateId ?? '—'}</div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
              {s.category && <span>category: {s.category}</span>}
              {s.platform && <PlatformBadge platform={s.platform} />}
              {s.assetType && <span>{s.assetType}</span>}
              {s.template?.version && <span>v{s.template.version}</span>}
            </div>
          </div>
          {s.template?._id && (
            <a href={studioDocumentUrl(s.template._id)} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900">
              Studio <ExternalLink size={11} aria-hidden="true" />
            </a>
          )}
        </li>
      ))}
    </ul>
  )
}
```

### 3-5. `PublishPackageLinks` → inline `PackagePathsSection`

Replacement: FilePathsCard pattern + CopyButton.

```tsx
function PackagePathsSection({paths, releaseReviewPath}: {paths?: string[]; releaseReviewPath?: string}) {
  const items = [
    ...(paths ?? []).map((p, i) => ({label: `package ${i + 1}`, path: p})),
    ...(releaseReviewPath ? [{label: 'release-review', path: releaseReviewPath}] : []),
  ]
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">公開パッケージのパスが設定されていません。</p>
  }
  return (
    <ul className="flex flex-col gap-2">
      {items.map((it, i) => (
        <li key={i} className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="w-32 shrink-0 text-slate-600">{it.label}</span>
          <code className="break-all rounded bg-slate-50 px-1.5 py-0.5 text-slate-800 ring-1 ring-inset ring-slate-200">{it.path}</code>
          <CopyButton text={it.path} label="copy" />
        </li>
      ))}
    </ul>
  )
}
```

### 3-6. `ManualPublishingStatusList` → **DROP TAB**

`/campaigns/[slug]` main の `PublishingScheduleTable` (Phase UI-fidelity-1) は `campaign.manualPublishingStatus` を同じ data source で render する。「公開状況 (詳細)」 tab は **完全重複**。

- Tab 自体を削除 (9 → 8 tabs)
- `TabsTrigger value="publishing"` 削除
- `TabsContent value="publishing"` 削除
- 関連 import 削除

### 3-7. `ReleaseReviewLinks` → page-local `ReleaseReviewCard`

Current: hardcoded to `'publish-packages/campaigns/building-hitori-media-os-release-review'` + 5 fixed files (handoff/0166 B 系の hardcoding 問題と同根、今 batch で完全排除)。

Replacement strategy:

**For `/campaigns/[slug]`**: page-local function reading `campaign.releaseReviewPath` (per-campaign field, already in CampaignPlanDetail).

```tsx
const RELEASE_FILES = [
  {label: '最終チェックリスト', file: 'final-human-checklist.md', note: 'ボスが最後に1度通すリスト'},
  {label: 'X 最終レビュー', file: 'x-final-review.md'},
  {label: 'Threads 最終レビュー', file: 'threads-final-review.md'},
  {label: 'note 最終レビュー', file: 'note-final-review.md'},
  {label: 'Substack 最終レビュー', file: 'substack-final-review.md'},
]

function ReleaseReviewCard({releaseReviewPath}: {releaseReviewPath?: string}) {
  if (!releaseReviewPath) return null  // campaign に release-review path が未設定なら hide
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3">
        <h2 className="text-base font-semibold text-slate-900">公開前レビュー資料</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          ローカルのファイルパス。クリックしてもファイルは開かないので、エディタで開いて読んでください。
        </p>
      </header>
      <ul className="space-y-2 text-sm">
        {RELEASE_FILES.map((l) => (
          <li key={l.file} className="flex flex-col gap-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <span className="font-medium text-slate-900">{l.label}</span>
              {l.note && <span className="ml-2 text-xs text-slate-500">{l.note}</span>}
            </div>
            <code className="break-all rounded bg-white px-1.5 py-0.5 text-xs text-slate-700">{releaseReviewPath}/{l.file}</code>
          </li>
        ))}
      </ul>
    </section>
  )
}
```

**For `/` (Home)**: 完全削除。section の機能は PageHeader の「公開パッケージを開く」 CTA + LifecyclePipeline + ActiveCampaignsCard で実質代替済み。Home page の Wraparound 用件は再評価不要。

### 3-8. `NextActionSummary` → helper extract

Steps:
1. 新規 `dashboard/src/lib/campaign/nextActions.ts` を作成、内容:
   - `interface Action` / `type ActionTone` / `PRIORITY_ORDER` / `isActiveGateState` / `isActiveVisualState` / `actionToneClasses` / `actionLabel` / `computeNextActions(campaign: CampaignPlanDetail): Action[]`
   - すべて `NextActionSummary.tsx` から **そのままコピー** (component は持ってこない)
2. `dashboard/src/components/campaign/NextActionList.tsx:13` の import を更新:
   ```ts
   // before
   import {computeNextActions} from '@/components/NextActionSummary'
   // after
   import {computeNextActions} from '@/lib/campaign/nextActions'
   ```
3. `NextActionSummary` component 自体は dashboard/src で render されていない → `NextActionSummary.tsx` ファイルは削除可能 (helper extract 後)

---

## 4. P0 / P1 / P2 Scope

### P0 (Phase UI-fidelity-11 実装 batch で必須)

- [ ] **legacy component imports の完全排除** (7 件):
  - `SelectedPlatformChips` 削除 → `PlatformsSection` inline
  - `HumanReviewGateList` 削除 → `GatesSection` inline + `/human-review-gates` link
  - `VisualAssetStatusTable` 削除 → `VisualsSection` inline + `/visual-assets` link
  - `PromptTemplateSummary` 削除 → `PromptsSection` inline
  - `PublishPackageLinks` 削除 → `PackagePathsSection` inline FilePathsCard pattern
  - `ManualPublishingStatusList` 削除 → tab 自体を drop
  - `ReleaseReviewLinks` 削除 → `ReleaseReviewCard` page-local (campaign.releaseReviewPath 駆動)
- [ ] **`computeNextActions` helper extract**:
  - `lib/campaign/nextActions.ts` 新規作成
  - `campaign/NextActionList.tsx` の import 更新
- [ ] **Home (`/page.tsx`) から `ReleaseReviewLinks` 利用削除**:
  - import 削除 (line 6)
  - render 削除 (line 195)
  - section 自体を Home から remove (代替不要、CTA が機能カバー)
- [ ] **詳細 tabs を 9 → 8 に**:
  - 「公開状況 (詳細)」tab drop
- [ ] **build + 23 routes 維持**
- [ ] **動作変化なし**: 各 section の data shape / rendering 結果は概ね同等

### P1 (本 batch で同時 or 別 batch)

- [ ] **Tabs 整理**: 9 → 8 にした上で、さらに統合可能か再評価
  - Content Idea + ブランド → "Source" tab に統合する option
  - 画像・図解 + 確認ゲート → "Status" tab に統合する option
  - 媒体 + プロンプト → "Generation" tab に統合する option
- [ ] **Right sidebar 密度**: PublishReadinessScore + NextActionList + ReleaseReviewCard の縦長対応
- [ ] **PlatformsSection に platform-specific generationSetting display**

### P2 (Phase 2B、実 write actions)

- [ ] PageHeader「編集」/「共有」 button を enable
- [ ] inline campaign edit form (Sanity write 経由)
- [ ] gate state change UI (write action)
- [ ] visualAssetPlan inline approve

---

## 5. Cleanup Chain

### 5-1. Phase UI-fidelity-11 (本 spec の実装 batch) 完了後の状態

```bash
grep -rn "from '@/components/SelectedPlatformChips'\|from '@/components/HumanReviewGateList'\|from '@/components/VisualAssetStatusTable'\|from '@/components/PromptTemplateSummary'\|from '@/components/PublishPackageLinks'\|from '@/components/ManualPublishingStatusList'\|from '@/components/ReleaseReviewLinks'\|from '@/components/NextActionSummary'" dashboard/src
```

期待: **0 lines** (8 件すべての import が消滅)。

### 5-2. Follow-up cleanup microbatch (実装 batch 完了直後)

```text
Delete 8 Phase Admin 1 B/C bucket legacy components.

Use:
- docs/handoff/0170-campaign-detail-deep-refactor-spec.md (本 spec の handoff)

Hard Rules:
- Do NOT modify Sanity schema / publish-package / assets/visuals / patches
- Do NOT add packages, no deploy
- 23 routes 動作維持
- Re-verify import 0 before each rm

Tasks:
1. Re-verify import 0 for 8 files
2. Delete:
   - dashboard/src/components/SelectedPlatformChips.tsx
   - dashboard/src/components/HumanReviewGateList.tsx
   - dashboard/src/components/VisualAssetStatusTable.tsx
   - dashboard/src/components/PromptTemplateSummary.tsx
   - dashboard/src/components/PublishPackageLinks.tsx
   - dashboard/src/components/ManualPublishingStatusList.tsx
   - dashboard/src/components/ReleaseReviewLinks.tsx
   - dashboard/src/components/NextActionSummary.tsx
3. cd dashboard && npm run build (23 routes 維持)
4. npm run build (Sanity Studio clean)
5. docs/devlog/0161-* + docs/handoff/0172-* + latest mirror
```

完了後 `dashboard/src/components/` から **Phase Admin 1 Batch A/B/C 時代の legacy component が完全消滅**。

---

## 6. Constraints (本 spec & 実装 batch)

- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ publish-package files 不変
- ✅ assets/visuals / patches 不変
- ✅ deploy なし
- ✅ auto-post なし
- ✅ package 追加なし、shadcn 追加なし
- ✅ 23 routes 動作維持
- ✅ `/publish-package/[slug]` copy-friendly behavior unchanged (touch なし)
- ✅ データ取得ロジック (`campaignDetailBySlugQuery`) は touch なし
- ✅ 他 fidelity 化済 page (`/configurator`, `/outputs`, `/publish`, `/visual-assets/*`, `/knowledge`, `/analytics`, `/settings`, `/publish-packages`, `/activity-log`, `/diagnostics`, `/human-review-gates`, `/campaigns` list) は touch なし
- ✅ Home (`/`) は ReleaseReviewLinks import + 利用削除のみ、他 section は unchanged
- ✅ Phase 2B write actions 未実装、すべて read-only

---

## 7. Boss Decision Points (Phase UI-fidelity-11 着手前)

1. **「公開状況 (詳細)」 tab 削除**: PublishingScheduleTable と完全重複なので削除案を採用、boss 確認
2. **Home (`/page.tsx`) からの `ReleaseReviewLinks` 削除**: 完全削除 (推奨) or 残置 (release-review データを別経路で供給) のどちらか。boss 確認
3. **Tabs 統合 (P1)**: 9 → 8 を本 batch で達成、さらに統合 (5-6 tabs) は P1 microbatch にするか同 batch にするか
4. **`computeNextActions` 移動先**: `lib/campaign/nextActions.ts` で OK か、それとも他の location が望ましいか
5. **`ReleaseReviewCard` の 5 file list**: 現状の RELEASE_FILES 配列 (x / threads / note / substack + checklist) は固定。campaign が違う媒体構成のときに lift 化するか、boss feedback
6. **Implementation order**: 1 batch でまとめて (推奨) or 分割 (例: tabs rewrite を P1、ReleaseReviewCard を別 microbatch)

---

## 8. Likely Files Affected

### 新規 (1)

- `dashboard/src/lib/campaign/nextActions.ts` (`computeNextActions` helper extract)

### 更新 (3)

- `dashboard/src/app/campaigns/[slug]/page.tsx` (7 legacy import 削除 + 6 新 page-local section + 1 tab drop)
- `dashboard/src/components/campaign/NextActionList.tsx` (import path 更新、1 行)
- `dashboard/src/app/page.tsx` (Home から `ReleaseReviewLinks` import + render 削除)

### 削除候補 (follow-up microbatch、本 batch では touch なし)

- `dashboard/src/components/SelectedPlatformChips.tsx`
- `dashboard/src/components/HumanReviewGateList.tsx`
- `dashboard/src/components/VisualAssetStatusTable.tsx`
- `dashboard/src/components/PromptTemplateSummary.tsx`
- `dashboard/src/components/PublishPackageLinks.tsx`
- `dashboard/src/components/ManualPublishingStatusList.tsx`
- `dashboard/src/components/ReleaseReviewLinks.tsx`
- `dashboard/src/components/NextActionSummary.tsx`

---

## 9. Out of Scope

- AppShell / Sidebar / Topbar
- Sanity schema 変更
- Phase 2B write actions
- `/publish-package/[slug]` 改修
- dashboard/README.md 全体書き直し (別 batch)
- B/C 8 件の本体削除 (follow-up microbatch、本 batch では touch なし)
- 外部 API integration

---

## 10. Post-implementation Expected State

Phase UI-fidelity-11 実装 batch + follow-up cleanup microbatch 完了後:

- ✅ `/campaigns/[slug]` が完全 fidelity 化 (419 行 → 推定 450-500 行、page-local section が増えるが import 数は減る)
- ✅ Phase Admin 1 Batch A/B/C 時代の **legacy component が完全消滅** (B 7 件 + C 1 件すべて削除)
- ✅ `dashboard/src/components/` 直下に「Phase 1 batch 時代の名残」がなくなる
- ✅ `ReleaseReviewLinks` の hardcoded `building-hitori-media-os` も完全排除 (B1 fixes の延長線で残っていた最後の hardcoding)
- ✅ `NextActionSummary` の partial dead 状態解消
- ✅ Home (`/`) からも legacy slot が消える

これをもって **Phase UI-fidelity cycle の本体作業すべて終了**。残るは README rewrite と Phase 2B 議論のみ。
