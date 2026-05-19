# 66 — Japanese-First Editorial Visual Generation Quality Upgrade (design)

Date: 2026-05-18
Status: **design-only / prompt-system upgrade / 0 image generation / 0 schema change / 0 sanity write / 0 deploy**
Scope: visual 生成 prompt system を **日本語第一・editorial 品質** に引き上げ、note-inline-content-os-flow-v1 系の現 candidates のような "presentation-app simple" 図に倒れない仕組みを固定する。

本 doc は [docs/50](50-visual-prompt-quality-system.md)（visual prompt quality system v1）と [docs/63](63-cross-platform-content-visual-generation-core.md)（cross-platform core）の **品質層拡張**。Phase Admin 2A-1 で動いている dashboard candidate review surface（[docs/64](64-admin-phase-2a-visual-review-wireframe.md)）はそのまま使い、入力側 prompt の品質契約だけ強化する。

---

## 1. なぜ現 candidates が不十分か

`note-inline-content-os-flow-v1` の v001 / v002 / v003 を見比べた結果、**構造的には正しいが editorial としては弱い**:

### 1.1 v001 (diagram-first)

- 100% boxes + lines、icon / illustration ゼロ
- ラベル: `Content Idea`（メイン）/`Text Drafts`/`Visual Assets`/`Publish Package`/`Human Edit`/`Visual Review`/`Manual Publish`/`X / Threads`/`note / Substack`/`YouTube / Shorts / Podcast`/`Manual Publish` — **本文ほぼ英語**
- 日本語: `コンテンツの核`（subtitle）と `自動化は最後`（badge）の 2 箇所のみ
- 視覚階層: 中央ノードと枝ノードのサイズ差だけ。読者の視線誘導が弱い
- 「developer architecture diagram」 / 「Keynote の章まとめスライド」っぽさ

### 1.2 v002 (typography-hybrid)

- 上部ヘッドラインは日本語で強い（「発信を頑張るより、発信が回る仕組みを作る。」）
- support line と principle badge も日本語で good
- **しかし下半分の pipeline は全部英語ラベル**（Text Drafts / Human Edit / X / Threads...）
- icon / illustration ゼロ
- pipeline 部分が Keynote chart に倒れている
- 「ヘッドラインだけ Japanese、本体は英語ノード」の bilingual 不均衡

### 1.3 v003 (metaphor-mix, dashboard mockup)

- 比喩 (Hitori Media OS の app window) は強い
- 「自動化は最後」badge + 「AIで作る。でも最後は人間が選ぶ。」note は日本語で強い
- **しかし column header すべて英語**（INPUT / TRANSFORM / REVIEW GATE / OUTPUT）
- card 内ラベルも英語（Text Drafts / Visual Assets / Publish Package / X / Threads / ...）
- icon / illustration ゼロ
- 「日本語読者向け note 記事 inline」として **本文の認知負荷が高い**（日本語ヘッドラインで興味を引いた後、本体を読むのに英→日翻訳が要る）

### 1.4 共通の致命的問題

| 問題 | 影響 |
| --- | --- |
| boxes-and-lines-only | "presentation slide" っぽさ、editorial に到達しない |
| 英語ラベル偏重 | 日本語読者の認知負荷を上げる、読了率を下げる |
| icon / illustration なし | 視覚記憶のフックがない、SNS share 時の引きが弱い |
| 視覚階層が flat | "中心 vs 補助 vs 結果" の対比が出ていない |
| reader outcome 欠如 | 「読者にとって何が変わるか」が画像内に書かれていない |
| developer / system 言語が支配 | "system 内部" の話に終始、reader の視点が抜ける |

→ 結果: 構造は正しいが、note 本文に貼ったときに「**読者の心を動かす一枚**」になっていない。404 Runner の Threads 系 visual がうまく行ったのは、Japanese editorial 品質を捨てていなかったため。

---

## 2. "Good Japanese diagram" とは

このシステムが目指す editorial 品質の定義:

