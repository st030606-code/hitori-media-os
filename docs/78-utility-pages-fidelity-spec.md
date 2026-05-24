# Utility Pages Fidelity Spec — /publish-packages, /activity-log, /diagnostics

最終更新: 2026-05-20
ステータス: Implementation spec (audit-only batch、コード変更なし)
対象 routes:
- `/publish-packages` (filesystem walk of `publish-packages/`)
- `/activity-log` (latest `docs/devlog/` + `docs/handoff/`)
- `/diagnostics` (server-side `npm run local:check`)

依存: docs/68 (design system) / docs/69 (Phase UI plan) / docs/77 (Visual Review tone) / docs/handoff/0157 (final dead code cleanup)

## なぜこの 3 page をまとめるか

3 page は **dev-only utility surface** で、共通の古い stack を使っている:
- `<ReadOnlyBanner />` (no-op、Phase UI-2.5 で廃止済 wrapper)
- `<header>` + h1 直書き、breadcrumb なし
- `max-w-6xl` (fidelity 基準は `max-w-[1280px]`)
- `<SummaryCard />` × 4 の grid (KpiCard に置換)
- `<SectionHeader />` (PageHeader + 直書き header に置換)
- `<EmptyState />` (inline 空状態に置換)
- `<FilePathBlock />` (inline `<code>` + CopyButton or FilePathsCard 流用)

実装が終われば、Sanity AI Content OS 全体で **`SummaryCard / SectionHeader / EmptyState / FilePathBlock` の import 数を 0** にできる → 別 batch でそれらを削除可能になる。これが本 spec の戦略的価値。

---

## A. `/publish-packages` fidelity spec

### A-1. Current structure

```
[ReadOnlyBanner (no-op)]
[<header> Title「Publish Packages」+ description with 件数 + source path code block]
[4 SummaryCard row: Packages / Files / Images / Markdown]
[errors.length > 0 → EmptyState tone="error"]
[entries.length === 0 → EmptyState
 entries.length > 0 → <ul><PackageRow ...></ul>]

[PackageRow]:
  - <header> platform · campaignSlug + FilePathBlock(relativePath) + meta row (file/image/markdown/bytes/last)
  - <details> 「Show N files」 → <ul> per-file (path/size/mtime)
```

### A-2. Current data sources

| Source | 経由 |
|---|---|
| `publish-packages/<platform>/<campaign>/...` | `scanPackages()` (server-side fs walk、`repoPath('publish-packages')`) |
| `enableLocalFsRoutes` flag | production では `notFound()` を返す |

データ取得ロジックは **fidelity batch でも変更なし**。layout / 表示のみを刷新。

### A-3. Current old components

- `ReadOnlyBanner`
- `EmptyState` ×3 (error / no packages / 各種)
- `FilePathBlock` ×1 (PackageRow 内)
- `SectionHeader` ×0 (使われていない)
- `SummaryCard` ×4

### A-4. Target structure

```
[Breadcrumb: ダッシュボード > Publish Packages]
[PageHeader:
  Title「Publish Packages」(or「公開パッケージ一覧」)
  Description: 「publish-packages/ 配下のファイルシステムを walk して表示します。dev 専用、production では 404。」
  Actions:
    - 「公開管理を開く」(outline, → /publish)
  Meta: `${totalEntries} packages, ${totalFiles} files` + source path code
]
[KpiCardsRow:
  - Packages (Layers icon, slate tone)
  - Files (FileText, blue)
  - Images (Image, purple)
  - Markdown (FileType, emerald)
]
[errors.length > 0 → ErrorCard inline (rose-200 / bg-rose-50)]
[entries.length === 0 → inline empty card (border-dashed border-slate-300)
 entries.length > 0 → <ul> with PackageCard (new)]

[PackageCard (replaces PackageRow)]:
  - <header> platform · campaignSlug + path inline (<code> + CopyButton) + meta row
  - <details> 「N 件のファイルを表示」 → <ul> per-file (path/size/mtime)
```

### A-5. Component replacements (per-page)

