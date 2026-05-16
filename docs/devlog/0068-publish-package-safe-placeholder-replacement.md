# Devlog 0068: Publish Package Safe Placeholder Replacement (opt-in)

Date: 2026-05-14

## 今日の判断

Publish Package Builderに、placeholder派生のpublish-packageファイルを安全に再生成するためのオプトインフラグ `--replace-placeholder-package` を追加し、building-hitori-media-os の publish-package を新本文に揃え直しました。

これまでは「`outputs/` 側のplaceholderを実下書きに差し替えたあと、`publish-packages/<platform>/<slug>/` 側を更新するには人間が手動でファイル削除→再生成」する運用でした。誤って `README.md` や手動編集ファイルを削除しないように、機械的な許可リスト方式に切り替えました。

## 変更したこと

- `tools/publish-package-builder/build.mjs`
  - `--replace-placeholder-package` フラグを追加。
  - `replaceableTargetsByPlatform` を許可リストとして定義（x / threads / note / substack / youtube / shorts は draftTarget + checklist.md、podcast はそれに加えて show-notes.md、instagram / github は空セット）。
  - `writeIfAbsent` に options `{allowReplace, replaced}` を追加。`allowReplace=true` のときだけ既存ファイルを上書きし、`replaced` 配列に記録する（dryRun時は計画のみ）。
  - `buildPackage` で `canReplaceAny = replacePlaceholderPackage && draftExists && !draftIsPlaceholder` を計算し、draftTarget / extraFiles それぞれに対し許可リスト判定 → `allowReplace` を渡す。
  - 各 platform result に `replaced`、`replacementCandidates`、`replacementSkipped`、`replacementWarnings` を追加。
  - 全体結果に `replacePlaceholderPackage` と `behavior`（`replace-placeholder-package-opt-in` / `dry-run-no-writes` / `safe-skip-existing-files`）を追加。
- `docs/32-publish-package-builder.md`
  - 「How To Replace a Placeholder Draft Safely」をオプトインフラグ手順と手動削除手順の2系統に整理。
  - 「Opt-In Placeholder Package Replacement」節を追加。許可リスト、絶対置き換えないリスト、事前判定、結果JSONの追加フィールド、安全性まとめ。
- `README.md`
  - Publish Package Builder 節に `--replace-placeholder-package` の概要を追加。

## 理由

複数キャンペーンを並走させる以上、placeholder draft → 実下書き → publish-package 更新のサイクルは何度も走ります。手動削除でこなすと:
- 削除するファイルを誤る（README.md / 画像 / 補助ファイル）
- 削除し忘れる（古い checklist が残る）
- 削除順序を間違える（次の slug に波及）

ため、許可リストベースのオプトインフラグに置き換えました。フラグなしの挙動は完全に維持。

許可リストは、Publish Package Builder が「draft や placeholder情報から生成しているファイル」だけに限定しました。逆に、手動編集対象（Substack 専用補助ファイル、insert-map.md、audio-todo.md、shorts の caption.md など）は意図的に対象外。`README.md` / 画像 / 音声 / 動画 / `private/` / `assets/visuals/` も触りません。

## 安全側に倒したポイント

- `replacePlaceholderPackage` フラグが無ければ、従来の `safe-skip-existing-files` 挙動を維持。誤発火しない。
- フラグがあっても、`draftIsPlaceholder: true` の platform は対象外。実下書きへ差し替え済みの platform だけが対象になる。
- `draftSourceDir: null` の platform（instagram / github）は対象外。
- ai-blog-db のような既存 placeholder派生ではない package も、フラグなしでは何も上書きされない。今回の bash 実行でも ai-blog-db には `--replace-placeholder-package` を渡していない。
- `copyIfAbsent`（画像コピー用）は `allowReplace` 引数を持たないため、画像ファイルは絶対に上書きされない。

## CodexとClaude Codeの役割分担

今回はClaude Codeで実装。Codex 側は人間レビューで「実際の公開作業」と、`building-hitori-media-os` の checklist 内容を一字一句確認するレビューに回す想定。

## APIなしで済ませた理由

