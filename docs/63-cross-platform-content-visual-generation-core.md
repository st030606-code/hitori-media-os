# 63 — Cross-Platform Content + Visual Generation Core (design)

Date: 2026-05-18
Status: **design-only**, no schema activation / no code change / no deploy / no image generation
Scope: boss が手で組んだ「404 Runner」Threads campaign の成功パターンを、**1 platform に閉じない再利用可能な core** に昇格させる設計。`Threads-only generator` ではなく `Content Package Generator + Visual Package Generator + Repurpose Engine` の三位一体で扱う。

本 doc は [docs/62](62-admin-phase-2-visual-generation-admin-design.md)（Phase Admin 2 設計）と垂直方向に直交する：62 は "dashboard で visual を扱う phase 設計"、本 63 は "content と visual の **生成パターン** を schema / template に抽象化する設計"。Phase 2A 実装でも Phase 3 generation 統合でも参照される共通基盤。

---

## 1. なぜ "Threads success" を core に昇格させるのか

### 1.1 観察された事実

boss が手作業で組んだ **404 Runner Threads campaign** が、過去の他テーマ post より明確に良い反応を得た。campaign の構造を分解すると、**Threads という platform 特性に依存していない reusable な骨格** が見える:

```
reader pain
   ↓
4-point decomposition
   ↓
main post as "map"  (全体像)
   ↓
reply posts as "prescriptions"  (各論)
   ↓
one visual per unit  (図解、一投稿一画像)
   ↓
final brand philosophy connection
```

これは **Threads main + reply** の形に偶然はまっただけで、本質は:

- **pain → map → prescription → philosophy** の 4 段構造
- **decompose × per-unit visual** の組み合わせ

なので、X thread / note 記事の章立て / Substack 構成 / YouTube chapter / Shorts hook / Instagram carousel すべてに転用できる。

### 1.2 Threads-only 設計の問題

「404 Runner はうまくいった、Threads template を作ろう」と短絡すると:

- platform 別に同種 template を 7-8 個量産することになる（保守不能）
- platform を跨いで repurpose（同じ Content Idea → 複数 platform）するときに **base が無い**
- 既存 [docs/48](48-campaign-generation-flow.md) の "1 Content Idea → N platform" モデルと噛み合わない
- 「成功パターンをコピペする」ことが「platform を増やす」と同義になり、scope が太る

### 1.3 本 doc の方針

- **Threads-specific 部分** と **platform-agnostic core** を明確に切り分け（§3）
- core を **Content Package + Visual Package + Repurpose Engine** の3抽象で表現（§2）
- core を Hitori Media OS の文脈に翻訳（§4）
- 全 platform への mapping を表で定義（§5）
- 既存 schema（brandProfile / visualStyleProfile / promptTemplate / campaignPlan / visualAssetPlan）でどこまで足りるか、提案 schema は何か（§10）
- dashboard route 提案（§11）
- 具体的 1 test case で動作確認（§12）

### 1.4 何を本 doc で **やらない** か

| Out | 理由 |
| --- | --- |
| schemas/proposed/ への sketch 追加 | 提案のみ、active 化は別 batch |
| 既存 dashboard runtime の変更 | 設計のみ |
| 既存 promptTemplate / brandProfile / visualStyleProfile の破壊的変更 | 既存 5 件は不変 |
| 画像生成 / Codex CLI 起動 | 別 batch（Production Visual Generation Batch 系） |
| Sanity mutation | 永続的に確認 gate 経由のみ |
| 404 Runner キャンペーン本体の再投稿 / 出版 | 別 batch |
| Auth 設計 | [docs/62](62-admin-phase-2-visual-generation-admin-design.md) § 3.3 経由で別 doc に分離 |

---

## 2. Core 抽象: Content Package / Visual Package / Repurpose Engine

「Thread Package Generator」を「Threads 限定の道具」と捉えず、3 つの直交する core に分解する。

### 2.1 Content Package（platform-agnostic な"言いたいこと一式"）

1 つの "what you want to say" を、platform を問わず保持できる構造体。

```text
ContentPackage {
  coreThesis              (1 行: 全体の主張)
  readerPain              (読者が抱えている痛み / 失敗 / 誤解 / 諦め)
  reframe                 (痛みを別の見方に置き換える 1 文)
  mainMessage             (mapping 役の中心メッセージ、map 全体を表す)
  pointDecomposition[]    (4-6 個に分解された prescription、各 1 unit = 1 reply / 1 章 / 1 slide に相当)
  platformOutputs[]       (per-platform の draft / hook / カット案、§5 で定義)
  discussionQuestion      (読者に問いを返す 1 文、engagement 起点)
  CTA                     (次の行動 / フォロー / 購読 / 試行)
  repurposeNotes          (他 platform に展開するときの cut の指針)
}
```

**重要な不変条件**:

- `pointDecomposition` の各 unit は **「結論 / なぜそうなる / 失敗例 / 方法 / 注意 / 次への橋」** を持つ（§3 で詳細）
- `pointDecomposition` の数は **3 ≤ N ≤ 6**（短すぎると map が成立しない、多すぎると map が崩れる）
- `coreThesis` は brandPhilosophy と最終接続できること
- platform 固有のサイズ制限・トーンは ContentPackage には書かない（§5 の repurpose で適用）

### 2.2 Visual Package（asset の組）

1 ContentPackage に対する visual asset の組。

```text
VisualPackage {
  mainVisual              (全体 map を表す 1 枚、ContentPackage.mainMessage に対応)
  supportVisuals[]        (pointDecomposition の各 unit に対応する prescription 視覚化)
  platformVisuals[]       (X main / Threads main / note hero など platform-specific バリエーション)
  thumbnailVisuals[]      (YouTube / Shorts cover)
  inlineArticleVisuals[]  (note / Substack 本文内図解)
  socialPreviewVisuals[]  (X card / Substack social preview 等の OGP 系)
}
```

