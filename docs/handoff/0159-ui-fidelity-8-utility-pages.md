# Handoff: Phase UI-fidelity-8 Utility pages implementation

Date: 2026-05-20

## 1. Task Goal

docs/78 で確定した spec を 1 batch で実装し、`/publish-packages` / `/activity-log` / `/diagnostics` を Phase UI-fidelity-1〜7 と同じ design tone に揃える。旧 `SummaryCard` / `SectionHeader` / `EmptyState` / `FilePathBlock` の import を 0 に落とし、次の cleanup microbatch で旧 component を一括削除可能にする。

データ取得ロジックは完全 touch なし。Phase 2B write actions は scope 外。

## 2. Constraints Followed

- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ publish-package files 不変
- ✅ assets/visuals 不変
- ✅ patches 不変
- ✅ deploy なし
- ✅ auto-post なし
- ✅ package 追加なし、shadcn 追加なし
- ✅ 23 routes 動作維持 (dashboard build green、Sanity Studio 7.4s clean)
- ✅ `/publish-package/[slug]` v0.2 unchanged
- ✅ `/`, `/configurator`, `/publish`, `/outputs`, `/campaigns/[slug]`, `/visual-assets/*` unchanged
- ✅ データ取得ロジック (scanPackages / readDocsFromFs / loadSnapshot / runLocalCheck) は完全 touch なし
- ✅ Phase 2B write actions 未実装、 `/diagnostics` 再実行は P2 delay

## 3. Changed Files

### 更新 (3)

- `dashboard/src/app/publish-packages/page.tsx`
- `dashboard/src/app/activity-log/page.tsx`
- `dashboard/src/app/diagnostics/page.tsx`

### 不変 (touch なし)

- `dashboard/src/components/SummaryCard.tsx` (削除候補、本 batch では touch せず)
- `dashboard/src/components/SectionHeader.tsx` (同上)
- `dashboard/src/components/EmptyState.tsx` (同上)
- `dashboard/src/components/FilePathBlock.tsx` (同上)
- `dashboard/src/components/ReadOnlyBanner.tsx` (3 page で import 削除、ファイルは残置)
- データ取得関数すべて
- feature flags すべて
- Sanity schema / API routes / publish-package / assets/visuals / patches

### 新規 docs

- `docs/devlog/0148-ui-fidelity-8-utility-pages.md`
- `docs/handoff/0159-ui-fidelity-8-utility-pages.md` (本ファイル)
- `docs/handoff/latest.md` (mirror)

## 4. Summary of Changes

### 4-1. Routes updated (3)

| Route | Title | Layout |
|---|---|---|
| `/publish-packages` | 公開パッケージ一覧 | PageHeader + Breadcrumb + 4 KpiCard (Layers / FileText / Image / Hash, slate / blue / purple / emerald) + inline rose error + inline border-dashed empty + PackageCard `<li>` with inline `<code>` + CopyButton |
| `/activity-log` | 作業ログ | PageHeader + Breadcrumb + 4 KpiCard (Database / FileText / FileText / Server, slate / blue / purple / emerald) + inline rose snapshot error + DocListCard ×2 (inline `<header>` + per-entry CopyButton) |
| `/diagnostics` | 診断 | PageHeader + Breadcrumb + 4 KpiCard (Activity / CheckCircle2 / XCircle / Timer, dynamic tone for 結果/失敗) + inline rose runError/parseError + Checks list section (StatusBadge 維持) + Raw output section (dark `<pre>` 維持) + amber warning with AlertTriangle pill |

すべて `max-w-[1280px]` + `gap-5` + `px-4 py-6 sm:px-6 lg:px-8` で fidelity tone と整合。

### 4-2. Old component imports removed

```
grep -rn "from '@/components/SummaryCard'"  dashboard/src  →  0 lines
grep -rn "from '@/components/SectionHeader'" dashboard/src →  0 lines
grep -rn "from '@/components/EmptyState'"   dashboard/src  →  0 lines
grep -rn "from '@/components/FilePathBlock'" dashboard/src →  0 lines
```

加えて 3 page から `ReadOnlyBanner` の import / 呼び出しも除去 (`<ReadOnlyBanner />` は no-op、Topbar の `<ReadOnlyPill />` が代替)。

### 4-3. Data fetch logic preserved

| Function | File | 変更 |
|---|---|---|
| `scanPackages` / `walkPackage` / `readDirEntries` | publish-packages | なし |
| `readDocsFromFs` / `parseFrontmatter` / `buildExcerpt` / `dateFromFilename` | activity-log | なし |
| `loadSnapshot` | activity-log | なし |
| `runLocalCheck` (`execFileAsync` with 60s timeout / 5MB maxBuffer) | diagnostics | なし |
| feature flag読み込み (`enableLocalFsRoutes` / `enableDiagnostics` / `activityLogMode`) | 3 page | なし |

### 4-4. Build validation

```
cd dashboard && npm run build  → ✓ TypeScript clean, 23 routes (unchanged)
npm run build (Sanity Studio)  → ✓ Build Sanity Studio (7440ms) clean
```

23 routes 健在: `/`, `/_not-found`, `/activity-log`, `/analytics`, `/api/asset-thumb`, `/api/visual-review/...` (4 routes), `/campaigns`, `/campaigns/[slug]`, `/configurator`, `/diagnostics`, `/human-review-gates`, `/knowledge`, `/outputs`, `/publish`, `/publish-package/[slug]`, `/publish-packages`, `/settings`, `/visual-assets`, `/visual-assets/[assetId]`, `/visual-assets/[assetId]/candidates`

### 4-5. Remaining old component files ready for deletion

