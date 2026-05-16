# Handoff: building-hitori-media-os YouTube / Shorts / Podcast production drafts

Date: 2026-05-14

## 1. Task Goal

`building-hitori-media-os` キャンペーンの video / audio 3 媒体（YouTube / Shorts / Podcast）の placeholder draft を、人間が録画・収録・公開できる ready-for-human-edit production draft に置き換える。実動画 / 実音声ファイルは作らず、台本層と production plan / safety までを整える。dry-run で全 9 媒体の placeholder 状態を確認する。

## 2. Constraints Followed

- Next.jsは追加していない。
- paid LLM API integrationは追加していない。
- OpenAI API / Anthropic API clientsは追加していない。
- image generation API callsは実装していない。
- auto-postingは実装していない。
- Sanity direct writeは実装していない。
- Sanity CLI create/update commandsは実行していない。
- `seed --replace` は実行していない。
- 実project ID、APIキー、トークン、認証情報、シークレットは追加していない。
- 有料PDF本文の引用は含めていない。
- 新規media fileは生成していない。
- 録音 / 録画は行っていない。
- 既存publish package fileは破壊的に上書きしていない。

## 3. Changed Files

### Modified

- `outputs/youtube/2026-05-14--building-hitori-media-os--youtube.md`（placeholder → ready-for-human-edit、10〜15分のproduction draft）
- `outputs/shorts/2026-05-14--building-hitori-media-os--shorts.md`（placeholder → ready-for-human-edit、30〜45秒 × 3本）
- `outputs/podcast/2026-05-14--building-hitori-media-os--podcast.md`（placeholder → ready-for-human-edit、20〜30分のひとり語り）
- `docs/handoff/latest.md`

### Added

- `docs/devlog/0066-building-hitori-media-os-video-audio-drafts.md`
- `docs/handoff/0078-building-hitori-media-os-video-audio-drafts.md`

### Not touched

- `publish-packages/youtube/building-hitori-media-os/`
- `publish-packages/shorts/building-hitori-media-os/`
- `publish-packages/podcast/building-hitori-media-os/`
- `publish-packages/{x,substack,note,threads}/building-hitori-media-os/`
- text-first 4 媒体の outputs / draft

## 4. Summary of Changes

### YouTube draft

- 10〜15分の長尺。Title / Thumbnail Direction / Episode Concept / Opening Hook / 9 章のChapter Structure / Talking-head Outline / Screen-recording Cues / Visual Insert / B-roll / Closing CTA / Pinned Comment / Description / Production Modes（human-shot 推奨, hybrid 可, AI-generated future は TODO） / Production Checklist / Human Review Checklist。
- Chapter は `00:00 形式` の chapters を Description に直接転記できる形に揃えた。
- screen recording 区間で secret / 実project ID / private/ が映らないこと確認を Safety に明記。

### Shorts draft

- 30〜45秒 × 3本セット。各 Short に Concept / Hook / Spoken Script / Closing / Caption / Visual Direction / Edit Notes / CTA。
  - Short 1: 「発信を頑張るより、仕組みを作る」
  - Short 2: 「AIに丸投げじゃなく、人間の判断を残す」
  - Short 3: 「1つのContent Ideaから複数媒体へ」
- 1本につき主張は1つだけ、字幕全文、screen recording区間は合計5秒以内。BGMは控えめ。

### Podcast draft

- 20〜30分のひとり語り。Title / Episode Concept / Opening / Main Talking Points（A: 発信を頑張る→仕組みへ / B: 中心の Content Idea / C: AI-readable DB / D: 自動化は最後）/ Reflective Section / Listener Question / Closing / Show Notes Draft / Production Modes（human-recorded 推奨, TTS internal review, AI clone future TODO）/ Audio TODO / Production Checklist / Human Review Checklist。
- AI clone voice は本人承認なしには使わない方針を本文・Safetyの両方に明示。

### 共通

- Strategy Module（`docs/strategy-modules/substack-strategy-module.md`）の Pipeline Changes（YouTube / Podcast = deeper trust、Shorts = single-claim short bursts）に従って役割を分けた。
- 教材本文の引用ゼロ。
- 録画 / 収録 / 編集 / アップロードはすべて手動。

## 5. Important Decisions

- video / audio はファイル生成ではなく production draft 層で止める方針を引き続き維持。
- Shorts は3本セットにし、1本につき主張1つだけ。同じ週に詰めすぎない運用ガイドを Safety に追加。
- Podcast は human-recorded を推奨初版に明記し、TTS は「自分用の確認用」、AI clone は「本人承認まで保留」と段階分けした。
- publish-packages 再生成は引き続き人間が明示的に削除→再ビルドする形を維持し、自動破壊上書きはしない。

