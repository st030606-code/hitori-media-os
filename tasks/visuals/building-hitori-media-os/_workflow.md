# Generation & Registration Workflow: building-hitori-media-os visuals

Date: 2026-05-14

このバッチは local-first / manual-review / no-API のままで進める。LLM API、画像生成 API、auto-posting は使わない。

## Per-Asset Flow

各 asset（A〜H）について、次の順序で進める:

### 1. Brief を読む

`tasks/visuals/building-hitori-media-os/<asset-id>.md` を開き、次を確認:

- objective / message / placement / aspect / pixel size
- text-to-include / text-to-avoid
- visual direction
- generation prompt

`_style-guide.md` のトーンと衝突していないかを確認する。

### 2. ChatGPT 画像生成（手動）

- ChatGPT の画像生成タブを開く。
- brief の "Generation Prompt" 節をそのままコピーする。
- 必要なら pixel size を冒頭に書き足す（例: 「1456x816 で生成してください」）。
- 出力された画像を、納得いくまで2〜3回再生成する。

### 3. ローカルに保存

- 採用した画像を、ローカルの一時フォルダ（例: `~/Downloads/`）に保存する。
- ファイル名は何でもよい（次の Visual Register が正しいパスへリネームする）。

### 4. Visual Register で登録

```bash
npm run visual:register
```

ブラウザで `http://localhost:3334` を開き:

1. 対象キャンペーンの Content Idea filter で `contentIdea.building-hitori-media-os` を選ぶ。
2. 該当 `visualAssetPlan`（例: `visualAssetPlan.building-hitori-media-os.note-hero-v1`）を選ぶ。
3. 表示される `expectedLocalAssetPath`（例: `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png`）が brief のものと一致するか確認。
4. 一時フォルダの画像ファイルを drop / 選択する。
5. 「登録」する。

Visual Register が次を実行する:

- 画像を `expectedLocalAssetPath` へリネーム保存（overwrite protection あり）。
- `patches/visual-assets/visualAssetPlan.building-hitori-media-os.<id>.json` を作成。
- patch JSON には `localAssetPath` と `status: saved` がセットされている。

### 5. Patch Review で確認

Patch Review UI（Visual Register と同じローカルツール）で:

- patch JSON の内容を読み、`localAssetPath` が想定通りか確認。
- `status` の遷移が `brief-ready → saved` になっているかを確認。

### 6. Sanity Studio で手動反映

- `npm run dev` で Sanity Studio を開く。
- 対象 `visualAssetPlan` ドキュメントを開く。
- `localAssetPath` フィールドに、patch JSON の `set.localAssetPath` の値を **手動でコピー** する。
- `status` を `saved` に変更する。
- 必要なら `reviewNotes` に「生成日 / 採用 prompt の版」をメモする。
- 公開準備 OK のタイミングで `status` を `approved` または `packaged` に進める。

`seed --replace` は使わない。Sanity CLI 経由のbulk更新もしない。手動 Studio 編集が前提。

### 7. Publish Package に反映

`localAssetPath` が埋まった状態で:

```bash
npm run publish:package -- building-hitori-media-os --dry-run
```

dry-run で各 platform の `copied` / `replacementCandidates` を確認してから本実行:

```bash
npm run publish:package -- building-hitori-media-os
```

Builder は `localAssetPath` が空でない `visualAssetPlan` の画像を、対応する `publish-packages/<platform>/<slug>/images/` へコピーする。既存ファイルは `safe-skip-existing-files` で温存される。

### 8. 公開前最終確認

- `publish-packages/campaigns/building-hitori-media-os-release-review/<platform>-final-review.md` を開き、画像チェック項目を確認する。
- `publish-packages/campaigns/building-hitori-media-os-release-review/visual-completion-summary.md` の進捗表を更新する（任意・手動）。

## Shared File Handling (campaign-hero-v1)

`note-hero-v1` と `substack-header-v1` は **同じ master file** を使う:

- Visual Register で1回だけ登録する（`assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png`）。
- Sanity Studio で **両方** の visualAssetPlan の `localAssetPath` に同じパスを手動入力する。
- Publish Package Builder はそれぞれの `publish-packages/{note,substack}/building-hitori-media-os/images/` に同じファイルをコピーする。

二重生成や二重保存をしない。

## What Not To Do

- 既存の Visual Register test 画像（visual-asset-plan-records-test-trail-training.json で参照されるもの）を public asset として転用しない。
- 実 generation 前に `localAssetPath` を埋めない（fake 状態を避ける）。
- patch JSON を手動で書き換えない（Visual Register 出力を信頼する）。
- `seed --replace` を使って `visual-asset-plan-records-building-hitori-media-os.json` を Sanity に流し込まない。
- API 画像生成、auto-post、Sanity direct write を試さない。
- 顔写真ワークフローをこのバッチで進めない。

## Checklist Before Publishing

- [ ] 全ての P1 asset の `localAssetPath` が Sanity Studio で埋まっている
- [ ] `publish-packages/<platform>/building-hitori-media-os/images/` に該当ファイルがコピーされている
- [ ] 公開前に各画像を実サイズで目視確認した
- [ ] 画像内に secret / 実 project ID / private/ ファイル名が映っていない
- [ ] 顔写真が含まれていない（このバッチの方針）
- [ ] 採用 prompt の版 / 採用日を `reviewNotes` に残した
