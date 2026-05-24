# Phase 2B-4 Detail Spec — Publish Status + Output Revision Workflow

最終更新: 2026-05-21
ステータス: planning spec, docs only (no implementation, no schema change, no Sanity write)
オーナー: boss + Claude Code
親 spec: [docs/specs/phase-2b-write-actions.md](./phase-2b-write-actions.md) (Phase 2B 全体)
前 spec: Phase 2B-1 / 2B-2 / 2B-3 / 2B-3.1 (4 sub-batch すべて smoke PASS — handoff/0186 + 0190 + 0194)

## 0. Confirmed decisions (inherited)

### Parent batch (handoff/0175)

- **Q-1** ✅: `SANITY_WRITE_TOKEN` は `dashboard/.env.local` 専用、 Vercel scope に絶対設定しない
- **Q-2** ✅: Production write は永久 disabled、 `enableWriteActions` + `SANITY_WRITE_TOKEN` 両方揃った local/dev のみ発火

### Phase 2B-1 / 2B-2 / 2B-3 / 2B-3.1 で確立した template

- **Q-6 (undo, Sanity field op)** ✅: in-memory 10秒 toast (W3 / W5 で採用)、 file pipeline と密結合の Sanity reflect (2B-3.1) では採用せず
- **Q-8 (conflict)** ✅: `_rev` mismatch → reload prompt、 no last-write-wins、 no 3-way merge
- **Q-10 (devlog)** ✅: 自動 devlog 生成なし、 server `console.log` のみ (metadata only)
- **Edit surface 原則** (Phase 2B-2 で確立): 1 page に絞るのが基本、 2 文脈ある場合 (Phase 2B-3.1) は両 page を許容
- **Schema 不変原則** (Phase 2B 全 sub-batch で貫徹): controlled write の境界を明確化、 schema 変更は別 spec batch で扱う

### Phase 2B-4 batch (本 spec、 confirmed direction)

boss が現実の publish workflow から導出した要件:

- Threads 自前で公開 (boss が手動投稿)
- 生成 text が weak → boss が rewrite
- 生成 diagram も weak → visual なしで投稿
- dashboard で記録したい:
  - 実 publish status
  - publishedUrl
  - 実際に投稿した text
  - 生成 text は revise / replace された
  - 生成 visual は使われなかった
  - 理由
  - 将来は dashboard 内で text / visual の remake

**現在 dashboard が write 可能な 4 surface**:
- Phase 2B-1: reactionNotes
- Phase 2B-2: humanReviewGate state
- Phase 2B-3: visual approve & register (filesystem)
- Phase 2B-3.1: visualAssetPlan Sanity reflect

**ギャップ**:
- `manualPublishingStatus[]` の state / publishedUrl / publishedAt 更新は **未実装** (dashboard で write できない、 boss は `tools/sanity/reflect-publication-state.mjs --execute` で CLI 経由のみ)
- 「生成 text を revise した」 marking は未実装
- 「visual を使わなかった」 marking は未実装
- 「実際に投稿した text を保存」 は未実装

### Remaining parent-level open questions

**Q-4 (audit-log schema) / Q-5 (reflect-*.mjs 段階削除) / Q-9 (W7 promptTemplate save)** は parent §6 で tracking 継続、 本 batch では touch しない。

---

## 1. Product goal

dashboard で boss が **publishing workflow loop を完結** できるようにする:

1. 生成された出力 (text + visual) を review
2. 必要なら rewrite / replace を marking
3. visual を使うかどうか決定
4. 実投稿は dashboard **外** で実行 (manual publishing は変えない、 Phase 2B 全体の方針)
5. publishedUrl / publishedAt / state を dashboard に **record back**
6. 変更理由を preserve

「manual publishing を dashboard が代行する」 ではない、 「manual publishing の **結果と判断を dashboard が記録する**」 のが本 spec の本質。

### In scope (Phase 2B-4 MVP)

- `/publish` page で **`manualPublishingStatus[]` の state / publishedUrl / publishedAt / publishNotes 編集** (Phase 2B-2 と同じ `expectedRevision` + 4 field allow-list + dropdown pattern)
- `platformOutput.status` 編集 (`drafted` → `revised` / `archived` / `ready`) + `platformOutput.reviewNotes` 編集
- `visualAssetPlan.status: 'archived'` 設定 + `visualAssetPlan.reviewNotes` 編集 (「使わなかった」 marking)
- 既存 `<UndoToastHost>` pattern を再利用 (Sanity field op だけなので 10秒 undo 採用可)
- dry-run / preview / confirm modal は Phase 2B-2 と同パターン

### Out of scope (本 spec の対象外、 §10 で再列挙)

- **Sanity schema 変更**: 本 batch では行わない (Phase 2B-4.1 候補)
- **実投稿の auto-post** (X / note / Substack / Threads): never (Phase 2B 全体の方針)
- **AI 経由の text / visual 再生成**: 本 batch では manual rewrite のみ、 Phase 2B-4.2 候補
- **`publishedOutput` doc の新規作成**: Q-2B3.1-7 と同じく「dashboard は doc create しない」 原則を踏襲、 Phase 2B-4.1 候補
- **publish-package 自動再生成**: `npm run publish:package` の dashboard auto-trigger は採用しない (Q-2B3-4 と整合)
- **multi-platform bulk update**: 1 row / 1 transaction を維持
- **promptTemplate / 設定変更**: Phase 2B-X / W7

---

## 2. Target pages

### 2-1. Recommendation: **`/publish` を primary edit surface に**

