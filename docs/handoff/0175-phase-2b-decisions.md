# Handoff: Phase 2B boss decisions applied

Date: 2026-05-20

## 1. Task Goal

handoff/0174 で起こした Phase 2B write actions spec の §6 Open Questions 10 件のうち、boss が確定した **3 件 (Q-1 / Q-2 / Q-7)** を spec 本体に反映する **docs-only microbatch**。残り 7 件 (Q-3 / Q-4 / Q-5 / Q-6 / Q-8 / Q-9 / Q-10) は依然 open、boss instruction「Do not invent boss decisions」に従って **invent しない**。

## 2. Constraints Followed

- ✅ Docs only、runtime code 変更なし
- ✅ Write actions 実装なし
- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ publish-package files 不変
- ✅ assets/visuals / patches 不変
- ✅ deploy なし
- ✅ package 追加なし
- ✅ Inventing boss decisions なし (残り Q は open のまま)

## 3. Changed Files

### 更新 (1)

- `docs/specs/phase-2b-write-actions.md` — §0.5 新設 / §2 P0 heading 更新 / §6 table 3 行に ✅ マーク + 確定文言

### 新規 docs (3)

- `docs/devlog/0164-phase-2b-decisions.md`
- `docs/handoff/0175-phase-2b-decisions.md` (本ファイル)
- `docs/handoff/latest.md` (mirror)

### コード変更 (0)

`dashboard/src` / `tools/` / `schemas/` / `publish-package` / `assets/visuals` / `patches` / `package.json` いずれも touch なし。

## 4. Summary of Changes

### 4-1. Confirmed decisions applied (3 件)

| # | Boss answer | spec への反映場所 |
|---|---|---|
| **Q-1** ✅ | `SANITY_WRITE_TOKEN` は `dashboard/.env.local` 専用、Vercel production / preview には設定しない | §0.5 + §6 Q-1 row |
| **Q-2** ✅ | Production write は永久 disabled、`enableWriteActions` + `SANITY_WRITE_TOKEN` 両方揃った local/dev のみ発火、「特定 user 限定」future path 想定せず | §0.5 + §6 Q-2 row |
| **Q-7** ✅ | 2B-1 = W3 reactionNotes、2B-2 = W5 humanReviewGate state update の順 | §0.5 + §2 P0 heading + §6 Q-7 row |

### 4-2. Spec 編集の詳細

3 か所:

1. **§0.5「Confirmed decisions (2026-05-20)」を新設** (旧 §0 と §1 の間に insert):
   - 3 boss decision を箇条書きで明示
   - 「これだけで 2B-1 spec + implementation start に十分」と明文化
   - 残り 7 件は §6 で tracking と明示
2. **§2 P0 heading 更新**:
   - 旧: 「Phase 2B P0 (最初の implementation batch、boss 確認後すぐ)」
   - 新: 「Phase 2B P0 (2 つの separate batch、W3 が先、W5 が後 — boss confirmed Q-7)」
   - W3 / W5 bullet 先頭に「Phase 2B-1」「Phase 2B-2」ラベル追加
3. **§6 table の 3 行**:
   - Q-1 / Q-2 / Q-7 に **✅ マーク** + 「(CONFIRMED 2026-05-20) ... → Yes: ...」 確定文言を追加
   - 他 7 行 (Q-3 / Q-4 / Q-5 / Q-6 / Q-8 / Q-9 / Q-10) は **無変更** で open のまま

§5 Recommended Implementation Sequence は **無変更** (元から 2B-1 = W3, 2B-2 = W5 の記述、boss confirmation が裏付け)。
§3 Safety Model も **無変更** (`enableWriteActions` flag + `SANITY_WRITE_TOKEN` 両方必須は元から記述済、Q-1/Q-2 確定で再確認のみ)。

### 4-3. Remaining open questions (7 件)

