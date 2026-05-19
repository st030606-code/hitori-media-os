# Devlog 0110 — Cross-Platform Content + Visual Generation Core (design only)

Date: 2026-05-18
Status: **design-only / docs-only / 0-code-change / 0-schema-change / 0-write / 0-deploy / 0-image-gen**

## 今日の判断

boss が手作業で組んだ **404 Runner Threads campaign** の成功を、"Threads template" として横展開しない判断をした。代わりに **3 つの platform-agnostic core 抽象**（Content Package / Visual Package / Repurpose Engine）に分解し、Threads は repurpose の 1 platform に格下げした。

理由: 「Threads でうまくいった → Threads template を作る」と短絡すると platform 別に同種 template を 7-8 個量産することになり、保守不能になる。本質は **pain → map → prescription → philosophy の 4 段構造 + decompose × per-unit visual** という構造であって、Threads main + reply の形に偶然はまっただけ。X thread / note 記事の章立て / Substack 構成 / YouTube chapter / Shorts hook / Instagram carousel すべてに転用できる。

並行して、trail-running 固有語彙（VO2max / route / body map / gear checklist / safety checklist 等）を **Hitori Media OS 語彙に完全写像** した。trail runner → solo media builder、mountain route → publishing pipeline、body map → system map など 12 項目。これで 404 Runner pattern を生のまま流用するのではなく、自分のドメインに翻訳した formal な doc になった。

## なぜその設計にしたか

- **3 抽象に分解した理由**: 1 つの "Threads template" にすると platform を増やすたびに別 template を作ることになる。Content Package (言いたいこと一式)、Visual Package (asset の組)、Repurpose Engine (platform 別 mapping rule) の **3 直交軸** に切れば、ContentPackage は 1 つ、VisualPackage は 1 つ、Repurpose rule は N platform でも O(1) に拡張できる。
- **404 Runner pattern を 12 個に分解 → 5 axes に振り分け**: axis C (cross-platform reusable) と axis D (visual-generation reusable) を **core** に昇格、axis A (404 Runner-specific) を完全置換対象、axis B (Threads-specific) を Repurpose rule の 1 platform 行に格下げ、axis E (admin-template) を [docs/62](../62-admin-phase-2-visual-generation-admin-design.md) の dashboard 統合に逃がした。これで core / platform / domain の責務が分離された。
- **per-unit 6-fold structure（結論 / なぜ / 失敗 / 方法 / 注意 / 橋）を pointDecomposition の不変条件に**: unit が 6 sub-field 全埋めできない場合は分割しないか統合するルールを書いた。これは 404 Runner reply の構造そのもの。空欄が出る unit を許すと "薄い" 投稿が混ざる。
- **pointDecomposition の本数を 3-6 に固定**: 短すぎると map が成立しない、多すぎると map が崩れる。404 Runner も 4 だった。
- **layout pattern を 7 → 19 種に拡張**: 既存 (docs/50) 7 種 + 404 Runner-derived 7 種 (centralHeroFourCards / ngOkComparison / checklist / timeline / bodyMap / routeMap / decisionChart) + Hitori OS-specific 10 種 (contentOSFlow / hubAndSpoke / workflowPipeline / dashboardMockup / beforeAfterSystem / mediaDistributionMap / humanReviewFlow / automationBoundaryMap / readerListFunnel / publishPackageMap)。各 pattern に best use case / required modules / platform fit / avoid を併記。
- **Text-to-Visual Module Mapper を表で固定**: 「Content Idea → central node」「platform names → platform cards」「AI が読める DB → database block」など Hitori Media OS 固有語彙 13 項目を visual module に 1 対 1 で固定した。同じ語彙 → 同じ module で一貫性。これは 404 Runner の visual hierarchy 由来の P7-P10 を一般化したもの。
- **Visual Package Template / Content Package Template を JSON-like で固定**: 404 Runner の visual package template を一般化、trail-running 固有 module は完全排除。template version v1 として刻んだので、将来の breaking change を v2 で扱える。
- **既存 promptTemplate category を破壊せず add-only**: content-package / image-prompt-blueprint / review-rubric / repurpose の 4 category を新規追加候補に列挙、既存 (text-draft / image-generation 等) は不変。
- **提案 schema 4 件を [docs/62](../62-admin-phase-2-visual-generation-admin-design.md) § 8 提案 7 件に追加（計 11 件）**: contentPackage / visualPackage / textToVisualMapper / generationRun。**本 batch では sketch も書かない**、提案のみ。
- **dashboard route を 8 つ追加提案**: `/content-packages/*` / `/visual-generation/*` / `/settings/layout-patterns` / `/settings/design-profiles`。階層は ContentPackage → VisualPackage → visualAssetPlan → visualCandidate → generationRun の 5 段。
- **テストケースとして §12 で full mapping を実行**: 「AIでひとりメディア運営OSを作っている裏側」を 1 ContentPackage として展開し、X / Threads / note / Substack の 4 platform mapping、Visual Package 9 件、layout pattern 推奨を全部書いた。本 doc 内で **自分自身を test case として消費** したことになる。
- **Phase Admin 2 / Phase Admin 3 との境界を明示**: 本 doc の core はどちらの phase でも参照される共通基盤。Phase 2A 着手前に wireframe batch を挟むのが望ましい。

