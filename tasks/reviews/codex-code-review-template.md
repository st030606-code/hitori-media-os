# Codex Code Review Prompt Template

Codex CLI に Claude Code の差分を **safety review** させたいときに使うテンプレート。

**重要**: Codex はレビューのみ。ファイルを編集させない。

---

## When To Run

- schema activations の直後
- publish-package-builder への変更後
- Visual Register への変更後（特に新 API を増やしたとき）
- GitHub commit / push の前
- inbox / final asset path 周りに触ったあと
- 大きめの additive バッチが完了したあと

## Current Task Summary

`<このバッチで何をやったかを1〜3段落で書く>`

例:

> 本バッチでは Visual Register に Inbox Review ワークフローを additive 追加しました。サーバーには `/api/inbox/candidates` `/api/inbox/review` `/api/inbox/approve-and-register` `/inbox-image` を追加し、UI には Inbox Review カードを追加しました。既存のアップロード型 register / Patch Review / Content Idea filter / batch register / overwrite protection / test seed mode はすべて維持しています。

## Files Changed

主な変更ファイルを列挙する。`git status` / `git diff --stat` の出力をそのまま貼ってもよい。

```text
<例>
M tools/visual-register/server.mjs
M tools/visual-register/public/index.html
M tools/visual-register/public/app.js
M tools/visual-register/public/styles.css
A docs/43-visual-register-inbox-review-workflow.md
A assets/inbox/generated/README.md
A docs/devlog/0079-...
A docs/handoff/0091-...
```

## Constraints

Hitori Media OS の方針:

- No Next.js
- No paid LLM / image generation API
- No direct Sanity write
- No auto-posting
- No `seed --replace`
- No private/ leakage in committed files
- No paid PDF content copied
- No real project ID / API tokens / subscriber emails committed
- No destructive file overwrite without explicit opt-in flag
- No face photo workflow (このバッチ以前のスコープでは)
- Existing functionality must not be removed without justification

## Review Checklist

次を確認してください:

### A. Destructive Writes

- [ ] 既存ファイルを silent overwrite していないか
- [ ] 上書きが必要な箇所には明示的な opt-in フラグ（`--replace-placeholder-package` など）があるか
- [ ] inbox / final asset path / publish-packages の overwrite protection が正しく動くか

### B. Secret Leakage

- [ ] `sk-`、`SANITY_AUTH_TOKEN`、`SANITY_API_TOKEN` などの secret pattern が混入していないか
- [ ] `.env.local` の中身 / 実 project ID / dataset 名 がコードベースに書き込まれていないか
- [ ] private/ 配下のファイル名・内容が docs / コードに引用されていないか

### C. Direct Sanity Write

- [ ] `createClient` / `.patch(` / `.create(` / `.createOrReplace(` / `mutation` が Visual Register / publish-package-builder / scripts に混入していないか
- [ ] `seed --replace` 相当の bulk write が含まれていないか

### D. Schema Registration

- [ ] `schemas/index.ts` の配列順序が依存順を保っているか（reference 先 → reference 元）
- [ ] proposed schemas が `schemas/index.ts` に誤って import されていないか
- [ ] `sanity.config.ts` が意図せず変更されていないか

### E. Assets Overwrite Risk

- [ ] `assets/visuals/...` の上書き経路が overwrite confirmation を経由するか
- [ ] `publish-packages/...` の上書きが許可リストの範囲内か
- [ ] inbox の candidate が final path に直接書かれない構造か

### F. Build / Local Check

- [ ] `node --check` 系がすべて成功する
- [ ] `npm run local:check` が `ok: true` を返す
- [ ] `npm run build` が成功する

### G. Visual Register Specific

- [ ] inbox API のパスバリデーション（`safeInboxPath`）が機能するか
- [ ] `validReviewStatuses` で reviewStatus が制限されているか
- [ ] `inboxImageExtensions` で画像 MIME が whitelist されているか
- [ ] 既存 `/api/register-visual` などのアップロード型挙動が壊れていないか

### H. Local-First Constraints

- [ ] auto-posting / API投稿 / email送信が追加されていないか
- [ ] 顔写真ワークフローが本バッチに混入していないか
- [ ] 有料PDF教材本文のコピーがないか

## Do Not Edit

Codex は **コードを編集しない**。提案だけを返す。

ファイルを直接修正したい場合は、別途人間または Claude Code に依頼する。

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
Review the current repo changes for safety, destructive file writes, secret leakage, schema registration mistakes, and local-first constraints. Do not edit files unless asked.
```

## Reminder

- Codex は **レビューのみ**。
- ファイル編集や git commit / push をさせない。
- secret / 実 project ID / private/ ファイル名を出力に貼り付けさせない。
- 重大な指摘があれば、Claude Code に持ち帰って修正する。
