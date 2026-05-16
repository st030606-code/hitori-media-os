# Devlog 0088: x-hook-main-v1 Generation Prep (next production visual)

Date: 2026-05-14

## 連番について

ユーザー指示の `0087-x-hook-main-v1-generation-prep.md` / `0098-x-hook-main-v1-generation-prep.md` は前バッチで Sanity Studio Content Idea-Centered Structure に使用済みのため、次の空き番号:

- `docs/devlog/0088-x-hook-main-v1-generation-prep.md`（本devlog）
- `docs/handoff/0099-x-hook-main-v1-generation-prep.md`

## 今日の判断

`note-hero-v1` の production visual サイクル（candidate 生成 → Visual Register approve & register → Sanity 手動反映 → publish-package 実配布）が完了したので、**次の P1 visual `x-hook-main-v1` の生成準備** に進む。

本バッチでは画像を生成しない。tone reference / 生成 prompt の準備、ワークフロー記録、次バッチへの引き渡しのみ。

## note-hero-v1 のサイクル完了状態（前バッチで完了）

- ✓ candidate: `assets/inbox/generated/building-hitori-media-os/note-hero-v1/v001.png`
- ✓ Visual Register `approve & register` 完了（manifest registered）
- ✓ master final asset: `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png`
- ✓ patch JSON: `patches/visual-assets/building-hitori-media-os/note-hero-v1.json`
- ✓ Sanity Studio: `visualAssetPlan.note-hero-v1` / `visualAssetPlan.substack-header-v1` 両方の `localAssetPath` / `status: saved` / `reviewNotes` 手動更新完了（human-confirmed 2026-05-14）
- ✓ publish-package 配布: `publish-packages/note/building-hitori-media-os/images/campaign-hero-v1.png` / `publish-packages/substack/building-hitori-media-os/images/campaign-hero-v1.png` 両方配布完了

`note-hero-v1` は完了。次は `x-hook-main-v1`。

## Next Target: x-hook-main-v1

### Asset Metadata

- visualAssetPlanId: `visualAssetPlan.building-hitori-media-os.x-hook-main-v1`
- targetPlatform: X (formerly Twitter)
- assetType: `hook-image`
- aspectRatio: `16:9`
- pixelSize: `1200 x 675`
- reusePolicy: `variant-required`
- brief: [tasks/visuals/building-hitori-media-os/x-hook-main-v1.md](../tasks/visuals/building-hitori-media-os/x-hook-main-v1.md)
- priority: P1

### Paths

| 用途 | パス |
| --- | --- |
| candidate inbox | `assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/v001.png` |
| final expected | `assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png` |
| patch JSON (post-approve) | `patches/visual-assets/building-hitori-media-os/x-hook-main-v1.json` |
| publish-package dest | `publish-packages/x/building-hitori-media-os/images/x-hook-main-v1.png` |

candidate は `v001 / v002 / v003 ...` の連番、上書き禁止。

### Tone Reference

**`assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png`** を tone reference として使う。次を揃える:

- base color（白〜薄オフホワイト背景）
- accent color（控えめなウォーム色 1 色のみ）
- font family（sans-serif、Noto Sans JP / Inter / IBM Plex 系）
- node 形状（丸角矩形）
- 余白の感覚

X 用は note-hero よりも:
- 文字量を 1 割減らす（preview crop 耐性を最優先）
- 装飾を 1 段階控えめに
- 中央 70% に重要要素を集中

### Why This Asset Is Next (P1)

- X main post に添える hook 画像。スクロール中の 1 秒で `発信を頑張るより、発信が回る仕組みを作る` を伝える。
- X / Substack の最低限の公開準備で必要な 3 枚目（master hero と x-hook で 2 master 完成）。
- note-hero 採用後、トーン基準が確定したので、x-hook を作るのが最も自然な順序。

## Workflow (next human cycle)

