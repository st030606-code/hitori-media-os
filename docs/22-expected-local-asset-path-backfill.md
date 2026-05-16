# expectedLocalAssetPath Backfill Workflow

このドキュメントは、既存のSanity `visualAssetPlan` documentsへ `expectedLocalAssetPath` を安全に追加するための手順です。

コードからSanityへ直接writeしません。

## 推奨判断

既存document全体のseed replaceではなく、`expectedLocalAssetPath` だけを追加するpatch JSON方式を推奨します。

理由:

- 既存の `localAssetPath`、`status`、`reviewNotes` を上書きしない。
- 変更fieldが1つだけなのでレビューしやすい。
- Studio手動更新にも、将来のCLI patch helperにも使える。
- seed replaceより事故範囲が小さい。

## 作成したpatch JSON

次の5件を用意しました。

- `patches/visual-asset-plans/expected-local-asset-paths/note-hero-v1.json`
- `patches/visual-asset-plans/expected-local-asset-paths/x-hook-before-after.json`
- `patches/visual-asset-plans/expected-local-asset-paths/instagram-carousel-cover.json`
- `patches/visual-asset-plans/expected-local-asset-paths/github-architecture-diagram.json`
- `patches/visual-asset-plans/expected-local-asset-paths/youtube-thumbnail-before-after.json`

各patchは次だけを設定します。

```json
{
  "set": {
    "expectedLocalAssetPath": "..."
  }
}
```

`meta.directSanityWrite` は `false` です。

## Manual Studio Update

MVPでは、この手順を推奨します。

1. Sanity Studioを開く。
2. `ビジュアルアセット計画（Visual Asset Plan）` を開く。
3. patch JSONの `_id` と同じdocumentを探す。
4. `保存予定パス（Expected Local Asset Path）` にpatch JSONの値を貼る。
5. 既存の `localAssetPath`、`status`、`reviewNotes` を意図せず変えていないか確認する。
6. 保存する。
7. Studio上で `expectedLocalAssetPath` が表示されることを確認する。

## Why Not Seed Replace

`npx sanity documents create seed/visual-asset-plan-records.json --replace` のようなseed replaceは、既存document全体を置き換える可能性があります。

今回は、すでにStudio上で更新された `localAssetPath`、`status`、`reviewNotes` が存在する可能性があります。

そのため、seed replaceは推奨しません。

## Why Not Direct CLI Patch Yet

CLI patch helperは将来有効ですが、現時点では実装しません。

理由:

- Sanity token管理が必要になる。
- 誤反映時の影響が大きい。
- まずStudio手動更新でfieldの見え方と運用を確認したい。

## Studio Review Checklist

反映後、次を確認します。

- `expectedLocalAssetPath` が5件すべてに入っているか。
- `localAssetPath` は実保存済み画像だけに入っているか。
- `expectedLocalAssetPath` と `localAssetPath` の違いが理解しやすいか。
- `status` が意図せず変わっていないか。
- `reviewNotes` が上書きされていないか。
- Visual Registerで表示される保存予定パスとStudioの値が一致するか。

## Visual Register Retest

Studio反映後、Visual Registerを再度開きます。

確認すること:

- `visualAssetPlan.ai-blog-db.note-hero-v1` の保存予定パスが表示される。
- X、Instagram、GitHub、YouTubeの各planでも予定パスが表示される。
- `expectedLocalAssetPath` がない場合のfallbackも残っている。
- 登録後のpatch JSONは `localAssetPath` を実績値として更新する。
