# Handoff: Minimal Sanity Setup

Date: 2026-05-11

## 1. Task Goal

既存の7つのSanityスキーマをStudioで読み込めるように、最小限のSanity Studioセットアップを追加する。

## 2. Constraints Followed

- Next.jsは追加していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 自動生成・自動投稿は実装していません。
- APIキー、トークン、認証情報、シークレットは保存していません。
- 実Sanity project IDはコミットしていません。

## 3. Changed Files

- `package.json`
- `sanity.config.ts`
- `sanity.cli.ts`
- `tsconfig.json`
- `.gitignore`
- `docs/devlog/0009-minimal-sanity-setup.md`
- `docs/handoff/latest.md`
- `docs/handoff/0011-minimal-sanity-setup.md`

## 4. Summary of Changes

Sanity Studioをローカル起動するための最小構成を追加しました。

`sanity.config.ts` と `sanity.cli.ts` は placeholder project ID を使い、実IDやトークンを含めていません。

`package.json` にはSanity Studio用のスクリプトだけを追加しました。

## 5. Key Decisions

- `sanity` パッケージのみを依存関係として追加。
- `npm run dev`, `npm run start`, `npm run build` はSanity Studio用。
- `projectId` は `placeholder`、`dataset` は `production`。
- 実projectIdはローカルで置き換える前提。
- Next.jsやAPIクライアントは追加しない。

## 6. Human Review Questions

- placeholder projectId をこのままコミットしてよいか。
- projectIdを環境変数に逃がすべきか、当面は手動置き換えでよいか。
- `sanity` 以外の依存関係が必要か。
- `npm run start` / `build` まで必要か、`dev` だけでよいか。

## 7. Risks or Uncertainties

- 依存関係はまだインストールしていないため、Studio起動は未検証です。
- Sanity Studio v4以降はNode.js 20+が前提です。
- `sanity@latest` は将来バージョン差分の影響を受ける可能性があります。
- placeholder projectId のままではStudioは実プロジェクトに接続できません。
- Sanity v4環境でスキーマの型チェックが必要です。

## 8. Recommended Next Step

Node.js 20+ を確認し、依存関係をインストールし、実projectIdへ置き換えたうえで `npm run dev` を実行してStudio起動とスキーマ読み込みを確認する。

## 9. Exact Prompt to Give Codex Next

```text
Validate the minimal Sanity Studio setup.

Do not add Next.js.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement auto-generation or auto-posting.
Do not commit real project IDs, API keys, tokens, credentials, or secrets.

Tasks:

1. Review package.json, sanity.config.ts, sanity.cli.ts, tsconfig.json, and schemas/.
2. If the user provides or approves a real Sanity project ID, update local config as instructed.
3. Install dependencies only with user approval if network access is required.
4. Run the minimal validation available:
- type/schema import checks if dependencies are installed
- npm run build or npm run dev only if configured and approved
5. Fix schema-level issues only.
6. Create docs/devlog/0010-sanity-validation.md.
7. Create or update docs/handoff/latest.md and a numbered handoff file.

After editing, summarize:
1. What was validated
2. What failed or passed
3. What still needs human review
4. Whether the Studio is ready for first content entry
```
