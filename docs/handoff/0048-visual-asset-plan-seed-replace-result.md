# Handoff: visualAssetPlan Seed Replace Result

Date: 2026-05-13

## 1. Task Goal

`expectedLocalAssetPath` backfill前に `seed --replace` が実行された結果を記録し、リスクと復旧手順を整理する。

## 2. Constraints Followed

- Next.jsは追加していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 画像生成API呼び出しは実装していません。
- 自動投稿は実装していません。
- コードからSanityへ直接writeしていません。
- シークレットは追加していません。

## 3. Changed Files

- `docs/devlog/0039-expected-local-asset-path-backfill.md`
- `docs/devlog/0040-visual-asset-plan-seed-replace-result.md`
- `docs/handoff/latest.md`
- `docs/handoff/0048-visual-asset-plan-seed-replace-result.md`

## 4. Summary of Changes

誤って次が実行されたことを記録しました。

```bash
npx sanity documents create seed/visual-asset-plan-records.json --replace
```

この結果、`expectedLocalAssetPath` は5件すべての `visualAssetPlan` documentsに入りました。

ただし、`--replace` により既存の `localAssetPath`、`status`、`reviewNotes` がseedの値へ戻った可能性があります。

## 5. Important Decisions

- backfill自体は成功として記録する。
- `--replace` による上書きリスクも明示する。
- note heroの保存済み画像はローカルに存在しているため、必要ならStudioで手動復旧する。
- 今後、partial field backfillではseed replaceを避ける。

## 6. Human Review Questions

- Studio上でnote heroの `localAssetPath` は空になっているか。
- note heroの `status` は `saved` に戻すべきか。
- `reviewNotes` は現在の状態に合わせて整理するか。
- 5件の `expectedLocalAssetPath` はすべて期待通りか。

## 7. Risks or Uncertainties

- `localAssetPath/status/reviewNotes` がどの程度上書きされたかはStudio確認が必要です。
- note hero以外にも、手動編集済みfieldがseed値へ戻った可能性があります。
- seed replaceは全置換なので、今後のpartial updateには使わない方が安全です。

## 8. Recommended Next Step

Sanity Studioで `visualAssetPlan.ai-blog-db.note-hero-v1` を確認します。

必要なら次を手動復旧します。

- `localAssetPath`: `assets/visuals/ai-blog-db/note/hero/note-hero-v1.png`
- `status`: `saved`
- `reviewNotes`: 現在の状態に合う文面

その後、Visual Registerを再テストします。

## 9. Exact Prompt to Give Codex Next

```text
Record the manual recovery result after visualAssetPlan seed --replace.

Do not add Next.js yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement image generation API calls.
Do not implement auto-posting.
Do not write directly to Sanity from code.
Do not commit secrets.

Current result:
- note hero localAssetPath checked in Studio: [empty/restored/notes]
- note hero status checked in Studio: [value + notes]
- note hero reviewNotes checked in Studio: [notes]
- local image exists: yes
- localAssetPath restored if needed: [yes/no + notes]
- status restored to saved if needed: [yes/no + notes]
- expectedLocalAssetPath still present for all 5 docs: [yes/no + notes]
- Visual Register retest: [notes]

Tasks:
1. Record the recovery result.
2. Update docs/devlog and handoff.
3. Recommend whether to add overwrite confirmation or retest batch registration next.

After editing, summarize:
1. What was overwritten by seed --replace
2. What was restored
3. Whether Visual Register is consistent again
4. What should be done differently next time
```
