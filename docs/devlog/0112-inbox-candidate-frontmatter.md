# Devlog 0112 — Inbox Candidate Frontmatter (Phase 2A prerequisite mini-batch)

Date: 2026-05-18
Status: **applied / docs-only / 4 inbox markdown files updated / candidate PNG unchanged / 0 schema change / 0 sanity write / 0 deploy**

## 今日の判断

Phase Admin 2A の dashboard 実装に進む前に、**既存 inbox の prompt.md / review.md に YAML frontmatter を入れる前段 mini-batch** を独立して走らせた。理由は、Phase 2A-1 で dashboard candidate review route を実装するときに、parser が「ファイルが揃っていないと壊れる」状態にしたくないため。

具体的に変えたこと:

- 既存 4 file（threads-support-diagram-v1 と note-inline-content-os-flow-v1 の prompt.md / review.md）に **YAML frontmatter を prepend**
- 本文（body）は **完全に preserve**、md 本文の Hard Rules / variant 別 base prompt / Scoring Axes 等を一切編集していない
- candidate PNG（既存 v001-v003 × threads = 3 file）は **touch していない**
- final asset paths（`assets/visuals/...`）/ patches / Sanity に影響なし
- contract を docs/65 として正式化、dashboard parser が後で読むときの **唯一の reference** にした

これで Phase 2A-1 を着手したとき、frontmatter parser の入力が確定する。逆に言うと、本 mini-batch をスキップして 2A-1 をやると、新規実装の parser が "frontmatter が無い" / "本文の prose を NLP parse する" の脆い経路に倒れる。

## なぜその設計にしたか

