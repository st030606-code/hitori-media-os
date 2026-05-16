# Handoff: Dashboard First Architecture

Date: 2026-05-12

## 1. Task Goal

Sanity Studioは買い手向けの日常操作UIではなく、将来のNext.jsダッシュボードが主UIになることをプロダクト設計ドキュメントに明記する。

## 2. Constraints Followed

- Next.jsは追加していません。
- フロントエンドコードは実装していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 自動生成・自動投稿は実装していません。
- 実project ID、APIキー、トークン、認証情報、シークレットはコミットしていません。

## 3. Changed Files

- `docs/05-future-dashboard.md`
- `docs/04-first-content-entry.md`
- `docs/02-schema-design.md`
- `docs/devlog/0014-dashboard-first-architecture.md`
- `docs/handoff/latest.md`
- `docs/handoff/0016-dashboard-first-architecture.md`

## 4. Summary of Changes

Sanityをデータバックエンド、Sanity StudioをバックオフィスUI、将来のNext.jsダッシュボードを買い手向け主UIとして整理しました。

Studioでの手入力は初期検証であり、長期的には最小入力、AI構造化、人間レビュー、媒体別出力、パイプライン管理をダッシュボードで扱う方針にしました。

## 5. Key Decisions

- Sanity Studioを日常運用UIとして最適化しすぎない。
- 買い手向けUIは将来のNext.jsダッシュボードにする。
- `contentIdea.rawInput` を将来フィールドとして設計に追加する。
- `platform` 値は自由入力ではなく制御値として扱う。
- 今回はドキュメントのみ更新し、TypeScriptスキーマやNext.jsは変更しない。

## 6. Human Review Questions

- Studioと将来ダッシュボードの役割分担は自然か。
- `rawInput` は `contentIdea` に置く方針でよいか。
- 買い手向けダッシュボードの最初の画面は「生アイデア入力」でよいか。
- platform制御値の一覧は今の媒体セットで十分か。

## 7. Risks or Uncertainties

- `rawInput` をSanityに残す場合、未整理メモが増えすぎる可能性があります。
- ダッシュボード設計を急ぎすぎると、まだ検証中の手動ワークフローを固定化する可能性があります。
- platform制御値は、Instagramやpaid articleなどの表記統一をもう一度確認する必要があります。

## 8. Recommended Next Step

TypeScriptスキーマに `contentIdea.rawInput` を追加し、`platform` 系フィールドをselect optionsとして制御値に統一する。

## 9. Exact Prompt to Give Codex Next

```text
Update the Sanity TypeScript schemas for the dashboard-first architecture.

Do not add Next.js yet.
Do not implement frontend code yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement auto-generation or auto-posting.
Do not commit real project IDs, API keys, tokens, credentials, or secrets.

Use:
- docs/02-schema-design.md
- docs/05-future-dashboard.md
- schemas/contentIdea.ts
- schemas/platformOutput.ts
- schemas/diagramPlan.ts
- schemas/publishedOutput.ts
- schemas/prompt.ts

Tasks:

1. Add optional rawInput to contentIdea.
   - Japanese-first bilingual title.
   - Description should explain it is for rough dashboard input before AI structuring.

2. Ensure platform and targetPlatform fields use controlled select options where appropriate.
   - Keep stored values in English.
   - Keep Japanese-first bilingual option titles.
   - Do not change existing stored values unless necessary.

3. Add or update docs/devlog with the schema changes.
4. Create or update docs/handoff/latest.md and a numbered handoff file.

After editing, summarize:
1. What changed
2. Which fields now support dashboard-first input
3. Whether platform values are controlled consistently
4. What should be reviewed before first contentIdea entry
```

