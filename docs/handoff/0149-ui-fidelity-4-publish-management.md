# Handoff: Phase UI-fidelity-4 Publish Management implementation

Date: 2026-05-19

## 1. Task Goal

[docs/75 (spec)](../75-publish-management-fidelity-spec.md) + [docs/handoff/0148 §9 (Codex prompt)](0148-publish-management-fidelity-spec.md) に従い、`/publish` PhasePlaceholder を本実装に置換。Reference (`docs/ui-design/ChatGPT Image 2026年5月19日 13_02_43 (5).png`) の見た目に近づけ、`/publish-package/[slug]` v0.2 (作業者視点) と区別された **publisher 視点 Publish Management 画面** を構築。

## 2. Constraints Followed

- ✅ Sanity 書き込みなし / schema 変更なし
- ✅ publish-package output / assets/visuals / patches 不変
- ✅ deploy / auto-post なし
- ✅ パッケージ追加なし (shadcn DropdownMenu **no**、hand-roll を採用)
- ✅ shadcn templates 未導入
- ✅ 23 routes 動作維持
- ✅ AppShell / Sidebar / Topbar / WorkspaceBlock 無変更
- ✅ `/publish-package/[slug]` v0.2 touch なし
- ✅ `/` / `/campaigns/[slug]` / `/outputs` touch なし (shared component 経由のみ)

## 3. Changed Files

### 新規 (9 publish components + 3 docs)

`dashboard/src/components/publish/`:
- `CampaignSwitcher.tsx` — hand-roll dropdown (QuickCreateButton pattern)
- `PackageHeroCard.tsx` — campaign title + status + description + 4 stat tile + cover
- `ChannelsGrid.tsx` — 7 platform 行 with status/URL/CopyButton
- `PublishingMediaTable.tsx` — 6-column DataTable (担当 column 含む)
- `PublishingLifecycleTimeline.tsx` — 5 stage 縦並び (publish-specific)
- `IncludedAssetsTable.tsx` — visualAssetDetails + outputs を 2 section
- `ReleaseNotesCard.tsx` — auto-derived highlights + reactionNotes preview
- `RiskCheckCard.tsx` — 5 static check items, all pass
- `PostPublishMonitoringCard.tsx` — 4 metric tile + dashed chart placeholder

新規 docs:
- `docs/devlog/0138-ui-fidelity-4-publish-management.md`
- `docs/handoff/0149-ui-fidelity-4-publish-management.md`（本ファイル）
- `docs/handoff/latest.md`（mirror）

### 更新 (1)

- `dashboard/src/app/publish/page.tsx` — PhasePlaceholder 削除、本実装に置換 (3 query 並列 fetch + 全 9 components 配置)

## 4. Summary of Changes

### `/publish` layout

```
[PageHeader (breadcrumb + title + 3 disabled actions)]
[CampaignSwitcher (compact 1-row card with dropdown)]
[PackageHeroCard (full width: title + status + description + 4 stat tile + cover)]
[2-col grid lg:grid-cols-[2fr_1fr]:
  Left:
    ChannelsGrid (7 platform 行)
    PublishingMediaTable (6-column DataTable)
    IncludedAssetsTable (visuals + outputs)
  Right:
    PublishingLifecycleTimeline (5 stage 縦)
    ReleaseNotesCard (auto-highlights)
    RiskCheckCard (5 check items)
    PostPublishMonitoringCard (4 metric tile placeholder)
]
```

### Data sources

3 query 並列 fetch (Promise.all):
1. `campaignDetailBySlugQuery({slug})` — campaign 詳細
2. `campaignListQuery` — CampaignSwitcher options (全 campaign の slug + title)
3. `outputsListQuery` — IncludedAssetsTable の outputs 部分 (該当 campaign slug で filter)

新規 GROQ 不要、既存 query を再利用。

`searchParams.slug` を default `building-hitori-media-os` で取得、見つからない場合は default にフォールバック、それでも null なら campaign not-found card。

### CampaignSwitcher 仕様

- Hand-roll dropdown (QuickCreateButton pattern):
  - `'use client'` + `useState(open)` + `useRef` + `useEffect`
  - click-outside / Escape で close
  - `aria-expanded` / `aria-haspopup="menu"` / `role="menu"` / `role="menuitem"`