**生成ルール**:

- main + support が揃って初めて "**map + prescription**" の関係が成立する
- mainVisual は支持率の高い "中心ノード（Content Idea / coreThesis）" を含む
- supportVisuals[i] は pointDecomposition[i] と 1 対 1
- 同一 VisualPackage 内で **brandProfile / visualStyleProfile / accent color** を共有
- variation strategy（v001 / v002 / v003）は [docs/50](50-visual-prompt-quality-system.md) § 8 の 3-pattern-default を継承

### 2.3 Repurpose Engine（mapping logic）

1 ContentPackage を N platform に展開するための "切り方" の集合。

```text
RepurposeEngine {
  rules: PerPlatformRepurposeRule[]
}

PerPlatformRepurposeRule {
  platform                ('x' | 'threads' | 'note' | 'substack' | 'youtube' | 'shorts' | 'instagram' | ...)
  contentRoleMapping      (どの ContentPackage field をどう使うか)
  formLayout              (post 形 / thread 形 / article 形 / carousel 形 / vertical hook 形 ...)
  toneAdjustment          (conversational / educational / archival / trust-building / hook-driven)
  visualPolicy            (どの VisualPackage element を使うか + aspect ratio)
  densityHint             (low / medium / high; § 5 表で定義)
  CTAStyle                (soft / direct / discussion-led / subscribe-led)
  metricsToWatch          (engagement / saves / replies / forwards)
}
```

§5 の表を Repurpose Engine の **既定 rules** とみなす。

---

## 3. 404 Runner reusable success patterns

boss-provided 404 Runner Threads campaign 分析を、**reusability で 5 つに振り分け**:

### 3.1 抽出された 12 パターン

| # | パターン | 内容 |
| --- | --- | --- |
| P1 | **pain-first hook** | "うまくいかない / 誤解している" を最初に置く |
| P2 | **misconception correction** | 一般通念をやさしく否定して reframe |
| P3 | **4-point decomposition** | 全体像を 4-6 unit に切る |
| P4 | **main post as map** | 1 投稿目で全体地図を渡す |
| P5 | **one reply = one message** | 各 reply / chapter / slide は単一論点 |
| P6 | **per-unit 6-fold structure** | 各 unit が「結論 / なぜ / 失敗 / 方法 / 注意 / 橋」を持つ |
| P7 | **main visual as map** | mainVisual は全体マップ |
| P8 | **support visual as prescription** | supportVisual は各 unit の処方箋 |
| P9 | **visual hierarchy** | 1 hero + N support の階層構造 |
| P10 | **visual modules** | 視覚要素を再利用可能な module に分解 (§7 で表) |
| P11 | **review rubric** | self-review を毎 unit / 毎 visual に挟む |
| P12 | **brand philosophy at the end** | 締めで brandProfile.contentPrinciples に接続 |

### 3.2 5 axes 振り分け

| Axis | パターン | 説明 |
| --- | --- | --- |
| **A. 404 Runner-specific** | 「VO2max を訓練 / ルート図 / 体マップ / ギアチェックリスト」等の trail-running 固有語彙 | これは Hitori Media OS では使わない（§4 で写像） |
| **B. Threads-specific** | main + reply の長さ制約、conversational tone、reply のスレッド連続性 | 他 platform にはそのまま転用しない |
| **C. cross-platform reusable** | P1, P2, P3, P4, P5, P6, P11, P12 | **本 doc の core**。Content Package / Repurpose Engine の本体 |
| **D. visual-generation reusable** | P7, P8, P9, P10 | Visual Package / Layout Pattern Library（§6） |
| **E. admin-template elements** | 「promptTemplate.reviewRubric を inline」「Visual Register inbox を per-unit に並べる」 | Phase Admin 2 dashboard 統合（[docs/62](62-admin-phase-2-visual-generation-admin-design.md) § 6 candidate review UI と統合） |

**重要**:

- axis **A** は完全に置き換え対象（§4）
- axis **B** は §5 で platform mapping rule に格上げ（Threads は rule の 1 platform に過ぎない）
- axis **C / D / E** が **core**

### 3.3 unit ごとの 6-fold structure（P6 の詳細）

```text
unit_i {
  conclusion              ('結論として何が言いたいか' 1 行)
  why                     ('なぜそうなるか' の理由・原理 1-3 行)
  failureExample          ('よくある失敗 / 落とし穴' 1-3 行)
  method                  ('どうやるか' 具体的な手順 / 観点 3-5 行)
  caution                 ('やってはいけないこと / 暗黙の前提' 1-2 行)
  bridge                  ('次の unit / 次の投稿へ橋渡し' 1 行)
}
```

→ ContentPackage.pointDecomposition[i] の構造体。**6 sub-field すべてを埋めるのが品質ガード**。空欄が出る場合は unit を分割しないか統合する。

---

## 4. Hitori Media OS adaptation

### 4.1 trail-running 語彙 → Hitori Media OS 語彙への写像

| 404 Runner（trail-running） | Hitori Media OS（solo media） |
| --- | --- |
| trail runner | solo media builder |
| training plan | content workflow |
| mountain route | publishing pipeline |
| gear checklist | tool stack / prompt stack |
| body map | system map / content OS map |
| VO2max training | audience growth / production capacity |
| safety checklist | human review / secret safety / manual publish |
| race plan | launch plan / campaign plan |
| recovery | review / feedback loop |
| pacing | cadence（per-platform） |
| altitude sickness（高山病） | burnout / decision fatigue |
| gear failure | tool / API / prompt failure |
| nutrition | content sourcing / inbox flow |

