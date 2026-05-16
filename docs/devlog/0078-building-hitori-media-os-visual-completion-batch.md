# Devlog 0078: building-hitori-media-os Visual Completion Batch (text-first 4)

Date: 2026-05-14

## 今日の判断

公開を急がず、まず text-first 4 platforms（X / Threads / note / Substack）の **production visual** を準備する方向へ進めました。

具体的には、8 個の production visualAssetPlan を additive seed で定義し、Sanity 用 8 brief を `tasks/visuals/building-hitori-media-os/` に揃え、公開直前レビュー側にも per-platform images-plan + visual-completion-summary を配置しました。

video / audio 系と顔写真ワークフローはこのバッチでは **意図的に対象外**。

## なぜここで visual に時間を使うか

X だけ画像があっても、note / Substack の hero / header がないと publication として整合しません。text-first 4 platforms の visual を揃えて初めて、building-in-public トーンの publication として通る、という判断です。

完成版ツール宣伝ではなく開発ログだから、装飾を盛らず構造で語る方向。スタイル・ガイド (`_style-guide.md`) を先に作って、トーンが asset 間で散らばらないようにしました。

## 変更したこと

### Seed

- `seed/visual-asset-plan-records-building-hitori-media-os.json` を新規作成（8 records、additive）。
  - `note-hero-v1`（shared with substack-header-v1）
  - `substack-header-v1`（shares master with note-hero-v1）
  - `x-hook-main-v1`
  - `threads-support-v1`
  - `note-inline-content-os-flow-v1`
  - `note-inline-manual-vs-automation-v1`
  - `note-inline-publish-package-folder-v1`
  - `substack-inline-reader-system-v1`
- 全レコード status は `brief-ready`。実生成前なので `localAssetPath` は空のまま。

### Publish Package Builder

- `tools/publish-package-builder/build.mjs` を **最小限の additive 拡張**。
- `seed/visual-asset-plan-records.json`（既存）に加え、`seed/visual-asset-plan-records-${contentSlug}.json` も load して merge。
- ai-blog-db には影響なし（該当 per-slug ファイルが存在しないため）。
- test seeds（`visual-asset-plan-records-test-*.json`）も触らない。
- dry-run で確認: building-hitori-media-os の visualCount が note=4 / substack=2 / x=1 / threads=1 となり期待通り。

### Briefs

- `tasks/visuals/building-hitori-media-os/_inventory.md`: 8 asset 一覧、優先度、生成順、reuse matrix、out-of-scope。
- `tasks/visuals/building-hitori-media-os/_style-guide.md`: visual vocabulary、color、typography、layout、what to avoid、consistency rules。
- `tasks/visuals/building-hitori-media-os/_workflow.md`: 8 step 生成・登録・反映ワークフロー。shared file handling、checklist before publishing。
- 8 個の per-asset brief（paste-ready generation prompt、review checklist、save path 込み）。
  - `note-hero-v1.md`
  - `substack-header-v1.md`（shares master、新規生成なし）
  - `x-hook-main-v1.md`
  - `threads-support-v1.md`
  - `note-inline-content-os-flow-v1.md`
  - `note-inline-manual-vs-automation-v1.md`
  - `note-inline-publish-package-folder-v1.md`
  - `substack-inline-reader-system-v1.md`

### Docs

- `docs/42-diagram-plan-vs-visual-asset-plan-vs-publish-package.md`: 3 layer の概念整理（concept / production unit / distribution）。混同したときの参照地図。

### Release Review

- `publish-packages/campaigns/building-hitori-media-os-release-review/` に追加:
  - `x-images-plan.md`
  - `threads-images-plan.md`
  - `note-images-plan.md`
  - `substack-images-plan.md`
  - `visual-completion-summary.md`

各 plan は対応する asset brief / publish-package / final-review を1か所に整理する。

## 変更していないもの

- 既存スキーマ / `schemas/index.ts` / `sanity.config.ts`
- `seed/visual-asset-plan-records.json`（main、5 records のまま）
- `seed/visual-asset-plan-records-test-*.json`（test、3 records のまま）
- 既存 outputs / publish-packages 本体
- ai-blog-db キャンペーン全般

`npm run local:check` のカウント期待値（main=5, test=3）はそのまま green。

## 安全性の担保

- 有料画像生成 API 不使用、auto-post なし、Sanity direct write なし、`seed --replace` なし。
- fake final image なし: 実生成前は `localAssetPath` を空のまま。
- 顔写真ワークフローはこのバッチで扱わない（明示）。
- 既存の Visual Register test 画像を public asset に転用しない（明示）。
- スタイルガイドで「ロゴ風表現 / 商標 / 有料PDFの図版 / secret / 実project ID / private/」を全て避けることを brief レベルで明文化。

## 概念整理（diagramPlan vs visualAssetPlan vs publish-package）

`docs/42-diagram-plan-vs-visual-asset-plan-vs-publish-package.md` で明示:

- **diagramPlan** = 概念（何を視覚化するか）
- **visualAssetPlan** = 制作1単位（status / aspect / pixel / プロンプト / 保存パス）
- **publish-package images/** = 公開作業用フォルダ（実画像コピー）

混ぜないことで、同じ before/after 概念を複数キャンペーンで再利用したり、media-specific な解像度 variant を別ファイルで管理したりが綺麗にできる。

## CodexとClaude Codeの役割分担

Claude Code がこのバッチを構築。Codex には、最初の image 1枚（`note-hero-v1`）を ChatGPT 手動生成→ Visual Register 登録 → Sanity 反映 → publish-package 配布まで、`_workflow.md` の手順で1サイクル回す検証を渡す想定。

## APIなしで済ませた理由

- ファイル追加（seed JSON、briefs、docs、release-review）と builder の数行 additive 拡張のみ。
- 画像生成は ChatGPT 手動を継続。
- LLM API、外部翻訳、Sanity API、画像生成 API は一切使わない。

## 発信コンテンツにできる切り口

- 「公開を急がず visual を先に揃える」運用判断の話。
- スタイル・ガイドを先に書いてから brief を書く順序の意義。
- 1 master file を2用途に共有する reuse 設計（campaign-hero）。
- diagramPlan / visualAssetPlan / publish-package の3層の役割分担を docs/42 で言語化。

## 検証

- `node --check tools/publish-package-builder/build.mjs` / `node --check tools/local-check.mjs` → 成功
- `npm run local:check` → `ok: true`（informational 含む全 15 チェック green）
- `npm run build` → 7.8s で成功
- `npm run publish:package -- building-hitori-media-os --dry-run` → note=4 / x=1 / substack=2 / threads=1 の `visualCount`、`draftIsPlaceholder: false`、書き込みなし
- ai-blog-db の dry-run は変化なし（per-slug seed が存在しないため）

## 次にテストすること

1. 人間が `note-hero-v1.md` の generation prompt を ChatGPT に貼り付けて、1枚目の image を生成する。
2. Visual Register で `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` に保存・登録する。
3. Sanity Studio で `visualAssetPlan.note-hero-v1.localAssetPath` と `visualAssetPlan.substack-header-v1.localAssetPath` の両方に同じパスを手動入力する（shared master）。
4. `npm run publish:package -- building-hitori-media-os --dry-run` で copy 計画を確認する。
5. 問題なければ `npm run publish:package -- building-hitori-media-os` 実行で publish-packages/note/.../images/ と publish-packages/substack/.../images/ に master file をコピー。
6. その master file を「トーンの基準」として、次に `x-hook-main-v1` を生成する。
7. P1 が揃ったあとに P2 へ進む。
