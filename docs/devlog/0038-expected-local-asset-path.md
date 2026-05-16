# 0038: expectedLocalAssetPathをvisualAssetPlanへ追加

日付: 2026-05-13

## 背景

Visual Registerは画像を保存する予定パスを導出できます。

しかし、これまでは `visualAssetPlan.localAssetPath` が保存後に入る実績パスとして扱われていたため、保存前の予定パスがSanity側にありませんでした。

その結果、ユーザーがpatch JSONからパスをコピーしてStudioへ入れる必要がありました。

## 変更

`visualAssetPlan` に `expectedLocalAssetPath` を追加しました。

役割:

- `expectedLocalAssetPath`: 保存前から決まっている予定パス。
- `localAssetPath`: 実際に保存された後の実績パス。

Visual Registerは、保存先として `expectedLocalAssetPath` を優先します。

値がない場合だけ、従来通り安全なfallback pathを導出します。

## 更新したもの

- `schemas/visualAssetPlan.ts`
- `seed/visual-asset-plan-records.json`
- `tools/visual-register/server.mjs`
- `docs/14-visual-asset-plan.md`
- `docs/19-local-visual-register-ui.md`
- `docs/21-visual-register-patch-apply-workflow.md`

## seedに追加した予定パス

- `assets/visuals/ai-blog-db/note/hero/note-hero-v1.png`
- `assets/visuals/ai-blog-db/x/hook/x-hook-before-after-v1.png`
- `assets/visuals/ai-blog-db/instagram/carousel/instagram-carousel-cover-v1.png`
- `assets/visuals/ai-blog-db/github/readme/github-architecture-v1.png`
- `assets/visuals/ai-blog-db/youtube/thumbnail/youtube-thumbnail-v1.png`

## 期待される効果

保存予定パスをSanityに先に持たせられるため、ユーザーが保存先を手入力する必要が減ります。

Visual Registerは、Sanity/seedにある予定パスを使って画像を保存し、保存後はpatch JSONで `localAssetPath` を実績値として更新します。

## 次の一手

Visual Registerで `visualAssetPlan.ai-blog-db.note-hero-v1` を開き、表示される保存予定パスが `expectedLocalAssetPath` と一致するか確認します。

その後、Studioで `expectedLocalAssetPath` が表示されるか確認し、必要なら既存Sanity documentへseed差分を反映します。
