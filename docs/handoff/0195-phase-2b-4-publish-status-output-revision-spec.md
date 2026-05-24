# Handoff: Phase 2B-4 spec — Publish Status + Output Revision Workflow

Date: 2026-05-21

## 1. Task Goal

Phase 2B 全 4 sub-batch (2B-1 / 2B-2 / 2B-3 / 2B-3.1) すべて smoke PASS で完了、 Visual flow が boss-declared「complete for now」 milestone に到達 (handoff/0194)。 boss が次 strategic direction として **Phase 2B-4 — Publish Status + Output Revision Workflow** の spec 化を指示。

boss の現実 publish workflow から導出された要件:
- Threads は自前で公開 (manual posting)
- 生成 text が weak → boss が手動 rewrite
- 生成 diagram も weak → visual なしで投稿
- dashboard に「実 publish status + URL + 投稿した text + 生成 text を revise した事実 + visual を使わなかった事実 + 理由 + 将来 dashboard 内で remake」 を記録できるようにしたい

現在の gap:
- `manualPublishingStatus[]` の state / publishedUrl / publishedAt 更新は **dashboard で write できず** (`tools/sanity/reflect-publication-state.mjs --execute` で CLI のみ)
- 「生成 text を revise した」 marking は未実装
- 「visual を使わなかった」 marking は未実装
- 「実際に投稿した text を保存」 は未実装

本 batch は **docs-only spec 作成**、 implementation / schema change / Sanity write は一切行わない。

## 2. Constraints Followed

- ✅ Docs only、 runtime code 変更なし
- ✅ Sanity schema 変更なし、 schema additions は §5 で **propose only**
- ✅ Sanity 書き込みなし
- ✅ `dashboard/src/` touch なし (`updateReactionNotes.ts` / `updateGateState.ts` / `approveVisualCandidate.ts` / `reflectVisualAssetPatch.ts` / `<UndoToastHost>` / 関連 components — 流用提案するが本 batch では touch なし)
- ✅ `tools/visual-register/`, `tools/sanity/reflect-*.mjs` touch なし、 import なし
- ✅ `assets/visuals/`, `assets/inbox/`, `patches/`, `publish-package/` 不変
- ✅ `package.json` (root + dashboard) 追加なし
- ✅ deploy なし
- ✅ Production writes 永久 disabled (本 spec が proposing する 3 server action はすべて `enableWriteActions` + `SANITY_WRITE_TOKEN` AND-gate)
- ✅ 23 routes 不変 (本 batch では build 不要、 handoff/0194 build artifact 継承)
- ✅ Phase 2B-1 / 2B-2 / 2B-3 / 2B-3.1 動作不変

## 3. Changed Files

### 新規 (1 spec)

- [docs/specs/phase-2b-4-publish-status-output-revision.md](docs/specs/phase-2b-4-publish-status-output-revision.md) — 16 セクション planning spec
  - §0 Confirmed decisions (inherited from parent + 4 sub-batch)
  - §1 Product goal + in scope + out of scope
  - §2 Target pages (primary edit surface = `/publish`)
  - §3 Data model inventory (manualPublishingStatus / platformOutput / publishedOutput / visualAssetPlan / contentIdea.outputChecklist + 不在 field list)
  - §4 Minimum no-schema-change implementation (MVP) — 既存 field で 80% カバー
  - §5 Potential schema additions (propose only、 Phase 2B-4.1 候補)
  - §6 Write actions — 3 server action (updateManualPublishStatus / updatePlatformOutputStatus / updateVisualAssetStatus) + 共通 safety pattern + undo 戦略
  - §7 UI design — `/publish` 拡張、 row-level 編集、 quick action button、 surface 分離
  - §8 Regeneration / rewrite workflow (MVP は manual rewrite only)
  - §9 Visual rewrite / no-visual workflow (MVP は `archived` + reviewNotes reason)
  - §10 Scope exclusions (やらないことを 11 件明示)
  - §11 Acceptance criteria (12 項目)
  - §12 Open questions (Q-2B4-1 〜 Q-2B4-7、 7 件)
  - §13 Files likely affected (新規 6 + 更新 3-4 = 9-10 ファイル)
  - §14 Environment variables (新規なし、 既存 2 つ再利用)
  - §15 Test plan (manual smoke 12 項目 + negative tests 9 項目 + token audit)
  - §16 Post-spec next step

