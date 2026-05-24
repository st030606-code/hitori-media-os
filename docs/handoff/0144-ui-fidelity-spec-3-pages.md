# Handoff: UI Fidelity Spec for 3 Pages (docs only)

Date: 2026-05-19

## 1. Task Goal

approved reference screenshot を source of truth として、3 page (Dashboard / Campaign Detail / Output Management) の **実装可能な fidelity spec** を一括で書く。実装変更なし、boss が次バッチで着手するための仕様 + 実行順序を docs に確定する。

## 2. Constraints Followed

- ✅ docs-only batch、コード変更なし
- ✅ Sanity schema / 書き込み なし
- ✅ publish-package output / assets/visuals / patches 不変
- ✅ deploy / auto-post なし
- ✅ パッケージ追加なし
- ✅ 既存 23 routes 動作維持
- ✅ AppShell / Sidebar / Topbar 無変更

## 3. Changed Files

新規 (6 docs + 1 mirror):

- `docs/71-dashboard-fidelity-spec-v2.md` — Dashboard fidelity spec (post UI-2.5)
- `docs/72-campaign-detail-fidelity-spec.md` — Campaign Detail fidelity spec
- `docs/73-output-management-fidelity-spec.md` — Output Management fidelity spec
- `docs/74-ui-fidelity-execution-plan.md` — 実行順序 + 推奨 first batch + Phase UI-fidelity-1 Codex prompt
- `docs/devlog/0133-ui-fidelity-spec-3-pages.md`
- `docs/handoff/0144-ui-fidelity-spec-3-pages.md`（本ファイル）
- `docs/handoff/latest.md`（mirror）

実装ファイルは一切変更なし。

## 4. Summary of Changes

### docs/71 Dashboard

UI-2.5 で 80-85% に到達済。残 P1 5 件 (TodayTasks 時刻表記 / RecentOutputs 実テーブル / Configurator select 微調整 / Sidebar nav 高さ / KPI trend 真値) + P2 5 件。

### docs/72 Campaign Detail

Current は UI-2 + UI-2.5 共有更新済だが ideal とは structural に違う:

**Missing sections**:
- HorizontalStatRow (4-5 metric)
- PublishReadinessScore (大型 score + circular progress + 媒体内訳)
- PublishingScheduleTable (公開予定 7-column DataTable)
- CampaignCalendar / Timeline
- AISummary / RecentActivityTimeline
- Breadcrumb

**Wrong sections**:
- `<details>詳細情報>` 9 section 集約 → 主役 (PublishingSchedule / Activity) + 補助 (ContentIdea / Brand 等) で分離
- NextActionSummary (横 cards) → NextActionList (縦 list 右列)

P0 5 件、P1 5 件、P2 4 件。

### docs/73 Output Management

Current は placeholder のみ。Ideal は本格的な 1 画面構成:

**新規構築すべて**:
- FilterBar (4 select + 検索 + 新規作成 CTA)
- KpiCardsRow (per-status 4 metric)
- OutputsTable (7-column DataTable)
- PlatformBreakdownCard (右 sidebar)
- OutputActivityFeed (右 sidebar、P2)
- Pagination (P2)

P0 6 件、P1 4 件、P2 5 件。新規 GROQ (`outputs.ts`) + data source 判断 (platformOutput doc vs manualPublishingStatus proxy vs FS scan) も含む。

### docs/74 Execution Plan

3 page 全体の **推奨実装順序**:

```
(1) Campaign Detail  → 足場 component (Breadcrumb / DataTable pattern) を抽出
(2) Output Management → Campaign Detail で抽出した pattern を再利用
(3) Dashboard polish → 上記 2 page の component を逆輸入、3 page で tone 統一
```

別案 (Dashboard first / Output first) の却下理由も明記。

**Recommended first batch**: Phase UI-fidelity-1 (Campaign Detail)。Codex prompt template を §6 に準備。

## 5. Key Decisions

