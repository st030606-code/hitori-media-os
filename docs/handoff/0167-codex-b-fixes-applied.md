# Handoff: Codex B fixes applied (B1/B2/B3)

Date: 2026-05-20

## 1. Task Goal

handoff/0166 で Codex 独立 reviewer が指摘した High-priority findings (B1/B2/B3) を 1 microbatch で修正する **demo data hardcoding 排除** batch。C 3 件 / D 5 件 は scope 外。

## 2. Constraints Followed

- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ publish-package files 不変
- ✅ assets/visuals / patches 不変
- ✅ deploy なし
- ✅ auto-post なし
- ✅ package 追加なし、shadcn 追加なし
- ✅ 23 routes 動作維持 (dashboard build green、Sanity Studio 7.9s clean)
- ✅ `/publish-package/[slug]` v0.2 copy-friendly behavior unchanged
- ✅ Phase 2B write actions 未実装

## 3. Files Changed

### 更新 (4)

- `dashboard/src/app/page.tsx` (B1) — `pickPrimaryCampaign` helper 追加、PageHeader CTA + 4 task href を derived slug 経由に、empty state 追加
- `dashboard/src/app/publish/page.tsx` (B2) — `DEFAULT_SLUG = 'building-hitori-media-os'` 削除、`pickDefaultSlug(campaignList)` helper 追加、fetch flow を「list → effective slug → detail」に再構成
- `dashboard/src/app/settings/page.tsx` (B3) — PageHeader actions の `/diagnostics` Link を `enableDiagnostics` で gating、LocalDevCard に flag 経由 props
- `dashboard/src/components/settings/LocalDevCard.tsx` (B3) — `Props { enableDiagnostics }` 追加、shortcut 配列を props 駆動に、`enabled === false` で disabled `<span>` render

### 新規 docs

- `docs/devlog/0156-codex-b-fixes-applied.md`
- `docs/handoff/0167-codex-b-fixes-applied.md` (本ファイル)
- `docs/handoff/latest.md` (mirror)

### 不変

- 既存 Phase UI-fidelity-1〜10 page (`/configurator`, `/outputs`, `/publish-package/[slug]`, `/campaigns/[slug]`, `/visual-assets/*`, `/knowledge`, `/analytics`, `/publish-packages`, `/activity-log`, `/diagnostics`, `/human-review-gates`, `/campaigns` list) すべて touch なし
- データ取得ロジック (`campaignListQuery` / `dashboardHomeQuery` / `outputsListQuery` / `campaignDetailBySlugQuery`) — 変更なし
- Sanity schema / API routes / publish-package / assets/visuals / patches / package.json

## 4. Summary of Changes

### 4-1. B1 fix behavior — Home page

| シナリオ | 期待挙動 |
|---|---|
| dataset に active campaign あり | PageHeader CTA + tasks は first active の slug を指す |
| dataset に active なし、publishing pending あり | first pending の slug を指す |
| dataset に何らかの slug あり、active/pending なし | リスト先頭の slug |
| dataset 空 | PageHeader CTA は disabled `<span>` (cursor-not-allowed)、`<section>` empty card「キャンペーンがまだありません」を表示、`publishing-pending` / `reaction-notes` / `threads-decision` / `release-review-ack` の 4 task は emit せず |
| dataset あり、`manualPublishingDone === 0` | `release-review-ack` (完了タスク) は emit せず (公開実績 0 で「✓ 完了」を出さない) |
| `pending-gates` task | `data.pendingGatesTotal > 0` で常時 emit、`/human-review-gates` (slug 非依存) |

derived slug は `pickPrimaryCampaign()` で計算 (priority: active → pending → first with slug)。

### 4-2. B2 fix behavior — /publish

| シナリオ | 期待挙動 |
|---|---|
| `?slug=foo` あり、foo が dataset に存在 | foo を render |
| `?slug=foo` あり、foo が dataset に**不在** | `pickDefaultSlug(campaignList)` で derived default に degrade (404 ではない) |
| `?slug` なし、dataset に campaign あり | derived default を render (pending → active → first) |
| `?slug` なし、dataset 空 | 既存の empty state を render (「指定の campaign が見つかりません」+ `/campaigns` link) |

`pickDefaultSlug` の priority: `manualPublishingNotStartedCount > 0` → active status → first with slug。

### 4-3. B3 fix behavior — /settings → /diagnostics

