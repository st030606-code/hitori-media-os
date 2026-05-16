# Handoff: building-hitori-media-os Seed + Publish Package Builder Slug Generalization

Date: 2026-05-14

## 1. Task Goal

次のbuilding-in-publicキャンペーン `building-hitori-media-os` のseed基盤を追加し、Publish Package Builderを複数Content Ideaに対応できるよう一般化する。ひとつの安全な追加バッチとしてまとめる。

## 2. Constraints Followed

- Next.jsは追加していない。
- paid LLM API integrationは追加していない。
- OpenAI API / Anthropic API clientsは追加していない。
- image generation API callsは実装していない。
- auto-postingは実装していない。
- Sanity direct writeは実装していない。
- Sanity CLIは実行していない。
- `seed --replace` は実行していない。
- 実project ID、APIキー、トークン、認証情報、シークレットは追加していない。
- 新規media fileは生成していない。
- 既存ai-blog-db seedとplublish package fileは破壊的に上書きしていない。

## 3. Changed Files

### Added

- `seed/contentIdea-building-hitori-media-os.json`
- `outputs/note/2026-05-14--building-hitori-media-os--note.md`
- `outputs/x/2026-05-14--building-hitori-media-os--x.md`
- `outputs/threads/2026-05-14--building-hitori-media-os--threads.md`
- `outputs/substack/2026-05-14--building-hitori-media-os--substack.md`
- `outputs/youtube/2026-05-14--building-hitori-media-os--youtube.md`
- `outputs/shorts/2026-05-14--building-hitori-media-os--shorts.md`
- `outputs/podcast/2026-05-14--building-hitori-media-os--podcast.md`
- `docs/devlog/0061-building-hitori-media-os-seed-and-builder-slug-generalization.md`
- `docs/handoff/0073-building-hitori-media-os-seed-and-builder-slug-generalization.md`
- `publish-packages/{note,x,substack,threads,instagram,github,shorts,podcast,youtube}/building-hitori-media-os/` （Publish Package Builderによる初回生成）

### Modified

- `tools/publish-package-builder/build.mjs`
- `README.md`
- `docs/32-publish-package-builder.md`
- `docs/handoff/latest.md`

## 4. Summary of Changes

### Batch A: building-hitori-media-os campaign seed foundation

- `contentIdea.building-hitori-media-os` のseed JSONを追加。`docs/41-next-campaign-tool-building-in-public.md` の方針に沿って、claims、tone、platformAngles、outputChecklist、examples、objectionsをai-blog-dbと同じ構造で整理。
- text / video / audio各media向けに `2026-05-14--building-hitori-media-os--<platform>.md` のplaceholder draftを追加。すべて `status: draft-placeholder` と明記し、本文はTODOのみ。

### Batch B: publish-package-builder slug generalization

- `packageConfigs` を `draftPath`（日付ハードコード）から `draftSourceDir` 方式へ変更。
- `resolveDraftPath()` ヘルパーを追加。`outputs/<platform>/*--<slug>--<platform>.md` を検出、複数あればファイル名昇順の最新を採用。
- 結果JSONに `draftSource` を追加し、どのdraftが採用されたかを可視化。
- 下書きが無いときのTODOメッセージを詳細化。
- README / docs/32にslug usageとDraft Discovery仕様を反映。

## 5. Important Decisions

- 「ハードコードされた日付」より先に「複数Content Idea対応」を片付けた。
- 既存ai-blog-db packageは温存。draftSourceは `2026-05-11--ai-blog-db--*.md` を自動採用するので動作不変。
- building-hitori-media-osのpackageは初回ビルドでTODO placeholder入りdraftをそのまま流す方針。実下書きは人間が後で `outputs/...` を書き直し、削除→再生成 or 直接編集する。
- instagramとgithubは引き続き `draftSourceDir: null` で、TODO扱いを維持。

## 6. Human Review Questions

- building-hitori-media-osの最初の公開順は X → Substack → note → Threads → YouTube の想定でよいか。
- placeholder draftをbuilderがそのまま `publish-packages/<platform>/<slug>/` へ転写したことに違和感はないか。実本文に置き換える際の手順を決めたいか。
- ai-blog-dbのfirst public releaseが終わるまで、building-hitori-media-osの実下書きは保留すべきか。
- 次バッチで、`patches/visual-assets` のslug別整理や、Sanity CLI用のseed投入手順スクリプト化に進むか。

## 7. Risks or Uncertainties

- placeholder draftは `# TODO ...` ヘッダー付きだが、builderから見れば「存在する下書き」として扱う。実投稿前に必ず人間が中身を差し替える必要がある。
- 自動検出は `endsWith('--<slug>--<platform>.md')` ベース。slug名に `--` を含めないという暗黙ルールがある。
- building-hitori-media-osのcontentIdeaはまだSanity Studioに登録していない（手動 `sanity documents create` 待ち）。
- 同じslug + platformで日付の異なる下書きを複数置くと、最新ファイル名（日付prefixが新しい方）が常に採用される。古い下書きは無視されるので、不要なら人間が削除する。

## 8. Recommended Next Step

- `ai-blog-db` のfirst public releaseを人間が手動公開し、結果URLとレビューを次のhandoffで記録する。
- 並行して、building-hitori-media-osのnote / X / Substack向け初稿を、placeholderから実下書きへ差し替える。
- その後、Sanity CLIでcontentIdea seedを投入する手順だけ最小スクリプト化するか、引き続き手動運用にするかを判断する。

## 9. Exact Prompt to Give Codex Next

```text
Record the human review result and any draft replacement for building-hitori-media-os.

Do not add Next.js.
Do not auto-post.
Do not write directly to Sanity.
Do not run seed --replace.
Do not generate new media files.

Use:
- seed/contentIdea-building-hitori-media-os.json
- outputs/note/2026-05-14--building-hitori-media-os--note.md
- outputs/x/2026-05-14--building-hitori-media-os--x.md
- outputs/threads/2026-05-14--building-hitori-media-os--threads.md
- outputs/substack/2026-05-14--building-hitori-media-os--substack.md
- publish-packages/<platform>/building-hitori-media-os/

Record:
- which placeholder drafts have been replaced with real text
- which platform should be published first for this campaign
- any review notes for the seed JSON
- whether Sanity CLI ingest should be scripted next

Update devlog and handoff.
```
