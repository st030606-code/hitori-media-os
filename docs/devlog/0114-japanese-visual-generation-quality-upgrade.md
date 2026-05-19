# Devlog 0114 — Japanese-First Editorial Visual Generation Quality Upgrade (design + prompt-system)

Date: 2026-05-18
Status: **design-only / prompt-system upgrade / 0 image generation / 0 schema change / 0 sanity write / 0 deploy / 0 candidate PNG modified**

## 今日の判断

`note-inline-content-os-flow-v1` の v001 / v002 / v003 を見直した結果、**構造的には正しいが editorial としては弱い** ことが明らかになった。本 batch は **画像を 1 枚も生成せず**、prompt-system を Japanese-first / editorial 品質へ引き上げる契約だけ書く。

最も重要な設計判断:

- **画像を生成する前に prompt-system を直す**: v004 を勢いで作ると v001-v003 と同じ "presentation-app simple" に再び倒れる。先に契約を固める。
- **Japanese-first を明文化**: 既存生成は「ヘッドラインだけ Japanese、本体は英語ラベル」の不均衡。読者は note 記事を読みに来るので **本体ラベルも Japanese 主、English 補助**。`Content Idea → 発信のタネ` 等の term replacement table を canonical で固定。
- **Visual richness 7 必須**: headline / subhead / 3+ visual modules / 3+ icons / connectors / highlight badge / reader outcome box。これを 1 個でも欠けると editorial に到達しない、という最低ライン。
- **Pre-generation Visual Rough step を必須化**: image_gen を呼ぶ前に rough を 1 度書き、7 項目 self-check を通す。これにより「とりあえず生成→ボックスと線」のループを断つ。
- **layout pattern を preferred / avoid で明示**: hub-and-spoke / raw node graph / developer architecture / pure UI mockup を avoid に。Before-After / Editorial explainer / Dashboard workflow / Pipeline with checkpoints / 4-step transformation / Media distribution map / Human review journey / Checklist infographic / Problem-to-system の 9 種を preferred に。
- **Japanese Editorial Diagram Prompt Block v1 を再利用骨格として固定**: 任意 asset の prompt は本 block を冒頭に貼って、asset-specific 詳細を続ける形に。これで X / Threads / note / Substack / YouTube / Shorts / Instagram のすべてに同じ品質契約を当てられる。
- **v004 用 Visual Rough を完了させた**: 「Before / After + Pipeline」 layout で「毎回ゼロから書く苦しさ」を左に、「発信のタネ → AI 下書き → 人間が整える → 図解を選ぶ → 公開用パッケージ」 pipeline を右に。種 (seed) icon が育って公開用パッケージ (fruit) になる transformation 比喩。日本語ラベル 13、英語ラベル 1（brand mark のみ）、icon 8 種、reader outcome box「発信作業が、毎回の頑張りから仕組みに変わる。」。7/7 self-check pass。
- **既存 v001 / v002 / v003 を消さない**: PNG と prompt.md の variant 節は historical record として保存。**「失敗しかけ」も build-in-public の素材**。dashboard の candidate review は今後も 4 candidates まで増えて並ぶ（v001-v004）。
- **note-inline 以外の asset への適用は別 batch**: 本 batch は note-inline 1 件の revised plan のみ。X hook / Threads main / Substack header 等への展開は次バッチ以降。

## なぜその設計にしたか

