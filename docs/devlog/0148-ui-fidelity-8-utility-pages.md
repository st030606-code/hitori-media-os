# Devlog 0148 — Phase UI-fidelity-8 Utility pages implementation

日付: 2026-05-20

## 背景

docs/78 / handoff/0158 で確定した spec を実装する batch。`/publish-packages` / `/activity-log` / `/diagnostics` の 3 utility page を Phase UI-fidelity-1〜7 と同じ design tone (PageHeader + Breadcrumb + KpiCardsRow + 直書き section + inline empty/error) に揃え、旧 `SummaryCard` / `SectionHeader` / `EmptyState` / `FilePathBlock` の import を 0 にする。次の cleanup microbatch で旧 component を一括削除可能になる。

boss 確認済 scope:
- 日本語 rename: yes (公開パッケージ一覧 / 作業ログ / 診断)
- Breadcrumb parent: ダッシュボード直下
- 1 batch (Option B) でまとめて実装
- /diagnostics 再実行 action: P2 delay
- filter / search: P2 delay
- FilePathsCard 共通化: なし、inline `<code>` + CopyButton で済ます
- shadcn 追加なし、native HTML + Tailwind のみ

## 決定・変更

### 更新 (3 ファイル)

| File | 主な変更 |
|---|---|
| `dashboard/src/app/publish-packages/page.tsx` | title「公開パッケージ一覧」/ PageHeader + Breadcrumb / 4 KpiCard (Layers / FileText / Image / Hash) / inline rose error card / inline border-dashed empty card / PackageCard 内に inline `<code>` + CopyButton / `<details>` で files list を表示 |
| `dashboard/src/app/activity-log/page.tsx` | title「作業ログ」/ PageHeader + Breadcrumb / 4 KpiCard (Database / FileText / FileText / Server) / inline rose error (snapshot 失敗時) / DocListCard で inline `<header>` + per-entry に CopyButton |
| `dashboard/src/app/diagnostics/page.tsx` | title「診断」/ PageHeader + Breadcrumb / 4 KpiCard (Activity / CheckCircle2 / XCircle / Timer) — 結果 tone は ok=emerald / fail=red、失敗 tone は redCount==0 で slate / inline rose runError / parseError card / Checks list を inline `<header>` で再構成 (StatusBadge 維持) / Raw output section も inline `<header>` / amber 警告に AlertTriangle icon pill 追加 |

### データ取得ロジック (完全 touch なし)

- `scanPackages` / `walkPackage` / `readDirEntries` (publish-packages)
- `readDocsFromFs` / `parseFrontmatter` / `buildExcerpt` / `dateFromFilename` / `loadSnapshot` (activity-log)
- `runLocalCheck` / `execFileAsync` (diagnostics)
- `enableLocalFsRoutes` / `enableDiagnostics` / `activityLogMode` feature flags

すべて従前のまま、layout と presentation のみ刷新。

### 旧 component import を 0 に

| Component | Before | After |
|---|---|---|
| `SummaryCard` | 11 (3 page × 4) | **0** |
| `SectionHeader` | 4 (activity-log 2 + diagnostics 2) | **0** |
| `EmptyState` | 8 (3 page) | **0** |
| `FilePathBlock` | 1 (publish-packages) | **0** |
| `ReadOnlyBanner` (3 page 内) | 3 (各 page で 1 回) | **0** |

旧 component ファイル自体は **本 batch では削除せず**、次の cleanup microbatch で `rm` 実施 (boss spec §I の連鎖通り)。

### 細部の修正

- `/diagnostics` の `PageHeader.description` が ReactNode 不可だったため、`<code>` を含めた説明を plain backtick 構文 ("`npm run local:check`") の文字列に変更
- 失敗チェック 0 件時の 「失敗」 KpiCard を red から slate に動的切り替え (全 ok の場合の視覚ノイズ削減)
- 「結果」 KpiCard tone は overall = ok → emerald / fail / error → red の動的選択

## 理由

- **1 batch でまとめる**: 3 page は独立だが、旧 component 削除の連鎖が共通の前提なので 1 PR で完結 → 直後の cleanup microbatch で「import 数 0 を確認して rm」が確実
- **データ取得ロジックは touch なし**: 回帰リスク最小化、fidelity batch の scope は「layout / 表示」に限定
- **inline `<code>` + CopyButton で十分**: PackageCard / DocListCard とも 1 path 表示のため、新 FilePathsCard を共通化するほどの reuse 量がない (YAGNI)
- **/diagnostics description を string 化**: PageHeader の type 制約に合わせる + backtick で `npm run local:check` を視覚的に code として伝える
- **AlertTriangle icon を amber 警告に追加**: 他 fidelity page で icon pill が tone consistency を支えているため、警告 banner も同型にすると馴染む
- **shadcn 全 NO 継続**: Phase UI-fidelity-1〜7 と同方針

## 影響

- 23 routes 動作維持、dashboard TypeScript clean、Sanity Studio 7.4s clean
- 旧 4 component の import 数すべて 0、次 microbatch で削除可能
- bundle 上は SummaryCard / SectionHeader / EmptyState / FilePathBlock のコードが unused になるため tree-shake で除去 (削除前から)
- `/configurator`, `/publish`, `/outputs`, `/campaigns/[slug]`, `/publish-package/[slug]`, `/`, `/visual-assets/*` は完全 untouched

## 次の一手

1. **boss が `cd dashboard && npm run dev` で 3 page 実機確認**:
   - `/publish-packages` → 4 KpiCard + PackageCard grid、`<details>` で files 展開
   - `/activity-log` → 4 KpiCard + Devlog / Handoff 2 DocListCard、各 entry に CopyButton
   - `/diagnostics` → 4 KpiCard (色が結果連動)、Checks list + Raw output + 警告 banner
2. 違和感あれば microbatch
3. 完了後の選択肢:
   - **dead-code-cleanup microbatch (推奨)** — SummaryCard / SectionHeader / EmptyState / FilePathBlock 4 ファイルを `rm`
   - `/analytics`, `/knowledge`, `/settings` fidelity spec (残り fidelity 系)
   - `dashboard/README.md` 全体書き直し
   - Phase 2B 議論

## 発信ネタ候補

- 「utility page を最後に揃える」: メイン surface から fidelity 化し、内部 utility は最後に揃える順序の ROI
- 「データ取得ロジックは touch しない fidelity batch」: 表示変更と logic 変更を 1 PR に混ぜないと回帰リスク低減 + review が早い
- 「旧 component を残しながら新 component に乗り換える」: import 0 を確認してから rm する 2-stage cleanup の安全性
