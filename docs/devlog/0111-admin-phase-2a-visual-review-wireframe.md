# Devlog 0111 — Admin Phase 2A: Visual Review Wireframe Design (design only)

Date: 2026-05-18
Status: **design-only / docs-only / 0-code-change / 0-schema-change / 0-write / 0-deploy / 0-image-gen**

## 今日の判断

Phase Admin 2A の実装着手前に、wireframe / 詳細設計を 1 docs（docs/64）に固めた。**route と component を別の人が見ても解釈ブレない**粒度で書き、実装は **2A-1 / 2A-2 / 2A-3 / 2B-1** の 4 batch に分割。

最も重要な設計判断:

- **dashboard と Visual Register は兄弟プロセス**にする（依存しない）。Phase 2A で dashboard が candidate review を行えるようにするが、Visual Register process が起動していなくても dashboard は動く。filesystem reader を `dashboard/src/lib/inboxReader.ts` として **独立実装**し、Visual Register の code は参考だけ、code は再実装。
- **書き action は Phase 2A では一切しない**。`Approve & register` / `Mark needs regeneration` / `Regenerate prompt preview` は **disabled + "Phase 2B" ラベル**。`Open in Visual Register` / `Copy review notes` / `Mark preferred (local UI only)` の 3 つだけ active。これで Phase 1 の "production は read-only" 原則を Phase 2A 中も守れる。
- **production では candidate preview を諦める**。filesystem 不在の production では `LocalModeBanner` で "Local candidate review unavailable in production mode" を出し、metadata + saved final だけを見せる degrade を採用。build-time snapshot に焼く案は Phase 2B で再評価、本 batch では結論を出さない。
- **35 点 rubric の threshold を 24 / 18 で固定**（candidate / needs review / regenerate）。これは [docs/62](../62-admin-phase-2-visual-generation-admin-design.md) § 6.3 と [docs/63](../63-cross-platform-content-visual-generation-core.md) § 8 の rubric を Phase 2A の UI に落とし込んだもの。1 週間運用後に再評価、本 batch では確定しない判断は保留。
- **既存 8 page + `/api/asset-thumb` を不変**に保つ。Phase 2A で追加する 11 route はすべて新規 path、既存 dashboard runtime に影響なし。Phase 1 で確立した 2 段防御（proxy 401 + flag-off 404）の延長で `ENABLE_LOCAL_FS_ROUTES` を Phase 2A の filesystem route にも適用。
- **dev-only API 名前空間を `/api/visual-review/*` で確保**。Phase 2B で書き API を入れるとき同名前空間で `POST` を増やせるよう、Phase 2A は GET 限定で予約。実装 batch（2A-1）で path validation を既存 `/api/asset-thumb` パターンに揃える。
- **prompt.md / review.md frontmatter 仕様を提案**。candidate detail UI が拾うべき variant / layoutPattern / requiredModules / selfReviewScore を YAML frontmatter で固定する案を §14 に書いた。仕様確定は Phase 2A-1 着手時、既存 inbox 2 件（threads-support-diagram-v1 / note-inline-content-os-flow-v1）の update も別 mini-batch で。
- **Content Package 概念は擬似化で先送り**。`contentPackage` schema は active 化されていないので、Phase 2A-3 では **campaignPlan を擬似 ContentPackage として view** する fallback で対応。schema active 化は Phase 2C 着手時に再評価、本 batch では sketch も書かない。

## なぜその設計にしたか

