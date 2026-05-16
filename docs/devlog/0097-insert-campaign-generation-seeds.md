# Devlog 0097 — Insert 4 Campaign Generation Seeds + Phase Admin 0 → 1 Trigger Achieved

Date: 2026-05-14
Status: **4-seeds-inserted / refs-resolved / phase-admin-trigger-fully-satisfied**

## 今日の判断

[batch 0096](0096-activate-campaign-generation-schemas.md) で activate した 4 schema に対して、対応する 4 seed を依存順に Sanity dataset へ投入。`npx sanity documents create` を 4 回（`--replace` なし）で完了、各投入後に GROQ で ref 解決を確認。**Phase Admin 0 → 1 trigger 4 条件すべて達成**、Next.js 着手の準備が整った。

依存順:

```
brandProfile → visualStyleProfile → promptTemplate → campaignPlan
```

## なぜその設計にしたか

- **依存順厳守**: weak ref / strong ref に関わらず、`brandProfile` を最初に投入することで、後続 3 件の `brandProfile` ref が即座に解決される。`visualStyleProfile` も `promptTemplate` から先に投入。最後の `campaignPlan` は 2 ref（`sourceContentIdea` strong + `brandProfile` weak）を持つので最後。
- **1 件ずつ投入 + GROQ で検証**: 4 件まとめて投入して失敗すると切り分けが困難。1 件ずつ insert → query で `_id` + 基本フィールド + ref 解決確認、を繰り返した。
- **前段で `contentIdea.building-hitori-media-os` の dataset 存在を確認**: campaignPlan の strong ref が失敗しないことを事前 GROQ で確認（`title: "AIで「ひとりメディア運営OS」を作っている裏側"`）。

## Codex と Claude Code の役割分担（再確認）

| 役割 | 担当 |
| --- | --- |
| seed 投入 (`npx sanity documents create`) | **Claude Code（本バッチ、人間 explicit 認可済）** |
| Studio UI 目視確認 | 人間（次のステップ） |
| Sanity write 自動化（コード経由） | 永続 deferred |

本バッチは **Claude Code が Sanity CLI を実行する** 例外運用。`npm run publish:package` と並んで「自分用 admin の段取り作業」という性格。auto-posting / paid API / direct write は依然永続 deferred。

## API なしで済ませた理由（再確認）

- `npx sanity documents create` は Sanity の dataset API を Sanity CLI 経由で呼ぶ。paid LLM / image API ではない。
- 既存 `OPENAI_API_KEY` を使用していない（Codex auth は ChatGPT OAuth のまま）。
- 画像生成 / auto-posting / sanity client コード追加 / seed JSON 編集 すべてなし。

## このバッチで作ったもの / 変更したもの

### Inserted (Sanity dataset)

| `_id` | `_type` | 補足 |
| --- | --- | --- |
| `brandProfile.hitori-media-os-default` | brandProfile | brandName: "Hitori Media OS"、status: draft |
| `visualStyleProfile.hitori-media-os.x-hook-image` | visualStyleProfile | brandProfile ref 解決済み、applicablePlatforms: x、defaultLayoutPattern: title-with-single-diagram |
| `promptTemplate.x-hook-image-diagram-rich-v1` | promptTemplate | brandProfile + visualStyleProfile 両 ref 解決、category: image-generation、automationLevel: semi-auto |
| `campaignPlan.building-hitori-media-os` | campaignPlan | sourceContentIdea + brandProfile 両 ref 解決、selectedPlatforms 4 件 / requiredVisualAssets 7 件 |

### Modified

- `docs/58-admin-dashboard-phase-plan.md` — trigger 4 条件すべて `[x]`、達成記述に変更
- `docs/devlog/0097-...md`（本ファイル）
- `docs/handoff/0108-...md`（次に書く）
- `docs/handoff/latest.md` — 0108 にミラー

### Confirmed unchanged

- `schemas/` 全件（active 16）
- `sanity.config.ts` / `structure/index.ts` / `tools/` / `package.json` / `package-lock.json`
- 既存 seed JSON 4 件（投入時に **編集していない**）
- 既存 outputs / publish-packages / private / ai-blog-db 関連
- `assets/visuals/` / `patches/` / `assets/inbox/`
- 既存 active schemas の他 12 type の dataset（contentIdea / platformOutput / visualAssetPlan / etc は触っていない）