- **生成を先に止めた理由**: 同じ prompt-system で v004 を作っても v003 と同じ品質帯に倒れる。先に契約を新しくしないと無限に "正しいが弱い" を繰り返す。
- **Japanese-first にした理由**: dashboard で実候補を見比べたとき、英語ラベル本体は「翻訳 1 段挟む」ので読者の手が止まる。note 記事の本文 inline 図として **手を止めずに読み切れる** ことを最低条件にした。
- **term replacement を表で固定した理由**: 同じ概念に 2-3 種類の翻訳がブレるのを防ぐ。`Content Idea` を「コンテンツの核」「アイデア」「タネ」と揺らすと、dashboard 上で candidate を見比べるときに不要な比較軸が増える。**1 概念 = 1 Japanese label = 1 補助 English tag** の canonical を docs/66 §3.3 に置いた。
- **Visual Rough を必須化した理由**: 「とりあえず image_gen を回す」と "boxes and lines" に倒れる。rough を書く工程を挟むと、agent が **自分の生成計画を言語化** する必要があり、editorial に向かう。これは Hitori Media OS の「人間判断を残す」哲学とも整合（rough = 人間レビューの入口）。
- **7 項目 self-check を rough 段階に置いた理由**: image_gen は時間とトークンを消費する。**生成前**に reject 判定したほうが軽い。生成後の review は dashboard で別途あるので、self-check は「生成 GO/NOGO の門」として機能。
- **9 種の preferred layout を docs/66 §6.1 で明示した理由**: 既存 docs/63 §6 の 19 種 layout から、editorial 品質に直結する 9 種を picking。残り 10 種を排除したわけではなく、「default はこの 9 種から」「他は意図的に選んだときだけ」のルール化。
- **Prompt Block を asset-agnostic にした理由**: note-inline 用に上書きするのではなく、X main / Threads reply 等にもそのまま貼れる形に。9 platform で共通契約を持つ、というのが [docs/63](../63-cross-platform-content-visual-generation-core.md) cross-platform core の思想と一致。
- **prompt.md を **append のみ** にした理由**: 既存 v001 / v002 / v003 の variant 節は historical record。**消すと過去の判断が読めなくなる**。append で「v004 から新契約」と歴史を残す。dashboard も 4 candidates を並べて見比べられる。
- **画像を生成しない判断**: ご指示通り。本 batch は contract を docs に固定するだけ。次の human GO 後の generation batch で v004 を出す。
- **Auth 設計を引き続き別 doc に保留**: 本 doc が docs/66 を取った。Auth Migration Design は docs/67 候補に繰り下げ、Phase 2C 着手前に独立 batch。

## Codex と Claude Code の役割分担

| 役割 | 担当 |
| --- | --- |
| 現候補 (v001/v002/v003) の critique | **Claude Code（本バッチ）** |
| Japanese-first rules + term replacement table | Claude Code |
| Visual richness requirements 7 必須 + forbidden patterns | Claude Code |
| Pre-generation Visual Rough format + 7 項目 self-check | Claude Code |
| Layout pattern preferred / avoid 表 | Claude Code |
| Japanese Editorial Diagram Prompt Block v1 起草 | Claude Code |
| v004 用 Visual Rough 充足 + self-check 採点 | Claude Code |
| note-inline prompt.md への append section | Claude Code |
| docs/devlog/0114 + handoff/0125 起草 + latest.md ミラー | Claude Code |
| docs/handoff/0125 commit + push | **将来バッチ / 人間判断** |
| v004 actual image generation | **将来バッチ（人間 GO 後）** |
| 他 asset への適用 | **将来バッチ** |
| Auth migration design | **将来バッチ（docs/67 候補）** |
| Codex CLI 起動 / 画像生成 | **0**（本 batch では起動していない） |

## API なしで済ませた理由

- 設計 + 1 file append のみ → API 連携追加 0
- Codex / OpenAI / Sanity write の呼び出し 0
- 新規 npm package 追加 0
- paid LLM / image API integration 追加 0
- 既存 Sanity read token / ChatGPT OAuth / GitHub OAuth はそのまま

## このバッチで作ったもの / 変更したもの

### Added — `docs/`

- `docs/66-japanese-visual-generation-quality-upgrade.md`（13 sections、prompt-system upgrade 本体）
- `docs/devlog/0114-japanese-visual-generation-quality-upgrade.md`（本ファイル）
- `docs/handoff/0125-japanese-visual-generation-quality-upgrade.md`

### Modified — `docs/`

- `docs/handoff/latest.md`（本 0125 のミラー）

### Modified — `assets/inbox/generated/building-hitori-media-os/note-inline-content-os-flow-v1/`

- `prompt.md` — append `## Japanese Editorial Diagram Prompt Block v1` section + `## v004 — Japanese editorial v1 (planned, not yet generated)` section。YAML frontmatter + 既存 v001/v002/v003 variant 節は **完全保存**

### Confirmed unchanged

- candidate PNG bytes:
  - threads-support-diagram-v1/v001 (1,117,386)
  - threads-support-diagram-v1/v002 (1,170,769)
  - threads-support-diagram-v1/v003 (1,155,943)
  - note-inline-content-os-flow-v1/v001 (1,019,508)
  - note-inline-content-os-flow-v1/v002 (1,234,530)
  - note-inline-content-os-flow-v1/v003 (1,078,958)
- `assets/inbox/generated/building-hitori-media-os/note-inline-content-os-flow-v1/review.md`（本 batch では非編集）
- `schemas/` 全件 / `sanity.config.ts` / `structure/index.ts`
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

