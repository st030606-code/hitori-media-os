# Phase 2B-3 visual approve & register bridge — detail spec

日付: 2026-05-21

## 背景

Phase 2B P0 (W3 reactionNotes + W5 humanReviewGate state) は 2026-05-20 〜 21 で boss smoke PASS まで完了 (handoff/0186)。次の strategic step は parent spec §6 で trackされている W1 visual approve & register。

boss が Q-3 を本日確定:
> Boss-confirmed direction for Q-3:
> Use Visual Register CLI bridge first.
> Do NOT fully reimplement Visual Register inside dashboard in this phase.

これを受けて Phase 2B-3 detail spec を docs-only で起こした。

## 決定・変更

### 新規 (1)

- `docs/specs/phase-2b-3-visual-approve-register.md` — 16 セクション、~25 KB

### 主要セクション

| § | Section | 主要内容 |
|---|---|---|
| 0 | Confirmed decisions | 親 Q-1 / Q-2 / Q-6 / Q-8 / Q-10 inherited、Q-3 ✅ confirmed (bridge first) |
| 1 | Product goal | dashboard = orchestrator、CLI = file pipeline owner、Sanity reflect は別 batch |
| 2 | Bridge strategy | option A (CLI bridge) 採用、option B (full reimplement) は deferred |
| 3 | Data flow inventory | inbox / final assets / patch JSON / manifest / Sanity / publish-package distribute の全 layout |
| 4 | Target pages | edit surface = `/visual-assets/[assetId]/candidates` 単独、list / detail page は read-only 維持 |
| 5 | Safety pattern | 6 + 1 layer (env flag x2 + input validation + path allowlist + traversal reject + dry-run preview) |
| 6 | Operation design | 7-step UX flow (select → confirm → preview → modal → execute → result → next steps hint) |
| 7 | **Server action design** | **option D 新規提案**: HTTP bridge to running CLI (option A / B / C のいずれにも該当しない既存 server.mjs HTTP API 活用 path) |
| 8 | UI design | 4 affordance branch + confirm modal + success result panel + 「badge ≠ trigger」 原則踏襲 |
| 9 | Undo / rollback | **採用しない** (file op は reversible でない、preview + confirm が代替) |
| 10 | Scope exclusions | 12 項目 (auto generation / regeneration / publish-package auto / Sanity write / multi-asset / etc.) |
| 11 | Acceptance criteria | 12 項目 smoke checklist |
| 12 | Open questions | 8 件 (Q-2B3-1〜Q-2B3-8) |
| 13 | Files likely affected | 新規 3-4 + 更新 4-5 |
| 14 | Environment variables | 新規 env var なし、`ENABLE_WRITE_ACTIONS` + `ENABLE_LOCAL_FS_ROUTES` 再利用、`SANITY_WRITE_TOKEN` 不要 |
| 15 | Post-spec next step | boss が Q-2B3-* 確定 → implementation batch |
| 16 | Phase 2B-1 / 2B-2 / 2B-3 対比表 | 将来 reader 向けの 1 表 |

### 過去 batch の lessons を本 spec で踏襲した点

- **Phase 2B-2 handoff/0183 boss decision: edit surface を 1 page に絞る** → Phase 2B-3 でも `/visual-assets/[assetId]/candidates` 単独に絞る
- **Phase 2B-2 handoff/0183 boss decision: badge ≠ trigger** → 本 spec §8-7 で明示、Phase 2B 全体の原則化
- **Phase 2B-1 / 2B-2 で確立した template**: server action / token never logged / `expectedRevision` style validation / production permanently disabled
- **Phase 2B-2 handoff/0184: defensive UI for data missing** → 本 spec では path allowlist + traversal reject + `visual-register-not-running` error UI で類似の defense-in-depth

### 推奨 server action 設計: option D (HTTP bridge)

boss prompt は option A (prepare command) / B (subprocess spawn) / C (shared module extraction) を提示し、推奨は「C if low-risk, else A」。

本 spec は **option D = "HTTP bridge to running CLI"** を新規提案:
- option A の発展形: command preparation の代わりに parameterized HTTP request を server action が dashboard runtime 内で実行
- option B の subprocess spawn の shell-escaping リスク回避
- option C の `server.mjs` refactor 不要 (既存 logic を 100% 流用)
- 既存 server.mjs は **既に HTTP server** (`localhost:3334`) として動作している事実を活用

audit で判明したのは:
- `/api/inbox/approve-and-register` HTTP endpoint が **16+ asset の registration を成功させた実績**
- patch JSON 生成 / file copy / manifest update の logic がすべて 1 endpoint 内で transactional
- dashboard が既に同 server から read API (`/api/visual-review/*`) を消費する pattern を確立済

→ option D が Q-2B3-1 推奨案。

## 理由

### なぜ「bridge first」 が正しい判断か

