---
campaignSlug: building-hitori-media-os
assetSlug: substack-inline-reader-system-v1
visualAssetPlanId: visualAssetPlan.building-hitori-media-os.substack-inline-reader-system-v1
assetPurpose: inline-diagram
platform: substack
aspectRatio: 16:9
pixelSize: 1600x900
candidateStrategy:
  - id: v001
    variant: japanese-editorial-v1
styleAnchors:
  - assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png
  - assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png
  - assets/inbox/generated/building-hitori-media-os/note-inline-content-os-flow-v1/v004.png
  - assets/inbox/generated/building-hitori-media-os/note-inline-human-judgment-v1/v001.png
layoutPatterns:
  - readerListFunnel
  - mediaDistributionMap
  - problemToSystem
requiredVisualModules:
  - headline
  - subhead
  - discoveryCluster
  - subscriberListHero
  - archiveCluster
  - keyMessageBadge
  - readerOutcomeBox
forbiddenPatterns:
  - text-only-title-card
  - english-first-labels
  - generic-newsletter-marketing-diagram
  - robot-brain-cliche
  - neon-ai-glassmorphism
  - unreadable-small-text
  - recognizable-platform-logos
phase: phase-admin-2a-working-pipeline-step-c
---

# Prompt Log — substack-inline-reader-system-v1

- contentSlug: `building-hitori-media-os`
- visualAssetPlanId: `visualAssetPlan.building-hitori-media-os.substack-inline-reader-system-v1`
- targetPlatform: substack (inline、"Reader-List Connection" section)
- aspectRatio: 16:9
- pixelSize: 1600 x 900
- generator: Codex CLI 0.120.0 (`-m gpt-5.4 --enable image_generation`)
- batch: Working Pipeline Completion Plan Step C (docs/67 §5.1.C)
- date: 2026-05-18
- variant: japanese-editorial-v1 (Japanese Editorial Diagram Prompt Block v1 適用)

## Style Anchors

- `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` (adopted hero)
- `assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png` (X 版、トーン揃え)
- `assets/inbox/generated/building-hitori-media-os/note-inline-content-os-flow-v1/v004.png` (note inline v004 japanese-editorial-v1)
- `assets/inbox/generated/building-hitori-media-os/note-inline-human-judgment-v1/v001.png` (note inline human-judgment v001 japanese-editorial-v1)

## 共通 Hard Rules

- 出力先は `assets/inbox/generated/building-hitori-media-os/substack-inline-reader-system-v1/v00N.png` のみ。
- final path（`assets/visuals/...`）には書き込まない。
- 既存ファイルを上書きしない。
- 図中に secret / token / 実 project ID / `private/` 配下のパス文字列を入れない。
- 顔写真・人物・AI generated avatar・ロボット・脳のシンボル禁止。
- 完全自動化 / 全自動化 / 稼げる / 誰でも / 保証 / 完成 を匂わせる語句禁止。
- 実在 platform ロゴ禁止（テキストラベルのみ）。
- 生成後に `git diff --stat` を取り、本 inbox folder 以外が変わっていたら停止して報告。

## Japanese Editorial Diagram Prompt Block v1

