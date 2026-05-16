# Handoff: building-hitori-media-os visualAssetPlan Sanity Ingest Status

Date: 2026-05-14
Status: **completed**（human-confirmed in Sanity Studio, 2026-05-14）

## 1. Task Goal

`seed/visual-asset-plan-records-building-hitori-media-os.json` の Sanity dataset への投入状態を公式記録する。CLI から dataset を観測する手段は無いが、人間が Sanity Studio で確認した結果、building-hitori-media-os の visualAssetPlan 9 件はまだ Studio に出ていない（ai-blog-db のみ表示）。

本バッチは人間が手動で `npx sanity documents create` を1回実行する直前の準備記録。Sanity への自動書き込みは一切しない。

## 2. Constraints Followed

- Next.jsは追加していない。
- paid LLM API integration は追加していない。
- external APIは呼んでいない。
- auto-postingは実装していない。
- Sanity direct write は実装していない（grep 0 hits 維持）。
- Sanity CLI commands を自動実行していない（人間判断で実行する想定）。
- `seed --replace` は実行していない。
- 既存 ai-blog-db レコードを変更していない。
- assets / images を変更していない。
- secrets / API キー / 実 project ID / private/ filename は commit していない。

## 3. Changed Files

### Added

- `docs/devlog/0086-building-hitori-media-os-visualassetplan-sanity-ingest-status.md`
- `docs/handoff/0097-building-hitori-media-os-visualassetplan-sanity-ingest-status.md`

### Modified

- `docs/handoff/latest.md`

### Confirmed unchanged

- 既存スキーマ全般 / `schemas/index.ts` / `sanity.config.ts`
- 既存 outputs / publish-packages / private / 既存 seed
- `tools/visual-register/` / `tools/publish-package-builder/` / `tools/local-check.mjs`
- `structure/index.ts`
- ai-blog-db 関連すべて

## 4. Summary of Changes

### Observed State

- seed file 存在: `seed/visual-asset-plan-records-building-hitori-media-os.json`（26,176 bytes、JSON valid、9 records）
- 9 visualAssetPlan ID 確認済み（次節参照）
- Sanity Studio (human-observed): ai-blog-db visualAssetPlan のみ表示、building-hitori-media-os は未表示 → **未投入**

### 9 Expected `_id` values

```text
visualAssetPlan.building-hitori-media-os.note-hero-v1                              ★ P1
visualAssetPlan.building-hitori-media-os.substack-header-v1                        ★ P1（master 共有）
visualAssetPlan.building-hitori-media-os.x-hook-main-v1                            ★ P1
visualAssetPlan.building-hitori-media-os.threads-support-diagram-v1
visualAssetPlan.building-hitori-media-os.note-inline-content-os-flow-v1
visualAssetPlan.building-hitori-media-os.note-inline-human-judgment-v1
visualAssetPlan.building-hitori-media-os.note-inline-manual-vs-automation-v1
visualAssetPlan.building-hitori-media-os.note-inline-publish-package-folder-v1
visualAssetPlan.building-hitori-media-os.substack-inline-reader-system-v1
```

### Safe Create Command

```bash
npx sanity documents create seed/visual-asset-plan-records-building-hitori-media-os.json
```

🚫 `--replace` 禁止。  
🚫 `npx sanity dataset import` 系も禁止（既存上書きリスク）。

### Prerequisite

- `contentIdea.building-hitori-media-os` が dataset に既に存在すること（reference validation）。
- 未投入なら先に `npx sanity documents create seed/contentIdea-building-hitori-media-os.json` を実行。

### After Insert: Studio Search

`npm run dev` で Studio を再読込し、次を検索:

- `building-hitori-media-os` → 9 件 hit
- `note-hero-v1` → `visualAssetPlan.building-hitori-media-os.note-hero-v1`
- `substack-header-v1` → `visualAssetPlan.building-hitori-media-os.substack-header-v1`

新しい Content Idea-Centered Structure（[docs/46](../46-sanity-content-idea-centered-structure.md)）から `Content Ideas → By Content Idea → building-hitori-media-os → Visual Asset Plans` でも一覧できる。

### Manual Updates Required After Insert

`note-hero-v1` の production image は既に Visual Register で承認・登録済み（`docs/devlog/0085`）。対応する2件を Studio で更新:

**`visualAssetPlan.building-hitori-media-os.note-hero-v1`**

| Field | Value |
| --- | --- |
| `localAssetPath` | `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` |
| `status` | `saved` |
| `reviewNotes` | `Production hero image selected and registered through Visual Register Inbox Review. Shared master asset for note hero and Substack header.` |

**`visualAssetPlan.building-hitori-media-os.substack-header-v1`**（master 共有のため同じパス）

| Field | Value |
| --- | --- |
| `localAssetPath` | `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` |
| `status` | `saved` |
| `reviewNotes` | `Production hero image selected and registered through Visual Register Inbox Review. Shared master asset for note hero and Substack header.` |

