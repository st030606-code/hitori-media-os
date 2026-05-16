# Handoff: Insert 4 Campaign Generation Seeds + Phase Admin 0 → 1 Trigger Achieved

Date: 2026-05-14
Status: **all-4-seeds-inserted / refs-resolved-via-groq / phase-admin-trigger-fully-satisfied / studio-final-confirm-pending-human**

## 1. Task Goal

[batch 0096](0107-activate-campaign-generation-schemas.md) で activate した 4 schema に対応する 4 seed を `npx sanity documents create` で依存順に Sanity dataset へ投入。投入後 GROQ で ref 解決を確認し、`docs/58` の Phase Admin 0 → 1 trigger を `[x]` に統合更新。

依存順: `brandProfile → visualStyleProfile → promptTemplate → campaignPlan`

## 2. Constraints Followed

- Next.jsを追加していない。
- paid API integration を追加していない。
- OpenAI API / Anthropic API クライアントを repo に追加していない。
- auto-postingを実装していない。
- Sanity direct write をコードに実装していない（コード経由 grep 0 hits 維持）。
- `--replace` を使っていない。
- `npx sanity dataset import` を使っていない。
- seed JSON を編集していない。
- 既存 active schemas を破壊的に変更していない。
- 画像 candidate を本バッチで生成していない。
- `assets/visuals/...` / `patches/...` / `assets/inbox/`を変更していない。
- publish-packages を本バッチで変更していない。
- `sanity.config.ts` / `structure/index.ts` / `schemas/` を変更していない。

## 3. Changed Files

### Inserted (Sanity dataset)

| Action | Target |
| --- | --- |
| `npx sanity documents create seed/brand-profile-hitori-media-os-default.json` | `brandProfile.hitori-media-os-default` |
| `npx sanity documents create seed/visual-style-profile-hitori-media-os-x-hook-image.json` | `visualStyleProfile.hitori-media-os.x-hook-image` |
| `npx sanity documents create seed/prompt-template-x-hook-image-diagram-rich-v1.json` | `promptTemplate.x-hook-image-diagram-rich-v1` |
| `npx sanity documents create seed/campaign-plan-building-hitori-media-os.json` | `campaignPlan.building-hitori-media-os` |

各投入後に `npx sanity documents query` で `_id` 存在と ref 解決を確認。

### Modified

- `docs/58-admin-dashboard-phase-plan.md` — trigger 4 条件すべて `[x]` 化、達成記述に書き換え

### Added

- `docs/devlog/0097-insert-campaign-generation-seeds.md`
- `docs/handoff/0108-insert-campaign-generation-seeds.md`

### Modified (mirror)

- `docs/handoff/latest.md`（本 0108 にミラー）

### Confirmed unchanged

- `schemas/` 全件（active 16）
- `sanity.config.ts` / `structure/index.ts` / `tools/` / `package.json` / `package-lock.json`
- 既存 seed JSON ファイル 4 件（投入時に **編集していない**、`mtime` 不変）
- 既存 outputs / publish-packages / private / ai-blog-db 関連
- `assets/visuals/` / `patches/` / `assets/inbox/`
- 既存 12 schema 種別の dataset record（contentIdea / platformOutput / visualAssetPlan / etc）

## 4. Summary of Changes

### A. Insertion Results

すべて `--replace` なしで成功:

```
=== insert 1: brandProfile ===
Created:
  - brandProfile.hitori-media-os-default

=== insert 2: visualStyleProfile ===
Created:
  - visualStyleProfile.hitori-media-os.x-hook-image

=== insert 3: promptTemplate ===
Created:
  - promptTemplate.x-hook-image-diagram-rich-v1

=== insert 4: campaignPlan ===
Created:
  - campaignPlan.building-hitori-media-os
```

### B. Reference Resolution Verified (GROQ で確認)

**visualStyleProfile.hitori-media-os.x-hook-image**:

```json
{
  "brandProfileResolved": {"_id": "brandProfile.hitori-media-os-default", "brandName": "Hitori Media OS"},
  "applicablePlatforms": ["x"],
  "assetTypes": ["hook-image"],
  "defaultLayoutPattern": "title-with-single-diagram"
}
```

**promptTemplate.x-hook-image-diagram-rich-v1**:

```json
{
  "brandProfileResolved": {"_id": "brandProfile.hitori-media-os-default", "brandName": "Hitori Media OS"},
  "visualStyleProfileResolved": {"_id": "visualStyleProfile.hitori-media-os.x-hook-image", "title": "Hitori Media OS / X / hook-image"},
  "category": "image-generation",
  "automationLevel": "semi-auto"
}
```

**campaignPlan.building-hitori-media-os**:

```json
{
  "sourceContentIdeaResolved": {"_id": "contentIdea.building-hitori-media-os", "title": "AIで「ひとりメディア運営OS」を作っている裏側"},
  "brandProfileResolved": {"_id": "brandProfile.hitori-media-os-default", "brandName": "Hitori Media OS"},
  "campaignType": "build-log",
  "contentMode": "building-in-public",
  "selectedPlatforms": "4 件 (x P1 hook-only / threads P2 summary / note P1 full-article / substack P1 full-article)",
  "requiredVisualAssets": "7 件 (note-hero-v1 done / substack-header-v1 done / x-hook-main-v1 pending-review / threads-support-diagram-v1 not-started / note-inline-content-os-flow-v1 not-started / note-inline-human-judgment-v1 not-started / substack-inline-reader-system-v1 not-started)"
}
```

### C. Known State Staleness

`campaignPlan.building-hitori-media-os.requiredVisualAssets[?assetSlug == "x-hook-main-v1"].state` は **`pending-review`** （seed 作成時点の凍結）。
実際の x-hook-main-v1 は [batch 0095](../devlog/0095-x-hook-main-v1-visual-register-approval.md) で **`done`** 完了（approve + Sanity 反映 + publish 配布）。

本バッチでは seed を編集しないので、dataset も `pending-review` のまま。Studio で人間が `done` に更新するか、将来 `tools/campaign-plan/sync-state.mjs`（仮）で自動同期するかは別判断。

### D. Phase Admin 0 → 1 Trigger 4 条件 — 達成記録

| 条件 | 達成バッチ |
| --- | --- |
| 4 proposed schema activate | batch 0096 |
| campaignPlan seed 投入 | **本バッチ 0097/0108** |
| Visual Register ≥ 2 production asset approve | batch 0090/0095 |
| publish package distribution が X / note / Substack で動く | batch 0095 |

→ **すべて達成**。`docs/58` を更新済（trigger 4 条件すべて `[x]`、達成記述）。

### E. Validation Results

- `npm run local:check`: **ok: true**（17 green / 0 fail）
- `npm run build`: **成功**
- direct Sanity write の grep（コード経由）: 0 hits（不変）
- paid LLM/image API client/SDK の repo 追加: 0 hits（不変）
- `seed --replace` 実行: 0 回
- `npx sanity dataset import` 実行: 0 回
- seed JSON ファイルの編集: 0 件
- 画像生成: 0 件
- schema 変更: 0 件
- 既存 active 16 schemas / Studio structure: 不変

## 5. Important Decisions

- **rolling insertion**: 4 件まとめて投入せず、1 件 insert → GROQ で `_id` 確認 → ref 解決確認 → 次。失敗時の切り分けが容易。
- **依存順厳守**: brandProfile → visualStyleProfile → promptTemplate → campaignPlan。weak ref / strong ref 双方を遅延解決させない。
- **`contentIdea.building-hitori-media-os` の事前確認**: campaignPlan の strong ref 失敗を防ぐため、事前 GROQ で存在確認（"AIで「ひとりメディア運営OS」を作っている裏側" を返した）。
- **seed JSON を編集しない**: 凍結状態を保つ。x-hook-main-v1 state が `pending-review` のままになるが、これは設計。
- **`--replace` を一切使わない**: 既存記録の上書き禁止方針を維持。
- **Sanity dataset への書き込みを Claude Code が行うのは本バッチに限定**: 通常は人間判断、本バッチは人間 explicit 認可済。

## 6. Human Review Questions

- Studio で 4 新規 document が表示されることを目視確認できたか？（`brandProfile.hitori-media-os-default` / `visualStyleProfile.hitori-media-os.x-hook-image` / `promptTemplate.x-hook-image-diagram-rich-v1` / `campaignPlan.building-hitori-media-os`）
- `campaignPlan.building-hitori-media-os.requiredVisualAssets[2].state` を `pending-review` → `done` に Studio で更新するタイミングは今でよいか、それとも別バッチでまとめて整合するか？
- Phase Admin 0 → 1 trigger 4 条件達成。**次は Phase Admin 1 (read-only Next.js dashboard) の design batch に進むか**？ それとも残り 5 visual を先に進めるか？
- `structure/index.ts` の `directGroupedTypes` に `campaignPlan` を追加して "Content Ideas → By Content Idea → Campaign Plans" view を作る design batch を入れるか？

## 7. Risks or Uncertainties

