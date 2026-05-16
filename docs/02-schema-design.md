# スキーマ設計

このドキュメントでは、Sanity Studio を初期化する前の MVP スキーマ詳細設計をまとめます。

Phase 1 では、ひとつのローカル JSON レコードから note、Substack、Threads、X、YouTube、Shorts、Podcast、Diagram へ下書きを作れることを確認しました。

この結果から、MVP では `contentIdea` にすべてを詰め込まず、元知識、プロンプト、生成下書き、図解計画、公開物、ワークフロー、利用ツールを分けて扱います。

重要: Sanity Studio はデータ確認・管理・初期検証のためのバックオフィスUIです。将来の買い手向け主UIは Next.js ダッシュボードにします。

そのためスキーマは、Sanity Studioで直接編集できるだけでなく、将来のダッシュボードが最小限の人間入力から構造化データを書き込める形にしておきます。

## 設計原則

- `contentIdea` は元になる構造化知識に集中させる。
- 生成下書きは `platformOutput` に保存する。
- 図解、カルーセル、サムネイル、図解ペア投稿は `diagramPlan` に分ける。
- 公開 URL、公開日、公開後の反応は `publishedOutput` に保存する。
- 生成や編集の過程は `workflow` に記録する。
- プロンプトは再利用できる資産として `prompt` に保存する。
- Codex、Claude Code、ChatGPT、Claude アプリ、CapCut、ElevenLabs、Fish Audio などの利用ツールは `tool` に記録する。
- MVP では OpenAI API や Anthropic API を組み込まず、手動・半自動ワークフローを保つ。
- Studioでの入力しやすさだけでなく、将来のNext.jsダッシュボードから書き込みやすい構造にする。
- `platform` のような媒体値は自由入力ではなく、制御された値として扱う。

## MVP 7スキーマ

MVP で設計するスキーマは次の7つです。

- `contentIdea`
- `prompt`
- `workflow`
- `platformOutput`
- `diagramPlan`
- `publishedOutput`
- `tool`

## 1. contentIdea

目的: 元になる構造化された知識レコード。

このスキーマは、完成記事ではなく、複数出力へ展開できる思考の材料を保存します。

### フィールド

| field | type | required | 説明 | 例 | 主に使うプロンプト |
| --- | --- | --- | --- | --- | --- |
| `title` | string | yes | アイデアの作業タイトル | `これからのブログは、記事を書くより「AIが使えるDB」を作った人が勝つ` | all |
| `slug` | slug/string | yes | 安定した識別子 | `ai-usable-blog-database` | all, output path |
| `status` | string | yes | idea / researched / drafted / reviewed / archived | `drafted` | workflow |
| `rawInput` | text | optional | ダッシュボードで最初に受け取る未整理の入力 | `ブログ記事よりAIが使えるDBが大事、という話をしたい` | structuring workflow |
| `summary` | text | yes | アイデアの短い説明 | `AI時代の発信では...` | note, Substack, YouTube, Podcast |
| `coreThesis` | text | yes | 中心主張 | `記事数だけでなく、AIが使える知識DBが強みになる` | all |
| `audience` | array<string> | yes | 想定読者 | `ひとりメディア運営者` | note, Substack, YouTube, Podcast |
| `audiencePain` | text | yes | 読者の悩み | `同じアイデアを媒体ごとに何度も書き直している` | all |
| `contentPillars` | array<string> | optional | テーマ分類 | `AIが使える知識DB` | workflow, editorial review |
| `claims` | array<object> | yes | 主張のリスト | `{ claim, supportingEvidence, confidence }` | all |
| `evidence` | array<object> | yes | 根拠や観察 | `{ type, description, sourceUrl, notes }` | note, Substack, YouTube, Podcast |
| `examples` | array<object> | yes | 具体例 | `ObsidianからSanityへ昇格する` | all |
| `objections` | array<object> | optional | 想定反論と回答 | `創作が重くならないか` | note, Substack, YouTube, Podcast |
| `tone` | object | yes | 声色、避ける表現 | `{ voice, styleNotes, avoid }` | all |
| `sourceLinks` | array<object> | optional | 内部 docs や外部参照 | `docs/00-concept.md` | review, GitHub docs |
| `platformAngles` | array<object> | yes | 媒体別の切り口 | `{ platform, hook, formatNotes, callToAction }` | all platform prompts |
| `outputChecklist` | array<object> | optional | 予定している出力 | `{ outputType, status, localOutputPath }` | workflow |
| `personalContext` | text | optional | 発信者本人の背景や体験 | `実際にこのnoteも1つのJSONから作っている` | note, Substack, Podcast |
| `createdAt` | datetime | yes | 作成日 | `2026-05-11` | workflow |
| `updatedAt` | datetime | yes | 更新日 | `2026-05-11` | workflow |