## 5. Important Decisions

- Sanity CLI を自動実行しない（人間1回限りの実行が安全）。
- `--replace` / `dataset import` 系を使わない方針を明示。
- 既存 ai-blog-db レコードに触らない。
- 投入確認は人間が Studio で手動でやる（CLI から dataset 状態を観測できないため）。
- production image 既存登録（local 完了済み）と Studio 反映（未確定）を別バッチで明確に管理。

## 6. Human Review Questions

- `contentIdea.building-hitori-media-os` は既に Sanity にあるか、これも先に投入が必要か？
- 投入したあと、note-hero-v1 と substack-header-v1 の Studio 更新までを1セッションで完了できるか？
- 投入後に違和感（フィールド表示 / radio status / reference UI）があれば、次バッチで schema を微調整するか？
- Studio 上で見えた 9 件のうち、不要 / リネームしたいものはあるか？

## 7. Risks or Uncertainties

- CLI から Sanity dataset 状態を観測できないため、本 handoff の "not-yet-inserted" は **人間の Studio 観察結果に基づく**。CLI 確認ではない。
- 万一すでに過去に部分投入されていた場合、`documents create` で `_id` 重複エラーが出る可能性。エラーメッセージを人間が確認して個別対応する想定。
- `contentIdea.building-hitori-media-os` が未投入の場合、reference validation 警告が出る可能性。先に contentIdea を投入することで回避。
- 投入後 Studio 上で表示される `localAssetPath` は **空** の状態（seed では空文字）。手動更新が必要なのは note-hero-v1 / substack-header-v1 の2件のみ、残り7件は今後の production visual 生成サイクルで埋まる。

## 8. Recommended Next Step

### Immediate Human Actions（順序厳守）

1. **`contentIdea.building-hitori-media-os` が Studio にあるか確認**:
   - 無ければ: `npx sanity documents create seed/contentIdea-building-hitori-media-os.json`
2. **visualAssetPlan 9 件を投入**:
   ```bash
   npx sanity documents create seed/visual-asset-plan-records-building-hitori-media-os.json
   ```
3. `npm run dev` で Studio を再読込。
4. Search で `building-hitori-media-os` を検索 → 9 件 hit 確認。
5. `Content Ideas → By Content Idea → building-hitori-media-os → Visual Asset Plans` で 9 件確認（新 structure を使う場合）。
6. **`visualAssetPlan.note-hero-v1`** を開いて、`localAssetPath` / `status: saved` / `reviewNotes` を上記値で手動更新。
7. **`visualAssetPlan.substack-header-v1`** を開いて、同じ `localAssetPath` を入力。
8. 投入と手動更新が完了したら、本handoff を update して `[x]` チェックする別バッチを Claude Code に依頼。

### Mid-term

- `npm run publish:package -- building-hitori-media-os`（flag なし）で publish-package images/ に campaign-hero-v1.png を実配布。
- `x-hook-main-v1` の candidate 生成へ進む（[tasks/visuals/building-hitori-media-os/x-hook-main-v1.md](../tasks/visuals/building-hitori-media-os/x-hook-main-v1.md)）。

### Do Not Mark Complete Until Human Confirms

本 handoff の `Status` は **`local-only / not-yet-inserted`** のまま。人間が:

- Studio 上で 9 件確認
- note-hero-v1 / substack-header-v1 の手動更新完了

を報告するまで、`completed` には更新しない。

## 9. Exact Prompt to Give Codex Next

```text
Confirm the building-hitori-media-os visualAssetPlan Sanity ingest status after human action.

Do not edit files.
Do not run Sanity CLI commands.
Do not write to Sanity from code.

Use:
- docs/devlog/0086-building-hitori-media-os-visualassetplan-sanity-ingest-status.md
- docs/handoff/0097-building-hitori-media-os-visualassetplan-sanity-ingest-status.md
- seed/visual-asset-plan-records-building-hitori-media-os.json
- structure/index.ts
- sanity.config.ts

Steps:
1. Wait for the human to report whether they ran "npx sanity documents create seed/visual-asset-plan-records-building-hitori-media-os.json".
2. Wait for the human to confirm Studio shows 9 building-hitori-media-os visualAssetPlan records.
3. Wait for the human to confirm note-hero-v1 and substack-header-v1 are updated with:
   localAssetPath: assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png
   status: saved
   reviewNotes: "Production hero image selected and registered through Visual Register Inbox Review. Shared master asset for note hero and Substack header."
4. Once confirmed, update docs/devlog and docs/handoff/latest.md to reflect status: completed, mark checkboxes, and prepare next batch for x-hook-main-v1 candidate generation.

Do not run any Sanity CLI commands yourself.
Do not pretend the ingest succeeded if the human has not confirmed.
```
