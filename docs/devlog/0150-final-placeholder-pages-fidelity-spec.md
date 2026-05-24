# Devlog 0150 — Final placeholder pages fidelity spec

日付: 2026-05-20

## 背景

Phase UI-fidelity-1〜8 で 6 main page + 3 utility page (合計 9 page) が fidelity 化。Sidebar に並ぶ最後の 3 page (`/analytics` / `/knowledge` / `/settings`) は依然 `PhasePlaceholder` のまま。本 batch はこの 3 page の **audit + implementation-ready spec** を作る docs-only batch。完了すれば Hitori Media OS の main UI surface が一巡する。

3 page は依存関係なし、新 schema / write 不要、すべて UI のみ。1 batch で実装可能。

## 決定・変更

### 新規 docs

- `docs/79-final-placeholder-pages-fidelity-spec.md` — A: /analytics, B: /knowledge, C: /settings + D 章 data source planning + E 章 implementation order + F〜I 章 constraints/decisions/out-of-scope/post-state
- `docs/devlog/0150-final-placeholder-pages-fidelity-spec.md` (本ファイル)
- `docs/handoff/0161-final-placeholder-pages-fidelity-spec.md`
- `docs/handoff/latest.md` (mirror)

### コード変更

**なし**。runtime / schema / publish-package / assets/visuals / patches / package.json / deploy はいずれも touch なし。

### spec の主な内容

1. **3 page の現 PhasePlaceholder 実装の audit** — 各 12-33 行、`max-w-3xl` dashed border の center-aligned card
2. **target role の言語化**:
   - `/analytics`: 公開後の反応・学習を loop に変える
   - `/knowledge`: contentIdea / brand / style / prompt の 4 知識資産を横断表示
   - `/settings`: 環境・feature flags・将来連携の readout hub
3. **target structure** — 3 page とも `PageHeader + Breadcrumb + max-w-[1280px] + KpiCardsRow + 2-col content` で fidelity tone に整合
4. **data sources** — `/analytics` は新 `lib/groq/analytics.ts` 候補 or 既存 query 並列 fetch、`/knowledge` は既存 `configuratorOptionsQuery` を **そのまま流用**、`/settings` は既存 `lib/featureFlags.ts` / `lib/sanity.ts` exports を直 import
5. **P0 / P1 / P2 scope** — 3 page ともに layout + KpiCardsRow + 主要 card 構造を P0、polish + 外部連携 placeholder を P1、real integrations を P2 に分割
6. **implementation order** — Option A (`/knowledge` → `/analytics` → `/settings` の 1 batch、推奨) / Option B (knowledge + settings 先、analytics 別 batch) / Option C (3 page 並列)
7. **boss decision points** 8 件: rename / 新 query 立てるか / Tabs reuse / card click 先 / secret 表示 / FutureIntegrations 範囲 / batch 分割 / LearningInsights 共通化

## 理由

- **docs-only で確定させる**: 3 page を実装する batch が中規模 (3 page + 推定 17 新 component) になるため、先に spec で boss 確認すれば実装中の往復が減る
- **`/knowledge` を pilot に**: 既存 `configuratorOptionsQuery` をそのまま流用できる、新 query 0 でデータ取得が完結する点で最も実装が軽い。pilot pattern を `/analytics` と `/settings` に展開
- **`/settings` を最後に**: 既存 module exports を直 render するだけ、3 page の中で最も依存少。tone consistency の最終確認 machine
- **shadcn 全 NO 継続**: Phase UI-fidelity-1〜8 と同方針
- **secret は表示しない方針**: `/settings` の FeatureFlagsCard は env name + on/off のみ、値の中身 (`SANITY_*_TOKEN` 等) は表示しない

## 影響

- code 変更ゼロ、23 routes 動作維持、build 不変
- Phase UI-fidelity-9 着手の前提が確定
- 実装後の状態: **Sidebar 9 nav items 全てが fidelity 化済**、Hitori Media OS の main UI surface が一巡
- 残る fidelity 未対応 (本 spec の out of scope): `/campaigns` list / `/human-review-gates` / `/publish-package/[slug]` (boss が touch しない方針の page 群)

## 次の一手

1. **boss が docs/79 を読む**:
   - §A / B / C で各 page の target structure に違和感ないか
   - §G boss decision points 8 件を回答
   - §E implementation order の Option A (1 batch) で進めるか
2. boss OK → Phase UI-fidelity-9 (final placeholder pages implementation) 着手
3. 微調整があれば microbatch
4. 実装完了後、Hitori Media OS UI fidelity cycle 一巡。次に「中期」cleanup (ReadOnlyBanner 等) / Phase 2B 議論 / dashboard/README.md 書き直し に進める

## 発信ネタ候補

- 「最後の placeholder を倒すと OS が完成する」: Hitori Media OS の UI fidelity cycle を 9 batch (UI-1〜9) で一巡させる戦略の話
- 「既存 query をそのまま流用する『新規画面』」: `/knowledge` は `configuratorOptionsQuery` を 1 つ呼ぶだけで 4 tab が成立する例
- 「設定画面は read-only からスタートする」: `/settings` を read-only で先に作っておけば、Phase 2B で write 機能を載せるときに layout / API がすでに揃っている設計
