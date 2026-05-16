# Handoff: Seed Key Audit

Date: 2026-05-12

## 1. Task Goal

既存のSanity seed全体を確認し、document内部の配列object/reference itemに `_key` 漏れがないか監査する。

## 2. Constraints Followed

- Next.jsは追加していません。
- フロントエンドコードは実装していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 自動生成・自動投稿は実装していません。
- 実project ID、APIキー、トークン、認証情報、シークレットはコミットしていません。
- `publishedOutput` seed documentsは作成していません。

## 3. Changed Files

- `docs/12-sanity-seed-key-rules.md`
- `docs/devlog/0025-seed-key-audit.md`
- `docs/handoff/latest.md`
- `docs/handoff/0032-seed-key-audit.md`

## 4. Summary of Changes

既存seedを監査し、追加の `_key` 修正が不要であることを確認しました。

`docs/12-sanity-seed-key-rules.md` を追加し、Sanity seedで `_key` が必要なケースと不要なケースを整理しました。

## 5. Key Decisions

- document内部のobject/reference配列には `_key` を付ける。
- 文字列配列には `_key` を付けない。
- seedファイルのトップレベルdocument配列には `_key` を付けない。
- 既存seed本体は今回変更しない。
- `publishedOutput` は実公開後まで待つ。

## 6. Human Review Questions

- Studio上で `contentIdea`、`prompt`、`platformOutput`、`diagramPlan`、`tool` に `Missing keys` 警告が出ていないか。
- `_key` ルール文書は今後のseed作成ルールとして十分か。
- 次に画像生成へ進むか、先に `visualAssetPlan` / `visualPlacementPlan` スキーマを設計するか。

## 7. Risks or Uncertainties

- Studio上でのみ見える警告がある場合、追加確認が必要です。
- 将来seedにobject配列を追加した場合、同じ `_key` ルールを守る必要があります。

## 8. Recommended Next Step

Studioでほかのseed documentに `Missing keys` 警告が出ていないか確認する。

問題がなければ、最初の画像生成に進むか、`visualAssetPlan` / `visualPlacementPlan` スキーマ設計へ進む。

## 9. Exact Prompt to Give Codex Next

```text
Prepare the first visual asset generation plan for note hero / eye-catch.

Do not add Next.js yet.
Do not implement frontend code yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement auto-generation or auto-posting.
Do not commit real project IDs, API keys, tokens, credentials, or secrets.

Use:
- docs/09-visual-asset-strategy.md
- seed/diagram-plan-records.json
- outputs/diagrams/2026-05-11--ai-blog-db--diagram-plan.md
- outputs/note/2026-05-11--ai-blog-db--note.md

Tasks:

1. Decide which diagramPlan should drive the first note hero / eye-catch.
2. Create a short image generation brief in docs.
3. Include purpose, target platform, placement, aspect ratio, visual direction, text to include, text to avoid, and review checklist.
4. Do not create actual image files yet unless explicitly asked.
5. Update docs/devlog and docs/handoff/latest.md.

After editing, summarize:
1. Which visual should be created first
2. Why it should come first
3. What the image generation brief contains
4. Whether actual image generation can start next
```