### 4.2 例: ContentPackage instance

**Theme**: 「AIでひとりメディア運営OSを作っている裏側」

| ContentPackage field | 値 |
| --- | --- |
| `coreThesis` | ひとり運営は "発信" を増やすより "Content Idea を構造化して複数媒体へ展開する仕組み" を作るほうが続く |
| `readerPain` | 毎日違うネタを 0 から書くのが苦しい、媒体ごとに別物を書いている、続かない、何を書いたか思い出せない |
| `misconception` | 「もっと頑張って書けば伸びる」「AI に全部書かせれば楽になる」 |
| `reframe` | 1 つの "Content Idea" を構造化して保存し、AI を **下書き役 + 視覚化役** に限定して人間判断を残す |
| `mainMessage` | Content Idea を中心に置く運営 OS をひとりで作る |
| `pointDecomposition[]` | 4 unit（後述） |
| `discussionQuestion` | あなたは "発信" を増やしたいですか、それとも "仕組み" を増やしたいですか |
| `CTA` | building-in-public log を購読 / Substack 登録 / 同じ仕組みを作りたい人は note 記事を読む |
| `repurposeNotes` | X main = "発信より仕組み" の 1 行、Threads = 4-point map、note = full article、Substack = trust-building essay |

### 4.3 4-point decomposition（pointDecomposition[]）

| unit | title | conclusion | why | failureExample | method | caution | bridge |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **1** | Content Idea を構造化する | "ネタ" ではなく "構造化されたレコード" を持て | 1 レコード = N 媒体に展開できる素材になる | アイデアメモを naked text のまま放置 → 媒体ごとに毎回 0 から書く | claim / objection / reader / tone / platformAngles を schema 化 | 構造化が目的化して投稿が止まる | では構造化レコードを AI が読めるようにするには？ |
| **2** | AI が読める DB を作る | 人間と AI の両方が読める単一 source-of-truth を作れ | LLM input が安定し、生成品質がブレない | ChatGPT に毎回 context をコピペする / 個人 Notion に閉じる | Sanity / 構造化 JSON / Markdown DB を建てる、Slug と field を統一 | private 情報を混ぜない、AI に書き換え権を与えない | では何を AI にやらせ、何を人間に残すか？ |
| **3** | 自動化は最後にする | 仕組みが固まる前に automation を入れない | 何を自動化すべきかは運用 3 ヶ月後にしか分からない | 最初から auto-post / auto-generate を作って自分が触らなくなる / 信頼を毀損 | manual で 3 ヶ月運用 → 同じ判断を 5 回した部分だけ semi-auto 化 | 自動化を "ゴール" にしない、人間判断を消さない | では人間判断は具体的にどこで挟むか？ |
| **4** | 人間の判断を残す | review gate を毎 phase に置け | 発信物の "ねじれ" は機械では検知できない | "approve" を 1 click にして reviewer が読まずに通す | inbox → side-by-side → rubric → confirm の 4 段、approve を typing で確定 | review を AI に任せない、AI は draft までで止める | これらを 1 つの dashboard で完走できる仕組みが Hitori Media OS |

→ 各 unit が §3.3 の 6-fold structure を満たすことを確認。

### 4.4 brandPhilosophyConnection（締め）

「**仕組みを作る人ほど、判断を保留できる時間が増える**。発信を頑張るより、仕組みを作る。」

→ brandProfile.contentPrinciples 内の "manual publish maintained" / "human-in-the-loop" / "structured Content Idea" 等と垂直に整合。

---

## 5. Platform-specific mappings

`ContentPackage` を各 platform に展開する rule。Repurpose Engine の既定 rules。

### 5.1 比較表

| Platform | contentRole mapping | formLayout | toneAdjustment | visualPolicy | density | aspect ratio | CTAStyle |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **X (main)** | `coreThesis` + 1 hook + 任意 short thread | single-post or 3-5 tweet thread | hook-driven, brief | 1 strong main visual | low-medium | 16:9 or 4:5 | soft / discussion |
| **Threads (main)** | `coreThesis` + 4-point map（main post）+ pointDecomposition × replies | main + replies thread | conversational, soft | mainVisual + supportVisuals × replies | medium | 4:5 portrait | discussion-led |
| **note (article)** | full article、`pointDecomposition` を章立て、`readerPain` を導入 | long-form article | educational, archival | hero + inline diagrams × N | medium-high | 16:9 horizontal | subscribe-led |
| **Substack (post)** | email essay、`reframe` を冒頭、`pointDecomposition` を 4 章 | email-friendly essay | trust-building | header visual + 1-2 inline | medium | 16:9 or 3:1 banner | subscribe-led |
| **YouTube (thumbnail)** | `coreThesis` を 1 emotional promise に圧縮 | thumbnail | clear, promise-led | one emotional/clear typography | low | 16:9 thumbnail | (none, thumbnail) |
| **Shorts (cover)** | `reframe` 1 行 or 1 vertical hook | short vertical hook | hook-only | one visual metaphor | low | 9:16 vertical | (none, cover) |
| **Instagram (carousel)** | slide 1 = hook、slides 2..N = pointDecomposition[i]、slide N+1 = CTA | carousel N+2 slides | hook + breakdown | one cover + 4-6 unit slides + 1 CTA slide | medium-high | 4:5 or 1:1 | save-led |

### 5.2 各 platform で **保持** される core 要素

すべての platform で **以下は変えない**（ContentPackage 不変条件）:

- `coreThesis` の意味
- `pointDecomposition` の本数（3-6）と各 unit の 6-fold structure
- brandPhilosophyConnection（締め）
- "発信より仕組み" の主張

各 platform で **変わる** のは:

- 文字量 / 長さ
- visual 枚数
- tone（hook-driven / conversational / educational / trust-building）
- CTA の出し方
- aspect ratio / 縦横比

### 5.3 cross-platform 不変条件チェックリスト

| 不変条件 | チェック方法 |
| --- | --- |
| `coreThesis` がすべての output で同じ主張になっている | platformOutputs[].draft の grep で coreThesis 文 / 同義語が含まれる |
| `pointDecomposition` の数が 3-6 | record の length 確認 |
| 各 unit に 6 sub-field 全埋め | rubric 検査 |
| brandPhilosophyConnection が締めに存在 | platformOutputs[].draft の末尾 grep |
| 顔写真 / 完全自動化 / 稼げる / 保証 等 negativeStyleList を含まない | brandProfile.negativeStyleList の grep |
| platform に合った aspect ratio で visual が生成されている | VisualPackage[].aspectRatio が rule と一致 |

---

## 6. Layout Pattern Library 拡張

[docs/50](50-visual-prompt-quality-system.md) § 3 の 7 種に、404 Runner-derived と Hitori Media OS-specific を加える。

### 6.1 全体 19 種

#### 既存（docs/50）

| Pattern | use case | required modules | platform fit | avoid |
| --- | --- | --- | --- | --- |
| `centered-title-only` | 最終手段 | headline | (どこでも、ただし default にしない) | structure を語りたいとき |
| `title-with-single-diagram` | 1 章の補助図 | headline + 1 diagram | note inline / X | 構造比較 |
| `split-left-text-right-diagram` | 左右対比 | headline + diagram | note hero / Substack | 縦長 |
| `top-headline-bottom-flow` | 縦長 flow | headline + nodes ≥ 3 | Threads / note | 短文ハック |
| `grid-of-modules` | N 要素の関係 | nodes 4-6 + edges | note hero / Instagram | 1 強要素 |
| `before-after-comparison` | 比較 | left state + right state | X / note | 単一状態 |
| `architecture-stack` | layer 構造 | stacked nodes | note inline | flow / map |

#### 404 Runner-derived（5 種）

| Pattern | use case | required modules | platform fit | avoid |
| --- | --- | --- | --- | --- |
| **`centralHeroFourCards`** | main visual: 中央ノード + 4 サブカードの map | central node + 4 card modules + connectors | Threads main / note hero / Substack header | 5 個以上の units |
| **`ngOkComparison`** | NG vs OK の 2 列 | 2 columns (NG / OK) + per-row diagrams | note inline / Instagram slide | 単一状態の説明 |
| **`checklist`** | 順序のない確認項目 | check cards × N | note inline / Instagram slide | 因果 / 順序 |
| **`timeline`** | 時系列 | horizontal/vertical axis + N waypoints | note inline / YouTube chapter | 並列構造 |
| **`bodyMap`** | 人体図 / 全体マップ（trail-run 由来、抽象化すると "中心オブジェクトに複数注釈"） | central object + N annotations | note inline | 抽象概念のみ |
| **`routeMap`** | 道順 / pipeline 図 | start → waypoints → goal | note inline | 並列 |
| **`decisionChart`** | 分岐図 | decision node + branches | note inline | 単線 |

#### Hitori Media OS-specific（10 種）

| Pattern | use case | required modules | platform fit | avoid |
| --- | --- | --- | --- | --- |
| **`contentOSFlow`** | Content Idea から複数 platform 展開 | Content Idea node + 8 platform nodes + connectors | note hero / Substack header | 4 platform 未満 |
| **`hubAndSpoke`** | 中心 + N 周辺 | center + N spokes | note hero / Threads main | 階層化された情報 |
| **`workflowPipeline`** | プロセスの直線図 | nodes in pipeline | note inline | 並列 / 分岐 |
| **`dashboardMockup`** | 製品 UI 模擬 | layout grid + cards | note hero / Substack | abstract concepts |
| **`beforeAfterSystem`** | 手作業 vs OS 化 | before grid + after grid | note inline / Instagram | 単一状態 |
| **`mediaDistributionMap`** | 媒体配布の network | content hub + N media | note hero / Threads main | 単一媒体 |
| **`humanReviewFlow`** | 人間 gate 入り flow | flow + N review checkpoints | note inline | 自動化メイン |
| **`automationBoundaryMap`** | manual / semi-auto / auto の境界線 | boundary lines + zones | note hero | 全自動の強調 |
| **`readerListFunnel`** | 認知 → 購読 → 反応 のファネル | funnel + N stage labels | Substack | 並列 |
| **`publishPackageMap`** | publish package の構造 | folder tree + per-platform branches | note inline / Substack | 単一 platform |

### 6.2 platform × layout 推奨表（要約）

| Platform | 推奨 layout（上位 3） |
| --- | --- |
| X main | `title-with-single-diagram` / `hubAndSpoke` / `centered-title-only`（最終手段） |
| Threads main | `centralHeroFourCards` / `top-headline-bottom-flow` / `hubAndSpoke` |
| Threads reply | `title-with-single-diagram` / `ngOkComparison` / `checklist` |
| note hero | `contentOSFlow` / `mediaDistributionMap` / `dashboardMockup` |
| note inline | `workflowPipeline` / `humanReviewFlow` / `bodyMap`（抽象化系） |
| Substack header | `centralHeroFourCards` / `readerListFunnel` / `automationBoundaryMap` |
| YouTube thumbnail | `centered-title-only`（promise）/ `before-after-comparison` |
| Shorts cover | `centered-title-only`（hook）/ `title-with-single-diagram` |
| Instagram carousel slide 1 | `centered-title-only`（hook） |
| Instagram carousel slides 2-N | `ngOkComparison` / `checklist` / `workflowPipeline` |

