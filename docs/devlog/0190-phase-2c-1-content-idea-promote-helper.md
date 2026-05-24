# Phase 2C-1 implementation — Structured Content Idea promote helper

日付: 2026-05-21

## 背景

Phase 2C-0 (Raw Idea + Idea Development Package) + Phase 2C-0.1 (AI-developed result import) は boss smoke PASS (handoff/0200)。 dashboard で「rough idea → AI 企画化 prompt → AI 手動実行 → result.md / result.json 保存」 まで動作確認済。

ただし次の step「**ここから Sanity contentIdea を作る**」 摩擦は依然大きい:
- boss が Studio で contentIdea を new、 terminal で result.json を `cat` し、 field 別に手動 copy & paste
- AI 結果の field 名 (例: `proposedTitle` / `targetReader` / `recommendedCampaignFraming`) と Sanity schema 名 (`title` / `audience` / 該当 field なし) が完全に一致しない
- schema 必須項目 (`summary` / `tone.voice` 等) のうち AI が埋めないものを boss が見落とす risk

本 batch (Phase 2C-1) は **Structured Content Idea promote helper** を `/ideas` に追加し、 boss が `result.json` を base に Sanity Studio で contentIdea を作る摩擦を削減する slice。

依然として:
- dashboard は **Sanity write しない** (Q-2C-8 維持)
- dashboard は **doc create しない** (Q-2B3.1-7 維持)
- Studio deeplink + field-by-field clipboard で boss を補助するだけ

## 決定・変更

### 新規 (5 ファイル)

- `dashboard/src/lib/ideaJobs/reader.ts` — server-only filesystem reader (~230 行)
  - `listIdeaJobs()` で `idea-jobs/<slug>/<ts>/` を全 walk、 mtime 降順 sort、 20 件 cap、 truncated flag
  - 各 job で `_raw.json` / `prompt.md` / `job.json` / `result.md` / `result.json` の存在を report、 3 段階 status (`package-only` / `result-markdown-only` / `structured-result-ready`) で分類
  - `readResultJson(slug, ts)` + `readRawIdeaJson(slug)` で Phase 2C-0 安全層 (`resolveIdeaJobAbsolutePath`) を再利用、 200 KB cap + path allowlist + 拡張子 `.md`/`.json` only
  - **idea-jobs/ が存在しない場合は ENOENT を ok=true + jobs=[] で返す** (`enableLocalFsRoutes=false` でも UI 描画可)
- `dashboard/src/lib/ideaJobs/contentIdeaMapper.ts` — pure function mapper (~340 行)
  - `mapResultToContentIdea({result, rawIdea, ...paths, preparedAtIso})` を export
  - **Studio-friendly draft**: schema の `title` / `summary` / `coreThesis` / `audience` / `audiencePain` / `claims` / `objections` / `examples` / `platformAngles` / `tone` / `rawInput` / `personalContext` 12 field を埋める
  - **Extended draft**: schema に直対応しない `visualPotential` / `recommendedCampaignFraming` / `risks` / `weakPoints` / `nextQuestions` を別 bucket で保持 → `personalContext` に集約
  - **Provenance**: source / ideaSlug / timestamp / 3 paths / createdFromRawIdea / preparedAtIso (copyable JSON にのみ含む、 schema には載らない)
  - **Field-level clipboard**: 11 field の clipboard text を pre-render (`fieldClipboards`)
  - **Warnings**: top-level (extended → personalContext 集約の説明) + field-level (`summary` 自動切り詰め、 `tone` AI 未提供、 `audience` 不在 等)
  - **Tolerant reads**: AI agent 個体差を吸収 — `targetReader` 配列 / 文字列両対応、 `claims` を `[{claim,...}]` または `["foo"]` の両形式から normalise、 `objections` / `examples` / `platformAngles` も同様
- `dashboard/src/lib/actions/prepareContentIdeaFromResult.ts` — server action (~155 行)
  - `'use server'`、 mode: 'preview' 固定 (write 系は Phase 2C-1B 以降の検討対象)
  - safety layer ordering: input shape → slug validate → timestamp validate → enableLocalFsRoutes check → result.json read → _raw.json read (optional) → mapper → Studio deeplink build → metrics + return
  - **`enableWriteActions` は要求しない** (read-only helper のため、 Phase 2B-3 pattern の filesystem-only 系統と整合)
  - metadata-only server log (`[prepareContentIdeaFromResult:preview-ok|rejected]`)
