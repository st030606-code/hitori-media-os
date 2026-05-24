# Devlog 0164 — Phase 2B boss decisions applied

日付: 2026-05-20

## 背景

handoff/0174 で起こした Phase 2B write actions spec (`docs/specs/phase-2b-write-actions.md`) の §6 Open Questions 10 件のうち、boss が 3 件を確定 (Q-1 / Q-2 / Q-7)。残り 7 件 (Q-3 / Q-4 / Q-5 / Q-6 / Q-8 / Q-9 / Q-10) は依然 open のまま 2B-1 着手時または later に持ち越し。

本 batch は spec ファイル本体に確定済 boss decision を **明文化**する docs-only microbatch。実装は触らない。

## 決定・変更

### Confirmed decisions (3 件)

| # | Boss answer | spec への反映 |
|---|---|---|
| **Q-1** | `SANITY_WRITE_TOKEN` は `dashboard/.env.local` 専用、Vercel production / preview には絶対設定しない | §0.5「Confirmed decisions」に追記、§6 Q-1 row に ✅ + 確定文言 |
| **Q-2** | Production write は永久 disabled。`enableWriteActions` flag + `SANITY_WRITE_TOKEN` 両方揃った local/dev でのみ発火、特定 user 限定の future path は想定せず | §0.5 + §6 Q-2 row に ✅ + 確定文言 |
| **Q-7** | 2B-1 = W3 reactionNotes、2B-2 = W5 humanReviewGate state update の順 | §0.5 + §6 Q-7 row に ✅ + 確定文言、§2 P0 heading で 2 separate batch を明示 |

### Still open (7 件、変更なし)

Q-3 / Q-4 / Q-5 / Q-6 / Q-8 / Q-9 / Q-10 はそのまま open 表示。boss instruction「Leave Q-3 / Q-4 / Q-5 / Q-6 / Q-8 / Q-9 / Q-10 as open unless the existing spec already has a safe default. Do not invent boss decisions.」に従って **invent しない**:

- Q-3 (visual approve bridge or reimplement) → 2B-3 着手時に確定
- Q-4 (audit-log schema 拡張) → audit が必要になったタイミングで議論、初期は console + in-memory log
- Q-5 (reflect-*.mjs 並存) → 復旧手段として残置の方が conservative、boss 判断点として残す
- Q-6 (undo 方式) → 2B-1 W3 着手時に確定 (in-memory が現実的だが boss 確認待ち)
- Q-8 (conflict handling 頻度) → solo boss なら極稀の前提、boss 確認待ち
- Q-9 (W7 timing) → promptTemplate dataset 投入後の議論
- Q-10 (自動 devlog) → audit-log boundary、scope 外 (現状の手動 commit pattern 継続) を boss が確定するまで open

### コード変更 (0)

`docs/specs/phase-2b-write-actions.md` のみ編集。runtime / schema / publish-package / assets/visuals / patches / package.json / dashboard/src / tools / schemas いずれも touch なし。

### Spec 編集の要約

3 か所:

1. **§0.5「Confirmed decisions (2026-05-20)」 新設** (§0 と §1 の間に挿入):
   - Q-1 / Q-2 / Q-7 の確定内容を箇条書きで明示
   - 「これだけで 2B-1 spec + implementation start に十分」と明文化
   - 残り 7 件は §6 で tracking と明示
2. **§2 P0 heading 更新**:
   - 旧「最初の implementation batch、boss 確認後すぐ」 → 新「2 つの separate batch、W3 が先、W5 が後 — boss confirmed Q-7」
   - W3 / W5 の bullet 先頭に「Phase 2B-1」「Phase 2B-2」ラベルを追加
3. **§6 table の 3 行に ✅ マーク + 確定文言**:
   - Q-1: 「→ Yes: dashboard/.env.local 専用、Vercel production / preview には絶対設定しない」
   - Q-2: 「→ Yes: production write は永久 disabled。... 将来「特定 user 限定」の path は想定せず」
   - Q-7: 「→ Yes: 2B-1 = W3 reactionNotes、2B-2 = W5 humanReviewGate state update」

§5 Recommended Implementation Sequence は **無変更** (元から 2B-1 = W3, 2B-2 = W5 を記述済)。

## 理由

- **inventing boss decisions を回避**: 残り 7 件は明示的に open のまま残す。spec が「boss が決めていない事項を Claude が決めた」状態を作らない
- **§0.5「Confirmed decisions」セクションを top 付近に**: spec を再読する boss / 新規メンバーが「boss が何を決めたか」を §6 まで読まずに把握できる
- **§2 P0 heading で「2 separate batch」 を明示**: 旧 heading の「最初の implementation batch」 は singular で誤読を生む、Q-7 の確定で「2 batches」が確定したので heading を直す
- **§5 を touch しない**: 元から 2B-1=W3 / 2B-2=W5 の順序、boss confirmation が裏付け
- **`enableWriteActions` flag + `SANITY_WRITE_TOKEN` 両方必須**: Q-2 で boss が「両方揃った時」と明示、§3-5 / §3-7 の既存 spec 文言と整合

## 影響

- code 変更ゼロ、23 routes 動作維持、build 不変
- spec が boss-aligned 状態に: 2B-1 (W3) spec + implementation 着手の前提が確定
- 残り Q-3 〜 Q-10 (7 件) は依然 open、各 batch 着手時に確定する流れ

## 次の一手

1. **boss が更新 spec を read**:
   - §0.5 「Confirmed decisions」 に違和感ないか
   - §6 で残り 7 件の Q を再度確認
2. boss OK → **Phase 2B-1 (W3 reactionNotes) detail spec docs only batch** を立てる:
   - `docs/specs/phase-2b-1-reaction-notes.md` 新規
   - W3 の UI mockup / server action 設計 / dry-run flow / error class mapping / undo 戦略 (Q-6 を 2B-1 着手時に確定) / `enableWriteActions` 実装詳細
3. その後 → Phase 2B-1 implementation batch (server action 実装、UI 統合)

## 発信ネタ候補

- 「invent ではなく open を残す習慣」: boss が決めていない事項を Claude Code が確定しない、spec docs に「open」と明示することで意思決定の透明性を保つ
- 「Confirmed decisions を spec top に置く」: 長い spec の中で「boss が決めたこと」だけを抜き出すセクションを top に置くと、新規メンバーや再読する boss が迷子にならない
- 「Q-2 の永久 disable 契約」: production write を「特定 user 限定で enable する future path」を boss が明示的に否定、`enableWriteActions` flag が security の最後の defense になる