## 6. Human Review Questions

- YouTube は human-shot を初版とするか、最初から hybrid（screen-recording 中心）にするか。
- Shorts 3本のうち、最初に投稿する2本はどれにするか。Short 2（AIに丸投げではなく判断を残す）を最初に出すか、Short 1（仕組みを作る）を最初に出すか。
- Podcast の録音は human-recorded で進めるか、TTSで一度自分用に流して台本を直すか。
- YouTube サムネは Visual Register 経由で別途作るか、既存の note hero 画像から派生させるか。
- 全 7 媒体の公開順をどう組むか（候補: X → Threads → note → Substack → YouTube → Shorts → Podcast）。

## 7. Risks or Uncertainties

- production draft 段階のため、実録画 / 実収録時に台本通り進まない場合の運用ルールが未整備。
- AI clone voice / AI-generated avatar は明示的 TODO だが、安易に着手しないようさらに devlog or schemas/proposed で「未着手の理由」を文章化したほうが安全。
- Shorts のCaption ハッシュタグは2〜3個に絞っているが、媒体ごとの最適値は手動公開時に微調整が必要。
- screen recording区間に secret / 実project ID / private/ が映らないようにする運用は、人間チェックが最終防衛線。

## 8. Recommended Next Step

- 人間レビュー後、text-first 4 媒体（X / Threads / note / Substack）を順次手動公開する。
- 並行して、`publish-packages/{x,threads,note,substack}/building-hitori-media-os/` の draftTarget / checklist を人間が削除して再生成、新 checklist に placeholder banner が出ないことを確認する。
- 反応を見つつ、YouTube → Shorts → Podcast の順番で実録画 / 実収録 / 公開を進める。
- すべての公開が終わってから、`schemas/proposed/` への Substack 系 Sanity schema 雛形（Studio 未登録）に進むのが、いまの全体スケジュール上は最も安全。

### Manual deletion targets for package regeneration

text-first 4 + video/audio 3 = 7 媒体ぶん:

```text
publish-packages/x/building-hitori-media-os/posts.md
publish-packages/x/building-hitori-media-os/checklist.md
publish-packages/substack/building-hitori-media-os/post.md
publish-packages/substack/building-hitori-media-os/checklist.md
publish-packages/note/building-hitori-media-os/article.md
publish-packages/note/building-hitori-media-os/checklist.md
publish-packages/threads/building-hitori-media-os/posts.md
publish-packages/threads/building-hitori-media-os/checklist.md
publish-packages/youtube/building-hitori-media-os/script.md
publish-packages/youtube/building-hitori-media-os/checklist.md
publish-packages/shorts/building-hitori-media-os/script.md
publish-packages/shorts/building-hitori-media-os/checklist.md
publish-packages/podcast/building-hitori-media-os/script.md
publish-packages/podcast/building-hitori-media-os/checklist.md
publish-packages/podcast/building-hitori-media-os/show-notes.md  # 新版show-notesを反映したい場合のみ
```

他のpackage file（README.md / images/ / notes.md / about-page.md / welcome-email.md / title-options.md / social-preview-image.md / subscribe-cta.md / repurpose-map.md / insert-map.md / audio-todo.md / slides/checklist.md / caption.md）は、手動レビュー済みなら残してOK。

## 9. Exact Prompt to Give Codex Next

```text
Draft schemas/proposed/ Sanity schema sketches for the Substack strategy layer, based on the abstracted notes and module that already exist.

Do not register the proposed schemas in sanity.config.ts.
Do not export them from schemas/index.ts.
Do not commit the original paid PDF or any verbatim long passages from it.
Do not call external APIs.
Do not auto-post.
Do not write directly to Sanity.
Do not run seed --replace.

Use:
- docs/strategy-sources/substack-textbook-notes.md
- docs/strategy-modules/substack-strategy-module.md
- docs/37-substack-schema-extension-plan.md (existing draft)
- schemas/contentIdea.ts as the structural reference

Produce:
- schemas/proposed/substackPublicationStrategy.ts
- schemas/proposed/substackPostPlan.ts
- schemas/proposed/substackNotesPlan.ts
- schemas/proposed/substackGrowthAction.ts
- schemas/proposed/substackSubscriberMilestone.ts
- schemas/proposed/substackPaidReadiness.ts
- schemas/proposed/README.md (説明とactivation checklist)

Update devlog and handoff with:
- which schemas were proposed
- why each schema is needed
- the explicit statement that none of these are active in Studio yet
- the checklist a human must approve before activating each schema
```
