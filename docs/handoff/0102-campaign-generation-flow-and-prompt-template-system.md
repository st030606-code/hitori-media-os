# Handoff: Campaign Generation Flow & Prompt Template System (design batch)

Date: 2026-05-14
Status: **design-only / docs-only / no code or schema activation**

## 1. Task Goal

ad-hoc な prompt 作成から、再利用可能な prompt template system + Campaign Generation Flow + Platform Selection Model + Visual Prompt Quality System への移行設計を文書化する。本バッチでは **code を書かず、schema を active 化せず、Sanity に書き込まず、画像も生成しない**。

## 2. Constraints Followed

- Next.jsを追加していない。
- paid API integration を追加していない。
- OpenAI API / Anthropic API クライアントを repo に追加していない。
- auto-postingを実装していない。
- Sanity direct write を実装していない（grep 0 hits 維持）。
- Sanity CLI commands を自動実行していない。
- `seed --replace` を実行していない。
- 既存スキーマを破壊的に変更していない。
- 新規スキーマを active 化していない（`schemas/proposed/_design-*.md` のみ追加、`.ts` は作っていない）。
- candidate 画像を生成していない。
- `assets/visuals/...` / `patches/...` / `seed/` / `outputs/` / `publish-packages/` を変更していない。
- Visual Register Inbox Review を bypass していない。
- 既存 `campaign-hero-v1.png` / `v001.png` を変更していない。

## 3. Changed Files

### Added

- `docs/47-prompt-template-system.md`
- `docs/48-campaign-generation-flow.md`
- `docs/49-platform-selection-model.md`
- `docs/50-visual-prompt-quality-system.md`
- `schemas/proposed/_design-campaignPlan.md`
- `schemas/proposed/_design-promptTemplate.md`
- `schemas/proposed/_design-brandProfile.md`
- `schemas/proposed/_design-visualStyleProfile.md`
- `docs/devlog/0091-campaign-generation-flow-and-prompt-template-system.md`
- `docs/handoff/0102-campaign-generation-flow-and-prompt-template-system.md`

### Modified

- `docs/handoff/latest.md`（本 0102 にミラー）

### Confirmed unchanged

- `schemas/` 配下の `.ts`（既存 active schema 不変）
- `schemas/proposed/*.ts`（`substackPaidReadiness.ts` / `substackSubscriberMilestone.ts` は不変）
- `sanity.config.ts` / `structure/index.ts`
- `tools/` / `package.json` / `package-lock.json`
- `seed/` / `outputs/` / `publish-packages/` / `private/`
- `assets/visuals/` / `patches/` / `assets/inbox/` の画像と patch JSON
- ai-blog-db 関連すべて

## 4. Summary of Changes

### A. Doc 47 — Prompt Template System

- 既存 `prompt` schema の supports: title / targetPlatform / outputType / localFilePath / promptBody / requiredInputFields / humanReviewChecklist / outputPathPattern / version / status / notes
- 不足: systemInstruction / userPromptTemplate / inputVariables (typed) / outputContract / negativeInstructions / reviewRubric / variationStrategy / contentMode / brandProfile ref / visualStyleProfile ref / automationLevel / applicableContentModes / successCriteria
- 提案: 新規 `promptTemplate` 導入、既存 `prompt` は instance として残す additive 構造

### B. Doc 48 — Campaign Generation Flow

- 13 段の人間レビューゲート付きフロー（ContentIdea → selectedPlatforms → Campaign Plan → per-platform records → prompt selection → text draft → visual brief → inbox candidate → Visual Register → Sanity 反映 → publish-package → release-review → manual publish）
- 各段で生成される record type の対応表
- building-hitori-media-os の具体例（4 platform / 9 visualAssetPlan / 5 publish-package directory / 6 release-review file）
- automation level 3 段（manual / semi-auto / auto-eligible）、auto-posting は scope 外

### C. Doc 49 — Platform Selection Model

