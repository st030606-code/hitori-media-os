# Handoff: Phase 2B write actions spec (docs only)

Date: 2026-05-20

## 1. Task Goal

Phase UI-fidelity cycle 完了後の **戦略的次の段階**として「dashboard 上でどの書き込みを行うか / どれを CLI / Studio に残すか」の boundary を確定する **planning spec docs only batch**。実装は **scope 外**、boss confirmation 集約が主目的。

## 2. Constraints Followed

- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし
- ✅ publish-package files 不変
- ✅ assets/visuals 不変
- ✅ patches 不変
- ✅ deploy なし
- ✅ package 追加なし
- ✅ runtime dashboard code 変更なし
- ✅ Server actions / API routes 実装なし
- ✅ Docs-only batch

## 3. Changed Files

### 新規 docs (4)

- `docs/specs/phase-2b-write-actions.md` (新ディレクトリ `docs/specs/` 含む) — 10 章構成 (背景 / 候補 / prioritization / safety / boundary / sequence / open questions / non-goals / cleanup chain / implementation sequence / out of scope)
- `docs/devlog/0163-phase-2b-write-actions-spec.md`
- `docs/handoff/0174-phase-2b-write-actions-spec.md` (本ファイル)
- `docs/handoff/latest.md` (mirror)

### コード変更 (0)

dashboard / Sanity Studio / tools / schemas いずれも touch なし。

## 4. Summary of Changes

### 4-1. Spec file created

`docs/specs/phase-2b-write-actions.md` 新規作成 (1 file + 1 directory)。

Sections:
- §0 なぜ Phase 2B か
- §1 Write action candidates (8 件: W1-W8)
- §2 Prioritization (4 buckets)
- §3 Safety Model (8 項目)
- §4 Responsibility Boundary (ASCII diagram + sub-sections)
- §5 Recommended Implementation Sequence (2B-1 〜 2B-6)
- §6 Open Questions for Boss (Q-1 〜 Q-10)
- §7 Non-Goals (8 項目)
- §8 Cleanup Chain after Phase 2B
- §9 Implementation Sequence Summary (visual flow)
- §10 Out of Scope

### 4-2. Main write surfaces classified

| # | Action | Bucket | Bench (boss workflow) |
|---|---|---|---|
| W1 | Approve & register visual candidate | **2B P1** | mid: bridge to Visual Register, or full reimplement (boss Q-3) |
| W2 | Regenerate visual candidate (prompt + codex exec) | **CLI-only** | low: subprocess complexity, CLI sufficient |
| W3 | `reactionNotes` editing | **2B P0** | high: 24-72h boss task, `/analytics` で可視化済 |
| W4 | Campaign metadata edit | **2B later (light only)** | low: Studio が editing UX 優れる、ただし status / automationLevel のワンクリック更新は P1 候補 |
| W5 | `humanReviewGates[].state` update | **2B P0** | high: `/human-review-gates` でワンクリック化 |
| W6 | `manualPublishingStatus[].publishedUrl` / `publishedAt` update | **2B later** | mid: reflect-publication-state.mjs で運用中、置き換え ROI 微妙 |
| W7 | promptTemplate / configurator output save | **CLI-only (boss 議論待ち)** | mid: CLAUDE.md 方針との緊張 |
| W8 | `publishPackagePaths[].state` / publish-package status update | **2B later** | low: publish-package-builder/build.mjs の出口 |

### 4-3. Recommended first implementation batch

**2B-1: W3 reactionNotes write** (boss Q-7 で確認後)

- 範囲: `/analytics` の `ReactionNotesCard` / `PendingMonitoringCard` 内に inline edit
- 実装規模: 単一 field の文字列 edit、schema 拡張なし、副作用なし、1 PR で完結
- 前提: boss が Q-1 (write token 配置) + Q-2 (production disable 方針) を回答

詳細は spec §5 / §6。

### 4-4. Open boss decisions (10 件)

| Q | 主旨 | 影響 |
|---|---|---|
| Q-1 | `SANITY_WRITE_TOKEN` 配置: `.env.local` で良いか? | 全 Phase 2B start の前提 |
| Q-2 | Production deploy で write を絶対 disable する方針で OK か? | env flag 設計 |
| Q-3 | W1 visual approve: bridge (A) or reimplement (B)? | 2B-3 batch scope |
| Q-4 | Sanity 内 audit-log schema 拡張するか? | schema 不変方針との緊張 |
| Q-5 | reflect-*.mjs script との並存戦略? | 復旧手段の冗長性 |
| Q-6 | undo は in-memory or Sanity history? | UI 複雑度 |
| Q-7 | 最初の batch は W3 (推奨) で良いか? それとも W5 が先? | 2B-1 / 2B-2 順序 |
| Q-8 | `_rev` conflict は単純な「再読み込み」メッセージで良いか? | error handling |
| Q-9 | W7 (configurator save) は dataset 投入後に議論で OK か? | 2B-6+ timing |
| Q-10 | 自動 devlog 生成は scope 外で良いか? | audit log boundary |

### 4-5. Validation

- grep 確認: runtime files 変更なし (src/ は touch なし)
- Sanity schema / publish-package / assets / patches / package.json — touch なし
- Docs only batch、build skipped (per spec)

### 4-6. Confirmation: no runtime behavior changed

実 grep:
```bash
$ git diff --stat -- dashboard/src
(no changes)
$ git diff --stat -- schemas
(no changes)
$ git diff --stat -- tools
(no changes)
```

