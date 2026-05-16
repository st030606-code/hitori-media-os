# Publish Package Builder

日付: 2026-05-14

Publish Package Builderは、既存の下書き、登録済み画像、patch JSONをもとに、手動公開前の素材一式をローカルfolderへまとめるツールです。

投稿や公開は行いません。

Sanityへ直接writeもしません。

## What Publish Packages Are

publish packageは、媒体ごとに「公開前に必要なもの」をまとめたローカルfolderです。

例:

```text
publish-packages/note/ai-blog-db/
publish-packages/x/ai-blog-db/
publish-packages/substack/ai-blog-db/
publish-packages/threads/ai-blog-db/
publish-packages/instagram/ai-blog-db/
publish-packages/github/ai-blog-db/
publish-packages/youtube/ai-blog-db/
publish-packages/shorts/ai-blog-db/
publish-packages/podcast/ai-blog-db/
```

各folderには、下書き、画像、配置メモ、確認チェックリストを置きます。

## Difference From Existing Records

`platformOutput` は、媒体別の下書きそのものを管理します。

`visualAssetPlan` は、どの画像を作るか、どこに保存するか、どの媒体で使うかを管理します。

publish packageは、公開作業の直前に必要な素材をローカルに束ねるための作業folderです。

つまり、Sanity上の構造化データではなく、人間が公開前に見る「持ち出し用セット」です。

## Usage

```bash
npm run publish:package
```

デフォルトでは `ai-blog-db` のpackageを作ります。

別slugを指定する場合:

```bash
npm run publish:package -- ai-blog-db
npm run publish:package -- building-hitori-media-os
npm run publish:package -- trail-training-3months
```

## Draft Discovery

下書きは、媒体別の `outputs/<platform>/` から `*--<slug>--<platform>.md` の規約で自動検出します。

例:

```text
outputs/note/2026-05-11--ai-blog-db--note.md
outputs/note/2026-05-14--building-hitori-media-os--note.md
```

日付prefixはハードコードしていないため、複数Content Ideaの下書きを同じフォルダに置けます。

同じslug + platformの下書きが複数ある場合は、ファイル名で最も新しい1件（lexicographic sort）を採用します。

下書きが見つからない場合は処理を中断せず、`# TODO: <platform> draft` のplaceholderを作り、checklistにTODOとして残します。

`instagram` と `github` は `outputs/` から下書きを読まないため、常にTODOとして扱います。

## Placeholder Draft Detection

下書きファイルがplaceholder（本文がまだ書かれていない雛形）かどうかを、Publish Package Builderが自動判定します。

判定条件は次のいずれかに合致したときです。

- ファイル内に `status: draft-placeholder` の行がある（大小無視）
- 先頭付近の見出しが `# ... draft placeholder` を含む

判定はマーカーベースで保守的です。TODOコメントが1つ混ざっているだけの実下書きを誤判定しません。

判定結果は、`npm run publish:package -- <slug>` の出力JSONに次の形で含まれます。

- `draftSource`: 採用された下書きの相対パス
- `draftExists`: 下書きが見つかったか
- `draftIsPlaceholder`: placeholderか
- `draftStatus`: `Status:` 行から抽出した値（無ければ `null`）
- `warnings`: 注意事項の配列（placeholder検出、下書き不在、draftSourceDir未設定など）

placeholderと判定された場合、生成されるchecklistには次が追加されます。

- `## Draft Status` バナー（`DRAFT STATUS: placeholder`、source、`Do not publish until ...`）
- `- [ ] Draft is a real draft (not a placeholder)` チェック項目（未チェック）
- `## TODO` セクションに `Replace placeholder draft before publishing. Source: <draftSource>` 行

実下書きと判定された場合、`Draft is a real draft (not a placeholder)` はチェック済みになり、placeholder bannerは出ません。

## Why Placeholder Drafts Are Safer Than Missing Drafts

下書きが完全に欠落している状態は、人間が気づきやすく、checklistにもTODOが出ます。

一方、本文がまだ書かれていないplaceholder draftは、見た目だけは「下書きが存在する」状態になるため、レビューを通り抜けて公開直前まで残るリスクがあります。

placeholder detectionは、この見落としを防ぐためのチェックです。`Status: draft-placeholder` をファイル先頭に書いておけば、Builderが自動でcheck listに `Replace placeholder draft before publishing` の項目を立てます。

