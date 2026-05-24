# UI Fidelity Execution Plan (3 pages)

最終更新: 2026-05-19
ステータス: Execution plan (audit-only batch、コード変更なし)

3 つの fidelity spec を **どの順序で実装するか** + **共通 component の再利用観点で最効率の path** を整理。

## Inputs

- [docs/71-dashboard-fidelity-spec-v2.md](71-dashboard-fidelity-spec-v2.md)
- [docs/72-campaign-detail-fidelity-spec.md](72-campaign-detail-fidelity-spec.md)
- [docs/73-output-management-fidelity-spec.md](73-output-management-fidelity-spec.md)

## 1. Page-level priority summary

| Page | Current state | Gap to ideal | P0 工数感 | 共通 component への影響 |
|---|---|---|---|---|
| Dashboard | UI-2.5 完了 (80-85% に到達) | 残 P1 5 件、P0 なし | 小 (微調整) | 共通 component の追加変更ほぼ無 |
| Campaign Detail | UI-2 + UI-2.5 共有更新済 (50% 程度) | P0 5 件、P1 5 件 | 中 (4 新規 component) | Breadcrumb / PublishingScheduleTable / PublishReadinessScore / NextActionList が新規、Dashboard で再利用候補 |
| Output Management | placeholder のみ (0%) | P0 6 件 (全部新規) | 大 (FilterBar / DataTable / KPI / Platform breakdown / GROQ 新規) | OutputsTable / FilterBar が DataTable 抽象化候補、Campaign Detail と共有可能 |

## 2. Component reuse map

新規 / 修正される component の **再利用可能性** を整理:

| Component | 初出 page | 再利用先 |
|---|---|---|
| Breadcrumb | Campaign Detail | Output Management / 全 detail 系 |
| PublishingScheduleTable | Campaign Detail | (Dashboard RecentOutputs と類似、Phase UI-3 で共通化候補) |
| PublishReadinessScore | Campaign Detail | Dashboard 5 KPI の 1 つに展開可能 |
| NextActionList | Campaign Detail | Dashboard 右列、Phase UI-3 publish 管理 |
| OutputsFilterBar | Output Management | Knowledge DB / Analytics / 他一覧系 |
| OutputsTable (→ DataTable 抽象化候補) | Output Management | Campaigns / Knowledge / Publish 管理 |
| PlatformBreakdownCard | Output Management | Analytics / Dashboard |
| Pagination | Output Management | 全 DataTable 系 |

→ **Output Management を 1 つ作ると DataTable / FilterBar / Pagination が他 page の足場になる**。Campaign Detail を 1 つ作ると Breadcrumb / NextActionList が Dashboard ポリッシュにも使える。

## 3. Recommended execution order

### 🏁 推奨順序: **(1) Campaign Detail → (2) Output Management → (3) Dashboard polish**

理由:

#### (1) Campaign Detail を最初にやる理由

- **Dashboard / Output Management の足場 component を先に作れる**: Breadcrumb / NextActionList / PublishingScheduleTable / PublishReadinessScore が Campaign Detail 必須、後段 page で再利用可能
- **boss の体験的に「campaign を開いて状態を読む」が最頻ワークフロー**。building-hitori-media-os 公開後の reaction メモ書き / Threads 公開判断もここから始まる
- 既存の `<details>` 集約構造を解体 + 再構成するので、structural リワークの中で最大インパクト
- 工数中、Sanity schema / write action なしで完結する

#### (2) Output Management を次にやる理由

- Campaign Detail で抽出した **DataTable / FilterBar / Pagination pattern を再利用** できる
- Campaign Detail でできた **Breadcrumb component** をそのまま使える
- placeholder → 本実装の **0 → 100% フィデリティ達成** で boss が見て分かる成果が出やすい
- データ source (`platformOutput` doc type の dataset 投入確認 + FS scan) で Phase UI-3 着手が前進する
- 工数中、書き込み機能は不要 (read-only listing で fidelity 達成可)

#### (3) Dashboard polish を最後にやる理由

- UI-2.5 で **既に 80-85% 到達済**。残 P1 は微調整中心
- 上記 (1)(2) で抽出した component (PublishReadinessScore / DataTable / Breadcrumb) を Dashboard に逆輸入できる
- 最後にやることで「3 page 全体で tone / spacing / component pattern が統一」される機会を得る
- 工数小

### 別案: なぜ Dashboard → Campaign → Output ではないか

- Dashboard polish は微調整中心で、先にやってもインパクトが小さい
- Campaign Detail / Output Management に必要な component (DataTable / Breadcrumb / NextActionList) が Dashboard には不要 → 先に Dashboard をやっても再利用効果が出ない

