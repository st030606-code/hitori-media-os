# Handoff: Publish Package Safe Placeholder Replacement (opt-in)

Date: 2026-05-14

## 1. Task Goal

Publish Package Builderに、placeholder派生のpublish-packageファイルを安全に再生成するためのオプトインフラグ `--replace-placeholder-package` を追加し、building-hitori-media-os の publish-package を新本文に揃え直す。フラグが無ければ既存の `safe-skip-existing-files` 挙動を完全に維持する。

## 2. Constraints Followed

- Next.jsは追加していない。
- paid LLM API integrationは追加していない。
- OpenAI API / Anthropic API clientsは追加していない。
- external APIは呼んでいない。
- auto-postingは実装していない。
- Sanity direct writeは実装していない。
- Sanity CLI create/update commandsは実行していない。
- `seed --replace` は実行していない。
- 実project ID、APIキー、トークン、認証情報、シークレットは追加していない。
- 有料PDF本文の引用は含めていない。
- 新規media fileは生成していない。
- 任意のファイルを破壊的に上書きしていない（許可リスト方式で範囲限定）。
- `private/` / `assets/visuals/` は触っていない。
- ai-blog-db に対しては replacement を実行していない（dry-run のみ）。

## 3. Changed Files

### Modified

- `tools/publish-package-builder/build.mjs`
- `docs/32-publish-package-builder.md`
- `README.md`
- `docs/handoff/latest.md`

### Added

- `docs/devlog/0068-publish-package-safe-placeholder-replacement.md`
- `docs/handoff/0080-publish-package-safe-placeholder-replacement.md`

### Replaced (building-hitori-media-os の publish-packages のみ)

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

### Not touched

- `publish-packages/<platform>/building-hitori-media-os/README.md`
- `publish-packages/substack/building-hitori-media-os/{notes,about-page,welcome-email,title-options,social-preview-image,subscribe-cta,repurpose-map}.md`
- `publish-packages/note/building-hitori-media-os/insert-map.md`
- `publish-packages/shorts/building-hitori-media-os/caption.md`
- `publish-packages/podcast/building-hitori-media-os/audio-todo.md`
- `publish-packages/youtube/building-hitori-media-os/slides/checklist.md`
- `publish-packages/instagram/building-hitori-media-os/`（draftSourceDir 未設定）
- `publish-packages/github/building-hitori-media-os/`（同上）
- 全 platform の `images/` / `thumbnail/` / `slides/` / `audio/` / `clips/` 配下のメディア
- `publish-packages/<platform>/ai-blog-db/`（フラグなしのまま、safe-skipで温存）
- `private/`、`assets/visuals/`

## 4. Summary of Changes

### Flag

- 新規 CLI フラグ `--replace-placeholder-package`。
- 使い方:
  - `npm run publish:package -- <slug> --replace-placeholder-package` → 許可リストのファイルだけを上書き。
  - `npm run publish:package -- <slug> --dry-run --replace-placeholder-package` → 計画だけ表示、書き込みなし。

### Allowlist

| platform | 置き換える対象 |
| --- | --- |
| x | `posts.md`, `checklist.md` |
| threads | `posts.md`, `checklist.md` |
| note | `article.md`, `checklist.md` |
| substack | `post.md`, `checklist.md` |
| youtube | `script.md`, `checklist.md` |
| shorts | `script.md`, `checklist.md` |
| podcast | `script.md`, `checklist.md`, `show-notes.md` |
| instagram | (なし。draftSourceDir 未設定) |
| github | (なし。draftSourceDir 未設定) |

### Result JSON additions

- Top level: `replacePlaceholderPackage`、`behavior`（`replace-placeholder-package-opt-in` / `dry-run-no-writes` / `safe-skip-existing-files`）。
- Per platform: `replaced` / `replacementCandidates` / `replacementSkipped` / `replacementWarnings`。

### Eligibility rules

- `canReplaceAny = replacePlaceholderPackage && draftExists && !draftIsPlaceholder`
- 1ファイル単位の `allowReplace = canReplaceAny && allowlist[platform].has(filename)`
- `copyIfAbsent`（画像コピー）は `allowReplace` 引数を持たない → 画像 / 音声 / 動画は絶対に上書きされない。

## 5. Important Decisions

