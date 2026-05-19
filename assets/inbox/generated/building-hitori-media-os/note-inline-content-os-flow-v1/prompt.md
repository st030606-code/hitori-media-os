---
campaignSlug: building-hitori-media-os
assetSlug: note-inline-content-os-flow-v1
visualAssetPlanId: visualAssetPlan.building-hitori-media-os.note-inline-content-os-flow-v1
assetPurpose: inline-diagram
platform: note
aspectRatio: 16:9
pixelSize: 1600x900
candidateStrategy:
  - id: v001
    variant: diagram-first
  - id: v002
    variant: typography-hybrid
  - id: v003
    variant: metaphor-mix
  - id: v004
    variant: japanese-editorial-v1
styleAnchors:
  - assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png
  - assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png
layoutPatterns:
  - contentOSFlow
  - mediaDistributionMap
  - workflowPipeline
  - humanReviewFlow
requiredVisualModules:
  - headline
  - centralNode
  - branchNodes
  - connectors
  - humanReviewCheckpoint
  - publishPackageBlock
  - principleBadge
forbiddenPatterns:
  - text-only-title-card
  - robot-brain-cliche
  - neon-ai-glassmorphism
  - unreadable-small-text
phase: phase-admin-2a-prep
---

# Prompt Log — note-inline-content-os-flow-v1

- contentSlug: `building-hitori-media-os`
- visualAssetPlanId: `visualAssetPlan.building-hitori-media-os.note-inline-content-os-flow-v1`
- targetPlatform: note (inline)
- aspectRatio: 16:9
- pixelSize: 1600 x 900
- generator: Codex CLI 0.120.0 (`-m gpt-5.4 --enable image_generation`)
- batch: Production Visual Generation Batch 2 (devlog 0109)
- date: 2026-05-17

## Style Anchors

- `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` (adopted hero)
- `assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png` (X 版、トーン揃え)

## 共通 Hard Rules (全 v00N)

- 出力先は `assets/inbox/generated/building-hitori-media-os/note-inline-content-os-flow-v1/v00N.png` のみ。
- final path（`assets/visuals/...`）には書き込まない。
- 既存ファイルを上書きしない。
- 図中に secret / token / 実 project ID / `private/` 配下のパス文字列を入れない。
- 顔写真・人物・AI generated avatar・ロボット・脳のシンボル禁止。
- 完全自動化 / 全自動化 / 稼げる / 誰でも / 保証 / 完成 を匂わせる語句禁止。
- 生成後に `git diff --stat` を取り、`assets/inbox/generated/building-hitori-media-os/note-inline-content-os-flow-v1/` 以外が変わっていたら停止して報告。

## v001 — diagram-first

> ハブ&スポーク図そのものが主役。読みやすさ最優先。

Base prompt:

```text
1600x900 で生成してください（16:9 横長）。

note 記事の inline に配置する構造図です。「1つの Content Idea が複数媒体へ展開する」ハブ&スポーク関係を、図そのもので語ります。

レイアウト:
- 画面中央に大きめの丸角矩形ノードを1つ。中に大きく日本語ラベル『Content Idea』。
- 中央ノードの内部下半分に、小さく『主張 / 読者 / 根拠 / 反論 / トーン / 媒体別の切り口』の6項目を縦リスト or 2列横並びで列挙。
- 中央ノードから細い線が放射状に8方向へ伸びる。線は均等角度（45° 間隔）で配置。
- 各線の端に小さな丸角矩形ノードを置き、それぞれのラベル：
  『note』『Substack』『X』『Threads』『YouTube』『Shorts』『Podcast』『Instagram』
- 8つのノードは全て同じ大きさ・同じ色・同じスタイル・中央から等距離。
- ノード内のテキスト1行のみ、中央揃え。

スタイル:
- 背景は白。
- 線・ノード輪郭は濃いネイビー（#1F2A44 付近）or チャコールグレー。
- 塗りつぶしは無し or 中央ノードのみ薄い面塗り。
- アクセント色 1色のみ。中央ノード『Content Idea』に控えめに使う（warm orange / muted amber 系）。
- sans-serif（Noto Sans JP / Inter / IBM Plex 系）、中ウエイト。
- 装飾なし、影なし、グラデーションなし、光線なし。

避けるもの:
- 完全自動化 / API投稿 / AI記事生成 / AIで稼ぐ 系の煽り文言。
- 顔写真、人物、ロボット、脳のシンボル、AI clone face。
- ロゴ風表現、商標、URL、トークン文字列。
- 余計な背景パターン、ドットグリッド、装飾枠。

優先順位:
- 構造の正確さ > 装飾性。
- 8 ラベルすべて読めること > 中央内部 6 項目の読みやすさ > 中央タイトルの大きさ。
- 文字量より、中央 vs 8 ノードの関係が一瞬で読めること。
```

