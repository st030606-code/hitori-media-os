# Handoff: Admin Phase 2A-1 — Read-only Candidate Review Implementation

Date: 2026-05-18
Status: **implemented / read-only / 0-write / 0-schema-change / 0-sanity-write / 0-deploy / 0-new-package / phase-admin-1-still-in-production**

## 1. Task Goal

Phase Admin 2A の 1 batch 目: dashboard 内に **read-only の candidate review surface** を投入。`/visual-assets/[assetId]/candidates` で v001 / v002 / v003 を side-by-side で見比べる。Visual Register を起動せずに dashboard だけで candidate を確認できる状態。書きは Phase 2B。production では filesystem 依存を flag で gate し、安全に degrade。

## 2. Constraints Followed

- 書き endpoint ゼロ（GET-only、4 API route すべて GET）
- approve / register / patch JSON 生成 / 変換コピー: **未実装**（disabled DeferredActionButton で予告のみ）
- `assets/visuals/` / `patches/` / Sanity: **不変**
- 新規パッケージ追加: **0**（YAML parser は自作 ~165 行）
- 画像生成 / Codex 起動: **0**
- Vercel UI 操作 / deploy / env vars 変更: **0**
- `dashboard/src/proxy.ts` (Basic Auth) / `featureFlags.ts` 既存 logic: **不変**
- 既存 8 page route + `/api/asset-thumb` の挙動: **不変**（listing は表 column 1 列追加のみ）
- Visual Register `tools/visual-register/server.mjs` の import / 起動: **0 回**
- Auth 切り替え: **0**（Basic Auth のまま）
- `.env*` を inspect / 出力: **0**
- secret 値を log / docs に書き残し: **0**

## 3. Changed Files

### Added — `dashboard/src/lib/`

- `frontmatter.ts` — minimal YAML parser + frontmatter splitter (no dep, ~165 行)
- `inboxReader.ts` — filesystem reader, asset id derivation, PNG dimension peek, path validation

### Added — `dashboard/src/app/api/visual-review/`

- `inbox/route.ts` — GET, lists campaign/asset folders
- `assets/[assetId]/candidates/route.ts` — GET, per-asset bundle
- `candidate-image/route.ts` — GET, image bytes (8MB cap, inbox prefix only)
- `review-manifest/route.ts` — GET, campaign-level manifest

### Added — `dashboard/src/components/visual-review/`

- `VisualAssetHeader.tsx`
- `CandidateGrid.tsx`
- `CandidateCard.tsx`
- `CandidatePreview.tsx`
- `LocalModeBanner.tsx`
- `DeferredActionButton.tsx`
- `EmptyCandidateState.tsx`
- `CandidateStatusBadge.tsx`

### Added — `dashboard/src/app/visual-assets/[assetId]/`

- `page.tsx` — asset detail landing
- `candidates/page.tsx` — v00N side-by-side review

### Modified — `dashboard/src/`

- `app/visual-assets/page.tsx` — +1 column "Review" with `候補を見る` link (header & body)
- `lib/groq/campaign.ts` — +`visualAssetPlanByIdQuery`, +`VisualAssetPlanDetail` type

### Added — `docs/`

- `docs/devlog/0113-admin-phase-2a-1-candidate-review-implementation.md`
- `docs/handoff/0124-admin-phase-2a-1-candidate-review-implementation.md`（本ファイル）

### Modified — `docs/`

- `docs/handoff/latest.md` (mirror 0124)

### Confirmed unchanged

- schemas / sanity.config / structure / proxy.ts / featureFlags logic
- assets / patches / seed / outputs / publish-packages / private
- Sanity dataset / Vercel project / DNS / production env vars
- POTA_Empire/.git / 兄弟 POTA project
- `dashboard/public/activity-snapshot.json`
- `dashboard/package.json` / `package-lock.json`（**dependency 不変**）
- inbox candidate PNG bytes（1,117,386 / 1,170,769 / 1,155,943 — 前 batch と一致）

## 4. Routes implemented