| File | 現 import 数 | 削除可否 |
|---|---|---|
| `dashboard/src/components/SummaryCard.tsx` | 0 | ✓ 削除可能 |
| `dashboard/src/components/SectionHeader.tsx` | 0 | ✓ 削除可能 |
| `dashboard/src/components/EmptyState.tsx` | 0 | ✓ 削除可能 |
| `dashboard/src/components/FilePathBlock.tsx` | 0 | ✓ 削除可能 |

本 batch では削除しない (boss task instructions §4 「Do NOT delete the old component files in this batch」)。次の cleanup microbatch で `rm` 実施。

## 5. Key Decisions

- **1 batch でまとめる (Option B 採用)**: 3 page 独立だが旧 component 削除の連鎖が共通、1 PR で完結する方が cleanup microbatch との接続が単純
- **inline `<code>` + CopyButton で十分**: PackageCard / DocListCard とも 1 path のみ、新 FilePathsCard 共通化は YAGNI
- **データ取得ロジック完全 untouched**: 回帰リスク最小化、scope を「layout / 表示」に限定
- **/diagnostics の `PageHeader.description` を string 化**: `PageHeader.description` の型は string のため、code block を backtick リテラル ("`npm run local:check`") に変えて plain text に
- **失敗チェック 0 件時の tone 動的切替**: redCount === 0 で `tone="slate"` にすることで「all clear」状態のノイズを抑制
- **AlertTriangle icon pill を amber 警告 banner に追加**: 他 fidelity page の icon pill pattern と整合
- **旧 component ファイルは残置**: task instructions に従い、本 batch では touch せず次 microbatch で削除

## 6. Human Review Questions

1. **日本語タイトルの語感**: 「公開パッケージ一覧」「作業ログ」「診断」で良いか? `/publish-packages` を「公開パッケージ」とより短くする選択肢もある
2. **KpiCard secondary 文言**: 「リクエスト時に repo を読む」「build-time JSON を読む」「live read」「build-time」「all clear」「see details」等の細部、boss が違和感あれば microbatch
3. **/publish-packages の `<details>` 内 max-h-80**: ファイル数が多いとスクロールが必要、これで良いか / max-h-96 / 制限なし のどれが好み?
4. **/activity-log per-entry の relPath + CopyButton**: 全 entry で表示するため verbose になる、boss が「CopyButton は不要」と感じれば削除可能
5. **/diagnostics 警告 banner の AlertTriangle icon pill**: 他 fidelity page では icon pill = `inline-flex h-7 w-7` で統一しているが、警告 banner だと装飾過多になる可能性
6. **`ReadOnlyBanner.tsx` ファイルの今後**: 全 page から呼び出し 0 になった (今 batch で 3 page も削除)。次 cleanup で削除候補に追加するか?

## 7. Risks or Uncertainties

- **PageHeader.description が string のみ**: 他の fidelity page で description を ReactNode で渡したいケースがあれば PageHeader の API 拡張が必要。本 batch では string 化で回避
- **/diagnostics の動的 KpiCard tone**: ok と fail で色が変わるため、CSS purge で tone が全 variant ビルドされるか確認 (Tailwind v4 with `@theme inline` なら問題なし)
- **/publish-packages の dataset 偏り**: 現状 building-hitori-media-os のみ → 1 行のみ表示、grid 感が薄い。boss が複数 campaign を追加するまでは layout 確認が限定的
- **/activity-log per-entry CopyButton の verbose 感**: 20 件 × 2 種類 = 40 個の CopyButton。本 batch ではすべて表示するが、boss feedback で「relPath は折り畳み」化する option あり
- **`build:activity-snapshot` script は touch なし**: 本 batch では呼んでいないが、production deploy のフローでは依然必要。dashboard README で位置付けを再確認すべき (別 batch)
- **旧 component ファイル残置によるリポジトリの dead-weight**: cleanup microbatch まで残るが、import 0 のため bundle には含まれない

## 8. Next Recommended Step

**Option A (推奨、軽い、5 分) — Dead code cleanup microbatch**

import 0 を確認済みの 4 component ファイルを `rm` する microbatch。回帰リスク極小。

```text
Implement dead code cleanup after Phase UI-fidelity-8.

Use:
- docs/handoff/0159-ui-fidelity-8-utility-pages.md (this handoff、§4-5 で import 0 確認済)

Hard Rules:
- Do NOT modify Sanity schema / publish-package / assets/visuals / patches
- Do NOT add packages, no deploy
- 23 routes 動作維持
- Confirm import count is 0 before deletion

Tasks:
1. Re-verify import 0:
   - grep "from '@/components/SummaryCard'" dashboard/src
   - grep "from '@/components/SectionHeader'" dashboard/src
   - grep "from '@/components/EmptyState'" dashboard/src
   - grep "from '@/components/FilePathBlock'" dashboard/src
   (all should return 0 lines)
2. Delete (after confirm):
   - dashboard/src/components/SummaryCard.tsx
   - dashboard/src/components/SectionHeader.tsx
   - dashboard/src/components/EmptyState.tsx
   - dashboard/src/components/FilePathBlock.tsx
3. Optional: verify ReadOnlyBanner.tsx も import 0 になったか確認、別 candidate として §6 に追加
4. cd dashboard && npm run build → 23 routes 維持
5. npm run build (Sanity Studio) → clean
6. Write docs/devlog/0149-final-old-component-cleanup.md + docs/handoff/0160-final-old-component-cleanup.md + latest mirror
```

**Option B — `/analytics`, `/knowledge`, `/settings` fidelity spec**

残り fidelity 系 3 route の audit + spec batch。これらは PhasePlaceholder なので影響は小さい。

**Option C — dashboard/README.md の本格的な書き直し**

Phase UI-fidelity-1〜8 の現状を反映する README 全面更新 batch。

**Option D — Phase 2B 議論**

実 write actions の方針確定。