| Old | New |
|---|---|
| `<ReadOnlyBanner />` | drop (no-op、上位 Topbar の ReadOnlyPill が同役割) |
| `<header>` + h1 直書き | `<PageHeader title="..." description="..." breadcrumb={...} actions={...} meta={...} />` |
| `max-w-6xl` | `max-w-[1280px]` (fidelity 基準) |
| `<SummaryCard label="Packages" primary={...} />` (×4) | `<KpiCard label="Packages" value={...} icon={Layers} tone="slate" />` (×4) |
| `<EmptyState tone="error" title="..." body="..." />` | inline `<section className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">` |
| `<EmptyState title="..." body="..." />` (no tone) | inline `<section className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-700">` (Visual Review list page と同パターン) |
| `<FilePathBlock path={...} />` | inline `<code className="rounded bg-slate-50 px-1.5 py-0.5 ...">` + `<CopyButton text={...} label="copy" />` (FilePathsCard は overkill) |

### A-6. Likely files affected (`/publish-packages`)

- `dashboard/src/app/publish-packages/page.tsx` (update)
- 内部の `PackageRow` 関数を `PackageCard` に rename + design tone 揃え (同 file 内 inline)
- 必要なら `dashboard/src/components/visual-review/FilePathsCard.tsx` を `dashboard/src/components/common/FilePathsCard.tsx` に移動 (この時 visual-review からの import path 1 行も update) — ただし本 page では inline で十分なので **本 batch では移動しない**

### A-7. P0 / P1 / P2 scope

- **P0**: PageHeader + Breadcrumb / 4 KpiCard / inline empty + error / FilePathBlock → inline code+CopyButton
- **P1**: PackageCard hover state微改善 / 「Show N files」を ChevronRight に変える polish / 「公開管理を開く」action button
- **P2**: filter / search (campaign や platform で絞り込み)、archive 状態の chip 表示など (現状 scope 外)

---

## B. `/activity-log` fidelity spec

### B-1. Current structure

```
[ReadOnlyBanner (no-op)]
[<header> Title「Activity Log」+ description (mode + snapshot generatedAt)]
[4 SummaryCard row: Mode / Devlog entries / Handoff entries / Source]
[(snapshot mode + error) → EmptyState tone="error"]
[<DocList kind="devlog" />, <DocList kind="handoff" />]

[DocList]:
  - entries.length === 0 → EmptyState
  - <section card> + <SectionHeader title=... description=... /> + <ul divide-y>
    - per-entry: <h3> title + meta (filename / date / status) + mtime + excerpt + relPath code
```

### B-2. Current data sources

| Source | 経由 |
|---|---|
| `docs/devlog/*.md` + `docs/handoff/*.md` | fs mode: `readDocsFromFs(kind)` (live fs read each request) |
| `dashboard/public/activity-snapshot.json` | snapshot mode: `loadSnapshot()` (build-time generated JSON) |
| `activityLogMode` flag | `'fs'` (dev default) / `'snapshot'` (production default) |

データ取得 / parse ロジックは **fidelity batch でも変更なし**。

### B-3. Current old components

- `ReadOnlyBanner`
- `EmptyState` ×3 (snapshot error / empty devlog / empty handoff)
- `SectionHeader` ×2 (Devlog list / Handoff list)
- `SummaryCard` ×4

### B-4. Target structure

```
[Breadcrumb: ダッシュボード > 作業ログ]
[PageHeader:
  Title「作業ログ」(or「Activity Log」)
  Description: 「docs/devlog/ と docs/handoff/ の最新 N 件。mode: <mode>」(+ snapshot generatedAt)
  Meta: 「Up to ${LATEST_PER_KIND} per kind」(small)
]
[KpiCardsRow:
  - モード (Database icon, slate, value = 'fs' or 'snapshot')
  - Devlog 件数 (FileText, blue)
  - Handoff 件数 (FileText, purple)
  - ソース (Server, emerald, value = 'docs/' or 'snapshot')
]
[snapshot mode + error → inline error card (rose)]
[2 sections:
  <DocListCard title="Devlog" kind="devlog" entries={...} />
  <DocListCard title="Handoff" kind="handoff" entries={...} />
]

[DocListCard (replaces DocList)]:
  - entries.length === 0 → inline empty card (border-dashed)
  - card with header + <ul> divide-y (現行と同型)
  - per-entry: title + chip meta + excerpt + relPath code + CopyButton
```

### B-5. Component replacements

