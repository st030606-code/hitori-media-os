# Handoff: Phase 2B-2 humanReviewGate spec — boss decisions applied

Date: 2026-05-20

## 1. Task Goal

handoff/0180 (Phase 2B-2 detail spec) で「Claude 推奨案」 として §16 に書いた 7 件の open question (Q-2B2-1〜Q-2B2-7) に boss 確定回答が出た → spec を「推奨」 から「CONFIRMED」 に書き換える **docs-only microbatch**。

本 batch の出口は **「Phase 2B-2 spec finalized, ready for implementation batch」** 状態。implementation はまだ走らせない。

## 2. Constraints Followed

- ✅ Docs only、dashboard runtime code 変更なし
- ✅ Server actions 未実装 (Phase 2B-1 の `updateReactionNotes` 1 件のみ existing)
- ✅ Sanity schema 変更なし (Q-2B2-1 で明文化)
- ✅ Sanity 書き込みなし (本 batch、Phase 2B-1 の write client + action は touch なし)
- ✅ publish-package files 不変
- ✅ assets/visuals 不変
- ✅ patches 不変
- ✅ package 追加なし、shadcn 追加なし
- ✅ deploy なし
- ✅ Boss 明示の Q-2B2-1〜Q-2B2-7 確定回答のみ反映、他 Q (parent Q-3 / Q-4 / Q-5 / Q-9) は open のまま
- ✅ Field allow-list が state-only に確定 (`reviewer` / `notes` / `completedAt` は本 batch + 後続 2B-2 spec 内では touch しない)
- ✅ Accepted state enum が schema authoritative: `not-started` / `in-progress` / `pending-review` / `done` / `blocked` / `skipped` の 6 値、新規追加なし

## 3. Changed Files

### 更新 (2)

- `docs/specs/phase-2b-2-human-review-gates.md`
  - Header (status + 最終更新日)
  - §0 Confirmed decisions に Phase 2B-2 batch block 追加 (Q-2B2-1〜Q-2B2-7)
  - §2-2 Important note を CONFIRMED 表現に
  - §5-2 dropdown UI を CONFIRMED に、Option A/B 比較を削除
  - §8 Undo strategy heading に CONFIRMED 注釈
  - §9 Cross-page strategy heading に CONFIRMED 注釈、Option A/B/C 比較を削除
  - §10 Files affected の「(Option A 採用時)」 conditional を全削除、新規 3 + 更新 7 + 削除 1 に確定
  - §16 Open questions → Confirmed questions table に書き換え
  - §17 Post-spec next step (Step 1 を strikethrough + Done mark)
- `docs/specs/phase-2b-write-actions.md`
  - §0.5 に **Phase 2B-2 batch (2026-05-20, handoff/0181)** 新セクション追加、Q-2B2-1〜Q-2B2-7 を sentence form で再宣言、Phase 2B-2 spec へ link
  - §6 Open Questions table は変更なし (Phase 2B-2 specific Q は子 spec 内に閉じる、parent Q-3 / Q-4 / Q-5 / Q-9 は open のまま)

### 新規 docs (3)

- `docs/devlog/0170-phase-2b-2-human-review-gates-decisions.md`
- `docs/handoff/0181-phase-2b-2-human-review-gates-decisions.md` (本ファイル)
- `docs/handoff/latest.md` (mirror)

### コード変更 (0)

`dashboard/src/` / `tools/` / `schemas/` / `publish-package/` / `assets/visuals/` / `assets/inbox/` / `patches/` / `package.json` / config files いずれも touch なし。

## 4. Summary of Changes

### 4-1. Boss-confirmed decisions applied (7 件)

