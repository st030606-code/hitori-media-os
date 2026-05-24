# Devlog 0156 — Codex B fixes applied (B1/B2/B3)

日付: 2026-05-20

## 背景

handoff/0166 で Codex 独立 reviewer が指摘した High-priority findings B1/B2/B3 を 1 microbatch で修正。3 件すべて Codex が "Safe to patch now: yes" を立てており、共通テーマは **demo data hardcoding** (boss の workspace 以外で UI が壊れる) の排除。

C 3 件 (FilterBar a11y / devlog reader 重複 / dead code audit) と D 5 件 は本 batch の scope 外。

## 決定・変更

### B1 — `dashboard/src/app/page.tsx` (Home page)

**Before**: `building-hitori-media-os` を 5 箇所で hardcode (PageHeader actions × 1 + buildTasks の 4 task href)。

**After**:
- `pickPrimaryCampaign(campaigns)` helper を導入、優先順位:
  1. status が `{draft, planning, generating, reviewing}` のいずれか (active)
  2. `manualPublishingNotStartedCount > 0` (publishing pending)
  3. リスト先頭で `slug` が定義されているもの
- `primarySlug` / `primaryTitle` を server 側で computed
- PageHeader actions の `<Link>` を conditional render:
  - `primarySlug` あり → `/publish-package/${primarySlug}` (encodeURIComponent 経由)、`title=` に campaign 名表示
  - なし → 同 layout の `<span aria-disabled>` で disabled state
- `primarySlug` が null のときに「キャンペーンがまだありません」の inline border-dashed empty card を追加
- `buildTasks(data, primarySlug)` に signature 変更:
  - `pending-gates` task は `/human-review-gates` のままで slug 非依存
  - `publishing-pending` は `primarySlug && data.manualPublishingPending > 0` のとき rendering
  - `reaction-notes` / `threads-decision` は `primarySlug` あり時のみ
  - `release-review-ack` (完了タスク) は `primarySlug && data.manualPublishingDone > 0` のとき rendering — 公開実績がない workspace で「完了 ✓」表示しない

### B2 — `dashboard/src/app/publish/page.tsx`

**Before**: `const DEFAULT_SLUG = 'building-hitori-media-os'` 直書き、`requestedSlug = sp.slug || DEFAULT_SLUG` の chain。

**After**:
- `pickDefaultSlug(campaignList)` helper を導入、優先順位:
  1. `manualPublishingNotStartedCount > 0` (publishing not all done)
  2. status が active 集合のいずれか
  3. リスト先頭で slug が定義されているもの
- フロー再構成:
  1. `campaignList` + `outputs` を `Promise.all` で並列 fetch (detail は list なしに default を導けないため分離)
  2. `effectiveSlug = requestedSlug ?? pickDefaultSlug(campaignList)`
  3. effectiveSlug あれば detail fetch
  4. requestedSlug 指定されたが detail null → derived default で再 fetch (degrade 防止)
- requestedSlug なし + campaignList 空 → 既存の empty state (「指定の campaign が見つかりません」+ `/campaigns` link) を render
- `ACTIVE_STATUSES` 定数を /campaigns list page と同期

### B3 — `dashboard/src/app/settings/page.tsx` + `dashboard/src/components/settings/LocalDevCard.tsx`

**Before**: 2 箇所で `/diagnostics` への `<Link>` を `enableDiagnostics` に関わらず render。`ENABLE_DIAGNOSTICS=false` 時に 404 保証。

**After**:
- `/settings/page.tsx`:
  - PageHeader actions: `{enableDiagnostics ? <Link href="/diagnostics"> : <span aria-disabled>}`
  - disabled state は「診断ページは現在無効です」 + tooltip「ENABLE_DIAGNOSTICS が off のため /diagnostics は 404 を返します」
  - LocalDevCard に `enableDiagnostics={enableDiagnostics}` props を渡す
