# Handoff: dashboard/README.md rewrite

Date: 2026-05-20

## 1. Task Goal

Phase UI-fidelity-1〜11 + 全 cleanup chain 完了の現状反映に `dashboard/README.md` を書き直す **docs-only batch**。旧 README は Phase Admin 1 Batch A/B/C/D 時代の構造を記録しており、特に **Project layout** が削除済の 14+ コンポーネントを「現在のファイル」として記載していた → 新人の誤誘導源。Runtime code は touch なし。

## 2. Constraints Followed

- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ publish-package files 不変
- ✅ assets/visuals 不変
- ✅ patches 不変
- ✅ deploy なし
- ✅ package 追加なし、shadcn 追加なし
- ✅ runtime behavior 変更なし (README 編集のみ)
- ✅ Phase 2B write actions 未実装

## 3. Changed Files

### 更新 (1)

- `dashboard/README.md` (397 → 570 行) — 6 セクション順次 edit

### 新規 docs (3)

- `docs/devlog/0162-dashboard-readme-rewrite.md`
- `docs/handoff/0173-dashboard-readme-rewrite.md` (本ファイル)
- `docs/handoff/latest.md` (mirror)

### コード変更 (0)

`src/` / `tools/` / `schemas/` / `tests/` / config files いずれも touch なし。

### Optional comment breadcrumb cleanup

**Skipped (boss spec の "Optional" + "low-risk only" 原則を尊重)**。理由:
- 7 件の breadcrumb は 5 active source files にまたがる
- runtime 影響ゼロ、build 影響ゼロ
- 旧名で grep する読者の navigation 救済として有用
- README の 「Notes:」 段落で「意図的に残している」と明示済

将来の Phase 2B 後に「Next work candidates」最後の項目で再評価予定。

## 4. Summary of Changes

### 4-1. README sections rewritten (6 edits)

| Section | Before | After |
|---|---|---|
| Top intro (lines 1-26) | Phase Admin 1 Batch A/B/C/D1/D2 summary | `Current state (post UI-fidelity-11)` セクション — 23 routes / 9 Sidebar / 14 旧 component 削除 / B fixes / Codex review / page-local refactor / nextActions / 「Sanity schema 不変」 / Phase 2B 未実装 |
| `/api/asset-thumb` | `assets/visuals/` 単一 prefix | **2 prefix** (`assets/visuals/` + `assets/inbox/generated/`) + 「matched prefix per request, then locked」security 設計 |
| Routes table | 9 routes | **23 routes**、Main / Dev-only utility / API の 3 sub-table |
| 「What this dashboard does」+ 新 2 セクション | 旧データ source 説明 | 現状反映 + **「Current operating model」** + **「Completed UI fidelity history」** 新規、「intentionally does NOT do」 を現状用に再構成 |
| Project layout (tree) | Phase Admin 1 時代の 14+ 旧 component を「現在」として citation | 全 tree を **現状反映** (12 components subdir / 4 lib subdir / 23 app routes / 末尾に 14 deleted の historical record + comment breadcrumb 説明段落) |
| 「Next batches」 → 「Next work candidates」 | Phase Admin 1 Batch B/C/D1/D2/D3 マーカー (完了 + D3 未着手) | 現状の future work 候補 (Phase 2B / Tabs P1 / promptTemplate dataset / external analytics / DeferredActionButton cleanup / LocalModeBanner cleanup / optional comment breadcrumb) |

### 4-2. Whether comment breadcrumbs were cleaned

**Not cleaned this batch.**

The 7 comment-only references in source files (handoff/0172 §4-2: `campaigns/[slug]/page.tsx:435`, `EngagementPlaceholder.tsx:1`, `NextActionList.tsx:2,5`, `PublishingScheduleTable.tsx:3`, `nextActions.ts:3,5`) remain as **intentional historical breadcrumbs** for grep-discoverability by anyone reading older PRs / docs. The new README explicitly acknowledges these (Project layout notes + Next work candidates 最後の項目) so they are no longer in conflict with README accuracy.

### 4-3. Grep result for deleted component names

実行:
```bash
for c in CampaignStatusCard NextActionChecklist WorkingPipelineStatus PublishReadinessBoard \
         SelectedPlatformChips HumanReviewGateList VisualAssetStatusTable PromptTemplateSummary \
         PublishPackageLinks ManualPublishingStatusList ReleaseReviewLinks NextActionSummary \
         SummaryCard SectionHeader EmptyState FilePathBlock ReadOnlyBanner AppNav \
         VisualAssetHeader CandidateGrid CandidateCard CandidatePreview CandidateStatusBadge \
         EmptyCandidateState; do
  grep -wn "$c" dashboard/README.md
done
```

結果: マッチは複数あるが、**すべて historical context として past-tense で記述**:

- L25-26 (Current state): 「(PublishPackageLinks / ManualPublishingStatusList / etc.) **were replaced** by page-local sections」
- L385-396 (Completed UI fidelity history): **削除済 list** として citation
- L492 (Project layout note): nextActions.ts の「**moved from old** NextActionSummary」
- L510-519 (Project layout notes): 「**no longer contains** any Phase Admin 1 ... component」
- L524 / 568: comment breadcrumb の存在を **意図的に説明**

**「active file として citation」 = 0**。README は新人が間違って旧 component を探しに行く誘導源ではなくなった。

### 4-4. Whether build was run

