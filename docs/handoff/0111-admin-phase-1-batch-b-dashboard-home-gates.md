# Handoff: Admin Phase 1 — Batch B (Dashboard Home + Campaigns List + Human Review Gates + Next Action Summary)

Date: 2026-05-15
Status: **5-routes-rendering-200 / read-only-maintained / staleness-warning-detected / ready-for-batch-c**

## 1. Task Goal

Batch A の Campaign Detail 1 画面を、boss 視点の運用ダッシュボードへ広げる。Dashboard Home / Campaigns list / Human Review Gates / Visual Assets stub の 4 page + 共通 AppNav + 共通 `NextActionSummary` を追加。Sanity write / Auth / paid API は引き続きゼロ。

## 2. Constraints Followed

- `dashboard/` subdirectory 内で完結（docs / handoff のみ root の docs/ を更新）。
- `schemas/` / `structure/` / `sanity.config.ts` / `tools/` を変更していない。
- Auth を実装していない（localhost only、Phase Admin 2 で着手）。
- Sanity write token usage を仕込んでいない（既存 `SANITY_READ_TOKEN` のみ）。
- Sanity mutation（`.create` / `.patch` / `.delete` / `.commit` / `.transaction` / `.mutate`）を 1 つも使っていない。
- OpenAI / Anthropic / paid image API クライアントを追加していない。
- auto-postingを実装していない。
- `assets/visuals/...` / `patches/...` / `assets/inbox/` を変更していない。
- 画像 candidate を生成していない。
- 既存 Campaign Detail (`/campaigns/[slug]`) を壊していない（依然 HTTP 200、`NextActionSummary` が頭に追加されただけ）。
- 既存 root `npm run build`（Sanity Studio）green を維持。

## 3. Changed Files

### Added — `dashboard/src/components/`

- `AppNav.tsx`（top nav 4 links）
- `ReadOnlyBanner.tsx`（共通 Phase Admin 1 警告）
- `NextActionSummary.tsx`（state 由来の next actions、staleness detection 含む）

### Added — `dashboard/src/app/`

- `campaigns/page.tsx`（Campaigns list）
- `human-review-gates/page.tsx`（4 バケット集約）
- `visual-assets/page.tsx`（Batch C までの stub）

### Modified — `dashboard/src/`

- `app/layout.tsx` — `AppNav` 注入 / metadata 更新
- `app/page.tsx` — Dashboard Home に書き換え
- `app/campaigns/[slug]/page.tsx` — `NextActionSummary` 挿入 + 内部 `ReadOnlyBanner` 関数を共通 component import に置換
- `lib/groq/campaign.ts` — `campaignListQuery` 拡張 / `dashboardHomeQuery` 新規 / `pendingHumanReviewGatesQuery` 新規 / TS 型 3 件追加

### Modified — `dashboard/README.md`

- Batch A + B 両カバー記述
- Routes 表（5 行）
- Project layout に新規 component / route を反映
- Next batches で Batch B 完了マーク

### Added — `docs/`

- `docs/devlog/0100-admin-phase-1-batch-b-dashboard-home-gates.md`
- `docs/handoff/0111-admin-phase-1-batch-b-dashboard-home-gates.md`

### Modified — `docs/`

- `docs/handoff/latest.md`（本 0111 にミラー）

### Confirmed unchanged

- `schemas/` 全件 / `sanity.config.ts` / `structure/index.ts` / `tools/`
- root `package.json` / `package-lock.json`
- 既存 seed / outputs / publish-packages / private / ai-blog-db
- `assets/visuals/` / `patches/` / `assets/inbox/`
- Sanity dataset の record（read-only 接続のみ、書き込み無し）

## 4. Summary of Changes

### A. Routes（render check は curl で確認）

| Route | HTTP | Size | Key content |
| --- | --- | --- | --- |
| `/` | **200** | 38,453 bytes | Dashboard heading / Next Actions / Latest active campaign / **Staleness warning** |
| `/campaigns` | **200** | 26,032 bytes | Campaigns heading / building-hitori-media-os link |
| `/campaigns/building-hitori-media-os` | **200** | 110,471 bytes | Next Actions / **Staleness warning** / coreThesis |
| `/human-review-gates` | **200** | 33,112 bytes | 4 buckets all rendered |
| `/visual-assets` | **200** | 19,843 bytes | Phase Admin 1 stub / Visual Register link |

### B. Components added (3)

- **`AppNav`**: Home / Campaigns / Human Review Gates / Visual Assets + brand label
- **`ReadOnlyBanner`**: Phase Admin 1 警告（再利用可、`/`・list・gates・stub・detail で共有）
- **`NextActionSummary`**: campaign の各 state から next actions を 5 tone（now / soon / later / warn / done）で算出。staleness detection を含む

