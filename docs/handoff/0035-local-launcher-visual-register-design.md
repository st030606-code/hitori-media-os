# Handoff: Local Launcher and Visual Register Design

Date: 2026-05-12

## 1. Task Goal

買い手がターミナルコマンドを毎回入力しなくても、ローカルアプリ起動と手動生成画像の登録ができるワークフローを設計する。

## 2. Constraints Followed

- Next.jsは追加していません。
- フロントエンドダッシュボードは実装していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 画像生成API呼び出しは実装していません。
- 自動投稿は実装していません。
- 実project ID、APIキー、トークン、認証情報、シークレットはコミットしていません。
- 新しい画像ファイルは作成していません。

## 3. Changed Files

- `docs/17-local-launcher-and-visual-register-workflow.md`
- `docs/05-future-dashboard.md`
- `docs/14-visual-asset-plan.md`
- `docs/devlog/0028-local-launcher-visual-register-design.md`
- `docs/handoff/latest.md`
- `docs/handoff/0035-local-launcher-visual-register-design.md`

## 4. Summary of Changes

ランチャーでローカルアプリを起動し、ブラウザUIで手動生成画像を `visualAssetPlan` に登録するワークフローを設計しました。

通常のブラウザページだけでは `npm run dev` のようなローカルコマンドを起動できないため、ランチャーまたはデスクトップラッパーが必要であることを明記しました。

## 5. Key Decisions

- 買い手向けにはCLI-only運用を避ける。
- MVPではOS別ランチャー + local Node helper server / browser UIを推奨する。
- Visual Registerは `visualAssetPlan` を中心に画像保存、patch JSON作成、状態更新を支援する。
- Next.js dashboardは後の段階で、Visual Registerを統合する。
- 画像生成APIはまだ実装せず、`visualAssetPlan` の互換フィールドだけで将来に備える。

## 6. Human Review Questions

- 最初のランチャーはMac向け `launchers/start-mac.command` からでよいか。
- Visual RegisterはNext.js前に軽量Node helper UIとして作るべきか。
- `npm install` をランチャーが自動実行するか、案内だけにするか。
- Sanity updateは最初から直接writeするか、patch JSON生成に留めるか。

## 7. Risks or Uncertainties

- OSごとにランチャーの権限、実行方法、ブラウザopen方法が異なります。
- ローカルファイル操作をするため、ブラウザUIだけでは足りずserver側処理が必要です。
- 直接Sanity writeを入れる場合、認証情報の扱いを慎重に設計する必要があります。

## 8. Recommended Next Step

まず `launchers/start-mac.command` を追加し、買い手がダブルクリックでSanity StudioまたはローカルUIを開ける最小起動フローを作る。

その後、Local Visual Register UIを小さく実装する。

## 9. Exact Prompt to Give Codex Next

```text
Add a minimal Mac launcher for local startup.

Do not add Next.js yet.
Do not implement frontend dashboard yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement image generation API calls.
Do not implement auto-posting.
Do not commit real project IDs, API keys, tokens, credentials, or secrets.
Do not create new image files.

Use:
- docs/17-local-launcher-and-visual-register-workflow.md
- package.json
- sanity.config.ts

Tasks:

1. Create launchers/start-mac.command.
2. The launcher should:
   - change directory to the project root
   - check whether node_modules exists
   - if missing, show a clear message telling the user to run npm install
   - run npm run dev
   - open the local Studio URL after startup if safe
   - keep the terminal window open as a log window
3. Do not hardcode real project IDs or secrets.
4. Add docs explaining how to use the launcher.
5. Create or update docs/devlog.
6. Update docs/handoff/latest.md and create a numbered handoff file.

After editing, summarize:
1. What launcher was added
2. How the user starts the local app
3. What still requires terminal use
4. What should be implemented next
```
