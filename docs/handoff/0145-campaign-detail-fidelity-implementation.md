# Handoff: Phase UI-fidelity-1 Campaign Detail fidelity implementation

Date: 2026-05-19

## 1. Task Goal

[docs/72](../72-campaign-detail-fidelity-spec.md) + [docs/74 §6](../74-ui-fidelity-execution-plan.md) で確定した spec を `/campaigns/[slug]` に適用し、reference (`docs/ui-design/ChatGPT Image 2026年5月19日 13_02_42 (2).png`) の見た目に近づける。Dashboard / Output Management / `/publish-package` は touch しない。

## 2. Constraints Followed

- ✅ Sanity 書き込みなし / schema 変更なし
- ✅ publish-package output / assets/visuals / patches 不変
- ✅ deploy / auto-post なし
- ✅ 23 routes 動作維持
- ✅ AppShell / Sidebar / Topbar / WorkspaceBlock 無変更
- ✅ `/` Dashboard touch なし
- ✅ `/campaigns` list touch なし
- ✅ `/publish-package/[slug]` v0.2 touch なし
- ✅ `/outputs` placeholder touch なし
- ✅ shadcn `Tabs` の導入は **見送り**（hand-roll で対応、boss override 可、§5 参照）
- ✅ パッケージ追加なし

## 3. Changed Files

### 新規 (5 + 3 docs)

- `dashboard/src/components/common/Tabs.tsx` — accessibility 対応 Tabs primitive (Tailwind hand-roll)
- `dashboard/src/components/common/Breadcrumb.tsx` — Breadcrumb component
- `dashboard/src/components/campaign/PublishReadinessScore.tsx` — 大型 score + 円形 SVG progress + 4 platform 行 + 3 metric tile
- `dashboard/src/components/campaign/PublishingScheduleTable.tsx` — 6-column DataTable
- `dashboard/src/components/campaign/NextActionList.tsx` — 3-group 縦並び list
- `docs/devlog/0134-campaign-detail-fidelity-implementation.md`
- `docs/handoff/0145-campaign-detail-fidelity-implementation.md`（本ファイル）
- `docs/handoff/latest.md`（mirror）

### 更新 (2)

- `dashboard/src/components/common/PageHeader.tsx` — `breadcrumb?: BreadcrumbItem[]` prop を追加 (既存呼び出し影響なし)
- `dashboard/src/app/campaigns/[slug]/page.tsx` — 全面 rework (Breadcrumb / 4 actions / KPI / Lifecycle / 2-col main / Tabs section)

### dead code 化 (削除せず、UI-fidelity-3 cleanup 候補)

- `dashboard/src/components/PublishReadinessBoard.tsx` — import 撤退
- `dashboard/src/components/NextActionSummary.tsx` — page から import 撤退、`computeNextActions` は `NextActionList` から引き続き使用

## 4. Summary of Changes

### Campaign Detail layout (new)

```
[Breadcrumb: キャンペーン > {title}]
[PageHeader title + coreThesis description + meta + 4 actions]
[KpiCardsRow (4): 公開済み / 確認待ち / 画像・図解 / 選択媒体]
[LifecyclePipeline 5 stage (per-campaign tone bg + ring)]
[2-col grid lg:grid-cols-[2fr_1fr]:
  Left:
    CampaignBriefCard (coreThesis + targetReader + 元アイデア)
    PublishingScheduleTable (6-column)
  Right:
    PublishReadinessScore (大型 score + circular progress + 4 platform + 3 metric)
    NextActionList (3 group)
    ReleaseReviewLinks
]
[詳細 section with Tabs (9 tabs):
  Content Idea | ブランド | 媒体 | 確認ゲート | 画像・図解 |
  プロンプト | パッケージ | 公開状況 (詳細) | 外部リンク
]
```

### Header actions (4)

- **編集** (disabled placeholder, Phase UI-3+)
- **出力を追加** → `/configurator`
- **公開パッケージへ** → `/publish-package/{slug}` (emerald primary CTA)
- **共有** (icon-only disabled placeholder, Phase UI-7+)

### PublishReadinessScore detail

- 円形 progress: 120×120 SVG、tone は score 帯 (>=80 emerald / >=60 blue / >=40 amber / else slate)
- Score 算出: `publishingDone / publishingTotal * 70 + visualsDone / visualsTotal * 30`
- 4 platform 行: X / Threads / note / Substack with ✓公開済み / ⏳未公開 / —未追跡
- 3 metric: 公開済み {N}/{total} / 未公開 {N} / 画像 {saved}/{total} + 保留 {N}

### PublishingScheduleTable detail

- 6 columns: 媒体 (PlatformBadge + label) / 出力種別 / 状態 (StatusBadge or `未追跡`) / 公開日時 (JST short) / URL (external link) / actions (ChevronRight to publish-package)
- Data: `manualPublishingStatus` primary、`selectedPlatforms` を補完して未追跡媒体も表示

### NextActionList detail

