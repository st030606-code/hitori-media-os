# Devlog 0085: note-hero-v1 Production Visual Registration (first cycle)

Date: 2026-05-14

## 今日の判断

building-hitori-media-os キャンペーンの最初の production visual `note-hero-v1` を、Visual Register Inbox Review 経由で承認・登録しました。

実画像は人間が生成し、Visual Register の `approve & register` で final path へ copy + patch JSON が作成されました。本devlog では、ファイルシステム上で観測できる事実 のみを記録します。

## Manual Result (filesystem-verified)

### Selected Candidate

- 採用: **第3候補（v001.png として保存）**
- 採用理由（manifest `reviewNotes` より）: "Selected v001 as first production hero candidate. Stronger visual balance than earlier minimal versions. Suitable for note hero and Substack header shared master."

### Filesystem Confirmation

- Inbox candidate ✓ exists: `assets/inbox/generated/building-hitori-media-os/note-hero-v1/v001.png` (1.33 MB PNG)
- Final asset ✓ exists: `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` (1.33 MB PNG、同一サイズ)
- Patch JSON ✓ exists: `patches/visual-assets/building-hitori-media-os/note-hero-v1.json`
  - `_id`: `visualAssetPlan.building-hitori-media-os.note-hero-v1`
  - `set.localAssetPath`: `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png`
  - `set.status`: `saved`
  - `set.updatedAt`: `2026-05-14T07:59:49.920Z`
  - `set.reviewNotes`: 人間の採用理由 + plan reviewNotes が連結
  - `meta.generatedBy`: `tools/visual-register/inbox`
  - `meta.inboxSource`: `assets/inbox/generated/building-hitori-media-os/note-hero-v1/v001.png`
  - `meta.directSanityWrite`: `false`
- Inbox manifest ✓ updated: `assets/inbox/generated/building-hitori-media-os/review-manifest.json`
  - v001.png entry: `reviewStatus: registered`
  - finalAssetPath / patchPath / registeredAt 全部 populated

### Sanity Studio Manual Update

- **Status**: **unconfirmed from CLI**（Sanity dataset state は CLI から観測できない）
- 期待される人間アクション:
  - `visualAssetPlan.note-hero-v1` の `localAssetPath` に `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` を Studio で手動入力
  - `status` を `saved` に
  - `reviewNotes` を patch JSON の内容と整合
  - **重要**: `visualAssetPlan.substack-header-v1.localAssetPath` にも **同じパス** を手動入力（master 共有）
- もし人間が Studio 更新を済ませているなら、次バッチの handoff で `completed` に更新する。

### Patch Review Displayed

- **Yes**（patch JSON が `patches/visual-assets/building-hitori-media-os/note-hero-v1.json` に存在し、Visual Register の `GET /api/visual-patches` がこれを返す）
- 人間が Visual Register を開けば Patch Review カードに表示される

### Issues Found (minor)

1. **Inbox 内の旧 test 画像**: `assets/inbox/generated/building-hitori-media-os/note-hero-v1-attempt-1.png` が flat 配置のまま残っており、manifest にも別 entry として `registered` のままある。同じ final path を 2 つの inbox entry が指している状態。混乱を避けたい場合は人間が `attempt-1.png` を削除 or 別フォルダへ移動する判断を下す。
2. **publish-package images/ 配下が未配布**: 本 devlog 執筆時点で `publish-packages/note/building-hitori-media-os/images/` と `publish-packages/substack/building-hitori-media-os/images/` のディレクトリは存在しない。dry-run では `campaign-hero-v1.png` を両方に copy 予定として算出済み。`npm run publish:package -- building-hitori-media-os`（flag なし）を1回流すと反映される。
3. **採用候補とユーザー報告の差異**: 人間報告では "third generated candidate" だが、ファイル名は `v001.png`（1番目）。これは「ChatGPT で生成 3 回試して、採用した1枚を inbox の v001 として保存した」運用と思われる。命名規則的には正常。

## Dry-Run Result

`npm run publish:package -- building-hitori-media-os --dry-run` 実行結果:

- **note**: `visualCount: 5`、`copied: ["publish-packages/note/building-hitori-media-os/images/campaign-hero-v1.png"]`（dry-run のためファイル書き込みなし、planned のみ）
- **substack**: `visualCount: 2`、`copied: ["publish-packages/substack/building-hitori-media-os/images/campaign-hero-v1.png"]`（同上）
- **x / threads**: visualCount は 1（plan あり、画像未生成）、`copied: []`
- TODO 一覧: note の inline 3 点（content-os-flow / human-judgment / manual-vs-automation）と substack inline、x-hook、threads-support の画像が未生成 → 次の生成サイクル対象

master 共有方針が正しく機能（同一ファイルが note + substack の両 publish-package に配布計画）。

## What This Confirms

- inbox → Visual Register approve & register → final asset → patch JSON → manifest registered までの **8 段 flow** のうち、ローカル側 6 段が完走（生成・inbox保存・Visual Register承認・final copy・patch JSON・manifest更新）。
- 残り 2 段（Sanity Studio 手動反映 / publish-package 実配布）は人間の次のアクション。
- inbox v00X 連番、上書き禁止、overwrite protection、master 共有のすべてが想定通り。

## Validation Passed

- `npm run local:check` → `ok: true`（全 15 チェック green、private/ ignored / tracked=0、secret なし、direct Sanity write なし）
- `npm run build`（sanity build）→ 8.0s で成功
- `npm run publish:package -- building-hitori-media-os --dry-run` → ok: true、dry-run-no-writes、note + substack に campaign-hero-v1.png の copy 計画

## Safety Reaffirmation

- 実画像は人間が生成、Visual Register が承認、final copy も Visual Register 経由のみ。
- Sanity Studio への反映は **手動**。direct write なし。
- auto-posting / paid API / `seed --replace` / 顔写真 / 有料PDF引用 / secret コミット なし。
- 本バッチで Claude Code は画像生成・画像編集・Sanity 書き込みを行っていない。

## Next Recommended Visual

`note-hero-v1` のローカル登録は完了。次は次の優先度の visual:

### Immediate Human Steps (今すぐ)

1. **Sanity Studio で手動更新**: `visualAssetPlan.note-hero-v1.localAssetPath` と `visualAssetPlan.substack-header-v1.localAssetPath` の両方に `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` を入力。`status: saved` に。
2. **Publish package 実配布**: `npm run publish:package -- building-hitori-media-os`（flag なし）で `publish-packages/{note,substack}/building-hitori-media-os/images/campaign-hero-v1.png` を実 copy。
3. （任意）`assets/inbox/generated/building-hitori-media-os/note-hero-v1-attempt-1.png` を inbox から削除して整理。

### Next Production Visual

**`x-hook-main-v1`** が次の優先度（P1）。flow は `note-hero-v1` と同じ:

- brief: `tasks/visuals/building-hitori-media-os/x-hook-main-v1.md`
- candidate inbox: `assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/v001.png`
- final path: `assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png`

`note-hero-v1` を「トーンの基準」として、color / accent / font / 余白の感覚を揃える。
