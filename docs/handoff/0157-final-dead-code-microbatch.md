# Handoff: Final dead code microbatch

Date: 2026-05-20

## 1. Task Goal

handoff/0156 §6 「短期 microbatch」で残していた 4 件の orphan / stale 参照 (`EmptyCandidateState.tsx` / `NavFlags` & `getNavFlags` / BigPreviewCard コメント / README の AppNav 言及) を 1 microbatch でまとめて消す。Runtime 振る舞い無変更、cleanup のみ。

## 2. Constraints Followed

- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ publish-package files 不変
- ✅ assets/visuals 不変
- ✅ patches 不変
- ✅ deploy なし
- ✅ auto-post なし
- ✅ package 追加なし
- ✅ 23 routes 動作維持 (dashboard build green、Sanity Studio clean)
- ✅ 削除 / 編集は import 数 0 確認後のみ
- ✅ active component / page / API は完全に touch なし

## 3. Changed Files

### 削除 (1)

- `dashboard/src/components/visual-review/EmptyCandidateState.tsx`

### 編集 (3)

- `dashboard/src/lib/featureFlags.ts` — `NavFlags` interface + `getNavFlags()` 関数 + 直前の AppNav 言及コメントを削除
- `dashboard/src/components/visual-review/BigPreviewCard.tsx` — line 3 の "(same source as the existing CandidatePreview)" コメントを更新
- `dashboard/README.md` — 4 箇所の AppNav 言及を Sidebar / AppShell 系に置換

### 新規 docs

- `docs/devlog/0146-final-dead-code-microbatch.md`
- `docs/handoff/0157-final-dead-code-microbatch.md` (本ファイル)
- `docs/handoff/latest.md` (mirror)

## 4. Summary of Changes

### 4-1. Files checked (4)

| Target | 実行 grep | 結果 |
|---|---|---|
| `EmptyCandidateState` | `grep -rn "EmptyCandidateState" dashboard tools` | self-only (定義 2 行のみ) → import 0 |
| `NavFlags` (interface) | `grep -rn "NavFlags\b" dashboard tools` | featureFlags.ts の宣言 + `getNavFlags` 戻り型のみ → import 0 |
| `getNavFlags` (function) | `grep -rn "getNavFlags" dashboard tools` | 宣言 1 件のみ → import 0 |
| BigPreviewCard.tsx の `CandidatePreview` | `grep -n "CandidatePreview" dashboard/src/components/visual-review/BigPreviewCard.tsx` | コメント 1 行 (line 3) のみ |
| README の `AppNav` | `grep -n "AppNav" dashboard/README.md` | 4 行 (line 18 / 50 / 51 / 350) いずれも文書記述 |

すべて削除 / 編集を実施。

### 4-2. Files deleted (1)

- `dashboard/src/components/visual-review/EmptyCandidateState.tsx` — Phase UI-fidelity-6 で `/visual-assets/[assetId]/candidates` が独自の inline EmptyCard を持ったため、共有版は不要に

### 4-3. Files edited (3)

**`dashboard/src/lib/featureFlags.ts`**:
- 削除: `export interface NavFlags { enableDiagnostics: boolean; enableLocalFsRoutes: boolean }`
- 削除: `export function getNavFlags(): NavFlags { ... }`
- 削除: 直前の `// Helper for layout.tsx to bundle just the props AppNav needs.` コメントブロック (2 行)
- 残存 export: `isProductionRuntime`, `enableDiagnostics`, `enableLocalFsRoutes`, `activityLogMode`, `type ActivityLogMode`
- runtime 動作は完全に無変更

**`dashboard/src/components/visual-review/BigPreviewCard.tsx`**:
- 変更前 (line 3): `// (same source as the existing CandidatePreview). When the local FS feature`
- 変更後 (line 3): `// route (no Next.js image optimization for already-bounded local PNGs). When`
- ロジック / props / レンダリング は完全に無変更

**`dashboard/README.md`** (4 箇所):
- line 18: `AppNav hides those links automatically` → `the Sidebar hides those links automatically`
- line 50: `/diagnostics ページ + AppNav link` → `/diagnostics ページ + Sidebar link`
- line 51: `/publish-packages ページ + AppNav link, ...` → `/publish-packages ページ + Sidebar link, ...`
- line 350 (Repository layout tree): `│   ├── AppNav.tsx                 # top navigation (Batch B; ...)` → `│   ├── app-shell/                 # AppShell + Sidebar + Topbar (Phase UI-1; replaces old AppNav)`

### 4-4. Import / reference verification result

削除後の最終 grep:

```bash
grep -n "AppNav\|NavFlags\|getNavFlags\|EmptyCandidateState" dashboard/src dashboard/README.md -r
```

結果: 残り 1 件のみ — `dashboard/README.md:351` の Repository layout ツリー内の "replaces old AppNav" の歴史的注記 (意図的に残置、新規メンバーが旧名で grep したときに「app-shell/ に移った」と分かるための breadcrumb)。

### 4-5. Build validation

```
cd dashboard && npm run build  → ✓ TypeScript clean, 23 routes (unchanged)
npm run build (Sanity Studio)  → ✓ Build Sanity Studio (7908ms) clean
```

23 routes 全て不変:

```
/, /_not-found, /activity-log, /analytics,
/api/asset-thumb, /api/visual-review/assets/[assetId]/candidates,
/api/visual-review/candidate-image, /api/visual-review/inbox,
/api/visual-review/review-manifest,
/campaigns, /campaigns/[slug], /configurator, /diagnostics,
/human-review-gates, /knowledge, /outputs, /publish,
/publish-package/[slug], /publish-packages, /settings,
/visual-assets, /visual-assets/[assetId],
/visual-assets/[assetId]/candidates
```

