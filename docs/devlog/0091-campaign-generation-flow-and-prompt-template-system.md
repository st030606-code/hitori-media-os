# Devlog 0091 — Campaign Generation Flow & Prompt Template System (design)

Date: 2026-05-14
Status: **design-only**, code 不変、schema 不活性化

## 今日の判断

building-hitori-media-os キャンペーンを通じて見えた負債（prompt を毎回ゼロから書く、selectedPlatforms を明示しない、visual が text-only title card に偏る）を解消するために、4 本の設計ドキュメントと 4 件の proposed schema design 文書を作成した。本バッチでは **active schema を追加せず**、coding も行わず、Sanity 書き込みも行わない。

## なぜその設計にしたか

- **Prompt Template System** ([`docs/47`](47-prompt-template-system.md)): 既存 `prompt` schema は instance に近く、template として使うとフィールドが足りない（systemInstruction / userPromptTemplate / inputVariables / outputContract / negativeInstructions / reviewRubric / variationStrategy / brandProfile / contentMode が欠落）。新規 `promptTemplate` を提案し、既存 `prompt` を破壊しない additive 設計とした。
- **Campaign Generation Flow** ([`docs/48`](48-campaign-generation-flow.md)): 1 ContentIdea から複数 platform への展開を 13 段の人間レビューゲート付きフローで形式化。building-hitori-media-os の実例（X / Threads / note / Substack）を numeric example として記載。
- **Platform Selection Model** ([`docs/49`](49-platform-selection-model.md)): 「全 platform default」は嘘なので、`selectedPlatforms` を per-platform 設定オブジェクト（enabled / priority / contentDepth / visualRequirement / publishMode / productionMode / cadence / requiredAssets / optionalAssets）で明示。4 ユーザータイプの具体例を提示。
- **Visual Prompt Quality System** ([`docs/50`](50-visual-prompt-quality-system.md)): `x-hook-main-v1/v001.png` が text-only title card に倒れた失敗を構造化し、`layoutPattern` / `visualModuleSet` / `typographyHierarchy` / `variationStrategy = 3-pattern-default` で再発防止。採用 candidate を `visualStyleProfile.referenceImagePaths` に追記する style anchor 蓄積モデルを提案。

## Codex と Claude Code の役割分担（再確認）

| 役割 | 担当 |
| --- | --- |
| 設計 doc 起草 / schema sketch | Claude Code（本バッチ） |
| 画像 candidate 生成 | Codex `image_gen` (gpt-5.4 + --enable image_generation) |
| inbox 整備 / レビュー UI | Claude Code |
| approve & register | 人間 + Visual Register UI |
| Sanity 反映 / 公開 | 人間 |

設計を `docs/47-50` + `schemas/proposed/_design-*.md` という layer 分離で書いたのは、**activate しないことを物理的に明示する**ため。`.ts` で書くと build に乗り、誤って active 化する事故が増える。

## API なしで済ませた理由（再確認）

- 設計のみで paid API 呼び出しなし。
- LLM auto-rubric scoring を out-of-scope に明記。
- paid image generation API integration / Sanity direct write を全 doc で out-of-scope に維持。

## このバッチで作ったもの

| ファイル | 種別 |
| --- | --- |
| `docs/47-prompt-template-system.md` | design |
| `docs/48-campaign-generation-flow.md` | design |
| `docs/49-platform-selection-model.md` | design |
| `docs/50-visual-prompt-quality-system.md` | design |
| `schemas/proposed/_design-campaignPlan.md` | schema sketch（active 化なし） |
| `schemas/proposed/_design-promptTemplate.md` | schema sketch（同上） |
| `schemas/proposed/_design-brandProfile.md` | schema sketch（同上） |
| `schemas/proposed/_design-visualStyleProfile.md` | schema sketch（同上） |
| `docs/devlog/0091-campaign-generation-flow-and-prompt-template-system.md` | 本ファイル |
| `docs/handoff/0102-campaign-generation-flow-and-prompt-template-system.md` | (次に書く) |
| `docs/handoff/latest.md` | 0102 をミラー |

## 連番について

- devlog: 0090（x-hook-main-v1 success）の次として **0091** を取得。
- handoff: 0101 の次として **0102** を取得。

## 発信ネタになりそうな切り口

1. **「template と instance を分ける」**: 既存 prompt schema を template として誤用していた話。multi-platform 運用では template を持たないと品質が campaign 単位で揺れる。
2. **「全 platform default は嘘」**: 利用者ごとに使う platform は違うので、selectedPlatforms を明示する。4 ユーザータイプの分類は読者に「自分はどれ？」を考えさせる切り口。
3. **「text-only title card は失敗の sign」**: 安全 prompt の副作用として visual が text card に倒れる現象を構造化。「diagram-first」「typography hybrid」「metaphor」3 候補必須ルール。
4. **「設計を `.ts` ではなく `.md` で書く理由」**: schema を `.md` で sketch することで activate 事故を防ぐ。Sanity の build pipeline と分離。
5. **「採用 candidate を style anchor にする」**: 過去の採用 visual を referenceImagePaths として蓄積し、新規 generation が時間と共に brand vocabulary に収束する設計。

## Safety Verified

- 既存スキーマ / sanity.config.ts / structure/index.ts: 不変
- 既存 outputs / publish-packages / seed / private / ai-blog-db: 不変
- `assets/visuals/...` / `patches/...` / inbox の v00N.png: 不変
- direct Sanity write の grep: 0 hits
- paid API integration の grep: 0 hits
- `npm run local:check`: ok: true（17 green）
- `npm run build`: 成功
