# Handoff: expectedLocalAssetPath

Date: 2026-05-13

## 1. Task Goal

`visualAssetPlan` に保存前の予定パス `expectedLocalAssetPath` を追加し、Visual Registerがその値を優先して保存先に使うようにする。

## 2. Constraints Followed

- Next.jsは追加していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 画像生成API呼び出しは実装していません。
- 自動投稿は実装していません。
- Sanityへ直接writeしていません。
- シークレットは追加していません。

## 3. Changed Files

- `schemas/visualAssetPlan.ts`
- `seed/visual-asset-plan-records.json`
- `tools/visual-register/server.mjs`
- `docs/14-visual-asset-plan.md`
- `docs/19-local-visual-register-ui.md`
- `docs/21-visual-register-patch-apply-workflow.md`
- `docs/devlog/0038-expected-local-asset-path.md`
- `docs/handoff/latest.md`
- `docs/handoff/0046-expected-local-asset-path.md`

## 4. Summary of Changes

`expectedLocalAssetPath` を追加し、保存前の予定パスと保存後の実績パスを分離しました。

- `expectedLocalAssetPath`: 保存前から決める予定パス。
- `localAssetPath`: 実際に保存された後のパス。

Visual Registerは `expectedLocalAssetPath` を優先して保存先に使います。

値がない場合だけ、従来通り安全なfallback pathを導出します。

## 5. Important Decisions

- `localAssetPath` はactual saved pathとして残す。
- patch JSONは引き続き `localAssetPath`、`status`、`updatedAt`、`reviewNotes` を更新する。
- `expectedLocalAssetPath` は保存先の予定値としてseed/Sanityに持たせる。
- Visual RegisterからSanityへ直接writeはしない。

## 6. Human Review Questions

- 5件のseed path命名は運用に合っているか。
- 既存Sanity documentへ `expectedLocalAssetPath` をどう反映するか。
- Studioで `expectedLocalAssetPath` の表示位置と説明は分かりやすいか。
- `localAssetPath` との違いはユーザーに伝わるか。

## 7. Risks or Uncertainties

- 既存Sanity documentにはまだ `expectedLocalAssetPath` が入っていない可能性があります。
- seedを再作成または手動更新する手順が必要になるかもしれません。
- 既存のpatch JSONは `expectedLocalAssetPath` を含みませんが、patch反映自体には影響しません。

## 8. Recommended Next Step

Studioで `visualAssetPlan` schemaに `expectedLocalAssetPath` が表示されるか確認します。

その後、既存Sanity documentへ `expectedLocalAssetPath` を反映する手順を決めます。

## 9. Exact Prompt to Give Codex Next

```text
Prepare a safe seed or patch plan to add expectedLocalAssetPath to existing visualAssetPlan documents in Sanity.

Do not add Next.js yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement image generation API calls.
Do not implement auto-posting.
Do not write directly to Sanity from code.
Do not commit secrets.

Use:
- seed/visual-asset-plan-records.json
- schemas/visualAssetPlan.ts
- docs/21-visual-register-patch-apply-workflow.md

Tasks:
1. Decide whether to use Studio manual update, seed replace, or patch JSON for existing visualAssetPlan documents.
2. Create safe patch JSON files if useful.
3. Document the recommended update workflow.
4. Update devlog and handoff.

After editing, summarize:
1. How existing documents should receive expectedLocalAssetPath
2. What remains manual
3. What should be checked in Studio
4. Whether Visual Register should be retested
```
