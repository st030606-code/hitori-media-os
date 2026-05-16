# Handoff: Phase 1 Release Candidate

Date: 2026-05-14

## 1. Task Goal

Phase 1 local-first MVPをrelease candidateとして扱えるか、repo-wide readiness reviewを行い、デモ前確認・次フェーズ計画・handoffを整備する。

## 2. Constraints Followed

- Next.jsは追加していない。
- paid LLM API integrationは追加していない。
- OpenAI API / Anthropic API clientsは追加していない。
- image generation API callsは実装していない。
- auto-postingは実装していない。
- Sanity direct writeは実装していない。
- `seed --replace` は実行していない。
- 実project ID、APIキー、トークン、認証情報、シークレットは追加していない。
- 新しい生成画像ファイルは作成していない。

## 3. Changed Files

- `README.md`
- `docs/28-phase-1-release-candidate-check.md`
- `docs/29-today-final-checklist.md`
- `docs/30-next-phase-plan.md`
- `docs/devlog/0053-phase-1-release-candidate.md`
- `docs/handoff/latest.md`
- `docs/handoff/0065-phase-1-release-candidate.md`

## 4. Summary of Changes

Phase 1 MVPをrelease candidateとして確認するための文書を追加しました。READMEからPhase 1 stabilization / release candidate関連文書へ直接移動できるようにし、今日の人間確認チェックリストとPhase 2の分割方針を明確にしました。

Validationとして、`node --check tools/visual-register/server.mjs`、`node --check tools/visual-register/public/app.js`、`npm run build` は成功しました。

## 5. Key Decisions

- Visual Registerの機能拡張はいったん止め、critical bug以外はPhase 2へ送る。
- Phase 1はlocal-first / no-API / manual-review MVPとして扱う。
- Phase 2は product polish、dashboard、automation の順に進める。
- Sanity direct write、画像生成API、自動投稿はまだ実装しない。

## 6. Human Review Questions

- `docs/29-today-final-checklist.md` の項目を今日の確認表として使いやすいか。
- buyer-facing explanation draft はボスの説明トーンに合っているか。
- Phase 2Aの優先順位は、Windows launcherよりPatch Review copy buttonsを先にするべきか。

## 7. Risks or Uncertainties

- Mac launcherとVisual Registerは手元環境での人間確認がまだ最終条件。
- 複数実画像でのbatch registrationは未完了。
- READMEが長くなっているため、将来はQuick Startと詳細docsに分ける可能性がある。
- secret scanで `docs/handoff/0009-handoff-workflow.md` の `000X-task-name` が検出されたが、これはテンプレート例でありシークレットではない。

## 8. Recommended Next Step

人間が `docs/29-today-final-checklist.md` に沿って、Mac launcher、Sanity Studio、Visual Register、Patch Review、Sanity Studio手動更新を確認する。

## 9. Exact Prompt to Give Codex Next

```text
Record the Phase 1 final human checklist result.

Do not add Next.js yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement image generation API calls.
Do not implement auto-posting.
Do not write directly to Sanity.
Do not run seed --replace.
Do not commit secrets.

Use:
- docs/29-today-final-checklist.md
- docs/28-phase-1-release-candidate-check.md

Record the human test result for:
- npm run build
- Mac launcher
- Sanity Studio
- Visual Register normal mode
- Visual Register test mode
- Patch Review
- Sanity Studio expectedLocalAssetPath/localAssetPath
- no secrets
- no direct Sanity write
- no API generation / auto-posting

Update docs/devlog and handoff.

After editing, summarize whether Phase 1 MVP can be marked stable and what Phase 2A task should start first.
```