### 2.1 必須属性（10 件）

1. **Japanese primary**: 主要ラベルが日本語、英語は補助のみ
2. **Reader-facing wording**: 内部 system 用語ではなく、読者の生活語彙
3. **Visual modules ≥ 3**: 単なる box ではなく、意味を持った視覚要素が 3 種以上
4. **Icons / illustrations ≥ 3**: 簡素でも良い、視覚記憶のフックを 3 個以上
5. **Visual hierarchy**: hero > primary > supporting > meta の階層が明確
6. **Reader outcome box**: 「読んだあとどう変わるか」の 1 文が画像内に存在
7. **Connectors with meaning**: 線が「順序」「変化」「派生」のいずれを意味するか明確
8. **Whitespace**: 詰め込みすぎない、息継ぎがある
9. **Warm accent (1 色)**: brand color を意図的に 1 箇所〜数箇所、面塗りせず点描
10. **Trust signal**: 「これは概念図ではなく実装済みシステム」の確信が伝わる

### 2.2 editorial と presentation-slide の違い

| Editorial diagram | Presentation-slide diagram |
| --- | --- |
| 読者が **手を止めて読む** | 発表者が talk しながら add explanation |
| 単独で意味が成立 | speaker note 前提 |
| 視覚記憶に残る icon / metaphor | box と矢印だけ |
| 「reader にとって」の文脈 | 「system にとって」の構造 |
| Japanese 主、English 補 | English 主、Japanese 補 |
| 余白とリズムで読ませる | 情報密度を上げて埋める |

→ 本 batch 以降の生成は **必ず editorial 寄り**。slide-grade は失格基準。

### 2.3 404 Runner success patterns をどう汎用化するか

