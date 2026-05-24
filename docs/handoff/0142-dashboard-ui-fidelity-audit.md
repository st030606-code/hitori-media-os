# Handoff: Dashboard UI Fidelity Audit (docs only)

Date: 2026-05-19

## 1. Task Goal

UI-2 完了後、boss から「approved reference と実機が見た目で合っていない」フィードバック。reference mockup と実機 screenshot を視覚的に突き合わせ、**なぜ違うのか** を文書化する。実装変更はしない。次の Phase UI-2.5 で fidelity 修正を別バッチで実施する判断材料を作る。

## 2. Constraints Followed

- ✅ Audit-only、dashboard runtime code 変更なし
- ✅ Sanity schema / 書き込み なし
- ✅ publish-package output / assets/visuals / patches 不変
- ✅ deploy / auto-post なし
- ✅ パッケージ追加なし
- ✅ 既存 23 routes 動作維持

## 3. Changed Files

新規 (3 docs + 1 mirror):

- `docs/70-dashboard-ui-fidelity-audit.md` — 15 セクションの視覚差分 + チェックリスト
- `docs/devlog/0131-dashboard-ui-fidelity-audit.md` — 本 audit の決定記録
- `docs/handoff/0142-dashboard-ui-fidelity-audit.md`（本ファイル）
- `docs/handoff/latest.md`（mirror）

実装ファイルは一切変更なし。

## 4. Summary of Changes

### Audit framing

reference image (`docs/ui-design/ChatGPT Image 2026年5月19日 13_02_42 (1).png`) と current screenshot を比較し、視覚差分を 15 セクション (App Shell / PageHeader / ReadOnlyBanner / KPI / Configurator / LifecyclePipeline / ActiveCampaigns / RecentOutputs / TodayTasks / LearningInsights / Right column / Density / Typography / Shadow / Color) に分解した。

各セクションで:
- current の状態
- reference の目標挙動
- 修正対象 file
- 実装リスク
- P0 / P1 / P2 priority

### Verdict: 5 領域に P0 が集まる

`docs/70` の overall verdict より:

1. **Sidebar dark navy header** — 上部 64-88px を dark navy 系で塗り、ロゴを白文字
2. **ReadOnlyBanner 縮小** — 大型 amber banner を Topbar 内 pill か `<details>` で初期折り畳み
3. **KPI cards icon-tone-pill + trend** — semantic tone を per-KPI で使う + trend indicator (placeholder OK)
4. **LifecyclePipeline 全 5 stage tone** — currentStage のみ着色 → 全 stage 着色 + currentStage は ring
5. **Layout density** — Configurator + Today's Tasks の 2-col 上段配置に

これらを直すだけで「approved design に見える」体感の 80%+ に到達できる、と判断。

### Visual fidelity checklist

docs/70 §Dashboard Visual Fidelity Checklist に Phase UI-2.5 完了判定の **measurable check** を 30+ 項目で並べた。bool で評価できる粒度に分解。

### 追加デザインパスの要否

**Phase UI-2.5 では不要**。`/` Home の audit に reference 2 枚で十分。

ただし Phase UI-6 (Engagement summary の chart) と UI-5 (Visual Review の zoom / comment pin) では追加 mockup があると判断が早い、と note。

### /campaigns / /campaigns/[slug] 系は別バッチ

本 audit は `/` Home 限定。campaign 系 route の fidelity audit は boss が `/campaigns` / `/campaigns/[slug]` の reference image を別途出してから対応。

## 5. Key Decisions

- **audit-only バッチに切った**: docs を 1 段挟むことで boss が「どこまで直すか」を decide できる
- **P0/P1/P2 で priority 化**: スコープを小さく切る選択肢を残す
- **likely file を各項目に明記**: 次の Codex prompt が「どこを触るか」を即特定できる
- **/campaigns 系を除外**: スコープが膨らみすぎる、Home が直れば 80% 体感達成
- **Engagement placeholder を UI-2.5 範囲に**: ReleaseReviewLinks の置換だけで右列全体感が改善、UI-6 を待たない
- **trend を hardcode placeholder で**: 真値は UI-6 (Analytics) だが、視覚的には KPI 下に trend がある/ない で印象が大きく違うので、UI-2.5 で boss-confirmed placeholder を入れる

## 6. Human Review Questions

1. **P0 (5 領域) を Phase UI-2.5 のスコープにして良いか**？ それとも更に絞る（例: P0 のうち 1-3 だけ先）
2. **ReadOnlyBanner の最終形**: (a) 完全削除 / (b) Topbar pill 化 / (c) `<details>` 折り畳み。boss はどれを推すか
3. **KPI trend placeholder**: boss-confirmed の「placeholder 値」を使うか、それとも「データ収集中」表示にするか
4. **Engagement summary placeholder**: 「Phase UI-6 で実装予定」プレースホルダで OK か、それとも仮の数値 grid を入れるか
5. **Active Campaigns の donut chart**: 簡易 SVG arc で実装してよいか、それとも UI-6 まで「強化 bar」にとどめるか
6. **Dark navy header** の色: `bg-slate-900` / `bg-blue-900` / 専用 token どれが良いか (design system §4 を踏襲するなら `bg-slate-900`)
7. **campaign 系の fidelity audit** 要否: boss が `/campaigns` / `/campaigns/[slug]` の reference を持っているか