| Route | Method | Purpose | Phase 起源 |
| --- | --- | --- | --- |
| `/visual-assets/[assetId]` | GET (page) | asset detail landing | 2A-1 |
| `/visual-assets/[assetId]/candidates` | GET (page) | v00N side-by-side review | 2A-1 |
| `/api/visual-review/inbox` | GET | list campaign/asset folders | 2A-1 |
| `/api/visual-review/assets/[assetId]/candidates` | GET | per-asset bundle | 2A-1 |
| `/api/visual-review/candidate-image` | GET | image bytes (8MB cap) | 2A-1 |
| `/api/visual-review/review-manifest` | GET | campaign-level manifest | 2A-1 |

dashboard build output（compile 通過）:

```
Route (app)
┌ ƒ /
├ ○ /_not-found
├ ƒ /activity-log
├ ƒ /api/asset-thumb
├ ƒ /api/visual-review/assets/[assetId]/candidates    ← new
├ ƒ /api/visual-review/candidate-image                 ← new
├ ƒ /api/visual-review/inbox                           ← new
├ ƒ /api/visual-review/review-manifest                 ← new
├ ƒ /campaigns
├ ƒ /campaigns/[slug]
├ ƒ /diagnostics
├ ƒ /human-review-gates
├ ƒ /publish-packages
├ ƒ /visual-assets
├ ƒ /visual-assets/[assetId]                           ← new
└ ƒ /visual-assets/[assetId]/candidates                ← new
ƒ Proxy (Middleware)                                   ← unchanged
```

## 5. APIs implemented

| Endpoint | Method | Auth/Flag | Returns |
| --- | --- | --- | --- |
| `/api/visual-review/inbox` | GET | `ENABLE_LOCAL_FS_ROUTES=true` only | `{ok, inboxPrefix, count, items: [{campaignSlug, assetSlug, folderRelativePath, candidateCount, hasPrompt, hasReview, hasReviewManifest}]}` |
| `/api/visual-review/assets/[assetId]/candidates` | GET | `ENABLE_LOCAL_FS_ROUTES=true` only | `{ok, assetId, campaignSlug, assetSlug, folderRelativePath, promptMeta, reviewMeta, candidates: [...], hasPrompt, hasReview, warnings}` |
| `/api/visual-review/candidate-image?path=...` | GET | `ENABLE_LOCAL_FS_ROUTES=true` only | image bytes, content-type per ext, 8MB cap |
| `/api/visual-review/review-manifest?slug=...` | GET | `ENABLE_LOCAL_FS_ROUTES=true` only | `{ok, exists, campaignSlug, manifest}` |

すべて Basic Auth proxy を通過後にのみ到達可能、flag off の production では 404、書き method なし。

## 6. Components implemented

| # | Component | Phase | Reusable |
| --- | --- | --- | --- |
| 1 | VisualAssetHeader | 2A-1 | ✓ (detail / candidates 共通) |
| 2 | CandidateGrid | 2A-1 | ✓ |
| 3 | CandidateCard | 2A-1 | ✓ |
| 4 | CandidatePreview | 2A-1 | ✓ |
| 5 | LocalModeBanner | 2A-1 | ✓（全 candidate route 共通） |
| 6 | DeferredActionButton | 2A-1 | ✓ |
| 7 | EmptyCandidateState | 2A-1 | ✓ |
| 8 | CandidateStatusBadge | 2A-1 | ✓ |

deferred (Phase 2A-2):

- CandidateDetailPanel
- ReviewRubricPanel
- SuggestedActionPanel
- VisualModuleChecklist
- PromptSummaryBlock
- StyleAnchorList

## 7. Local enabled behavior（ENABLE_LOCAL_FS_ROUTES=true）

