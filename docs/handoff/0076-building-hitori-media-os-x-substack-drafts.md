# Handoff: building-hitori-media-os X / Substack ready-for-human-edit drafts

Date: 2026-05-14

## 1. Task Goal

`building-hitori-media-os` キャンペーンの X と Substack の placeholder draftを、Substack Strategy Moduleとbuilding-in-publicトーンに沿った ready-for-human-edit ドラフトへ差し替える。dry-runで placeholder解除を確認し、publish-packages配下は触らずに残す。

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

- `outputs/x/2026-05-14--building-hitori-media-os--x.md`（placeholder → ready-for-human-edit）
- `outputs/substack/2026-05-14--building-hitori-media-os--substack.md`（placeholder → ready-for-human-edit、Substack Notes Plan節を含む）
- `docs/handoff/latest.md`

### Added

- `docs/devlog/0064-building-hitori-media-os-x-substack-drafts.md`
- `docs/handoff/0076-building-hitori-media-os-x-substack-drafts.md`

### Not touched

- `publish-packages/x/building-hitori-media-os/`
- `publish-packages/substack/building-hitori-media-os/`
- `outputs/note/2026-05-14--building-hitori-media-os--note.md`（placeholderのまま）
- `outputs/threads/2026-05-14--building-hitori-media-os--threads.md`（placeholderのまま）
- `outputs/youtube/2026-05-14--building-hitori-media-os--youtube.md`（placeholderのまま）
- `outputs/shorts/2026-05-14--building-hitori-media-os--shorts.md`（placeholderのまま）
- `outputs/podcast/2026-05-14--building-hitori-media-os--podcast.md`（placeholderのまま）

## 4. Summary of Changes

### X draft

- placeholderマーカー（`Status: draft-placeholder`、`# TODO / draft placeholder`）を削除。
- `Status: ready-for-human-edit` を明示。
- 主投稿候補1本、代替hook 4案、4〜7投稿の短スレッド、soft CTA、Human Review Checklistを含む。
- 「発信を頑張るより、発信が回る仕組みを作る」のcoreThesisを軸に、building-in-publicトーンで完成品の宣伝にならないよう構成。

### Substack draft

- placeholderマーカーを削除。
- `Status: ready-for-human-edit` を明示。
- Title Options 4案 / Email Subject Options 3案 / Preview Text / Opening / Main Story（Hitori Media OSと呼ぶ理由 / AIが読めるDB / 自動化は最後 / 今残している手作業）/ Practical Takeaway / Reader-List Connection / Reader Question / Subscribe CTA（soft） / Repurpose Notes / Human Review Checklist。
- `prompts/substack-post.md` の出力構造（Subject / Preview / Title / Opening / Main Story / Practical Takeaway / Reader Question / Subscribe CTA / Repurpose Notes / Human Review Checklist）に従っている。
- Substack Notes Plan 節を同ファイル内に追加。Pre-Post Notes 3本（question / build-log / lesson-learned）、Post Launch Notes 2本（build-log / soft CTA）、Conversation Prompts 3案、CTA Variants 3案、Human Review Checklist。

### Strategy module 参照

- `docs/strategy-modules/substack-strategy-module.md` の Workflow（reader / positioning / core topics / Notes / Welcome Email alignment）と Rules（subscribe CTAなしで公開しない、paid急がない、auto-postしない）を踏襲。
- 教材本文の引用ゼロ。

## 5. Important Decisions

- placeholder解除を X と Substack のみに絞った。X = 発見と反応観測、Substack = subscriber asset。残りは反応を見てから優先順位を決める。
- publish-packages配下は触らず、再生成は人間がファイルを明示削除した上で実行する形に。前バッチで `safe-skip-existing-files` を守る方針と整合。
- Substack Notes Planを同じoutputsファイル内に持たせた。`prompts/substack-notes.md` の出力構造を尊重しつつ、Substack Post draftと役割分担を1ファイル内で確認できるようにするため。

