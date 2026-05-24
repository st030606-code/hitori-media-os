# Phase UI-fidelity-2: Output Management fidelity implementation

日付: 2026-05-19

## 背景

[docs/73 (Output Management spec)](73-output-management-fidelity-spec.md) + [docs/74 (execution plan)](74-ui-fidelity-execution-plan.md) + [docs/handoff/0145 §9 (UI-fidelity-1 follow-up prompt)](handoff/0145-campaign-detail-fidelity-implementation.md) に従い、`/outputs` の PhasePlaceholder を本実装に置換。Reference (`docs/ui-design/ChatGPT Image 2026年5月19日 13_02_43 (4).png`) の見た目に近づける。

boss 確定:
- shadcn select: **no**
- native select + Tailwind で OutputsFilterBar 実装
- Tailwind-first policy 継続
- UI-2.5 / UI-fidelity-1 の design tone を継承

## 決定・変更

### 新規 components (5) + 新規 GROQ helper (1)

- [`dashboard/src/lib/groq/outputs.ts`](../dashboard/src/lib/groq/outputs.ts) — `outputsListQuery` + 型 + `buildOutputRows()` + `countByBucket()` + `countByPlatform()` + `distinctCampaigns()`
- [`dashboard/src/components/outputs/OutputsFilterBar.tsx`](../dashboard/src/components/outputs/OutputsFilterBar.tsx) — client、native `<select>` + Tailwind、search input + 4 select + reset + 新規出力 CTA
- [`dashboard/src/components/outputs/OutputsTable.tsx`](../dashboard/src/components/outputs/OutputsTable.tsx) — 7-column DataTable + empty state、行から `/publish-package/[slug]#{platform}` へ
- [`dashboard/src/components/outputs/OutputsView.tsx`](../dashboard/src/components/outputs/OutputsView.tsx) — client wrapper、filter state を `useState` + `useMemo` で in-memory filter
- [`dashboard/src/components/outputs/PlatformBreakdownCard.tsx`](../dashboard/src/components/outputs/PlatformBreakdownCard.tsx) — server、7 platform を tone-correct progress bar 付きで

### Page 置換

[`dashboard/src/app/outputs/page.tsx`](../dashboard/src/app/outputs/page.tsx):
- PhasePlaceholder 削除
- `outputsListQuery` で Sanity から fetch (`platformOutput` rows + `campaignPlan.manualPublishingStatus` items)
- 構造:
  ```
  [PageHeader: 出力管理 + description + 新規出力 CTA]
  [KpiCardsRow: 全 / 下書き / レビュー / 公開 (per-tone sparkline-trend は neutral)]
  [2-col grid lg:grid-cols-[2fr_1fr]:
    Left: <OutputsView /> (FilterBar + Table)
    Right: PlatformBreakdownCard + FallbackNotice
  ]
  ```

### Data source 戦略

仕様で 3 通り (platformOutput / manualPublishingStatus proxy / FS scan) のうち boss 判断待ちだったが、本実装は **2 つを同時に query して merge** する設計:

1. `platformOutput` doc を最大 100 件 fetch (canonical Sanity type)
2. `campaignPlan.manualPublishingStatus[]` を全 campaign 横断で fetch
3. `buildOutputRows()` で merge:
   - platformOutput → 「下書き / レビュー / 公開準備OK / アーカイブ」を represent (`source: 'platformOutput'`)
   - manualPublishingStatus → 「公開済み / 未着手 / 作業中 / 要対応」を represent (`source: 'manualPublishing'`)
4. updatedAt / publishedAt の desc で sort
5. Status bucket (`draft` / `review` / `published` / `archived` / `other`) を派生して KPI 集計に使用

building-hitori-media-os は manualPublishingStatus に 4 entries あるので、platformOutput が空でも 4 行表示される (X done / note done / substack done / threads not-started)。

### FilterBar の native select 採用

boss 「shadcn select: no」決定を受け、`<select>` + Tailwind class で実装:
- `h-9 rounded-md border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100`
- Label を `text-[11px] font-medium text-slate-600` で上に
- search input は left icon + native focus:ring
- reset button は `disabled={!hasActiveFilter}` で active state 連動
- 新規出力 CTA は `bg-blue-600` primary

shadcn を入れていないため `@radix-ui/react-select` / `clsx` / `tailwind-merge` / `cva` の 4 dep 追加なし。

### Filter state 管理

`OutputsView` (client) が `useState<FilterState>` で保持、`useMemo` で filtered + sorted rows を計算。
- 検索: `title / campaignTitle / platform / outputType` を結合した文字列に対する部分一致 (case-insensitive)
- キャンペーン: `campaignSlug` 一致
- プラットフォーム: `platform` 一致
- ステータス: `bucket` 一致 (`draft` / `review` / `published` / `archived`)
- ソート: `updated-desc` (default) / `updated-asc` / `title-asc`
- リセット: `DEFAULT_FILTER` に戻す

