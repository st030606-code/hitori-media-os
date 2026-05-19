# Handoff: Admin Phase 2 — Visual Register Integration + Visual Generation Quality (design only)

Date: 2026-05-18
Status: **phase-admin-2-design-complete / 0-code-change / 0-schema-change / 0-write / 0-deploy / phase-admin-1-still-in-production**

## 1. Task Goal

Phase Admin 1 が `app.hitorimedia.com` で完了した状態（[docs/handoff/0119](0119-admin-phase-1-batch-d3-post-deploy-verification.md)）から、Phase Admin 2 の **設計のみ** を書く。Auth 実装 / write 解禁 / scheme 活性化 / 画像生成 / deploy はすべて本 batch では行わない。

Phase Admin 2 を 4 sub-phase に分割し、Visual Register integration と Visual Generation Quality System の設計を [docs/62](../62-admin-phase-2-visual-generation-admin-design.md) に書き出す。docs/58（Phase Plan）を Phase 1 完了 + 2A-2D 追加で更新。

## 2. Constraints Followed

- design only、code / schema / asset / patch / Sanity / deploy 触らず
- Auth 実装ゼロ（Basic Auth のまま）
- 新規パッケージ追加ゼロ
- 画像生成ゼロ、Codex 起動ゼロ
- production env vars / Vercel UI 操作ゼロ
- 既存 Visual Register / dashboard の挙動 不変
- `.env*` を inspect / 出力していない
- secret 値を log / docs に書き残していない
- 提案 schema 7 件は **active 化せず、sketch も書かず**、提案のみ docs に記録

## 3. Changed Files

### Added — `docs/`

- `docs/62-admin-phase-2-visual-generation-admin-design.md`（13 sections、Phase 2 設計本体）
- `docs/devlog/0109-admin-phase-2-visual-generation-design.md`
- `docs/handoff/0120-admin-phase-2-visual-generation-design.md`（本ファイル）

### Modified — `docs/`

- `docs/58-admin-dashboard-phase-plan.md`（Phase Admin 1 を完了マーク、Phase Admin 2 を 2A/2B/2C/2D に細分化）
- `docs/handoff/latest.md`（本 0120 のミラー）

### Confirmed unchanged

- schemas / dashboard / tools / sanity.config / structure / proxy.ts
- assets / patches / seed / outputs / publish-packages / private
- Sanity dataset / Vercel project / DNS / production env vars
- POTA_Empire/.git / 兄弟 POTA project
- `dashboard/public/activity-snapshot.json`

## 4. Phase Admin 2 設計サマリ

### 4.1 4 sub-phase 構成

| Sub-phase | Goal | Write | 環境 | Auth |
| --- | --- | --- | --- | --- |
| **2A** read-only integration | dashboard で candidate を see / side-by-side 比較 / rubric inline | なし | both（filesystem は dev only） | Basic Auth |
| **2B** local write mode | dashboard から approve & register / patch JSON / publish dry-run | filesystem | **dev only** | Basic Auth |
| **2C** Sanity write mode | dashboard から visualAssetPlan mutate（confirmation 付き）+ audit log + undo | filesystem + Sanity | both | **real Auth に切替**（docs/63 候補） |
| **2D** product / SaaS-ready | storage / DB / generation provider / design profile / user permissions の plug-in 化 | tenant scoped | cloud | per-user auth |

### 4.2 Write boundary 規範

1. auto-posting は **永続 deferred**
2. 書き込みを段階的に解禁（1 phase で 1 種類だけ unlock）
3. すべての mutation に明示的 confirmation
4. 既存 final asset を silent overwrite しない
5. candidate history を残す
6. production には write endpoint を含めないまま Phase 2C Auth 設計が終わるまで

### 4.3 dashboard route 設計（提案、未実装）

