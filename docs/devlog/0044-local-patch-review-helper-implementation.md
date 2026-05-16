# 0044: Local Patch Review helper implementation

日付: 2026-05-13

## 背景

Visual Registerは画像登録後にpatch JSONを作成します。

ただし、Sanity Studioへ手動反映する前に、patch JSONの中身、対象document、画像ファイルの存在を確認する必要があります。

そこで、Visual Register内にread-onlyのPatch Review sectionを追加しました。

## 実装

### Server

`tools/visual-register/server.mjs` にread-only endpointを追加しました。

```text
GET /api/visual-patches
```

このendpointは `patches/visual-assets/` 以下のpatch JSONを読み、次を返します。

- patch file path
- target document ID
- `set.localAssetPath`
- `set.status`
- `set.updatedAt`
- `set.reviewNotes`
- `meta`
- validation結果

Sanityへwriteはしません。

### Validation

確認する項目:

- valid JSON
- `_id` がある
- `set` がある
- `set.localAssetPath` がある
- `set.status` がある
- `set.updatedAt` がある
- `set.reviewNotes` がある
- `localAssetPath` がproject root外を指していない
- `localAssetPath` のファイルが存在する
- `meta.directSanityWrite` が `false`
- secretらしき値がない

### UI

`tools/visual-register/public/index.html`、`app.js`、`styles.css` を更新しました。

追加したもの:

- Patch Review card
- patch JSON一覧
- patch詳細パネル
- target document ID
- `localAssetPath`
- `status`
- `updatedAt`
- `reviewNotes`
- validation chips
- reload button

画像登録に成功した後、patch listも再読み込みします。

## まだしないこと

- Sanity direct write
- Sanity token読み込み
- patch自動適用
- copy button
- patch適用済み管理
- patch archive

## 次の一手

Visual Registerを開き、Patch Review sectionで既存の `note-hero-v1.json` が表示されるか確認します。

その後、Sanity Studioへ手動反映するときにcopy buttonが必要か判断します。
