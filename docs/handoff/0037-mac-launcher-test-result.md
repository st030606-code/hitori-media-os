# Handoff: Mac Launcher Test Result

Date: 2026-05-12

## 1. Task Goal

Mac向けランチャー `launchers/start-mac.command` の手動テスト結果を記録する。

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

- `docs/devlog/0029-mac-launcher.md`
- `docs/handoff/latest.md`
- `docs/handoff/0037-mac-launcher-test-result.md`

## 4. Summary of Changes

ユーザーが `launchers/start-mac.command` をダブルクリックし、Sanity Studioが起動したことを記録しました。

Terminalはログ表示用として残りますが、ユーザーは `npm run dev` を手入力する必要がないことを確認しました。

## 5. Key Decisions

- Mac launcherはno-terminal startup MVPとして成功。
- `launchers/README.md` は現時点で更新不要。
- 次はWindows launcherよりもLocal Visual Register UIを優先するのが実運用に効く。

## 6. Human Review Questions

- port 3333が使用中の場合の案内を今後追加するか。
- Terminal windowをさらに隠す必要があるか、それともログ表示として残す方がよいか。
- Windowsユーザー対応を先にするか、Visual Registerを先にするか。

## 7. Risks or Uncertainties

- 別のMac環境ではmacOSの権限警告が出る可能性があります。
- port 3333競合時の専用ハンドリングはまだありません。
- 現時点ではSanity Studioを開くだけで、Visual Register UIはまだありません。

## 8. Recommended Next Step

Local Visual Register UIの最小設計・実装へ進む。

手動生成した画像を選択し、`visualAssetPlan` を選び、正しいlocalAssetPathへ保存し、Sanity patch/update JSONを作る流れを実装すると、画像登録の手作業ミスを減らせます。

## 9. Exact Prompt to Give Codex Next

```text
Design the minimal Local Visual Register UI implementation plan.

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
- docs/14-visual-asset-plan.md
- schemas/visualAssetPlan.ts
- seed/visual-asset-plan-records.json
- launchers/start-mac.command

Tasks:

1. Design a minimal Local Node helper server and browser UI for Visual Register.
2. The design should support:
   - selecting a local image file
   - selecting a visualAssetPlan
   - previewing the image
   - showing expected localAssetPath
   - saving/copying the image into the correct local assets path
   - creating Sanity patch/update JSON
   - not directly writing to Sanity yet
3. Recommend file structure and package scripts.
4. Do not implement the UI yet unless explicitly asked.
5. Update docs/devlog and docs/handoff/latest.md.

After editing, summarize:
1. What Visual Register should do
2. What should be implemented first
3. What should remain manual
4. Whether Next.js should still wait
```