- **Studio 目視確認が pending**: build pass + GROQ ref 解決までは確認できるが、UI 表示は人間アクション。
- **seed と dataset の state 同期が手動**: 将来 visual の state が変わるたび campaignPlan を手動更新する運用負荷。`tools/campaign-plan/sync-state.mjs`（仮）の概念 sketch が必要。
- **dataset への直接書き込みの心理的安全弁**: `--replace` 禁止 / `seed --replace` 禁止 / `dataset import` 禁止 は守られているが、人間が誤って実行するリスクは依然ある。`tools/local-check.mjs` に dataset 状態の sanity check（contentIdea / brandProfile / campaignPlan の `_id` 存在確認）を追加する余地。
- **既存 ai-blog-db キャンペーンへの影響**: 4 新規 type の dataset 投入は ai-blog-db には影響しない（slug が異なる）。ただし将来 ai-blog-db にも brandProfile / campaignPlan を作る場合、seed と運用ガイドが必要。

## 8. Recommended Next Step

### Immediate Human Actions

1. **Studio (`npm run dev`) を開く**
2. **4 新規 document の表示を確認**:
   - `brandProfile.hitori-media-os-default` (brandName: Hitori Media OS)
   - `visualStyleProfile.hitori-media-os.x-hook-image` (X / hook-image)
   - `promptTemplate.x-hook-image-diagram-rich-v1` (X hook-image diagram-rich v1)
   - `campaignPlan.building-hitori-media-os` (building-hitori-media-os campaign)
3. **reference が "Reference unresolved" 警告なしで表示されることを確認**
4. （任意）`campaignPlan.requiredVisualAssets[2].state` を `done` に手動更新

### Next Implementation Batches（推奨順）

1. **Phase Admin 1 design batch**: `docs/59-admin-phase-1-implementation-plan.md` を起こす（Next.js scaffold step、画面ごとの GROQ query、`@sanity/client` read token 設計）
2. **Next.js scaffold**: 最小限 app router + 1 画面 read-only（Dashboard Home or Campaign Detail）
3. （任意・並走可）`structure/index.ts` の `directGroupedTypes` に `campaignPlan` を追加して "Content Ideas → By Content Idea → Campaign Plans" view を作る
4. （任意・並走可）`tools/campaign-plan/sync-state.mjs` の概念 sketch（visual / record の state を GROQ で集めて campaignPlan に書き戻す runner、まずは `--dry-run` のみ）
5. （任意・並走可）`tools/codex-workflow/` に Codex agent diff watcher script

### Mid-term

- 残り 5 visual（threads-support-diagram-v1 / note-inline 3 件 / substack-inline-reader-system-v1）の生成サイクル
- 旧 `prompt` schema を `promptTemplate` 派生 instance として再定義する migration
- Auth scheme 決定（Phase Admin 2 着手時、別 design doc）
- `hitorimedia.com` 公開サイトの content source 決定

### Deferred（永続）

- paid LLM / image generation API integration
- auto-posting / automated publish
- AI auto-review of drafts
- multi-user / collaboration tooling
- billing / paid tier
- analytics fetch / dashboard charts

## 9. Exact Prompt to Give Codex Next

```text
Design Phase Admin 1 read-only Next.js dashboard scaffold plan.

Hard Rules:
- Do NOT scaffold Next.js yet (design only batch).
- Do NOT add Auth.
- Do NOT add paid API integrations.
- Do NOT auto-post.
- Do NOT write directly to Sanity from code.
- Do NOT modify existing schemas.
- Do NOT modify assets/visuals/... or patches/...

Use:
- docs/56-admin-dashboard-architecture.md
- docs/57-hitorimedia-domain-app-plan.md
- docs/58-admin-dashboard-phase-plan.md
- docs/handoff/0108-insert-campaign-generation-seeds.md
- schemas/campaignPlan.ts
- schemas/promptTemplate.ts
- schemas/brandProfile.ts
- schemas/visualStyleProfile.ts
- structure/index.ts

Tasks:
1. Create docs/59-admin-phase-1-implementation-plan.md.
2. Define:
   - exact Next.js scaffold steps (npm create / install dependencies / project structure)
   - environment variables (SANITY_PROJECT_ID / SANITY_DATASET / SANITY_READ_TOKEN as future)
   - app router file tree per page from docs/57 (16 routes)
   - @sanity/client setup (read-only, CDN, no write token)
   - GROQ queries per page (Dashboard Home / Campaign Detail / Human Review Gates as priority)
   - styling decision (Tailwind vs vanilla CSS)
   - what to NOT scaffold in MVP (Auth, write API, post buttons)
3. Identify "first page to implement" (recommend: Dashboard Home or Campaign Detail).
4. Create docs/devlog/0098-admin-phase-1-implementation-plan.md and docs/handoff/0109-admin-phase-1-implementation-plan.md.
5. Validation: npm run local:check + npm run build.

Do NOT actually scaffold Next.js in this batch — design only.
```