URL search params 連動は **Phase UI-3** で server action + bookmarkable filter にする想定。本 phase は in-memory のみ。

### PlatformBreakdownCard

7 platform を default 表示 (`x / threads / note / substack / youtube / podcast / diagram`)、count が 0 でも行を出して「未対応 platform」も視認可能。max count に対する % bar で視覚化、count > 0 は blue / 0 は slate。

### FallbackNotice

`platformOutput` / `manualPublishingStatus` のどちらか欠落していたら blue card で「データソース」状況を明示。両方ある場合は表示しない。boss が「なぜこの数字か」を 1 行で読める。

### Pagination は本 phase で見送り

boss 「force generic DataTable 抽象化はやめる」+ P2 指定なのでスキップ。building-hitori-media-os の 4 行 + 想定 platformOutput 数十件レベルでは pagination 不要。

### Build verification

- `cd dashboard && npm run build` ✓ 23 routes、TypeScript clean
- `npm run build` ✓ Sanity Studio 7.6s clean

## 理由

- **`platformOutput` + `manualPublishingStatus` の dual-source merge**: dataset の現状 (platformOutput 投入率不明 + manualPublishingStatus 4 件) を踏まえ、両方を統合する形でグレースフル fallback を実現。boss が dataset を後追いで埋めても自動的に platformOutput rows が優先表示される
- **OutputsView を client component に**: filter UI のリアクティブ性が必要 (4 select × search の組み合わせ)、SSR ベースだと URL params 連動が複雑。phase 2 でまずは client-side filter で UX を完成させ、phase 3 で server-side filter + URL bookmark に進化させる 2 段戦略
- **OutputsTable と OutputsFilterBar を分離**: 共通 DataTable 抽象化は boss が「force しない」と指示。OutputsTable を page 特有実装にして、Campaign Detail の PublishingScheduleTable と平行運用。3 page 経験後の Phase UI-fidelity-3 cleanup で抽象化判断
- **native `<select>` を採用**: shadcn を見送ったが、reference 画像での select 見た目に近づけるため、`h-9 rounded-md border-slate-200 shadow-sm focus:ring-blue-100` で polishing。`@radix-ui/react-select` を入れない分、4 dep 追加を回避
- **PlatformBreakdownCard で 0 件 platform も表示**: 「現状この媒体は出力なし」を可視化、boss が「どこを次に攻めるか」判断材料に
- **FallbackNotice**: platformOutput が dataset 未投入だと boss が「何を見せられているか」混乱する。1 段 notice で「これは manualPublishingStatus proxy」と明示
- **filter state は in-memory のみ**: URL params 連動は phase 3 で server action 経由の write actions と一緒に。phase 2 を visual fidelity に専念する判断
- **KPI trend は neutral 「— 前月比」**: UI-2.5 / UI-fidelity-1 と同じ tone、Phase UI-6 で真値置換

## 影響

- `/outputs` placeholder → 完全な Output Management 画面に
- 23 routes (17 既存 + 6 placeholder) → 23 routes (17 既存 + 5 placeholder + `/outputs` 本実装) で動作維持
- `/` Dashboard / `/campaigns` / `/campaigns/[slug]` / `/publish-package/[slug]` は touch なし
- Sanity への新 query (`outputsListQuery`) は追加、schema 変更なし、書き込みなし
- パッケージ追加なし
- 共通 component (KpiCard / KpiCardsRow / PageHeader / StatusBadge / PlatformBadge) を再利用、shared design tone 維持

## 次の一手

1. boss が `cd dashboard && npm run dev` で `/outputs` を実機確認:
   - PageHeader title「出力管理」+ 新規出力 CTA
   - FilterBar (search + campaign / platform / status / sort + reset + 新規出力)
   - KpiCardsRow 4 metrics (per-tone)
   - 左 OutputsView (FilterBar + Table)、右 PlatformBreakdownCard + FallbackNotice
   - building-hitori-media-os の 4 行が manualPublishingStatus proxy として表示
   - filter UX (search で絞り込み / status で絞り込み / reset)
2. boss feedback で microbatch 修正
3. 違和感なければ次の選択肢:
   - **Dashboard polish (Phase UI-fidelity-3)** — UI-2.5 の残 P1 を吸収、3 page 全体で tone 統一
   - **Publish Management fidelity spec** (`/publish` の reference `13_02_43 (5).png` を spec 化)
   - **Output Configurator spec** (`13_02_43 (3).png` を spec 化、Phase UI-4 着手準備)

並行候補:
- 24-72h 後の reactionNotes 反映バッチ
- Threads 公開判断
- dead code cleanup (PublishReadinessBoard / NextActionSummary / WorkingPipelineStatus / NextActionChecklist / CampaignStatusCard / AppNav)
