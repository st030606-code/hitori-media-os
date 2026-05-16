# Handoff: Admin Phase 1 Implementation Plan (design only)

Date: 2026-05-14
Status: **design-only / next-js-not-scaffolded / batch-a-spec-ready**

## 1. Task Goal

Phase Admin 0 → 1 trigger 全達成（[batch 0097](0097-insert-campaign-generation-seeds.md) / [batch 0108](0108-insert-campaign-generation-seeds.md)）を受けて、Next.js scaffold バッチ（Batch A）に入る前の 1 設計 doc を起こす。**実装は 1 行もしない**。

## 2. Constraints Followed

- Next.jsを scaffold していない（依存追加 0、`create-next-app` 0 回）。
- Auth を実装していない。
- paid API integration を追加していない。
- OpenAI API / Anthropic API クライアントを repo に追加していない。
- auto-postingを実装していない。
- Sanity direct write を実装していない（grep 0 hits 維持）。
- Sanity write token usage を仕込んでいない。
- Sanity CLI 自動実行: 0 回。
- `seed --replace` を実行していない。
- 既存スキーマを破壊的に変更していない。
- 既存 active 16 schemas / `sanity.config.ts` / `structure/index.ts` / `tools/` / `package.json` / `package-lock.json` を変更していない。
- 画像 candidate を本バッチで生成していない。
- `assets/visuals/...` / `patches/...` / `assets/inbox/` を変更していない。
- publish-packages を本バッチで変更していない。
- DNS / hosting に触れていない。

## 3. Changed Files

### Added

- `docs/59-admin-phase-1-implementation-plan.md`（12 節、画面構成 / GROQ 7 件 / component 8 件 / Batch A〜D 分割）
- `docs/devlog/0098-admin-phase-1-implementation-plan.md`
- `docs/handoff/0109-admin-phase-1-implementation-plan.md`

### Modified

- `docs/handoff/latest.md`（本 0109 にミラー）

### Confirmed unchanged

- `schemas/` 全件（active 16）
- `sanity.config.ts` / `structure/index.ts`
- `tools/` / `package.json` / `package-lock.json`
- 既存 seed / outputs / publish-packages / private / ai-blog-db 関連
- `assets/visuals/` / `patches/` / `assets/inbox/`
- DNS / hosting / Auth: いずれも未変更

## 4. Summary of Changes

### A. docs/59 構成（12 節）

1. なぜ Phase Admin 1 を始められるのか — trigger 4 条件 / dataset 内容を整理
2. なぜ本バッチは依然 design only — 1 doc で Batch A の入力仕様書を準備
3. アプリ アーキテクチャ — Next.js App Router / Tailwind / `@sanity/client` read-only / Auth なし
4. 環境変数 — `NEXT_PUBLIC_SANITY_PROJECT_ID` / `DATASET` / `API_VERSION` / 任意 `SANITY_READ_TOKEN` / 永続: write token / OPENAI API key 禁止
5. ルートマップ — Must-have 6 / Nice-to-have 8 / やらない 3
6. **最初に建てる画面 — Campaign Detail を推奨**（理由 4 つ）+ 画面構成 + empty states + read-only ACTIONS
7. GROQ 7 件 — campaign list / detail by slug / pending gates / visual asset status / promptTemplate join / brand+style summary / dashboard home
8. Component 8 件 — CampaignStatusCard / HumanReviewGateList / VisualAssetStatusTable / SelectedPlatformChips / PublishPackageLinks / PromptTemplateSummary / BrandProfileSummary / DiagnosticsSummary
9. **実装バッチ分割 — Batch A: scaffold + Campaign Detail 1 画面 / Batch B: Dashboard Home + list + gates / Batch C: visual / publish / diagnostics / Batch D: deploy**
10. やらないこと（再確認）
11. 次バッチへの推奨 — Batch A の exact prompt
12. Open Questions（人間判断 4 件）

### B. 最初に建てる画面 — Campaign Detail（推奨）

選定理由:

1. 最も具体: building-hitori-media-os 1 件で 1 画面が render
2. 最も多くの component を exercise する（8 個中 6 個を使う）
3. 最も daily で見る画面になる予定
4. GROQ の複雑度が中間（cross-type string ID join を含む）

代替: Dashboard Home（campaign が 1 件しかないので集約 view の意味が薄い）

### C. GROQ string ID dereference の重要パターン

```groq
"plan": *[_id == ^.visualAssetPlanId][0]{...}
"template": *[_id == ^.promptTemplateId][0]{...}
"doc": *[_id == ^.recordId][0]{...}
```

