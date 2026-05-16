# Handoff: building-hitori-media-os Public Release Review Package

Date: 2026-05-14

## 1. Task Goal

`substackGrowthAction` の Studio UI 手動確認が通った（passed）ので、その記録と、`substackSubscriberMilestone` / `substackPaidReadiness` を proposed-only に据え置く判断を残す。その上で、building-hitori-media-os の手動公開フローを支える **public release review package** を `publish-packages/campaigns/building-hitori-media-os-release-review/` に新規作成する。

## 2. Constraints Followed

- Next.jsは追加していない。
- paid LLM API integrationは追加していない。
- OpenAI API / Anthropic API clientsは追加していない。
- 外部APIは呼んでいない。
- auto-postingは実装していない。
- Sanity direct writeは実装していない（コード側から）。
- Sanity CLI create/update commandsは実行していない。
- `seed --replace` は実行していない。
- 実project ID、APIキー、トークン、認証情報、シークレットは追加していない。
- 有料PDF本文の引用は含めていない。
- 新規media fileは生成していない。
- 既存ファイルを破壊的に上書きしていない（既存 outputs / publish-packages / seed 未変更）。
- 残り2本の proposed Substack schema（SubscriberMilestone / PaidReadiness）は活性化していない。

## 3. Changed Files

### Added (Part 1: GrowthAction Studio check)

- `docs/devlog/0076-substack-growth-action-studio-check.md`
- `docs/handoff/0088-substack-growth-action-studio-check.md`

### Added (Part 2: Release review package)

- `publish-packages/campaigns/building-hitori-media-os-release-review/README.md`
- `publish-packages/campaigns/building-hitori-media-os-release-review/campaign-overview.md`
- `publish-packages/campaigns/building-hitori-media-os-release-review/publish-order.md`
- `publish-packages/campaigns/building-hitori-media-os-release-review/x-final-review.md`
- `publish-packages/campaigns/building-hitori-media-os-release-review/threads-final-review.md`
- `publish-packages/campaigns/building-hitori-media-os-release-review/note-final-review.md`
- `publish-packages/campaigns/building-hitori-media-os-release-review/substack-final-review.md`
- `publish-packages/campaigns/building-hitori-media-os-release-review/youtube-final-review.md`
- `publish-packages/campaigns/building-hitori-media-os-release-review/shorts-final-review.md`
- `publish-packages/campaigns/building-hitori-media-os-release-review/podcast-final-review.md`
- `publish-packages/campaigns/building-hitori-media-os-release-review/final-human-checklist.md`
- `publish-packages/campaigns/building-hitori-media-os-release-review/post-publication-log-template.md`

### Added (Part 4: docs)

- `docs/devlog/0077-building-hitori-media-os-release-review-package.md`
- `docs/handoff/0089-building-hitori-media-os-release-review-package.md`

### Modified

- `docs/handoff/latest.md`

### Confirmed unchanged

- `outputs/x/*`, `outputs/threads/*`, `outputs/note/*`, `outputs/substack/*`, `outputs/youtube/*`, `outputs/shorts/*`, `outputs/podcast/*`
- `publish-packages/{x,threads,note,substack,youtube,shorts,podcast}/building-hitori-media-os/`（本体は触らない）
- `schemas/index.ts`、`sanity.config.ts`、既存 schemas 全般
- 既存 seed
- 残り2本の proposed Substack schema（SubscriberMilestone / PaidReadiness）

## 4. Summary of Changes

### Part 1: GrowthAction Studio check (passed)

- 人間が `npm run dev` を起動して Studio をブラウザで確認。
- 「Substack成長施策（Substack Growth Action）」が document type 一覧に表示。
- `actionType` select、`targetPlatform` select、`dueDate` / `completedDate` date picker、`safetyNotes` text、`status` radio が想定通り動作。
- `sourceContentIdea` / `publicationStrategy` の参照UIも解決。
- ブロッキング問題なし。active 維持。
- 残り2本（SubscriberMilestone / PaidReadiness）は subscribers 動向 / paid 検討シグナルが出るまで proposed-only。
- `docs/devlog/0076-substack-growth-action-studio-check.md` / `docs/handoff/0088-substack-growth-action-studio-check.md` に記録。

### Part 2: Release review package

`publish-packages/campaigns/building-hitori-media-os-release-review/` を新規作成、12 ファイルを配置:

1. `README.md`: 全体図 / active な strategy records / publish package paths / ready / remaining manual / recommended review order
2. `campaign-overview.md`: target reader / positioning / core thesis / not-overclaim 方針 / voice-content-format
3. `publish-order.md`: 推奨公開順（X → Threads → note → Substack → YouTube → Shorts → Podcast）+ 理由 + pause triggers
4. `x-final-review.md`: 推奨 main post + alternate + thread + CTA + checklist + URL/reaction 欄
5. `threads-final-review.md`: main + alternate + reply chain + discussion question + checklist + URL/reaction 欄
6. `note-final-review.md`: title options + 推奨 title + lead + 章立て + 画像 checklist + CTA + checklist + URL/reaction 欄
7. `substack-final-review.md`: title/subject/preview + CTA + Reader Question + Notes plan + About/Welcome alignment + GrowthAction checklist + URL/subscriber-reply 欄
8. `youtube-final-review.md`: title + thumbnail + recording mode + chapters + screen-recording safety + CTA + pinned comment + description + URL/reaction 欄
9. `shorts-final-review.md`: 3 candidates + 推奨第1本 + caption/edit checklist + CTA + URL/reaction 欄
10. `podcast-final-review.md`: title + recording mode + outline 表 + show notes + audio production checklist + AI voice safety + URL/reaction 欄
11. `final-human-checklist.md`: per-platform review + safety reaffirmation + tracking plan + pause conditions + final sign-off
12. `post-publication-log-template.md`: 公開ログ雛形（platform / URL / date / hook / reaction / comments / subscriber impact / reuse / improve / Sanity update / follow-up / safety）