| Page | 役割 (Phase 2B-4 後) | 編集可? |
|---|---|---|
| `/publish` | **primary publish operation surface** — manualPublishingStatus row table + 編集 UI + platformOutput status + visualAssetPlan status | ✅ 編集可 (本 spec の target) |
| `/publish-package/[slug]` | **copy / package detail surface** — publish-packages directory の md ファイル + boss が copy-paste で投稿準備 | read-only 維持 |
| `/outputs` | **output revision history surface** — platformOutput / publishedOutput の世代管理 (Phase 2B-4.1 で本格化、 MVP では read-only 拡張のみ) | MVP では read-only 維持、 Phase 2B-4.1+ で revision 編集 |
| `/campaigns/[slug]` | **observation surface** — manualPublishingStatus は read-only 表示、 編集は `/publish` へ link | read-only 維持 (Phase 2B-2 で確立した「観察 / 編集 surface 分離」 原則と整合) |
| `/analytics` | **post-publish analytics surface** — reactionNotes 編集は既に Phase 2B-1 で実装済、 publishedUrl 等の publish status 表示は read-only | reactionNotes のみ編集可 (既存) |

### 2-2. 既存 `/publish` の現状

audit より:
- `<PageHeader>` + `<CampaignSwitcher>` + `<PackageHeroCard>` + 2-column grid
- 左カラム: `<ChannelsGrid>` (state/URL 表示) + `<PublishingMediaTable>` (manualPublishingStatus 表示) + `<IncludedAssetsTable>` (visual assets)
- 右カラム: `<PublishingLifecycleTimeline>` + `<ReleaseNotesCard>` + `<RiskCheckCard>` + `<PostPublishMonitoringCard>`
- 編集 button 3 つ (編集 / 設定 / 今すぐ公開) は disabled、 "Phase UI-3+" / "Phase UI-7+" 注釈付き

→ 既に publish workflow の visual scaffolding は揃っている。 Phase 2B-4 で `<PublishingMediaTable>` の各 row に編集 UI を追加するのが最も自然。

### 2-3. 「観察 vs 編集」 surface 分離 (Phase 2B-2 原則の踏襲)

- **編集**: `/publish` のみ
- **観察**: `/campaigns/[slug]` (publish tab) / `/outputs` / `/publish-package/[slug]` / `/analytics`
- これにより:
  - 同 server action を 1 entry point から呼ぶ logic 重複ゼロ
  - bug 予測 / spec 変更 / undo lifecycle が 1 page で完結
  - boss が「ここで編集できる」 と即座に認識

---

## 3. Data model inventory

audit 結果 (handoff/0195 audit summary 参照):

### 3-1. `campaignPlan.manualPublishingStatus[]` (既存)

Per-item fields:
- `_key` (auto, required by Sanity for array element patch)
- `platform` (string enum: note / substack / threads / x / youtube / shorts / podcast / instagram / github / paid / newsletter)
- `state` (string enum: not-started / in-progress / pending-review / done / skipped / blocked)
- `publishedUrl` (url, optional)
- `publishedAt` (datetime, optional)
- `reactionNotes` (text rows:3, optional — Phase 2B-1 で編集可)

### 3-2. `platformOutput` (既存、 doc type)

- `sourceContentIdea` (ref, required)
- `sourceWorkflow` (ref, optional)
- `platform` (string enum)
- `outputType` (string enum)
- `title` (string, optional)
- `draftBody` (text rows:18, required) — **生成 text**
- `localOutputPath` (string, optional)
- `status` (string enum: `drafted` / `reviewed` / `revised` / `ready` / `archived`)
- `reviewNotes` (text, optional) — 「revision 理由」 として使える
- `generatedFromPrompt` (ref to prompt, required)
- 他: `outputLength`, `targetFormat`, `primaryCTA`, `contentStatus`

### 3-3. `publishedOutput` (既存、 doc type、 だが dashboard 未使用)

- `sourcePlatformOutput` (ref to platformOutput, optional)
- `sourceDiagramPlan` (ref to diagramPlan, optional)
- `platform` (string enum)
- `publishedUrl` (url, required)
- `publishedAt` (datetime, required)
- `title` (string, required)
- `performanceNotes` (text, optional)
- `learnings` (text, optional)
- `nextAction` (text, optional)

**注意**: dashboard から query / 書き込み 0 件、 schema 内に定義はあるが宙ぶらりん状態。

### 3-4. `visualAssetPlan` (既存、 Phase 2B-3.1 で 4 field reflect 済)

- `status` enum 10 値: `planned` / `brief-ready` / `prompt-ready` / `generated-needs-save` / `saved` / `reviewed` / `approved` / `packaged` / `published` / `archived`
- `reviewNotes` (text) — 「使わなかった理由」 として使える

### 3-5. `contentIdea.outputChecklist[]` (既存)

per-item: `outputType` / `status` / `publishedUrl` — 軽量 publish 進捗 tracker、 本 batch では touch しない (manualPublishingStatus と redundant、 整理は Phase 2B-X)

### 3-6. 不在 (schema に無い)

- `actualPublishedText` (text)
- `publishedTextSource` (enum: generated / manually_rewritten / ai_revised)
- `revisionReason` (text、 既存 `platformOutput.reviewNotes` で代用可能)
- `visualUsage` (enum: used / not_used / replaced、 既存 `visualAssetPlan.status: 'archived'` で代用可能)
- `visualUsageReason` (既存 `visualAssetPlan.reviewNotes` で代用可能)
- `supersededOutputId` (ref)
- `acceptedOutputId` (ref)
- `publishNotes` (text、 既存 `reactionNotes` を流用可能だが意味が薄れる)