| Verified URL | Result |
| --- | --- |
| `GET /visual-assets/<threads-id>/candidates` | **200** (v001/v002/v003 grid + prompt context + rubric default sections render) |
| `GET /api/visual-review/assets/<threads-id>/candidates` | **200, candidates=3** with `v001 diagram-first 1080x1350 1117386b`, `v002 typography-hybrid 1080x1350 1170769b`, `v003 metaphor-mix 1080x1350 1155943b` |
| `GET /api/visual-review/candidate-image?path=...v001.png` | **200, image/png, 1,117,386 bytes** |
| `GET /api/visual-review/inbox` | **200, count=4** (note-hero-v1, note-inline-content-os-flow-v1, threads-support-diagram-v1, x-hook-main-v1) |
| `GET /api/visual-review/review-manifest?slug=building-hitori-media-os` | **200** |
| `GET /visual-assets/<note-inline-id>/candidates` | **200**, EmptyCandidateState `no-candidates` rendered, prompt/review meta sections still rendered |
| `GET /api/visual-review/assets/<note-inline-id>/candidates` | **200, candidates=0, hasPrompt=true, hasReview=true** |
| `GET /visual-assets` (既存 listing) | **200, 挙動不変** + 新 Review 列 |

## 8. Production-like behavior（ENABLE_LOCAL_FS_ROUTES=false）

| Verified URL | Result |
| --- | --- |
| `GET /visual-assets/<asset>/candidates` | **200**, page renders, LocalModeBanner shows "Local candidate review unavailable in production mode", EmptyCandidateState `local-only` rendered, prompt/review sections suppressed |
| `GET /api/visual-review/assets/.../candidates` | **404** |
| `GET /api/visual-review/candidate-image?path=...` | **404** |
| `GET /api/visual-review/inbox` | **404** |
| `GET /api/visual-review/review-manifest?slug=...` | **404** |
| `GET /visual-assets` (既存 listing) | **200**, 挙動不変 |
| `GET /visual-assets/<asset>` detail page | **200**, header + reference section render, candidate page link still works (→ degrade banner page) |

## 9. Security check results

| Attack vector | Test | Result |
| --- | --- | --- |
| relative traversal | `?path=../package.json` | **403** (rejected by prefix check) |
| absolute path | `?path=/etc/passwd` | **400** (rejected before prefix check) |
| wrong prefix (final asset) | `?path=assets/visuals/.../campaign-hero-v1.png` | **403** (rejected by prefix check) |
| encoded traversal | `?path=assets/inbox/generated/../../package.json` | **400** (rejected by normalize check) |
| wrong extension | `?path=...prompt.md` | **415** (rejected by ext + filename pattern) |
| wrong filename pattern | `?path=...random.png` | **415** (rejected by `v00N.png` pattern) |
| invalid assetId (no prefix) | `notValid` | **400** |
| invalid assetId (no dot) | `visualAssetPlan.foo` | **400** |
| non-existent valid-form slug | `visualAssetPlan.does-not-exist.nor-this` | **200**, empty bundle, hasPrompt/Review=false (graceful) |

→ **9 / 9 pass**. Security model identical to `/api/asset-thumb` (Phase 1) with inbox-specific filename pattern enforcement.

## 10. Validation Results

| Check | Result |
| --- | --- |
| `npm run local:check` (root) | **17 ok / 0 fail** |
| `npm run build` (root, Sanity Studio) | **green** (Build Sanity Studio 8108ms) |
| `cd dashboard && npm run build` | **green** (TypeScript clean、12 page + 5 API route + Proxy middleware compile) |
| Local mode curl tests (8 endpoints) | **8/8 pass** |
| Security checks (9 attack vectors) | **9/9 pass** |
| Production-like mode curl tests (6 endpoints) | **6/6 pass** |
| frontmatter YAML parse on 4 inbox files | **0 warnings** |
| candidate PNG byte size unchanged | **3/3 confirmed (1117386 / 1170769 / 1155943)** |
| `assets/visuals/` unchanged | **shared / x のみ** |
| `patches/visual-assets/` unchanged | **note-hero-v1.json + x-hook-main-v1.json のみ** |
| direct Sanity write grep | **0 hits** |
| paid LLM / image API SDK grep | **0 hits** |
| `dashboard/package.json` modified | **no** (no new dependency) |

## 11. Known limitations

