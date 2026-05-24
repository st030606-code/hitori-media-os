# Devlog 0143 — Phase UI-fidelity-6 Visual Review implementation

日付: 2026-05-19

## 背景

docs/77 で確定した Visual Review fidelity spec (P0) を実装する batch。boss 確認済の scope:

- shadcn primitives: ALL NO (native HTML + Tailwind のみ)
- /[assetId] と /candidates は分離維持
- Sidebar nav label「図解レビュー」(navigation.ts は既に reflect 済)
- AssetCard inbox thumbnail: 既存 /api/asset-thumb の prefix 拡張で 1 endpoint
- RubricChecklistCard / RubricScoresCard は P1 (本 batch 対象外)
- Phase 2B action buttons: disabled + tooltip
- Visual Register external link が primary CTA
- Empty state は 3 ケース (dataset / inbox / production mode) を区別

## 決定・変更

### コード変更

**Sidebar nav rename** (Task 1):
- `dashboard/src/lib/navigation.ts` は既に「図解レビュー」になっていたため diff 0 (Phase UI-1 着手時に boss 承認済の label が反映されていた)

**`/api/asset-thumb` の prefix 拡張** (Task 6):
- `ALLOWED_PREFIX` 単数 → `ALLOWED_PREFIXES` 配列に: `['assets/visuals/', 'assets/inbox/generated/']`
- リクエストごとに `matchedPrefix` を 1 つ確定、以降の normalize / containment チェックは「その単一 prefix」に対して実行 → cross-prefix containment は構造上不可能
- 8MB cap / extension whitelist / traversal rejection / absolute path rejection / 二重 encode 検知は **すべて維持**
- `enableLocalFsRoutes` ガードも未変更 (production では 404 を返す)

**新規 helper**:
- `dashboard/src/lib/visualAssets/buckets.ts` — `VisualBucket` 型 / `bucketsFor()` / `countByBucket()` / `campaignSlugFromAssetId()`
- visualAssetPlan.status (enum: planned/brief-ready/prompt-ready/generated-needs-save/saved/reviewed/approved/packaged/published/archived) を 5 KPI バケットに正規化:
  - `all` (全件)
  - `candidates` (prompt-ready, generated-needs-save)
  - `approved` (reviewed, approved, packaged, published)
  - `needs-regen` (archived)
  - `saved` (saved)

**新規 component (9)**:
1. `VisualAssetsFilterBar.tsx` — bucket tab + 4 native control (assetType / platform / sort / search)
2. `VisualAssetsListView.tsx` — client wrapper: state, filter / sort, AssetCardGrid render
3. `AssetCard.tsx` — visualAssetPlan card with thumbnail fallback chain (final → inbox v001 → placeholder)
4. `AssetCardGrid.tsx` — 3-col grid wrapper
5. `AssetPreviewCard.tsx` — detail page hero preview (final 優先、なければ inbox v001、なければ placeholder)
6. `PlanMetadataCard.tsx` — visualAssetPlan 全 field の dl, prompt 本文 / visualDirection / reviewNotes は `<details>` collapsible
7. `BigPreviewCard.tsx` — candidates page の focused candidate 大画像 (`max-h-[640px] object-contain`)
8. `CandidateThumbStrip.tsx` — 横並びサムネ、click で focus 切替 (selected state with `ring-2 ring-blue-200`)
9. `SelectedCandidateMetaCard.tsx` — id / dims / size / generatedAt / variant / layoutPattern / 自己評価 / notes
10. `CandidateFocusLayout.tsx` — client wrapper: focus state + BigPreview + ThumbStrip + PromptContext + Meta + 承認アクション (Visual Register external + 3 Phase 2B placeholders)

**3 route rewrite**:
- `/visual-assets/page.tsx` — PageHeader + LocalModeBanner + 5 KpiCard + VisualAssetsListView + Visual Register CTA card
  - 旧 6 SummaryCard + 6 bucket-grouped section + 旧 VisualAssetTable は削除
- `/visual-assets/[assetId]/page.tsx` — PageHeader + LocalModeBanner + 2-col grid (Left: AssetPreviewCard + PlanMetadataCard / Right: CampaignContextCard inline + FilePathsRow + Actions card)
  - 旧 VisualAssetHeader + 旧 Reference section は削除 (VisualAssetHeader.tsx ファイルは残置、import 0 → 別 batch で削除候補)
- `/visual-assets/[assetId]/candidates/page.tsx` — PageHeader + LocalModeBanner + CandidateFocusLayout
  - 旧 CandidateGrid 横並び + 旧 prompt context dl / review rubric dl は削除 (CandidateGrid.tsx / CandidateCard.tsx / CandidatePreview.tsx も import 0 → 別 batch で削除候補)

**Empty state distinction** (Task 7):
- candidates page で 4 ケースに分岐:
  1. `!enableLocalFsRoutes` → 「ローカル候補プレビューは開発環境でのみ利用できます」(slate tone)
  2. `!slugs` (assetId 形式不正) → 「assetId からスラッグを導出できませんでした」
  3. `bundleError` → 「inbox の読み込みに失敗しました」(rose tone)
  4. `!hasCandidates` → 「候補画像はまだ生成されていません」+ codex exec 手順