- 既定挙動（フラグなし）の互換性を最優先。フラグなしの実行は1文字も挙動が変わらない。
- 許可リスト方式（負のリストではなく正のリスト）。これにより、知らない新規ファイルが追加されても置き換え範囲は広がらない。
- ai-blog-db には `--replace-placeholder-package` を実行していない（指示通り）。ai-blog-db の挙動は何も変わらない。
- placeholder検出（前バッチ）と組み合わせて使う前提で、placeholder draftのままの platform は対象外。

## 6. Human Review Questions

- 置き換えた 15 ファイルの文体・構造に違和感はないか（X / Substack / note / Threads / YouTube / Shorts / Podcast の checklist + draftTarget + podcast show-notes）。
- `--replace-placeholder-package` を `npm run publish:package` の README 例として残すか、`docs/32-publish-package-builder.md` だけにするか。
- 将来 Instagram / GitHub に `draftSourceDir` を導入する場合の許可リスト追加方針。
- ai-blog-db の publish-package を同じフローで再生成するかどうか（必要なら別バッチで明示的に許可）。

## 7. Risks or Uncertainties

- 許可リストはコードに直接書いている。新しい platform / draftTarget を増やしたとき、許可リストの更新を忘れると新しいファイルは temporal にずっと skipped 扱いになる。テスト時に違和感に気付ける形ではあるが、`packageConfigs` と `replaceableTargetsByPlatform` の片方だけを編集して整合が崩れるリスクが残る。
- replaceableTargetsByPlatform は `Set<string>` で「ファイル名そのもの」だけを比較する。サブディレクトリ付き（例: `slides/checklist.md`）は意図的に対象外。これは安全側で、現状の運用には合っているが、将来 nested file を置き換えたいときには見直しが必要。
- `--replace-placeholder-package --dry-run` で `replacementCandidates` を確認するワークフローを人間が遵守しない場合、いきなり実行して内容を確認しないリスクがある。docs に強く明記済みだが、運用ルールとしてレビューが必要。

## 8. Recommended Next Step

- 人間が building-hitori-media-os の 15 ファイルを最終レビューし、まず X を1本手動投稿する。
- 続いて Threads / note / Substack を順次手動公開し、Substack Post 公開時には Welcome Email / About Page / Notes follow-up plan のアラインを確認する。
- 反応を見つつ、YouTube → Shorts → Podcast の実録画 / 実収録 / 公開を進める。
- 全公開後、`schemas/proposed/substackPublicationStrategy.ts` の単独活性化バッチに進む（`schemas/proposed/README.md` の Activation Checklist 通り）。

## 9. Exact Prompt to Give Codex Next

```text
Activate substackPublicationStrategy as the first proposed Substack schema, following schemas/proposed/README.md activation checklist.

Do not add Next.js.
Do not add paid LLM API integrations.
Do not call external APIs.
Do not auto-post.
Do not write directly to Sanity.
Do not run seed --replace.
Do not commit the original paid PDF or any verbatim long passages from it.

Use:
- schemas/proposed/substackPublicationStrategy.ts (now copy/move into the active schemas folder)
- schemas/proposed/README.md (activation checklist)
- schemas/index.ts (must be modified to add this schema only)
- sanity.config.ts (no changes needed unless schemaTypes import path changes)
- docs/strategy-modules/substack-strategy-module.md
- docs/strategy-sources/substack-textbook-notes.md

Activation steps:
1. Move (or copy) substackPublicationStrategy.ts from schemas/proposed/ to schemas/.
   - Remove the "PROPOSED SCHEMA — NOT ACTIVE IN STUDIO." comment block.
   - Keep the rest of the file intact.
2. Add the new import and array entry to schemas/index.ts.
3. Run "npm run build" and confirm it succeeds.
4. Add a single test seed JSON under seed/ (do NOT use --replace), e.g. seed/substack-publication-strategy-building-hitori-media-os.json.
5. Manually open Sanity Studio (npm run dev) and verify the new document type renders correctly.
6. Do NOT activate the other 5 proposed schemas yet.

Document:
- the move, including a note that the proposed file is now retired (delete or keep marker file)
- which seed was added
- any validation issues
- whether the activation is considered safe to keep

Update devlog and handoff.
```
