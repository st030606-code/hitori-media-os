# Handoff: Phase 2B-2 humanReviewGate state update — detail spec

Date: 2026-05-20

## 1. Task Goal

Phase 2B-1 reactionNotes write が boss smoke-validated (handoff/0179)。controlled Sanity write pattern が現実に動いたので、次の implementation 候補である **Phase 2B-2 = W5 humanReviewGate state update** の **implementation-ready detail spec** を docs-only で起こす。

本 batch は spec のみ、code は触らない。boss が spec を read して 7 件の open question (Q-2B2-1〜Q-2B2-7) に judgement を付けるまで implementation batch には進まない。

## 2. Constraints Followed

- ✅ Docs only、dashboard runtime code 変更なし
- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし (spec のみ)
- ✅ publish-package files 不変
- ✅ assets/visuals 不変
- ✅ patches 不変
- ✅ package 追加なし
- ✅ deploy なし
- ✅ Phase 2B-1 動作 / 23 routes 影響なし
- ✅ schema authoritative の原則を守り `approved` / `rejected` を勝手に発明しない (Q-2B2-1 で boss confirmation を促す)
- ✅ 「Do not invent boss decisions」 遵守 (7 件の open question を残し、推奨案は明示するが boss judgement を待つ)

## 3. Changed Files

### 新規 docs (4)

- `docs/specs/phase-2b-2-human-review-gates.md` (17 セクション、約 18 KB)
- `docs/devlog/0169-phase-2b-2-human-review-gates-spec.md`
- `docs/handoff/0180-phase-2b-2-human-review-gates-spec.md` (本ファイル)
- `docs/handoff/latest.md` (mirror)

### コード変更 (0)

`dashboard/src/` / `tools/` / `schemas/` / `publish-package/` / `assets/visuals/` / `assets/inbox/` / `patches/` / `package.json` いずれも touch なし。

## 4. Summary of Changes

### 4-1. Spec structure (17 sections)

| § | Section | 主要内容 |
|---|---|---|
| 0 | Confirmed decisions (inherited) | Phase 2B 親 + 2B-1 で確定済の Q-1/Q-2/Q-6/Q-7/Q-8/Q-10 を再宣言 + 2B-1 implementation lessons (handoff/0178+0179) |
| 1 | Goal and scope | `/human-review-gates` + `/campaigns/[slug]` Tabs「確認ゲート」 の 2 surface で state inline update |
| 2 | Current state audit | schema (5 fields, 6 states) / GROQ (4 query) / 2 page / labels / CLI baseline 0 件 |
| 3 | **Allowed state transitions** | 13 transition 明示、terminal = `done` / `skipped` |
| 4 | Data model | `UpdateGateStateInput` (`isUndo` flag 含む) / `UpdateGateStateResult` 型定義 |
| 5 | UI design | dropdown (Option A) + confirm modal for terminal + disabled state |
| 6 | Server action design | 10 step flow (Phase 2B-1 の 9 step + transition validation) |
| 7 | Safety model | 5 layer + field allow-list |
| 8 | Undo strategy | Phase 2B-1 同 pattern (10秒 toast)、`isUndo` flag で allow-list bypass |
| 9 | Cross-page strategy | `<UndoToastHost>` を Phase 2B-1 から汎用化 (Option A) |
| 10 | Files likely affected | 新規 2-3 + 更新 5-7 + 削除 1 (Option A 採用時) |
| 11 | Environment variables | 新規追加なし、Phase 2B-1 の 2 env を再利用 |
| 12 | Error mapping | 7 既存 + 新規 `transition-not-allowed` |
| 13 | Test plan | manual smoke 13 step + negative tests + build + token audit |
| 14 | Acceptance criteria | 10 項目 |
| 15 | Scope exclusions | 12 項目 (visual register / reviewer / notes / completedAt / multi-user / etc.) |
| 16 | Open questions | 7 件 (Q-2B2-1〜Q-2B2-7) |
| 17 | Post-spec next step | boss confirm → Q 確定 microbatch → implementation batch |

### 4-2. Target state transitions (§3-2 抜粋)

| From | To | Confirm modal |
|---|---|---|
| not-started | in-progress | No |
| not-started | pending-review | No |
| not-started | skipped | **Yes** |
| in-progress | pending-review | No |
| in-progress | blocked | No |
| in-progress | done | **Yes** |
| in-progress | skipped | **Yes** |
| pending-review | in-progress | No |
| pending-review | done | **Yes** |
| pending-review | blocked | No |
| pending-review | skipped | **Yes** |
| blocked | in-progress | No |
| blocked | skipped | **Yes** |

