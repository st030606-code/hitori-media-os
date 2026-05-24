# Handoff: Phase UI-fidelity-2 Output Management fidelity implementation

Date: 2026-05-19

## 1. Task Goal

[docs/73 (spec)](../73-output-management-fidelity-spec.md) + [docs/74 (execution plan)](../74-ui-fidelity-execution-plan.md) + boss 確定スコープに従い、`/outputs` PhasePlaceholder を本実装に置換。Reference (`docs/ui-design/ChatGPT Image 2026年5月19日 13_02_43 (4).png`) の見た目に近づける。

## 2. Constraints Followed

- ✅ Sanity 書き込みなし / schema 変更なし
- ✅ publish-package / assets/visuals / patches 不変
- ✅ deploy / auto-post なし
- ✅ 23 routes 動作維持
- ✅ AppShell / Sidebar / Topbar / WorkspaceBlock 無変更
- ✅ `/` / `/campaigns` / `/campaigns/[slug]` / `/publish-package/[slug]` touch なし
- ✅ shadcn select **未導入** (boss 「no」確定 → native select で実装)
- ✅ shadcn templates 未導入
- ✅ パッケージ追加なし

## 3. Changed Files

### 新規 (6)

- `dashboard/src/lib/groq/outputs.ts` — `outputsListQuery` + 型 + `buildOutputRows()` + `countByBucket()` + `countByPlatform()` + `distinctCampaigns()` helpers
- `dashboard/src/components/outputs/OutputsFilterBar.tsx` — client、native select + Tailwind
- `dashboard/src/components/outputs/OutputsTable.tsx` — 7-column DataTable + empty state
- `dashboard/src/components/outputs/OutputsView.tsx` — client wrapper、filter state を `useState` + `useMemo` で
- `dashboard/src/components/outputs/PlatformBreakdownCard.tsx` — server、7 platform tone-bar
- `docs/devlog/0135-ui-fidelity-2-output-management.md`
- `docs/handoff/0146-ui-fidelity-2-output-management.md`（本ファイル）
- `docs/handoff/latest.md`（mirror）

### 更新 (1)

- `dashboard/src/app/outputs/page.tsx` — PhasePlaceholder 削除、本実装に置換 (PageHeader + KpiCardsRow + OutputsView + PlatformBreakdownCard + FallbackNotice)

## 4. Summary of Changes

### `/outputs` layout

```
[PageHeader: 出力管理 + description + 新規出力 CTA (blue)]
[KpiCardsRow:
  全出力 (slate, FileText)
  下書き (purple, Edit3)
  レビュー待ち (orange, Eye)
  公開済み (emerald, CheckCircle2)
]
[2-col grid lg:grid-cols-[2fr_1fr]:
  Left: <OutputsView />
    - OutputsFilterBar (search + 4 selects + reset + 新規出力 CTA)
    - OutputsTable (7 columns)
  Right:
    - PlatformBreakdownCard (7 default platforms, tone-bar)
    - FallbackNotice (when platformOutput / manualPublishing data missing)
]
```

### OutputsTable columns

1. **タイトル** — title + source chip (`platformOutput` or `manualPublishing`) + 公開URL inline link if present
2. **キャンペーン** — campaignTitle (link to `/campaigns/[slug]` when slug present)
3. **媒体** — `<PlatformBadge />` + `platformLabel()`
4. **出力形式** — outputType (e.g. note-article, x-post)
5. **ステータス** — `<StatusBadge state={bucketBadgeState} label={rawStatus}>`
6. **更新日 / 公開日** — `YYYY-MM-DD HH:mm JST` tabular-nums
7. **操作** — ChevronRight → `/publish-package/[slug]#{platform}`

### Data sources (dual-merge strategy)

1. **`platformOutput`** (canonical Sanity type)
   - `_type == "platformOutput"`
   - Fields: title / platform / outputType / status / localOutputPath / sourceContentIdea (deref) / _updatedAt
   - Bucket mapping: `drafted|revised` → draft / `reviewed|ready` → review / `archived` → archived
2. **`campaignPlan.manualPublishingStatus[]`** (proxy for published rows)
   - Fields: platform / state / publishedUrl / publishedAt / reactionNotes
   - Bucket mapping: `state==='done' && publishedUrl` → published / `state==='not-started|in-progress'` → draft / `state==='blocked'` → review
