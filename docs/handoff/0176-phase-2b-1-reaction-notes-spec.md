# Handoff: Phase 2B-1 reactionNotes write detail spec

Date: 2026-05-20

## 1. Task Goal

handoff/0175 で Phase 2B 親 spec の boss decisions (Q-1 / Q-2 / Q-7) を確定済。Q-7 で「Phase 2B-1 = W3 reactionNotes editing」が決まったので、次の前進は **W3 単独の detail spec を docs-only で起こす** こと。実装はまだ走らせない。boss が spec を読み、残り open question (Q-6 undo / Q-8 conflict / Q-10 devlog) に judgement を付けるまでは、Sanity 書き込みコードは 1 行も書かない。

本 batch は「フィールド単位の設計図」を boss-facing で固定するための **docs-only batch**。

## 2. Constraints Followed

- ✅ Docs only、runtime code 変更なし
- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ publish-package files 不変
- ✅ assets/visuals 不変
- ✅ patches 不変
- ✅ deploy なし
- ✅ package 追加なし、shadcn 追加なし
- ✅ Inventing boss decisions なし (Q-6 / Q-8 / Q-10 は「Claude 推奨案」として明示、boss 確定は別途)
- ✅ Phase 2B write actions 未実装 (spec のみ)

## 3. Changed Files

### 新規 docs (4)

- `docs/specs/phase-2b-1-reaction-notes.md` (15 セクション、28,726 bytes)
- `docs/devlog/0165-phase-2b-1-reaction-notes-spec.md`
- `docs/handoff/0176-phase-2b-1-reaction-notes-spec.md` (本ファイル)
- `docs/handoff/latest.md` (mirror)

### コード変更 (0)

`dashboard/src/` / `tools/` / `schemas/` / `publish-package/` / `assets/visuals/` / `patches/` / `package.json` / config files いずれも touch なし。

## 4. Summary of Changes

### 4-1. Spec structure (15 sections)

| § | Section | 目的 |
|---|---|---|
| 0 | Inherited confirmed decisions | Q-1 / Q-2 / Q-7 を再宣言、spec が単独 readable |
| 1 | Goal and scope | in scope / out of scope を boss-facing で固定 |
| 2 | Current UI audit | `ReactionNotesCard` (92 行) + `PendingMonitoringCard` (80 行) + aggregation 経路 |
| 3 | Data model | `UpdateReactionNotesInput` / `UpdateReactionNotesResult` の TS shape |
| 4 | UI design | 8 state (read / edit / save / dirty / empty / disabled / loading / error / success) |
| 5 | Server action design | `updateReactionNotes(input)` の 9 step flow |
| 6 | Safety model | 4 defense layers (env flag / write token / field allowlist / `_id`+`_key` 検証) |
| 7 | **Q-6 undo proposal** | in-memory previous value + 10 秒 toast undo (Sanity history は読まない) |
| 8 | **Q-8 conflict proposal** | `_rev` mismatch → 「更新」 button → `router.refresh()` |
| 9 | **Q-10 devlog proposal** | auto devlog 生成なし、server `console.log` のみ |
| 10 | Environment variables | `ENABLE_WRITE_ACTIONS` + `SANITY_WRITE_TOKEN` |
| 11 | Error mapping | 7 error kinds → UI message + recovery hint |
| 12 | Test plan | manual / negative / build / conflict simulation |
| 13 | Implementation batch proposal | 3 new + 6 updated files、acceptance criteria 10 件 |
| 14 | Out of scope | 多 record bulk / 他 field 編集 / publish-package 編集 等 |
| 15 | Post-spec next step | boss が Q-6 / Q-8 / Q-10 を確定 → implementation batch |

### 4-2. Proposed implementation files (spec §13)

実装時の予定 (本 batch では作成しない):

**新規 (3)**:
- `dashboard/src/lib/actions/updateReactionNotes.ts` — `'use server'`、9 step flow、dry-run / execute 2-stage
- `dashboard/src/components/analytics/ReactionNoteEditor.tsx` — `'use client'`、edit / save / cancel / undo / error UI
- `dashboard/src/lib/actions/sanityWriteClient.ts` (optional) — `SANITY_WRITE_TOKEN` を持つ private client (read client とは別 instance)

**更新 (6)**:
- `dashboard/src/lib/featureFlags.ts` — `enableWriteActions` flag (env: `ENABLE_WRITE_ACTIONS`)
- `dashboard/src/lib/groq/outputs.ts` — `_id` (campaign) + `_key` (item) を row interface に thread
- `dashboard/src/app/analytics/page.tsx` — `buildReactionRows` / `buildPendingRows` に `_id` / `_key` 追加
- `dashboard/src/components/analytics/ReactionNotesCard.tsx` — `<ReactionNoteEditor>` 統合 trigger
- `dashboard/src/components/analytics/PendingMonitoringCard.tsx` — 「記入」 link を inline editor trigger に置換
- `dashboard/README.md` — Phase 2B-1 enablement section 追加

