# Handoff: Phase 2B-3.1 visual asset Sanity reflect — detail spec

Date: 2026-05-21

## 1. Task Goal

handoff/0190 (devlog 0179) で Phase 2B-3 boss smoke PASS を記録。 Q-2B3-2 で「Sanity reflect は Phase 2B-3.1 で別 batch」 と confirmed していた sub-batch の **detail spec を docs-only で起こす**。 同 batch (handoff/0190 と並列) で land。

implementation はまだ走らせない。 boss が spec を read して Q-2B3.1-1〜Q-2B3.1-7 (7 件 open question) に judgement を付けるまでは Sanity / filesystem への書き込みは 1 行も実行しない。

## 2. Constraints Followed

- ✅ Docs only、 dashboard runtime code 変更なし
- ✅ Server actions 未実装
- ✅ `tools/visual-register/server.mjs` touch なし
- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし (本 batch、 implementation でも patch JSON 1 件 / 1 doc に限定)
- ✅ assets コピー / 削除なし、 assets/visuals / assets/inbox 不変
- ✅ patches 不変 (implementation でも **read only**)
- ✅ publish-package files 不変
- ✅ package 追加なし
- ✅ deploy なし
- ✅ Phase 2B-1 / 2B-2 / 2B-3 動作不変
- ✅ Visual Register retirement は documented のみ、 実装しない
- ✅ 「Inventing boss decisions」 しない (Q-2B3.1-* は推奨案明示、 boss 確定は別 batch)

## 3. Changed Files

### 新規 docs (4)

- [docs/specs/phase-2b-3-1-visual-asset-sanity-reflect.md](docs/specs/phase-2b-3-1-visual-asset-sanity-reflect.md) (15 セクション、 約 23 KB)
- [docs/devlog/0180-phase-2b-3-1-visual-asset-sanity-reflect-spec.md](docs/devlog/0180-phase-2b-3-1-visual-asset-sanity-reflect-spec.md)
- [docs/handoff/0191-phase-2b-3-1-visual-asset-sanity-reflect-spec.md](docs/handoff/0191-phase-2b-3-1-visual-asset-sanity-reflect-spec.md) (本ファイル)
- [docs/handoff/latest.md](docs/handoff/latest.md) (mirror of 0191、 latest by number)

### 同 batch で並列に land する別 entry (smoke PASS、 handoff/0190 参照)

- `docs/specs/phase-2b-3-visual-approve-register.md` (header status update)
- `docs/specs/phase-2b-write-actions.md` (§0.5 + §2 W1 entry update + Visual Register retirement long-term direction section)
- `docs/devlog/0179-phase-2b-3-smoke-pass.md`
- `docs/handoff/0190-phase-2b-3-smoke-pass.md`

### コード変更 (0)

`dashboard/src/` / `tools/` / `schemas/` / `publish-package/` / `assets/` / `patches/` / `package.json` (root + dashboard) いずれも touch なし。

## 4. Summary of Changes

### 4-1. Spec structure (15 sections)

| § | Section | 主要内容 |
|---|---|---|
| 0 | Confirmed decisions (inherited) | parent + 2B-1 + 2B-2 + 2B-3 から継承、 Visual Register retirement long-term direction |
| 1 | Goal and scope | patch JSON を source of truth に Sanity reflect、 file pipeline 不変 |
| 2 | Existing data shape audit | 実 patch JSON shape + 対応 Sanity field map |
| 3 | Target page | Option C (両方) 推奨 |
| 4 | Data model | `ReflectVisualAssetPatchInput` / `ReflectVisualAssetPatchResult` |
| 5 | Safety pattern | **7 layer** (env x2 + input regex + patch JSON path allowlist + patch shape validate + `expectedRevision` + field allow-list) |
| 6 | Server action design | 9-10 step flow |
| 7 | Undo / rollback | **No undo** 推奨 (Sanity / filesystem 乖離回避) |
| 8 | Scope exclusions | 13 項目 |
| 9 | Long-term Visual Register retirement plan | 4 段 progress table |
| 10 | Acceptance criteria | 14 項目 smoke checklist |
| 11 | Files likely affected | 新規 2-3 + 更新 3-4 |
| 12 | Open questions | 7 件 (Q-2B3.1-1〜Q-2B3.1-7) |
| 13 | Test plan | manual smoke + negative + audit |
| 14 | Environment variables | 新規追加なし、 `SANITY_WRITE_TOKEN` AND-gate **復活** |
| 15 | Post-spec next step | boss confirm → Q microbatch → implementation → 2B-3.2 |

