# Phase 1 Release Candidate

日付: 2026-05-14

## 背景

Sanity AI Content OS は、Phase 1の機能追加をいったん止め、local-first MVPとして扱えるかを確認する段階に入りました。

Visual Register、Patch Review、Content Idea filter / grouping、test seed modeまで入ったため、これ以上の機能拡張よりも、デモ前の安定確認とドキュメント整理を優先します。

## 決定・変更

- `docs/28-phase-1-release-candidate-check.md` を追加しました。
- `docs/29-today-final-checklist.md` を追加しました。
- `docs/30-next-phase-plan.md` を追加しました。
- READMEのStabilization Docsにrelease candidate関連ドキュメントを追加しました。
- Phase 2を product polish / dashboard / automation に分けました。

## 理由

今のMVPは、Sanity Studio、seed documents、Mac launcher、Local Visual Register、Patch Reviewを使って、APIなしの制作フローを一通り説明できます。

一方で、まだbuyer-facing dashboardではなく、Sanity direct writeや画像生成APIもありません。そのため、Phase 1 release candidateとして扱い、手動E2E確認を終えてから次フェーズに進むのが安全です。

## 影響

- 開発の重心が「機能追加」から「MVP安定化」に移ります。
- Visual Registerの新機能追加は、critical bug以外いったん止めます。
- 今日の確認事項が `docs/29-today-final-checklist.md` にまとまりました。
- 次フェーズの作業範囲が `docs/30-next-phase-plan.md` に分離されました。

## 検証

- `node --check tools/visual-register/server.mjs`
- `node --check tools/visual-register/public/app.js`
- `npm run build`

上記はこのタスクの最後に再実行し、すべて成功しました。

secret scanとして、README、docs、schemas、Sanity config、seed、tools、launchers、package.jsonを対象に、API key / token / hardcoded project IDらしき文字列を確認しました。実シークレットは見つかっていません。

`rg` は `docs/handoff/0009-handoff-workflow.md` の `000X-task-name` を検出しましたが、これはテンプレート例でありシークレットではありません。

## 次の一手

人間が `docs/29-today-final-checklist.md` に沿って、Mac launcher、Sanity Studio、Visual Register、Patch Review、Sanity Studio手動更新を確認します。

問題がなければ、Phase 1 MVP release candidateとして扱い、次はPhase 2Aのproduct polishに進みます。