3. **Merge & sort**: `buildOutputRows()` flattens both, sorts by updatedAt desc

building-hitori-media-os の 4 manualPublishingStatus entries (X done / note done / substack done / threads not-started) が proxy row として常に表示。

### FilterBar (native select + Tailwind)

- **検索**: title / campaignTitle / platform / outputType の連結文字列に対する部分一致 (case-insensitive)
- **キャンペーン**: `distinctCampaigns(rows)` から build した options
- **プラットフォーム**: row に出現した unique platform
- **ステータス**: `すべて | 下書き | レビュー待ち | 公開済み | アーカイブ` (bucket 別)
- **ソート**: 更新日 desc (default) / 更新日 asc / タイトル asc
- **リセット**: `DEFAULT_FILTER` 復帰 (active filter なしのときは disabled)
- **新規出力 CTA**: → `/configurator` (Phase UI-4 で本実装、現状は placeholder route)

### Build result

```
Route (app) — 23 routes (placeholder /outputs now full implementation)
TypeScript clean
Sanity Studio build 7.6s clean
```

## 5. Key Decisions

- **Native `<select>` 採用**: boss 「shadcn select: no」確定。Tailwind class で `h-9 rounded-md border-slate-200 shadow-sm focus:ring-blue-100`、reference 画像の見た目に十分近づく。`@radix-ui/react-select` 等 4 dep の追加を回避
- **`platformOutput` + `manualPublishingStatus` を dual-merge**: dataset が両方未整備の状態でも `/outputs` が空にならない。platformOutput が未投入でも building-hitori の 4 行が表示される
- **OutputsView を client component**: filter UX が必要、SSR + URL params は Phase UI-3 で server action 経由に進化させる 2 段戦略
- **共通 DataTable 抽象化を force しない**: boss 指示通り、OutputsTable は page-specific。Campaign Detail の PublishingScheduleTable と平行運用、Phase UI-fidelity-3 cleanup で抽出判断
- **Pagination 未実装**: P2 scope、現状の dataset 規模 (4-50 rows) では不要
- **PlatformBreakdownCard で 0 件 platform も表示**: 未対応 platform を可視化、boss が「次にどこを攻めるか」判断材料に
- **FallbackNotice**: platformOutput / manualPublishingStatus の存在状況を明示、boss が「何を見ているか」混乱しない
- **trend は neutral 「— 前月比」**: UI-2.5 / UI-fidelity-1 と同じ tone、Phase UI-6 で真値

## 6. Human Review Questions

1. **Filter UX**: in-memory filter で十分か、URL bookmark できる server-side filter (Phase UI-3) を先に欲しいか
2. **OutputsTable の行アクション**: 行クリックで `/publish-package/[slug]#{platform}` に飛ぶ設計。boss は「出力詳細ページ」へ飛ばしたい場合、別 route が必要 (Phase UI-3+)
3. **manualPublishingStatus の rawStatus 表記**: 「公開済み / 未着手 / 作業中 / 要対応」で表示。boss が違う日本語ラベルを希望するか
4. **PlatformBreakdownCard default 7 platforms**: x / threads / note / substack / youtube / podcast / diagram。boss が違うセットを希望するか (例: instagram も入れる)
5. **OutputsTable の source chip**: 「platformOutput」「manualPublishing」を行に表示。dev info すぎる場合は `<details>` の中へ移すか
6. **FallbackNotice**: 現状常に右下に表示 (両方データある場合は null)。boss は「常に隠す」を希望するか
7. **新規出力 CTA → /configurator**: Phase UI-4 で本実装まで placeholder。boss は「現状は disabled」のほうが良いか

## 7. Risks or Uncertainties

- **`platformOutput` 投入状況**: dataset 上の存在数を確認していない。0 件でも manualPublishingStatus proxy で 4 行表示されるが、boss が「platformOutput を投入しよう」と判断したら本ページの主役 source が切替わる
- **client-side filter のパフォーマンス**: rows が数百件を超えると in-memory filter が重くなる。現状 dataset 規模では問題なし、Phase UI-3 で server-side に進化
- **OutputsTable の行重複可能性**: 同じ campaign × platform で platformOutput と manualPublishingStatus の両方が存在すると 2 行表示される。仕様としては「出力の各 lifecycle stage を別行で見せる」と解釈可能だが、boss が「1 行に統合したい」場合は別ロジックが必要
- **filter state を URL に乗せていない**: ページリロードで filter がリセットされる。Phase UI-3 で `useSearchParams` + Server Component 渡しに進化
- **Pagination 未実装**: 100 件超えると一気に重くなる。GROQ で `[0..99]` 上限を設定済、超過時は warning 表示すべき (UI-fidelity-3 で検討)
- **trend 表示の解釈**: 「— 前月比」が dashboard / campaign detail / outputs 全部で同じ。boss が「real data 無いなら表示するな」と判断する可能性

