# Phase 2B-3.1 Visual asset Sanity reflect — detail spec

日付: 2026-05-21

## 背景

handoff/0190 (devlog 0179) で Phase 2B-3 boss smoke PASS を記録。 Q-2B3-2 で confirmed していた「Sanity reflect は Phase 2B-3.1 で別 batch」 の **本 spec** を起こす。 同 batch (0179 + 0190 と並列) で land。

目的:
- Phase 2B-3 が生成する `patches/visual-assets/<campaignSlug>/<assetSlug>.json` を **Sanity `visualAssetPlan` に apply** する controlled write batch の spec を docs-only で起こす
- patch JSON を「真の source of truth」 として読み込む設計
- file pipeline は依然 `tools/visual-register/server.mjs` が owner、 本 sub-batch は Sanity reflect のみ

## 決定・変更

### 新規 (1)

- `docs/specs/phase-2b-3-1-visual-asset-sanity-reflect.md` — 15 セクション、 約 23 KB

### 主要セクション

| § | Section | 主要内容 |
|---|---|---|
| 0 | Confirmed decisions (inherited) | parent + 2B-1 + 2B-2 + 2B-3 から継承、 Visual Register retirement long-term direction を documented |
| 1 | Goal and scope | patch JSON を source of truth として Sanity reflect、 file pipeline 不変 |
| 2 | Existing data shape audit | 実 patch JSON (16+ 件 audit 済) の shape + 対応 Sanity field |
| 3 | Target page | Option C 推奨 (`/visual-assets/[assetId]/candidates` + `/visual-assets/[assetId]` 両方) |
| 4 | Data model | `ReflectVisualAssetPatchInput` / `ReflectVisualAssetPatchResult` 型 |
| 5 | Safety pattern | 7 layer (env x2 + input validate + patch JSON path allowlist + patch shape validate + `expectedRevision` + field allow-list) |
| 6 | Server action design | 9-10 step flow (`reflectVisualAssetPatch`) |
| 7 | Undo / rollback | No undo 推奨 (Sanity / filesystem 乖離回避)、 boss judgement 待ち |
| 8 | Scope exclusions | 13 項目 (file ops / Visual Register 変更 / publish-package auto / multi-asset / etc.) |
| 9 | Long-term Visual Register retirement plan | 4 段の progress table (現在 → 次 → 将来 → retire) |
| 10 | Acceptance criteria | 14 項目 smoke checklist |
| 11 | Files likely affected | 新規 2-3 + 更新 3-4 |
| 12 | Open questions | 7 件 (Q-2B3.1-1〜Q-2B3.1-7) |
| 13 | Test plan | manual smoke + negative tests + token / log audit |
| 14 | Environment variables | 新規 env var なし、 `SANITY_WRITE_TOKEN` AND-gate **復活** |
| 15 | Post-spec next step | boss confirm → Q microbatch → implementation → 2B-3.2 |

### 過去 batch の lessons を本 spec で踏襲

- **Phase 2B-1 / 2B-2 で確立**: `expectedRevision` 必須、 `_rev` 二重 verify、 `<UndoToastHost>` の自動 undo pattern
- **Phase 2B-2 handoff/0183**: edit surface を 1 page に絞る原則 → 本 spec では緩めて両 page を許容 (Sanity reflect は continuation flow と post-discovery flow の 2 文脈)
- **Phase 2B-3 handoff/0188**: `<UndoToastHost>` を file op に流用しない判断 → 本 spec では Sanity field op だが「Sanity / filesystem 乖離」 risk を考慮して undo 不採用を推奨

### 推奨 server action 設計

- File: `dashboard/src/lib/actions/reflectVisualAssetPatch.ts`
- Function: `reflectVisualAssetPatch(input)`、 `'use server'`
- Input: `{visualAssetPlanId, patchJsonPath, expectedRevision, mode: 'preview' | 'execute'}`
- 9-10 step flow:
  1. `enableWriteActions` check
  2. `SANITY_WRITE_TOKEN` check (Phase 2B-3 では不要だったが、 本 batch で復活)
  3. Input validation (regex)
  4. Patch JSON path safety (allowlist + traversal reject)
  5. Patch JSON read (fs.readFile + JSON.parse)
  6. Patch JSON shape validation (`_id === input.visualAssetPlanId`, `meta.directSanityWrite === false`, `set.*` 4 field 型 check)
  7. Sanity fetch target doc
  8. `_rev` mismatch check
  9. Mode='preview': diff return / Mode='execute': `client.patch().set({...}).commit()` + new `_rev`/`committedAt` return

### Field allow-list

`set` block 内に書く field は **厳密に 4 field**:
- `localAssetPath`
- `status`
- `updatedAt`
- `reviewNotes`

これは現行 Visual Register が生成する shape と完全一致。 将来 server.mjs が他 field を patch JSON に追加し始めたら spec update。

## 理由

### なぜ patch JSON を source of truth に

選択肢:
- A: dashboard が file system / Sanity から path を再計算して set する
- B: patch JSON を読んで apply する (本 spec 採用)
- C: server.mjs が patch を Sanity に直接書く

A は dashboard が server.mjs と同じ path 計算 logic を重複実装、 drift リスク。
B は patch JSON が既に server.mjs によって生成されている事実を活用、 重複実装ゼロ、 dashboard は「validate + apply」 だけ。
C は server.mjs 自身を変更する path、 Q-2B3-3 で「server.mjs 触らない」 と confirmed、 不採用。

