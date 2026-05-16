# Handoff: Proposed promptTemplate / brandProfile / visualStyleProfile schemas

Date: 2026-05-14
Status: **proposed-schemas-and-seeds-created / not-activated / not-inserted**

## 1. Task Goal

[`docs/47-prompt-template-system.md`](../47-prompt-template-system.md) など設計のみだった Prompt Template System を、**proposed Sanity schema 3 件** と **local-only seed 3 件** に落とし込む。Studio には activate せず、Sanity にも投入しない。

## 2. Constraints Followed

- Next.jsを追加していない。
- paid API integration を追加していない（repo に SDK / client コード 0）。
- OpenAI API / Anthropic API クライアントを repo に追加していない。
- auto-postingを実装していない。
- Sanity direct write を実装していない（grep 0 hits 維持）。
- Sanity CLI commands を自動実行していない（`npx sanity documents create` 0 回）。
- `seed --replace` を実行していない。
- `schemas/index.ts` を変更していない（既存 active 12 type のまま）。
- `sanity.config.ts` を変更していない。
- 既存 active schemas を破壊的に変更していない（差分 0）。
- 画像 candidate を本バッチで生成していない。
- `assets/visuals/...` / `patches/...` / `assets/inbox/` の既存ファイルを変更していない。
- Visual Register Inbox Review を bypass していない。
- 既存 `campaign-hero-v1.png` / `v001.png` を変更していない。

## 3. Changed Files

### Added — Proposed schemas（active 化なし）

- `schemas/proposed/promptTemplate.ts`
- `schemas/proposed/brandProfile.ts`
- `schemas/proposed/visualStyleProfile.ts`

各ファイル冒頭に `// PROPOSED SCHEMA — NOT ACTIVE IN STUDIO.` のコメントを明示。

### Added — Seeds（local-only、Sanity 投入なし）

- `seed/brand-profile-hitori-media-os-default.json`
- `seed/visual-style-profile-hitori-media-os-x-hook-image.json`
- `seed/prompt-template-x-hook-image-diagram-rich-v1.json`

### Added — Docs

- `docs/54-proposed-prompt-template-schema.md`
- `docs/devlog/0092-proposed-prompt-template-brand-visual-style-schemas.md`
- `docs/handoff/0103-proposed-prompt-template-brand-visual-style-schemas.md`

### Modified

- `docs/handoff/latest.md`（本 0103 にミラー）

### Confirmed unchanged

- `schemas/index.ts`
- `sanity.config.ts`
- `structure/index.ts`
- 既存 active `schemas/*.ts`（contentIdea / prompt / platformOutput / diagramPlan / visualAssetPlan / workflow / publishedOutput / tool / substackPublicationStrategy / substackPostPlan / substackNotesPlan / substackGrowthAction）
- `schemas/proposed/substackPaidReadiness.ts` / `schemas/proposed/substackSubscriberMilestone.ts` / `schemas/proposed/README.md` / `schemas/proposed/_design-*.md`（先行バッチで作成）
- `tools/` / `package.json` / `package-lock.json`
- 既存 seed / outputs / publish-packages / private / ai-blog-db 関連
- `assets/visuals/` / `patches/` / `assets/inbox/generated/.../v001.png`

## 4. Summary of Changes

### A. proposed `promptTemplate` schema

主フィールド（300+ 行）:

- 基本: title / slug / category (11 enum) / version / priority / status / notes / createdAt / updatedAt
- selection keys: targetPlatform / applicablePlatforms / assetType / applicableAssetTypes / contentMode / applicableContentModes
- references: brandProfile / visualStyleProfile（どちらも weak、proposed 同士の参照）
- LLM 構造: systemInstruction / userPromptTemplate / inputVariables (typed name/type/source/required) / outputContract
- 制約 / 評価: negativeInstructions / reviewRubric (criterion/weight/passThreshold) / successCriteria
- variation: variationStrategy (6 enum) / numberOfVariants
- 画像生成専用: imageGenerationConfig (defaultLayoutPattern / allowedLayoutPatterns / requiredVisualModules / forbiddenPatterns / selfReviewBeforeSaving / candidateSavePolicy / finalPathPolicy / visualRegisterApprovalRequired / expectedPixelSize / expectedAspectRatio)
- outputFormat (6 enum) / automationLevel (3 enum)

### B. proposed `brandProfile` schema

主フィールド（260+ 行）:

- 基本: title / slug / brandName / ownerType (4 enum) / version / status / notes
- voiceTone: voice / expertiseLevel (4 enum) / styleNotes / avoidPhrasings
- audience / contentPrinciples / defaultContentModes / defaultPlatforms
- visualDefaults: visualVocabulary (7 enum including structured/app-like/diagram-friendly/trust-building/building-in-public) / defaultBaseColor / defaultAccentColor / allowedAccentColors / defaultFontFamily / defaultNodeShape (5 enum) / defaultLineWeight (4 enum) / decorationDensity (4 enum)
- negativeStyleList（必須、min 1）
- platformToneOverrides（platform 別の voice/style/cta 上書き）
- reviewPrinciples / ctaDefaults