---

## 7. Text-to-Visual Module Mapper

「言葉 / 概念 → どの visual module で表現するか」のマッピング表。

### 7.1 General mapping（platform agnostic）

| 概念 / 言葉 | visual module |
| --- | --- |
| number / frequency | badge / calendar / clock |
| comparison | split panel |
| process / step | arrows / steps |
| caution / warning | warning badge |
| decision / choice | branch chart |
| checklist / 項目 | check cards |
| timeline / 時系列 | horizontal axis + waypoints |
| relation / 関係 | network graph |
| hierarchy / 階層 | layered stack |
| status / state | status pill |
| quantity / 数量 | stacked bars |
| boundary / 境界 | dashed enclosure |

### 7.2 Hitori Media OS-specific mapping

| 概念 | visual module |
| --- | --- |
| Content Idea | **central node**（丸角矩形、accent 色枠） |
| platform names（X / Threads / note / Substack / YouTube / Shorts / Podcast / Instagram） | **platform cards**（同サイズ均等距離） |
| AI が読める DB | **database block**（積層シリンダ風 or grid 表現） |
| human judgment | **checkpoint badge**（チェック / 人型アイコン控えめ） |
| Visual Register | **candidate grid + review gate** |
| publish package | **folder/package block** |
| manual publish | **hand button / final gate**（押下を視覚化） |
| reader list / subscriber | **subscriber icon**（list shape） |
| automation later | **locked automation badge**（鍵アイコン控えめ） |
| Hitori Media OS | **mediaDistributionMap** layout 全体 |
| build-in-public | **buildLog pill** + **timestamp badge** |
| feedback loop | **circular arrow** |
| 4-point decomposition | **central node + 4 cards** |

### 7.3 mapper の使い方

1. ContentPackage.pointDecomposition[i].method 内の "**重要語彙**" を 1-3 個抽出
2. mapper 表で対応 visual module を引く
3. layoutPattern と組み合わせて visualPrompt を組み立てる
4. 同じ ContentPackage 内で **同じ語彙 → 同じ module** で一貫性を保つ

例: pointDecomposition[2] = "AI が読める DB を作る" → mapper で `database block` + `central node (Content Idea)` + `boundary (private / public)` → layoutPattern `beforeAfterSystem` で配置。

---

## 8. Visual Package Template v1

404 Runner Visual Package を一般化した template。

### 8.1 JSON-like スキーマ

```json
{
  "templateVersion": "v1",
  "assetPurpose": "main-visual | support-visual | platform-visual | thumbnail | inline-article | social-preview",
  "platform": "x | threads | note | substack | youtube | shorts | instagram | ...",
  "aspectRatio": "16:9 | 4:5 | 1:1 | 9:16 | 3:1",
  "contentRole": "map | prescription | hook | promise | breakdown",
  "visualGoal": "1-sentence statement of what the visual should achieve",
  "layoutPattern": "centralHeroFourCards | hubAndSpoke | ngOkComparison | ...",
  "requiredVisualModules": [
    "centralNode",
    "platformCards",
    "checkpointBadge"
  ],
  "textHierarchy": {
    "headlineSizeHint": "large | xl | xxl",
    "subtitleSizeHint": "small | xs",
    "nodeLabelSizeHint": "medium | small",
    "density": "sparse | balanced | dense",
    "paragraphCount": 1
  },
  "illustrationPolicy": {
    "iconAllowed": true,
    "iconMaxCount": 4,
    "faceAllowed": false,
    "humanFigureAllowed": false,
    "metaphorAllowed": "single | none"
  },
  "iconPolicy": {
    "style": "geometric-line | filled-flat | sketch-light",
    "preferred": ["checkpoint", "platform-card", "node", "boundary"],
    "forbidden": ["robot", "brain", "ai-chip", "neon", "glass-flare"]
  },
  "colorPolicy": {
    "baseColor": "#FAFAFA",
    "primaryTextColor": "#1F2A44",
    "accentColor": "#D08A3C",
    "allowedAccents": ["#D08A3C", "#E5B486"],
    "forbiddenColorEffects": ["gradient-overload", "neon", "glass"]
  },
  "density": "low | medium | high",
  "variationStrategy": {
    "default": "3-pattern-default",
    "variants": ["diagram-first", "typography-hybrid", "metaphor-mix"]
  },
  "forbiddenPatterns": [
    "face-photo",
    "ai-clone-face",
    "robot",
    "brain-icon",
    "completely-automated-messaging",
    "earn-money-promises",
    "logo-marks"
  ],
  "reviewRubric": [
    {"criterion": "headline readable in preview crops", "weight": 3},
    {"criterion": "tone matches campaign style anchor", "weight": 3},
    {"criterion": "decoration density 1 step below note hero", "weight": 2},
    {"criterion": "diagram nodes >= 2 unless layoutPattern == centered-title-only", "weight": 3},
    {"criterion": "no face/robot/brain/neon/gradient overload", "weight": 5},
    {"criterion": "no secret/project id/private path/url/token visible", "weight": 5},
    {"criterion": "no paid PDF content copied", "weight": 5}
  ],
  "referenceStyleAnchors": [
    "assets/visuals/<slug>/shared/campaign-hero-v1.png",
    "assets/visuals/<slug>/<platform>/<placement>/<asset>.png"
  ],
  "outputPaths": {
    "inbox": "assets/inbox/generated/<contentSlug>/<assetSlug>/v00N.png",
    "final": "assets/visuals/<contentSlug>/<platform>/<placement>/<assetSlug>.png",
    "publishPackage": "publish-packages/<platform>/<contentSlug>/images/<assetSlug>.png"
  }
}
```

### 8.2 generalization の意味