| # | Boss answer | spec §への反映 |
|---|---|---|
| **Q-2B2-1** ✅ | Schema 不変。existing 6 enum 値のみ運用。`approved` ≡ `done`、`rejected` は `blocked` (差し戻し) or `skipped` (放棄) に operationally mapping。schema 拡張なし | §0 / §2-2 (Important note) / §3-1 / §3-2 / §15 |
| **Q-2B2-2** ✅ | Confirm modal は terminal (`done` / `skipped`) のみ。非 terminal は 1-click commit + undo toast | §0 / §3-2 / §5-2 / §5-3 |
| **Q-2B2-3** ✅ | `humanReviewGates[_key].state` 単一 field のみ patch。reviewer / notes / completedAt / timestamps は touch しない | §0 / §1 (in scope) / §4-4 / §6 / §15 |
| **Q-2B2-4** ✅ | `<AnalyticsToastHost>` を `<UndoToastHost>` に refactor/rename + generalize。10秒 in-memory undo pattern を再利用。persistent undo log なし、audit-log schema なし | §0 / §8 / §9 / §10-1 / §10-2 / §10-3 |
| **Q-2B2-5** ✅ | Dropdown UI を採用。button group は採用しない | §0 / §5-2 |
| **Q-2B2-6** ✅ | UI + server 両方で allow-list enforce (defense-in-depth) | §0 / §5-2 / §6-2 / §7 / §12 |
| **Q-2B2-7** ✅ | Tab/page navigation で undo 機会消失は intentional、current UI session 限定 (Q-6 准拠) | §0 / §8 |

### 4-2. Phase 2B-2 spec の主要編集

1. **Header**: 「最終更新: 2026-05-20 (Q-2B2-1〜Q-2B2-7 boss confirmed)」 + status を「spec finalized, ready for implementation batch」 に変更
2. **§0 Confirmed decisions** に Phase 2B-2 batch block を追加 (parent + 2B-1 + 2B-2 の 3 階層構造)
3. **§2-2** schema enum table 直下の Important note を「Q-2B2-1 CONFIRMED 2026-05-20」 表現に変更、`approved` / `rejected` の運用 mapping を明示
4. **§5-2** Edit mode 設計から Option A/B 比較を削除、「Q-2B2-5 CONFIRMED: dropdown UI」 + Q-2B2-6 / Q-2B2-2 reference 注釈
5. **§8 Undo strategy** heading を「Q-2B2-4 + Q-2B2-7 CONFIRMED (2026-05-20)」 に、「推奨」 → 「Confirmed」 文言、no persistent undo log / no audit-log schema を明示
6. **§9 Cross-page strategy** heading を「Q-2B2-4 CONFIRMED (2026-05-20)」 に、Option A/B/C 比較を削除、low-risk な refactor path で確定 + fallback ロジック (万一 risk があれば別 host 新設) を明記
7. **§10 Files affected** から「(Option A 採用時)」 conditional をすべて削除、新規 3 + 更新 7 + 削除 1 に確定
8. **§16 Open questions** → **Confirmed questions** table、各 row に boss-confirmed answer + spec への反映 §location
9. **§17 Post-spec next step**: Step 1 (boss が spec を read + judgement) を strikethrough + 「Done 2026-05-20 (handoff/0181)」

### 4-3. Parent spec (phase-2b-write-actions.md) の主要編集

§0.5 を 4 区分構造に拡張:
1. **Parent batch** (2026-05-20, handoff/0175) — Q-1 / Q-2 / Q-7 (既存)
2. **Phase 2B-1 batch** (2026-05-20, handoff/0177) — Q-6 / Q-8 / Q-10 (既存)
3. **Phase 2B-2 batch** (2026-05-20, handoff/0181) — Q-2B2-1〜Q-2B2-7 (新規追加)
4. **Still open** — parent Q-3 / Q-4 / Q-5 / Q-9 (既存、未確定のまま)

§6 Open Questions table は変更なし (parent-level question のみ、Phase 2B-2 specific は子 spec 内で完結)。

### 4-4. No contradictory open-question wording remains

grep 検証:
```
$ grep -n "推奨\|Option A\|採用時" docs/specs/phase-2b-2-human-review-gates.md
(empty)
```

