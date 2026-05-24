# Publish Management Fidelity Spec (docs only)

日付: 2026-05-19

## 背景

UI fidelity 3-page batch (Dashboard / Campaign Detail / Output Management) が完了し、boss から次の page (`/publish`) の fidelity spec を要望。reference (`docs/ui-design/ChatGPT Image 2026年5月19日 13_02_43 (5).png`) と現状 PhasePlaceholder を比較し、実装可能な spec を作成。実装変更なし、boss が Phase UI-fidelity-4 着手時に使う仕様書 + Codex prompt を確定する。

## 決定・変更

### Page concept の明確化

`/publish` と `/publish-package/[slug]` の役割を明示的に区別:

- **`/publish-package/[slug]`** (v0.2 既存): **コピー UI 中心 (作業者視点)**。本文 / 画像 / 公開済み URL コピー。boss が「手動で投稿する瞬間」の作業画面
- **`/publish`** (本 spec): **Publish Package を単位とした監視 / 状態管理 (publisher 視点)**。配布 channel grid / lifecycle stage / リスクチェック / 反応モニタリング / カレンダー

ideal screenshot は **single Publish Package を hero とした全体監視画面** なので、`/publish` は default で最新の active campaign を表示、上部に CampaignSwitcher を持つ設計とした。

### 作成 docs (4 件)

1. [docs/75-publish-management-fidelity-spec.md](75-publish-management-fidelity-spec.md):
   - Page concept (差別化) を明記
   - Page structure diff (current PhasePlaceholder vs ideal の 11 sections)
   - Component diff table (15 行、9 新規 + 5 reuse)
   - Visual fidelity checklist (~50 項目)
   - Implementation order: P0 6 件 / P1 5 件 / P2 4 件
   - Files affected table + data sources (既存 query 再利用 + 新規無し)
   - Compatibility / Risk 整理
2. `docs/devlog/0137-publish-management-fidelity-spec.md` (本ファイル)
3. `docs/handoff/0148-publish-management-fidelity-spec.md` (Phase UI-fidelity-4 Codex prompt 含む)
4. `docs/handoff/latest.md` (mirror)

### 9 新規 component の整理

| Component | P 優先度 | 役割 |
|---|---|---|
| PackageHeroCard | P0 | campaign title + status + description + cover |
| ChannelsGrid | P0 | 6 platform 行 with URL + open icon |
| PublishingMediaTable | P0 | 6-column DataTable (Campaign Detail の PublishingScheduleTable と共通 pattern) |
| PublishingLifecycleTimeline | P0 | publish-specific 5 stage (LifecyclePipeline とは別 stage set) |
| CampaignSwitcher | P1 | dropdown with URL searchParam |
| IncludedAssetsTable | P1 | visual + text asset list |
| ReleaseNotesCard | P1 | highlights + reaction summary placeholder |
| RiskCheckCard | P1 | 4-6 compliance check items |
| PostPublishMonitoringCard | P1 | 4 metric tile placeholder (EngagementPlaceholder 再利用候補) |
| PublishingCalendarCard | P2 | mini calendar SVG + bottom metric strip |

### Data sources

新規 GROQ query 不要。既存 `campaignDetailBySlugQuery` + `outputsListQuery` + `campaignListQuery` で十分 cover 可能:

- `manualPublishingStatus[].publishedUrl / publishedAt / state / reactionNotes`
- `visualAssetDetails`
- `publishPackagePaths` / `releaseReviewPath`
- `humanReviewGates`
- `selectedPlatforms`

実 reaction analytics (視聴 / スキ / 購読 / 返信) は Phase UI-6 で取得方針確定後。Risk check items は static で開始、Phase UI-7+ で dynamic 化判断。

### `/publish-package/[slug]` v0.2 との区別を仕様内で明示

handoff §6 の Compatibility / Risk に「両者の状態が異なって表示される懸念 (例: Sanity 反映前の URL が v0.2 では既に出ているが `/publish` ではまだ未公開表示)」を明記。両者の data source 差は Phase UI-3 で server action による Sanity write 統合で解消される設計と書いた。

