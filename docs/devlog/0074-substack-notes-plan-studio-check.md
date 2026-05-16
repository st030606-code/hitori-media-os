# Devlog 0074: substackNotesPlan Studio UI Check (manual, passed)

Date: 2026-05-14

## 今日の判断

前バッチで活性化した `substackNotesPlan` と、復元した `substackPostPlan.relatedNotesPlan` を、人間がローカル Sanity Studio で実際にブラウザ確認しました。結果は問題なし。

- Sanity Studio の document type 一覧に「Substack Notes計画（Substack Notes Plan）」が表示された。
- 新規作成フォームが正しく開く。
- prePostNotes / postLaunchNotes の object array UI（noteType radio + body text）が動作。
- conversationPrompts / ctaVariants / humanReviewChecklist の string array UI が動作。
- status radio（planned / drafted / ready-for-human-edit / partially-published / completed / archived）が動作。
- `substackPostPlan` の編集画面で復元した `relatedNotesPlan` reference フィールドが表示され、Notes Plan を選択できる。
- ブロッキング問題なし。
- スキーマ active を維持する判断。

## 確認できたこと

- `prePostNotes` / `postLaunchNotes` 配列で、要素ごとに `noteType` の選択肢（discovery / interaction / pre-post / post-launch / question / build-log / lesson-learned / soft-cta）が radio / select として表示される。
- `_key` の自動付与が機能。
- `conversationPrompts` / `ctaVariants` / `humanReviewChecklist` の string array 編集UI（追加・削除・並び替え）が問題なし。
- `substackPostPlan` の `relatedNotesPlan` reference フィールドで、`substackNotesPlan.building-hitori-media-os.first-post-notes` を選択できる。
- PostPlan ↔ NotesPlan の往復参照（`relatedNotesPlan` / `relatedPostPlan`）が両方の編集画面で確認できる。

## 残った検討事項

- `prePostNotes` / `postLaunchNotes` の `body` は text 3 rows のまま。Note 1本が長くなる傾向はないので維持。
- `notesPurpose` を `string` の options 選択にしたが、配列要素の `noteType` と responsibility が一部重なる印象。運用しながら整理する余地あり。

これらは今すぐの修正は不要。

## なぜ active 維持の判断にしたか

- フィールド設計の違和感がなかった。
- 復元した `relatedNotesPlan` が想定通り両方向で機能している。
- PostPlan ↔ NotesPlan の reference 整合（先に NotesPlan、続いて PostPlan を投入する想定）も問題なく動く構造。

## 次の活性化候補

`substackGrowthAction` に進む。理由:

- PostPlan / NotesPlan が active になったので、Substack 上で実行する手動アクションを記録する場所が必要になってきた。
- About Page 更新、Welcome Email 更新、Notes engagement、cross-post promotion などを ad-hoc メモではなく構造化レコードで残せる。
- 残り2本（SubscriberMilestone / PaidReadiness）は、subscriber が動き始めるまで proposed-only に据え置く。

## 検証

- 人間が `npm run dev` を起動して Studio をブラウザで確認。
- test seed をローカル投入（NotesPlan → PostPlan の順、`seed --replace` 不使用）。
- 既存 build / local-check には影響なし。

## 次にやること

- `substackGrowthAction` 活性化バッチを同じ Activation Checklist に沿って実施する。
- 活性化後の Studio UI 確認まで進める。