- per-platform 8 フィールド: enabled / priority (P0-P3) / contentDepth (4 enum) / visualRequirement (4 enum) / publishMode (3 enum) / productionMode (3 enum) / cadence (5 enum) / requiredAssets / optionalAssets
- 4 ユーザータイプ例（writer-only / building-hitori-media-os / video-first / niche developer）
- selectedPlatforms から visualAssetPlan を derive する heuristic（将来 script 化）

### D. Doc 50 — Visual Prompt Quality System

- 失敗モード: text-only title card（x-hook-main-v1/v001.png 観察）
- 求める構造: layoutPattern (7 enum) × visualModuleSet × typographyHierarchy × brandProfile × negativePatterns × reviewRubric
- variationStrategy "3-pattern-default": diagram-first / typography-hybrid / metaphor-mix の3 candidates 必須
- self-review before saving（rubric を prompt に inline、落第なら placeholder で埋めず stop）
- 採用 candidate → `visualStyleProfile.referenceImagePaths` → 次回 generation の style anchor

### E. Proposed Schemas (design only, no .ts created)

| 提案 schema | 主な用途 | ref から呼ばれる側 / 呼ぶ側 |
| --- | --- | --- |
| `campaignPlan` | 1 Content Idea を起点とする campaign 全体の record。selectedPlatforms + progress | sourceContentIdea / brandProfile を ref |
| `promptTemplate` | 再利用可能な prompt 型。`category × platform × assetType × contentMode × brandProfile` で selection | brandProfile / visualStyleProfile を ref |
| `brandProfile` | 著者人格 / 既定トーン / visual defaults / negativeStyleList | promptTemplate / visualStyleProfile / campaignPlan から ref |
| `visualStyleProfile` | assetType 単位の style anchor + referenceImagePaths | brandProfile を ref、promptTemplate から ref |

### F. Validation Results

- `npm run local:check`: ok: true（17 green / 0 fail）
- `npm run build`: 成功
- direct Sanity write grep: 0 hits
- paid API client/SDK grep (tools/schemas/structure/package.json): 0 hits
- 既存 active schema 不変
- 既存 image / patch / inbox 不変

## 5. Important Decisions

- **設計を `.ts` ではなく `.md` で書く**: schema を `.ts` で sketch すると Sanity build pipeline に乗り、意図せぬ active 化リスクが上がる。`schemas/proposed/_design-*.md` にすることで build には影響せず、提案である事を明示。
- **既存 `prompt` schema を破壊しない**: 新 `promptTemplate` は additive 導入、既存 `prompt` は instance として再定義（次バッチで判断）。
- **`auto-posting` は永続的に scope 外**: automation level 3 段の "auto-eligible" でも、Visual Register Inbox Review と manual publish の human gate は維持。
- **`centered-title-only` を visualStyleProfile.defaultLayoutPattern にしない**: text-only title card 失敗を構造的に防ぐ。

## 6. Human Review Questions

- 4 ユーザータイプ（writer-only / building-hitori-media-os / video-first / niche developer）は本人の運用と合っているか、別タイプを追加するか？
- `promptTemplate.category` の 11 値は過不足ないか（例: `social-reply` / `engagement-prompt` を追加するか）？
- `brandProfile` を 1 ブランドで固定するか、experimental variant を許すか？
- `visualStyleProfile` を `assetType × platform` の積で持つか、1 visualStyleProfile が複数 platform に applicablePlatforms を持つ現設計でよいか？
- 次バッチで `schemas/proposed/promptTemplate.ts` を `.ts` 化する判断は今でよいか、もう 1 段検討するか？

## 7. Risks or Uncertainties

- **設計負債が積み増す可能性**: 4 doc + 4 schema design = 合計 8 文書。実装 batch を回さないと「design ばかり盛り上がる」状態になる。次の implementation batch で 1 個ずつ着地させる方針。
- **既存 visualAssetPlan との reference 追加判断**: `visualStyleProfile` を visualAssetPlan から ref するか、parallel に持つかは保留。
- **`promptTemplate.inputVariables` の `source: visualAssetPlan` 等**: 将来 derive script を書く時に GROQ 系で実装するか、TS で実装するか保留。
- **structure builder の "By Campaign" 拡張**: 設計のみ、実装は Phase 2 以降。

