# Handoff: Local Patch Review Helper Design

Date: 2026-05-13

## 1. Task Goal

Visual Registerが作成したpatch JSONを、Sanity Studio反映前に安全に確認するLocal Patch Review helperを設計する。

## 2. Constraints Followed

- Next.jsは追加していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 画像生成API呼び出しは実装していません。
- 自動投稿は実装していません。
- Sanityへ直接writeしていません。
- `seed --replace` は実行していません。
- シークレットは追加していません。

## 3. Changed Files

- `docs/23-local-patch-review-helper.md`
- `docs/21-visual-register-patch-apply-workflow.md`
- `docs/20-frontend-ui-design-system.md`
- `docs/devlog/0043-local-patch-review-helper-design.md`
- `docs/handoff/latest.md`
- `docs/handoff/0053-local-patch-review-helper-design.md`

## 4. Summary of Changes

Local Patch Review helperの設計を追加しました。

MVPでは、別ツールではなくVisual Register内にread-only Patch Review sectionとして実装する方針を推奨しました。

Patch Reviewでは、patch JSON一覧、target document ID、更新field、`localAssetPath`、`status`、`updatedAt`、`reviewNotes`、local file exists、`meta.directSanityWrite` を表示します。

## 5. Important Decisions

- Sanity direct writeはまだ行わない。
- Patch Reviewはread-onlyから始める。
- Visual Register内に実装するのが自然。
- copy buttonやCLI patch helperは後回し。
- Next.js dashboard化はまだ待つ。

## 6. Human Review Questions

- Patch Review sectionはVisual Register内でよいか。
- table + detail panelで十分か。
- copy buttonsを初期実装に含めるか。
- patch適用済みの管理をいつ設計するか。

## 7. Risks or Uncertainties

- patch JSONが増えると一覧の整理が必要になります。
- read-only reviewでは、Studio手入力ミスを完全にはなくせません。
- direct writeには認証・権限・confirm flowが必要なため、まだ早いです。

## 8. Recommended Next Step

Visual Register内にread-only Patch Review sectionを実装します。

最初はpatch一覧、詳細表示、local file exists validation chipsまでで十分です。

## 9. Exact Prompt to Give Codex Next

```text
Implement a read-only Patch Review section inside Local Visual Register.

Do not add Next.js yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement image generation API calls.
Do not implement auto-posting.
Do not write directly to Sanity.
Do not run seed --replace.
Do not commit secrets.

Use:
- tools/visual-register/server.mjs
- tools/visual-register/public/index.html
- tools/visual-register/public/app.js
- tools/visual-register/public/styles.css
- patches/visual-assets/
- docs/23-local-patch-review-helper.md

Tasks:
1. Add a read-only endpoint that lists Visual Register patch JSON files.
2. Validate localAssetPath exists on disk.
3. Add a Patch Review section to the UI.
4. Show target document ID, fields to update, localAssetPath, status, updatedAt, reviewNotes, validation chips.
5. Do not write to Sanity.
6. Update docs/devlog and handoff.

After editing, summarize:
1. What Patch Review shows
2. What validation it performs
3. What remains manual
4. Whether direct Sanity write should still wait
```