## Codex と Claude Code の役割分担

| 役割 | 担当 |
| --- | --- |
| docs/63 起草（16 sections） | **Claude Code（本バッチ）** |
| 404 Runner pattern の 5 axes 振り分け | Claude Code |
| trail-running → Hitori OS 語彙写像 | Claude Code |
| layout pattern 19 種の整理 | Claude Code |
| Text-to-Visual Module Mapper の表化 | Claude Code |
| Content Package / Visual Package Template v1 起草 | Claude Code |
| §12 test case の full mapping | Claude Code |
| 既存 promptTemplate 拡張提案 / 提案 schema 4 件追加 | Claude Code |
| dashboard route 提案 8 件 | Claude Code |
| 404 Runner 元 campaign の生分析 | **人間 boss**（本 batch ではコピペしない、要点抽出のみ） |
| 提案 schema の sketch / active 化 | **将来バッチ**（本 batch では実装しない） |
| Phase 2A wireframe batch（docs/64 候補） | **将来バッチ** |
| Auth 設計（docs/65 候補に繰り下げ） | **将来バッチ** |
| ContentPackage seed の作成 | **将来バッチ**（§16 候補 E） |

Codex は本 batch で起動していない。画像生成ゼロ、CLI 投入ゼロ。

## API なしで済ませた理由

- 設計のみで code / schema 変更ゼロ → API 追加 0
- Codex / OpenAI / Sanity write を含めて paid / external API 呼び出し 0
- 既存 Sanity read token / ChatGPT OAuth / GitHub OAuth はそのまま、新規認証情報追加 0
- Auth 設計は別 batch（docs/65 候補に繰り下げ）
- 404 Runner pattern 分析は人間 boss が事前にやった結果を受け取り、本 doc では reusability で 5 axes に振り分けるだけ → API 呼び出し不要

## このバッチで作ったもの / 変更したもの

### Added — `docs/`

- `docs/63-cross-platform-content-visual-generation-core.md`（16 sections、core 設計本体）
- `docs/devlog/0110-cross-platform-content-visual-core.md`（本ファイル）
- `docs/handoff/0121-cross-platform-content-visual-core.md`

### Modified — `docs/`

- `docs/handoff/latest.md`（本 0121 のミラー）

### Confirmed unchanged

- `schemas/` 全件（5 件不変: brandProfile / visualStyleProfile / promptTemplate / campaignPlan / visualAssetPlan、その他 contentIdea / diagramPlan / platformOutput / publishedOutput / substack* / tool / workflow も不変）
- `schemas/index.ts` / `sanity.config.ts` / `structure/index.ts`
- `dashboard/src/` 全件（page route / api route / lib / components / proxy.ts）
- `dashboard/package.json` / `package-lock.json`
- root `package.json` / `package-lock.json`
- `tools/visual-register/` / `tools/publish-package-builder/` / `tools/local-check.mjs` / `tools/asset-thumb/` 等
- `assets/visuals/` / `assets/inbox/` / `patches/` / `seed/` / `outputs/` / `publish-packages/`
- Sanity dataset（**書き込みゼロ**）
- Vercel project / DNS / production env vars
- production deployment（**未触**）
- `dashboard/public/activity-snapshot.json`

## 抽出された core まとめ

### Content Package（10 field）

`coreThesis / readerPain / reframe / mainMessage / pointDecomposition[] / platformOutputs[] / discussionQuestion / CTA / repurposeNotes`

### pointDecomposition[i] の 6-fold structure

`conclusion / why / failureExample / method / caution / bridge`

→ 6 sub-field 全埋めが品質ガード。

### Visual Package（6 field）

