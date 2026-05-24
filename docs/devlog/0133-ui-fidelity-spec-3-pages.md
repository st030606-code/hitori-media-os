# UI Fidelity Spec for 3 Pages (docs only)

日付: 2026-05-19

## 背景

boss から「approved reference との fidelity を ad-hoc に直すのではなく、ideal screenshot を source of truth として **3 page 分の実装可能な spec を一括で書く**」要請。

対象:
1. Dashboard (`/`) — UI-2.5 で 80-85% 到達済、残ギャップを measurable 化
2. Campaign Detail (`/campaigns/[slug]`) — UI-2 + UI-2.5 共有更新済、structural リワーク必要
3. Output Management (`/outputs`) — placeholder のみ、0% から構築

実装変更なし、4 spec docs を新規作成。

## 決定・変更

### Inputs 確認

ideal screenshots (`docs/ui-design/`):
- `13_02_42 (1).png` — Dashboard
- `13_02_42 (2).png` — **Campaign Detail (AI活用術シリーズ)**
- `13_02_43 (4).png` — **Output Management (出力管理)**
- 他 7 枚: Configurator / Publish / Visual Review / Knowledge / Analytics / 二次 Dashboard / 二次 Campaign Detail / styleguide

current screenshots:
- Dashboard: `~/Downloads/Hitori-Media-OS-—-Admin-05-19-2026_02_40_PM.png` (UI-2.5 land 前)
- Campaign Detail / Output Management: 実機 screenshot 未取得 → コードベースから推論

### 作成 docs (4 件)

1. [docs/71-dashboard-fidelity-spec-v2.md](71-dashboard-fidelity-spec-v2.md)
   - Page structure diff (current post-UI-2.5 vs ideal)
   - Component diff table (12 行)
   - Measurable checklist (約 40 項目)
   - Implementation order: P0 なし (UI-2.5 完成)、P1 5 件、P2 5 件
   - Files affected table

2. [docs/72-campaign-detail-fidelity-spec.md](72-campaign-detail-fidelity-spec.md)
   - Page structure diff
   - Component diff table (15 行、4 新規 + 1 modify)
   - Measurable checklist (約 35 項目)
   - Implementation order: P0 5 件、P1 5 件、P2 4 件
   - Files affected + new GROQ なし
   - 共通 component (Breadcrumb / DataTable 抽象化 / Pagination) の再利用観点を明記

3. [docs/73-output-management-fidelity-spec.md](73-output-management-fidelity-spec.md)
   - Page structure diff (current 全 missing)
   - Component diff table (11 行、9 新規)
   - Measurable checklist (約 35 項目)
   - Implementation order: P0 6 件、P1 4 件、P2 5 件
   - 新 GROQ query (`outputs.ts`) + data source 判断 (`platformOutput` doc vs `manualPublishingStatus` proxy vs FS scan)

4. [docs/74-ui-fidelity-execution-plan.md](74-ui-fidelity-execution-plan.md)
   - 3 page 全体の summary table
   - Component 再利用 map (どの component がどの page に展開されるか)
   - **Recommended order: (1) Campaign Detail → (2) Output Management → (3) Dashboard polish**
   - 別案も検討、その却下理由を明記
   - **Phase UI-fidelity-1 (Campaign Detail) の exact Codex prompt** を準備

### Recommended first batch: Campaign Detail

理由:
1. Dashboard / Output Management の足場 component を最初に作れる (Breadcrumb / NextActionList / PublishingScheduleTable / PublishReadinessScore)
2. boss の最頻ワークフロー (`/campaigns/[slug]`) を直接改善
3. 既存 page を「リワーク」する難度なので、ゼロから新規構築 (Output Management) より workflow リスク小
4. Sanity schema / write actions なしで完結

### Recommended order の根拠

| 順序 | Page | 工数感 | 再利用効果 |
|---|---|---|---|
| 1 | Campaign Detail | 中 | Breadcrumb / DataTable pattern を抽出 |
| 2 | Output Management | 大 | Campaign Detail で抽出した pattern を再利用 |
| 3 | Dashboard polish | 小 | 上記 2 page の component を逆輸入、3 page で tone 統一 |

別案 (Dashboard → Campaign → Output) は微調整 first で「インパクト小 + 再利用効果無」のため不採用。
別案 (Output → Campaign → Dashboard) は DataTable 共通化の判断機会を逃すため不採用。

## 理由

- **3 page 一括 spec にした**: ad-hoc 修正の積み上げだと「全体 tone が揃わない」「同じ component を 2 度実装する」リスク。先に 3 page 並列 spec → 再利用観点で 1 ページずつ実装の方が手戻り少
- **measurable checklist にこだわった**: 「reference に近づける」だけだと完了判定がぶれる。各 spec に約 35-40 件の bool で評価可能な check を並べた
- **execution order を明示**: 「どこから手をつけるか」を boss が毎回判断しなくて済む。一括で全 page の relative priority を見せた上で、最効率順序を推奨
- **Phase UI-fidelity-1 の Codex prompt を準備済**: spec → 実装の transition を docs 1 行でできるようにした
- **5 page (Configurator / Publish / Visual Review / Knowledge / Analytics) は本 spec の範囲外**: スコープを 3 page に絞る判断。reference 画像はすべてあるので別バッチで同様 spec 化可能

## 影響

- 実装変更なし、build 結果不変
- boss が 4 docs を読んで実装 phase の順序を確定
- Phase UI-fidelity-1 着手は docs/74 §6 の Codex prompt を起点に進む
- 各 spec の measurable checklist は実装完了判定の基準として使える

## 次の一手

1. boss が 4 docs を音読、execution order とスコープを確認
2. **Phase UI-fidelity-1 (Campaign Detail)** に着手 (docs/74 §6 の Codex prompt 使用)
3. Phase UI-fidelity-1 完了後 → **Phase UI-fidelity-2 (Output Management)**
4. Phase UI-fidelity-3 (Dashboard polish) は最後

並行候補 (UI と独立):
- 24-72h 後の reactionNotes 反映バッチ
- Threads 公開判断
- 残 5 page (Configurator / Publish / Visual Review / Knowledge / Analytics) の同様 fidelity spec
- 旧 component (`AppNav` / `WorkingPipelineStatus` / `NextActionChecklist` / `CampaignStatusCard`) の削除 cleanup
