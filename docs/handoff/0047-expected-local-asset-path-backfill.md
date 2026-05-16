# Handoff: expectedLocalAssetPath Backfill Plan

Date: 2026-05-13

## 1. Task Goal

既存Sanity `visualAssetPlan` documentsへ `expectedLocalAssetPath` を安全に追加するためのseed/patch方針を決める。

## 2. Constraints Followed

- Next.jsは追加していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 画像生成API呼び出しは実装していません。
- 自動投稿は実装していません。
- コードからSanityへ直接writeしていません。
- シークレットは追加していません。

## 3. Changed Files

- `patches/visual-asset-plans/expected-local-asset-paths/note-hero-v1.json`
- `patches/visual-asset-plans/expected-local-asset-paths/x-hook-before-after.json`
- `patches/visual-asset-plans/expected-local-asset-paths/instagram-carousel-cover.json`
- `patches/visual-asset-plans/expected-local-asset-paths/github-architecture-diagram.json`
- `patches/visual-asset-plans/expected-local-asset-paths/youtube-thumbnail-before-after.json`
- `docs/22-expected-local-asset-path-backfill.md`
- `docs/21-visual-register-patch-apply-workflow.md`
- `docs/devlog/0039-expected-local-asset-path-backfill.md`
- `docs/handoff/latest.md`
- `docs/handoff/0047-expected-local-asset-path-backfill.md`

## 4. Summary of Changes

既存documentsにはseed replaceではなく、`expectedLocalAssetPath` だけを追加するpatch JSON方式を推奨しました。

5件の `visualAssetPlan` に対応する安全なpatch JSONを作成しました。

## 5. Important Decisions

- seed replaceは推奨しない。
- `expectedLocalAssetPath` だけを追加する。
- 既存の `localAssetPath`、`status`、`reviewNotes` は触らない。
- MVPではSanity Studioで手動反映する。
- CLI patch helperは将来検討する。

## 6. Human Review Questions

- 5件の予定パスが運用上正しいか。
- Studioで手動反映する順番で問題ないか。
- 既存の `note-hero-v1` は `localAssetPath` と `expectedLocalAssetPath` が一致してよいか。
- 次にVisual Registerを再テストするか。

## 7. Risks or Uncertainties

- Studio手動反映ではコピー漏れの可能性があります。
- 既存Sanity documentのIDがseedと一致している前提です。
- CLI patch helperはまだありません。

## 8. Recommended Next Step

Sanity Studioで5件のpatch JSONを確認し、`expectedLocalAssetPath` を手動反映します。

その後、Visual Registerを開き、保存予定パス表示が反映済み値と一致するか確認します。

## 9. Exact Prompt to Give Codex Next

```text
Record the Studio manual backfill result for expectedLocalAssetPath.

Do not add Next.js yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement image generation API calls.
Do not implement auto-posting.
Do not write directly to Sanity from code.
Do not commit secrets.

Current result:
- note hero expectedLocalAssetPath applied: [yes/no + notes]
- X hook expectedLocalAssetPath applied: [yes/no + notes]
- Instagram carousel expectedLocalAssetPath applied: [yes/no + notes]
- GitHub architecture expectedLocalAssetPath applied: [yes/no + notes]
- YouTube thumbnail expectedLocalAssetPath applied: [yes/no + notes]
- Existing localAssetPath/status/reviewNotes preserved: [yes/no + notes]
- Studio labels were clear: [yes/no + notes]
- Visual Register retest result: [notes]

Tasks:
1. Record the manual backfill result.
2. Update docs/devlog and handoff.
3. Recommend whether to retest batch registration or add overwrite confirmation next.

After editing, summarize:
1. Whether expectedLocalAssetPath was added safely
2. What should be checked in Studio
3. Whether Visual Register should be retested
4. What should be implemented next
```