### 4-3. Spec の docs-only 性質

spec 内に TypeScript の type 定義や server action skeleton を含むが、**いずれも本 batch では実装ファイルに書き込まない**。`docs/specs/phase-2b-1-reaction-notes.md` 内の code block として記述するのみ。

### 4-4. Build was NOT run

Docs only のため build 不要 (boss spec の "Docs-only. Build not required." を遵守)。

### 4-5. Confirmation: runtime behavior unchanged

確認項目 (すべて intact):
- 23 routes (前 batch から変化なし)
- データ取得ロジック (`campaignDetailBySlugQuery` / `outputsListQuery` 等) — touch なし
- feature flags (`enableDiagnostics` / `enableLocalFsRoutes` / `activityLogMode`) — touch なし
- `enableWriteActions` flag — **まだ存在しない** (spec で提案のみ、`featureFlags.ts` には未追加)
- `/api/asset-thumb` security guards — touch なし
- Sanity schema / publish-package / assets/visuals / patches / package.json — touch なし
- Sanity への write は **依然 0 件** (write client も未実装)

## 5. Key Decisions

- **Detail spec を docs-only で起こす**: parent spec は航海図、field 単位の決定までは parent では握れない。implementation 中に decision を握ると blast radius が大きい
- **Q-6 / Q-8 / Q-10 を「Claude 推奨案」として明示**: open のまま implementation に進めないため、boss-facing で judgement を促す
  - Q-6 undo = in-memory + 10 秒 toast (Sanity history 読まない)
  - Q-8 conflict = `_rev` mismatch 検出 + 簡易 reload (3-way merge なし)
  - Q-10 devlog = 自動生成なし、server `console.log` のみ
- **Env var 名を `ENABLE_WRITE_ACTIONS` + `SANITY_WRITE_TOKEN` に確定**: 既存 flag (`ENABLE_DIAGNOSTICS` / `ENABLE_LOCAL_FS_ROUTES`) と整合、token は Sanity 公式の命名と整合
- **`SANITY_WRITE_TOKEN` を別 client に分離**: read client と write client を物理的に分け、誤って read path から write しない設計
- **Implementation 候補ファイルを spec §13 に明示**: boss が「ファイル数 / 影響範囲」を visible にチェックできる
- **`_id` + `_key` を row interface に thread**: 現在 GROQ は取得しているが row では捨てている。「server action から見えるべき identity を read path で握る」設計
- **Field allowlist は `reactionNotes` のみ**: `publishedUrl` / `publishedAt` / `state` / `platform` は write 不可、間違って patch しないための safety
- **Production 永久 disabled を再宣言**: Phase 2B 親 spec の決定を Phase 2B-1 spec 内でも明示、後続 reader が parent spec を読まなくても分かる構造

## 6. Human Review Questions

### 確定が必要な open question (本 spec 内の Claude 推奨案 review)

1. **Q-6 (undo)**: 「in-memory previous value + 10 秒 toast undo」で OK? それとも「undo なし」 / 「永続 undo log」 / 「Sanity revision history を fetch して revert」 のいずれか?
2. **Q-8 (conflict)**: 「`_rev` mismatch → reload prompt」で OK? それとも「3-way merge UI」 / 「last write wins (conflict 無視)」 / 「楽観的 lock + 編集中 indicator」 のいずれか?
3. **Q-10 (devlog)**: 「自動 devlog 生成なし、server console のみ」で OK? それとも「reactionNotes 編集ごとに devlog auto-generate」 / 「Sanity 内 audit-log document を別 schema で作成」 のいずれか?

### Spec design に対する review question

4. **Env var 名 `ENABLE_WRITE_ACTIONS`**: `ENABLE_*` 系の既存 flag と整合だが、「`ENABLE_SANITY_WRITE`」 / 「`ENABLE_DASHBOARD_WRITE`」 等の代替案があるか?
5. **`sanityWriteClient.ts` を別ファイルに分離**: 現状の `lib/sanity.ts` に write メソッドを足す案もある。read / write を物理分離するか、同 file に統合するか?
6. **`ReactionNoteEditor` を `analytics/` 配下に置く判断**: 将来 W5 (humanReviewGate) で別 editor が必要になる。`components/common/` か `components/write/` に置く方が future-proof?
7. **Inline edit vs Modal**: spec §4 は inline editor 前提だが、「modal にしてから保存」 / 「dropdown 内で edit」 等の代替がある。boss 好みは?
8. **Save button のラベル**: 「保存」 / 「更新」 / 「適用」 / 「Save」 のどれが Hitori Media OS 全体の tone と整合?

