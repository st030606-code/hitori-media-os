# Handoff: Workflow Replace Result

Date: 2026-05-12

## 1. Task Goal

`_key` を追加した `seed/workflow-records.json` をSanity CLIで `--replace` した結果を記録する。

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

- `docs/devlog/0024-fix-workflow-missing-keys.md`
- `docs/handoff/latest.md`
- `docs/handoff/0031-workflow-replace-result.md`

## 4. Summary of Changes

ユーザーが `npx sanity documents create seed/workflow-records.json --replace` を実行し、成功したことを記録しました。

Studio上で6件のworkflowが表示され、`Missing keys` 警告が消え、各参照が維持されていることを記録しました。

## 5. Key Decisions

- workflow seedの `_key` 修正は成功済みとして扱う。
- workflow schemaの変更は不要。
- 次はほかのseedに同様の `_key` 問題がないか確認する。
- `publishedOutput` は実公開後まで待つ。

## 6. Human Review Questions

- ほかのseedでStudioに `Missing keys` 警告が出ていないか。
- workflowの配列参照の表示順は自然か。
- workflowの6件の粒度はこのままでよいか。

## 7. Risks or Uncertainties

- `contentIdea`、`prompt`、`platformOutput`、`diagramPlan` の配列objectにも `_key` が必要な箇所が残っている可能性があります。
- CLIで `--replace` したため、Studio上で手動編集していたworkflow内容があれば上書きされています。

## 8. Recommended Next Step

ほかのseedファイルの配列object/referenceを点検し、必要なら `_key` を追加する。

その後、公開済みコンテンツがまだない間は `publishedOutput` を作らず、最初の画像生成またはVisual Asset Plan schema検討へ進む。

## 9. Exact Prompt to Give Codex Next

```text
Audit existing Sanity seed files for missing _key issues.

Do not add Next.js yet.
Do not implement frontend code yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement auto-generation or auto-posting.
Do not commit real project IDs, API keys, tokens, credentials, or secrets.
Do not create publishedOutput seed documents yet.

Use:
- seed/contentIdea-ai-blog-db.json
- seed/prompt-records.json
- seed/platform-output-records.json
- seed/diagram-plan-records.json
- seed/tool-records.json
- seed/workflow-records.json
- schemas/

Tasks:

1. Inspect all seed files for array items that are objects or references and may need _key.
2. Add stable readable _key values where needed.
3. Do not add _key to plain string arrays unless Sanity requires it.
4. Do not change document IDs or reference IDs unless necessary.
5. Update docs with the seed _key rule.
6. Create or update docs/devlog.
7. Update docs/handoff/latest.md and create a numbered handoff file.

After editing, summarize:
1. Which seed files needed _key fixes
2. Which seed files were already safe
3. Whether Studio should be checked again
4. What should be implemented next
```
