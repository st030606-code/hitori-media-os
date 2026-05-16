# Handoff: visualAssetPlan Recovery Result

Date: 2026-05-13

## 1. Task Goal

`visualAssetPlan` seed `--replace` 後の手動復旧結果を記録し、現在の整合状態と次の推奨作業を整理する。

## 2. Constraints Followed

- Next.jsは追加していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 画像生成API呼び出しは実装していません。
- 自動投稿は実装していません。
- コードからSanityへ直接writeしていません。
- シークレットは追加していません。

## 3. Changed Files

- `docs/devlog/0040-visual-asset-plan-seed-replace-result.md`
- `docs/devlog/0041-visual-asset-plan-recovery-result.md`
- `docs/handoff/latest.md`
- `docs/handoff/0049-visual-asset-plan-recovery-result.md`

## 4. Summary of Changes

note heroの復旧結果を記録しました。

- `localAssetPath`: restored
- `status`: `saved`
- `reviewNotes`: 現在の保存済み / レビュー待ち状態に合わせて復旧
- local image exists: yes
- `expectedLocalAssetPath` still present for all 5 docs: yes

Visual Registerの再テストはまだ未記録です。

## 5. Important Decisions

- `expectedLocalAssetPath` backfillは成功済み。
- seed `--replace` によって戻った可能性のあるnote heroの保存状態は復旧済み。
- 今後、partial field backfillでは `seed --replace` を使わない。
- 既存画像があるため、次はVisual Registerに上書き確認を入れるのが安全。

## 6. Human Review Questions

- note heroの `reviewNotes` 文面は現在の状態に合っているか。
- Visual Registerでnote heroの予定パス / 実保存パス表示は分かりやすいか。
- 先に上書き確認を実装するか、複数画像batch testを先にするか。

## 7. Risks or Uncertainties

- Visual Register retestはまだ記録されていません。
- note hero以外の手動編集済みfieldがseed値へ戻っていないかは、必要ならStudio確認が必要です。
- 既存画像を再登録すると、現状では上書きの可能性があります。

## 8. Recommended Next Step

Visual Registerに既存ファイル上書き確認を追加します。

その後、note hero再登録時の挙動と複数画像batch registrationをテストします。

## 9. Exact Prompt to Give Codex Next

```text
Add overwrite confirmation to Local Visual Register.

Do not add Next.js yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement image generation API calls.
Do not implement auto-posting.
Do not write directly to Sanity.
Do not commit secrets.

Goal:
Prevent accidental overwrites when an image already exists at expectedLocalAssetPath.

Use:
- tools/visual-register/server.mjs
- tools/visual-register/public/app.js
- tools/visual-register/public/index.html
- tools/visual-register/public/styles.css
- docs/19-local-visual-register-ui.md

Tasks:
1. Make the server report whether expected local asset path already exists.
2. In the UI, warn when a selected visualAssetPlan already has a file at the save path.
3. Require explicit confirmation before overwriting.
4. Keep batch registration safe.
5. Do not write directly to Sanity.
6. Update docs/devlog and handoff.

After editing, summarize:
1. How overwrite protection works
2. What UI changed
3. What should be tested next
4. Whether batch registration is safer now
```
