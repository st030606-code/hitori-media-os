# Devlog 0092 — Proposed promptTemplate / brandProfile / visualStyleProfile schemas

Date: 2026-05-14
Status: **proposed-only**, not active in Studio。`schemas/index.ts` と `sanity.config.ts` 不変。

## 今日の判断

[`docs/47`](../47-prompt-template-system.md) から [`docs/50`](../50-visual-prompt-quality-system.md) で設計した Prompt Template System を、proposed schema 3 件と seed 3 件に「触れる形」へ落とした。**activate しない**ことを物理的に担保するため:

- `schemas/proposed/*.ts` に閉じる（`schemas/index.ts` から import しない）
- 各ファイル冒頭に `// PROPOSED SCHEMA — NOT ACTIVE IN STUDIO.` を明示
- seed は local-only（`npx sanity documents create` を実行しない）
- `sanity.config.ts` に登録しない

## なぜその設計にしたか

- 既存 `prompt` を破壊せず additive: 旧 `prompt` を delete しないため、過去資産（building-hitori-media-os の使用 prompt 群）に影響なし。
- 3 schema を **同時 activate 必須** にする依存関係: `promptTemplate → brandProfile/visualStyleProfile`, `visualStyleProfile → brandProfile`。proposed フェーズで「片方だけ activate して中途半端な状態」になるのを防ぐ。
- seed を 1 件ずつ作成: brandProfile/visualStyleProfile/promptTemplate それぞれ 1 件ずつの最小 example。3 件で「実例で動くか」を試せる。
- text-only title card 問題の **構造的封じ込め** を schema 段階で実装: `forbiddenPatterns` / `layoutPatterns` enum から exclude / `diagramNodesMin: 2` / `variationStrategy: 3-pattern-default` の4層。

## Codex と Claude Code の役割分担（再確認）

| 役割 | 担当 |
| --- | --- |
| 設計 doc | Claude Code（[docs/47-50](../47-prompt-template-system.md)） |
| proposed schema 起草 | **Claude Code（本バッチ）** |
| seed JSON 起草 | **Claude Code（本バッチ）** |
| Studio 投入 | 人間（決断するまで保留） |
| 画像 candidate 生成 | Codex `image_gen` (gpt-5.4) |
| Visual Register approve | 人間 |
| Sanity 反映 | 人間 |

## API なしで済ませた理由（再確認）

- `npx sanity documents create` 等の Sanity CLI を一切実行していない（grep で確認）。
- paid API SDK の repo 追加なし（package.json 不変）。
- `OPENAI_API_KEY` を使用していない。
- 画像生成を本バッチで行っていない（前バッチ 0090 で生成済みの v001.png は不変）。

## このバッチで作ったもの

| ファイル | 種別 | 行数（参考） |
| --- | --- | --- |
| `schemas/proposed/promptTemplate.ts` | proposed schema | 300+ |
| `schemas/proposed/brandProfile.ts` | proposed schema | 260+ |
| `schemas/proposed/visualStyleProfile.ts` | proposed schema | 280+ |
| `seed/brand-profile-hitori-media-os-default.json` | local-only seed | 100+ |
| `seed/visual-style-profile-hitori-media-os-x-hook-image.json` | local-only seed | 120+ |
| `seed/prompt-template-x-hook-image-diagram-rich-v1.json` | local-only seed | 200+ |
| `docs/54-proposed-prompt-template-schema.md` | design followup | — |
| `docs/devlog/0092-...md` | 本ファイル | — |
| `docs/handoff/0103-...md` | （次に書く） | — |
| `docs/handoff/latest.md` | mirror | — |

`schemas/index.ts` / `sanity.config.ts` / `tools/` / `package.json` / `package-lock.json` / 既存 active schemas / 既存 outputs / publish-packages / `assets/visuals/` / `patches/` / `private/` / ai-blog-db 関連 すべて **不変**。

## 連番について

- devlog: 0091 → **0092**
- handoff: 0102 → **0103**
- docs: 50 → **54**（51〜53 は今回使わず、将来の design doc 用に予約）

## 発信ネタになりそうな切り口

1. **「proposed schema を `.ts` で書くと build に乗るリスク」**: schemas/index.ts から import しなければ build は通る、という前提を毎回確認するパターン。
2. **「3 schema を同時 activate しないと weak ref が解決しない」**: スキーマ間 ref を持つ proposed schema 群の運用 tips。
3. **「text-only title card を schema で封じる」**: prompt instructions だけで「やらないで」と言うのは弱い。layoutPatterns enum から centered-title-only を **含めない** ことで構造的に防ぐ。
4. **「seed JSON を local-only にする」**: Sanity CLI を Claude Code から走らせない方針を貫くための運用パターン。
5. **「promptTemplate と campaign を分離する設計」**: template は brand-level、instance（実際の生成）は campaign-level。Hitori Media OS では1〜2回しか使わない template でも、再利用 unit として shape させておく。

## Safety Verified

- `schemas/index.ts` 不変（grep で `import promptTemplate|brandProfile|visualStyleProfile` 0 hits）
- `sanity.config.ts` 不変
- `npm run build`: 成功（proposed schemas は build pipeline に乗らない）
- `npm run local:check`: ok: true
- direct Sanity write の grep: 0 hits（不変）
- paid API integration の grep: 0 hits（不変）
- `assets/visuals/` / `patches/` / 既存 inbox: 不変
- candidate image 0 件追加（前バッチ生成の v001.png のみ存在）
- ai-blog-db 関連: 不変
