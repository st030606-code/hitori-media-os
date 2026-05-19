---
campaignSlug: building-hitori-media-os
assetSlug: note-inline-human-judgment-v1
visualAssetPlanId: visualAssetPlan.building-hitori-media-os.note-inline-human-judgment-v1
assetPurpose: inline-diagram
platform: note
aspectRatio: 16:9
pixelSize: 1600x900
candidateStrategy:
  - id: v001
    variant: japanese-editorial-v1
styleAnchors:
  - assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png
  - assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png
  - assets/inbox/generated/building-hitori-media-os/note-inline-content-os-flow-v1/v004.png
layoutPatterns:
  - humanReviewJourney
  - beforeAfter
  - problemToSystem
requiredVisualModules:
  - headline
  - subhead
  - aiGenerationCluster
  - humanReviewGates
  - decisionBranches
  - principleBadge
  - readerOutcomeBox
forbiddenPatterns:
  - text-only-title-card
  - english-first-labels
  - robot-brain-cliche
  - neon-ai-glassmorphism
  - unreadable-small-text
  - recognizable-platform-logos
phase: phase-admin-2a-working-pipeline-step-b
---

# Prompt Log — note-inline-human-judgment-v1

- contentSlug: `building-hitori-media-os`
- visualAssetPlanId: `visualAssetPlan.building-hitori-media-os.note-inline-human-judgment-v1`
- targetPlatform: note (inline, Chapter 3〜4 付近)
- aspectRatio: 16:9
- pixelSize: 1600 x 900
- generator: Codex CLI 0.120.0 (`-m gpt-5.4 --enable image_generation`)
- batch: Working Pipeline Completion Plan Step B (docs/67 §5.1.B)
- date: 2026-05-18
- variant: japanese-editorial-v1 (Japanese Editorial Diagram Prompt Block v1 適用)

## Style Anchors

- `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` (adopted hero)
- `assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png` (X 版、トーン揃え)
- `assets/inbox/generated/building-hitori-media-os/note-inline-content-os-flow-v1/v004.png` (Japanese editorial v1 reference — 同 campaign の note inline 採用候補)

## 共通 Hard Rules

- 出力先は `assets/inbox/generated/building-hitori-media-os/note-inline-human-judgment-v1/v00N.png` のみ。
- final path（`assets/visuals/...`）には書き込まない。
- 既存ファイルを上書きしない。
- 図中に secret / token / 実 project ID / `private/` 配下のパス文字列を入れない。
- 顔写真・人物・AI generated avatar・ロボット・脳のシンボル禁止。
- 完全自動化 / 全自動化 / 稼げる / 誰でも / 保証 / 完成 を匂わせる語句禁止。
- 実在 platform ロゴ禁止（テキストラベルのみ）。
- 生成後に `git diff --stat` を取り、`assets/inbox/generated/building-hitori-media-os/note-inline-human-judgment-v1/` 以外が変わっていたら停止して報告。

## Japanese Editorial Diagram Prompt Block v1

