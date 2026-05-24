# Handoff: Utility Pages Fidelity Spec (docs only)

Date: 2026-05-20

## 1. Task Goal

`/publish-packages`, `/activity-log`, `/diagnostics` の 3 utility page を Phase UI-fidelity-1〜7 と同じ design tone に揃えるための implementation-ready spec を作成する **audit + docs only** batch。

これら 3 page が依然 `SummaryCard` / `SectionHeader` / `EmptyState` / `FilePathBlock` を使い続けていることが、handoff/0156 §6「中期」削除候補のブロッカー。fidelity 化すれば旧 component の import 数が 0 になり、続く dead-code-cleanup microbatch で 4 ファイル削除可能。

コード変更ゼロ。

## 2. Constraints Followed

- ✅ Docs only、runtime code 変更なし
- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ publish-package files 不変
- ✅ assets/visuals / patches 不変
- ✅ deploy なし
- ✅ package 追加なし
- ✅ 23 routes 動作維持 (build 不変)
- ✅ `/publish-package/[slug]` v0.2 unchanged
- ✅ Phase UI-fidelity-1〜7 で fidelity 化済 page も unchanged

## 3. Changed Files

### 新規 docs (4)

- `docs/78-utility-pages-fidelity-spec.md` — 3 section (A: /publish-packages, B: /activity-log, C: /diagnostics) + D 章 component replacement plan + E 章 implementation order + I 章 cleanup 連鎖
- `docs/devlog/0147-utility-pages-fidelity-spec.md`
- `docs/handoff/0158-utility-pages-fidelity-spec.md` (本ファイル)
- `docs/handoff/latest.md` (mirror)

### コード変更 (なし)

dashboard / Sanity Studio / tools / schemas いずれも touch なし。

## 4. Summary of Changes

### 4-1. Routes audited (3)

| Route | 行数 | 主要セクション数 | 旧 component 使用数 |
|---|---|---|---|
| `/publish-packages/page.tsx` | 259 | 6 (header / 4 SummaryCard / errors / entries / per-package details) | SummaryCard ×4, EmptyState ×3, FilePathBlock ×1 |
| `/activity-log/page.tsx` | 240 | 5 (header / 4 SummaryCard / snapshot error / DocList ×2) | SummaryCard ×4, SectionHeader ×2, EmptyState ×3 |
| `/diagnostics/page.tsx` | 198 | 6 (header / 4 SummaryCard / errors / Checks / Raw output / amber warning) | SummaryCard ×4, SectionHeader ×2, EmptyState ×2 |

### 4-2. Old components found

3 page を合計したときの旧 component 利用状況:

| Component | 全 import 箇所 | 削除可能になる条件 |
|---|---|---|
| `SummaryCard` | 11 (publish-packages 4 + activity-log 4 + diagnostics 4) | 3 page 全てが KpiCard に置換 |
| `SectionHeader` | 4 (activity-log 2 + diagnostics 2) | 3 page 全てが inline `<header>` に置換 |
| `EmptyState` | 8 (publish-packages 3 + activity-log 3 + diagnostics 2) | 3 page 全てが inline border-dashed / border-rose-200 card に置換 |
| `FilePathBlock` | 1 (publish-packages) | inline `<code>` + CopyButton に置換 |

すべての import 元が 3 page 内で完結 — 他の active page (`/publish-package/[slug]` 等) からは import されていない。よって 3 page を 1 batch で fidelity 化すれば、4 ファイルすべて削除可能になる。

### 4-3. Specs created

`docs/78-utility-pages-fidelity-spec.md` の構成:

- **A. /publish-packages fidelity spec** — current/target structure / data sources / old components / component replacements / likely files / P0-P2 scope
- **B. /activity-log fidelity spec** — 同様の構造
- **C. /diagnostics fidelity spec** — 同様の構造
- **D. Component replacement plan (3 page 共通)** — 4 種の置換に sample code 付き
- **E. Implementation order** — Option A (段階) / Option B (1 batch、推奨)
- **F. Constraints** — runtime / data fetch logic / feature flags は touch なし
- **G. Boss decision points** — 6 件 (日本語 rename / Breadcrumb 親 / 再実行 action / filter / FilePathsCard 共通化 等)
- **H. Out of scope** — Sanity / API / build-time snapshot / dead code 削除 / Phase 2B
- **I. Phase UI-fidelity-8 着手後の clean-up 連鎖** — 削除可能になる 4 ファイル一覧

### 4-4. Replacement plan

