# Devlog 0154 — ReadOnlyBanner final delete

日付: 2026-05-20

## 背景

Phase UI-fidelity-10 で `/campaigns` / `/human-review-gates` / `/publish-package/[slug]` から `<ReadOnlyBanner />` の import + 呼び出しをすべて除去 (handoff/0164 §4-2 で grep 0 を確認済)。残るは component 本体 1 ファイルのみ、本 microbatch で `rm` する。

**Hitori Media OS UI fidelity cycle (Phase UI-1 → UI-fidelity-10 + 全 cleanup microbatch) の最後の dead-code 削除**。

## 決定・変更

### 削除 (1)

| File | grep 結果 (削除前) | 削除可否 |
|---|---|---|
| `dashboard/src/components/ReadOnlyBanner.tsx` | self only (definition 1 行)、page import 0、page call 0 | ✓ 削除 |

### 削除前後の grep 結果

**削除前**:
```bash
$ grep -rn "ReadOnlyBanner" dashboard/src
dashboard/src/components/ReadOnlyBanner.tsx:9:export function ReadOnlyBanner() {
```
= 1 行 (component 本体のみ)

**削除後**:
```bash
$ grep -rn "ReadOnlyBanner" dashboard/src
(grep finished)
```
= **0 行**

### 編集 (0)

active file は **完全に touch なし**。本 microbatch は `rm` 1 件のみ。

## 理由

- **handoff/0164 で import 0 を確認済**: Phase UI-fidelity-10 が完了した時点で page-level 利用がすべて削除済、follow-up microbatch で `rm` するのは安全
- **本体 `return null` だった**: 旧 ReadOnlyBanner は Phase UI-2.5 以降は no-op になっていた (Topbar の `<ReadOnlyPill />` が同役割)。実際の runtime 効果はゼロ
- **bundle 影響**: Phase UI-fidelity-10 完了時点で tree-shake 済 → 本 microbatch の bundle 削減はゼロ、ファイルシステムの clarity のみ向上
- **編集なし、`rm` のみ**: シンプルに 1 件削除、コメント / 文書編集は無し

## 影響

- `dashboard/src/components/` から 1 ファイル削除
- 23 routes 動作維持、dashboard TypeScript clean、Sanity Studio 7.9s clean
- bundle / build 出力に変化なし (元から tree-shake 済み)
- **Hitori Media OS UI fidelity cycle の dead-code cleanup chain が完全終了**

## UI fidelity cycle 完了サマリ

Phase UI-1 (2026-05-) から本日 2026-05-20 まで、10 Phase + 各 cleanup microbatch を経て:

| Phase | 内容 | 状態 |
|---|---|---|
| UI-1 | AppShell / Sidebar / Topbar / NAV (旧 AppNav 廃止) | ✓ |
| UI-2 / UI-2.5 | Dashboard redesign + fidelity pass | ✓ |
| UI-fidelity-1 | /campaigns/[slug] (Tabs / PublishReadinessScore 等) | ✓ |
| UI-fidelity-2 | /outputs (FilterBar / Table / Breakdown) | ✓ |
| UI-fidelity-3 | Dashboard polish | ✓ |
| UI-fidelity-4 | /publish (9 components, hand-roll Dropdown) | ✓ |
| UI-fidelity-5 | /configurator (11 components, prompt copy preview) | ✓ |
| UI-fidelity-6 | /visual-assets/* P0 (3 routes, candidate focus layout) | ✓ |
| UI-fidelity-7 | /visual-assets/* P1 (Rubric / Notes / Prompt summary) | ✓ |
| UI-fidelity-8 | /publish-packages / /activity-log / /diagnostics | ✓ |
| UI-fidelity-9 | /knowledge / /analytics / /settings (Sidebar 9 nav items 完成) | ✓ |
| UI-fidelity-10 | /campaigns list / /human-review-gates / /publish-package surgical edit | ✓ |
| Cleanup microbatch (本 batch) | ReadOnlyBanner.tsx 最終削除 | ✓ |

**結果**: Hitori Media OS の 23 routes 全てが Phase UI-fidelity tone に揃い、cleanup chain (SummaryCard / SectionHeader / EmptyState / FilePathBlock / VisualAssetHeader / CandidateGrid / CandidateCard / CandidatePreview / CandidateStatusBadge / AppNav / EmptyCandidateState / NavFlags / getNavFlags / ReadOnlyBanner) も完了。

## 次の一手

1. **boss が `cd dashboard && npm run dev` で 23 routes 巡回確認**:
   - `/` `/campaigns` `/campaigns/building-hitori-media-os` `/human-review-gates` `/publish-package/building-hitori-media-os`
   - `/configurator` `/outputs` `/publish` `/visual-assets` `/visual-assets/[assetId]` `/visual-assets/[assetId]/candidates`
   - `/knowledge` `/analytics` `/settings`
   - 他 dev-only: `/publish-packages` `/activity-log` `/diagnostics`
2. 完了後の選択肢:
   - **Codex code review** (boss 言及の next step): branch / 全 fidelity batch を 1 度 Codex CLI に review してもらう。Phase Admin 1 で boss が一度試みた pattern、UI-fidelity 一巡を機に独立 reviewer の目を入れる
   - dashboard/README.md 全体書き直し (Phase UI-fidelity-1〜10 反映)
   - Phase Admin 1 Batch A/B/C 時代 component audit (CampaignStatusCard / NextActionSummary 等)
   - Phase 2B 議論 (実 write actions)

## 発信ネタ候補

- 「UI fidelity cycle 完了の話」: 10 Phase + 多数の cleanup microbatch を経て、main UI surface + 全 dead code が揃った
- 「`return null` component を消すまでの 10 batch」: Phase UI-2.5 以降 no-op だった ReadOnlyBanner が、最終的に消えるまでの cleanup chain の長さ
- 「実装 batch と削除 batch を分離する習慣」: 1 PR で「import 削除」、別 PR で「ファイル削除」の 2 段にすることで、diff の review 範囲を明確にする設計
