# Handoff: Admin Phase 2A — Visual Review Wireframe Design (design only)

Date: 2026-05-18
Status: **phase-2a-wireframe-complete / 0-code-change / 0-schema-change / 0-write / 0-deploy / phase-admin-1-still-in-production / phase-admin-2-design-intact / cross-platform-core-intact**

## 1. Task Goal

Phase Admin 2A の **dashboard-integrated visual candidate review (read-only)** を、wireframe / route / API / component / coexistence の level で詳細設計。[docs/62 § 3.1](../62-admin-phase-2-visual-generation-admin-design.md#31-phase-2a--dashboard-integrated-visual-review-read-only)（Phase 2A 概念）と [docs/63](../63-cross-platform-content-visual-generation-core.md)（Content / Visual Package Core）を実装可能な粒度に落とし込む。

実装は **4 batch（2A-1 / 2A-2 / 2A-3 / 2B-1）に分割**。本 batch では実装ゼロ、wireframe / 仕様のみ。

## 2. Constraints Followed

- design only、code / schema / asset / patch / Sanity / deploy 触らず
- route 実装ゼロ、API 実装ゼロ、React component 追加ゼロ
- 画像生成 / Codex 起動 ゼロ
- 新規パッケージ追加 ゼロ
- production env vars / Vercel UI 操作 ゼロ
- 既存 dashboard runtime / 8 page route / `/api/asset-thumb` / proxy.ts 不変
- 既存 Visual Register / `tools/*` 挙動 不変
- 既存 5 schema 不変、提案 schema は active 化せず sketch も書かない
- Auth 実装 / 変更 ゼロ（Basic Auth のまま）
- `.env*` を inspect / 出力していない
- secret 値を log / docs に書き残していない

## 3. Changed Files

### Added — `docs/`

- `docs/64-admin-phase-2a-visual-review-wireframe.md`（16 sections、wireframe / route / API / component / coexistence）
- `docs/devlog/0111-admin-phase-2a-visual-review-wireframe.md`
- `docs/handoff/0122-admin-phase-2a-visual-review-wireframe.md`（本ファイル）

### Modified — `docs/`

- `docs/handoff/latest.md`（本 0122 のミラー）

### Confirmed unchanged

- schemas / dashboard / tools / sanity.config / structure / proxy.ts / featureFlags.ts
- assets / patches / inbox / seed / outputs / publish-packages / private
- Sanity dataset / Vercel project / DNS / production env vars
- POTA_Empire/.git / 兄弟 POTA project
- `dashboard/public/activity-snapshot.json`

## 4. Core flows defined

| Flow | entry → action | deferred write |
| --- | --- | --- |
| **A** | Campaign → Required Visual Assets → Asset Detail → Candidate Review | approve は Visual Register |
| **B** | Content Package → Visual Package → Candidate Review | 同上 |
| **C** | Inbox Candidate List → Candidate Detail → Review Rubric | 同上 |
| **D** | dashboard で preferred → 人間が Visual Register で approve | Visual Register が書く |
| **E** | needs-regeneration → 次の Codex run 準備（Phase 2A では deferred、Phase 2B で発火） | Codex CLI bridge は Phase 2B |

## 5. Route map (11 routes)

| Route | Phase | Read/Write | Production behavior |
| --- | --- | --- | --- |
| `/visual-assets` | 1 既存 | read | ✓ available |
| `/visual-assets/[assetId]` | 2A-1 | read | metadata + saved final |
| `/visual-assets/[assetId]/candidates` | 2A-1 | read | **degrade banner**（filesystem 不在） |
| `/visual-review` | 2A-2 | read | summary だけ |
| `/visual-review/inbox` | 2A-2 | read | **degrade banner** |
| `/visual-review/inbox/[candidateId]` | 2A-2 | read | **degrade banner** |
| `/content-packages` | 2A-3 | read | ✓ |
| `/content-packages/[slug]` | 2A-3 | read | ✓ |
| `/content-packages/[slug]/visuals` | 2A-3 | read | metadata + saved final |
| `/visual-generation` | 2B+ | read | limited |
| `/visual-generation/runs/[id]` | 2B+ | read | limited |

## 6. Primary screen wireframe — `/visual-assets/[assetId]/candidates`

5 section:

1. **VisualAssetHeader**（asset metadata + expected / current path + reuse policy）
2. **Candidate Comparison Grid**（v001 / v002 / v003 の card、image + variant + dims + size + generatedAt + prompt version + self-review）
3. **Candidate Detail Panel**（larger preview + visual intent + layout pattern + required modules + prompt summary + style anchors）
4. **Review Rubric Panel**（7 axes × 1-5 = 35 点、Codex self-review + Human override 2 列）
5. **Suggested Action Panel**（recommended candidate + why + 5 action: "Open in Visual Register" / "Copy review notes" / "Mark preferred (local UI)" / **"Regenerate prompt preview (Phase 2B disabled)"** / **"Approve & register (Phase 2B disabled)"**）

詳細 ASCII wireframe は [docs/64 §4](../64-admin-phase-2a-visual-review-wireframe.md#4-primary-screen-wireframe--visual-assetsassetidcandidates) を参照。

## 7. Data sources plan

| Source | Phase 2A | localhost | production |
| --- | --- | --- | --- |
| Sanity（visualAssetPlan / campaignPlan / contentIdea / brandProfile / visualStyleProfile / promptTemplate） | ✓ | ✓ | ✓ |
| filesystem inbox（candidate PNG + review-manifest + prompt.md + review.md） | ✓（dev-only） | ✓ | ✗ → degrade banner |
| 既存 `/api/asset-thumb`（saved final） | ✓ | ✓ | flag 次第 |
| future schema（contentPackage / visualPackage / visualCandidate / visualGenerationRun / designProfile / visualReviewDecision / assetRegistrationLog） | sketch なし | future | future |

dashboard 側に `tools/visual-register/server.mjs` を **import しない**。filesystem reader は `dashboard/src/lib/inboxReader.ts` を Phase 2A-1 で新規実装。

## 8. Dev-only API plan (6 GET endpoints)

| Endpoint | Phase |
| --- | --- |
| `GET /api/visual-review/inbox` | 2A-1 |
| `GET /api/visual-review/assets/[assetId]/candidates` | 2A-1 |
| `GET /api/visual-review/candidate-image?path=...` | 2A-1 |
| `GET /api/visual-review/review-manifest?slug=...` | 2A-1 |
| `GET /api/visual-review/prompt?path=...` | 2A-2 |
| `GET /api/visual-review/review-notes?path=...` | 2A-2 |

すべて GET のみ、`ENABLE_LOCAL_FS_ROUTES` で gate、path validation は既存 `/api/asset-thumb` パターンを継承、サイズ上限 8 MB。

## 9. Production behavior plan

- candidate preview / inbox listing / rubric input は **localhost only**
- production では `LocalModeBanner` で "Local candidate review unavailable in production mode" を全 candidate route の top に固定
- production で見せるのは: metadata + saved final + brief reference + campaign context
- build-time snapshot による production candidate preview は **Phase 2B で再評価**、本 batch では結論を出さない
- Sanity asset upload による preview は Phase 2C 範囲（write 解禁が必要）

## 10. Component breakdown (14 components)

| # | Component | Phase 投入 |
| --- | --- | --- |
| 1 | VisualAssetHeader | 2A-1 |
| 2 | CandidateGrid | 2A-1 |
| 3 | CandidateCard | 2A-1 |
| 4 | CandidatePreview | 2A-1 |
| 5 | CandidateDetailPanel | 2A-2 |
| 6 | ReviewRubricPanel | 2A-2 |
| 7 | SuggestedActionPanel | 2A-2 |
| 8 | VisualModuleChecklist | 2A-2 |
| 9 | PromptSummaryBlock | 2A-2 |
| 10 | StyleAnchorList | 2A-2 |
| 11 | LocalModeBanner | 2A-1 |
| 12 | DeferredActionButton | 2A-1 |
| 13 | EmptyCandidateState | 2A-1 |
| 14 | CandidateStatusBadge | 2A-1 |

詳細 props / data source は [docs/64 §8](../64-admin-phase-2a-visual-review-wireframe.md#8-component-breakdown).

## 11. Candidate scoring display

35 点 rubric（7 axes × 1-5）、threshold:

- **24+** → candidate（採用候補、緑バッジ）
- **18-23** → needs review（黄バッジ）
- **<18** → regenerate recommended（赤バッジ）

Codex self-review と Human override を **並列表示**、Phase 2A では Human override は入力 disabled、Phase 2B で input 解禁。

disagreement banner: codex - human の差が 5 点以上で warning、blocking はしない。

## 12. Visual Register coexistence + deprecation

| Phase | dashboard | Visual Register |
| --- | --- | --- |
| 1 | listing 読み | 唯一の review surface |
| **2A** | candidate review 読み | approve & register 書き |
| 2B | dashboard が approve 書き | fallback / 並走 |
| 2C | Sanity 反映含む完全な write surface | deprecate 判断 |

deprecation 条件（4 件すべて）:

- Phase 2C 完了
- boss が 1 ヶ月以上 Visual Register を起動していない
- approve / patch / Sanity 反映 / publish dry-run が dashboard で代替済
- 失敗時の fallback（Studio 手動 / filesystem 直接編集）が用意済

本 batch では **削除しない、宣言のみ**。

## 13. Recommended first implementation batch

### Phase 2A-1（推奨）

route + image preview + basic API + 主要 component:

- route: `/visual-assets/[assetId]`, `/visual-assets/[assetId]/candidates`
- API: `GET /api/visual-review/inbox`, `/api/visual-review/assets/[assetId]/candidates`, `/api/visual-review/candidate-image`, `/api/visual-review/review-manifest`
- component: VisualAssetHeader, CandidateGrid, CandidateCard, CandidatePreview, LocalModeBanner, EmptyCandidateState, CandidateStatusBadge, DeferredActionButton
- prerequisite: **prompt.md / review.md frontmatter 仕様確定 mini-batch**（既存 inbox 2 件を新仕様に update、別 PR）

完了基準: localhost で `/visual-assets/<id>/candidates` で v00N grid + preview が動く。production で degrade banner が出る。

## 14. Validation Results

実行結果（2026-05-18 JST、本 handoff §10 に append）:

| Check | Result |
| --- | --- |
| `npm run local:check` | _to be recorded after this handoff is written_ |
| root `npm run build`（Sanity Studio） | _to be recorded_ |
| `cd dashboard && npm run build` | _to be recorded_ |
| `git diff --stat`（schemas / dashboard / tools / proxy.ts） | **0 件**（docs と handoff のみ変更） |
| direct Sanity write grep | **0 hits**（docs 内 rule 引用のみ） |
| paid LLM / image API SDK grep | **0 hits** |
| 新規 package | **0 件** |

→ validation 結果は本 handoff §17 で実行ログを記録（commit 前に実行）。

## 15. Important Decisions

- Phase 2A 中の **書き action はゼロ**（disabled + Phase 2B ラベル）
- dashboard と Visual Register は **兄弟プロセス**、互いに依存しない
- filesystem reader は **再実装**、Visual Register の code は import しない
- production では candidate review を **localhost only に固定**（degrade banner）
- 35 点 rubric の threshold を **24 / 18** で固定（運用調整は 1 週間後）
- 4 batch 分割（2A-1 / 2A-2 / 2A-3 / 2B-1）、各 1 PR 粒度
- `/api/visual-review/*` 名前空間を Phase 2A で予約（Phase 2B で POST 追加可能）
- ContentPackage 概念は **擬似化で先送り**（active 化は Phase 2C 着手時に再判断）
- prompt.md / review.md frontmatter 仕様は **提案のみ**、確定は 2A-1 着手 mini-batch

## 16. Human Review Questions

- Phase 2A-1 を **次の implementation batch** にして良いか？ 並走で先に **frontmatter mini-batch**（既存 inbox 2 件を update）を入れるべきか？
- production で candidate preview を **build-time snapshot** に焼く案を Phase 2B で評価するか、永続 deferred にするか？
- 35 点 rubric の threshold（24 / 18）は **1 週間運用後に調整** で良いか？ 別の運用 trigger があるか？
- `/api/visual-review/*` 名前空間で Phase 2B の write endpoint を追加して良いか、別 prefix（`/api/visual-write/*` 等）が良いか？
- Content Package 概念を擬似化（campaignPlan 流用）で Phase 2A-3 を組むか、`contentPackage` schema sketch を Phase 2A-3 着手前に挟むか？
- Visual Register の deprecation 条件（4 件）は妥当か？ より厳しい / 緩い条件にしたいか？

## 17. Local validation runs

実行結果（2026-05-18 JST）:

| Check | Result |
| --- | --- |
| `npm run local:check` | **17 ok / 0 fail** |
| root `npm run build`（Sanity Studio） | **green**（Build Sanity Studio 7612ms） |
| `cd dashboard && npm run build` | **green**（TypeScript clean、既存 8 page route + `/api/asset-thumb` + Proxy middleware すべて compile 通過、Phase 2A 候補 route は **未投入 → 不在を確認**） |
| `git diff --stat`（schemas / dashboard / tools / proxy.ts） | **0 件**（docs と handoff のみ変更） |
| direct Sanity write grep | **0 hits** |
| paid LLM / image API SDK grep | **0 hits** |
| 新規 package | **0 件**（package.json / package-lock.json 不変） |

→ 本 batch は docs のみ、既存 production runtime / Sanity Studio build / dashboard build 影響ゼロ。dashboard build 出力で route 一覧が Phase 1 の 8 page + asset-thumb のままであることが、wireframe 設計の "実装しない" 約束の確認になっている。

## 18. Recommended Next Step

### Immediate (this batch)

本 docs を commit + push:

```bash
cd /Users/sugawaratakuya/Documents/POTA_Empire/10_Development/sanity-ai-content-os

git status --short
git add docs/64-admin-phase-2a-visual-review-wireframe.md \
        docs/devlog/0111-admin-phase-2a-visual-review-wireframe.md \
        docs/handoff/0122-admin-phase-2a-visual-review-wireframe.md \
        docs/handoff/latest.md

git diff --staged --stat
git commit -m "docs: wireframe Phase Admin 2A visual review"
git push
```

（既に uncommitted な docs/62 / 63 / 58 modified / devlog 0109-0110 / handoff 0120-0121 がある場合は、本 batch と一緒に commit するか、別 commit に分けるかは判断分け。「設計 docs の連番 commit」で 1 commit にまとめるのが docs 履歴上は読みやすい）

### Next Implementation Batch — 候補

| 候補 | 内容 |
| --- | --- |
| **A. Phase 2A-1 frontmatter mini-batch** | 既存 inbox 2 件（threads-support-diagram-v1 / note-inline-content-os-flow-v1）に [docs/64 §14](../64-admin-phase-2a-visual-review-wireframe.md#14-phase-2a-frontmatter-spec補足phase-2a-1-で確定) の frontmatter spec を適用、prompt.md / review.md を update |
| **B. Phase 2A-1 implementation batch** | route + image preview + 4 API + 8 component を localhost で動かす、production で degrade banner |
| **C. Production Visual Generation Batch 続行（独立）** | note-inline-content-os-flow-v1 の v001/v002/v003 を 1 candidate ずつ生成、Visual Register inbox review |
| **D. ContentPackage seed JSON** | [docs/63 §12](../63-cross-platform-content-visual-generation-core.md#12-test-case--aiでひとりメディア運営osを作っている裏側) を seed JSON 化（active 化なし） |
| **E. Auth Migration Design**（繰り下げ、docs/65） | Phase 2C 着手 trigger 立つまで保留可能 |

優先度: **A**（frontmatter 仕様確定）→ **B**（implementation 着手）の順、または並走で **C**（運用継続）。

## 19. Exact Next Prompt

### Option A: frontmatter mini-batch

```text
Apply Phase 2A frontmatter spec to existing inbox documents.

Hard Rules:
- Do NOT modify candidate PNG files.
- Do NOT modify schemas.
- Do NOT write to Sanity.
- Do NOT modify final asset paths.
- Do NOT modify patches.
- Do NOT generate new images.
- Do NOT deploy.

Use:
- docs/64-admin-phase-2a-visual-review-wireframe.md §14 (frontmatter spec)
- assets/inbox/generated/building-hitori-media-os/threads-support-diagram-v1/prompt.md (existing)
- assets/inbox/generated/building-hitori-media-os/threads-support-diagram-v1/review.md (existing)
- assets/inbox/generated/building-hitori-media-os/note-inline-content-os-flow-v1/prompt.md (existing)
- assets/inbox/generated/building-hitori-media-os/note-inline-content-os-flow-v1/review.md (existing)

Tasks:
1. Add the YAML frontmatter (variants / layoutPattern / requiredModules / selfReviewScores)
   to existing prompt.md and review.md files
2. Confirm the frontmatter parses with a generic YAML parser
3. Confirm no candidate PNG / schema / Sanity / patches were touched
4. Create docs/devlog/0112-* and docs/handoff/0123-*
```

### Option B: Phase 2A-1 implementation batch

```text
Implement Phase Admin 2A Batch 1: read-only candidate route for localhost.

Hard Rules:
- Implement ONLY routes + API + components listed in docs/64 §12 Phase 2A-1.
- Do NOT add any write endpoint (no POST / PUT / DELETE).
- Do NOT add Sanity mutation.
- Do NOT generate images.
- Do NOT modify existing 8 page routes or /api/asset-thumb behavior.
- Do NOT modify proxy.ts / featureFlags.ts logic (you may add new flags only if needed).
- Do NOT deploy.
- Do NOT modify Visual Register.

Use:
- docs/64-admin-phase-2a-visual-review-wireframe.md (full wireframe)
- existing dashboard/src/app/visual-assets/page.tsx (reference, do not change)
- existing dashboard/src/lib/groq/campaign.ts (extend pattern)
- existing dashboard/src/lib/featureFlags.ts (reuse ENABLE_LOCAL_FS_ROUTES)

Tasks:
1. Add routes /visual-assets/[assetId] and /visual-assets/[assetId]/candidates
2. Add API: /api/visual-review/inbox, /api/visual-review/assets/[assetId]/candidates,
   /api/visual-review/candidate-image, /api/visual-review/review-manifest
3. Add components: VisualAssetHeader, CandidateGrid, CandidateCard, CandidatePreview,
   LocalModeBanner, EmptyCandidateState, CandidateStatusBadge, DeferredActionButton
4. Add dashboard/src/lib/inboxReader.ts (filesystem reader, ENABLE_LOCAL_FS_ROUTES gated)
5. Run validation (local:check, root build, dashboard build)
6. Confirm production build does NOT expose candidate preview routes
7. Create docs/devlog/0112-* and docs/handoff/0123-*
```

## 20. Is Phase 2A wireframe design complete?

**Yes (this design batch)**:

- 16 sections の design doc が docs/64 に揃っている
- 11 route の責務表（phase / data source / read/write / production behavior）
- primary screen wireframe（ASCII で 5 section）+ secondary 4 screen の構成
- 6 dev-only API endpoint の仕様（path validation 含む）
- 14 component の props / data source / phase / reusability
- Content Package integration 設計（active 化前の擬似化 fallback 含む）
- 35 点 rubric の threshold 確定（24 / 18）+ Codex / human 並列表示
- Visual Register coexistence + deprecation 条件
- 4 batch 分割（2A-1 / 2A-2 / 2A-3 / 2B-1）
- prompt.md / review.md frontmatter 仕様の提案

**Phase 2A 実装着手前の wireframe / 仕様は本 batch で完了**。次の implementation batch で着手判断。

## 21. 連番について

- docs: 63 → **64**
- devlog: 0110 → **0111**
- handoff: 0121 → **0122**
- Auth 設計（旧 docs/65 候補）は引き続き保留、Phase 2C 着手前に独立 batch