## v002 — typography-hybrid

> 中央タイトルをタイポグラフィ的に強調、周辺ノードはシンプルなタグ寄り。

Base prompt:

```text
1600x900 で生成してください（16:9 横長）。

note 記事 inline 構造図。中央のタイトル『Content Idea』をタイポグラフィ的に強調しつつ、8 媒体ノードはミニマルなタグスタイルで配置。

レイアウト:
- 画面中央: 太めの日本語/英語混在の見出し『Content Idea』を視覚的にしっかり置く。
  - フォントウエイトはやや太め、文字色は濃いネイビー or チャコール。
  - 見出しの直下または右側に、小さく『主張 / 読者 / 根拠 / 反論 / トーン / 媒体別の切り口』を2行 or 3列で列挙。
- 中央タイトル周囲に8方向（45°間隔）で細線を放射状に。
- 各線の端に小さい矩形タグ（丸角ボタン風）で『note』『Substack』『X』『Threads』『YouTube』『Shorts』『Podcast』『Instagram』。
- 8タグは同じサイズ・等距離。
- 中央タイトルはタグの 3〜4 倍サイズ。

スタイル:
- 背景は白。
- 線・タグ輪郭は濃いネイビー or チャコール。タグの塗りはなしか極薄。
- アクセント色 1色のみ、中央タイトル下線または6項目見出しに控えめに使う。
- sans-serif（Noto Sans JP / Inter / IBM Plex 系）。
- 影なし、グラデーションなし、装飾なし。

避けるもの:
- 完全自動化 / API投稿 / AI記事生成 / AIで稼ぐ 系の煽り。
- 顔写真、人物、ロボット、脳のシンボル。
- ロゴ風表現、商標、URL、トークン文字列。
- 派手な装飾、複数アクセント色、過度な装飾枠。

優先順位:
- 中央タイトルの存在感 > 8 タグの存在感 > 6 項目の読みやすさ。
- ただし 8 タグのラベルは必ず読めるサイズに保つ。
```

## v003 — metaphor-mix

> ハブ&スポーク構造に、薄い手描き風点線の囲み or 矢印などの比喩要素を1点だけ追加。

Base prompt:

```text
1600x900 で生成してください（16:9 横長）。

note 記事 inline 構造図。基本はハブ&スポーク構造、そこに1点だけ控えめな比喩要素を加えます（薄い手描き風点線の外周枠 or 中央ノードを囲む点線楕円）。装飾過多禁止。

レイアウト:
- 画面中央に丸角矩形ノード『Content Idea』、内部下半分に『主張 / 読者 / 根拠 / 反論 / トーン / 媒体別の切り口』。
- 中央ノードを囲むように、薄い手描き風点線の楕円 or 角丸枠を1つだけ追加（"中心レコード" を示唆する控えめなメタファー）。
- 点線枠の外側に8方向の細線を放射状に展開。
- 各線の端に小さな丸角矩形ノード：『note』『Substack』『X』『Threads』『YouTube』『Shorts』『Podcast』『Instagram』。
- 8ノードは全て同サイズ・等距離。
- 比喩要素は1個まで（複数の囲みや派手な矢印を盛らない）。

スタイル:
- 背景は白。
- 線・ノード輪郭は濃いネイビー or チャコール。
- アクセント色 1色のみ、点線枠か中央ノード塗りのいずれかに控えめに使う。
- sans-serif（Noto Sans JP / Inter / IBM Plex 系）。
- 影なし、グラデーションなし、光線なし。

避けるもの:
- 完全自動化 / API投稿 / AI記事生成 / AIで稼ぐ 系の煽り。
- 顔写真、人物、ロボット、脳のシンボル、AI clone face。
- ロゴ風表現、商標、URL、トークン文字列。
- 複数の比喩要素の盛り合わせ、装飾過多、ドットグリッド背景。

優先順位:
- 構造の正確さ > 比喩の表現力。
- 比喩要素は中央ノードの存在感を弱めない範囲に抑える。
- 8 ラベル全て読めることが最優先。
```

