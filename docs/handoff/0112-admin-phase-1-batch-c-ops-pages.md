# Handoff: Admin Phase 1 — Batch C (Visual Assets list + Publish Packages + Diagnostics + Activity Log)

Date: 2026-05-15
Status: **8-routes-rendering-200 / read-only-maintained / dev-only-fs-pages-flagged-for-batch-d / thumbnails-deferred**

## 1. Task Goal

Batch B の 5 route を ops console として実用レベルへ拡張。Visual Assets の stub を **full listing** に置き換え、**Publish Packages** / **Diagnostics** / **Activity Log** の 3 page を追加。AppNav に 3 link + active route highlight。Sanity write / Auth / paid API は引き続きゼロ。

## 2. Constraints Followed

- `dashboard/` subdirectory 内で完結（docs / handoff のみ root の docs/ を更新）
- `schemas/` / `structure/` / `sanity.config.ts` / `tools/` を変更していない
- Auth を実装していない
- Sanity write token usage を仕込んでいない
- Sanity mutation 0 件（`.create` / `.patch` / `.delete` / `.commit` / `.transaction` / `.mutate` の grep 0 hits）
- OpenAI / Anthropic / paid image API クライアント追加 0 件
- auto-posting実装ゼロ
- `assets/visuals/...` / `patches/...` / `assets/inbox/` を変更していない
- publish-packages を本バッチで変更していない（fs walk は read-only）
- 画像生成 0 件
- 既存 5 route（`/`、`/campaigns`、`/campaigns/[slug]`、`/human-review-gates`、`/visual-assets`-as-stub→full）を破壊していない
- 既存 root `npm run build`（Sanity Studio）green を維持

## 3. Changed Files

### Added — `dashboard/src/`

| Path | 役割 |
| --- | --- |
| `lib/repoRoot.ts` | `repoRoot()` / `repoPath(...)` helper（fs walk と child_process で再利用） |
| `components/SummaryCard.tsx` | 共通 overview card |
| `components/EmptyState.tsx` | 共通 empty / error state（tone: info / error） |
| `components/FilePathBlock.tsx` | muted monospaced path 表示 + optional detail |
| `components/SectionHeader.tsx` | 共通 section header（title / description / right slot） |
| `app/publish-packages/page.tsx` | fs walk of `publish-packages/`、platform × campaign × files |
| `app/diagnostics/page.tsx` | server-side `npm run local:check` 実行 + JSON parse + raw fallback |
| `app/activity-log/page.tsx` | `docs/devlog/` と `docs/handoff/` の latest 20 を excerpt 表示 |

### Modified — `dashboard/src/`

- `app/visual-assets/page.tsx` — **stub → full listing**、5 bucket（pending / progress / planned / done / other）、thumbnail-deferred 警告ボックス
- `components/AppNav.tsx` — `'use client'` 化 + `usePathname` + active highlight + Publish Packages / Diagnostics / Activity Log 3 links 追加（合計 7 link）
- `lib/groq/campaign.ts` — `visualAssetPlanListQuery` 追加 + `VisualAssetPlanListItem` 型

### Modified — `dashboard/README.md`

- Batch A / B / C 全体カバー
- Routes 表（5 → 8 行）
- Project layout に新規 component / lib / route を追加
- Next batches で Batch C 完了マーク
- thumbnail / `/diagnostics` の deploy 注意点を Batch D に倒す

### Added — `docs/`

- `docs/devlog/0101-admin-phase-1-batch-c-ops-pages.md`
- `docs/handoff/0112-admin-phase-1-batch-c-ops-pages.md`

### Modified — `docs/`

- `docs/handoff/latest.md`（本 0112 にミラー）

### Confirmed unchanged

- `schemas/` 全件（active 16）
- `sanity.config.ts` / `structure/index.ts` / `tools/`
- root `package.json` / `package-lock.json`
- 既存 seed / outputs / publish-packages 内容 / private / ai-blog-db 関連
- `assets/visuals/` / `patches/` / `assets/inbox/`
- 既存 dataset record（dashboard は read-only 接続のみ）
- DNS / hosting / Auth: いずれも未変更

## 4. Summary of Changes

### A. Routes（curl で確認）

| Route | HTTP | Size | Key content |
| --- | --- | --- | --- |
| `/` | **200** | 38,194 B | Dashboard heading / NextActionSummary（unchanged） |
| `/campaigns` | **200** | 25,863 B | Campaigns list（unchanged） |
| `/campaigns/building-hitori-media-os` | **200** | 109,655 B | Detail（unchanged） |
| `/human-review-gates` | **200** | 32,923 B | 4 buckets（unchanged） |
| `/visual-assets` | **200** | 95,776 B | Full listing + 5 buckets / x-hook-main-v1 / campaign-hero / thumbnails-deferred 警告 |
| `/publish-packages` | **200** | 175,421 B | building-hitori-media-os / x-hook-main-v1.png / campaign-hero-v1.png / release-review / 各 package の file listing |
| `/diagnostics` | **200** | 45,425 B | Diagnostics heading / Checks green / Overall / Raw output / local:check 実行結果 |
| `/activity-log` | **200** | 154,746 B | Activity Log / Devlog / Handoff / Admin Phase 1 / 0100 / 0099 など |