### 新規 docs (3)

- [docs/devlog/0184-phase-2b-4-publish-status-output-revision-spec.md](docs/devlog/0184-phase-2b-4-publish-status-output-revision-spec.md)
- [docs/handoff/0195-phase-2b-4-publish-status-output-revision-spec.md](docs/handoff/0195-phase-2b-4-publish-status-output-revision-spec.md) (本ファイル)
- [docs/handoff/latest.md](docs/handoff/latest.md) (mirror of 0195)

### コード変更 (0)

`dashboard/src/` / `tools/` / `schemas/` / `assets/visuals/` / `assets/inbox/` / `patches/` / `publish-package/` / `package.json` (root + dashboard) いずれも touch なし。

### 親 spec (`docs/specs/phase-2b-write-actions.md`) touch なし

本 batch では parent spec §0.5 Implementation status の更新は **行わない**。 Phase 2B-4 spec が「planning」 status の間は parent §0.5 に row を追加せず、 Q 確定 microbatch の段階で parent spec row を追加する pattern (Phase 2B-3 / 2B-3.1 と同じ)。

## 4. Summary of Changes

### 4-1. Spec の中心戦略: MVP no-schema-change

Phase 2B 全 sub-batch で確立した「schema 不変原則」 を本 batch でも踏襲。 boss workflow の **80%** を既存 field のみでカバー:

| Boss requirement | 既存 field で代用 | 新規 action (proposed) |
|---|---|---|
| publish status / URL / 日時 / メモ | `manualPublishingStatus[_key].{state, publishedUrl, publishedAt, reactionNotes}` (MVP では reactionNotes を publishNotes 代用) | `updateManualPublishStatus` (4 field allow-list) |
| 生成 text を revise した | `platformOutput.{status: 'revised', reviewNotes}` (既存 enum + 既存 text field) | `updatePlatformOutputStatus` (2 field allow-list) |
| visual を使わなかった | `visualAssetPlan.{status: 'archived', reviewNotes}` (既存 enum + 既存 text field) | `updateVisualAssetStatus` (2 field allow-list、 Phase 2B-3.1 の reflect とは別 action) |
| 実投稿した text | **MVP では Sanity に保存しない** (publish-packages/*.md は draft のまま、 実 text はプラットフォーム自身が保持) | — (Phase 2B-4.1 候補) |

残り 20% (actual text / revision history / visual replacement / output versioning) は **propose only, implement later** で §5 に列挙。

### 4-2. Data model inventory 要約

audit 結果:
- **`campaignPlan.manualPublishingStatus[]`** (既存): `_key` / `platform` / `state` (6 enum) / `publishedUrl` / `publishedAt` / `reactionNotes`
- **`platformOutput`** (既存 doc type): `draftBody` / `status` (5 enum: drafted/reviewed/revised/ready/archived) / `reviewNotes` 等
- **`publishedOutput`** (既存 doc type、 だが dashboard 未使用): `publishedUrl` / `publishedAt` / `title` / `performanceNotes` / `learnings` / `nextAction`
- **`visualAssetPlan`** (Phase 2B-3.1 で 4 field reflect 済): `status` (10 enum、 `archived` で「使わなかった」 表現可) / `reviewNotes`
- **`contentIdea.outputChecklist[]`** (既存、 軽量 tracker): 本 batch では touch しない (redundant、 整理は Phase 2B-X)
- **不在 field** (現状 schema にない): `actualPublishedText` / `publishedTextSource` / `revisionReason` / `visualUsage` / `visualUsageReason` / `supersededOutputId` / `acceptedOutputId` / `publishNotes`

### 4-3. Primary edit surface: `/publish`

| Page | 役割 | 編集? |
|---|---|---|
| `/publish` | **primary publish operation surface** — manualPublishingStatus + platformOutput + visualAssetPlan 編集 | ✅ (本 spec の target) |
| `/publish-package/[slug]` | copy / package detail | read-only 維持 |
| `/outputs` | output revision history | MVP read-only、 Phase 2B-4.1+ で revision 編集 |
| `/campaigns/[slug]` | observation (publish tab) | read-only 維持 |
| `/analytics` | reactionNotes 編集 (Phase 2B-1 既存) | reactionNotes のみ編集可 (既存) |

Phase 2B-2 で確立した「観察 vs 編集 surface 分離」 原則を踏襲、 編集 entry point を 1 page に集約することで logic 重複ゼロ + bug 予測 / spec 変更 / undo lifecycle を 1 page で完結。

### 4-4. Write actions (3 proposed)

すべて Phase 2B-2 pattern (10-step flow + `expectedRevision` + field allow-list + mode='preview'|'execute'):

1. **`updateManualPublishStatus`** — 4 field allow-list (`state` / `publishedUrl` / `publishedAt` / `reactionNotes` MVP では publishNotes 代用)
2. **`updatePlatformOutputStatus`** — 2 field allow-list (`status` / `reviewNotes`)
3. **`updateVisualAssetStatus`** — 2 field allow-list (`status` / `reviewNotes`)、 Phase 2B-3.1 `reflectVisualAssetPatch` (patch JSON 経由 4 field) とは別 action (direct edit、 2 field)

役割分離 (重要):
- `reflectVisualAssetPatch` (既存): Visual Register approve → Sanity (patch JSON 経由、 4 field、 reflect 専用)
- `updateVisualAssetStatus` (新規 proposed): boss 判断 (例: "Threads で使わなかった") → `status: 'archived'` (2 field、 direct edit)

### 4-5. Undo 戦略

すべて Sanity field op only、 filesystem 乖離 risk なし。 `<UndoToastHost>` (Phase 2B-2 で汎用化) を流用:

| Action | Undo? |
|---|---|
| `updateManualPublishStatus` | ✅ 10秒 toast |
| `updatePlatformOutputStatus` | ✅ 10秒 toast |
| `updateVisualAssetStatus` | ✅ 10秒 toast |

Phase 2B-3 / 2B-3.1 で undo を採用しなかった理由 (file pipeline 乖離 risk / patch JSON と Sanity の整合確認難) とは別、 本 batch は **Sanity field op only** なので Phase 2B-1 / 2B-2 と同 pattern が適用可。

### 4-6. UI 設計

`/publish` の `<PublishingMediaTable>` 各 row に編集 affordance + `<IncludedAssetsTable>` に visual usage marking 追加:
- **State dropdown** — Phase 2B-2 `<GateStateControl>` pattern、 terminal (`done`) で confirm modal
- **publishedUrl input** — URL validation regex (`^https?://...`)
- **publishedAt input** — `<input type="datetime-local">` → ISO 化、 デフォルト `new Date().toISOString()`
- **「公開済みにする」 quick action** — state を `done` + publishedUrl + publishedAt + reactionNotes 空 を 1 click で patch
- **「📝 編集状況」 button** — platformOutput status + reviewNotes 編集 panel
- **visual usage form** — visualAssetPlan status (`archived`) + reviewNotes (理由) 編集 form

「Pre-publish revision / Post-publish recording / Post-publish analytics」 を明確に分離:
- Pre-publish revision (本 MVP): `platformOutput.status: 'revised'` + `visualAssetPlan.status: 'archived'` marking
- Post-publish recording (本 MVP): `manualPublishingStatus[_key].{state, publishedUrl, publishedAt}` 編集
- Post-publish analytics (Phase 2B-1 既存): `reactionNotes` 編集 (`/analytics`、 24-72h 後)

### 4-7. Files likely affected (implementation batch、 本 batch では実装しない)

- **新規 (6)**:
  - `dashboard/src/lib/actions/updateManualPublishStatus.ts`
  - `dashboard/src/lib/actions/updatePlatformOutputStatus.ts`
  - `dashboard/src/lib/actions/updateVisualAssetStatus.ts`
  - `dashboard/src/components/publish/PublishStatusRow.tsx`
  - `dashboard/src/components/publish/RevisionMarkingForm.tsx`
  - `dashboard/src/components/publish/VisualUsageMarkingForm.tsx`
- **更新 (3-4)**:
  - `dashboard/src/app/publish/page.tsx`
  - `dashboard/src/lib/groq/campaign.ts` (3 doc に `_rev` projection 拡張)
  - 既存 `<PublishingMediaTable>` 等 (row embed)
  - `dashboard/README.md`

合計 **新規 6 + 更新 3-4 = 9-10 ファイル変更**。 Phase 2B-1 / 2B-2 / 2B-3 / 2B-3.1 より少し大きいが 1 PR 完結可能。

### 4-8. Phase 2B-4.1 schema additions (propose only)

§5 で 7 つの schema addition 候補を **list するに留める** (本 batch では実装しない):

`publishedOutput` 拡張:
- `actualPublishedText` (text, rows:18) — 実投稿 text
- `publishedTextSource` (enum: `generated_as_is` / `manually_rewritten` / `ai_revised` / `unknown`)
- `revisionReason` (text, rows:3)
- `visualUsage` (enum: `used` / `not_used` / `replaced` / `no_visual_planned`)
- `visualUsageReason` (text, rows:3)
- `supersededPlatformOutputIds` (array of refs)
- `acceptedPlatformOutputId` (ref)

`manualPublishingStatus[]` 拡張:
- `publishNotes` (text, rows:3) — MVP では `reactionNotes` を流用、 ambiguity が UX に出るなら 2B-4.1 で分離

`platformOutput` 拡張:
- `revisionReason` (text) — MVP 不要、 boss feedback 次第

boss が MVP で workflow を回した後に「これは本当に必要 / 不要」 を判断する material を集める。

## 5. Open Questions for Boss

Spec §12 にまとめた **Q-2B4-1 〜 Q-2B4-7** (7 件)。 推奨案は本 spec の前提に組み込まれているが、 boss 判断で逆転可能:

| # | 質問 | 推奨 |
|---|---|---|
| Q-2B4-1 | MVP (no schema change) で進めるか、 schema 追加を本 batch に含めるか | **MVP first** (本 spec の前提) |
| Q-2B4-2 | Primary edit surface は `/publish` か `/publish-package/[slug]` か | **`/publish`** (本 spec の前提) |
| Q-2B4-3 | actual published text の保存先 | **MVP では Sanity に保存しない** |
| Q-2B4-4 | visual not used をどう表現 | **`visualAssetPlan.status: 'archived'` + reviewNotes** |
| Q-2B4-5 | publish 時に `publishedOutput` doc を新規作成するか | **MVP では作成しない** |
| Q-2B4-6 | rewrite に AI を含めるか | **MVP は manual rewrite only** |
| Q-2B4-7 | publishedUrl を `manualPublishingStatus` か `publishedOutput` か | **`manualPublishingStatus[_key].publishedUrl`** (既存) |

加えて parent-level open questions (Q-4 audit-log schema / Q-5 reflect-*.mjs 段階削除 / Q-9 W7 promptTemplate save) は本 batch では touch しない、 parent §6 で tracking 継続。

## 6. Key Decisions

- **MVP no-schema-change 戦略**: Phase 2B 全 sub-batch で貫徹した「schema 不変原則」 を Phase 2B-4 でも踏襲、 boss workflow の 80% を既存 field のみでカバー、 残り 20% は「propose only, implement later」
- **3 doc type を 1 page で編集**: manualPublishingStatus + platformOutput + visualAssetPlan を `/publish` に集約、 「観察 vs 編集 surface 分離」 原則 (Phase 2B-2 確立) を踏襲
- **visual usage を `archived` で代用**: 既存 enum 10 値の中で `archived` が「使わなかった」 を最も自然に表現、 新 enum 追加を回避
- **undo 全 3 action で採用**: Sanity field op only なので Phase 2B-1 / 2B-2 と同性質、 `<UndoToastHost>` 流用
- **`reflectVisualAssetPatch` と `updateVisualAssetStatus` を別 action として分離**: 前者は patch JSON 経由の reflect 専用 (4 field)、 後者は boss 判断による direct edit (2 field)、 役割分離で混乱を回避
- **publishedOutput doc 新規作成を MVP に含めない**: Q-2B3.1-7「dashboard が doc create しない」 原則を踏襲
- **AI rewrite を MVP に含めない**: CLAUDE.md「明示的に依頼されるまで API 連携を追加しない」 と整合、 Phase 2B-4.2 候補として deferred
- **schema additions を propose only**: §5 で 7 候補を list するに留め、 本 batch では実装しない、 Phase 2B-4.1 で別 batch
- **本 batch では parent spec §0.5 を touch しない**: Phase 2B-4 が「planning」 status の間は parent row 追加せず、 Q 確定 microbatch で追加 (Phase 2B-3 / 2B-3.1 の spec batch と同 pattern)

## 7. Human Review Questions

### Spec scope の review

1. MVP no-schema-change で 80% カバー という見立ては妥当か? (もし「実 text 保存も MVP に含めるべき」 と判断するなら schema 追加を本 batch / Phase 2B-4 後半に含める方針への切り替え)
2. `/publish` を primary edit surface に絞る方針で OK か? `/publish-package/[slug]` も編集可にする必要があるか
3. visual usage を `archived` enum で代用する trade-off は許容範囲か? (新 enum `not_used` / `replaced` を Phase 2B-4 内で追加する道もある、 ただし schema 不変原則と衝突)
4. `updateVisualAssetStatus` を Phase 2B-3.1 `reflectVisualAssetPatch` と別 action にする分離は適切か? (1 action に統合する案もあるが、 役割が混在するので分離推奨)

### Q 確定の優先順位

5. Q-2B4-1〜Q-2B4-7 の中で boss が **最も迷っている / 議論したい** 項目はどれか
6. 推奨案を全部採用してすぐ Q 確定 microbatch に進むか、 1-2 項目だけ深堀してから進むか

### 次 step の判断

7. 本 spec を boss が read 後、 (a) Q 確定 microbatch (推奨)、 (b) 別 Phase に進む、 (c) 本 spec を保留して別 path に switch のどれか
8. Phase 2B-4 の実装規模 (新規 6 + 更新 3-4 = 9-10 ファイル) は 1 PR で許容できる範囲か? それとも MVP を 2 PR に分割 (e.g., manualPublishingStatus 編集を先 / platformOutput + visualAssetPlan marking を後)

## 8. Risks or Uncertainties

- **MVP scope の見立て誤差**: 「80% カバー」 という推定は boss workflow の経験則ベース、 実際に MVP を boss が運用してみて「思ったより不足」 と判断する可能性。 その場合は Phase 2B-4.1 で schema 追加を早期実施
- **`reactionNotes` を publishNotes 代用とする ambiguity**: Phase 2B-1 で reactionNotes を「24-72h 後の反応メモ」 と定義したが、 本 batch で「publish 時のメモ」 も同 field に書くと semantic 衝突。 boss UX に出るなら Phase 2B-4.1 で `publishNotes` 分離
- **`visualAssetPlan.status: 'archived'` の意味二重化**: 「Phase 2B-3.1 で archived された visual」 vs 「Phase 2B-4 で boss が『使わなかった』 と marking した visual」 が同 enum 値を共有、 区別は `reviewNotes` の文脈に依存。 enum 追加を避ける trade-off
- **`/publish` page 規模の膨張**: 既に `<PageHeader>` + `<CampaignSwitcher>` + `<PackageHeroCard>` + 2-column grid + 5 components が乗っている、 Phase 2B-4 で 3 form 追加すると密度が上がる。 row level に詰め込むか別 modal にするか UI 試作で決める
- **Q-2B4-1〜Q-2B4-7 の推奨案を boss が全採用する想定の脆さ**: 推奨案は Phase 2B 既存 pattern + CLAUDE.md 方針との整合を最大化したが、 boss が「いや、 actual text は MVP で保存したい」 と判断したら schema 追加が本 batch に入り込む可能性
- **implementation batch の token leak / regression risk**: 新規 6 ファイル + 既存 `/publish` 更新で、 各 dropdown / input が状態を保持、 router.refresh() タイミング、 conflict reload prompt の UX、 `<UndoToastHost>` の cross-page 動作確認 等の検証項目が多い

## 9. Remaining Cleanup Candidates

本 spec が land 後の段階で、 まだ未着手:

- **Phase 2B-4.1 schema 追加** (本 spec §5 で 7 候補列挙、 boss が「MVP では足りない」 と判断したら別 batch)
- **Phase 2B-4.2 AI generation** (regeneration / rewrite / version compare、 AI integration 設計が必要)
- **Phase 2B-2.1**: gate reviewer / notes / completedAt 編集
- **Phase 2B-3.2**: multi-asset reflect / publish-package auto / CLI status indicator
- **Phase 2B-3.3**: Visual Register retirement (share library extraction)
- **Phase 2B-X cleanup**: dead code (amber「編集不可」 affordance + `[hrg:diag]` log)、 `<UndoToastHost>` AppShell 化、 `<DeferredActionButton>` 削除
- **Parent-level open questions**: Q-4 (audit-log schema) / Q-5 (reflect-*.mjs 段階削除) / Q-9 (W7 promptTemplate save)
- **別 W**: W4 campaign metadata / W6 publishedUrl auto / W7 promptTemplate save / W8 publishPackagePaths state

## 10. Next Recommended Step

**Phase 2B-4 Q 確定 microbatch (docs-only)**

boss が本 spec の Q-2B4-1〜Q-2B4-7 (7 件 open question) に judgement、 Claude Code が docs-only microbatch で spec を CONFIRMED 化:

- `docs/specs/phase-2b-4-publish-status-output-revision.md` の Q 表を「推奨」 → 「CONFIRMED」 書き換え
- `docs/specs/phase-2b-write-actions.md` §0.5 に Phase 2B-4 行を追加 (5 区分 / 6 区分から 7 区分へ拡張するならその decision も含む)
- devlog + handoff 1 ペア

その後 → Phase 2B-4 implementation batch (新規 6 + 更新 3-4 = 9-10 ファイル) → smoke test → 必要なら smoke fix microbatch。

---

### Exact prompt for next Claude Code session (Q-2B4 確定 microbatch)

```
Confirm Phase 2B-4 Publish Status + Output Revision Workflow open decisions.

Reference: docs/specs/phase-2b-4-publish-status-output-revision.md §12 (Open questions Q-2B4-1〜Q-2B4-7).

Boss decisions to land in spec (docs-only, no code, no schema change):

Q-2B4-1: MVP no-schema-change first → CONFIRMED (推奨採用)
Q-2B4-2: Primary edit surface = /publish → CONFIRMED
Q-2B4-3: actual published text は MVP では Sanity に保存しない → CONFIRMED
Q-2B4-4: visual not used = visualAssetPlan.status: 'archived' + reviewNotes → CONFIRMED
Q-2B4-5: publishedOutput doc 新規作成は MVP では行わない → CONFIRMED
Q-2B4-6: AI rewrite は MVP に含めず Phase 2B-4.2 候補 → CONFIRMED
Q-2B4-7: publishedUrl は manualPublishingStatus[_key].publishedUrl → CONFIRMED

(boss が項目別に逆転判断する場合はその指示で上書き)

Tasks:
1. Update docs/specs/phase-2b-4-publish-status-output-revision.md §12 Q 表を「推奨」 → 「CONFIRMED」 化、 §0.5 / §1 / §4 / §5 / §6 / §10 で必要な「前提を再確認」 文を追加
2. Update docs/specs/phase-2b-write-actions.md §0.5 Implementation status に Phase 2B-4 行を追加 (planning → confirmed)
3. Create docs/devlog/0185-phase-2b-4-publish-status-output-revision-decisions.md
4. Create docs/handoff/0196-phase-2b-4-publish-status-output-revision-decisions.md
5. Mirror to docs/handoff/latest.md

Docs only. dashboard/src, tools, schemas, assets, patches, publish-package, package.json 触らない。 build 不要。

End-of-run summary:
- Confirmed decisions
- Spec section updates
- Parent spec section update
- Next: implementation batch (new 6 + updated 3-4 = 9-10 files)
```

## 11. Validation

```
=== Docs-only check (expect empty under runtime + protected paths) ===
$ find dashboard/src tools schemas publish-package assets patches -type f \
    -newer docs/handoff/0194-phase-2b-3-1-smoke-pass-visual-flow-complete.md
(expect empty)

$ find . -maxdepth 2 -name "package.json" \
    -newer docs/handoff/0194-phase-2b-3-1-smoke-pass-visual-flow-complete.md \
    -not -path "*/node_modules/*"
(expect empty)

=== Files touched in this batch ===
docs/specs/phase-2b-4-publish-status-output-revision.md  (new, 716 行, 16 セクション planning spec)
docs/devlog/0184-phase-2b-4-publish-status-output-revision-spec.md  (new)
docs/handoff/0195-phase-2b-4-publish-status-output-revision-spec.md  (new, this file)
docs/handoff/latest.md  (mirror of 0195)
```

Build skipped (docs-only). Runtime behavior unchanged: Phase 2B-1 reactionNotes + Phase 2B-2 humanReviewGate state + Phase 2B-3 Visual approve/register bridge + Phase 2B-3.1 visualAssetPlan Sanity reflect / Visual Register CLI / publish-package すべて preserved as-is. Sanity schema 不変。

Phase 2B-4 spec が docs-only で land、 boss が Q-2B4-1〜Q-2B4-7 (7 件 open question) を judgement する段階。