### 4-2. Patch JSON source-of-truth model

選択肢:
- A: dashboard が file system / Sanity から path を再計算
- **B: patch JSON を読んで apply (本 spec 採用)**
- C: server.mjs が Sanity に直接書く

**B 採用理由**:
- `tools/visual-register/server.mjs` が既に patch JSON を生成 (16+ 件実績)
- dashboard は「validate + apply」 だけ、 重複実装ゼロ
- 「Visual Register = patch JSON 生成 owner、 dashboard = Sanity reflect orchestrator」 の責任分離が明確
- 将来 Phase 2B-3.3 で Visual Register retirement する際、 patch JSON 経路を share library 経路に置き換えるだけで dashboard logic は不変

**Patch JSON 期待 shape** (実例 + audit 済):
```json
{
  "_id": "visualAssetPlan.<campaignSlug>.<assetSlug>",
  "set": {
    "localAssetPath": "assets/visuals/...",
    "status": "saved",
    "updatedAt": "ISO datetime",
    "reviewNotes": "..."
  },
  "meta": {
    "generatedBy": "tools/visual-register/inbox",
    "inboxSource": "assets/inbox/generated/...",
    "originalFileName": "v00N.png",
    "mimeType": "image/png",
    "directSanityWrite": false
  }
}
```

**Field allow-list**: 4 field 厳守 (`localAssetPath` / `status` / `updatedAt` / `reviewNotes`)。 meta は validation 用途のみで Sanity に書かない。

### 4-3. Write guard model (7 layer)

Phase 2B-1 / 2B-2 の 4-5 layer + Phase 2B-3 で確立した「path allowlist」 + 本 batch 固有 layer:

1. `enableWriteActions` env flag
2. `SANITY_WRITE_TOKEN` env presence (Phase 2B-3 では不要だったが、 本 batch で復活)
3. Hard input validation (regex)
4. **Patch JSON path allowlist** (本 batch 固有): `^patches/visual-assets/[a-z0-9-]+/[a-z0-9-]+\.json$`
5. **Patch JSON shape validation** (本 batch 固有): `_id === input.visualAssetPlanId`, `meta.directSanityWrite === false`, `set.*` 4 field 型 check
6. `expectedRevision` 必須 + Sanity re-fetch verify (Phase 2B-1 / 2B-2 と同じ)
7. Field allow-list at patch construction (dashboard が build する `set` object key を 4 field に限定)

`meta.directSanityWrite === false` 検証の意味: Visual Register が生成した patch JSON のみ accept、 `true` or 他値の場合は「想定外の external 生成 path」 と判断して reject。

### 4-4. UI placement recommendation

**Option C (両方) 推奨**:

| Page | 役割 | 表示要素 |
|---|---|---|
| `/visual-assets/[assetId]/candidates` | Phase 2B-3「採用」 直後の continuation flow | Phase 2B-3 success panel 内に「Sanity に反映する」 button + diff preview + confirm modal + result panel |
| `/visual-assets/[assetId]` (detail) | 「採用したが Sanity 反映を忘れた」 asset を後から発見 | `<FilePathsCard>` 近辺に「patch JSON あり / Sanity 未反映」 indicator + 「Sanity に反映する」 button |