- `dashboard/src/components/ideas/IdeaJobList.tsx` — `'use client'` (~165 行)
  - `enableLocalFsRoutes=false` 時: 「ENABLE_LOCAL_FS_ROUTES が必要」 のスラート panel
  - server reader error 時: rose tone エラー panel
  - 各 row: slug / timestamp / 3 段階 status badge / 5 artifact chip (emerald=present / slate=missing) / 「Content Idea化を準備」 button (result.json 存在時のみ active)
  - selected job ↔ 「閉じる」 toggle、 1 row だけ promote panel を表示する linear flow
- `dashboard/src/components/ideas/ContentIdeaPromotePanel.tsx` — `'use client'` (~300 行)
  - mount + useEffect で server action を call (preview only)
  - 操作の流れカード (Studio で開く → field copy → tone 等 schema 必須は手入力 → または copyableJson 全体貼り)
  - Studio deeplink + 「Content Idea 用 JSON をコピー (全体)」 button
  - top-level warnings (amber tone、 例: visualPotential を personalContext に集約した説明)
  - **field-by-field clipboard 11 行** (title / summary / coreThesis / audience / audiencePain / claims / objections / examples / platformAngles / tone (copy 不可、 手入力指示) / rawInput / personalContext)
    - FieldRow (short value preview)
    - FieldListRow (claims / objections / examples / platformAngles で配列、 上位 5 件 preview + 件数表示 + JSON copy)
  - 「なぜ自動作成しないか」 説明カード (Q-2C-8 維持の理由、 Phase 2C-1B 候補の文言)
  - Source ファイル 6 行 details (paths / bytes、 折りたたみ)

### 更新 (1 ファイル)

- `dashboard/src/app/ideas/page.tsx` — async server component に変更、 `listIdeaJobs()` を call、 `<IdeaJobList>` を `<RawIdeaBuilder>` の下に embed

### 触らない

- `schemas/` / Sanity write client / Phase 2B 既存 server action / `tools/` / `assets/` / `patches/` / `publish-package/` / `package.json` (root + dashboard) すべて不変
- 外部 LLM API client (OpenAI / Anthropic / 他) 追加なし
- shell execution (`child_process` / `spawn` / `exec*`) 一切なし
- **filesystem write も本 batch では 0 件** (Phase 2C-1 は read + Studio deeplink + clipboard 専用)

### 既存 24 routes 不変

`/ideas` は in-place 拡張、 新規 route 増設なし。

## 理由

### なぜ `enableWriteActions` を要求せず `enableLocalFsRoutes` のみ要求するか

本 batch の server action は **filesystem read のみ + Sanity write 0 件**:
- `enableWriteActions` は「Sanity / filesystem write の master switch」 として Phase 2B-1 で定義
- read-only operation を `enableWriteActions` で gate すると、 boss が「dev で write 全 disable にして dashboard を見たい」 ときに promote helper まで disabled になる

そこで:
- **`enableWriteActions` は不要** (write しないため)
- **`enableLocalFsRoutes` は必須** (Phase 2B-3 で確立した「local fs を触る surface の専用 switch」 を踏襲、 prod では永久 off)

これにより:
- prod では promote helper が disabled (filesystem 読まない、 idea-jobs は dev 専用)
- dev で write 全 off にしても promote helper は動く
- read / write の safety boundary が env flag level で明確

### なぜ Studio deeplink + clipboard で「dashboard が doc create しない」 を維持するか

Phase 2B-3.1 で確立した Q-2B3.1-7「dashboard が doc create しない」 原則を Phase 2C-1 でも踏襲:

1. **schema validation**: Sanity Studio は contentIdea の `title required` / `audience min 1` / `tone.voice required` 等の validation を UI でリアルタイム表示、 dashboard が doc create すると validation error を再実装する必要が出る
2. **brandProfile / 他 ref 選択**: contentIdea には `personalContext` 等の subjective field がある、 boss が Studio で初稿を見ながら磨く方が品質が上がる
3. **alias / format drift の最終確認**: AI が `targetReader` を `["data scientist", "engineer"]` で返した場合、 boss が「engineer」 を「software engineer」 に書き直す可能性が高い、 Studio で paste + edit する方が自然
4. **`tone` の手入力**: AI が tone を返さない (prompt builder で要求していない)、 boss が brandProfile / 既存 contentIdea から tone を補う必要、 Studio で他 doc を referenceしながら入力する方が早い

