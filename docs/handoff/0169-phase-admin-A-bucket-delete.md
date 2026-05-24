# Handoff: Phase Admin 1 A-bucket delete

Date: 2026-05-20

## 1. Task Goal

handoff/0168 で audit 確定した A バケット 4 件 (`CampaignStatusCard` / `NextActionChecklist` / `WorkingPipelineStatus` / `PublishReadinessBoard`) を `rm` する cleanup microbatch。Runtime 振る舞い無変更、削除のみ。B/C バケット 8 件は **touch なし**。

## 2. Constraints Followed

- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ publish-package files 不変
- ✅ assets/visuals 不変
- ✅ patches 不変
- ✅ deploy なし
- ✅ auto-post なし
- ✅ package 追加なし
- ✅ 23 routes 動作維持 (dashboard build green、Sanity Studio 7.8s clean)
- ✅ 削除前に import 数 0 を grep で再確認
- ✅ B/C バケット (8 件) は touch なし

## 3. Changed Files

### 削除 (4)

- `dashboard/src/components/CampaignStatusCard.tsx`
- `dashboard/src/components/NextActionChecklist.tsx`
- `dashboard/src/components/WorkingPipelineStatus.tsx`
- `dashboard/src/components/PublishReadinessBoard.tsx`

### 編集 (0)

active file は **完全に touch なし**。本 microbatch は `rm` 4 件のみ。

### 新規 docs

- `docs/devlog/0158-phase-admin-A-bucket-delete.md`
- `docs/handoff/0169-phase-admin-A-bucket-delete.md` (本ファイル)
- `docs/handoff/latest.md` (mirror)

## 4. Summary of Changes

### 4-1. Import verification before delete

実行コマンド:
```bash
for c in CampaignStatusCard NextActionChecklist WorkingPipelineStatus PublishReadinessBoard; do
  echo "=== $c ==="
  grep -rwn "$c" dashboard/src 2>/dev/null | grep -v "/$c\.tsx" || true
done
```

結果 (削除前):
```
=== CampaignStatusCard ===
=== NextActionChecklist ===
=== WorkingPipelineStatus ===
=== PublishReadinessBoard ===
```

= 4 件すべて **0 lines** (self-file 以外の references なし)。削除条件を満たすことを確認。

### 4-2. Files deleted (4)

```bash
rm dashboard/src/components/CampaignStatusCard.tsx \
   dashboard/src/components/NextActionChecklist.tsx \
   dashboard/src/components/WorkingPipelineStatus.tsx \
   dashboard/src/components/PublishReadinessBoard.tsx
```

### 4-3. Final grep result

削除後の verification:
```bash
$ grep -rn "CampaignStatusCard\|NextActionChecklist\|WorkingPipelineStatus\|PublishReadinessBoard" dashboard/src
(no output)
```

= **0 lines**、4 ファイル分の参照が dashboard ソースから完全消滅。

### 4-4. Build validation

```
cd dashboard && npm run build  → ✓ TypeScript clean, 23 routes (unchanged)
npm run build (Sanity Studio)  → ✓ Build Sanity Studio (7815ms) clean
```

23 routes 健在 (前 batch から不変):

```
/, /_not-found, /activity-log, /analytics, /api/asset-thumb,
/api/visual-review/assets/[assetId]/candidates,
/api/visual-review/candidate-image, /api/visual-review/inbox,
/api/visual-review/review-manifest,
/campaigns, /campaigns/[slug], /configurator, /diagnostics,
/human-review-gates, /knowledge, /outputs, /publish,
/publish-package/[slug], /publish-packages, /settings,
/visual-assets, /visual-assets/[assetId],
/visual-assets/[assetId]/candidates
```

### 4-5. Files intentionally kept (8、handoff/0168 enumeration 遵守)

**B バケット (7 件、`/campaigns/[slug]` 依存)**:

| File | 残り使用箇所 | 削除可能になる条件 |
|---|---|---|
| `PublishPackageLinks.tsx` | `/campaigns/[slug]:229` | Phase UI-fidelity-11 |
| `ManualPublishingStatusList.tsx` | `/campaigns/[slug]:235` | 同上 |
| `PromptTemplateSummary.tsx` | `/campaigns/[slug]:19` | 同上 |
| `HumanReviewGateList.tsx` | `/campaigns/[slug]:220` | 同上 |
| `VisualAssetStatusTable.tsx` | `/campaigns/[slug]:223` | 同上 |
| `SelectedPlatformChips.tsx` | `/campaigns/[slug]:217` | 同上 |
| `ReleaseReviewLinks.tsx` | `/:195` + `/campaigns/[slug]:186` | Home + detail 両方の fidelity 置換 |

**C バケット (1 件、partial dead)**:

| File | 状態 |
|---|---|
| `NextActionSummary.tsx` | `computeNextActions` (helper) は `campaign/NextActionList.tsx:13` で active 利用、`NextActionSummary` (component) 本体は dead。ファイル削除には helper extract が前提 |

## 5. Key Decisions

- **handoff/0168 で audit 確認済 → 即 `rm`**: 4 件すべて grep 0 + bundle tree-shake 済、安全
- **`rm` のみ、編集なし**: 削除 microbatch は単純な removal で完結、コメント / 文書修正は別 batch
- **B/C 不削除を厳守**: handoff/0168 §3 で「削除しない」と明示した 8 件を 1 件も touch しない、Phase UI-fidelity-11 の前提が変わらないように
- **bundle 影響ゼロ**: Phase UI-fidelity 完了時点で tree-shake 済 → 本 microbatch の bundle 削減はゼロ、file system tidiness のみ

## 6. Remaining Legacy Components

### 短期 (個別 microbatch 候補)

- `NextActionSummary.tsx` の `computeNextActions` を `lib/campaign/nextActions.ts` に extract → ファイル削除 (Phase UI-fidelity-11 が遠い場合の単発 cleanup option)

### 中期 (Phase UI-fidelity-11: `/campaigns/[slug]` deep refactor)

7 件 (B バケット) を新 fidelity component に置換し、`/campaigns/[slug]` detail page を完全 rewrite。

| File | 置換戦略候補 |
|---|---|
| `PublishPackageLinks.tsx` | inline FilePathsCard pattern |
| `ManualPublishingStatusList.tsx` | 既存 `campaign/PublishingScheduleTable.tsx` への完全移行 (現状並存中) |
| `PromptTemplateSummary.tsx` | inline KpiCard or new dedicated card |
| `HumanReviewGateList.tsx` | `/human-review-gates` でも使われている pattern を引き戻し or inline |
| `VisualAssetStatusTable.tsx` | inline AssetCardGrid pattern |
| `SelectedPlatformChips.tsx` | PlatformBadge を inline で |
| `ReleaseReviewLinks.tsx` | Home + detail で各 page に inline、or new component |

### docs

- `dashboard/README.md` の Repository layout 一括更新 (CampaignStatusCard 含む歴史的記述)

## 7. Human Review Questions

1. **boss が dev で 23 routes 巡回確認**: 動作変化ゼロを確認できるか?
2. **Phase UI-fidelity-11 着手タイミング**: 直近で着手するか、Phase 2B 議論 / README rewrite を先にするか
3. **C `NextActionSummary` の単独 microbatch**: Phase UI-fidelity-11 が遠い場合に立てるか、それとも rewrite と同時で待つか

## 8. Risks or Uncertainties

- **bundle 上の変化なし**: 本 microbatch は tree-shake 済の deletion なので production deploy 後の動作も完全に同じ
- **git history**: 4 ファイルとも復元可能、boss が「歴史的 reference」必要時は git log で検索可能
- **README の stale 記述**: `CampaignStatusCard` が `dashboard/README.md:352` Repository layout に残るが、別 README rewrite batch で処理予定 (動作には無関係)

## 9. Next Recommended Step

**Option A (推奨) — Phase UI-fidelity-11 (`/campaigns/[slug]` deep refactor) spec batch**

`/campaigns/[slug]` detail page を完全 fidelity 化、B 7 件 + C 1 件をすべて整理する中規模 batch の前提を spec docs only で確定。Phase UI-fidelity cycle の完全 deep cleanup の入口。

```text
Create fidelity spec for /campaigns/[slug] deep refactor (Phase UI-fidelity-11).

Use:
- docs/handoff/0169-phase-admin-A-bucket-delete.md (B/C enumeration)
- docs/handoff/0145-campaign-detail-fidelity-implementation.md (Phase UI-fidelity-1 land state)
- docs/68 / docs/69 / latest UI fidelity tone

Hard Rules (audit + spec docs only):
- Do NOT modify code in this batch.
- Do NOT modify Sanity schema.
- Do NOT add packages.
- Audit-only docs deliverable.

Tasks:
1. Audit current /campaigns/[slug]/page.tsx (line-by-line)
2. List old components used and their replacement strategy
3. Spec docs/81-campaign-detail-deep-refactor-spec.md
4. Phase UI-fidelity-11 用 Codex prompt を handoff §9 に同梱
```

**Option B — `NextActionSummary` extract microbatch**

`computeNextActions` を `lib/campaign/nextActions.ts` に extract、`campaign/NextActionList.tsx` の import 更新、ファイル削除。3-step microbatch。

**Option C — dashboard/README.md 全体書き直し**

Batch B/C/D 時代の構造記述を Phase UI-fidelity-1〜10 + B fixes + audit + delete 全て反映の README rewrite。

**Option D — Phase 2B 議論**

実 write actions の方針確定。