## 8. Recommended Next Step

1. boss が `cd dashboard && npm run dev` を起動して `/outputs` 確認 (5 manual check 項目)
2. UI 細部の調整 microbatch
3. 違和感なければ次の選択肢:
   - **Phase UI-fidelity-3: Dashboard polish** — UI-2.5 残 P1 (TodayTasks 時刻表記 / Configurator select 微調整 / Sidebar nav 高さ / RecentOutputs 実テーブル流用) + 3 page 全体 tone 統一
   - **Publish Management fidelity spec** — `/publish` を `13_02_43 (5).png` 準拠で spec 化、別 batch で実装
   - **dead code cleanup** — `PublishReadinessBoard` / `NextActionSummary` / `WorkingPipelineStatus` / `NextActionChecklist` / `CampaignStatusCard` / `AppNav` 削除

並行候補:
- 24-72h 後の reactionNotes 反映バッチ
- Threads 公開判断
- 残 5 page (Configurator / Publish / Visual Review / Knowledge / Analytics) の fidelity spec

## 9. Exact Codex Prompt for Phase UI-fidelity-3 (Dashboard polish)

```text
Implement Phase UI-fidelity-3: Dashboard polish.

References:
- docs/71-dashboard-fidelity-spec-v2.md (P1 / P2 sections)
- docs/74-ui-fidelity-execution-plan.md (Phase UI-fidelity-3)
- docs/handoff/0146-ui-fidelity-2-output-management.md (latest design tone + reusable components)

Hard Rules:
- Do NOT modify Sanity schema.
- Do NOT write to Sanity.
- Do NOT modify publish-package files.
- Do NOT modify assets/visuals or patches.
- Do NOT deploy.
- Do NOT auto-post.
- Keep all 23 routes working.
- Keep AppShell / Sidebar / Topbar / WorkspaceBlock intact.
- Keep /publish-package/[slug] v0.2 untouched.
- Keep /campaigns/[slug] (UI-fidelity-1) untouched (except shared component updates that are unavoidable).
- Keep /outputs (UI-fidelity-2) untouched (except shared component updates).

Package policy:
- Do NOT add packages this batch.
- Reuse OutputsTable design as RecentOutputsTable in Dashboard (or extract to a shared `<RecentOutputsTable>` rendering top 5 outputs from outputsListQuery).

Tasks (Phase UI-2.5 P1 items):

1. TodayTasksCard time display:
   - Bring dueLabel to a more prominent position (right of title)
   - text-[11px] text-slate-500 already; consider tabular-nums for "今日 10:00"-style strings.

2. RecentOutputsTable real data:
   - Replace placeholder with a slim version of OutputsTable (top 5 rows by updatedAt desc)
   - Reuse outputsListQuery (consider sharing via dashboard's home query)

3. ContentOutputConfiguratorCard select height tweak:
   - h-10 → h-9 if reference shows tighter selects
   - or keep h-10 with subtler border

4. Sidebar nav row height:
   - py-2 → py-1.5 for tighter look
   - Verify focus ring still visible

5. KPI sparkline rationality:
   - boss may want to remove placeholder sparkline arrays (it can look like fake data)
   - alternatively, leave them and add a small explanatory note

6. 3-page tone consistency check:
   - Compare /, /campaigns/[slug], /outputs visually
   - Ensure rounded-lg / shadow-sm / spacing / typography all uniform

Validation:
- cd dashboard && npm run build
- npm run build
- Manual check all 4 redesigned pages (/, /campaigns, /campaigns/[slug], /outputs)
- Verify /publish-package/[slug] still works

Docs:
- docs/devlog/<番号>-ui-fidelity-3-dashboard-polish.md
- docs/handoff/<番号>-ui-fidelity-3-dashboard-polish.md
- docs/handoff/latest.md (mirror)
```