- 404 Runner Visual Package Template の `bodyMap` / `routeMap` 等は **layoutPattern enum** の 1 値に格下げ
- trail-running 固有語彙は `requiredVisualModules` から **完全排除**
- Hitori Media OS 固有モジュール（centralNode / platformCards / checkpointBadge 等）は §7 の mapper から `requiredVisualModules` に引く
- review rubric は brandProfile.negativeStyleList を継承

---

## 9. Content Package Template v1

```json
{
  "templateVersion": "v1",
  "topic": "string (1 行)",
  "targetAudience": "string (誰に向けて)",
  "readerPain": "string (痛み 1-3 行)",
  "misconception": "string (誤解 1-2 行)",
  "reframe": "string (置き換え 1-2 行)",
  "coreThesis": "string (主張 1 行)",
  "pointDecomposition": [
    {
      "title": "string",
      "conclusion": "string",
      "why": "string",
      "failureExample": "string",
      "method": "string",
      "caution": "string",
      "bridge": "string"
    }
  ],
  "evidenceOrExamples": [
    {"claim": "string", "evidence": "string", "source": "internal | external"}
  ],
  "platformPlan": {
    "x": {"enabled": true, "draftHint": "string", "visualHint": "string"},
    "threads": {"enabled": true, "draftHint": "string", "visualHint": "string"},
    "note": {"enabled": true, "draftHint": "string", "visualHint": "string"},
    "substack": {"enabled": true, "draftHint": "string", "visualHint": "string"},
    "youtube-thumbnail": {"enabled": false},
    "shorts-cover": {"enabled": false},
    "instagram-carousel": {"enabled": false}
  },
  "visualPlan": {
    "mainVisualLayoutPattern": "centralHeroFourCards | hubAndSpoke | ...",
    "supportVisualsCount": 4,
    "variationStrategy": "3-pattern-default"
  },
  "CTA": "string (次の行動 1-2 行)",
  "discussionQuestion": "string (問い 1 行)",
  "repurposeTargets": ["x", "threads", "note", "substack"],
  "brandPhilosophyConnection": "string (締め、brandProfile.contentPrinciples と接続)"
}
```

### 9.1 generalization rule

- pointDecomposition[i] は 3-6 個、各 unit は 6 sub-field 必須
- platformPlan の key は `selectedPlatforms` enum（[docs/49](49-platform-selection-model.md)） と整合
- visualPlan は §8 の Visual Package Template に紐づく
- brandPhilosophyConnection は brandProfile.contentPrinciples のうち少なくとも 1 件を参照

---

## 10. Prompt Template implications

既存 `promptTemplate` schema（[docs/47](47-prompt-template-system.md)）の **どの category** で何を扱うか。

### 10.1 既存 promptTemplate category への配置

| Generation 種別 | promptTemplate category（既存）| 既存で足りるか |
| --- | --- | --- |
| content package generation | `text-draft` の親として `content-package` を新規追加 | 不足（新規 category 必要） |
| platform output generation（X / Threads / note / Substack draft） | `text-draft` | 足りる（既存） |
| visual package generation（layout 構成） | `image-prompt-blueprint` を新規追加（既存 `image-generation` の手前） | 不足（新規 category 必要） |
| image candidate generation | `image-generation` | 足りる（既存） |
| visual review summary | `review-rubric` を新規追加 | 不足（新規 category 必要） |
| repurpose generation | `repurpose` を新規追加 | 不足（新規 category 必要） |

### 10.2 提案 schema（active 化なし、本 batch は sketch も書かない）

[docs/62](62-admin-phase-2-visual-generation-admin-design.md) § 8 で提案済の 7 件に **本 doc で追加** する候補:

| 追加提案 schema | 主目的 | 既存で足りない理由 | 着手 phase |
| --- | --- | --- | --- |
| **`contentPackage`** | ContentPackage を Sanity record として保持 | campaignPlan は "1 contentIdea × N platform の orchestration"、ContentPackage は "ContentIdea + decomposition + repurpose 計画" でレイヤーが違う | Phase 2A sketch / Phase 3 activate |
| **`visualPackage`** | VisualPackage を 1 record で保持（main + supports + platform variants） | visualAssetPlan は asset 単体記録、複数 asset を束ねる record が無い | Phase 2B sketch / Phase 3 activate |
| **`layoutPatternPreset`**（既出、[docs/62](62-admin-phase-2-visual-generation-admin-design.md) § 8.2 と同一） | 19 layout pattern を preset として持つ | enum だけでは require/forbid modules を表現できない | Phase 2D |
| **`textToVisualMapper`** | 概念 → visual module の対応表を record 化 | brandProfile.visualVocabulary に書くと膨らみすぎ | Phase 2D |
| **`generationRun`** | 1 generation の record（contentPackage / visualPackage / candidate のいずれにも対応） | filesystem 分散の record を 1 行に | Phase 2B+ |
| **`visualCandidate`**（既出） | 1 candidate を database 化 | review-manifest.json では SaaS で持たない | Phase 2B read / Phase 2C write |

[docs/62](62-admin-phase-2-visual-generation-admin-design.md) § 8 提案 7 件 + 本 doc で追加 4 件（contentPackage / visualPackage / textToVisualMapper / generationRun）= **計 11 件** が将来 design 候補。

### 10.3 既存 schema を **破壊的変更しない**

- `promptTemplate` の category enum 拡張は **add-only**（既存値を消さない）
- `brandProfile` / `visualStyleProfile` は不変
- `campaignPlan` は `contentPackage` への参照 field を将来追加（破壊なし、optional）
- `visualAssetPlan` は `visualPackage` への参照 field を将来追加（破壊なし、optional）

---

## 11. Dashboard integration implications