### C. GROQ queries added (3)

- **`campaignListQuery`** — `*[_type == "campaignPlan"]` を listing 用に展開、counts 4 軸 + selectedPlatforms[] を含む
- **`dashboardHomeQuery`** — top 5 campaigns + dataset-wide counts + `latest` campaign の full detail を 1 query で
- **`pendingHumanReviewGatesQuery`** — 全 campaign の humanReviewGates[] を campaign grouped で返す

すべて read-only。string ID dereference は既存 Campaign Detail と同じパターン。

### D. NextActionSummary の logic（要点）

5 tone で actions を生成、表示順:

1. **warn — staleness**: `requiredVisualAssets[].plan.status in ["saved","reviewed","approved","packaged","published"]` かつ seed-side state が active なら "CampaignPlan may be stale: ..."
2. **now / warn — active gates**: state が pending-review / in-progress / blocked の humanReviewGate を列挙（blocked → warn、それ以外 → now）
3. **soon — visual generation**: priority 順（P0 → P3）で not-done な requiredVisualAssets[] を top 3 まで
4. **later — overflow**: 残りの not-done visuals 数を 1 行で
5. **later — publish packages**: state != done の publishPackagePaths[] 数 + platform 一覧
6. **later — manual publishing**: not-started platform 数 + platform 一覧
7. **done — fall-through**: 全部 done なら "No immediate blockers"

### E. Validation Results

- root `npm run build` (Sanity Studio): ✓ green
- root `npm run local:check`: ✓ 17/17
- dashboard `npm run build`: ✓ 5 routes generated
- dashboard `npm run dev`: ✓ Ready in ~200ms
- curl 5 routes: ✓ HTTP 200 each、key content 各 1 件 match
- direct Sanity write grep（dashboard/src）: 0 hits
- paid LLM/image API SDK grep（dashboard）: 0 hits
- mutation helper export grep（dashboard/src/lib/sanity.ts）: 0 hits

### F. Known UI / data issues

- **`campaignPlan.building-hitori-media-os.requiredVisualAssets[?assetSlug == "x-hook-main-v1"].state` = `pending-review`** だが、被参照 `visualAssetPlan.building-hitori-media-os.x-hook-main-v1.status` = `saved`。`NextActionSummary` が "CampaignPlan may be stale" を warn として出して気づける状態。Studio で seed-side state を `done` に手動更新するか、Batch C で `sync-state` runner を考えるか、別判断。
- **Visual Assets ページが stub**: 完全実装は Batch C。
- **Top nav に Active state ハイライトなし**: pathname-based active style は Batch B では入れず、minimal に。Batch C で改善余地。

## 5. Important Decisions

- **`NextActionSummary` を Dashboard Home と Campaign Detail で共有**: 1 component で 2 page をカバー、boss が「次にやること」を頭で 2 通り覚えない設計
- **Staleness detection を UI 層に組み込み**: seed-frozen と dataset-live の reconciliation は cron / write-back runner で吸収する前に、UI で気づける仕組みを先に置く。**実害より先に観測可能性**
- **Visual Assets を stub にする**: 機能完成を待たず、top nav の整合性を Batch B で確保。Visual Register 外部リンクで誘導
- **共通 `ReadOnlyBanner` を component 化**: Phase Admin 2 で write が入るとき、1 component を変更すれば外せる
- **internal ID を `<code>` + muted text に**: boss-friendly 表示と developer-friendly 表示を両立、user-facing label が先、ID が補助

## 6. Human Review Questions

- Dashboard Home の overview cards（Campaigns / Pending review gates / Visual progress / Manual publishing）の選択と表現で boss 視点として過不足ないか？
- `NextActionSummary` の top 3 visuals 表示は妥当か、もっと出した方がよいか？
- `campaignPlan.requiredVisualAssets[?slug == "x-hook-main-v1"].state` を `done` に Studio で手動更新するか、それとも warn を残しておいて Batch C で sync-state runner を作るか？
- Visual Assets stub は Batch C の前に boss が実機で触ってよいか、それとも見せたくないか？
- Top nav に active route の highlight を入れるべきか？

## 7. Risks or Uncertainties

- **`NextActionSummary` の computation logic が seed と dataset の reconciliation を UI 層で隠す**: 「実はもう done」と「本当に pending」の区別が UI のロジックに集中する。将来 sync-state runner を別 layer に切り出す必要
- **Top nav に Visual Assets が見えると、stub を踏んだ boss が「あれ、ここで作業するんじゃないの？」となる**: README とページ内文言で Visual Register への誘導をしているが、UX 試行錯誤の余地
- **dashboard を localhost で動かすたびに `npm run dev` を立ち上げる手間**: Phase Admin 2 で Vercel / `app.hitorimedia.com` に出すまでは boss が習慣化できるかが課題
- **`campaignTotal` が 1 のうちは Dashboard Home の overview cards が単純すぎる**: 2 件目の campaign を作ると有用性が出る。現状の見え方は将来追加 campaign で改善
- **Next.js 16 + React 19.2 Canary の breaking change risk**: Batch A から続く risk。`dashboard/AGENTS.md` が agent に注意喚起する構造を維持