| Old | New | Sample |
|---|---|---|
| `<SummaryCard label primary secondary />` | `<KpiCard label value icon tone trend secondary />` (`<KpiCardsRow>` で wrap) | spec §D-1 |
| `<SectionHeader title description right />` | inline `<header className="mb-3 flex items-center justify-between gap-2">` (Visual Review pattern) | spec §D-2 |
| `<EmptyState title body />` (empty) | inline `border-dashed border-slate-300 bg-slate-50` card | spec §D-3 |
| `<EmptyState tone="error" />` (error) | inline `border-rose-200 bg-rose-50 text-rose-900` card | spec §D-3 |
| `<FilePathBlock path />` | inline `<code>` + `<CopyButton text label="copy" />` | spec §D-4 |
| `<ReadOnlyBanner />` | drop (no-op、Topbar の ReadOnlyPill が代替) | spec §D-5 |
| `<header><h1>` + `max-w-6xl` | `<PageHeader title description breadcrumb actions meta />` + `max-w-[1280px]` | spec §A-4 / B-4 / C-4 |

データ取得ロジック (`scanPackages` / `readDocsFromFs` / `loadSnapshot` / `runLocalCheck`) は **完全に touch なし**。layout / 表示のみ刷新。

### 4-5. Build validation

```
cd dashboard && npm run build  → ✓ 23 routes (unchanged、コード差分なし)
npm run build (Sanity Studio)  → ✓ Build Sanity Studio (clean、unchanged)
```

両 build とも前 batch (handoff/0157) 完了時から不変。

## 5. Key Decisions

- **1 batch でまとめる推奨 (Option B)**: 3 page は独立だが、削除可能な旧 component が共通。1 PR で完結する方が dead-code-cleanup 連鎖がきれい
- **`/diagnostics` を pilot route として spec に明記**: 3 page で最小、`/diagnostics → /activity-log → /publish-packages` の段階実装が代替案 (Option A)
- **データ取得ロジックは touch なし**: fidelity batch の scope を「layout / 表示」に限定することで回帰リスクを最小化
- **shadcn 全 NO 継続**: Phase UI-fidelity-1〜7 と同方針
- **rename 候補は Boss decision に**: 「公開パッケージ一覧」「作業ログ」「診断」の日本語化を boss 確認待ち
- **FilePathsCard 共通化は本 batch では行わない (YAGNI)**: `/publish-packages` で 1 path のみ表示する用途なら inline で十分、`visual-review/FilePathsCard` を `common/` へ移すのは将来 reuse が増えたとき

## 6. Human Review Questions

1. **日本語 rename を採用するか?** 「Publish Packages」→「公開パッケージ一覧」/「Activity Log」→「作業ログ」/「Diagnostics」→「診断」
2. **Breadcrumb 親**: 3 page とも「ダッシュボード」直下で OK か、それとも /publish や /visual-assets の下に置くか
3. **1 batch (Option B) vs 段階 (Option A)**: 1 PR でまとめる方を推奨、boss が「diff が大きい」と感じれば段階分割
4. **`/diagnostics` の「再実行」action button**: P1 で server action として実装するか、P2 まで delay か
5. **filter / search の優先度**: `/publish-packages` の platform filter, `/activity-log` の devlog/handoff toggle を P1 か P2 か
6. **FilePathsCard 共通化**: 本 batch で `common/` に移すか、現状の `visual-review/` に置いたまま `/publish-packages` は inline で済ませるか

## 7. Risks or Uncertainties

- **`/diagnostics` の `execFile` は通常 200ms 以下**: KpiCard の Duration tone を ok=slate / fail=red にすると視覚的に「成功なら静か、失敗で目立つ」のが理想。実装時に微調整
- **`/activity-log` snapshot mode**: production 動作 (build-time JSON) はテスト dataset がないため、boss 環境で確認必要
- **`/publish-packages` の per-package `<details>`**: ファイル数が多い package (100+) で `<details>` を開くと縦に伸びる。boss が違和感感じれば max-height + overflow-auto microbatch
- **Phase 2B 連携**: `/diagnostics` の「再実行」を server action 化するなら write 系の方針確定が前提、本 batch scope 外
- **dataset 偏り**: 現状 `/publish-packages` は building-hitori-media-os のみ。3-4 platform 並ぶときの layout を確認しづらい

## 8. Next Recommended Step

1. **boss が docs/78 を読む**:
   - §A / B / C で各 page の target structure に違和感ないか
   - §G boss decision points 6 件を回答
   - §E implementation order の Option B (1 batch) で進めるか
2. boss OK → Phase UI-fidelity-8 (utility pages implementation) 着手
3. 実装完了後、**dead-code-cleanup microbatch** で 4 旧 component 削除 (handoff/0156 §6「中期」連鎖完了)
4. 並行候補:
   - `/analytics`, `/knowledge`, `/settings` fidelity spec (残り fidelity 系)
   - `dashboard/README.md` 全体書き直し (Phase UI-fidelity 反映)
   - Phase 2B 議論 (実 write actions)

## 9. Exact Codex Prompt for Phase UI-fidelity-8 (utility pages implementation)