1. **生成**: ChatGPT or Codex で candidate 画像を生成（[brief](../tasks/visuals/building-hitori-media-os/x-hook-main-v1.md) の "Generation Prompt (paste-ready)" を使用）。
2. **inbox 保存**: `assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/v001.png` に保存（必要なら `mkdir -p`）。
3. **Visual Register 起動**: 旧プロセス停止 `lsof -ti :3334 | xargs kill` → `npm run visual:register`。
4. **Inbox Review で確認**: Content Slug filter = `building-hitori-media-os`、`x-hook-main-v1` の candidate を確認。Plan auto-suggest が `visualAssetPlan.building-hitori-media-os.x-hook-main-v1` であることを確認。
5. **approve & register**: 採用 candidate を選んでクリック。`assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png` へ copy + patch JSON 作成。
6. **Patch Review で確認**: `x-hook-main-v1.json` の内容を確認。
7. **Sanity Studio 手動反映**: `visualAssetPlan.building-hitori-media-os.x-hook-main-v1` の `localAssetPath` / `status: saved` / `reviewNotes` を Studio で手動入力。**Note**: `substack-header-v1` のような master 共有は無いので、Sanity 更新は 1 件のみ。
8. **publish-package 配布**: `npm run publish:package -- building-hitori-media-os --dry-run` で計画確認 → flag なしで実配布。`publish-packages/x/building-hitori-media-os/images/x-hook-main-v1.png` が出ることを確認。

## Review Criteria

- coreThesis「発信を頑張るより、発信が回る仕組みを作る」が中心にある
- preview crop（特に 16:9 / 1.91:1）で文字が読める
- note-hero とトーンが一貫している（base / accent / font）
- note-hero よりも装飾控えめ・文字量少なめ
- 完成品の宣伝感がない
- secret / 実 project ID / private/ パスが映っていない
- 顔写真 / AI generated avatar なし
- 有料 PDF 教材本文の引用なし

## Safety

- 候補は inbox にのみ保存。final path 直接書き込み禁止。
- approve & register まで `assets/visuals/.../x-hook-main-v1.png` には何も置かれない。
- Sanity 反映は手動。direct write しない。
- auto-posting / paid API / `seed --replace` / 顔写真 / 有料 PDF 引用 禁止。
- 既存 ai-blog-db / private/ 触らない。

## CodexとClaude Codeの役割分担

- 人間: ChatGPT or Codex で candidate 生成 → inbox 保存 → Visual Register approve → Sanity 反映。
- Claude Code（本バッチ）: docs 整備、release-review checklist 更新、validation。
- Codex（任意）: candidate 生成（Phase 3）、prompt 推敲（Phase 2）、コードレビュー（Phase 1）。

## 検証

- `npm run publish:package -- building-hitori-media-os` 実行 → `publish-packages/{note,substack}/building-hitori-media-os/images/campaign-hero-v1.png` 配置完了（master 共有が想定通り動作）
- `npm run publish:package -- building-hitori-media-os --dry-run` → hero は `skipped`（既存）、x-hook / threads / inline 各画像は引き続き `todos`（未生成、想定通り）
- `npm run local:check` → `ok: true`（全 15 チェック green）
- `npm run build`（sanity build）→ 8.2s で成功
- direct Sanity write の grep → 0 hits（不変）
- 本バッチで Claude Code は画像生成・Sanity 書き込み・既存スキーマ変更を行っていない

## 次にテストすること

1. 人間が ChatGPT or Codex で `x-hook-main-v1` の candidate を生成（brief の Generation Prompt をそのまま貼り付け）。
2. inbox v001.png に保存。
3. Visual Register Inbox Review で承認 → 最終 path へ copy + patch JSON。
4. Sanity Studio で `visualAssetPlan.x-hook-main-v1` を手動更新。
5. publish-package 実配布。
6. 反応次第で次の P2 visual（`threads-support-diagram-v1` か `note-inline-content-os-flow-v1`）へ進む。