- URL searchParam `?slug=...` で永続化:
  - `useRouter` + `useSearchParams` + `usePathname`
  - select で `router.push(${pathname}?slug=${slug})`、他 searchParam を保持
- option 1 件のみ: button disabled (compact selector 表示のみ)
- active row に `Check` icon
- options 全件で `max-h-80 overflow-y-auto`

### 3 disabled placeholder actions

`公開パッケージを編集 (Phase UI-3+)` / `公開設定 (Phase UI-7+)` / `今すぐ公開 (Phase UI-7+ auto-post 機構)` — すべて `<button disabled>` で visual layout のみ存在、`title` attribute で Phase 明示。

### Build result

```
Route (app) — 23 routes (placeholder /publish now full implementation)
TypeScript clean
Sanity Studio build 7.6s clean
```

## 5. Key Decisions

- **CampaignSwitcher hand-roll**: boss 確定通り shadcn DropdownMenu (4 deps) 回避、UI-1 QuickCreateButton pattern で a11y 確保
- **PublishingLifecycleTimeline 縦並び**: 右 sidebar 33% 幅で横並びだと窮屈、縦並び + 各 stage `rounded-md p-3` で意味維持
- **担当 column 固定 "ボス"**: multi-user 未実装、`assigneeName` prop で boss-only label
- **3 disabled placeholder actions**: ideal の visual を保ちつつ動作させない、Phase UI-3/7+ で本実装の prep
- **ChannelsGrid に未追跡 platform 表示**: 4 tracked + 3 KNOWN_PLATFORMS (youtube/podcast/diagram) を「未追跡」で常時表示、boss の次回展開判断材料
- **IncludedAssetsTable を 2 section**: 画像 + 出力を分離、`<header>` で件数 chip 表示
- **ReleaseNotesCard auto-derive**: 動的 source 無、campaign data から「公開状況 + 画像 + coreThesis preview」を生成
- **RiskCheckCard 全 pass**: building-hitori-media-os は Pre-Publish Review (docs/0134) で clean 確認済、static で OK
- **PostPublishMonitoringCard ≒ EngagementPlaceholder**: 構造は類似だが per-tile icon + tone bg で publish 特化
- **PublishingMediaTable と Campaign Detail PublishingScheduleTable は別実装**: spec 通り共通 DataTable 抽出 force しない、Phase UI-fidelity-5 cleanup で判断

## 6. Human Review Questions

1. **CampaignSwitcher 位置**: PageHeader の下にしているが、ideal 画像通り header 右に統合する方が良いか
2. **3 header actions の disabled**: visual placeholder で OK か、Phase UI-3 で actual 実装したいか
3. **PublishingLifecycleTimeline current stage 推定**: building-hitori で「公開予定」になる想定 (Threads pending)、boss の感覚と一致するか
4. **担当 column**: 「ボス」固定で OK か、Phase UI-7+ multi-user まで非表示にする選択肢もあり
5. **ChannelsGrid 未追跡 platform 表示**: 7 行表示は親切か、それともノイズか (4 行のみに絞る)
6. **IncludedAssetsTable の thumbnail**: 現状 placeholder icon、Phase UI-fidelity-5 で `/api/asset-thumb` 拡張して実画像表示するか
7. **RiskCheckCard 全 pass の初期状態**: building-hitori 想定では合理的、他 campaign で boss が「warning にしたい」場合の dynamic data source は release-review markdown から derive する想定で良いか
8. **PostPublishMonitoringCard vs EngagementPlaceholder**: 統合 (1 component) するか、別々で keeping するか

## 7. Risks or Uncertainties

