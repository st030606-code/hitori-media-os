# Handoff: Final ReadOnlyBanner Pages Fidelity Spec (docs only)

Date: 2026-05-20

## 1. Task Goal

`/campaigns` (list) / `/human-review-gates` / `/publish-package/[slug]` の 3 page を fidelity 化し、最後の `<ReadOnlyBanner />` import を除去する **audit + docs only** batch。実装後の follow-up microbatch で `ReadOnlyBanner.tsx` を削除でき、Hitori Media OS UI fidelity cycle が完全終了する。

コード変更ゼロ。

## 2. Constraints Followed

- ✅ Docs only、runtime code 変更なし
- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ publish-package files 不変
- ✅ assets/visuals / patches 不変
- ✅ deploy なし
- ✅ package 追加なし
- ✅ 23 routes 動作維持 (build 不変)
- ✅ `/publish-package/[slug]` v0.2 copy-friendly behavior 保護 (boss 指示で touch なし)
- ✅ Phase UI-fidelity-1〜9 で fidelity 化済 page も unchanged

## 3. Changed Files

### 新規 docs (4)

- `docs/80-final-readonlybanner-pages-fidelity-spec.md`
- `docs/devlog/0152-final-readonlybanner-pages-fidelity-spec.md`
- `docs/handoff/0163-final-readonlybanner-pages-fidelity-spec.md` (本ファイル)
- `docs/handoff/latest.md` (mirror)

### コード変更 (なし)

dashboard / Sanity Studio / tools / schemas いずれも touch なし。

## 4. Summary of Changes

### 4-1. Routes audited (3)

| Route | 行数 | 現状の fidelity 整合度 |
|---|---|---|
| `/campaigns/page.tsx` | 143 行 | **大半整合** (PageHeader 採用、max-w-[1280px]、StatusBadge / PlatformBadge / table 構造)。残不足: Breadcrumb / KpiCardsRow / ReadOnlyBanner |
| `/human-review-gates/page.tsx` | 134 行 | **最も outdated** (英語 title / `<header>` + h1 / max-w-6xl py-8 / SectionHeader-style inline header) |
| `/publish-package/[slug]/page.tsx` | 740 行 | **boss 指示で touch なし** (copy-friendly worker UI、layout 変更のリスク回避) |

### 4-2. ReadOnlyBanner imports identified

```
grep -n "ReadOnlyBanner" /campaigns/page.tsx
  → page.tsx:5 (import) + page.tsx:22 (call)        計 2 行
grep -n "ReadOnlyBanner" /human-review-gates/page.tsx
  → page.tsx:8 (import) + page.tsx:68 (call)        計 2 行
grep -n "ReadOnlyBanner" /publish-package/[slug]/page.tsx
  → page.tsx:4 (import) + page.tsx:42 (call) + page.tsx:64 (call)  計 3 行
```

合計 **5 active references** (1 import × 3 + 計 4 呼び出し)、これを Phase UI-fidelity-10 ですべて削除 → ReadOnlyBanner.tsx 削除前提が整う。

### 4-3. Specs created

`docs/80-final-readonlybanner-pages-fidelity-spec.md` の構成:

- **A. /campaigns list** — current 評価 / data sources / ReadOnlyBanner usage / target (Breadcrumb + 4 KpiCard 追加のみ) / P0-P2
- **B. /human-review-gates** — current / data sources / target (PageHeader + 日本語 rename + max-w-[1280px] + 4 KpiCard + inline `<header>` per bucket + line-clamp) / P0-P2
- **C. /publish-package/[slug]** — current (740 行) / surgical edit のみ (3 行) / 「触らない」原則の justification / P0-P2
- **D. Cleanup chain** — 実装 → grep 確認 → follow-up microbatch で `rm` の 3-stage 連鎖を明文化
- **E. Implementation order** — Option A (`/campaigns` pilot、推奨) / Option B (`/publish-package` 先)
- **F. Constraints** — `/publish-package/[slug]` の copy-friendly behavior 保護を含む
- **G. Boss decision points** — 6 件 (rename / Actions / bucket 並び / Breadcrumb / GateBucketSection / KpiCard 構成)
- **H. Out of scope** — schema 変更 / publish-package parsing / gate write actions / ReadOnlyBanner 本体削除
- **I. Post-implementation state** — fidelity cycle 完全終了の post-state

