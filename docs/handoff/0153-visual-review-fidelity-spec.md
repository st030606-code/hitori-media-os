# Handoff: Visual Review Fidelity Spec (docs only)

Date: 2026-05-19

## 1. Task Goal

Visual Review 系 3 route (`/visual-assets` list / `/visual-assets/[assetId]` detail / `/visual-assets/[assetId]/candidates` candidate focus) の理想 UI (`docs/ui-design/ChatGPT Image 2026年5月19日 13_02_43 (6).png`) と現在実装の差分を analyse、Phase UI-fidelity-6 (実装 batch) の P0/P1/P2 を確定する **audit + spec docs only** batch。コード変更ゼロ。

## 2. Constraints Followed

- ✅ Docs only、runtime code 変更なし
- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ publish-package files 不変
- ✅ assets/visuals / patches 不変
- ✅ deploy なし
- ✅ package 追加なし
- ✅ `/publish-package/[slug]` v0.2 unchanged
- ✅ 23 routes 動作維持 (build 不変)

## 3. Changed Files

### 新規 docs (4)

- `docs/77-visual-review-fidelity-spec.md` — 本 spec (≈11 sections、~36 fidelity checklist item、Phase UI-fidelity-6 用 Codex prompt 同梱)
- `docs/devlog/0142-visual-review-fidelity-spec.md`
- `docs/handoff/0153-visual-review-fidelity-spec.md` (本ファイル)
- `docs/handoff/latest.md` (mirror)

### コード変更 (なし)

dashboard / Sanity Studio / tools / schemas のいずれも変更なし。

## 4. Summary of Changes

### Target route structure

| route | 現状 | 目標 |
|---|---|---|
| `/visual-assets` | ReadOnlyBanner + 6 SummaryCard + 6 bucket-grouped table + Visual Register CTA | Breadcrumb + PageHeader + FilterBar (assetType / platform / status / sort / search) + 5 KpiCard + AssetCardGrid (3-col) + Empty state + Visual Register CTA card |
| `/visual-assets/[assetId]` | VisualAssetHeader + 2 deferred button + Reference dl | Breadcrumb + PageHeader + 2-col grid (Left: AssetPreviewCard + PlanMetadataCard + LifecyclePreviewCard / Right: CampaignContextCard + PromptSummaryCard + RubricChecklistCard + ActionsCard + FilePathsCard) |
| `/visual-assets/[assetId]/candidates` | breadcrumb 簡素 + VisualAssetHeader + CandidateGrid (v00N 横並び) + 2 dl | Breadcrumb + PageHeader + CandidateFocusLayout (2-col、Left: BigPreviewCard + CandidateThumbStrip + PromptContext / Right: SelectedCandidateMetaCard + RubricScoresCard + ReviewActionsCard + NotesCard) |

### Component diff (要約、詳細は docs/77 §2)

- **新規 P0 (9)**: VisualAssetsFilterBar / AssetCardGrid / AssetCard / AssetPreviewCard / PlanMetadataCard / CandidateFocusLayout / BigPreviewCard / CandidateThumbStrip / SelectedCandidateMetaCard
- **新規 P1 (8)**: CampaignContextCard / PromptSummaryCard / RubricChecklistCard / ActionsCard / FilePathsCard / RubricScoresCard / ReviewActionsCard / NotesCard
- **reuse**: PageHeader / Breadcrumb / KpiCard / KpiCardsRow / LifecyclePipeline / PlatformBadge / StatusBadge / CopyButton / DeferredActionButton / EmptyCandidateState / LocalModeBanner
- **replace**: VisualAssetHeader → PageHeader / SummaryCard → KpiCard / VisualAssetTable → AssetCardGrid / CandidateGrid → CandidateFocusLayout
- **update**: Sidebar nav label rename「画像・図解素材」→「図解レビュー」(`dashboard/src/lib/navigation.ts`)
- **削除候補** (land 後の dead-code-cleanup batch): SummaryCard / SectionHeader / EmptyState / FilePathBlock / VisualAssetHeader

### P0 / P1 / P2 / P3 scope

| Phase | 内容 | Visual Review に対する位置づけ |
|---|---|---|
| **P0** | Sidebar nav rename / PageHeader + Breadcrumb / 3 route 構造書き換え / AssetCardGrid / CandidateFocusLayout / asset-thumb prefix 拡張 | fidelity の "見た目" を ideal screenshot に揃える |
| **P1** | Rubric chip / Notes / Actions / FilePaths / PromptSummary card / FilterBar URL sync / thumbnail fallback chain | "意味のある情報" を card 化、Phase 2A 完成 |
| **P2** | Phase 2B 実 write: Approve & register / Regenerate / Mark needs regeneration / Sanity controlled write | dashboard 内で承認 flow 完結 |
| **P3** | Visual diff / Auto-recommendation / Brand consistency score / Activity log integration | 拡張機能、将来 |

詳細は docs/77 §4。

### Data sources (9 種)

