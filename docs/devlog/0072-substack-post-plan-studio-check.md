# Devlog 0072: substackPostPlan Studio UI Check (manual, passed)

Date: 2026-05-14

## 今日の判断

前バッチで活性化した `substackPostPlan` を、人間がローカル Sanity Studio で実際にブラウザ確認しました。結果は問題なし。

- Sanity Studio の document type 一覧に「Substack Post計画（Substack Post Plan）」が表示された。
- 新規作成フォームが正しく開く。
- titleOptions / emailSubjectOptions / mainSections の object array / humanReviewChecklist / status radio すべて動作。
- test seed の reference UI もチェックでき、ブロッキング問題なし。
- スキーマ active を維持する判断。

## 確認できたこと

- `titleOptions` の string array UI が想定通り（追加・削除・並び替え動作）。
- `emailSubjectOptions` の string array UI も同様。
- `mainSections` の object array（heading + body）UI が機能し、配列要素に `_key` が自動付与される動作を確認。
- `humanReviewChecklist` の string array UI も問題なし。
- `status` radio に idea / outline-ready / draft-ready / ready-for-human-edit / published / archived が表示される。
- reference UI（`sourceContentIdea` / `publicationStrategy`）が `contentIdea.building-hitori-media-os` / `substackPublicationStrategy.building-hitori-media-os` を解決した。
- `publishedUrl` は `type: url` のままで、公開後にコピペで問題なく入る。

## 残った検討事項

- `mainSections` の body を text 6 rows のままにするか、portable text に上げるかは引き続き検討。長文化したら判断する。
- `publishedUrl` を `string` に緩めるかどうかも、運用しながら判断する。

これらは今すぐの修正は不要。

## なぜ active 維持の判断にしたか

- フィールド設計の違和感がなかった。
- `substackPublicationStrategy` reference との整合が取れていた。
- `relatedNotesPlan` を一時削除した状態のままだが、UIの欠落は感じなかった（NotesPlan 活性化時に戻す予定）。
- radio status と string array のバリデーション挙動が想定通り。

## 次の活性化候補

`substackNotesPlan` に進む。理由:

- `substackPostPlan` が active になったので、Notes計画を独立レコードで扱える素地ができた。
- `substackPostPlan` の `relatedNotesPlan` を復元するタイミングとしても自然。
- 残り3本（GrowthAction / SubscriberMilestone / PaidReadiness）は引き続き proposed-only。

## 検証

- 人間が `npm run dev` を起動して Studio をブラウザで確認。
- test seedをローカル投入（`npx sanity documents create` の人間判断は本人が実施。`seed --replace` 不使用）。
- 既存 build / local-check には影響なし。

## 次にやること

- このdevlog で「Studio UI check OK」を残しておくと、`substackNotesPlan` 活性化バッチに進める。
- 活性化と同時に `substackPostPlan` の `relatedNotesPlan` フィールドを復元する。