[docs/62](62-admin-phase-2-visual-generation-admin-design.md) § 5 の route 提案に、本 doc 由来の追加 route。

### 11.1 提案 route（未実装）

| Route | 目的 | data source | phase |
| --- | --- | --- | --- |
| `/content-packages` | ContentPackage 一覧 | Sanity (after `contentPackage` activation) | Phase 3 |
| `/content-packages/[slug]` | 1 package の detail（coreThesis / pointDecomposition / repurpose） | Sanity | Phase 3 |
| `/content-packages/[slug]/platforms` | per-platform output mapping view | Sanity + filesystem | Phase 3 |
| `/content-packages/[slug]/visuals` | VisualPackage 全 asset の overview | Sanity + filesystem | Phase 3 |
| `/visual-generation` | generation runs 横断 view | Sanity (after `generationRun` activation) | Phase 2B+ |
| `/visual-generation/runs/[id]` | 1 run の detail | Sanity / filesystem | Phase 2B+ |
| `/settings/layout-patterns` | 19 layout pattern preset の view + 推奨 platform / module | Sanity (after `layoutPatternPreset`) | Phase 2D |
| `/settings/design-profiles` | brand × style × layout preset selector | Sanity | Phase 2A / 2D |

### 11.2 既存 route との関係

- `/visual-assets`（既存）は **asset 単体 listing** のまま、本 doc では変更しない
- `/visual-review/inbox`（[docs/62](62-admin-phase-2-visual-generation-admin-design.md) 提案）は **candidate 単位の review**
- 本 doc の `/visual-generation/*` は **generation run（job）単位の view**
- `/content-packages/*` は **ContentPackage 単位の orchestration**

各 view は階層を持つ:

```
ContentPackage (主張一式)
  └─ VisualPackage (asset の組)
       └─ visualAssetPlan (asset 単体)
            └─ visualCandidate (v00N candidate)
                 └─ generationRun (1 生成 job)
```

dashboard route はこの階層に沿って読み口を提供。

### 11.3 本 batch で実装しない

route 設計のみ。component / GROQ / filesystem reader / API endpoint は **Phase 2A 実装 batch** で個別に design。

---

## 12. Test case — "AIでひとりメディア運営OSを作っている裏側"

§4 で挙げた example をフル展開した動作確認。

### 12.1 ContentPackage summary

| field | 値（要約） |
| --- | --- |
| topic | AIでひとりメディア運営OSを作っている裏側 |
| targetAudience | ひとりで発信を続けている書き手 / クリエイター / engineer-creator |
| readerPain | 毎日違うネタを 0 から書くのが苦しい、媒体ごとに別物を書いている、続かない、過去投稿を思い出せない |
| misconception | "もっと頑張って書けば伸びる" / "AI に全部書かせれば楽になる" |
| reframe | 1 つの Content Idea を構造化レコードとして持ち、AI を下書き + 視覚化に限定、人間判断を残す |
| coreThesis | ひとり運営は **発信を増やす**より、**Content Idea を構造化して仕組みに変える**ほうが続く |
| pointDecomposition | 4 unit（§4.3 で詳細） |
| CTA | building-in-public log を購読 / Substack 登録 / 同じ仕組みを作りたい人は note 記事を読む |
| discussionQuestion | あなたは "発信" を増やしたいですか、それとも "仕組み" を増やしたいですか |
| brandPhilosophyConnection | 仕組みを作る人ほど、判断を保留できる時間が増える |

### 12.2 X mapping

| 要素 | 値 |
| --- | --- |
| formLayout | single main + optional 3-tweet thread |
| main hook（X） | 「発信を頑張るより、仕組みを作る。」 |
| thread（任意） | unit 1 / 2 / 3 / 4 の conclusion を 1 行ずつ |
| visualPolicy | mainVisual 1 枚（`hubAndSpoke` or `centralHeroFourCards`） |
| aspect ratio | 16:9 or 4:5 |
| CTAStyle | soft（"続きは note で") |
| tone | hook-driven, brief |

### 12.3 Threads mapping

| 要素 | 値 |
| --- | --- |
| formLayout | main + 4 reply |
| main post | coreThesis + 4-point map（「① 構造化 ② AI が読める DB ③ 自動化は最後 ④ 人間判断を残す」を 4 行で） |
| reply 1 | unit 1 の 6-fold structure を会話調で |
| reply 2-4 | 同様、unit 2 / 3 / 4 |
| visualPolicy | mainVisual = `centralHeroFourCards`（中央 Content Idea + 4 card）、reply 1-4 = supportVisual × 4（layoutPattern は `ngOkComparison` / `workflowPipeline` 等を unit ごとに選ぶ） |
| aspect ratio | 4:5 portrait |
| CTAStyle | discussion-led（"あなたはどう？" を最後に） |
| tone | conversational, soft |

### 12.4 note mapping

| 要素 | 値 |
| --- | --- |
| formLayout | long article（章立て 4 + 導入 + 締め） |
| 導入 | readerPain → misconception → reframe |
| 章 1-4 | pointDecomposition[i] の 6-fold structure を full article 化、各章末に discussionQuestion 風の問い |
| 締め | brandPhilosophyConnection + CTA |
| visualPolicy | hero（`contentOSFlow` or `mediaDistributionMap`）+ inline 4 枚（unit ごとに `humanReviewFlow` / `automationBoundaryMap` / `workflowPipeline` 等） |
| aspect ratio | 16:9 horizontal |
| CTAStyle | subscribe-led（Substack / RSS） |
| tone | educational, archival |

### 12.5 Substack mapping

