# Phase UI-fidelity-1: Campaign Detail fidelity implementation

日付: 2026-05-19

## 背景

docs/72 + docs/74 §6 で確定した spec を `/campaigns/[slug]` に適用するバッチ。docs/handoff/0143 (UI-2.5) で確立した design tone を継承しつつ、Campaign Detail を「主役 / 補助情報」で structural に分け、reference (`docs/ui-design/ChatGPT Image 2026年5月19日 13_02_42 (2).png`) に近づける。

boss 確定:
- Execution order: Campaign Detail → Output Management → Dashboard polish
- shadcn tabs: yes (`if needed`)
- Tailwind-first + selective adoption 継続

## 決定・変更

### shadcn tabs を導入せず、Tabs を hand-roll した

boss は「shadcn tabs: yes」を選択したが「if needed」の qualification があり、また Hard Rules で「Add only shadcn tabs if necessary」と再確認。実装コストを比較:

- **shadcn 導入**: `npx shadcn init` + `add tabs` → 4 new dependencies (`@radix-ui/react-tabs` / `clsx` / `tailwind-merge` / `class-variance-authority`) + `components.json` 設置 + `tailwind.config.ts` 改変
- **Hand-roll**: ~150 line React component (`Tabs / TabsList / TabsTrigger / TabsContent`)、Tailwind class、Context + useState + useId + キーボード操作 (Arrow/Home/End)、ARIA `role="tablist|tab|tabpanel"` + `aria-controls / aria-labelledby / aria-selected`

判断: **hand-roll を採用**。Tailwind-first policy と「最小パッケージ」方針に整合、本 phase のスコープで shadcn 周辺の depend 増加を避ける。boss が「やはり shadcn primitive を使いたい」と判断した場合は別 microbatch で置換可能。

`dashboard/src/components/common/Tabs.tsx` を新規作成。

### 新規 components (5)

- `dashboard/src/components/common/Tabs.tsx` — accessibility 対応の Tabs primitive
- `dashboard/src/components/common/Breadcrumb.tsx` — items list + ChevronRight separator、last 項目は current で `font-medium text-slate-900`
- `dashboard/src/components/campaign/PublishReadinessScore.tsx` — 大型 score (text-4xl tabular-nums) + 円形 SVG progress (120×120, radius 55, stroke 10) + 4 platform 行 (X/Threads/note/Substack) with ✓公開済み / ⏳未公開 / —未追跡 + 3 metric tile (公開済み / 未公開 / 画像)、score 算出は `publishingDone/total * 70 + visualsDone/total * 30`、tone は score 帯で emerald/blue/amber/slate
- `dashboard/src/components/campaign/PublishingScheduleTable.tsx` — 6-column DataTable (媒体 / 出力種別 / 状態 / 公開日時 JST / URL / actions)、`manualPublishingStatus` を主に、`selectedPlatforms` を補完して fallback「未追跡」行を出す
- `dashboard/src/components/campaign/NextActionList.tsx` — 既存 `computeNextActions(campaign)` を流用、3 group に分類 (要確認 / 次にやること / 後で対応)、tone dot + icon + title + detail

### 更新 (2)

- `dashboard/src/components/common/PageHeader.tsx` — `breadcrumb?: BreadcrumbItem[]` prop を追加、既存 usages は影響なし (Dashboard / Campaigns list / placeholder の PageHeader 呼び出し)
- `dashboard/src/app/campaigns/[slug]/page.tsx` — 全面 rework。layout を次の構成に:
  - PageHeader (breadcrumb `キャンペーン > {title}` + title + coreThesis description + meta { slug / type / mode / auto / StatusBadge } + actions row: `編集 (disabled placeholder)` / `出力を追加 → /configurator` / `公開パッケージへ → /publish-package/{slug}` (emerald) / `共有 (disabled placeholder)`)
  - KpiCardsRow (4: 公開済み / 確認待ちゲート / 画像・図解 / 選択媒体) — UI-2 から保持
  - LifecyclePipeline (per-campaign 5 stage) — UI-2.5 tone bg 強化版
  - 2-col main grid (`lg:grid-cols-[2fr_1fr]`):
    - 左 main: `CampaignBriefCard` (coreThesis + targetReader + 元アイデア) → `PublishingScheduleTable`
    - 右 sidebar: `PublishReadinessScore` → `NextActionList` → `ReleaseReviewLinks`
  - Tabs section: 9 tabs (Content Idea / ブランド / 媒体 / 確認ゲート / 画像・図解 / プロンプト / パッケージ / 公開状況 詳細 / 外部リンク) でそれぞれの sub-component を表示。default は `content`

