# Handoff: Visual Register Overwrite Protection

Date: 2026-05-13

## 1. Task Goal

Local Visual Registerで、既存ファイルを誤って上書きしないための確認フローを追加する。

## 2. Constraints Followed

- Next.jsは追加していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 画像生成API呼び出しは実装していません。
- 自動投稿は実装していません。
- Sanityへ直接writeしていません。
- `seed --replace` は実行していません。
- シークレットは追加していません。
- 新しい生成画像ファイルは作成していません。
- destructive file operationは行っていません。

## 3. Changed Files

- `tools/visual-register/server.mjs`
- `tools/visual-register/public/app.js`
- `tools/visual-register/public/styles.css`
- `docs/19-local-visual-register-ui.md`
- `docs/devlog/0042-visual-register-overwrite-protection.md`
- `docs/handoff/latest.md`
- `docs/handoff/0050-visual-register-overwrite-protection.md`

Mac launcherはすでにStudioとVisual Registerの両方を開く構成だったため、今回は変更していません。

## 4. Summary of Changes

Visual Registerに上書き保護を追加しました。

Serverは `expectedLocalAssetPath` に既存ファイルがあるかを返し、登録時にも再確認します。

UIは既存ファイルがある行に警告と `既存ファイルあり` chipを表示し、`この画像で上書きする` を確認するまで登録できないようにしました。

Batch registrationでも、上書き確認がない行は登録対象から外れます。

Validationでは、note heroの既存ファイル検出が `true` で返り、`overwriteConfirmed` なしの登録POSTが `409` で拒否されることを確認しました。

## 5. Important Decisions

- 上書き確認はUIだけでなくserver側でも必須にする。
- `overwriteConfirmed: true` がない限り、既存ファイルは上書きしない。
- Sanity direct writeは引き続き行わない。
- Mac launcherは現状維持。

## 6. Human Review Questions

- 上書き確認の文言は分かりやすいか。
- 既存ファイルありchipは目立ちすぎず、見落としにくいか。
- checkbox方式で十分か、将来confirm dialogにした方がよいか。
- batch registrationのskip挙動は期待通りか。

## 7. Risks or Uncertainties

- 実ブラウザでの上書き確認UIは手動テストが必要です。
- 既存ファイル上書き後、patch JSONは新しい `localAssetPath` を指しますが、画像内容の差分管理はまだありません。
- 将来はconfirm dialogやbackup作成も検討できます。
- `zsh -n launchers/start-mac.command` はexit code 0ですが、sandbox環境では既存のbackground起動行に `nice(5) failed` warningが出ました。

## 8. Recommended Next Step

Visual Registerを開き、note heroで既存ファイル検出と上書き確認を手動テストします。

その後、複数画像でbatch registrationをテストします。

## 9. Exact Prompt to Give Codex Next

```text
Record the Visual Register overwrite protection manual test result.

Do not add Next.js yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement image generation API calls.
Do not implement auto-posting.
Do not write directly to Sanity.
Do not run seed --replace.
Do not commit secrets.

Current result:
- Visual Register opened: [yes/no + notes]
- note hero existing file warning displayed: [yes/no + notes]
- Register button blocked before overwrite confirmation: [yes/no + notes]
- Server refused overwrite without confirmation: [yes/no + notes]
- Overwrite confirmation checkbox worked: [yes/no + notes]
- Batch registration skipped unconfirmed overwrite rows: [yes/no + notes]
- No direct Sanity write occurred: [yes/no]
- No unexpected image files were created: [yes/no + notes]

Tasks:
1. Record the manual test result.
2. Update docs/devlog and handoff.
3. Recommend whether to add confirm dialog or retest multi-image batch next.

After editing, summarize:
1. Whether overwrite protection worked
2. What remains manual
3. Whether batch registration is safer
4. What should be implemented next
```