---

## 4. Minimum no-schema-change implementation (MVP)

本 batch では **既存 schema field のみ** で workflow を完結させる。 boss workflow の 80% は以下でカバー可能:

### 4-1. Publish status 記録 (manualPublishingStatus[])

`/publish` の `<PublishingMediaTable>` 各 row に編集 UI を追加:

- **state** dropdown: 6 enum (Phase 2B-2 と同じ allow-list)
- **publishedUrl** input (URL validation regex)
- **publishedAt** input (datetime-local、 ISO 化)
- **publishNotes** (= `reactionNotes` を流用、 Phase 2B-4.1 で別 field 化検討)

これだけで boss prompt の主要要件 (publish status / URL / 日時 / メモ) を満たす。

### 4-2. 生成 text の revision marking (platformOutput)

`/publish` の同 row 内で `platformOutput` reference を expand して:

- **status** dropdown: `drafted` → `reviewed` / `revised` / `ready` / `archived`
  - `revised` = boss が手動 rewrite した
  - `archived` = boss が使わなかった
  - `ready` = generated のまま投稿可
- **reviewNotes** text input (max 2000 文字、 Phase 2B-1 reactionNotes と同じ): revision 理由を書く

「Threads text was weak → boss が rewrite」 ケース: `status: 'revised'` + `reviewNotes: "weak generation; manually rewrote on threads.net"`

### 4-3. Visual を使わなかった marking (visualAssetPlan)

`/publish` の row から visual asset への link 経由で、 または `/publish` の `<IncludedAssetsTable>` の各 visual row に:

- **status** dropdown: `archived` を選ぶことで「使わなかった」 を marking
  - 既存 enum 10 値の中で `archived` が最も近い
  - Phase 2B-3.1 で `status: 'saved'` を reflect する pattern は確立済、 同 server action を流用可
- **reviewNotes** text input: visual を使わなかった理由

「Threads visual was weak → 投稿しなかった」 ケース: `status: 'archived'` + `reviewNotes: "diagram quality below threshold; published text-only on threads"`

### 4-4. 実際に投稿した text の保存

