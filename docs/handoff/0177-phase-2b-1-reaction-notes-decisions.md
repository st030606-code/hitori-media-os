# Handoff: Phase 2B-1 reactionNotes spec — boss decisions applied

Date: 2026-05-20

## 1. Task Goal

handoff/0176 (Phase 2B-1 detail spec) で「Claude 推奨案」として §7 / §8 / §9 に書いた 3 つの open question (Q-6 / Q-8 / Q-10) に boss 確定回答が出た → spec を「推奨」から「CONFIRMED」に書き換える **docs-only microbatch**。

本 batch の出口は「spec finalized, ready for Phase 2B-1 implementation batch」状態。implementation はまだ走らせない。

## 2. Constraints Followed

- ✅ Docs only、dashboard runtime code 変更なし
- ✅ Server actions 未実装 (spec のみ)
- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ publish-package files 不変
- ✅ assets/visuals 不変
- ✅ patches 不変
- ✅ package 追加なし、shadcn 追加なし
- ✅ deploy なし
- ✅ Boss 明示の Q-6 / Q-8 / Q-10 確定回答のみ反映、他 Q (Q-3 / Q-4 / Q-5 / Q-9) は open のまま

## 3. Changed Files

### 更新 (2)

- `docs/specs/phase-2b-1-reaction-notes.md` — header, §0, §1 (out of scope), §3-3, §5-3, §5-7, §7, §8, §9, §15 を update
- `docs/specs/phase-2b-write-actions.md` — §0.5 を 3 区分に再構成、§6 table に Q-6 / Q-8 / Q-10 の ✅ 行追加

### 新規 docs (3)

- `docs/devlog/0166-phase-2b-1-reaction-notes-decisions.md`
- `docs/handoff/0177-phase-2b-1-reaction-notes-decisions.md` (本ファイル)
- `docs/handoff/latest.md` (mirror)

### コード変更 (0)

`dashboard/src/` / `tools/` / `schemas/` / `publish-package/` / `assets/visuals/` / `patches/` / `package.json` / config files いずれも touch なし。

## 4. Summary of Changes

### 4-1. Boss-confirmed decisions applied (3 件)

| # | Boss answer | spec への反映場所 |
|---|---|---|
| **Q-6** ✅ | In-memory previous value + 10 秒 toast undo。No Sanity audit-log schema。No persistent undo log | 2B-1 §0 / §1 (out of scope) / §7 / 親 spec §0.5 / 親 spec §6 Q-6 row |
| **Q-8** ✅ | `_rev` mismatch → conflict message + reload prompt。No 3-way merge UI。No last-write-wins | 2B-1 §0 / §1 (out of scope) / §3-3 / §5-3 / §5-7 / §8 / 親 spec §0.5 / 親 spec §6 Q-8 row |
| **Q-10** ✅ | 2B-1 では自動 devlog 生成なし。Server `console.log` only for local debugging。Manual devlog が source of truth | 2B-1 §0 / §1 (out of scope) / §9 / 親 spec §0.5 / 親 spec §6 Q-10 row |

### 4-2. Phase 2B-1 spec の主要編集

1. **Header**: 「最終更新: 2026-05-20 (Q-6 / Q-8 / Q-10 boss confirmed)」+ status を「spec finalized, ready for implementation batch」に変更
2. **§0「Confirmed decisions」を 2 階層に分離**:
   - Inherited from parent spec §0.5 (handoff/0175): Q-1 / Q-2 / Q-7
   - Phase 2B-1 specific (handoff/0177): Q-6 / Q-8 / Q-10
