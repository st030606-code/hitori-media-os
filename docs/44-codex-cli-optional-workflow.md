# Codex CLI Optional Workflow

Date: 2026-05-14

このドキュメントは **Codex CLI を Hitori Media OS のオプションの補助ツールとして使うときの運用設計** を定めます。

Codex CLI は **必須ではありません**。MVP は引き続き Codex なしでも完全に動作します。Codex を持っている開発者は、3つの限定された用途で活用できます。

## Important

- **Visual Register が承認・登録の source of truth**。Codex がどう動こうと、最終的な asset 採用は人間が Visual Register Inbox Review で行う。
- **Codex CLI はオプション**。MVP は Codex なしでもすべて動く（ChatGPT 画像生成 + Visual Register でも完結する）。
- **Claude Code がメインの実装エージェント**。Codex は補助。
- **production image を Codex が自動で final asset path に書き込まない**。inbox 経由を必須にする。
- **paid API integration / direct Sanity write / auto-posting / seed --replace は禁止**（既存方針を維持）。

## 3 Use Cases

### A. Code Review Assistant

大きめのClaude Code バッチが入った直後、commit / push の前に Codex に **safety review** を依頼する。

#### When To Run

- schema activations の直後（例: `substackXxx.ts` を `schemas/` へ移したとき）
- publish-package-builder への変更後
- Visual Register への変更後（特に新 API を増やしたとき）
- GitHub commit / push の前
- inbox / final asset path 周りに触ったあと

#### What Codex Should Check

- 破壊的なファイル書き込み（既存ファイルを silent overwrite していないか）
- `seed --replace` の混入
- direct Sanity write（`createClient` / `.patch(` / `.create(` / `SANITY_AUTH_TOKEN` など）
- `private/` 配下を読み込みコードパスに直結させていないか
- secrets / API キー / 実 project ID のリーク
- assets overwrite リスク（許可リストなしで全 platform を書き換えていないか）
- スキーマの reference 順序（`substackPostPlan` が `substackPublicationStrategy` より先に登録されていないか、など）
- build / local-check が落ちる変更を含んでいないか
- 顔写真 / 有料PDF教材本文のコピーがないか

#### Sample Prompt

```text
Review the current repo changes for safety, destructive file writes, secret leakage, schema registration mistakes, and local-first constraints. Do not edit files unless asked.
```

詳細テンプレートは [tasks/reviews/codex-code-review-template.md](../tasks/reviews/codex-code-review-template.md) を参照。

### B. Image Candidate Generation Assistant

ChatGPT 手動生成と並行して、Codex に candidate 画像を出させたいときに使う。

#### Flow

1. `visualAssetPlan` と brief（`tasks/visuals/<slug>/<asset-id>.md`）が存在する。
2. Claude Code が `tasks/visuals/_codex-image-generation-template.md` を fill して Codex に渡す。
3. Codex が candidate 画像を **inbox path** に保存する:
   - `assets/inbox/generated/<content-slug>/<visual-asset-slug>/v001.png`
   - `assets/inbox/generated/<content-slug>/<visual-asset-slug>/v002.png` ...
4. Visual Register Inbox Review が candidate を表示する。
5. 人間が approve / reject / needs-regeneration を選ぶ。
6. `approve & register` で `assets/visuals/...` に copy + patch JSON 作成。
7. Sanity Studio へ手動反映。

**Codex は final asset path に書き込まない**。inbox 経由のみ。

### C. Image Revision Assistant

人間が「もう少し色を抑えて」「文字を小さく」のようなフィードバックを出したとき、Codex がプロンプトを修正して revision candidate を再生成する。

#### Flow

1. 人間が `review.md` または Visual Register の `reviewNotes` にフィードバックを書く。
2. Claude Code が brief / review feedback / 既存 prompt を読み、新しい prompt を Codex 用に整形。
3. Codex が新 candidate を `v00X.png` として inbox に追加。
4. Visual Register Inbox Review で再度判定。

