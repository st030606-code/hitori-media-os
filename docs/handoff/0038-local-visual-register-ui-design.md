# Handoff: Local Visual Register UI Design

Date: 2026-05-12

## 1. Task Goal

手動生成した画像をCLIなしで登録するための、最小Local Node helper server / browser UIの実装計画を設計する。

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

- `docs/18-local-visual-register-ui-design.md`
- `docs/devlog/0030-local-visual-register-ui-design.md`
- `docs/handoff/latest.md`
- `docs/handoff/0038-local-visual-register-ui-design.md`

## 4. Summary of Changes

Visual Register UIの最小実装計画を追加しました。

Local Node helper serverが、`visualAssetPlan` 一覧の読み込み、画像アップロード、ローカル保存、patch JSON生成を担当し、ブラウザUIが画像選択、プレビュー、計画選択、Register操作を担当する設計です。

## 5. Key Decisions

- Next.jsはまだ追加しない。
- 先に軽量Node helper serverでローカル保存とpatch生成を検証する。
- Sanityへ直接writeせず、patch JSON生成までに留める。
- 最初の対象は `visualAssetPlan.ai-blog-db.note-hero-v1` にする。
- Mac launcherは将来StudioとVisual Registerの両方を開けるようにする。

## 6. Human Review Questions

- Visual Registerのportは `3334` でよいか。
- Sanity patch JSON形式はこの簡易形式でよいか。
- 最初から全visualAssetPlanを対象にするか、note heroだけに絞るか。
- Mac launcherでStudioとVisual Registerの両方を開く運用でよいか。

## 7. Risks or Uncertainties

- multipart uploadを実装する場合、依存パッケージを追加するかNode標準だけでいくか判断が必要です。
- ローカルファイル保存処理では、path traversal対策が必要です。
- Sanity direct writeを入れる段階では認証情報の扱いを再設計する必要があります。

## 8. Recommended Next Step

Local Visual Register UIを最小実装する。

最初は `tools/visual-register/server.mjs` と静的UIを追加し、`visualAssetPlan.ai-blog-db.note-hero-v1` で画像保存とpatch JSON生成を検証します。

## 9. Exact Prompt to Give Codex Next

```text
Implement the minimal Local Visual Register UI.

Do not add Next.js yet.
Do not implement frontend dashboard yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement image generation API calls.
Do not implement auto-posting.
Do not commit real project IDs, API keys, tokens, credentials, or secrets.
Do not create new image files other than user-selected copies during manual testing.

Use:
- docs/18-local-visual-register-ui-design.md
- docs/14-visual-asset-plan.md
- schemas/visualAssetPlan.ts
- seed/visual-asset-plan-records.json

Tasks:

1. Create a minimal Local Node helper server under tools/visual-register/.
2. Create a static browser UI for Visual Register.
3. Add package script: visual:register.
4. The UI should:
   - load visualAssetPlan records from seed/visual-asset-plan-records.json
   - let the user select an image file
   - preview the image
   - let the user select a visualAssetPlan
   - show expected localAssetPath
   - register/copy the image to assets/visuals/...
   - create patch JSON under patches/visual-assets/...
   - not write directly to Sanity
5. Add docs and devlog.
6. Update handoff.

After editing, summarize:
1. What was implemented
2. How to run Visual Register
3. What remains manual
4. What should be tested next
```
