# Handoff: Tool Seeds Before Workflow

Date: 2026-05-12

## 1. Task Goal

`workflow` seed作成失敗の原因だった未作成の `tool` 参照を解消するため、`tool` seed documentsを準備し、workflow seedの作成順序を修正する。

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

- `seed/tool-records.json`
- `docs/10-workflow-seeds.md`
- `docs/11-tool-seeds.md`
- `docs/devlog/0023-tool-seeds-before-workflow.md`
- `docs/handoff/latest.md`
- `docs/handoff/0029-tool-seeds-before-workflow.md`

## 4. Summary of Changes

14件の `tool` seed documentsを作成しました。

`workflow` seedより先に `tool` seedを作る必要があることを `docs/10-workflow-seeds.md` と `docs/11-tool-seeds.md` に明記しました。

## 5. Key Decisions

- `tool` recordsを先に作成し、その後に `workflow` recordsを作成する。
- `relatedWorkflows` は循環参照を避けるため、今回のtool seedには含めない。
- ElevenLabs、Fish Audio、CapCutはLLM API連携ではなく、媒体化のための制作ツールとして記録する。
- `publishedOutput` は実公開後まで待つ。

## 6. Human Review Questions

- 14件のtool台帳は多すぎず少なすぎないか。
- `costModel` の分類は現実の契約状況と合っているか。
- `tool.sanity` と `tool.sanity-studio` / `tool.sanity-cli` を分ける粒度でよいか。
- `relatedWorkflows` は後で追加する必要があるか。

## 7. Risks or Uncertainties

- 実際の契約状況によって `costModel` は修正が必要かもしれません。
- `tool` と `workflow` の相互参照は便利ですが、seed順序が複雑になるため今回は片方向にしています。
- workflow seedを再実行する前に、platformOutput / diagramPlan seedの作成状況も確認が必要です。

## 8. Recommended Next Step

ユーザーが `seed/tool-records.json` をSanity CLIで作成し、その後 `seed/workflow-records.json` を再実行する。

## 9. Exact Prompt to Give Codex Next

```text
Record the result of creating tool seed documents and retrying workflow seed documents with Sanity CLI.

Do not add Next.js yet.
Do not implement frontend code yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement auto-generation or auto-posting.
Do not commit real project IDs, API keys, tokens, credentials, or secrets.
Do not create publishedOutput seed documents yet.

Current result:
- I ran: npx sanity documents create seed/tool-records.json
- Tool result: [success/failure + notes]
- I ran: npx sanity documents create seed/workflow-records.json
- Workflow retry result: [success/failure + notes]
- Studio review result:
  - 14 tool documents appear in Studio: [yes/no]
  - workflow toolsUsed references are resolved: [yes/no + notes]
  - 6 workflow documents appear in Studio: [yes/no]
  - sourceContentIdea / promptsUsed / platformOutputs / diagramPlans references are correct: [yes/no + notes]
  - fields that felt heavy or confusing: [notes]

Use:
- seed/tool-records.json
- seed/workflow-records.json
- docs/10-workflow-seeds.md
- docs/11-tool-seeds.md
- schemas/tool.ts
- schemas/workflow.ts

Tasks:

1. Record whether tool seed creation succeeded.
2. Record whether workflow seed retry succeeded.
3. Record whether tool and workflow documents display correctly in Studio.
4. Record whether toolsUsed references are now resolved.
5. Recommend whether any tool records, workflow records, schema labels, or seed order docs need adjustment.
6. Update docs/devlog and docs/handoff/latest.md with the result.
7. Create a numbered handoff file for this task.

After editing, summarize:
1. Whether tool seed creation worked
2. Whether workflow seed retry worked
3. What Studio showed
4. What should be implemented next
```