「推奨」 / 「Option A」 / 「採用時」 などの open-question 系 wording は全削除済。残った Q-2B2-* reference はすべて「CONFIRMED」 文脈での参照。

### 4-5. Field allow-list は state-only 確定

spec §4-4 (編集 **しない** field) + §6 server action design + §7 safety model (field allow-list) + §15 Scope exclusions の 4 か所で:
- patch 対象: `humanReviewGates[_key=="<key>"].state` のみ
- 編集しない: `gateName` / `reviewer` / `completedAt` / `notes` / `_key` / 他 campaignPlan field 全般

Phase 2B-2.1 microbatch で `reviewer` / `notes` / `completedAt` 拡張を検討する path は残しているが、本 batch + 後続 implementation batch には含めない。

### 4-6. Build was NOT run

Docs-only batch のため build 不要 (boss spec の「Build not required unless runtime files changed accidentally」)。

### 4-7. Confirmation: runtime behavior unchanged

確認項目 (すべて intact):
- 23 routes (Phase 2B-1 implementation + smoke fix 後から変化なし)
- データ取得ロジック (GROQ queries) — touch なし
- feature flags (`enableDiagnostics` / `enableLocalFsRoutes` / `activityLogMode` / `enableWriteActions`) — touch なし
- Topbar pill (writeReady 評価 + `<ReadOnlyPill>`) — touch なし
- Phase 2B-1 server action (`updateReactionNotes`)、write client (`sanityWriteClient`)、`<AnalyticsToastHost>`、`<ReactionNoteEditor>` — touch なし
- Sanity への write — 依然 Phase 2B-1 reactionNotes 1 件のみ、本 batch で新 action は **未実装**
- Sanity schema / publish-package / assets/visuals / patches / package.json — touch なし

## 5. Key Decisions

- **Schema 不変原則を Q-2B2-1 で明文化**: `approved` / `rejected` の概念を運用 mapping で吸収、schema migration を別 spec batch に分離
- **Confirm modal を terminal のみに絞る**: 非 terminal の誤 click は undo で救う、UX 認知負荷を terminal だけに集約
- **`<UndoToastHost>` 汎用化を low-risk refactor として確定**: build green + 既存 analytics 動作不変 + 単一 file rename + import path 書き換え 2 件、別 host 新設 fallback も spec で明示
- **Allow-list を UI + server 両方で enforce**: defense-in-depth、Phase 2B-1 の `expectedRevision` server-side 再 verify と同思想
- **Undo 機会消失を tab/page 切替で intentional に**: Q-6 准拠、persistent はなし、Q-4 audit-log schema 確定後に再検討
- **親 spec §0.5 を 4 区分構造に拡張**: 「どの batch でどの decision が確定したか」 を可視化、後続 2B-3 / 2B-4 でも同 pattern で追加可能
- **§6 Open Questions table は変更なし**: parent-level Q のみ、child-spec specific Q は子 spec 内で完結 (情報粒度を分離)
- **Field allow-list を 4 か所で重複言及**: spec を斜め読みする implementation 担当者が出口を見失わないための redundancy
- **「Inventing boss decisions」 しない**: parent Q-3 / Q-4 / Q-5 / Q-9 は依然 open のまま、本 batch で勝手に invent しない

## 6. Human Review Questions

本 batch は boss 確定回答の反映のみで、新規 open question を作っていない。Spec 内容についての追加 review が必要なら:

1. §0 の **「Phase 2B-2 batch」** sentence form での confirmed wording: precision 十分か?
2. §9 の **fallback logic** (「万一 risk が顕在化したら別 host (`GateUndoToastHost`) 新設に fallback」): implementation batch で judgement が必要な明確な条件か?
3. §10 の **更新 7 ファイル** リストに `dashboard/README.md` が含まれている: implementation batch で同時 update する想定、それで OK か?
4. §10-3 の **削除 1 ファイル** (`AnalyticsToastHost.tsx`): rename + place 移動なので「削除」表現で正確か? それとも「rename」 表現の方が良いか?

