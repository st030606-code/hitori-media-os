# 47 — Prompt Template System (design)

Date: 2026-05-14
Status: **design-only, no schema activation**
Scope: 既存の `prompt` schema をどう「再利用可能な template」へ進化させるか、その設計骨子。**本 doc は本バッチで code / schema 変更を行わない**。

## 1. なぜ Prompt を「毎回ゼロから書く」のをやめるのか

building-hitori-media-os キャンペーンでは、X / Threads / note / Substack 用の prompt を1キャンペーンごとに手作りした。これは2回目以降のキャンペーンで:

- 同じ書き出しを何度も人間が書く
- 同じ「禁止表現」「safety 制約」を毎回貼り付ける
- 微妙に違う書き方をしてしまい、品質が campaign 単位で揺れる
- 何が共通制約で何が campaign-specific か区別がつかない

…という負債を生む。Hitori Media OS は **「1つの Content Idea を複数媒体に展開する」** のがコアバリューなので、prompt も同様に **「1つの template を複数 Content Idea に流用する」** モデルが必要。

## 2. Prompt = Template、ではなく Prompt = Instance

| 概念 | 現状の `prompt` schema | 将来の二層モデル |
| --- | --- | --- |
| Template（再利用可能な型） | 不在（事実上 `prompt` を template として誤用） | `promptTemplate`（新規、提案中） |
| Instance（1回の生成イベント） | `prompt`（実体は instance に近い） | `prompt`（既存を instance として再定義） or 新規 `promptRun` |

**重要**: 既存 `prompt` を破壊しない。代わりに `promptTemplate` を新規に積み増し、`prompt` を「特定 Content Idea × Template × 入力値の組み合わせで実行した1回分のスナップショット」として位置付け直す。移行は次バッチ以降で段階的に。

## 3. 現状の `prompt` schema が支える範囲

```
title / targetPlatform / outputType
localFilePath / promptBody
requiredInputFields (array<string>)
humanReviewChecklist (array<string>)
outputPathPattern
version / status / notes
```

→ 「平文の prompt 1枚 + 媒体メタ + 必要入力リスト + レビュー項目 + バージョン」までは表現できる。

## 4. Template 化に欠けているもの

| 欠落フィールド | なぜ必要か |
| --- | --- |
| `systemInstruction` | LLM の system 役割と user 役割を分けたい。現状は `promptBody` に混在。 |
| `userPromptTemplate` | `{contentIdea.title}` `{platform}` などの placeholder を埋め込み、入力 binding を体系化。 |
| `inputVariables` (typed) | `requiredInputFields` の string 配列では「型」が表現できない。`{name, type, source, required}` で構造化。 |
| `outputContract` | 返り値の構造（例: `{title, body, leadParagraph}`）を schema として明示。 |
| `negativeInstructions` | 「避ける表現」を専用フィールドに。`humanReviewChecklist` と混ざらないように。 |
| `reviewRubric` | チェックリストではなく、点数化 or 段階評価可能な観点（例: tone 一致 / safety / 完成感 / 煽り）。 |
| `variationStrategy` | 1 template から 3 variants 出すなどの戦略を明文化（diagram-first / typography hybrid / metaphor）。 |
| `contentMode` | build-log / educational / paid-readiness / build-in-public など、文体モードの軸。 |
| `brandProfile` ref | 著者人格 / 既定トーン / 既定 CTA 方針。 |
| `visualStyleProfile` ref | 画像系 template の場合、色 / font / ノード形状 / 装飾密度。 |
| `automationLevel` | manual / semi-auto / auto-eligible の3段階。自動化解禁の判断軸。 |
| `applicableContentModes` | 「この template は build-log と educational に適合、paid-readiness は不可」と明示。 |
| `successCriteria` | 「採用 candidate が満たすべき条件」を runtime check 化できる形に。 |

## 5. Prompt Category（再利用 unit としての分類）

1. **text draft prompts**: 1 platform × 1 outputType の本文下書き
   - note-article / substack-post / threads-thread / x-post / instagram-caption / newsletter