### 4-4. P0 / P1 / P2 scope (per page)

| Page | P0 | P1 | P2 |
|---|---|---|---|
| `/campaigns` | Breadcrumb / 4 KpiCard / ReadOnlyBanner 削除 | search / sort / Studio link | bulk action |
| `/human-review-gates` | PageHeader / max-w / 4 KpiCard / 日本語 rename / inline header / line-clamp / ReadOnlyBanner 削除 | filter / sort / GateBucketSection 共通化 | gate state write |
| `/publish-package/[slug]` | ReadOnlyBanner import + 2 呼び出し削除のみ (3 行変更) | なし (boss 指示で touch なし) | Phase 2B 議論 |

### 4-5. Cleanup chain

```
Phase UI-fidelity-10 (実装 batch)
  └─ /campaigns / /human-review-gates / /publish-package/[slug] から
     ReadOnlyBanner import と呼び出しをすべて削除
  └─ grep "ReadOnlyBanner" dashboard/src → 0 lines

Follow-up microbatch
  └─ dashboard/src/components/ReadOnlyBanner.tsx を rm
  └─ Hitori Media OS UI fidelity cycle 完全終了
```

実装 batch + cleanup microbatch の **2 段**で `ReadOnlyBanner` 系の cleanup chain が完結。

### 4-6. Build validation

```
cd dashboard && npm run build  → ✓ 23 routes (unchanged、コード差分なし)
npm run build (Sanity Studio)  → ✓ Build Sanity Studio (unchanged)
```

両 build とも前 batch (handoff/0162) 完了時から不変。

## 5. Key Decisions

- **3 page を 3 つの touch 深度で扱う**:
  - `/campaigns`: 軽い追加 (Breadcrumb + KpiCardsRow + ReadOnlyBanner 削除)
  - `/human-review-gates`: 完全再構成 (古い `<header>` から PageHeader へ、英語から日本語へ)
  - `/publish-package/[slug]`: surgical edit のみ (3 行)、boss workflow 保護
- **1 batch でまとめる**: 3 page から ReadOnlyBanner import をすべて除去するのが目的、1 PR で完結する方が follow-up microbatch との接続が単純
- **`/publish-package/[slug]` の touch なし方針**: 740 行の boss-optimized UI、layout 変更のリスクと ROI が見合わない。Topbar ReadOnlyPill が ReadOnlyBanner の代替として既に動作中
- **`/human-review-gates` の日本語 rename**: 他 Sidebar nav items がすべて日本語なので、English のままは不揃い。「確認待ちゲート」を提案、boss confirmation pending
- **Implementation order の Option A**: `/campaigns` pilot (大半整合、3 アイテム追加のみ)、続いて `/human-review-gates` (完全再構成)、最後 `/publish-package/[slug]` (surgical edit、3 行のみ)
- **cleanup chain を spec に明文化**: 実装 batch と follow-up microbatch の 2-stage 構造を spec docs に書いて、microbatch 間の前提を共有
- **shadcn 全 NO 継続**: Phase UI-fidelity-1〜9 と同方針

## 6. Human Review Questions