placeholder draftは、絶対に公開しないでください。`outputs/<platform>/*--<slug>--<platform>.md` の中身を実下書きに差し替えてから、再度Builderを走らせます。

## How To Replace a Placeholder Draft Safely

推奨フロー（オプトインの `--replace-placeholder-package` フラグを使う場合）:

1. `outputs/<platform>/<date>--<slug>--<platform>.md` を開く。
2. `status: draft-placeholder` の行を削除し、本文を実下書きに置き換える。
3. `npm run publish:package -- <slug> --dry-run` で `draftIsPlaceholder: false` になることを確認する。
4. `npm run publish:package -- <slug> --dry-run --replace-placeholder-package` で `replacementCandidates` の一覧を確認する。
5. 問題なければ `npm run publish:package -- <slug> --replace-placeholder-package` を実行する。
6. 生成された `publish-packages/<platform>/<slug>/checklist.md` に `Draft is a real draft (not a placeholder)` がチェック済みで入っているか確認する。
7. publish-package全体を最終レビューしてから手動公開する。

手動削除フロー（フラグを使わない場合、引き続き利用可能）:

1. `outputs/<platform>/<date>--<slug>--<platform>.md` を実下書きに置き換える。
2. 該当する `publish-packages/<platform>/<slug>/<draftTarget>.md` と `checklist.md` を人間が削除する。
3. `npm run publish:package -- <slug>` を再実行する。

`--replace-placeholder-package` フラグの方が、安全な許可リストに沿って必要なファイルだけを上書きできるため、手動削除より誤操作が起きにくいです。

## Opt-In Placeholder Package Replacement

複数キャンペーンを並走させると、`outputs/` 側のplaceholderを実下書きへ差し替えても、`publish-packages/<platform>/<slug>/` 側に古いplaceholder派生ファイルが残ります。これを安全に再生成するためのオプトインモードです。

```bash
# 計画だけ確認（書き込みなし）
npm run publish:package -- building-hitori-media-os --dry-run --replace-placeholder-package

# 実際に置き換える
npm run publish:package -- building-hitori-media-os --replace-placeholder-package
```

### 何が置き換えられるか

- 各プラットフォームの `draftTarget` 相当のファイル
- 各プラットフォームの `checklist.md`
- podcast の `show-notes.md`（builderが生成しており、source draftにshow notesがある場合）

具体的な許可リスト:

| platform | 置き換える対象 |
| --- | --- |
| x | `posts.md`, `checklist.md` |
| threads | `posts.md`, `checklist.md` |
| note | `article.md`, `checklist.md` |
| substack | `post.md`, `checklist.md` |
| youtube | `script.md`, `checklist.md` |
| shorts | `script.md`, `checklist.md` |
| podcast | `script.md`, `checklist.md`, `show-notes.md` |
| instagram | (なし。draftSourceDir未設定) |
| github | (なし。draftSourceDir未設定) |

### 絶対に置き換えないもの

- `README.md`
- `images/`, `thumbnail/`, `slides/`, `audio/`, `clips/` 配下の画像 / 動画 / 音声
- substack の `notes.md`, `about-page.md`, `welcome-email.md`, `title-options.md`, `social-preview-image.md`, `subscribe-cta.md`, `repurpose-map.md`
- shorts の `caption.md`
- podcast の `audio-todo.md`
- note の `insert-map.md`
- youtube の `slides/checklist.md`（nested）
- `private/` 配下
- `assets/visuals/` 配下
- 上記以外の手動編集物

### 事前判定

`--replace-placeholder-package` を指定しても、次の条件のいずれかに該当する platform は対象から外れます。

- `draftExists: false`（`outputs/<platform>/` に source draftが無い）
- `draftIsPlaceholder: true`（source draftがまだplaceholder）
- platform が許可リストに含まれない（instagram / github）

該当する場合、`replacementWarnings` に理由が記録されます。

### 結果JSONの追加フィールド

- 全体: `replacePlaceholderPackage`、`behavior`（dry-runでは `dry-run-no-writes`、実行時は `replace-placeholder-package-opt-in`）
- 各 platform:
  - `replacementCandidates`: 置き換え対象として計画されたファイル
  - `replaced`: 既存ファイルを置き換えたファイル（dry-runではプランのみ）
  - `replacementSkipped`: 許可リストに入っていても source 条件を満たさず skipされたファイル
  - `replacementWarnings`: 理由付きの警告メッセージ