2. **thread prompts**: X / Threads の連投 / カード列
3. **note article prompts**: 検索流入を想定する長文記事
4. **Substack post prompts**: email 配信前提の冒頭〜CTA 設計
5. **Substack Notes prompts**: 短文 / 引用 / 投げかけ
6. **image generation prompts**: visual asset 生成（hero / inline / carousel / thumbnail / hook-image）
7. **diagram generation prompts**: 構造図のノード / 矢印 / 階層
8. **video script prompts**: YouTube 長尺 / 中尺
9. **shorts script prompts**: 60s 以内、縦長
10. **podcast script prompts**: 音声向け、話し言葉、対談 / モノローグ
11. **publish checklist prompts**: 公開前の review checklist 自動生成

これらすべてを `promptTemplate.category` (enum) で分類する。

## 6. Selection Keys（どの template を引くか）

```
contentIdea          → 文脈ロード（claims / objections / audience / tone）
platform             → x / note / substack / threads / youtube / shorts / podcast / instagram / newsletter / github / paid
assetType            → hero / inline / hook-image / thread-card / carousel-slide / etc
contentMode          → build-log / educational / paid-readiness / case-study / opinion
brandProfile         → 著者人格 ID
outputFormat         → markdown / json / threadJson / imagePromptJson
automationLevel      → manual / semi-auto / auto-eligible
```

これら 7 軸の AND 条件で `promptTemplate` を 1 件選ぶ。複数 match した場合は `priority` フィールドで決める。

## 7. Required Template Fields（promptTemplate の MVP 形）

```text
promptTemplate {
  id                       (string, slug like "x-build-log-main-post-v1")
  title                    (string)
  category                 (enum: text-draft / thread / note-article / substack-post / substack-notes /
                                  image-generation / diagram-generation / video-script / shorts-script /
                                  podcast-script / publish-checklist)
  applicablePlatforms      (array<platform>)
  applicableAssetTypes     (array<assetType>)
  applicableContentModes   (array<contentMode>)
  brandProfile             (ref to brandProfile, weak)
  visualStyleProfile       (ref to visualStyleProfile, weak)         // image template のみ

  systemInstruction        (text)
  userPromptTemplate       (text, supports {{placeholder}})
  inputVariables           (array<{name, type, source, required}>)
  outputContract           (text or json schema string)
  negativeInstructions     (array<string>)
  reviewRubric             (array<{criterion, weight, passThreshold}>)
  successCriteria          (array<string>, runtime-checkable)
  variationStrategy        (enum: single / 3-variant / diagram-first / typography-hybrid / metaphor-mix)
  automationLevel          (enum: manual / semi-auto / auto-eligible)

  version                  (semver)
  status                   (draft / active / deprecated / archived)
  notes                    (text)
  createdAt / updatedAt
}
```

## 8. Versioning と adoption

- `version` は **semver**（`MAJOR.MINOR.PATCH`）。出力契約 (`outputContract`) が変わると MAJOR、入力増えると MINOR、文言だけなら PATCH。
- 旧 version を即削除しない（過去 instance の trace 維持）。
- `status: archived` でフェードアウト。`status: deprecated` は新規利用禁止、既存はそのまま。
- 1 keyset (`category × platform × assetType × contentMode`) で `status: active` は 1 件のみ。

## 9. 既存 `prompt` との関係

- 既存 `prompt` document は **削除しない**（過去資産）。
- 新 `promptTemplate` を導入、既存 `prompt` を「template から派生した instance」と再定義（migration script 等は本バッチでは作らない、人間判断で個別移行）。
- 将来的に `prompt.template` reference を追加する選択肢を残す（破壊的でない additive 追加）。

## 10. Out of scope（本 doc では扱わない）

- LLM 自動 prompt 改善ループ（auto rubric scoring）
- paid LLM client integration（OpenAI / Anthropic SDK）
- prompt の自動 A/B test
- prompt registry の Sanity 外 export（git diff / GitOps）

## 11. 次の implementation バッチへの推奨

1. `schemas/proposed/promptTemplate.ts` を `defineType` で sketch（active 化はしない）
2. 1 個の concrete template を JSON seed で書く（例: `seed/promptTemplate-x-build-log-main-post-v1.json`）
3. building-hitori-media-os の X 投稿用 prompt を本 template の instance として保存し直す
4. 並行して `brandProfile` / `visualStyleProfile` の最小 schema を作る
5. Visual Register / publish-package-builder などの tool は **影響なし**（template は document 層）
