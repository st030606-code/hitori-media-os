# Handoff: First Content Seed

Date: 2026-05-12

## 1. Task Goal

最初の `contentIdea` を手入力ではなくSanity CLIで作成し、Studioでレビューできるようにseed JSONを用意する。

## 2. Constraints Followed

- Next.jsは追加していません。
- フロントエンドコードは実装していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 自動生成・自動投稿は実装していません。
- 実project ID、APIキー、トークン、認証情報、シークレットはコミットしていません。
- Sanity CLIのcreateコマンドは実行していません。

## 3. Changed Files

- `seed/contentIdea-ai-blog-db.json`
- `docs/04-first-content-entry.md`
- `docs/devlog/0017-first-content-seed.md`
- `docs/handoff/latest.md`
- `docs/handoff/0019-first-content-seed.md`

## 4. Summary of Changes

Sanity CLIで作成できる `contentIdea` seed documentを追加しました。

`docs/04-first-content-entry.md` に、`.env.local` 確認、Studio起動、`npx sanity documents create` 実行、Studio確認の手順を追記しました。

## 5. Key Decisions

- `_id` は `contentIdea.ai-blog-db` にした。
- `_type` は `contentIdea` にした。
- `slug` はSanity slug object形式にした。
- array内objectには `_key` と `_type` を付けた。
- platform / outputTypeは小文字の制御値を維持した。
- CLI createは実行せず、seedと手順だけを用意した。

## 6. Human Review Questions

- `_id` は `contentIdea.ai-blog-db` でよいか。
- seedに含める項目量は多すぎないか。
- `examples`、`objections`、`personalContext` まで初回seedに入れてよいか。
- CLI作成後、Studioで確認する観点は十分か。

## 7. Risks or Uncertainties

- 同じ `_id` が既に存在する場合、通常のcreateは失敗します。
- `--replace` は既存documentを置き換えるため、使う前に内容確認が必要です。
- `outputs/paid/` と `outputs/newsletter/` はまだ作成していません。

## 8. Recommended Next Step

ユーザーが `.env.local` を設定した環境で `npx sanity documents create seed/contentIdea-ai-blog-db.json` を実行し、Studioでdocumentを確認する。

## 9. Exact Prompt to Give Codex Next

```text
Record the result of creating the first contentIdea seed document with Sanity CLI.

Do not add Next.js yet.
Do not implement frontend code yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement auto-generation or auto-posting.
Do not commit real project IDs, API keys, tokens, credentials, or secrets.

Use:
- seed/contentIdea-ai-blog-db.json
- docs/04-first-content-entry.md
- schemas/contentIdea.ts

Tasks:

1. After the user runs the Sanity CLI create command, record whether it succeeded.
2. Record whether `contentIdea.ai-blog-db` appears in Studio.
3. Record whether rawInput, claims, platformAngles, outputChecklist, examples, objections, and personalContext display correctly.
4. Note any fields that feel too heavy or confusing in Studio.
5. Update docs/devlog and docs/handoff/latest.md with the result.

After editing, summarize:
1. Whether the seed create worked
2. What Studio showed
3. Whether this replaces manual first entry
4. What should be entered or seeded next
```
