# Handoff: Sanity Env Validation

Date: 2026-05-12

## 1. Task Goal

Sanity Studio起動確認後、実project IDをコミットしないようにSanity configを環境変数化する。

## 2. Constraints Followed

- Next.jsは追加していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 自動生成・自動投稿は実装していません。
- 実project ID、APIキー、トークン、認証情報、シークレットはコミットしていません。

## 3. Changed Files

- `sanity.config.ts`
- `sanity.cli.ts`
- `.env.example`
- `.gitignore`
- `package.json`
- `package-lock.json`
- `docs/devlog/0010-sanity-validation.md`
- `docs/handoff/latest.md`
- `docs/handoff/0012-sanity-env-validation.md`

## 4. Summary of Changes

`sanity.config.ts` と `sanity.cli.ts` のproject ID fallbackを実IDから `placeholder` に戻し、`SANITY_STUDIO_PROJECT_ID` / `SANITY_STUDIO_DATASET` を使う形にしました。

`.env.example` を追加し、`.env` / `.env.local` はgitignore済みであることを確認しました。

`styled-components` は `package.json` と `package-lock.json` に反映済みです。

## 5. Key Decisions

- 実project IDは `.env.local` にだけ置く。
- fallbackは `projectId = "placeholder"`、`dataset = "production"`。
- `styled-components` はSanity Studio起動に必要だったため、`package.json` dependenciesに残す。
- no-API MVP原則は維持する。

## 6. Human Review Questions

- project IDを環境変数化した運用で問題ないか。
- `.env.local` は各ローカル環境で手動作成する方針でよいか。
- `styled-components` のバージョンは現在の `^6.4.1` で固定してよいか。
- placeholder fallbackのままStudioを起動したときのエラー説明をREADMEにも追記するか。

## 7. Risks or Uncertainties

- placeholder fallbackのままではStudioは `placeholder.api.sanity.io` へ接続しようとして失敗します。
- `.env.local` の実project IDはローカル管理なので、環境ごとに設定が必要です。
- Studio表示はユーザー環境で確認済みですが、この変更後の再起動確認はまだです。

## 8. Recommended Next Step

`.env.local` に実project IDを設定し直して `npm run dev` を再実行し、Studioが引き続き表示・ログインできるか確認する。

その後、Studioで最初の `contentIdea` を1件入力する。

## 9. Exact Prompt to Give Codex Next

```text
Validate the environment-variable Sanity Studio setup and prepare first content entry.

Do not add Next.js.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement auto-generation or auto-posting.
Do not commit real project IDs, API keys, tokens, credentials, or secrets.

Tasks:

1. Confirm sanity.config.ts and sanity.cli.ts use SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET with safe fallbacks.
2. Confirm .env and .env.local are ignored.
3. If the user confirms .env.local is configured locally, run npm run dev or npm run build as appropriate.
4. Fix schema/setup issues only.
5. Create docs/devlog/0011-first-content-entry-prep.md.
6. Create or update docs/handoff/latest.md and a numbered handoff file.

After editing, summarize:
1. What was validated
2. Whether Studio is ready for first content entry
3. What still needs human review
4. What should be entered first in Studio
```
