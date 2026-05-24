# Handoff: Phase UI-2.5 Dashboard Visual Fidelity Pass

Date: 2026-05-19

## 1. Task Goal

[docs/70 fidelity audit](../70-dashboard-ui-fidelity-audit.md) で抽出した 5 領域の P0 を boss 確定スコープで適用し、`/` Home の見た目を approved reference に近づける。新規 feature 追加なし、新 route 追加なし。

## 2. Constraints Followed

- ✅ Sanity 書き込みなし / schema 変更なし
- ✅ publish-package / assets/visuals / patches 不変
- ✅ deploy / auto-post なし
- ✅ パッケージ追加なし
- ✅ 23 routes 動作維持
- ✅ AppShell structural grid (280px sidebar / 64px topbar) 無変更
- ✅ `/publish-package/[slug]` v0.2 動作無変更
- ✅ `/campaigns` `/campaigns/[slug]` は **shared component の更新が反映される範囲のみ変更** (KpiCard / LifecyclePipeline)

## 3. Changed Files

### 更新 (7 components + 1 page)

- `dashboard/src/components/app-shell/Sidebar.tsx` — top brand block を `bg-slate-900` に
- `dashboard/src/components/app-shell/Topbar.tsx` — ReadOnlyPill を右側 actions に追加
- `dashboard/src/components/ReadOnlyBanner.tsx` — no-op に変更 (return null)
- `dashboard/src/components/common/KpiCard.tsx` — text-3xl value、tone pill 強化、sparkline、neutral trend
- `dashboard/src/components/common/LifecyclePipeline.tsx` — 全 5 stage tone bg、currentStage ring-2 + CURRENT chip
- `dashboard/src/components/dashboard/ContentOutputConfiguratorCard.tsx` — hero 化 (gradient header + 2 CTA + 強化 select)
- `dashboard/src/components/dashboard/ActiveCampaignsCard.tsx` — 4 tone progress bar + chip + platform badges
- `dashboard/src/app/page.tsx` — layout 全面再構成 (4 row × 2 col)

### 新規 (2)

- `dashboard/src/components/app-shell/ReadOnlyPill.tsx` — Topbar 用 compact pill
- `dashboard/src/components/dashboard/EngagementPlaceholder.tsx` — Phase UI-6 placeholder card (4 metric tile + dashed chart)

### 新規 docs (3)

- `docs/devlog/0132-ui-2-5-dashboard-fidelity-pass.md`
- `docs/handoff/0143-ui-2-5-dashboard-fidelity-pass.md`（本ファイル）
- `docs/handoff/latest.md`（mirror）

## 4. Summary of Changes

### P0 items すべて適用

| Item | 旧 | 新 |
|---|---|---|
| Sidebar header | 全白 | `bg-slate-900` 64px + 白文字ロゴ |
| ReadOnlyBanner | 上部 amber 大型 banner | Topbar 右 `読み取り専用` pill |
| KPI value typography | `text-2xl` | `text-3xl tabular-nums leading-none` |
| KPI icon pill | `h-8 rounded-md` 単一 tone | `h-9 rounded-lg` per-tone (blue/purple/orange/emerald) |
| KPI trend | 未表示 | 「— 前月比」neutral + tone-correct sparkline (placeholder array) |
| LifecyclePipeline stages | currentStage のみ tone bg | 全 5 stage tone bg + currentStage に ring-2 + CURRENT chip |
| LifecyclePipeline icon | text-only color | white/70 浮き上がり pill |
| LifecyclePipeline stage description | 未使用 | 1 行 description 表示 |

### P1 items すべて適用

- ContentOutputConfiguratorCard を hero 化 (gradient + 2 CTA + 強化 select grid)
- Configurator + TodayTasks を upper grid 2-col (65/35) に配置
- ActiveCampaignsCard を polished bar + chip + platform badges
- EngagementPlaceholder を右列下に追加
- ReleaseReviewLinks を下部に移動 (less prominent)
- Home layout を 4 row × 2 col 構造に再構成

### Build result

- `cd dashboard && npm run build`: 23 routes、TypeScript clean
- `npm run build`: Sanity Studio 8.6s clean

### Reference vs current alignment