| # | 質問 | 確定タイミング想定 |
|---|---|---|
| Q-3 | W1 visual approve は option A (bridge) or B (reimplement)? | 2B-3 着手時 |
| Q-4 | Sanity 内 audit-log schema 拡張するか? | audit が必要になった時 |
| Q-5 | `reflect-*.mjs` script 並存戦略? | Phase 2B 全 batch 完了後 |
| Q-6 | undo は in-memory or Sanity history? | 2B-1 着手時 (W3 で必要になる) |
| Q-7 | (CONFIRMED — table 上は ✅) | — |
| Q-8 | `_rev` conflict handling? | 2B-1 着手時 |
| Q-9 | W7 (configurator save) の timing? | promptTemplate dataset 投入後 |
| Q-10 | 自動 devlog 生成 scope? | 2B-1 着手時 or 後で |

### 4-4. Prioritization changed?

**No — `§5 Recommended Implementation Sequence` は無変更**。spec は元から「2B-1 = W3 reactionNotes」「2B-2 = W5 gate state」の順を記述しており、Q-7 の boss confirmation は元の plan を **裏付ける**形になった。

§2 P0 の heading のみ「最初の implementation batch」(singular) から「2 つの separate batch、W3 が先」(plural) に変更し、boss confirmation を明示。

### 4-5. Confirmation: no runtime behavior changed

mtime check (この microbatch で touch されたファイル):

```bash
$ find docs -mmin -10 -type f
docs/devlog/0164-phase-2b-decisions.md
docs/handoff/0175-phase-2b-decisions.md
docs/handoff/latest.md
docs/specs/phase-2b-write-actions.md  # spec 本体への 3 edit
$ find dashboard/src tools schemas -mmin -10 -type f
(empty)
```

- `dashboard/src/` / `tools/` / `schemas/` / `publish-package/` / `assets/visuals/` / `patches/` — **すべて touch なし**
- `package.json` — touch なし
- 23 routes / Sanity Studio 動作 — 完全に前 batch (handoff/0174) と同一
- build / test スクリプト触らず

## 5. Key Decisions

- **Inventing boss decisions を厳格に回避**: 残り 7 件 (Q-3 / Q-4 / Q-5 / Q-6 / Q-8 / Q-9 / Q-10) を spec 上で「open」状態のまま保持。boss instruction を厳守
- **§0.5「Confirmed decisions」 セクションを top 付近に**: spec の長さ (10 章) を considering、boss decision summary を §1 直前に置くことで再読時の navigation を改善
- **§2 heading を 2 batch 化**: Q-7 確定で「W3 first、then W5」が確定、heading の singular 表現を plural に修正
- **§5 / §3 / §4 は無変更**: これら sections は元から W3 → W5 順序 + `enableWriteActions` + `SANITY_WRITE_TOKEN` 両必須を記述、boss confirmation は元の spec 内容を裏付けるのみ
- **✅ マーク表記**: §6 table で boss が確定済 Q を「✅」+「(CONFIRMED 2026-05-20)」 形式で明示、残り open と一目で区別

## 6. Human Review Questions

1. **§0.5 Confirmed decisions セクション**: 内容と位置 (§0 と §1 の間) に違和感ないか
2. **§6 table の ✅ マーク表記**: 確定 / open の見分けが boss にとって明確か
3. **§2 P0 heading 更新文言**: 「2 つの separate batch、W3 が先、W5 が後 — boss confirmed Q-7」、boss が違和感感じれば 1 行 trim 可能
4. **残り 7 Q の確定 timing**: 「2B-1 着手時に Q-6 / Q-8 / Q-10、2B-3 着手時に Q-3、Phase 2B 全完了後に Q-5、promptTemplate dataset 投入後に Q-9、audit が必要になった時に Q-4」の流れで boss OK か

## 7. Risks or Uncertainties