- `/visual-assets/[assetId]` — asset detail（2A）
- `/visual-assets/[assetId]/candidates` — v00N side-by-side（2A read / 2B write）
- `/visual-assets/[assetId]/generate` — 生成 job request UI（2B）
- `/visual-review` / `/visual-review/inbox` / `/visual-review/inbox/[cid]` — inbox 横断 review（2A read / 2B write）
- `/settings/brand-profiles` / `/settings/visual-style-profiles` / `/settings/prompt-templates` / `/settings/design-profiles` — 各種 profile view（2A read / 2C write）

すべて新規 route。Phase 2A は read-only、Phase 2B+ で write を解禁。

### 4.4 提案 schema 7 件（本 batch では active 化せず）

| 提案 | 主目的 | 着手 phase |
| --- | --- | --- |
| `designProfile` | brand × style × layout preset | 2A sketch / 2D activate |
| `layoutPatternPreset` | layout 別 require/forbid modules | 2D |
| `visualGenerationRun` | 1 生成 job の record | 2B+ |
| `visualCandidate` | 1 candidate を database 化 | 2B read / 2C write |
| `visualReviewDecision` | approve/reject の audit log | 2C |
| `generationJob` | SaaS 生成 queue | 2D |
| `assetRegistrationLog` | 登録の audit | 2C |

### 4.5 Codex / image_gen integration

- **Option A (local CLI bridge)** を Phase 2B で推奨。
- production dashboard に Codex 認証情報を入れない、localhost only で生成が走る設計。
- bridge は filesystem queue（`generation-queue/pending/<jobId>.json` → `generation-queue/done/<jobId>.json`）。
- 5 分 hard timeout、kill + `status=failed` を bridge 側で実装（前回の 60 分張り付き経験から）。
- Option B (server action 直 spawn) は不採用、Option C (queue worker) は Phase 2D の SaaS 化以降。

### 4.6 product 化 path

抽象化必須 6 項目: storage / content DB / generation provider / publish package / design profile / user permissions。

Phase 2A から **命名とデータモデル** を将来抽象化に耐える形にする。実装はすべて Phase 2D 着手 trigger を満たすまで pending。SaaS 化判断は Phase 2C 完了 + 6 ヶ月運用後に再評価。

## 5. Important Decisions

- Phase 2 を 4 sub-phase に細分化、各 sub-phase が独立に完走できる
- 2A は **read-only integration**、production dashboard 挙動 不変
- 2B は **localhost only write**、production に write endpoint を含めない
- 2C は **Auth 切り替え必須**、別 design batch（docs/63 候補）を挟む
- 2D は **SaaS 化判断 6 ヶ月後** に再評価、急がない
- 提案 schema 7 件は **本 batch で sketch しない**、提案のみ
- Codex integration は **Option A (local CLI bridge)** を Phase 2B で採用、generation bridge 設計は別 batch（docs/65 候補）
- Auth 設計は本 doc から **分離**、docs/63 候補で別 batch

## 6. Human Review Questions

- Phase Admin 2A 実装を **次の implementation batch** にするか？ それとも Auth design (docs/63) を先にやるか？
- `designProfile` を Phase 2A sketch（schemas/proposed/）として書き始めるか？ それとも 2A 完走後に判断するか？
- product 化を **2C 完了 + 6 ヶ月運用後** に再評価する保留判断で良いか？ もっと早い判断 trigger が欲しいか？
- Visual Register（`tools/visual-register/`）を **Phase 2C 完了まで残す** で良いか？ それとも 2B 完了時点で deprecate 宣言するか？
- generation-bridge tool（`tools/generation-bridge/`）は新規 tool として独立させるか、既存 `tools/visual-register/` の中に置くか？

## 7. Risks or Uncertainties