`docs/70` の checklist (30+ 項目) に対し、本バッチで **約 25 項目を達成**:
- App Shell: dark navy header ✓ / nav 白本体 ✓ / Topbar white ✓
- Page Header: title + description + CTA ✓
- ReadOnly: Topbar pill ✓
- KPI Cards: 5 横並び ✓ / icon-tone pill per-KPI ✓ / trend ✓ / text-3xl value ✓ / sparkline ✓
- ContentOutputConfigurator: hero gradient + 2 CTA + 強化 select ✓
- LifecyclePipeline: 5 stage tone bg ✓ / currentStage ring ✓ / chevron 強化 ✓ / description ✓
- ActiveCampaigns: progress chip + 4 tone bar ✓ / platform badges ✓
- TodayTasks: そのまま (UI-2 完成形)
- LearningInsights: そのまま (UI-2 完成形)
- Right column: ReleaseReviewLinks → EngagementPlaceholder に置換 ✓
- Typography: text-3xl ✓ / section heading font-semibold ✓
- Spacing: gap-5 ✓ / card padding p-5 / p-4 ✓
- Shadow: shadow-sm ✓

未達 (UI-3+ で対応):
- Recent Outputs 実テーブル (UI-3 で `/outputs` データ統合)
- Active Campaigns donut chart (boss が「不採用」確定)
- Engagement summary 実データ (UI-6 Analytics)

## 5. Key Decisions

- **ReadOnlyBanner を no-op で残した**: 全 page から import 削除する PR を膨らませない判断。Phase UI-3+ で write actions 入ったときに再活用候補
- **KPI sparkline は placeholder 配列**: 真の時系列は UI-6 取得。SVG inline で軽量、tone-correct
- **KPI trend は neutral 「— 前月比」**: 捏造数値を避けつつ trend slot の存在を visual に伝える
- **LifecyclePipeline currentStage は ring + CURRENT chip**: 全 stage tone bg にすると currentStage 識別が弱まる → ring-2 + 右上 chip で強化
- **Configurator CTA を 2 箇所に**: header の 下書きを生成 (緑) + footer の 開く (青)。boss の視線がどちらに行っても `/configurator` 到達
- **ActiveCampaigns donut 不採用**: boss 確定。bar の方が一覧 UX には素直、reference 画像でも donut は小さい
- **EngagementPlaceholder は 4 metric tile + dashed chart**: 「公開後の手応えはここに来る」を Phase UI-6 まで明示
- **ReleaseReviewLinks を下部に**: campaign-specific 情報を dashboard 主役から外す。完全削除はせず boss 動線維持

## 6. Human Review Questions

1. **Sidebar dark navy header の色**: `bg-slate-900` で正解か、もう少し青寄り (`bg-blue-900`) や薄め (`bg-slate-800`) が好みか
2. **KPI sparkline placeholder**: 捏造データに見える懸念があれば、`sparkline` prop を `/` から削除して非表示にできる
3. **LifecyclePipeline の "CURRENT" chip 表示**: 邪魔に感じる boss がいたら ring-2 だけで識別する選択肢あり
4. **Configurator 2 CTA**: header + footer の 2 つ並ぶのは過剰か、footer 1 つに集約すべきか
5. **EngagementPlaceholder の 4 metric tile**: 視聴数 / スキ・♥ / 購読・フォロー / 返信・引用。boss が見たい指標と合うか
6. **ReleaseReviewLinks の位置**: 下部移動で大丈夫か、それとも完全削除すべきか
7. **Campaign detail (/campaigns/[slug]) の fidelity audit**: 別 batch で実施する想定で良いか

## 7. Risks or Uncertainties

- **font 影響の累積**: UI-1 で Geist → Inter+Noto Sans JP、UI-2 で text-2xl heading、UI-2.5 で text-3xl KPI value。日本語の visual rhythm が boss の意図とズレている可能性
- **sparkline の解釈**: 数値が hardcoded placeholder のため、boss が「これは何のデータか」と疑問を持つ可能性。caption 等で明示が必要かも
- **LifecyclePipeline 全 stage tone**: 色が多すぎて「ノイズ」と感じる懸念。tone saturation を 50/100 で抑えているが、5 色横並びは目立つ
- **Mobile (lg 未満) の Sidebar 非表示**: nav が消えるため、ReadOnlyPill (`hidden sm:inline-flex`) も組み合わさってモバイル時の状態識別が弱い。drawer + mobile pill は UI-3+ で
- **Configurator の hero gradient**: `bg-gradient-to-br from-blue-50/60 via-white to-purple-50/40` は subtle だが、boss の好みで強すぎる / 弱すぎる判断が分かれる可能性
- **`/campaigns/[slug]` の KpiCard / LifecyclePipeline 変更影響**: shared component 経由で同じ強化が campaign detail にも反映される。意図通りだが boss が「campaign 詳細は dashboard より弱く」と思うかも