Phase 2B-2 の「edit surface 1 page」 原則とは少し異なるが、 本 batch は:
- 同じ server action を両 page から call、 logic 重複ゼロ
- Phase 2B-3 採用後の continuation + 後から発見の 2 文脈は entry point を増やす方が UX 自然
- Q-2B3.1-2 で boss judgement (両方 / candidates のみ / detail のみ の選択肢)

### 4-5. Long-term Visual Register retirement plan

spec §9 に 4 段 progress table を明示 (handoff/0190 で boss confirmed direction):

| 段階 | 内容 | 実装 |
|---|---|---|
| 現在 (Phase 2B-3) | dashboard → HTTP bridge → Visual Register `:3334` separate server | ✅ 完了 |
| **次 (Phase 2B-3.1、 本 spec)** | dashboard 内に Sanity reflect 追加、 file pipeline は Visual Register が owner | 📐 spec land、 implementation pending |
| 将来 (Phase 2B-3.3 候補) | `tools/visual-register/server.mjs` の core logic を share library に extract → dashboard server action が直接 call (HTTP bridge を skip) | 未実装、 別 batch |
| 更に将来 | CLI / `:3334` server を optional compatibility layer に降格 → 最終 retire | 未実装、 別 batch |

**本 batch では実装しない**。 boss が future direction として committed したのを spec 内に明文化することで、 数 batch 後の reader が「これは何のためにやっている?」 と疑問に思った時の参照点を残す。

### 4-6. Open questions (7 件)

| # | 質問 | 推奨案 |
|---|---|---|
| **Q-2B3.1-1** | Patch JSON field allow-list (4 field 固定 / 拡張余地) | **4 field 厳守** (`localAssetPath` / `status` / `updatedAt` / `reviewNotes`) |
| **Q-2B3.1-2** | Page placement (両方 / candidates のみ / detail のみ) | **Option C 両方** (continuation + post-discovery の 2 文脈) |
| **Q-2B3.1-3** | Undo 採用 vs 不採用 | **No undo** (Sanity / filesystem 乖離 risk、 preview + confirm が代替) |
| **Q-2B3.1-4** | 「既に reflected」 detection (4 field 一致 / localAssetPath のみ / updatedAt 比較) | **4 field 完全一致** (precision 重視、 再 apply path も残す) |
| **Q-2B3.1-5** | 1 asset / 1 transaction vs multi-asset | **1 asset / 1 transaction** (Phase 2B 全体原則と整合、 multi は 2B-3.2) |
| **Q-2B3.1-6** | `reflect-working-pipeline-visual-assets.mjs` の logic を再利用 vs server action として別実装 | **別実装** (参考 logic 元として読みつつ、 dashboard server action は simple に、 reflect-* CLI は recovery 用途として併存) |
| **Q-2B3.1-7** | Sanity target doc 不在時の挙動 | **`not-found` reject + Studio で create 誘導** (dashboard が create する path は scope creep) |

### 4-7. Acceptance criteria (14 items)

§10 の smoke checklist:
1. Build green
2. Default behavior (writeReady=false で完全 read-only)
3. Enabled で reflect 完結 (preview → execute → Sanity 4 field 更新)
4. preview ⇄ execute 区別 (preview だけだと不変)
5. `_rev` conflict 動作 (Studio 並行編集)
6. 既に reflected hint
7. patch JSON 不在で button が出ない
8. patch JSON malformed reject
9. `_id` mismatch reject
10. Phase 2B-1 reactionNotes 動作不変
11. Phase 2B-2 humanReviewGate 動作不変
12. Phase 2B-3 visual approve/register 動作不変
13. Token leak audit
14. No asset / publish-package modifications by reflect action

### 4-8. Files likely affected (implementation batch)

**新規 (2-3)**:
- `dashboard/src/lib/actions/reflectVisualAssetPatch.ts` (`'use server'` action)
- `dashboard/src/components/visual-review/ReflectVisualAssetAction.tsx` (`'use client'` button + confirm modal + diff panel + result)
- (optional) `dashboard/src/lib/visualAssets/patchPaths.ts` (path allowlist helper、 `bridgePaths.ts` と並列)