Phase 2C-1B (もし boss が「自動作成したい」 と判断したら) で:
- 「`tone` を brandProfile の値で自動補完 → schema validation 通過 → draft 作成」 server action を別 batch で検討可

### なぜ field-by-field clipboard + 全体 JSON copy の **両方** を提供するか

boss workflow の二面性:
- **field 単位 copy**: Studio で 1 field ずつ paste → boss が見ながら微調整、 normal flow
- **全体 JSON copy**: Studio の「Edit as JSON」 view に貼り付け、 大量の field を一括投入、 power user flow

両方を提供することで boss が状況に応じて選べる。 全体 JSON には `studioDraft` + `extended` + `provenance` を含む `copyableJsonText` を入れているため:
- `studioDraft` は schema-compatible (Studio Edit JSON で paste 可能)
- `extended` は schema にない field、 paste すると Studio が無視 (validation error にならない)
- `provenance` は dashboard 由来の metadata、 boss が必要なら `rawInput` / `personalContext` に手動で混ぜる

### なぜ `personalContext` に extended fields を集約するか

contentIdea schema には `visualPotential` / `recommendedCampaignFraming` / `risks` / `weakPoints` / `nextQuestions` に **直対応する field がない**。 選択肢:

| 戦略 | trade-off |
|---|---|
| 捨てる | boss が AI 結果の価値ある hint を失う |
| 各 field を schema に追加 | Phase 2C-1 の scope を超える (schema 不変原則違反) |
| `rawInput` に集約 | rawInput は「未整理メモ」 という意味、 構造化結果を混ぜると semantic drift |
| **`personalContext` に集約** | personalContext は「個人的背景」、 構造化済の補足を入れる場所として natural fit |
| `objections` / `examples` 等に分解 | 機械的 mapping が難しい、 boss が誤解する risk |

`personalContext` 集約 + 説明 warning「visualPotential は contentIdea schema に直接対応する field がないため、 personalContext に集約しました」 で boss に明示。 boss が後で Studio で別 field に移したい場合は手動で。

Phase 2C-2 (campaign creation) で `recommendedCampaignFraming` を `campaignPlan.campaignType` に拾い直す path を残す。

### なぜ `summary` を `coreThesis` から自動切り詰めて生成するか

schema 必須項目 `summary` (text rows:3、 required) が AI 結果に含まれていない:
- AI prompt は `coreThesis` (中心主張) を求めるが `summary` (要約) は明示要求していない
- boss が毎回 Studio で `summary` を手入力するのは摩擦が大きい
- `coreThesis` は通常 1-2 文、 概ね `summary` として使える

そこで mapper:
- `coreThesis` を読む
- 240 文字超なら 237 文字 + `…` で切り詰め
- field warning「coreThesis から自動切り詰めました (240 字)。 Studio で短く整え直すことを推奨」

これにより boss が `summary` フィールドを「空」 で Studio に投入 → validation error → 戻って手入力、 という往復を省ける。 自動生成された summary が weak だった場合は boss が edit。

### なぜ FieldRow / FieldListRow を分けるか

UI 観点:
- 文字列 field (title / coreThesis / audiencePain / audience / rawInput / personalContext): 短い preview + copy button
- 配列 of object field (claims / objections / examples / platformAngles): 上位 5 件 preview + 件数 + JSON copy

配列 field を文字列 row として扱うと JSON 構造が UI に出てしまい boss が「これは何 field?」 を読み取りにくい。 FieldListRow で「件数 + 上位 5 件の `• item title`」 を bullet 表示することで、 boss が AI 結果の thickness を一目で判定できる。

### なぜ Studio deeplink を `${studioBaseUrl}/structure/contentIdea;new` の shape にするか

Sanity Studio の URL pattern:
- `/structure/<docType>;<documentId>` 形式
- `;new` は特殊 ID = new draft の意味
- `NEXT_PUBLIC_STUDIO_BASE_URL` env で base URL を override 可、 default `http://localhost:3333`