1. **`visualAssetPlan` (Sanity)** — `visualAssetPlanListQuery` / `visualAssetPlanByIdQuery` (既存)
2. **`requiredVisualAssets` (campaignPlan inline 配列)** — `dashboardHomeQuery` / `campaignDetailBySlugQuery` (既存)
3. **inbox `prompt.md` frontmatter** — `lib/inboxReader.ts.readAssetCandidates()` → `PromptMeta` (既存)
4. **inbox `review.md` frontmatter** — 同上 → `ReviewMeta` (既存)
5. **`review-manifest.json` (campaign root)** — `readReviewManifest()` (既存、AssetCard 「登録済」chip で P1 利用候補)
6. **`assets/inbox/generated/<campaign>/<asset>/v00N.png`** — `/api/visual-review/candidate-image` (既存、stream)
7. **`assets/visuals/<campaign>/...`** — `/api/asset-thumb` (既存、prefix 拡張は boss 決定点 §8-3)
8. **`localAssetPath` (visualAssetPlan field)** — saved → ... → published lifecycle で値が定まる
9. **`tasks/visuals/<campaign>/<asset>.md` (brief)** + **`patches/visual-assets/<campaign>/<asset>.json`** — path 表示のみ、dashboard は読まない

詳細は docs/77 §6。

### Build validation

```
cd dashboard && npm run build  → ✓ 23 routes (unchanged、コード差分なし)
npm run build (sanity)         → ✓ Sanity Studio clean (unchanged)
```

両 build とも前 batch (handoff/0152) 完了時から不変。

## 5. Key Decisions

- **rename「画像・図解素材」→「図解レビュー」**: ideal screenshot の page title と一致、active surface の性格を明確化
- **route 分離維持** (`/[assetId]` と `/candidates`): URL share / Visual Register external link 互換 / bundle size の 3 点で merge 案より優位
- **AssetCardGrid 採用**: bucket-grouped table から 3-col card grid に置換、密度と素材性のバランスを取る
- **CandidateFocusLayout 採用**: v00N 横並び比較から 1 focus + thumb strip に変更。ideal screenshot の review console 構成と整合、評価 1 件を細部まで見られる
- **rubric P1 配置**: 機能上は P0 でなくても review 作業は回る。まず layout を P0、rubric chip 化を P1 で
- **shadcn 全 NO 継続**: Phase UI-fidelity-1〜5 の方針を維持
- **`/api/asset-thumb` prefix 拡張案**: 1 endpoint で final + inbox 両方を賄う、運用負荷最小

## 6. Human Review Questions

1. **route 構成**: detail と candidates を分離維持 (Option A) で良いか?
2. **Sidebar nav label**: 「画像・図解素材」→「図解レビュー」で良いか? 別案 (「ビジュアル」/ 維持) は?
3. **AssetCard thumbnail の inbox 表示**: `/api/asset-thumb` の prefix 拡張で 1 endpoint 化、それとも別 endpoint 新設?
4. **Rubric の優先度**: P0 に格上げ (rubric が Visual Review の核心) するか、layout を先に揃える P1 で OK か?
5. **Phase 2B placeholders の表示**: 全 disabled + tooltip / Visual Register のみ active で他は hidden、どちらが boss 好み?
6. **Empty state**: dataset 未投入 + inbox 未生成の双方ケースで copy を何にするか?
7. **shadcn 採否**: 全 NO 継続でよいか、Select / Checkbox のみ許可するか?

## 7. Risks or Uncertainties

- **dataset 偏り**: visualAssetPlan が現状 7 件、card grid 1-2 行で終わり「密度が薄い」と感じる可能性。empty state + placeholder card か、2-col 化で再考
- **inbox 候補が 1 件しかない asset**: CandidateFocusLayout の thumb strip が thin になる、focus = v001 で start
- **mobile responsive**: ideal は desktop layout。`sm:grid-cols-2` 維持で対応するが、big preview / thumb strip の mobile UX は P1 で再確認
- **VisualAssetHeader 廃止**: 既存 component を全廃止すると diff が大きい。段階的に PageHeader に移行 + 残骸を deprecated comment 化 → 後の dead-code-cleanup batch で削除
- **`enableLocalFsRoutes` 依存**: 本番 build で inbox が読めないので、List page の AssetCard は final 優先、inbox 表示は local モード時のみ
- **review-manifest.json 集約**: AssetCard「登録済」chip を出すなら全 campaign の manifest を集約必要。集約コスト許容するか P1 で再判断
- **`/api/asset-thumb` prefix 拡張のリスク**: inbox 候補は file size が大きい (PNG 600KB-1.5MB)。8MB cap は維持、ただし thumbnail でない原寸 streaming は cache hit 率次第で重い

## 8. Recommended Next Step

1. **boss が docs/77 を読む**:
   - §3 visual fidelity checklist (~36 item) で違和感ないか
   - §8 boss decision points 7 件を確定
2. boss が OK → **Phase UI-fidelity-6 (Visual Review implementation)** 着手 (§11 exact prompt 同梱)
3. 違和感あれば docs/77 microbatch (rubric P0 移動 / nav 別 label 検討 等)
4. 並行候補:
   - promptTemplate dataset 投入 (boss 担当 1 件で /configurator RecommendedTemplatesCard が埋まる)
   - dead code cleanup (PublishReadinessBoard / NextActionSummary / AppNav / SummaryCard / SectionHeader 等)
   - `/analytics`, `/knowledge`, `/settings` のいずれかの fidelity spec (残り fidelity 系)