### リレーション

- `platformOutput.sourceContentIdea` から参照される。
- `diagramPlan.sourceContentIdea` から参照される。
- `workflow.sourceContentIdea` から参照される。

### 境界

`contentIdea` には、実際の生成下書き本文や公開URLを入れません。

元になる知識を軽く保ち、下書きは `platformOutput`、公開物は `publishedOutput`、図解計画は `diagramPlan` に分けます。

将来のNext.jsダッシュボードでは、ユーザーが最初から全フィールドを埋める前提にしません。`rawInput` に近い生アイデアを受け取り、AI支援で `coreThesis`、`claims`、`examples`、`platformAngles` などへ構造化し、人間レビュー後にSanityへ保存する流れを想定します。

## 2. prompt

目的: 各出力タイプに使う再利用可能な生成プロンプト。

プロンプトは、ローカルMarkdownとしても管理しますが、Sanity上でも「どの入力項目を使い、どの出力を作るか」を記録できるようにします。

### フィールド

| field | type | required | 説明 | 例 |
| --- | --- | --- | --- | --- |
| `title` | string | yes | プロンプト名 | `X投稿を生成する` |
| `targetPlatform` | string | yes | 対象媒体。制御値を使う | `x` |
| `outputType` | string | yes | 出力種別 | `x-post` |
| `promptBody` | text | yes | プロンプト本文 | `あなたは...` |
| `requiredInputFields` | array<string> | yes | 必須入力フィールド | `coreThesis`, `claims`, `platformAngles` |
| `humanReviewChecklist` | array<string> | yes | 人間レビュー項目 | `元レコードにない主張を足していないか` |
| `outputPathPattern` | string | yes | ローカル保存先パターン | `outputs/x/YYYY-MM-DD--source-slug--x.md` |
| `version` | string | yes | プロンプト版 | `0.1.0` |
| `status` | string | yes | draft / active / archived | `active` |
| `notes` | text | optional | 改善メモ | `文字数目安を追加したい` |

### リレーション

- `workflow.promptsUsed` から参照される。
- `platformOutput.generatedFromPrompt` から参照される。
- `diagramPlan.generatedFromPrompt` を後で追加してもよい。

### 境界

`prompt` は生成ルールを保存します。生成結果そのものは保存しません。

`targetPlatform` は自由入力ではなく、`note` / `substack` / `threads` / `x` / `youtube` / `shorts` / `podcast` / `diagram` / `github` / `paid` / `instagram` / `newsletter` などの制御された値として扱います。

## 3. workflow

目的: ひとつの入力が、どのプロンプト・ツールを経て、どの出力になったかを記録する。

Phase 1 の devlog で分かったように、何を生成したかだけでなく、どのフィールドが効いたか、どこで人間レビューが必要だったかが重要です。

### フィールド

| field | type | required | 説明 | 例 |
| --- | --- | --- | --- | --- |
| `title` | string | yes | ワークフロー名 | `Phase 1 first three outputs` |
| `sourceContentIdea` | reference<contentIdea> | yes | 元レコード | `ai-usable-blog-database` |
| `promptsUsed` | array<reference<prompt>> | yes | 使用プロンプト | note, Substack, Threads |
| `toolsUsed` | array<reference<tool>> | yes | 使用ツール | Codex, Claude Code |
| `outputFiles` | array<string/reference> | yes | 生成ファイルや出力参照 | `outputs/note/...md` |
| `workflowMode` | string | yes | manual / semi-automatic / automated | `manual` |
| `observations` | text | optional | 気づき | `coreThesis が全媒体で効いた` |
| `devlogReference` | string/reference | optional | devlog参照 | `docs/devlog/0003-first-three-outputs.md` |
| `reviewRequired` | boolean | yes | 人間レビューが必要か | `true` |
| `createdAt` | datetime | yes | 実行日 | `2026-05-11` |

### リレーション

- `contentIdea`、`prompt`、`tool`、`platformOutput`、`diagramPlan` をつなぐ。

### 境界

`workflow` は過程を記録します。本文や図解案を直接持ちすぎないようにします。

## 4. platformOutput