すべて clean。dashboard 23 routes / Sanity Studio 動作は完全に前 batch (handoff/0173) と同一。

## 5. Key Decisions

- **planning spec を 1 文書に集約**: write boundary / safety / sequence を 1 か所で boss が一読できるように、後で 2B-1〜2B-5 spec 個別に分解
- **`enableWriteActions` env flag を最初の defense line**: production で write を絶対 enable しない契約を 1 行 (`SANITY_WRITE_TOKEN` 存在 + flag both required) で表現
- **P0 を W3 + W5 のみに絞る**: 「dashboard で行う動機が明確」「単一 field の単純な更新」「副作用なし」の 3 条件を満たすのが reactionNotes と gate state のみ
- **W1 (visual approve) を P1 に**: Visual Register CLI と並存させる「bridge 化」が安全だが boss 判断点 (Q-3) なので P0 から外す
- **W2 (regenerate) を CLI-only**: subprocess spawn は dashboard には重い、Visual Register CLI で十分
- **W7 (configurator save) を CLI-only + boss 議論待ち**: CLAUDE.md 「API なしで始める」方針との緊張、現在の「手動コピペ → outputs/ 配置」運用を変える strong reason がない
- **`docs/specs/` ディレクトリ新規作成**: 今後の spec を category 分けする入口、`docs/` 直下が膨らみすぎを抑える

## 6. Human Review Questions

(spec §6 と同じ 10 件、ここでは summary):

1. write token 配置 (Q-1)
2. production disable 方針 (Q-2)
3. W1 option A/B 選択 (Q-3)
4. audit-log schema 拡張 (Q-4)
5. reflect-*.mjs 並存 (Q-5)
6. undo 方式 (Q-6)
7. P0 batch 順 (Q-7)
8. conflict handling (Q-8)
9. W7 timing (Q-9)
10. 自動 devlog (Q-10)

Boss が回答する順番 (推奨): **Q-1, Q-2 → 後の全項目**。Q-1/Q-2 が「write は絶対 enable しない」になれば本 spec 自体が再評価 (Phase 2B 中止 / 期間延期)。

## 7. Risks or Uncertainties

- **spec の規模 (10 章)**: boss が 1 度に読むには長い、§1-2 (priority) + §6 (open questions) だけでも判断可能
- **Q-3 (visual approve bridge or reimplement)**: 答え次第で 2B-3 batch のサイズが 2-3× 変わる
- **Q-4 (audit-log schema)**: 「schema 拡張あり」なら別 spec batch が必要、Phase 2B P0 land を遅らせる可能性
- **write token leak risk**: `enableWriteActions` flag + `SANITY_WRITE_TOKEN` requirement だけでは production deploy で誰かが手動で env を set した場合に enable される。Vercel scoped env / 2-factor 等の boss 判断点が暗黙的にあり、本 spec で完全 cover していない
- **同時編集 conflict**: solo boss なら極稀 (Q-8 で「再読み込みで済ます」確認)、複数 user 想定 (Phase Settings-2 multi-workspace) があると別議論

## 8. Remaining Cleanup Candidates

### 短期 (microbatch)

- spec §6 Q-1 〜 Q-10 を boss 回答 → 各回答を spec 内に追記 → microbatch で `docs/specs/phase-2b-write-actions.md` を更新

### 中期 (Phase 2B 着手後)

- Phase 2B-1 spec (W3 reactionNotes 詳細 spec)
- Phase 2B-1 implementation
- Phase 2B-2 〜 2B-5

### 長期

- `DeferredActionButton.tsx` 削除 (Phase 2B 全 batch 完了後)
- `LocalModeBanner.tsx` 削除 (Phase D2 完了後、Phase 2B と独立)
- comment breadcrumb 整理 (Phase 2B 後)
- `reflect-*.mjs` の段階的縮約 (Q-5 依存)

## 9. Next Recommended Step

**Option A (推奨) — boss が spec を読む + Q-1 〜 Q-10 回答**

`docs/specs/phase-2b-write-actions.md` を読み、最低限 Q-1 / Q-2 / Q-7 (write token 配置 + production disable + 最初の batch) を回答。それ以外の Q は **2B-1 着手時** に確定でも OK。

回答が集まったら:

```text
Apply boss decisions to phase-2b-write-actions spec.

Use:
- docs/specs/phase-2b-write-actions.md
- boss answers to Q-1 to Q-10 (paste in this prompt)

Hard Rules:
- Docs only
- Update §6 to reflect boss decisions
- No code changes

Tasks:
1. Update spec §6 with confirmed answers
2. Update §2 prioritization if any reorder is needed
3. Add docs/devlog/0164-phase-2b-decisions.md
4. Add docs/handoff/0175-phase-2b-decisions.md + latest mirror
```

**Option B — Phase 2B-1 (W3 reactionNotes) detail spec を先に書く**

boss 回答前でも W3 の詳細 spec (UI / server action 設計 / dry-run flow / edge cases) を先に書く選択肢。Q-7 が「W3 で OK」前提なら時間節約。

**Option C — 並行 / 別 track**

- Tabs integration P1 spec (`/campaigns/[slug]` 8 → 5-6)
- promptTemplate dataset 投入 (boss task)
- external analytics API spec (Phase Analytics-2、Phase 2B と独立)
- LocalModeBanner cleanup (Phase D2 build-time snapshot 戦略の一部、Phase 2B 不要)
