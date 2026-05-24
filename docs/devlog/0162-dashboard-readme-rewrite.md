# Devlog 0162 — dashboard/README.md rewrite

日付: 2026-05-20

## 背景

Phase UI-fidelity-1〜11 + 全 cleanup chain (14 旧 component 削除 + B fixes + Codex independent review) が完了したのを機に、`dashboard/README.md` を **現状反映**に書き直す batch。

旧 README は Phase Admin 1 Batch A/B/C/D 時代の構造をそのまま記録しており、特に **Project layout** 節が削除済の 14+ コンポーネントを「現在存在するファイル」として記載していた。Repository を新人が読むときの誤誘導源。

## 決定・変更

### 更新 (1)

- `dashboard/README.md` (397 → 570 行) — 全 6 セクションを順番にターゲット edit

### 新規 docs (3)

- `docs/devlog/0162-dashboard-readme-rewrite.md` (本ファイル)
- `docs/handoff/0173-dashboard-readme-rewrite.md`
- `docs/handoff/latest.md` (mirror)

### コード変更

**なし**。runtime / schema / publish-package / assets/visuals / patches / package.json / deploy はいずれも touch なし。`src/components/` `src/lib/` `src/app/` も全 untouched。

### README rewrite サマリ (6 edits)

1. **Top intro (lines 1-26 → 1-39)**: 「Phase Admin 1 Batch A/B/C/D + D1/D2」の summary 削除、`Current state (post UI-fidelity-11)` セクション新設。23 routes / 9 Sidebar nav / 14 旧 component 削除 / B fixes / Codex review / page-local refactor / nextActions helper / 「Sanity schema 不変」 / 「Phase 2B 未実装」を箇条書きで明示。

2. **`/api/asset-thumb`**: 「assets/visuals/ のみ」記述を「2 prefix (`assets/visuals/` + `assets/inbox/generated/`)」に書き換え。「matched prefix per request, then locked」の security 設計を 1 行追加。Phase UI-fidelity-6 で拡張済の事実を反映。

3. **Routes table (lines 254-267)**: 9 routes → **23 routes に拡大**。3 つの sub-table:
   - Main surface (Sidebar nav 13 routes)
   - Dev-only utility (4 routes)
   - API routes (5 routes)
   - +Next.js 自動 `/_not-found`

4. **「What this dashboard does」 + 新 2 セクション**:
   - 「What this dashboard does」 を fidelity 後の data source 構成で書き直し
   - 新規 **「Current operating model」** セクション追加 (local-first / no auto-post / no uncontrolled Sanity writes / publish-package 保護 / Phase 2B 未実装)
   - 新規 **「Completed UI fidelity history」** セクション追加 (Phase UI-fidelity-1〜11 / 23 routes / 14 旧 component / cleanup 完了)
   - 「What this dashboard intentionally does NOT do」を更新 (Phase Admin 1 文言除去、現状の constraints として再構成)

5. **Project layout (lines 331-373 → 423-525)**: 全 tree を **現状に書き直し**:
   - `src/app/` 配下を実 23 routes で再構成
   - `src/components/` 配下を 12 subdir (analytics / app-shell / campaign / common / configurator / dashboard / knowledge / outputs / publish / settings / visual-review + CopyButton/StatusBadge) で再構成
   - `src/lib/` 配下を実 module 列で書き直し (sanity / featureFlags / navigation / repoRoot / inboxReader / publishPackageReader / frontmatter / assetRoleJa / statusJa / campaign/ / configurator/ / visualAssets/ / groq/)
   - 末尾に **「14 deleted component の歴史的記録」** 段落 + **「intentional comment breadcrumb の説明」** 段落を追加

6. **「Next batches」 → 「Next work candidates」 (lines 382-397 → 534-570)**: 旧 Phase Admin 1 Batch B/C/D1/D2/D3 完了マーカー削除、現状の future 候補に書き換え:
   - Phase 2B write actions (最大項目、6 種列挙)
   - Tabs integration P1 (`/campaigns/[slug]` 8 → 5-6)
   - promptTemplate dataset insertion (boss task)
   - external analytics API (Phase Analytics-2)
   - `DeferredActionButton` cleanup (Phase 2B 後)
   - `LocalModeBanner` cleanup (Phase D2 後)
   - optional comment breadcrumb 整理 (Phase 2B 後)

