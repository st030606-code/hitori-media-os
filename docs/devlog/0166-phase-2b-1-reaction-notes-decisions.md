# Phase 2B-1 reactionNotes spec — boss decisions confirmed

日付: 2026-05-20

## 背景

handoff/0176 (devlog 0165) で起こした Phase 2B-1 reactionNotes detail spec に対し、§7 / §8 / §9 で 3 つの open question (Q-6 / Q-8 / Q-10) を「Claude 推奨案」として明示していた。boss が本日 3 件すべてに確定回答を出した → spec を「推奨」から「CONFIRMED」に書き換える docs-only microbatch。

implementation はまだ走らせない。本 batch の目的は「spec を最終形に固定」して次の implementation batch に渡せる状態を作ること。

## 決定・変更

### Boss-confirmed answers (3 件)

| # | Topic | Confirmed answer |
|---|---|---|
| **Q-6** | Undo | In-memory previous value + 10 秒 toast undo。**No Sanity audit-log schema**, **no persistent undo log**。current UI session のみ |
| **Q-8** | Conflict | `_rev` mismatch → conflict message + reload prompt。**No 3-way merge UI**, **no last-write-wins** |
| **Q-10** | Devlog | 2B-1 では自動 devlog 生成なし、server `console.log` のみ (local debugging)。manual devlog が source of truth |

### 更新 (2)

- `docs/specs/phase-2b-1-reaction-notes.md`
  - Header: 最終更新日 + ステータス「spec finalized, ready for implementation batch」に変更
  - §0「Confirmed decisions」 — Inherited (Q-1/Q-2/Q-7) と Phase 2B-1 specific (Q-6/Q-8/Q-10) を分けて明示
  - §1 Out of scope — 「Persistent undo log なし」「自動 devlog 生成なし」「3-way merge UI / last-write-wins なし」の 3 行追加
  - §3-3 Input shape — `expectedRevision` を **required** に変更 (Q-8 confirmed)
  - §5-3 Input validation — `expectedRevision` required の文言更新
  - §5-7 Execute behavior — 「`ifRevisionID` を必ず渡す」と明文化
  - §7 Undo strategy — 「推奨」 → 「Q-6 CONFIRMED」、no audit-log / no persistent log を明示
  - §8 Conflict handling — 「推奨」 → 「Q-8 CONFIRMED」、no merge UI / no last-write-wins を明示
  - §9 Devlog/audit behavior — 「推奨」 → 「Q-10 CONFIRMED」、console は local debugging only と明示
  - §15 Post-spec next step — 1 を strikethrough + Done mark、次は implementation batch
- `docs/specs/phase-2b-write-actions.md`
  - §0.5 — 「Parent batch」「Phase 2B-1 batch」「Still open」の 3 区分に再構成、Q-6/Q-8/Q-10 を Phase 2B-1 scope として明記
  - §6 Open Questions table — Q-6 / Q-8 / Q-10 に **✅** マーク + confirmed 文言 + Phase 2B-1 spec へのリンク追加

### 新規 docs (3)

- `docs/devlog/0166-phase-2b-1-reaction-notes-decisions.md` (本ファイル)
- `docs/handoff/0177-phase-2b-1-reaction-notes-decisions.md`
- `docs/handoff/latest.md` (mirror)

### コード変更 (0)

`dashboard/src/` / `tools/` / `schemas/` / `publish-package/` / `assets/visuals/` / `patches/` / `package.json` / config files いずれも touch なし。

## 理由

### なぜ `expectedRevision` を required に格上げしたか

Q-8 boss confirmation は「no last-write-wins」を明示した。spec §3-3 で `expectedRevision?: string` (optional) のままだと「指定しないと last-write-wins になる」設計の余地が残ってしまう。Q-8 の意図を厳格に反映するには `expectedRevision: string` (required) + validation で reject、が必要。

### なぜ「local debugging only」を §9 に明示したか

「server `console.log` だけ」と書くと、将来「console output を file に redirect」「Vercel runtime log を audit に流用」など spec 外の運用が伸びる余地がある。Q-10 confirmed の精神は「automatic audit infrastructure を 2B-1 で立てない」なので、用途を「local debugging only」と限定した。

### なぜ親 spec §0.5 を 3 区分にしたか

Phase 2B 親 spec は今後 2B-2 / 2B-3 / ... と続く設計。decision の起源 batch を読者が辿れるよう、

1. Parent batch (Q-1/Q-2/Q-7) — 全 2B 共通
2. Phase 2B-1 batch (Q-6/Q-8/Q-10) — 2B-1 scope のみ、2B-2+ で再評価可
3. Still open (Q-3/Q-4/Q-5/Q-9) — 後続 batch で判断

の 3 階層を可視化した。同時に「2B-1 で決めた undo / conflict は W5 で同じ採用とは限らない」という余地を残した。

## 影響

- リポジトリ: `docs/specs/`, `docs/devlog/`, `docs/handoff/` のみ touch。runtime コードは不変
- ワークフロー: spec finalized → 次は **Phase 2B-1 implementation batch** (8-9 ファイル変更を 1 PR)
- スキーマ: 不変
- プロダクト方針: Phase 2B の「local/dev only、production permanent disable、Sanity controlled write」原則を強化 (`expectedRevision` を required にした分、safety が 1 段厚くなった)

## 次の一手

**Option A (推奨) — Phase 2B-1 implementation batch**

Spec が finalized なので、次は実装。`docs/specs/phase-2b-1-reaction-notes.md` §13-1 / §13-2 / §13-4 に従い:

- 新規 3 ファイル: `lib/actions/updateReactionNotes.ts` / `components/analytics/ReactionNoteEditor.tsx` / (optional) `lib/actions/sanityWriteClient.ts`
- 更新 5-6 ファイル: `lib/featureFlags.ts` / `lib/groq/outputs.ts` / `app/analytics/page.tsx` / `ReactionNotesCard.tsx` / `PendingMonitoringCard.tsx` / `dashboard/README.md`
- 受け入れ基準 10 項目すべて green
- 1 PR で完結

**Option B — Phase 2B-2 spec (W5 humanReviewGate state) を先に書く**

W3 implementation 前に W5 spec も用意したい場合の選択肢。両 spec を並べて読みたい boss preference があれば。

**Option C — README + .env.local sample 整備 microbatch**

`dashboard/README.md` Environment セクションに `ENABLE_WRITE_ACTIONS` / `SANITY_WRITE_TOKEN` の説明 + Vercel 禁止警告を **先行追加** する docs-only microbatch。implementation batch でも同時 update 予定だが、boss が `.env.local` を試したいなら先出しもアリ。

発信ネタ案: 「open question を spec に明示しておくと boss judgement が呼び出しやすい」「`expectedRevision` を optional → required に格上げした理由 — 「no last-write-wins」を厳密化するための小さな大設計」「3-way merge UI を入れないと決めた瞬間に Phase 2B-1 の規模が確定した」
