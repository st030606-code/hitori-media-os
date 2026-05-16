# Visual Register: Inbox Review Workflow

Date: 2026-05-14

Visual Register は、既存の **アップロード型** 機能に加えて、**インボックス型のレビューワークフロー** をサポートします。両方とも有効で、用途に応じて使い分けます。

## Concept

> 候補をまずインボックスに置く → Visual Register でレビュー → 承認したものだけを最終アセットパスへ保存 → patch JSON 作成 → 手動で Sanity Studio 反映

「Generate first → review in inbox → approve → save to final path → create patch → manual Sanity reflect」を1つの UI で完結させます。

## Folder Convention

```text
assets/inbox/generated/
  <content-slug>/
    <any-image-file>.png
    <optional-subfolder>/<any-image-file>.png
    review-manifest.json   ← Visual Register が自動生成・更新
```

例:

```text
assets/inbox/generated/building-hitori-media-os/
  note-hero-v1-attempt-1.png
  note-hero-v1-attempt-2.png
  x-hook-main-v1-attempt-1.png
  review-manifest.json
```

- ファイル名に **asset slug**（例: `note-hero-v1`）を含めると、`visualAssetPlan` が自動 suggest されます。
- サブフォルダを切ってもよい。Visual Register は再帰的に拾います。
- `review-manifest.json` は Visual Register UI から書き込まれます。手書きしても良いが、UI 動作と整合させること。

## Review Statuses

各候補は次のいずれかの `reviewStatus` を持ちます:

| Status | 意味 |
| --- | --- |
| `candidate` | まだ判断していない（既定） |
| `approved` | 採用予定。`approve & register` で最終パスへ保存できる |
| `rejected` | 不採用。inbox には残るが UI フィルタで隠せる |
| `needs-regeneration` | 再生成依頼。プロンプトを直して再生成する |
| `registered` | 承認・登録済み。`assets/visuals/<...>` に copy 済み、patch JSON 作成済み |

## How To Use

### 1. 候補を inbox に置く

ChatGPT などで画像を生成し、`assets/inbox/generated/<content-slug>/` に保存。ファイル名は自由でよいが、対応する asset slug を含めると自動 suggest が効きます。

### 2. Visual Register を起動

```bash
npm run visual:register
```

ブラウザで `http://localhost:3334` を開く。すでに別 Visual Register が起動している場合は、**再起動** が必要（新しいコードを読み込むため）。

### 3. Inbox Review カードを開く

「Inbox Review（候補画像レビュー）」セクションが表示されます。

- 上部: total / candidate / approved / rejected / needs-regen / registered のカウント
- フィルタ: レビュー状態 / Content Slug
- 各候補カードに preview / metadata / Plan セレクタ / Notes / アクションボタン

### 4. 候補を評価

各カードで次のいずれかのボタンを押せます:

- **approve & register**: 最終パスへ copy + patch JSON 作成 + `registered` 状態に更新
- **approved**: 採用予定としてマーク（最終パスへ copy はまだしない）
- **needs-regeneration**: 再生成依頼としてマーク
- **reject**: 不採用としてマーク
- **candidate に戻す**: 未判断状態に戻す

レビューメモは `review-manifest.json` に保存されます。

### 5. approve & register の挙動

`approve & register` を押すと:

1. 選択した `visualAssetPlan` の `expectedLocalAssetPath`（例: `assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png`）に inbox 画像を copy。
2. patch JSON を `patches/visual-assets/<content-slug>/<asset-name>.json` に書き出し。
3. manifest の該当 entry を `registered` 状態に更新（`finalAssetPath` / `patchPath` / `registeredAt` をセット）。
4. Patch Review が自動的に再読み込みされ、新しい patch が表示される。

最終パスに **すでにファイルがある** 場合、最初の試行で `409` が返り、UI が「上書きしますか？」のダイアログを出します。**確認した場合のみ** 上書きします（既存の overwrite protection を継承）。