- **書きを Visual Register に残す理由**: Phase 2A で書きまで dashboard に持ってくると、Phase 1 で守った "production には write endpoint を含めない" 原則と Phase 2B の "Auth 切替前に Sanity write を入れない" 原則を同時に壊す。Phase 2A は **decision support tool**、書きは Phase 2B 以降に分離。
- **filesystem reader を Visual Register と別実装にした理由**: 同じ JS でも process が別で、起動順序や依存関係を強制したくない。dashboard が `tools/visual-register/server.mjs` を import すると、dashboard build に visual register の dependencies が混入する。分離して再実装、behavior parity test を別 batch で書く。
- **3 action だけ active にした理由**: "Open in Visual Register" は localhost で必ず動く、"Copy review notes" は clipboard だけ、"Mark preferred (local)" は session state だけ。いずれも **side effect が dashboard 外に出ない** ので、Phase 2A の read-only 不変条件を破らない。
- **production で degrade banner にした理由**: filesystem 依存を production に持ち込むと、(a) Vercel の Root Directory `dashboard/` 制限で `../assets/inbox/` が build context に含まれない、(b) candidate PNG 数 GB を public asset に焼くのは現実的でない、(c) Sanity asset に upload は write 解禁が必要で Phase 2C 範囲。 → degrade が最小コストで正しい振る舞い。
- **34 / 18 threshold の根拠**: 35 点満点で 24 ≈ 7 軸平均 3.4、これは「全軸 "悪くない" + 1-2 軸 "良い"」のライン。18 ≈ 7 軸平均 2.6、「半分以上が低スコア」。docs/62 / 63 の rubric を踏襲、運用調整は Phase 2A 1 週間後に。
- **4 batch 分割の理由**: 2A-1 で route + image preview だけ通せば dashboard が "candidate を並べる" 最低限が動く。2A-2 で rubric / prompt detail、2A-3 で Content Package overview。各 batch が **1 PR / 1 commit batch** で済む粒度。
- **frontmatter 仕様を提案で止めた理由**: Phase 2A-1 着手時に既存 inbox 2 件を update する mini-batch を挟む必要があり、本 batch で書くと "code 変更ゼロ" 原則を破る（inbox file は code ではないが、prompt.md は既存 file）。提案だけ、確定は 2A-1。
- **Content Package を擬似化した理由**: schema active 化を急ぐと、schema 1 件あたり別 design batch が必要になり scope が膨らむ。Phase 2A-3 は campaignPlan を擬似 ContentPackage で view、Phase 2C で active 化を再判断、Phase 3 で本格運用、と段階。

## Codex と Claude Code の役割分担

| 役割 | 担当 |
| --- | --- |
| docs/64 起草（16 sections、wireframe 含む） | **Claude Code（本バッチ）** |
| ASCII wireframe 5 種（primary screen + secondary 4 種） | Claude Code |
| route 11 件の責務表 | Claude Code |
| dev-only API 6 endpoint 仕様 | Claude Code |
| component 14 件の breakdown | Claude Code |
| prompt.md / review.md frontmatter 仕様提案 | Claude Code |
| Visual Register coexistence + deprecation 条件 | Claude Code |
| 35 点 rubric の Phase 2A UI 化（threshold 含む） | Claude Code |
| 4 batch 分割（2A-1 / 2A-2 / 2A-3 / 2B-1） | Claude Code |
| 提案 schema の sketch / active 化 | **将来バッチ**（本 batch では sketch せず） |
| React component の実装 | **2A-1 / 2A-2 / 2A-3 のいずれか着手 batch** |
| dev-only API route の実装 | **2A-1 着手 batch** |
| frontmatter spec の確定 + 既存 inbox 2 件の update | **2A-1 着手 mini-batch** |
| Auth 設計（Basic Auth → real Auth） | **別 batch（docs/65 候補）**、Phase 2C 着手前 |

Codex は本 batch で起動していない。画像生成 0、CLI 投入 0。

## API なしで済ませた理由

- 設計のみで code / schema 変更ゼロ → API 追加 0
- Codex / OpenAI / Sanity write を含めて paid / external API 呼び出し 0
- 既存 Sanity read token / ChatGPT OAuth / GitHub OAuth はそのまま、新規認証情報追加 0
- Auth 設計は別 batch（docs/65 候補）
- Visual Register process を本 batch で起動していない（参考 code は読んだだけ）

## このバッチで作ったもの / 変更したもの

### Added — `docs/`

- `docs/64-admin-phase-2a-visual-review-wireframe.md`（16 sections、wireframe / route / API / component / coexistence）
- `docs/devlog/0111-admin-phase-2a-visual-review-wireframe.md`（本ファイル）
- `docs/handoff/0122-admin-phase-2a-visual-review-wireframe.md`

### Modified — `docs/`

- `docs/handoff/latest.md`（本 0122 のミラー）

### Confirmed unchanged