## 8. Recommended Next Step

### Immediate Human Actions

1. **`npm run dev` で 5 route を boss 視点で目視確認**:
   - `/` Dashboard Home
   - `/campaigns` list
   - `/campaigns/building-hitori-media-os` detail
   - `/human-review-gates` aggregator
   - `/visual-assets` stub
2. Dashboard Home の `Next Actions` が出している項目を見て、現状の運用判断と一致しているか確認
3. `campaignPlan.building-hitori-media-os.requiredVisualAssets[?slug == "x-hook-main-v1"].state` を Studio で `done` に手動更新するか判断

### Next Implementation Batches

1. **Batch C** — Visual Assets full listing（thumbnail + filter）+ Publish Packages（filesystem walk）+ Diagnostics（local-check JSON 取り込み）+ Activity Log（devlog / handoff markdown render）
2. （任意・並走）`tools/campaign-plan/sync-state.mjs`（仮）の概念 sketch — `visualAssetPlan.status` を campaignPlan に書き戻す runner、`--dry-run` から
3. （任意・並走）Top nav に active route highlight を入れる小改修
4. **Batch D** — Vercel deploy + `app.hitorimedia.com` 設定 + Basic Auth or middleware（public 化禁止）

### Mid-term

- 残り 5 visual（threads-support-diagram-v1 / note-inline 3 件 / substack-inline-reader-system-v1）の生成サイクル
- Auth scheme 決定（Phase Admin 2 着手前の design batch）
- 旧 `prompt` schema を `promptTemplate` 派生 instance として再定義する migration
- `hitorimedia.com` 公開サイトの content source 決定

### Deferred（永続）

- paid LLM / image generation API integration
- auto-posting / automated publish
- AI auto-review of drafts
- multi-user / collaboration
- billing / paid tier
- analytics fetch / charts

## 9. Exact Prompt to Give Codex Next

```text
Proceed with Phase Admin 1 — Batch C: Visual Assets list + Publish Packages + Diagnostics + Activity Log.

Hard Rules:
- Stay within dashboard/ subdirectory except docs/handoff/devlog updates.
- Do NOT modify schemas/, structure/, sanity.config.ts, tools/.
- Do NOT add Auth.
- Do NOT add Sanity write token usage.
- Do NOT add Sanity mutations.
- Do NOT add OpenAI / Anthropic API clients.
- Do NOT add paid API integrations.
- Do NOT auto-post.
- Do NOT modify assets/visuals or patches.
- Do NOT generate images.
- Do NOT break existing dashboard routes (/, /campaigns, /campaigns/[slug], /human-review-gates, /visual-assets).
- Do NOT break root Sanity Studio build.

Goal:
Replace the stub Visual Assets page with a full listing. Add Publish Packages page (reads
publish-packages/ from filesystem on dev only). Add Diagnostics page (reads npm run local:check
result). Add Activity Log page (renders docs/devlog/*.md and docs/handoff/*.md).

Use:
- docs/59-admin-phase-1-implementation-plan.md (§7 GROQ ideas)
- docs/handoff/0111-admin-phase-1-batch-b-dashboard-home-gates.md
- dashboard/src/lib/groq/campaign.ts (extend with visualAssetPlan / diagnostics queries)
- dashboard/src/lib/sanity.ts
- existing components

Steps:
1. Add `visualAssetPlanListQuery` (filterable by state) to GROQ.
2. Implement `dashboard/src/app/visual-assets/page.tsx` (replace stub) with the full listing.
3. Implement `dashboard/src/app/publish-packages/page.tsx` (server-side fs walk of publish-packages/).
4. Implement `dashboard/src/app/diagnostics/page.tsx` (run-time invocation of `npm run local:check`).
5. Implement `dashboard/src/app/activity-log/page.tsx` (markdown render of docs/devlog + docs/handoff).
6. Add nav links for the 2 new routes (Publish Packages / Diagnostics / Activity Log).
7. Verify all routes still HTTP 200.
8. Update docs/devlog/0101-* and docs/handoff/0112-*.
9. dashboard `npm run build` + root `npm run build` + `npm run local:check` all green.

End-of-run output:
- routes added
- components added
- GROQ queries added
- which routes render
- root build / local-check
- dashboard build
- known issues
- next recommended batch
```