- `/visual-review/*` pages 系（`/visual-review`, `/visual-review/inbox`, `/visual-review/inbox/[candidateId]`）は **Phase 2A-2** で投入予定。本 batch では `/api/visual-review/inbox` API のみ先行投入（curl 動作確認 + 将来 page 用）
- AppNav に "Visual Review" link を **意図的に追加していない**（対応 page を Phase 2A-2 で同時に出すため）
- candidate detail の **6 component**（CandidateDetailPanel / ReviewRubricPanel / SuggestedActionPanel / VisualModuleChecklist / PromptSummaryBlock / StyleAnchorList）は Phase 2A-2 で実装
- `/content-packages/*` route は Phase 2A-3
- Codex self-review **score 入力 UI** は Phase 2B（書き action 解禁後）
- approve & register / patch JSON 生成は Phase 2B、Sanity mutation は Phase 2C
- 既存 inbox 中 `note-hero-v1` と `x-hook-main-v1` には frontmatter が **無い**（採用済みのため、dashboard では `hasPrompt: false` で degrade 表示）
- Turbopack build warning "Encountered unexpected file in NFT list" は既存 (Phase 1 batch D2 由来、activity-log の filesystem read)、本 batch では新規発生なし
- production deploy は **本 batch では未実施**。`app.hitorimedia.com` 側の挙動は変わっていない（次 deploy までは Phase 1 と同じ）

## 12. Important Decisions

- YAML parser は自前実装（`yaml` package を `dashboard/package.json` に追加せず、依存ゼロ維持）
- dashboard と Visual Register を import 上で切り離す（filesystem は共有、code は独立）
- 書き endpoint 名前空間 `/api/visual-review/*` を Phase 2A-1 で予約（Phase 2B の POST 追加準備）
- production で page は 200 + degrade banner、API は 404 (gate)
- AppNav 更新は対応 page と同 batch に揃える（Phase 2A-2）
- Human review score 入力は disabled の DeferredActionButton で予告（Phase 2B 解禁）

## 13. Recommended Next Step

### Immediate (this batch)

本 batch を commit + push（前のバッチの uncommitted docs と一緒にまとめても良い）:

```bash
cd /Users/sugawaratakuya/Documents/POTA_Empire/10_Development/sanity-ai-content-os

git status --short
git add dashboard/src/lib/frontmatter.ts \
        dashboard/src/lib/inboxReader.ts \
        dashboard/src/app/api/visual-review \
        dashboard/src/app/visual-assets/[assetId] \
        dashboard/src/components/visual-review \
        dashboard/src/app/visual-assets/page.tsx \
        dashboard/src/lib/groq/campaign.ts \
        docs/devlog/0113-admin-phase-2a-1-candidate-review-implementation.md \
        docs/handoff/0124-admin-phase-2a-1-candidate-review-implementation.md \
        docs/handoff/latest.md

git diff --staged --stat
git commit -m "feat(dashboard): read-only candidate review (Phase 2A-1)"
git push
```

deploy するかは別判断。本 batch は localhost で開発しただけ、production deploy は人間操作で[docs/61](../61-admin-phase-1-batch-d2-vercel-setup.md) に従って実施。

### Next Implementation Batch — 候補

| 候補 | 内容 |
| --- | --- |
| **A. Phase 2A-2 implementation** ✓ 推奨 | candidate detail panel + review rubric panel + prompt summary + suggested action panel + 6 component + `/api/visual-review/prompt` / `/api/visual-review/review-notes` API + `/visual-review/*` pages の一部 |
| **B. Production Visual Generation — note-inline 続行** | `note-inline-content-os-flow-v1` の v001/v002/v003 を 1 candidate ずつ生成（既存 frontmatter に従う） |
| **C. ContentPackage / VisualPackage schemas/proposed/ sketch** | 提案 schema を sketch 化（active 化なし） |
| **D. Phase 2B implementation plan (docs/66)** | 書き endpoint 設計 + filesystem write の確認 gate + Visual Register との並走戦略 |
| **E. Auth Migration Design** | Basic Auth → real Auth、Phase 2C 着手前に必須 |