3. **§1 Out of scope** に 3 行追加: 「Persistent undo log なし」「自動 devlog 生成なし」「3-way merge UI / last-write-wins なし」
4. **§3-3 Input shape**: `expectedRevision?: string` (optional) → `expectedRevision: string` (**required**) に格上げ。Q-8 「no last-write-wins」を厳密化するため
5. **§5-3 Input validation**: `expectedRevision` を required 必須項目として記述、未指定 execute は `validation` reject
6. **§5-7 Execute behavior**: 「`expectedRevision` が指定されていれば」 → 「`ifRevisionID` で必ず渡す」に変更、楽観ロック強制を明文化
7. **§7 (Undo)**: 「推奨: in-memory previous value」 → 「Q-6 CONFIRMED (2026-05-20)」、no Sanity audit-log / no persistent undo log を明示
8. **§8 (Conflict)**: 「推奨: 単純な `_rev` conflict メッセージ + 再読み込み指示」 → 「Q-8 CONFIRMED (2026-05-20)」、no 3-way merge UI / no last-write-wins を明示
9. **§9 (Devlog/audit)**: 「推奨: 自動 devlog 生成は scope 外」 → 「Q-10 CONFIRMED (2026-05-20)」、console は **local debugging 用途のみ** と限定明記
10. **§15 Post-spec next step**: Step 1 (boss が spec を read + approve) を strikethrough + 「Done 2026-05-20 (handoff/0177)」、次は Phase 2B-1 implementation batch

### 4-3. Parent spec (phase-2b-write-actions.md) の主要編集

1. **§0.5「Confirmed decisions」を 3 区分に再構成**:
   - **Parent batch (2026-05-20, handoff/0175)** — Q-1 / Q-2 / Q-7
   - **Phase 2B-1 batch (2026-05-20, handoff/0177)** — Q-6 / Q-8 / Q-10 + Phase 2B-1 spec §7/§8/§9 へのリンク
   - **Still open** — Q-3 / Q-4 / Q-5 / Q-9 (parent §6 で tracking 継続)
2. **§6 Open Questions table**:
   - Q-6 row → ✅ + 「(CONFIRMED 2026-05-20, 2B-1 scope) ... → Phase 2B-1: in-memory previous value + 10 秒 toast undo」 + §7 link
   - Q-8 row → ✅ + 「(CONFIRMED 2026-05-20, 2B-1 scope) ... → Yes: ...」 + §8 link
   - Q-10 row → ✅ + 「(CONFIRMED 2026-05-20, 2B-1 scope) ... → Yes (scope 外): ...」 + §9 link
   - Q-3 / Q-4 / Q-5 / Q-9 は open のまま (boss 入力なし → invent しない)

### 4-4. No contradictory open-question wording remains

grep result:
```
spec/phase-2b-1-reaction-notes.md:109 (expectedRevision の "optional" → "required" に書き換え済)
spec/phase-2b-1-reaction-notes.md:218 ("提案 action 名" — Q ではなく実装提案、open ではない)
spec/phase-2b-1-reaction-notes.md:507 ("省略推奨" — unit test framework 非追加の判断、Q ではない)
spec/phase-2b-1-reaction-notes.md:591 ("approve" — strikethrough 済 + Done mark)
```

Q-6 / Q-8 / Q-10 に関する「推奨」「Claude 推奨案」「resolves Q-X」表現は全削除済。残った「推奨」は Q とは無関係な word choice。

### 4-5. Build NOT run

Docs-only batch のため build 不要 (boss spec の "Build not required unless runtime files changed accidentally")。

### 4-6. Confirmation: runtime behavior unchanged

確認項目 (すべて intact):

- 23 routes (前 batch から変化なし)
- データ取得ロジック (`outputsListQuery` / `campaignDetailBySlugQuery` 等) — touch なし
- feature flags (`enableDiagnostics` / `enableLocalFsRoutes` / `activityLogMode`) — touch なし
- **`enableWriteActions` flag — まだ存在しない** (spec finalized したが implementation 未着手、`featureFlags.ts` に export 追加されていない)
- `/api/asset-thumb` security guards — touch なし
- Sanity schema / publish-package / assets/visuals / patches / package.json — touch なし
- Sanity への write は **依然 0 件** (write client / server action / write token check 全て未実装)

## 5. Key Decisions

