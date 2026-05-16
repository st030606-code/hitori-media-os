# 0043: Local Patch Review helper design

日付: 2026-05-13

## 背景

Visual Registerはpatch JSONを作成できるようになりました。

ただし、Sanity Studioへ手動反映するときに、`localAssetPath`、`status`、`updatedAt`、`reviewNotes` を見間違える可能性があります。

そこで、Sanityへ直接writeせず、patch JSONを安全に確認するためのLocal Patch Review helperを設計しました。

## 追加・更新

追加:

- `docs/23-local-patch-review-helper.md`

更新:

- `docs/21-visual-register-patch-apply-workflow.md`
- `docs/20-frontend-ui-design-system.md`

## 推奨方針

MVPでは、Patch Review helperはVisual Registerの一部として実装するのがよいです。

理由:

- Visual Registerがpatch JSONを作る。
- 同じ画面で確認できる方が買い手に分かりやすい。
- 既存のLocal Node helper serverでpatch JSONとlocal image pathを読める。
- 将来Next.js dashboardへ移行するときに `PatchJsonPreview` componentへ分離しやすい。

## Patch Reviewで表示するもの

- patch file path
- target document ID
- fields to update
- `localAssetPath`
- `status`
- `updatedAt`
- `reviewNotes`
- local file exists
- `meta.directSanityWrite`

## Validation

最低限、次を確認します。

- patch JSONがvalid JSON
- `_id` がある
- `set.localAssetPath` がある
- local fileが存在する
- path traversalがない
- `meta.directSanityWrite` が `false`
- secretらしき値がない

## まだしないこと

- Sanity direct write
- Sanity token読み込み
- patch自動適用
- patch自動削除
- 画像生成
- 自動投稿

## 次の一手

次に実装するなら、Visual Register内にread-only Patch Review sectionを追加します。

最初は一覧、詳細、validation chipsだけで十分です。

copy buttonやCLI patch helperは、read-only reviewが安定してから追加します。
