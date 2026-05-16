# Devlog 0077: building-hitori-media-os Public Release Review Package

Date: 2026-05-14

## 今日の判断

`substackGrowthAction` の Studio UI 手動確認まで通したので、`schemas/proposed/` 残り2本（`substackSubscriberMilestone` / `substackPaidReadiness`）はあえて活性化を保留し、代わりに **building-hitori-media-os の public release review package** を整えました。

スキーマを増やす方向ではなく、実投稿に進む方向へバトンを渡す段階です。

## 変更したこと

### Part 1: GrowthAction Studio check

- 人間が `npm run dev` で確認。`actionType` select / `targetPlatform` select / `dueDate` / `completedDate` date picker / `safetyNotes` / `status` radio が想定通り動作。ブロッキング問題なし。
- `substackGrowthAction` は active 維持。
- 残り2本（SubscriberMilestone / PaidReadiness）は **今回は活性化しない判断**。
  - subscribers が動いていないので、Milestone レコードに入力対象がない。
  - paid 化を急がないので、PaidReadiness を Studio に出さない方が運用判断が雑になりにくい。
- `docs/devlog/0076-substack-growth-action-studio-check.md` と `docs/handoff/0088-substack-growth-action-studio-check.md` に記録。

### Part 2: Release review package

`publish-packages/campaigns/building-hitori-media-os-release-review/` を新規作成。次の12ファイルを配置:

- `README.md`: campaign 全体図、active な Sanity strategy records、publish package paths、ready / remaining manual、recommended review order。
- `campaign-overview.md`: target reader、positioning、core thesis、何を主張せず、何を主張するか、voice / content / format。
- `publish-order.md`: 推奨公開順（X → Threads → note → Substack → YouTube → Shorts → Podcast）と理由。pause 条件もまとめる。
- `x-final-review.md`: 推奨 main post、alternate hooks、optional thread、CTA options、checklist、published URL / reaction notes 欄。
- `threads-final-review.md`: 推奨 main post、alternate、reply chain（7本 → 4〜5本に削る判断）、discussion question、checklist、published URL / reaction notes 欄。
- `note-final-review.md`: title options + 推奨タイトル、lead paragraph、章立て7節、画像挿入checklist、CTA、checklist、published URL / reaction notes 欄。
- `substack-final-review.md`: title / subject / preview、Subscribe CTA、Reader Question、Notes follow-up plan、About Page / Welcome Email alignment、GrowthAction checklist、published URL / subscriber-reply notes 欄。
- `youtube-final-review.md`: title options、thumbnail direction、recording mode 推奨、chapters、screen-recording safety checklist、CTA、pinned comment、description checklist、published URL / reaction notes 欄。
- `shorts-final-review.md`: 3 short candidates + 推奨第1本（Short 1）、caption / edit checklist、CTA、published URL / reaction notes 欄。
- `podcast-final-review.md`: episode title options、recording mode（human-recorded 推奨、TTS internal review 可、AI clone TODO）、monologue outline 表、show notes、audio production checklist、AI voice safety note、published URL / reaction notes 欄。
- `final-human-checklist.md`: per-platform review、safety reaffirmation、tracking plan、pause conditions、final sign-off。
- `post-publication-log-template.md`: 公開ごとに `docs/devlog/` へコピーする雛形（platform / URL / date / headline / initial reaction / comments / subscriber impact / what to reuse / what to improve / Sanity update / follow-up idea / safety reaffirmation）。

### Part 3: Source outputs は触っていない

- `outputs/x/*`, `outputs/threads/*`, `outputs/note/*`, `outputs/substack/*`, `outputs/youtube/*`, `outputs/shorts/*`, `outputs/podcast/*` のいずれも未変更。
- release review package は「人間レビュー用の集約フォルダ」として、source への参照と意思決定欄を提供するだけに留めた。

### Part 4: docs

- このdevlog（0077）と、対応する handoff（0089）を追加。
- `docs/handoff/latest.md` を release review package 完成版に置き換え。

## 変更していないもの

- `sanity.config.ts`（`git diff` 空）。
- 既存スキーマ全般。
- 残り2本の proposed スキーマファイル（substackSubscriberMilestone.ts / substackPaidReadiness.ts）。
- 既存 outputs / publish-packages（既存 ai-blog-db / building-hitori-media-os の本体は触らない）。
- 既存 seed。

## 理由

Substack 戦略レイヤー4本が active になり、text-first 4 媒体と video / audio 3 媒体の draft が ready の段階で、次に必要なのは「人間が手動公開する直前に1か所で全部確認できる場所」でした。

これがないと:

- 媒体ごとの publish-package を毎回行き来する必要がある。
- 公開順や pause 条件、screen recording の安全確認を、その場で思い出すしかない。
- 公開後の URL / reaction notes を残す習慣が ad-hoc になる。

release review package を1フォルダにまとめておくと、人間が「今日X出すぞ」となったときに、`x-final-review.md` を1つ開けば判断材料が揃う状態にできます。

スキーマをさらに増やす（SubscriberMilestone / PaidReadiness 活性化）よりも先に、実際に公開して反応を見たほうが、その2本に何を入れたいかも分かるという順序判断もありました。

## 安全性の担保

- `sanity.config.ts` 未変更。
- Sanity CLI / direct write / `seed --replace` 不使用。
- 有料PDF本文の引用ゼロ。
- 各 final-review に「No auto-posting / No platform API call / Manual publish only」の Safety 節を入れている。
- `youtube-final-review.md` には screen recording safety checklist（secret / 実 project ID / private/ を映さない）を独立節として置いた。
- `podcast-final-review.md` には AI voice safety note を独立節として置いた。
- `final-human-checklist.md` に safety reaffirmation 節と pause conditions を明示。

## CodexとClaude Codeの役割分担

Claude Code が今回の package 作成を担当。Codex 側は、人間レビューと最初の手動公開、`post-publication-log-template.md` を埋めるサポート、Sanity Studio への手動反映補助に回す想定。

## APIなしで済ませた理由

集約フォルダの作成は markdown 記述のみ。LLM API / 外部翻訳 / Sanity API は一切呼んでいない。

## 発信コンテンツにできる切り口

- 「スキーマを増やす」と「実投稿に進む」のどちらが次か、という運用判断の話。
- release review package を 1 フォルダにまとめる設計（per-platform final-review + final-human-checklist + post-publication-log-template）の意義。
- subscribers が動く前に Milestone を活性化しない判断（活性化しないことも仕組みの一部）。

## 検証

- `node --check tools/local-check.mjs` → 成功
- `npm run local:check` → `ok: true`、informational含む全15チェック green
- `npm run build` → 7.5s で成功
- `publish-packages/campaigns/building-hitori-media-os-release-review/` に12ファイルが揃っていることを確認

## 次にテストすること

1. 人間が `final-human-checklist.md` を1度通し、`x-final-review.md` から順番に最終文体を確定する。
2. X を最初に手動投稿し、`x-final-review.md` の published URL / reaction notes 欄を埋める。
3. `post-publication-log-template.md` を `docs/devlog/0078-publish-log-...-x-...md` などにコピーして、最初の公開ログを書く。
4. Threads → note → Substack の順で同じ手順を回す。
5. Substack 公開時には、`substackPostPlan` / `substackGrowthAction` の Studio レコードに publishedUrl / resultNotes を手動反映する。
6. 反応が見えてきたら、`substackSubscriberMilestone` の活性化を判断する別バッチへ進む。
