# Phase UI-fidelity-4: Publish Management implementation

日付: 2026-05-19

## 背景

[docs/75 spec](75-publish-management-fidelity-spec.md) + [docs/handoff/0148 §9 Codex prompt](handoff/0148-publish-management-fidelity-spec.md) に従い、`/publish` の PhasePlaceholder を本実装に置換。Reference (`docs/ui-design/ChatGPT Image 2026年5月19日 13_02_43 (5).png`) と整合させ、`/publish-package/[slug]` v0.2 (作業者視点) と区別された **publisher 視点の Publish Management 画面** を構築。

boss 確定:
- shadcn DropdownMenu **no** (hand-roll dropdown)
- P1 を本バッチに含める **yes**
- PublishingLifecycleTimeline stages: 計画 → 準備 → レビュー → 公開予定 → 公開済み

## 決定・変更

### 新規 components (9)

`dashboard/src/components/publish/`:

**P0**:
- [`PackageHeroCard.tsx`](../dashboard/src/components/publish/PackageHeroCard.tsx) — campaign title + status badge + coreThesis + cover placeholder + 4 stat tile (公開済み / 画像・図解 / 確認待ち / 最終公開)
- [`ChannelsGrid.tsx`](../dashboard/src/components/publish/ChannelsGrid.tsx) — 7 platform 行 (X / Threads / note / Substack / YouTube / Podcast / Diagram)。published / pending / blocked / not-tracked の 4 状態 dot + URL + CopyButton
- [`PublishingMediaTable.tsx`](../dashboard/src/components/publish/PublishingMediaTable.tsx) — 6-column DataTable (媒体 / レビュー状態 / Published URL / Published At / 担当 / 操作)、担当 column は boss 固定 avatar
- [`PublishingLifecycleTimeline.tsx`](../dashboard/src/components/publish/PublishingLifecycleTimeline.tsx) — 公開専用 5 stage 縦並び (計画 → 準備 → レビュー → 公開予定 → 公開済み)、`common/LifecyclePipeline` と semantic 分離

**P1** (boss 確定で本バッチ実施):
- [`CampaignSwitcher.tsx`](../dashboard/src/components/publish/CampaignSwitcher.tsx) — hand-roll dropdown (QuickCreateButton pattern)、URL searchParam `?slug=...` で persistence、click-outside + Esc で close、option 1 件のみなら disabled compact state
- [`IncludedAssetsTable.tsx`](../dashboard/src/components/publish/IncludedAssetsTable.tsx) — visualAssetDetails + outputs を 2 section に分けた成果物一覧、PlatformBadge + StatusBadge + thumbnail placeholder
- [`ReleaseNotesCard.tsx`](../dashboard/src/components/publish/ReleaseNotesCard.tsx) — campaign data から hightlights を auto-derive (公開状況 / 画像 / coreThesis preview)、末尾に reactionNotes preview area
- [`RiskCheckCard.tsx`](../dashboard/src/components/publish/RiskCheckCard.tsx) — 5 static check items (内部情報漏出 / 有料 PDF 引用 / 自動投稿 / 個人情報 / AI クローン)、全て `pass` (emerald) で initial state
- [`PostPublishMonitoringCard.tsx`](../dashboard/src/components/publish/PostPublishMonitoringCard.tsx) — 4 metric tile placeholder (視聴 / スキ・♥ / 購読・フォロー / 返信・引用) + dashed chart area + Phase UI-6 chip

### Page rework

[`dashboard/src/app/publish/page.tsx`](../dashboard/src/app/publish/page.tsx):

- PhasePlaceholder 削除
- `searchParams.slug` を受け取り、default `building-hitori-media-os`
- 3 query 並列 fetch: `campaignDetailBySlugQuery` + `campaignListQuery` + `outputsListQuery`
- 構造:
  ```
  [PageHeader (breadcrumb + title + 3 disabled actions: 公開パッケージを編集 / 公開設定 / 今すぐ公開)]
  [CampaignSwitcher (compact 1-row card)]
  [PackageHeroCard (full width)]
  [2-col grid lg:grid-cols-[2fr_1fr]:
    Left:
      ChannelsGrid
      PublishingMediaTable
      IncludedAssetsTable
    Right:
      PublishingLifecycleTimeline
      ReleaseNotesCard
      RiskCheckCard
      PostPublishMonitoringCard
  ]
  ```
- campaign not found 時に not-found card + キャンペーン一覧へのリンク
- default `building-hitori-media-os` で fetch 失敗時の fallback path も実装

### CampaignSwitcher 実装方針

QuickCreateButton と同 pattern:
- `'use client'` + `useState(open)` + `useRef` + `useEffect` で click-outside / Esc
- `useRouter` + `useSearchParams` + `usePathname` で URL searchParam を `?slug=...` に書き込み
- ChevronDown icon、active 行に Check icon
- options 1 件のみなら button disabled (compact selector 状態を保持)

### Data sources (既存のみ)

