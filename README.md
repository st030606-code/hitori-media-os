# Sanity AI Content OS

One structured idea. Many media outputs.

ひとつの構造化されたアイデアから、note、Substack、SNS、YouTube、Podcast、図解、GitHub ドキュメントまで展開する。

Sanity AI Content OS は、ひとりメディア運営者のための「AI時代のコンテンツ運用OS」です。

現在は、Hitori Media OS v0.2へ進化中です。

中心にある考え方はシンプルです。ひとつの構造化された知識レコードを保存し、それを複数の発信フォーマットへ展開します。

このリポジトリは、Phase 1 local-first MVPの安定版を土台に、Media OS v0.2へ進んでいます。Sanity Studio、seed data、Mac launcher、Local Visual Register、Patch Review、Publish Package Builderを使い、APIなしで手動・半自動の制作フローを検証します。

## Quick Start

1. `.env.local` を作成する。
2. 依存関係を入れる。
3. `launchers/start-mac.command` をダブルクリックする。
4. Sanity Studioでseed documentを確認する。
5. Visual Registerで手動生成画像を登録する。
6. Patch Reviewでpatch JSONを確認する。
7. Sanity Studioで `localAssetPath`、`status`、`reviewNotes` を手動反映する。
8. 必要に応じて `npm run publish:package` で公開前packageを作る。

```env
SANITY_STUDIO_PROJECT_ID=your_project_id
SANITY_STUDIO_DATASET=production
```

今日のデモでは、まず [docs/29-today-final-checklist.md](docs/29-today-final-checklist.md) を確認してください。

## これは何か

- ひとつのアイデアを複数の発信物へ変換するためのコンテンツ運用システム
- ひとつのContent Ideaをtext、visual、video、audio、newsletter、social、sales / education contentへ展開するMedia OS
- 汎用ブログテンプレートではなく、Sanity を中心にした知識ベース設計
- Codex、Claude Code、ChatGPT、Claude アプリ、ローカルファイルを使う手動・半自動ワークフロー
- 再利用できるプロンプト集
- プロダクト判断、スキーマ設計、実装メモを蓄積する場所

## まだやらないこと

- Next.js アプリはまだ作らない
- OpenAI API や Anthropic API はまだ入れない
- paid LLM API integration はまだ入れない
- 画像生成APIはまだ入れない
- 自動投稿やバックグラウンド処理はまだ作らない
- Sanityへのdirect writeはまだしない
- 汎用 CMS テーマにはしない

## 想定する出力

ひとつの構造化レコードから、次のような出力を作れる状態を目指します。

- note 記事
- Substack ニュースレター
- Substack Notes / About / Welcome Email
- Threads 投稿
- Instagram カルーセル案
- YouTube 長尺台本
- YouTube Shorts 台本
- ポッドキャスト台本
- 図解・画像案
- GitHub ドキュメント
- 有料記事の構成案
- YouTube long-form
- Shorts / Reels
- Podcast / audio
- future product / sales content

## Supported Production Modes

Text:

- manual
- ai-assisted
- ai-generated

Visual:

- manual-chatgpt
- local-ai
- api-ai-future
- designer-made

Video:

- human-shot
- ai-generated
- hybrid
- screen-recording
- b-roll-plus-narration

Audio:

- human-recorded
- ai-clone
- tts
- podcast-import

Publishing:

- manual
- assisted
- future-api

## リポジトリ構成

```text
.
├── AGENTS.md
├── CLAUDE.md
├── README.md
├── docs/
│   ├── 00-concept.md
│   ├── 01-roadmap.md
│   ├── 02-schema-design.md
│   ├── 03-no-api-workflow.md
│   └── devlog/
├── prompts/
├── schemas/
├── seed/
├── tools/
│   └── visual-register/
├── launchers/
├── inputs/
│   └── content-ideas/
├── outputs/
│   ├── note/
│   ├── substack/
│   ├── threads/
│   ├── youtube/
│   ├── shorts/
│   ├── podcast/
│   └── diagrams/
└── examples/
```

## Current Status

現在は Phase 1 local-first MVP の安定版です。

できること:

- Sanity Studioをローカルで起動する。
- Sanity schemasを読み込む。
- seed documentsをSanity CLIで作成する。
- `contentIdea.ai-blog-db` を中心に、prompt、platformOutput、diagramPlan、tool、workflow、visualAssetPlanを確認する。
- Mac launcherでローカル作業を開始する。
- Local Visual Registerで手動生成画像を正しいローカルパスへ保存する。
- overwrite protectionで誤上書きを防ぐ。
- Patch Reviewでpatch JSONをread-only確認する。
- Content Idea filter / groupingで複数テーマのvisualAssetPlanを見分ける。
- test seed modeで複数Content IdeaのUIを安全に検証する。

意図的にまだやらないこと:

- Next.js dashboard
- Sanity direct write
- OpenAI API / Anthropic API client
- paid LLM API integration
- image generation API
- auto-posting
- social platform integration

自動化されていること:

- Visual Registerによるローカル画像保存
- patch JSON作成
- Patch Reviewでのread-only検証
- overwrite protection
- Content Idea filter / grouping

手動のまま残していること:

- 画像生成
- patch JSONの人間レビュー
- Sanity Studioへの手動反映
- 公開・投稿

## ローカルSanity環境

Sanity Studio の最小セットアップは入っています。

ローカルでStudioを起動する前に、`.env.local` を作成してください。

```env
SANITY_STUDIO_PROJECT_ID=your_project_id
SANITY_STUDIO_DATASET=production
```

`.env.local` は `.gitignore` で除外されています。実project ID、APIキー、トークン、認証情報、シークレットはコミットしないでください。

依存関係をインストールしたあと、Studioは次で起動します。

```bash
npm run dev
```

Studioが `placeholder.api.sanity.io` へ接続しようとしてエラーになる場合は、`SANITY_STUDIO_PROJECT_ID` が設定されていません。`.env.local` の値を確認してください。

## Mac Launcher

Macでは、次をダブルクリックしてローカル作業を開始できます。

```text
launchers/start-mac.command
```

現在のlauncherは、Sanity StudioとLocal Visual Registerを開くためのMVPです。

Terminal windowはログ確認用に開いたままにします。

## Local Visual Register

Local Visual Registerは、手動生成した画像を正しいlocal pathへ保存し、Sanity更新用patch JSONを作るローカルツールです。

通常起動:

```bash
npm run visual:register
```

URL:

```text
http://localhost:3334
```

test seed mode:

```bash
VISUAL_REGISTER_INCLUDE_TEST_SEEDS=true npm run visual:register
```

test seed modeでは、通常の `seed/visual-asset-plan-records.json` に加えて、`seed/visual-asset-plan-records-test-*.json` を読み込みます。

このmodeは、Content Idea filter / groupingを複数テーマで確認するための開発・検証用です。

### Inbox Review

通常起動した Visual Register には **Inbox Review** セクションがあり、`assets/inbox/generated/<content-slug>/` に置かれた候補画像をブラウザ上で承認・却下・再生成依頼できます。

- ChatGPTなどで生成した候補画像をローカル inbox に置く。
- Visual Register で候補ごとに `visualAssetPlan` を確認し、`approve & register` で最終アセットパスへ copy + patch JSON 作成。
- 既存の overwrite protection / Patch Review / Sanity手動反映フローは維持されます。
- 詳細は [docs/43-visual-register-inbox-review-workflow.md](docs/43-visual-register-inbox-review-workflow.md) を見てください。

Visual Register はまた、`seed/visual-asset-plan-records-<slug>.json` のキャンペーン別 seed も自動で読み込みます（building-hitori-media-os など）。

## Seed Documents

seed documentsは、Sanity CLIで安全に作成します。

例:

```bash
npx sanity documents create seed/contentIdea-ai-blog-db.json
npx sanity documents create seed/prompt-records.json
npx sanity documents create seed/platform-output-records.json
npx sanity documents create seed/diagram-plan-records.json
npx sanity documents create seed/tool-records.json
npx sanity documents create seed/workflow-records.json
npx sanity documents create seed/visual-asset-plan-records.json
```

partial update目的で `seed --replace` を使わないでください。

既存documentの一部だけを更新したい場合は、Patch Reviewで内容を確認し、Sanity Studioで手動反映します。

## Image Registration Flow

1. ChatGPT画像生成などで画像を手動生成する。
2. 画像をローカルにダウンロードする。
3. Local Visual Registerを開く。
4. 画像を選択する。
5. Content Idea filterを確認する。
6. `visualAssetPlan` を選ぶ。
7. `expectedLocalAssetPath` を確認する。
8. `登録` する。
9. 画像が `assets/visuals/...` に保存される。
10. patch JSONが `patches/visual-assets/...` に作成される。
11. Patch Reviewで内容を確認する。
12. Sanity Studioで `localAssetPath`、`status`、`reviewNotes` を手動更新する。

