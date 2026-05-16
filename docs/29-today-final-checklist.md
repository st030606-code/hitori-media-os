# Today Final Checklist

日付: 2026-05-14

今日、Phase 1 MVP release candidate として扱う前に、人間が確認する短いチェックリストです。

## Local Validation

- [ ] `npm run build` が通る。
- [ ] `node --check tools/visual-register/server.mjs` が通る。
- [ ] `node --check tools/visual-register/public/app.js` が通る。

## Launcher / Startup

- [ ] `launchers/start-mac.command` をダブルクリックできる。
- [ ] Sanity Studio が開く。
- [ ] Local Visual Register が開く。
- [ ] ユーザーが `npm run dev` を手入力しなくても開始できる。

## Visual Register

- [ ] 通常モードで visualAssetPlan が5件表示される。
- [ ] test seed modeで visualAssetPlan が8件表示される。
- [ ] test seed modeで `ai-blog-db` と `trail-training-3months` が表示される。
- [ ] Content Idea filter / grouping が表示される。
- [ ] Patch Review がpatch JSONを表示する。
- [ ] 既存ファイルがある場合、overwrite protection が働く。

## Sanity Studio

- [ ] `contentIdea.ai-blog-db` が表示される。
- [ ] `visualAssetPlan.ai-blog-db.note-hero-v1` が表示される。
- [ ] `expectedLocalAssetPath` が表示される。
- [ ] `localAssetPath` が現在の保存済み画像パスになっている。
- [ ] `status` が実態に合っている。
- [ ] `reviewNotes` が現在の確認状態に合っている。

## Repo Safety

- [ ] `.env.local` がコミット対象ではない。
- [ ] 実project ID、APIキー、トークン、シークレットがコミット対象ではない。
- [ ] Sanity direct write は実装されていない。
- [ ] auto-posting は実装されていない。
- [ ] image generation API は実装されていない。
- [ ] `seed --replace` をpartial updateに使っていない。

## Documentation

- [ ] READMEだけで現在のMVPの目的と使い方が分かる。
- [ ] `docs/24-phase-1-mvp-stabilization.md` がPhase 1の完成条件を説明している。
- [ ] `docs/25-phase-1-e2e-test-checklist.md` がE2E手順を説明している。
- [ ] `docs/26-phase-1-known-backlog.md` が先送り項目を整理している。
- [ ] `docs/27-demo-flow-ai-blog-db.md` がデモ手順を説明している。
- [ ] `docs/28-phase-1-release-candidate-check.md` がrelease candidate判定を説明している。