### B. AppNav 拡張

- `'use client'` に切り替え（active route highlight に `usePathname` が必要）
- 7 link: Home / Campaigns / Human Review Gates / Visual Assets / Publish Packages / Diagnostics / Activity Log
- active route は `bg-slate-100` + `font-medium` で highlight、`aria-current="page"`
- `/campaigns/[slug]` のような nested route も `/campaigns` 配下として active にマッチ

### C. Visual Assets bucket logic

`schemas/visualAssetPlan.ts` の status enum を 5 bucket に集約:

- `done` = saved / reviewed / approved / packaged / published
- `pending` = generated-needs-save（candidate あり、まだ Visual Register 未承認）
- `progress` = prompt-ready
- `planned` = planned / brief-ready
- `other` = それ以外

各 bucket section は表（asset / platform / type / status / content idea / local path / updated）+ source content idea dereferenced。

### D. Publish Packages fs walk

- root path: `repoPath('publish-packages')` = `<repo>/publish-packages`
- 構造: `<platform>/<campaignSlug>/...`
- 各 package で再帰 walk して file count / image count / markdown count / total bytes / last modified を集計
- 失敗時は `EmptyState tone="error"` で表示、recover はせず

### E. Diagnostics implementation

- `execFile('npm', ['run', 'local:check'], {cwd: repoRoot(), timeout: 60_000, maxBuffer: 5MB})`
- shell expansion なし、user input ゼロ、command は hardcoded
- stdout から最初の `{` 以降を JSON.parse → `{ok, checks: [{name, ok, details}]}`
- parse 失敗時は raw output を `<pre>` に。run 失敗時は EmptyState error。
- 注意: localhost only 前提。deploy 時に disable / cached snapshot に切り替え必要（README + 本 doc § Risks）。

### F. Activity Log implementation

- `docs/devlog/` と `docs/handoff/` を listing
- filename descending sort（連番降順 = 新しい順）
- 各 entry から `# Title` / `Date:` / `Status:` を行ごとに抽出、本文 excerpt は最初 400 char
- markdown renderer なし（heavy dep を入れない方針）
- 失敗時は EmptyState

### G. Validation Results

- root `npm run build` (Sanity Studio): ✓ 7,387 ms green
- root `npm run local:check`: ✓ 17/17
- dashboard `npm run build`: ✓ 9 routes（前回 6 → 9）
- 8 routes curl HTTP 200 ✓
- direct Sanity write grep (dashboard/src): 0 hits
- paid LLM/image API SDK grep (dashboard): 0 hits
- write token grep (dashboard/src): 0 hits

## 5. Important Decisions

- **Visual Assets を 5 bucket に集約**: 10 値 enum をそのまま分けると section が薄い。boss-friendly な粒度に圧縮（schema は変えない）
- **Publish Packages を fs walk にする**: Sanity の真実ではなく `publish-packages/` の filesystem 真実なので、GROQ ではなく fs。dev-only
- **Diagnostics を execFile にする**: exec を避け shell expansion を排除。hardcoded command、timeout 60s、user input ゼロ
- **Activity Log で markdown renderer を入れない**: heavy dep を Batch C で追加しない方針。boss が title + status + 400 char excerpt で判断できることを優先
- **共通 component（SummaryCard / EmptyState / FilePathBlock / SectionHeader）を 4 件追加**: 4 page で同じ pattern が出るので、最小限の集約
- **`lib/repoRoot.ts` を切り出す**: `process.cwd()` から `..` を解決する helper を 1 箇所に
- **thumbnail を deferred**: static file handler が必要 → Batch D scope
- **AppNav を client component 化**: active route 表示のため `usePathname` を使う、これは client hook
- **`/diagnostics` deploy 時 disable 方針**: localhost only 想定、README と handoff § Note で明示

## 6. Human Review Questions

- `/visual-assets` の 5 bucket 粒度は boss 視点で過不足ないか？ `done` を細分化（saved vs published）すべきか？
- `/publish-packages` の各 package で詳細 file listing が `<details>` 折り畳みになっている。デフォルト展開の方がよいか？
- `/diagnostics` を localhost 以外で動かす想定はあるか？ Batch D で disable + cached snapshot を作る方向で良いか？
- `/activity-log` の excerpt 長さ（400 char）と件数（latest 20 per kind）は実用上どうか？ 多すぎ / 少なすぎ？
- AppNav の link 数（7 個）は多すぎないか？ Visual Assets と Visual Register（外部）の区別が分かりにくくないか？

## 7. Risks or Uncertainties

