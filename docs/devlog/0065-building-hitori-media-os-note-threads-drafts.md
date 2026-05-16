# Devlog 0065: building-hitori-media-os note / Threads ready-for-human-edit drafts

Date: 2026-05-14

## 今日の判断

`building-hitori-media-os` キャンペーンのうち、note と Threads の placeholder draft を、人間が編集して公開できる ready-for-human-edit ドラフトへ差し替えました。

これで text-first 4 媒体（X / Substack / note / Threads）が ready 状態に揃いました。動画 / 音声系（YouTube / Shorts / Podcast）はまだ placeholder のまま、Instagram と GitHub は draftSourceDir 未設定で従来通り TODO 扱いです。

## 変更したこと

- `outputs/note/2026-05-14--building-hitori-media-os--note.md` を実下書きに置き換え。
  - placeholder マーカー（`Status: draft-placeholder` / `# TODO / draft placeholder`）を削除、`Status: ready-for-human-edit` に変更。
  - Title Options 4案、Lead Paragraph、章立て7節、本文ドラフト、画像挿入ポイント、Soft CTA、Repurpose Notes、Human Review Checklist。
  - 「日本語検索 / archive / 信頼形成」というnote役割に合わせ、X / Threads より構造化、Substack より論考寄り。
- `outputs/threads/2026-05-14--building-hitori-media-os--threads.md` を実下書きに置き換え。
  - 同様に placeholder マーカーを削除し、`Status: ready-for-human-edit` に。
  - メイン投稿候補 1本 + alternate 3案、4〜8の reply chain、discussion question、Soft CTA、Human Review Checklist。
  - X より柔らかく、関係づくり寄り。X版とのCTA一致を避け、「会話したい」を前面に。

publish-packages 配下は触っていません。

## 理由

note と Threads は、X と Substack が公開準備に入ったあとに反応を見て決める想定でしたが、先に4媒体で揃えておくと、次のキャンペーン以降に「placeholder→real」のサイクルを定型化しやすくなります。今のうちに4媒体を ready 状態にしておくと:

- X / Substack を公開した直後、同じ温度感のまま note / Threads を続けられる。
- 反応の異なる媒体（短文・会話・長文・email）を同時に観察できる。
- 公開順を後で柔軟に組み替えられる。

note は note の役割（検索 / archive）を意識した H2 / H3 構造に。Threads は Threads の役割（会話 / 関係づくり）に合わせて、X とは違う温度の本文と CTA にしました。

## 媒体ごとの差別化メモ

### note vs Substack の違い

- note: 検索流入と日本語アーカイブが主役。論考・章立て・図解で「あとから読み返せる」状態に。CTA は note 内のコメントと、Substackへの軽い導線。
- Substack: email配信と subscriber asset が主役。制作ログトーン、Reader Question で返信誘導、Subscribe CTAは soft。

### Threads vs X の違い

- X: フックを強めに、図解ペアやスレッドで「発見」を作る。Soft CTA はSubstack誘導寄り。
- Threads: 関係づくり寄り、reply chain と discussion question で「会話」を作る。CTA は購読より返信誘導を前面に。

## CodexとClaude Codeの役割分担

Claude Codeで両ドラフトを生成。X / Substack draftを参照しつつ、媒体役割（note=archive、Threads=conversation）で重複を意図的に避けました。Codex 側は video / audio 系（YouTube / Shorts / Podcast）のplaceholder解除に回す想定です。

## APIなしで済ませた理由

引き続きLLM APIや外部サービスは不要。Hitori Media OSのcoreThesisを軸に、媒体役割に合わせて自分の言葉で書くほうが早く、副作用もありませんでした。`--dry-run` で placeholder 解除を確認できる体制が既にあるので、検証も外部依存なしで完結します。

## 発信コンテンツにできる切り口

- ひとつのテーマから4媒体までは、placeholder→real の差し替えで揃えられる。
- 5媒体目以降（動画 / 音声）は、テキスト系の反応を見てから優先順位を決める。
- note / Threads の差を「役割で書き分ける」というのが、ひとり運営の品質安定に効く。

## 検証

- `node --check tools/publish-package-builder/build.mjs` → 成功
- `node --check tools/local-check.mjs` → 成功
- `npm run local:check` → `ok: true`、informational含む全15チェック green
- `npm run publish:package -- building-hitori-media-os --dry-run` →
  - `dryRun: true`、`behavior: "dry-run-no-writes"`
  - `x` / `substack` / `note` / `threads`: `draftIsPlaceholder: false`
  - `shorts` / `podcast` / `youtube`: `draftIsPlaceholder: true`
  - `instagram` / `github`: `draftExists: false`（draftSourceDir 未設定）
- `npm run build` → 成功

publish-packages配下のファイルは生成・上書きしていません（前バッチで作成済みのまま、placeholder時代の本文）。

## 既存packageへの反映

publish-packagesに新本文を反映したい場合、人間が次のファイルを削除してから `npm run publish:package -- building-hitori-media-os` を再実行する想定です。

text-first 4 媒体ぶんの再生成対象:

- `publish-packages/x/building-hitori-media-os/posts.md`
- `publish-packages/x/building-hitori-media-os/checklist.md`
- `publish-packages/substack/building-hitori-media-os/post.md`
- `publish-packages/substack/building-hitori-media-os/checklist.md`
- `publish-packages/note/building-hitori-media-os/article.md`
- `publish-packages/note/building-hitori-media-os/checklist.md`
- `publish-packages/threads/building-hitori-media-os/posts.md`
- `publish-packages/threads/building-hitori-media-os/checklist.md`

破壊的な自動削除は今回行いません。

## 次にテストすること

1. 人間がX / Substack / note / Threadsの最終文体を確認し、公開順を確定する（候補: X → Threads → note → Substack）。
2. publish-packages 配下のテキスト4媒体を「人間が削除→再生成」して、新checklistに placeholder banner が出ないことを確認する。
3. その後、YouTube / Shorts / Podcastのplaceholder解除に進むか、`schemas/proposed/` への Substack 系 schema 雛形に進むかを判断する。