`mainVisual / supportVisuals[] / platformVisuals[] / thumbnailVisuals[] / inlineArticleVisuals[] / socialPreviewVisuals[]`

### Repurpose Engine（per-platform rule × 7-8 platforms）

X / Threads / note / Substack / YouTube thumbnail / Shorts cover / Instagram carousel。

各 rule に `contentRoleMapping / formLayout / toneAdjustment / visualPolicy / densityHint / aspect ratio / CTAStyle / metricsToWatch`。

### Layout Pattern Library

19 種（既存 7 + 404 Runner-derived 7 + Hitori OS-specific 10、ただし重複 5 を統合して実数 19）。

### Text-to-Visual Module Mapper

general 12 項目 + Hitori OS-specific 13 項目 = **計 25 項目** の 1 対 1 表。

### 提案 schema（11 件、active 化なし、sketch なし）

[docs/62](../62-admin-phase-2-visual-generation-admin-design.md) § 8 の 7 件 + 本 doc 追加 4 件:

- `designProfile` (既出)
- `layoutPatternPreset` (既出)
- `visualGenerationRun` (既出)
- `visualCandidate` (既出)
- `visualReviewDecision` (既出)
- `generationJob` (既出)
- `assetRegistrationLog` (既出)
- **`contentPackage`** (本 doc)
- **`visualPackage`** (本 doc)
- **`textToVisualMapper`** (本 doc)
- **`generationRun`** (本 doc、`visualGenerationRun` と統合候補)

## Phase Admin 2 への影響

| 領域 | 影響 |
| --- | --- |
| Phase 2A dashboard route | 既存 8 件 + 本 doc 追加 8 件 = 16 件の提案（実装は段階的） |
| Phase 2A wireframe batch | 本 doc の core を踏まえた component / GROQ / API 設計が次バッチに必要 |
| Phase 2A schema | 不変。`contentPackage` / `visualPackage` の sketch は別バッチ |
| Phase 2B local write | 既存 inbox flow を Visual Package 単位で扱えるよう拡張余地 |
| Phase 2C Sanity write | ContentPackage / VisualPackage の Sanity 化が前提になる場合あり |
| Phase 2D product 化 | 19 layout / 25 mapper を user-scoped にする抽象化必須 |

→ Phase 2A 実装着手前に **wireframe batch（docs/64 候補）** を挟むのが望ましい。

## 発信ネタになりそうな切り口

1. **「成功 pattern を platform template ではなく core 抽象に昇格させる」**: 「Threads でうまくいった→Threads template を作る」と短絡しない。pain → map → prescription → philosophy の 4 段構造を core に置き、Threads は repurpose rule の 1 platform にする設計判断。
2. **「trail-running の語彙を Hitori Media OS に完全写像する」**: 12 項目（trail runner → solo media builder / mountain route → publishing pipeline / body map → system map など）を 1 対 1 で写像し、404 Runner pattern を生のまま流用せず自分のドメインに翻訳した話。
3. **「per-unit 6-fold structure」**: 各 unit が conclusion / why / failureExample / method / caution / bridge を持つ。空欄が出る unit は分割しないか統合する。これが薄い投稿を防ぐ品質ガード。
4. **「Text-to-Visual Module Mapper」**: Content Idea → central node、AI が読める DB → database block、manual publish → hand button など、語彙と visual module を 1 対 1 で固定。同じ言葉なら同じ図、で一貫性を保つ。
5. **「ContentPackage を自分自身に適用する」**: §12 の test case が「AIでひとりメディア運営OSを作っている裏側」で、本 doc がまさにその ContentPackage の例になっている。core 抽象を自分自身で消費する build-in-public の極致。

## Safety Verified

- direct Sanity write を含むコード変更: **0 件**
- paid LLM / image API client 追加: **0 件**
- `SANITY_WRITE_TOKEN` / `writeToken` grep: 0 hits（docs 内の rule 引用のみ）
- 環境変数変更 / Vercel UI 操作: **0 件**
- 画像生成 / Codex CLI 起動: **0 件**
- schema 変更 / activate / proposed/ 追加: **0 件**
- assets / patches / Sanity / publish-packages: **不変**
- 既存 production dashboard (`app.hitorimedia.com`) の挙動: **不変**
- Visual Register (`tools/visual-register/`) の挙動: **不変**
- root `npm run local:check`: 後段 handoff §10 で実行・結果記録
- root `npm run build`（Sanity Studio）: 後段 handoff §10 で実行・結果記録
- `cd dashboard && npm run build`: 後段 handoff §10 で実行・結果記録
