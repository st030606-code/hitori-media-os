# Handoff: Mac Launcher for Studio and Visual Register

Date: 2026-05-12

## 1. Task Goal

Mac launcherを更新し、Sanity StudioとLocal Visual Registerを同時に起動・表示できるようにする。

## 2. Constraints Followed

- Next.jsは追加していません。
- フロントエンドダッシュボードは実装していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 画像生成API呼び出しは実装していません。
- 自動投稿は実装していません。
- Sanityへ直接writeしていません。
- 実project ID、APIキー、トークン、認証情報、シークレットは追加していません。

## 3. Changed Files

- `launchers/start-mac.command`
- `launchers/README.md`
- `docs/17-local-launcher-and-visual-register-workflow.md`
- `docs/19-local-visual-register-ui.md`
- `docs/devlog/0033-mac-launcher-studio-visual-register.md`
- `docs/handoff/latest.md`
- `docs/handoff/0041-mac-launcher-studio-visual-register.md`

## 4. Summary of Changes

Mac launcherが次の2つを起動するようになりました。

- Sanity Studio: `http://localhost:3333`
- Local Visual Register: `http://localhost:3334`

ランチャーは両方のサーバーを起動し、両方のURLをブラウザで開き、Terminal windowを共有ログとして残します。

## 5. Important Decisions

- Next.js dashboardはまだ追加しない。
- Visual Register実装自体は変更せず、launcher側だけを更新する。
- `npm run dev` と `npm run visual:register` を同じTerminal windowから起動する。
- Sanityへの直接writeは引き続き行わない。

## 6. Human Review Questions

- Macでダブルクリックしたときに両方のURLが期待通り開くか。
- Terminal logが見やすいか。
- `Ctrl+C` で両方のサーバーが止まるか。
- 2つのローカルURLを開く運用で買い手が迷わないか。

## 7. Risks or Uncertainties

- 実際のダブルクリック挙動はMac上での手動確認が必要です。
- どちらか片方のportが使用中の場合の案内はまだ簡易的です。
- ログは同じTerminal windowに混ざるため、将来は見やすさ改善が必要かもしれません。

## 8. Recommended Next Step

Macで `launchers/start-mac.command` をダブルクリックし、Sanity StudioとLocal Visual Registerが両方開くか確認する。

成功したら、patch JSONをSanityへ安全に反映する手順を設計する。

## 9. Exact Prompt to Give Codex Next

```text
Record the Mac launcher manual test result for opening both Sanity Studio and Local Visual Register.

Do not add Next.js yet.
Do not implement frontend dashboard yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement image generation API calls.
Do not implement auto-posting.
Do not commit real project IDs, API keys, tokens, credentials, or secrets.

Current result:
- I double-clicked launchers/start-mac.command: [success/failure + notes]
- Terminal opened and showed logs: [yes/no + notes]
- Sanity Studio started on http://localhost:3333: [yes/no + notes]
- Local Visual Register started on http://localhost:3334: [yes/no + notes]
- Browser opened both URLs: [yes/no + notes]
- Ctrl+C stopped both servers: [yes/no + notes]
- Any macOS permission issue: [notes]
- Any port issue: [notes]

Tasks:
1. Record the manual test result.
2. Update launcher docs if needed.
3. Update devlog and handoff.
4. Recommend the next step for safely applying Visual Register patch JSON to Sanity.

After editing, summarize:
1. Whether the launcher worked
2. What needed adjustment
3. What should be tested next
4. What should be implemented next
```
