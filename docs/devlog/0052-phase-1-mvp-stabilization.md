# Devlog 0052: Phase 1 MVP stabilization

Date: 2026-05-14

## 今日の判断

機能追加をいったん止め、Phase 1 MVP stabilizationへ移行しました。

現在のMVPは、Sanity Studio、seed data、Mac launcher、Local Visual Register、Patch Reviewを使ったlocal-first workflowです。

## 確認した状態

- Sanity schemas exist.
- Seed data exists.
- Mac launcher exists.
- Visual Register exists.
- Visual Register supports:
  - manual image registration
  - `expectedLocalAssetPath`
  - `localAssetPath`
  - overwrite protection
  - Patch Review
  - Content Idea display
  - Content Idea filter / grouping
  - test seed mode
- Patch Review is read-only.
- Sanity direct write is intentionally not implemented.
- API image generation is intentionally not implemented.
- Auto-posting is intentionally not implemented.

## 作成したdocs

- `docs/24-phase-1-mvp-stabilization.md`
- `docs/25-phase-1-e2e-test-checklist.md`
- `docs/26-phase-1-known-backlog.md`
- `docs/27-demo-flow-ai-blog-db.md`

## README更新

READMEにPhase 1 local-first MVPとしての使い方を追加しました。

追加した内容:

- current status
- `.env.local` setup
- Mac launcher
- Local Visual Register
- test seed mode
- seed document creation
- `seed --replace` warning
- image registration flow
- Patch Review / manual Studio update
- stabilization docs

## なぜこの設計にしたか

Visual Register周辺は、必要な安全機能が一通り揃いました。

ここでさらにplatform filterやdirect writeへ進むより、まずE2Eで安定して再現できるか確認する方が重要です。

Phase 1では「APIなしで、人間が安全に確認しながら運用できる」ことが価値です。

## 次に確認すること

`docs/25-phase-1-e2e-test-checklist.md` に沿って、Mac launcherからStudio、Visual Register、Patch Review、manual Studio updateまで通しで確認します。

## 発信ネタになりそうな切り口

- 「AIツール開発は、機能追加より安定化フェーズが大事」
- 「自動化前に、人間が安全に回せるE2Eを固める」
- 「local-first MVPで、Sanityとローカル画像管理をつなぐ」