- **`expectedRevision` を optional → required に格上げ**: Q-8「no last-write-wins」を厳密化するため。optional のままだと `expectedRevision` 未指定の execute が「conflict 検知をスキップ」する path として残る → required + validation reject で 100% 排除
- **server `console.log` を "local debugging only" と限定**: Q-10 confirmed が「auto audit infra を 2B-1 で立てない」精神。「console output を file に redirect」「Vercel runtime log を audit に流用」等の運用伸びを spec で予防
- **親 spec §0.5 を 3 区分に再構成**: 「Parent batch」「Phase 2B-1 batch」「Still open」で decision の起源を可視化。2B-2 / 2B-3 で undo / conflict 戦略を再評価する余地を残す (W5 では gate state なので undo の意味合いが異なる可能性)
- **Phase 2B-1 spec を「finalized」 status に昇格**: implementation batch にそのまま渡せる状態。boss 追加 question を待たずに着手可能
- **Q-3 / Q-4 / Q-5 / Q-9 を invent しない**: boss instruction「Do not invent boss decisions」を遵守、parent spec §6 に open のまま残す
- **Out of scope セクションに 3 行追加**: 「Persistent undo log なし」「自動 devlog 生成なし」「3-way merge UI / last-write-wins なし」を明示的に並べる。spec を斜め読みする implementation 担当者が出口を見失わないため

## 6. Human Review Questions

### Spec 内容についての確認 (boss が必要なら)

1. **`expectedRevision` required 格上げ**: optional のままで「未指定なら last-write-wins、指定すれば lock」の二段運用も理論上は可能。required で OK?
2. **§9 「local debugging only」の文言**: console log の destination を spec で限定したが、Vercel preview deploy で console log を見て debug したい時に困らないか? (production / preview は `enableWriteActions === false` なので server action 自体が走らない → 困らない想定)
3. **親 spec §0.5 の 3 階層構造**: 今後 2B-2 / 2B-3 で同様に「per-batch confirmed」を増やすが、§0.5 が肥大化したら別 section に分離する余地あり

### Phase 2B-1 implementation batch の進め方

4. **PR の粒度**: spec §13 では「8-9 ファイル変更を 1 PR で完結」と提案。boss が「もっと細かく分ける」希望なら分割案を再設計可
5. **Spec §13-1 optional の `sanityWriteClient.ts`**: 別ファイルに分離するか `updateReactionNotes.ts` 内に inline か。実装時に判断で OK?
6. **`.env.local` sample 整備**: implementation batch で `dashboard/README.md` Environment セクションを update する予定だが、先行 microbatch で出した方が良い場合あり

## 7. Risks or Uncertainties

- **`expectedRevision` required により dry-run の挙動が複雑化**: dry-run も `expectedRevision` を要求するか? spec §5-6 では明示なし → implementation 時に「dry-run は warning なし、execute のみ required」とする可能性が残る。spec を再 microbatch で precise 化する余地あり
- **GROQ projection に `_rev` を追加した時のキャッシュ動作**: `outputsListQuery` に `_rev` を追加すると Next.js の `revalidate: 0` setting でも cache 戦略に影響が出る可能性。implementation 時に動作確認必要
- **Q-3 / Q-4 / Q-5 / Q-9 が未確定のまま 2B-1 が進む**: 2B-1 の scope では問題なし (audit-log schema / W1 bridge / reflect-script 段階削除 / W7 prompt save はいずれも 2B-1 では touch しないため)。2B-2 / 2B-3 spec 起こす時に boss 確認が必要
- **Spec 長さ (現状 28KB → boss 確定追加で増大)**: boss が「もう少し短く」希望なら次 microbatch で要約版を別ファイル化する余地あり
- **「local debugging only」を実装で守る困難性**: server `console.log` は誰でも書ける、PR review で「format / destination」を毎回 check する必要

## 8. Remaining Cleanup Candidates

### 短期 (microbatch)

- **Phase 2B-1 implementation batch** (本 batch の直接後続、推奨 Next step)
- `dashboard/README.md` の Environment / Feature flags section の先行 update microbatch (implementation batch と分けたい場合)

### 中期 (Phase 2B-2 関連)

- **Phase 2B-2 spec batch (W5 humanReviewGate state)**: Phase 2B-1 の 8 UI state / 9 step server action / 4 layer safety テンプレートを W5 に転用
- W5 でも undo / conflict 戦略を確定 (Q-6 / Q-8 は 2B-1 scope のため、W5 で再評価可)