ファイル名の許可リスト判定だけで完結する設計です。外部API、LLM、ハッシュ計算なども不要。ローカルファイルシステム操作のみ。

## 発信コンテンツにできる切り口

- 手動削除を機械化する一歩目を、許可リスト方式（破壊しない範囲を仕組みで保証）で進めた話。
- `--replace-placeholder-package` を opt-in にした理由（誤発火を完全に避けるため）。
- 「自動化を後回し」と言っている本人が、ようやく自動化したのは「人間レビューが減らない部分」ではなく「人間が間違いやすい後始末作業」だった話。

## 検証

実行したコマンド:

- `node --check tools/publish-package-builder/build.mjs` → 成功
- `node --check tools/local-check.mjs` → 成功
- `npm run local:check` → `ok: true`、informational含む全15チェック green
- `npm run publish:package -- building-hitori-media-os --dry-run --replace-placeholder-package` → `dryRun: true` / `replacePlaceholderPackage: true` / `behavior: "dry-run-no-writes"` / 7 platforms に replacementCandidates、instagram / github に replacementWarnings。書き込みなし。
- `npm run publish:package -- building-hitori-media-os --replace-placeholder-package` → `behavior: "replace-placeholder-package-opt-in"`、7 platforms × 許可リストファイルを `replaced` に記録（後述）。
- `npm run publish:package -- building-hitori-media-os --dry-run` → フラグなしで再確認。すべて `draftIsPlaceholder: false`、`replaced: []`、新本文が反映されていることを確認。
- `npm run publish:package -- ai-blog-db --dry-run` → フラグなしで `replacementCandidates: []` 全件、ai-blog-db には影響なし。
- `npm run build` → 成功。

### 実際に置き換えられたファイル

building-hitori-media-os:

- `publish-packages/x/building-hitori-media-os/posts.md`
- `publish-packages/x/building-hitori-media-os/checklist.md`
- `publish-packages/substack/building-hitori-media-os/post.md`
- `publish-packages/substack/building-hitori-media-os/checklist.md`
- `publish-packages/note/building-hitori-media-os/article.md`
- `publish-packages/note/building-hitori-media-os/checklist.md`
- `publish-packages/threads/building-hitori-media-os/posts.md`
- `publish-packages/threads/building-hitori-media-os/checklist.md`
- `publish-packages/youtube/building-hitori-media-os/script.md`
- `publish-packages/youtube/building-hitori-media-os/checklist.md`
- `publish-packages/shorts/building-hitori-media-os/script.md`
- `publish-packages/shorts/building-hitori-media-os/checklist.md`
- `publish-packages/podcast/building-hitori-media-os/script.md`
- `publish-packages/podcast/building-hitori-media-os/show-notes.md`
- `publish-packages/podcast/building-hitori-media-os/checklist.md`

`grep '\[x\] Draft is a real draft' publish-packages/*/building-hitori-media-os/checklist.md` で7media checklist 全てに real-draft チェックが入ったこと、`grep 'DRAFT STATUS: placeholder' ...` でplaceholder banner が一切残っていないことを確認しました。

### 意図的に置き換えなかったファイル

building-hitori-media-os:

- `README.md`（全 platform）
- substack の `notes.md` / `about-page.md` / `welcome-email.md` / `title-options.md` / `social-preview-image.md` / `subscribe-cta.md` / `repurpose-map.md`
- note の `insert-map.md`
- shorts の `caption.md`
- podcast の `audio-todo.md`
- youtube の `slides/checklist.md`（nested）
- instagram / github の全ファイル（draftSourceDir 未設定で対象外）
- 画像 / 音声 / 動画ファイル一切
- `private/` 配下
- `assets/visuals/` 配下

## 次にテストすること

1. text-first 4媒体（X / Threads / note / Substack）を順次手動公開し、新 checklist が正しく機能するか確認する。
2. YouTube / Shorts / Podcast の実録画 / 実収録を進めるとき、新 checklist の Production Checklist 部分を活用する。
3. 次キャンペーンを作るときに、placeholder → 実下書き → `--replace-placeholder-package` のフローを再度通して、運用が安定するかを確認する。