- **`/publish` の visual layout が ideal 画像 (横配置主体) と異なる**: 右 sidebar に Lifecycle / ReleaseNotes / RiskCheck / Monitoring 4 cards を縦並びにしたため。boss が「もう少し横展開したい」希望なら lg:grid-cols-3 や Tabs 化で再構成
- **CampaignSwitcher の bookmarkable URL**: `/publish?slug=xxx` が直接アクセスされた時、xxx が存在しなければ default `building-hitori-media-os` にフォールバック、それでも null なら not-found card。boss が「明示的に 404 出したい」場合は別パス
- **PackageHeroCard の cover area が placeholder**: campaign の hero 画像 (publish-packages/.../shared/campaign-hero-v1.png 等) を表示したいが `/api/asset-thumb` の prefix 拡張が必要、UI-fidelity-5 で
- **PublishingMediaTable と PublishingScheduleTable の重複**: 同じ column set + 同じ data source。共通 DataTable component 抽出が Phase UI-fidelity-5 cleanup で必要
- **担当 avatar `B` 固定**: multi-user 未実装の placeholder。boss が「すでに B が映ってると安心感あり」なら維持、「無意味」なら column 非表示にする選択肢
- **ReleaseNotesCard auto-derive の精度**: building-hitori 特化のロジックで他 campaign では別 highlight が必要になる可能性、Phase UI-fidelity-5 で release-review markdown の最終確認 section pull 検討

## 8. Recommended Next Step

1. boss が `cd dashboard && npm run dev` で manual check:
   - `/publish` (default building-hitori-media-os)
   - `/publish?slug=building-hitori-media-os` (URL searchParam 直接アクセス)
   - CampaignSwitcher dropdown (option 1 件なら disabled compact)
   - PackageHeroCard / ChannelsGrid / PublishingMediaTable / IncludedAssetsTable / PublishingLifecycleTimeline / 4 right cards
   - 3 header actions disabled
   - `/publish-package/building-hitori-media-os` v0.2 動作確認 (無変更)
2. UI 細部の調整は microbatch
3. 違和感なければ次の選択肢:
   - **Output Configurator fidelity spec** (`13_02_43 (3).png` から spec 化、Phase UI-4 中核 monetizable feature)
   - **24-72h 後の reactionNotes 反映バッチ** (新規 `tools/sanity/reflect-reaction-notes.mjs`)
   - **dead code cleanup** (6 components 削除 batch)
   - **残 4 page fidelity spec** 一括化

並行候補:
- Threads 公開判断
- `/publish-package/[slug]` v0.3 (Phase UI-3 server action 経由の URL inline edit)
- DataTable 共通抽出 (Phase UI-fidelity-5 cleanup)

## 9. Exact Codex Prompt for "Output Configurator fidelity spec"

```text
Create fidelity spec for /configurator (Output Configurator) page.

Inputs:
- Ideal screenshot: docs/ui-design/ChatGPT Image 2026年5月19日 13_02_43 (3).png
- Current state: dashboard/src/app/configurator/page.tsx is PhasePlaceholder
- Reference docs:
  - docs/68 (design system)
  - docs/69 (implementation plan: Phase UI-4 — Output Configurator MVP)
  - docs/handoff/0149 (latest design tone)

Hard Rules (audit + spec docs only):
- Do NOT modify code in this batch.
- Do NOT modify Sanity schema.
- Do NOT add packages.
- Do NOT modify other pages.
- Audit-only docs deliverable.

Tasks:

1. Analyze ideal screenshot:
   - hero form structure
   - contentIdea selector
   - 媒体 multi-select
   - 出力形式 / 目的 / トーン / CTA / 出力長さ / 参照プロンプト 等の selectors
   - 「下書きを生成」 primary CTA
   - right column: preview / deliverables / recommended templates / lifecycle preview

2. Compare with current placeholder (current is empty):
   - All sections are net-new

3. Create docs:
   - docs/76-output-configurator-fidelity-spec.md
     - page structure diff
     - component diff (~12 行)
     - visual fidelity checklist (~40 項目)
     - P0/P1/P2 implementation order
     - files likely affected
     - data sources:
       - contentIdea (全 list for selector)
       - brandProfile (voice / tone defaults)
       - visualStyleProfile (style defaults)
       - promptTemplate (参照プロンプト options)
       - selectedPlatforms / outputType enum (campaignPlan か独立か議論)
   - docs/devlog/<番号>-output-configurator-fidelity-spec.md
   - docs/handoff/<番号>-output-configurator-fidelity-spec.md
   - docs/handoff/latest.md (mirror)

4. Note: Output Configurator は Hitori Media OS の **中核 monetizable feature**。
   spec で「実 generation は scope 外 (boss 手動 copy → AI ツール)」を明示。

5. Include Phase UI-4 implementation Codex prompt in handoff §9.

Validation:
- npm run build
- cd dashboard && npm run build
(docs-only, both builds remain unchanged)
```
