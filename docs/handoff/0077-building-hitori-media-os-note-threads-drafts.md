# Handoff: building-hitori-media-os note / Threads ready-for-human-edit drafts

Date: 2026-05-14

## 1. Task Goal

`building-hitori-media-os` キャンペーンの note と Threads の placeholder draft を、媒体役割（note = 日本語検索 / archive / 信頼形成、Threads = 会話 / 関係づくり）に沿った ready-for-human-edit ドラフトへ差し替える。dry-runで text-first 4媒体（X / Substack / note / Threads）の placeholder 解除を確認し、publish-packages配下は触らずに残す。

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
- 既存publish package fileは破壊的に上書きしていない。

## 3. Changed Files

### Modified

- `outputs/note/2026-05-14--building-hitori-media-os--note.md`（placeholder → ready-for-human-edit）
- `outputs/threads/2026-05-14--building-hitori-media-os--threads.md`（placeholder → ready-for-human-edit）
- `docs/handoff/latest.md`

### Added

- `docs/devlog/0065-building-hitori-media-os-note-threads-drafts.md`
- `docs/handoff/0077-building-hitori-media-os-note-threads-drafts.md`

### Not touched

- `publish-packages/note/building-hitori-media-os/`
- `publish-packages/threads/building-hitori-media-os/`
- `publish-packages/x/building-hitori-media-os/`
- `publish-packages/substack/building-hitori-media-os/`
- `outputs/youtube/2026-05-14--building-hitori-media-os--youtube.md`（placeholderのまま）
- `outputs/shorts/2026-05-14--building-hitori-media-os--shorts.md`（placeholderのまま）
- `outputs/podcast/2026-05-14--building-hitori-media-os--podcast.md`（placeholderのまま）

## 4. Summary of Changes

### note draft

- placeholderマーカーを削除、`Status: ready-for-human-edit` を明示。
- Title Options 4案 / Lead Paragraph / 章立て7節（消耗する構造 / 構造化Content Idea / AIが読めるDB / 自動化は最後 / 1アイデアから多媒体捌き / 残している手作業 / 最初の1ステップ）/ 想定画像挿入ポイント / Soft CTA / Repurpose Notes / Human Review Checklist。
- 「日本語検索 / archive / 信頼形成」というnote役割に合わせ、H2 / H3 構造を活かした論考調。X / Threadsより構造化、Substackより一般読者向け。

### Threads draft

- placeholderマーカーを削除、`Status: ready-for-human-edit` を明示。
- Main Threads Post 1本 + alternate 3案 / Reply Chain 7本 / Discussion Question / Soft CTAs / Human Review Checklist。
- 会話・関係づくり寄りの温度。X版とCTAが完全一致しないように、購読誘導より「返信ください」を前面に。

### Strategy module 参照

- `docs/strategy-modules/substack-strategy-module.md` の Pipeline Changes（X / Threads = discovery / conversation、note = long-form Japanese credibility / search / archive）に従って役割を分けた。
- 教材本文の引用ゼロ。

## 5. Important Decisions

- text-first 4媒体（X / Substack / note / Threads）を全て ready 状態に揃えてから動画 / 音声系に進む順序にした。
- note は H2 / H3 を意識した章立てで、AI 礼賛や煽りに偏らない論考調を優先。
- Threads は500字目安に収まる量へ調整し、「会話してほしい」が前面のCTA設計。
- publish-packages は引き続き `safe-skip-existing-files`。再生成は人間がファイルを明示削除した上で実行する形を維持。

## 6. Human Review Questions

- note の Title Options と章立てが本人の発信トーンに合っているか。
- note の画像挿入ポイント（4箇所）のうち、最初に作るのはどれにするか。
- Threads の Main Post と alternate のうち採用したい1つはどれか。
- Threads の reply chain の本数（4本まで絞る / 7本そのまま / 5本に減らす）をどうするか。
- text-first 4媒体の公開順は X → Threads → note → Substack で確定でよいか、それとも note を先に置いてアーカイブを作るか。
- 次にplaceholderを解除する媒体は YouTube / Shorts / Podcast のどれにするか。

