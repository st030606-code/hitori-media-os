# Devlog 0160 — Phase UI-fidelity-11 /campaigns/[slug] deep refactor

日付: 2026-05-20

## 背景

docs/81 / handoff/0170 で確定した spec を実装する batch。`/campaigns/[slug]` (419 行) から 7 件の Phase Admin 1 legacy component imports + Home (`/`) から `ReleaseReviewLinks` 利用を完全に取り除き、`NextActionSummary` の `computeNextActions` helper を `lib/` に extract する deep refactor batch。

boss 確認済 scope:
- 公開状況 (詳細) tab: drop
- Home `/page.tsx` から ReleaseReviewLinks: 完全削除
- Tabs 統合: 本 batch では 9 → 8 のみ、5-6 への統合は別 batch
- `computeNextActions` extract 先: `lib/campaign/nextActions.ts`
- ReleaseReviewCard file list: 固定 (x / threads / note / substack / checklist)
- 1 batch でまとめて実装
- shadcn 追加なし、native HTML + Tailwind のみ

## 決定・変更

### 新規 (1)

- `dashboard/src/lib/campaign/nextActions.ts` — `Action` / `ActionTone` / `PRIORITY_ORDER` / `isActiveGateState` / `isActiveVisualState` / `actionToneClasses` / `actionLabel` / `computeNextActions` をすべて export。`NextActionSummary.tsx` から helper 関数を **そのまま移植** (JSX なし、pure 関数のみ)

### 更新 (3)

- `dashboard/src/components/campaign/NextActionList.tsx` — import 元を `@/components/NextActionSummary` → `@/lib/campaign/nextActions` に変更 (1 行)
- `dashboard/src/app/campaigns/[slug]/page.tsx` — 7 legacy import 削除 + 6 page-local section 関数追加 + 1 tab drop + ReleaseReviewLinks → ReleaseReviewCard
- `dashboard/src/app/page.tsx` (Home) — ReleaseReviewLinks import + render 削除 (代替なし、PageHeader CTA で機能カバー済)

### 削除候補 (8、本 batch では touch せず、follow-up cleanup microbatch で `rm`)

- `dashboard/src/components/SelectedPlatformChips.tsx`
- `dashboard/src/components/HumanReviewGateList.tsx`
- `dashboard/src/components/VisualAssetStatusTable.tsx`
- `dashboard/src/components/PromptTemplateSummary.tsx`
- `dashboard/src/components/PublishPackageLinks.tsx`
- `dashboard/src/components/ManualPublishingStatusList.tsx`
- `dashboard/src/components/ReleaseReviewLinks.tsx`
- `dashboard/src/components/NextActionSummary.tsx`

### page-local sections (新規、`/campaigns/[slug]/page.tsx` 内)

| 関数 | 旧 component | 設計 |
|---|---|---|
| `ReleaseReviewCard` | `ReleaseReviewLinks` | `campaign.releaseReviewPath` 駆動、5 固定 file list (`ReleaseFile[]` interface)。`releaseReviewPath` 未設定なら null 返却で隠す |
| `PlatformsSection` | `SelectedPlatformChips` | enabled / disabled 分離、PlatformBadge + label + priority/depth |
| `GatesSection` | `HumanReviewGateList` | divide-y compact list + line-clamp-2 notes + `/human-review-gates` link |
| `VisualsSection` | `VisualAssetStatusTable` | divide-y compact list + StatusBadge + `/visual-assets` link |
| `PromptsSection` | `PromptTemplateSummary` | divide-y compact list + template / category / platform / version + Studio link |
| `PackagePathsSection` | `PublishPackageLinks` | inline FilePathsCard pattern + CopyButton each + StatusBadge + releaseReviewPath inline |

加えて `formatIso(iso?)` page-local helper を追加 (`GatesSection` の completedAt 整形用)。

### Tabs 削減

- Before: 9 tabs (Content Idea / ブランド / 媒体 / 確認ゲート / 画像・図解 / プロンプト / パッケージ / 公開状況 詳細 / 外部リンク)
- After: 8 tabs (公開状況 詳細 削除)
- 削除理由: main の `PublishingScheduleTable` が同 data source (manualPublishingStatus) で同等 render、完全重複

### Type narrowing fix

最初の build で `RELEASE_FILES as const` が TypeScript の literal narrowing で破綻 (note を持つ最初の要素以外は `.note` プロパティ型に含まれず Type error)。`interface ReleaseFile` を導入して widen することで解決。