- 既存 CLI logic を信用できる (実運用で複数 asset register 成功)
- dashboard 内 reimplement は file ops + path 安全 + manifest 整合 + Sanity reflect を全部内 batch で扱う必要 → spec / 実装規模が大きい
- 「Visual Register が source of truth」 という CLAUDE.md / 既存運用方針を保てる
- 小さい first step で boss UX を改善できる、必要なら後で reimplement 候補に進化可能

### なぜ undo を採用しなかったか

Phase 2B-1 / 2B-2 の 10秒 in-memory undo を本 batch では **採用しない**。理由:

- file op は Sanity の単一 field `set` と性質が違う
- 「file 削除 + JSON 削除 + manifest revert」 を 10秒以内に正しく逆方向 transactional に書くのは複雑
- preview step + confirm modal で誤操作を吸収できる
- 万一の rollback は manual cleanup (3 step) で対応、success result panel + README に手順を documented

→ Phase 2B-2.1 / 2B-3.1 で再評価。

### なぜ confirm modal を必須にしたか

- file copy は元に戻せない (reactionNotes の field 編集とは違う)
- 既存 final asset を overwrite する場合は二重確認 (checkbox tick + 実行 button)
- Phase 2B-2 で terminal-only confirm modal を採用したのを更に拡張 (本 spec では 1-click 即 commit を出さない)

### なぜ token を本 batch で要求しないか

- 本 batch では Sanity に **write しない** (patch JSON 生成までで止める)
- server.mjs への HTTP request は localhost で認証なし (boss-controlled)
- Phase 2B-3.1 で Sanity reflection を追加するときに `SANITY_WRITE_TOKEN` を導入

これにより本 batch implementation の attack surface が最小化される。

### なぜ Visual Register が起動していない場合に dashboard が CLI を spawn しないか

- CLAUDE.md「明示的に依頼されるまで API 連携を追加しない」 + subprocess spawn は別 layer のリスク
- boss が `npm run visual:register` で CLI を起動する workflow を尊重
- dashboard は orchestrator、CLI lifecycle は boss が管理

→ Q-2B3-7 で確定方針として明示。

## 影響

- リポジトリ:
  - `docs/specs/phase-2b-3-visual-approve-register.md` (新規)
  - `docs/devlog/0176-...` + `docs/handoff/0187-...` + `docs/handoff/latest.md`
  - dashboard runtime / schemas / tools / publish-package / assets / patches / package.json: touch なし
- ワークフロー:
  - 次は boss が spec を read + Q-2B3-1〜Q-2B3-8 に judgement
  - 確定後 → Phase 2B-3 implementation batch (HTTP bridge 経由で file ops を Visual Register CLI に委譲)
  - その後 Phase 2B-3.1 で Sanity reflect を追加 (別 batch)
- スキーマ: 不変
- プロダクト方針:
  - 「dashboard = orchestrator、CLI = file pipeline owner」 を Phase 2B-3 で確定
  - Phase 2B-1 / 2B-2 の Sanity-direct write pattern と Phase 2B-3 の CLI-bridge pattern が **共存** する 2-pattern architecture を明文化
  - 編集 surface を `/visual-assets/[assetId]/candidates` 単独に絞る (Phase 2B-2 で確立した「1 edit surface per write target」 原則を継続)

## 次の一手

**Option A (推奨) — boss が spec を read + Q-2B3-1〜Q-2B3-8 確定**

特に重要:
- **Q-2B3-1** (server action 設計): option D を新規提案、boss confirmation 必要
- **Q-2B3-2** (Sanity reflect の batch 分離): 本 batch では Sanity write しない、Phase 2B-3.1 で別 batch — OK か?
- **Q-2B3-4** (publish-package auto trigger): しない、command を success panel に表示するだけ — OK か?
- **Q-2B3-5** (rollback): undo なし、manual cleanup — OK か?
- **Q-2B3-7** (Visual Register CLI auto-start): しない、boss が手動起動 — OK か?

確定後 → Q 確定 microbatch (docs-only) → Phase 2B-3 implementation batch。

**Option B — Phase 2B-2.1 microbatch (reviewer / notes / completedAt 編集)** を先に挟む

Phase 2B-3 spec を read する前に boss が「gate に reviewer / notes も書きたい」 と感じれば 2B-2.1 を先に。

**Option C — `/campaigns/[slug]` の dead `_rev` projection cleanup + 2B-2 missing-data affordance 削除 microbatch**

handoff/0186 §8 で言及した dead code 整理。urgent ではない、boss 好み次第。

発信ネタ案:
- 「option D = HTTP bridge to running localhost CLI — option A/B/C のどれでもない 4 つ目の正解だった話」
- 「Phase 2B-1 / 2B-2 の Sanity-direct write pattern と Phase 2B-3 の CLI-bridge pattern を共存させる architecture」
- 「file op vs Sanity field op で undo 戦略が変わる理由 — 元に戻せないものは confirm で吸収」
- 「edit surface を 1 page に絞る原則 (Phase 2B-2 で確立、2B-3 で継続) の効果 — bug 予測 / spec 変更 / undo lifecycle すべて単純化」