**Run skipped** per boss spec ("No build required if README-only").

Runtime code は完全 touch なしのため build 不変が保証される。Edit は markdown のみ。

### 4-5. Confirmation: runtime behavior unchanged

確認項目 (すべて intact):
- 23 routes (前 batch から変化なし)
- データ取得ロジック (`campaignDetailBySlugQuery` / `dashboardHomeQuery` / `outputsListQuery` / `configuratorOptionsQuery` 等) — touch なし
- feature flags (`enableDiagnostics` / `enableLocalFsRoutes` / `activityLogMode`) — touch なし
- `/api/asset-thumb` の security guards — touch なし (README 文言のみ更新)
- `/publish-package/[slug]` copy-friendly behavior — touch なし
- Sanity schema / publish-package / assets/visuals / patches / package.json — touch なし

## 5. Key Decisions

- **削除コンポーネントを README で 'past'-tense documentation に**: navigation を救済、旧 doc / PR からの grep に対する「移動先 / 削除済」を README で 1 か所に集約
- **Project layout tree を全 rewrite**: 部分修正だと「どれが現在?」が読みにくい、tree 全体を「now」 state に書き直す ROI が高い
- **Routes table を 3 sub-table 化**: Main surface / Dev-only utility / API、責任分界が visible に
- **「Current operating model」を独立セクションに**: read-only / no auto-post / Phase 2B 未実装 を boss-facing で目立つ位置に
- **Optional comment breadcrumb skip**: 5 active file edit は scope creep、README で「意図的に残している」と明示する方が build-trust
- **「Next batches」 → 「Next work candidates」 rename**: 旧 Phase Admin 1 ロードマップを retire、現状の future work に置き換え

## 6. Human Review Questions

1. **README の Current state 文言**: 「14 old components deleted」 (handoff/0172 で実際に削除されたのは 8 件、それ以前の cycle で 6 件 = 計 14)。boss が「数字曖昧」と感じれば microbatch で書き直し可能
2. **Project layout の subdir 一覧表記**: 12 components subdir + 4 lib subdir を一覧 + その下に主要ファイル top-5。boss が「もっと詳しく / もっと簡素」希望があれば調整
3. **Optional comment breadcrumb 整理**: 本 batch では skip、boss が「今やるべき」と判断すれば microbatch で対応 (5 active file edit になる)
4. **Next work candidates のラベル**: 「Phase 2B」「Tabs integration P1」等のラベル文言

## 7. Risks or Uncertainties

- **README 行数増 (397 → 570)**: 173 行増、Current state + Operating model + Fidelity history + Routes 拡大 + Project layout 詳細化 + Next work candidates の追加分。boss が「長すぎ」と感じれば次回 polish microbatch
- **Optional comment breadcrumb skip の判断**: 短期的には README で説明済で問題なし。長期的には Phase 2B 後の cleanup batch で整理
- **「14 deleted components」の数字精度**: README L17 で「14 old components」と記載、L385-396 で具体 list。boss feedback で数え方を統一する余地あり
- **Documentation drift**: README 内 Setup / Feature flags / Activity Log snapshot / Basic Auth proxy / Deploy / Environment / Dataset access の各 section は **未編集**、これらは Phase Admin 1 Batch D1/D2 時代の文言だが内容は今も正確。次の deploy 関連変更があれば同時 update

## 8. Remaining Cleanup Candidates

### 短期 (microbatch)

- Optional comment breadcrumb 整理 (5 active file edit、scope creep、Phase 2B 後推奨)
- README の Setup / Feature flags 系セクションの文言を「Phase Admin 1」言及から「Hitori Media OS」に揃える

### 中期 (Phase 2B 関連)

- Phase 2B write actions spec docs only batch
- Tabs integration P1 for `/campaigns/[slug]` (8 → 5-6 tabs)
- `DeferredActionButton` 削除 (Phase 2B 後)
- `LocalModeBanner` 削除 (Phase D2 後)

### 長期

- promptTemplate dataset insertion (boss task)
- external analytics API integration (Phase Analytics-2)

## 9. Next Recommended Step

**Option A (推奨) — Phase 2B write actions spec docs only batch**

Phase UI-fidelity cycle + cleanup chain + Codex review + README rewrite が完了したので、次の戦略課題は **「実 write actions の方針確定」**。

- どの write surface から enable するか (Approve & register / reactionNotes editing / campaign edit のいずれが優先)
- Sanity controlled write pattern の dashboard 統合 (tools/sanity/reflect-* の延長 or server actions or 別 API)
- Visual Register CLI との責任分界 (一部 dashboard 統合 / 全部 CLI 維持)
- write-action 設計時の audit log / rollback / dry-run の方針

→ spec docs only batch で boss の question を文書化、その後の実装 batch で boss が選んだ路線を実行。

**Option B — `/campaigns/[slug]` Tabs integration P1 spec**

8 → 5-6 tabs 統合の spec。`/campaigns/[slug]` の visual density 改善の delta。

**Option C — Optional comment breadcrumb 整理 microbatch**

5 active file から historical comment 7 行を削除する単発 microbatch。Phase 2B より前にやりたい場合の選択肢。

**Option D — promptTemplate dataset insertion (boss task)**

`/configurator` RecommendedTemplatesCard + `/knowledge` PromptTemplateTab を埋めるための dataset 整備。boss 担当、Sanity Studio で 1-2 件作成すれば dashboard 側 UI が充実。
