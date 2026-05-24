# Devlog 0159 — /campaigns/[slug] deep refactor fidelity spec

日付: 2026-05-20

## 背景

Phase Admin 1 legacy component audit (handoff/0168) + A バケット 4 件削除 (handoff/0169) 完了後、残る B バケット 7 件 + C バケット 1 件はすべて `/campaigns/[slug]` 周辺に集中していると判明。Phase UI-fidelity-1 (handoff/0145) で detail page を **新 component を add しつつ旧 component を並存** させた conservative approach の結果、legacy が 8 件残った。

本 batch は Phase UI-fidelity-11 (実装) の前提を確定する **audit + spec docs only** batch。実装 batch + follow-up cleanup microbatch の 2 段で、Phase Admin 1 時代の legacy component を完全終了させる cleanup chain を確定。

加えて `ReleaseReviewLinks.tsx` の hardcoded `building-hitori-media-os` (B1 fixes で見逃した最後の hardcoding 箇所) も本 spec の対象に含めた。

## 決定・変更

### 新規 docs (4)

- `docs/81-campaign-detail-deep-refactor-spec.md` (本 spec) — 419 行の audit / 8 component の replacement strategy / P0/P1/P2 / cleanup chain / boss decision points / post-state
- `docs/devlog/0159-campaign-detail-deep-refactor-spec.md` (本ファイル)
- `docs/handoff/0170-campaign-detail-deep-refactor-spec.md`
- `docs/handoff/latest.md` (mirror)

### コード変更

**なし**。runtime / schema / publish-package / assets/visuals / patches / package.json / deploy はいずれも touch なし。

### spec の要旨

1. **/campaigns/[slug] line-by-line audit** (docs/81 §1):
   - 9 tabs のうち 6 tabs が legacy component を直接 render
   - 1 tab (公開状況 詳細) が PublishingScheduleTable と **完全重複** → drop 推奨
   - Right column の `ReleaseReviewLinks` は hardcoded slug を含む B1 fixes 残し
2. **replacement strategy** (docs/81 §3):
   - 7 legacy component すべてに対し inline page-local 関数を提案、sample code 付き
   - `ManualPublishingStatusList` は tab 自体を drop (重複)
   - `NextActionSummary` の `computeNextActions` helper を `lib/campaign/nextActions.ts` に extract
3. **Home (`/page.tsx`) から `ReleaseReviewLinks` 完全削除**: 代替は不要 (PageHeader CTA で機能カバー済)
4. **cleanup chain**: Phase UI-fidelity-11 land 直後の follow-up microbatch で 8 ファイル一括 `rm`
5. **boss decision points** 6 件: 重複 tab 削除 / Home 削除 / Tabs 統合 / helper 位置 / 5-file list 固定方針 / batch 分割

## 理由

- **deep refactor を独立 batch に**: Phase UI-fidelity-1 で「並存」を選んだ trade-off の清算。1 PR で 419 行 page + 8 legacy 削除前提の全置換を扱う中規模 batch
- **重複 tab drop**: 公開状況 (詳細) は main の PublishingScheduleTable と同じ data source / 同じ render 性質、tab に分離する価値がない → 削除で boss 認知負荷削減
- **`ReleaseReviewLinks` を本 spec で扱う**: hardcoded `building-hitori-media-os` を B1 fixes で見逃していた、本 spec で page-local 化することで Home + detail の両方で hardcoding を排除
- **`computeNextActions` の lib extract**: component file から helper を切り出すと、component file 自体を削除可能 + helper の役割が「camp data 集計関数」と明示できる
- **page-local function in 1 file**: 7 件の置換を「新規 component file」ではなく「page-local 関数」にする方が、`/campaigns/[slug]` のドメイン専用 logic を 1 ファイル内に集約できる (小さい re-use 需要が出るまで component 化しない、YAGNI)
- **shadcn 全 NO 継続**: Phase UI-fidelity-1〜10 と同方針
- **8 ファイル一括削除を follow-up microbatch に**: 実装 batch で「import 削除」、microbatch で「ファイル削除」の 2-stage cleanup chain、Phase UI-fidelity-7〜10 と同 pattern

## 影響

- code 変更ゼロ、23 routes 動作維持、build 不変
- Phase UI-fidelity-11 実装 batch + follow-up microbatch の前提が確定
- 実装完了後、Phase Admin 1 Batch A/B/C 時代 legacy component が **完全終了**
- Home から `ReleaseReviewLinks` の hardcoded `building-hitori-media-os` 完全排除 (B1 fixes 補完)

## 次の一手

1. **boss が docs/81 を読む**:
   - §1 audit に違和感ないか
   - §3 replacement strategy の各 sample code が tone consistency と合っているか
   - §7 boss decision points 6 件を回答
2. boss OK → Phase UI-fidelity-11 (`/campaigns/[slug]` deep refactor) 着手
3. 実装 batch 完了 → follow-up cleanup microbatch で 8 ファイル `rm`
4. 後続:
   - dashboard/README.md 全体書き直し (Phase UI-fidelity-1〜11 完了反映)
   - Phase 2B 議論 (実 write actions)

## 発信ネタ候補

- 「並存 → 整理 → 削除の 3-stage で legacy を消す」: Phase UI-fidelity-1 で「新 component を add」を選んだ trade-off と、その精算としての deep refactor batch の話
- 「page-local function で小さく start」: 共通化を先延ばしすることで page-domain の logic を ferry できる、YAGNI 実践
- 「ReleaseReviewLinks の hardcoded slug を最後に発見」: B1 fixes で page.tsx + publish/page.tsx を直したが、component file 内の hardcoding は別 audit で見つけた話
