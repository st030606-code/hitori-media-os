# Demo Flow: ai-blog-db Visual Register

このdemo flowは、現在のPhase 1 MVPを見せるための最小デモです。

対象:

- `contentIdea.ai-blog-db`
- `visualAssetPlan.ai-blog-db.note-hero-v1`
- note hero image
- Local Visual Register
- Patch Review
- manual Sanity Studio update

## Demo Goal

1つのContent Ideaから作られたvisualAssetPlanに対して、人間が手動生成した画像をローカル保存し、patch JSONを確認し、Sanity Studioへ手動反映する流れを見せます。

## User Does

1. Sanity Studioを開く。
2. `contentIdea.ai-blog-db` が存在することを確認する。
3. `visualAssetPlan.ai-blog-db.note-hero-v1` を確認する。
4. `expectedLocalAssetPath` を確認する。
5. ChatGPT画像生成などでnote hero imageを手動生成する。
6. 生成画像をローカルにダウンロードする。
7. Visual Registerを開く。
8. 画像を選択する。
9. `visualAssetPlan.ai-blog-db.note-hero-v1` を選ぶ。
10. 保存予定パスを確認する。
11. `登録` する。
12. Patch Reviewでpatch JSONを確認する。
13. Sanity Studioで対象visualAssetPlanを開く。
14. patch JSONの値を手動で反映する。

## Tool Does

Visual Register:

- seedから `visualAssetPlan` を読み込む。
- Content Idea filterを表示する。
- 画像previewを表示する。
- `expectedLocalAssetPath` を表示する。
- overwrite protectionで誤上書きを防ぐ。
- 画像を `assets/visuals/...` へ保存する。
- patch JSONを `patches/visual-assets/...` へ作る。
- Patch Reviewでpatch JSONをread-only表示する。
- local file existsを検証する。

## Files Saved

画像:

```text
assets/visuals/ai-blog-db/note/hero/note-hero-v1.png
```

patch JSON:

```text
patches/visual-assets/ai-blog-db/note-hero-v1.json
```

## Generated Files

Visual Registerが作るもの:

- local image copy under `assets/visuals/...`
- patch JSON under `patches/visual-assets/...`

Visual Registerが作らないもの:

- Sanity document update
- published content
- social post
- image generation result

## Remains Manual

- 画像生成
- 画像ダウンロード
- Patch Reviewの内容確認
- Sanity Studioへのmanual update
- note / X / Instagramなどへの投稿

## Successful Demo

成功条件:

- Studioで `contentIdea.ai-blog-db` が見える。
- Studioで `visualAssetPlan.ai-blog-db.note-hero-v1` が見える。
- Visual Registerで画像を登録できる。
- 画像がexpected pathに保存される。
- patch JSONが作成される。
- Patch Reviewでpatchが見える。
- local file exists validationがpassする。
- Sanity Studioでmanual updateできる。
- direct Sanity writeなしでworkflowが成立する。

## Demo Message

このMVPは、画像生成や投稿を自動化する前に、手動生成した画像をContent IdeaとvisualAssetPlanに安全に紐づけるためのローカル運用UIです。

AI自動化の前に、ファイル保存、patch確認、人間レビューの流れを安定させます。