| `enableDiagnostics` | PageHeader 「診断を開く」 action | LocalDevCard 「診断」 shortcut |
|---|---|---|
| `true` (dev default) | active `<Link href="/diagnostics">` | active `<Link href="/diagnostics">` |
| `false` (production default) | disabled `<span aria-disabled>` with label「診断ページは現在無効です」 + tooltip「ENABLE_DIAGNOSTICS が off のため /diagnostics は 404 を返します」 | disabled `<span aria-disabled>` with `disabledHint`「ENABLE_DIAGNOSTICS off のため /diagnostics は 404」 |

`/activity-log` / `/publish-packages` shortcut は無変更 (常時 active)。

### 4-4. Empty/fallback behavior 全般

- B1: dataset 空時に inline border-dashed empty card を Home に追加
- B2: dataset 空 + slug 不明時に既存の `border-dashed bg-white p-8 text-center` empty section を活用
- B3: `enableDiagnostics=false` で 404 を保証する link が出ない (visibility off ではなく disabled 表示で残す、boss が flag を確認できるよう)

### 4-5. Build validation

```
cd dashboard && npm run build  → ✓ TypeScript clean, 23 routes (unchanged)
npm run build (Sanity Studio)  → ✓ Build Sanity Studio (7921ms) clean
```

確認 routes (boss task instructions より):
- `/` ✓ (B1 反映)
- `/publish` ✓ (B2 反映)
- `/settings` ✓ (B3 反映)
- `/diagnostics` ✓ (flag on でのみ accessible)
- `/campaigns` ✓ (touch なし)
- `/publish-package/building-hitori-media-os` ✓ (touch なし、Sanity に既存)

加えて `/configurator`, `/outputs`, `/visual-assets/*`, `/knowledge`, `/analytics`, `/publish-packages`, `/activity-log`, `/human-review-gates`, `/campaigns/[slug]` も touch なしで build 維持。

### 4-6. Final grep verification

```
$ grep -n "building-hitori-media-os" dashboard/src/app/page.tsx
(none)
$ grep -n "building-hitori-media-os\|DEFAULT_SLUG" dashboard/src/app/publish/page.tsx
(none)
$ grep -n '/diagnostics' dashboard/src/components/settings/LocalDevCard.tsx
4: // The /diagnostics shortcut is gated by ... (comment)
30: '/diagnostics と同じ JSON' (CommandRow note)
47: href: '/diagnostics' (now gated by enabled prop)
50: disabledHint: 'ENABLE_DIAGNOSTICS off のため /diagnostics は 404'
```

`/diagnostics` への href は `enabled === true` のときの Link 内のみ ✓。

## 5. Key Decisions

- **`first active campaign` を最優先**: Codex recommended order (B1 / B2)、boss が現在取り組んでいる可能性が高い campaign を CTA / default にする
- **`encodeURIComponent` slug 全て**: Sanity slug は基本 ASCII だが防御的に encode
- **empty state を inline border-dashed**: Phase UI-fidelity 全期間の pattern に整合
- **`release-review-ack` を `manualPublishingDone > 0` で gating**: 公開実績 0 で「✓ 完了」表示しない、新規 workspace の認知負荷削減
- **disabled state は `<span aria-disabled>`**: `<a aria-disabled>` 非推奨 / `<button>` だと click 可能と誤認、`<span>` + `cursor-not-allowed` で意図明示
- **LocalDevCard の `SHORTCUTS` を関数内 array に**: props 駆動の動的配列、将来他 shortcut にも enabled 制御を増やしやすい
- **既存 `enabled` 制御の意図的な opt-in design**: 一般の shortcut (作業ログ / 公開パッケージ一覧) は `enabled` 省略で常時 active、明示的に gating したい shortcut のみ flag 付与
- **`/publish` の fetch flow を「list → slug → detail」に**: 並列度は落ちるが、list なしに default を導けないため致し方なし。outputs は detail と独立で並列 fetch 維持

## 6. Human Review Questions