別の path (`/desk/contentIdea` / `/intent/create?type=contentIdea`) も存在するが、 `;new` が最も短く、 dashboard でも既存 `/knowledge` page の Studio link と整合。

### なぜ `enableLocalFsRoutes=false` で全 disabled (read-only panel 表示) にするか

Production deploy では `enableLocalFsRoutes=false` 永久維持。 dashboard が `idea-jobs/` を読むこと自体が dev 専用 surface。 boss が prod で `/ideas` を開いた場合:
- RawIdeaBuilder: env 説明文 + button disabled (既存 Phase 2C-0 動作)
- **IdeaJobList: スラート panel で「ENABLE_LOCAL_FS_ROUTES が必要」 を説明** (本 batch で追加)

これにより:
- prod で promote helper が誤動作する risk が 0
- boss が dev に戻る判断材料が UI に明示

### なぜ「idea-jobs/ が存在しない」 を error ではなく empty 扱いにするか

`fresh clone` や「idea-jobs を rm したばかり」 のケースで dashboard を起動した時、 listIdeaJobs が ENOENT で throw すると `/ideas` page 全体が server error になる。 boss が「まず最初の package を作る」 のに `/ideas` を開けないのは UX 後退。

そこで:
- ENOENT (`code === 'ENOENT'`) を `{ok: true, jobs: [], truncated: false}` で返す
- IdeaJobList は「既存のジョブが見つかりませんでした」 を dashed border + 静かな tone で表示
- boss が RawIdeaBuilder で最初の package を作るとそのまま `/ideas` に表示される

これは Phase 2B-3 inboxReader でも採用済の「filesystem 未整備でも UI が落ちない」 pattern。

### なぜ `validateIdeaSlug` を再利用するか

Phase 2C-0 の path 安全層 (`@/lib/ideaJobs/paths`) を Phase 2C-1 でも reuse:
- listIdeaJobs で walk 中の slug を `validateIdeaSlug` でチェック → 不正な名前のディレクトリは skip
- readResultJson / readRawIdeaJson でも同じ validation
- これにより「path 安全層」 が 1 ファイル (paths.ts) に集中、 Phase 2C-2 (generation-jobs) でも同 helper を将来別 prefix 用に拡張するか個別 module を作るか選べる

「path safety 重複定義しない」 design discipline を Phase 2B-3.1 / 2C-0 から踏襲。

### なぜ logging を metadata only にするか (Phase 2B-1 contract 踏襲)

server action log で **絶対出さない**:
- result.json の本文
- studioDraft の各 field (claims / objections / examples / personalContext / 等)
- copyableJsonText (全体 JSON)
- _raw.json の roughMemo 本文
- token (本 batch は Sanity token を要求しないが防御的に維持)

**出してよい**:
- ideaSlug / timestamp (path 識別)
- byte size (resultJsonBytes / copyableJsonBytes)
- count (fieldClipboardCount / warningCount / fieldWarningCount / rawIdeaAvailable)
- elapsedMs
- reject reason (slug error code / fs error code)

これにより:
- 万が一 server log が漏れても本文 / AI 結果 / boss の思考は出ない
- debug 用 metrics は依然 visible

## 影響

- リポジトリ:
  - 5 new dashboard files (~1200 行 total)
  - 1 updated dashboard file (`app/ideas/page.tsx` を async + listIdeaJobs 呼び出し + IdeaJobList embed)
  - docs/devlog/0190 + docs/handoff/0201 + docs/handoff/latest.md
  - schemas / tools / assets / patches / publish-package / package.json: touch なし
- ワークフロー:
  - boss が `/ideas` で「過去の idea-jobs を一覧」「Content Idea化を準備」 を 1 click で起こせる
  - Studio で contentIdea を new する際の field-by-field copy / 全体 JSON copy / 必要 field warning が boss に provide される
  - 24 routes 不変、 build green、 TypeScript clean
