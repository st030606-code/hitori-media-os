# Devlog 0046: Visual Register Content Idea linkage and Patch Review fix

Date: 2026-05-13

## 今日の判断

Visual RegisterのContent Idea連携、Patch Review表示、上書き登録後の状態管理を確認し、MVPを壊さない範囲で修正しました。

## 確認したこと

`seed/visual-asset-plan-records.json` の `visualAssetPlan` recordsは、すべて `sourceContentIdea` referenceを持っています。

現在の対象:

```text
contentIdea.ai-blog-db
```

関係は次の形です。

```text
Content Idea -> Diagram Plan -> Visual Asset Plan -> local image / patch JSON
```

Visual Register APIは、各planに `sourceContentIdeaId` と `contentSlug` を付与して返すようにしました。

これにより、将来Content Ideaが増えても、UI側でContent Idea filter / groupingを追加できます。

## 修正内容

### Patch Review visibility

`GET /api/visual-patches` は、`patches/visual-assets/` 以下をrecursiveに読みます。

次のようなpatch JSONを検出できます。

```text
patches/visual-assets/ai-blog-db/note-hero-v1.json
```

API responseには、`ok`、`patchesRoot`、`count`、`patches` を含めます。

patchが0件の場合もJSONを返します。

未知の `/api/*` routeもplain textではなくJSON errorを返します。

### Post-overwrite registration state

上書き登録後にrowがerrorになる原因になり得たのは、画像保存後の `loadPatches()` が登録処理と同じ `try/catch` に入っていたことです。

そのため、画像保存自体は成功しても、Patch Review更新が失敗すると登録行がerror扱いになり得ました。

修正後:

- registration stateとPatch Review loading stateを分離。
- 画像保存成功後はrowを `saved` にする。
- Patch Review更新が失敗しても、登録行はerrorにしない。
- Patch Review section側にだけ読み込みエラーを出す。

### Content Idea display

UIでは、登録先plan選択肢とpreview detailでContent Idea IDを確認できるようにしました。

## APIなしMVPとの関係

Sanityへ直接writeしていません。

Patch JSONは引き続きローカルで作成し、人間が確認してからSanity Studioで手動反映します。

`seed --replace` も使っていません。

## 次に確認すること

- Visual Registerを再起動する。
- Patch Reviewに `note-hero-v1` patchが表示されることを確認する。
- ReloadしてもJSON parse errorが出ないことを確認する。
- 既存ファイルがある未登録行では、上書き確認が必要なことを確認する。
- 上書き登録後、rowが `登録完了 / 保存済み / Patch作成済み` になることを確認する。
- 複数Content Ideaを扱う前に、Content Idea filterを実装するか判断する。

## ローカル検証

実装後に次を確認しました。

- `node --check tools/visual-register/server.mjs`: pass
- `node --check tools/visual-register/public/app.js`: pass
- `npm run build`: pass
- `seed/visual-asset-plan-records.json` の5件すべてが `sourceContentIdea._ref` を持つ。
- 参照先は `contentIdea.ai-blog-db`。
- 一時ポート `3335` で `GET /api/visual-asset-plans` を確認し、`sourceContentIdeaId`、`contentSlug`、`expectedPatchPath` が返ることを確認。
- 一時ポート `3335` で `GET /api/visual-patches` を確認し、3件のpatchが返ることを確認。
- `patches/visual-assets/ai-blog-db/note-hero-v1.json` がPatch Review API結果に含まれることを確認。
- 未知の `/api/not-found-test` がplain textではなくJSON errorを返すことを確認。
- 検証用serverは停止しました。

## 発信ネタになりそうな切り口

- 「生成AIワークフローは、データの親子関係が見えないと運用が破綻する」
- 「画像登録UIでは、登録成功とPatch Review失敗を同じerrorにしてはいけない」
- 「Content Idea単位で画像・patch・公開物を束ねると、ひとりメディア運用が追いやすくなる」
