# Devlog 0066: building-hitori-media-os YouTube / Shorts / Podcast production drafts

Date: 2026-05-14

## 今日の判断

`building-hitori-media-os` キャンペーンの video / audio 系 3 媒体（YouTube / Shorts / Podcast）のplaceholder draftを、人間が録画・収録できる ready-for-human-edit production draft へ差し替えました。

これで text-first 4 媒体（X / Substack / note / Threads）と合わせて、Hitori Media OS v0.2 が想定する text / video / audio 主要 7 媒体すべてが real draft 状態に揃いました。

Instagram と GitHub は `draftSourceDir: null` のままで、従来通り TODO 扱いとして残ります（draft 自動検出の対象外）。

## 変更したこと

- `outputs/youtube/2026-05-14--building-hitori-media-os--youtube.md` を10〜15分の長尺production draftへ置き換え。
  - placeholderマーカーを削除、`Status: ready-for-human-edit` を明示。
  - Title Options / Thumbnail Direction / Episode Concept / Opening Hook / Chapter Structure（9章）/ Talking-head Outline / Screen-recording Cues / Visual Insert / Closing CTA / Pinned Comment Draft / Description Draft / Production Modes（human-shot / hybrid / ai-generated future TODO）/ Production Checklist / Human Review Checklist。
  - chapters は `00:00 Chapter Name` 形式でYouTube description へ転記可能な形に揃えた。
- `outputs/shorts/2026-05-14--building-hitori-media-os--shorts.md` を30〜45秒のShort 3本構成へ置き換え。
  - placeholderマーカーを削除、`Status: ready-for-human-edit` を明示。
  - 3本（仕組みを作る / AIに丸投げではなく判断を残す / 1つのContent Ideaから複数媒体へ）。各 Short に Concept / Hook / Spoken Script / Closing / Caption / Visual Direction / Edit Notes / CTA を分けて記載。
  - 1本につき主張1つ、字幕全文、screen recording区間で secret / private/ が映らないよう Safety Note を明示。
- `outputs/podcast/2026-05-14--building-hitori-media-os--podcast.md` を20〜30分のひとり語り production draft へ置き換え。
  - placeholderマーカーを削除、`Status: ready-for-human-edit` を明示。
  - Title Options / Episode Concept / Opening / Main Talking Points（A〜D の 4 ブロック）/ Reflective Section / Listener Question / Closing / Show Notes Draft / Production Modes（human-recorded / TTS internal review / AI clone future TODO）/ Audio TODO / Production Checklist / Human Review Checklist。
  - AI clone voice は本人承認なしには使わない方針を本文・Safetyの両方で明示。

publish-packages 配下は触っていません。

## 理由

ここまで Hitori Media OS の v0.2 想定（text / visual / video / audio / Substack / note / X / Threads / Instagram / YouTube / Shorts / Podcast）を1キャンペーンで通すために、text-first 4媒体を ready にした流れの自然な延長として、video / audio 3 媒体までを ready 状態に揃えました。

production draft 段階で止めている理由:

- 実際の動画 / 音声ファイル生成はこの builder では行わない。
- 録音 / 撮影は手動 / 人間判断が中心。
- AI clone / TTS / AI generated avatar 系は、本人承認・権利確認・配布範囲の合意がない段階では着手しない。

Production Modes を各ファイルで `human-shot/recorded` を推奨初版、`hybrid` を可、`AI-generated / AI clone future` を TODO として整理することで、安全側に倒した運用ルールを draftにも明文化しました。

## 媒体ごとの差別化メモ

### YouTube vs Shorts

- YouTube = 10〜15分の長尺。Chapter / screen recording / visual insertを多用して、Sanity Studio / Publish Package Builder の運用を見せる場として使う。Description にチャプターと安全方針まで書いて、build-log 動画の体裁を取る。
- Shorts = 1本30〜45秒 × 3本セット。1本につき主張1つだけ。screen recording区間は合計5秒以内に抑え、talking head中心。CTAは「コメントで返信ください」レベルに留める。

### Podcast vs Substack / note

