# Local Visual Register UI

Local Visual Register UIは、手動生成した画像を正しいローカルパスへ保存し、Sanity更新用patch JSONを作るためのローカルツールです。

Next.js dashboardではありません。

Sanityへ直接writeもしません。

## 起動方法

単体で起動する場合:

```bash
npm run visual:register
```

起動後、ブラウザで開きます。

```text
http://localhost:3334
```

Macでは、`launchers/start-mac.command` をダブルクリックすると、Sanity StudioとLocal Visual Registerを一緒に起動できます。

## できること

- `seed/visual-asset-plan-records.json` から `visualAssetPlan` を読み込む。
- `visualAssetPlan.sourceContentIdea` を通じて、元の `contentIdea` とのつながりを保持する。
- Content Idea / platform / assetTypeで登録先planを絞り込む。
- 複数の画像ファイルをまとめて選択する。
- 選択した画像を登録キューに並べる。
- 画像ごとに対象の `visualAssetPlan` を選ぶ。
- 右側のパネルで選択中画像をプレビューする。
- targetPlatform、placement、assetType、aspectRatio、statusを確認する。
- 画像ごとの `expectedLocalAssetPath` を確認する。
- 同じ保存予定パスに複数画像が割り当たっている場合に警告する。
- 保存予定パスに既存ファイルがある場合に警告する。
- 既存ファイルを上書きする場合は、行ごとに明示的な確認が必要。
- 1件ずつ、または `まとめて登録` で画像を `assets/visuals/...` へ保存する。
- 1件ごとに `patches/visual-assets/...` へSanity patch/update JSONを作る。
- Patch Reviewで `localAssetPath`、`status`、`reviewNotes`、`updatedAt` をコピーする。

UIは日本語優先のラベルにしています。

- 画像を選択
- 登録先プラン
- 保存予定パス
- ステータス
- 登録
- まとめて登録
- プレビュー
- Patch JSON
- 登録完了

## 画像の保存先

`visualAssetPlan.expectedLocalAssetPath` がある場合は、その値を使います。

空の場合は、次の形式で保存先を作ります。

```text
assets/visuals/<content-slug>/<targetPlatform>/<placement>/<asset-name>.png
```

最初のテスト対象:

```text
visualAssetPlan.ai-blog-db.note-hero-v1
```

想定保存先:

```text
assets/visuals/ai-blog-db/note/hero/note-hero-v1.png
```

## patch JSON

Register後、次のようなpatch JSONを作ります。

```json
{
  "_id": "visualAssetPlan.ai-blog-db.note-hero-v1",
  "set": {
    "localAssetPath": "assets/visuals/ai-blog-db/note/hero/note-hero-v1.png",
    "status": "saved",
    "updatedAt": "2026-05-12T00:00:00.000Z",
    "reviewNotes": "Local image saved through Visual Register. Needs visual review."
  }
}
```

保存先:

```text
patches/visual-assets/ai-blog-db/note-hero-v1.json
```

このpatchは人間が確認してからSanityへ反映します。

patch JSONの確認・反映手順は `docs/21-visual-register-patch-apply-workflow.md` にまとめています。

MVPでは、Visual RegisterからSanityへ直接writeしません。

まずはpatch JSONを確認し、Sanity Studioで対象の `visualAssetPlan` を開いて、`set` の内容を手動で反映します。

`expectedLocalAssetPath` は保存前からSanityに持たせる予定パスです。

`localAssetPath` は、登録後にpatch JSONで更新される実際の保存パスです。

## Content Ideaとのつながり

Visual Registerは、現在 `seed/visual-asset-plan-records.json` を読み込みます。

各 `visualAssetPlan` は、次の参照を持っています。

```text
Content Idea -> Diagram Plan -> Visual Asset Plan -> local image / patch JSON
```

現在のseedでは、すべての `visualAssetPlan` が次の `contentIdea` に紐づいています。

```text
contentIdea.ai-blog-db
```

Visual Register APIは、各planに次の情報も付与して返します。

- `sourceContentIdeaId`
- `contentSlug`
- `expectedLocalAssetPath`
- `expectedLocalAssetExists`
- `expectedPatchPath`

UIでは、登録先プランの選択肢とpreview detailでContent Ideaを確認できます。

preview detailでは、次のように日本語優先で表示します。

```text
コンテンツアイデア（Content Idea）: ai-blog-db / contentIdea.ai-blog-db
```

Content Ideaが増えたときに備えて、次のUIを追加しています。

- Content Idea filter
- Content Ideaごとのplan grouping
- platform / assetType filter

status filterはPhase 2A以降のbacklogです。
- 「このContent Ideaで未保存のvisualAssetPlanだけ表示」

MVPではschema変更はせず、`sourceContentIdea` referenceを使って拡張します。

2026-05-13に、Content Idea filter / groupingを追加しました。

登録キューの上に `コンテンツアイデア（Content Idea）` filterを表示します。

現在できること:

- `すべて / All Content Ideas` を選ぶ。
- Content Ideaごとに `visualAssetPlan` 候補を絞り込む。
- plan select内でContent Ideaごとに `optgroup` 表示する。
- 1つのContent Ideaしかない場合はfilterをdisabledにし、現在の操作感を保つ。
- すでに選択済みのplanがfilter外になっても、行の選択を壊さず `現在選択中` として残す。

これにより、Content Ideaが複数になったときに、別テーマの画像planへ誤登録するリスクを下げます。

2026-05-14に、platform filter / assetType filterを追加しました。

使い方:

1. Content Ideaを選ぶ。
2. 必要に応じて媒体（Platform）を選ぶ。
3. 必要に応じて画像種別（Asset Type）を選ぶ。
4. 登録キューに追加した画像へ、絞り込まれたplanから割り当てる。

filter条件に合うplanがない場合は、summaryに警告が出ます。filterを `すべて` に戻してください。

## Patch Review Copy Buttons

Patch Reviewでは、選択中patchから次をコピーできます。

- `localAssetPath`
- `status`
- `reviewNotes`
- `updatedAt`
- patch fields compact block

Clipboard APIが使えない場合は、画面上の値を手動コピーしてください。

Patch Reviewはread-onlyです。Sanityへ直接writeしません。

Patch詳細には `Studio反映メモ` が表示されます。

手順:

1. Sanity Studioで対象visualAssetPlanを開く。
2. `localAssetPath` をコピーして貼り付ける。
3. `status` を確認して更新する。
4. `reviewNotes` を確認する。
5. 保存する。

## 複数Content Idea filter test seed

2026-05-13に、Content Idea filter / groupingを検証するための2つ目のtest seedを追加しました。

追加したContent Idea:

```text
seed/contentIdea-test-trail-training.json
contentIdea.trail-training-3months
```

追加したvisualAssetPlan test records:

```text
seed/visual-asset-plan-records-test-trail-training.json
```

含まれるplan:

- note hero / eye-catch
- X hook image
- Instagram carousel cover

これらは、既存の `seed/visual-asset-plan-records.json` にはまだ混ぜていません。

Sanityへ作成する場合は、人間が確認してから次を実行します。

```bash
npx sanity documents create seed/contentIdea-test-trail-training.json
npx sanity documents create seed/visual-asset-plan-records-test-trail-training.json
```

`seed --replace` は使いません。

Local Visual Registerで複数Content Ideaのfilter / groupingを安全に確認するには、まず一時的なローカル検証方法を決めてから行います。

2026-05-13に、安全なtest seed modeを追加しました。

通常起動では、これまで通り次だけを読みます。

```text
seed/visual-asset-plan-records.json
```

test modeで起動した場合のみ、追加で次のパターンを読みます。

```text
seed/visual-asset-plan-records-test-*.json
```

起動例:

```bash
VISUAL_REGISTER_INCLUDE_TEST_SEEDS=true npm run visual:register
```

test modeでは、画面上に小さなnoticeが表示されます。

```text
Test seed mode: 追加のvisualAssetPlan seedを読み込んでいます。
```

APIでも次のflagを返します。

- `/api/health`: `includeTestSeeds`
- `/api/visual-asset-plans`: `includeTestSeeds`, `seedFiles`, `count`

debug用に、次の情報も返します。

- `testSeedFiles`
- `loadedSeedFiles`
- `failedSeedFiles`
- `contentIdeaIds`
- `debugWarnings`

このmodeはローカルUI検証用です。

Sanityへ直接writeしません。

`seed --replace` も使いません。

test mode noticeには、読み込まれたplan数、Content Idea数、seed file数を表示します。

もし `VISUAL_REGISTER_INCLUDE_TEST_SEEDS=true` なのにplan数が5件のままの場合は、UI summaryに `要確認` として原因候補を表示します。

## 初回手動テスト結果

2026-05-12に、次の条件で初回テストを行いました。

- 起動: `npm run visual:register`
- URL: `http://localhost:3334`
- 読み込み件数: `visualAssetPlan` 5件
- 選択したplan: `visualAssetPlan.ai-blog-db.note-hero-v1`
- 保存された画像: `assets/visuals/ai-blog-db/note/hero/note-hero-v1.png`
- 作成されたpatch: `patches/visual-assets/ai-blog-db/note-hero-v1.json`
- Sanityへの直接write: なし

この結果により、Local Visual Registerは「手動生成した画像をローカル保存し、Sanity反映前のpatch JSONを作る」用途では動作確認済みです。

## Batch UI

2026-05-12に、複数画像登録に向けたbatch-friendly UIへ更新しました。

新しい画面構成:

- top app bar
- 画像選択カード
- 登録キュー
- 右側のプレビュー / 詳細パネル
- status / platform / assetType chips
- snackbar/toast-style message

一括登録の流れ:

1. `画像を選択` で複数画像を選ぶ。
2. 登録キューに画像が追加される。
3. 各行で `登録先プラン` を選ぶ。
4. `保存予定パス` を確認する。
5. 重複警告が出ていないことを確認する。
6. 必要なら1件ずつ `登録` する。
7. 問題なければ `まとめて登録` する。

重複した保存予定パスがある行は登録できません。

これにより、同じ `visualAssetPlan` に複数画像を誤って割り当てるミスを減らします。

## Overwrite protection

2026-05-13に、既存ファイルの上書き確認を追加しました。

Visual Registerは、各 `visualAssetPlan` の `expectedLocalAssetPath` にファイルがすでに存在するかを確認します。

既存ファイルがある場合:

- 登録キューに `既存ファイルあり` chipを表示します。
- 保存予定パスの下に警告を表示します。
- `この画像で上書きする` をチェックするまで、その行の `登録` はできません。
- `まとめて登録` でも、上書き確認がない行はスキップまたはブロックされます。

サーバー側でも再確認します。

UIで確認していない場合、APIは既存ファイルを上書きせず、`409` errorを返します。

これにより、UIだけでなくserver側でも誤上書きを防ぎます。

## Patch Review

2026-05-13に、read-onlyのPatch Review sectionを追加しました。

Patch Reviewでは、`patches/visual-assets/` 以下のpatch JSONをSanity Studioへ反映する前に確認できます。

表示する内容:

- patch JSON file path
- 対象document ID
- `localAssetPath`
- `status`
- `updatedAt`
- `reviewNotes`
- local file exists
- `meta.directSanityWrite`

Patch Reviewは確認専用です。

Sanityへ直接writeしません。

patch内容を確認したら、人間がSanity Studioで手動反映します。

2026-05-13に、Patch ReviewのAPIエラー処理を改善しました。

- frontendは `/api/visual-patches` を呼びます。
- serverも同じ `/api/visual-patches` を返します。
- serverは `patches/visual-assets/` 以下をrecursiveに読みます。
- 未知の `/api/*` はplain textではなくJSON errorを返します。
- frontendはJSON parseに失敗した場合も、日本語のエラーメッセージを表示します。
- Patch Reviewの読み込み失敗はPatch Review sectionだけに表示し、登録キューの行をerrorにしません。

これにより、`Unexpected token 'N', "Not found" is not valid JSON` のような分かりにくい表示を避けます。

## 登録後の状態

2026-05-13に、登録直後の行表示を改善しました。

登録前に保存予定パスへ既存ファイルがある場合は、これまで通り上書き確認が必要です。

ただし、登録成功後は、その行を上書きリスクとして表示せず、次の状態として表示します。

- `登録完了`
- `保存済み`
- `Patch作成済み`
- 作成されたpatch path

同じ行を再登録したい場合は、画像やplanを変更してから再評価します。

## UI polish

2026-05-13に、1枚のnote hero画像でbatch UIを手動確認しました。

確認できたこと:

- Visual Registerは正常に開く。
- `visualAssetPlan` recordsは正常に読み込まれる。
- 画像選択ができる。
- プレビューが表示される。
- `visualAssetPlan.ai-blog-db.note-hero-v1` を選べる。
- `expectedLocalAssetPath` が正しく表示される。
- 1枚画像の登録は正常に動作する。
- Sanityへの直接writeは発生しない。

この確認中に、キューの操作ボタンが狭く表示される問題と、プレビューパネルのchipが横にあふれる問題が見つかりました。

現在は、操作ボタンをコンパクト化し、ボタン文字が縦に折り返されないようにしています。

また、プレビューパネル内のchipは折り返して表示されるようにしています。

複数画像のbatch登録は、複数の生成画像が用意できてから改めて確認します。

## まだ手動のこと

- ChatGPT画像生成やデザインツールで画像を作る。
- 生成画像をダウンロードする。
- patch JSONを確認する。
- Sanity StudioまたはCLIでpatch内容を反映する。
- note、X、Instagram、YouTubeなどへ投稿する。

## 将来のNext.js dashboardへの移行

将来は、このUIをNext.js dashboardへ移します。

将来のdashboardでは、Next.js、Tailwind CSS、shadcn/ui、lucide-reactを使う方針です。

UI設計の詳細は `docs/20-frontend-ui-design-system.md` にまとめています。

移行後も残す考え方:

- `visualAssetPlan` を選ぶ。
- 画像をプレビューする。
- `expectedLocalAssetPath` を表示する。
- 画像を保存する。
- `localAssetPath`、`status`、`reviewNotes`、`updatedAt` を更新する。

変わる可能性があること:

- seed JSONではなくSanityから直接読む。
- patch JSONではなくSanityへ直接writeする。
- API画像生成では `generationJobId` を保存する。

Next.jsはまだ追加しません。

現在のLocal Visual Registerは、静的HTML / CSS / JavaScriptの軽量ツールとして維持します。

dashboardへ移すときは、現在のコードをそのまま移植するのではなく、shared component systemで再構築します。
