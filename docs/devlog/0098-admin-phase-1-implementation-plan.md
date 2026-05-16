# Devlog 0098 — Admin Phase 1 Implementation Plan (design only)

Date: 2026-05-14
Status: **design-only**, no Next.js scaffold, no dependencies added

## 今日の判断

[batch 0097](0097-insert-campaign-generation-seeds.md) で Phase Admin 0 → 1 trigger 4 条件すべて達成。本バッチでは **scaffold バッチに入る前に 1 doc を書ききって**、最初に建てる画面 / 環境変数 / 画面別 GROQ / component 計画 / batch 分割を確定した。

Next.js は本バッチでは入れない。`docs/59` を「Batch A の入力仕様書」として位置付け、次のバッチで実際に scaffold する。

## なぜその設計にしたか

- **画面を 1 つに絞る**: Campaign Detail / Dashboard Home / Campaigns list のいずれかを「最初に建てる画面」として 1 つだけ選ぶ。複数同時着手すると component 設計と GROQ 設計が混ざる。
- **Campaign Detail を推奨**: building-hitori-media-os 1 件で 1 画面が render できる、boss が daily で見る画面、8 component のうち 6 個を exercise、GROQ の複雑度が中間。
- **GROQ を design 段階で書ききる**: string ID dereference（`*[_id == ^.X][0]`）は Sanity reference の `->` と書き方が違う。実装段階で試行錯誤すると無駄が増える。
- **Auth / write / generation / posting の永続 deferred を再確認**: 本 doc を読めば「何をやらないか」が即決まる。

## Codex と Claude Code の役割分担（再確認）

| 役割 | 担当 |
| --- | --- |
| Phase Admin 1 design doc | **Claude Code（本バッチ）** |
| Batch A scaffold（`npx create-next-app` 等） | 次バッチ + 人間レビュー |
| dashboard 内コード | 将来 Claude Code（read-only のみ） |
| Sanity Studio 操作 | 人間 |
| Visual Register / 公開判断 | 人間 |

## API なしで済ませた理由（再確認）

- design doc のみ。Next.js / Tailwind / `@sanity/client` の依存追加なし。
- env vars 設計に paid API key を含めない（明文化）。
- `npx sanity` 系の自動実行 0 回。
- 画像生成 0 件。

## このバッチで作ったもの

| ファイル | 種別 |
| --- | --- |
| `docs/59-admin-phase-1-implementation-plan.md` | design doc（12 節、Batch A〜D の分割、GROQ 7 件） |
| `docs/devlog/0098-admin-phase-1-implementation-plan.md` | 本ファイル |
| `docs/handoff/0109-admin-phase-1-implementation-plan.md` | （次に書く） |
| `docs/handoff/latest.md` | 0109 にミラー |

`schemas/` / `tools/` / `sanity.config.ts` / `structure/index.ts` / `package.json` / `package-lock.json` / 既存 outputs / publish-packages / `assets/visuals/` / `patches/` / `private/` / ai-blog-db 関連 すべて **不変**。

## 連番について

- devlog: 0097 → **0098**
- handoff: 0108 → **0109**
- docs: 58 → **59**

## 発信ネタになりそうな切り口

1. **「Phase Admin 0 → 1 trigger 4 条件を満たすのに 13 batch かかった」**: 0085〜0097。設計だけで 13 段の判断を貯められたのは、何でも作れる前に「やらない」と「順序」を明示したから。
2. **「最初に建てる画面を Campaign Detail にする判断」**: 全 listing 系から始めない理由。building-hitori-media-os 1 件で render できる、component を最大限 exercise できる。
3. **「string ID dereference という Sanity の影パターン」**: `requiredRecords[].recordId` / `promptTemplateId` / `visualAssetPlanId` を Sanity reference にせず string にした選択の trade-off。GROQ で `*[_id == ^.X][0]` で join。
4. **「scaffold を 4 batch に分ける」**: Batch A〜D に分割。一気に書かず、1 画面 → 多画面 → 補助 → deploy の順。
5. **「Auth / write / posting の永続 deferred」**: dashboard を作る = 自動投稿に向かう、と早合点しないための docs design。

## Safety Verified

- `schemas/index.ts` 不変
- `sanity.config.ts` / `structure/index.ts` 不変
- `tools/` / `package.json` / `package-lock.json` 不変
- `npm run local:check`: ok: true（17 green / 0 fail）
- `npm run build`: 成功
- direct Sanity write の grep: 0 hits（不変）
- paid API integration の grep: 0 hits（不変）
- Next.js 依存追加: 0 件
- `assets/visuals/` / `patches/` / `assets/inbox/`: 不変
- ai-blog-db 関連: 不変
- DNS / hosting: 触れていない