### 既存セクションは touch なし

- Setup / Feature flags の table / Activity Log snapshot / Basic Auth proxy / Deploy / Environment / Dataset access (Option A + B) / Develop locally の起動コマンド / Build / Tech stack / Related docs

これらは依然正確、編集不要。

### Optional comment breadcrumb cleanup

skip (boss 指示の「low-risk only」原則に従って **見送り**)。理由:
- 7 件の breadcrumb (active file 内の 1-2 行コメント) を編集する diff よりも、README で「これらは意図的に残してある」と明示する方が読者ハマる確率低い
- 旧名で grep する新メンバー / boss が古い PR を read するときの救済として有用
- README の 「Notes:」 段落 + 「Next work candidates の最後の項目」で「Phase 2B 後にまとめて整理可能」と明文化済

### Validation

実行コマンド:
```bash
grep -wn "$c" dashboard/README.md  # for each of 24 deleted component names
```

結果: 残存 reference はすべて **historical context (past-tense)**:
- Line 25-26 (Current state): 「(PublishPackageLinks / ManualPublishingStatusList / etc.) **were replaced** by page-local sections」
- Line 385-396 (Completed UI fidelity history): 14 file 名を **削除済 list** として citation
- Line 492 (Project layout note): nextActions.ts の「**moved from old** NextActionSummary」
- Line 510-519 (Project layout notes 段落): 「**no longer contains** any Phase Admin 1 ... component」
- Line 524 / 568: comment breadcrumb の存在を **意図的に説明**

「active file として citation」は **0 件**。

builds はスキップ (README-only edit、runtime code 不変)。

## 理由

- **削除コンポーネントを 'past'-tense で明文化**: 単に削除するだけだと「あれはどこ?」と探す boss / 新人が grep して旧 doc に着地するパターンが残る。README で history として明示することで navigation を救済
- **23 routes を 3 sub-table に分割**: 「main surface」「dev-only utility」「API」の責任分界が一目で見える、後続 Phase 2B でも維持しやすい
- **「Current operating model」を独立セクションに**: 「auto-post: never」「dashboard は read-only」「Phase 2B 未実装」を README で boss が読む位置を一段上に
- **Optional comment cleanup を見送り**: runtime に影響しない 7 行のコメントを削るために 5 active file を edit する scope creep を回避、README で「意図的に残している」と説明する方が build-trust
- **「Next work candidates」を boss-facing にリライト**: Phase Admin 1 Batch D3 のような未実装の歴史的「次の段階」記述を、現状の boss が actually 考えている future work に置き換え

## 影響

- runtime / build / 23 routes / dependencies すべて touch なし
- README が現状反映、新人や boss が古い doc にハマらない
- Phase Admin 1 完了マーカーが README からは消えた (handoff/devlog で完了履歴は引き続き参照可能)
- 「14 削除 component」が README に historical record として明示

## 次の一手

1. **boss が更新 README を read** + 残された Optional cleanup の確認:
   - comment breadcrumb 整理を本当に skip で良いか
   - README 内の文言で違和感ある箇所
2. 完了後の選択肢:
   - **Phase 2B 議論 / spec docs only batch** (実 write actions の方針確定)
   - Tabs integration P1 spec (`/campaigns/[slug]` 8 → 5-6)
   - promptTemplate dataset 投入 (boss task)
   - external analytics API spec batch

## 発信ネタ候補

- 「README rewrite を batch にする ROI」: 削除した component を「過去」として明文化すると navigation が救済される、別 batch でやる価値
- 「project layout tree を 'now' state に書き直す」: 12 subdir に分散した component の地図を書くだけで構造の意図が明確化
- 「comment breadcrumb を `Notes:` 段落で説明する」: 削除せずに README で意図を明示するパターン