| Risk | Mitigation |
| --- | --- |
| 2A 実装で既存 production dashboard 挙動が変わる | feature flag で gate、production filesystem 読みを既存と同じ `ENABLE_LOCAL_FS_ROUTES` で gate |
| 2B の generation bridge を作る前に Codex 認証情報を server に入れる誘惑 | docs/62 § 9 で Option B を明示的に不採用と書き、bridge を boss machine 上のみで動かす方針を docs に固定 |
| 2C の Sanity mutation で既存 record を壊す | confirmation gate + diff preview + type-to-confirm + undo（inverse-patch）を 2C 設計の必須要件に |
| Auth 切り替えで Basic Auth 時代の挙動を壊す | 2C 着手前に別 design batch（docs/63）で migration plan を書く、preview branch で先に試す |
| 提案 schema を急いで activate して破壊的変更 | 本 batch では sketch せず、各提案を **将来 batch** で個別に design |
| product 化を急いで PMF を出さずに作りこむ | 6 ヶ月運用評価を必須化、SaaS 化判断 trigger を docs/62 § 10 で明示 |

## 8. Recommended Next Step

### Immediate (this batch)

本 docs を commit + push:

```bash
cd /Users/sugawaratakuya/Documents/POTA_Empire/10_Development/sanity-ai-content-os

git status --short
git add docs/62-admin-phase-2-visual-generation-admin-design.md \
        docs/58-admin-dashboard-phase-plan.md \
        docs/devlog/0109-admin-phase-2-visual-generation-design.md \
        docs/handoff/0120-admin-phase-2-visual-generation-design.md \
        docs/handoff/latest.md

git diff --staged --stat
git commit -m "docs: design Phase Admin 2 visual generation admin"
git push
```

### Next Implementation Batch — 候補

Phase Admin 2A 実装に進む **前** に、以下のどちらかを次バッチに:

#### A. Auth Migration Design (docs/63、推奨先行)

- Basic Auth → real Auth への移行 plan
- 候補: NextAuth / Auth.js / Clerk / Sanity session / GitHub OAuth / magic link
- Phase 2C 着手前に必須、2A/2B でも production deploy する場合は事前に欲しい
- 別 design batch、本 doc とは分離

#### B. Phase Admin 2A Implementation Plan (docs/64)

- component-level wireframe
- route スキーマ確定
- GROQ クエリ起草
- filesystem reader（dev-only）の interface 設計
- 実装着手の trigger を明示

#### C. Production Visual Generation Batch 2 続行（独立）

- `note-inline-content-os-flow-v1` の v001/v002/v003 を 1 candidate ずつ生成
- 既存 threads-support-diagram-v1 candidate 3 つ（v001/v002/v003）を人間 Visual Register review に回す
- これは Phase 2 設計とは独立の運用 flow

### Deferred（永続）

- paid LLM / image API integration
- auto-posting
- AI auto-approval
- multi-user collaboration（Phase 2D で初めて議論）
- billing / paid tier
- public site analytics fetch

## 9. Exact Next Prompt to Give Codex / Claude Code

### Option A: Auth Migration Design Batch

```text
Plan Phase Admin 2.5: Auth Migration Design.

Hard Rules:
- Design only.
- Do NOT implement Auth.
- Do NOT add new packages.
- Do NOT deploy.
- Do NOT modify production env vars.
- Do NOT touch Vercel UI from code.
- Do NOT modify dashboard runtime behavior.
- Do NOT delete proxy.ts (Basic Auth) yet.

Context:
Phase Admin 1 production is on Basic Auth (dashboard/src/proxy.ts).
Phase Admin 2C will require real Auth before Sanity write is unlocked.

Use:
- docs/62-admin-phase-2-visual-generation-admin-design.md (Phase 2C section)
- dashboard/src/proxy.ts (current Basic Auth impl)

Tasks:
1. Create docs/63-admin-phase-2-auth-migration-design.md covering:
   - chosen Auth scheme (NextAuth / Auth.js / Clerk / Sanity session / magic link / GitHub OAuth)
   - migration plan from Basic Auth
   - production rollout strategy (preview branch first)
   - session / cookie / CSRF design
   - audit log integration
   - rollback strategy
2. Update docs/62 § 3.3 with the chosen scheme
3. Update docs/58 § 3.3 with the chosen scheme
4. Create docs/devlog/0110-* and docs/handoff/0121-*
```