### 6. Sanity 反映は引き続き手動

`approve & register` 後も Sanity dataset には何も書き込まれません。

人間が Sanity Studio で `visualAssetPlan` ドキュメントを開き、`localAssetPath` / `status` / `reviewNotes` を patch JSON の値で手動更新します。

## API Reference

新規追加された API:

| Method | Path | 用途 |
| --- | --- | --- |
| GET | `/api/inbox/candidates?slug=<optional>` | inbox 候補一覧 + summary |
| POST | `/api/inbox/review` | レビュー状態 / メモを保存（最終 copy はしない） |
| POST | `/api/inbox/approve-and-register` | 承認 → 最終パスへ copy → patch JSON 作成 |
| GET | `/inbox-image?path=<inbox-relative-path>` | inbox 画像の preview 配信 |

既存の `/api/health`, `/api/visual-asset-plans`, `/api/visual-patches`, `/api/register-visual` は引き続き有効。

## Plan Discovery Enhancement

Visual Register は今回から、`seed/visual-asset-plan-records.json` に加え、**`seed/visual-asset-plan-records-<slug>.json`** という命名のキャンペーン別 seed も自動で読み込みます。

これにより、`seed/visual-asset-plan-records-building-hitori-media-os.json` のような追加 seed を作るだけで、Visual Register でそのキャンペーンの visualAssetPlan が自動で見えるようになります。

`visual-asset-plan-records-test-*.json` は引き続き `VISUAL_REGISTER_INCLUDE_TEST_SEEDS=true` でのみ読み込まれます。

## Safety

- `assets/inbox/generated/` 配下に置く画像はローカル候補のみ。
- 顔写真、有料PDF教材の図版、secret / 実 project ID / API トークン / subscriber メール を含む画像をここに置かない。
- private/ と混同しない。private/ は PDF / 教材原本 用。inbox は 画像候補 用。
- Sanity への直接書き込みなし。auto-posting なし。paid API integration なし。
- 既存の overwrite protection / Patch Review / Content Idea filter / batch registration / test seed mode は **すべて維持** されている。

## What Did Not Change

- 既存のアップロード型ワークフロー（画像を選択 → 登録キュー → 個別登録）
- Patch Review（patch JSON のレビュー）
- Content Idea / Platform / Asset Type フィルタ
- test seed mode（`VISUAL_REGISTER_INCLUDE_TEST_SEEDS=true`）
- overwrite protection と patch JSON 出力フォーマット

## Future Considerations

- inbox candidate を **複数枚同時 approve** するバッチ操作（現状は1枚ずつ）
- inbox candidate を「保留」状態でメモだけ更新（既に `approved` / `needs-regeneration` がその役を果たすが、より軽い "starred" など）
- 顔写真ワークフローのための専用フォルダ規約（`assets/inbox/face/...` など）
- 自動的に inbox を監視して新規ファイル通知（File System Watcher）

これらは現バッチでは扱わない。

## Recommended First Trial

building-hitori-media-os キャンペーンの最初の visual で試すと、最も自然に動作確認できます:

1. `tasks/visuals/building-hitori-media-os/note-hero-v1.md` の Generation Prompt を ChatGPT へ。
2. 出力画像を `assets/inbox/generated/building-hitori-media-os/note-hero-v1-attempt-1.png` に保存。
3. Visual Register を再起動して Inbox Review を開く。
4. `note-hero-v1` が自動 suggest されていることを確認。
5. レビュー → `approve & register`。
6. `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` に copy されたことを確認。
7. patches/visual-assets/building-hitori-media-os/note-hero-v1.json を Patch Review でチェック。
8. Sanity Studio で `visualAssetPlan.note-hero-v1.localAssetPath` を手動更新。
9. 同 master file を Substack header としても使うため、`visualAssetPlan.substack-header-v1.localAssetPath` にも同じパスを手動入力。
