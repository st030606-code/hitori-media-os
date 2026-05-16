# Handoff: Proposed Substack Strategy Schemas (read-only sketches)

Date: 2026-05-14

## 1. Task Goal

Substack 戦略レイヤー用のSanityスキーマを、`schemas/proposed/` 配下に **read-only 提案** として6本＋READMEで追加する。`schemas/index.ts` / `sanity.config.ts` には何も登録せず、Studioには一切影響させない。今後の人間レビューと段階的活性化に備える。

## 2. Constraints Followed

- 提案スキーマを `schemas/index.ts` に import / export していない。
- `sanity.config.ts` の `schemaTypes` にも追加していない。
- Studioへの活性化はしていない。
- Next.jsは追加していない。
- paid LLM API integrationは追加していない。
- OpenAI API / Anthropic API clientsは追加していない。
- image generation API callsは実装していない。
- auto-postingは実装していない。
- Sanity direct writeは実装していない。
- Sanity CLI create/update commandsは実行していない。
- `seed --replace` は実行していない。
- 実project ID、APIキー、トークン、認証情報、シークレットは追加していない。
- 有料PDF本文の引用は含めていない。
- 新規media fileは生成していない。
- 既存ファイルを破壊的に上書きしていない。

## 3. Changed Files

### Added

- `schemas/proposed/substackPublicationStrategy.ts`
- `schemas/proposed/substackPostPlan.ts`
- `schemas/proposed/substackNotesPlan.ts`
- `schemas/proposed/substackGrowthAction.ts`
- `schemas/proposed/substackSubscriberMilestone.ts`
- `schemas/proposed/substackPaidReadiness.ts`
- `schemas/proposed/README.md`
- `docs/devlog/0067-proposed-substack-strategy-schemas.md`
- `docs/handoff/0079-proposed-substack-strategy-schemas.md`

### Modified

- `docs/handoff/latest.md`

### Confirmed unchanged

- `schemas/index.ts`（`git diff` 空）
- `sanity.config.ts`（`git diff` 空）

## 4. Summary of Changes

### Proposed schemas

| File | Purpose | Status Lifecycle |
| --- | --- | --- |
| `substackPublicationStrategy.ts` | publication全体の戦略（positioning / Voice・Content・Format / 役割 / About・Welcome・CTA） | draft → strategy-ready → in-use → needs-review → archived |
| `substackPostPlan.ts` | 1本のSubstack Post計画（titleOptions / emailSubjects / preview / opening / sections / readerQuestion / CTA / repurpose / publishPackagePath / publishedUrl） | idea → outline-ready → draft-ready → ready-for-human-edit → published → archived |
| `substackNotesPlan.ts` | Notes計画（prePost / postLaunch / conversationPrompts / ctaVariants） | planned → drafted → ready-for-human-edit → partially-published → completed → archived |
| `substackGrowthAction.ts` | growth action手動ログ（actionType, targetPlatform, description, expectedOutcome, resultNotes, safetyNotes） | planned → ready → done → skipped → needs-review |
| `substackSubscriberMilestone.ts` | subscriberマイルストーン記録（数値は手動）、subscriberSourcesは Source × 推定数 × メモ | planned → reached → missed → archived |
| `substackPaidReadiness.ts` | paid化準備判定（trustSignals / audienceQuestions / repeatedDemand / candidateOffer / freePaidBoundary / readinessLevel / readinessScore / reasonsToWait / nextValidationActions） | not-ready → observing → validation-needed → ready-to-test → paused |

各ファイル先頭に `PROPOSED SCHEMA — NOT ACTIVE IN STUDIO.` のコメントと、登録していないことを明示。

### README

- 「これらは active ではない」「`schemas/index.ts` に足していない」「`sanity.config.ts` に足していない」を最初に明示。
- なぜSubstack戦略を独立レイヤーにするか、各提案スキーマの目的、既存スキーマとの関係を整理。
- Activation Checklist（10ステップ、1ファイルずつ進める）と recommended activation order（`substackPublicationStrategy` を最初に1本だけ）を記載。
- Safety Notes（direct write しない、auto-posting しない、subscriber個人情報を扱わない、有料PDFの引用なし）。

## 5. Important Decisions