| Old | New |
|---|---|
| `<ReadOnlyBanner />` | drop |
| `<header>` + h1 | `<PageHeader title="..." description="..." breadcrumb={...} meta={...} />` |
| `max-w-6xl` | `max-w-[1280px]` |
| `<SummaryCard label="Mode" primary={mode} secondary="..." />` | `<KpiCard label="モード" value={mode} icon={Database} tone="slate" secondary="..." />` |
| `<SectionHeader title="Devlog" description="..." />` | inline `<header className="mb-3 flex items-center justify-between gap-2"> <div><h2>...</h2><p>...</p></div> </header>` (Visual Review style) |
| `<EmptyState />` (各種) | inline card (border-dashed for empty、border-rose-200 for error) |

### B-6. Likely files affected (`/activity-log`)

- `dashboard/src/app/activity-log/page.tsx` (update)
- 内部の `DocList` を `DocListCard` に rename + design tone 揃え

### B-7. P0 / P1 / P2 scope

- **P0**: PageHeader + Breadcrumb / 4 KpiCard / DocListCard 再構成 / inline empty + error
- **P1**: filter by kind (devlog / handoff toggle) / search input / per-entry CopyButton for relPath / status chip color mapping (status を StatusBadge に通す)
- **P2**: timeline view (date 軸での chronological 表示) / per-entry expand (full excerpt) / pagination / `?date=2026-05-20` searchParams

---

## C. `/diagnostics` fidelity spec

### C-1. Current structure

```
[ReadOnlyBanner (no-op)]
[<header> Title「Diagnostics」+ description (about npm run local:check)]
[4 SummaryCard row: Overall / Checks green / Checks red / Duration]
[result.runError → EmptyState tone="error" / result.parseError → EmptyState tone="error"]
[result.checks.length > 0 → <section card> + <SectionHeader /> + <ul divide-y>
  per-check: StatusBadge + name + details]
[<section card> + <SectionHeader title="Raw output" /> + <details> stdout pre + <details> stderr pre]
[<section amber-50> deploy warning]
```

### C-2. Current data sources

| Source | 経由 |
|---|---|
| `npm run local:check` (server-side) | `execFile('npm', ['run', 'local:check'])` with 60s timeout / 5MB maxBuffer |
| `enableDiagnostics` flag | production では `notFound()` |

データ取得 / parse ロジックは **fidelity batch でも変更なし**。

### C-3. Current old components

- `ReadOnlyBanner`
- `EmptyState` ×2 (runError / parseError)
- `SectionHeader` ×2 (Checks / Raw output)
- `SummaryCard` ×4
- `StatusBadge` (継続使用、新 component とも互換)

### C-4. Target structure

```
[Breadcrumb: ダッシュボード > 診断]
[PageHeader:
  Title「診断」(or「Diagnostics」)
  Description: 「server 側で <code>npm run local:check</code> を実行し、結果を表示します。dev 専用、production では 404。」
  Actions:
    - 「再実行」(disabled、Phase 2B の auto-refresh placeholder) — または GitHub Actions 等の external link
  Meta: 「last run: ${lastRun}」
]
[KpiCardsRow:
  - 結果 (Activity icon, ok=emerald / fail=red / error=red、value = ok/fail/error)
  - 成功 (CheckCircle2, emerald)
  - 失敗 (XCircle, red)
  - 所要時間 (Timer, slate)
]
[result.runError → inline error card (rose) + body]
[result.parseError → inline error card (rose) + body]
[result.checks.length > 0 → <section card>:
  - <header> 「チェック」+ description
  - <ul divide-y> per-check: StatusBadge + name + details (現行と同型)
]
[Raw output section card (現行 details を内包) — 既存 pre が dark theme で OK]
[<section amber-50> deploy 警告 (現行のまま、tone consistency 微改善)]
```

### C-5. Component replacements

| Old | New |
|---|---|
| `<ReadOnlyBanner />` | drop |
| `<header>` + h1 | `<PageHeader title="..." description="..." breadcrumb={...} actions={...} meta={...} />` |
| `max-w-6xl` | `max-w-[1280px]` |
| `<SummaryCard label="Overall" primary={...} secondary="..." />` | `<KpiCard label="結果" value={...} icon={Activity} tone={ok ? "emerald" : "red"} secondary="..." />` |
| `<SectionHeader title="Checks" description="..." />` | inline `<header>` with h2 + description (Visual Review pattern) |
| `<EmptyState tone="error" />` | inline `<section className="rounded-lg border border-rose-200 bg-rose-50 ...">` |

