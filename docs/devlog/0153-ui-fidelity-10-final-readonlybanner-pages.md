# Devlog 0153 — Phase UI-fidelity-10 Final ReadOnlyBanner pages implementation

日付: 2026-05-20

## 背景

docs/80 / handoff/0163 で確定した spec を実装する batch。`/campaigns` list / `/human-review-gates` / `/publish-package/[slug]` の 3 page から最後の `<ReadOnlyBanner />` 利用を除去し、Phase UI-fidelity-1〜9 と同じ design tone に揃える。実装後は `ReadOnlyBanner` import が component 本体 1 件のみに減り、follow-up microbatch で `rm` 可能になる。

boss 確認済 scope:
- /human-review-gates rename: 「確認待ちゲート」
- /campaigns Actions: P1 delay
- bucket order: pending-review → in-progress → blocked → not-started
- /publish-package/[slug]: surgical edit only (ReadOnlyBanner import + 2 calls 削除のみ、他は完全 untouched)
- GateBucketSection: inline (extraction なし)
- Implementation order: Option A (/campaigns pilot)
- shadcn 追加なし、native HTML + Tailwind のみ

## 決定・変更

### 更新 (3 page)

| File | 変更 |
|---|---|
| `dashboard/src/app/campaigns/page.tsx` | Breadcrumb 追加 + KpiCardsRow (4 KpiCard) 追加 + ReadOnlyBanner 削除 / 既存 CampaignRow / table / progressOf() helper は全て untouched / empty state を `border-dashed bg-slate-50` に微改善 |
| `dashboard/src/app/human-review-gates/page.tsx` | 完全 fidelity 再構成: max-w-6xl py-8 → max-w-[1280px] py-6 / 古い `<header>` + h1 を PageHeader + Breadcrumb に置換 / 「Human Review Gates」 → 「確認待ちゲート」 / KpiCardsRow (4 KpiCard with `LucideIcon` icons) 追加 / bucket 並び順を `BUCKETS` 配列で明示 / 各 bucket section は inline `<header>` + h2 + count chip + line-clamp-2 notes + `<details>` で長文展開 / empty state for all-zero / ReadOnlyBanner 削除 |
| `dashboard/src/app/publish-package/[slug]/page.tsx` | surgical edit 3 行のみ: `import` 削除 + disabled branch (`page.tsx:42` 該当箇所) の `<ReadOnlyBanner />` 削除 + main branch (`page.tsx:64` 該当箇所) の `<ReadOnlyBanner />` 削除 / **それ以外は完全 untouched** (740 行の copy-friendly UI 保護) |

### データ取得ロジック (touch なし)

- `campaignListQuery` / `pendingHumanReviewGatesQuery` / `readPublishPackage` / `publishPackageStateBySlugQuery` すべて unchanged
- `flatten()` / `formatDate()` (human-review-gates helper) — unchanged

### ReadOnlyBanner imports

Before: 5 active imports/calls (3 page で計 7 行)
After: **0 import/call**、`ReadOnlyBanner.tsx` 本体のみ残置 (削除候補)

### follow-up cleanup

`grep "ReadOnlyBanner" dashboard/src` で確認 → `dashboard/src/components/ReadOnlyBanner.tsx` 本体のみがヒット。follow-up microbatch で `rm` し、Hitori Media OS UI fidelity cycle の dead-code cleanup chain が完全終了する。

## 理由

- **`/campaigns` の touch を最小に**: 既に大半 fidelity 整合済 (PageHeader / max-w-[1280px] / table)、Breadcrumb + KpiCardsRow + ReadOnlyBanner 削除のみ
- **`/human-review-gates` を完全再構成**: 最も outdated だった (英語 title / max-w-6xl / `<header>` + h1 / py-8)、PageHeader + Breadcrumb + 日本語 + 4 KpiCard + bucket sections の design tone 整合
- **`/publish-package/[slug]` は surgical edit 厳守**: 740 行の boss workflow に密接最適化済、layout 変更のリスクを取らない (Topbar の `<ReadOnlyPill />` が ReadOnlyBanner の代替)
- **`BUCKETS` 配列で並び順を明示**: spec で確定した順 (`pending-review → in-progress → blocked → not-started`) を data 構造で表現、KpiCardsRow と section 群が同じ順序で render される
- **bucket section の `<details>` 採用**: 長文 notes (>160 chars) は collapsible にして縦スクロール削減、短い notes は line-clamp-2 のままで済む
- **`GateBucketSection` extraction なし (YAGNI)**: 4 bucket 同 pattern だが page 内 inline で 1 file 完結、共通化は再利用ニーズが出るまで保留
- **`/campaigns` empty state を `bg-slate-50` に**: Visual Review list page と tone 揃え

## 影響

- **23 routes 動作維持**、dashboard TypeScript clean、Sanity Studio 7.7s clean
- **3 page が fidelity 化済** → Hitori Media OS の **全 23 routes が fidelity 完了**
- `ReadOnlyBanner` import 数 = **0** (component 本体 1 ファイルのみ残置)
- `/publish-package/[slug]` の copy-friendly behavior + publish package parsing は完全保護
- Sanity 書き込みなし / schema 変更なし / 依存追加なし / publish-package files 不変 / assets-visuals 不変 / patches 不変 / deploy なし

## 次の一手

1. **boss が `cd dashboard && npm run dev` で 3 page 実機確認**:
   - `/campaigns` → 4 KpiCard + Breadcrumb、既存 table 動作維持
   - `/human-review-gates` → PageHeader + 4 KpiCard + 4 bucket section (各 line-clamp-2 + details collapsible)
   - `/publish-package/building-hitori-media-os` → 既存 copy-friendly UI が完全保持されている (CopyButton 動作 / 各 platform Section)
2. 問題なければ **follow-up microbatch で `dashboard/src/components/ReadOnlyBanner.tsx` を `rm`** → Hitori Media OS UI fidelity cycle 完全終了
3. その後の選択肢:
   - dashboard/README.md 全体書き直し (Phase UI-fidelity-1〜10 反映)
   - Phase Admin 1 Batch A/B/C 時代 component audit (CampaignStatusCard / NextActionSummary 等)
   - Phase 2B 議論 (実 write actions)
   - 外部 analytics API integration

## 発信ネタ候補

- 「3 page を 3 つの touch 深度で 1 batch」: 軽い追加 (`/campaigns`) / 完全再構成 (`/human-review-gates`) / surgical edit (`/publish-package/[slug]`) を 1 PR で扱う設計判断
- 「`ReadOnlyBanner` を消すために 10 batch」: Phase UI-fidelity-1〜10 を経て、最後の no-op component を削除可能な状態にする cleanup chain の話
- 「`<details>` で長文 notes を畳む」: line-clamp-2 と組み合わせた、長短両対応の compact 表示パターン