campaignPlan の `requiredVisualAssets` / `promptTemplateSelections` / `requiredRecords` は string ID（Sanity reference ではない）ため、`->` 構文ではなく `*[_id == ^.X][0]` で join。

### D. Phase Admin 1 routes — Must-have 6 / Nice-to-have 8

**Must-have**:
- `/`（Dashboard Home）
- `/campaigns`
- `/campaigns/[slug]`
- `/visual-assets`
- `/human-review-gates`
- `/diagnostics`

**Nice-to-have**:
- `/content-ideas` / `/content-ideas/[slug]`
- `/platform-outputs`
- `/prompt-templates` / `/prompt-templates/[slug]`
- `/publish-packages`
- `/manual-publishing-log`
- `/settings/brand-profiles` / `/settings/visual-style-profiles`
- `/activity-log`

**やらない**: `/inbox`（Visual Register 外部リンクのみ）/ `/patches`（同左）/ `/auth/*`

### E. 環境変数（将来）

```text
NEXT_PUBLIC_SANITY_PROJECT_ID=<既存 SANITY_STUDIO_PROJECT_ID と同値>
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-08-15
# 任意:
SANITY_READ_TOKEN=<read-only token、server side only>
```

**Rules**: write token / paid API key 一切なし、`.gitignore` で `.env.local` 除外、`NEXT_PUBLIC_` プレフィックスは brand/project ID 等のみ。

### F. 実装バッチ分割（将来）

| Batch | 内容 |
| --- | --- |
| **A** | scaffold + Tailwind + `@sanity/client` + `lib/sanity.ts` + `lib/groq/campaign.ts` + 5 component + `/campaigns/[slug]/page.tsx` 1 画面 |
| **B** | Dashboard Home + Campaigns list + Human Review Gates + 残り 3 component |
| **C** | Visual Assets / Publish Packages / Diagnostics / Activity Log |
| **D** | Vercel deploy + DNS + Basic Auth or middleware（public 化禁止） |

各 batch は完結する（前 batch までの画面は壊さない）。

### G. Validation Results

- `npm run local:check`: ok: true（17 green / 0 fail）
- `npm run build`: 成功
- direct Sanity write の grep: 0 hits（不変）
- paid API integration の grep: 0 hits（不変）
- 画像生成: 0 件
- schema 変更: 0 件
- Next.js 依存: **未追加**（`package.json` 不変）
- `assets/visuals/` / `patches/` / `assets/inbox/`: 不変

## 5. Important Decisions

- **scaffold バッチに入る前に design を 1 doc で書ききる**: 後の Batch A を 30 分以内で回せるようにする
- **Campaign Detail を最初の 1 画面**: Dashboard Home より具体、boss が daily で見る、component 最大 exercise
- **string ID dereference 構文を明示**: GROQ の `*[_id == ^.X][0]` を docs に書いておくことで実装段階の試行錯誤を削減
- **`dashboard/` subdirectory を同 repo に置く案を採用**: Sanity schema と env を共有しやすい、Phase Admin 1 終了時に分離判断
- **Tailwind 採用**: 既存 Visual Register と統一感、minimal CSS で速い
- **Auth は Phase Admin 1 では入れない**: localhost only で開発、Phase Admin 2 で着手
- **Batch D deploy 時に Basic Auth or middleware で localhost 以外 denied**: public 化禁止を明文化

## 6. Human Review Questions

- `dashboard/` を同 repo に置く（推奨）か、別 repo にするか？
- Batch A を「次にやる」で確定でよいか、それとも残り 5 visual の生成サイクル / structure/index.ts 拡張 / Codex diff watcher を先に挟むか？
- Tailwind preset を既存 Visual Register と揃えるか、Next.js デフォルトのまま行くか？
- 公開サイト `hitorimedia.com` 着手のタイミングはいつか（Batch A〜D の間 / 完了後）？

## 7. Risks or Uncertainties

- **`dashboard/` を同 repo に置くと Sanity の build と Next.js の build が共存する**: 既存 `npm run build`（Sanity）が壊れないことは Batch A の guardrail で確認必須
- **string ID dereference の typo リスク**: `recordId` / `visualAssetPlanId` / `promptTemplateId` を string で書いているので、typo すると `null` が返るだけで silent fail。dashboard で「Reference not in dataset」表示 + Studio 直リンクを提供する設計を docs/59 §6.2 に書いた
- **building-hitori-media-os の campaignPlan.requiredVisualAssets[?slug == x-hook-main-v1].state stale**: `pending-review` のまま、実際は `done`。dashboard に「seed stale」warning を出すか、それとも Studio で人間が手動更新するか
- **Phase Admin 1 が長引くと「読み」だけで運用負荷が下がらない**: write を後付けする design を Phase Admin 2 で明確化する必要