### 別案: なぜ Output → Campaign → Dashboard ではないか

- Output Management の DataTable pattern は **Campaign Detail の PublishingScheduleTable と同じ semantic** で共通化したい。Campaign Detail を先にやることで「PublishingScheduleTable と DataTable は実は同じ」と判断 → 共通 component 化のタイミングを取りやすい
- Output Management から始めると、Campaign Detail の Breadcrumb / NextActionList が未作成で重複実装になるリスク

## 4. Phase plan

### Phase UI-fidelity-1: Campaign Detail

詳細は docs/72 §4 (P0 5 件 + P1 5 件)。新規 4 component + page rework + 既存 9 component の再配置。

**新規 component**:
- `dashboard/src/components/common/Breadcrumb.tsx`
- `dashboard/src/components/campaign/PublishReadinessScore.tsx`
- `dashboard/src/components/campaign/PublishingScheduleTable.tsx`
- `dashboard/src/components/campaign/NextActionList.tsx`

**更新**:
- `dashboard/src/components/common/PageHeader.tsx` (breadcrumb prop)
- `dashboard/src/app/campaigns/[slug]/page.tsx` (2-col layout, 補助情報再配置)

**期待効果**:
- Campaign Detail の fidelity 70-80% 到達
- 共通 component (Breadcrumb) が後段で再利用可能
- PublishingScheduleTable が DataTable 抽象化のテストケースに

### Phase UI-fidelity-2: Output Management

詳細は docs/73 §4 (P0 6 件 + P1 4 件 + P2 5 件)。

**新規 component**:
- `dashboard/src/components/outputs/OutputsFilterBar.tsx`
- `dashboard/src/components/outputs/OutputsTable.tsx`
- `dashboard/src/components/outputs/PlatformBreakdownCard.tsx`
- `dashboard/src/components/outputs/OutputActivityFeed.tsx` (P2)
- `dashboard/src/components/common/Pagination.tsx` (P2)

**新規 GROQ**:
- `dashboard/src/lib/groq/outputs.ts` (platformOutput list query + counts)

**新規 / 更新 page**:
- `dashboard/src/app/outputs/page.tsx` (PhasePlaceholder 削除、本実装)

**期待効果**:
- Output Management 0 → 80% フィデリティ達成
- DataTable / FilterBar / Pagination pattern 確立
- データ source 判断: `platformOutput` doc 投入 or FS scan proxy

### Phase UI-fidelity-3: Dashboard polish

詳細は docs/71 §4 (P1 5 件、P2 5 件)。

**更新**:
- `dashboard/src/components/dashboard/TodayTasksCard.tsx` (due 時刻表記強化)
- `dashboard/src/components/dashboard/RecentOutputsTable.tsx` (実テーブル化 — UI-fidelity-2 で抽出した OutputsTable 部分を流用)
- `dashboard/src/components/dashboard/ContentOutputConfiguratorCard.tsx` (select height 微調整)
- `dashboard/src/components/app-shell/Sidebar.tsx` (nav row 高さ微縮)
- `dashboard/src/app/page.tsx` (Breadcrumb 不要、ReleaseReviewLinks 最終配置)

**期待効果**:
- Dashboard が 85% → 95%+
- 3 page 全体で tone / component / layout 整合

## 5. Recommended first batch — Campaign Detail

**Phase UI-fidelity-1: Campaign Detail** を最初に着手することを推奨。

理由:
1. boss の最頻ワークフロー (`/campaigns/[slug]`) を直接改善
2. 後段 (Output Management / Dashboard polish) に再利用される共通 component を最初に作れる
3. 既存 page を「リワーク」する難度なので、ゼロから新規構築 (Output Management) より workflow リスクが小さい
4. Sanity schema / write actions なしで完結

---

## 6. Exact next prompt — Phase UI-fidelity-1 (Campaign Detail)