→ B 採用。 「Visual Register が patch JSON を生成して、 dashboard が validate + apply する」 という責任分離が明確。

### なぜ undo 不採用を推奨したか

Phase 2B-1 / 2B-2 では Sanity field op に 10秒 undo toast を採用。 本 batch も Sanity field op だが:
- file pipeline (Phase 2B-3 で `assets/visuals/...` に copy 済) は undo されない
- Sanity だけ undo されると filesystem との乖離が発生
- boss 視点: 「Sanity を戻したが file は残っている」 という整合性なし状態が一時的に出る

→ preview + confirm modal で吸収する方が安全。 Q-2B3.1-3 で boss judgement、 採用したい場合は `<UndoToastHost>` を再利用。

### なぜ両 page (candidates + detail) を edit surface に

Phase 2B-2 で「edit surface 1 page」 原則を確立したが、 本 batch では緩める:
- candidates page: Phase 2B-3 「採用」 直後の continuation flow (success panel 内に「Sanity に反映する」 button)
- detail page: 「採用したが Sanity 反映を忘れた」 asset を後から発見する flow

2 文脈は同じ server action を call する (重複実装ゼロ)。 「観察 (detail) と編集 (candidates)」 の Phase 2B-2 原則ではなく、 「採用 → reflect の同 sub-workflow を 2 entry point から到達可能にする」 設計。

### 7 layer safety の構造

| # | Layer | 起源 |
|---|---|---|
| 1 | `enableWriteActions` | Phase 2B 共通 |
| 2 | `SANITY_WRITE_TOKEN` | Phase 2B-1 / 2B-2、 本 batch で復活 |
| 3 | Input validation (regex) | Phase 2B 共通 |
| 4 | **Patch JSON path allowlist** | 本 batch 固有 (Phase 2B-3 `bridgePaths.ts` 同 pattern) |
| 5 | **Patch JSON shape validation** | 本 batch 固有 (`directSanityWrite: false` + 4 field 型 check) |
| 6 | `expectedRevision` + 再 fetch verify | Phase 2B 共通 |
| 7 | Field allow-list at patch construction | Phase 2B 共通 |

本 batch で **新規 2 layer (patch JSON path / shape)** を追加、 patch JSON ベースの設計に伴うリスクを吸収。

### Visual Register retirement plan を spec § 9 に明示

handoff/0190 で boss confirmed direction を本 spec でも 1 か所に明示:
- 「現在 → 次 (本 spec) → 将来 (extract) → retire」 の 4 段 progress table
- 本 batch では retirement を実装しない明文化
- 数 batch 後に「これは何のためにやっている?」 と疑問に思った future reader への参照点

## 影響

- リポジトリ:
  - `docs/specs/phase-2b-3-1-visual-asset-sanity-reflect.md` (新規 spec)
  - `docs/devlog/0180-...` + `docs/handoff/0191-...` + `docs/handoff/latest.md`
  - 本 batch 並列の `docs/specs/phase-2b-3-visual-approve-register.md` (smoke PASS status update) + `docs/specs/phase-2b-write-actions.md` (§0.5 update) は handoff/0190 で記録
  - runtime / schemas / tools / publish-package / assets / patches / package.json: touch なし
- ワークフロー:
  - 次は boss が spec を read + Q-2B3.1-1〜Q-2B3.1-7 に judgement
  - 確定後 → Phase 2B-3.1 implementation batch (Sanity reflect server action + UI 統合)
- スキーマ: 不変
- プロダクト方針:
  - **dashboard で Sanity write surface が 3 件目に拡大** (Phase 2B-1 reactionNotes + 2B-2 gate state + 2B-3.1 visualAssetPlan)
  - patch JSON を「真の source of truth」 として読み込む新 pattern を確立 (Phase 2B-3.2+ で promptTemplate / 他 patch JSON でも応用可能性あり)
  - Visual Register retirement の long-term path が parent spec + 本 spec の両方に documented

## 次の一手

**Option A (推奨) — boss が spec を read + Q-2B3.1-1〜Q-2B3.1-7 (7 件) に judgement**

特に重要 Q:
- **Q-2B3.1-1**: field allow-list (4 field で固定 vs 拡張余地)
- **Q-2B3.1-2**: page placement (両方 / candidates のみ / detail のみ)
- **Q-2B3.1-3**: undo 採用 vs 不採用
- **Q-2B3.1-6**: server action 別実装 vs reflect-* CLI logic 再利用

確定後 → Q 確定 microbatch (docs-only) → Phase 2B-3.1 implementation batch。

**Option B — Phase 2B-2 cleanup microbatch** を先に挟む

handoff/0186 §8 言及の dead code (amber affordance + `[hrg:diag]` log) 整理。 boss 好み次第。

**Option C — Phase 2B-2.1 microbatch (reviewer / notes / completedAt)** を先に挟む

state 以外の field 編集対応。

発信ネタ案:
- 「patch JSON を source of truth にする設計 — Visual Register と dashboard の責任分離を保つ pattern」
- 「Phase 2B-3.1 で `<UndoToastHost>` を採用しない判断 — Sanity と filesystem の乖離 risk を回避する」
- 「Phase 2B 全 sub-batch の write surface 4 通り (Sanity field / Sanity field allow-list / filesystem via CLI / patch JSON apply) が dashboard 内に共存」
- 「Visual Register retirement の 4 段 progress を spec で明示する design discipline」