### C. proposed `visualStyleProfile` schema

主フィールド（280+ 行）:

- 基本: title / slug / version / status / notes
- ref: brandProfile (weak)
- 範囲: applicablePlatforms / assetTypes（min 1 必須）
- layout: layoutPatterns (array, min 1) / defaultLayoutPattern
- visualModuleSet: headlineRequired / subtitleRequired / diagramNodesMin / diagramEdgesMin / iconHintsAllowed / bracketingLineRequired / watermarkOrTagAllowed
- typographyGuidance: 5 サイズ系 enum + density (3 enum) + lineHeight (3 enum) + fontFamilyHint
- colorGuidance: baseColor / accentColor / allowedAccents / forbiddenColorEffects
- densityGuidance: decorationDensity (4 enum) / compareTo
- references: referenceImagePaths / adoptedCandidatePaths
- negativePatterns（必須、min 1）
- reviewRubric / acceptanceThreshold / variationStrategy / numberOfVariants / expectedAspectRatio / expectedPixelSize

### D. seed: `brandProfile.hitori-media-os-default`

Hitori Media OS の default brand。voice = building-in-public / 完成断言なし / 数字煽りなし。avoidPhrasings 10 件、negativeStyleList 17 件（**text-only title card as default を明示**）。platformToneOverrides で X と Substack の voice 差分を記録。

### E. seed: `visualStyleProfile.hitori-media-os.x-hook-image`

X hook-image 専用の style anchor。**`centered-title-only` を `layoutPatterns` に含めない**（5 つの diagram 系のみ）。`diagramNodesMin: 2 / diagramEdgesMin: 1`。`referenceImagePaths` に `campaign-hero-v1.png`、`adoptedCandidatePaths` に `v001.png`（Visual Register 承認後に anchor として参照）。reviewRubric 9 項目、acceptanceThreshold 80。

### F. seed: `promptTemplate.x-hook-image-diagram-rich-v1`

X hook-image 生成 template。Codex exec + built-in image_gen + gpt-5.4 を想定。

- systemInstruction で paid API禁止 / Python/Node scriptなし / Visual Register bypass禁止を明文化
- userPromptTemplate で {{contentIdea.slug}} / {{visualStyleProfile.layoutPatterns}} / {{numberOfVariants}} 等の placeholder を埋め込み（Handlebars 風）
- inputVariables 10 件（contentIdea / visualAssetPlan / human-input / constant）
- negativeInstructions 15 件
- reviewRubric 8 項目
- successCriteria 7 項目（runtime チェック可能）
- imageGenerationConfig で text-only title card 構造的封じ込め

### G. Validation Results

- `schemas/index.ts` の grep で `promptTemplate|brandProfile|visualStyleProfile`: **0 hits**（未 import）
- `sanity.config.ts` の grep で同上: **0 hits**
- `npm run build`: **成功**（proposed schemas は build pipeline に乗らない）
- `npm run local:check`: **ok: true**（17 green / 0 fail）
- `git diff --stat`: 新規ファイル追加のみ、既存ファイルへの変更は `docs/handoff/latest.md` のミラー1件のみ
- direct Sanity write の grep: 0 hits
- paid LLM/image API client/SDK の repo 追加: 0 hits

## 5. Important Decisions

- **proposed schemas を `.md` ではなく `.ts` で書いた**: 前バッチ（0091）では `_design-*.md` で sketch、本バッチで `.ts` 化。**ただし `schemas/index.ts` から import しない**ことで activate 事故を防ぐ。`.ts` にしたことで TypeScript の型チェックが効くため、より厳密な spec になる。
- **3 schema を同時設計**: weak ref で互いを参照する依存関係を成立させた。activate するときは 3 つまとめてが原則。
- **seed を `npx sanity documents create` で投入しない**: 投入は人間判断、本バッチではあくまで「ファイルの形に落とした」段階。
- **text-only title card を schema レベルで封じる**: 1) brandProfile.negativeStyleList、2) visualStyleProfile.layoutPatterns に exclude、3) visualModuleSet.diagramNodesMin = 2、4) variationStrategy = "3-pattern-default" の4層。
- **既存 `prompt` schema は破壊しない**: 新 `promptTemplate` は完全 additive。

## 6. Human Review Questions