**更新 (3-4)**:
- `dashboard/src/app/visual-assets/[assetId]/candidates/page.tsx` (Phase 2B-3 success panel 内に統合)
- `dashboard/src/app/visual-assets/[assetId]/page.tsx` (detail page に indicator + button 追加)
- `dashboard/src/components/visual-review/CandidateFocusLayout.tsx` (slot 追加、 必要に応じて)
- `dashboard/README.md` (Phase 2B-3.1 row + 7 layer safety + enablement で `SANITY_WRITE_TOKEN` 復活明示)

**触らない**:
- `tools/visual-register/` (Phase 2B-3 + 2B-3.1 を通して touch なし)
- `tools/publish-package-builder/`
- `tools/sanity/reflect-*.mjs` (参考 logic 元、 import しない)
- `schemas/` (schema 不変)
- `assets/visuals/`, `assets/inbox/` (filesystem 不変)
- `patches/` (read only)
- `publish-package/`
- `package.json` (root + dashboard)
- Phase 2B-1 / 2B-2 / 2B-3 既存 runtime code

合計 **新規 2-3 + 更新 3-4 = 5-7 ファイル変更** (見積もり、 boss confirm 後の implementation batch で確定)。

### 4-9. Build NOT run

Docs-only batch のため build 不要 (handoff/0190 build artifact 継承、 23 routes green)。

### 4-10. Confirmation: runtime behavior unchanged

確認項目:
- 23 routes (前 batch から変化なし)
- データ取得ロジック / feature flags / Topbar pill — touch なし
- Phase 2B-1 reactionNotes / Phase 2B-2 humanReviewGate / Phase 2B-3 visual bridge — 動作不変
- `tools/visual-register/server.mjs` — touch なし、 Visual Register CLI 動作不変
- Sanity への write は 3 surface のみ (2B-1 + 2B-2、 2B-3 は filesystem only via CLI)、 本 batch で新 server action は **未実装**
- Sanity schema / publish-package / assets / patches / package.json 不変

## 5. Key Decisions

- **Patch JSON を source of truth に**: dashboard が path 再計算しない、 重複実装ゼロ
- **No undo 推奨 (Q-2B3.1-3)**: Sanity field op だが file pipeline と乖離する risk、 preview + confirm modal が代替
- **両 page (candidates + detail) を edit surface に (Q-2B3.1-2)**: Phase 2B-3 採用直後の continuation flow + 後から発見 flow の 2 文脈
- **7 layer safety**: Phase 2B 共通 5 layer + 本 batch 固有 2 layer (patch JSON path / shape)
- **`meta.directSanityWrite === false` 検証 layer 5 に必須に**: Visual Register が生成した patch JSON のみ accept
- **`SANITY_WRITE_TOKEN` AND-gate 復活**: Phase 2B-3 では不要だったが、 本 batch で Sanity write が再導入されるため
- **Server action として別実装 (Q-2B3.1-6)**: `reflect-working-pipeline-visual-assets.mjs` の logic を import せず、 patch JSON 1 件 / 1 doc に絞った simple server action として書く
- **1 asset / 1 transaction 厳守 (Q-2B3.1-5)**: Phase 2B 全体の原則と整合、 multi-asset batch は Phase 2B-3.2 候補
- **Visual Register retirement を spec §9 に明示**: handoff/0190 で boss confirmed direction を本 spec でも 1 か所に明文化、 「documented but not implemented」
- **devlog/handoff numbering**: 本 batch は smoke PASS (0179 / 0190) と 2B-3.1 spec (0180 / 0191) を別 entry に分離、 latest.md は 0191 を mirror

## 6. Human Review Questions

### Spec 内容 review