| 要素 | 値 |
| --- | --- |
| formLayout | email-friendly essay |
| 冒頭 | reframe 1 段 + readerPain への共感 |
| 中盤 | pointDecomposition 4 章を essay 形（unit ごとに 200-400 字） |
| 締め | brandPhilosophyConnection + 次回予告 |
| visualPolicy | header visual（`readerListFunnel` or `centralHeroFourCards`）+ inline 1-2（`automationBoundaryMap` / `humanReviewFlow`） |
| aspect ratio | 16:9 or 3:1 banner |
| CTAStyle | subscribe-led |
| tone | trust-building |

### 12.6 Visual Package plan

| asset | role | layoutPattern | aspect | platform |
| --- | --- | --- | --- | --- |
| `main-visual` | map（全体） | `centralHeroFourCards` | 4:5 | shared / Threads main |
| `support-1-content-idea-structure` | prescription（unit 1） | `workflowPipeline` | 4:5 | Threads reply 1 |
| `support-2-ai-readable-db` | prescription（unit 2） | `beforeAfterSystem` or `ngOkComparison` | 4:5 | Threads reply 2 |
| `support-3-automation-later` | prescription（unit 3） | `automationBoundaryMap` | 4:5 | Threads reply 3 |
| `support-4-human-judgment` | prescription（unit 4） | `humanReviewFlow` | 4:5 | Threads reply 4 |
| `x-hook-main` | hook | `hubAndSpoke` | 16:9 | X main |
| `note-hero` | map（記事冒頭） | `contentOSFlow` | 16:9 | note hero |
| `note-inline-1..4` | 各章の inline | unit に応じて | 16:9 | note inline |
| `substack-header` | trust banner | `readerListFunnel` | 3:1 | Substack |

### 12.7 Recommended layout patterns（要約）

```
mainVisual:        centralHeroFourCards
support unit 1:    workflowPipeline
support unit 2:    beforeAfterSystem or ngOkComparison
support unit 3:    automationBoundaryMap
support unit 4:    humanReviewFlow
X hook:            hubAndSpoke
note hero:         contentOSFlow
Substack header:   readerListFunnel
```

### 12.8 Candidate variation plan

各 visual asset で `3-pattern-default`（v001 / v002 / v003）を採用。例: `support-3-automation-later`:

| variant | layoutPattern |
| --- | --- |
| v001 diagram-first | `automationBoundaryMap`（zone を強調） |
| v002 typography-hybrid | `title-with-single-diagram`（"自動化は最後にする" 大見出し + 小図） |
| v003 metaphor-mix | `automationBoundaryMap` + `locked automation badge`（鍵アイコン控えめ） |

variation strategy は §8 の Visual Package Template に従う。Codex `image_gen` 起動は本 batch ではしない。

---

## 13. 連番について

- docs: 62 → **63**
- devlog: 0109 → **0110**
- handoff: 0120 → **0121**

---

## 14. 安全性（本 batch、design-only）

- schema 変更: **0 件**（既存 5 件不変、提案 11 件は active 化なし / sketch なし）
- code 変更: **0 件**（dashboard / tools / sanity.config / proxy.ts 全て不変）
- assets 変更: **0 件**
- patches 変更: **0 件**
- Sanity mutation: **0 件**
- 画像生成 / Codex CLI 起動: **0 件**
- 新規パッケージ: **0 件**
- Auth 実装: **0 件**
- 環境変数変更 / Vercel UI 操作: **0 件**
- deployment: **0 件**
- 既存 production dashboard 挙動: **不変**
- 既存 Visual Register 挙動: **不変**

---

## 15. Phase Admin 2 への影響

[docs/62](62-admin-phase-2-visual-generation-admin-design.md) との関係:

| 領域 | docs/62 | 本 doc（63） |
| --- | --- | --- |
| dashboard の inbox / candidate review 設計 | ✓ | 不変 |
| schema 提案（7 件） | ✓ | 4 件追加（contentPackage / visualPackage / textToVisualMapper / generationRun） |
| layout pattern 一覧 | 17 種 | 19 種に拡張（404 Runner-derived 5 + Hitori OS 10 + 既存 7 を統合再整理） |
| Codex integration | Option A 推奨 | 本 doc では触らず（docs/62 § 9 に従う） |
| Auth | 別 doc 候補（docs/64 へ繰り上げ） | 触らず |
| Repurpose Engine | 言及なし | **本 doc の新規** |
| ContentPackage 概念 | 言及なし | **本 doc の新規** |

→ Phase 2A 実装着手前に本 doc を踏まえた **wireframe / GROQ / API 設計 batch** が望ましい（[docs/64](#) 候補、本 doc とは独立）。

---

## 16. Recommended next batch

| 候補 | 内容 | 推奨タイミング |
| --- | --- | --- |
| **A. Phase 2A wireframe batch** (`docs/64`) | candidate review UI の component / GROQ / dev-only API 設計 | Phase 2A 実装着手前 |
| **B. Auth Migration Design** (`docs/65` に繰り下げ) | Basic Auth → real Auth、Phase 2C 着手前に必須 | Phase 2C 着手前 |
| **C. ContentPackage / VisualPackage proposed sketch** (`schemas/proposed/contentPackage.ts` ほか) | 本 doc の提案 schema を sketch 化（active 化なし） | Phase 3 着手前に判断 |
| **D. Production Visual Generation Batch 続行** | note-inline-content-os-flow-v1 の v001/v002/v003、Visual Register inbox review | Phase 2 設計と独立、運用フェーズ |
| **E. ContentPackage 1 件を seed JSON で書く** | §12 の test case を `seed/content-packages/<slug>.json` に保存（active 化なし、JSON だけ） | 本 doc 提案の妥当性検証 |

優先度: **A** または **E** が次に来る価値が高い。**B** は Phase 2C 着手 trigger が立つまで保留可能。
