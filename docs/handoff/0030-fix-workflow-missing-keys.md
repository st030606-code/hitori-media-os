# Handoff: Fix Workflow Missing Keys

Date: 2026-05-12

## 1. Task Goal

Sanity Studioでworkflow documentの配列フィールドに表示された `Missing keys` 警告を解消するため、`seed/workflow-records.json` の配列reference itemに `_key` を追加する。

## 2. Constraints Followed

- Next.jsは追加していません。
- フロントエンドコードは実装していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 自動生成・自動投稿は実装していません。
- 実project ID、APIキー、トークン、認証情報、シークレットはコミットしていません。
- `publishedOutput` seed documentsは作成していません。
- workflow schemaは変更していません。

## 3. Changed Files

- `seed/workflow-records.json`
- `docs/10-workflow-seeds.md`
- `docs/devlog/0024-fix-workflow-missing-keys.md`
- `docs/handoff/latest.md`
- `docs/handoff/0030-fix-workflow-missing-keys.md`

## 4. Summary of Changes

`promptsUsed`、`toolsUsed`、`platformOutputs`、`diagramPlans` の配列reference itemに、安定した `_key` を追加しました。

`outputFiles` は文字列配列なので変更していません。

既存workflow documentを修正済みseedで置き換える手順を `docs/10-workflow-seeds.md` に追記しました。

## 5. Key Decisions

- スキーマは変更せず、seed JSONだけを修正する。
- `_key` は `prompt-note-article`、`tool-codex`、`output-note`、`diagram-before-after` のように読みやすく安定した値にする。
- 参照先 `_ref` とdocument `_id` は変更しない。
- 既存Sanity documentは `--replace` で更新する。

## 6. Human Review Questions

- `--replace` 後にStudioの `Missing keys` 警告が消えているか。
- 配列参照の表示順が意図どおりか。
- `_key` の命名がStudio上で追いやすいか。

## 7. Risks or Uncertainties

- 既存documentを `--replace` するため、Studio上で手動編集したworkflow内容がある場合は上書きされます。
- `platformOutput` や `diagramPlan` のseedにも同様の配列objectがある場合、別途確認が必要です。

## 8. Recommended Next Step

ユーザーが修正済みworkflow seedを `--replace` で再投入し、Studioで `Missing keys` 警告が消えたか確認する。

## 9. Exact Prompt to Give Codex Next

```text
Record the result of replacing workflow seed documents after adding _key values.

Do not add Next.js yet.
Do not implement frontend code yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement auto-generation or auto-posting.
Do not commit real project IDs, API keys, tokens, credentials, or secrets.
Do not create publishedOutput seed documents yet.

Current result:
- I ran: npx sanity documents create seed/workflow-records.json --replace
- Result: [success/failure + notes]
- Studio review result:
  - 6 workflow documents appear in Studio: [yes/no]
  - Missing keys warnings are gone: [yes/no + notes]
  - promptsUsed references are preserved: [yes/no + notes]
  - toolsUsed references are preserved: [yes/no + notes]
  - platformOutputs references are preserved: [yes/no + notes]
  - diagramPlans references are preserved: [yes/no + notes]
  - fields that felt heavy or confusing: [notes]

Use:
- seed/workflow-records.json
- docs/10-workflow-seeds.md
- docs/devlog/0024-fix-workflow-missing-keys.md
- schemas/workflow.ts

Tasks:

1. Record whether workflow replacement succeeded.
2. Record whether Missing keys warnings are gone.
3. Record whether workflow references are still correct.
4. Recommend whether any other seed files should be checked for missing _key issues.
5. Update docs/devlog and docs/handoff/latest.md with the result.
6. Create a numbered handoff file for this task.

After editing, summarize:
1. Whether the replacement worked
2. Whether Missing keys warnings are gone
3. What should be checked next
4. What should be implemented next
```
