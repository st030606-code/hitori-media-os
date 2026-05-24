# Handoff: Phase UI-fidelity-6 Visual Review implementation

Date: 2026-05-19

## 1. Task Goal

docs/77 で確定した Visual Review P0 を実装する batch。`/visual-assets` (list) / `/visual-assets/[assetId]` (detail) / `/visual-assets/[assetId]/candidates` (candidate focus) の 3 route を理想 screenshot (`docs/ui-design/ChatGPT Image 2026年5月19日 13_02_43 (6).png`) に揃え、Phase UI-fidelity-1〜5 と同じ design tone に整合させる。実 write actions は scope 外 (Phase 2B)。

## 2. Constraints Followed

- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ publish-package files 不変
- ✅ assets/visuals 不変
- ✅ patches 不変
- ✅ deploy なし
- ✅ auto-post なし
- ✅ package 追加なし (shadcn 追加なし)
- ✅ 23 routes 動作維持 (dashboard build green)
- ✅ `/publish-package/[slug]` v0.2 unchanged
- ✅ /, /configurator, /publish, /outputs, /campaigns/[slug] unchanged (shared common components のみ reuse)

## 3. Changed Files

### 更新 (4)

- `dashboard/src/app/api/asset-thumb/route.ts` — `ALLOWED_PREFIX` 単数 → `ALLOWED_PREFIXES` 配列 (`assets/visuals/` + `assets/inbox/generated/`)、matchedPrefix で per-request containment 維持
- `dashboard/src/app/visual-assets/page.tsx` — PhasePlaceholder 風 bucket-table から PageHeader + 5 KpiCard + VisualAssetsListView に置換
- `dashboard/src/app/visual-assets/[assetId]/page.tsx` — VisualAssetHeader を PageHeader に置換、2-col grid + AssetPreview + PlanMetadata + Campaign / FilePaths / Actions cards
- `dashboard/src/app/visual-assets/[assetId]/candidates/page.tsx` — 旧 CandidateGrid から CandidateFocusLayout (focus + thumb strip + side meta + 承認アクション) に置換、empty state 4 ケース分岐

### 新規 (11)

- `dashboard/src/lib/visualAssets/buckets.ts` (helper)
- `dashboard/src/components/visual-review/VisualAssetsFilterBar.tsx`
- `dashboard/src/components/visual-review/VisualAssetsListView.tsx`
- `dashboard/src/components/visual-review/AssetCardGrid.tsx`
- `dashboard/src/components/visual-review/AssetCard.tsx`
- `dashboard/src/components/visual-review/AssetPreviewCard.tsx`
- `dashboard/src/components/visual-review/PlanMetadataCard.tsx`
- `dashboard/src/components/visual-review/CandidateFocusLayout.tsx`
- `dashboard/src/components/visual-review/BigPreviewCard.tsx`
- `dashboard/src/components/visual-review/CandidateThumbStrip.tsx`
- `dashboard/src/components/visual-review/SelectedCandidateMetaCard.tsx`

### 不変 (touch なし)

- `dashboard/src/lib/navigation.ts` — Sidebar nav label「図解レビュー」は既に reflected (Phase UI-1 着手時、本 batch で diff 0)
- 既存 visual-review components (VisualAssetHeader, CandidateGrid, CandidateCard, CandidatePreview, CandidateStatusBadge, DeferredActionButton, EmptyCandidateState, LocalModeBanner) — 一部は import 0 になるが本 batch では削除せず別 dead-code-cleanup batch で対応

### 新規 docs

- `docs/devlog/0143-ui-fidelity-6-visual-review.md`
- `docs/handoff/0154-ui-fidelity-6-visual-review.md` (本ファイル)
- `docs/handoff/latest.md` (mirror)

## 4. Summary of Changes

### 4-1. Dependencies changed

**なし**。lucide-react は既存、shadcn 追加なし、native HTML + Tailwind のみ。

### 4-2. Components created (11)