- 6本を一度に Studio に投入しない。最初は提案として置き、人間がレビューしてから1ファイルずつ活性化する。
- 最初に活性化する候補は `substackPublicationStrategy`。他の5本がこれを `publicationStrategy` 参照で持つため、依存関係が綺麗。
- `substackPaidReadiness` を「急がない理由を残す欄」として明示。これにより、paid化を急ぐ衝動を仕組みで抑える。
- `substackSubscriberMilestone` の数値入力は手動と明記。Substack APIを叩く設計にはしない。

## 6. Human Review Questions

- 6本の中で、不要 / マージしたい schema はあるか（例: NotesPlanをPostPlanの中に内包する案など）。
- `substackPublicationStrategy` の `voiceContentFormat` を object でまとめたが、フラットなフィールド3つに分けたいか。
- `substackPostPlan` の `mainSections` を array of object（heading + body）として扱っているが、`platformOutput` の `body` フィールドとの責務分担をどうするか。
- `substackGrowthAction` の `actionType` の選択肢は十分か。`paid trial offer outreach` など追加するか。
- `substackPaidReadiness` の `readinessScore` は主観で良いか、信頼可能な定量シグナル（例: 直近 30日の return rate）に置き換えるか。
- 活性化の最初のタイミング（X / Substack 公開後 / building-hitori-media-os 公開後 / 次キャンペーン着手前）をどこに置くか。

## 7. Risks or Uncertainties

- 提案スキーマは `defineType` を呼んで named export しているため、誤って `schemas/index.ts` に import するとすぐ active になってしまう。各ファイル先頭のコメントが最後の防波堤。
- README の Activation Checklist を読まずに6本まとめて登録すると、Studio UI が一気に増えて運用判断が雑になる可能性。最初は1本だけにする方針を `latest.md` でも引き続き強調する。
- 一部フィールド（例: `subscriberSources` の `count`）は将来 Substack のCSVエクスポートと連動させると便利だが、現段階では手動入力前提。

## 8. Recommended Next Step

- 人間が `schemas/proposed/` の README と各 `.ts` を読み、フィールド設計をレビューする。
- 違和感があれば `schemas/proposed/` 内で修正（Studioへの副作用ゼロ）。
- レビュー後、`substackPublicationStrategy.ts` を1本だけ活性化する別バッチへ進む（README の Activation Checklist 通り）。
- 並行して、building-hitori-media-os の text-first 4 媒体を手動公開し、reader-list の入り口を実際に作る。
- 公開後、`substackPublicationStrategy` の `aboutPageDraft` / `welcomeEmailDraft` を埋めて、UIの使い勝手と過不足を判断する。

## 9. Exact Prompt to Give Codex Next

```text
Activate substackPublicationStrategy as the first proposed Substack schema, following schemas/proposed/README.md activation checklist.

Do not add Next.js.
Do not add paid LLM API integrations.
Do not call external APIs.
Do not auto-post.
Do not write directly to Sanity.
Do not run seed --replace.
Do not commit the original paid PDF or any verbatim long passages from it.

Use:
- schemas/proposed/substackPublicationStrategy.ts (now copy/move into the active schemas folder)
- schemas/proposed/README.md (activation checklist)
- schemas/index.ts (must be modified to add this schema only)
- sanity.config.ts (no changes needed unless schemaTypes import path changes)
- docs/strategy-modules/substack-strategy-module.md
- docs/strategy-sources/substack-textbook-notes.md

Activation steps:
1. Move (or copy) substackPublicationStrategy.ts from schemas/proposed/ to schemas/.
   - Remove the "PROPOSED SCHEMA — NOT ACTIVE IN STUDIO." comment block.
   - Keep the rest of the file intact.
2. Add the new import and array entry to schemas/index.ts.
3. Run "npm run build" and confirm it succeeds.
4. Add a single test seed JSON under seed/ (do NOT use --replace), e.g. seed/substack-publication-strategy-building-hitori-media-os.json.
5. Manually open Sanity Studio (npm run dev) and verify the new document type renders correctly.
6. Do NOT activate the other 5 proposed schemas yet.

Document:
- the move, including a note that the proposed file is now retired (delete or keep marker file)
- which seed was added
- any validation issues
- whether the activation is considered safe to keep

Update devlog and handoff.
```
