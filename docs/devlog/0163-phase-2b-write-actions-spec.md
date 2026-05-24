# Devlog 0163 — Phase 2B write actions spec (docs only)

日付: 2026-05-20

## 背景

Phase UI-fidelity-1〜11 + 全 cleanup chain + Codex independent review + B fixes + README rewrite が完了し、dashboard 全 23 routes が **完全に read-only**。残された戦略課題は「dashboard で行うべき書き込み」と「CLI / Studio に残すべき書き込み」の boundary 確定 → 本 spec batch。

実装は **scope 外**。boss confirmation を集める **planning spec docs only** batch。

## 決定・変更

### 新規 docs (4)

- `docs/specs/phase-2b-write-actions.md` (新ディレクトリ `docs/specs/` 含む) — 10 章構成の planning spec
- `docs/devlog/0163-phase-2b-write-actions-spec.md` (本ファイル)
- `docs/handoff/0174-phase-2b-write-actions-spec.md`
- `docs/handoff/latest.md` (mirror)

### コード変更

**なし**。runtime / schema / publish-package / assets/visuals / patches / package.json / deploy はいずれも touch なし。`src/` も全 untouched。

### spec の主な内容 (要旨)

1. **Write action 候補 (8 件)** を列挙 + 各候補の「現在の write 手段」「dashboard で扱う価値」を 1 段階評価
2. **Prioritization** を 4 バケット (Phase 2B P0 / P1 / later / Keep CLI-only) に分類:
   - **P0** = W3 reactionNotes + W5 gate state update
   - **P1** = W1 visual approve (bridge or reimplement)
   - **Later** = W6 / W4 / W8
   - **CLI-only** = W2 / W7
3. **Safety model** 8 項目: dry-run/execute 2-stage / audit log / rollback / confirmation UI / `enableWriteActions` flag / error handling / permissions / no auto-post boundary
4. **Responsibility boundary**: ASCII boundary diagram で Studio / Dashboard / Visual Register CLI / publish-package builder / 外部 SNS の役割分界を明示。dashboard は SNS に絶対に post しない契約を明文化
5. **Implementation sequence**: 2B-1 (W3) → 2B-2 (W5) → 2B-3 (W1) → 2B-4 (W4-light) → 2B-5 (W6 optional) の 5 batch 計画
6. **Open questions for boss** 10 件 (Q-1 〜 Q-10): write token 配置 / production disable 方針 / W1 option A vs B / audit log schema 拡張 / reflect-*.mjs 並存戦略 / undo 方式 / 最初の batch 順 / conflict handling 頻度 / W7 議論タイミング / 自動 devlog の有無
7. **Non-goals 8 件**: no auto-post / no uncontrolled writes / no schema change in initial 2B / no publish-package mutation / no asset file generation / no external API / no build-time secret leakage / no persistent audit log without approval

## 理由

- **docs only で boss decision を集める**: 実装に走る前に 10 open questions を boss と決めることで、後続 2B-1〜2B-5 が手戻りなく回る
- **Visual Register CLI + reflect-*.mjs の存在を spec に明示**: 既存 write tooling を「廃止」せず「並存 → 段階移行」できるように設計
- **`enableWriteActions` env flag 提案**: production deploy で write を絶対に disable できる boolean を最初に確定、Phase 2B の security boundary
- **P0 を W3 + W5 に絞る**: reactionNotes と gate state は dashboard 上で行う動機が最も明確 (頻度 + 文脈)、最初の batch を「最小高 ROI」で start
- **W1 (visual approve) を P1 に**: Visual Register CLI が既に動作中、bridge 化と reimplement の boss 判断点 (Q-3) を設けることで「焦って大きく書く」を避ける
- **W2 / W7 は CLI-only**: CLAUDE.md 方針 (「API なしで始める」「auto-post なし」) との緊張、boss 判断点として保留

## 影響

- code 変更ゼロ、23 routes 動作維持、build 不変
- `docs/specs/` ディレクトリ新規作成 (今後 spec category を分ける入口)
- Phase 2B-1 着手の前提が確定: boss が §6 Q-1 〜 Q-10 を回答後、`docs/specs/phase-2b-1-reaction-notes.md` 等を順次起こす

## 次の一手

1. **boss が `docs/specs/phase-2b-write-actions.md` を read**:
   - §1-2 prioritization で違和感ないか
   - §3 safety model 8 項目 を承認できるか (特に `enableWriteActions` flag + `SANITY_WRITE_TOKEN` 別 token の運用)
   - §6 Open questions 10 件 を回答
2. boss 回答後 → **Phase 2B-1 (W3 reactionNotes) spec docs only batch** を立てる (`docs/specs/phase-2b-1-reaction-notes.md`)、その後 implementation batch
3. 並行候補:
   - Tabs integration P1 spec (`/campaigns/[slug]` 8 → 5-6)
   - promptTemplate dataset 投入 (boss task)
   - external analytics API spec (Phase Analytics-2、Phase 2B と独立)

## 発信ネタ候補

- 「write boundary を spec で先に固める」: 実装に走る前に「dashboard ↔ Studio ↔ CLI ↔ SNS」の責任分界を絵にして書く価値
- 「`enableWriteActions` env flag を最初の defense line に」: production deploy で write を絶対に enable しない契約を 1 行で表現
- 「P0 を最小高 ROI に絞る」: 8 候補から W3 + W5 だけを最初の implementation batch にする trade-off