- **Q-6 (undo) を 2B-1 着手時に決めるリスク**: undo 方式 (in-memory or Sanity history) は W3 spec の UI 設計に影響大、2B-1 spec 着手時に確定しないと implementation で迷う
- **Q-8 (conflict handling)**: solo boss workflow なら極稀想定、ただし confidence 100% ではない。最初の 1 実 write で boss が conflict 体験することで方針が明確化する可能性
- **`enableWriteActions` flag の env 名固定**: spec は flag 名を `enableWriteActions` と書いているが、boss が `ENABLE_WRITE_ACTIONS` (UPPER_SNAKE) や `DASHBOARD_WRITE_ENABLED` 等を好む可能性、2B-1 着手時に最終確定
- **Vercel preview env への波及**: 「production」だけでなく「preview」 deploy も write disabled が必須 (production と preview は同じ Vercel project の異なる branch deploy)、Q-2 の解釈で「preview も含めて disable」を明確化する文言を 2B-1 spec で追加検討

## 8. Remaining Open Items

### 短期 (2B-1 spec で確定する想定)

- Q-6 (undo 方式)
- Q-8 (conflict handling)
- Q-10 (自動 devlog 範囲)
- `enableWriteActions` 環境変数の最終名
- Vercel preview env への `SANITY_WRITE_TOKEN` 設定禁止の明示

### 中期 (各 batch 着手時)

- Q-3 → 2B-3 batch 着手時
- Q-4 → audit が必要になったタイミング
- Q-9 → promptTemplate dataset 投入後

### 長期 (Phase 2B 全完了後)

- Q-5 (`reflect-*.mjs` 並存戦略)
- `DeferredActionButton` / `LocalModeBanner` 削除
- comment-only historical breadcrumb 整理

## 9. Next Recommended Step

**Option A (推奨) — Phase 2B-1 detail spec docs only batch**

`docs/specs/phase-2b-1-reaction-notes.md` を起こす。内容:
- W3 reactionNotes write 詳細 UI mockup (`/analytics/ReactionNotesCard` + `PendingMonitoringCard` の inline edit 設計)
- server action 設計 (`updateReactionNotes` action、input shape、dry-run output shape、execute output shape)
- error class mapping (validation / permission / conflict / unknown)
- undo 戦略 (Q-6 を ここで確定、in-memory 推奨)
- `enableWriteActions` 実装詳細 (env var 名、`lib/featureFlags.ts` 拡張、`.env.local` 例)
- Vercel preview env への波及 (Q-2 の延長線、preview も disable 明示)
- `SANITY_WRITE_TOKEN` の存在チェック設計 (server action 起動時)
- audit log の console + in-memory 設計
- confirmation UI mock
- test plan (manual / unit / integration)

```text
Create Phase 2B-1 detail spec for W3 reactionNotes write.

Use:
- docs/specs/phase-2b-write-actions.md (parent spec, §0.5 confirmed decisions)
- docs/handoff/0175-phase-2b-decisions.md (latest)
- dashboard/src/components/analytics/ReactionNotesCard.tsx (current UI)
- dashboard/src/components/analytics/PendingMonitoringCard.tsx (current UI)
- tools/sanity/reflect-publication-state.mjs (controlled-write pattern reference)

Hard Rules:
- Docs only (no implementation)
- Do NOT modify Sanity schema
- Do NOT write to Sanity
- Do NOT add packages
- Do NOT deploy

Tasks:
1. Read parent spec + current ReactionNotesCard / PendingMonitoringCard
2. Draft docs/specs/phase-2b-1-reaction-notes.md with sections: UI design / server action / error handling / undo / env flag / audit log / test plan
3. Resolve Q-6 (undo) + Q-8 (conflict) + Q-10 (devlog) within this spec
4. Confirm Vercel preview env disable in §3-5 boundary
5. Add docs/devlog/0165-phase-2b-1-reaction-notes-spec.md
6. Add docs/handoff/0176-phase-2b-1-reaction-notes-spec.md + latest mirror
```

**Option B — Phase 2B-1 implementation directly (if W3 spec already feels well-scoped)**

handoff/0174 §5 の 2B-1 description は十分 specific、boss が「more spec is overengineering」と判断すれば直接 implementation batch に進める。

**Option C — 並行 / 別 track (Phase 2B と独立)**

- Tabs integration P1 spec (`/campaigns/[slug]` 8 → 5-6)
- promptTemplate dataset 投入 (boss task)
- external analytics API spec (Phase Analytics-2)