| File | 種別 | 用途 |
|---|---|---|
| `lib/visualAssets/buckets.ts` | helper | status enum → 5 bucket 正規化 + campaignSlugFromAssetId |
| `VisualAssetsFilterBar.tsx` | client | bucket tab + 4 native control (assetType / platform / sort / search) |
| `VisualAssetsListView.tsx` | client | filter state + sort + AssetCardGrid render |
| `AssetCard.tsx` | server | visualAssetPlan card with fallback chain |
| `AssetCardGrid.tsx` | server | 3-col grid wrapper |
| `AssetPreviewCard.tsx` | server | detail page hero preview (final or inbox v001) |
| `PlanMetadataCard.tsx` | server | plan 全 field + collapsible prompt body |
| `BigPreviewCard.tsx` | server | candidates page focused image |
| `CandidateThumbStrip.tsx` | server (rendered inside client) | clickable v00N thumbnails |
| `SelectedCandidateMetaCard.tsx` | server | id / dims / size / generatedAt / variant / score / notes |
| `CandidateFocusLayout.tsx` | client | focus state + 2-col layout + 承認アクション |

### 4-3. Route changes

| Route | 変更内容 |
|---|---|
| `/visual-assets` | PageHeader + Breadcrumb + LocalModeBanner + 5 KpiCard + VisualAssetsListView (FilterBar + AssetCardGrid) + Visual Register CTA card。bucket table / SummaryCard / VisualAssetTable / 旧 LocalFsRoutes section を削除 |
| `/visual-assets/[assetId]` | PageHeader + LocalModeBanner + 2-col grid (Left: AssetPreviewCard + PlanMetadataCard / Right: Campaign card + FilePaths card + Actions card)。VisualAssetHeader / Reference section を置換 |
| `/visual-assets/[assetId]/candidates` | PageHeader + LocalModeBanner + 4 ケース empty state + CandidateFocusLayout (Left: BigPreview + ThumbStrip + PromptContext / Right: SelectedCandidateMetaCard + 承認アクション + warnings) |

すべて Server Component で fetch、client wrapper は filter / focus state のみで管理 (URL sync は P1)。

### 4-4. asset-thumb security changes

- `ALLOWED_PREFIX = 'assets/visuals/'` → `ALLOWED_PREFIXES = ['assets/visuals/', 'assets/inbox/generated/']`
- 各リクエストで `matchedPrefix` を 1 つに確定:
  ```ts
  const matchedPrefix = ALLOWED_PREFIXES.find((p) => decoded.startsWith(p))
  if (!matchedPrefix) return reject(403, 'forbidden prefix')
  ```
- 以降の prefix check (normalize 後) は **その単一 prefix** に対して実行
- 5 段階 containment check (`allowedRoot = path.resolve(repoRoot(), matchedPrefix)`) も単一 prefix に絞られるため、`assets/visuals/` で入った request が `assets/inbox/...` に resolve する可能性は構造上 0
- 維持: `enableLocalFsRoutes` ガード / 絶対パス拒否 / `..` traversal 拒否 / 二重 encode 検知 / extension whitelist / 8MB cap / not-a-file 拒否
- production build では従来通り 404 を返す

### 4-5. Visual Register CTA behavior

- list page: PageHeader 右上に primary blue `Visual Register を開く` 外部リンク (`http://localhost:3334`)
- list page bottom: 「承認作業は Visual Register で行います」card に `npm run visual:register` の手順を 3 step で
- detail page: PageHeader 右上に primary blue + Actions card 内に外部リンク
- candidates page: PageHeader 右上 + CandidateFocusLayout 内「承認アクション」card に primary blue `Visual Register で承認`
- Phase 2B placeholders (`採用する` / `再生成する` / `保留する` / `再生成プロンプトを編集` / `今回は保留`) は既存 `DeferredActionButton` で disabled + tooltip

### 4-6. Empty state behavior

candidates page で 4 ケースを区別:

| 条件 | コピー (タイトル) | tone |
|---|---|---|
| `!enableLocalFsRoutes` | ローカル候補プレビューは開発環境でのみ利用できます | slate |
| `!slugs` (assetId 不正) | assetId からスラッグを導出できませんでした | slate |
| `bundleError` (inbox 読み込み失敗) | inbox の読み込みに失敗しました | rose |
| `!hasCandidates` | 候補画像はまだ生成されていません | slate |