**MVP では Sanity に保存しない**。 boss は:
- 実 text は X / note / Substack / Threads のプラットフォーム自身が保持
- publish-packages/*.md は draft、 final ではない
- dashboard は「revision された事実」 + 「理由」 を `platformOutput.status` + `reviewNotes` で記録するだけ

→ boss が「実 text も Sanity に保存したい」 と判断すれば Phase 2B-4.1 で schema 追加。 MVP では「事実 + 理由」 で workflow を回せる。

### 4-5. 実 MVP 実装ファイル想定

**新規**:
- `dashboard/src/lib/actions/updateManualPublishStatus.ts` (`'use server'`、 4 field allow-list、 Phase 2B-2 pattern)
- `dashboard/src/lib/actions/updatePlatformOutputStatus.ts` (`'use server'`、 2 field allow-list: `status` + `reviewNotes`)
- `dashboard/src/lib/actions/updateVisualAssetStatus.ts` (`'use server'`、 2 field allow-list: `status` + `reviewNotes`、 reflect 機能とは別 action)
- `dashboard/src/components/publish/PublishStatusRow.tsx` (`'use client'`、 row 編集 UI、 dropdown + inputs + confirm modal)
- `dashboard/src/components/publish/RevisionMarkingForm.tsx` (`'use client'`、 platformOutput status 編集 form)
- `dashboard/src/components/publish/VisualUsageMarkingForm.tsx` (`'use client'`、 visualAssetPlan status 編集 form)

**更新**:
- `dashboard/src/app/publish/page.tsx` — `<PublishingMediaTable>` 各 row に編集 affordance を追加、 `<IncludedAssetsTable>` も同様
- `dashboard/src/lib/groq/campaign.ts` — `manualPublishingStatus` + `platformOutput` + `visualAssetPlan` の必要 field を / publish 用に enrich (`_rev` を 3 doc 全部にに含める)
- `dashboard/README.md` — Phase 2B-4 row 追加

**合計**: 新規 6 + 更新 3 = 9 ファイル。 Phase 2B 既存 4 sub-batch と同等規模 (やや大きめ)。

---

## 5. Potential schema additions (Phase 2B-4.1 候補、 本 batch では実装しない)

boss が「MVP では足りない、 actual text や revision history を Sanity に保存したい」 と判断した場合に提案する schema additions:

### 5-1. `publishedOutput` を実用化 (既存 doc type の拡張)

既存 `publishedOutput` schema に **field 追加**:
- `actualPublishedText` (text, rows:18, optional)
- `publishedTextSource` (string enum: `generated_as_is` / `manually_rewritten` / `ai_revised` / `unknown`)
- `revisionReason` (text, rows:3, optional)
- `visualUsage` (string enum: `used` / `not_used` / `replaced` / `no_visual_planned`)
- `visualUsageReason` (text, rows:3, optional)
- `supersededPlatformOutputIds` (array of refs to platformOutput) — 廃案にした draft の追跡
- `acceptedPlatformOutputId` (ref to platformOutput) — どの draft を base に投稿したか

これにより:
- `manualPublishingStatus[_key]` は publish status (state + URL + at) を持つ
- `publishedOutput` (新規 doc を **boss が Studio で作成**、 dashboard は field 編集のみ) は actual text + revision metadata を持つ
- 関係: `manualPublishingStatus[_key].publishedUrl === publishedOutput.publishedUrl` で結合

### 5-2. `manualPublishingStatus[]` に publishNotes 追加

既存 `reactionNotes` (24-72h 後の反応メモ) と分離するため:
- `publishNotes` (text, rows:3, optional) — publish 時の状況 / 判断のメモ

Phase 2B-1 reactionNotes と semantic separation。 MVP では `reactionNotes` を流用するが、 ambiguity が boss UX に出るなら 2B-4.1 で分離。

### 5-3. `platformOutput` に minor 追加

既存 `status` enum (`drafted` / `reviewed` / `revised` / `ready` / `archived`) はそのまま、 追加候補:
- `revisionReason` (text、 `reviewNotes` と被るが意味的に分離) — MVP 不要、 boss feedback 次第

### 5-4. なぜ本 batch で schema 追加しないか

- Phase 2B 全 sub-batch で「schema 不変原則」 を貫徹済、 boss が 4 sub-batch 完了後の節目で schema 変更を実施するなら **別 spec batch + boss confirmation** が必要
- schema 変更は「Sanity Studio で全 doc の re-validate」「既存 publishedOutput doc (もしあれば) との migration」 等の複雑度が増す
- MVP (no schema change) で workflow が 80% 回ることを実証してから、 残り 20% を schema 追加で埋める
- 本 batch では「propose only、 implement later」 原則を遵守

---

## 6. Write actions

### 6-1. updateManualPublishStatus (server action、 Phase 2B-2 pattern)

```ts
'use server'

export interface UpdateManualPublishStatusInput {
  campaignId: string                          // 'campaignPlan.<slug>'
  itemKey: string                             // manualPublishingStatus[_key]
  platform: string                            // defense-in-depth
  expectedRevision: string
  // 編集対象 4 field (すべて optional、 send されたものだけ update)
  state?: 'not-started' | 'in-progress' | 'pending-review' | 'done' | 'skipped' | 'blocked'
  publishedUrl?: string | null                // null で unset
  publishedAt?: string | null                 // ISO datetime or null
  publishNotes?: string | null                // = reactionNotes for MVP (rename in 2B-4.1)
  mode: 'preview' | 'execute'
}
```

field allow-list (hardcoded set keys):
- `manualPublishingStatus[_key=="<key>"].state`
- `manualPublishingStatus[_key=="<key>"].publishedUrl`
- `manualPublishingStatus[_key=="<key>"].publishedAt`
- `manualPublishingStatus[_key=="<key>"].reactionNotes` (MVP では publishNotes alias)

### 6-2. updatePlatformOutputStatus (server action、 Phase 2B-2 pattern)

```ts
'use server'

export interface UpdatePlatformOutputStatusInput {
  platformOutputId: string                    // 'platformOutput.<slug>'
  expectedRevision: string
  status?: 'drafted' | 'reviewed' | 'revised' | 'ready' | 'archived'
  reviewNotes?: string | null
  mode: 'preview' | 'execute'
}
```

field allow-list:
- `status`
- `reviewNotes`

### 6-3. updateVisualAssetStatus (server action、 Phase 2B-2 pattern)

```ts
'use server'

export interface UpdateVisualAssetStatusInput {
  visualAssetPlanId: string                   // 'visualAssetPlan.<slug>.<asset>'
  expectedRevision: string
  status?: 'planned' | 'brief-ready' | 'prompt-ready' | 'generated-needs-save'
         | 'saved' | 'reviewed' | 'approved' | 'packaged' | 'published' | 'archived'
  reviewNotes?: string | null
  mode: 'preview' | 'execute'
}
```

field allow-list:
- `status`
- `reviewNotes`

**重要**: 既存 Phase 2B-3.1 の `reflectVisualAssetPatch` は 4 field を patch JSON から apply する **別 action**。 本 batch の `updateVisualAssetStatus` は **`status` + `reviewNotes` の 2 field のみ** を direct edit する、 patch JSON 経由でない。 役割分離:
- `reflectVisualAssetPatch`: Visual Register approve → Sanity (patch JSON 経由、 4 field、 reflect 専用)
- `updateVisualAssetStatus`: boss 判断 (例: "Threads 投稿で使わなかった") → status: 'archived' (2 field、 direct edit)

### 6-4. (Phase 2B-4.1 候補) createOrUpdatePublishedOutput

boss が「actual text + revision metadata を Sanity に保存したい」 と判断したら、 schema 追加 (§5-1) + 本 server action 追加。 **本 batch では実装しない**。

### 6-5. 共通 safety pattern (Phase 2B 既存 4 sub-batch と同一)

すべての server action で:
- `enableWriteActions` env flag
- `SANITY_WRITE_TOKEN` env presence
- Input regex validation
- `expectedRevision` 必須 + Sanity re-fetch verify
- Field allow-list (hardcoded set keys)
- mode='preview' / 'execute' 2 段
- `_rev` mismatch → conflict reload prompt
- 自動 devlog 生成なし、 server `console.log` metadata only
- token / 本文 を log しない

### 6-6. Undo 戦略

| Action | Undo? | 理由 |
|---|---|---|
| `updateManualPublishStatus` | ✅ 10秒 toast | Sanity field op、 Phase 2B-1 / 2B-2 と同じ性質、 `<UndoToastHost>` 流用 |
| `updatePlatformOutputStatus` | ✅ 10秒 toast | Sanity field op、 同上 |
| `updateVisualAssetStatus` | ✅ 10秒 toast | Sanity field op、 同上 |

すべて `<UndoToastHost>` (Phase 2B-2 で汎用化済) を流用、 `notifySaved` 経由で 10秒 undo を提供。

これは Phase 2B-3 / 2B-3.1 で undo を採用しなかった判断 (file pipeline 乖離 risk) とは別、 本 batch は **Sanity field op only** なので Phase 2B-1 / 2B-2 と同性質。

---

## 7. UI design

### 7-1. `/publish` page の `<PublishingMediaTable>` 拡張

既存 row のレイアウト:
```
| Platform | State | publishedUrl | publishedAt | reactionNotes |
```

拡張後:
```
| Platform | State (dropdown) | publishedUrl (input + 「公開」 button) |
|          | publishedAt (input) | 編集ボタン (text/visual revision) |
```

クリックで:
- **State dropdown**: Phase 2B-2 の `<GateStateControl>` と同じ pattern、 allowed transitions のみ (e.g., `in-progress → done` で「公開済みにする」)、 terminal (`done`) で confirm modal
- **publishedUrl input**: URL validation regex (`^https?://...`)、 入力後「保存」 で server action
- **publishedAt input**: `<input type="datetime-local">` → ISO 化、 デフォルト `new Date().toISOString()` (= 「いま」)
- **公開済みにする quick action**: state を `done` に + publishedUrl + publishedAt + reactionNotes 空 を 1 click で patch (boss が「いま投稿した」 と marking する flow)

### 7-2. Revision marking surface

各 row の右側に「📝 編集状況」 button → 展開 panel:
- **生成 text status** dropdown (`drafted` / `reviewed` / `revised` / `ready` / `archived`)
- **revision 理由** textarea (max 2000 chars、 Phase 2B-1 reactionNotes と同じ)
- 関連 platformOutput を fetch (GROQ projection) して、 現在の status を初期値に

### 7-3. Visual usage marking surface

各 row の visual asset link → 別 modal or `/visual-assets/[assetId]` 上の `<ReflectVisualAssetAction>` と並列に **新規** `<VisualUsageMarkingForm>`:
- **visual status** dropdown (10 enum、 `archived` で「使わなかった」 表現)
- **visual 使用判断の理由** textarea
- これは Phase 2B-3.1 の `reflectVisualAssetPatch` とは **別 action** (patch JSON 経由でない direct edit)

### 7-4. UI state machine (各 row)

```
1. initial:
   - state / publishedUrl / publishedAt / publishNotes を表示

2. boss が「state dropdown」 を click:
   - dropdown 展開 → allowed transitions
   - terminal (`done`) を選ぶと confirm modal (Phase 2B-2 pattern)

3. boss が「公開済みにする」 button を click:
   - inline form: publishedUrl + publishedAt を入力
   - 「保存」 で server action mode='execute' を呼ぶ
   - publishedAt のデフォルトは `new Date().toISOString()` (boss が「いま」 と判断するため)

4. saving:
   - row が spinner + aria-busy

5. success:
   - 10秒 emerald toast (`<UndoToastHost>`) で 「元に戻す」 button + state update が反映
   - reaction notes は別 surface (`/analytics` Phase 2B-1) に誘導 link

6. conflict:
   - rose banner + 「更新」 button → router.refresh()
```

### 7-5. Visual layout (proposal)

```
┌─────────────────────────────────────────────────────────────┐
│ /publish [building-hitori-media-os]                         │
├─────────────────────────────────────────────────────────────┤
│ <PageHeader>                                                │
│ <CampaignSwitcher> <PackageHeroCard>                        │
├─────────────────────────────────────────────────────────────┤
│ Publishing Media Table (Phase 2B-4 で edit affordance 追加) │
│ ┌───────────┬─────────┬────────┬──────┬────────────┬─────┐ │
│ │ Platform  │ State   │ URL    │ At   │ ✏️ Revision│ ⚙️ │ │
│ ├───────────┼─────────┼────────┼──────┼────────────┼─────┤ │
│ │ X         │ ✓ done  │ https… │ ...  │ ready      │ ▶  │ │
│ │ note      │ ✓ done  │ https… │ ...  │ revised    │ ▶  │ │
│ │ Substack  │ ✓ done  │ https… │ ...  │ ready      │ ▶  │ │
│ │ Threads   │ in-prog │ —      │ —    │ revised    │ ▶  │ │
│ └───────────┴─────────┴────────┴──────┴────────────┴─────┘ │
│ │  ✏️ 編集 column の click で revision panel 展開           │
│ │  ⚙️ 列の click で 詳細編集 modal (rare 操作用、 status + │
│ │    publishedUrl + publishedAt + publishNotes 一括)        │
├─────────────────────────────────────────────────────────────┤
│ <IncludedAssetsTable> (Phase 2B-4 で visual 使用判断 追加)  │
│ │  Visual asset row に「使わなかった」 button + 理由 input  │
├─────────────────────────────────────────────────────────────┤
│ 右カラム: <PublishingLifecycleTimeline> + 他 (read-only 維持)│
└─────────────────────────────────────────────────────────────┘
```

### 7-6. 「Pre-publish revision / post-publish recording / post-publish analytics」 の明確な分離

- **Pre-publish revision** (本 batch MVP 範囲):
  - `platformOutput.status: 'revised'` marking (生成 text を boss が rewrite した事実)
  - `visualAssetPlan.status: 'archived'` marking (visual を使わなかった事実)
- **Post-publish recording** (本 batch MVP 範囲):
  - `manualPublishingStatus[_key].{state, publishedUrl, publishedAt}` 編集
  - 「いま公開した」 を 1 click で marking する quick action
- **Post-publish analytics** (Phase 2B-1 既存):
  - `manualPublishingStatus[_key].reactionNotes` 編集 (`/analytics` 上、 24-72h 後)
  - 本 batch では touch しない、 既存動作維持

### 7-7. publish-package との関係

- `/publish-package/[slug]` は read-only 維持 (publish-packages directory の md ファイル表示)
- 投稿前に boss は publish-package の text を copy → 各プラットフォームに投稿 → URL を取得 → dashboard `/publish` に戻って record
- dashboard が「実 text を保存」 しないので、 publish-package の md ファイルが「投稿前の draft」 のままで OK
- 「投稿後に rewrite した実 text」 は schema 追加後 (Phase 2B-4.1) に `publishedOutput.actualPublishedText` に保存

---

## 8. Regeneration / rewrite workflow

### 8-1. MVP (本 batch、 manual rewrite only)

boss workflow:
1. publish-package の draft (例: `publish-packages/threads/<slug>/posts.md`) を見る
2. weak と判断 → 別プラットフォーム上で手動 rewrite
3. dashboard `/publish` 上で `platformOutput.status: 'revised'` を marking + `reviewNotes` で理由を 1-2 行記述

dashboard は AI 経由の regeneration をしない、 rewrite UI もしない (boss は外部で書く)。

### 8-2. Future (Phase 2B-4.2 候補、 AI generation)

deferred:
- `/configurator` で imagePrompt / draftBody の regeneration trigger
- AI 経由で新 draft を生成 (Anthropic API / OpenAI API、 CLAUDE.md「API 連携を追加しない」 方針との整合確認が必要)
- 複数 version の compare UI
- 「accepted output」 を boss が選ぶ

### 8-3. Output versioning (Phase 2B-4.2+)

deferred:
- `platformOutput` を複数 draft (v1, v2, v3) で連鎖
- `supersededPlatformOutputIds` ref で履歴
- 「どの version が accepted (= 投稿された実 text のベース)」 を `acceptedPlatformOutputId` ref で marking
- これらはすべて schema 追加が必要

---

## 9. Visual rewrite / no-visual workflow

### 9-1. MVP (本 batch)

boss workflow:
1. inbox / candidates page で visual candidate を見る → quality が boss 基準を満たさない
2. dashboard `/publish` の `<IncludedAssetsTable>` から visual asset の row で「使わなかった」 を marking
3. `visualAssetPlan.status: 'archived'` + `reviewNotes` で理由 (`low quality / off-brand / not needed / platform text-only` のいずれか + 自由記述)

### 9-2. Reason vocabulary (MVP では自由テキスト、 Phase 2B-4.1 で enum 化候補)

reviewNotes に書く際の **推奨 prefix**:
- `low_quality:` 生成 quality が boss 基準未達
- `off_brand:` brand voice / style と乖離
- `not_needed:` text-only で十分判断
- `platform_text_only:` プラットフォーム特性で visual 不要 (例: Threads text-first)
- `replaced:` 別 visual に差し替え (Phase 2B-4.1 で replacement workflow 追加候補)

形式例: `"platform_text_only: Threads 1 件目は text 単独で勢いを保つ判断、 diagram 別 thread で後出し検討"`

### 9-3. Future (Phase 2B-4.2 候補)

- visual replacement workflow: 別 visual asset 候補と link
- visual regeneration trigger (codex exec + Visual Register CLI bridge 連動)
- 「accepted visual」 marking で publishedOutput と結合

---

## 10. Scope exclusions

本 batch では **やらない** (明示):

- ✗ Sanity schema 変更 (Phase 2B-4.1 候補)
- ✗ auto-post (X / note / Substack / Threads): never
- ✗ AI 経由 text / visual regeneration: Phase 2B-4.2 候補
- ✗ `publishedOutput` doc の新規作成 (dashboard が doc create しない原則)
- ✗ publish-package 自動再生成
- ✗ multi-platform bulk update (1 row / 1 transaction)
- ✗ output versioning / supersededOutputId / acceptedOutputId (Phase 2B-4.2+ schema 追加が必要)
- ✗ 「実際に投稿した text」 を Sanity に保存 (MVP では platformOutput.status + reviewNotes で「事実 + 理由」 だけ、 Phase 2B-4.1 で schema 追加)
- ✗ promptTemplate 編集 (W7)
- ✗ Visual Register retirement (long-term direction、 Phase 2B-3.3 候補)
- ✗ audit-log schema (parent Q-4)

---

## 11. Acceptance criteria

10 項目 smoke checklist:

1. **Build**: `cd dashboard && npm run build` で 23 routes すべて green、 TypeScript clean
2. **Default behavior** (writeReady=false): `/publish` で既存 read-only 動作完全維持、 `<PublishingMediaTable>` 各 row に disabled「編集不可」 indicator のみ表示
3. **Enabled behavior**: `ENABLE_WRITE_ACTIONS=true` + `SANITY_WRITE_TOKEN` で:
   - manualPublishingStatus row で state 編集 (例: `in-progress` → `done`) → Sanity Studio で確認
   - publishedUrl + publishedAt を input + 保存 → Sanity 更新
   - 「いま公開した」 quick action button が動作 (3 field を 1 click)
4. **Platform Output revision**: platformOutput row で `status: 'revised'` + reviewNotes 編集 → Sanity 更新
5. **Visual usage**: visualAssetPlan row で `status: 'archived'` + reviewNotes (理由) → Sanity 更新
6. **Undo**: 10秒以内に「元に戻す」 で previousState に復帰 (Phase 2B-2 と同じ pattern)
7. **Conflict**: Studio 並行編集で `_rev` mismatch → reload prompt
8. **`/campaigns/[slug]`**: 編集後に detail page で更新済 state / URL が表示 (read-only)
9. **`/analytics`**: 編集後に reactionNotes pending row が更新 (Phase 2B-1 既存動作)
10. **Token leak audit**: `.next/static/chunks/*.js` に `SANITY_WRITE_TOKEN` value が出ない、 reviewNotes / 本文 が出ない
11. **No regression**: Phase 2B-1 reactionNotes / Phase 2B-2 humanReviewGate / Phase 2B-3 visual approve / Phase 2B-3.1 Sanity reflect 動作不変
12. **Sanity schema 不変**: `schemas/` に diff なし

---

## 12. Open questions

| # | 質問 | 影響範囲 | 推奨案 |
|---|---|---|---|
| **Q-2B4-1** | MVP (no schema change) で進めるか、 schema 追加を本 batch に含めるか? | scope | **MVP first** (本 spec の前提): schema 不変原則を Phase 2B 全 sub-batch で貫徹してきた。 MVP で workflow の 80% を実証してから、 boss が「actual text 等を Sanity に保存したい」 と判断したら Phase 2B-4.1 で schema 追加 |
| **Q-2B4-2** | Primary edit surface は `/publish` か `/publish-package/[slug]` か? | UI | **`/publish`** (本 spec の前提): manualPublishingStatus + platformOutput + visualAssetPlan を 1 page でまとめて編集できる。 `/publish-package/[slug]` は copy / package detail UI として read-only 維持 |
| **Q-2B4-3** | 「actual published text」 はどこに保存するか? | data model | **MVP では Sanity に保存しない** (推奨): publish-packages/*.md が draft、 実 text はプラットフォーム自身が持つ、 dashboard は「revised marking + 理由」 だけ。 boss が「実 text も Sanity」 希望なら Phase 2B-4.1 で `publishedOutput.actualPublishedText` 追加 |
| **Q-2B4-4** | 「visual not used」 をどう表現するか? | data model | **`visualAssetPlan.status: 'archived'` + `reviewNotes` で理由** (MVP): 既存 enum + 既存 text field で扱える。 Phase 2B-4.1 で `visualUsage` enum 追加検討 |
| **Q-2B4-5** | publish 時に `publishedOutput` doc を新規作成するか? | doc creation | **MVP では作成しない** (推奨): Q-2B3.1-7 で確立した「dashboard が doc create しない」 原則。 boss が「publishedOutput を使いたい」 と判断したら schema field 追加 + 作成 server action を別 batch で |
| **Q-2B4-6** | rewrite / regeneration に AI を含めるか? | scope | **MVP は manual rewrite only** (推奨): AI 経由は Phase 2B-4.2 候補。 CLAUDE.md「明示的に依頼されるまで API 連携を追加しない」 と整合 |
| **Q-2B4-7** | `publishedUrl` を `manualPublishingStatus` に置くか、 新 `publishedOutput` に置くか? | data model | **`manualPublishingStatus[_key].publishedUrl`** (MVP、 既存): すでに `reflect-publication-state.mjs` が patch している実績ある field、 dashboard も同 field を編集。 `publishedOutput.publishedUrl` (既存 schema) は Phase 2B-4.1 で実用化候補 |

---

## 13. Files likely affected (implementation batch)

### 13-1. 新規 (6)

| File | 役割 |
|---|---|
| `dashboard/src/lib/actions/updateManualPublishStatus.ts` | `'use server'`、 4 field allow-list (Phase 2B-1 と同 pattern) |
| `dashboard/src/lib/actions/updatePlatformOutputStatus.ts` | `'use server'`、 2 field allow-list (`status` + `reviewNotes`) |
| `dashboard/src/lib/actions/updateVisualAssetStatus.ts` | `'use server'`、 2 field allow-list (`status` + `reviewNotes`、 Phase 2B-3.1 とは別 action) |
| `dashboard/src/components/publish/PublishStatusRow.tsx` | `'use client'`、 row 編集 UI (dropdown + inputs + confirm modal、 quick action button) |
| `dashboard/src/components/publish/RevisionMarkingForm.tsx` | `'use client'`、 platformOutput status + reviewNotes 編集 form |
| `dashboard/src/components/publish/VisualUsageMarkingForm.tsx` | `'use client'`、 visualAssetPlan status + reviewNotes 編集 form |

### 13-2. 更新 (3-4)

| File | 変更内容 |
|---|---|
| `dashboard/src/app/publish/page.tsx` | `<PublishingMediaTable>` 各 row に編集 affordance + `<IncludedAssetsTable>` に visual usage marking 追加、 `<UndoToastHost>` で wrap、 server-side `writeReady` 判定 |
| `dashboard/src/lib/groq/campaign.ts` | `campaignDetailBySlugQuery` / `outputsListQuery` に `_rev` を必要な 3 doc (campaignPlan, platformOutput, visualAssetPlan) で projection 拡張 |
| `dashboard/src/components/publish/*` (既存 `<PublishingMediaTable>` 等) | row レベルで新 component を embed、 selection state を thread |
| `dashboard/README.md` | Phase 2B-4 row 追加、 enablement で必要 env + workflow 説明 |

### 13-3. 触らない (Phase 2B 全体の方針 + 本 batch 固有)

- `schemas/` (Phase 2B-4 MVP は schema 不変、 Phase 2B-4.1 で別 batch)
- `tools/visual-register/`, `tools/sanity/reflect-*.mjs`
- `assets/visuals/`, `assets/inbox/`, `patches/`, `publish-package/`
- `package.json` (root + dashboard、 依存追加なし)
- Phase 2B-1 / 2B-2 / 2B-3 / 2B-3.1 既存 runtime code (`updateReactionNotes.ts` / `updateGateState.ts` / `approveVisualCandidate.ts` / `reflectVisualAssetPatch.ts` / `<UndoToastHost>` / 関連 components — 流用するが touch なし)

合計 **新規 6 + 更新 3-4 = 9-10 ファイル変更**。 Phase 2B-1 / 2B-2 / 2B-3 / 2B-3.1 より少し大きいが、 1 PR 完結可能。

---

## 14. Environment variables

新規 env var **なし**。 Phase 2B 全 sub-batch で確立した 2 つを再利用:

- `ENABLE_WRITE_ACTIONS=true` (Phase 2B 共通 master switch)
- `SANITY_WRITE_TOKEN=<editor-role-token>` (Sanity write、 4 sub-batch + 本 batch で必須)

`ENABLE_LOCAL_FS_ROUTES` は本 batch では不要 (filesystem 読み書きなし、 Sanity field op のみ)。

Vercel 設定契約は不変: 3 env のいずれも production / preview / development scope に **絶対設定しない**。

---

## 15. Test plan

### 15-1. Manual smoke (boss が確認)

1. `.env.local` 設定確認: `ENABLE_WRITE_ACTIONS=true` + `SANITY_WRITE_TOKEN=<editor>`
2. `cd dashboard && npm run dev`
3. **manualPublishingStatus 編集**:
   - `/publish` で Threads row の state を `in-progress` → `done` に変更 (dropdown)
   - publishedUrl を入力 (e.g., `https://www.threads.net/@potablen/post/...`)
   - publishedAt を入力 (`2026-05-21T...`) もしくは「いま」 quick fill
   - 保存 → confirm modal (terminal `done` 遷移なので) → 実行 → emerald toast (10秒 undo)
   - Sanity Studio で `campaignPlan.building-hitori-media-os.manualPublishingStatus[platform=threads]` の 3 field 更新確認
4. **Undo**: 10秒以内に「元に戻す」 click → previousState に復帰 (Phase 2B-2 と同パターン)
5. **platformOutput revision marking**:
   - Threads platformOutput row で「📝 編集状況」 button → status: `revised` + reviewNotes: "weak generation; rewrote on threads.net" 保存
   - Sanity Studio で `platformOutput.<id>.status` 更新確認
6. **Visual usage marking**:
   - Threads visual asset row で「使わなかった」 marking → status: `archived` + reviewNotes: "platform_text_only: ..."
   - Sanity Studio で `visualAssetPlan.<id>.status: 'archived'` 確認
7. **Conflict**: Studio で並行に同 manualPublishingStatus item を変更 → dashboard で再保存 → `conflict` reload prompt
8. **`/campaigns/[slug]` regression**: detail page で publish tab を開き、 更新済 state / URL が read-only で表示
9. **`/analytics` regression**: reactionNotes pending list が threads を捕捉 (24h+ で publishedAt あり / reactionNotes 空)、 Phase 2B-1 既存編集が動作
10. **disabled fallback**: env flag / token を片方 off → 編集 UI 全 disabled、 read-only display 完全維持
11. Phase 2B-1 / 2B-2 / 2B-3 / 2B-3.1 動作不変
12. Token leak: `grep "SANITY_WRITE_TOKEN" .next/static/chunks/*.js` で env var **名** のみ、 値ゼロ

### 15-2. Negative tests

| シナリオ | 期待結果 |
|---|---|
| `manualPublishingStatus[_key]` 不在 (URL 改竄) | `not-found` reject |
| `expectedRevision` 古い | `conflict` reject |
| `platform` enum 外 | `validation` reject |
| `state` enum 外 | `validation` reject |
| `publishedUrl` が非 https | `validation` reject |
| `publishedAt` 不正 ISO | `validation` reject |
| `platformOutput.status` enum 外 | `validation` reject |
| `visualAssetPlan.status` enum 外 | `validation` reject |
| `reviewNotes` 2001 字 | `validation` reject (length cap) |

### 15-3. Token / log audit

- `.next/static/chunks/*.js` で `SANITY_WRITE_TOKEN` value が出ない (env var **名** だけ)
- server stdout で `[updateManualPublishStatus:execute-ok]` 等の metadata log は出るが、 token / reviewNotes 本文 / publishedUrl 本体は出さない (URL は path prefix だけ log してもよいが、 token は絶対出さない)

---

## 16. Post-spec next step

1. **boss が本 spec を read** + Q-2B4-1〜Q-2B4-7 (7 件 open question) に judgement
2. boss OK → **Phase 2B-4 Q 確定 microbatch** (docs-only) で spec を「推奨」 → 「CONFIRMED」 書き換え
3. その後 → **Phase 2B-4 implementation batch**:
   - 新規 6 + 更新 3-4 ファイル = 9-10 ファイル変更
   - §11 acceptance criteria 12 項目すべて green
   - 1 PR 完結
4. boss smoke test → 必要なら smoke fix microbatch
5. その後 → **Phase 2B-4.1 spec batch** (もし boss が schema 追加を選んだ場合): `publishedOutput.actualPublishedText` / `publishedTextSource` / `revisionReason` / `visualUsage` / `visualUsageReason` / `supersededPlatformOutputIds` / `acceptedPlatformOutputId` 等
6. その後 → **Phase 2B-4.2 spec batch** (AI generation): regeneration / rewrite / version compare、 ただし AI integration の必要性 / 設計は別途 boss decision
