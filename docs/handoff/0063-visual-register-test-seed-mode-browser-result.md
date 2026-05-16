# Handoff: Visual Register test seed mode browser result

Date: 2026-05-14

## 1. Task Goal

Visual Register test seed modeのブラウザ/API確認結果を記録し、mismatchの原因を明確にする。

## 2. Constraints Followed

- Next.jsは追加していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 画像生成API呼び出しは実装していません。
- 自動投稿は実装していません。
- Sanityへ直接writeしていません。
- `seed --replace` は実行していません。
- シークレットは追加していません。
- 新しい生成画像は作成していません。

## 3. Changed Files

- `docs/devlog/0051-visual-register-test-seed-mode-debug.md`
- `docs/handoff/0063-visual-register-test-seed-mode-browser-result.md`

## 4. Summary of Changes

実際にブラウザで使う `localhost:3334` を `VISUAL_REGISTER_INCLUDE_TEST_SEEDS=true` で起動し直し、test seed modeが動作することを記録しました。

結果:

- test seed mode: enabled
- loaded visualAssetPlan records: 8
- loaded seed files:
  - `seed/visual-asset-plan-records.json`
  - `seed/visual-asset-plan-records-test-trail-training.json`
- Content Idea filter shows:
  - `ai-blog-db`
  - `trail-training-3months`
- plan select grouping works
- Patch Review stayed stable

## 5. Important Decisions

- test seed modeは検証済みとして扱います。
- earlier mismatchはseed loading logicではなく、実サーバープロセスの起動条件・環境変数のズレが原因でした。
- default modeは引き続きmain seedのみ、期待件数5件です。
- test modeはmain seed + test seed、期待件数8件です。

## 6. Human Review Questions

- test mode起動をMac launcherから選べるようにする必要があるか。
- 次にplatform / assetType / status filterを入れるか。
- ここからはPhase 1 MVP stabilizationを優先するか。

## 7. Risks or Uncertainties

- test modeは開発・検証用であり、通常運用では使いません。
- seed fileが増えると、UI filterがさらに必要になります。

## 8. Recommended Next Step

新機能追加をいったん止め、Phase 1 MVP stabilizationへ移ります。

## 9. Exact Prompt to Give Codex Next

```text
Move into Phase 1 MVP stabilization.

Create stabilization docs, E2E checklist, known backlog, current demo flow, update README, and update handoff/devlog.
Do not add Next.js, paid LLM API integrations, image generation API calls, auto-posting, direct Sanity write, seed --replace, secrets, or generated images.
```