- 既存 `computeNextActions(campaign)` を import + bucket:
  - 要確認 (warn / now): rose tone dot
  - 次にやること (soon): amber tone dot
  - 後で対応 (later / done): slate tone dot
- 各 item: icon + title + detail、tone 別 icon (AlertCircle / ArrowRight / CheckCircle2 / Circle)
- Footer: 公開パッケージへの link

### Tabs section

- 9 tabs (`content` / `brand` / `media` / `gates` / `visuals` / `prompts` / `package` / `publishing` / `links`)
- defaultValue `content`
- Keyboard: Arrow Left/Right で循環、Home / End で 先頭 / 末尾、focus は visibility あり
- ARIA: `role="tablist|tab|tabpanel"` + `aria-controls` + `aria-labelledby` + `aria-selected` + `tabIndex={active ? 0 : -1}`
- 各 TabContent は既存 sub-component を default props で render

### Build result

- `cd dashboard && npm run build`: 23 routes、TypeScript clean
- `npm run build`: Sanity Studio 7.8s clean

## 5. Key Decisions

- **shadcn `Tabs` を見送り hand-roll**: boss 「shadcn tabs: yes」を受けつつも、Hard Rule「Add only shadcn tabs if necessary」と Tailwind-first policy を尊重し、150 line の TypeScript で accessibility 完備の Tabs を実装。`@radix-ui/react-tabs` / `clsx` / `tailwind-merge` / `class-variance-authority` の 4 dep 追加を回避。boss が後に「やはり shadcn primitive を使う」と判断した場合は別 microbatch で置換可能
- **`Tabs` を `common/` 配下に**: 今後 Output Management / Knowledge DB / Settings で再利用予定
- **Score を 70/30 重みで derive**: publishing が主、visual が補助。`scoreOverride` prop で boss が真値を渡せる経路を残した
- **`PublishingScheduleTable` で `selectedPlatforms` を補完**: `manualPublishingStatus` だけだと運用予定だが未追跡の媒体が見えない、boss が「全媒体の全体感」を 1 表で把握できる UX
- **`<details>` を Tabs に**: UI-2 の 9 sections 集約 → Tabs に分解、boss の認知負担減
- **`NextActionList` の 3 group**: warning カードのフラット並びを廃止、優先度別 grouping で視線誘導
- **`PublishReadinessBoard` を score に吸収**: building-hitori-media-os hardcoded だった旧 board は score derive で動的化、boss の運用に近い

## 6. Human Review Questions

1. **Hand-roll Tabs**: shadcn primitive にしたい場合は別 microbatch で置換 (npx shadcn add tabs)。boss の優先順位は?
2. **Score 算出**: 70/30 重み (publishing / visual) で良いか、boss が重み調整を希望するか
3. **PublishingScheduleTable の未追跡行**: `selectedPlatforms` 補完で「未追跡」行を出している。これが UX 上自然か、不要なら `manualPublishingStatus` 完全一致だけに絞る
4. **`編集` / `共有` action のラベル / icon**: reference にあるが現状 disabled placeholder。`編集` は `Sanity Studio` link でも良いか
5. **9 Tabs の順序**: `content / brand / media / gates / visuals / prompts / package / publishing / links` 順。boss が違う順序を希望するか
6. **`ReleaseReviewLinks` を右 sidebar 下**: 配置として適切か、補助情報 Tabs の中に移したほうが良いか
7. **`CampaignBriefCard` の coreThesis 表示**: PageHeader の description にも同じ coreThesis、重複か。boss が片方を残したい場合は別 microbatch

## 7. Risks or Uncertainties

- **Tabs default `content`**: boss が「campaign を開いたら publishing 状況をまず見たい」と感じる場合は defaultValue を `publishing` に変える microbatch 必要
- **PublishReadinessScore の score 数値**: `manualPublishingStatus` が dataset 上 4 件のみのため小規模、boss の認知と algorithm がずれる可能性
- **`computeNextActions` を NextActionSummary から import**: `Action` 型が internal。TypeScript 推論で動作中だが、将来 NextActionSummary を削除する際は `Action` / `ActionTone` を `lib/` に切り出す必要
- **9 Tabs はスクロール幅大**: lg 未満では wrap、`TabsList` の `flex-wrap` で対応済だが boss の幅嗜好で見え方変わる
- **`PublishReadinessBoard` / `NextActionSummary` を削除せず**: dead code の GC は UI-fidelity-3 cleanup 想定、build には影響なし
- **`Tabs` の SSR**: useState + useId のため `'use client'`。Tabs 切替時のみクライアント JS が動作、initial render は server で content tab がレンダーされる

## 8. Recommended Next Step