- 3 proposed schema を **同時に Studio activate する** タイミングはいつか？
- seed 3 件のうち、`brandProfile.hitori-media-os-default` の `negativeStyleList` 17 件は過不足ないか？
- `visualStyleProfile.hitori-media-os.x-hook-image.layoutPatterns` に `centered-title-only` を **完全に含めない** で問題ないか（最終手段としての退路をなくす判断）？
- `promptTemplate.userPromptTemplate` の Handlebars 風 placeholder は将来 runner script で実装する想定だが、別 syntax を採用するか？
- 既存 active `prompt` schema を将来 `instance` として再定義する migration は次バッチで進めるか？

## 7. Risks or Uncertainties

- **weak ref が解決しない警告**: proposed schemas 同士が ref する構造なので、`schemas/index.ts` に追加した瞬間、3 つ全部追加しないと Studio で警告が出る可能性。activate 順序は brandProfile → visualStyleProfile → promptTemplate を推奨。
- **seed の Sanity ingest 時のエラー**: 投入する場合、`contentIdea` / 既存 active schemas との reference 整合（promptTemplate.brandProfile / promptTemplate.visualStyleProfile）が崩れていないか事前確認が必要。
- **userPromptTemplate の placeholder syntax**: `{{contentIdea.slug}}` `{{#each layoutPatterns}}` などは Handlebars 風だが、ランタイムで evaluate するのは別バッチ。本バッチでは「placeholder の存在を documentation する」段階。
- **既存 prompt schema との重複**: `prompt` と `promptTemplate` がしばらく並走する。どちらを引くかの runner ロジックは未定。
- **schemas/proposed/_design-*.md と .ts の整合**: 前バッチの `_design-*.md` と本バッチの `.ts` がズレた場合、`.ts` を source-of-truth とする方針（doc は `.ts` を読んで update）。

## 8. Recommended Next Step

### Immediate Human Actions

- 3 proposed schema を読み、Studio activate する前に違和感がないか確認
- 3 seed JSON を読み、`negativeStyleList` / `layoutPatterns` / `reviewRubric` が運用ルールと合っているか確認
- `seed/prompt-template-x-hook-image-diagram-rich-v1.json` の userPromptTemplate を、次回 Codex `image_gen` セッションで手動で試すか判断

### Next Implementation Batches（推奨順）

1. `schemas/proposed/campaignPlan.ts` を sketch（`docs/49` Example B から `seed/campaign-plan-building-hitori-media-os.json` も作成）
2. （任意）`tools/codex-workflow/codex-exec-runner.mjs` の概念 sketch — promptTemplate JSON を読み、placeholder を埋め、Codex exec に渡す runner（実装は分離バッチ）
3. （任意）Visual Register Inbox Review UI に reviewRubric を表示する設計 sketch
4. **3 proposed schema を Studio activate する判断バッチ**（依存順厳守、seed 投入 + 動作確認）
5. structure builder に "By Campaign" ノードを追加

### Mid-term

- 旧 `prompt` schema を「`promptTemplate` から派生した instance」として再定義
- Codex agent の overreach 検査 script（`tools/codex-workflow/` に diff watcher）
- `tools/visual-register/` の Inbox Review UI で reviewRubric チェックリスト表示

### Deferred

- paid LLM / image generation API integration
- automated publishing
- A/B test of prompts
- structure builder の "By Brand" 表示

## 9. Exact Prompt to Give Codex Next

```text
Sketch the proposed campaignPlan.ts schema and write the seed file for
building-hitori-media-os campaignPlan based on docs/49 Example B.

Do not activate any schema.
Do not edit schemas/index.ts.
Do not register the type in sanity.config.ts.
Do not run sanity CLI commands.
Do not write to Sanity from code.
Do not call paid APIs.
Do not auto-post.
Do not modify assets/visuals/... or patches/...
Do not generate images.
Do not run seed --replace.

Use:
- docs/48-campaign-generation-flow.md
- docs/49-platform-selection-model.md
- schemas/proposed/_design-campaignPlan.md
- schemas/proposed/brandProfile.ts (already exists, do not modify)
- schemas/proposed/visualStyleProfile.ts (already exists, do not modify)
- schemas/proposed/promptTemplate.ts (already exists, do not modify)
- schemas/contentIdea.ts (active, do not modify)

Workflow:
1. Read all of the above.
2. Create schemas/proposed/campaignPlan.ts with defineType matching docs/49.
3. Add `// PROPOSED SCHEMA — NOT ACTIVE IN STUDIO.` at the top.
4. Do not import it from schemas/index.ts.
5. Create seed/campaign-plan-building-hitori-media-os.json populated from docs/49 Example B
   (X / Threads / note / Substack with per-platform settings).
6. Run `git diff --stat` and confirm the only files touched are schemas/proposed/campaignPlan.ts,
   seed/campaign-plan-building-hitori-media-os.json, docs/devlog/0093-*, docs/handoff/0104-*,
   docs/handoff/latest.md.
7. Run `npm run build` and `npm run local:check`.
8. Report which files were added and validation results.
```