## 8. Recommended Next Step

1. boss が `cd dashboard && npm run dev` で manual check
2. P0/P1 のうち boss feedback で微調整したい項目を microbatch
3. 違和感なければ:
   - **Campaign detail fidelity audit** (`/campaigns` / `/campaigns/[slug]` の reference 画像を boss が出せば実施)
   - または **Phase UI-3**: Publish Package v0.3 + /publish + /outputs
4. Dashboard polish v2 が必要な場合のみ追加 microbatch

並行候補:
- 24-72h 後の reactionNotes 反映バッチ
- Threads 公開判断
- 旧 component (AppNav / WorkingPipelineStatus / NextActionChecklist / CampaignStatusCard / 等) の削除 cleanup batch

## 9. Exact Codex Prompt for Phase UI-3 (with v0.2.5 context)

```text
Implement dashboard Phase UI-3: Publish Package v0.3 + /publish + /outputs.

References:
- docs/68-hitori-media-os-ui-design-system.md §3
- docs/69-dashboard-ui-redesign-implementation-plan.md Phase UI-3
- docs/handoff/0143-ui-2-5-dashboard-fidelity-pass.md (latest design tone)

Hard Rules:
- Do NOT modify Sanity schema.
- Do NOT auto-write to Sanity (write via server action wrapper of
  tools/sanity/reflect-publication-state.mjs).
- Do NOT modify publish-package output files.
- Do NOT modify assets/visuals or patches.
- Do NOT deploy.
- Do NOT auto-post.
- Keep all 23 routes + AppShell intact.
- Keep `/publish-package/[slug]` copy UI / published badges functional.
- Reuse the design tone established in UI-2.5: dark navy sidebar header,
  Topbar ReadOnlyPill, text-3xl KPI values, tone bg LifecyclePipeline, etc.

Package policy:
- Add shadcn primitives only when needed, one at a time:
    npx shadcn@latest add input
    npx shadcn@latest add textarea
    npx shadcn@latest add button (optional)
- Do NOT add shadcn templates.
- Wrap Hitori semantics in dashboard/src/components/common/.

Tasks:

1. New publish components in dashboard/src/components/publish/:
   - PublishPackageOverview.tsx
   - ManualPublishCopyPanel.tsx
   - PublishedUrlField.tsx (Input wrapper, inline edit)
   - ReactionNotesField.tsx (Textarea wrapper)
   - PendingPlatformsCard.tsx
   - IncludedAssetsTable.tsx

2. dashboard/src/app/publish-package/[slug]/page.tsx v0.3:
   - Replace inline PublishedStatusBlock with ManualPublishCopyPanel
   - Add URL / reactionNotes inline edit via server action
   - Keep v0.2 copy UI / badges / image paths

3. dashboard/src/app/publish/page.tsx:
   - Full-page DataTable: campaign × platform manualPublishingStatus
   - Status / publishedAt JST / inline URL edit
   - Threads pending highlighted

4. dashboard/src/app/outputs/page.tsx:
   - FS scan of outputs/ + Sanity platformOutput
   - DataTable view

5. dashboard/src/lib/actions/persistPublication.ts:
   - Server action wrapping tools/sanity/reflect-publication-state.mjs
   - Dry-run on change preview, execute on explicit "保存" button
   - Server-only, no token to client

Validation:
- cd dashboard && npm run build
- npm run build
- Verify /publish-package v0.3 URL inline edit works
- Verify v0.2 copy UI still works

Docs:
- docs/devlog/<番号>-ui-3-publish-package-management.md
- docs/handoff/<番号>-ui-3-publish-package-management.md
- docs/handoff/latest.md (mirror)
```