- スキーマ: 不変
- プロダクト方針:
  - **「dashboard が doc create しない」 原則 + 「Studio deeplink + clipboard で boss を補助」 pattern が Phase 2C-1 で確立**、 将来 Phase 2C-2 (campaign creation) / Phase 2C-3 (output import) でも同 pattern を踏襲可
  - dashboard write surface は Phase 2B-1〜2B-3.1 + Phase 2C-0 + 2C-0.1 で **6 件**、 Phase 2C-1 は **read-only helper** のため write surface は増えず、 「観察 vs 編集 surface 分離」 原則が深まる
  - AI 結果と Sanity schema 間の **alias / shape normalisation layer** が contentIdeaMapper として localised、 将来 Phase 2C-X (schema 追加) で extended fields を schema field に昇格する際の clean refactoring point になる
  - 「idea-jobs/ が ENOENT でも empty listing で fall through」 を確認 → dev / fresh clone fallback が gracefully 動作

## 次の一手

**Option A (推奨) — boss smoke test**

boss が手元で:
1. `cd dashboard && npm run dev` (`.env.local` で `ENABLE_LOCAL_FS_ROUTES=true` 確認、 write は本 batch 不要だが Phase 2C-0 / 2C-0.1 の動作確認で必要)
2. `/ideas` にアクセス → 「既存の idea-jobs」 セクションに `obsidian-ai-sanity-3 / 20260521-124748` (smoke 時 boss が作成済) が表示されることを確認
3. 5 artifact chip すべて emerald (`_raw.json` / `prompt.md` / `job.json` / `result.md` / `result.json` 全部 present) を確認
4. 「Content Idea化を準備」 button click → `<ContentIdeaPromotePanel>` 展開
5. Studio deeplink 表示確認 → click で `http://localhost:3333/structure/contentIdea;new` が new tab で開く
6. 「Content Idea 用 JSON をコピー (全体)」 → clipboard に `{studioDraft, extended, provenance}` の JSON
7. field-by-field copy button (11 個) を各 1 回 click、 clipboard に対応する field の text が入ることを確認
8. `tone` field は (copy 不可) 表記で button が出ない、 warning に「Studio で手入力」 が表示されることを確認
9. warnings panel (amber) で `visualPotential を personalContext に集約` 等の説明が表示されることを確認
10. Studio 側で contentIdea を new、 各 field に dashboard から copy & paste → schema validation を通過するか確認
11. env flag `ENABLE_LOCAL_FS_ROUTES=false` で再起動 → 「ENABLE_LOCAL_FS_ROUTES が必要」 説明 panel が表示、 「Content Idea化を準備」 button が描画されないことを確認
12. Phase 2B-1〜2B-3.1 / 2C-0 / 2C-0.1 既存動作 regression なし
13. DevTools network tab で外部 LLM API 通信 0 件 / `cat` 等の shell command 実行 0 件 (dashboard 側)
14. Sanity Studio で `contentIdea` doc が 0 件追加 (dashboard が doc create していない確認)

問題なければ **smoke PASS** を docs に記録、 Phase 2C-2 (Generation Prompt Package) に進む。 問題があれば smoke fix microbatch。

**Option B — boss が `obsidian-ai-sanity-3` を実 Studio に投入 (発信タスク前段)**

Phase 2C-0 smoke で boss が作った試運転 idea「ObsidianとAIだけの組み合わせではなく、 なぜ Sanity も含めた 3 つの組み合わせが最強なのか」 を Phase 2C-1 helper で実際に Studio promote → contentIdea として Sanity に登録。 その後発信 (note / Substack / Threads) の draft 作成 path に進む。

**Option C — Phase 2C-2 (Generation Prompt Package) に進む**

Phase 2C-1 smoke を boss が実施しない選択もあり (Phase 2C-1 が read-only helper のため smoke 重要度が低い)。 Phase 2C-2 で `/configurator` 拡張に進む path。

発信ネタ案:
- 「dashboard が doc create しない原則を Phase 2C-1 で踏襲した design judgement — Studio deeplink + field-by-field clipboard pattern」
- 「AI 結果 schema と Sanity schema の間に mapper layer を localise する設計 — Phase 2C contentIdeaMapper」
- 「`enableLocalFsRoutes` のみで gate する read-only helper — `enableWriteActions` を要求しない安全境界」
- 「`personalContext` を AI 結果 extended fields の集約先にする small judgement — schema 不変を維持しつつ情報を捨てない」
- 「`summary` を `coreThesis` から自動切り詰め生成する pragmatism — boss の Studio 摩擦削減と warning による品質維持の両立」
- 「idea-jobs ENOENT を empty listing で fall through させる Phase 2B-3 pattern を Phase 2C-1 で再利用」