合計 **13 allowed transitions**、terminal は `done` / `skipped` の 2 状態。

### 4-3. Schema authoritative の重要発見

boss prompt は候補に `approved` / `rejected` を含めたが、`schemas/campaignPlan.ts:546-588` の controlled vocabulary は **`not-started / in-progress / pending-review / done / blocked / skipped` の 6 値のみ**。

→ spec では `approved` ≡ `done`、`rejected` ≡ `blocked` (差し戻し) or `skipped` (放棄) として運用、schema 拡張は §16 Q-2B2-1 で boss judgement に委ねる。boss が「approved/rejected が必要」 と判断したら **別 spec batch で schema 議論** (Q-4 audit-log と類似の進行)。

### 4-4. Write guard pattern (Phase 2B-1 と同一)

- `enableWriteActions` required
- `SANITY_WRITE_TOKEN` required
- `expectedRevision` required
- `_rev` mismatch → conflict message + reload prompt
- No last-write-wins
- No audit-log schema
- No automatic devlog

加えて Phase 2B-2 固有:
- **Transition allow-list** が 5 層目の safety
- `isUndo: true` で allow-list bypass (server は依然 `expectedRevision` + 再 fetch で検証)

### 4-5. Server action design (§6-2 の 10 step flow)

1. `enableWriteActions` check
2. `SANITY_WRITE_TOKEN` check
3. Input validation (regex / enum / `isUndo` boolean check)
4. Fetch target doc
5. `not-found` if absent
6. `conflict` if `_rev` mismatch
7. Find gate by `_key`
8. Capture `previousState`
9. **Transition validation** (allow-list check, bypassed if `isUndo === true`)
10. Dry-run preview / Execute patch with `ifRevisionID` + transaction

### 4-6. UI design summary

- **Read mode** (writeReady=false): 既存 `<StatusBadge>` + disabled pill「編集不可 🔒」 + tooltip
- **Edit mode** (writeReady=true): dropdown trigger (`<StatusBadge>` クリックで展開) + allowed transitions list
- **Confirm modal**: `done` / `skipped` 遷移時のみ
- **Undo toast**: 右下 fixed、10 秒、`<UndoToastHost>` で stable host management
- **Conflict banner**: rose、「更新」 button → `router.refresh()`

### 4-7. Cross-page strategy (§9 Option A 推奨)

`AnalyticsToastHost.tsx` (Phase 2B-1) を `dashboard/src/components/common/UndoToastHost.tsx` に **rename + generalize**:
- 2B-1 `analytics/page.tsx` は import path 書き換えのみ
- 2B-2 の `/human-review-gates` + `/campaigns/[slug]` の両 surface で同 host を使用
- Context payload を 2 spec 共通に generic 化 (campaign-scoped + per-row identity を払拭)

### 4-8. Files likely affected (§10)

**新規 (2-3)**:
- `dashboard/src/lib/actions/updateGateState.ts`
- `dashboard/src/components/gates/GateStateControl.tsx`
- `dashboard/src/components/common/UndoToastHost.tsx` (Option A 採用時、2B-1 から rename)

**更新 (5-7)**:
- `dashboard/src/lib/groq/campaign.ts` (`_rev` + `_key` projection 追加)
- `dashboard/src/app/human-review-gates/page.tsx` (control 統合)
- `dashboard/src/app/campaigns/[slug]/page.tsx` (`GatesSection` で control 統合)
- `dashboard/src/components/analytics/ReactionNoteEditor.tsx` (Option A 採用時、import path 書き換え)
- `dashboard/src/app/analytics/page.tsx` (Option A 採用時、host rename)
- `dashboard/README.md` (Phase 2B-2 section 追記)

**削除 (Option A 採用時)**: `dashboard/src/components/analytics/AnalyticsToastHost.tsx`

**触らない**: schemas, tools, publish-package, assets/visuals, patches, package.json, featureFlags.ts body, sanityWriteClient.ts, updateReactionNotes.ts

### 4-9. Build was NOT run

Docs-only batch のため build 不要。validation:
- `find` で dashboard/src + schemas + tools + publish-package + assets + patches に diff 無いことを確認 (§ Validation 後述)

### 4-10. Confirmation: runtime behavior unchanged