推奨優先: **A**（Phase 2A の continuation）または **B**（運用継続で frontmatter contract の実 candidate での 2 件目検証）。

### Deferred（永続）

- paid LLM / image API integration
- auto-posting
- AI auto-approval
- multi-user collaboration（Phase 2D で初めて議論）
- billing / paid tier

## 14. Exact Next Prompt

### Option A: Phase 2A-2 implementation

```text
Implement Phase Admin 2A-2: candidate detail + review rubric + prompt panel.

Hard Rules:
- Implement ONLY routes + API + components for Phase 2A-2.
- Do NOT add write endpoints.
- Do NOT add Sanity mutation.
- Do NOT modify the 6 components from Phase 2A-1.
- Do NOT generate images.
- Do NOT deploy.
- Do NOT modify Visual Register.

Use:
- docs/64-admin-phase-2a-visual-review-wireframe.md (Phase 2A-2 section)
- docs/65-inbox-candidate-frontmatter-contract.md
- existing Phase 2A-1 code (do not change frontmatter.ts / inboxReader.ts / 8 components / 2 pages)

Tasks:
1. Add GET /api/visual-review/prompt (with path validation)
2. Add GET /api/visual-review/review-notes
3. Add components: CandidateDetailPanel, ReviewRubricPanel, SuggestedActionPanel,
   VisualModuleChecklist, PromptSummaryBlock, StyleAnchorList
4. Add pages: /visual-review, /visual-review/inbox, /visual-review/inbox/[candidateId]
5. Add AppNav "Visual Review" link (gated by ENABLE_LOCAL_FS_ROUTES)
6. Extend /visual-assets/[assetId]/candidates to use the 6 new panels
7. Run local + prod-like + security curl tests
8. Create docs/devlog/0114-* and docs/handoff/0125-*
```

### Option B: continue Production Visual Generation for note-inline

```text
Resume Production Visual Generation Batch for note-inline-content-os-flow-v1.

Hard Rules:
- 1 candidate per run, 5 min hard timeout.
- Do NOT modify the frontmatter applied in docs/devlog/0112.
- Do NOT modify final asset paths / patches / Sanity.
- Update review.md candidateScores after each candidate generates (frontmatter-aware).

Use:
- existing assets/inbox/generated/building-hitori-media-os/note-inline-content-os-flow-v1/prompt.md
- tasks/visuals/building-hitori-media-os/note-inline-content-os-flow-v1.md
- docs/65-inbox-candidate-frontmatter-contract.md

Tasks:
1. Generate v001 (diagram-first), report dimensions / file size / accent color / git diff
2. Wait for human go-ahead before v002/v003
```

## 15. Is Phase 2A-1 implementation complete?

**Yes**:

- 2 new page route 実装済、both 200
- 4 new API route 実装済、all GET-only, all flag-gated
- 8 new component 実装済
- 2 new lib helper (frontmatter / inboxReader) 実装済、type-safe + path-safe
- 1 GROQ query + 1 type 追加
- 既存 `/visual-assets` listing に 1 列追加（本体不変）
- Local mode: 8/8 curl test pass
- Security: 9/9 attack vector blocked
- Production-like mode: 6/6 curl test pass（degrade banner 動作）
- root build + dashboard build + local:check すべて green
- 新規 dependency 0、Visual Register import 0、Sanity mutation 0、画像生成 0、deploy 0

**Phase 2A-1 implementation 完了**。Phase 2A-2（detail panel / rubric panel / `/visual-review/*` pages）が次の implementation 候補。

## 16. 連番について

- docs: 65 → **66**（Auth 設計は docs/67 候補へ繰り下げ、本 batch では docs/64 / 65 を参照のみで増やしていない）
- devlog: 0112 → **0113**
- handoff: 0123 → **0124**

待って、本 batch は docs を 1 件も新規追加していない。devlog 0113 と handoff 0124 のみ追加、`docs/` トップは増えない。連番表記の docs 列は変動なし。