## 新契約の要点

### Japanese-first 6 原則

1. 主言語 = 日本語、英語 = 補助のみ
2. 内部 system 用語を読者語彙に翻訳（table 引く）
3. 同概念は 1 Japanese label + 1 English tag に固定
4. 主要 label のフォントサイズ ≥ 英語 tag の 1.5 倍
5. reader outcome box（読者の変化）を必ず日本語で
6. headline / subhead / body ラベルすべて Japanese 優先

### Visual richness 7 必須

1. headline（日本語）
2. subhead / support line（日本語）
3. 3+ 種類 visual modules
4. 3+ icons / illustrations
5. connectors / arrows with meaning
6. highlight badge（principle）
7. reader outcome box（読者の変化）

### Forbidden 12 conditions（self-reject）

boxes-only / title-card-only / English-first / generic developer arch / plain flowchart / random decoration / robot-brain-AI cliche / neon-glass / unreadable tiny / face-avatar / recognizable logos / secrets-IDs

### Pre-generation Visual Rough（必須）

11 fields × 7-point self-check。image_gen を呼ぶ前に必ず通す。

### Preferred 9 layouts

Before / After、Editorial explainer、Dashboard workflow、Pipeline with checkpoints、4-step transformation、Media distribution map、Human review journey、Checklist infographic、Problem-to-system diagram

### Avoid 5 layouts

generic hub-and-spoke (default 使用)、raw node graph、developer architecture diagram、pure UI mockup、centered single-headline title card

## note-inline v004 計画（生成は別 batch）

| 項目 | 値 |
| --- | --- |
| variant id | `v004` |
| variant label | `japanese-editorial-v1` |
| theme | 「毎回ゼロから発信を作る」から「発信のタネが複数媒体へ育つ仕組み」へ |
| layout | Before / After + Pipeline |
| japanese labels | 13 件 |
| english labels | 1 件（Hitori Media OS brand mark） |
| icons / illustrations | 8 種 |
| reader outcome | 「発信作業が、毎回の頑張りから仕組みに変わる。」 |
| self-check | **7/7 pass** |
| 期待 dimensions | 1600 × 900 |
| 期待 file size | ~1.0-1.3 MB（v001-v003 と同帯） |
| 生成タイミング | **次の human GO 後の別 batch** |

## 発信ネタになりそうな切り口

1. **「画像生成より、画像生成の前段の prompt 設計を変える」**: 結果が出ない時、生成パラメータをいじるより、生成 instruction の品質契約を直すほうが効く。
2. **「Japanese-first の不均衡」**: 「ヘッドラインだけ Japanese、本体英語」というよくある AI 図解の落とし穴。日本人読者の認知負荷を 2 段にする失敗。
3. **「Visual richness 7 必須」**: 「box と矢印だけ」が editorial で失格になる線。icon 3、modules 3、reader outcome box が boundary。
4. **「Visual Rough を agent の自己約束として置く」**: image_gen の前に rough → self-check → GO/NOGO。これは「人間判断を残す」哲学を agent 工程に埋め込んだ形。
5. **「v001-v003 を消さずに v004 を作る」**: 「失敗しかけ」も build-in-public の素材として残す。dashboard の candidate review は historical 比較できる surface。
6. **「Editorial vs Presentation slide の境界」**: speaker 不在で単独で読める / icon / metaphor / reader outcome / 余白とリズム — これが editorial。逆は presentation slide。

## Safety Verified

- direct Sanity write を含むコード変更: **0 件**
- paid LLM / image API client 追加: **0 件**
- 環境変数変更 / Vercel UI 操作: **0 件**
- 画像生成 / Codex CLI 起動: **0 件**
- schema 変更 / activate / proposed sketch 追加: **0 件**
- assets/visuals / patches / Sanity / publish-packages: **不変**
- 候補 PNG 編集 / 削除 / 上書き: **0**（既存 6 件すべて byte-identical）
- React component / API route / page route 追加: **0**
- 既存 production dashboard (`app.hitorimedia.com`) の挙動: **不変**
- Visual Register (`tools/visual-register/`) の挙動: **不変**
- root `npm run local:check`: 後段 handoff §10 で実行・結果記録
- root `npm run build`（Sanity Studio）: 後段 handoff §10 で実行・結果記録
- `cd dashboard && npm run build`: 後段 handoff §10 で実行・結果記録