### 長期

- **Q-3 (W1 visual approve & register bridge)** の確定 → Phase 2B-3 spec
- **Q-4 (audit-log schema)** の確定 → Phase 2B-X spec
- **Q-5 (reflect-* script 段階削除戦略)** の確定 → Phase 2B 全完了後
- **Q-9 (promptTemplate dataset 投入後の W7 議論)** → Phase Analytics or Phase 2B-6+

## 9. Next Recommended Step

**Option A (推奨) — Phase 2B-1 implementation batch**

Spec が finalized なので、次は **実装**。`docs/specs/phase-2b-1-reaction-notes.md` §13-1 / §13-2 / §13-4 に従い:

- 新規 3 ファイル + 更新 5-6 ファイル = 8-9 ファイル変更
- 1 PR で完結
- §13-4 受け入れ基準 10 項目すべて green が完了条件

**Option B — Phase 2B-2 spec (W5 humanReviewGate state) を先に書く**

W3 implementation 前に W5 spec も用意したい場合の選択肢。両 spec を並べて読みたい boss preference があれば。

**Option C — `.env.local` sample + README Environment 先行 microbatch**

implementation batch でも同時 update 予定だが、boss が `.env.local` を試したいなら先出しもアリ。`dashboard/README.md` の Environment セクションに `ENABLE_WRITE_ACTIONS` / `SANITY_WRITE_TOKEN` の説明 + Vercel 禁止警告を追加する docs-only microbatch。

---

### Exact prompt for next Claude Code session (Phase 2B-1 implementation batch、Option A)

```
Phase 2B-1 reactionNotes write の implementation batch を実行してください。

入力:
- docs/specs/phase-2b-1-reaction-notes.md (finalized, all confirmed)
- docs/handoff/0177-phase-2b-1-reaction-notes-decisions.md (boss confirmations)

タスク:
1. 新規ファイル (3):
   - dashboard/src/lib/actions/updateReactionNotes.ts (spec §5, 'use server', 9 step flow, expectedRevision required)
   - dashboard/src/components/analytics/ReactionNoteEditor.tsx (spec §4, client component, 8 UI states)
   - (optional) dashboard/src/lib/actions/sanityWriteClient.ts (token-bearing write client)

2. 更新ファイル (5-6):
   - dashboard/src/lib/featureFlags.ts (enableWriteActions export 追加、spec §10-4)
   - dashboard/src/lib/groq/outputs.ts (ReactionNoteRow / PendingMonitoringRow に campaignId + itemKey + _rev 追加)
   - dashboard/src/app/analytics/page.tsx (buildReactionRows / buildPendingRows で identity thread-through)
   - dashboard/src/components/analytics/ReactionNotesCard.tsx (ReactionNoteEditor 統合)
   - dashboard/src/components/analytics/PendingMonitoringCard.tsx (inline editor trigger)
   - dashboard/README.md (Environment section + Vercel 禁止警告)

3. 受け入れ基準 (spec §13-4 の 10 項目すべて green):
   - build 23 routes green
   - 既存 read-only 動作維持 (ENABLE_WRITE_ACTIONS 未設定で「編集」 button disabled)
   - ENABLE_WRITE_ACTIONS=true + SANITY_WRITE_TOKEN で書き込み動作
   - negative tests 8 シナリオすべて期待通り
   - SANITY_WRITE_TOKEN が client bundle に inline されていない
   - reactionNotes 以外の field が touch されていない
   - schemas / publish-packages / assets/visuals / patches に diff なし
   - 既存 routes に動作変化なし

4. devlog + handoff + latest.md mirror

constraints:
- Sanity schema 不変
- Sanity への write は server action 内のみ、それ以外 0 件
- publish-package / assets/visuals / patches 不変
- package 追加なし、shadcn 追加なし
- Vercel への env 設定なし (boss が手動)
- production / preview deploy では enableWriteActions === false が保証されることを build で確認
```
