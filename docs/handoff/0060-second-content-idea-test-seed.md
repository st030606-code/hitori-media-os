# Handoff: Second Content Idea test seed

Date: 2026-05-13

## 1. Task Goal

Visual RegisterのContent Idea filter / groupingを複数Content Ideaで検証できるように、2つ目のContent Idea seedと対応するvisualAssetPlan test recordsを作成する。

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
- 既存の `seed/visual-asset-plan-records.json` は変更していません。

## 3. Changed Files

- `seed/contentIdea-test-trail-training.json`
- `seed/visual-asset-plan-records-test-trail-training.json`
- `docs/19-local-visual-register-ui.md`
- `docs/devlog/0049-second-content-idea-test-seed.md`
- `docs/handoff/latest.md`
- `docs/handoff/0060-second-content-idea-test-seed.md`

## 4. Summary of Changes

2つ目のContent Idea test seedを追加しました。

```text
contentIdea.trail-training-3months
```

テーマ:

```text
トレラン初心者が最初の3ヶ月でやるべき練習4つ
```

対応するvisualAssetPlan test recordsを3件追加しました。

- note hero / eye-catch
- X hook image
- Instagram carousel cover

## 5. Important Decisions

- 既存の `ai-blog-db` seedには混ぜない。
- まず別seedとして持ち、Local Visual Registerの複数Content Idea検証に使う。
- 実画像は作らない。
- Sanityへcreateする場合も `documents create` のみを案内し、`--replace` は使わない。

## 6. Human Review Questions

- 2つ目のContent Ideaテーマとして、トレラン初心者テーマで十分に違いが分かるか。
- Visual Registerに複数seedを読み込ませる方法を一時的なdev-only設定で作るか。
- 先にSanityへcreateしてStudio確認するか、Local Visual Registerのseed loaderを拡張してから確認するか。

## 7. Risks or Uncertainties

- 現在のVisual Registerは `seed/visual-asset-plan-records.json` だけを読むため、このtest seedはまだUIに自動表示されません。
- 複数Content Idea filterの実ブラウザ確認には、次にseed loader側の安全なtest modeが必要です。

## 8. Recommended Next Step

Local Visual Registerに、dev/test用の追加seed読み込みを実装することを推奨します。

例:

- default: `seed/visual-asset-plan-records.json` のみ読む。
- optional test mode: `seed/visual-asset-plan-records-test-*.json` も読む。
- UIやdocsでtest modeだと分かるようにする。

その後、Content Idea filterが `ai-blog-db` と `trail-training-3months` の2つを表示するか確認します。

## 9. Exact Prompt to Give Codex Next

```text
Add a safe test mode for Local Visual Register to load additional visualAssetPlan seed files.

Do not add Next.js yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement image generation API calls.
Do not implement auto-posting.
Do not write directly to Sanity.
Do not run seed --replace.
Do not commit secrets.
Do not create new generated image files.

Goal:
Allow Visual Register to test Content Idea filter/grouping with the second test seed without modifying the main seed file.

Tasks:
1. Keep default behavior reading seed/visual-asset-plan-records.json only.
2. Add an explicit test mode, for example VISUAL_REGISTER_INCLUDE_TEST_SEEDS=true.
3. In test mode, also read seed/visual-asset-plan-records-test-*.json.
4. Return a clear flag in /api/health or /api/visual-asset-plans when test seeds are loaded.
5. Show a small UI notice when test seeds are included.
6. Do not change schemas.
7. Update docs/devlog and handoff.

After editing, summarize:
1. How test seed loading works
2. How to run Visual Register in test mode
3. Whether default behavior remains unchanged
4. What browser test should be run next
```