- Podcast = 反復視聴用というより、聞き流しながら考え方を共有する尺。20〜30分のひとり語りで、結論を急がない、迷いも含めて話す。Listener Question を1問だけ置く。
- Substack = email 配信 / subscriber asset。制作ログトーンで、 Reader Question + Subscribe CTA。
- note = 検索 / 日本語アーカイブ。論考調で、章立てとH2/H3が中心。

役割を意識して、同じ内容を媒体ごとに「再生産」しないよう意図的に分けた。

## CodexとClaude Codeの役割分担

Claude Codeで3媒体の production draftを書きました。Codex 側は、人間レビュー後に「実録画 / 実収録時の進行台本」やpublish-packages再生成のレビューに回す想定。

## APIなしで済ませた理由

- 動画 / 音声ファイル生成は今回スコープ外。
- LLM API / 画像生成 API / AI clone API は使わない。
- 自分の言葉で台本構成を書いたほうが、building-in-public トーンが揃いやすい。
- `--dry-run` で副作用なく検証できる体制が既にあるため、外部API なしで完結。

## 発信コンテンツにできる切り口

- text / video / audio を1キャンペーン内で integrated に設計した最初の例。
- 7 媒体の production draft を全て揃えた状態で、初めて「公開順をどう組むか」を冷静に議論できる。
- AI clone を将来 TODO に明示する設計の倫理面（声色 / 権利 / 同意）の話。
- Hitori Media OS は手動運用のまま、ここまで台本層を仕組みで揃えた、というbuild log。

## 検証

- `node --check tools/publish-package-builder/build.mjs` → 成功
- `node --check tools/local-check.mjs` → 成功
- `npm run local:check` → `ok: true`、informational含む全15チェック green
- `npm run publish:package -- building-hitori-media-os --dry-run` →
  - `dryRun: true`、`behavior: "dry-run-no-writes"`
  - `x` / `substack` / `note` / `threads` / `youtube` / `shorts` / `podcast`: `draftIsPlaceholder: false`
  - `instagram` / `github`: `draftExists: false`（draftSourceDir 未設定）
- `npm run build` → 成功

publish-packages配下のファイルは生成・上書きしていません。

## 既存packageへの反映

publish-packagesに新本文を反映したい場合、人間が次のファイルを削除してから `npm run publish:package -- building-hitori-media-os` を再実行する想定です。

text-first 4 + video/audio 3 = 7 媒体ぶん:

- `publish-packages/x/building-hitori-media-os/posts.md`, `.../checklist.md`
- `publish-packages/substack/building-hitori-media-os/post.md`, `.../checklist.md`
- `publish-packages/note/building-hitori-media-os/article.md`, `.../checklist.md`
- `publish-packages/threads/building-hitori-media-os/posts.md`, `.../checklist.md`
- `publish-packages/youtube/building-hitori-media-os/script.md`, `.../checklist.md`
- `publish-packages/shorts/building-hitori-media-os/script.md`, `.../checklist.md`
- `publish-packages/podcast/building-hitori-media-os/script.md`, `.../checklist.md`, `.../show-notes.md`（show-notes本文を新版に差し替えたい場合のみ）

破壊的な自動削除は今回も行いません。

## 次にテストすること

1. text-first 4媒体（X / Threads / note / Substack）を人間レビュー後に手動公開する。
2. その後、YouTube production draft をもとに録画 / 編集 / アップロードを手動で行う（screen recording区間の secret / private/ チェックを忘れない）。
3. Shorts 3本のうち、最初に投稿する2本を選び、字幕とBGMトーンを揃えて公開する。
4. Podcast は録音 / TTS / AI clone のどれで進めるかを判断（推奨は human-recorded）。
5. 全媒体公開後、`publish-packages/<platform>/building-hitori-media-os/` 配下の `<draftTarget>.md` / `checklist.md` を人間が削除して、再生成して新 checklist の placeholder banner が出ないことを確認する。
6. その後、`schemas/proposed/` への Substack 系 schema 雛形に進むか、Instagram / GitHub のテキストTODOに `draftSourceDir` を導入するかを判断する。