参照: [docs/66 §7](../../../../../docs/66-japanese-visual-generation-quality-upgrade.md#7-japanese-editorial-diagram-prompt-block-v1)

このアセットは Japanese Editorial Diagram Prompt Block v1 + 本ファイルの asset-specific 詳細で生成する。

- Japanese 主、English 補助のみ（brand mark のみ許可）
- visual richness 7 必須（headline / subhead / ≥3 modules / ≥3 icons / connectors / principle badge / reader outcome box）
- forbidden 12 条件すべて守る
- layout は preferred 9 種から選択（本 asset では Human review journey が第一候補）
- self-rubric 7 axes × 1-5 = 35 点で採用判定（threshold 24）

## v001 — japanese-editorial-v1（Human review journey）

> Theme: 「AIで作る。でも最後は人間が選ぶ。」
> Core message: AIに任せきりにせず、AIが下書き・候補を作り、人間が整え、選び、最後に公開判断する。

### Visual Rough（docs/66 §5.1 format、7/7 self-check pass）

```yaml
visualRough:
  reader: note 記事 Chapter 3〜4 を読んでいる ひとり発信者 / engineer-creator
  readerProblem: AI に任せきりにすると "ねじれた" 発信物が出る、でも全部自分で書くと続かない
  visualThesis: AI が大量に下書きを作り、人間が整える / 選ぶ / 公開する。AI と人間の境界を明示する
  layoutPattern: Human review journey（左 → 中 → 右の 3 セクション + 最下部 reader outcome banner）
  mainVisualMetaphor: AI 大量生成（左）→ 人間レビュー関門（中央）→ 厳選 outputs（右）の "ふるい/フィルター" 比喩
  japaneseLabels:
    - AIで作る。でも最後は人間が選ぶ。
    - AIが大量に下書きを作り、人間が整え、選び、公開する。
    - AIが大量に作る
    - 人間レビュー
    - 採用 / 再生成 / 却下 / 公開
    - AI下書き
    - 人間が整える
    - 図解を選ぶ
    - 最後は手動公開
    - 人間が選ぶ
    - 採用
    - 再生成
    - 却下
    - 自動化は最後
    - AIに任せきりにせず、人間判断を残す。
  englishLabels:
    - Hitori Media OS
  readerOutcomeBox: 「AIに任せきりにせず、人間判断を残す。」
```

### v001 Generation Prompt (paste-ready, applies Block v1 + asset-specific section)

```text
1600x900 で生成してください（16:9 横長）。

note 記事 Chapter 3〜4 付近に埋め込む inline 構造図。テーマは「AIで作る。でも最後は人間が選ぶ。」。

Layout: Human review journey（横長 3 セクション + 下部 reader outcome banner）

== TOP BAND (~22%) — HEADLINE ==
- 大ヘッドライン 1 行（semibold 深ネイビー）:
  「AIで作る。でも最後は人間が選ぶ。」
- subhead 1 行（小さめ regular charcoal）:
  「AIが大量に下書きを作り、人間が整え、選び、公開する。」
- 右上 corner: 「自動化は最後」principle badge chip（warm tint 背景、amber underline）

== MAIN BAND (~58%) — Human review journey 3 セクション (左→中→右) ==

LEFT (~28% 幅) — AIが大量に作る:
- 小さな section header（薄灰）: 「AIが大量に作る」
- AI下書き card: 紙 / document icon × 3-4 stacked、若干乱雑に積み重なる、薄ネイビー輪郭
- card 下に小ラベル: 「AI下書き」
- "AIで量を出す" を視覚的に量感で示す

CENTER (~32% 幅) — 人間レビュー関門:
- 小さな section header（薄灰）: 「人間レビュー」
- 縦に積んだ 3 chip / pill（amber 左端アクセント付き）:
  1. chip 1: 鉛筆 icon + 「人間が整える」
  2. chip 2: 画像 thumbnail icon + 「図解を選ぶ」
  3. chip 3: 手 icon + 「最後は手動公開」
- chip の上下に「人間が選ぶ」と書かれた小ラベルを overlay or 直近に置く
- 左 (AI 下書き) から center へは細い navy 矢印群が漏斗状に集まる

RIGHT (~28% 幅) — 採用 / 再生成 / 却下 / 公開:
- 小さな section header（薄灰）: 「採用 / 再生成 / 却下 / 公開」
- 中央 chip の右側から 4 つの分岐線で fan out:
  1. ✓ check icon + 「採用」
  2. ⟳ refresh icon + 「再生成」
  3. ✕ cross icon + 「却下」
  4. 手 icon + 「公開」(または「最後は手動公開」の延長)

== BOTTOM BAND (~12%) — Reader outcome banner ==
- 横長 banner（warm tint）:
  「AIに任せきりにせず、人間判断を残す。」
- 「人間判断」に amber 細 underline

== CORNER ==
- 右下に小さく `Hitori Media OS` brand mark（薄灰、極小）

Style:
- 背景 白〜薄ウォームグレー
- 文字色 深ネイビー / チャコール
- ONE 暖色 accent: muted amber (#D08A3C-like)、使用箇所は chip 左端 / chevron / underline のみ
- sans-serif（Noto Sans JP / Inter / IBM Plex）、Japanese 主、semibold weight
- 線は細い 1px navy / charcoal
- 影なし、グラデなし、glow なし、ネオンなし、glassmorphism なし
- editorial infographic 感（presentation slide ではなく）
- 余白多め、4-level 階層

避けるもの:
- title-card 化（diagram 50%+ 必須）
- 英語主要ラベル（platform name + brand mark のみ英語）
- 顔写真、人物、ロボット、脳、AI chip icon、circuit
- 実在ロゴ
- 完全自動化 / 稼げる / 誰でも / 保証 / 完成 系の煽り

優先順位:
- AI と人間の境界が一目で読める > 装飾の表現力
- 中央 3 chip の人間レビュー gate が hero
- reader outcome banner で「読者にとって何が変わるか」を明示
```

## Reminder

- candidate は **inbox にのみ保存**。final path（`assets/visuals/...`）には書き込まない。
- 既存 v00X を **上書きしない**（次番号で出す）。
- final 採用は Visual Register Inbox Review の `approve & register` 経由のみ。
- Sanity Studio への反映は **手動**。`localAssetPath` / `status` / `reviewNotes` を Studio で手動更新。
- paid API / direct Sanity write / auto-post 禁止。