- **`/diagnostics` が request 毎に child process を fork する**: localhost / 自分用 dashboard では問題ないが、deploy したら denial-of-service の温床になる。Batch D で確実に disable
- **`/publish-packages` / `/activity-log` も deploy 環境で filesystem を期待**: Vercel deploy では publish-packages や docs/ が build に含まれていない限り空 listing になる。Batch D で「dev-only routes をどうするか」を design batch にする
- **AppNav が client component になった**: server component で active state を出すなら別アプローチ（pathname を server から渡す）が必要。今回は client 化で済ませた、SSR には影響なし
- **Visual Assets で thumbnail を出していない**: boss が path 文字列だけ見ても直感的でない。Batch D で `/api/asset-thumb` route handler を作るか、`next/image` で local serve するか design batch を挟む
- **`/diagnostics` の `npm run local:check` 実行時間**: 通常 1〜2 秒だが、何らかの slow check が入ると page response が遅くなる。timeout 60s で保護

## 8. Recommended Next Step

### Immediate Human Actions

1. `cd dashboard && npm run dev` で 8 route を boss 視点で目視確認
2. `/visual-assets` で bucket 分けが運用と合っているか確認
3. `/publish-packages` で各 package の file listing を `<details>` で開いて中身を見る
4. `/diagnostics` を開いて `npm run local:check` の結果が dashboard 上で見られることを確認
5. `/activity-log` で最近の Batch A〜C 関連 devlog / handoff が表示されることを確認

### Next Implementation Batch — **Batch D**（推奨）

[docs/58 §5](../58-admin-dashboard-phase-plan.md#5-phase-admin-4--publish-integration) と本 handoff を組み合わせ:

1. **deploy strategy design** — Vercel project、`app.hitorimedia.com` DNS、Basic Auth or middleware
2. **dev-only routes を整理** — `/diagnostics` / `/publish-packages` / `/activity-log` を deploy 時にどう扱うか（disable / build-time snapshot / hide from nav）
3. **thumbnail handler** — `assets/visuals/` を Next.js から serve する `/api/asset-thumb/[...path]` route handler（read-only、path validation 必須）
4. **環境変数の deploy 設定** — Vercel に `NEXT_PUBLIC_SANITY_*` + `SANITY_READ_TOKEN` を登録
5. （任意）**Auth** — Phase Admin 2 に着手前なら Basic Auth 程度。本格 Auth は Phase Admin 2

### Mid-term

- 残り 5 visual の生成サイクル
- 旧 `prompt` schema を `promptTemplate` 派生 instance として再定義
- `tools/campaign-plan/sync-state.mjs`（仮）— `visualAssetPlan.status` を campaignPlan に書き戻す runner
- Auth scheme 決定（Phase Admin 2 着手前の design batch）

### Deferred（永続）

- paid LLM / image API integration
- auto-posting / automated publish
- AI auto-review of drafts
- multi-user / collaboration
- billing / paid tier
- analytics fetch / charts

## 9. Exact Prompt to Give Codex Next

```text
Design Phase Admin 1 — Batch D: deploy strategy for app.hitorimedia.com.

Hard Rules:
- Design only this batch. Do NOT deploy yet.
- Do NOT modify schemas/, structure/, sanity.config.ts, tools/.
- Do NOT add Auth implementation in this design batch (decide approach only).
- Do NOT add Sanity write token usage.
- Do NOT add Sanity mutations.
- Do NOT add OpenAI / Anthropic API clients.
- Do NOT add paid API integrations.
- Do NOT auto-post.
- Do NOT modify assets/visuals or patches.
- Do NOT generate images.
- Do NOT break existing dashboard routes.

Goal:
Decide how the dashboard moves from "localhost only" to "preview deploy".

Use:
- docs/57-hitorimedia-domain-app-plan.md
- docs/58-admin-dashboard-phase-plan.md (Batch D section)
- docs/handoff/0112-admin-phase-1-batch-c-ops-pages.md
- dashboard/README.md
- dashboard/src/app/* (current routes)

Tasks:
1. Choose hosting provider (Vercel / Cloudflare Pages / Fly / other). Document trade-offs.
2. Decide how dev-only routes (/diagnostics, /publish-packages, /activity-log) behave in production:
   - disabled (404 / redirect)
   - build-time snapshot
   - hidden from nav but still functional from localhost
3. Decide static file handler for /assets/visuals/* (thumbnail support).
4. Decide Auth approach for the preview deploy (Basic Auth / Vercel Password Protection / middleware allowlist / actual Auth in Phase Admin 2).
5. Decide DNS / certificate plan (app.hitorimedia.com).
6. Decide environment variable strategy (NEXT_PUBLIC_* in Vercel, SANITY_READ_TOKEN as secret).
7. Document `npm run build` configuration changes needed (if any).
8. Output a docs/60-admin-phase-1-batch-d-deploy-plan.md and matching devlog/handoff.

Do NOT actually deploy in this batch — design only.
```