## 7. Risks or Uncertainties

- 既存publish-packages配下の article.md / posts.md / post.md / checklist.mdは、placeholder時代の本文（TODO中心）のまま。再生成しないと公開準備packageには新本文が反映されない。
- note記事は長め（章立て7節）なので、最終公開前にもう一度全文音読する時間が必要。
- Threads の reply chain は7本だと長く感じる可能性。最終的に 4〜5本へ削るレビュー判断が必要。
- discussion question を X / Substack / Threads でほぼ同じ問いに揃えているので、媒体ごとに微妙に問い方を変える調整余地あり。

## 8. Recommended Next Step

- 人間が4媒体の最終文体を確認し、公開順を決める。X → Threads → note → Substack で順次手動公開する。
- 同タイミングで、`publish-packages/{x,threads,note,substack}/building-hitori-media-os/` の posts.md / post.md / article.md / checklist.md を人間が削除し、`npm run publish:package -- building-hitori-media-os` でpackageを再生成。新checklistに placeholder banner が出ないこと、`Draft is a real draft` チェックが付くことを確認。
- その後、video / audio 系（YouTube / Shorts / Podcast）のplaceholder解除に進むか、`schemas/proposed/` の Substack 系schema雛形に進むかを反応次第で判断する。

### Manual deletion targets for package regeneration

text-first 4媒体ぶん:

```text
publish-packages/x/building-hitori-media-os/posts.md
publish-packages/x/building-hitori-media-os/checklist.md
publish-packages/substack/building-hitori-media-os/post.md
publish-packages/substack/building-hitori-media-os/checklist.md
publish-packages/note/building-hitori-media-os/article.md
publish-packages/note/building-hitori-media-os/checklist.md
publish-packages/threads/building-hitori-media-os/posts.md
publish-packages/threads/building-hitori-media-os/checklist.md
```

他のpackage file（README.md / images/ / notes.md / about-page.md / welcome-email.md / title-options.md / social-preview-image.md / subscribe-cta.md / repurpose-map.md / insert-map.md）は、手動レビュー済みなら残してOK。

## 9. Exact Prompt to Give Codex Next

```text
Replace building-hitori-media-os placeholder drafts for youtube, shorts, and podcast with real ready-for-human-edit drafts.

Do not add Next.js.
Do not auto-post.
Do not write directly to Sanity.
Do not run seed --replace.
Do not generate new media files.
Do not copy paid PDF content.
Do not record audio or video.

Use:
- outputs/youtube/2026-05-14--building-hitori-media-os--youtube.md
- outputs/shorts/2026-05-14--building-hitori-media-os--shorts.md
- outputs/podcast/2026-05-14--building-hitori-media-os--podcast.md
- outputs/note/2026-05-14--building-hitori-media-os--note.md (long-form reference)
- outputs/x/2026-05-14--building-hitori-media-os--x.md (hook reference)
- seed/contentIdea-building-hitori-media-os.json
- docs/strategy-modules/substack-strategy-module.md
- prompts/generate-youtube-script.md
- prompts/generate-shorts-script.md
- prompts/generate-podcast-script.md

For each file:
- Remove the placeholder marker and TODO heading.
- Set Status: ready-for-human-edit (or production-plan for video/audio if more honest).
- Provide a script outline, not actual recordings.
- youtube: 10–15 min outline, screen-recording cues, thumbnail direction notes, no AI clone voice without human approval.
- shorts: 30–45 sec script focused on a single claim.
- podcast: solo monologue outline, show notes draft, audio TODO (manual recording or TTS still to be decided).

Run "npm run publish:package -- building-hitori-media-os --dry-run" and confirm draftIsPlaceholder: false for the touched platforms.

Document:
- which drafts were replaced
- which package files (if any) the human should remove for regeneration
- the next platforms to address (only instagram/github text TODOs and the YouTube/Shorts/Podcast production assets remain)

Update devlog and handoff.
```
