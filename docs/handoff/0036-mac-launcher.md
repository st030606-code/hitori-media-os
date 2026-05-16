# Handoff: Mac Launcher

Date: 2026-05-12

## 1. Task Goal

ユーザーが `npm run dev` を手入力しなくてもSanity Studioを起動できるように、最初のMac向けランチャーを追加する。

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

- `launchers/start-mac.command`
- `launchers/README.md`
- `docs/17-local-launcher-and-visual-register-workflow.md`
- `docs/devlog/0029-mac-launcher.md`
- `docs/handoff/latest.md`
- `docs/handoff/0036-mac-launcher.md`

## 4. Summary of Changes

Mac向けの `start-mac.command` を追加しました。

ランチャーはproject rootを解決し、`package.json` と `node_modules` を確認し、必要なら `npm install` をユーザー確認付きで実行し、`npm run dev` を起動します。

起動後は `http://localhost:3333` を開き、Terminal windowをログ表示用として残します。

## 5. Key Decisions

- 最初のランチャーはMac向けだけにする。
- 現在の起動先はSanity Studioの `http://localhost:3333` にする。
- `npm install` は無条件実行せず、ユーザー確認付きにする。
- 将来dashboardができたら起動先URLを差し替える。

## 6. Human Review Questions

- Macでダブルクリック起動できるか。
- 初回のmacOS権限警告をREADMEの手順で越えられるか。
- 既にport 3333が使われている場合の案内が必要か。
- `npm install` をランチャーに任せてよいか、案内だけにすべきか。

## 7. Risks or Uncertainties

- macOSの設定によっては、`.command` ファイルの実行権限やGatekeeperの確認が必要です。
- `npm run dev` の起動完了前にブラウザが開く可能性があります。
- port 3333が既に使われている場合の専用ハンドリングはまだありません。

## 8. Recommended Next Step

Macで `launchers/start-mac.command` を実際にダブルクリックし、Sanity Studioが開くか確認する。

確認後、Windows launcherまたはLocal Visual Register UIへ進む。

## 9. Exact Prompt to Give Codex Next

```text
Record the Mac launcher manual test result.

Do not add Next.js yet.
Do not implement frontend dashboard yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement image generation API calls.
Do not implement auto-posting.
Do not commit real project IDs, API keys, tokens, credentials, or secrets.
Do not create new image files.

Current result:
- I double-clicked launchers/start-mac.command: [success/failure + notes]
- npm run dev started: [yes/no + notes]
- Browser opened http://localhost:3333: [yes/no + notes]
- Terminal window remained open for logs: [yes/no + notes]
- Any macOS permission issue: [notes]
- Any port issue: [notes]

Tasks:

1. Record the manual test result.
2. Update launchers/README.md if the instructions need adjustment.
3. Update docs/devlog and docs/handoff/latest.md.
4. Recommend whether Windows launcher or Local Visual Register UI should come next.

After editing, summarize:
1. Whether the launcher worked
2. What needed adjustment
3. What should be tested next
4. What should be implemented next
```