[docs/63 §3](63-cross-platform-content-visual-generation-core.md#3-404-runner-reusable-success-patterns) で抽出した 12 patterns のうち、本 batch では特に **D 軸（visual-generation reusable）** を強化:

- P7 main visual as map → "**全体 map** + **詳細詰め**" の 2 階層を 1 枚に
- P8 support visual as prescription → 補助 visual が「具体行動」を示す
- P9 visual hierarchy → hero / primary / supporting の 3 階層
- P10 visual modules → 再利用 module を 5 種以上（後述）

これらは Threads-only ではなく **全 platform 共通**。本 doc の Prompt Block は X / Threads / note / Substack / YouTube thumb / Shorts cover / Instagram すべてに当てる前提。

---

## 3. Japanese-first visual language rules

### 3.1 主従の原則

- **主言語: 日本語**。すべての primary label、headline、subhead、reader outcome box は日本語
- **補助言語: 英語**。tag / chip / メタ情報（生成日時、変数名、URL 等）に限る
- 英語が主役になっていいのは: brand name `Hitori Media OS`、platform 名 `X / Threads / note / Substack / YouTube / Shorts / Podcast / Instagram`、`AI` などのアルファベット略号
- 例外: コードや実装パスを示す badge（URL / file path）は英語のまま OK、ただし sparingly

### 3.2 Reader-facing wording の原則

- **内部 system 用語を読者語彙に翻訳する**。読者は schema を読まない、生活感のある言葉で
- 翻訳は本 doc §3.3 の table を **canonical reference**
- 同じ意味の英語と日本語が両方画像内に存在する場合、**日本語を大きく / 英語を小さく** で対比

### 3.3 Term replacement table（canonical）

| 内部 system 用語（既存） | 読者語彙（**正典**） | 補助英語タグ（任意、小さく） |
| --- | --- | --- |
| Content Idea | **発信のタネ** | Content Idea |
| Text Drafts | **投稿文・記事下書き** | Drafts |
| Visual Assets | **図解・画像素材** | Visuals |
| Publish Package | **公開用パッケージ** | Package |
| Human Edit | **人間が整える** | Edit |
| Visual Review | **図解を選ぶ** | Review |
| Manual Publish | **最後は手動公開** | Publish |
| X / Threads | （そのまま）X / Threads | — |
| note / Substack | （そのまま）note / Substack | — |
| YouTube / Shorts / Podcast | （そのまま）YouTube / Shorts / Podcast | — |
| Instagram | （そのまま）Instagram | — |
| Hitori Media OS | （そのまま、英語ブランド名）Hitori Media OS | — |
| automation later | **自動化は最後** | — |
| build-in-public | **建設過程を公開** | building-in-public |
| feedback loop | **読者の反応を取り込む** | feedback |
| review gate / human gate | **人間レビュー** | review gate |
| reader / audience | **読者** | reader |
| campaign | **キャンペーン**（1 テーマ 1 まとめ） | campaign |
| asset | **素材** | asset |
| inbox | **下書き棚** | inbox |
| final asset | **採用済み素材** | final |

→ プロンプト書く側は **table を引いて Japanese 主 + English 補** のラベル組を decide してから生成する。

### 3.4 ラベル長さの目安

- headline: 8-18 字（2 行可、計 16-30 字）
- subhead / support line: 12-30 字
- card label: 4-10 字
- chip / badge: 2-7 字
- reader outcome box: 14-30 字（1 行か 2 行）

長すぎると視覚密度が壊れる、短すぎると意味が伝わらない。

---

## 4. Visual richness requirements

### 4.1 必ず含める要素（7 種）

| # | 要素 | 役割 | 配置目安 |
| --- | --- | --- | --- |
| 1 | **headline**（日本語） | 主張・引き | 上 1/3 or 中央上部 |
| 2 | **subhead / support line**（日本語） | 主張の補足、誰に何を | headline 直下 |
| 3 | **3+ visual modules** | 構造の骨格（node / card / lane / column / before-after panel など） | center mass |
| 4 | **3+ icons or simple illustrations** | 視覚記憶のフック（seed / document / check / image / package / platform pill / hand 等） | modules 内 / 横 |
| 5 | **connectors / arrows** | 順序・変化・派生を明示 | modules 間 |
| 6 | **highlight badge** | brand philosophy or principle（「自動化は最後」等） | corner |
| 7 | **reader outcome box** | 読者にとっての変化を 1 文 | 右下 or 下部 |

### 4.2 視覚階層（必ず作る）

```
[ hero element ]    ← 一番大きく、accent color、視線を最初にここへ
   ↓
[ primary modules ] ← 2-4 個、同サイズ、hero より小さい
   ↓
[ supporting elements ] ← chip / icon / annotation、最小
   ↓
[ meta / corner badges ] ← 隅の補助情報
```

### 4.3 Forbidden patterns（自己 reject 条件）

生成物がいずれかに該当したら **rough 段階で停止 / または image_gen 後に reject** して再ラフから:

| Forbidden | 例 |
| --- | --- |
| boxes-and-lines-only | 四角形と線だけ、icon ゼロ |
| title-card-only | 大きいヘッドラインだけ、構造図ゼロ |
| English-first diagram | 主要 label が英語、Japanese 補助 |
| generic developer architecture | "Service → Queue → DB" 風、reader 不在 |
| plain flowchart, no editorial | 灰色背景の業務フロー図感 |
| random decoration | 意味のない装飾線・グラデ・glow |
| robot / brain / AI chip icon | cliché AI symbol |
| neon / glassmorphism / glow | sci-fi 風 |
| unreadable tiny text | 日本語ラベルが 10pt 相当未満で潰れる |
| real people / face / avatar | 顔写真・人物 |
| recognizable platform logos | X / Substack / note の正規ロゴ |
| secrets / project IDs / private paths | 内部 token / URL / id |

---

## 5. Pre-generation Visual Rough step

**画像生成の前に必ず "Visual Rough" を 1 度書く**。これは agent（Codex / Claude Code）の **自己約束**: rough が editorial 基準を満たすまで image_gen を発射しない。

### 5.1 Visual Rough format（必須 11 fields）

```yaml
visualRough:
  reader: <誰が読むのか、1 行>
  readerProblem: <その読者が抱えている痛み、1-2 行>
  visualThesis: <この 1 枚で伝える主張、1 行>
  layoutPattern: <§7 の preferred list から 1 つ選ぶ>
  mainVisualMetaphor: <比喩や見立て、1-2 行。なしなら "none" でも可>
  japaneseLabels:
    - <日本語ラベル 1>
    - <日本語ラベル 2>
    - ...
  englishLabels:  # 任意、補助のみ
    - <英語タグ 1>
    - ...
  visualModules:
    - module: <module 名>
      role: <reader-facing role>
      visualHint: <どう見えるか>
  iconsOrIllustrations:
    - <icon / illustration の簡易記述>
    - ...
  hierarchyOrder:
    - <hero element>
    - <primary 1>
    - <primary 2>
    - <supporting>
  readerOutcomeBox: <読者にとっての変化、1 文>
  forbiddenElements:
    - <この生成で特に避けるもの>
  whyBetterThanPlainNodes: <なぜ box-and-line に倒れないか、1-2 行>
```

### 5.2 Visual Rough の合否基準（self-check）

agent は image_gen を呼ぶ前に rough を **以下 7 項目でセルフ採点**。1 つでも fail なら rough をやり直す:

| # | 質問 | Pass | Fail |
| --- | --- | --- | --- |
| 1 | japaneseLabels の数 ≥ englishLabels の数？ | はい | いいえ |
| 2 | visualModules が 3 種類以上？ | はい | いいえ |
| 3 | iconsOrIllustrations が 3 つ以上？ | はい | いいえ |
| 4 | readerOutcomeBox に "読者の変化" が書いてあるか？ | はい | いいえ |
| 5 | layoutPattern が §7 の preferred から選ばれているか？ | はい | いいえ |
| 6 | whyBetterThanPlainNodes に納得感のある理由があるか？ | はい | いいえ |
| 7 | forbidden patterns（§4.3）に該当する要素を rough 内に含んでいないか？ | はい | いいえ |

### 5.3 Phase 2A 中の運用

- Phase 2A は dashboard read-only。Visual Rough は **prompt.md 内のセクションとして手動記入** → 人間 review → 通れば image_gen
- Phase 2B 以降の dashboard は Visual Rough form を UI で受け、self-check 自動化する余地（[docs/62 §3.2](62-admin-phase-2-visual-generation-admin-design.md#32-phase-2b--local-self-host-write-mode) の write 解禁範囲）

---

## 6. Upgraded layout pattern guidance

### 6.1 Preferred patterns（Hitori Media OS で優先）

| Pattern | best use case | キー要素 |
| --- | --- | --- |
| **Before / After** | "毎回ゼロ" vs "仕組みで回る" 等の対比 | 左右 2 列、矢印で transition、変化点強調 |
| **Editorial explainer** | 記事冒頭・章末の要約 | headline + 3-4 module + reader outcome box |
| **Dashboard workflow** | 仕組みの "ある感" を強調 | 軽い UI chrome + 4 lane + connector |
| **Pipeline with checkpoints** | 人間レビューの位置を見せる | 横長 pipeline + 3 checkpoint chip |
| **4-step transformation** | 段階的変化を語る | 1→2→3→4 の 4 stage |
| **Media distribution map** | 1 tane → N media | 中央 hub + 8 platform card |
| **Human review journey** | 人間が介入する流れ | 縦長 journey + review gate icon |
| **Checklist infographic** | 「これさえ守れば」 | 5-7 checklist + check icon |
| **Problem-to-system diagram** | 痛み → 仕組みで解決 | 左 problem, 右 system, 中央 bridge |

### 6.2 Avoid patterns（明示的に却下）

| Pattern | なぜ却下 |
| --- | --- |
| 単純な hub-and-spoke（default 使用） | 装飾なしの放射状は presentation-slide に倒れる、特別な意味づけがある時のみ可 |
| Raw node graph | "system → system" 矢印、reader 不在 |
| Developer architecture diagram | "Service / Queue / DB" 風、editorial 失格 |
| Pure UI mockup（reader benefit 不明） | screenshot だけ、訴えが弱い |
| Centered single-headline title card | 構造ゼロ |

---

## 7. Japanese Editorial Diagram Prompt Block v1

「再利用可能な prompt の骨格」。各 candidate prompt はこの block を **必ず冒頭に置き**、その後に asset-specific 詳細を続ける。

### 7.1 Block 全文

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

### 7.2 使い方

任意 asset の生成 prompt は:

```
[Japanese Editorial Diagram Prompt Block v1 〈そのまま貼る〉]

[asset-specific section]
- coreThesis (Japanese):
- target platform:
- pixel size:
- specific layout pattern from the preferred list:
- specific Japanese labels (from docs/66 §3.3 table):
- specific icons:
- visual rough (filled docs/66 §5.1 form):
- reference style anchors (paths):

[Hard Rules block 〈path / overwrite / git rules〉]
```

---

## 8. Application to `note-inline-content-os-flow-v1`（revised plan）

**注意**: 本 batch では **画像を生成しない**。v004 の revised plan を docs と prompt.md に書くだけ。実生成は次の人間 GO 待ち batch。

### 8.1 Revised theme

- **Theme**: 「毎回ゼロから発信を作る」から「発信のタネが複数媒体へ育つ仕組み」へ
- **Reader**: ひとり発信者 / engineer-creator / 仕組みを作りたい書き手
- **Reader problem**: 毎日違うネタを 0 から書くのが苦しい、続かない
- **Visual thesis**: 発信のタネが、AI 下書き → 人間整え → 図解選び → 公開用パッケージへと **育っていく** (transformation)
- **Layout pattern**: **Before / After + Pipeline**（左に "毎回ゼロ" の苦しさ、右に "仕組みで回る" の流れ、中央に bridge）

### 8.2 Visual Rough（v004 用、§5.1 format）

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
    - 「発信作業が、毎回の頑張りから仕組みに変わる。」  # reader outcome
    - 「毎回ゼロから書く」  # Before label
    - 「仕組みで回る」  # After label
  englishLabels:
    - Hitori Media OS  # subtle brand mark in corner
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
    - 「Content Idea」というラベル（→ 「発信のタネ」に置換）
    - 「Manual Publish」というラベル（→ 「最後は手動公開」に置換）
    - 「Visual Review」というラベル（→ 「図解を選ぶ」に置換）
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

### 8.3 §5.2 self-check（v004 rough 採点）

| # | 質問 | Pass/Fail |
| --- | --- | --- |
| 1 | japanese ≥ english | **Pass**（13 vs 1） |
| 2 | visualModules ≥ 3 | **Pass**（10 件） |
| 3 | iconsOrIllustrations ≥ 3 | **Pass**（8 件） |
| 4 | readerOutcomeBox 有 | **Pass**（「発信作業が、毎回の頑張りから仕組みに変わる。」） |
| 5 | layoutPattern が preferred list | **Pass**（Before / After + Pipeline） |
| 6 | whyBetterThanPlainNodes 説得力 | **Pass** |
| 7 | forbidden に該当なし | **Pass** |

→ **7/7 Pass**。次の image_gen batch で v004 として生成可能。

### 8.4 期待される dimensions

- pixelSize: **1600 × 900**（16:9 horizontal、既存と同じ）
- aspectRatio: 16:9

### 8.5 v003 との明示的な差分

| 観点 | v003 (現状の metaphor-mix) | **v004 (Japanese editorial v1)** |
| --- | --- | --- |
| 主言語 | 英語ラベル中心 | **日本語ラベル中心** |
| layout | dashboard 4 column | **Before / After + Pipeline** |
| icon / illustration | 0 件 | **8 件**（種 / 紙 / 鉛筆 / check / thumbnail / package / 手 / lock + ループ矢印） |
| reader outcome box | なし（badge と note は brand philosophy） | **あり**（読者の変化を 1 文で） |
| Before の対比 | なし | **左コラム**で「毎回ゼロ」を視覚化 |
| 発信のタネ表現 | "Content Idea / コンテンツの核" | **発信のタネ**（種 icon 付き） |
| 公開用パッケージ表現 | "Publish Package" | **公開用パッケージ**（package icon 付き） |
| 全体トーン | system architecture | **editorial infographic** |

---

## 9. Application to other platforms (briefly)

本 doc の prompt block v1 は **全 platform 共通** で使える。各 platform で変えるのは aspect ratio と density、layout pattern の選択肢:

| Platform | preferred layout（§6.1 から） | aspect | density |
| --- | --- | --- | --- |
| X main | Problem-to-system / Before-After | 16:9 / 4:5 | low-medium |
| Threads main | Pipeline with checkpoints / Editorial explainer | 4:5 portrait | medium |
| Threads reply | Checklist infographic / Human review journey | 4:5 | medium |
| note hero | Editorial explainer / Media distribution map | 16:9 | medium-high |
| note inline | Before-After + Pipeline / Dashboard workflow | 16:9 | medium-high |
| Substack header | Editorial explainer / 4-step transformation | 16:9 / 3:1 | medium |
| YouTube thumbnail | Problem-to-system | 16:9 | low |
| Shorts cover | Before / After（縦） | 9:16 | low |
| Instagram carousel | Editorial explainer / Checklist infographic | 4:5 / 1:1 | medium-high |

→ 全 9 platform で「日本語第一 + visual richness 7 必須 + 自己 reject 12 条件」を共通契約として運用。

---

## 10. Connection to Phase 2A dashboard candidate review

本 doc の品質契約は dashboard 表示と整合:

- [docs/64 §10](64-admin-phase-2a-visual-review-wireframe.md#10-candidate-scoring-display) の **35 点 rubric**（7 axes）と本 doc §5.2 / §7.1 の self-rubric は同じ 7 axes
- dashboard `/visual-assets/[id]/candidates` で表示される `prompt.md` 内容は本 doc §7.1 block を含むようになる（既存 candidate の prompt は更新せず、v004+ から）
- `review.md` frontmatter（[docs/65](65-inbox-candidate-frontmatter-contract.md)）の `candidateScores[id].score` は本 doc §5.2 self-check の合計 35 点で埋める運用
- Phase 2B 以降の dashboard write 解禁時に、Visual Rough form を UI 化できる素地（[docs/62 §6.6](62-admin-phase-2-visual-generation-admin-design.md) Suggested Action Panel の "Regenerate prompt preview" は本 doc の rough 機構と接続予定）

---

## 11. Out of scope（本 batch）

- 画像生成: **0**（本 batch では v004 生成しない、別 batch で人間 GO 後）
- schema 変更 / activate: **0**
- dashboard runtime 変更: **0**
- Sanity write / mutation: **0**
- assets/visuals / patches / publish-packages 変更: **0**
- Codex CLI 起動 / paid API integration: **0**
- production deploy / env vars / Vercel UI 操作: **0**
- 既存 candidate PNG 削除 / 上書き: **0**（v001 / v002 / v003 はそのまま履歴として残す）
- existing prompt.md の variant 節（v001 / v002 / v003）の編集: **0**（履歴として保存、append のみ）

---

## 12. 連番について

- docs: 65 → **66**
- devlog: 0113 → **0114**
- handoff: 0124 → **0125**

---

## 13. Safety（本 batch）

- 画像生成: **0**
- schema / code / asset / patch / Sanity / deploy / env / Vercel: **不変**
- 既存 candidate PNG byte size: **不変**（threads + note-inline 全 6 件のサイズ確認）
- 既存 prompt.md の variant 節: **保存**、append section のみ追加
- 既存 review.md: **本 batch では非編集**
- Codex CLI 起動: **0**
- paid LLM / image API client 追加: **0**
- 新規 npm package: **0**

→ validation 結果は handoff §10 に記録。