## 7. Risks or Uncertainties

- **Reference image の解像度**: 1 枚 PNG なので細部の hex 値 / pixel 寸法は推測。実装後に boss が「もう少し small / large」と微調整する余地大
- **trend indicator の文化的影響**: 「+12% 前月比」のような placeholder 数値を入れると、UI-6 で真値に置き換えるまで「捏造データ」感が残る。「— 前月比」のような中性表示も候補
- **5 stage 全 tone**: 着色を強くすると「アイコン+色のノイズ」が増えて静かな仕上がりから離れる懸念。tone の彩度を 50/100 で抑える設計が必要
- **dark navy sidebar header**: 現状の white sidebar との対比が boss にとって「重い」と感じる可能性、その場合は薄い (slate-200 → slate-800 のグラデ) も候補
- **/campaigns 系の fidelity 状態**: 同 audit を未実施。boss が campaign 系も「合っていない」と判断すれば追加バッチが必要

## 8. Recommended Next Step

順序:

1. boss が `docs/70-dashboard-ui-fidelity-audit.md` を音読、P0/P1/P2 のスコープを確定（特に上記 Human Review Questions 1-7 への回答）
2. 確定スコープを受けて **Phase UI-2.5: Dashboard Visual Fidelity Pass** を 1 batch で実施
3. Phase UI-2.5 完了後、boss が `/campaigns` / `/campaigns/[slug]` の追加 audit 要否を判断

並行候補（UI と独立）:
- 24-72h 後の reactionNotes 反映バッチ
- Threads 公開判断
- 旧 component (`AppNav` / `WorkingPipelineStatus` / `NextActionChecklist` / `CampaignStatusCard`) の削除 cleanup batch

## 9. Exact Codex Prompt for Phase UI-2.5

```text
Implement Phase UI-2.5: Dashboard Visual Fidelity Pass for /.

References:
- docs/70-dashboard-ui-fidelity-audit.md (P0/P1 sections, measurable checklist)
- docs/ui-design/ChatGPT Image 2026年5月19日 13_02_42 (1).png  (approved reference)
- docs/68-hitori-media-os-ui-design-system.md (tokens)
- docs/handoff/0142-dashboard-ui-fidelity-audit.md (this batch's context)

Hard Rules:
- Do NOT modify Sanity schema or write to Sanity.
- Do NOT modify publish-package files / assets / patches.
- Do NOT deploy.
- Do NOT add packages (shadcn primitives may be added 1-by-1 if a specific
  task pushes for them, but UI-2.5 should be doable in Tailwind-only).
- Keep all 23 routes working.
- Keep AppShell structural grid (280px sidebar / 64px topbar) intact.
- Keep /publish-package/[slug] v0.2 behavior untouched.
- Keep /campaigns and /campaigns/[slug] visual untouched (separate audit later).

Boss-confirmed scope (fill in before running):
- P0 items to implement: [list which of P0 1-5 to do this batch]
- ReadOnlyBanner final form: [delete | topbar pill | <details>]
- KPI trend display: [boss-confirmed placeholder values | "— 前月比" neutral]
- Active Campaigns donut: [yes simple SVG arc | no keep bar]
- Engagement summary right column: [placeholder card | keep ReleaseReviewLinks]
- Dark navy sidebar header bg: [bg-slate-900 | bg-blue-900 | other]

Tasks (apply only to / Home unless otherwise specified):

1. Sidebar header (Sidebar.tsx):
   - Top 88px (or 64px if compact) → dark navy bg + white text
   - Logo + tagline white on dark
   - Nav body remains white

2. ReadOnlyBanner:
   - Apply chosen form (delete / pill in topbar / collapsed details)

3. KpiCard (KpiCard.tsx):
   - Increase value font to text-3xl
   - Ensure icon pill uses per-KPI semantic tone (already supported via tone prop)
   - Render trend indicator with chosen placeholder

4. LifecyclePipeline (LifecyclePipeline.tsx):
   - All 5 stages get tone bg (not only currentStage)
   - currentStage gains ring-2 emphasis
   - Optional: 1-line stage description text

5. ContentOutputConfiguratorCard (ContentOutputConfiguratorCard.tsx):
   - Move "下書きを生成" CTA visibility (or rename existing CTA to that)
   - Tighten fake select borders
   - Adjust card to fit in left column with Today's Tasks on the right

6. dashboard/src/app/page.tsx:
   - 2-col upper grid: Configurator (~65%) + TodayTasks (~35%)
   - LifecyclePipeline below upper grid (full-width)
   - Middle row: ActiveCampaigns + RecentOutputs
   - Lower row: LearningInsights + Engagement placeholder (replacing ReleaseReviewLinks in right column)
   - Move ReleaseReviewLinks to bottom of page or under a Recent Activity section

7. ActiveCampaignsCard (if donut chosen):
   - Add small SVG arc per campaign (no Recharts)

Validation:
- cd dashboard && npm run build
- npm run build
- Manual visual check: compare with docs/ui-design/ChatGPT Image 2026年5月19日 13_02_42 (1).png

Docs:
- docs/devlog/<番号>-ui-2-5-dashboard-fidelity-pass.md
- docs/handoff/<番号>-ui-2-5-dashboard-fidelity-pass.md
- docs/handoff/latest.md (mirror)
```
