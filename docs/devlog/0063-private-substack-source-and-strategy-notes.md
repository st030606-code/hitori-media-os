# Devlog 0063: Private Substack Source + Abstracted Strategy Notes

Date: 2026-05-14

## 今日の判断

購入したSubstack教科書PDFがローカルに配置されたので、Hitori Media OSのリポジトリで「有料素材は private にだけ置き、公開リポジトリには抽象化された戦略メモとモジュールだけを残す」運用ルールを正式に整備しました。

ファイルそのもの、長文引用、スクリーンショット、購入導線はすべて公開しません。

## 変更したこと

- `.gitignore` に `private/` を追加（コメント付き）。`private/sources/substack/substack-textbook-brain-2026-04-30.pdf` の git ignore 状態を `git check-ignore` で確認済み。
- `docs/strategy-sources/substack-textbook-notes.md` を新規追加。本文をコピーしない抽象化メモ。
- `docs/strategy-modules/substack-strategy-module.md` を新規追加。Substack Reader-List Engine用の実装向けStrategy Module。
- `docs/39-strategy-module-ingestion-workflow.md` に「Private paid source handling」節を追加。
- `README.md` に「Private strategy sources」節を追加。
- `tools/local-check.mjs` に2つのinformational checkを追加。
  - `private/ is gitignored if it exists`
  - `private/ contents are not tracked`
  - どちらもinformational扱いで、失敗してもexit 1にはしない（既存の `.env.local exists` と同じ扱い）。

## 理由

このタイミングで運用ルールを文書化しないと、後で「教材から抜粋した文を勢いでdocsに貼ってしまう」事故が起きやすい。とくに、`docs/35-hitori-media-os-v0-2-architecture.md` や `docs/36-substack-strategy-module.md` をすでに整備しているため、Substack教科書の本文と混同しないように、強制的に分離する必要がありました。

抽象化メモ（strategy-sources）と実装向けモジュール（strategy-modules）の役割を分けたのは、教材引用とプロダクト設計を混ぜないためです。

- `strategy-sources/` = 教材から自分の言葉で抽出した原則・含意。
- `strategy-modules/` = それを「Hitori Media OSとしてどう動かすか」へ変換した内部仕様。

handoffは引き続き「抽象化された成果物」だけを参照対象にします。

## CodexとClaude Codeの役割分担

今回はClaude Codeが単独で実装。Codexにはこの後、抽象化メモをもとにSubstack専用のSanity schema候補（substackPublicationStrategy など）を `schemas/proposed/` に提案する作業や、prompts/substack-* の小さな改善を渡せる想定。

## APIなしで済ませた理由

教材の中身は人間が読み、自分の言葉でメモにする運用です。LLM API、ベクトル化、PDFパースなどはまだ不要でした。`.gitignore` 更新とMarkdown追加だけで運用ルールを実体化できます。

`tools/local-check.mjs` も execSyncで `git ls-files` を呼ぶだけのローカル処理で、外部APIに依存しません。

## 発信コンテンツにできる切り口

- 「教材をDB化する」のではなく「教材を抽象化してOSに溶かす」運用。
- private PDFは絶対にcommitしない、というルールをコード（.gitignore + local-check）でも守る。
- strategy-sourcesとstrategy-modulesの2層構造。
- AIが使えるDBは、自分が読んだ教材を抜き出し直す場所ではない。
- 「教材本文を見せる」より「教材の原則を運用に落としたか」を見せる。

## 検証

- `node --check tools/local-check.mjs` → 成功
- `npm run local:check` → `ok: true`、新規追加した `private/ is gitignored if it exists`（present and ignored）と `private/ contents are not tracked`（no tracked files under private/）の両方が green。
- `git check-ignore private/sources/substack/substack-textbook-brain-2026-04-30.pdf` → 該当ファイルがignoreされていることを確認。
- `npm run build` → 成功（後述）。

## 次にテストすること

1. 抽象化メモの内容で実運用が回るか、building-hitori-media-os / ai-blog-db のSubstack draftを書きながら確認する。
2. `substackPublicationStrategy` や `substackPostPlan` を `schemas/proposed/` に下書きすべきタイミングを決める。
3. 他の教材（X運用、YouTube台本、sales funnel など）が追加されたとき、同じ `strategy-sources/` + `strategy-modules/` 構造で受け入れられるかを確認する。