## 7. Risks or Uncertainties

- **Q-6 / Q-8 / Q-10 が confirm 前に implementation に進む risk**: 本 batch では spec 段階で止めているが、boss が「とりあえず推奨案で進めて」と判断した場合、後で revert する可能性がある。spec で推奨案を明示している分、軽減はされる
- **`_rev` を Phase 2B-1 で握る難易度**: GROQ projection に `_rev` を足すと cache 戦略に影響する可能性。実装時に `revalidate: 0` の動作を確認が必要 (spec §5 で言及)
- **`enableWriteActions` flag の test 困難性**: production permanently disabled なので production での「動かない」を確認するテストが書きにくい。spec §12 で「production runtime check は手動 verify のみ」と明示
- **`SANITY_WRITE_TOKEN` を持たない開発者 environment**: 新規 contributor は token が無いので write 機能を試せない。docs/spec で `.env.local` の sample 値を提供する必要がある (Phase 2B-1 implementation batch で対応)
- **In-memory undo の hard limit**: page refresh / route 遷移で undo 履歴は消える。spec §7 で明示済だが、boss が「永続 undo が必要」と判断すれば再設計
- **Spec の長さ (28KB / 15 sections)**: boss が「長すぎ」と感じる可能性。次の microbatch で要約版を別ファイルに作る余地あり

## 8. Remaining Cleanup Candidates

### 短期 (microbatch)

- boss が Q-6 / Q-8 / Q-10 に judgement を付けた後、spec を「Claude 推奨案 → boss 確定」に書き換える docs-only microbatch
- 既存 dashboard/README.md の "Phase 2B is not yet implemented" 段落を「Phase 2B-1 spec ready, implementation pending」に更新する microbatch

### 中期 (Phase 2B-1 implementation batch)

- spec §13 に列挙した 3 新規 + 6 更新ファイルを実装する batch
- `enableWriteActions` の e2e smoke test (dev runtime で 1 件 reactionNotes を書き、Studio で確認)

### 中期 (Phase 2B-2 spec)

- W5 humanReviewGate state update の detail spec
- W3 spec の「8 UI state」「server action 9 step flow」「Safety 4 layers」テンプレートを W5 に転用

### 長期 (Phase 2B-3+)

- W1 generation rerun trigger spec (W3/W5 の write が安定してから)
- audit-log document schema 検討 (Q-4 が「必要」になった場合)

## 9. Next Recommended Step

**Option A (推奨) — boss が spec を review + Q-6 / Q-8 / Q-10 を確定**

`docs/specs/phase-2b-1-reaction-notes.md` を読み、§7 (undo) / §8 (conflict) / §9 (devlog) の Claude 推奨案に judgement を付ける。確定すれば「Q 確定 microbatch」(docs-only) で spec を最終版にしてから、Phase 2B-1 implementation batch に進む。

**Option B — Phase 2B-2 (W5) の detail spec を並行で書く**

W3 / W5 の両 spec を並べてから一気に implement したい場合。spec を 2 つ並べる方が boss にとって判断しやすければこちら。

**Option C — Implementation batch を先行試作 (非推奨)**

spec 未確定で動かすのは Phase 2B の安全原則に反する。boss 明示の指示が無い限り採用しない。

---

### Exact prompt for next Claude Code session (Phase 2B-1 Q 確定 microbatch、Option A 後)

```
Phase 2B-1 reactionNotes spec の boss 確定を反映する docs-only microbatch を実行してください。

入力:
- docs/specs/phase-2b-1-reaction-notes.md (Claude 推奨案)
- boss の確定回答: Q-6 = [boss 回答], Q-8 = [boss 回答], Q-10 = [boss 回答]

タスク:
1. spec §7 / §8 / §9 を「Claude 推奨案」 → 「Confirmed decision (2026-MM-DD)」 に書き換える
2. spec §0 の Inherited confirmed decisions リストに Q-6 / Q-8 / Q-10 を追記
3. spec §13 の implementation batch proposal を boss 確定後の最終形に update
4. dashboard/README.md の "Phase 2B is not yet implemented" 段落を「spec finalized, implementation pending」に更新
5. devlog/0166 + handoff/0177 + latest.md mirror

constraints:
- docs only、runtime code 変更なし
- Sanity schema 不変、Sanity 書き込みなし
- publish-package / assets/visuals / patches 不変
- package 追加なし
- 「invent boss decisions」 しない (boss 入力が無い Q は open のまま)
```