### データ取得ロジック (touch なし)

- `campaignDetailBySlugQuery` — unchanged
- `CampaignPlanDetail` の field shape (`selectedPlatforms` / `humanReviewGates` / `visualAssetDetails` / `promptTemplateDetails` / `publishPackagePaths` / `releaseReviewPath`) — unchanged
- helper extract した `computeNextActions` も logic 一切変更なし、まるごと移植

### 旧 import の最終確認

```bash
$ grep -rn "from '@/components/SelectedPlatformChips'\|from '@/components/HumanReviewGateList'\|from '@/components/VisualAssetStatusTable'\|from '@/components/PromptTemplateSummary'\|from '@/components/PublishPackageLinks'\|from '@/components/ManualPublishingStatusList'\|from '@/components/ReleaseReviewLinks'\|from '@/components/NextActionSummary'" dashboard/src
$ # (no output)
```

8 件すべて **import 数 0** に到達。

## 理由

- **page-local 関数を採用**: 6 件の section はすべて `/campaigns/[slug]` 専用、共通化 (component 化) は YAGNI。1 file 内に集約する方がドメイン logic の見通し良
- **`as const` を捨てて interface 化**: TypeScript の literal narrowing が note 任意 field と衝突。interface で type を明示する方が柔軟性高い
- **`computeNextActions` を `lib/campaign/` に**: `lib/configurator/` (Phase UI-fidelity-5) と同じ pattern、page-domain logic の集約場所として一貫
- **Home からの ReleaseReviewLinks 完全削除**: 代替なし、PageHeader 「公開パッケージを開く」CTA が機能カバー (B1 fixes と整合)。コメントで「moved to /campaigns/[slug] page-local」と明示
- **`PackagePathsSection` の design**: 旧 PublishPackageLinks は per-path `bg-slate-50/50` box の 2-col layout、新 `PackagePathsSection` は `Settings/LocalDevCard` 系の inline `<code>` + CopyButton で fidelity tone と整合
- **`GatesSection` で `/human-review-gates` への link を追加**: 「詳細は全 page で」誘導、boss が campaign 越境 review しやすい
- **VisualsSection で `/visual-assets` への link を追加**: 同様、fidelity 化済の Visual Review surface への bridge
- **`ReleaseReviewCard` を null-return で hide**: campaign に `releaseReviewPath` 未設定時に意味のない section を出さない、empty state は不要 (boss が release-review を運用していない可能性を許容)

## 影響

- **23 routes 動作維持**、dashboard TypeScript clean、Sanity Studio 7.5s clean
- `/campaigns/[slug]` の Tabs が 9 → 8 に
- Home から release-review section が消える
- 8 legacy component の **import 数 = 0**、follow-up cleanup microbatch で全削除可能
- Sanity 書き込みなし / schema 変更なし / 依存追加なし / publish-package 不変 / assets-visuals 不変 / patches 不変 / deploy なし
- 他 fidelity 化済 page (`/configurator`, `/publish`, `/outputs`, `/visual-assets/*`, `/knowledge`, `/analytics`, `/settings`, `/publish-packages`, `/activity-log`, `/diagnostics`, `/human-review-gates`, `/campaigns` list, `/publish-package/[slug]`) は完全 untouched

## 次の一手

1. **boss が `cd dashboard && npm run dev` で実機確認**:
   - `/campaigns/building-hitori-media-os` → 8 tabs + 6 page-local section + 右 ReleaseReviewCard が render
   - `/` (Home) → 「公開前レビュー資料」section が消えている、CTA + 他 section は維持
   - `/publish-package/building-hitori-media-os` → copy-friendly behavior 完全保持
2. 完了後の **follow-up cleanup microbatch** で 8 ファイル一括 `rm` → Phase Admin 1 Batch A/B/C 時代 legacy component 完全終了
3. その後の選択肢:
   - dashboard/README.md 全体書き直し
   - Phase 2B 議論 (実 write actions)
   - P1 Tabs 統合 (9 → 8 → 5-6) を別 batch で

## 発信ネタ候補

- 「6 file 削除を 1 PR にまとめる: 1 file 内 page-local 関数 戦略」: 共通化を意図的に避けて diff を読みやすくする選択
- 「helper extract を deep refactor と同時に」: separate microbatch にせず、1 PR で完結させる ROI
- 「`as const` の罠と interface 解決」: TypeScript literal narrowing で optional field が落ちる罠、interface で明示する習慣
