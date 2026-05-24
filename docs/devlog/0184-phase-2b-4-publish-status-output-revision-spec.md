# Phase 2B-4 spec — Publish Status + Output Revision Workflow

日付: 2026-05-21

## 背景

Phase 2B 全 4 sub-batch (2B-1 reactionNotes / 2B-2 humanReviewGate / 2B-3 visual approve&register / 2B-3.1 visualAssetPlan Sanity reflect) すべて smoke PASS で完了、 Visual flow が boss-declared「complete for now」 milestone に到達 (handoff/0194)。 boss が次 strategic direction として Phase 2B-4 (Publish Status + Output Revision Workflow) の spec 化を指示。

boss が現実の publish workflow から導出した要件:
- Threads は自前で公開 (manual posting)
- 生成 text が weak → boss が手動 rewrite
- 生成 diagram も weak → visual なしで投稿
- dashboard に「実 publish status + URL + 投稿した text + 生成 text を revise した事実 + visual を使わなかった事実 + 理由 + 将来 dashboard 内で remake」 を記録できるようにしたい

現在 dashboard が write 可能な 4 surface は揃ったが、 **manualPublishingStatus / 生成 text の revision marking / visual 使用判断** は dashboard で write できず、 boss は `tools/sanity/reflect-publication-state.mjs --execute` で CLI 経由のみ。 このギャップを Phase 2B-4 で埋める。

## 決定・変更

### 新規 (1 spec)

- `docs/specs/phase-2b-4-publish-status-output-revision.md` (16 セクション、 planning spec、 docs-only / no implementation / no schema change / no Sanity write)

### MVP no-schema-change 戦略 (本 spec の中心)

Phase 2B 全 sub-batch で確立した「schema 不変原則」 を本 batch でも踏襲。 既存 schema field のみで boss workflow の **80%** をカバー:

| Boss requirement | 既存 field で代用 | 新規 action |
|---|---|---|
| publish status / URL / 日時 / メモ | `manualPublishingStatus[_key].{state, publishedUrl, publishedAt, reactionNotes}` (MVP では reactionNotes を publishNotes 代用) | `updateManualPublishStatus` (4 field allow-list) |
| 生成 text を revise した | `platformOutput.{status: 'revised', reviewNotes}` (既存 enum + 既存 text field) | `updatePlatformOutputStatus` (2 field allow-list) |
| visual を使わなかった | `visualAssetPlan.{status: 'archived', reviewNotes}` (既存 enum + 既存 text field) | `updateVisualAssetStatus` (2 field allow-list、 Phase 2B-3.1 の reflect とは別 action) |
| 実投稿した text | **MVP では Sanity に保存しない** (publish-packages/*.md は draft のまま、 実 text はプラットフォーム自身が保持) | — (Phase 2B-4.1 候補) |

残り 20% (actual text / revision history / visual replacement / output versioning) は Phase 2B-4.1 / 2B-4.2 候補として **propose only, implement later**。

### Primary edit surface

- **`/publish` を primary edit surface** に集約 (Phase 2B-2 で確立した「観察 vs 編集」 surface 分離原則を踏襲)
- 既存 `<PublishingMediaTable>` 各 row + `<IncludedAssetsTable>` に編集 affordance を追加
- `/campaigns/[slug]` / `/outputs` / `/publish-package/[slug]` / `/analytics` は read-only 維持 (`/analytics` の reactionNotes 編集は Phase 2B-1 既存動作のまま)

### 7 open questions (Q-2B4-1 〜 Q-2B4-7)

|  | 質問 | 推奨案 |
|---|---|---|
| Q-2B4-1 | MVP (no schema change) で進めるか | **MVP first**: 全 sub-batch で貫徹した schema 不変原則 |
| Q-2B4-2 | Primary edit surface は `/publish` か `/publish-package/[slug]` か | **`/publish`**: 3 doc type を 1 page で編集 |
| Q-2B4-3 | actual published text の保存先 | **MVP では Sanity に保存しない** (revised marking + 理由のみ) |
| Q-2B4-4 | visual not used をどう表現 | **`visualAssetPlan.status: 'archived'` + reviewNotes** (既存 enum) |
| Q-2B4-5 | publish 時に `publishedOutput` doc を新規作成するか | **MVP では作成しない** (Q-2B3.1-7「dashboard が doc create しない」 原則) |
| Q-2B4-6 | rewrite に AI を含めるか | **MVP は manual rewrite only** (CLAUDE.md「API 連携を追加しない」 と整合) |
| Q-2B4-7 | publishedUrl を `manualPublishingStatus` か `publishedOutput` か | **`manualPublishingStatus[_key].publishedUrl`** (既存 reflect-publication-state.mjs と同 field) |

### Files likely affected (implementation batch、 本 batch では実装しない)

- **新規 (6)**: `updateManualPublishStatus.ts` / `updatePlatformOutputStatus.ts` / `updateVisualAssetStatus.ts` / `<PublishStatusRow>` / `<RevisionMarkingForm>` / `<VisualUsageMarkingForm>`
- **更新 (3-4)**: `app/publish/page.tsx` / `lib/groq/campaign.ts` (3 doc の `_rev` projection 拡張) / 既存 publish components row embed / dashboard README

新規 6 + 更新 3-4 = 9-10 ファイル、 Phase 2B-1 / 2B-2 / 2B-3 / 2B-3.1 より少し大きいが 1 PR 完結可能。

### 新規 docs (3)

- `docs/devlog/0184-phase-2b-4-publish-status-output-revision-spec.md` (本ファイル)
- `docs/handoff/0195-phase-2b-4-publish-status-output-revision-spec.md`
- `docs/handoff/latest.md` (mirror of 0195)

### コード変更 (0)

`dashboard/src/` / `tools/` / `schemas/` / `assets/visuals/` / `assets/inbox/` / `patches/` / `publish-package/` / `package.json` (root + dashboard) いずれも touch なし。

## 理由

### なぜ MVP は no-schema-change か

Phase 2B 全 4 sub-batch で「Sanity schema は不変」 を design 原則として貫徹してきた。 本 batch も:

1. schema 変更は「Sanity Studio で全 doc の re-validate」「migration 必要」「他システム (publish-package / reflect-*.mjs) との整合確認」 等で複雑度が一気に上がる
2. MVP (既存 field のみ) で boss workflow の 80% を実証してから残り 20% を schema 追加で埋める方が、 boss が「実 text 保存は本当に必要か?」 と判断する material が増える
3. boss の「将来 dashboard 内で remake」 要件 (AI generation) は本 batch とは別レイヤー、 MVP 完了後に Phase 2B-4.2 で扱う方が design boundary が明確

「propose only, implement later」 を本 spec で 16 セクションに渡って明文化。

### なぜ `/publish` を primary edit surface に絞るか

Phase 2B-2 で確立した「観察 vs 編集 surface 分離」 原則と整合:
- **編集**: `/publish` のみ (manualPublishingStatus + platformOutput + visualAssetPlan の 3 doc type を 1 page)
- **観察**: `/campaigns/[slug]` (publish tab) / `/outputs` / `/publish-package/[slug]` / `/analytics`
- これにより:
  - 同 server action を 1 entry point から呼ぶ logic 重複ゼロ
  - bug 予測 / spec 変更 / undo lifecycle が 1 page で完結
  - boss が「ここで編集できる」 と即座に認識

`/publish-package/[slug]` は copy / package detail UI として read-only 維持 (boss は publish-package md を copy → 各プラットフォームに投稿 → URL を取得 → dashboard `/publish` に戻って record という flow)。

### なぜ visual usage を「archived」 で代用するか

既存 `visualAssetPlan.status` enum 10 値 (`planned` / `brief-ready` / `prompt-ready` / `generated-needs-save` / `saved` / `reviewed` / `approved` / `packaged` / `published` / `archived`) の中で `archived` が「使わなかった」 を最も自然に表現できる。

- 「使わなかった」 = 「アーカイブ送り」 のニュアンスで semantic 一致
- 新 enum 値 (`not_used` / `replaced` 等) を加えるには schema 変更が必要
- `reviewNotes` で理由 prefix (`low_quality:` / `off_brand:` / `not_needed:` / `platform_text_only:` / `replaced:`) を書けば情報損失なし
- Phase 2B-4.1 で本格的に `visualUsage` enum 追加するなら、 既存 `archived` doc を migration する script 1 本で済む

### なぜ undo を採用するか

| Action | Undo? | 理由 |
|---|---|---|
| `updateManualPublishStatus` | ✅ 10秒 toast | Sanity field op、 Phase 2B-1 / 2B-2 と同性質 |
| `updatePlatformOutputStatus` | ✅ 10秒 toast | Sanity field op |
| `updateVisualAssetStatus` | ✅ 10秒 toast | Sanity field op |

すべて Sanity field op only、 filesystem 乖離 risk なし。 既存 `<UndoToastHost>` (Phase 2B-2 で汎用化) を流用。

Phase 2B-3 / 2B-3.1 で undo を採用しなかった理由 (file pipeline 乖離 risk / patch JSON と Sanity の整合確認難) とは別、 本 batch は **Sanity field op only** なので Phase 2B-1 / 2B-2 と同 pattern が適用可。

### なぜ「実際に投稿した text」 を MVP では保存しないか

- publish-packages/*.md が「投稿前 draft」 として既に存在、 「投稿後 final」 を別途保存すると 2 ソースで真実の所在が分散
- 実 text はプラットフォーム自身 (X / note / Substack / Threads) が canonical store を持つ、 dashboard が duplicate copy を持つ必要性が薄い
- dashboard は「revised された事実 + 理由」 を `platformOutput.status: 'revised'` + `reviewNotes` で記録するだけで boss workflow が回る
- boss が「実 text も Sanity 保存」 と判断した時点で Phase 2B-4.1 で `publishedOutput.actualPublishedText` 追加 (既存 `publishedOutput` schema が現在 dashboard 未使用、 拡張余地あり)

「保存しない判断」 を spec §4-4 + Q-2B4-3 で明示することで、 boss が後から「やっぱり保存したい」 と判断する material を残す。

### なぜ `publishedOutput` doc 新規作成を MVP に含めないか

Q-2B3.1-7 で確立した「**dashboard が doc create しない**」 原則と整合:
- dashboard は field update / array element patch のみ、 doc create は Studio が owner
- boss が `publishedOutput` を「使いたい」 と判断したら、 まず Studio で manual create → dashboard が field 編集の流れ
- これにより doc creation の race / dedup / required field 担保 logic を dashboard 側で複雑化させない

Phase 2B-4.1 で「dashboard から publishedOutput create も許可するか」 を別途 Q 化。

### なぜ AI rewrite を MVP に含めないか

CLAUDE.md の指示「明示的に依頼されるまで API 連携を追加しない」 と整合:
- boss が「手動 rewrite で十分」 か「AI rewrite が必要」 かを MVP 完了後に判断
- AI integration は Anthropic API / OpenAI API のいずれを使うか、 prompt 設計、 generation cost、 review UI 等の論点が多く別 batch 規模
- Phase 2B-4.2 で AI generation 専用 spec を起こす

### なぜ schema 追加を「propose only」 で本 batch では実装しないか

§5 で 7 つの schema addition 候補を **list するに留める**:
- `publishedOutput.actualPublishedText` / `publishedTextSource` / `revisionReason` / `visualUsage` / `visualUsageReason` / `supersededPlatformOutputIds` / `acceptedPlatformOutputId`
- `manualPublishingStatus[].publishNotes` (現在 `reactionNotes` を流用)
- `platformOutput.revisionReason` (現在 `reviewNotes` で代用可)

理由:
1. MVP (no schema change) で boss workflow の 80% が回ることを実証してから残り 20% を埋める
2. schema 変更は 1 batch で 1 件ずつ慎重に: 全候補を 1 batch で実装すると review / migration 負荷が膨らむ
3. boss が MVP を使って「これは本当に必要 / 不要」 と判断する material を集める
4. Phase 2B-4.1 を schema 追加専用 batch として独立、 Phase 2B-4.2 を AI generation 専用 batch として独立、 という layering 戦略

## 影響

- リポジトリ:
  - `docs/specs/phase-2b-4-publish-status-output-revision.md` (新規 16 セクション、 716 行)
  - `docs/devlog/0184-...` + `docs/handoff/0195-...` + `docs/handoff/latest.md`
  - runtime / schemas / tools / publish-package / assets / patches / package.json: touch なし
- ワークフロー:
  - 次は boss が Q-2B4-1〜Q-2B4-7 (7 件 open question) を judgement
  - boss OK → Phase 2B-4 Q 確定 microbatch (docs-only) で spec を「推奨」 → 「CONFIRMED」 書き換え
  - その後 → Phase 2B-4 implementation batch (新規 6 + 更新 3-4 = 9-10 ファイル)
- スキーマ: 不変 (MVP は no schema change、 Phase 2B-4.1 で別 batch)
- プロダクト方針:
  - dashboard write surface 候補が 5 件目に到達 (Phase 2B-1 reactionNotes / 2B-2 humanReviewGate / 2B-3 filesystem / 2B-3.1 visualAssetPlan reflect / **2B-4 publish status + revision marking**)
  - Sanity schema 不変原則を Phase 2B-4 でも貫徹、 「propose only, implement later」 を本 spec で明文化
  - publishing workflow loop を dashboard で完結させる milestone (実投稿は手動のまま、 dashboard は「結果と判断を record」)

## 次の一手

**Option A (推奨) — Phase 2B-4 Q 確定 microbatch (docs-only)**

boss が Q-2B4-1〜Q-2B4-7 (7 件) に回答 → docs-only microbatch で spec を CONFIRMED 化:
- `docs/specs/phase-2b-4-publish-status-output-revision.md` の Q 表を「推奨」 → 「CONFIRMED」 書き換え
- `docs/specs/phase-2b-write-actions.md` §0.5 に Phase 2B-4 行追加 (もし parent §0.5 6 区分構造を 7 区分に拡張するならその decision を含む)
- devlog + handoff 1 ペア

**Option B — Phase 2B-4 implementation batch (Q 確定後)**

Q 確定後に implementation batch:
- 新規 6 + 更新 3-4 = 9-10 ファイル
- §11 acceptance criteria 12 項目すべて green
- 1 PR 完結
- boss smoke test → 必要なら smoke fix microbatch

**Option C — 別 Phase に進む**

boss が Phase 2B-4 より優先度高い path (Phase 2B-2.1 gate reviewer / 2B-3.2 multi-asset / 2B-3.3 Visual Register retirement / 別 Phase audit-log schema 等) を選ぶ場合は本 spec を保留し別 batch へ。

発信ネタ案:
- 「propose only, implement later — Phase 2B-4 で schema 追加を本 batch に含めなかった理由」
- 「dashboard で publish workflow loop を完結させる design — 実投稿は手動のまま、 結果と判断を record する」
- 「既存 enum (`archived`) を流用して新 enum 追加を避けた話 — visual 使用判断の表現」
- 「`/publish` を primary edit surface に絞る — Phase 2B-2 で確立した『観察 vs 編集』 surface 分離の応用」
- 「Phase 2B 全 4 sub-batch + 2B-4 spec で見えた controlled write の境界線 — Sanity field op + filesystem op + HTTP bridge + Sanity reflect の 4 pattern が共存」
