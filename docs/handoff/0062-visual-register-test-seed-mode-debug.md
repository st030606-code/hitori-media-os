# Handoff: Visual Register test seed mode debug

Date: 2026-05-14

## 1. Task Goal

Local Visual Registerのtest seed modeで、noticeは出るがplan countが5件のままに見える問題をdebugし、API・UI・server logで実際のseed読み込み状態を確認できるようにする。

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
- `tools/visual-register/public/app.js`
- `docs/19-local-visual-register-ui.md`
- `docs/devlog/0051-visual-register-test-seed-mode-debug.md`
- `docs/handoff/latest.md`
- `docs/handoff/0062-visual-register-test-seed-mode-debug.md`

## 4. Summary of Changes

test seed loadingのdebug情報を増やしました。

APIに追加:

- `testSeedFiles`
- `loadedSeedFiles`
- `failedSeedFiles`
- `contentIdeaIds`
- `debugWarnings`

UIに追加:

- test mode noticeへplan数、Content Idea数、seed file数を表示。
- `includeTestSeeds=true` なのにplan数が5件以下などの場合、summaryに `要確認` を表示。

server startup log:

- test seed mode enabled/disabled
- loaded visualAssetPlan records
- loaded seed files
- discovered test seed files
- failed seed files
- seed warnings

## 5. Important Decisions

- default modeは変更しない。
- test seed loadingは引き続き `VISUAL_REGISTER_INCLUDE_TEST_SEEDS=true` のときだけ有効。
- Sanity document createやseed replaceはしない。
- 問題が起きたとき、UIだけでなくAPI responseとserver logで原因を見られるようにする。

## 6. Human Review Questions

- test mode noticeの情報量は十分か。
- browserで見ている3334 serverが本当にtest modeで起動しているか。
- Mac launcherにもtest mode起動オプションが必要か。

## 7. Risks or Uncertainties

- 実ブラウザの `localhost:3334` で再確認が必要です。
- 古いserver processが残っていると、修正前の挙動に見える可能性があります。
- test seedが増えるとplatform / assetType filterが必要になる可能性があります。

## Validation

- `node --check tools/visual-register/server.mjs`: pass
- `node --check tools/visual-register/public/app.js`: pass
- `npm run build`: pass
- Default mode returned `includeTestSeeds: false`, `count: 5`, `contentIdeaIds: ["contentIdea.ai-blog-db"]`.
- Default mode `loadedSeedFiles`: `seed/visual-asset-plan-records.json`.
- Test mode returned `includeTestSeeds: true`, `count: 8`, `contentIdeaIds: ["contentIdea.ai-blog-db", "contentIdea.trail-training-3months"]`.
- Test mode `loadedSeedFiles`: `seed/visual-asset-plan-records.json`, `seed/visual-asset-plan-records-test-trail-training.json`.
- Test mode `failedSeedFiles`: none.
- Test mode `debugWarnings`: none.
- 検証用Visual Register serverは停止済み。

## 8. Recommended Next Step

ブラウザで使う実サーバーをtest modeで起動し直して確認します。

```bash
VISUAL_REGISTER_INCLUDE_TEST_SEEDS=true npm run visual:register
```

確認項目:

- `/api/health` の `includeTestSeeds` が `true`
- `/api/visual-asset-plans` の `count` が `8`
- `loadedSeedFiles` に `seed/visual-asset-plan-records-test-trail-training.json` が含まれる
- `contentIdeaIds` が2件
- UI noticeに `8 plans / 2 Content Ideas` が表示される
- Content Idea filterに `ai-blog-db` と `trail-training-3months` が表示される

## 9. Exact Prompt to Give Codex Next

```text
Record the Visual Register test seed mode debug browser/API result.

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
- Actual localhost:3334 was restarted with VISUAL_REGISTER_INCLUDE_TEST_SEEDS=true: [yes/no + notes]
- /api/health includeTestSeeds: [true/false + notes]
- /api/visual-asset-plans count: [number + notes]
- loadedSeedFiles includes test trail seed: [yes/no + notes]
- failedSeedFiles: [none/list]
- contentIdeaIds includes ai-blog-db and trail-training-3months: [yes/no + notes]
- UI notice shows 8 plans / 2 Content Ideas: [yes/no + notes]
- Content Idea filter shows both Content Ideas: [yes/no + notes]
- plan select optgroups are separated by Content Idea: [yes/no + notes]
- Patch Review stayed stable: [yes/no + notes]
- No direct Sanity write occurred: [yes/no]
- No unexpected image files were created: [yes/no + notes]

Tasks:
1. Record the browser/API test result.
2. Update docs/devlog and handoff.
3. Recommend whether platform / assetType filter should come next.

After editing, summarize:
1. Whether test seed mode is now validated
2. Whether default mode remained unchanged
3. Whether the mismatch was caused by process/env mismatch or seed loading
4. What should be implemented next
```