- `campaignDetailBySlugQuery` (campaign 詳細): `manualPublishingStatus[]` / `selectedPlatforms[]` / `visualAssetDetails[]` / `humanReviewGates[]` / `coreThesis` / `targetReader` / `sourceContentIdea` 等
- `campaignListQuery` (CampaignSwitcher options): `_id` / `title` / `slug` のみ抽出
- `outputsListQuery` (IncludedAssetsTable の outputs 部分): `buildOutputRows` で row 配列を構築、`r.campaignSlug === slugForLinks` で filter

**新規 GROQ は無し**、schema 変更なし。

### Build verification

- `cd dashboard && npm run build` ✓ 23 routes、TypeScript clean
- `npm run build` ✓ Sanity Studio 7.6s clean

## 理由

- **CampaignSwitcher hand-roll**: boss 確定通り `@radix-ui/react-dropdown-menu` + 3 deps を回避。QuickCreateButton (UI-1) と同じ pattern で 100 line ほどで accessibility 確保 (click-outside / Esc / aria-expanded / aria-haspopup)
- **PublishingLifecycleTimeline を縦並び**: ideal 画像では横長表記だが、右 sidebar (`lg:col-span-1` ≈ 33% 幅) に置く制約で横並びだと窮屈。縦並び + 各 stage に rounded box で同じ意味を保持
- **担当 column を boss 固定**: multi-user mode (Phase UI-7+) まで実 dynamic data なし、`assigneeName` prop で boss-only label。avatar も blue badge 固定
- **3 disabled placeholder buttons**: ideal 画像にある「公開パッケージを編集 / 公開設定 / 今すぐ公開」を visual placeholder で配置。boss が「ここに button が来る」と認識できる + Phase UI-7+ で auto-post / scheduling を入れるとき実装が一直線
- **ChannelsGrid が 7 platform 行**: 4 manualPublishingStatus + 3 KNOWN_PLATFORMS (`youtube` / `podcast` / `diagram`) を「未追跡」として常時表示。boss が「次にどの媒体を attempt するか」判断材料に
- **IncludedAssetsTable で visualAssetDetails + outputs を 2 section**: 画像と文章出力を別の意味的グループとして見せる。同じ table にすると platform 縦並びの繰り返しが冗長
- **ReleaseNotesCard の static highlights**: 動的データ source 無しのため campaign data から auto-derive (公開状況 / 画像 / coreThesis preview)。Phase UI-7+ で `release-review/*-final-review.md` の最終確認セクションから highlight を pull 検討
- **RiskCheckCard 全 `pass`**: building-hitori-media-os は Pre-Publish Review で全項目 clean を確認済 (docs/handoff/0134 PASS_WITH_NOTES、blocking なし)。Phase UI-7+ で release-review の Safety Reaffirmation 状態と連動
- **PostPublishMonitoringCard が UI-2.5 EngagementPlaceholder と類似**: 構造はほぼ同じだが per-tile icon + tone bg を追加。boss が「3 page で同じ placeholder が並ぶ退屈感」を訴えた場合に共通化 (Phase UI-fidelity-5 cleanup) で 1 component に統合可能

## 影響

- `/publish` PhasePlaceholder → 本実装 Publish Management 画面に
- 23 routes 動作維持、TypeScript clean
- `/publish-package/[slug]` v0.2 / `/` / `/campaigns/[slug]` / `/outputs` 全て touch なし
- 既存 GROQ query 再利用、新規 schema / write actions なし、パッケージ追加なし
- CampaignSwitcher により URL bookmarkable: `/publish?slug=<campaign>` で任意 campaign の publish 状態 page に直接到達
- PublishingMediaTable と Campaign Detail PublishingScheduleTable は **個別実装** で並走、共通 DataTable 抽出は将来判断

## 次の一手

1. boss が `cd dashboard && npm run dev` で manual check:
   - `/publish` (default building-hitori-media-os)
   - `/publish?slug=building-hitori-media-os` (URL searchParam 動作)
   - CampaignSwitcher dropdown 開閉 (option 1 件なら disabled compact)
   - PackageHeroCard の 4 stat tile
   - ChannelsGrid の 7 platform 行 (4 manualPublishingStatus + 3 KNOWN_PLATFORMS 未追跡)
   - PublishingMediaTable の 4 行 (building-hitori-media-os)
   - PublishingLifecycleTimeline の current stage (推定: 公開済み? or 公開予定 — Threads pending のため)
   - 4 right sidebar cards (Lifecycle / ReleaseNotes / RiskCheck / Monitoring)
   - 3 header actions (全て disabled placeholder)
   - `/publish-package/building-hitori-media-os` v0.2 動作確認 (無変更)
2. UI 細部の調整は microbatch
3. 違和感なければ次の選択肢:
   - **Output Configurator fidelity spec** (`13_02_43 (3).png`、中核 monetizable feature の準備)
   - **24-72h 後の reactionNotes 反映バッチ** (Sanity write、`tools/sanity/reflect-reaction-notes.mjs` 新規)
   - **dead code cleanup** (PublishReadinessBoard / NextActionSummary / WorkingPipelineStatus / NextActionChecklist / CampaignStatusCard / AppNav 削除)
   - **残 4 page fidelity spec** (Configurator / Visual Review / Knowledge / Analytics) の一括化

並行候補:
- Threads 公開判断
- `/publish-package/[slug]` v0.3 (Phase UI-3 server action 経由の URL inline edit)
