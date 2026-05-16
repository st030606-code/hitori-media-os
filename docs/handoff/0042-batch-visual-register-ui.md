# Handoff: Batch-Friendly Visual Register UI

Date: 2026-05-12

## 1. Task Goal

Local Visual Register UIを、1枚ずつ登録するMVPから、複数画像を扱えるbatch-friendly UIへ改善する。

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

- `tools/visual-register/server.mjs`
- `tools/visual-register/public/index.html`
- `tools/visual-register/public/app.js`
- `tools/visual-register/public/styles.css`
- `docs/19-local-visual-register-ui.md`
- `docs/devlog/0034-batch-visual-register-ui.md`
- `docs/handoff/latest.md`
- `docs/handoff/0042-batch-visual-register-ui.md`

## 4. Summary of Changes

Visual Register UIを複数画像対応にしました。

ユーザーは複数画像を選び、登録キュー上で画像ごとに `visualAssetPlan` を割り当て、保存予定パスを確認し、1件ずつまたはまとめて登録できます。

UIもMaterial Design 3の考え方を参考に、top app bar、card layout、chips、queue table、right-side preview、toast messageを持つdashboard-like layoutへ改善しました。

## 5. Important Decisions

- サーバーの登録APIは単体登録のまま維持する。
- batch登録はUI側で単体APIを順番に呼ぶ。
- これにより、軽量さと安全性を維持する。
- 同じ保存予定パスに複数画像が割り当たった場合は警告し、登録できないようにする。
- Sanityへの直接writeはまだ行わない。

## 6. Human Review Questions

- 複数画像キューのUIは実運用で迷わないか。
- 登録先planの選択表示は十分分かりやすいか。
- 保存予定パスの重複警告は期待通りか。
- toastやchipの文言は日本語UIとして自然か。
- 右側プレビューの情報量は十分か。

## 7. Risks or Uncertainties

- まだブラウザ上での複数画像登録手動テストが必要です。
- 大きな画像を多数選ぶとdata URL方式のため重くなる可能性があります。
- 既存画像の上書き確認はまだありません。
- Sanity反映はpatch JSON確認後の手動です。

## 8. Recommended Next Step

`npm run visual:register` またはMac launcherでUIを開き、複数画像登録を手動テストする。

その後、patch JSONをSanityへ安全に反映する手順を設計する。

## 9. Exact Prompt to Give Codex Next

```text
Record the batch Visual Register manual test result.

Do not add Next.js yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement image generation API calls.
Do not implement auto-posting.
Do not write directly to Sanity.
Do not commit secrets.

Current result:
- Visual Register opened: [yes/no + notes]
- visualAssetPlan records loaded: [yes/no + count]
- Multiple image selection worked: [yes/no + count]
- Queue displayed selected images: [yes/no + notes]
- Plan assignment per row worked: [yes/no + notes]
- Duplicate path warning worked: [yes/no + notes]
- Single row registration worked: [yes/no + path]
- Batch registration worked: [yes/no + paths]
- Patch JSON created per row: [yes/no + paths]
- No direct Sanity write occurred: [yes/no]
- UI confusion or errors: [notes]

Tasks:
1. Record the manual test result.
2. Update docs/devlog and handoff.
3. Recommend whether to add overwrite confirmation or patch-apply workflow next.

After editing, summarize:
1. Whether batch registration worked
2. What files were created
3. What remains manual
4. What should be implemented next
```