```text
Implement Phase UI-fidelity-8: Utility pages implementation.

Use:
- docs/78-utility-pages-fidelity-spec.md (this spec)
- docs/handoff/0158-utility-pages-fidelity-spec.md (this handoff、boss decisions が反映されたもの)
- docs/handoff/0157-final-dead-code-microbatch.md (latest tone)

Boss-confirmed scope (handoff §6 で boss が回答した内容を確認してから着手):
- 日本語 rename: yes/no (boss 回答に従う)
- Breadcrumb 親: ダッシュボード直下 / 別案
- 1 batch でまとめる (Option B、推奨)
- /diagnostics 再実行 action: P2 delay (server action は別 batch)
- filter / search: P2 delay (basic fidelity に集中)
- FilePathsCard 共通化なし (inline で済ます)
- shadcn 追加なし、native HTML + Tailwind のみ

Hard Rules:
- Do NOT modify Sanity schema
- Do NOT write to Sanity
- Do NOT modify publish-package files
- Do NOT modify assets/visuals / patches
- Do NOT add packages、shadcn 追加なし
- Do NOT deploy / auto-post
- Keep all 23 routes working
- Keep /publish-package/[slug] unchanged
- Keep /, /configurator, /publish, /outputs, /campaigns/[slug], /visual-assets/* unchanged
- Data fetch logic は完全に touch なし (scanPackages / readDocsFromFs / loadSnapshot / runLocalCheck はそのまま reuse)

Tasks (P0):

1. Rewrite `/publish-packages/page.tsx`:
   - PageHeader + Breadcrumb (max-w-[1280px])
   - KpiCardsRow: Packages / Files / Images / Markdown (Layers / FileText / Image / FileType, slate / blue / purple / emerald)
   - inline error card (rose-200) + inline empty card (border-dashed)
   - PackageCard (旧 PackageRow rename) with inline <code> + CopyButton instead of <FilePathBlock>
   - <details> の files listing は現行 logic 維持
   - 削除: ReadOnlyBanner, SummaryCard, EmptyState, FilePathBlock, SectionHeader (この page では使われていない)

2. Rewrite `/activity-log/page.tsx`:
   - PageHeader + Breadcrumb (max-w-[1280px])
   - KpiCardsRow: モード / Devlog / Handoff / ソース (Database / FileText / FileText / Server, slate / blue / purple / emerald)
   - inline error card (snapshot 失敗時、rose-200)
   - DocListCard (旧 DocList rename) with inline <header> instead of <SectionHeader>
   - per-entry: title + chip meta + excerpt + relPath code + CopyButton (P1 候補だが本 batch で実装 OK)
   - 削除: ReadOnlyBanner, SummaryCard, SectionHeader, EmptyState

3. Rewrite `/diagnostics/page.tsx`:
   - PageHeader + Breadcrumb (max-w-[1280px])
   - KpiCardsRow: 結果 / 成功 / 失敗 / 所要時間 (Activity / CheckCircle2 / XCircle / Timer)
     - 結果 tone: ok=emerald / fail=red / error=red
   - inline error card (runError or parseError、rose-200)
   - Checks section: inline <header> + <ul divide-y> (現行 layout 維持、StatusBadge も維持)
   - Raw output section: inline <header> + <details> with dark pre (現行 layout 維持)
   - amber warning section: tone 微調整 (rounded-lg border-amber-200 bg-amber-50)
   - 削除: ReadOnlyBanner, SummaryCard, SectionHeader, EmptyState

4. Verify import count drops to 0 for 4 components:
   ```bash
   grep -rn "from '@/components/SummaryCard'" dashboard/src
   grep -rn "from '@/components/SectionHeader'" dashboard/src
   grep -rn "from '@/components/EmptyState'" dashboard/src
   grep -rn "from '@/components/FilePathBlock'" dashboard/src
   ```
   All should return 0 lines.

5. Builds:
   - `cd dashboard && npm run build` (23 routes 維持)
   - `npm run build` (Sanity Studio clean)

6. Docs:
   - `docs/devlog/0148-ui-fidelity-8-utility-pages.md`
   - `docs/handoff/0159-ui-fidelity-8-utility-pages.md`
   - `docs/handoff/latest.md` (mirror)

Validation:
- 全 23 routes が build green
- `/publish-packages` で 4 KpiCard + PackageCard grid
- `/activity-log` で 4 KpiCard + DocListCard ×2
- `/diagnostics` で 4 KpiCard + Checks list + Raw output
- 4 旧 component の import 数すべて 0
- 既存 page (`/`, `/configurator`, `/publish`, `/outputs`, `/campaigns/[slug]`, `/visual-assets/*`, `/publish-package/[slug]`) は touch なし

Follow-up (next microbatch、本 batch 完了後):
- 4 旧 component を一括 rm + docs/devlog/0149 + docs/handoff/0160
```
