# Dashboard UI Fidelity Audit (docs only)

日付: 2026-05-19

## 背景

Phase UI-2 (Dashboard redesign) を 23 routes 動作維持で実装完了したが、boss から「approved reference design と実機の見た目が合っていない」フィードバック。実機 screenshot と reference mockup を視覚的に突き合わせて、なぜ違うかを文書化する。

実装変更は本バッチでは **行わない**。次の Phase UI-2.5 で fidelity 修正を別バッチとして実施。

## 入力資料

- Approved dashboard reference: `docs/ui-design/ChatGPT Image 2026年5月19日 13_02_42 (1).png`
- Component palette / styleguide: `docs/ui-design/ChatGPT Image 2026年5月19日 13_02_44 (9).png`
- Current dashboard screenshot: `~/Downloads/Hitori-Media-OS-—-Admin-05-19-2026_02_40_PM.png`
- 既存仕様: docs/68 / docs/69 / docs/ui-design/000

## 決定・変更

### 1. 視覚 audit を docs/70 にまとめた

[docs/70-dashboard-ui-fidelity-audit.md](70-dashboard-ui-fidelity-audit.md) に 15 セクション分の差分項目 + 修正可能なチェックリストを記録。各項目に **current / reference / why it matters / likely file / risk / priority** の 6 軸で書いた。

### 2. 5 領域に P0 がまとまった

優先度 P0 (これだけ直せば「approved design に見える」体感に到達):

1. **Sidebar dark navy header**: 上端 64-88px を `bg-slate-900` 系で塗り、白文字でブランド identifier
2. **ReadOnlyBanner 縮小 or Topbar pill 化**: 現状ページ最上段の大型 amber banner が UX 的に主役を奪っている
3. **KPI cards の icon-tone-pill**: 5 KPI ごとに semantic tone (blue/purple/orange/emerald/blue) を適用、trend indicator も placeholder で表示
4. **LifecyclePipeline 全 stage tone**: currentStage のみ着色 → 全 5 stage を tone (blue/purple/orange/amber/emerald) 着色、currentStage は ring 強調

P1 (1 段下、ContentOutputConfigurator の visual hierarchy / Active Campaigns donut / Engagement placeholder 等):

5. **ContentOutputConfigurator header + CTA**: 上に 下書きを生成 button、selector の枠を強化、bottom CTA を大型化
6. **Configurator + Today's Tasks の 2-col 上段配置**: configurator 70% / tasks 30%
7. **ActiveCampaigns に progress visualization**: SVG arc で軽量 donut or 強化 bar
8. **Right column の ReleaseReviewLinks 移動 + Engagement placeholder**: 右列下を Engagement summary placeholder に置換、ReleaseReviewLinks は別配置に
9. **KPI value typography**: `text-3xl` で目を引く数字に
10. **Sidebar nav row tighter**: row 高を小さく

P2 (細部、後段で対応可能):

11. Topbar 検索 border 強化
12. Workspace block の Upgrade button outline 化
13. LifecyclePipeline stage description 1 行追加
14. Card padding / shadow 統一
15. Recent Outputs テーブル風プレビュー化（実データは UI-3）

### 3. 追加デザインパスは不要と判定

reference image 2 枚で Phase UI-2.5 着手可能。追加 mockup が必要になるのは Phase UI-6 (Engagement summary chart の具体表現) と UI-5 (Visual Review の zoom/comment pin 詳細) のシーンで、本 phase では不要。

### 4. /campaigns 系の audit は別バッチ

本 audit は `/` Home のみ対象。`/campaigns` と `/campaigns/[slug]` も同様の fidelity gap がある可能性が高いが、reference image が `/` のみのため、boss が campaign detail / list の追加 mockup を出すまでは UI-2 の現状でいったん固定。

## 理由

- **audit-only バッチに切った理由**: 「Phase UI-2 完了 → ただちに修正」と一直線で進めると、boss が「どの差分を許容して、どれを直すか」の判断機会を持てない。docs を 1 段挟むことで、boss が priority ごとに「ここまで直す」と decide できる
- **P0/P1/P2 分けで具体的に**: 「全部直す」ではなく「これだけ直せば 80% 体感が改善する」を明示。Phase UI-2.5 のスコープを boss が小さく切る選択肢を残した
- **likely file / risk を各項目に書いた**: 次バッチで Codex prompt を組むときに「どこを触るか」が即決まる、推測しなくて済む
- **/campaigns 系は除外**: スコープが膨らみすぎる。Home が直れば「approved design」体感は十分達成できる
- **Engagement summary placeholder を Phase UI-2.5 範囲に含めた**: 右列下の ReleaseReviewLinks を Engagement placeholder に置換するだけで「dashboard 全体感」が大きく改善する。UI-6 まで待たない

## 影響

- 実装変更なし、build 結果不変
- boss が docs/70 を読んで P0/P1/P2 のうちどこまで Phase UI-2.5 に含めるか決める
- 次の実装 batch (UI-2.5) は visual-fidelity-only、新規 feature なし
- /campaigns 系の fidelity 改善は別バッチに先送り

## 次の一手

1. boss が [docs/70](70-dashboard-ui-fidelity-audit.md) を音読、P0/P1 のスコープを確定
2. 確定後 **Phase UI-2.5: Dashboard Visual Fidelity Pass** に着手
3. UI-2.5 完了後、`/campaigns` `/campaigns/[slug]` の同様 audit 要否を boss 判断

並行候補:
- 24-72h 後の reactionNotes 反映バッチ
- Threads 公開判断