## 8. Recommended Next Step

### Immediate Human Actions

- `docs/59-admin-phase-1-implementation-plan.md` を読み、「最初に建てる画面 = Campaign Detail」が妥当か判断
- `dashboard/` を同 repo に置く案で問題ないか確認
- Batch A を即着手するか、それとも残り 5 visual / structure 拡張 / diff watcher のいずれかを先に挟むか判断

### Next Implementation Batches

1. **Batch A — Next.js scaffold + Campaign Detail 1 画面**（[docs/59 §11](../59-admin-phase-1-implementation-plan.md#11-次バッチへの推奨) の exact prompt 参照）
2. Batch B — Dashboard Home + Campaigns list + Human Review Gates
3. Batch C — Visual Assets / Publish Packages / Diagnostics / Activity Log
4. Batch D — Vercel deploy + DNS（Basic Auth or middleware で localhost 以外 denied）

### Parallel / Optional

- 残り 5 visual（threads-support-diagram-v1 / note-inline 3 件 / substack-inline-reader-system-v1）の生成サイクル
- `structure/index.ts` の `directGroupedTypes` に `campaignPlan` 追加（"Content Ideas → By Content Idea → Campaign Plans" view）
- `tools/campaign-plan/sync-state.mjs` の概念 sketch（visual state を campaignPlan に書き戻し、`--dry-run` から）
- `tools/codex-workflow/` に Codex agent diff watcher script
- Auth scheme 決定（Phase Admin 2 着手前の design batch）

### Deferred（永続）

- paid LLM / image generation API integration
- auto-posting / automated publish
- AI auto-review of drafts
- multi-user / collaboration tooling
- billing / paid tier
- analytics fetch / dashboard charts
- 旧 `prompt` schema を `promptTemplate` 派生 instance として再定義する migration

## 9. Exact Prompt to Give Codex Next

```text
Scaffold Phase Admin 1 — Batch A: Next.js dashboard with Campaign Detail page only.

Hard Rules:
- Create Next.js scaffold in dashboard/ subdirectory only.
- Do NOT modify schemas/, structure/, sanity.config.ts, tools/.
- Do NOT add Auth.
- Do NOT add Sanity write token usage.
- Do NOT add OpenAI / Anthropic API clients.
- Do NOT auto-post.
- Do NOT modify assets/visuals/... or patches/...
- Do NOT generate images.
- Only Campaign Detail page in this batch (no Dashboard Home, no list).
- Do NOT modify or break existing `npm run build` (Sanity Studio build must remain green).

Use:
- docs/59-admin-phase-1-implementation-plan.md (read entire doc, focus on §6, §7.2, §8, §9 Batch A)
- schemas/campaignPlan.ts / promptTemplate.ts / brandProfile.ts / visualStyleProfile.ts (read-only reference)
- existing Sanity dataset (read-only)

Steps:
1. mkdir dashboard && cd dashboard
2. npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
3. cd dashboard && npm i @sanity/client
4. dashboard/.env.local with:
   NEXT_PUBLIC_SANITY_PROJECT_ID=<same as SANITY_STUDIO_PROJECT_ID>
   NEXT_PUBLIC_SANITY_DATASET=production
   NEXT_PUBLIC_SANITY_API_VERSION=2025-08-15
5. dashboard/.gitignore: confirm .env.local is excluded
6. dashboard/src/lib/sanity.ts: createClient (CDN, read-only, no write token)
7. dashboard/src/lib/groq/campaign.ts: GROQ query from docs/59 §7.2
8. 5 components per docs/59 §8 (CampaignStatusCard / HumanReviewGateList / VisualAssetStatusTable / SelectedPlatformChips / PromptTemplateSummary)
9. dashboard/src/app/campaigns/[slug]/page.tsx: render building-hitori-media-os
10. dashboard/README.md: run instructions

Verify:
- `cd /repo && npm run build` (Sanity Studio) still green
- `cd /repo && npm run local:check` (17 ok / 0 fail)
- `cd /repo/dashboard && npm run build` green
- `cd /repo/dashboard && npm run dev` and confirm http://localhost:3000/campaigns/building-hitori-media-os renders

End-of-run output:
- file tree under dashboard/
- env vars used (no secrets disclosed)
- npm run build results (both root and dashboard)
- localhost render confirmation
- git diff --stat summary
```