- `schemas/` 全件（5 件不変: brandProfile / visualStyleProfile / promptTemplate / campaignPlan / visualAssetPlan、その他 contentIdea / diagramPlan / platformOutput / publishedOutput / substack* / tool / workflow も不変）
- `schemas/index.ts` / `sanity.config.ts` / `structure/index.ts`
- `dashboard/src/` 全件（page route / api route / lib / components / proxy.ts）
- `dashboard/package.json` / `package-lock.json`
- root `package.json` / `package-lock.json`
- `tools/visual-register/` / `tools/publish-package-builder/` / `tools/local-check.mjs` / `tools/asset-thumb/` 等
- `assets/visuals/` / `assets/inbox/`（既存 untracked 2 ディレクトリは本 batch では触らず）/ `patches/` / `seed/` / `outputs/` / `publish-packages/`
- Sanity dataset（**書き込みゼロ**）
- Vercel project / DNS / production env vars
- production deployment（**未触**）
- `dashboard/public/activity-snapshot.json`

## Phase 2A 実装 batch ロードマップ

### 2A-1（次の implementation batch 候補）

| 項目 | 内容 |
| --- | --- |
| route 投入 | `/visual-assets/[assetId]`, `/visual-assets/[assetId]/candidates` |
| API 投入 | `GET /api/visual-review/inbox`, `/api/visual-review/assets/[assetId]/candidates`, `/api/visual-review/candidate-image`, `/api/visual-review/review-manifest` |
| Component 投入 | VisualAssetHeader, CandidateGrid, CandidateCard, CandidatePreview, LocalModeBanner, EmptyCandidateState, CandidateStatusBadge, DeferredActionButton |
| 完了基準 | localhost で v00N grid + preview が動く、production で degrade banner |

### 2A-2

- candidate detail page + rubric panel + prompt/review markdown
- API: `GET /api/visual-review/prompt`, `/api/visual-review/review-notes`
- Component: CandidateDetailPanel, ReviewRubricPanel, SuggestedActionPanel, VisualModuleChecklist, PromptSummaryBlock, StyleAnchorList

### 2A-3

- content package visual overview + cross-platform comparison
- route: `/content-packages*`, `/visual-review*`
- 既存 component 再利用

### 2B-1（Phase 2A 完了後）

- approve & register write endpoint, localhost only
- `POST /api/visual-review/approve-and-register`

## 発信ネタになりそうな切り口

1. **「dashboard と Visual Register を兄弟プロセス化する」**: 新ツールを古いツールに直接 import すると依存関係が硬直化する。filesystem reader を独立実装、両プロセスが互いに知らないが同じ inbox を読む設計。
2. **「write を Visual Register に残しつつ read を dashboard に移す」**: 段階的解禁の典型例。Phase 2A は decision support tool、Phase 2B で書き、Phase 2C で Sanity 反映。1 phase = 1 mutation 解禁のリズム。
3. **「production で candidate review を諦める」**: filesystem 依存を production に持ち込まず、localhost を唯一の review surface に。build-time snapshot / Sanity asset upload は Phase 2B で再評価する保留判断。
4. **「DeferredActionButton で `Phase 2B` ラベル」**: 未実装機能を UI 上に "近い未来の form" として置く設計。次の phase で何ができるかが boss に見える、scope の透明性。
5. **「prompt.md / review.md の frontmatter で UI が読む field を固定」**: filesystem 文書を UI が読める形に整形する標準化。Visual Register / dashboard / 将来の generation bridge すべてが同じ frontmatter spec を共有。

## Safety Verified

- direct Sanity write を含むコード変更: **0 件**
- paid LLM / image API client 追加: **0 件**
- `SANITY_WRITE_TOKEN` / `writeToken` grep: 0 hits（docs 内の rule 引用のみ）
- 環境変数変更 / Vercel UI 操作: **0 件**
- 画像生成 / Codex CLI 起動: **0 件**
- schema 変更 / activate / proposed/ 追加: **0 件**
- assets / patches / Sanity / publish-packages / inbox: **不変**
- React component / API route / page route 追加: **0 件**
- 既存 production dashboard (`app.hitorimedia.com`) の挙動: **不変**
- Visual Register (`tools/visual-register/`) の挙動: **不変**
- root `npm run local:check`: 後段 handoff §10 で実行・結果記録
- root `npm run build`（Sanity Studio）: 後段 handoff §10 で実行・結果記録
- `cd dashboard && npm run build`: 後段 handoff §10 で実行・結果記録
