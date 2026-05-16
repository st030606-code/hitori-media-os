# Inbox: Generated Candidate Images

このフォルダは **Visual Register の Inbox Review** が読み込む候補画像置き場です。

## Folder Convention

```text
assets/inbox/generated/
  <content-slug>/
    <any-image-file>.png
    <any-image-file>.jpg
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

## How To Use

1. ChatGPT などで画像を手動生成する。
2. 採用候補のファイルをこのフォルダの `<content-slug>/` 配下にローカル保存する。
   - サブフォルダを切ってもOK（例: `note-hero-v1/`）。Visual Register が再帰的に拾う。
   - ファイル名に asset slug（例: `note-hero-v1`）を含めると、Visual Register が `visualAssetPlan` を自動 suggest する。
3. Visual Register を起動して「Inbox Review」セクションを開く。
4. 候補ごとにレビュー状態を選ぶ:
   - `candidate` … まだ判断していない
   - `approved` … 採用予定（自動的に最終パスへ copy はしない）
   - `rejected` … 不採用
   - `needs-regeneration` … 再生成依頼
   - `registered` … 承認＋登録済み（Visual Register が `assets/visuals/` へ copy 済み）
5. `approve & register` を押すと、`assets/visuals/<...>` へ実コピーし、`patches/visual-assets/<...>` の patch JSON を作る。
6. 既存 final ファイルがある場合は **上書き確認** が必要。

## What Lives Here

- **生の候補画像**: 個人ローカル管理。`.png` / `.jpg` / `.webp` など。
- **`review-manifest.json`**: Visual Register が自動生成。各 `<content-slug>/` 配下に1ファイル。

```json
{
  "contentSlug": "building-hitori-media-os",
  "updatedAt": "...",
  "candidates": [
    {
      "relativePath": "assets/inbox/generated/building-hitori-media-os/note-hero-v1-attempt-2.png",
      "fileName": "note-hero-v1-attempt-2.png",
      "suggestedAssetPlanId": "visualAssetPlan.building-hitori-media-os.note-hero-v1",
      "reviewStatus": "approved",
      "reviewNotes": "色味OK、文字組み採用",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

このマニフェストは Visual Register UI が読み書きする。手で編集してもよいが、UI 側の挙動と整合させること。

## What Does Not Live Here

- **本番の final assets**: 採用済み画像は `assets/visuals/<content-slug>/<platform>/<purpose>/<filename>.png` に置く。Visual Register の `approve & register` がここから自動 copy する。
- **patch JSON**: `patches/visual-assets/<content-slug>/<asset-name>.json` に置く。Visual Register が自動生成する。
- **Sanity dataset への直接書き込み**: 行わない。Studio 経由で手動反映する。

## Safety

- このフォルダの中身は **ローカル候補のみ**。`.gitignore` で除外していないため、commit するときは中身を確認すること。
- 顔写真、有料PDF教材の図版、secret / 実 project ID / API トークン / subscriber メール / 顧客固有情報を含む画像はここに置かない（うっかり commit すると公開されるリスク）。
- private/ 配下と混同しない。private/ は **PDF や教材原本** 用。inbox は **画像候補** 用。

## Related Docs

- `docs/43-visual-register-inbox-review-workflow.md` — workflow と運用ルール
- `tasks/visuals/<slug>/_workflow.md` — キャンペーン別ワークフロー
- `docs/42-diagram-plan-vs-visual-asset-plan-vs-publish-package.md` — 3層概念