1. boss が `cd dashboard && npm run dev` を起動して `/campaigns/building-hitori-media-os` を実機確認 (Breadcrumb / 4 actions / KPI / Lifecycle / 2-col main / Tabs の動作 + キーボード切替)
2. UI 細部の調整は microbatch (defaultValue 変更 / 順序入替 / hand-roll → shadcn 置換 等)
3. 違和感なければ **Phase UI-fidelity-2: Output Management** に着手
   - 新規 component: OutputsFilterBar / OutputsTable / PlatformBreakdownCard / Pagination
   - 新規 GROQ: `outputs.ts` (platformOutput list + counts)
   - `/outputs` placeholder 削除、本実装に置換
   - Campaign Detail で抽出した DataTable pattern (PublishingScheduleTable) を `OutputsTable` で再利用検討
   - Breadcrumb 再利用 (`出力管理` 単独 or breadcrumb なし)

並行候補:
- 24-72h 後の reactionNotes 反映バッチ
- Threads 公開判断
- dead code cleanup (`PublishReadinessBoard` / `NextActionSummary` / `WorkingPipelineStatus` / `NextActionChecklist` / `CampaignStatusCard` / `AppNav` 等)
- 残 5 page (Configurator / Publish / Visual Review / Knowledge / Analytics) の fidelity spec

## 9. Exact Codex Prompt for Phase UI-fidelity-2

```text
Implement Phase UI-fidelity-2: Output Management fidelity implementation.

References:
- docs/73-output-management-fidelity-spec.md (P0/P1 sections, measurable checklist)
- docs/ui-design/ChatGPT Image 2026年5月19日 13_02_43 (4).png (ideal)
- docs/68-hitori-media-os-ui-design-system.md (tokens)
- docs/handoff/0145-campaign-detail-fidelity-implementation.md (latest design tone)

Hard Rules:
- Do NOT modify Sanity schema.
- Do NOT write to Sanity.
- Do NOT modify publish-package files.
- Do NOT modify assets/visuals or patches.
- Do NOT deploy.
- Do NOT auto-post.
- Keep all 23 routes working.
- Keep AppShell / Sidebar / Topbar / WorkspaceBlock intact.
- Keep `/publish-package/[slug]` v0.2 unchanged.
- Keep `/` Dashboard (UI-2.5) unchanged.
- Keep `/campaigns/[slug]` (UI-fidelity-1) unchanged.

Package policy:
- Add shadcn primitives only if needed, one at a time:
    npx shadcn@latest add select   (if filter selects need it)
- Do NOT add shadcn templates.
- Hand-rolled Tabs is in dashboard/src/components/common/Tabs.tsx — reuse if applicable.

Tasks:

1. New common components:
   - dashboard/src/components/common/Pagination.tsx (P2 — defer if not needed in MVP)
   - dashboard/src/components/common/DataTable.tsx (optional abstraction extracted from PublishingScheduleTable + OutputsTable, defer if it requires more thought)

2. New outputs components:
   - dashboard/src/components/outputs/OutputsFilterBar.tsx
       - 4 selects: キャンペーン / プラットフォーム / 出力ステータス / ソート順
       - 検索 input (任意 by title)
       - 新規作成 primary CTA → /configurator
   - dashboard/src/components/outputs/OutputsTable.tsx
       - 7-column DataTable (タイトル / キャンペーン / プラットフォーム / ステータス / 担当 / 公開予定日 / actions)
       - Row hover bg-slate-50
   - dashboard/src/components/outputs/PlatformBreakdownCard.tsx
       - right sidebar
       - 10 platform 行 with count
   - dashboard/src/components/outputs/OutputActivityFeed.tsx (P2)

3. New GROQ helper:
   - dashboard/src/lib/groq/outputs.ts
     - outputs list query (try platformOutput doc; if dataset is empty,
       fall back to deriving from campaignPlan.manualPublishingStatus
       across all campaigns)
     - per-status counts: 全出力 / 下書き / レビュー待ち / 公開済み

4. Update dashboard/src/app/outputs/page.tsx:
   - Delete PhasePlaceholder
   - PageHeader title「出力管理」+ description + 新規作成 CTA
   - OutputsFilterBar
   - KpiCardsRow (4 status metrics: 全/下書き/レビュー/公開、per-tone sparkline placeholder)
   - 2-col grid lg:grid-cols-[2fr_1fr]:
       Left: OutputsTable + (P2) Pagination
       Right: PlatformBreakdownCard + (P2) OutputActivityFeed
   - reuse Breadcrumb if applicable (出力管理 単独で breadcrumb なしでも可)

5. Sidebar active state:
   - 既存 navigation.ts の `outputs` key は `/outputs` をマップ済、active 確認

Validation:
- cd dashboard && npm run build
- npm run build
- Manual check at /outputs:
  - PageHeader title 出力管理
  - FilterBar shows 4 selects + 検索 + 新規作成
  - KPI row shows 4 status metrics
  - OutputsTable shows rows derived from manualPublishingStatus (and selectedPlatforms補完)
  - Right sidebar shows PlatformBreakdownCard

Docs:
- docs/devlog/<番号>-ui-fidelity-2-output-management.md
- docs/handoff/<番号>-ui-fidelity-2-output-management.md
- docs/handoff/latest.md (mirror)
```
