# Phase 2B-2 humanReviewGate spec — boss decisions confirmed

日付: 2026-05-20

## 背景

handoff/0180 (devlog 0169) で起こした Phase 2B-2 humanReviewGate state update detail spec に対し、§16 で 7 件の open question (Q-2B2-1〜Q-2B2-7) を「Claude 推奨案」として明示していた。boss が本日 7 件すべてに確定回答を出した → spec を「推奨」から「CONFIRMED」に書き換える docs-only microbatch。

implementation はまだ走らせない。本 batch の目的は「spec を最終形に固定」して次の implementation batch に渡せる状態を作ること。

## 決定・変更

### Boss-confirmed answers (7 件)

| # | Topic | Confirmed answer |
|---|---|---|
| **Q-2B2-1** | State enum / schema | **Schema 不変**。existing 6 値 (`not-started` / `in-progress` / `pending-review` / `done` / `blocked` / `skipped`) のみ。`approved` ≡ `done`、`rejected` は理由により `blocked` or `skipped` に operationally mapping。新規 enum 値追加なし |
| **Q-2B2-2** | Confirm modal | terminal (`done` / `skipped`) のみ。非 terminal は 1-click commit + undo toast で救う |
| **Q-2B2-3** | Field allow-list | **`humanReviewGates[_key].state` 単一 field のみ** patch。`reviewer` / `notes` / `completedAt` / timestamps は touch しない |
| **Q-2B2-4** | Undo host | Phase 2B-1 `<AnalyticsToastHost>` を `<UndoToastHost>` に refactor/rename + generalize。同じ 10秒 in-memory undo pattern。persistent undo log なし、audit-log schema なし |
| **Q-2B2-5** | UI control | **Dropdown** を採用。button group は採用しない |
| **Q-2B2-6** | Allow-list 防御 | **両方** で enforce — UI が available transitions を事前 filter する + server action が `transition-not-allowed` で reject する |
| **Q-2B2-7** | Undo session scope | Tab / page navigation で undo 機会消失は **intentional**。Current UI session 限定 (Q-6 准拠) |

### 更新 (2)

- `docs/specs/phase-2b-2-human-review-gates.md`
  - Header: 最終更新日 + status「spec finalized, ready for implementation batch」
  - §0 — Phase 2B-2 batch confirmed decisions block 追加 (Q-2B2-1〜Q-2B2-7)
  - §2-2 — schema authoritative の confirmation note を「**Important** (Q-2B2-1 CONFIRMED 2026-05-20)」 に書き換え、運用 mapping を明示
  - §5-2 — Option A/B 比較を削除、「Q-2B2-5 CONFIRMED: dropdown UI」 + Q-2B2-6 / Q-2B2-2 reference 追記
  - §8 — Undo strategy heading「Q-2B2-4 + Q-2B2-7 CONFIRMED」、推奨案を confirmed 表現に
  - §9 — Cross-page strategy heading「Q-2B2-4 CONFIRMED」、Option A/B/C 比較を削除、low-risk な refactor path で確定 + fallback ロジック
  - §10 — Files affected の「(Option A 採用時)」 conditional をすべて削除、新規 3 + 更新 7 + 削除 1 に確定
  - §16 — Open questions table を **Confirmed questions** table に書き換え、各 row に boss-confirmed answer + spec への反映場所
  - §17 — Post-spec next step 1 を strikethrough + 「Done 2026-05-20 (handoff/0181)」
- `docs/specs/phase-2b-write-actions.md`
  - §0.5 — **Phase 2B-2 batch** 新セクションを Phase 2B-1 batch の下に追加、Q-2B2-1〜Q-2B2-7 を sentence form で再宣言、Phase 2B-2 spec へ link

### 新規 docs (3)

- `docs/devlog/0170-phase-2b-2-human-review-gates-decisions.md` (本ファイル)
- `docs/handoff/0181-phase-2b-2-human-review-gates-decisions.md`
- `docs/handoff/latest.md` (mirror)

### コード変更 (0)

`dashboard/src/` / `tools/` / `schemas/` / `publish-package/` / `assets/visuals/` / `assets/inbox/` / `patches/` / `package.json` / config files いずれも touch なし。Sanity への write も 0 件 (Phase 2B-1 の `updateReactionNotes` 1 件のみ 引き続き)。

## 理由

### なぜ schema 不変原則を Q-2B2-1 で固定したか

「`approved` / `rejected` を schema に追加」 path は理論上可能だが、boss は CLAUDE.md の方針 (「明示的に依頼されるまで API 連携を追加しない」+「Sanity schema 変更なし」) + Phase 2B-1 で築いた「`done` = approved 運用」を尊重して **schema 不変** を選択。`rejected` を運用で `blocked` (差し戻し) / `skipped` (放棄) に分けることで、意味的な区別は維持される。

