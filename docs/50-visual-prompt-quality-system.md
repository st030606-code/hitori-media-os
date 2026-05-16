# 50 — Visual Prompt Quality System (design)

Date: 2026-05-14
Status: **design-only, no schema activation**
Scope: 「text-only title card」だけが量産される失敗を防ぐ visual generation 設計。

## 1. 観察された失敗モード

building-hitori-media-os の `x-hook-main-v1/v001.png`（Codex `image_gen` 経由）は **採用可レベル**だったが、構造的には:

- 中央に大きな日本語見出し1つ
- 下に小さな subtitle 1行
- 図解 / アイコン / シンボルが**ゼロ**
- 装飾要素も**ゼロ**

…つまり「**text-only title card**」だった。これは安全 = 安全だが、X timeline で「**ただの引用カード**」に見える危険がある。Hitori Media OS の visual は本来:

- 構造図（ノード + 矢印）
- typography hierarchy
- 控えめだが意味のある icon / metaphor

の組み合わせで読者の「これは何かのシステムだ」という直感を 1 秒で伝えるべき。
text-only に偏るのは **prompt が text-centric 制約を強く書きすぎている**結果。

## 2. 求める visual prompt の構造

generation prompt は **2 axes × N modules** で組み立てる:

```text
A. layoutPattern        ← 全体構図のテンプレ
B. visualModuleSet      ← 入れる要素のセット
C. typographyHierarchy  ← 文字の階層と密度
D. brandProfile         ← 色 / font / ノード形状
E. negativePatterns     ← 排除する装飾 / 表現
F. reviewRubric         ← 自己レビューの観点
```

これらを `visualStyleProfile` + `promptTemplate (category: image-generation)` の組み合わせで毎回 fill する。

## 3. layoutPattern enum（候補）

| 値 | 説明 |
| --- | --- |
| `centered-title-only` | text-only title card。**最終手段**、デフォルトにしない |
| `title-with-single-diagram` | 中央に見出し、下に 1 つの簡潔な構造図 |
| `split-left-text-right-diagram` | 左 50% に見出し、右 50% に構造図 |
| `top-headline-bottom-flow` | 上に hook 1 行、下に 3〜5 ノードの flow |
| `grid-of-modules` | 等サイズノード 4〜6 個の関係図 |
| `before-after-comparison` | 左右 / 上下に対比 2 状態 |
| `architecture-stack` | 縦に積み上げた layer 図 |

デフォルトで `centered-title-only` を選ばない。1 platform × 1 assetType につき 1 layoutPattern を明示。

## 4. visualModuleSet（毎回 fill する要素）

```text
visualModuleSet {
  headline                (string, 必須)
  subtitle                (string, 任意)
  diagramNodes            (array<{label, role}>, 推奨)
  diagramEdges            (array<{from, to, label}>, 推奨)
  iconHints               (array<string>, 控えめな metaphor, 任意)
  bracketingLine          (string, 任意; "Hitori Media OS / development log" など)
  watermarkOrTag          (string, 任意; "building-in-public"等)
}
```

`diagramNodes` を **空にできるのは `centered-title-only` の時だけ**。それ以外の layoutPattern では minimum 2 nodes を要求。

## 5. typographyHierarchy

```text
typographyHierarchy {
  headlineSizeHint        (large / xl / xxl)
  subtitleSizeHint        (small / xs)
  nodeLabelSizeHint       (medium / small)
  density                 (sparse / balanced / dense)
  lineHeightHint          (tight / normal / relaxed)
  paragraphCount          (1 / 2 / 3)
}
```

text-only に陥らないため、**density が `sparse` のときは必ず diagramNodes ≥ 2** を併用するルール。

## 6. brandProfile（参照される側）

詳細は [`schemas/proposed/_design-brandProfile.md`](../schemas/proposed/_design-brandProfile.md)。

visual prompt が引く要素:

- `defaultBaseColor` / `defaultAccentColor`
- `defaultFontFamily`
- `defaultNodeShape`（rounded-square / circle / hexagon / pill）
- `defaultLineWeight`（hairline / thin / regular）
- `decorationDensity`（minimal / restrained / standard）
- `negativeStyleList`（共通の禁止: AI brain icon / robot / glass flare / gradient overload）

## 7. visualStyleProfile（asset 種別ごとの style anchor）

詳細は [`schemas/proposed/_design-visualStyleProfile.md`](../schemas/proposed/_design-visualStyleProfile.md)。

`brandProfile` が「人格 / トーン」、`visualStyleProfile` が「**この asset 種別はこう描く**」の固有設定:

- 1 visualStyleProfile = 1 assetType（hero / inline / hook-image / thumbnail / carousel-cover）
- `referenceImagePaths`（採用候補の history、style anchor として参照）
- `layoutPattern` の default
- `requiredModules`（diagramNodes など）
- `acceptanceThreshold`（reviewRubric の minimum score）

## 8. variationStrategy — 標準 3 候補

1 つの asset を生成するとき、**1 候補で終わらせない**。3 候補を別 pattern で出してから人間が選ぶ。

```text
variationStrategy = "3-pattern-default"

→ candidate v001: diagram-first
    layoutPattern = top-headline-bottom-flow or grid-of-modules
    diagramNodes ≥ 3
    typography density = balanced

→ candidate v002: typography + diagram hybrid
    layoutPattern = title-with-single-diagram or split-left-text-right-diagram
    diagramNodes 2〜3
    headline large + 1 supporting node

→ candidate v003: diagram + light illustration / metaphor
    layoutPattern = grid-of-modules or before-after-comparison
    iconHints 1〜2
    metaphor: file / node / flow（顔写真や robot は禁止）
```

3 候補すべてが `centered-title-only` に倒れるのは **prompt template の欠陥**として扱い、template の `successCriteria` で reject する。

## 9. self-review before saving（Codex 側 / ChatGPT 側に課す）

`promptTemplate.reviewRubric` を runtime で適用:

```text
reviewRubric = [
  {criterion: "headline readable in X preview crop (1.91:1 / 1:1)", weight: 3, passThreshold: pass},
  {criterion: "tone matches campaign-hero-v1.png", weight: 3, passThreshold: pass},
  {criterion: "decoration density 1 step lower than note hero", weight: 2, passThreshold: pass},
  {criterion: "diagram nodes ≥ 2 (unless layoutPattern == centered-title-only)", weight: 3, passThreshold: pass},
  {criterion: "no face / robot / AI brain / glass flare / gradient overload", weight: 5, passThreshold: pass},
  {criterion: "no secret / project ID / private path", weight: 5, passThreshold: pass},
  {criterion: "no paid PDF content copy", weight: 5, passThreshold: pass},
]
```

Codex `image_gen` を呼ぶ前に rubric を prompt に inline、終了前に self-check して落第なら **placeholder で埋めず stop**。

## 10. Visual Register は依然 human approval gate

- self-review はあくまで「Codex 側の最低限の sanity check」
- **採用判断は人間 + Visual Register Inbox Review**
- 採用された candidate は `visualStyleProfile.referenceImagePaths` に追加され、次回の style anchor になる

## 11. Adopted candidates → style anchors

採用フロー:

```
1. v001/v002/v003 を inbox に保存
2. 人間 Visual Register で承認
3. patch JSON が生成、final path に copy
4. (automated) visualStyleProfile.referenceImagePaths に当該 final path を append
5. 次の同 assetType 生成時、(4) の history が prompt に inline される
```

これによって「採用された style anchor」が campaign 横断で蓄積し、Hitori Media OS の visual vocabulary が時間と共に固まる。

## 12. 失敗ケースの再発防止策まとめ

| 失敗 | 防止策 |
| --- | --- |
| text-only title card のみ | `layoutPattern` を template で固定し、`centered-title-only` 以外をデフォルト化 |
| 顔写真 / AI 脳 icon 混入 | `brandProfile.negativeStyleList` を毎回 prompt に inline |
| tone が campaign 内でバラつく | `visualStyleProfile.referenceImagePaths` を style anchor として参照 |
| 採用判断のブレ | `reviewRubric` を Visual Register Inbox Review にも表示 |
| paid PDF 引用混入 | rubric に "no paid PDF content copy" を毎回明示 + Codex prompt の Hard Rules |

## 13. Out of scope

- 既存 `visualAssetPlan` の破壊的変更（imagePrompt / visualDirection は維持）
- LLM 自動 prompt-improvement loop
- paid image generation API integration
- 顔写真ワークフロー（別バッチで扱う）

## 14. 次バッチへの推奨

1. `schemas/proposed/visualStyleProfile.ts` を sketch（active 化なし）
2. `schemas/proposed/brandProfile.ts` を sketch（active 化なし）
3. building-hitori-media-os 用に brandProfile / visualStyleProfile の seed を 1〜2 件試作
4. `tasks/visuals/.../codex-exec-prompt.md` template に `layoutPattern` / `variationStrategy` / `reviewRubric` 節を追加（既存 `x-hook-main-v1/codex-exec-prompt.md` を style anchor）
5. Visual Register UI 側で `reviewRubric` を表示できる準備（このバッチでは設計のみ、実装は分離）