### 安全性

- 既存の挙動（`safe-skip-existing-files`）はフラグを指定しない限り維持されます。
- ai-blog-db のような placeholder派生ではない既存packageを誤って上書きしないよう、フラグ + slug 引数の両方が必要です。
- `--replace-placeholder-package` を渡しても、`draftIsPlaceholder: true` のままの platform は無視されます。
- `private/`、`assets/visuals/`、画像、音声、動画、`README.md`、手動編集する補助ファイルは絶対に置き換えません。

## Dry Run

書き込みを行わずに判定だけ確認する場合は、`--dry-run` を付けます。

```bash
npm run publish:package -- ai-blog-db --dry-run
npm run publish:package -- building-hitori-media-os --dry-run
```

dry-run時の挙動:

- ディレクトリ作成、ファイル書き込み、画像コピーを一切行わない
- 結果JSONの `dryRun: true`、`behavior: "dry-run-no-writes"` で識別可能
- `written` / `copied` は「実行モードなら書かれていたであろう一覧」を返す
- `skipped` は「実行モードでも温存される既存ファイル」を返す
- `warnings`、`todos`、`draftIsPlaceholder` は通常実行と同じ判定で出力される

placeholder detectionの動作確認や、新しいslugを足したときの影響範囲確認に向いています。

## Supported Package Types

MVPでは次を作ります。

- note
- x
- substack
- threads
- instagram
- github
- youtube
- shorts
- podcast

## Folder Structure

### note

```text
publish-packages/note/ai-blog-db/
├── README.md
├── article.md
├── images/
├── insert-map.md
└── checklist.md
```

### X

```text
publish-packages/x/ai-blog-db/
├── README.md
├── posts.md
├── images/
└── checklist.md
```

### Substack

```text
publish-packages/substack/ai-blog-db/
├── README.md
├── post.md
├── notes.md
├── about-page.md
├── welcome-email.md
├── title-options.md
├── social-preview-image.md
├── images/
├── subscribe-cta.md
├── checklist.md
└── repurpose-map.md
```

Substack packageは、Post本文だけでなく、Notes、title options、subscribe CTA、repurpose mapを含めます。

Substack-specific checklist:

- title options
- social preview image
- subscribe button placement
- tags
- comment setting
- email/app delivery setting
- scheduled time
- cross-post promotion plan

### Threads

```text
publish-packages/threads/ai-blog-db/
├── README.md
├── posts.md
├── images/
└── checklist.md
```

### Instagram

```text
publish-packages/instagram/ai-blog-db/
├── README.md
├── caption.md
├── slides/
└── checklist.md
```

### GitHub

```text
publish-packages/github/ai-blog-db/
├── README.md
├── README-assets.md
├── images/
└── checklist.md
```

### YouTube

```text
publish-packages/youtube/ai-blog-db/
├── README.md
├── script.md
├── thumbnail/
├── slides/
└── checklist.md
```

### Shorts

```text
publish-packages/shorts/ai-blog-db/
├── README.md
├── script.md
├── caption.md
├── clips/
└── checklist.md
```

### Podcast

```text
publish-packages/podcast/ai-blog-db/
├── README.md
├── script.md
├── show-notes.md
├── audio-todo.md
├── audio/
└── checklist.md
```

## What Is Copied Automatically

- 既存の `outputs/` 下書き
- `patches/visual-assets/` に記録された `localAssetPath`
- 存在するローカル画像

画像が存在しない場合、処理は失敗せず、checklistにTODOを残します。

## Safe Write Behavior

既存のpublish package fileは上書きしません。

同じpackageを再作成した場合、既存fileはskipされます。

必要に応じて、人間が確認してから古いpackageを整理します。

## What Remains Manual

- 画像の最終採用判断
- 下書きの最終編集
- note / X / Threads / Substack / Instagram / GitHub / YouTube / Shorts / Podcastへの投稿
- Sanity Studioへの手動反映
- publish packageの最終確認

## Future Dashboard

将来のNext.js dashboardでは、publish package builderをUI化できます。

想定:

- platformを選ぶ
- contentIdeaを選ぶ
- 必要素材の不足を一覧表示する
- packageを生成する
- copy / download / exportを行う

ただし、Phase 2AではローカルNode scriptに留めます。
