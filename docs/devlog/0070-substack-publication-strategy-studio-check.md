# Devlog 0070: substackPublicationStrategy Studio UI Check (manual, passed)

Date: 2026-05-14

## 今日の判断

前バッチで活性化した `substackPublicationStrategy` を、人間がローカル Sanity Studio で実際にブラウザ確認しました。結果は問題なし。

- Sanity Studio の document type 一覧に「Substack発行戦略（Substack Publication Strategy）」が表示された。
- 新規作成フォームが正しく開く。
- test seed `seed/substack-publication-strategy-building-hitori-media-os.json` を手動投入し、各フィールドが期待どおりレンダリングされたことを確認。
- ブロッキングなフィールド問題は見つからず。
- スキーマ active を維持する判断。

## 確認できたこと

- 左ナビに「Substack発行戦略」が出る。
- title / slug / sourceContentIdea / relatedContentIdeas / targetReader / positioningStatement / coreTopics（min 1 / max 3）/ publicationPromise / freeContentRole / paidContentRole / notesRole / postRole / subscriberCTA / aboutPageDraft / welcomeEmailDraft / voiceContentFormat（voice / content / format ネスト）/ status radio / reviewNotes が想定通り出る。
- reference UI は `contentIdea.building-hitori-media-os` / `contentIdea.ai-blog-db` を解決できた。
- radio status の選択肢（draft / strategy-ready / in-use / needs-review / archived）が表示される。

## 残った検討事項

- `aboutPageDraft` / `welcomeEmailDraft` を text 6 rows のままにするか、portable text にするかは引き続き検討（運用しながら判断）。
- `coreTopics` の min 1 / max 3 validation は許容範囲（Hitori Media OS の 3 topics で運用予定）。

これらは Studio UI で実運用しながら判断する。今すぐの修正は不要。

## なぜ active 維持の判断にしたか

- フィールド設計の違和感がなかった。
- 既存 `contentIdea` reference との整合が取れていた。
- radio status とバリデーション挙動が想定通りだった。
- `sanity.config.ts` 未変更のまま動作することを確認できた。

## 次の活性化候補

`substackPostPlan` に進む。理由:

- `substackPublicationStrategy` への reference を持つので、土台が active になった今が活性化タイミング。
- building-hitori-media-os Substack 公開の手前で、Post 単位の計画を Studio で書けるようにすると、運用フィードバックが取りやすい。
- 残り4本（NotesPlan / GrowthAction / SubscriberMilestone / PaidReadiness）は引き続き proposed-only。

## 検証

- 人間が `npm run dev` を起動して Studio をブラウザで確認。
- test seedをローカル投入（`npx sanity documents create` の人間判断は本人が実施。`seed --replace` 不使用）。
- 既存 build / local-check には影響なし。

## 次にやること

- このdevlog で「Studio UI check OK」を残しておくと、次バッチ（`substackPostPlan` の活性化）に進める。
- `substackPostPlan` 活性化バッチを同じ Activation Checklist に沿って実施する。
