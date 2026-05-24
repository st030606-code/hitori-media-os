# Phase 2B-2 humanReviewGate state update detail spec

日付: 2026-05-20

## 背景

Phase 2B-1 reactionNotes write が smoke-validated (handoff/0178 → 0179)。controlled Sanity write pattern が boss 手元で動作確認できたので、次の write surface である **Phase 2B-2 = W5 humanReviewGate state update** の detail spec を docs-only で起こす。

handoff/0177 で Q-7 (Phase 2B-2 = W5) は確定済。本 batch は parent spec のロードマップに沿った進行で、implementation はまだ走らせない。

## 決定・変更

### 新規 (1)

- `docs/specs/phase-2b-2-human-review-gates.md` — 17 セクションの detail spec

### 主要セクション

1. Confirmed decisions (Phase 2B 親 + 2B-1 spec 経由で確定済の Q-1/Q-2/Q-6/Q-7/Q-8/Q-10 を再宣言)
2. Goal and scope (in scope / out of scope)
3. Current state audit (schema / GROQ / 2 surface / label helpers / CLI baseline)
4. **Allowed state transitions** (transition graph + 13 transition の allow-list、terminal は `done` / `skipped`)
5. Data model (`UpdateGateStateInput` / `UpdateGateStateResult`)
6. UI design (dropdown UI + confirm modal for terminal、disabled state)
7. Server action design (10 step flow、Phase 2B-1 の 9 step + transition validation)
8. Safety model (5 layer + transition allow-list)
9. Undo strategy (Phase 2B-1 と同じ in-memory 10秒 toast pattern を採用、`isUndo` flag で allow-list bypass)
10. Cross-page strategy (`<UndoToastHost>` を 2B-1 から汎用化、Option A 推奨)
11. Files likely affected (新規 2-3 / 更新 5-7 / 削除 1)
12. Environment variables (新規追加なし、2B-1 と同じ 2 env を再利用)
13. Error mapping (7 既存 + 新規 `transition-not-allowed`)
14. Test plan (manual smoke 13 step + negative tests + build + token audit)
15. Acceptance criteria (10 項目)
16. Scope exclusions (12 項目)
17. Open questions (7 件、boss judgement 待ち)

### Schema authoritative の重要発見

boss prompt が候補に挙げた `approved` / `rejected` は **schema に存在しない**:

| boss prompt | 実 schema | 推奨 mapping |
|---|---|---|
| `not-started` | ✓ `not-started` | as-is |
| `pending-review` | ✓ `pending-review` | as-is |
| `in-progress` | ✓ `in-progress` | as-is |
| `approved` | ✗ なし | `done` (= 完了、approve 相当の運用) |
| `rejected` | ✗ なし | `blocked` (差し戻し) または `skipped` (放棄) — boss 運用判断 |
| `blocked` | ✓ `blocked` | as-is |
| `skipped` | ✓ `skipped` | as-is |
| (boss 未列挙) | ✓ `done` | terminal、`approved` 相当として運用 |

schema 不変原則を遵守、§16 Q-2B2-1 で boss confirmation を促す。

### Transition allow-list (13 件、§3-2 抜粋)

```
not-started   → in-progress / pending-review / skipped(*)
in-progress   → pending-review / blocked / done(*) / skipped(*)
pending-review → in-progress / done(*) / blocked / skipped(*)
blocked       → in-progress / skipped(*)
done          → (terminal)
skipped       → (terminal)

(*) = confirm modal required
```

### Undo の特殊扱い

Phase 2B-1 reactionNotes (free text) と異なり、state は controlled vocabulary なので allow-list がある。Undo は逆方向 transition (`done` → `pending-review` 等) を含むので、server action input に `isUndo: boolean` を入れて allow-list bypass を明示。Server は `isUndo: true` でも `expectedRevision` + 再 fetch verify は維持。

## 理由

### なぜ schema 拡張を提案しなかったか