確認項目 (すべて intact):
- 23 routes (Phase 2B-1 implementation 後から変化なし)
- データ取得ロジック (GROQ queries) — touch なし
- feature flags (`enableDiagnostics` / `enableLocalFsRoutes` / `activityLogMode` / `enableWriteActions`) — touch なし
- `/api/asset-thumb` security guards — touch なし
- Sanity schema / publish-package / assets/visuals / patches / package.json — touch なし
- Sanity への write — 依然 Phase 2B-1 の `updateReactionNotes` 1 件のみ、本 batch で新 action は **未実装**

## 5. Key Decisions

- **Schema 不変原則の厳守**: boss prompt の `approved` / `rejected` を schema 拡張で実装する誘惑を退け、`done` / `blocked` への mapping を提案 + Q-2B2-1 で boss judgement
- **6 状態 + 13 transition の allow-list を §3-2 で固定**: state machine を spec で明文化、UI と server の両方で参照
- **`isUndo: boolean` flag を input に追加**: controlled vocabulary 特有の問題 (undo が逆方向 transition を要求するため allow-list bypass が必要) を 1 boolean で表現
- **Confirm modal は terminal 遷移のみ**: UX 認知負荷削減 + Phase 2B-1 undo pattern と整合 + 非 terminal は undo で救う
- **`<UndoToastHost>` 汎用化を推奨**: Phase 2B-1 → 2B-2 → 2B-3 と write surface が増えるたびに N 個 host を増やすコストを回避
- **`completedAt` 自動 patch を本 batch から除外**: undo 対称性を保つため state 単一 patch を維持、Phase 2B-2.1 microbatch 候補
- **`transition-not-allowed` を新規 error kind に**: defense-in-depth、UI bypass / 直接 invoke 防御
- **環境変数追加なし**: Phase 2B-1 の `ENABLE_WRITE_ACTIONS` + `SANITY_WRITE_TOKEN` を再利用、新 flag を作らない
- **server action 設置場所は `lib/actions/`**: Phase 2B-1 と同 directory、複数 action が並ぶ未来を想定
- **Tabs 内 host wrap を採用**: `/campaigns/[slug]` の「確認ゲート」 tab 内に host を置く、tab 切替で undo 機会消失は intentional (Q-6 准拠)

## 6. Human Review Questions (open questions for boss)

Spec §16 に列挙、boss judgement 待ち:

| # | 質問要約 | 推奨案 |
|---|---|---|
| **Q-2B2-1** | `approved`/`rejected` が schema に無い件、`done`/`blocked` で運用 OK? | schema 不変、`done`/`blocked` mapping |
| **Q-2B2-2** | Confirm modal を terminal のみに付ける vs 全 transition | terminal のみ |
| **Q-2B2-3** | `done` 遷移時に `completedAt` 自動 patch するか | しない (state 単一、2B-2.1 候補) |
| **Q-2B2-4** | `<UndoToastHost>` 汎用化 (Option A) vs 別 host 新設 | Option A (汎用化) |
| **Q-2B2-5** | Dropdown UI vs button group | Dropdown (Option A) |
| **Q-2B2-6** | `transition-not-allowed` を UI fileter + server reject 両方? | 両方 (defense-in-depth) |
| **Q-2B2-7** | Tabs 切替で undo 機会消失は intentional? | Yes (Q-6 准拠、current UI session のみ) |

## 7. Risks or Uncertainties

- **Schema 不変原則の固定リスク**: boss が後で「やはり `approved` / `rejected` enum が必要」と判断した場合、schema migration が別 spec batch で必要 + 既存 doc 全てに対する transition planning が必要
- **Undo の cross-tab 動作**: 別 tab で並行編集すると `expectedRevision` が古くなって undo が `conflict` を引く、UX 違和感の可能性 (Phase 2B-1 と同じ既知 risk)
- **Tabs 切替時の undo 消失**: `/campaigns/[slug]` 内で「確認ゲート」 tab から別 tab に切替えると host unmount + undo 消失。spec §16 Q-2B2-7 で boss confirm
- **`isUndo` flag の design rationale が boss に伝わるか**: controlled vocabulary 特有の問題、spec §3-4 で説明済だが boss が「なぜ allow-list を bypass する path が必要?」 と質問する可能性
- **`<UndoToastHost>` 汎用化に伴う Phase 2B-1 への影響**: Option A 採用なら 2B-1 の analytics page が rename を要求される、build 確認が必要 (implementation batch 内で対応)
- **Spec 長さ (約 18 KB)**: Phase 2B-1 spec (28 KB) より短いが、boss が「もっと簡素」 と希望する余地