## 5. Key Decisions

- **README の "replaces old AppNav" を残す**: 完全削除すると過去の bookmark / 旧資料で AppNav.tsx を探した人が無意味な grep に時間を使う。1 行で「app-shell/ に移った」と breadcrumb を残すのが親切
- **featureFlags の orphan を 1 微編集で済ませる**: `NavFlags` / `getNavFlags` は依存関係なく、5+7+2 行の削除のみで完結。active export を保護
- **BigPreviewCard コメントは「なぜ native `<img>`」を直接書く**: 削除済み component を引用するより、本来の理由 (Next.js image optimization を避ける) を直書きする方が読みやすい
- **Repository layout ツリーは局所修正のみ**: 全体は Batch B 時代のままで他にも古い記述があるが、本 microbatch のスコープは AppNav 言及置換に限定。README 全体書き直しは別 batch

## 6. Remaining Cleanup Candidates

### 中期 (`/publish-packages`, `/activity-log`, `/diagnostics` の fidelity 化と同時に)

| File | 削除可能になる条件 |
|---|---|
| `dashboard/src/components/SummaryCard.tsx` | 3 page を KpiCard ベースに置換 |
| `dashboard/src/components/SectionHeader.tsx` | 3 page を PageHeader + `<header>` 直書きに置換 |
| `dashboard/src/components/EmptyState.tsx` | 3 page を inline empty state に置換 |
| `dashboard/src/components/FilePathBlock.tsx` | `/publish-packages` を FilePathsCard or inline に置換 |

### 長期 (Phase 2 以降)

- `dashboard/src/components/visual-review/DeferredActionButton.tsx` — Phase 2B で実 write actions が入ると placeholder の役目を終える
- `dashboard/src/components/visual-review/LocalModeBanner.tsx` — Phase D2 build-time snapshot で local-only fallback が解消されると不要に
- `dashboard/README.md` の Batch B/C 時代の記述全般 — Phase UI-fidelity の現状を反映する大幅 update batch
- `dashboard/src/components/ReadOnlyBanner.tsx` — 既に no-op、Phase UI-3+ で write actions が入ったら削除 (現状 import 数を要再確認)

### `ReadOnlyBanner.tsx` の状況再確認

```bash
grep -rn "ReadOnlyBanner" dashboard/src --include="*.ts" --include="*.tsx"
```

予想: コンポーネント本体 + 旧 page で import が残っている可能性。本 microbatch では確認のみで touch せず、別 cleanup microbatch 候補として §6 に追記。

## 7. Human Review Questions

1. **README の Repository layout の旧記述**: AppNav 部分以外も Batch B 時代の名称が残っている (SectionHeader / SummaryCard / EmptyState など)。全体書き直しの batch を別に立てるか、それとも fidelity batch のたびに該当行を直すか
2. **featureFlags.ts の AppNav 関連コメント**: 過剰に削除しすぎていないか? `getNavFlags` の helper 意図を「歴史的 breadcrumb」として残したい場合は復活可能
3. **BigPreviewCard コメントの文言**: 「no Next.js image optimization for already-bounded local PNGs」は適切か、それとも別の文言が望ましいか?
4. **「replaces old AppNav」の breadcrumb**: 残すべきか、完全削除すべきか?

## 8. Risks or Uncertainties

- **README 全体は Batch B 時代の構造**: 本 microbatch では AppNav 言及のみ置換、それ以外は touch なし。boss が「README が古い」と認知しなかった可能性
- **featureFlags export の保護**: `NavFlags` / `getNavFlags` を削除しても、active export (`enableDiagnostics`, `enableLocalFsRoutes`, `activityLogMode`, `isProductionRuntime`) は不変。`grep` で全 import 元を確認済み
- **bundle size の微減**: 1 ファイル削除 + 5+7+2 = 14 行コード削除 + コメント数行。実 bundle 影響はほぼ計測不能レベル
- **歴史的 breadcrumb**: README で「replaces old AppNav」と残しているのは旧資料との接続のため。完全削除を求める boss feedback があれば 1 行削除可能

## 9. Next Recommended Step

**Option A — `/publish-packages`, `/activity-log`, `/diagnostics` fidelity spec (推奨、ROI 高)**

これら 3 page を fidelity 化すると、中期 4 件 (SummaryCard / SectionHeader / EmptyState / FilePathBlock) を一気に削除できる。先に spec docs only batch で audit、続けて実装 batch。

```text
Create fidelity spec for /publish-packages, /activity-log, /diagnostics.

Inputs:
- Current state: dashboard/src/app/publish-packages/page.tsx /activity-log/page.tsx /diagnostics/page.tsx
- Reference: docs/68 / docs/69 / docs/77 (latest tone) / docs/handoff/0157

Hard Rules (audit + spec docs only):
- Do NOT modify code in this batch
- Do NOT modify Sanity schema
- Do NOT add packages
- Audit-only docs deliverable

Tasks:
1. Audit each route, identify replacements (PageHeader / KpiCard / inline empty state)
2. Create docs/78-{route}-fidelity-spec.md per page or single combined doc
3. Phase UI-fidelity-8 用 Codex prompt を handoff §9 に同梱
```

**Option B — `/analytics`, `/knowledge`, `/settings` fidelity spec**

残り fidelity 系 3 route の audit + spec。これらは PhasePlaceholder なので影響は小さい。

**Option C — dashboard/README.md の本格書き直し**

Batch B/C/D の歴史的記述を Phase UI-fidelity-1〜7 の現状に更新。

**Option D — Phase 2B 議論**

実 write actions (Approve & register / Regenerate / Sanity controlled write) の方針確定。