- **3 page を一括 spec 化**: 各 page ad-hoc 修正だと「全体 tone 不整合」「component 重複実装」リスク
- **measurable checklist (35-40 項目/page)**: 「ideal に近づける」だけだと完了判定がぶれる
- **Campaign Detail first を推奨**: 共通 component (Breadcrumb / DataTable pattern / NextActionList) が後段で再利用、boss 最頻ワークフロー、リスク中
- **Output Management second**: Campaign Detail の DataTable pattern を再利用、0 → 100% の boss 視認効果大
- **Dashboard polish last**: UI-2.5 で十分高い fidelity、最後に 3 page で tone 統一の機会
- **shadcn selective adoption 継続**: Phase UI-fidelity-1 着手時に `tabs` 等の primitive を 1 件ずつ判断
- **5 page は本 spec の範囲外**: Configurator / Publish 公開管理 / Visual Review / Knowledge / Analytics は別バッチで同様 spec 化可能、reference 画像は全部揃っている

## 6. Human Review Questions

1. **Execution order**: `(1) Campaign Detail → (2) Output → (3) Dashboard polish` で良いか、別順序を希望か
2. **Phase UI-fidelity-1 着手前の判断点**: `<details>` を shadcn `Tabs` に置き換えるか、現状の `<details>` 9 sections 集約のまま分割するか
3. **Output Management のデータ source**: `platformOutput` doc を Sanity に投入するか、`manualPublishingStatus` を proxy にするか、FS scan を使うか (Phase UI-fidelity-2 着手前に確定)
4. **CampaignCalendar / RecentActivityTimeline**: P2 にしたが、boss が dashboard 体感として欲しい場合は P1 に格上げ判断
5. **Dashboard polish の trend 真値**: 「— 前月比」placeholder のままで OK か、boss-confirmed hardcoded 数値を入れるか
6. **残 5 page の spec 化要否**: 本 batch では 3 page のみ、Configurator / Publish / Visual Review / Knowledge / Analytics の fidelity spec を後続でやるか

## 7. Risks or Uncertainties

- **Current Campaign Detail / Output Management の screenshot 未取得**: spec はコードベースから推論。実機の見え方と齟齬が出る可能性、Phase UI-fidelity-1 着手前に boss が dev 起動して `/campaigns/building-hitori-media-os` を確認推奨
- **DataTable 抽象化のタイミング**: Phase UI-fidelity-1 で PublishingScheduleTable を作り、Phase UI-fidelity-2 で OutputsTable を作る順序。共通 `<DataTable>` 抽出は Phase UI-fidelity-3 のクリーンアップで実施する判断、それまでは個別実装
- **Output Management の `platformOutput` doc 未投入リスク**: Sanity dataset に該当 doc が無ければ proxy 実装にフォールバック、boss 判断機会を Phase UI-fidelity-2 着手前に持つ
- **Recharts / 大型 chart の判断**: Engagement / Analytics 真値が必要になった時点 (Phase UI-6) で `Recharts` を入れるか、HTML/CSS 直書きでとどめるかの判断点
- **共通 component の所在ディレクトリ**: 現在 `dashboard/src/components/common/` と `dashboard/src/components/campaign/`、`dashboard/src/components/outputs/` 等で分けていく方針。共通化が進むと dir 整理が必要、Phase UI-fidelity-3 で再判断

## 8. Recommended Next Step

1. boss が 4 docs を音読、特に **docs/74 §3 (執行順序)** と **§6 (Phase UI-fidelity-1 Codex prompt)** を確認
2. Execution order に違和感あれば microbatch で 4 docs 修正
3. 違和感なければ **Phase UI-fidelity-1 (Campaign Detail)** に着手:
   - docs/72 + docs/74 §6 の prompt を Codex に渡す
   - 新規 component: Breadcrumb / PublishReadinessScore / PublishingScheduleTable / NextActionList
   - 既存 PageHeader 更新 (breadcrumb prop)
   - `/campaigns/[slug]` page rework
4. Phase UI-fidelity-1 完了後 → **Phase UI-fidelity-2 (Output Management)**
5. 最後に **Phase UI-fidelity-3 (Dashboard polish)**

並行候補 (UI と独立):
- 24-72h 後の reactionNotes 反映バッチ
- Threads 公開判断
- 残 5 page (Configurator / Publish 公開管理 / Visual Review / Knowledge / Analytics) の fidelity spec 化
- 旧 component (AppNav / WorkingPipelineStatus / NextActionChecklist / CampaignStatusCard / PublishReadinessBoard) の削除 cleanup batch

## 9. Exact Codex Prompt for Phase UI-fidelity-1

[docs/74 §6](../74-ui-fidelity-execution-plan.md) に full template が記録済。boss 確定の判断 (例: `<details>` → `Tabs` y/n) を埋めて使用する。
