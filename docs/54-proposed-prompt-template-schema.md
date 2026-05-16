# 54 — Proposed Prompt Template Schema (implementation followup)

Date: 2026-05-14
Status: **proposed-only**, not active in Studio

[`docs/47-prompt-template-system.md`](47-prompt-template-system.md)（設計） を起点に、3 つの proposed schema と 3 つの seed file を本バッチで実装した記録 / ガイド。

## 1. 何が変わったか

| 区分 | 追加 | 役割 |
| --- | --- | --- |
| schema (proposed) | `schemas/proposed/promptTemplate.ts` | prompt の再利用可能な型 |
| schema (proposed) | `schemas/proposed/brandProfile.ts` | 著者人格 + visual defaults + negativeStyleList |
| schema (proposed) | `schemas/proposed/visualStyleProfile.ts` | assetType 単位の style anchor + referenceImagePaths |
| seed (local-only) | `seed/brand-profile-hitori-media-os-default.json` | Hitori Media OS の default brand record |
| seed (local-only) | `seed/visual-style-profile-hitori-media-os-x-hook-image.json` | X hook-image の style anchor |
| seed (local-only) | `seed/prompt-template-x-hook-image-diagram-rich-v1.json` | X hook-image diagram-rich template v1 |
| design followup | `docs/54-proposed-prompt-template-schema.md` | 本ファイル |

**いずれも Studio に active 化されていない**。`schemas/index.ts` / `sanity.config.ts` は不変。

## 2. 3 schema の依存関係

```
promptTemplate
  ├── brandProfile (weak ref)
  └── visualStyleProfile (weak ref)

visualStyleProfile
  └── brandProfile (weak ref)
```

3 つを同時に activate しないと weak ref が解決されない（解決失敗してもエラーにはならないが、Studio 上で "Reference type not found" の警告が出る可能性）。

## 3. seed file の使い方

local-only。本バッチでは **`npx sanity documents create` を実行していない**。投入する場合の安全 path:

```bash
# (1) schemas/index.ts に proposed 3 つを追加 → npm run build を確認
# (2) 投入は1件ずつ（--replace 禁止、依存順を守る）
npx sanity documents create seed/brand-profile-hitori-media-os-default.json
npx sanity documents create seed/visual-style-profile-hitori-media-os-x-hook-image.json
npx sanity documents create seed/prompt-template-x-hook-image-diagram-rich-v1.json
```

依存順は **brandProfile → visualStyleProfile → promptTemplate**（後者が前者を ref するため）。

## 4. Campaign Generation Flow との対応

[`docs/48-campaign-generation-flow.md`](48-campaign-generation-flow.md) の 13 段フローにおいて、本バッチの schema は **段階 5（自動 prompt 選定）と段階 8（候補画像生成）** で使われる:

- 段階 5: Campaign Plan の `(platform, assetType, contentMode)` から `promptTemplate` を引く（Selection Keys）。今回作った `promptTemplate.x-hook-image-diagram-rich-v1` は `x / hook-image / building-in-public` で hit する。
- 段階 8: `promptTemplate.imageGenerationConfig` と `visualStyleProfile` を組み合わせて Codex exec / ChatGPT 手動に渡す。生成画像は inbox に v00N.png で保存。

## 5. text-only title card 失敗の構造的防止

`x-hook-main-v1/v001.png` が text-only に倒れた経緯を、本 schema は3層で防ぐ:

1. **`promptTemplate.imageGenerationConfig.forbiddenPatterns`** に `"centered-title-only as default"` と `"text-only title card"` を明示
2. **`visualStyleProfile.layoutPatterns`** に `centered-title-only` を **含めない**（5 つの diagram 系 layoutPattern のみ）
3. **`visualStyleProfile.visualModuleSet.diagramNodesMin = 2` / `diagramEdgesMin = 1`** で構造要素を必須化
4. **`variationStrategy: "3-pattern-default"` + `numberOfVariants: 3`** で diagram-first / typography-hybrid / metaphor-mix を強制
5. **`promptTemplate.imageGenerationConfig.selfReviewBeforeSaving: true`** で Codex 側に reviewRubric self-check を課す

これにより、prompt template から派生する全 candidate は構造的に「ただの text card」では生成されなくなる。

## 6. brandProfile の役割

[`brandProfile.hitori-media-os-default`](../seed/brand-profile-hitori-media-os-default.json) は:

- **voice / tone**: 一人称 / 語尾 / 距離感 / 避ける表現
- **visualVocabulary**: structured / app-like / modern / clean / diagram-friendly / trust-building / building-in-public
- **negativeStyleList**: face photo / AI brain icon / robot / clickbait / **text-only title card as default** など 17 件
- **platformToneOverrides**: X と Substack で語り口が違う場合の上書き
- **reviewPrinciples**: 元レコード改変なし / 完成断言なし / paid PDF引用なし / secret 露出なし / **text-only title card に倒れていないか** を毎回確認

これが promptTemplate / visualStyleProfile 双方から参照されることで、**全 prompt 生成と全 visual 生成で同じ禁忌が適用される**。

## 7. visualStyleProfile の adoption cycle

```
1. Visual Register Inbox Review で v00N.png を approve
2. patch JSON が assets/visuals/... への copy を確定
3. （未実装、次バッチ候補）visualStyleProfile.referenceImagePaths に最終 path を append
4. 次の同 assetType 生成時、(3) を tone reference として inline
```

`adoptedCandidatePaths` は inbox 由来の元 path を残す欄。`referenceImagePaths` は final asset の path を蓄積する欄。区別することで「inbox を整理した後も style anchor は残る」運用にする。

## 8. activate の意思決定 trigger

以下のすべてが揃った時点で active 化を再評価:

- [ ] brandProfile / visualStyleProfile / promptTemplate の seed が各 1 件以上で stable に動く
- [ ] campaignPlan schema 提案を別バッチで完了
- [ ] structure builder の "By Campaign" 子ノード設計
- [ ] tools 側の "promptTemplate を引いて Codex exec に流す" runner script
- [ ] Visual Register Inbox Review に reviewRubric 表示の準備

それまでは proposed のまま、`docs/47-50` + 本 doc + seed 3 件を「設計の固定点」として使う。

## 9. Out of scope（本 doc）

- Studio activate（`schemas/index.ts` への追加、`sanity.config.ts` への登録）
- `npx sanity documents create` 等の Sanity 投入
- 既存 `prompt` schema を instance として再定義する migration
- structure builder の拡張
- Codex / ChatGPT への自動 binding script
- paid API integration

## 10. 次バッチへの推奨

1. `schemas/proposed/campaignPlan.ts` を sketch（依然 proposed）
2. `seed/campaign-plan-building-hitori-media-os.json` を [`docs/49` Example B](49-platform-selection-model.md) から書く
3. 任意: `tools/codex-workflow/codex-exec-runner.mjs`（仮）の概念 sketch、promptTemplate を JSON から読んで Codex exec に渡す flow を文書化
4. 任意: Visual Register Inbox Review に `reviewRubric` を表示する UI 設計（本バッチでは未着手）
