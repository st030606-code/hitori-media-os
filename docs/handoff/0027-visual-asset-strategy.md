# Handoff: Visual Asset Strategy

Date: 2026-05-12

## 1. Task Goal

実画像生成に入る前に、`diagramPlan` と媒体別ビジュアルアセット配置計画の違いを整理し、どの画像をどこに使うかの方針を文書化する。

## 2. Constraints Followed

- Next.jsは追加していません。
- フロントエンドコードは実装していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 自動生成・自動投稿は実装していません。
- 実画像ファイルは作成していません。
- 実project ID、APIキー、トークン、認証情報、シークレットはコミットしていません。

## 3. Changed Files

- `docs/09-visual-asset-strategy.md`
- `docs/05-future-dashboard.md`
- `docs/devlog/0021-visual-asset-strategy.md`
- `docs/handoff/latest.md`
- `docs/handoff/0027-visual-asset-strategy.md`

## 4. Summary of Changes

`docs/09-visual-asset-strategy.md` を追加し、媒体別に必要なビジュアル、配置例、数量目安、再利用方針、優先度を整理しました。

`docs/05-future-dashboard.md` には、将来ダッシュボードがビジュアルアセット制作パイプラインを表示すべきことを追記しました。

## 5. Key Decisions

- `diagramPlan` は概念レベルの図解計画として扱う。
- ビジュアルアセット配置計画は、媒体別の使用場所、枚数、比率、再利用方針を扱う。
- 実画像生成はまだ行わない。
- 最初の制作優先度は note hero / eye-catch、note main concept diagram、X hook diagram の順にする。
- 将来的には `visualAssetPlan` または `visualPlacementPlan` スキーマを検討する。

## 6. Human Review Questions

- 優先順位は note / X / Instagram / GitHub の順でよいか。
- note hero / eye-catch はどの `diagramPlan` から作るのがよいか。
- `visualAssetPlan` と `visualPlacementPlan` は別スキーマにすべきか、ひとつにまとめるべきか。
- 画像生成前に、媒体別の文言をさらに短くする必要があるか。

## 7. Risks or Uncertainties

- 実際に画像生成すると、図内テキスト量や比率の調整が必要になる可能性があります。
- Instagramカルーセルは制作枚数が多いため、最初から8枚全部を作るとレビューが重くなります。
- 現時点では実アセット管理用のスキーマがないため、画像生成後の `localAssetPath` 管理は未設計です。

## 8. Recommended Next Step

`workflow` seedを作り、ここまでの手動・半自動ワークフローをタスク単位でSanityに記録できるようにする。

画像生成は、その後にnote hero / eye-catchから1枚ずつ進める。

## 9. Exact Prompt to Give Codex Next

```text
Prepare Sanity CLI seed documents for workflow records.

Do not add Next.js yet.
Do not implement frontend code yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement auto-generation or auto-posting.
Do not commit real project IDs, API keys, tokens, credentials, or secrets.
Do not create publishedOutput seed documents yet.

Use:
- schemas/workflow.ts
- seed/contentIdea-ai-blog-db.json
- seed/prompt-records.json
- seed/platform-output-records.json
- seed/diagram-plan-records.json
- docs/devlog/
- docs/09-visual-asset-strategy.md

Tasks:

1. Create seed/workflow-records.json with workflow documents that summarize the manual/no-API workflow so far.
2. Keep workflow records at the task/devlog level, not per tiny output, unless explicitly needed.
3. Include references to sourceContentIdea, promptsUsed, toolsUsed, outputFiles, workflowMode, observations, and devlogReference according to the workflow schema.
4. Include at least:
   - sample record and prompt workflow
   - first text/social outputs
   - video/audio/visual output test
   - X output addition
   - Sanity seed creation workflow
   - visual asset strategy planning
5. Add CLI create instructions to docs.
6. Create or update docs/devlog.
7. Update docs/handoff/latest.md and create a numbered handoff file.

After editing, summarize:
1. What workflow seeds were created
2. How they connect to existing contentIdea, prompt, platformOutput, and diagramPlan records
3. How to create them with Sanity CLI
4. Whether publishedOutput should still wait
```