### Part 3: Source outputs untouched

- 各 platform の outputs / publish-packages 本体は触っていない。release review package は「参照と意思決定欄」を集約するだけ。

## 5. Important Decisions

- スキーマ活性化を一旦止め、実投稿に進む方向へバトンを渡す。
- subscribers が動くまで `substackSubscriberMilestone` を活性化しない。「活性化しない判断」も仕組みの一部として残す。
- paid offer を急がない。`substackPaidReadiness` を Studio に出すのは、信頼の兆し / 繰り返し届く質問 / 需要シグナルが揃ってから。
- release review package は「単一フォルダ + per-platform final-review + final-human-checklist + post-publication-log-template」の3層構造。
- 推奨公開順は X → Threads → note → Substack → YouTube → Shorts → Podcast。

## 6. Human Review Questions

- `final-human-checklist.md` の項目で、不足や追加したい項目はあるか。
- `publish-order.md` の推奨順を本人の運用感覚と合わせて確定してよいか。
- `post-publication-log-template.md` を `docs/devlog/` 配下に保存するルールでよいか、別フォルダ（例: `docs/publish-log/`）に分けるか。
- subscribers の動きを観察するため、`substackSubscriberMilestone` を「先に器だけ作っておく」のか、引き続き proposed のままにするか。
- AI clone voice / avatar を将来検討する場合の、本人承認プロセスを別 doc で明文化するか。

## 7. Risks or Uncertainties

- release review package の per-platform final-review は、source（publish-packages / outputs）への参照と意思決定欄が中心。source 側の本文が変わった場合、final-review の引用と乖離する可能性がある。実投稿前に source を読み直すルールでカバー。
- `post-publication-log-template.md` を手動でコピーする運用は、忘れやすい。`docs/devlog/` を分けるか、テンプレ呼び出し方法を docs に明記しておくと安心。
- `final-human-checklist.md` の項目が増えすぎると、レビュー時にスキップされやすくなる。最小 viable な数（現状）で運用してから判断する。

## 8. Recommended Next Step

- 人間が `publish-packages/campaigns/building-hitori-media-os-release-review/` を開き、`README.md` → `final-human-checklist.md` → `x-final-review.md` の順に確認する。
- X を最初に手動投稿し、`x-final-review.md` の URL / reaction 欄を埋める。
- `post-publication-log-template.md` を `docs/devlog/0078-publish-log-building-hitori-media-os-x-<date>.md` などにコピーして、最初の公開ログを書く。
- Threads → note → Substack の順で手動公開を続ける。
- Substack 公開時に Sanity Studio で `substackPostPlan.publishedUrl` / `substackGrowthAction.resultNotes` を手動更新する（`seed --replace` 不使用）。
- 反応が見え、subscribers が動き始めたタイミングで、`substackSubscriberMilestone` の活性化バッチに進む。

## 9. Exact Prompt to Give Codex Next

```text
Record the first manual publish (X) of the building-hitori-media-os campaign.

Do not add Next.js.
Do not add paid LLM API integrations.
Do not call external APIs.
Do not auto-post.
Do not write directly to Sanity from code.
Do not run seed --replace.
Do not commit the original paid PDF or any verbatim long passages from it.

Use:
- publish-packages/campaigns/building-hitori-media-os-release-review/x-final-review.md
- publish-packages/campaigns/building-hitori-media-os-release-review/post-publication-log-template.md
- publish-packages/x/building-hitori-media-os/posts.md
- outputs/x/2026-05-14--building-hitori-media-os--x.md
- seed/substack-publication-strategy-building-hitori-media-os.json

Steps:
1. Wait for the human to confirm the main X post copy and any thread decisions.
2. Update publish-packages/campaigns/building-hitori-media-os-release-review/x-final-review.md with the actual published URL, published date/time, and reaction notes (after publication).
3. Copy publish-packages/campaigns/building-hitori-media-os-release-review/post-publication-log-template.md to docs/devlog/0078-publish-log-building-hitori-media-os-x-<date>.md and fill it in.
4. Suggest whether substackSubscriberMilestone should be activated now (only if subscribers actually moved).
5. Do not auto-post. Do not call the X API. Do not update Sanity directly from code.

Document:
- the actual main post copy and any thread used
- the published URL, date/time, reaction summary
- whether the GrowthAction record should be updated in Sanity Studio (human-driven)
- any decision about next platform (Threads next?)

Update devlog and handoff.
```