## Japanese Editorial Diagram Prompt Block v1

> Added 2026-05-18. Reference: [docs/66](../../../../../docs/66-japanese-visual-generation-quality-upgrade.md).
> v001 / v002 / v003 above remain as historical record. v004+ MUST use this block.
> This section is the canonical prompt for any future candidate of this asset.

### Why this block exists

v001 / v002 / v003 are structurally correct but visually too simple, English-label
heavy, and presentation-app-like. Japanese readers experience extra cognitive load
when scanning the diagram. This block upgrades the contract: Japanese-first,
editorial-quality, with mandatory visual richness, icons, and reader outcome.

### Mandatory rules (copied verbatim from docs/66 §7.1)

```text
# Japanese Editorial Diagram Prompt Block v1
# Reference: docs/66-japanese-visual-generation-quality-upgrade.md
# Source: docs/63-cross-platform-content-visual-generation-core.md (404 Runner reusable patterns)

## Reader-first framing

- This image is for a **Japanese-reading audience** scrolling a note article / Substack
  essay / X timeline. Primary labels MUST be Japanese. English labels are auxiliary.
- Replace internal system vocabulary with reader vocabulary using the table in
  docs/66 §3.3 (Content Idea → 発信のタネ, Text Drafts → 投稿文・記事下書き, etc.)
- Every diagram must include a **reader outcome box** (1 short Japanese sentence
  describing what changes for the reader).

## Visual richness requirements (MUST contain)

- 1 headline in Japanese (8-18 chars per line, max 2 lines)
- 1 subhead / support line in Japanese (12-30 chars)
- ≥ 3 distinct visual modules (cards, lanes, chips, panels — not all the same shape)
- ≥ 3 small icons or illustrations (seed / document / check / image / package /
  platform pill / hand / etc., kept simple and geometric)
- connectors / arrows that imply order, transition, or branching
- 1 highlight badge (e.g. 「自動化は最後」) in a corner
- 1 reader outcome box (e.g. 「発信作業が毎回の頑張りから仕組みに変わる」)
- Clear 4-level visual hierarchy: hero > primary > supporting > meta
- Generous whitespace, no overcrowding
- ONE warm accent color (muted amber #D08A3C-like) used intentionally on 2-4 spots
  (do not flood the canvas with color)

## Forbidden patterns (self-reject if any apply)

- boxes-and-lines-only diagram (no icons, no illustrations)
- title-card-only image (headline but no diagram structure)
- English-first labels (primary labels in English)
- generic developer architecture diagram (Service / Queue / DB style)
- plain business flowchart with no editorial design
- random decoration with no meaning
- robot / brain / AI chip / circuit cliché icons
- neon / glassmorphism / glow / gradients / sci-fi style
- unreadable tiny Japanese text
- real people / face / avatar
- recognizable platform logos (use text labels for X / Threads / note / Substack /
  YouTube / Shorts / Podcast / Instagram)
- secrets / private paths / real project IDs / paid PDF content

## Style guard

- Background: white or very light warm gray
- Primary text color: deep navy (#1F2A44) or charcoal
- ONE accent: warm muted amber (#D08A3C-like)
- Sans-serif (Noto Sans JP / Inter / IBM Plex), medium-to-semibold weight on Japanese
- Lines: thin (1px), navy/charcoal
- No shadows, no gradients, no glow, no 3D effects
- "Editorial infographic" feel, NOT "presentation slide" feel
- Designed to be read alone (no speaker required)

## Layout pattern (must pick from preferred list, docs/66 §6.1)

- Before / After
- Editorial explainer
- Dashboard workflow
- Pipeline with checkpoints
- 4-step transformation
- Media distribution map
- Human review journey
- Checklist infographic
- Problem-to-system diagram

(Do NOT use generic hub-and-spoke as default. Do NOT use raw node graph. Do NOT use
developer architecture diagram. Do NOT use pure UI mockup with no reader benefit.)

## Self-review rubric (apply before saving)

7 axes, 1-5 scale, total /35:
- diagram richness
- clarity / readability
- Japanese legibility (PRIMARY labels in Japanese, all readable)
- brand consistency (vs campaign style anchors)
- platform fit (aspect ratio + crop)
- not text-only (diagram occupies ≥ 50% of canvas)
- reader outcome stated (clear "what changes for reader")

Threshold: ≥ 24/35 = candidate, 18-23 = needs review, < 18 = regenerate.

## Pre-generation Visual Rough (mandatory)

Before calling image_gen, the agent must produce a Visual Rough (docs/66 §5.1)
and pass the 7-point self-check (docs/66 §5.2). If any check fails, revise the
rough and run the check again. Only then proceed to image_gen.
```

