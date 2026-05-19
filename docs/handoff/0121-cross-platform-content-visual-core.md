# Handoff: Cross-Platform Content + Visual Generation Core (design only)

Date: 2026-05-18
Status: **cross-platform-core-design-complete / 0-code-change / 0-schema-change / 0-write / 0-deploy / phase-admin-1-still-in-production / phase-admin-2-design-from-previous-batch-intact**

## 1. Task Goal

boss が手で組んだ **404 Runner Threads campaign** の成功を、Threads-only feature ではなく **platform-agnostic な Content Package + Visual Package + Repurpose Engine の 3 抽象** に昇格させる設計。Hitori Media OS の cross-platform 生成基盤を [docs/63](../63-cross-platform-content-visual-generation-core.md) として固定する。

## 2. Constraints Followed

- design only、code / schema / asset / patch / Sanity / deploy 触らず
- 画像生成 / Codex 起動 ゼロ
- 新規パッケージ追加 ゼロ
- production env vars / Vercel UI 操作 ゼロ
- 既存 Visual Register / dashboard 挙動 不変
- 既存 5 schema（brandProfile / visualStyleProfile / promptTemplate / campaignPlan / visualAssetPlan） 不変
- 提案 schema は **active 化せず、sketch も書かない**、docs 内の提案のみ
- 404 Runner キャンペーン本体への再投稿 / 出版 ゼロ
- Auth 実装 ゼロ
- `.env*` を inspect / 出力していない
- secret 値を log / docs に書き残していない

## 3. Changed Files

### Added — `docs/`

- `docs/63-cross-platform-content-visual-generation-core.md`（16 sections、Content Package / Visual Package / Repurpose Engine の core 設計）
- `docs/devlog/0110-cross-platform-content-visual-core.md`
- `docs/handoff/0121-cross-platform-content-visual-core.md`（本ファイル）

### Modified — `docs/`

- `docs/handoff/latest.md`（本 0121 のミラー）

### Confirmed unchanged

- schemas / dashboard / tools / sanity.config / structure / proxy.ts
- assets / patches / seed / outputs / publish-packages / private
- Sanity dataset / Vercel project / DNS / production env vars
- POTA_Empire/.git / 兄弟 POTA project
- `dashboard/public/activity-snapshot.json`

## 4. 404 Runner から抽出されたもの

### 4.1 12 patterns

| # | パターン |
| --- | --- |
| P1 | pain-first hook |
| P2 | misconception correction |
| P3 | 4-point decomposition |
| P4 | main post as map |
| P5 | one reply = one message |
| P6 | per-unit 6-fold structure（conclusion / why / failureExample / method / caution / bridge） |
| P7 | main visual as map |
| P8 | support visual as prescription |
| P9 | visual hierarchy (1 hero + N support) |
| P10 | visual modules（再利用可能な module 分解） |
| P11 | review rubric inline |
| P12 | brand philosophy at the end |

### 4.2 5 axes 振り分け

- **A. 404 Runner-specific**（trail-running 語彙）→ §4 で Hitori Media OS 語彙に **完全写像**
- **B. Threads-specific**（main + reply 形）→ §5 で Repurpose rule の 1 platform に格下げ
- **C. cross-platform reusable**（P1-6, P11-12）→ **core**
- **D. visual-generation reusable**（P7-10）→ **core**（Visual Package + Layout Pattern Library）
- **E. admin-template elements** → [docs/62](../62-admin-phase-2-visual-generation-admin-design.md) の dashboard 統合に逃がす

## 5. 一般化された core 構造

### 5.1 3 抽象

| 抽象 | 役割 |
| --- | --- |
| **Content Package** | "言いたいこと一式"（platform-agnostic）。10 field: coreThesis / readerPain / reframe / mainMessage / pointDecomposition[] / platformOutputs[] / discussionQuestion / CTA / repurposeNotes |
| **Visual Package** | "asset の組"。6 field: mainVisual / supportVisuals[] / platformVisuals[] / thumbnailVisuals[] / inlineArticleVisuals[] / socialPreviewVisuals[] |
| **Repurpose Engine** | per-platform rules（7-8 platform 分） |

### 5.2 platform mapping（要約）

