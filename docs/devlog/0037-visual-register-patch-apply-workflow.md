# 0037: Visual Register patch JSON apply workflow設計

日付: 2026-05-13

## 背景

Visual Registerは、手動生成した画像を `assets/visuals/...` に保存し、Sanity更新用patch JSONを `patches/visual-assets/...` に作れるようになりました。

次の課題は、そのpatch JSONをどう安全にSanityへ反映するかです。

現時点では、Visual RegisterからSanityへ直接writeしません。

## 追加・更新

追加:

- `docs/21-visual-register-patch-apply-workflow.md`

更新:

- `docs/19-local-visual-register-ui.md`
- `docs/20-frontend-ui-design-system.md`

## 決定

MVPでは、Manual Studio updateを推奨します。

流れ:

1. Visual Registerで画像を登録する。
2. `assets/visuals/...` の画像を確認する。
3. `patches/visual-assets/...` のpatch JSONを確認する。
4. Sanity Studioで対象の `visualAssetPlan` を開く。
5. patch JSONの `set` 内容を手動で反映する。
6. Studioで保存後、表示を再確認する。

## 比較した選択肢

### Manual Studio update

初期MVPでは最も安全です。

対象documentとfieldを目視確認でき、patch形式の運用も学べます。

### CLI patch command

将来、件数が増えた段階で検討します。

ただし、Sanity token管理と誤反映リスクがあるため、現時点では実装しません。

### Future dashboard direct write

買い手向けには最終的に自然ですが、confirm dialog、patch preview、権限、失敗時処理が必要です。

Next.js dashboard以降に回します。

## まだ手動のこと

- patch JSONレビュー
- Sanity Studioでの手入力
- 画像の見た目レビュー
- 公開パッケージへの組み込み
- 投稿・公開

## 次の一手

次は、複数画像でBatch Visual Registerをテストするか、Visual Registerに既存ファイル上書き確認を追加します。

Next.jsはまだ追加しません。