## 7. Risks or Uncertainties

- **Schema 不変原則の長期固定リスク**: 数ヶ月後に「やはり `approved` / `rejected` が欲しい」 と boss が判断したら、schema migration を別 spec batch で起こす必要 (既存 doc 全てへの transition planning + 他 field のリスク評価が必要)。本 batch では Q-2B2-1 で確定 → 短期 implementation を unblock することを優先
- **`<UndoToastHost>` 汎用化の build verification**: spec では low-risk 前提だが、Phase 2B-1 の analytics 側で import path / Context type の差異が顕在化する可能性 (実装 batch で build green を都度確認する想定)
- **Undo の cross-tab 動作**: Phase 2B-1 で既知の risk、Phase 2B-2 でも同様 (`expectedRevision` で防御されるが UX 違和感)
- **`transition-not-allowed` error の i18n string**: spec §12 で文言 fix していないので、implementation batch で「この state には移れません: <previousState> → <nextState>」 の正確な日本語訳を最終決定
- **Spec 長さ**: 約 21 KB に増えた、boss が「もっと簡素」 と希望すれば次 microbatch で要約版を別ファイル化する余地
- **§6 Q-3 / Q-4 / Q-5 / Q-9 の未確定**: 2B-2 implementation には不要だが、Q-4 が後で「audit-log schema 必要」 と確定すると 2B-1 + 2B-2 の undo 設計を再評価する必要が生じる可能性

## 8. Remaining Cleanup Candidates

### 短期 (microbatch)

- **Phase 2B-2 implementation batch** (本 batch の直接後続、推奨 Next step)
- `dashboard/README.md` の Phase 2B-2 enablement section 先行追加 (implementation batch でも update 予定だが boss が `.env.local` を試したいなら)

### 中期 (Phase 2B-2.1 関連)

- `reviewer` / `notes` / `completedAt` 編集対応 spec + 実装 (boss が「state だけでは不足」 と判断すれば)
- `done` 遷移時の `completedAt: new Date().toISOString()` 自動 patch を検討 (Q-2B2-3 で本 batch では除外、2B-2.1 で再評価可)

### 中期 (Phase 2B-3 spec)

- W1 visual approve & register bridge spec、parent Q-3 確定後
- Phase 2B-1 + 2B-2 で固めた template (server action / 5-layer safety / `<UndoToastHost>` / `expectedRevision` required) を W1 に転用

### 長期

- **Q-4 (audit-log schema)** 確定後の persistent undo / 詳細監査の検討
- **`<UndoToastHost>` を AppShell level に lift** (handoff/0179 §8 言及、Phase 2B-3 以降の cleanup)
- **`DeferredActionButton` 削除** (各 page の placeholder button を実 action に置換完了後)

## 9. Next Recommended Step

**Phase 2B-2 humanReviewGate implementation batch**

Spec が finalized したので、次は **実装**。`docs/specs/phase-2b-2-human-review-gates.md` §10 + §14 に従い:

- 新規 (3): `lib/actions/updateGateState.ts`、`components/gates/GateStateControl.tsx`、`components/common/UndoToastHost.tsx`
- 更新 (7): `lib/groq/campaign.ts`、`app/human-review-gates/page.tsx`、`app/campaigns/[slug]/page.tsx`、`lib/statusJa.ts` (re-verify)、`components/analytics/ReactionNoteEditor.tsx` (import path)、`app/analytics/page.tsx` (host rename)、`dashboard/README.md`
- 削除 (1): `components/analytics/AnalyticsToastHost.tsx`
- 受け入れ基準: spec §14 の 10 項目すべて green
- 1 PR で完結する規模 (Phase 2B-1 implementation と同等)

---

### Exact prompt for next Claude Code session (Phase 2B-2 implementation batch)

