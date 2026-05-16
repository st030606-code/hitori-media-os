# Handoff: Publish Package Placeholder Detection + Dry Run

Date: 2026-05-14

## 1. Task Goal

Publish Package Builderに、下書きがplaceholder（雛形のみで本文未記入）かどうかを自動判定する機構と、ファイル書き込みを行わずに判定だけ確認できる `--dry-run` モードを追加する。複数キャンペーンを並走させても、placeholderのまま誤って公開しない安全層を作る。

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
- 新規media fileは生成していない。
- 既存publish package fileは破壊的に上書きしていない。

## 3. Changed Files

### Modified

- `tools/publish-package-builder/build.mjs`
- `README.md`
- `docs/32-publish-package-builder.md`
- `docs/handoff/latest.md`

### Added

- `docs/devlog/0062-publish-package-placeholder-detection.md`
- `docs/handoff/0074-publish-package-placeholder-detection.md`

## 4. Summary of Changes

### Builder

- `isPlaceholderDraft(content)` と `extractDraftStatus(content)` ヘルパーを追加。判定は `status: draft-placeholder` 行、もしくは `# ... draft placeholder` 見出しのマーカーベース。
- `buildPackage` で下書きを1度だけ読み、`draftIsPlaceholder`、`draftStatus`、`warnings`、placeholder用のTODOを計算してJSONに返す。
- `checklistFor` を更新。placeholder時は `## Draft Status` バナーと `Draft is a real draft (not a placeholder)` 未チェック項目を出す。
- `--dry-run` 引数を追加。指定時は `mkdir` / `writeFile` / `copyFile` をすべてスキップし、計画だけ返す。
- 結果JSONに `dryRun` と `behavior` を追加し、`safe-skip-existing-files` か `dry-run-no-writes` を識別できるようにした。

### Docs

- `README.md`: placeholder検出と `--dry-run` の使い方を追記。
- `docs/32-publish-package-builder.md`: 「Placeholder Draft Detection」「Why Placeholder Drafts Are Safer Than Missing Drafts」「How To Replace a Placeholder Draft Safely」「Dry Run」を追加。

## 5. Important Decisions

- 判定はマーカーベース（保守的）。TODOコメントが1〜2個混ざる実下書きを誤判定しないように、コンテンツ量ベースの推定は採用しない。
- placeholder用のTODOは `todos` 配列にも入れ、既存のchecklist `## TODO` 節と整合させた。
- 既存packageファイルは引き続き `safe-skip-existing-files`。新しいchecklist内容を反映するには、fresh slug or 人間がファイル単位で削除する必要がある（破壊的な自動上書きはしない）。
- `--dry-run` は外側からの利用が前提。`mkdir` も呼ばないので、副作用ゼロ。

## 6. Human Review Questions

- placeholder判定のマーカー（`status: draft-placeholder`、`# ... draft placeholder`）以外に追加すべきパターンはあるか。
- placeholder検出時にchecklistへ `Draft Status` セクションを追加する形でよいか。視認性を上げたい場合は別の表現にするか。
- 既存building-hitori-media-os packageを、新checklist反映のためにファイル単位で削除→再生成するワークフローを、devlogまたは別docsで定型化するか。
- `--dry-run` の結果を `--json` で別ファイル保存するなど、出力先の整理を次バッチで入れるか。

## 7. Risks or Uncertainties

- 既存のbuilding-hitori-media-os checklistは旧フォーマットのまま（placeholder bannerなし）。実運用では人間がここを意識してファイルを差し替える必要がある。
- placeholder判定は静的なマーカーベースなので、placeholderファイルが「マーカーを残したまま本文も追記された」中間状態のとき、placeholderと判定され続ける。中身を実下書きに差し替えるときは `status: draft-placeholder` 行を削除する必要がある（docsに記載済み）。
- `--dry-run` でも `writeIfAbsent` 内の `written` 配列はpopulateされる。これは「実行モードで何が書かれるか」を示す計画だが、見方を誤ると「dry-runでファイルが書かれた」と誤読される可能性がある。`dryRun: true` と `behavior: "dry-run-no-writes"` で識別可能にしてある。

## 8. Recommended Next Step

- `outputs/<platform>/2026-05-14--building-hitori-media-os--<platform>.md` の中身を、note / X / Substack から順番に実下書きへ差し替え、`--dry-run` で `draftIsPlaceholder: false` を確認する。
- ai-blog-db の手動公開（X → Threads → note → Substack）を進め、結果URLを次のhandoffで記録する。
- placeholder bannerを既存packageに反映する手順を、必要に応じてdevlogで定型化する。
- その後、Sanity CLI seed ingestのスクリプト化 or `patches/visual-assets` のslug別整理に進むか判断する。

## 9. Exact Prompt to Give Codex Next

```text
Replace building-hitori-media-os placeholder drafts with real drafts, starting with X and Substack.

Do not add Next.js.
Do not auto-post.
Do not write directly to Sanity.
Do not run seed --replace.
Do not generate new media files.

Use:
- outputs/x/2026-05-14--building-hitori-media-os--x.md
- outputs/substack/2026-05-14--building-hitori-media-os--substack.md
- seed/contentIdea-building-hitori-media-os.json (claims, tone, platformAngles)
- docs/41-next-campaign-tool-building-in-public.md

For each file:
- Remove the "status: draft-placeholder" line and the "# TODO / draft placeholder" heading.
- Write a real ready-for-human-edit draft that respects the coreThesis and tone in the seed.
- Run "npm run publish:package -- building-hitori-media-os --dry-run" and confirm "draftIsPlaceholder": false for the touched platforms.
- Do not destructively overwrite the existing publish-packages/<platform>/building-hitori-media-os/ files. If the new draft must be reflected, document which package files should be manually removed by the human.

Update devlog and handoff with:
- which drafts were replaced
- the dry-run confirmation
- which package files (if any) the human should remove for regeneration
```