1. **`/human-review-gates` rename**: 「Human Review Gates」 → 「確認待ちゲート」 / 「レビューゲート」 / 「人間レビュー」のどれが好み?
2. **`/campaigns` Actions**: 「新規キャンペーン (Studio)」external link を P0 で含めるか?
3. **`/human-review-gates` bucket 並び**: pending-review → in-progress → blocked → not-started で OK か?
4. **`/publish-package/[slug]` Breadcrumb**: 触らない方針を厳格に守る (推奨) か、surgical edit に Breadcrumb 1 行も含めるか?
5. **GateBucketSection の component 抽出**: inline (推奨、YAGNI) か、`dashboard/src/components/human-review-gates/GateBucketSection.tsx` に抽出するか?
6. **`/campaigns` の KpiCard 4 件構成**: 「全キャンペーン / active / 公開済み / レビュー待ち」で boss 視点と合致するか?
7. **Implementation order**: Option A (`/campaigns` pilot、推奨) で OK か、Option B (`/publish-package` 先) か?

## 7. Risks or Uncertainties

- **`/publish-package/[slug]` の 2 ブランチ**: enabled / disabled の両方に `<ReadOnlyBanner />` が入っている。1 ブランチだけ削除して他方を忘れる risk → spec で「3 行削除」と明示することで対処
- **`/campaigns` の KpiCard 4 件**: 現状の `campaignListQuery` には `pendingGatesCount` フィールドが既にあるため、別 query を立てる必要なし
- **`/human-review-gates` の dataset 偏り**: 現状 4 bucket のうち pending-review が多い、blocked / not-started は少ない → KpiCard が「0 件」表示になる場合、 dataset が増えてからの確認推奨
- **`/publish-package/[slug]` の `max-w-5xl` 維持**: 他 fidelity page は `max-w-[1280px]` だが、この page は boss workflow に最適化された幅 → 維持判断、boss feedback で再調整
- **`<ReadOnlyBanner />` 本体削除のタイミング**: 本 spec の対象は import 削除まで、本体削除は follow-up microbatch (handoff §8 で明文化)

## 8. Next Recommended Step

1. **boss が docs/80 を読む**:
   - §A / B / C で各 page の target structure に違和感ないか
   - §G boss decision points 6 件を回答
   - §E implementation order の Option A (推奨) で進めるか
2. boss OK → **Phase UI-fidelity-10 (Final ReadOnlyBanner pages implementation)** 着手 (§9 exact prompt 同梱)
3. 実装完了 → **follow-up microbatch で `ReadOnlyBanner.tsx` を `rm`** → Hitori Media OS UI fidelity cycle 完全終了
4. 並行 / 後続候補:
   - dashboard/README.md 全体書き直し
   - Phase Admin 1 Batch A/B/C 時代 component audit
   - Phase 2B 議論 (実 write actions)
   - 外部 analytics API integration (Phase Analytics-2)
   - promptTemplate dataset 投入 (boss 担当)

## 9. Exact Codex Prompt for Phase UI-fidelity-10 (Final ReadOnlyBanner pages implementation)

