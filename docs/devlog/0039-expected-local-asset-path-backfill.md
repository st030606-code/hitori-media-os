# 0039: expectedLocalAssetPath backfill plan

日付: 2026-05-13

## 背景

`visualAssetPlan` に `expectedLocalAssetPath` を追加しました。

次に必要なのは、すでにSanity上に存在する `visualAssetPlan` documentsへ、この新fieldを安全に追加する方法です。

## 判断

seed replaceではなく、`expectedLocalAssetPath` だけを追加するpatch JSON方式を推奨します。

理由:

- 既存の `localAssetPath`、`status`、`reviewNotes` を上書きしない。
- 変更範囲が小さく、レビューしやすい。
- Studioで手動反映しやすい。
- 将来CLI patch helperを作る場合にも使える。

## 作成したpatch JSON

- `patches/visual-asset-plans/expected-local-asset-paths/note-hero-v1.json`
- `patches/visual-asset-plans/expected-local-asset-paths/x-hook-before-after.json`
- `patches/visual-asset-plans/expected-local-asset-paths/instagram-carousel-cover.json`
- `patches/visual-asset-plans/expected-local-asset-paths/github-architecture-diagram.json`
- `patches/visual-asset-plans/expected-local-asset-paths/youtube-thumbnail-before-after.json`

各patchは `expectedLocalAssetPath` だけを `set` します。

コードからSanityへ直接writeはしていません。

## 追加したdocs

- `docs/22-expected-local-asset-path-backfill.md`

## 次の一手

Sanity Studioで5件の `visualAssetPlan` を開き、patch JSONの値を `保存予定パス（Expected Local Asset Path）` に手動反映します。

反映後、Visual Registerで保存予定パスがStudioの値と一致するか再確認します。

## 実際の結果: seed --replace が先に実行された

予定していたpatch-only workflowを適用する前に、誤って次のコマンドが実行されました。

```bash
npx sanity documents create seed/visual-asset-plan-records.json --replace
```

この結果、5件すべての `visualAssetPlan` documentsに `expectedLocalAssetPath` は入りました。

Studioで表示確認済み:

- note hero
- X hook
- Instagram carousel cover
- GitHub architecture
- YouTube thumbnail

backfill自体は成功しています。

ただし、`--replace` はdocument全体を置き換えるため、既存の `localAssetPath`、`status`、`reviewNotes` がseedの値へ戻った可能性があります。

特に、以前Visual Registerで登録済みだったnote heroについて、Studio screenshot上では `localAssetPath` が空に見えるため、復旧確認が必要です。

## Recovery note

ローカル画像ファイルは存在しています。

```text
assets/visuals/ai-blog-db/note/hero/note-hero-v1.png
```

必要であれば、Sanity Studioで `visualAssetPlan.ai-blog-db.note-hero-v1` を開き、次を手動で復旧します。

- `localAssetPath`: `assets/visuals/ai-blog-db/note/hero/note-hero-v1.png`
- `status`: `saved`
- `reviewNotes`: 保存済み画像としてレビュー待ち、など現在の状態に合う文面

以前Visual Registerが作成したpatch JSONも復旧参考として使えます。

```text
patches/visual-assets/ai-blog-db/note-hero-v1.json
```

## 学び

部分的なfield backfillでは、`seed --replace` を避けます。

今後は、既存documentへfieldを追加する場合、次の順で進めます。

1. patch JSONを作る。
2. 変更fieldだけを確認する。
3. Studioで手動反映、または将来の確認付きCLI patch helperで反映する。
4. document全体のreplaceは、初期seed作成時または明示的に全置換したい場合だけ使う。