目的: note、Substack、Threads、X、YouTube、Shorts、Podcast、GitHub、paid article などの生成下書きを保存する。

文章・台本・短文SNSなど、図解以外の媒体別下書きをここに置きます。

### フィールド

| field | type | required | 説明 | 例 |
| --- | --- | --- | --- | --- |
| `sourceContentIdea` | reference<contentIdea> | yes | 元レコード | `ai-usable-blog-database` |
| `platform` | string | yes | 媒体。制御値を使う | `note` / `substack` / `threads` / `x` / `youtube` / `shorts` / `podcast` / `diagram` / `github` / `paid` / `instagram` / `newsletter` |
| `outputType` | string | yes | 出力タイプ。制御値を使う | `note-article`, `x-post`, `youtube-script` |
| `title` | string | optional | 下書きタイトル | `AI時代のブログは...` |
| `draftBody` | text/blockContent | yes | 下書き本文 | Markdown本文 |
| `localOutputPath` | string | optional | ローカル保存先 | `outputs/x/2026-05-11--ai-blog-db--x.md` |
| `status` | string | yes | drafted / reviewed / revised / ready / archived | `drafted` |
| `reviewNotes` | text | optional | 人間レビューのメモ | `本人の体験を足す` |
| `generatedFromPrompt` | reference<prompt> | yes | 使用プロンプト | `generate-x-post` |
| `outputLength` | string | optional | 尺や長さ | `short`, `10-15min`, `7-10 posts` |
| `targetFormat` | string | optional | 形式 | `thread`, `script`, `newsletter` |
| `primaryCTA` | string | optional | 主CTA | `noteへ誘導` |
| `contentStatus` | string | optional | editorial status | draft / needs-review / ready |
| `createdAt` | datetime | yes | 作成日 | `2026-05-11` |
| `updatedAt` | datetime | yes | 更新日 | `2026-05-11` |

### リレーション

- `publishedOutput.sourcePlatformOutput` から参照される。
- `workflow.outputFiles` または `workflow.outputs` から参照される。

### 境界

図解・画像の設計は `diagramPlan` に分けます。公開URLや公開後の反応は `publishedOutput` に分けます。

`platform` は自由入力ではなく、将来のダッシュボードでも同じ制御値を使います。これにより、媒体別一覧、フィルタ、パイプライン表示、公開後分析を安定して扱えます。

## 5. diagramPlan

目的: 図解、カルーセル画像、サムネイル、図解ペア投稿など、ビジュアル制作計画を保存する。

Phase 1 で、Diagram は文章出力ではなく、構造・対比・ラベル設計が重要だと分かりました。

### フィールド

| field | type | required | 説明 | 例 |
| --- | --- | --- | --- | --- |
| `sourceContentIdea` | reference<contentIdea> | yes | 元レコード | `ai-usable-blog-database` |
| `visualType` | string | yes | 図解種別 | diagram / carousel / thumbnail / paired-post |
| `targetPlatform` | string | yes | 使用媒体。制御値を使う | `note` / `instagram` / `youtube` / `x` |
| `title` | string | yes | 図解タイトル | `記事の山 → AIが使えるDB` |
| `layoutIdea` | text | yes | レイアウト案 | Before / After |
| `labels` | array<string> | optional | 図内ラベル | `Manual first`, `API later` |
| `imagePrompt` | text | optional | 画像生成やデザイン指示 | `シンプルな2カラム図` |
| `pairedPostText` | text | optional | 図解と一緒に投稿する文 | X投稿文 |
| `status` | string | yes | planned / drafted / designed / reviewed / archived | `drafted` |
| `assetPath` | string | optional | 画像ファイルパス | `outputs/diagrams/...png` |
| `aspectRatio` | string | optional | 比率 | `16:9`, `1:1`, `4:5` |
| `reviewNotes` | text | optional | レビューメモ | `図内テキストが多い` |
| `createdAt` | datetime | yes | 作成日 | `2026-05-11` |
| `updatedAt` | datetime | yes | 更新日 | `2026-05-11` |

### リレーション

- `contentIdea` を参照する。
- 必要に応じて `platformOutput` とペアにできる。
- 公開後は `publishedOutput` に接続する。

### 境界

図解の本文やラベルはここに置きますが、実際の公開URLや成果は `publishedOutput` に置きます。

`targetPlatform` は制御された値にします。図解は複数媒体に転用されやすいため、媒体名の表記揺れを避けます。

## 6. publishedOutput