## 8. Remaining Cleanup Candidates

### 短期 (microbatch)

- **Q 確定 microbatch** (boss が Q-2B2-1〜Q-2B2-7 に judgement → spec を「推奨」 → 「CONFIRMED」 書き換え docs-only batch)
- `dashboard/README.md` の Phase 2B-2 enablement section 先行追加 (implementation batch でも update 予定だが boss が `.env.local` で試したいなら)

### 中期 (Phase 2B-2 implementation batch)

- spec §10 の新規 2-3 + 更新 5-7 ファイルを実装する batch
- `<UndoToastHost>` 汎用化 refactor (Option A 採用時)
- smoke test 13 step

### 中期 (Phase 2B-2.1 microbatch)

- `reviewer` / `notes` / `completedAt` の編集対応 (boss が「state だけでは不足」 と感じれば)
- 同 server action に field allow-list 拡張 or 別 action 新設

### 長期

- **Phase 2B-3 spec** (W1 visual approve & register bridge、Q-3 確定後)
- **Q-4 audit-log schema** 確定後、persistent undo / 詳細監査の検討
- AppShell-level `<UndoToastHost>` lift (handoff/0179 §8 言及)

## 9. Next Recommended Step

**Phase 2B-2 spec の boss review + Q-2B2-1〜Q-2B2-7 確定**

`docs/specs/phase-2b-2-human-review-gates.md` を読み、§16 の 7 open questions に judgement を付ける。特に重要:

1. **Q-2B2-1** (schema authoritative): `approved` / `rejected` を `done` / `blocked` で運用 OK か、schema 拡張が必要か
2. **Q-2B2-3** (`completedAt` 自動 patch): undo 対称性のため本 batch では state のみで OK か
3. **Q-2B2-4** (UndoToastHost 汎用化): Phase 2B-1 の AnalyticsToastHost を rename + generalize する path で OK か

確定後 → Q 確定 microbatch (docs-only) → Phase 2B-2 implementation batch。

---

### Exact prompt for next Claude Code session (Phase 2B-2 Q 確定 microbatch、boss confirm 後)

```
Phase 2B-2 spec の boss 確定を反映する docs-only microbatch を実行してください。

入力:
- docs/specs/phase-2b-2-human-review-gates.md (Claude 推奨案)
- boss の確定回答:
  - Q-2B2-1 = [boss 回答]
  - Q-2B2-2 = [boss 回答]
  - Q-2B2-3 = [boss 回答]
  - Q-2B2-4 = [boss 回答]
  - Q-2B2-5 = [boss 回答]
  - Q-2B2-6 = [boss 回答]
  - Q-2B2-7 = [boss 回答]

タスク:
1. spec §16 の 7 question を「推奨案」 → 「CONFIRMED (YYYY-MM-DD)」 書き換え
2. spec §0 の Confirmed decisions に Q-2B2-* を追記
3. spec §3 / §4 / §5 / §10 を boss 確定後の最終形に update
4. (必要なら) docs/specs/phase-2b-write-actions.md の §0.5 と §6 にも Q-2B2-* を 2B-2 scope として追記
5. devlog/0170 + handoff/0181 + latest.md mirror

constraints:
- docs only、runtime code 変更なし
- Sanity schema 不変
- publish-package / assets/visuals / patches 不変
- package 追加なし
- 「Inventing boss decisions」 しない
```

## 10. Validation

```
=== Out-of-scope file check (expect none) ===
$ find dashboard/src schemas tools publish-package assets/visuals patches \
    -type f -newer docs/handoff/0179-phase-2b-1-smoke-fix.md 2>/dev/null
(empty = OK)

=== Docs files touched in this batch ===
docs/specs/phase-2b-2-human-review-gates.md
docs/devlog/0169-phase-2b-2-human-review-gates-spec.md
docs/handoff/0180-phase-2b-2-human-review-gates-spec.md
docs/handoff/latest.md

=== package.json + sanity-config not touched ===
(verified by find)
```

Build skipped (docs-only). Runtime behavior unchanged: Phase 2B-1 reactionNotes write + Phase 2B-1 smoke fix (undo toast lifetime + topbar pill) remain the only writable surfaces.