Visual RegisterはSanityへ直接writeしません。

## Publish Package Builder

公開前の素材を媒体別folderへまとめるには、次を実行します。

```bash
npm run publish:package
```

デフォルトでは `ai-blog-db` のpackageを作ります。

別のContent Idea用にpackageを作る場合は、slugを引数で渡します。

```bash
npm run publish:package -- ai-blog-db
npm run publish:package -- building-hitori-media-os
```

下書きは `outputs/<platform>/*--<slug>--<platform>.md` の規約で自動検出します。日付prefixはハードコードしていないため、`2026-05-11--ai-blog-db--note.md` と `2026-05-14--building-hitori-media-os--note.md` のように共存できます。同じslug + platformで複数あれば、ファイル名で最も新しい1件を採用します。

Builderは下書きがplaceholder（本文未記入の雛形）かどうかも自動判定します。`status: draft-placeholder` が書かれた下書きは `draftIsPlaceholder: true` として扱われ、checklistに `Replace placeholder draft before publishing` が追加されます。判定だけ確認したい場合は `--dry-run` を付けます。

```bash
npm run publish:package -- ai-blog-db --dry-run
npm run publish:package -- building-hitori-media-os --dry-run
```

placeholderから実下書きに差し替えたあと、対応する `publish-packages/<platform>/<slug>/` 側を安全に再生成するためのオプトインフラグもあります。

```bash
# 計画だけ確認
npm run publish:package -- building-hitori-media-os --dry-run --replace-placeholder-package

# 実際に置き換え（許可リストにあるファイルのみ）
npm run publish:package -- building-hitori-media-os --replace-placeholder-package
```

このフラグは、各プラットフォームの `draftTarget`（`article.md` / `posts.md` / `post.md` / `script.md`）と `checklist.md`（podcast は `show-notes.md` も）だけを上書きします。`README.md`、画像、音声、動画、`private/`、`assets/visuals/`、手動編集の補助ファイル（Substack の `notes.md` / `about-page.md` / `welcome-email.md` など）は絶対に触りません。

placeholder detection、dry-run、`--replace-placeholder-package` の詳細は [docs/32-publish-package-builder.md](docs/32-publish-package-builder.md) を見てください。

作成先:

```text
publish-packages/note/<slug>/
publish-packages/substack/<slug>/
publish-packages/x/<slug>/
publish-packages/threads/<slug>/
publish-packages/instagram/<slug>/
publish-packages/github/<slug>/
publish-packages/youtube/<slug>/
publish-packages/shorts/<slug>/
publish-packages/podcast/<slug>/
```

このbuilderは、既存の下書き、patch JSON、ローカル画像を読み、存在する素材だけをcopyします。

足りない下書きや画像はTODOとしてchecklistに残します。

既存package fileは上書きしません。

詳細は [docs/32-publish-package-builder.md](docs/32-publish-package-builder.md) を見てください。

## Demo Campaign Package

Hitori Media OS v0.2の最初のデモキャンペーンは次にあります。

```text
publish-packages/campaigns/ai-blog-db-v0-2-demo/
```

このpackageは、`ai-blog-db` のContent Ideaを、note、Substack、X、Threads、Instagram、YouTube、Shorts、Podcastへ展開するためのhuman-review draftです。

最初の手動公開準備は次にあります。

```text
publish-packages/campaigns/ai-blog-db-v0-2-demo/release-prep/
```

まず `x-ready.md`、`threads-ready.md`、`note-ready.md`、`substack-ready.md` を確認してください。これらはfinal approved copyではなく、`ready-for-human-edit` の公開候補です。

## Local Diagnostics

ローカルMVPの安全状態を確認するには、次を実行します。

```bash
npm run local:check
```

確認内容:

- seed files
- visualAssetPlan counts
- patch JSON
- `assets/visuals`
- `publish-packages`
- obvious secrets
- direct Sanity writeらしきlocal tool code path

詳細は [docs/33-local-diagnostics-checklist.md](docs/33-local-diagnostics-checklist.md) を見てください。

## Stabilization Docs

Phase 1 MVPの安定化は次にまとめています。