list page で 1 ケース:

- `plans.length === 0`: 「Sanityに図解計画がまだ登録されていません」+ `npx sanity documents create` の案内

filter で結果 0 件の場合は別 inline message:「条件に一致する素材がありません。フィルタを調整してください。」

### 4-7. Build validation

```
cd dashboard && npm run build  → ✓ 23 routes (unchanged)
                                ✓ TypeScript clean
npm run build (sanity)         → ✓ Build Sanity Studio (7584ms) clean
```

## 5. Key Decisions

- **5 bucket は schema enum 直接 mapping**: candidates = prompt-ready + generated-needs-save / approved = reviewed + approved + packaged + published / needs-regen = archived / saved = saved / all = total。planned / brief-ready は disjoint 5 bucket 外 (`all` のみカウント、StatusBadge で表示)
- **`/api/asset-thumb` 1 endpoint 維持**: matchedPrefix 設計で 2 prefix を安全に。新 endpoint 増設より運用負荷低い
- **VisualAssetsListView 1 個の client wrapper**: 旧 page にあった SectionHeader / SummaryCard / VisualAssetTable は使わず、全部新規 component に集約。filter / sort / search を 1 か所で管理 (P1 で URL sync の入口)
- **AssetCard fallback chain**: final (assets/visuals/) 優先 → inbox v001 (assets/inbox/generated/.../v001.png) 派生 → ImageIcon placeholder。production では enableLocalFsRoutes=false で全部 placeholder
- **CandidateFocusLayout は client、useState のみ**: focus 候補の切替を最小実装。URL `?candidate=v002` 同期は P1
- **PlanMetadataCard の `<details>` 採用**: imagePrompt / visualDirection / reviewNotes は長文化しがちなので native collapsible に。ノー JS でも開ける
- **削除候補ファイルは本 batch では touch せず**: import 0 になった旧 component (VisualAssetHeader / CandidateGrid / CandidateCard / CandidatePreview / SummaryCard / SectionHeader / EmptyState / FilePathBlock) は別 dead-code-cleanup batch で削除予定。理由: 削除 diff を読みやすく保つ + 別 PR で意図を明確化
- **Visual Register CTA は依然 primary**: dashboard read-only を維持、書き込みは Visual Register tool に任せる責任分界

## 6. Human Review Questions

1. **bucket label / 内訳**: 「すべて / 候補あり / 承認済み / 要再生成 / 保存済み」で運用しっくりくるか?「要再生成 = archived」の意味解釈で違和感はないか?
2. **AssetCard thumbnail fallback chain**: production で全部 placeholder になることに違和感あれば、build-time snapshot 戦略 (Batch D2) との接続を再検討
3. **PageHeader actions の数**: detail page で「候補一覧へ / 公開パッケージで見る / Visual Register で承認」3 ボタンが詰まり気味。boss が「シンプル化したい」なら primary 1 + dropdown menu に再構成 (P1)
4. **CandidateFocusLayout の thumb strip**: 候補 1 件しかない asset では薄く感じるかも。boss が違和感感じれば 1 件時は ThumbStrip を hide
5. **PlanMetadataCard の `<details>` 初期 closed**: imagePrompt を最初から見たい場合は `open` 属性付与 (P1 microbatch)
6. **Empty state 4 ケース分岐**: コピーが冗長か? boss が「もっと簡潔に」なら 1-2 行に縮約
7. **削除候補 component の扱い**: 本 batch で touch せず別 batch で削除する判断で OK か?

## 7. Risks or Uncertainties

