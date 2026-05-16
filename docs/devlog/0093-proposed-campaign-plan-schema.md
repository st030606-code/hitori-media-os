# Devlog 0093 — Proposed campaignPlan schema + building-hitori-media-os seed

Date: 2026-05-14
Status: **proposed-only**, not active in Studio

## 今日の判断

前バッチ（0092）で brandProfile / visualStyleProfile / promptTemplate の 3 proposed schema を起こした。本バッチでは **campaignPlan** を proposed として追加し、building-hitori-media-os の現状を 1 record の seed にまとめた。これにより、Campaign Generation Flow（[docs/48](../48-campaign-generation-flow.md)）の 13 段すべてを 1 record で観測できる骨格が揃った。

## なぜその設計にしたか

- **既存 active schemas を破壊しない**: contentIdea / platformOutput / substackPostPlan / substackNotesPlan / substackGrowthAction / visualAssetPlan / diagramPlan のいずれにも変更を加えない。新規 campaignPlan は additive のみ。
- **cross-type 参照を string ID で持つ**: requiredRecords / requiredVisualAssets / promptTemplateSelections は、参照する schema の種類が混在する（platformOutput / substackPostPlan / substackNotesPlan / substackGrowthAction / visualAssetPlan）。Sanity の `reference` 型で複数 schema を許可する場合 `to: [{type: 'a'}, {type: 'b'}, ...]` が膨らむ + 検証が緩くなる。**string ID にして整合は別 layer で検査**する方針にした。
- **humanReviewGates を明示**: 13 段フローのうち「人間判断 9 段」を gate として record 化。`state` を `pending-review` にした gate が現状ボトルネック、という view が自然に出る。
- **manualPublishingStatus を別フィールドにする**: 公開URL / 公開日時 / 反応メモを集約。auto-posting が将来追加されても、本フィールドは「最終的に publish された証跡」として残せる構造。

## Codex と Claude Code の役割分担（再確認）

| 役割 | 担当 |
| --- | --- |
| 設計 doc | Claude Code（[docs/48-55](../48-campaign-generation-flow.md)） |
| proposed schema 起草 | **Claude Code（本バッチ）** |
| seed JSON 起草 | **Claude Code（本バッチ）** |
| Studio 投入 / activate | 人間 |
| campaignPlan 起点の dashboard view | 将来（structure builder + GROQ） |

## API なしで済ませた理由（再確認）

- `npx sanity documents create` 等の Sanity CLI を実行していない。
- paid API SDK の repo 追加なし（package.json 不変）。
- 画像生成を本バッチで行っていない。

## このバッチで作ったもの

| ファイル | 種別 | 内容 |
| --- | --- | --- |
| `schemas/proposed/campaignPlan.ts` | proposed schema | 400+ 行、campaignType 7 enum / progressState 6 enum / selectedPlatforms object / 9 review gates 等 |
| `seed/campaign-plan-building-hitori-media-os.json` | local-only seed | X / Threads / note / Substack の 4 platform、現状を反映 |
| `docs/55-proposed-campaign-plan-schema.md` | design followup | dashboard 寄与 / activate trigger / next batch 推奨 |
| `docs/devlog/0093-...md` | 本ファイル | — |
| `docs/handoff/0104-...md` | (次に書く) | — |
| `docs/handoff/latest.md` | mirror | — |

`schemas/index.ts` / `sanity.config.ts` / `tools/` / `package.json` / 既存 active schemas / 既存 outputs / publish-packages / `assets/visuals/` / `patches/` / `private/` / ai-blog-db 関連 すべて **不変**。

## 連番について

- devlog: 0092 → **0093**
- handoff: 0103 → **0104**
- docs: 54 → **55**

## 発信ネタになりそうな切り口

1. **「13 段フローを 1 record に圧縮する」**: campaignPlan で人間判断 9 gate + 自動生成段階を 1 つの document として持つ。dashboard で「いま判断待ち」を一覧化できる構造。
2. **「cross-type 参照に reference 型ではなく string ID を使う判断」**: Sanity の reference は 1:1 schema 用に最適化されているので、5〜6 種の混在には string ID + 検証 layer 分離の方が運用しやすい。
3. **「auto-posting を long-term deferred と明文化する」**: campaignPlan に automationLevel + manualPublishingStatus を分離フィールドとして用意することで、「将来自動投稿になったときに何が変わるか」が schema レベルで明確。
4. **「dashboard を作る前に schema を固定する」**: admin dashboard を急いで作らず、まず record の形を確定する。フロントは GROQ + 既存 Studio で代替できる期間が長い。

## Safety Verified

- `schemas/index.ts` 不変（grep で `campaignPlan` 0 hits）
- `sanity.config.ts` 不変
- `npm run build`: 成功
- `npm run local:check`: ok: true（17 green）
- direct Sanity write の grep: 0 hits
- paid API integration の grep: 0 hits
- `assets/visuals/` / `patches/` / 既存 inbox: 不変
- candidate image 0 件追加
- ai-blog-db 関連: 不変
