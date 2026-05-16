# Handoff: substackPublicationStrategy Studio UI Check (manual, passed)

Date: 2026-05-14

## 1. Task Goal

前バッチで活性化した `substackPublicationStrategy` を、人間がローカル Sanity Studio でブラウザ確認した結果を記録し、active 維持の判断を残す。次の活性化候補（`substackPostPlan`）に進むための前提を整える。

## 2. Constraints Followed

- Next.jsは追加していない。
- paid LLM API integrationは追加していない。
- OpenAI API / Anthropic API clientsは追加していない。
- external APIは呼んでいない。
- Sanity direct writeは実装していない。
- `seed --replace` は実行していない。
- 実project ID、APIキー、トークン、認証情報、シークレットは追加していない。
- 有料PDF本文の引用は含めていない。
- 新規media fileは生成していない。
- 既存ファイルを破壊的に上書きしていない。

## 3. Changed Files

### Added

- `docs/devlog/0070-substack-publication-strategy-studio-check.md`
- `docs/handoff/0082-substack-publication-strategy-studio-check.md`

### Confirmed unchanged

- `schemas/substackPublicationStrategy.ts`
- `schemas/index.ts`
- `seed/substack-publication-strategy-building-hitori-media-os.json`
- `sanity.config.ts`
- 既存 outputs / publish-packages

## 4. Summary of Changes

Studio 手動確認の結果:

- 「Substack発行戦略（Substack Publication Strategy）」が document type 一覧に表示。
- 新規作成フォームが想定通り開き、全フィールド（title / slug / sourceContentIdea / relatedContentIdeas / targetReader / positioningStatement / coreTopics min 1 / max 3 / publicationPromise / freeContentRole / paidContentRole / notesRole / postRole / subscriberCTA / aboutPageDraft / welcomeEmailDraft / voiceContentFormat / status radio / reviewNotes）が正しくレンダリングされた。
- test seed `seed/substack-publication-strategy-building-hitori-media-os.json` を手動投入したところ、reference UI（`sourceContentIdea` / `relatedContentIdeas`）も解決した。
- radio status の選択肢（draft / strategy-ready / in-use / needs-review / archived）も期待通り。
- ブロッキングなフィールド問題は見つからず。

判断:

- `substackPublicationStrategy` は active 維持。
- 次の活性化候補は `substackPostPlan`。

## 5. Important Decisions

- フィールド設計を現状維持。`aboutPageDraft` / `welcomeEmailDraft` の portable text 化は将来検討、今すぐは不要。
- `coreTopics` の min 1 / max 3 は Hitori Media OS の運用と一致しているので維持。
- 次の活性化は `substackPostPlan` 単独で進める。

## 6. Human Review Questions

- 運用しながら、`aboutPageDraft` / `welcomeEmailDraft` を portable text に移行したいタイミングはあるか。
- `coreTopics` を 1〜5 に緩めたいか、現状の 1〜3 でよいか。
- `substackPostPlan` 活性化後、test seed を1件作るタイミングはどこか（X / Substack 公開前か後か）。

## 7. Risks or Uncertainties

- Studio UI 確認はローカル環境のみで実施。本番 dataset での挙動はこれから検証。
- test seed は1件のみ。データが増えたときの UI 性能や、reference 一覧の操作性はまだ確認していない。

## 8. Recommended Next Step

- 続けて `substackPostPlan` を Activation Checklist に従って単独活性化する（本セッション後半で実施）。
- 他4本（NotesPlan / GrowthAction / SubscriberMilestone / PaidReadiness）は引き続き proposed-only。

## 9. Exact Prompt to Give Codex Next

このhandoff は本セッション内の中間記録なので、次セッションでは `docs/handoff/latest.md`（`substackPostPlan` 活性化後）を参照してください。
