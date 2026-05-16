# Handoff: Visual Register test seed mode

Date: 2026-05-13

## 1. Task Goal

Local Visual Registerで、main seedを変更せずに追加visualAssetPlan test seedを読み込める安全なtest modeを追加する。

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
- schema変更はしていません。

## 3. Changed Files

- `tools/visual-register/server.mjs`
- `tools/visual-register/public/index.html`
- `tools/visual-register/public/app.js`
- `tools/visual-register/public/styles.css`
- `docs/19-local-visual-register-ui.md`
- `docs/devlog/0050-visual-register-test-seed-mode.md`
- `docs/handoff/latest.md`
- `docs/handoff/0061-visual-register-test-seed-mode.md`

## 4. Summary of Changes

default modeでは、これまで通り `seed/visual-asset-plan-records.json` だけを読みます。

`VISUAL_REGISTER_INCLUDE_TEST_SEEDS=true` のときだけ、追加で `seed/visual-asset-plan-records-test-*.json` を読みます。

APIにはtest modeのflagを追加しました。

- `/api/health`: `includeTestSeeds`, `testSeedPattern`
- `/api/visual-asset-plans`: `includeTestSeeds`, `seedFiles`, `count`

UIにはtest mode時のnoticeを追加しました。

## 5. Important Decisions

- test seed loadingは明示的な環境変数がある場合だけ有効にする。
- main seedは変更しない。
- Sanity document createは実行しない。
- Patch Reviewは変更しない。

## 6. Human Review Questions

- test mode noticeは十分に目立つか。
- test modeの起動方法は分かりやすいか。
- 将来、launcherからtest modeを選べるようにする必要があるか。

## 7. Risks or Uncertainties

- test modeのブラウザ表示確認は必要です。
- test seedが増えすぎると、UI上の候補が増えるため、次にplatform / assetType filterが必要になる可能性があります。

## Validation

- `node --check tools/visual-register/server.mjs`: pass
- `node --check tools/visual-register/public/app.js`: pass
- `npm run build`: pass
- Default mode: `/api/visual-asset-plans` returned `includeTestSeeds: false`, `count: 5`, refs only `contentIdea.ai-blog-db`.
- Test mode: `/api/visual-asset-plans` returned `includeTestSeeds: true`, `count: 8`, refs `contentIdea.ai-blog-db` and `contentIdea.trail-training-3months`.
- Test mode seed files: `seed/visual-asset-plan-records.json`, `seed/visual-asset-plan-records-test-trail-training.json`.
- 検証用Visual Register serverは停止済み。

## 8. Recommended Next Step

Visual Registerをtest modeで起動し、ブラウザで次を確認します。

```bash
VISUAL_REGISTER_INCLUDE_TEST_SEEDS=true npm run visual:register
```

確認項目:

- test seed mode noticeが表示される。
- `/api/visual-asset-plans` が8件を返す。
- Content Idea filterに `ai-blog-db` と `trail-training-3months` が表示される。
- plan selectの `optgroup` が2つに分かれる。
- Patch Reviewは変わらず安定している。

## 9. Exact Prompt to Give Codex Next

```text
Record the Visual Register test seed mode browser test result.

Do not add Next.js yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement image generation API calls.
Do not implement auto-posting.
Do not write directly to Sanity.
Do not run seed --replace.
Do not commit secrets.
Do not create new generated image files.

Current result:
- Visual Register started with VISUAL_REGISTER_INCLUDE_TEST_SEEDS=true: [yes/no + notes]
- Test seed mode notice appears: [yes/no + notes]
- Content Idea filter shows ai-blog-db: [yes/no + notes]
- Content Idea filter shows trail-training-3months: [yes/no + notes]
- Plan count is 8: [yes/no + notes]
- Plan select optgroups are separated by Content Idea: [yes/no + notes]
- Default mode still returns only ai-blog-db plans: [yes/no + notes]
- Patch Review stayed stable: [yes/no + notes]
- No direct Sanity write occurred: [yes/no]
- No unexpected image files were created: [yes/no + notes]

Tasks:
1. Record the browser/API test result.
2. Update docs/devlog and handoff.
3. Recommend whether platform / assetType filter should come next.

After editing, summarize:
1. Whether test seed mode works
2. Whether default mode stayed unchanged
3. Whether Content Idea filter/grouping is validated
4. What should be implemented next
```