1. **B1 の `pickPrimaryCampaign` 優先順位**: 「active → pending → first」が boss 視点に合致するか?「pending → active → first」(boss が "今やるべきこと" を CTA にしたい) 案もありうる
2. **B1 の `release-review-ack` gating**: `manualPublishingDone > 0` で gating、boss が「とにかく完了済の歴史を表示したい」希望なら gating 解除
3. **B2 の `/publish` fetch order**: 既存の `Promise.all([list, detail, outputs])` から `Promise.all([list, outputs]) → detail` に変更したことで TTFB が微増。boss が違和感感じれば、要再考
4. **B3 の disabled copy**: 「診断ページは現在無効です」+ tooltip「ENABLE_DIAGNOSTICS が off のため」で OK か、もっと簡素 / 詳細 にしたいか
5. **`encodeURIComponent` 適用**: 既存の slug 利用箇所すべてに encode を適用していない、現状の選択 (Home の 1 箇所 + Publish は既存挙動維持) で OK か、それとも codebase 全体に rollout する別 batch を立てるか

## 7. Risks or Uncertainties

- **B1 の dataset 偏り**: 現在 boss workspace は building-hitori-media-os 1 件、active 1 件 / pending 0-1 件 のため pickPrimaryCampaign の active path が常に勝つ。複数 campaign で boss が「これじゃない campaign が CTA」と感じる可能性 → 並びを campaign updatedAt desc にする tweak で改善できる (現状 list query は updatedAt desc)
- **B2 の degradation path**: 不在 slug 指定で derived default に degrade、boss が「何故違う campaign が出てる?」と困惑する可能性。URL slug と表示 campaign が乖離する場合、 `<CampaignSwitcher>` の current が derived value で表示されるので視覚的に区別可能、ただし subtle
- **B3 の disabled span**: keyboard-only user がフォーカスできない可能性 (span に tabIndex なし)。`role="button"` + `tabIndex=0` + visual cue 改善は a11y microbatch 候補
- **B1 の `data.campaigns` 型**: `dashboardHomeQuery` の `campaigns` field は `CampaignListItem[]` で、`slug` フィールドが必ず存在するとは限らない (型は `slug?: string`)。`pickPrimaryCampaign` で `&& c.slug` チェックを各 priority に挟んで対処済
- **Phase 2B との接続**: 本 batch は read-only fix のみ、書き込み無し。Phase 2B で `/diagnostics` rerun action や `/publish` write が入る時に再評価必要

## 8. Remaining Codex Findings (out of scope this batch)

- **C1**: FilterBar (`VisualAssetsFilterBar.tsx:39`) tabs semantics 半実装 (medium)
- **C2**: `/analytics` と `/activity-log` で devlog frontmatter parser 重複 (medium)
- **C3**: `CampaignStatusCard.tsx` / `WorkingPipelineStatus.tsx` (+ 他 Phase Admin 1 Batch 時代 12 件) の dead code audit (medium)
- **D 5 件**: Phase 2B / Analytics / Write-actions prep tagged (future)

## 9. Next Recommended Step

**Option A — C 3 件 を 1 microbatch (推奨)**

handoff/0166 §4-5 の medium-priority 3 件をまとめる。a11y + maintainability の改善が同 PR で完結、Phase UI-fidelity cleanup の最終 polish に。

```text
Apply Codex medium-priority fixes (C1, C2, C3).

Use:
- docs/handoff/0166-codex-code-review-ui-fidelity.md §4-5
- docs/handoff/0167-codex-b-fixes-applied.md (latest tone)

Hard Rules:
- Do NOT modify Sanity schema / publish-package / assets/visuals / patches
- Do NOT add packages, no deploy
- 23 routes 動作維持

Tasks:
1. C1: VisualAssetsFilterBar を `common/Tabs.tsx` ベースに移行 or plain buttons in list に簡素化 (どちらが UX 望ましいか boss 確認)
2. C2: lib/devlog/readDocs.ts 抽出、/analytics + /activity-log から呼ぶ
3. C3: CampaignStatusCard / WorkingPipelineStatus + boss が以前挙げた 10 件 list (NextActionSummary / NextActionChecklist / 等) の import 数を grep 確認、0 なら rm
4. cd dashboard && npm run build
5. npm run build (Sanity Studio)
6. docs/devlog/0157 + docs/handoff/0168 + latest mirror
```

**Option B — Phase Admin 1 Batch A/B/C component audit (C3 拡張)**

C3 を起点に、12 件全部の import 数を一括 grep audit する dedicated batch。

**Option C — dashboard/README.md 全体書き直し**

Batch B/C/D 時代の構造記述を Phase UI-fidelity-1〜10 + B fixes 現状に更新。

**Option D — Phase 2B 議論**

D 5 件 + 実 write actions の方針確定。