Boss instructions hard rule: 「Do NOT modify Sanity schema」 + 「Schema authoritative」。spec は不変 schema 内で運用する設計を完成させ、§16 Q-2B2-1 で「もし `approved` / `rejected` が欲しければ別 batch で schema 議論」と分離。

### なぜ confirm modal を terminal のみに

UX 認知負荷削減 + Phase 2B-1 の undo pattern と整合。非 terminal 遷移 (`in-progress` → `pending-review` 等) は undo toast で救えるので modal 不要。terminal 遷移 (`done` / `skipped`) は dashboard 上で **元に戻せない** (Studio で手動) ため、確認段を 1 つ挟む。

### なぜ Option A (UndoToastHost 汎用化) 推奨

Phase 2B-1 の `AnalyticsToastHost` を rename + generalize すれば、`/analytics` と `/human-review-gates` と `/campaigns/[slug]` の 3 surface で同 host を使い回せる。implementation batch で 2B-1 既存を import 書き換えで吸収する小さな refactor で済む。別 host を新設すると N 個に増える将来コスト。

### なぜ完了時 `completedAt` 自動 patch を保留にしたか (Q-2B2-3)

`completedAt` を同時 patch すると undo 時に「state を戻す + completedAt も unset する」の対称が必要になり、undo path が複雑化。Phase 2B-2 では state 単一 patch を維持、`completedAt` は boss が Studio で手動入力 or Phase 2B-2.1 microbatch で検討。

### なぜ `transition-not-allowed` を server response error にしたか

UI 側で allow-list を実装してドロップダウンを正しく表示するのは前提だが、それだけだと:
- 開発者ツールから直接 server action を invoke すれば bypass される
- Defense-in-depth として server が必ず最終 gatekeeper

→ UI で表示しないが server でも reject、両方で防御。

## 影響

- リポジトリ:
  - `docs/specs/phase-2b-2-human-review-gates.md` (新規)
  - `docs/devlog/0169-*` + `docs/handoff/0180-*` + `docs/handoff/latest.md` (本 batch)
  - dashboard runtime: touch なし
  - schemas / tools / publish-package / assets / patches: touch なし
- ワークフロー:
  - 次は boss が spec を read + Q-2B2-1〜Q-2B2-7 (7 件) に judgement
  - 確定後 → Phase 2B-2 implementation batch
- スキーマ: 不変
- プロダクト方針:
  - 「dashboard で書き込み可能」surface が `/analytics` (reactionNotes) + `/human-review-gates` + `/campaigns/[slug]` Tabs (state) の 3 surface に広がる
  - Topbar pill / `<UndoToastHost>` / server action pattern / 4-layer safety は 1 つの template として固まっていく

## 次の一手

**Option A (推奨) — boss が spec を read + Q-2B2-1〜Q-2B2-7 確定**

特に重要な Q:
- Q-2B2-1: schema に `approved` / `rejected` が無い問題、`done` / `blocked` で運用 OK?
- Q-2B2-3: `done` 遷移時に `completedAt` 自動 patch するか (推奨: しない)
- Q-2B2-4: `<UndoToastHost>` 汎用化 (Option A) で OK?

確定後 → Q 確定 microbatch (docs-only) で spec を最終形に → Phase 2B-2 implementation batch。

**Option B — Phase 2B-2.1 microbatch (reviewer / notes / completedAt) を先に spec 化**

state だけだと boss workflow が「誰がレビュー担当か」「決定の理由」を残せない懸念があれば 2B-2 と並列に spec 化。

**Option C — Phase 2B-1 reactionNotes の `/publish-package/[slug]` 上の編集追加**

boss が「`/analytics` 以外でも reactionNotes 編集したい」と判断すれば 2B-1.1 microbatch。

発信ネタ案: 「schema 不変原則で `approved` / `rejected` の概念を `done` / `blocked` に圧縮した話 — workflow 設計が schema を変えるとは限らない」「state machine の transition allow-list を spec で明文化、defense-in-depth で server 側にも書く理由」「Undo 機構が controlled vocabulary でどう変わるか — `isUndo` flag で allow-list bypass する小さなトリック」