## 6. Human Review Questions

- X main post の本文は本人の発信トーンに合っているか。`alternate main hooks` のうち採用したい1つはどれか。
- Substack Postのタイトルとemail subject、preview textの最終決定をどれにするか。
- Reader Question（「下書き作成」「公開判断」「素材保存」のどれを最初に仕組み化したいか）を Substack / X / Threadsそれぞれでどう使い分けるか。
- 公開順は X → Substack で確定でよいか。
- 反応次第で、note / Threads / YouTube / Shorts / Podcast のうち、次にplaceholderを解除するのはどこにするか。

## 7. Risks or Uncertainties

- 既存publish-packages配下のposts.md / post.md / checklist.mdは、placeholder時代の本文（TODO中心）のまま。再生成しないと公開準備packageには新本文が反映されない。
- Hitori Media OS自体まだ手動運用であることを正直に書いているため、読者が「完成品」を期待してこのSubstackを購読すると期待外れになる可能性。Reader-List Connection節でその役割を明示してあるが、文体最終調整時に再確認が必要。
- Reader Questionは返信誘導を意図しているが、Substack側で返信欄を有効化していないと機能しない。手動公開時に設定確認が必要。

## 8. Recommended Next Step

- 人間がX postとSubstack postの最終文体を確認し、まず X を1本投稿する。
- そのあと Substack PostをWelcome EmailとAbout Pageに矛盾がない状態で公開し、Notes Plan の1〜2本をフォローアップに使う。
- 反応が見えてきたタイミングで、note / Threadsのplaceholderを ready-for-human-edit へ差し替える。
- 同タイミングで `publish-packages/x/building-hitori-media-os/` と `publish-packages/substack/building-hitori-media-os/` の posts.md / post.md / checklist.md を人間が削除し、`npm run publish:package -- building-hitori-media-os` でpackageを再生成（新checklistに placeholder banner が出ないこと、`Draft is a real draft` がチェック済みになることを確認）。

### Manual deletion targets for package regeneration

```text
publish-packages/x/building-hitori-media-os/posts.md
publish-packages/x/building-hitori-media-os/checklist.md
publish-packages/substack/building-hitori-media-os/post.md
publish-packages/substack/building-hitori-media-os/checklist.md
```

他のpackage file（README.md / images/ / notes.md / about-page.md / welcome-email.md / title-options.md / social-preview-image.md / subscribe-cta.md / repurpose-map.md）は手動レビュー済みなら残してOK。

## 9. Exact Prompt to Give Codex Next

```text
Replace building-hitori-media-os placeholder drafts for note and threads with real ready-for-human-edit drafts.

Do not add Next.js.
Do not auto-post.
Do not write directly to Sanity.
Do not run seed --replace.
Do not generate new media files.
Do not copy paid PDF content.

Use:
- outputs/note/2026-05-14--building-hitori-media-os--note.md
- outputs/threads/2026-05-14--building-hitori-media-os--threads.md
- outputs/x/2026-05-14--building-hitori-media-os--x.md (reference)
- outputs/substack/2026-05-14--building-hitori-media-os--substack.md (reference)
- seed/contentIdea-building-hitori-media-os.json
- docs/strategy-modules/substack-strategy-module.md
- prompts/generate-note-article.md (if present, otherwise prompts/generate-substack-post.md)
- prompts/generate-threads-post.md

For each file:
- Remove the placeholder marker and TODO heading.
- Set Status: ready-for-human-edit.
- Write platform-appropriate copy that respects coreThesis and tone from the seed.
- Avoid duplicating X / Substack body verbatim. Use platform role differences.
- Run "npm run publish:package -- building-hitori-media-os --dry-run" and confirm draftIsPlaceholder: false for the touched platforms.

Document:
- which drafts were replaced
- which package files (if any) the human should remove for regeneration
- next platform candidates (youtube / shorts / podcast)

Update devlog and handoff.
```
