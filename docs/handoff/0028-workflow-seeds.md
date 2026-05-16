# Handoff: Workflow Seeds

Date: 2026-05-12

## 1. Task Goal

ここまでの手動・半自動ワークフローを、Sanity CLIで作成できる `workflow` seed documentsとして準備する。

## 2. Constraints Followed

- Next.jsは追加していません。
- フロントエンドコードは実装していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 自動生成・自動投稿は実装していません。
- 実project ID、APIキー、トークン、認証情報、シークレットはコミットしていません。
- `publishedOutput` seed documentsは作成していません。
- Codex側ではSanity CLI createを実行していません。

## 3. Changed Files

- `seed/workflow-records.json`
- `docs/10-workflow-seeds.md`
- `docs/devlog/0022-workflow-seeds.md`
- `docs/handoff/latest.md`
- `docs/handoff/0028-workflow-seeds.md`

## 4. Summary of Changes

6件の `workflow` seed documentsを作成しました。

各workflowは `contentIdea.ai-blog-db` を参照し、必要に応じて `prompt`、`platformOutput`、`diagramPlan` を参照します。

CLI作成手順とStudio確認項目を `docs/10-workflow-seeds.md` に追加しました。

## 5. Key Decisions

- workflowは出力1件ごとではなく、タスク/devlog単位で作る。
- すべて `workflowMode: manual` とする。
- すべて `reviewRequired: true` とする。
- `toolsUsed` には将来の `tool` seedで解決する参照IDを入れる。
- `publishedOutput` は実公開後まで待つ。

## 6. Human Review Questions

- workflowの粒度はタスク/devlog単位でちょうどよいか。
- `toolsUsed` の未解決参照を許容し、次にtool seedを作る進め方でよいか。
- `observations` はStudio上で読むメモとして短すぎないか、長すぎないか。
- `workflow.ai-blog-db.sanity-seed-creation` はseed作成系を1件にまとめてよいか。

## 7. Risks or Uncertainties

- `tool` documentsがまだないため、`toolsUsed` はStudio上で未解決参照になる可能性があります。
- `platformOutput` や `diagramPlan` seedをまだCLI作成していない場合、workflow側の参照も一時的に未解決になります。
- 実公開がまだないため、`publishedOutput` は意図的に未作成です。

## 8. Recommended Next Step

ユーザーが `seed/workflow-records.json` をSanity CLIで作成し、Studioで6件のworkflowと参照関係を確認する。

その後、`toolsUsed` の参照を解消するために `tool` seed documentsを準備する。

## 9. Exact Prompt to Give Codex Next

```text
Record the result of creating workflow seed documents with Sanity CLI.

Do not add Next.js yet.
Do not implement frontend code yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement auto-generation or auto-posting.
Do not commit real project IDs, API keys, tokens, credentials, or secrets.
Do not create publishedOutput seed documents yet.

Current result:
- I ran: npx sanity documents create seed/workflow-records.json
- Result: [success/failure + notes]
- Studio review result:
  - 6 workflow documents appear in Studio: [yes/no]
  - sourceContentIdea references contentIdea.ai-blog-db: [yes/no + notes]
  - promptsUsed references are correct: [yes/no + notes]
  - platformOutputs references are correct where included: [yes/no + notes]
  - diagramPlans references are correct where included: [yes/no + notes]
  - toolsUsed references are resolved or unresolved as expected: [notes]
  - outputFiles are useful: [yes/no + notes]
  - observations are useful: [yes/no + notes]
  - workflowMode/reviewRequired values are correct: [yes/no + notes]
  - fields that felt heavy or confusing: [notes]

Use:
- seed/workflow-records.json
- docs/10-workflow-seeds.md
- schemas/workflow.ts

Tasks:

1. Record whether workflow seed creation succeeded.
2. Record whether all 6 workflow documents appear correctly in Studio.
3. Record whether sourceContentIdea, promptsUsed, platformOutputs, and diagramPlans references are correct.
4. Record whether toolsUsed references need tool seed documents next.
5. Record whether outputFiles, observations, workflowMode, and reviewRequired are useful in Studio.
6. Recommend whether to adjust the seed, schema, or labels before creating tool seed documents.
7. Update docs/devlog and docs/handoff/latest.md with the result.
8. Create a numbered handoff file for this task.

After editing, summarize:
1. Whether workflow seed creation worked
2. What Studio showed
3. Whether tool seed can come next
4. Exact prompt to give Codex next for creating tool seed documents
```