1. Q-2B3.1-1〜Q-2B3.1-7 (7 件 open questions) に boss judgement
2. spec §3 page placement recommendation (Option C 両方) で OK?
3. spec §7 undo 不採用推奨で OK?
4. spec §5 7-layer safety 構造で OK?
5. spec §9 Visual Register retirement plan の 4 段 documented 表現で OK?

### Phase 2B-3.1 implementation までの path

6. Q 確定 microbatch を別 commit にする vs implementation batch 内で同時にやる
7. Phase 2B-2 cleanup microbatch (handoff/0186 §8) を Phase 2B-3.1 implementation 前に挟むか後にするか
8. `<UndoToastHost>` の AppShell 化 (handoff/0179 §8 言及) を Phase 2B-3.1 と並列で進めるか後にするか

### 中長期判断

9. Phase 2B-3.2 (publish-package distribute / batch approve / multi-asset) の timing
10. Phase 2B-3.3 (Visual Register retirement / share library extraction) の timing
11. parent Q-4 (audit-log schema) を Phase 2B-X までに確定したいか

## 7. Risks or Uncertainties

- **boss confirmation の解釈リスク**: Q-2B3.1-1〜Q-2B3.1-7 の推奨案は Claude 側の解釈、 boss が異なる方向を選ぶ可能性
- **「両 page」 placement のメンテコスト**: 同 server action を 2 entry point から call、 各 page で UI state 同期する必要、 Phase 2B-2 で確立した「1 edit surface」 原則の例外
- **patch JSON shape の安定性**: 現行 Visual Register が生成する 4 field shape を前提、 server.mjs が将来 field を追加すると spec / 実装更新が必要
- **既に reflected detection の precision**: 4 field 完全一致を採用するが、 タイムスタンプ format / 小数誤差 / whitespace 等で false negative が起き得る。 implementation 時に robust 化が必要
- **Sanity field allow-list の strictness**: 4 field 以外を patch JSON が含んでいた場合、 server action は無視する設計だが、 boss が「全 field を反映してほしい」 と感じれば spec update
- **HTTP bridge での latency impact**: 本 batch は HTTP bridge を使わない (filesystem read + Sanity write のみ)、 ただし Phase 2B-3 と Phase 2B-3.1 が boss workflow で連続 click される際、 2 段の network call (Visual Register + Sanity) が直列実行される可能性。 ただし server actions は parallel 化されないので問題なし
- **patch JSON の race condition**: boss が Phase 2B-3「採用」 直後に「Sanity に反映」 を click すると、 file system 書き込みと patch JSON 読み込みが race する可能性。 server.mjs が transactional に書く前提だが race window はゼロではない

## 8. Remaining Cleanup Candidates

### 短期 (microbatch)

- **Phase 2B-3.1 Q 確定 microbatch**: boss 確定回答を spec に反映 (docs-only)
- **Phase 2B-2 cleanup microbatch**: handoff/0186 §8 言及の amber affordance + `[hrg:diag]` log 削除
- `<UndoToastHost>` の AppShell-level lift (Phase 2B-1 / 2B-2 で言及済)

### 中期

- **Phase 2B-3.1 implementation batch**: spec confirmed 後の実装 (5-7 ファイル変更)
- **Phase 2B-3.1 smoke fix microbatch**: Phase 2B-1 / 2B-2 / 2B-3 で 2-3 round 必要だった経緯を踏まえる
- **Phase 2B-2.1 microbatch**: reviewer / notes / completedAt 編集

### 中期 (Phase 2B-3.2)

- publish-package distribute auto-trigger
- batch / multi-asset reflect
- Visual Register CLI connection status indicator (topbar)

### 長期

- **Phase 2B-3.3 candidate**: Visual Register retirement (share library extraction)、 `tools/visual-register/server.mjs` を core module に refactor
- audit-log schema (parent Q-4) 確定後の永続 undo / 詳細監査
- `<DeferredActionButton>` 削除 (Phase 2B 全完了後)
- `tools/sanity/reflect-*.mjs` 段階削除 (parent Q-5)