承認は引き続き Visual Register で人間が行う。Codex は **prompt → candidate** までしか触らない。

## Candidate Folder Convention

```text
assets/inbox/generated/<content-slug>/<visual-asset-slug>/
  v001.png
  v002.png
  v003.png
  prompt.md       ← 採用 prompt の最新版（Codex が生成 / 人間が編集）
  review.md       ← 人間が candidate ごとに書くレビュー注釈
```

- `<content-slug>` 例: `building-hitori-media-os`
- `<visual-asset-slug>` 例: `note-hero-v1`、`x-hook-main-v1`
- `v001.png` / `v002.png` ... の **連番命名**（最大 v0NN まで）
- `prompt.md` / `review.md` は markdown、任意追加。Visual Register manifest が主要 source。
- 採用された candidate は Visual Register の `approve & register` で final path へ copy される。`v002.png` を採用した、などのトレースは manifest と `review.md` に残す。

### Why sub-folders per asset

既存の Visual Register Inbox Review は `assets/inbox/generated/<content-slug>/` 直下 + サブフォルダの両方を再帰的に拾います。1 asset に対して複数 candidate（v001 〜 v003）を扱うときはサブフォルダで整理する方が UI / 人間の判断ともに楽。

## Templates

- [tasks/visuals/_codex-image-generation-template.md](../tasks/visuals/_codex-image-generation-template.md) — Codex に画像生成を依頼するテンプレ
- [tasks/reviews/codex-code-review-template.md](../tasks/reviews/codex-code-review-template.md) — Codex にコードレビューを依頼するテンプレ
- [tools/codex-workflow/README.md](../tools/codex-workflow/README.md) — Codex を使う場合の手順 README（実行スクリプトは含まない）

## What Codex Must NOT Do

- final asset path への直接書き込み（`assets/visuals/...` を bypass する形での adoption は禁止）
- Sanity dataset への直接書き込み（コード経由 / CLI 経由いずれも禁止）
- auto-posting / API投稿 / email送信
- `seed --replace` 実行
- `.env.local` / private / paid PDF / secret の commit
- 既存 publish-packages 配下のファイルを許可リスト外で書き換え

## Local-First Constraint

Codex CLI を使ったとしても、Hitori Media OS の方針は変わらない:

- 公開・投稿は手動
- Sanity 反映は手動
- 画像の最終採用は Visual Register Inbox Review 経由
- ChatGPT 画像生成と Codex 画像生成は並行可能（どちらも inbox に置く）
- Codex が利用できない環境でも、MVP は完全に動作する

## Adoption Order

1. **Phase 1**: Codex CLI を Code Review にだけ使う（最も低リスク）
2. **Phase 2**: Codex CLI を image revision の prompt 推敲に使う（生成自体は ChatGPT）
3. **Phase 3**: Codex CLI で candidate 画像生成し、inbox に置く（実画像生成）

Phase 3 までは「無くても困らない」状態を維持する。

## Safety Reaffirmation

- Codex CLI が無くても、Visual Register + ChatGPT 手動生成で MVP は完結する。
- Codex の出力はすべて **review-pendingな candidate** として扱う。
- 承認・final adoption は人間 + Visual Register が担う。
- 有料 API / 直接 Sanity write / auto-posting / `seed --replace` は Codex 経由でも禁止。

## Related Docs

- [docs/43-visual-register-inbox-review-workflow.md](43-visual-register-inbox-review-workflow.md)
- [docs/42-diagram-plan-vs-visual-asset-plan-vs-publish-package.md](42-diagram-plan-vs-visual-asset-plan-vs-publish-package.md)
- [tasks/visuals/<slug>/_inventory.md](../tasks/visuals/) — キャンペーン別 inventory
- [tasks/visuals/<slug>/_workflow.md](../tasks/visuals/) — キャンペーン別ワークフロー
- [assets/inbox/generated/README.md](../assets/inbox/generated/README.md) — inbox 規約
