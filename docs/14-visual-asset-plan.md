# visualAssetPlan 設計とローカル優先ワークフロー

`visualAssetPlan` は、実際に作るビジュアルアセット1枚ごとの制作計画です。

`diagramPlan` が「何を図解するか」という概念レベルの計画を扱うのに対して、`visualAssetPlan` は「どの媒体のどこに置く画像を、どの比率で、どのファイルとして保存し、どうレビューするか」を扱います。

## なぜ visualAssetPlan が必要か

`diagramPlan` だけでは、次の問いに答えきれません。

- noteのhero画像なのか、本文内図解なのか。
- Xのhook画像なのか、Instagramカルーセル表紙なのか。
- 16:9、1:1、4:5、9:16のどれで作るのか。
- 生成画像をどこに保存するのか。
- 保存前から決まっている予定パスは何か。
- 公開用パッケージには何を入れるのか。
- 手動生成なのか、将来API生成する予定なのか。

そこで、1つの `diagramPlan` から複数の `visualAssetPlan` を作ります。

例:

- Before / After diagram
  - note hero / eye-catch
  - X hook image
  - Instagram carousel cover
  - YouTube thumbnail

## diagramPlan との違い

| schema | 役割 |
| --- | --- |
| `diagramPlan` | 概念レベルの図解案。何を図解するか、どんな構成にするかを扱う。 |
| `visualAssetPlan` | 実アセット単位の制作計画。どの媒体、配置、比率、保存先、生成モード、レビュー状態かを扱う。 |

`diagramPlan` はアイデアの親です。

`visualAssetPlan` は制作タスクの単位です。

このモデルは、手動生成、半自動生成、将来のAPI生成のすべてで共通して使います。

現在は `generationMode: semi-automatic` と `generationProvider: chatgpt-manual` を中心に使い、将来API生成を追加する場合も同じ `visualAssetPlan` に `generationJobId` やprovider情報を記録します。

## 現在の no-API 半自動ワークフロー

MVPでは画像生成APIを実装しません。

現在の流れ:

1. Codex / Claude Code が `visualAssetPlan` を作る。
2. Codex / Claude Code がプロンプト、ファイル名、`expectedLocalAssetPath`、タスクファイル、レビュー項目を準備する。
3. 人間がChatGPT画像生成、Canva、その他の制作ツールを手動で使う。
4. 人間が生成画像をVisual Registerで登録する。
5. Visual Registerが `expectedLocalAssetPath` を優先して画像を保存する。
6. Sanityで `localAssetPath`、`status`、`reviewNotes`、`updatedAt` を更新する。
7. 必要に応じて `publishPackagePath` に公開用素材をまとめる。
8. 実際のSNS投稿やnote公開は人間が手動で行う。

この流れにより、APIなしでも「どの画像を作るべきか」「どこに保存するべきか」「レビュー状態は何か」を管理できます。

## Local Visual Register

将来のローカルVisual Register UIでは、手動生成した画像をCLIなしで登録します。

Visual Registerが行うこと:

- 画像ファイルを選択またはドラッグ&ドロップする。
- 対象の `visualAssetPlan` を選ぶ。
- `expectedLocalAssetPath` を表示する。
- ローカルserverが画像を正しいフォルダへ保存または移動する。
- Sanity patch/update JSONを作る。
- 将来版ではSanityへ直接writeする。

Visual Registerが更新する主なフィールド:

- `localAssetPath`
- `status`
- `generatedWith`
- `reviewNotes`
- `publishPackagePath`
- `updatedAt`

この仕組みにより、ユーザーがファイルパスを手で間違えるリスクを減らせます。

## expectedLocalAssetPath と localAssetPath

`expectedLocalAssetPath` は、画像を保存する前から決めておく予定パスです。

例:

```text
assets/visuals/ai-blog-db/note/hero/note-hero-v1.png
```

Visual Registerは、この値を優先して保存先として使います。

`localAssetPath` は、実際に保存された後の実績パスです。

つまり:

| field | 役割 |
| --- | --- |
| `expectedLocalAssetPath` | 保存前に決まっている予定パス。Visual Registerの保存先。 |
| `localAssetPath` | 保存後に記録する実際のパス。patch JSONで更新する。 |

この分離により、Sanity Studioで保存先パスを手入力する必要を減らします。

## 将来のAPI自動化との互換性

将来APIベースの画像生成を追加する場合も、同じ `visualAssetPlan` を使います。

将来の流れ:

1. ダッシュボードまたはジョブが `visualAssetPlan` を読む。
2. `generationMode` が `api-automatic` のものを対象にする。
3. `generationProvider` に応じてOpenAI API、Stability API、ローカルモデルなどへ生成ジョブを投げる。
4. `generationJobId` を保存する。
5. 生成結果をローカルまたはストレージへ保存する。
6. `localAssetPath`、`status`、`reviewNotes`、`updatedAt` を更新する。

ただし、現時点ではAPI呼び出しは実装しません。

APIキー、トークン、認証情報、シークレットもSanityやseedに保存しません。

## ローカルフォルダルール

ビジュアル制作タスク:

```text
tasks/visuals/<content-slug>/<asset-name>.md
```

生成画像の保存先:

```text
assets/visuals/<content-slug>/<platform>/<placement>/<asset-name>.png
```

公開用パッケージ:

```text
publish-packages/<platform>/<content-slug>/
```

例:

```text
tasks/visuals/ai-blog-db/note-hero-eye-catch-v1.md
assets/visuals/ai-blog-db/note/hero/note-hero-eye-catch-v1.png
publish-packages/note/ai-blog-db/
```

## ステータス運用

`status` は次のように進めます。

1. `planned`
2. `brief-ready`
3. `prompt-ready`
4. `generated-needs-save`
5. `saved`
6. `reviewed`
7. `approved`
8. `packaged`
9. `published`
10. `archived`

今回のMVPでは、ChatGPT上で生成済みだがローカル保存していない画像は `generated-needs-save` にします。

保存前に `expectedLocalAssetPath` を持たせます。

ローカル保存後に `localAssetPath` を入れ、`status` を `saved` に進めます。

## 公開パッケージの考え方

`publishPackagePath` は、公開前に必要な素材をまとめる場所です。

例:

- 画像ファイル
- 投稿本文
- alt text
- caption
- CTA
- 公開前チェックリスト

今は自動投稿しません。

人間が最終確認し、note、X、Instagram、YouTube、GitHubなどへ手動で配置します。

## まだ自動化しないこと

MVPでは次を実装しません。

- 画像生成API呼び出し
- OpenAI API / Anthropic API クライアント
- APIキーやトークンの保存
- 生成画像の自動アップロード
- note / X / Instagram / YouTube への自動投稿
- 公開後メトリクスの自動取得

まずはローカル優先で、制作計画、保存先、レビュー、公開パッケージ化を安定させます。

## 最初のseed

`seed/visual-asset-plan-records.json` には、次を含めます。

- note hero / eye-catch v1
- X hook image
- Instagram carousel cover
- GitHub architecture diagram
- YouTube thumbnail

最初のnote hero / eye-catchは、ChatGPT上で生成済みだがローカル保存待ちのため、`status: generated-needs-save` とします。

`expectedLocalAssetPath` は、保存前から入れておきます。

`localAssetPath` は、実際に保存されるまで空にします。
