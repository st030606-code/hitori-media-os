# Devlog 0096 — Activate 4 Campaign Generation Schemas (brandProfile / visualStyleProfile / promptTemplate / campaignPlan)

Date: 2026-05-14
Status: **schemas-activated / structure-updated / build-green / seed-not-yet-inserted / studio-render-pending-human-confirm**

## 今日の判断

[batch 0093](0093-proposed-campaign-plan-schema.md) までに proposed として書いた 4 schema を、依存順に activate した。各 activate 後 `npm run build` を回し、必ず成功してから次に進む rolling activation。`schemas/proposed/_design-*.md` は **残す**（設計史として）。Sanity への seed 投入は本バッチ scope 外、別バッチで実施。

依存順:

```
brandProfile → visualStyleProfile → promptTemplate → campaignPlan
```

## なぜその設計にしたか

- **rolling activation**: 4 件まとめて activate して build が失敗すると、どの schema が壊しているか分からない。1 件ずつ build → green → 次、という cadence で安全に。
- **`.ts` を `schemas/proposed/` から `schemas/` に move（copy + rm）**: 重複定義を避けるため、proposed 側を残さない。`_design-*.md` は別ファイルなので残る（design history）。
- **`structure/index.ts` の `allDocumentTypes` も更新**: Sanity Studio の custom structure は明示リストに依存している。新規 type を入れないと "By Type (flat)" に表示されない。Phase Admin 0 → 1 trigger の「Studio 表示確認」を満たすために必須。
- **`sanity.config.ts` は変更しない**: schema は `schemas/index.ts` から取り込まれるので、`sanity.config.ts` 側の手当ては不要。

## Codex と Claude Code の役割分担（再確認）

| 役割 | 担当 |
| --- | --- |
| schema activate / index 更新 / structure 更新 | **Claude Code（本バッチ）** |
| `npm run dev` で Studio 起動 + 目視確認 | **人間**（次のステップ） |
| seed 投入（`npx sanity documents create`） | **別バッチ + 人間** |
| 既存 active schemas の操作 | n/a（不変） |

## API なしで済ませた理由（再確認）

- `npx sanity documents create` を実行していない（seed insertion は別バッチ）。
- Sanity への直接書き込みなし。
- paid API integration / OpenAI / Anthropic client なし。
- 画像生成なし。

## このバッチで作ったもの / 変更したもの

### Activated (moved from schemas/proposed/ → schemas/)

| 旧 path | 新 path | top comment 更新 |
| --- | --- | --- |
| `schemas/proposed/brandProfile.ts` | `schemas/brandProfile.ts` | "Active schema (activated 2026-05-14, batch 0096)" |
| `schemas/proposed/visualStyleProfile.ts` | `schemas/visualStyleProfile.ts` | "Active schema..." |
| `schemas/proposed/promptTemplate.ts` | `schemas/promptTemplate.ts` | "Active schema..." |
| `schemas/proposed/campaignPlan.ts` | `schemas/campaignPlan.ts` | "Active schema..." |

各ファイルの `// PROPOSED SCHEMA — NOT ACTIVE IN STUDIO.` 行を「Active schema (activated 2026-05-14, batch 0096)」に書き換え、`_design-*.md` への参照を `(design sketch, retained for reference)` として保持。

### Modified

- `schemas/index.ts` — 4 件 import 追加 + `schemaTypes` array に4件 push（順序: 既存 12 件 → brandProfile → visualStyleProfile → promptTemplate → campaignPlan）
- `structure/index.ts` — `allDocumentTypes` array に4件追加（"Brand Profiles" / "Visual Style Profiles" / "Prompt Templates" / "Campaign Plans"）
- `docs/devlog/0096-...md`（本ファイル）
- `docs/handoff/0107-...md`（次に書く）
- `docs/handoff/latest.md` — 0107 にミラー

### Build results (rolling)