| Platform | density | aspect | tone |
| --- | --- | --- | --- |
| X main | low-medium | 16:9 / 4:5 | hook-driven, brief |
| Threads main + replies | medium | 4:5 portrait | conversational, soft |
| note article | medium-high | 16:9 | educational, archival |
| Substack post | medium | 16:9 / 3:1 banner | trust-building |
| YouTube thumbnail | low | 16:9 | clear promise |
| Shorts cover | low | 9:16 | hook-only |
| Instagram carousel | medium-high | 4:5 / 1:1 | hook + breakdown |

### 5.3 layout pattern library（19 種）

- 既存（docs/50）7 種: centered-title-only / title-with-single-diagram / split-left-text-right-diagram / top-headline-bottom-flow / grid-of-modules / before-after-comparison / architecture-stack
- 404 Runner-derived 7 種: **centralHeroFourCards** / ngOkComparison / checklist / timeline / bodyMap / routeMap / decisionChart
- Hitori OS-specific 10 種: **contentOSFlow** / hubAndSpoke / workflowPipeline / dashboardMockup / beforeAfterSystem / mediaDistributionMap / humanReviewFlow / automationBoundaryMap / readerListFunnel / publishPackageMap

各 pattern に best use case / required modules / platform fit / avoid を併記。

### 5.4 Text-to-Visual Module Mapper（25 項目）

- general 12 項目（number / frequency / comparison / process / caution / decision / checklist / timeline / relation / hierarchy / status / quantity / boundary）
- Hitori OS-specific 13 項目（**Content Idea → central node** / platform names → platform cards / AI が読める DB → database block / human judgment → checkpoint badge / Visual Register → candidate grid / publish package → folder block / manual publish → hand button / reader list → subscriber icon / automation later → locked badge / Hitori Media OS → mediaDistributionMap / build-in-public → buildLog pill / feedback loop → circular arrow / 4-point decomposition → central node + 4 cards）

### 5.5 Template v1（2 種）

- **Visual Package Template v1**: 17 field の JSON-like template
- **Content Package Template v1**: 14 field の JSON-like template

## 6. Hitori Media OS adaptation

12 項目の語彙写像:

| 404 Runner | Hitori Media OS |
| --- | --- |
| trail runner | solo media builder |
| training plan | content workflow |
| mountain route | publishing pipeline |
| gear checklist | tool stack / prompt stack |
| body map | system map / content OS map |
| VO2max training | audience growth / production capacity |
| safety checklist | human review / secret safety / manual publish |
| race plan | launch plan / campaign plan |
| recovery | review / feedback loop |
| pacing | cadence（per-platform） |
| altitude sickness | burnout / decision fatigue |
| gear failure | tool / API / prompt failure |
| nutrition | content sourcing / inbox flow |

## 7. ContentPackage 例（§12 test case 要約）

**Topic**: 「AIでひとりメディア運営OSを作っている裏側」

**4-point decomposition**:

1. Content Idea を構造化する
2. AI が読める DB を作る
3. 自動化は最後にする
4. 人間の判断を残す

各 unit に 6 sub-field（conclusion / why / failureExample / method / caution / bridge）を full 記入。X / Threads / note / Substack の 4 platform mapping、Visual Package 9 件（mainVisual + supportVisuals × 4 + x-hook + note-hero + note-inline × 4 + substack-header）、推奨 layout pattern も含む。