```text
Implement Phase UI-fidelity-10: Final ReadOnlyBanner pages implementation.

Use:
- docs/80-final-readonlybanner-pages-fidelity-spec.md (this spec)
- docs/handoff/0163-final-readonlybanner-pages-fidelity-spec.md (this handoff、boss decisions が反映されたもの)
- docs/handoff/0162-ui-fidelity-9-final-placeholder-pages.md (latest tone)

Boss-confirmed scope (handoff §6 で boss が回答した内容を確認してから着手):
- /human-review-gates rename: boss 回答に従う (例: 「確認待ちゲート」)
- /campaigns Actions: P1 delay or P0 include (boss 回答に従う)
- /human-review-gates bucket 並び: pending-review → in-progress → blocked → not-started
- /publish-package/[slug]: surgical edit のみ (ReadOnlyBanner import + 2 呼び出し削除、それ以外は完全 untouched)
- GateBucketSection: inline (YAGNI)
- 1 batch (Option A、/campaigns pilot)
- shadcn 追加なし、native HTML + Tailwind のみ

Hard Rules:
- Do NOT modify Sanity schema
- Do NOT write to Sanity
- Do NOT modify publish-package files
- Do NOT modify assets/visuals / patches
- Do NOT add packages
- Do NOT deploy / auto-post
- Keep all 23 routes working
- Do NOT change /publish-package/[slug] copy-friendly behavior beyond ReadOnlyBanner deletion
- Do NOT change publish package parsing (readPublishPackage は untouched)
- Keep /, /configurator, /publish, /outputs, /campaigns/[slug], /visual-assets/*, /publish-packages, /activity-log, /diagnostics, /knowledge, /analytics, /settings unchanged
- Phase 2B write actions は実装しない、すべて read-only

Tasks (P0):

1. Rewrite `/campaigns/page.tsx`:
   - Add Breadcrumb: ダッシュボード > キャンペーン
   - Add KpiCardsRow (4 KpiCard):
     - 全キャンペーン (Rocket, slate)
     - active (Activity, blue)
     - 公開済み (CheckCircle2, emerald) — manualPublishingDoneCount 合計
     - レビュー待ち (Eye, amber) — pendingGatesCount 合計
   - Remove ReadOnlyBanner import + call
   - Keep existing CampaignRow / table 構造 / progressOf() helper unchanged

2. Rewrite `/human-review-gates/page.tsx`:
   - Replace <header> + h1 with PageHeader + Breadcrumb
   - Change max-w-6xl py-8 → max-w-[1280px] py-6
   - Rename title to Japanese (boss 確認、推奨: 「確認待ちゲート」)
   - Add KpiCardsRow (4 KpiCard):
     - レビュー待ち (Eye, amber) — pending-review count
     - 作業中 (Loader, blue) — in-progress count
     - ブロック (AlertOctagon, red) — blocked count
     - 未着手 (Clock, slate) — not-started count
   - Per-bucket section:
     - inline <header> with h2 + count chip (Visual Review pattern)
     - <ul divide-y> per-gate, line-clamp-2 notes + collapsible 全文
   - Empty state for all-zero buckets
   - Remove ReadOnlyBanner import + call
   - Keep flatten() / formatDate() helpers unchanged

3. Surgical edit `/publish-package/[slug]/page.tsx`:
   - Remove `import {ReadOnlyBanner} from '@/components/ReadOnlyBanner'`
   - Remove `<ReadOnlyBanner />` at line 42 (disabled branch)
   - Remove `<ReadOnlyBanner />` at line 64 (main branch)
   - **DO NOT touch anything else** in this 740-line file
   - Verify the page still renders correctly (PageHeader / PlatformOverviewCards / 4 platform Section / ReleaseReviewFooter)

4. Verify ReadOnlyBanner import drops to 0:
   ```bash
   grep -rn "ReadOnlyBanner" dashboard/src
   ```
   Should return only:
   - dashboard/src/components/ReadOnlyBanner.tsx (the file itself, definition)
   - 0 imports or calls from other files

5. Builds:
   - `cd dashboard && npm run build` (23 routes 維持)
   - `npm run build` (Sanity Studio clean)

6. Docs:
   - `docs/devlog/0153-ui-fidelity-10-final-readonlybanner-pages.md`
   - `docs/handoff/0164-ui-fidelity-10-final-readonlybanner-pages.md`
   - `docs/handoff/latest.md` (mirror)

Validation:
- 全 23 routes が build green
- /campaigns で Breadcrumb + 4 KpiCard が表示
- /human-review-gates で 日本語 rename + 4 KpiCard + bucket section の新 layout
- /publish-package/building-hitori-media-os で copy-friendly behavior が完全保持されている
- ReadOnlyBanner import 数 = 0 (component 本体 ReadOnlyBanner.tsx のみ残置)

Follow-up (本 batch 完了後の microbatch):
- Confirm grep 0 → rm dashboard/src/components/ReadOnlyBanner.tsx
- docs/devlog/0154-readonlybanner-final-delete.md + docs/handoff/0165 + latest mirror
- → Hitori Media OS UI fidelity cycle 完全終了
```