### 削除 / 撤退

- `PublishReadinessBoard` (`dashboard/src/components/PublishReadinessBoard.tsx`) の import を `/campaigns/[slug]` から削除。score card に役割吸収。ファイルは残存、UI-fidelity-3 cleanup で削除候補
- `NextActionSummary` (`dashboard/src/components/NextActionSummary.tsx`) の import を `/campaigns/[slug]` から削除。`computeNextActions` は引き続き export されており NextActionList が再利用。`NextActionSummary` 自体は dead code、UI-fidelity-3 cleanup で削除候補
- `<details>詳細情報>` の集約パターンを廃止 → Tabs に置換

### Build verification

- `cd dashboard && npm run build` ✓ 23 routes、TypeScript clean
- `npm run build` ✓ Sanity Studio 7.8s clean

## 理由

- **Tabs を hand-roll した**: shadcn `add tabs` は 4 package を一度に入れるため、本 phase 1 component のためには重い。hand-roll 150 line で同等の accessibility (Arrow/Home/End keys + ARIA + tabIndex management) を達成。boss が後に shadcn 全面採用に動いた場合は置換 1 段で済む
- **PublishingScheduleTable で `selectedPlatforms` を補完**: `manualPublishingStatus` が 4 件しか登録されていない campaign でも、選択媒体が 6 件あれば追加 2 行を「未追跡」として可視化。boss が「実際にどの媒体を運用予定なのか」を 1 表で読める
- **PublishReadinessScore の算出を deterministic に**: publishing 70 + visual 30 の固定重み。`scoreOverride` prop で将来 reactionNotes 重み等を導入できる柔軟性は残した
- **Tabs default は `content`**: ライフサイクル冒頭の `Content Idea` を最初に開いて campaign の「中心主張」を確認できるようにする
- **Header actions の `編集` / `共有` を disabled placeholder**: reference には存在するため UI を消さない、Phase UI-3+ (`編集 → Sanity Studio link or inline form`) / UI-7+ (`共有 → share link`) で本実装
- **`<details>` から Tabs へ**: UI-2 時点で 9 sections を 1 つの `<details>` に折り畳んでいたが、boss が「あれ何だったっけ」と毎回開閉する手間。Tabs で「いまどの面を見ているか」が常に視認、横スワイプ的に切替できる
- **`NextActionList` の grouping**: 既存 `NextActionSummary` は同質の warning カードがフラットに並んで「ノイズ感」が強かった。要確認 / 次にやること / 後で対応 の 3 段で優先度を視覚化、tone dot + heading で boss の判断負担を減らす

## 影響

- `/campaigns/[slug]` の見た目が大きく改善、reference に 70-80% 程度到達
- 23 routes すべて build 通過、`/` Dashboard / `/campaigns` list / `/publish-package/[slug]` v0.2 すべて touch なし
- `PageHeader` の `breadcrumb` prop は既存呼び出しに影響なし
- 既存 9 sub-components (ContentIdea / Brand / Platform / Gates / Visuals / Prompts / Package / Publishing / Links) は Tabs 内に同じ props で再配置、内部実装変更なし
- `Tabs` component は今後 Output Management / Knowledge DB / Settings 等で再利用可能
- `Breadcrumb` component は今後すべての detail ページで再利用可能
- shadcn install を見送ったため、依存変更なし

## 次の一手

1. boss が `cd dashboard && npm run dev` で `/campaigns/building-hitori-media-os` を実機確認:
   - Breadcrumb `キャンペーン > {title}`
   - 4 header actions (編集 disabled / 出力を追加 / 公開パッケージへ emerald / 共有 disabled)
   - 4 KPI (公開済み / 確認待ち / 画像・図解 / 選択媒体)
   - LifecyclePipeline 5 stage tone bg
   - 2-col layout (left: CampaignBriefCard + PublishingScheduleTable / right: PublishReadinessScore + NextActionList + ReleaseReviewLinks)
   - Tabs 9 tabs、default content、キーボード Arrow/Home/End 切替
2. boss feedback で microbatch 修正
3. 違和感なければ **Phase UI-fidelity-2 (Output Management)** に着手

並行候補:
- 24-72h 後の reactionNotes 反映バッチ
- Threads 公開判断
- `PublishReadinessBoard` / `NextActionSummary` / `WorkingPipelineStatus` / `NextActionChecklist` / `CampaignStatusCard` / `AppNav` 等の dead-code cleanup
- 残 5 page (Configurator / Publish / Visual Review / Knowledge / Analytics) の fidelity spec 化