### Phase UI-fidelity-4 Codex prompt 準備

handoff §9 に exact prompt を準備。P0 6 件のみ実装 + P1 5 件は次段 microbatch、P2 4 件は Phase UI-6/7+ で時間差。CampaignSwitcher dropdown は **hand-roll** 推奨 (UI-1 QuickCreateButton と同じ pattern)、shadcn `DropdownMenu` は 3 deps 追加が必要なので boss 判断。

## 理由

- **`/publish` と `/publish-package/[slug]` の明確な区別**: 名前が似て混乱しやすい route 2 つを 仕様レベルで「作業者視点 vs publisher 視点」と切り分けた。boss が Phase UI-3 で write actions を実装するときも、両者の data source 重複を意識できる
- **CampaignSwitcher を P1 に**: P0 で MVP は single campaign hero に集中、boss が複数 campaign を運用し始めた時点 (= 2 件目の campaign を加えた時点) に P1 として実装
- **PublishingLifecycleTimeline を専用 component に分離**: 既存 `LifecyclePipeline` (Idea→Published) と stage set が違う (計画→準備→レビュー→公開予定→公開済み)。重複 component を回避するため別 component で。Phase UI-fidelity-4 の P0
- **PostPublishMonitoringCard の `EngagementPlaceholder` 再利用検討**: UI-2.5 で作った `EngagementPlaceholder` が 4 metric tile + dashed chart + Phase UI-6 note の構造で、`PostPublishMonitoringCard` とほぼ同じ。`variant` prop か `<Card title>` props 化で共通化可能 → Phase UI-fidelity-4 で判断
- **RiskCheckCard の static items**: boss-only mode で実 dynamic data なし、static で十分 fidelity 達成。Phase UI-7+ で release-review の Safety Reaffirmation 連動を検討
- **既存 GROQ で十分**: 新規 query 不要。`campaignDetailBySlugQuery` の field set が豊富、IncludedAssetsTable は `visualAssetDetails` を text 出力と組み合わせるだけ
- **CampaignSwitcher の hand-roll 推奨**: shadcn `DropdownMenu` を 1 dropdown のために 3 dep 追加するのは過剰、UI-1 で hand-roll した QuickCreateButton と同じ pattern を流用可能
- **「今すぐ公開」/「公開設定」 actions は P2**: Phase UI-7+ で auto-post / scheduling 機能が入るまで disabled placeholder で OK、boss が見て「ここに button があるとうれしい」が分かれば十分

## 影響

- 実装変更なし、build 結果不変
- boss が docs/75 を読んで Phase UI-fidelity-4 の優先順位を確定
- 4 page (Dashboard / Campaign / Output / Publish) の spec が docs に揃ったので、残 4 page (Configurator / Visual Review / Knowledge / Analytics) も同パターンで spec 化可能
- Component reuse map (`docs/74` execution plan の §2) に publish/ 配下が加わり、3 page → 4 page で「DataTable / Hero card / Timeline / Monitoring placeholder」の共通化機会が明確化

## 次の一手

1. boss が docs/75 を音読、P0/P1/P2 のスコープ確認 (特に「P0 6 件で MVP land、P1 / P2 は段階」が許容可か)
2. 違和感なければ **Phase UI-fidelity-4 (Publish Management 実装)** に着手:
   - docs/75 + docs/handoff/0148 §9 の Codex prompt 使用
   - shadcn DropdownMenu 追加 yes/no を boss 確定
   - 新規 9 components (P0 4 + P1 5) を 1 batch で
3. Phase UI-fidelity-4 完了後 → 残 4 page spec 順序の判断 (Configurator が中核 monetizable、優先候補)

並行候補:
- 24-72h 後の reactionNotes 反映バッチ
- Threads 公開判断
- dead code cleanup (`PublishReadinessBoard` / `NextActionSummary` / `WorkingPipelineStatus` / `NextActionChecklist` / `CampaignStatusCard` / `AppNav` の削除)
- 残 4 page (Configurator / Visual Review / Knowledge / Analytics) の fidelity spec