### Option B: Phase 2A Implementation Plan Batch

```text
Plan Phase Admin 2A: Dashboard-integrated Visual Review (read-only) implementation plan.

Hard Rules:
- Design only this batch.
- Do NOT scaffold code.
- Do NOT add new packages.
- Do NOT deploy.
- Do NOT modify existing dashboard runtime behavior.
- Do NOT touch Sanity.
- Do NOT touch assets / patches / inbox / Visual Register.

Use:
- docs/62-admin-phase-2-visual-generation-admin-design.md (Phase 2A section)
- dashboard/src/app/visual-assets/page.tsx (existing read-only)
- tools/visual-register/server.mjs (API to migrate)

Tasks:
1. Create docs/64-admin-phase-2a-implementation-plan.md covering:
   - exact new routes (path, query, GROQ, filesystem)
   - component breakdown (CandidateGrid / CandidateCard / ReviewRubricInline / SideBySideCompare)
   - feature flag design (existing ENABLE_LOCAL_FS_ROUTES extends, or new flag)
   - dev-only API route specs (replacing Visual Register /api/inbox/* without modifying it)
   - test plan
2. Confirm production read-only invariant
3. Create docs/devlog/0110-* and docs/handoff/0121-*
```

## 10. Validation Results (本 batch、design-only)

| Check | Result |
| --- | --- |
| schema 変更 | 0 |
| code 変更 | 0（dashboard / tools / schemas / sanity.config / proxy.ts 全て不変） |
| assets 変更 | 0 |
| patches 変更 | 0 |
| Sanity mutation | 0 |
| 画像生成 | 0 |
| 新規パッケージ | 0 |
| Auth 実装 | 0（Basic Auth のまま） |
| 環境変数変更 | 0 |
| Vercel UI 操作 | 0 |
| deployment | 0 |
| 既存 production dashboard 挙動 | 不変 |
| 既存 Visual Register 挙動 | 不変 |
| `npm run local:check` | 後述（commit 前に走らせる） |
| root `npm run build`（Sanity Studio） | 後述 |
| `cd dashboard && npm run build` | 後述 |
| direct Sanity write grep | 0 hits |
| paid LLM / image API SDK | 0 hits |

→ validation 結果は本 handoff の **§ 11** で実行ログを記録。

## 11. Local validation runs

実行結果（2026-05-18 JST）:

| Check | Result |
| --- | --- |
| `npm run local:check` | **17 ok / 0 fail** |
| root `npm run build`（Sanity Studio） | **green**（Build Sanity Studio 7808ms） |
| `cd dashboard && npm run build` | **green**（TypeScript clean、8 page route + `/api/asset-thumb` + Proxy middleware すべて compile 通過） |
| `git diff --stat` (code/schema/assets/patches) | **0 件**（docs と handoff のみ変更） |
| direct Sanity write grep | **0 hits** |
| paid LLM / image API SDK grep | **0 hits** |
| 新規 package | **0 件**（package.json / package-lock.json 不変） |

→ 本 batch は docs のみの変更で完結、既存 production runtime / Sanity Studio build / dashboard build 影響ゼロ。

## 12. 連番について

- docs: 60 → 61 → **62**
- devlog: 0108 → **0109**
- handoff: 0119 → **0120**
- docs/58 を Phase 2A-2D に細分化（本 doc が canonical）

## 13. Is Phase Admin 2 design complete?

**Yes (this design batch)**:

- 13 sections の design doc が docs/62 に揃っている
- 4 sub-phase の境界が明確
- write boundary table が全 mutation を列挙
- dashboard route 設計が phase 別に区切られている
- candidate review UI が設計済み
- visual generation quality system（layout / module / failure / rubric / variation / anchor）が設計済み
- 提案 schema 7 件 + 各 phase での着手判断
- Codex integration の Option A / B / C 評価
- productization path（boss-only → SaaS）の抽象化必須 6 項目

**Phase Admin 2 設計は本 batch で完了**。実装は次の implementation batch で着手判断。