```
Phase 2B-2 humanReviewGate state update の implementation batch を実行してください。

入力:
- docs/specs/phase-2b-2-human-review-gates.md (finalized, all 2B-2 Q confirmed)
- docs/handoff/0181-phase-2b-2-human-review-gates-decisions.md (本 batch、boss confirmations)
- docs/specs/phase-2b-1-reaction-notes.md (template 元、4-layer safety + server action shape)
- docs/handoff/0178 + 0179 (Phase 2B-1 implementation + smoke fix の lessons)

タスク:
1. 新規ファイル (3):
   - dashboard/src/lib/actions/updateGateState.ts ('use server', 10 step flow, transition allow-list + isUndo bypass, expectedRevision required)
   - dashboard/src/components/gates/GateStateControl.tsx ('use client', dropdown UI, terminal 遷移で confirm modal)
   - dashboard/src/components/common/UndoToastHost.tsx (Phase 2B-1 AnalyticsToastHost を rename + generalize)

2. 更新ファイル (7):
   - dashboard/src/lib/groq/campaign.ts (campaignDetailBySlugQuery + pendingHumanReviewGatesQuery に _rev + _key 追加)
   - dashboard/src/app/human-review-gates/page.tsx (各 row に <GateStateControl> + <UndoToastHost> wrap)
   - dashboard/src/app/campaigns/[slug]/page.tsx (<GatesSection> 内で <GateStateControl> + Tabs 内に <UndoToastHost>)
   - dashboard/src/lib/statusJa.ts (skipped label 確認、不要なら無編集)
   - dashboard/src/components/analytics/ReactionNoteEditor.tsx (import path → @/components/common/UndoToastHost)
   - dashboard/src/app/analytics/page.tsx (<AnalyticsToastHost> → <UndoToastHost> rename)
   - dashboard/README.md (Phase 2B-2 enablement / state transition table / scope 追記)

3. 削除 (1):
   - dashboard/src/components/analytics/AnalyticsToastHost.tsx (UndoToastHost に rename + place 移動済のため)

4. 受け入れ基準 (spec §14 の 10 項目すべて green):
   - build 23 routes green、TypeScript clean
   - 既存 read-only 動作維持 (writeReady=false で UI 完全維持)
   - writeReady=true で 13 transition すべて smoke test 通過
   - terminal (done/skipped) で confirm modal
   - 10秒 undo で previousState 復帰、row unmount に耐える
   - Studio 並行編集で conflict → reload
   - transition-not-allowed を server で reject
   - SANITY_WRITE_TOKEN が client bundle に inline されていない
   - state 以外の field が touch なし
   - Phase 2B-1 reactionNotes 動作不変、既存 routes に変化なし

5. devlog + handoff + latest.md mirror

constraints:
- Sanity schema 不変
- publish-package / assets/visuals / patches 不変
- package 追加なし、shadcn 追加なし
- Vercel への env 設定なし
- production / preview deploy では writeReady === false が保証されることを build で確認
```

## 10. Validation

```
=== Out-of-scope file check (expect none) ===
$ find dashboard/src schemas tools publish-package assets/visuals patches \
    -type f -newer docs/devlog/0169-phase-2b-2-human-review-gates-spec.md 2>/dev/null
(empty = OK)

=== Docs files touched in this batch ===
docs/specs/phase-2b-2-human-review-gates.md (updated)
docs/specs/phase-2b-write-actions.md (updated, §0.5 only)
docs/devlog/0170-phase-2b-2-human-review-gates-decisions.md (new)
docs/handoff/0181-phase-2b-2-human-review-gates-decisions.md (new)
docs/handoff/latest.md (mirror)

=== Stale open-question wording check ===
$ grep -n "推奨\|Option A\|採用時" docs/specs/phase-2b-2-human-review-gates.md
(empty = OK)

=== package.json + sanity-config not touched ===
(verified by find)
```

Build skipped (docs-only). Runtime behavior unchanged: Phase 2B-1 reactionNotes write + Phase 2B-1 smoke fix (undo toast lifetime + topbar pill) remain the only writable surfaces.