目的: 実際に公開したコンテンツと、公開後の反応・学びを保存する。

MVP では詳細アナリティクスまでは不要ですが、公開URL、公開日、反応メモ、次の改善は残します。

### フィールド

| field | type | required | 説明 | 例 |
| --- | --- | --- | --- | --- |
| `sourcePlatformOutput` | reference<platformOutput/diagramPlan> | yes | 元下書き | note draft |
| `platform` | string | yes | 公開媒体。制御値を使う | `note` / `substack` / `x` |
| `publishedUrl` | url | yes | 公開URL | `https://...` |
| `publishedAt` | datetime | yes | 公開日時 | `2026-05-11T10:00:00+09:00` |
| `title` | string | yes | 公開タイトル | `これからのブログは...` |
| `performanceNotes` | text | optional | 反応メモ | `Xからの流入が多い` |
| `learnings` | text | optional | 学び | `図解ペア投稿が強い` |
| `nextAction` | text | optional | 次の行動 | `Substack版に展開する` |

### リレーション

- `platformOutput` または `diagramPlan` を参照する。
- `contentIdea` は直接参照してもよいが、基本は下書き経由でたどる。

### 境界

公開後の反応は `contentIdea` に戻しすぎません。必要な学びだけ、次の `workflow` や `contentIdea` 改善に反映します。

`platform` は制御された値にします。公開URL、公開日、反応メモを媒体別に集計できるようにするためです。

## 7. tool

目的: ワークフローで使うツールを記録する。

Codex、Claude Code、ChatGPT、Claude アプリ、CapCut、ElevenLabs、Fish Audio などは、生成や制作の役割が違うため、ツールとして分けて記録します。

### フィールド

| field | type | required | 説明 | 例 |
| --- | --- | --- | --- | --- |
| `name` | string | yes | ツール名 | `Codex` |
| `category` | string | yes | 種別 | coding / writing / image / audio / video / cms |
| `role` | text | yes | このプロジェクトでの役割 | `リポジトリ整備とレビュー` |
| `usedFor` | array<string> | yes | 用途 | `docs`, `prompts`, `devlog` |
| `costModel` | string | optional | 課金モデル | subscription / free / paid-per-use |
| `notes` | text | optional | メモ | `API連携ではなく手動利用` |
| `relatedWorkflows` | array<reference<workflow>> | optional | 関連ワークフロー | Phase 1 output generation |

### 境界

`tool` は利用記録であり、APIキーや認証情報は保存しません。

MVPでは、OpenAI API / Anthropic API クライアントとしてではなく、アプリや制作ツールとして利用する前提を保ちます。

## Fields learned from Phase 1

Phase 1 の出力レビューから、追加で扱うべきフィールド候補が見えました。

| field | belongs to | 理由 |
| --- | --- | --- |
| `personalContext` | `contentIdea` | note、Substack、Podcastでは発信者本人の体験が必要。元アイデアに紐づく背景として持つ。 |
| `concreteExample` | `contentIdea` | ミニJSON例や実際の作業例は、複数媒体で再利用できるため元レコードに置く。必要なら `examples` の一種として扱う。 |
| `outputLength` | `platformOutput` / `prompt` | YouTubeの10-15分、Shortsの30-45秒、Threadsの投稿数などは出力ごとに違う。プロンプトの制約としても持つ。 |
| `targetFormat` | `platformOutput` / `prompt` | thread、single post、script、newsletter、carousel などは媒体別出力の形式。 |
| `aspectRatio` | `diagramPlan` | 図解、カルーセル、サムネイルでは比率が制作に直結する。 |
| `primaryCTA` | `platformOutput` | XからGitHub、note、Substackへ誘導するなど、出力単位で変わる。 |
| `reviewRequired` | `workflow` / `platformOutput` | MVPでは人間レビューが前提。生成プロセスと個別下書きの両方で管理したい。 |
| `contentStatus` | `platformOutput` / `contentIdea` | 元アイデアの状態と、下書きの編集状態は別。`contentIdea.status` と `platformOutput.status` を分ける。 |

## Phase 1 からの結論

ローカル JSON だけでも、ひとつの元レコードから複数媒体の初稿を作れることは確認できました。

ただし、AI出力は最終公開稿ではなく、媒体別の初稿として扱うのが現実的です。

そのため、Sanity 実装では「元知識」「生成下書き」「図解計画」「公開物」「ワークフロー」「プロンプト」「ツール」を分け、あとからレビュー・改善しやすい構造にします。
