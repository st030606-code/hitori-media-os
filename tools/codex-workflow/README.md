# Codex Workflow (Optional, README-only)

Date: 2026-05-14

このフォルダは **Codex CLI をオプションで使う場合の運用 README** を置く場所です。
**実行スクリプトは置きません**（local MVP は Codex に依存しない方針のため）。

詳細な設計は [docs/44-codex-cli-optional-workflow.md](../../docs/44-codex-cli-optional-workflow.md) を参照。

## Quick Decision

Codex CLI を使うかどうかは **完全に任意**。

- Codex を持っていない / インストールしていない → ChatGPT 手動 + Visual Register Inbox Review で MVP は完結する。
- Codex を持っている開発者 → 下記の3用途で補助的に使える。

## When Codex Helps

| 用途 | Codex の役割 | Visual Register / Claude Code との関係 |
| --- | --- | --- |
| A. Code Review | safety / destructive write / secret leak の二次チェック | Claude Code がメイン実装、Codex がレビュー |
| B. Image Candidate Generation | inbox に candidate 画像を保存 | Visual Register Inbox Review が承認・登録 |
| C. Image Revision | feedback を受けて prompt を直し、新 candidate を出す | 同上 |

## Phase Adoption

無理に全用途を一度に取り込まない。段階的に:

1. **Phase 1: Code Review のみ**（最も低リスク）
2. **Phase 2: Image Revision の prompt 推敲** （生成自体は ChatGPT、Codex は文章だけ）
3. **Phase 3: Codex で candidate 画像生成して inbox 保存**

Phase 3 まで進めても、Visual Register が承認・final adoption の **source of truth** であることは変わらない。

## Required Local State

Codex を使う前に確認:

- `tasks/visuals/<slug>/_inventory.md` と `_style-guide.md` が揃っている
- 対象 asset の brief（`tasks/visuals/<slug>/<asset-id>.md`）が存在する
- `assets/inbox/generated/<slug>/<visual-asset-slug>/` ディレクトリを作っておく（または作って良い権限がある）

## How To Use The Templates

### Code Review

1. Claude Code バッチが終わったら、`git status` / `git diff --stat` を確認。
2. [tasks/reviews/codex-code-review-template.md](../../tasks/reviews/codex-code-review-template.md) をコピーして fill。
3. Codex CLI に渡す。
4. 返ってきた Critical Issues / Warnings を Claude Code 側で対処。
5. 必要なら再度レビュー。
6. すべて OK になってから git commit / push。

### Image Candidate Generation

1. 対象 brief（`tasks/visuals/<slug>/<asset-id>.md`）を開く。
2. [tasks/visuals/_codex-image-generation-template.md](../../tasks/visuals/_codex-image-generation-template.md) をコピーして fill。
3. Codex CLI に渡す。
4. Codex が `assets/inbox/generated/<slug>/<visual-asset-slug>/v00X.png` に candidate を保存。
5. `npm run visual:register` で Visual Register を起動 / 再起動。
6. Inbox Review カードで candidate を確認。
7. `approve & register` で final 採用、または別 candidate を試す。

### Image Revision

1. Visual Register の Inbox Review で `reviewNotes` に修正点を書く（例: 「色を抑えて」「文字を小さく」）。
2. Codex に「現在の brief / 既存 prompt / review notes」を渡し、新 prompt を整形させる。
3. Codex が次の v00X を inbox に追加。
4. Visual Register で再判定。

## What This README Does NOT Do

- Codex CLI の install / 認証は扱わない（各開発者環境固有）。
- Codex を自動実行するスクリプトは入れない（local MVP の前提を壊さないため）。
- Codex が無い環境への代替挙動も扱わない（ChatGPT 手動 + Visual Register で OK）。

## Safety Reaffirmation

- Codex 経由でも paid API integration は禁止。
- Codex 経由でも direct Sanity write は禁止。
- Codex 経由でも auto-posting は禁止。
- Codex 経由でも `seed --replace` は禁止。
- Codex 経由でも `assets/visuals/...` の final path への直接書き込みは禁止。inbox 経由のみ。
- Codex 経由でも顔写真ワークフロー / 有料PDF教材本文のコピー / secret / 実 project ID のリークは禁止。

## Future

- Codex CLI を実際に使い始めた段階で、運用上のフィードバックを `docs/devlog/` に残す。
- 必要が出てきたタイミングで、薄いラッパースクリプトを `tools/codex-workflow/` に追加する選択肢を検討（ただし副作用ゼロの read-only から）。

## Related Docs

- [docs/44-codex-cli-optional-workflow.md](../../docs/44-codex-cli-optional-workflow.md)
- [docs/43-visual-register-inbox-review-workflow.md](../../docs/43-visual-register-inbox-review-workflow.md)
- [docs/42-diagram-plan-vs-visual-asset-plan-vs-publish-package.md](../../docs/42-diagram-plan-vs-visual-asset-plan-vs-publish-package.md)
- [tasks/visuals/_codex-image-generation-template.md](../../tasks/visuals/_codex-image-generation-template.md)
- [tasks/reviews/codex-code-review-template.md](../../tasks/reviews/codex-code-review-template.md)
- [assets/inbox/generated/README.md](../../assets/inbox/generated/README.md)
