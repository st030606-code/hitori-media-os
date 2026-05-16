# Local Visual Register UI 実装計画

このドキュメントは、手動生成した画像をCLIなしで `visualAssetPlan` に登録するための、最小Local Node helper server / browser UIの設計メモです。

現時点ではUIを実装しません。

## 目的

Visual Registerは、次の手作業ミスを減らすためのローカルUIです。

- 画像ファイルの保存先を間違える。
- `visualAssetPlan.localAssetPath` の更新を忘れる。
- `status` の進行を忘れる。
- publish packageに必要な素材をまとめ忘れる。
- Sanity patch/updateの内容を手で作る必要がある。

## 最小機能

初期版のVisual Registerは、次だけに絞ります。

1. ローカル画像ファイルを選択する。
2. `visualAssetPlan` を選択する。
3. 画像をプレビューする。
4. expected `localAssetPath` を表示する。
5. `Register` で画像を正しいlocal assets pathへコピーする。
6. Sanity patch/update JSONを生成する。
7. Sanityへ直接writeしない。

画像生成はしません。

投稿も自動化しません。

## 推奨ファイル構成

Next.js導入前の最小構成:

```text
tools/visual-register/
  server.mjs
  public/
    index.html
    app.js
    styles.css
  README.md
```

出力先:

```text
assets/visuals/<content-slug>/<platform>/<placement>/<asset-name>.png
publish-packages/<platform>/<content-slug>/
patches/visual-assets/<content-slug>/<asset-name>.json
```

package scripts候補:

```json
{
  "scripts": {
    "visual:register": "node tools/visual-register/server.mjs"
  }
}
```

Mac launcherは、将来的にSanity StudioだけでなくVisual Registerも開けるようにします。

候補URL:

```text
http://localhost:3334
```

## Local Node helper server

Node serverの役割:

- `seed/visual-asset-plan-records.json` を読む。
- `visualAssetPlan` 一覧をAPIとして返す。
- 画像アップロードを受け取る。
- 選択された `visualAssetPlan` から保存先pathを計算する。
- 必要なフォルダを作る。
- 画像を `assets/visuals/...` にコピーする。
- Sanity patch/update JSONを `patches/visual-assets/...` に作る。
- ブラウザUIを配信する。

最初はSanityへ直接writeしません。

理由:

- 認証情報を扱わずに済む。
- patch内容を人間が確認できる。
- ローカル保存とSanity更新の責務を分けられる。

## Browser UI

画面の最小構成:

- header: `Visual Register`
- server status
- visualAssetPlan select
- selected plan detail
- file input / drag-and-drop area
- image preview
- expected localAssetPath
- expected publishPackagePath
- generated patch preview
- Register button
- result / error message

UIに表示する `visualAssetPlan` 情報:

- title
- targetPlatform
- placement
- assetType
- aspectRatio
- status
- localAssetPath
- imagePrompt
- textToInclude
- textToAvoid

## API案

最小API:

```text
GET  /api/visual-asset-plans
POST /api/register-visual
GET  /api/health
```

`GET /api/visual-asset-plans`

- seedまたは将来Sanityから `visualAssetPlan` 一覧を返す。

`POST /api/register-visual`

- multipart formで画像ファイルと `visualAssetPlanId` を受け取る。
- 保存先pathを計算する。
- 画像をコピーする。
- patch JSONを作る。
- 結果を返す。

`GET /api/health`

- server status
- project root
- asset folder status
- seed file status

## 保存先pathの決め方

初期版では、`visualAssetPlan` から次を使います。

- content slug: `ai-blog-db`
- targetPlatform
- placement
- asset name

例:

```text
assets/visuals/ai-blog-db/note/hero/note-hero-eye-catch-v1.png
```

`placement` はUI表示では自然言語でもよいですが、pathではslug化します。

例:

- `note hero / eye-catch` -> `hero`
- `X first post / hook image` -> `hook`
- `Instagram carousel cover` -> `cover`
- `GitHub README architecture section` -> `architecture`
- `YouTube thumbnail` -> `thumbnail`

## patch/update JSON

Visual Registerは、画像保存後にSanity更新用JSONを作ります。

例:

```json
{
  "id": "visualAssetPlan.ai-blog-db.note-hero-v1",
  "set": {
    "localAssetPath": "assets/visuals/ai-blog-db/note/hero/note-hero-eye-catch-v1.png",
    "status": "saved",
    "reviewNotes": "Local image saved through Visual Register. Needs visual review.",
    "updatedAt": "2026-05-12T00:00:00.000Z"
  }
}
```

保存先:

```text
patches/visual-assets/ai-blog-db/note-hero-eye-catch-v1.json
```

当面は、このpatchを人間が確認してからSanityへ反映します。

## package scripts

推奨:

```json
{
  "scripts": {
    "visual:register": "node tools/visual-register/server.mjs",
    "dev:studio": "sanity dev"
  }
}
```

既存の `dev` は維持します。

Visual Register実装時に、Mac launcherがどちらを開くか選べるようにします。

## Mac launcherとの接続

現在の `launchers/start-mac.command` は `http://localhost:3333` のSanity Studioを開きます。

Visual Register実装後の選択肢:

1. Studioだけ開く。
2. Visual Registerだけ開く。
3. StudioとVisual Registerの両方を開く。

MVPでは3が便利です。

候補:

- Sanity Studio: `http://localhost:3333`
- Visual Register: `http://localhost:3334`

将来のNext.js dashboardができたら、ランチャーはdashboard URLを開きます。

## Next.js dashboardへの移行

Local Visual Register UIは、将来Next.js dashboardへ移せます。

移行時に残すもの:

- `visualAssetPlan` model
- expected localAssetPath計算
- image preview
- Register flow
- patch/update JSON生成
- status更新

Next.jsへ移すときに変わるもの:

- seed JSONではなくSanityから直接 `visualAssetPlan` を読む。
- 認証済みserver actionまたはAPI routeからSanityへ直接updateする。
- dashboard内でVisual Register、pipeline、publish packageを統合する。
- 将来API生成時は `generationJobId` とprovider metadataを保存する。

ただし、Next.jsはまだ待ちます。

先に、軽量Node helper serverでローカル保存とpatch生成の使い勝手を検証します。

## まだ手動のまま残すこと

初期Visual Registerでも、次は手動です。

- ChatGPT画像生成やデザインツールでの画像生成
- 生成画像のダウンロード
- patch JSONの確認
- Sanity StudioまたはCLIでの反映
- note / X / Instagram / YouTubeへの投稿
- 公開後の反応記録

## 最初に実装するもの

最初の実装は、次に絞ります。

1. `tools/visual-register/server.mjs`
2. `tools/visual-register/public/index.html`
3. `tools/visual-register/public/app.js`
4. `tools/visual-register/public/styles.css`
5. `npm run visual:register`

最初の対象は、次の1件で十分です。

```text
visualAssetPlan.ai-blog-db.note-hero-v1
```

この1件で、画像選択、プレビュー、保存、patch JSON生成まで通れば、他のvisualAssetPlanへ広げます。