### なぜ confirm modal を terminal のみに絞ったか

非 terminal 遷移 (例: `in-progress` → `pending-review`) は **undo toast で救える** ので modal 不要。terminal 遷移 (`done` / `skipped`) は dashboard 上で再開不可 (Studio で手動編集が必要) なので、確認段を 1 つ挟む。UX 認知負荷を terminal だけに集約。

### なぜ `<UndoToastHost>` 汎用化を採用したか

Phase 2B-1 `<AnalyticsToastHost>` を rename + place 移動するだけで、:
- 2B-1 の動作は変わらない (build green を維持)
- 2B-2 の 2 surface (`/human-review-gates`, `/campaigns/[slug]`) で再利用可能
- 将来 2B-3+ で write surface が増えてもさらに使い回せる

別 host を作るより refactor cost が低い。`low-risk な前提` 条件: build green + 既存 analytics 動作不変。万一 risk が顕在化したら別 host (`GateUndoToastHost`) に fallback と明示。

### なぜ allow-list を UI + server の両方で

UI 側 filter だけだと、開発者ツールから直接 server action を invoke することで bypass される。Server 側 reject だけだと、UI に「無効な選択肢が並んで click したら error」 という UX 劣化。**両方** で enforce することで:
- UX: UI に valid transitions のみ表示 → user friction なし
- Security: server が最終 gatekeeper → API tampering 防御

これは Phase 2B-1 の `expectedRevision` server-side 再 verify と同じ defense-in-depth 思想。

### なぜ tab/page 切替で undo 消失を許容したか

Q-6 confirmed「current UI session のみ」と整合。永続化したいなら audit-log schema (Q-4) が必要 → 別 spec batch。本 batch では「直前 1 step を 10 秒救う」 だけで boss workflow の 95% を救済。

### 親 spec §0.5 への 2B-2 セクション追加

Phase 2B 親 spec は今後 2B-3 / 2B-4 と続く。各 batch の confirmed decisions の起源を可視化するため、§0.5 を「Parent batch / Phase 2B-1 batch / Phase 2B-2 batch / Still open」 の 4 区分構造に拡張。後続 reader が「どの batch でどの decision が確定したか」 を 1 か所で辿れる。

親 spec §6 Open Questions table は parent-level question (Q-1 to Q-10) のみで、Phase 2B-2 specific question (Q-2B2-1 to Q-2B2-7) は子 spec 内に閉じる。§6 への ✅ row 追加は不要。

## 影響

- リポジトリ: `docs/specs/` 2 件 (2B-2 + 親) + `docs/devlog/0170` + `docs/handoff/0181` + `docs/handoff/latest.md`。dashboard runtime は不変
- ワークフロー: spec finalized → 次は **Phase 2B-2 implementation batch** (新規 3 + 更新 7 + 削除 1 ファイル)
- スキーマ: 不変 (Q-2B2-1 で明文化)
- プロダクト方針: Phase 2B-1 と Phase 2B-2 が同 pattern (server action / 4-5 layer safety / `<UndoToastHost>` / `expectedRevision` required) で揃った、3 件目以降の write surface 追加コストが下がる

## 次の一手

**Option A (推奨) — Phase 2B-2 implementation batch**

Spec が finalized なので、次は実装:

- 新規 (3): `lib/actions/updateGateState.ts`、`components/gates/GateStateControl.tsx`、`components/common/UndoToastHost.tsx`
- 更新 (7): `lib/groq/campaign.ts`、`app/human-review-gates/page.tsx`、`app/campaigns/[slug]/page.tsx`、`lib/statusJa.ts` (re-verify)、`components/common/StatusBadge.tsx` (re-verify)、`components/analytics/ReactionNoteEditor.tsx` (import path)、`app/analytics/page.tsx` (host rename)、`dashboard/README.md`
- 削除 (1): `components/analytics/AnalyticsToastHost.tsx`
- 受け入れ基準: spec §14 の 10 項目すべて green

**Option B — Phase 2B-2.1 microbatch (reviewer / notes / completedAt) を先に spec 化**

state だけでは workflow が「誰が判断した」 を残せない懸念があれば、reviewer / notes 編集の spec を 2B-2 と並行に起こす。

**Option C — Phase 2B-1 reactionNotes の `/publish-package/[slug]` 上の編集追加**

boss が「`/analytics` 以外でも reactionNotes 編集したい」 と判断すれば 2B-1.1 microbatch。

発信ネタ案: 「schema を変えずに `approved` / `rejected` の概念を運用で吸収する話 — controlled vocabulary の political な保守」「State machine の transition allow-list を server + UI 両方に書く理由 — defense-in-depth は単なる nice-to-have ではない」「Undo の "current session のみ" 制約を 1 行の Q で確定させた話 — boss judgement の権利を残す spec 設計」
