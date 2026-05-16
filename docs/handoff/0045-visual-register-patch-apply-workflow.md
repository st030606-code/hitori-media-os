# Handoff: Visual Register Patch Apply Workflow

Date: 2026-05-13

## 1. Task Goal

Visual Registerが作成したpatch JSONを、人間が安全に確認し、Sanityへ反映するためのMVP workflowを設計する。

## 2. Constraints Followed

- Next.jsは追加していません。
- 有料LLM API連携は追加していません。
- OpenAI API / Anthropic API クライアントは追加していません。
- 画像生成API呼び出しは実装していません。
- 自動投稿は実装していません。
- Sanityへ直接writeしていません。
- シークレットは追加していません。

## 3. Changed Files

- `docs/21-visual-register-patch-apply-workflow.md`
- `docs/19-local-visual-register-ui.md`
- `docs/20-frontend-ui-design-system.md`
- `docs/devlog/0037-visual-register-patch-apply-workflow.md`
- `docs/handoff/latest.md`
- `docs/handoff/0045-visual-register-patch-apply-workflow.md`

## 4. Summary of Changes

Visual Register patch JSONのreview checklist、Manual Studio update手順、CLI patch command案、future dashboard direct write案を整理しました。

MVPでは、patch JSONを確認したうえでSanity Studioへ手動反映する運用を推奨しました。

CLI patchやdashboard direct writeは、patch形式とconfirm flowが安定してから後段で検討します。

## 5. Important Decisions

- 今はVisual RegisterからSanityへ直接writeしない。
- MVPはManual Studio updateを推奨する。
- patch JSONの `set` だけをSanityへ反映する。
- `meta` はレビュー補助情報として扱う。
- CLI patch helperとdashboard direct writeは将来フェーズに置く。
- Next.jsはまだ追加しない。

## 6. Human Review Questions

- Manual Studio updateで運用を始めて問題ないか。
- `reviewNotes` の古いメモを反映前に整理する運用でよいか。
- CLI patch helperを次に設計するか。
- 先にVisual Registerの既存ファイル上書き確認を入れるか。

## 7. Risks or Uncertainties

- Manual Studio updateは安全ですが、件数が増えると遅くなります。
- 手入力ミスの可能性があります。
- CLI patch helperを作る場合はSanity token管理が必要になります。
- Dashboard direct writeには認証・権限・confirm UIが必要です。

## 8. Recommended Next Step

複数画像でBatch Visual Registerをテストする。

または、Visual Registerに既存ファイル上書き確認を追加する。

patch反映は、まずManual Studio updateで1件試します。

## 9. Exact Prompt to Give Codex Next

```text
Record the manual Sanity Studio update result for the first Visual Register patch JSON.

Do not add Next.js yet.
Do not add paid LLM API integrations.
Do not add OpenAI API or Anthropic API clients.
Do not implement image generation API calls.
Do not implement auto-posting.
Do not write directly to Sanity from code.
Do not commit secrets.

Current result:
- Patch JSON reviewed: [yes/no + notes]
- Target document: visualAssetPlan.ai-blog-db.note-hero-v1
- localAssetPath applied in Studio: [yes/no + notes]
- status set to saved: [yes/no + notes]
- updatedAt applied: [yes/no + notes]
- reviewNotes cleaned or applied: [yes/no + notes]
- Studio saved successfully: [yes/no + notes]
- Any confusion or schema label issue: [notes]

Use:
- patches/visual-assets/ai-blog-db/note-hero-v1.json
- docs/21-visual-register-patch-apply-workflow.md
- schemas/visualAssetPlan.ts

Tasks:
1. Record the manual Studio update result.
2. Update docs/devlog and handoff.
3. Recommend whether to add overwrite confirmation or CLI patch helper next.

After editing, summarize:
1. Whether the patch was applied safely
2. What was updated in Sanity
3. What remains manual
4. What should be implemented next
```
