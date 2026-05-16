# First Production Image Run: note-hero-v1

Date: 2026-05-14
Status: ready-for-human-execution

このファイルは、building-hitori-media-os の **最初の production visual** を生成・登録するための実行ガイドです。

production image を1枚も生成していない状態から、Visual Register Inbox Review の approve & register が回るまでを1サイクル試します。

## 1. First Target Asset

**`note-hero-v1`**

- visualAssetPlanId: `visualAssetPlan.building-hitori-media-os.note-hero-v1`
- platform: note（同 master を Substack header にも流用）
- aspect: 16:9 / pixel: 1456 x 816
- priority: P1

## 2. Why This Asset First

- **shared master**: note hero と Substack header の両方で同じ master file を使う。1枚生成すれば2用途に貢献。
- **public posting の前提条件**: X / note / Substack の初回手動公開で、note 記事冒頭と Substack header / Social Preview が空のままだと "未完成感" が出る。最低限ここを埋める。
- **flow 全段テスト**: 「生成 → inbox 保存 → Visual Register Inbox Review → approve & register → patch JSON → Sanity 手動反映 → publish-package 配布」の8段階を1サイクル通して、運用ルールの抜けを見つける。

## 3. Source Brief

[tasks/visuals/building-hitori-media-os/note-hero-v1.md](note-hero-v1.md)

このファイルに:
- Generation Prompt（ChatGPT / Codex にそのまま貼り付け可能）
- Visual Style / Layout Guidance
- Text To Include / Avoid
- Review Checklist
- Inbox Candidate Path / Save Path & Registration

がすべて揃っています。生成前に必ず一読してください。

## 4. Candidate Save Path

候補画像は **inbox のみ** に保存:

```text
assets/inbox/generated/building-hitori-media-os/note-hero-v1/v001.png
assets/inbox/generated/building-hitori-media-os/note-hero-v1/v002.png
assets/inbox/generated/building-hitori-media-os/note-hero-v1/v003.png
```

- 連番命名（v001 から）。
- 上書き禁止（既存 v001 を残したまま v002 を追加）。
- 任意で `prompt.md` / `review.md` を同フォルダに置いて記録を残す。

すでに `assets/inbox/generated/building-hitori-media-os/note-hero-v1-attempt-1.png` のようなフラット配置のテスト画像が残っている場合、production candidate と混同しないよう、新ディレクトリ `note-hero-v1/` 配下に置いてください。古いテスト画像は production candidate を選んだあと、人間が削除する。

## 5. Final Expected Path

seed の `visualAssetPlan.building-hitori-media-os.note-hero-v1.expectedLocalAssetPath` が source of truth:

```text
assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png
```

このパスは:

- note hero と Substack header の **master 共有ファイル**。
- Visual Register の `approve & register` を押したときに、inbox の選択 candidate からここへ copy される。
- 直接ここへ書き込まない（必ず Visual Register 経由）。
- `substack-header-v1` も同じパスを `localAssetPath` として Sanity Studio で手動入力する。

## 6. Human Steps

### Step 1: Generate Candidate

ChatGPT または Codex CLI で画像を生成する。

- ソース prompt: [tasks/visuals/building-hitori-media-os/note-hero-v1.md](note-hero-v1.md) の "Generation Prompt (paste-ready)" 節。
- 1456x816 で生成するよう指示済み。
- 1回で気に入らなければ複数回試す。それぞれを v001 / v002 / v003 として保存予定。

### Step 2: Save Candidate To Inbox

ファイルを次の場所に保存:

```text
assets/inbox/generated/building-hitori-media-os/note-hero-v1/v001.png
```

ディレクトリが無ければ作る。`mkdir -p assets/inbox/generated/building-hitori-media-os/note-hero-v1` で OK。

### Step 3: Start Visual Register

既に古いプロセスが port 3334 で動いている場合は停止:

```bash
lsof -ti :3334 | xargs kill
```

そのうえで:

```bash
npm run visual:register
```

ブラウザで `http://localhost:3334` を開く。

### Step 4: Open Inbox Review

「Inbox Review（候補画像レビュー）」カードで:

- Content Slug フィルタ = `building-hitori-media-os`
- レビュー状態フィルタ = `all`（または `candidate`）

`v001.png` がリストに表示されることを確認。

### Step 5: Confirm Plan Auto-Suggest

candidate カードの "Plan" セレクタを確認:

- `visualAssetPlan.building-hitori-media-os.note-hero-v1` が auto-select されているはず。
- もし違っていたら手動で選び直す。

Final Path 欄が `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` を表示することも確認。

### Step 6: Add Review Notes

candidate ごとに簡単なメモを残す:

- 採用候補なら "色味・文字レイアウトOK。採用予定"
- 却下なら "右側の構造図が読みにくい"
- 再生成依頼なら "アクセント色を1段階抑える"

### Step 7: Approve & Register

採用 candidate で `approve & register` を押す。

- 最初は final path にファイルが無いはずなので、overwrite confirmation は出ないまま即 OK になる。
- 既に final path にファイルがある場合は `window.confirm` ダイアログが出る。慎重に判断。

成功すると:

- `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` が作られる。
- `patches/visual-assets/building-hitori-media-os/note-hero-v1.json` が作られる。
- `assets/inbox/generated/building-hitori-media-os/note-hero-v1/review-manifest.json` の該当 entry が `reviewStatus: registered` に。
- Patch Review カードが自動 reload され、新 patch が表示される。