```text
Implement Phase UI-fidelity-1: Campaign Detail visual fidelity pass.

References:
- docs/72-campaign-detail-fidelity-spec.md (P0/P1 sections, measurable checklist)
- docs/ui-design/ChatGPT Image 2026年5月19日 13_02_42 (2).png (ideal)
- docs/68-hitori-media-os-ui-design-system.md (tokens)
- docs/handoff/0143-ui-2-5-dashboard-fidelity-pass.md (design tone established in UI-2.5)
- docs/74-ui-fidelity-execution-plan.md (this execution plan)

Hard Rules:
- Do NOT modify Sanity schema.
- Do NOT write to Sanity.
- Do NOT modify publish-package files.
- Do NOT modify assets/visuals or patches.
- Do NOT deploy.
- Do NOT auto-post.
- Keep all 23 routes working.
- Keep AppShell / Sidebar / Topbar / WorkspaceBlock intact.
- Keep /publish-package/[slug] v0.2 behavior untouched.
- Keep `/` Dashboard (UI-2.5 state) untouched in this batch.
- Keep `/outputs` placeholder until Phase UI-fidelity-2.

Package policy (Tailwind-first + selective shadcn):
- Only add shadcn primitives if a specific task requires them:
    npx shadcn@latest add tabs       (if <details> is replaced by Tabs)
- Do NOT add templates.
- Wrap Hitori-specific semantics in dashboard/src/components/common/ or campaign/.

Tasks:

1. New common components:
   - dashboard/src/components/common/Breadcrumb.tsx
       props: items: {label: string; href?: string}[]
       last item is current page, no link, slate-900
       separators: ChevronRight 12 text-slate-400
       container text-xs text-slate-500

2. Update PageHeader to accept breadcrumb?:
   - Before title, render Breadcrumb if provided
   - Maintain existing title / description / actions / meta layout

3. New campaign components in dashboard/src/components/campaign/:
   - PublishReadinessScore.tsx
       Large score number (text-4xl tabular-nums)
       Circular progress SVG (radius 40px, tone arc)
       Platform breakdown: X / Threads / note / Substack as dots with ✓/⏳ status
       Subtitle: 「{N}/4 媒体公開済み」
       Tone: emerald when score >= 80, blue 60-79, amber 40-59, slate <40
   - PublishingScheduleTable.tsx
       7-column DataTable
       Columns: 媒体 (PlatformBadge) / タイトル / ステータス / 担当 / 公開予定日 (JST) / actions (ChevronRight)
       Row hover bg-slate-50
       Data from campaign.manualPublishingStatus
   - NextActionList.tsx
       Vertical list (replaces NextActionSummary horizontal cards)
       Each row: icon + title + due + priority tone

4. Update dashboard/src/app/campaigns/[slug]/page.tsx:
   - PageHeader with breadcrumb (キャンペーン > {title})
   - Header right: 「公開準備ボード」outline button + 「公開パッケージを開く」emerald CTA
   - 2-column main layout (lg:grid-cols-[2fr_1fr] gap-5):
       Left:
         - KpiCardsRow (existing 4)
         - LifecyclePipeline (existing)
         - PublishingScheduleTable (new)
       Right:
         - PublishReadinessScore (new)
         - NextActionList (replaces NextActionSummary)
         - Compact ReleaseReviewLinks
   - <details> section at bottom keeps existing 9 sub-sections (ContentIdea / BrandProfile / SelectedPlatformChips / HumanReviewGateList / VisualAssetStatusTable / PromptTemplateSummary / PublishPackageLinks / ManualPublishingStatusList / ExternalLinks)
   - PublishReadinessBoard is removed (its info is absorbed into PublishReadinessScore)

5. Compatibility:
   - Existing 9 sub-components in <details> keep their props
   - StatusBadge / PlatformBadge / KpiCard / LifecyclePipeline reused
   - No changes to /campaigns list or /publish-package

Validation:
- cd dashboard && npm run build
- npm run build
- Manual check at /campaigns/building-hitori-media-os:
    - Breadcrumb renders
    - 2 CTAs in header
    - PublishReadinessScore card shows 4-platform breakdown
    - PublishingScheduleTable shows 4 manual publishing rows (3 done + 1 pending)
    - NextActionList in right column
    - <details> opens with full 9 sub-sections
- Verify /, /campaigns, /publish-package/building-hitori-media-os untouched

Docs:
- docs/devlog/<番号>-ui-fidelity-1-campaign-detail.md
- docs/handoff/<番号>-ui-fidelity-1-campaign-detail.md
- docs/handoff/latest.md (mirror)

End-of-run summary:
1. Files changed
2. New components
3. Campaign Detail fidelity improvements vs ideal
4. Remaining gaps vs ideal
5. Build validation
6. Next recommended batch: Phase UI-fidelity-2 Output Management
```

---

## 7. Out of scope (本 execution plan の範囲外)

- 残 5 page (Configurator / Publish 公開管理 / Visual Review / Knowledge / Analytics) の fidelity audit — 別バッチで boss 判断
- Sanity schema 変更
- Write actions (Phase UI-3+ で server action 経由)
- Engagement / Analytics 真値 (Phase UI-6)
- shadcn primitive の wholesale 採用
- AppShell / Topbar / Sidebar の structural 変更