| Step | After | Result |
| --- | --- | --- |
| 1 | brandProfile activated | ✓ 7,461 ms |
| 2 | visualStyleProfile activated | ✓ 7,365 ms |
| 3 | promptTemplate activated | ✓ 7,195 ms |
| 4 | campaignPlan activated | ✓ 7,525 ms |
| 5 | structure/index.ts updated | ✓ 7,352 ms |

### Confirmed unchanged

- `sanity.config.ts`
- `tools/` / `package.json` / `package-lock.json`
- 既存 active schemas（contentIdea / prompt / platformOutput / diagramPlan / visualAssetPlan / workflow / publishedOutput / tool / substackPublicationStrategy / substackPostPlan / substackNotesPlan / substackGrowthAction、12 件）
- `schemas/proposed/` には `_design-*.md`（4 件） + `substackPaidReadiness.ts` + `substackSubscriberMilestone.ts` + `README.md` のみ残る（活性化候補としての proposed 2 件は変更なし）
- 既存 seed / outputs / publish-packages / private / ai-blog-db 関連
- `assets/visuals/` / `patches/` / `assets/inbox/`
- 画像 / DNS / hosting / Auth：いずれも未変更

### Sanity dataset

- `npx sanity documents create` を **一度も実行していない**
- 4 新規 type は active だが、現状 dataset に**該当 record は 0 件**
- seed JSON ファイル 4 件（[brand-profile](../seed/brand-profile-hitori-media-os-default.json) / [visual-style-profile](../seed/visual-style-profile-hitori-media-os-x-hook-image.json) / [prompt-template](../seed/prompt-template-x-hook-image-diagram-rich-v1.json) / [campaign-plan](../seed/campaign-plan-building-hitori-media-os.json)）は引き続き **local-only**
- 投入は別バッチで人間判断、依存順厳守

## Phase Admin 0 → 1 trigger 4 条件 — 最新

| 条件 | 状態 |
| --- | --- |
| 4 proposed schema activate | **[x] 完了**（本バッチ、build 5/5 green） ※ Studio 目視確認は人間アクション待ち |
| campaignPlan seed 投入 | **[ ] 未**（JSON 作成済、Sanity dataset には未投入） |
| Visual Register ≥ 2 production asset approve | **[x] 完了**（note-hero-v1 + x-hook-main-v1） |
| publish package distribution が X / note / Substack で動く | **[x] 完了**（hero + x-hook-main-v1） |

→ 残るは **seed 投入の 1 バッチ**で Phase Admin 1 着手の trigger 4 条件すべて達成可能。

## 連番について

- devlog: 0095 → **0096**
- handoff: 0106 → **0107**

## 発信ネタになりそうな切り口

1. **「rolling activation」**: 4 schema を 1 件ずつ build 確認しながら入れる。失敗の切り分けが容易。
2. **「proposed と active の境界を `.ts` ファイル配置で表現」**: `schemas/proposed/` を活性候補置き場として使う運用パターン。Sanity の register リストに入らない限り Studio に出ないので安全。
3. **「`_design-*.md` を残す」**: 設計史を `.md` で残すと、後から「なぜこの shape にしたか」を辿れる。`.ts` だけだと意図が消える。
4. **「structure/index.ts は schemas/index.ts と一緒に更新する」**: Sanity の custom structure は明示リスト依存。新規 type の register を片方だけだと UX が壊れる事例。
5. **「seed 投入と schema activate を別バッチにする」**: schema 変更と data 変更を同時にしない、Phase Admin 0 期間の運用原則。

## Safety Verified

- `npm run local:check`: ok: true（17 green / 0 fail）— 最終確認時
- `npm run build`: 5 回連続 green（各 step / 最終）
- direct Sanity write の grep: 0 hits（不変）
- paid API integration の grep: 0 hits（不変）
- `npx sanity documents create` 実行: 0 回
- `seed --replace` 実行: 0 回
- 画像生成: 0 件
- `assets/visuals/` / `patches/` / `assets/inbox/`: 変更なし
- `sanity.config.ts`: 不変
- ai-blog-db 関連: 不変