## 9. Exact Codex Prompt for Phase UI-fidelity-6 (Visual Review implementation)

```text
Implement Phase UI-fidelity-6: Visual Review implementation.

Boss-confirmed scope (前提、必要なら handoff で boss に再確認):
- shadcn primitives: Select / Checkbox / Button: 全て NO (native HTML + Tailwind)
- Action buttons (採用 / 再生成 / 保留): Phase 2B placeholder (disabled + tooltip)
- 「Visual Register で承認」: external link to http://localhost:3334 (primary CTA)
- AssetCard inbox thumbnail: 既存 /api/asset-thumb の prefix 拡張 で OK (1 endpoint 維持)
- Sidebar nav label rename: 「画像・図解素材」 → 「図解レビュー」
- Route 構成: /visual-assets/[assetId] と /candidates は分離維持 (Option A)
- RubricChecklistCard / RubricScoresCard: P1 (まず layout を揃える)
- Empty state: dataset 未投入 + inbox 未生成 を区別したコピー

Inputs:
- Ideal screenshot: docs/ui-design/ChatGPT Image 2026年5月19日 13_02_43 (6).png
- Spec: docs/77-visual-review-fidelity-spec.md
- Reference: docs/68 / docs/69 / docs/handoff/0152 (latest tone)
- Reference: docs/handoff/0153 (本 spec の handoff、boss 判断記録)

Hard Rules:
- Do NOT modify Sanity schema
- Do NOT write to Sanity
- Do NOT modify publish-package files
- Do NOT modify assets/visuals/ or patches/
- Do NOT add packages (lucide-react は既存、shadcn は NO)
- Do NOT deploy
- Keep all 23 routes working
- Keep /publish-package/[slug] unchanged
- Keep /configurator, /publish, /outputs, /campaigns/[slug] unchanged

Tasks (P0 のみ、P1 は次 batch):

1. **Sidebar nav rename** in `dashboard/src/lib/navigation.ts`

2. **新規 component (P0)**:
   - `dashboard/src/components/visual-review/VisualAssetsFilterBar.tsx` (P0 はクライアント state、URL sync は P1)
   - `dashboard/src/components/visual-review/AssetCardGrid.tsx`
   - `dashboard/src/components/visual-review/AssetCard.tsx`
   - `dashboard/src/components/visual-review/AssetPreviewCard.tsx`
   - `dashboard/src/components/visual-review/PlanMetadataCard.tsx`
   - `dashboard/src/components/visual-review/CandidateFocusLayout.tsx` (client、selected candidate state)
   - `dashboard/src/components/visual-review/BigPreviewCard.tsx`
   - `dashboard/src/components/visual-review/CandidateThumbStrip.tsx`
   - `dashboard/src/components/visual-review/SelectedCandidateMetaCard.tsx`

3. **3 route 書き換え**:
   - `dashboard/src/app/visual-assets/page.tsx` (PageHeader + FilterBar + KpiCardsRow + AssetCardGrid に置換、bucket table / SummaryCard 削除)
   - `dashboard/src/app/visual-assets/[assetId]/page.tsx` (PageHeader + 2-col grid + AssetPreview + PlanMetadata + LifecyclePreview + FilePaths)
   - `dashboard/src/app/visual-assets/[assetId]/candidates/page.tsx` (CandidateFocusLayout に置換)

4. **`/api/asset-thumb` の prefix 拡張** (P0 で許可、`assets/inbox/generated/` を加える):
   - 既存 prefix lock + 8MB cap は維持
   - 1 行 prefix チェックを `assets/visuals/` || `assets/inbox/generated/` に拡張
   - 既存 endpoint 単体で final + inbox 両方賄える

5. **Builds**:
   - `cd dashboard && npm run build` (23 routes 維持)
   - `npm run build` (Sanity Studio clean)

6. **Docs**:
   - `docs/devlog/<番号>-ui-fidelity-6-visual-review.md`
   - `docs/handoff/<番号>-ui-fidelity-6-visual-review.md`
   - `docs/handoff/latest.md` (mirror)

Validation:
- 全 23 routes が build green
- `/visual-assets` で AssetCardGrid が render
- `/visual-assets/visualAssetPlan.building-hitori-media-os.x-hook-main-v1` で detail layout
- `/visual-assets/visualAssetPlan.building-hitori-media-os.x-hook-main-v1/candidates` で focus layout + thumb strip clickable
- Sidebar nav label が「図解レビュー」
- 既存の Visual Register external link が primary 行動として配置
- 既存の DeferredActionButton は ActionsCard / ReviewActionsCard 内で reuse

P1 は次 batch で:
- CampaignContextCard / PromptSummaryCard / RubricChecklistCard / ActionsCard / FilePathsCard
- RubricScoresCard / ReviewActionsCard / NotesCard
- FilterBar URL searchParams sync
- AssetCard thumbnail fallback chain (final → inbox → placeholder)
```