- **production build の preview**: `enableLocalFsRoutes=false` の本番では AssetCard / AssetPreview / BigPreview ともに画像が出ない。boss が production で確認したら「真っ白」と感じる可能性。Batch D2 (build-time snapshot) との接続が将来の解
- **candidate-image の inbox 経由表示**: `BigPreviewCard` と `CandidateThumbStrip` は依然 `/api/visual-review/candidate-image` を使う (asset-thumb prefix 拡張は AssetCard の thumbnail だけが利用)。両 endpoint が共存しているので、boss が後で「1 個に統一したい」と思ったら統合検討
- **dataset 偏り**: 現状 visualAssetPlan が 7 件、AssetCardGrid 3-col が 1-3 行で終わる → 「密度薄い」と感じる可能性。boss feedback 次第で 2-col 化検討
- **VisualAssetHeader 残置**: import 0 だが ファイル残置。build に影響なし、診断ツールが「dead code」警告を出す可能性
- **`/visual-assets/[assetId]` で `plan == null` 時の挙動**: 一部 card (PlanMetadataCard / Campaign card) は plan が必要なので render しない。 AssetPreviewCard / FilePaths / Actions は render される。boss が「もっとエラー表示を強くしたい」なら rose-200 banner を上に追加 (現状 plan==null の rose banner は実装済)
- **`useState` の filter 状態**: リロードで消える。boss が「フィルタ条件を URL に保持したい」なら P1 で `useSearchParams` 連携
- **mobile responsive**: ideal screenshot は desktop。`sm:grid-cols-2` / `lg:grid-cols-[3fr_2fr]` で対応するが、CandidateThumbStrip は overflow-x-auto で横スクロール → boss が mobile 確認時に違和感あれば改善

## 8. Remaining Gaps

- **P1 cards (本 batch 対象外)**:
  - RubricChecklistCard (review.md.rubricAxes chip 表示)
  - RubricScoresCard (axes × candidate grid)
  - NotesCard (review.md Notes section markdown 抜粋)
  - PromptSummaryCard (imagePrompt 200 字 + 全文 collapsible + Copy)
  - ActionsCard 統合版 (detail page side panel)
  - FilePathsCard 統合版 (現在は inline PathRow)
  - CampaignContextCard 独立化
- **FilterBar URL sync (P1)**: 現在 useState のみ
- **AssetCard fallback chain の完成 (P1)**: latest v00N / registered manifest hint 活用
- **dead code cleanup (P1 別 batch)**: VisualAssetHeader / CandidateGrid / CandidateCard / CandidatePreview / SummaryCard / SectionHeader / EmptyState / FilePathBlock / AppNav 等
- **Phase 2B 実 write (P2)**: Approve & register / Regenerate / Mark needs regeneration / Sanity controlled write

## 9. Next Recommended Step

**Option A — Visual Review P1 cards (推奨)**

docs/77 §4-1 の P1 を実装する batch。Rubric / Notes / PromptSummary / ActionsCard 統合 / FilePathsCard 統合。FilterBar の URL searchParams sync も同梱。1 batch で完了想定。

**Option B — Dead code cleanup batch**

import 0 になった旧 component (VisualAssetHeader / CandidateGrid / CandidateCard / CandidatePreview / CandidateStatusBadge / SummaryCard / SectionHeader / EmptyState / FilePathBlock / AppNav) を一括削除。1 batch で完了、回帰リスク極小 (import 0 を確認してから rm)。

**Option C — `/analytics`, `/knowledge`, `/settings` fidelity spec**

残り fidelity 系 3 route の audit + spec docs only batch。boss 判断点が増えるので、A or B を先に。

```text
[A の Codex prompt]
Implement Phase UI-fidelity-7: Visual Review P1 cards.

Use:
- docs/77-visual-review-fidelity-spec.md (§4-1 P1 list)
- docs/handoff/0154-ui-fidelity-6-visual-review.md (latest tone, gaps section)

Hard Rules:
- Same as Phase UI-fidelity-6 (no schema, no Sanity write, no packages, no shadcn, no deploy, no auto-post, no publish-package touch)

Tasks:
1. Create RubricChecklistCard / RubricScoresCard / NotesCard / PromptSummaryCard / CampaignContextCard / FilePathsCard / ActionsCard
2. Wire them into /visual-assets/[assetId] and /visual-assets/[assetId]/candidates
3. Add FilterBar URL searchParams sync (visual asset list)
4. Improve AssetCard fallback chain (latest v00N detection via inbox listing)
5. Run builds, write docs/devlog/0144 + docs/handoff/0155 + latest mirror
```
