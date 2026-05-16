# Handoff: Local Visual Register UI

Date: 2026-05-12

## 1. Task Goal

手動生成した画像をローカル保存し、Sanity更新用patch JSONを作る最小Local Visual Register UIを実装する。

## 2. Constraints Followed

- Next.jsは追加していません。
- フロントエンドダッシュボードは実装していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 画像生成API呼び出しは実装していません。
- 自動投稿は実装していません。
- Sanityへ直接writeしていません。
- 実project ID、APIキー、トークン、認証情報、シークレットはコミットしていません。
- 新しい画像ファイルは、手動テストでユーザーが選択した場合以外は作成しません。

## 3. Changed Files

- `package.json`
- `tools/visual-register/server.mjs`
- `tools/visual-register/public/index.html`
- `tools/visual-register/public/app.js`
- `tools/visual-register/public/styles.css`
- `docs/19-local-visual-register-ui.md`
- `docs/devlog/0031-local-visual-register-ui.md`
- `docs/handoff/latest.md`
- `docs/handoff/0039-local-visual-register-ui.md`

## 4. Summary of Changes

`npm run visual:register` を追加し、port `3334` でLocal Visual Register UIを起動できるようにしました。

UIは `visualAssetPlan` の選択、画像選択、プレビュー、expected path表示、画像登録、patch JSON生成を行います。

## 5. Key Decisions

- 依存パッケージを追加せず、Node標準ライブラリだけで実装する。
- Sanityへ直接writeせず、patch JSON生成までに留める。
- path traversalを防ぐため、書き込み先がproject root配下か検証する。
- 最初の実テスト対象は `visualAssetPlan.ai-blog-db.note-hero-v1` にする。

## 6. Human Review Questions

- UIは買い手が迷わず使えるか。
- expected pathの命名は運用に合っているか。
- patch JSON形式はSanity反映に使いやすいか。
- Mac launcherでStudioとVisual Registerの両方を開くようにするか。

## 7. Risks or Uncertainties

- 大きな画像はdata URL送信のため重くなる可能性があります。
- 初期版は画像拡張子変換をしないため、PNG保存前提の運用確認が必要です。
- Sanity反映はまだ手動です。

## 8. Recommended Next Step

`npm run visual:register` を起動し、実画像ファイルで `visualAssetPlan.ai-blog-db.note-hero-v1` の保存とpatch JSON生成を手動テストする。

成功したら、Mac launcherでSanity StudioとVisual Registerの両方を開くように更新する。

## 9. Exact Prompt to Give Codex Next

```text
Record the Local Visual Register manual test result.

Do not add Next.js yet.
Do not implement frontend dashboard yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement image generation API calls.
Do not implement auto-posting.
Do not commit real project IDs, API keys, tokens, credentials, or secrets.

Current result:
- I ran npm run visual:register: [success/failure + notes]
- Browser opened http://localhost:3334: [yes/no + notes]
- visualAssetPlan records loaded: [yes/no + notes]
- Image selection and preview worked: [yes/no + notes]
- Selected visualAssetPlan: [id]
- Register copied image to local path: [yes/no + path]
- Patch JSON was created: [yes/no + path]
- No direct Sanity write occurred: [yes/no]
- Any UI confusion or errors: [notes]

Use:
- tools/visual-register/
- docs/19-local-visual-register-ui.md
- seed/visual-asset-plan-records.json

Tasks:

1. Record the manual test result.
2. Update docs if the UI instructions need adjustment.
3. Recommend whether to update Mac launcher to open Visual Register too.
4. Update docs/devlog and handoff.

After editing, summarize:
1. Whether Visual Register worked
2. What files were created during manual test
3. What remains manual
4. What should be implemented next
```
