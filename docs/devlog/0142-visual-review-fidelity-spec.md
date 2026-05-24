# Devlog 0142 — Visual Review fidelity spec

日付: 2026-05-19

## 背景

Phase UI-fidelity-1〜5 で `/`, `/campaigns/[slug]`, `/outputs`, `/publish-package/[slug]`, `/publish`, `/configurator` の 6 page を design tone 揃えで再構築済。残るは Visual Review 系 3 route (`/visual-assets` / `/visual-assets/[assetId]` / `/visual-assets/[assetId]/candidates`) と、まだ未着手の `/analytics`, `/knowledge`, `/settings`。

boss から ideal screenshot (`docs/ui-design/ChatGPT Image 2026年5月19日 13_02_43 (6).png`) が確定しており、それに合わせた **audit + spec docs only** batch として本ファイルを作成。

## 決定・変更

`docs/77-visual-review-fidelity-spec.md` を新規作成 (本 spec):

- **対象**: 3 route (`/visual-assets` list / `/visual-assets/[assetId]` detail / `/visual-assets/[assetId]/candidates` candidate focus)
- **page structure diff**: 3 route 全てで現状 vs ideal を ASCII 描画で比較
- **component diff table**: ~30 component の reuse / replace / add / update を判定
- **visual fidelity checklist**: 共通 + 3 route 別、合計 ~36 measurable item
- **P0 / P1 / P2 / P3 ordering**:
  - P0: Sidebar nav rename + PageHeader / Breadcrumb 導入 + 3 route 構造書き換え + AssetCard grid + CandidateFocusLayout (focus + thumb strip)
  - P1: Rubric / Notes / Actions / FilePaths / PromptSummary card + FilterBar URL sync
  - P2: Phase 2B 実 write (Approve & register / Regenerate / Sanity write)
  - P3: Visual diff / Auto-recommendation 等
- **files likely affected**: ~9 new P0 component + ~8 new P1 + 3 route 更新 + Sidebar nav label rename
- **data sources** を 9 種列挙: visualAssetPlan / requiredVisualAssets / inbox prompt.md / inbox review.md / review-manifest.json / inbox candidate filesystem / final asset filesystem / localAssetPath / tasks brief + patches
- **boss decision points** を 7 個列挙 (route 構成 / nav label / thumbnail endpoint / rubric P0 vs P1 / placeholder 戦略 / empty state copy / shadcn 採否)
- **Phase UI-fidelity-6 用 exact Codex prompt** を §11 に hard rules + tasks 入りで完成

## 理由

- **rename「画像・図解素材」→「図解レビュー」**: ideal screenshot の page title が「図解レビュー」、active surface としての性格が rename によって明確化する
- **3 route 維持判断**: detail と candidates の URL 分離は (1) Visual Register external link との互換性、(2) URL share 性、(3) bundle size 観点で有利。merge 案 (§8 Option B) は撥ねる
- **PageHeader / Breadcrumb 全 route 導入**: UI-fidelity-1〜5 と整合、ReadOnlyBanner / VisualAssetHeader の縦積み redundancy を解消
- **AssetCard grid 採用**: 既存 bucket table は (1) 横長で密度高い、(2) status を section header に分散して全体把握が遅い、(3) thumbnail 領域が狭い、の 3 点で ideal と乖離。card grid 化で 1 視野で 9-12 件、thumb で素材性を伝える
- **CandidateFocusLayout 採用**: 既存 CandidateGrid は v00N を side-by-side で並べる横長 layout。ideal screenshot は 1 候補 focus + thumb strip (1 + 3 構成) で、評価対象 1 件を細部まで見られる review console。後者を採用
- **rubric P1 配置**: review.md.rubricAxes は片方で boss が手動 review、もう片方は Codex 自己 review。UI に出さなくても作業は回るため layout を P0、rubric chip 化を P1 とした
- **shadcn 全 NO 継続**: UI-fidelity-1〜5 で確立した「dependency 増やさず hand-roll」方針を維持
- **`/api/asset-thumb` prefix 拡張案**: 1 endpoint で final + inbox 両方賄うのが運用負荷低い (新 endpoint を別途作るより安価)。boss 承認 §8-3

## 影響

- **コード変更 0**: docs 4 ファイル (本 devlog + 0142 / 0153 / latest + 77) のみ
- 23 routes 動作維持 (build 不変)
- Sanity 書き込みなし / schema 変更なし / 依存追加なし / publish-package 不変 / assets-visuals 不変 / patches 不変 / deploy なし
- Phase UI-fidelity-6 着手の前提が確定: §8 boss decision points 7 件を判断後、§11 の Codex prompt をそのまま起動

## 次の一手

1. **boss が docs/77 を読む**:
   - §3 visual fidelity checklist で違和感ないか
   - §8 boss decision points 7 件を回答
   - §11 exact Codex prompt を起動するか
2. boss が「OK」なら Phase UI-fidelity-6 (Visual Review implementation) を実行
3. boss が「rubric を P0 にしたい」「nav rename を別 batch にしたい」等の調整があれば microbatch
4. 並行候補:
   - **Output Configurator dataset 整備**: promptTemplate を Sanity に 1-2 件投入し、RecommendedTemplatesCard を埋める
   - **dead code cleanup**: PublishReadinessBoard / NextActionSummary / AppNav / SummaryCard / SectionHeader 等を別 batch で削除
   - **dashboard `ContentOutputConfiguratorCard` cleanup** (Phase UI-fidelity-7)

## 発信ネタ候補

- 「Visual Review の rename：『素材一覧』から『図解レビュー』へ」: ページ名と active surface の性格を一致させる UX 設計の話
- 「Big preview + thumb strip という review console の型」: 横並び比較 vs 1 focus + strip のメリット/デメリットを Hitori Media OS の選択で説明
- 「dashboard で書かない哲学」: Phase 2A はあくまで read-only、書き込みは Visual Register CLI に任せる責任分界