### Step 8: Check Patch Review

Patch Review カードを開き、`note-hero-v1.json` の内容を確認:

- `_id`: `visualAssetPlan.building-hitori-media-os.note-hero-v1`
- `set.localAssetPath`: `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png`
- `set.status`: `saved`
- `set.updatedAt`: ISO 8601 タイムスタンプ
- `meta.directSanityWrite`: `false`
- `meta.inboxSource`: 採用した v00X のパス

### Step 9: Manually Reflect In Sanity Studio

`npm run dev` で Sanity Studio を開き:

1. `visualAssetPlan.note-hero-v1` を開く
2. `localAssetPath` フィールドに `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` を入力
3. `status` を `saved` に変更
4. `reviewNotes` に「生成日 / 採用 v00X / 簡単なメモ」を残す
5. **同じパスを `visualAssetPlan.substack-header-v1.localAssetPath` にも手動入力**（master 共有のため）
6. Studio で保存

`seed --replace` は使わない。Sanity CLI 経由の bulk update もしない。手動 Studio 編集のみ。

### Step 10: Run Publish Package Dry-Run

```bash
npm run publish:package -- building-hitori-media-os --dry-run
```

確認:

- `note` の `copied` / `replacementCandidates` 等に `campaign-hero-v1.png` が含まれる
- `substack` も同じく master file の copy 計画がある
- 既存 publish-package ファイルへの破壊的変更は無い

問題なければ flag 無しで実行:

```bash
npm run publish:package -- building-hitori-media-os
```

`publish-packages/note/building-hitori-media-os/images/` と `publish-packages/substack/building-hitori-media-os/images/` に master file が copy されることを確認。

## 7. Review Criteria

採用 candidate を選ぶときに必ず確認:

- [ ] **Text readability**: 「発信を頑張るより、発信が回る仕組みを作る。」が大きく読める
- [ ] **No misleading claims**: 「完成」「自動」「稼げる」などの煽りが入っていない
- [ ] **No fake private UI data**: Sanity Studio / Visual Register 画面のキャプチャ風で偽の subscriber 数 / dashboard 値などを描いていない
- [ ] **Suitable for note hero**: 16:9 で文字が中央70%に収まり crop 耐性がある
- [ ] **Reusable for Substack header**: 同ファイルを Substack social preview に流しても破綻しない
- [ ] **Consistent with Hitori Media OS visual style**: `_style-guide.md` の app-like / structured / clean / diagram-friendly / trust-building が保たれている
- [ ] **No face photo / AI avatar**
- [ ] **No paid PDF content copied**
- [ ] **No secret / 実 project ID / API トークン / subscriber メール / private/ ファイル名が映っていない**

## 8. Regeneration Loop

- 採用しない candidate は `reject`（不採用）または `needs-regeneration`（再生成依頼）でマーク。
- 再生成する場合は新 prompt で v002.png を生成し、同じ inbox フォルダに **追加保存**（v001 は上書きしない）。
- すべての v00X candidate が rejected / needs-regen のままなら、`assets/visuals/.../campaign-hero-v1.png` への copy は **発生しない**。
- 採用候補が出るまで Sanity Studio への手動反映も止めておく。

## 9. After This First Cycle

`note-hero-v1` が成功したら、次は順次:

1. `x-hook-main-v1`（X main post hook）
2. `threads-support-diagram-v1`（Threads main post supporting visual）
3. `note-inline-content-os-flow-v1`（note 第2章付近）
4. `note-inline-human-judgment-v1`（note 第3〜4章付近）
5. `substack-inline-reader-system-v1`（任意 P3）

`note-hero-v1` で覚えた手順を、各 asset で繰り返す。

## 10. Safety

- candidate は **必ず inbox 経由**。final path への直接書き込み禁止。
- `approve & register` を押すまで `assets/visuals/...` に何も置かれない。
- Sanity への反映は手動。direct write しない。
- auto-posting / paid API / `seed --replace` / 顔写真ワークフロー禁止。
- 既存 ai-blog-db の visual / publish-package は touch しない。
- private/ には触らない。

## 11. Related Files

- [docs/45-building-hitori-media-os-production-visual-generation.md](../../../docs/45-building-hitori-media-os-production-visual-generation.md) — execution guide 全体
- [docs/43-visual-register-inbox-review-workflow.md](../../../docs/43-visual-register-inbox-review-workflow.md) — Visual Register Inbox 仕様
- [docs/44-codex-cli-optional-workflow.md](../../../docs/44-codex-cli-optional-workflow.md) — Codex オプション
- [tasks/visuals/building-hitori-media-os/note-hero-v1.md](note-hero-v1.md) — 生成 brief
- [tasks/visuals/building-hitori-media-os/substack-header-v1.md](substack-header-v1.md) — 同 master を共有する Substack 側
- [tasks/visuals/building-hitori-media-os/_inventory.md](_inventory.md) — canonical 7 asset
- [tasks/visuals/building-hitori-media-os/_workflow.md](_workflow.md) — generation + registration workflow
- [assets/inbox/generated/README.md](../../../assets/inbox/generated/README.md) — inbox 規約
- [tasks/reviews/visual-register-inbox-codex-review.md](../../reviews/visual-register-inbox-codex-review.md) — Codex safety review packet（任意）
- [docs/devlog/0083-codex-safety-review-result-2026-05-14.md](../../../docs/devlog/0083-codex-safety-review-result-2026-05-14.md) — Codex review 結果保存先（placeholder）