## Phase Admin 0 → 1 trigger 4 条件 — 最終

| 条件 | 状態 |
| --- | --- |
| 4 proposed schema activate | **[x] 完了**（batch 0096） |
| campaignPlan seed 投入 | **[x] 完了**（本バッチ） |
| Visual Register ≥ 2 production asset approve | **[x] 完了**（batch 0095） |
| publish package distribution が X / note / Substack で動く | **[x] 完了**（batch 0095） |

→ **Phase Admin 1 着手の準備完了**。次は Next.js scaffold の design / implementation バッチへ。

## 確認できた事実（GROQ から）

### `campaignPlan.building-hitori-media-os` の構造

- **sourceContentIdea**: `contentIdea.building-hitori-media-os`（"AIで「ひとりメディア運営OS」を作っている裏側"）
- **brandProfile**: `brandProfile.hitori-media-os-default`（"Hitori Media OS"）
- **campaignType**: `build-log`、**contentMode**: `building-in-public`
- **selectedPlatforms (4)**:
  - x（P1、hook-only）
  - threads（P2、summary）
  - note（P1、full-article）
  - substack（P1、full-article）
- **requiredVisualAssets (7)**:
  - note-hero-v1（done）
  - substack-header-v1（done）
  - x-hook-main-v1（**pending-review** — seed の凍結状態、実際は batch 0095 で done）
  - threads-support-diagram-v1（not-started）
  - note-inline-content-os-flow-v1（not-started）
  - note-inline-human-judgment-v1（not-started）
  - substack-inline-reader-system-v1（not-started）
- **automationLevel**: `semi-auto`、**status**: `draft`

### 注意: x-hook-main-v1 state stale

seed `campaign-plan-building-hitori-media-os.json` は作成時点で x-hook-main-v1 を `pending-review` として書いた。その後 batch 0095 で実際は approve & register + Sanity 反映 + publish 配布が完了して **`done`** になったが、seed は凍結状態のまま投入。本バッチでは seed を編集しないため、dataset 上も `pending-review` のまま。

人間が Studio で `campaignPlan.building-hitori-media-os.requiredVisualAssets[2].state` を `done` に更新する判断は別途。あるいは将来の `tools/campaign-plan/sync-state.mjs`（仮）で自動更新する設計余地。

## 連番について

- devlog: 0096 → **0097**
- handoff: 0107 → **0108**

## 発信ネタになりそうな切り口

1. **「seed の凍結状態と dataset の生きた state を分けて考える」**: seed は時間軸のスナップショット、dataset は現在状態。書き換え運用は Studio 経由。
2. **「依存順を守れば weak ref が即解決する」**: brandProfile → visualStyleProfile → promptTemplate → campaignPlan の順で投入すれば、`Reference unresolved` 警告ゼロ。
3. **「Phase Admin 0 → 1 trigger 4 条件を達成するのに要した batch 数」**: 0086（visualAssetPlan ingest）/ 0085〜0090（note-hero/x-hook 視覚生成）/ 0091〜0094（design）/ 0095（visual approve）/ 0096（schema activate）/ 0097（seed insert）。実質 4〜5 週間の積み上げ。
4. **「Claude Code に Sanity CLI を走らせる例外条件」**: 通常は禁止、本バッチで explicit 認可 + 4 件限定の理由を明文化することで、誤実行を防ぐ。

## Safety Verified

- direct Sanity write の grep（コード経由）: 0 hits
- paid LLM/image API client/SDK の repo 追加: 0 hits
- `seed --replace` 実行: 0 回
- `npx sanity dataset import` 実行: 0 回
- 画像生成: 0 件
- schema 変更: 0 件
- `npm run local:check`: ok: true（17 green / 0 fail、最終確認）
- `npm run build`: 成功
- 既存 active 16 schemas / Studio structure: 不変
- ai-blog-db 関連: 不変
- 既存 12 schema 種別の dataset record: 触っていない