- list page で 1 ケース:
  - `plans.length === 0` → 「Sanityに図解計画がまだ登録されていません」+ `npx sanity documents create` 手順

### 削除候補 (本 batch では touch せず、別 dead-code-cleanup batch で実施)

| File | 理由 |
|---|---|
| `dashboard/src/components/visual-review/VisualAssetHeader.tsx` | PageHeader に置換 |
| `dashboard/src/components/visual-review/CandidateGrid.tsx` | CandidateFocusLayout に置換 |
| `dashboard/src/components/visual-review/CandidateCard.tsx` | BigPreview + ThumbStrip に置換 |
| `dashboard/src/components/visual-review/CandidatePreview.tsx` | BigPreview に直接 `<img>` を埋め込み |
| `dashboard/src/components/visual-review/CandidateStatusBadge.tsx` | 現在 import 0 |
| `dashboard/src/components/SummaryCard.tsx` | KpiCard に置換 |
| `dashboard/src/components/SectionHeader.tsx` | 全 fidelity page で migrate 済 |
| `dashboard/src/components/EmptyState.tsx` | inline EmptyCard で代替 |
| `dashboard/src/components/FilePathBlock.tsx` | inline `PathRow` で代替 |

## 理由

- **bucket 5 種**: boss 指示の 5 KPI (すべて / 候補あり / 承認済み / 要再生成 / 保存済み) を visualAssetPlan の enum に対し 1-to-1 mapping。状態の意味が明確、`all` バケットに全件、その他は disjoint
- **AssetCard fallback chain**: production では `enableLocalFsRoutes=false` で thumbnail は表示されず ImageIcon placeholder。local では final 優先 → inbox v001 fallback。本番 build を安全に保てる
- **CandidateFocusLayout client wrapper**: focus 状態を 1 件 client state で管理、URL sync は P1。useState のみで scope 内最小実装
- **`/api/asset-thumb` 2-prefix 設計**: matchedPrefix を 1 リクエストに 1 個確定して以降の containment check に使う。OR 条件ではなく単一に絞ることで「visuals 経由 → inbox に到達」攻撃を構造的に不可能化
- **Phase 2B action buttons**: 既存 DeferredActionButton コンポーネントを reuse。Phase tag chip 付きで disabled、tooltip に Phase 2B での実装意図を記述
- **Visual Register が依然 primary CTA**: dashboard read-only 原則を維持、approve & register は Visual Register tool で実行
- **shadcn 全 NO 継続**: Phase UI-fidelity-1〜5 の方針と整合、native `<select>` / `<input>` / `<details>` / `<button>` で十分な fidelity を実現
- **VisualAssetHeader 残置**: 本 batch では削除せず、import 0 のまま残す。後の dead-code-cleanup batch で削除することで diff を読みやすく保つ

## 影響

- **dependencies 変更なし** (lucide-react は既存、shadcn 追加なし)
- **dashboard 23 routes** 動作維持、build green
- **Sanity Studio** 7.6s clean
- **`/api/asset-thumb`** が `assets/inbox/generated/` も streaming 可能 (security 既存ガード全部維持)
- **Sidebar nav label** 既に「図解レビュー」(rename 不要だった)
- **Sanity 書き込みなし / schema 変更なし / publish-package 不変 / assets/visuals 不変 / patches 不変 / auto-post なし / deploy なし**
- /, /campaigns/[slug], /configurator, /publish, /outputs, /publish-package/[slug] は touch なし、shared common components (PageHeader, KpiCard, PlatformBadge, StatusBadge, CopyButton) のみ reuse

## 次の一手

1. **boss が `cd dashboard && npm run dev` で 3 route 実機確認**:
   - `/visual-assets` — KpiCardsRow + FilterBar tab + AssetCardGrid + Empty state (dataset 投入後)
   - `/visual-assets/visualAssetPlan.building-hitori-media-os.x-hook-main-v1` — 2-col detail layout
   - `/visual-assets/visualAssetPlan.building-hitori-media-os.x-hook-main-v1/candidates` — CandidateFocusLayout focus 切替
2. 違和感あれば microbatch (layout / wording / tone)
3. なければ次の選択肢:
   - **Phase UI-fidelity-7: Visual Review P1** (RubricChecklistCard / RubricScoresCard / NotesCard / PromptSummaryCard / FilterBar URL sync / AssetCard 確実な fallback chain)
   - **Dead code cleanup batch** (旧 VisualAssetHeader / CandidateGrid / CandidateCard / SummaryCard / SectionHeader / EmptyState / FilePathBlock / AppNav 等)
   - **`/analytics`, `/knowledge`, `/settings` fidelity spec** (残り fidelity 系 3 route)
   - **promptTemplate dataset 投入** (/configurator RecommendedTemplatesCard が埋まる)

## 発信ネタ候補

- 「dashboard で書かない哲学」: Phase 2A は read-only、書き込みは Visual Register CLI に任せる責任分界の話
- 「Big preview + thumb strip という review console の型」: 横並び比較 vs 1 focus + strip のメリット / デメリット
- 「2-prefix safe streaming」: `/api/asset-thumb` が visuals/ と inbox/ の双方を 1 endpoint で扱う、matchedPrefix で cross-prefix containment を構造的に防ぐ実装
