# Handoff: Visual Register Content Idea linkage and Patch Review fix

Date: 2026-05-13

## 1. Task Goal

Visual RegisterのContent Idea連携、Patch Review visibility、上書き登録後のrow stateを確認・修正する。

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

- `tools/visual-register/server.mjs`
- `tools/visual-register/public/app.js`
- `docs/19-local-visual-register-ui.md`
- `docs/23-local-patch-review-helper.md`
- `docs/devlog/0046-visual-register-content-idea-and-patch-review-fix.md`
- `docs/handoff/latest.md`
- `docs/handoff/0056-visual-register-content-idea-and-patch-review-fix.md`

## 4. Summary of Changes

`visualAssetPlan` seed recordsが `sourceContentIdea` referenceを持つことを確認しました。

Visual Register APIは、各planに `sourceContentIdeaId` と `contentSlug` を付与して返すようにしました。

UIでは、登録先plan選択肢とpreview detailでContent Ideaを確認できるようにしました。

Patch Reviewの読み込みと画像登録の状態を分離し、Patch Review更新が失敗しても登録行をerrorにしないようにしました。

`GET /api/visual-patches` は `ok`、`patchesRoot`、`count`、`patches` を返し、`patches/visual-assets/` 以下をrecursiveに読みます。

## 5. Important Decisions

- Content Ideaとの親子関係はschema変更せず、既存の `sourceContentIdea` referenceを使う。
- MVPではContent Idea filterはまだ実装せず、まずID表示とdocs設計に留める。
- Patch Review errorはPatch Review sectionだけに出す。
- registration row errorは登録処理そのものの失敗だけを表す。
- Sanity direct writeは引き続き行わない。

## 6. Human Review Questions

- preview detailのContent Idea表示は十分か。
- Content Ideaが増える前にfilter/groupingを実装するべきか。
- Patch Review sectionのerror表示は分かりやすいか。
- 保存済み行に「再登録」ボタンが必要か。

## 7. Risks or Uncertainties

- ブラウザでの上書き登録再テストが必要です。
- 古いVisual Register processやブラウザcacheが残っていると、修正前の挙動に見える可能性があります。
- 複数Content Ideaを入れたときのUI scalingは未実装です。

## Validation

- `node --check tools/visual-register/server.mjs`: pass
- `node --check tools/visual-register/public/app.js`: pass
- `npm run build`: pass
- `seed/visual-asset-plan-records.json` の5件すべてが `sourceContentIdea._ref` を持つことを確認。
- `GET /api/visual-asset-plans` が `sourceContentIdeaId: contentIdea.ai-blog-db` と `contentSlug: ai-blog-db` を返すことを確認。
- `GET /api/visual-patches` が3件のpatchを返し、`patches/visual-assets/ai-blog-db/note-hero-v1.json` を含むことを確認。
- 未知の `/api/not-found-test` がJSON errorを返すことを確認。

## 8. Recommended Next Step

Visual Registerを再起動し、ブラウザで次を確認します。

- Patch Reviewに `patches/visual-assets/ai-blog-db/note-hero-v1.json` が表示される。
- ReloadしてもJSON parse errorが出ない。
- 既存ファイルがある未登録行では上書き確認が必要。
- 上書き確認後の登録で、rowが `登録完了 / 保存済み / Patch作成済み` になる。
- preview detailに `contentIdea.ai-blog-db` が表示される。

## 9. Exact Prompt to Give Codex Next

```text
Record the Visual Register Content Idea and Patch Review browser retest result.

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
- Visual Register restarted after latest fix: [yes/no + notes]
- Content Idea ID appears in preview detail: [yes/no + notes]
- Patch Review lists note-hero-v1 patch: [yes/no + notes]
- Patch Review reload works without JSON parse error: [yes/no + notes]
- Existing file warning appears before overwrite registration: [yes/no + notes]
- Register is blocked until overwrite checkbox is checked: [yes/no + notes]
- After overwrite registration, row shows saved/registered/Patch created state: [yes/no + notes]
- Patch Review error, if any, stays in Patch Review section only: [yes/no + notes]
- No direct Sanity write occurred: [yes/no]
- No unexpected image files were created: [yes/no + notes]

Tasks:
1. Record the browser retest result.
2. Update docs/devlog and handoff.
3. Recommend whether Content Idea filter/grouping should be implemented next.

After editing, summarize:
1. Whether the fix worked
2. Whether Content Idea linkage is clear
3. Whether Patch Review is stable
4. Whether Content Idea filter/grouping should come next
```