## v004 — Japanese editorial v1 (planned, not yet generated)

> Variant id: `v004`. Variant label: `japanese-editorial-v1`.
> Generation status: **planned, not yet executed**. This section records the
> Visual Rough that has passed the 7-point self-check in docs/66 §8.3.
> Image generation requires a separate batch with human GO.

### Theme

「毎回ゼロから発信を作る」から「発信のタネが複数媒体へ育つ仕組み」へ。

### Visual Rough (docs/66 §5.1 format, passes 7/7 self-check)

```yaml
visualRough:
  reader: ひとりで発信を続けている書き手 / engineer-creator
  readerProblem: 毎日違うネタを 0 から書く、媒体ごとに別物を書く、続かない
  visualThesis: 発信のタネが、AI 下書き → 人間レビュー → 図解 → 公開用パッケージへ育つ仕組み
  layoutPattern: Before / After + Pipeline（左 Before、右 After 流れ）
  mainVisualMetaphor: 発信のタネ（種・seed icon）が、4 段の transformation で「公開用パッケージ」という実った fruit になる
  japaneseLabels:
    - 発信のタネ
    - AI 下書き
    - 人間が整える
    - 図解を選ぶ
    - 公開用パッケージ
    - X / Threads
    - note / Substack
    - YouTube / Shorts
    - 最後は手動公開
    - 自動化は最後
    - 「発信作業が、毎回の頑張りから仕組みに変わる。」
    - 「毎回ゼロから書く」
    - 「仕組みで回る」
  englishLabels:
    - Hitori Media OS
  visualModules:
    - module: Before panel
      role: 「毎回ゼロから書く苦しさ」を視覚化（散らばった付箋・反復矢印）
      visualHint: 左側、薄い灰色トーン、ぐるぐる回る矢印、散らかったメモアイコン 3 枚
    - module: 発信のタネ card
      role: pipeline の起点
      visualHint: 種 (seed) icon が card 内、accent amber 枠
    - module: AI 下書き card
      role: stage 2、自動生成
      visualHint: 紙 (document) アイコンが 2-3 枚積み重なる、薄い navy 枠
    - module: 人間が整える chip
      role: stage 3、人間レビュー
      visualHint: 鉛筆 (edit) icon + check badge、amber 左端アクセント
    - module: 図解を選ぶ chip
      role: stage 4、visual review
      visualHint: 画像 thumbnail x 3 並列、選択 indicator
    - module: 公開用パッケージ card
      role: pipeline の実り
      visualHint: package / folder icon、navy 枠
    - module: platform output row
      role: パッケージから 4 媒体へ展開
      visualHint: 4 platform pill (X / Threads / note / Substack / YouTube / Shorts) 横並び
    - module: 最後は手動公開 gate
      role: pipeline 最終 gate
      visualHint: 手 (hand) icon + lock icon の組み合わせ、amber accent
    - module: principle badge
      role: brand philosophy
      visualHint: 「自動化は最後」 chip、右上、amber underline
    - module: reader outcome box
      role: 読者の変化
      visualHint: 下部 banner、「発信作業が、毎回の頑張りから仕組みに変わる。」、「仕組み」に amber underline
  iconsOrIllustrations:
    - 種 / seed icon (発信のタネ card 内)
    - 紙 / document icon × 2-3 stacked (AI 下書き card 内)
    - 鉛筆 / edit icon (人間が整える chip)
    - check badge (人間レビュー後)
    - 画像 thumbnail icon × 3 (図解を選ぶ chip)
    - パッケージ / folder icon (公開用パッケージ card 内)
    - 手 / hand icon + 鍵 / lock icon (最後は手動公開 gate)
    - 反復ループ矢印 (Before panel 内、毎回ゼロを示唆)
  hierarchyOrder:
    - 発信のタネ card (hero、左から始まる pipeline の起点)
    - pipeline 4 stage (AI 下書き → 人間が整える → 図解を選ぶ → 公開用パッケージ)
    - 4 platform pill row (公開用パッケージから展開)
    - 最後は手動公開 gate (pipeline 最終 corner)
    - Before panel (左コラム、After との対比)
    - reader outcome box (下部 banner)
    - 自動化は最後 badge (右上 corner)
  forbiddenElements:
    - 単純 hub-and-spoke 放射図
    - English column headers (INPUT / TRANSFORM 等は使わない)
    - ロボット / 脳 icon
    - neon / glassmorphism
    - "Content Idea" というラベル（→ 「発信のタネ」に置換）
    - "Manual Publish" というラベル（→ 「最後は手動公開」に置換）
    - "Visual Review" というラベル（→ 「図解を選ぶ」に置換）
  readerOutcomeBox: 「発信作業が、毎回の頑張りから仕組みに変わる。」
  whyBetterThanPlainNodes: |
    Before / After 2 列構造で「読者の現状（毎回ゼロから書く苦しさ）」と
    「読者の未来（仕組みで回る発信）」を対比して見せる。pipeline 単独だと
    "system の内側" の話で終わるが、Before を入れることで「読者にとって
    何が変わるか」が画像内で完結する。種 (seed) → 公開用パッケージ
    (fruit) の transformation 比喩を加え、icon が 8 種類、日本語ラベル
    が 12 種類、英語は brand mark のみ、editorial infographic として
    成立する。
```

### Self-check result (docs/66 §5.2)

| # | Question | Result |
| --- | --- | --- |
| 1 | japaneseLabels ≥ englishLabels | **Pass** (13 vs 1) |
| 2 | visualModules ≥ 3 | **Pass** (10) |
| 3 | iconsOrIllustrations ≥ 3 | **Pass** (8) |
| 4 | readerOutcomeBox has reader change | **Pass** |
| 5 | layoutPattern from preferred list | **Pass** (Before / After + Pipeline) |
| 6 | whyBetterThanPlainNodes convincing | **Pass** |
| 7 | no forbidden element in rough | **Pass** |

**7 / 7 Pass** → cleared for image_gen in a future batch.

### Expected output (when generated)

- Output path: `assets/inbox/generated/building-hitori-media-os/note-inline-content-os-flow-v1/v004.png`
- Pixel size: 1600 × 900 (16:9)
- Hard rules: do NOT overwrite v001 / v002 / v003. 5 min cap. Single image_gen call.
  Apply Japanese Editorial Diagram Prompt Block v1 above + the Visual Rough above.
- After generation: dashboard `/visual-assets/<id>/candidates` should show 4 candidates.