参照: [docs/66 §7](../../../../../docs/66-japanese-visual-generation-quality-upgrade.md#7-japanese-editorial-diagram-prompt-block-v1)

このアセットは Japanese Editorial Diagram Prompt Block v1 + 本ファイルの asset-specific 詳細で生成する。

- Japanese 主、English 補助のみ（brand mark のみ許可）
- visual richness 7 必須（headline / subhead / ≥3 modules / ≥3 icons / connectors / key message badge / reader outcome box）
- forbidden 12 条件すべて守る
- layout は preferred 9 種から（本 asset では Reader-list funnel が第一候補）
- self-rubric 7 axes × 1-5 = 35 点で採用判定（threshold 24）

## v001 — japanese-editorial-v1（Reader-list funnel）

> Theme: 「Substackは、記事を置く場所ではなく、読者リストを育てる場所。」
> Core message: 発信先を役割で分ける。X・Threads は発見の場、Substack は購読のリスト、note は蓄積のアーカイブ。

### Visual Rough（docs/66 §5.1 format、7/7 self-check pass）

```yaml
visualRough:
  reader: Substack post を読む書き手 / engineer-creator
  readerProblem: X/Threads 発信が流れていく、note や Substack に何を置くべきか分からず購読リストが積み上がらない
  visualThesis: 発信先を「発見の場 / 購読のリスト / 蓄積のアーカイブ」の役割で分けると、購読と信頼が積み上がる
  layoutPattern: Reader-list funnel（左→中→右の漏斗 + 蓄積）
  mainVisualMetaphor: 流れる読者 → 漏斗で絞られる → 購読リストで固定 → 蓄積で信頼が積み上がる
  japaneseLabels:
    - Substackは、記事を置く場所ではなく、読者リストを育てる場所。
    - 発信先を役割で分けると、購読が積み上がる。
    - 発見の場
    - 購読のリスト
    - 蓄積のアーカイブ
    - 読者を捕まえる導線
    - 読者リスト
    - 信頼が積み上がる
    - X・Threads
    - Substack
    - note
    - 役割で分ける  # key message badge
  englishLabels:
    - Hitori Media OS
  readerOutcomeBox: 「発信先を役割で分けると、購読が積み上がる。」
```

### v001 Generation Prompt (paste-ready, applies Block v1 + asset-specific section)

```text
1600x900 で生成してください（16:9 横長）。

Substack post の "Reader-List Connection" section に埋め込む inline 構造図。
テーマは「Substackは、記事を置く場所ではなく、読者リストを育てる場所。」

Layout: Reader-list funnel（横長 3 セクション + 下部 reader outcome banner）

== TOP BAND (~22%) — HEADLINE ==
- 大ヘッドライン 1 行（semibold 深ネイビー、やや長め）:
  「Substackは、記事を置く場所ではなく、読者リストを育てる場所。」
- subhead 1 行（小さめ regular charcoal、headline の補足）:
  「X・Threads = 発見の場 / Substack = 購読のリスト / note = 蓄積のアーカイブ。」
- 右上 corner: 「役割で分ける」key message badge chip（warm tint 背景、amber underline、principle badge ポジション）

== MAIN BAND (~58%) — Reader-list funnel 3 セクション (左→中→右) ==

LEFT (~28% 幅) — 発見の場:
- 小さな section header（薄灰）: 「発見の場」
- 「X・Threads」platform pill（細枠 navy、テキストラベルのみ、ロゴなし）
- 平行に流れる小さな丸 icons × 5-7（読者が流れる感、発見の量感）。多数の人 / 読者 が流れていることを示唆。
- 下に小ラベル: 「読者を捕まえる導線」
- 全体トーン: 量感、薄ネイビー、流動的

CENTER (~32% 幅) — 購読のリスト (HERO):
- 小さな section header（薄灰）: 「購読のリスト」
- 「Substack」platform pill (HERO、amber outline、card-like、やや大きめ、Center 配置)
- card の下に 読者リスト stacked list icon: 行が並ぶ rectangles × 5-6、行末に小さな ✓ icon（購読された行）
- 下に小ラベル: 「読者リスト」
- 左から来る漏斗 / chevron で「絞られて来る」を視覚化（amber accent）
- このセクションが視覚的 hero。amber outline + 中央配置で視線がここに集まる

RIGHT (~28% 幅) — 蓄積のアーカイブ:
- 小さな section header（薄灰）: 「蓄積のアーカイブ」
- 「note」platform pill（細枠 navy）
- 記事 stacked icon: 紙 / document が下から上へ積み上がる（4-5 枚、整然と stacked）
- ↑ trending arrow（薄 amber or navy）が右上方向に伸び、「信頼が積み上がる」を示唆
- 下に小ラベル: 「信頼が積み上がる」
- 全体トーン: 整然、積み上げ感、安定

CONNECTORS:
- LEFT 発見の場 → CENTER 購読のリスト: 漏斗 / chevron 状の細い navy 矢印群が左から中央へ集まる（amber accent on chevron）
- CENTER 購読のリスト → RIGHT 蓄積のアーカイブ: 中央から右へ細い navy 矢印（trending up suggestion）
- 全 connectors は 1px navy/charcoal、矢じり控えめ

== BOTTOM BAND (~12%) — Reader outcome banner ==
- 横長 banner（warm tint）:
  「発信先を役割で分けると、購読が積み上がる。」
- 「積み上がる」に amber 細 underline

== BOTTOM CORNER ==
- 右下に小さく `Hitori Media OS` brand mark（薄灰、極小）

Style:
- 背景 白〜薄ウォームグレー
- 文字色 深ネイビー / チャコール
- ONE 暖色 accent: muted amber (#D08A3C-like)、使用箇所は Substack outline / 漏斗 chevron / underline 等 数箇所のみ
- sans-serif（Noto Sans JP / Inter / IBM Plex）、Japanese 主、semibold weight
- 線 1px navy / charcoal
- 影なし、グラデなし、glow なし、ネオンなし、glassmorphism なし
- editorial infographic 感（presentation slide ではなく、newsletter marketing graphics でもなく）
- 余白多め、4-level 階層

避けるもの:
- title-card 化（diagram 50%+ 必須）
- 英語主要ラベル（platform name + brand mark のみ英語）
- generic newsletter marketing diagram（"Build Your List!" 英語スローガン風、棒グラフ、%表示）
- 顔写真、人物、ロボット、脳、AI chip icon、circuit
- 実在 platform ロゴ（X / Substack / note ロゴ流用なし、テキストのみ）
- 完全自動化 / 稼げる / 誰でも / 保証 / 完成 系の煽り

優先順位:
- 役割の 3 分担が一目で読める > 装飾の表現力
- Substack 中央 hero card が視覚の中心
- 漏斗（流れて絞られる）→ 購読リスト固定 → 蓄積（積み上がる）の時系列が空間で読める
- reader outcome banner で「読者にとって何が変わるか」を明示
```

## Reminder

- candidate は **inbox にのみ保存**。final path（`assets/visuals/...`）には書き込まない。
- 既存 v00X を **上書きしない**（次番号で出す）。
- final 採用は Visual Register Inbox Review の `approve & register` 経由のみ。
- Sanity Studio への反映は **手動**。`localAssetPath` / `status` / `reviewNotes` を Studio で手動更新。
- paid API / direct Sanity write / auto-post 禁止。