## 8. Recommended Next Step

### Immediate Human Actions

- 4 設計 doc を読み、`docs/49` の 4 ユーザータイプ例が自分の運用と合っているか確認
- `docs/50` の layoutPattern enum / variationStrategy / reviewRubric が次の x-hook 系 visual 生成にすぐ使えるか確認
- 採用 / 修正したい設計差分があれば Claude Code に伝える

### Next Implementation Batch（推奨順）

1. `schemas/proposed/promptTemplate.ts` を sketch（active 化なし、まず `defineType` だけ）
2. `schemas/proposed/brandProfile.ts` / `schemas/proposed/visualStyleProfile.ts` を sketch
3. building-hitori-media-os の `brandProfile.hitori-media-os-default` を seed file 化
4. `visualStyleProfile.hitori-media-os.x-hook-image` を seed file 化（referenceImagePaths に `campaign-hero-v1.png` を初期登録）
5. 1 個の concrete `promptTemplate` を seed file 化（例: `x-build-log-main-post-v1` or `x-hook-image-v1`）
6. `schemas/proposed/campaignPlan.ts` を sketch
7. building-hitori-media-os の campaignPlan を seed file 化（selectedPlatforms を `docs/49` Example B から作る）
8. 任意: tools/codex-workflow/ に「終了前 `git diff --stat` で副作用 0 を自己検査」script を追加（docs/0090 の lesson から）

各 step は **active 化を伴わない**: `schemas/proposed/*.ts` のままで、`schemas/index.ts` には登録しない。

### Mid-term

- `tools/campaign-plan/derive-visual-asset-plans.mjs`（仮）で selectedPlatforms から visualAssetPlan を derive する script
- Visual Register Inbox Review UI に `reviewRubric` を表示
- structure builder に "By Campaign" view を追加

### Deferred

- paid LLM / image generation API integration
- auto-posting / automated publish
- automated A/B testing of prompts
- Codex agent overreach の auto-detect script（diff watcher）— `docs/devlog/0090` の lesson、必要になり次第

## 9. Exact Prompt to Give Codex Next

```text
Sketch the proposed schemas for promptTemplate, brandProfile, and visualStyleProfile as TS files
under schemas/proposed/ — DO NOT activate them.

Do not edit schemas/index.ts.
Do not register the new types in sanity.config.ts.
Do not run sanity build with the new types active.
Do not write to Sanity from code.
Do not call paid APIs.
Do not auto-post.
Do not modify assets/visuals/... or patches/...
Do not run seed --replace.

Use as reference:
- docs/47-prompt-template-system.md
- docs/49-platform-selection-model.md
- docs/50-visual-prompt-quality-system.md
- schemas/proposed/_design-promptTemplate.md
- schemas/proposed/_design-brandProfile.md
- schemas/proposed/_design-visualStyleProfile.md

Workflow:
1. Read all of the above design docs.
2. Create schemas/proposed/promptTemplate.ts with defineType matching the design.
3. Create schemas/proposed/brandProfile.ts with defineType matching the design.
4. Create schemas/proposed/visualStyleProfile.ts with defineType matching the design.
5. Do not import them anywhere. Do not export from schemas/index.ts.
6. Run `npm run build` to confirm the existing build is unaffected.
7. Run `npm run local:check` to confirm guardrails still green.
8. Run `git diff --stat` at the end and confirm only schemas/proposed/*.ts files were added.
9. If you find yourself wanting to touch any file outside schemas/proposed/, STOP and report.

End-of-run output:
- list of schemas/proposed/*.ts files created
- npm run build result
- npm run local:check ok count
- git diff --stat summary
```