- **frontmatter で `null` を許容**: `candidateScores[v00N].score`, `recommendedCandidate`, `humanDecision` 等の "まだ決まっていない" 値を null で表現することで、`reviewStatus: candidate-review` のまま human review 未実施でも整合する。Phase 2B で UI 入力解禁時にこれらが埋まる。
- **`phase: phase-admin-2a-prep` field を入れた理由**: 本 frontmatter が「いつ最後に reset / format されたか」を 1 行で残す。Phase 2B で write 解禁したとき、古い phase の frontmatter を見たら "再 format が必要か" を判断できる。
- **`rubricAxes` を 7 個 enumerable に固定**: `diagramRichness / clarityReadability / japaneseLegibility / brandConsistency / platformFit / notTextOnly / publishSaveUsability`。[docs/64 §10](../64-admin-phase-2a-visual-review-wireframe.md#10-candidate-scoring-display) の表に揃え、camelCase に統一。axis 名のスペル揺れを将来排除。
- **`forbiddenPatterns` を共通 4 項目で固定**: `text-only-title-card` / `robot-brain-cliche` / `neon-ai-glassmorphism` / `unreadable-small-text`。brandProfile.negativeStyleList を補完する candidate 単位の禁止表現。両 asset で同じ。
- **`requiredVisualModules` を asset 別に変えた**: threads-support-diagram-v1 は社交媒体的（platformCards + summaryCopy）、note-inline-content-os-flow-v1 は教育媒体的（humanReviewCheckpoint + publishPackageBlock + principleBadge）。[docs/63 §7](../63-cross-platform-content-visual-generation-core.md#7-text-to-visual-module-mapper) の Mapper を引用したが、本 batch で「初の応用例」になった。
- **`layoutPatterns` も asset 別**: threads → centralHeroFourCards / hubAndSpoke / workflowPipeline、note inline → contentOSFlow / mediaDistributionMap / workflowPipeline / humanReviewFlow。これは [docs/63 §6](../63-cross-platform-content-visual-generation-core.md#6-layout-pattern-library-拡張) の 19 種 enum の「実運用 1 件目の参照」。
- **graceful degrade を contract に含めた理由**: parser が abort せず continue するルール（[docs/65 §5](../65-inbox-candidate-frontmatter-contract.md#5-graceful-degrade-ルール)）を **dashboard 実装より先に確定** した。新規 visual を生成する人が frontmatter を忘れても dashboard が壊れない不変条件。
- **future `visualCandidate` schema との 1-to-1 mapping を docs に固定**: [docs/65 §7](../65-inbox-candidate-frontmatter-contract.md#7-future-visualcandidate-schema-との-mapping)。schema 化を急がない選択肢を選んだが、後で Sanity 化したくなったときに既存 frontmatter を捨てない構造に。
- **Edit tool で `# Prompt Log — ...` 行の前に prepend**: ファイル全体を Write で再生成すると本文との diff が大きくなり、Edit を選ぶことで「frontmatter 追加のみ」が git diff に明確に出る。
- **Auth 設計（旧 docs/65 候補）は別 doc に繰り下げ**: 本 doc が docs/65 を取ったので、Auth migration design は docs/66 候補に移る。Phase 2C 着手前に独立 batch、で予定通り。

## Codex と Claude Code の役割分担

| 役割 | 担当 |
| --- | --- |
| 既存 4 inbox file への frontmatter 追加（4 件の Edit） | **Claude Code（本バッチ）** |
| docs/65 起草（11 sections、parser contract） | Claude Code |
| docs/devlog/0112 起草 | Claude Code |
| docs/handoff/0123 起草 + latest.md ミラー | Claude Code |
| YAML 妥当性 sanity check | Claude Code（python3 yaml で parse 確認、§Validation で実行） |
| dashboard parser 実装（`dashboard/src/lib/frontmatter.ts` + `inboxReader.ts`） | **将来バッチ（Phase 2A-1）** |
| schema 化 / Sanity active 化 | **将来バッチ（Phase 2C 着手判断後）** |

Codex は本 batch で起動していない。画像生成 0、CLI 投入 0。

## API なしで済ませた理由

- 4 file の Edit + 3 doc 新規のみ → API 連携追加 0
- candidate PNG / final assets / patches / Sanity 触っていない
- Codex / OpenAI / Sanity write の SDK 呼び出し 0
- 既存 Sanity read token / ChatGPT OAuth はそのまま、新規認証情報追加 0

## このバッチで作ったもの / 変更したもの

### Modified — `assets/inbox/generated/building-hitori-media-os/`

- `threads-support-diagram-v1/prompt.md`（frontmatter prepend、本文 preserve）
- `threads-support-diagram-v1/review.md`（同上）
- `note-inline-content-os-flow-v1/prompt.md`（同上）
- `note-inline-content-os-flow-v1/review.md`（同上）

### Added — `docs/`

- `docs/65-inbox-candidate-frontmatter-contract.md`（11 sections、parser contract）
- `docs/devlog/0112-inbox-candidate-frontmatter.md`（本ファイル）
- `docs/handoff/0123-inbox-candidate-frontmatter.md`

### Modified — `docs/`

- `docs/handoff/latest.md`（本 0123 のミラー）

### Confirmed unchanged

- candidate PNG: `threads-support-diagram-v1/v001.png` / `v002.png` / `v003.png` （3 件、byte size 不変、§Validation で confirm）
- `note-inline-content-os-flow-v1/` の PNG: 0 件のまま（未生成、本 batch では何も生成していない）
- `schemas/` 全件
- `schemas/index.ts` / `sanity.config.ts` / `structure/index.ts`
- `dashboard/src/` 全件（page route / api route / lib / components / proxy.ts / featureFlags.ts）
- `dashboard/package.json` / `package-lock.json`
- root `package.json` / `package-lock.json`
- `tools/visual-register/` / `tools/publish-package-builder/` / `tools/local-check.mjs` / `tools/asset-thumb/` 等
- `assets/visuals/` （final asset paths）
- `patches/visual-assets/`
- `seed/` / `outputs/` / `publish-packages/` / `private/`
- Sanity dataset（**書き込みゼロ**）
- Vercel project / DNS / production env vars
- production deployment（**未触**）
- `dashboard/public/activity-snapshot.json`

## frontmatter 適用後の sanity 概要

| ファイル | 行数（before → after） | 追加 frontmatter 行数 | YAML 妥当性 |
| --- | --- | --- | --- |
| threads-support-diagram-v1/prompt.md | (元 7165 bytes) | +33 行 | ✓ |
| threads-support-diagram-v1/review.md | (元 1495 bytes) | +29 行 | ✓ |
| note-inline-content-os-flow-v1/prompt.md | (元 7477 bytes) | +34 行 | ✓ |
| note-inline-content-os-flow-v1/review.md | (元 1511 bytes) | +29 行 | ✓ |

実 byte 数は handoff §10 の validation 表で記録。

## Phase 2A-1 着手準備

本 mini-batch で **dashboard parser に渡す入力データ形** が確定したので、次の Phase 2A-1 implementation batch では:

1. `dashboard/src/lib/frontmatter.ts` を実装（minimal YAML splitter）
2. `dashboard/src/lib/inboxReader.ts` を実装（frontmatter + body 分離 + 型安全に CandidateMeta を組み立てる）
3. 4 dev-only GET API（`/api/visual-review/inbox` 他）を実装
4. 8 component（VisualAssetHeader, CandidateGrid, …）を実装
5. 2 page route（`/visual-assets/[assetId]`, `/.../candidates`）を実装

…の順で着手可能。本 mini-batch の出力（4 file の frontmatter）が 1 / 2 のテスト fixture としても使える。

## 発信ネタになりそうな切り口

1. **「prerequisite mini-batch を独立 PR に切る」**: dashboard 実装の前段で、入力データ形を確定させる小バッチを 1 つ挟む。実装と契約を **同じ commit に混ぜない** ことで diff が読みやすくなる。
2. **「frontmatter で null を許容する設計」**: "まだ決まっていない" を `null` で表現することで、未完了の状態でも contract に整合する。Phase 2B で UI 入力解禁時に自然に埋まる。
3. **「graceful degrade ルールを parser より先に決める」**: dashboard 実装の前に「壊れた frontmatter にどう振る舞うか」を docs に固定。後付けで決めると、abort/continue/warning の混乱が出る。
4. **「19 layout pattern × 25 visual module の実運用 1 件目」**: docs/63 で設計した layout pattern enum と Text-to-Visual Module Mapper を、実 file の frontmatter で初めて使った。設計が机上で終わらないことの可視化。
5. **「contract を docs に書いてから実装する」**: dashboard parser を書く前に docs/65 で input contract を決め切る。実装は contract に従うだけ、というプロセスの分離。

## Safety Verified

- direct Sanity write を含むコード変更: **0 件**
- paid LLM / image API client 追加: **0 件**
- `SANITY_WRITE_TOKEN` / `writeToken` grep: 0 hits（docs 内の rule 引用のみ）
- 環境変数変更 / Vercel UI 操作: **0 件**
- 画像生成 / Codex CLI 起動: **0 件**
- schema 変更 / activate / proposed/ 追加: **0 件**
- assets/visuals / patches / Sanity / publish-packages: **不変**
- candidate PNG: **不変**（byte size 確認は handoff §10）
- React component / API route / page route 追加: **0 件**
- 既存 production dashboard (`app.hitorimedia.com`) の挙動: **不変**
- Visual Register (`tools/visual-register/`) の挙動: **不変**
- root `npm run local:check`: 後段 handoff §10 で実行・結果記録
- root `npm run build`（Sanity Studio）: 後段 handoff §10 で実行・結果記録
- `cd dashboard && npm run build`: 後段 handoff §10 で実行・結果記録
- YAML validity（python3 yaml.safe_load）: 後段 handoff §10 で実行・結果記録
