# 65 — Inbox Candidate Frontmatter Contract (design + applied)

Date: 2026-05-18
Status: **contract-defined / applied to 4 existing inbox files / dashboard parser unimplemented**
Scope: `assets/inbox/generated/<campaignSlug>/<assetSlug>/prompt.md` および同 folder の `review.md` に書く YAML frontmatter の **正式契約**。本 doc が dashboard Phase 2A の parser の唯一の reference。

本 doc は [docs/64 §14](64-admin-phase-2a-visual-review-wireframe.md#14-phase-2a-frontmatter-spec補足phase-2a-1-で確定) の提案を **applied + contract 化** したもの。Auth 設計（旧 docs/65 候補）は引き続き保留、別 doc に繰り下げ。

---

## 1. なぜ frontmatter が必要か

### 1.1 dashboard が candidate を理解するための入口

Phase Admin 2A の candidate review UI（[docs/64](64-admin-phase-2a-visual-review-wireframe.md)）は、`assets/inbox/generated/<slug>/<asset>/` を読んで:

- どの campaign / asset に属する candidate か
- 何枚（v001 / v002 / v003）あり、それぞれ何 variant か
- どの style anchor / layout pattern / required modules / forbidden patterns が前提か
- self-review が記録済みか、recommended candidate は誰か

…を 1 fetch で組み立てる必要がある。`prompt.md` / `review.md` の **本文** を NLP で parse すると壊れやすいので、構造化された前文（frontmatter）を「契約」として固定する。

### 1.2 既存「素のテキスト」のリスク

frontmatter 無しの状態:

- title 行に campaignSlug が入っているかも・入ってないかも
- variant 名のスペル揺れ（diagram-first / diagramfirst / Diagram First）
- 候補数の検出は `ls v00*.png` に頼るしかない
- styleAnchors を本文 prose から拾うのが脆い
- humanDecision / recommendedCandidate を text で書くと bot にとって unparse-able

→ contract 化により、parser が **本文を読まなくても candidate metadata を確定** できる。

### 1.3 future schema との contract

将来 `visualCandidate` / `visualGenerationRun` schema が Sanity active 化されたとき、本 contract は **そのまま Sanity field と 1-to-1 mapping** にできる構造で書く。Sanity 化を急がなくても、filesystem manifest として contract が安定なら、後から schema 化しやすい（§7 で mapping）。

---

## 2. `prompt.md` frontmatter schema

### 2.1 必須 fields

| field | type | description | example |
| --- | --- | --- | --- |
| `campaignSlug` | string | content / campaign の slug | `building-hitori-media-os` |
| `assetSlug` | string | asset の slug（folder 名と一致） | `threads-support-diagram-v1` |
| `visualAssetPlanId` | string | Sanity の `visualAssetPlan._id` | `visualAssetPlan.building-hitori-media-os.threads-support-diagram-v1` |
| `assetPurpose` | string | asset の役割（自然語タグ） | `social-support-diagram` / `inline-diagram` / `hero` / `header-banner` / `thumbnail` / `cover` |
| `platform` | enum string | 対象 platform | `x` / `threads` / `note` / `substack` / `youtube` / `shorts` / `instagram` / `podcast` |
| `aspectRatio` | string | `width:height` 形 | `4:5` / `16:9` / `1:1` / `9:16` / `3:1` |
| `candidateStrategy` | array of `{id, variant}` | 計画されている candidate と variant ラベル | `[{id: v001, variant: diagram-first}, ...]` |

### 2.2 推奨 fields（dashboard UI で読む）

| field | type | description |
| --- | --- | --- |
| `pixelSize` | string `WxH` | `1080x1350` 等 |
| `styleAnchors` | array of repo-relative paths | 参考にした採用済 visual の path |
| `layoutPatterns` | array of strings | 使用候補の layout pattern（[docs/63 §6](63-cross-platform-content-visual-generation-core.md#6-layout-pattern-library-拡張) の 19 種 enum） |
| `requiredVisualModules` | array of strings | 必須 module（[docs/63 §7](63-cross-platform-content-visual-generation-core.md#7-text-to-visual-module-mapper) Mapper の右辺） |
| `forbiddenPatterns` | array of strings | 禁止表現（text-only-title-card / robot-brain-cliche / neon-ai-glassmorphism / unreadable-small-text / …） |
| `phase` | string | 本 file を update した phase（`phase-admin-2a-prep` 等） |

### 2.3 任意 fields

| field | type | description |
| --- | --- | --- |
| `generator` | string | 生成 tool 名 / version（`codex-cli-0.120.0` 等） |
| `batch` | string | devlog / production batch id |
| `date` | YYYY-MM-DD | 最終更新日 |
| `notes` | string | 自由記述メモ |

### 2.4 candidateStrategy[i] の構造

```yaml
candidateStrategy:
  - id: v001           # required: ^v\d{3}$
    variant: diagram-first  # required: 自然語タグ、Phase 2A 想定は diagram-first / typography-hybrid / metaphor-mix の 3-pattern-default
    layoutPattern: top-headline-bottom-flow  # optional, candidate 個別の layout を上書きするとき
    notes: ""                                # optional
```

`id` は **連番** で v001 から開始。**上書きしない**（採用後も削除しない）。

---

## 3. `review.md` frontmatter schema

### 3.1 必須 fields

| field | type | description | example |
| --- | --- | --- | --- |
| `campaignSlug` | string | (same as prompt.md) | `building-hitori-media-os` |
| `assetSlug` | string | (same as prompt.md) | `threads-support-diagram-v1` |
| `visualAssetPlanId` | string | (same as prompt.md) | `visualAssetPlan....` |
| `reviewStatus` | enum string | review 全体の状態 | `candidate-review` / `awaiting-review` / `review-in-progress` / `review-done` |
| `rubricScale` | string | "1-5" 等 | `1-5` |
| `rubricMaxScore` | integer | rubric 合計の最大 | `35`（[docs/64 §10](64-admin-phase-2a-visual-review-wireframe.md#10-candidate-scoring-display)） |
| `rubricAxes` | array of strings | 7 axes の id（camelCase） | `[diagramRichness, clarityReadability, japaneseLegibility, brandConsistency, platformFit, notTextOnly, publishSaveUsability]` |
| `candidateScores` | object keyed by `v00N` | 各 candidate の score / variant / notes | (§3.4) |

### 3.2 推奨 fields

| field | type | description |
| --- | --- | --- |
| `recommendedCandidate` | string or `null` | Codex / human が暫定推しとした候補 id（`v003` 等）。未決定は `null` |
| `humanDecision` | enum string or `null` | 最終決定（`approve:v003` / `regenerate` / `reject:all` / `null`） |
| `phase` | string | 本 file を update した phase |

### 3.3 任意 fields

| field | type | description |
| --- | --- | --- |
| `disagreementBanner` | boolean | codex self-review と human override の差が大きい場合 |
| `regenerationReason` | string | 再生成依頼の根拠 |

### 3.4 candidateScores[id] の構造

```yaml
candidateScores:
  v001:
    variant: diagram-first
    score: null                  # null | integer 0-35
    notes: ""                    # 自由記述、Codex self-review の要約 or human notes
    axisScores:                  # optional, axis 別の score
      diagramRichness: null
      clarityReadability: null
      japaneseLegibility: null
      brandConsistency: null
      platformFit: null
      notTextOnly: null
      publishSaveUsability: null
    reviewer: null               # optional, codex | human | both | null
    reviewedAt: null             # optional, ISO 8601
```

→ Phase 2A では `score` / `axisScores` / `reviewer` / `reviewedAt` は **null のままで OK**（dashboard で human がまだ入力していない状態）。Phase 2B で input form 解禁時に書き込み。

---

## 4. dashboard Phase 2A での parse 方法

### 4.1 parse 戦略

dashboard `dashboard/src/lib/inboxReader.ts` 内（Phase 2A-1 実装、本 batch では未実装）:

1. ファイル先頭が `---\n` で始まるか確認
2. 次の `\n---\n` までを YAML として parse（軽量 parser、依存 0 で書ける、または既存 `yaml` lib を使う）
3. parse 成功 → frontmatter object を return、body は `---` 以降の string
4. parse 失敗 / frontmatter 不在 → graceful degrade（§5）

### 4.2 minimal parser（依存 0 で実装可能）

```ts
// dashboard/src/lib/frontmatter.ts （未実装、本 batch では概念のみ）
export function splitFrontmatter(raw: string): {
  frontmatter: string | null
  body: string
} {
  if (!raw.startsWith('---\n')) return {frontmatter: null, body: raw}
  const end = raw.indexOf('\n---\n', 4)
  if (end < 0) return {frontmatter: null, body: raw}
  return {
    frontmatter: raw.slice(4, end),
    body: raw.slice(end + 5),
  }
}
```

YAML parse は既存依存（`yaml` / `js-yaml` / 自前 minimal parser）で選ぶ。本 batch では選定しない、Phase 2A-1 着手時に決定。

### 4.3 Sanity / future schema との関係

dashboard は **filesystem frontmatter を first-class** と扱い、Sanity は metadata の "正本" として **将来同期** する想定:

```
filesystem (prompt.md / review.md frontmatter)
   ↓ parse
in-memory CandidateMeta
   ↓ (future) Phase 2C で Sanity write
visualCandidate (Sanity record)
```

Phase 2A は filesystem を読むだけ、Sanity 同期は Phase 2C 以降。

---

## 5. graceful degrade ルール

frontmatter が不在 / 破損 / 一部欠落のときに dashboard がどう振る舞うか:

| 状態 | dashboard の挙動 |
| --- | --- |
| `prompt.md` frontmatter 不在 | candidate grid は表示するが、variant ラベル / styleAnchors / layoutPatterns 列は `—` で埋める。"Phase 2A frontmatter missing" 注意 banner |
| `prompt.md` frontmatter 破損（YAML parse fail） | エラーバナー + raw body を fallback 表示、Edit 不能 |
| `review.md` frontmatter 不在 | rubric panel は default scheme（[docs/64 §10](64-admin-phase-2a-visual-review-wireframe.md#10-candidate-scoring-display)）で表示、score は全て `—` |
| `review.md` frontmatter 破損 | エラーバナー、`reviewStatus` を `unknown` 扱い |
| 必須 fields の一部欠落（例: `assetSlug` だけ無い） | folder 名から fallback で derive、warning banner（"Inferred from folder name"） |
| `candidateStrategy` 件数と実 v00N.png 数が不一致 | 実 PNG を優先、frontmatter 未登録 candidate には `variant: unknown` を付与 |
| `candidateScores[id]` 不在の v00N | `score: null` で扱う |
| field 型が違う（数値が来るべきところに string） | parse は通る場合は型 coerce、coerce 不能なら `null` |

**規範**: parser は **abort せず continue**、欠損は warning として UI に出す。Phase 2A は read-only なので、誤った frontmatter で書き壊しが起きる経路がない。

---

## 6. 本 batch で適用済の 4 ファイル

| ファイル | 適用 frontmatter |
| --- | --- |
| `assets/inbox/generated/building-hitori-media-os/threads-support-diagram-v1/prompt.md` | platform: threads / aspect: 4:5 / pixel: 1080x1350 / candidates: v001-v003（diagram-first/typography-hybrid/metaphor-mix）/ layout: centralHeroFourCards + hubAndSpoke + workflowPipeline / modules: headline+centralNode+supportNodes+connectors+platformCards+summaryCopy |
| `assets/inbox/generated/building-hitori-media-os/threads-support-diagram-v1/review.md` | rubric: 1-5 / max: 35 / 7 axes / candidateScores v001-v003 all null / recommendedCandidate null |
| `assets/inbox/generated/building-hitori-media-os/note-inline-content-os-flow-v1/prompt.md` | platform: note / aspect: 16:9 / pixel: 1600x900 / candidates: v001-v003 / layout: contentOSFlow + mediaDistributionMap + workflowPipeline + humanReviewFlow / modules: headline+centralNode+branchNodes+connectors+humanReviewCheckpoint+publishPackageBlock+principleBadge |
| `assets/inbox/generated/building-hitori-media-os/note-inline-content-os-flow-v1/review.md` | rubric: 1-5 / max: 35 / 7 axes / candidateScores v001-v003 all null / recommendedCandidate null |

→ いずれも **既存本文（body）は保存**、frontmatter を先頭に prepend したのみ。candidate PNG ファイルは **touch していない**。

---

## 7. future `visualCandidate` schema との mapping

Phase 2C 以降に `visualCandidate` schema を Sanity active 化する判断をした場合、本 frontmatter は 1-to-1 で record field に展開可能:

| frontmatter | visualCandidate field（提案） |
| --- | --- |
| `campaignSlug` | `campaign->slug` |
| `assetSlug` | `visualAssetPlan->slug` |
| `visualAssetPlanId` | `visualAssetPlan._ref` |
| `candidateStrategy[i].id` | `candidate.id` |
| `candidateStrategy[i].variant` | `candidate.variant` |
| `styleAnchors` | `referenceStyleAnchors` (array<string>) |
| `layoutPatterns` | `layoutPatternsConsidered` (array<string>) |
| `requiredVisualModules` | `requiredVisualModules` (array<string>) |
| `forbiddenPatterns` | `forbiddenPatterns` (array<string>) |
| `reviewStatus` | `reviewStatus` (enum) |
| `candidateScores[id].score` | `selfReviewScore` / `humanReviewScore` |
| `candidateScores[id].axisScores` | `selfReviewRubric` (object 7 axes) |
| `candidateScores[id].notes` | `reviewNotes` |
| `recommendedCandidate` | `recommendedCandidate._ref` |
| `humanDecision` | `decision` (enum: approve / regenerate / reject) |

→ schema 化を急がない理由: filesystem manifest が anyway 必要（Codex run 出力の primary store）、Sanity に書く価値は **集計 / 検索 / cross-campaign view** が欲しくなってから。Phase 2A は filesystem だけで十分。

---

## 8. 適用ガイドライン（将来の candidate 生成時）

新しい visual asset を `assets/inbox/generated/<campaign>/<asset>/` に作るとき:

1. **`prompt.md` を最初に書く**、frontmatter は §2 schema に準拠
2. `review.md` scaffold を同時に書く、frontmatter は §3 schema に準拠
3. Codex `image_gen` で v001 / v002 / v003 を生成
4. `review.md` の `candidateScores[v00N].score` を Codex self-review で埋める（Phase 2A 中は自由、Phase 2B で UI 入力に切替）
5. `recommendedCandidate` を Codex / 人間が決定したら更新

「frontmatter なしで PNG だけ作る」は **避ける**（dashboard が空 metadata で表示される）。

---

## 9. 例: 完全な frontmatter（threads-support-diagram-v1）

`prompt.md`:

```yaml
---
campaignSlug: building-hitori-media-os
assetSlug: threads-support-diagram-v1
visualAssetPlanId: visualAssetPlan.building-hitori-media-os.threads-support-diagram-v1
assetPurpose: social-support-diagram
platform: threads
aspectRatio: 4:5
pixelSize: 1080x1350
candidateStrategy:
  - id: v001
    variant: diagram-first
  - id: v002
    variant: typography-hybrid
  - id: v003
    variant: metaphor-mix
styleAnchors:
  - assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png
  - assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png
layoutPatterns:
  - centralHeroFourCards
  - hubAndSpoke
  - workflowPipeline
requiredVisualModules:
  - headline
  - centralNode
  - supportNodes
  - connectors
  - platformCards
  - summaryCopy
forbiddenPatterns:
  - text-only-title-card
  - robot-brain-cliche
  - neon-ai-glassmorphism
  - unreadable-small-text
phase: phase-admin-2a-prep
---
```

`review.md`:

```yaml
---
campaignSlug: building-hitori-media-os
assetSlug: threads-support-diagram-v1
visualAssetPlanId: visualAssetPlan.building-hitori-media-os.threads-support-diagram-v1
reviewStatus: candidate-review
rubricScale: 1-5
rubricMaxScore: 35
rubricAxes:
  - diagramRichness
  - clarityReadability
  - japaneseLegibility
  - brandConsistency
  - platformFit
  - notTextOnly
  - publishSaveUsability
candidateScores:
  v001:
    variant: diagram-first
    score: null
    notes: ""
  v002:
    variant: typography-hybrid
    score: null
    notes: ""
  v003:
    variant: metaphor-mix
    score: null
    notes: ""
recommendedCandidate: null
humanDecision: null
phase: phase-admin-2a-prep
---
```

---

## 10. 連番について

- docs: 64 → **65** （Auth 設計は別 doc に繰り下げ、本 doc が docs/65 を取った）
- devlog: 0111 → **0112**
- handoff: 0122 → **0123**

---

## 11. Safety（本 batch、4 inbox file + 1 contract doc）

- schema 変更 / activate / proposed sketch: **0 件**
- code 変更（dashboard / tools / sanity.config / proxy.ts / schemas / structure）: **0 件**
- API route / React component 追加: **0 件**
- candidate PNG 変更: **0 件**（4 ファイルの body は preserve、PNG は touch していない）
- `assets/visuals/`（final asset paths）: **不変**
- `patches/visual-assets/`: **不変**
- Sanity mutation: **0 件**
- 画像生成 / Codex CLI 起動: **0 件**
- 新規パッケージ: **0 件**
- Auth 実装 / 変更: **0 件**
- 環境変数変更 / Vercel UI 操作 / deployment: **0 件**
- 既存 production dashboard 挙動: **不変**
- Visual Register (`tools/visual-register/`) の挙動: **不変**（同 inbox folder を読むが、frontmatter を knowingly parse する必要はない、本文を読む既存ロジックは変わらない）

→ validation 結果は handoff §10 に記録。
