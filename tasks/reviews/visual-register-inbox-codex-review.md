# Codex Safety Review Packet: Visual Register Inbox Review + Codex CLI Optional Workflow

Date: 2026-05-14

このファイルは、Codex CLI に **safety review** を依頼する用のパケットです。テンプレートは [tasks/reviews/codex-code-review-template.md](codex-code-review-template.md) を参照。

**重要**: Codex は **レビューのみ**。ファイル編集 / git commit / push / API 呼び出しはさせない。secret / 実 project ID / private/ ファイル名 / subscriber メールを出力に貼り付けさせない。

---

## Current Task Summary

直近 2 バッチで以下を実装しました:

1. **Visual Register Inbox Review** (`tools/visual-register/`)
   - 既存のアップロード型 register / Patch Review / Content Idea filter / batch register / overwrite protection / test seed mode はすべて維持。
   - 新規 API: `GET /api/inbox/candidates`、`POST /api/inbox/review`、`POST /api/inbox/approve-and-register`、`GET /inbox-image`。
   - 候補画像を `assets/inbox/generated/<content-slug>/` に置き、ブラウザで承認 / 却下 / 再生成依頼 / approve-and-register が可能。
   - approve-and-register は inbox 画像を最終 `assets/visuals/...` パスへ copy + patch JSON 作成。overwrite protection は既存挙動を継承。
   - `loadPlans()` を拡張し、`seed/visual-asset-plan-records-<slug>.json` キャンペーン別 seed を自動 load。

2. **Codex CLI Optional Workflow** (docs + templates only, no executable script)
   - `docs/44-codex-cli-optional-workflow.md`: Codex は任意。Visual Register Inbox Review が承認の source of truth。
   - `tasks/visuals/_codex-image-generation-template.md`: 画像生成プロンプトテンプレ。
   - `tasks/reviews/codex-code-review-template.md`: コードレビューテンプレ。
   - `tools/codex-workflow/README.md`: README-only ガイド。

## Files Changed (本パケットでレビューする対象)

- `tools/visual-register/server.mjs`
- `tools/visual-register/public/index.html`
- `tools/visual-register/public/app.js`
- `tools/visual-register/public/styles.css`
- `assets/inbox/generated/README.md`
- `docs/43-visual-register-inbox-review-workflow.md`
- `docs/44-codex-cli-optional-workflow.md`
- `tasks/visuals/_codex-image-generation-template.md`
- `tasks/reviews/codex-code-review-template.md`
- `tools/codex-workflow/README.md`

実際のレビュー時は `git diff --stat` / `git status` の出力も併せて確認すること。

## Constraints

Hitori Media OS の方針（grep / 目視で確認すべき）:

- No Next.js
- No paid LLM / image generation API
- No direct Sanity write
- No auto-posting
- No `seed --replace`
- No private/ leakage in committed files
- No paid PDF content copied
- No real project ID / API tokens / subscriber emails committed
- No destructive file overwrite without explicit opt-in flag
- No face photo workflow
- Existing Visual Register functionality must not be removed

## Review Focus（本パケット固有）

A. **Destructive Writes**

- 既存ファイルを silent overwrite していないか
- approve-and-register が overwrite confirmation を経由するか
- inbox / final asset path / publish-packages の overwrite protection が正しく動くか

B. **Inbox Path Traversal**

- `safeInboxPath()` が `assets/inbox/generated/` 配下のみ許可しているか
- `safeProjectPath()` が project root の外に出させないか
- `slugFromInboxRelativePath()` が `assets/inbox/generated/<slug>/...` のみ受け入れるか

C. **Final Asset Overwrite Safety**

- approve-and-register が 409 + `overwriteRequired: true` を返すか
- UI 側で `window.confirm()` ダイアログ後に `overwriteConfirmed: true` を送るか
- 画像コピー前に `existsSync` チェックがあるか

D. **Direct Sanity Write Absence**

- `createClient` / `.patch(` / `.create(` / `.createOrReplace(` / `SANITY_AUTH_TOKEN` / `SANITY_API_TOKEN` / `mutation` の grep が 0 hits か
- patch JSON の `meta.directSanityWrite: false` が維持されているか

E. **Private/ Leakage**

- private/ 配下のファイル名 / 内容が docs / コードに引用されていないか
- private/ への読み込みコードパスが新規追加されていないか
- inbox / final asset / publish-packages が private/ に書き込むパターンが無いか

F. **Paid API Integration Absence**

- `openai` / `anthropic` / `stability` / `midjourney-api` / `replicate` などの import / SDK / HTTP リクエストが無いか
- Codex 関連の docs / template が paid API を促していないか

G. **Visual Register Existing Behavior Preservation**

- アップロード型 register（`POST /api/register-visual`）が触られていないか
- Patch Review / Content Idea filter / Platform filter / Asset Type filter / batch registration / test seed mode が機能するか
- 既存の patch JSON 出力フォーマットが互換か
- 既存の overwrite protection (409 + `code: 'asset_exists'`) が破壊されていないか

H. **Patch JSON Safety**

- inbox approve-and-register で生成される patch JSON が既存フォーマットと互換か
- `meta.inboxSource` フィールドが追加されているが、既存 Patch Review がこの情報を許容するか
- patch JSON が `set.localAssetPath` / `set.status` / `set.updatedAt` / `set.reviewNotes` を持つか

I. **Candidate Review Status Safety**

- `validReviewStatuses` で reviewStatus を whitelist しているか
- 無効な reviewStatus が POST されたとき 400 を返すか
- manifest 書き込みが `safeProjectPath` を経由しているか

## Do Not Edit

Codex は **コードを編集しない**。提案だけを返す。

ファイル修正は Claude Code もしくは人間が後で行う。

## Expected Output Format

```markdown
## Critical Issues

（このまま push すると壊れる箇所、もしくは方針違反）

- 

## Warnings

（壊れないが運用上のリスク、後で必ず直すべき）

- 

## Safe-To-Merge Notes

（特に問題はないが言及しておきたい挙動 / 設計判断）

- 

## Suggested Follow-Up

（次バッチで扱いたい改善や TODO）

- 
```

## Sample One-Liner Prompt

```text
Review the Visual Register Inbox Review additions and the Codex CLI optional workflow docs for safety, destructive file writes, inbox path traversal, final asset overwrite, direct Sanity write absence, private/ leakage, paid API integration absence, and Visual Register existing behavior preservation. Use tasks/reviews/visual-register-inbox-codex-review.md as the packet. Do not edit any files. Do not commit or push. Do not call any paid APIs. Do not expose secrets, real project IDs, subscriber emails, or private/ filenames in the output.
```

## Output Handling

- Codex の出力（4 セクション）を `docs/devlog/` 配下に `0083-codex-safety-review-result-<date>.md` 形式で保存する想定（Codex 実行後に人間が追加する）。
- Critical Issues があれば Claude Code 側で対応するバッチを切る。
- Warnings は `docs/handoff/latest.md` の "Risks or Uncertainties" に反映する。

## Reminder

- Codex は **レビューのみ**。
- ファイル編集や git 操作をさせない。
- secret / 実 project ID / private/ ファイル名 / subscriber メールを出力に貼り付けさせない。
- 重大な指摘は Claude Code に持ち帰る。