### C-6. Likely files affected (`/diagnostics`)

- `dashboard/src/app/diagnostics/page.tsx` (update)

### C-7. P0 / P1 / P2 scope

- **P0**: PageHeader + Breadcrumb / 4 KpiCard (色は ok/fail で動的) / inline error card / Check list section / Raw output section / amber 警告 section の tone 微調整
- **P1**: 「再実行」action button (Server Action で `runLocalCheck` を呼ぶ) — ただし server action 追加は本 fidelity scope 外、Phase 2B 議論候補
- **P2**: history (過去 N 回の実行結果を timeline で) / per-check expand / CI 連携 (GitHub Actions / Sanity webhook 等)

---

## D. Component replacement plan (3 page 共通)

### D-1. SummaryCard → KpiCard

旧:
```tsx
<SummaryCard label="Packages" primary={totalEntries} secondary="platform × campaign" />
```

新:
```tsx
<KpiCard
  label="Packages"
  value={totalEntries}
  icon={Layers}
  tone="slate"
  trend={neutralTrend}
  secondary="platform × campaign"
/>
```

- `primary` → `value`
- 新規 props: `icon` (lucide-react)、`tone` (semantic)、`trend` (`{value:'—', direction:'flat', periodLabel:'前月比'}`) — KpiCard 設計上 trend 必須ではないが、他 page と揃えるなら neutral を渡す
- `KpiCardsRow` で wrap

### D-2. SectionHeader → inline `<header>`

旧:
```tsx
<SectionHeader title="Devlog" description="..." right={...} />
```

新:
```tsx
<header className="mb-3 flex items-center justify-between gap-2">
  <div>
    <h2 className="text-base font-semibold text-slate-900">Devlog</h2>
    <p className="text-[11px] text-slate-500">...</p>
  </div>
  {right}
</header>
```

Visual Review P0/P1 pattern と一致。

### D-3. EmptyState → inline empty / error card

旧:
```tsx
<EmptyState title="No packages found" body="..." />
<EmptyState tone="error" title="Read failed" body="..." />
```

新 (empty):
```tsx
<section className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-700">
  <h2 className="text-base font-semibold text-slate-900">No packages found</h2>
  <p className="mt-2 text-slate-600">...</p>
</section>
```

新 (error):
```tsx
<section className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
  <p><strong className="font-semibold">Read failed.</strong> ...</p>
</section>
```

Visual Review candidates page の `EmptyCard` helper と同パターン。

### D-4. FilePathBlock → inline code + CopyButton (or FilePathsCard)

旧:
```tsx
<FilePathBlock path={e.relativePath} />
```

新 (inline、PackageCard で 1 path のみの場合):
```tsx
<div className="mt-0.5 flex items-center gap-1.5 text-xs">
  <code className="break-all rounded bg-slate-50 px-1.5 py-0.5 text-slate-700 ring-1 ring-inset ring-slate-200">
    {e.relativePath}
  </code>
  <CopyButton text={e.relativePath} label="copy" />
</div>
```

新 (FilePathsCard、複数 path をまとめる場合):
- `dashboard/src/components/visual-review/FilePathsCard.tsx` を `common/FilePathsCard.tsx` に移動して再利用
- **本 batch では移動しない** (PackageCard は 1 path で十分、inline で済む)

### D-5. ReadOnlyBanner → drop

3 page とも先頭で `<ReadOnlyBanner />` を呼んでいるが no-op。Topbar の `<ReadOnlyPill />` が同役割。fidelity batch で全削除。

---

## E. Implementation order

### Option A (推奨): /diagnostics → /activity-log → /publish-packages

**理由**:
1. `/diagnostics` は **最小** (1 page、command execution + 2-3 section)、tone replacement だけで完結。fidelity pattern を確認する pilot として最適
2. `/activity-log` は中規模 (DocList 2 件で構造化)、`/diagnostics` で学んだ pattern を流用しやすい
3. `/publish-packages` は **最大** (filesystem walk + per-entry expandable file list)、最後に手をつけることで前 2 page で得た「inline empty/error card」「KpiCard tone choice」「PageHeader meta」のパターンを安定して適用可能

