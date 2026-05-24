# Phase 2B-1 reactionNotes write detail spec

日付: 2026-05-20

## 背景

handoff/0175 (= devlog 0164) で Phase 2B 親 spec の §0.5 に boss decision (Q-1 / Q-2 / Q-7) を確定済。Q-7 で「Phase 2B-1 = W3 reactionNotes editing」が決まったので、次の前進は **W3 単独の detail spec を docs-only で起こす** こと。Phase 2B 親 spec はあくまで「どの write を、どの順で」の航海図、Phase 2B-1 spec は「W3 を実装するためのフィールド単位の設計図」に該当する。

実装はまだ走らせない。boss が spec を読んで残り open question (Q-6 undo / Q-8 conflict / Q-10 devlog) に judgement を付けるまでは、Sanity 書き込みコードは 1 行も書かない。

## 決定・変更

### 新規 (1)

- `docs/specs/phase-2b-1-reaction-notes.md` — 15 セクションの detail spec

### 主要セクション

1. Inherited confirmed decisions (Q-1 / Q-2 / Q-7 を spec 内で再宣言)
2. Goal and scope (in scope / out of scope)
3. Current UI audit (`ReactionNotesCard` 92 行 + `PendingMonitoringCard` 80 行 + 共通 aggregation)
4. Data model (`UpdateReactionNotesInput` / `UpdateReactionNotesResult` の TypeScript shape)
5. UI design (8 state: read / edit / save / dirty / empty / disabled / loading / error / success)
6. Server action design (`updateReactionNotes(input)` の 9 step flow)
7. Safety model (4 defense layers)
8. **Q-6 undo proposal** (in-memory, 10 秒 toast, current session のみ)
9. **Q-8 conflict proposal** (`_rev` mismatch → 「更新」 button → `router.refresh()`)
10. **Q-10 devlog proposal** (no auto devlog generation、server `console.log` のみ)
11. Environment variables (`ENABLE_WRITE_ACTIONS` + `SANITY_WRITE_TOKEN`)
12. Error mapping (7 error kinds → UI message + recovery hint)
13. Test plan (manual / negative / build / conflict simulation)
14. Implementation batch proposal (3 new + 6 updated files、acceptance criteria 10 件)
15. Out of scope / Post-spec next step

### Open question への提案 (boss confirmation 待ち)

- **Q-6 (undo)**: 「in-memory previous value + 10 秒 toast undo」を推奨。Sanity revision history は読まない。理由: implementation コストが小さい、UX として「直近 1 回」を救済できれば 95% 救える、永続 undo log は Phase 2B-3 以降。
- **Q-8 (conflict)**: 「楽観的 `_rev` mismatch → 簡易エラー + reload prompt」を推奨。3-way merge はやらない。理由: 単一 string field の merge は人間判断が必要、自動 merge の方が事故が多い。
- **Q-10 (devlog)**: 「auto-devlog 生成なし、server `console.log` のみ」を推奨。devlog は manual で書く文化を維持。理由: 自動生成 devlog は粒度が合わず読まれない、reactionNotes 編集ごとに devlog が増えると noise になる。

## 理由

### なぜ「W3 単独 spec」を起こすか

親 spec (`phase-2b-write-actions.md`) は W1〜W8 の航海図で、フィールド単位の design 決定までは含めていない。W3 を実装するためには:

- どの client component に edit UI を出すか
- prop の thread-through (現状 row interface に `_id` / `_key` が無い)
- server action の引数と戻り値の shape
- enableWriteActions が off のときの UI fallback
- _rev mismatch の扱い
- undo の扱い

を確定する必要がある。これを implementation batch の最中に決めると blast radius が大きくなるので、spec を先に切る。

### なぜ Q-6 / Q-8 / Q-10 で「提案」を spec に書いたか

boss instruction は「invent boss decisions しない」、しかし spec に open question を 7 件並べたまま implementation に向かうと判断が滞る。そこで spec 内で「Claude 推奨案」を section 8 / 9 / 10 として明示的に書き、boss が「これで OK」「これは違う」と review できる形にした。boss 判断が下りるまで implementation には進まない。

### docs-only にした理由

`enableWriteActions` flag の実装、`sanityWriteClient.ts` 作成、`ReactionNoteEditor` component 作成のいずれも spec 段階で boss confirmation を必要とする変更。先に書いて後で boss に「やっぱり違う」となると revert コストが高い。spec を先に boss-facing で固定する方が build-trust。

## 影響

- リポジトリ: `docs/specs/`, `docs/devlog/`, `docs/handoff/` のみ。`dashboard/src` / `tools/` / `schemas/` / `publish-package/` / `assets/visuals/` / `patches/` / `package.json` いずれも touch なし。
- ワークフロー: 次は boss が `phase-2b-1-reaction-notes.md` を読み、Q-6 / Q-8 / Q-10 に judgement を付ける。確定後に implementation batch (Phase 2B-1 実装) に進む。
- スキーマ: 不変。Sanity `manualPublishingStatus[]` の reactionNotes field は既存。
- プロダクト方針: Phase 2B は「local/dev のみ、production 永久 disabled、Sanity controlled write」の方針を維持。

## 次の一手

**Option A (推奨) — boss が spec を review + Q-6 / Q-8 / Q-10 を確定**

`docs/specs/phase-2b-1-reaction-notes.md` を読み、§8 (undo) / §9 (conflict) / §10 (devlog) の Claude 推奨案に対して judgement を付ける。確定すれば spec を最終版に update する microbatch を 1 つ挟み、その後 implementation batch に進む。

**Option B — Phase 2B-2 (W5 humanReviewGate state) の detail spec を先に並べる**

W3 / W5 の両 spec を並べてから一気に implement したい場合の選択肢。spec をまとめて読む方が boss にとって判断しやすければこちら。

**Option C — implementation batch を spec 確定前に試作 (非推奨)**

spec 未確定で動かすのは Phase 2B の安全原則に反する。boss 明示の指示が無い限り採用しない。

発信ネタ案: 「AI agent に Sanity write を実装させる前に、API なしの 5 ヶ月で固まった "spec を先に書く" 文化が機能するか」「Phase 2B の Safety 4-layer (env flag / write token / field allowlist / `_id`+`_key` 検証) を初心者向けに解説」「Codex vs Claude Code の役割分担 — review は Codex、spec と implementation は Claude」