- `LocalDevCard.tsx`:
  - `Props { enableDiagnostics: boolean }` interface 追加
  - `SHORTCUTS` 定数 (module-level) を関数内 `shortcuts` 配列に移動、`{label: '診断', enabled: enableDiagnostics, disabledHint: ...}` で gating 情報を持たせる
  - render loop で `active = s.enabled === undefined || s.enabled` を分岐:
    - active → 既存の `<Link>`
    - disabled → 同 layout の `<span aria-disabled>` with `disabledHint` テキスト
  - 既存の作業ログ / 公開パッケージ一覧 shortcut は `enabled` 未指定で常時 active のまま

## 理由

- **「first active campaign」を最優先**: Codex の recommended order (handoff/0166 §4-4 B1 / B2)。「active な campaign がある」= boss が現在取り組んでいる可能性が高く、CTA / default の意味がある
- **`encodeURIComponent` を slug 全てに**: Sanity slug は基本 ASCII だが、Unicode が混じると Next router で broken link になる。防御
- **empty state を inline border-dashed**: Phase UI-fidelity 全期間の empty state パターンに整合
- **`release-review-ack` を `manualPublishingDone > 0` で gating**: 公開実績 0 で「✓ 完了」表示すると、初見 boss が困惑する。「完了済」は実際に完了したときのみ
- **disabled state を `<span aria-disabled>` で**: button にすると click 可能と誤認させる、`<a aria-disabled>` は本来非推奨。`<span>` + `cursor-not-allowed` で意図を明示
- **`LocalDevCard` の SHORTCUTS を module-level → 関数内 array に**: props 駆動の動的な配列にする最小変更、他 shortcut の追加方針 (将来 enabled 制御を増やすとき) も統一できる

## 影響

- **23 routes 動作維持**、dashboard TypeScript clean、Sanity Studio 7.9s clean
- demo data hardcoding が完全排除 → boss が他 workspace に deploy しても UI が壊れない
- `/settings` から `/diagnostics` への dead link が production-safe flag config 下で消滅
- Sanity 書き込みなし / schema 変更なし / publish-package 不変 / assets-visuals 不変 / patches 不変 / deploy なし / package 追加なし
- 他 fidelity 化済 page は完全 untouched (Phase UI-fidelity-1〜10 すべて intact)

## 残る Codex findings (本 batch 対象外)

- **C1**: FilterBar (`VisualAssetsFilterBar.tsx:39`) の `role="tablist"` 半実装、tabpanel/aria-controls/keyboard roving 不在 — 別 microbatch
- **C2**: `/analytics` と `/activity-log` で devlog frontmatter parser 重複 — 別 microbatch (`lib/devlog/readDocs.ts` 抽出)
- **C3**: `CampaignStatusCard.tsx` / `WorkingPipelineStatus.tsx` (+ 他) の dead code audit — 別 microbatch

## 次の一手

1. **boss が `cd dashboard && npm run dev` で動作確認**:
   - `/` → 「公開パッケージを開く」CTA が現 dataset の primary campaign を指すこと / dataset 空時に empty state
   - `/publish` (slug 指定なし) → derived default で render / slug 指定 → そちら / 存在しない slug 指定 → derived default に degrade
   - `/settings` → `ENABLE_DIAGNOSTICS=true` で `/diagnostics` link active / `=false` で disabled state「診断ページは現在無効です」
2. 完了後の選択肢:
   - C 3 件をまとめる microbatch (FilterBar a11y + devlog reader 共通化 + dead code audit)
   - dashboard/README.md 全体書き直し
   - Phase 2B 議論 (実 write actions)
   - D 5 件は Phase 2B 議論時に再評価

## 発信ネタ候補

- 「demo data hardcoding を独立 review で見つける」: 自分で書いた人は気付きにくい、Codex の目線で発見できた話
- 「`first active campaign` という derivation 優先順位」: シンプルな heuristic が dataset 移行で機能する
- 「`<a aria-disabled>` は罠」: span に替えることでセマンティクスを正しく扱う細部