**1 batch で 3 page をまとめて実装** することも可能 (依存なし、共有 component 削除は 3 page 全完了が前提)。1 batch でやる場合は上記順番で内部実装。

### Option B: 並列で 3 page を 1 batch

- 利点: 1 PR で `SummaryCard / SectionHeader / EmptyState / FilePathBlock` の import が 0 になる、dead-code-cleanup を直後の microbatch で実行可能
- 欠点: 1 batch の diff が大きい (3 file 大改修)

**推奨**: Option B (1 batch で 3 page まとめて)。Phase UI-fidelity-1〜7 と同様の規模感で、boss 確認も 1 度で済む。

---

## F. Constraints (本 spec & 実装 batch)

- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ publish-package files 不変
- ✅ assets/visuals / patches 不変
- ✅ deploy なし
- ✅ auto-post なし
- ✅ package 追加なし、shadcn 追加なし
- ✅ 23 routes 動作維持 (3 page は引き続き存在、layout のみ刷新)
- ✅ `/publish-package/[slug]` v0.2 unchanged
- ✅ `/`, `/configurator`, `/publish`, `/outputs`, `/campaigns/[slug]`, `/visual-assets/*` unchanged (shared common: PageHeader / KpiCard / Breadcrumb / CopyButton のみ reuse)
- ✅ データ取得ロジック (scanPackages / readDocsFromFs / loadSnapshot / runLocalCheck) は **完全に touch なし**
- ✅ feature flags (`enableLocalFsRoutes` / `enableDiagnostics` / `activityLogMode`) も touch なし

## G. Boss decision points (Phase UI-fidelity-8 着手前)

1. **rename**: 「Publish Packages」/「Activity Log」/「Diagnostics」の現英語タイトルを日本語化するか?
   - 例: 「公開パッケージ一覧」/「作業ログ」/「診断」
   - 他 fidelity page (「公開管理」「出力管理」「出力コンフィギュレーター」) と揃えるなら日本語化が自然
2. **Breadcrumb 親**: 「ダッシュボード」直下に置くか、それとも /publish や /visual-assets の下に置くか?
   - 推奨: 直下 (utility page で他 page との論理階層なし)
3. **`/diagnostics` の「再実行」action button**: P1 で server action として実装するか、P2 まで delay か?
4. **`/publish-packages` の filter / search**: P1 か P2 か?
5. **`/activity-log` の filter (devlog / handoff toggle)**: P1 か P2 か?
6. **FilePathsCard 共通化**: 本 batch で `common/` へ移動するか、それとも inline で済ませて将来 reuse が増えたときに移動するか?
   - 推奨: 後者 (YAGNI)

## H. Out of scope

- AppShell / Sidebar / Topbar (UI-1 完成)
- Sanity schema / API 連携
- Activity Log の build-time snapshot 仕組み (`build:activity-snapshot` script は touch なし)
- `npm run local:check` 自体の改修
- `publish-packages/` ディレクトリ構造の変更
- dead code 削除 (SummaryCard / SectionHeader / EmptyState / FilePathBlock 削除は **本 batch land 後の microbatch** で実行)
- Phase 2B 実 write actions (`/diagnostics` 再実行を server action で等)
- 並列 batch 候補: `/analytics` / `/knowledge` / `/settings` fidelity spec (これらは別 batch)

## I. Phase UI-fidelity-8 着手後の clean-up 連鎖

本 batch + 実装 batch の完了後、handoff/0156 §6「中期」で挙げた 4 件を **dead-code-cleanup microbatch** で削除可能:

| File | 削除前提 (3 page の全 import が消えること) |
|---|---|
| `dashboard/src/components/SummaryCard.tsx` | 3 page で計 11 箇所 → 0 |
| `dashboard/src/components/SectionHeader.tsx` | 3 page で計 4 箇所 → 0 |
| `dashboard/src/components/EmptyState.tsx` | 3 page で計 8 箇所 → 0 |
| `dashboard/src/components/FilePathBlock.tsx` | `/publish-packages` の 1 箇所 → 0 |

実装 batch + cleanup microbatch の 2 段で完結する想定。