## 9. Next Recommended Step

**Boss が Phase 2B-3.1 spec を read + Q-2B3.1-1〜Q-2B3.1-7 (7 件) に judgement**

特に重要 Q:
1. **Q-2B3.1-1** (field allow-list): 4 field 厳守で OK?
2. **Q-2B3.1-2** (page placement): 両方 / candidates のみ / detail のみ
3. **Q-2B3.1-3** (undo): 不採用 / `<UndoToastHost>` 採用
4. **Q-2B3.1-6** (server action 実装方針): 別実装 / reflect-* CLI 再利用

確定後 → Q 確定 microbatch (docs-only) で spec を「推奨」 → 「CONFIRMED」 書き換え → **Phase 2B-3.1 implementation batch** (5-7 ファイル変更、 14 acceptance criteria green)。

---

### Exact prompt for next Claude Code session (Q 確定 microbatch)

```
Phase 2B-3.1 spec の boss 確定を反映する docs-only microbatch を実行してください。

入力:
- docs/specs/phase-2b-3-1-visual-asset-sanity-reflect.md (推奨案)
- boss の確定回答:
  - Q-2B3.1-1 = [field allow-list 確定]
  - Q-2B3.1-2 = [page placement 確定]
  - Q-2B3.1-3 = [undo 採用 or 不採用]
  - Q-2B3.1-4 = [reflected detection method]
  - Q-2B3.1-5 = [single / multi-asset]
  - Q-2B3.1-6 = [server action 別実装 / reflect-* 再利用]
  - Q-2B3.1-7 = [target doc 不在時の挙動]

タスク:
1. spec §12 「推奨」 → 「CONFIRMED」 書き換え
2. spec §0 に Phase 2B-3.1 batch confirmed decisions ブロック追加
3. spec §3 / §4 / §5 / §6 / §7 を boss 確定後の最終形に update
4. parent spec §0.5 にも Phase 2B-3.1 batch 確定を追記
5. devlog/0181 + handoff/0192 + latest.md mirror

constraints:
- docs only、 runtime code 変更なし
- Sanity schema 不変
- publish-package / assets / patches / package.json 不変
- 「Inventing boss decisions」 しない
```

## 10. Validation

```
=== Docs-only check (expect empty under runtime + protected paths) ===
$ find dashboard/src tools schemas publish-package assets patches -type f \
    -newer docs/handoff/0189-phase-2b-3-visual-approve-register-implementation.md
(empty = OK)

$ find . -maxdepth 2 -name "package.json" \
    -newer docs/handoff/0189-phase-2b-3-visual-approve-register-implementation.md \
    -not -path "*/node_modules/*"
(empty = OK)

=== Files touched in this batch (2B-3.1 spec portion only) ===
docs/specs/phase-2b-3-1-visual-asset-sanity-reflect.md  (new, 15 sections, ~23KB)
docs/devlog/0180-phase-2b-3-1-visual-asset-sanity-reflect-spec.md (new)
docs/handoff/0191-phase-2b-3-1-visual-asset-sanity-reflect-spec.md (new)
docs/handoff/latest.md                                    (mirror of 0191)

=== Files touched (smoke PASS portion, see handoff/0190 for details) ===
docs/specs/phase-2b-3-visual-approve-register.md          (header status update)
docs/specs/phase-2b-write-actions.md                      (§0.5 + §2 W1 + long-term direction)
docs/devlog/0179-phase-2b-3-smoke-pass.md                  (new)
docs/handoff/0190-phase-2b-3-smoke-pass.md                 (new)
```

Build skipped (docs-only). Runtime behavior unchanged: `/analytics` reactionNotes + `/human-review-gates` gate state + `/visual-assets/[assetId]/candidates` Visual approve/register bridge / Visual Register CLI / publish-package すべて preserved as-is.