- [docs/24-phase-1-mvp-stabilization.md](docs/24-phase-1-mvp-stabilization.md)
- [docs/25-phase-1-e2e-test-checklist.md](docs/25-phase-1-e2e-test-checklist.md)
- [docs/26-phase-1-known-backlog.md](docs/26-phase-1-known-backlog.md)
- [docs/27-demo-flow-ai-blog-db.md](docs/27-demo-flow-ai-blog-db.md)
- [docs/28-phase-1-release-candidate-check.md](docs/28-phase-1-release-candidate-check.md)
- [docs/29-today-final-checklist.md](docs/29-today-final-checklist.md)
- [docs/30-next-phase-plan.md](docs/30-next-phase-plan.md)
- [docs/31-phase-2a-smoke-test-checklist.md](docs/31-phase-2a-smoke-test-checklist.md)
- [docs/32-publish-package-builder.md](docs/32-publish-package-builder.md)
- [docs/33-local-diagnostics-checklist.md](docs/33-local-diagnostics-checklist.md)
- [docs/34-final-human-review-checklist.md](docs/34-final-human-review-checklist.md)
- [docs/35-substack-strategy-integration.md](docs/35-substack-strategy-integration.md)
- [docs/36-substack-content-os-pipeline.md](docs/36-substack-content-os-pipeline.md)
- [docs/37-substack-schema-extension-plan.md](docs/37-substack-schema-extension-plan.md)
- [docs/35-hitori-media-os-v0-2-architecture.md](docs/35-hitori-media-os-v0-2-architecture.md)
- [docs/36-substack-strategy-module.md](docs/36-substack-strategy-module.md)
- [docs/37-recommended-schema-extensions-media-os.md](docs/37-recommended-schema-extensions-media-os.md)
- [docs/38-video-audio-asset-planning.md](docs/38-video-audio-asset-planning.md)
- [docs/39-strategy-module-ingestion-workflow.md](docs/39-strategy-module-ingestion-workflow.md)
- [docs/40-this-week-completion-roadmap.md](docs/40-this-week-completion-roadmap.md)

## Strategy Module Ingestion

購入した教材、PDF、Brain記事、講座メモは、長文をコピーするのではなくStrategy Moduleとして抽象化します。

変換先:

- checklist
- prompt templates
- schema recommendations
- workflow changes
- publish package additions

詳細は [docs/39-strategy-module-ingestion-workflow.md](docs/39-strategy-module-ingestion-workflow.md) を見てください。

## Private strategy sources

有料PDF、購入したBrain記事、講座スライド、購入者向けテンプレートなどは、`private/sources/` 配下にローカル保存します。

- `private/` は `.gitignore` で除外されています。git にも GitHub にも push しません。
- 元の有料PDFや購入素材そのものをcommitしません。
- 教材本文の長文コピー、スクリーンショット、コピー＆ペーストした表は公開リポジトリに残しません。
- 教材から抽出した抽象化メモは [docs/strategy-sources/](docs/strategy-sources/) に置きます。
- 実装向けの再利用モジュールは [docs/strategy-modules/](docs/strategy-modules/) に置きます。
- シークレット（APIキー、トークン、認証情報、実project ID）は絶対にcommitしません。

最初の事例として、Substackの教科書を抽象化したメモとStrategy Moduleがあります。

- [docs/strategy-sources/substack-textbook-notes.md](docs/strategy-sources/substack-textbook-notes.md)
- [docs/strategy-modules/substack-strategy-module.md](docs/strategy-modules/substack-strategy-module.md)

## MVP の使い方

1. `inputs/content-ideas/` に構造化されたコンテンツアイデアを書く、または Sanity から書き出す。
2. `prompts/` から目的に合うプロンプトを選ぶ。
3. 入力レコードとプロンプトを Codex、Claude Code、ChatGPT、Claude アプリなどへ貼り付ける。
4. 生成された出力を対応する `outputs/` フォルダへ保存する。
5. 人間が確認・編集してから公開する。
6. 気づきや設計判断を `docs/devlog/` に残す。

## 最初に読むもの

- [docs/00-concept.md](docs/00-concept.md): プロダクトの考え方
- [docs/03-no-api-workflow.md](docs/03-no-api-workflow.md): API なしで回す MVP ワークフロー
- [inputs/content-ideas/example-ai-blog-db.json](inputs/content-ideas/example-ai-blog-db.json): 最初のサンプル知識レコード
- `prompts/`: 各プラットフォーム向けの生成プロンプト