詳細は [docs/63 §12](../63-cross-platform-content-visual-generation-core.md#12-test-case--aiでひとりメディア運営osを作っている裏側).

## 8. Phase Admin 2 への影響

| 領域 | 影響 |
| --- | --- |
| Phase 2A dashboard route | 既存 8 件 + 本 doc 追加 8 件 = 計 16 件の提案（実装は段階的） |
| Phase 2A wireframe batch | 本 doc の core を踏まえた component / GROQ / API 設計が次バッチに必要 |
| Phase 2A schema | 不変。`contentPackage` / `visualPackage` の sketch は別バッチ |
| Phase 2B local write | 既存 inbox flow を Visual Package 単位で扱えるよう拡張余地 |
| Phase 2C Sanity write | ContentPackage / VisualPackage の Sanity 化が前提になる場合あり |
| Phase 2D product 化 | 19 layout / 25 mapper を user-scoped にする抽象化必須 |

## 9. Important Decisions

- 404 Runner を **3 抽象（Content / Visual / Repurpose）に分解**、Threads-specific を 1 platform rule に格下げ
- per-unit を **6-fold structure** に固定、空欄が出る unit は分割しないか統合する
- pointDecomposition の本数を **3-6** に固定
- layout pattern を **7 → 19 種** に拡張
- Text-to-Visual Module Mapper を **25 項目** で固定
- 提案 schema **4 件追加**（contentPackage / visualPackage / textToVisualMapper / generationRun）。[docs/62](../62-admin-phase-2-visual-generation-admin-design.md) § 8 の 7 件と合わせて **計 11 件** が将来候補
- 本 batch では sketch も書かない、提案のみ
- 既存 promptTemplate category は **add-only**（content-package / image-prompt-blueprint / review-rubric / repurpose の 4 候補）
- Auth 設計は別 batch（docs/65 候補に繰り下げ、本 doc が docs/63 を取った）
- ContentPackage を自分自身（「AIでひとりメディア運営OSを作っている裏側」）で full test 実行（§12）

## 10. Validation Results

実行結果（2026-05-18 JST）:

| Check | Result |
| --- | --- |
| `npm run local:check` | **17 ok / 0 fail** |
| root `npm run build`（Sanity Studio） | **green**（Build Sanity Studio 11211ms） |
| `cd dashboard && npm run build` | **green**（TypeScript clean、8 page route + `/api/asset-thumb` + Proxy middleware 全 compile 通過） |
| `git diff --stat`（schemas / dashboard / tools / proxy.ts） | **0 件**（docs と handoff のみ変更） |
| direct Sanity write grep | **0 hits**（docs 内 rule 引用のみ） |
| paid LLM / image API SDK grep | **0 hits** |
| 新規 package | **0 件**（package.json / package-lock.json 不変） |

→ 既存 production runtime / Sanity Studio build / dashboard build への影響ゼロ。

## 11. Human Review Questions

- 提案 schema 11 件（7 + 4）のうち、**最初に sketch すべき 1 件**はどれか？（候補: `contentPackage` / `visualPackage` / `designProfile`）
- ContentPackage seed JSON 1 件を `seed/content-packages/<slug>.json` に書き出す batch を **次に挟むか**？（本 doc §16 候補 E）
- Phase 2A wireframe batch（docs/64 候補）を次に走らせるか、それとも Production Visual Generation Batch 続行を優先するか？
- `bodyMap` / `routeMap` / `decisionChart` などの 404 Runner-derived layout を Hitori Media OS でどれくらい使うか？ 使わないなら enum から省くか？
- ContentPackage / VisualPackage を campaignPlan の field として埋め込むか、独立 record にするか？（schema 設計時に判断）

## 12. Risks or Uncertainties

| Risk | Mitigation |
| --- | --- |
| 19 layout pattern を全部使わずに死蔵 | Phase 2A 実装時に "実際使われる top-N" を計測、3 ヶ月運用後に enum 整理 |
| 25 mapper 項目が陳腐化 | brandProfile / visualStyleProfile の reference history と連動して update、半年ごとに棚卸し |
| 提案 schema 11 件を全部 activate するインフレ | 各 schema を activate するときに **個別 design batch** を挟む、まとめて active 化しない |
| ContentPackage 概念が campaignPlan と重複 | docs/63 § 10.3 で「campaignPlan は orchestration、ContentPackage は decomposition + repurpose」と責務分離を docs に固定済 |
| 「日本ローカル」vs「英語圏」「他言語」への国際化 | platform mapping の tone / aspect ratio は言語非依存、layout pattern も非依存。tone の "trust-building" / "conversational" 解釈に locale 差が出る場合は brandProfile.platformToneOverrides で吸収 |
| 404 Runner の成功が "再現性のあるパターン" でなく boss 個人の文章力に依存していた場合 | Phase 2A で複数 ContentPackage instance を作り、re-use 可能性を実測、3 件以上で再現できなければ pattern を破棄 |

## 13. Recommended Next Step

### Immediate (this batch)

本 docs を commit + push:

```bash
cd /Users/sugawaratakuya/Documents/POTA_Empire/10_Development/sanity-ai-content-os

git status --short
git add docs/63-cross-platform-content-visual-generation-core.md \
        docs/devlog/0110-cross-platform-content-visual-core.md \
        docs/handoff/0121-cross-platform-content-visual-core.md \
        docs/handoff/latest.md

git diff --staged --stat
git commit -m "docs: design cross-platform content + visual generation core"
git push
```

### Next Implementation Batch — 候補

| 候補 | 内容 |
| --- | --- |
| **A. Phase 2A wireframe batch** (`docs/64`) | candidate review UI の component / GROQ / dev-only API 設計 |
| **B. ContentPackage seed JSON 1 件** | §12 の test case を `seed/content-packages/<slug>.json` に書き出す（active 化なし、JSON だけ） |
| **C. ContentPackage / VisualPackage schemas/proposed/ sketch** | 本 doc の提案 schema を sketch 化（active 化なし） |
| **D. Production Visual Generation Batch 続行** | note-inline-content-os-flow-v1 の v001/v002/v003 / Visual Register inbox review |
| **E. Auth Migration Design (繰り下げ、docs/65)** | Basic Auth → real Auth、Phase 2C 着手前に必須 |

優先度: **A** または **B** を次に。**E** は Phase 2C 着手 trigger が立つまで保留可能。

### Deferred（永続）

- paid LLM / image API integration
- auto-posting
- AI auto-approval
- multi-user collaboration（Phase 2D で初めて議論）
- billing / paid tier
- public site analytics fetch

## 14. Exact Next Prompt to Give Codex / Claude Code

### Option A: Phase 2A Implementation Plan Batch（推奨）

```text
Plan Phase Admin 2A: Dashboard-integrated Visual Review (read-only) implementation plan.

Hard Rules:
- Design only.
- Do NOT scaffold code.
- Do NOT add new packages.
- Do NOT deploy.
- Do NOT modify existing dashboard runtime behavior.
- Do NOT touch Sanity.
- Do NOT touch assets / patches / inbox / Visual Register.

Use:
- docs/62-admin-phase-2-visual-generation-admin-design.md (Phase 2A section)
- docs/63-cross-platform-content-visual-generation-core.md (Visual Package + Layout Pattern Library)
- dashboard/src/app/visual-assets/page.tsx (existing read-only)
- tools/visual-register/server.mjs (API to migrate)

Tasks:
1. Create docs/64-admin-phase-2a-implementation-plan.md covering:
   - exact new routes (path, query, GROQ, filesystem)
   - component breakdown (CandidateGrid / CandidateCard / ReviewRubricInline / SideBySideCompare / VisualPackageOverview)
   - feature flag design
   - dev-only API route specs
   - test plan
2. Confirm production read-only invariant
3. Create docs/devlog/0111-* and docs/handoff/0122-*
```

### Option B: ContentPackage seed JSON

```text
Add a seed JSON instance of the Content Package Template v1, with no schema activation.

Hard Rules:
- Do NOT activate the contentPackage schema.
- Do NOT add the schema file under schemas/.
- Do NOT write to Sanity.
- Do NOT generate visuals.
- Do NOT deploy.

Use:
- docs/63-cross-platform-content-visual-generation-core.md §9 (Content Package Template) and §12 (test case)
- existing seed/ directory structure

Tasks:
1. Create seed/content-packages/ai-solo-media-os-behind-the-scenes.json from §12 test case
2. Confirm it passes JSON.parse and matches the §9 template structure
3. Create docs/devlog/0111-* and docs/handoff/0122-*
```

## 15. Is the Cross-Platform Core Design complete?

**Yes (this design batch)**:

- 16 sections の design doc が docs/63 に揃っている
- Content Package / Visual Package / Repurpose Engine の 3 抽象が定義済
- 404 Runner 12 patterns を 5 axes に振り分け済
- trail-running → Hitori Media OS 語彙写像 12 項目完了
- platform mapping 7 platform 分の rule 表
- layout pattern 19 種、各 best use / required modules / platform fit / avoid
- Text-to-Visual Module Mapper 25 項目
- Content Package Template v1 / Visual Package Template v1 の JSON-like 仕様
- 提案 schema 4 件追加（既存 7 件 + 4 件 = 11 件候補）
- dashboard route 8 件追加提案
- §12 で full test case 実行（「AIでひとりメディア運営OSを作っている裏側」）

**Cross-platform core design は本 batch で完了**。次の design / implementation batch で着手判断。

## 16. 連番について

- docs: 62 → **63**
- devlog: 0109 → **0110**
- handoff: 0120 → **0121**
- Auth 設計（旧 docs/63 候補）は docs/65 に繰り下げ
