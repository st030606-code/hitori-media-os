# Phase 2B-3 Detail Spec — W1 visual approve & register (CLI bridge)

最終更新: 2026-05-21 (smoke PASS recorded)
ステータス: **implemented + smoke PASS** (implementation 2026-05-21 / boss smoke PASS confirmed 2026-05-21 — handoff/0190)
後続: Phase 2B-3.1 (Sanity reflect、 [docs/specs/phase-2b-3-1-visual-asset-sanity-reflect.md](./phase-2b-3-1-visual-asset-sanity-reflect.md))
オーナー: boss + Claude Code
親 spec: [docs/specs/phase-2b-write-actions.md](./phase-2b-write-actions.md) (Phase 2B 全体)
前 spec: [docs/specs/phase-2b-1-reaction-notes.md](./phase-2b-1-reaction-notes.md) / [docs/specs/phase-2b-2-human-review-gates.md](./phase-2b-2-human-review-gates.md) (W3 / W5、両者 smoke PASS 済)

## 0. Confirmed decisions (inherited)

### Parent batch (handoff/0175, 2026-05-20)

- **Q-1** ✅: `SANITY_WRITE_TOKEN` は `dashboard/.env.local` 専用、Vercel scope に絶対設定しない
- **Q-2** ✅: Production write は永久 disabled、`enableWriteActions` + `SANITY_WRITE_TOKEN` 両方揃った local/dev のみ発火

### Phase 2B-1 / 2B-2 で確立した template

- **Q-6 (undo)** ✅ for 2B-1 / 2B-2 only: in-memory previous value + 10秒 toast。本 spec では **採用しない** (理由は §9)
- **Q-8 (conflict)** ✅: `_rev` mismatch → reload prompt、no last-write-wins、no 3-way merge
- **Q-10 (devlog)** ✅: 自動 devlog 生成なし、server `console.log` のみ (metadata only、本文/token は出さない)

### Phase 2B-3 batch (本 spec、boss confirmed direction)

- **Q-3 (W1 strategy)** ✅ **CONFIRMED 2026-05-21**: **Visual Register CLI bridge を採用** (option A bridge)。dashboard 内に Visual Register を完全 reimplement する path (option B) は **本 Phase では選ばない**。dashboard は orchestrator として動作し、既存 CLI (`tools/visual-register/server.mjs`) を file pipeline の真の owner として維持する。

詳細は §2-3 で展開。

### Phase 2B-3 batch (handoff/0188, 2026-05-21) — 8 Q boss confirmed

Boss confirmed all 8 open questions specific to this spec:

- **Q-2B3-1 (server action 設計)** ✅: **Option D — HTTP bridge to running Visual Register CLI**。dashboard は `localhost:3334/api/inbox/approve-and-register` を fetch で call する。Visual Register を dashboard 内に full reimplement (option B) はしない。subprocess spawn (option B nested) もしない。`server.mjs` の logic を share library に extract する path (option C) も本 Phase では採用しない。
- **Q-2B3-2 (Sanity reflect)** ✅: Sanity `visualAssetPlan.status: "saved"` reflection は **本 batch に含めない**。Phase 2B-3.1 で別 batch、`tools/sanity/reflect-working-pipeline-visual-assets.mjs` pattern を踏襲する controlled write batch として実装する。
- **Q-2B3-3 (patch JSON generation)** ✅: patch JSON 生成は **`tools/visual-register/server.mjs` が引き続き owner**。dashboard 側で重複実装 (file copy / patch JSON 生成 / manifest update のいずれも) はしない。dashboard は HTTP request + response 解釈のみを担当。
- **Q-2B3-4 (publish-package auto-trigger)** ✅: publish-package 配布 (`npm run publish:package`) は **auto-trigger しない**。success result panel に command と clipboard copy button を表示するに留め、boss が手動で run する workflow を維持。
- **Q-2B3-5 (rollback / undo)** ✅: file operations には **自動 undo を実装しない**。Phase 2B-1 / 2B-2 の 10秒 `<UndoToastHost>` pattern は本 batch では **流用しない**。代わりに preview step + confirm modal + (必要なら) overwrite checkbox の二段階確認、それでも誤操作した場合は manual cleanup 手順 (file 削除 + manifest revert) を success panel + README に明示する。
- **Q-2B3-6 (single candidate / multi-asset)** ✅: **1 candidate / 1 transaction** を維持。既 registered な final asset を再 approve する path は server.mjs の `overwriteConfirmed` flag で対応、UI で explicit な overwrite checkbox を tick する step を要求。multi-select batch approve は Phase 2B-3.2 候補として deferred。
- **Q-2B3-7 (Visual Register CLI 自動起動)** ✅: dashboard は Visual Register CLI を **subprocess spawn しない / auto-start しない**。boss が `npm run visual:register` で手動起動する workflow を尊重。dashboard は health check (`/api/health`) で起動状態を検知、起動していなければ `visual-register-not-running` error UI で起動指示を出す。
- **Q-2B3-8 (server.mjs に dry-run API 追加)** ✅: `tools/visual-register/server.mjs` には dry-run / preview endpoint を **新規追加しない**。dashboard 側で path 計算 + 既存ファイル check を local に行い、execute step でのみ `/api/inbox/approve-and-register` を call する。`server.mjs` への commit ゼロ。

### Remaining parent-level open questions

**Q-4 / Q-5 / Q-9** は parent spec §6 で tracking 継続。Phase 2B-3 implementation には不要 (audit-log schema / reflect-script 段階削除 / W7 promptTemplate save はいずれも本 batch scope 外)。

---

## 1. Product goal

dashboard 上で visual candidate を選び「採用する」 ボタンを押すと、既存 Visual Register CLI を経由して:
- 選択された `assets/inbox/generated/<slug>/<asset>/v00N.png` を `assets/visuals/<slug>/<platform>/<placement>/<asset>.png` に copy
- 対応する `patches/visual-assets/<slug>/<asset>.json` を生成 (Sanity への patch 候補ファイル)
- `assets/inbox/generated/<slug>/review-manifest.json` を `registered` 状態に update

までを完結させる。**dashboard は orchestrator**、CLI は file pipeline の owner。

これにより:
- boss は `http://localhost:3334` を別 tab で開いてポチる代わりに、dashboard の `/visual-assets/[assetId]/candidates` 上で完結
- 既存の Visual Register workflow (inbox v00N → 候補 review → approve → 採用 → publish-package distribution) を **保ったまま** entry point だけが dashboard に統合される
- 「Visual Register が source of truth」 という方針 (CLAUDE.md / 既存運用) を維持
- Sanity への `visualAssetPlan.status: "saved"` 反映は本 batch では deferred (§7 Q-2B3-2 で議論)

非目標 (§10 で展開): 画像生成自動化 / prompt 編集 / candidate 再生成 / publish-package 自動再 build / Sanity audit-log schema 拡張 / production 環境での書き込み。

---

## 2. Bridge strategy

### 2-1. Two options compared

| | A. CLI bridge (HTTP に call) | B. Full dashboard reimplement |
|---|---|---|
| 実装範囲 | dashboard server action が `localhost:3334/api/inbox/approve-and-register` を fetch | dashboard が file copy / patch JSON 生成 / manifest update を内部実装 |
| 既存 logic 再利用 | 100% (server.mjs の `handleInboxApproveAndRegister` がそのまま動く) | 0% (重複実装) |
| Visual Register CLI への依存 | あり (`npm run visual:register` が動いていることが前提) | なし |
| Security boundary | HTTP between two localhost servers | 単一 process 内 file ops |
| Spec / batch 規模 | 小 (本 batch + Sanity reflect は別 batch) | 大 (file ops + path 安全 + patch 生成 + manifest 更新 + Sanity reflect を全部内 batch で) |
| 失敗時の rollback | Visual Register が transactional に書く (server.mjs のロジック) | dashboard が file rollback も実装する |
| 「Visual Register が source of truth」 原則 | 保たれる | 解体される |

**Q-3 boss confirmed**: **A 採用**。B は別 Phase まで deferred。

### 2-2. Architecture diagram (concept)

```
┌─────────────────────────────────────────────────────────────────────┐
│  dashboard (Next.js, http://localhost:3000)                         │
│                                                                     │
│  /visual-assets/[assetId]/candidates                                │
│    ├── BigPreviewCard         (read-only, exists)                   │
│    ├── ThumbStrip             (read-only, exists)                   │
│    ├── SelectedCandidateMeta  (read-only, exists)                   │
│    └── ApproveActionCard      ← NEW (writeReady + localFs both on)  │
│         └── 「採用する (Visual Register に登録)」 button             │
│              │                                                      │
│              ▼  (Server Action: approveCandidate)                   │
│  lib/actions/approveVisualCandidate.ts  ← NEW                       │
│              │                                                      │
│              │  fetch POST /api/inbox/approve-and-register          │
│              ▼                                                      │
└─────────────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  tools/visual-register/server.mjs (Visual Register CLI, :3334)      │
│  (already running via `npm run visual:register`, boss-controlled)   │
│                                                                     │
│  POST /api/inbox/approve-and-register                               │
│    1. copy  assets/inbox/generated/<slug>/<asset>/vNNN.png          │
│         → assets/visuals/<slug>/<platform>/<placement>/<asset>.png  │
│    2. write patches/visual-assets/<slug>/<asset>.json               │
│    3. update assets/inbox/generated/<slug>/review-manifest.json     │
│         (status=registered, registeredAt, finalAssetPath, patchPath)│
│                                                                     │
│  Sanity への write はしない (directSanityWrite: false の契約)        │
└─────────────────────────────────────────────────────────────────────┘
              │
              ▼  (deferred to a separate later batch — Phase 2B-3.1 candidate)
       Sanity reflect (existing pattern, reflect-*.mjs)
```

### 2-3. Why bridge first

- **既存 CLI が安定**: `tools/visual-register/server.mjs:handleInboxApproveAndRegister` は実運用で複数の visual asset を register 済 (audit で 16+ 個の patch JSON 確認)。logic を信用できる
- **責任分離**: file pipeline は CLI、Sanity reflect は別 batch、dashboard は orchestrator。それぞれが小さく安全
- **小さい first step**: spec 1 件 + implementation 1 batch で land 可能。boss が動作確認したのち、必要なら Phase 2B-3.1 で Sanity write を追加できる
- **将来 option B を選ぶ余地**: bridge が成立すれば、`server.mjs` を share library に refactor して Next.js runtime 内に取り込む path も可能 (Phase 2B-3.2 候補)

---

## 3. Existing data flow inventory

### 3-1. Filesystem layout

**Inbox (read source)**:
```
assets/inbox/generated/<campaignSlug>/
├── review-manifest.json
└── <assetSlug>/                            ← e.g. "x-hook-main-v1"
    ├── v001.png, v002.png, v003.png ...    ← candidates
    ├── prompt.md                            ← YAML frontmatter + body
    └── review.md                            ← YAML frontmatter (rubric) + body
```

**Final asset (write target)**:
```
assets/visuals/<campaignSlug>/<platform>/<placement>/<assetName>.png
  例: assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png
```

**Patch JSON (write target)**:
```
patches/visual-assets/<campaignSlug>/<assetName>.json
  例: patches/visual-assets/building-hitori-media-os/x-hook-main-v1.json
```

Shape (excerpt):
```json
{
  "_id": "visualAssetPlan.building-hitori-media-os.x-hook-main-v1",
  "set": {
    "localAssetPath": "assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png",
    "status": "saved",
    "updatedAt": "2026-05-21T...",
    "reviewNotes": "<merged>"
  },
  "meta": {
    "generatedBy": "tools/visual-register/inbox",
    "inboxSource": "assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/v003.png",
    "originalFileName": "v003.png",
    "mimeType": "image/png",
    "directSanityWrite": false
  }
}
```

**Manifest update**:
```
assets/inbox/generated/<campaignSlug>/review-manifest.json
  ├── candidates[].reviewStatus → "registered"
  ├── candidates[].registeredAt → ISO
  ├── candidates[].finalAssetPath → <new path>
  └── candidates[].patchPath → <new path>
```

### 3-2. Sanity flow (out of scope for 2B-3)

`visualAssetPlan` doc (`schemas/visualAssetPlan.ts`):
- 41 field schema (audit log: §7 in handoff)
- Status enum: `planned` → `brief-ready` → `prompt-ready` → `generated-needs-save` → `saved` → `reviewed` → `approved` → `packaged` → `published` → `archived`
- Patch JSON は `status: "saved"` を提案、ただし **本 batch では Sanity に write しない**
- Sanity 反映は `tools/sanity/reflect-working-pipeline-visual-assets.mjs` 系の controlled write script で別途 (Q-2B3-2 で議論)

### 3-3. Publish-package distribution (out of scope for 2B-3)

`assets/visuals/<slug>/.../<asset>.png` → `publish-package/<slug>/<output>/...` への distribute は `tools/publish-package-builder/build.mjs` の rerun で行う。**本 batch では trigger しない** (Q-2B3-4 で議論)。

---

## 4. Target pages

### 4-1. Three dashboard pages, three roles

| Page | 役割 | Phase 2B-3 で edit 可? |
|---|---|---|
| `/visual-assets` (list) | 全 visualAssetPlan 一覧 + bucket count + filter | **read-only** (CTA で candidates に誘導) |
| `/visual-assets/[assetId]` (detail) | 単一 plan の full metadata + paths + actions card | **read-only** (CTA で candidates に誘導) |
| `/visual-assets/[assetId]/candidates` (candidate focus) | 候補画像 preview + 選択 + meta | **primary edit surface** (本 spec の target) |

**Recommendation**: edit action は `/visual-assets/[assetId]/candidates` のみに集約 (Phase 2B-2 で `/human-review-gates` を edit surface に絞った原則を踏襲)。`/visual-assets` と `/visual-assets/[assetId]` は read-only + CTA link で維持。これにより:
- bug 予測 / spec 変更コスト / undo 戦略を 1 page に絞れる
- 「観察 surface vs 編集 surface」 の分離を Phase 2B 全体で一貫させる
- list / detail page の現状 `<DeferredActionButton>` は **保持** (将来 Phase 2B-3.x で同 action を別 surface に展開する path を残す)

### 4-2. /visual-assets/[assetId]/candidates の現状 (read-only)

[handoff/0179 audit](../handoff/0179-phase-2b-1-smoke-fix.md) + 本 batch audit:
- 左カラム: `BigPreviewCard` + `ThumbStrip` + prompt context
- 右カラム: `SelectedCandidateMetaCard` + 3 つの `<DeferredActionButton>` placeholder + Visual Register external link
- `enableLocalFsRoutes=false` で empty state (FS 利用不可)、assetId 不正で empty、plan 不在で empty を出し分け

### 4-3. /visual-assets/[assetId]/candidates の after (Phase 2B-3)

新規 component `<ApproveCandidateAction>` (`'use client'`) を右カラムに **3 つの DeferredActionButton と並んで** 配置 (またはまるごと置換):

```
┌───────── 右カラム ──────────┐
│ SelectedCandidateMetaCard   │  ← 既存
│                             │
│ ApproveCandidateAction      │  ← NEW
│   - 採用する (Visual Register│
│     に登録) button           │
│   - dry-run preview state   │
│   - 確認 modal              │
│   - result state            │
│                             │
│ DeferredActionButton x3     │  ← 既存維持 (再生成 / 保留 / etc.)
│ Visual Register link        │  ← 既存維持 (CLI direct 経由の fallback)
└─────────────────────────────┘
```

---

## 5. Write / safety pattern

### 5-1. Safety layers (6 + 1 file-system specific)

Phase 2B-1 + 2B-2 の 4-5 layer safety を継承、本 batch では filesystem を扱うので追加 layer がある:

| # | Layer | 本 batch での意味 |
|---|---|---|
| 1 | `enableWriteActions` env flag | Phase 2B 全 batch 共通の master switch (cheapest reject path) |
| 2 | `enableLocalFsRoutes` env flag | **本 batch 必須**。filesystem ops を含むため、production deploy で永久 disable |
| 3 | `SANITY_WRITE_TOKEN` env (条件付き) | 本 batch では Sanity write が無いので **不要** (Q-2B3-2 で再評価)。Phase 2B-3.1 で Sanity reflect を追加するときに required |
| 4 | Hard input validation | `campaignSlug` / `assetSlug` / `candidateFile` の regex / 形式 / 長さ check |
| 5 | Path allowlist | candidate は `assets/inbox/generated/` 配下に限定、output は `assets/visuals/` および `patches/visual-assets/` 配下に限定 (`/api/asset-thumb` と同じ pattern) |
| 6 | Traversal rejection | `..` セグメント / 絶対 path / `%2E%2E` 等の URL encoded 攻撃すべて reject (`/api/asset-thumb` と同じ pattern) |
| 7 | Dry-run preview | server action は `mode: 'preview' \| 'execute'` を受ける。preview で path 検証 + 衝突 check のみ実行、commit しない |

### 5-2. Path allowlist 詳細

Input (candidate source):
- regex: `^assets/inbox/generated/[a-z0-9-]+/[a-z0-9-]+/v\d{3}\.(png|jpg|jpeg|webp)$`
- absolute path: reject
- `..` segments: reject
- 拡張子 whitelist: `.png` / `.jpg` / `.jpeg` / `.webp`

Output paths (computed by server.mjs, validated by dashboard):
- final asset: `^assets/visuals/[a-z0-9-]+/[a-z0-9-]+/[a-z0-9-]+/[a-z0-9-]+\.(png|jpg|jpeg|webp)$`
- patch JSON: `^patches/visual-assets/[a-z0-9-]+/[a-z0-9-]+\.json$`

dashboard 側で path を生成 **しない** — server.mjs が `expectedAssetPath(plan)` で computed する path のみ受け入れる。dashboard は received path が allowlist に合致することを **二次確認** する。

### 5-3. Network safety

- HTTP fetch target: **`http://localhost:3334` のみ** hardcoded
- env `VISUAL_REGISTER_HOST` / `VISUAL_REGISTER_PORT` の override は **dashboard 側で許可しない** (boss の CLI 設定を尊重するが、攻撃 surface を増やさない)
- request body は JSON のみ、token / cookie / 機密情報を含めない
- response の MIME type / size / shape を validate

### 5-4. Token / log policy

- **`SANITY_WRITE_TOKEN` は本 batch では使わない** (Sanity 書き込みなし) — token leak audit の対象外だが、念のため:
  - server.mjs への request に token を含めない
  - server stdout (`[approveCandidate:stage]`) に token を出さない
- Visual Register server.mjs 側にも認証なし (localhost only、boss-controlled)、本 batch で認証を追加しない
- gate notes / 本文と同様、`reviewNotes` の本文を log しない (preview output の文字数 + サマリーのみ)

### 5-5. Production behavior

- production deploy (Vercel) は `enableWriteActions === false` + `enableLocalFsRoutes === false` が保証されている
- 本 batch の server action は両 flag を AND-gate で check、片方でも false なら abort
- production runtime では `http://localhost:3334` は当然 reachable ではないので、network 経路でも fail-closed

---

## 6. Operation design

### 6-1. 7-step flow (boss UX 視点)

1. **select candidate**: boss が `/visual-assets/[assetId]/candidates` を開く → `<BigPreviewCard>` で v00N.png を選ぶ (`<ThumbStrip>` の click handler が selection state を更新、既存挙動)
2. **confirm intent**: 右カラムの新 `<ApproveCandidateAction>` で「採用する」 ボタンを押す
3. **dry-run preview**: server action `approveVisualCandidate({mode: 'preview', ...})` が server.mjs `/api/inbox/approve-and-register?dryRun=true` を call (or 同等の preview endpoint、現状 server.mjs に dry-run が無ければ Phase 2B-3 implementation で追加するか dashboard 側で path validation のみ)
4. **show confirm modal**: planned final asset path / planned patch path / 既存 final asset がある場合は overwrite 警告
5. **boss が「実行」 click** → server action `approveVisualCandidate({mode: 'execute', ...})` が server.mjs `/api/inbox/approve-and-register` を call
6. **show success state**: final asset path / patch path / manifest 更新を表示、次のステップ案内
7. **next steps hint**:
   - 「Sanity に反映する」 → `tools/sanity/reflect-working-pipeline-visual-assets.mjs --execute` の手動実行を提案 (Phase 2B-3.1 候補)
   - 「publish-package に配布する」 → `npm run publish:package` の手動実行を提案 (Q-2B3-4)
   - 内部的に Visual Register external link は依然有効、何かあれば CLI 直接にもアクセス可

### 6-2. Edge case: 既存 final asset / patch JSON が存在する

server.mjs の `handleInboxApproveAndRegister` には `overwriteConfirmed` フラグがある。本 batch では:
- preview step で 「既存ファイル: <path> / 上書きしますか?」 と表示
- confirm modal で boss が overwrite を承認 → execute step で `overwriteConfirmed: true` を渡す
- boss が承認しない → 動作なし、modal close

### 6-3. Edge case: Visual Register が動いていない

- preview step で `fetch('http://localhost:3334/...')` が `ECONNREFUSED` を返す
- server action は `error: 'visual-register-not-running'` を返す
- UI で「Visual Register を起動してください: `npm run visual:register`」 を表示 + Visual Register external link

### 6-4. Edge case: candidate ファイルが存在しない / 改竄

- preview step で server.mjs が file existence + MIME check
- server.mjs から `404` or 不正なエラーが返れば `error: 'candidate-not-found'` / `error: 'invalid-candidate'`
- UI で再選択を促す

---

## 7. Server action design

### 7-1. Option comparison

| | A. prepare command (boss が手動 run) | B. subprocess spawn | C. shared module extraction | D. HTTP bridge to running CLI (本 spec の actual recommendation) |
|---|---|---|---|---|
| 実装 | server action は command string を返すだけ | Next.js が `child_process.spawn` | `server.mjs` の関数を export → Next.js が import + call | server action が `fetch(localhost:3334/...)` |
| Security | 高 (実行は boss 環境) | 中 (shell escaping / env injection リスク) | 高 (process 内で完結) | 高 (HTTP + JSON、shell なし) |
| 再利用度 | 0% (logic 重複) | 100% | 100% | 100% |
| Visual Register への依存 | 任意 (boss が直接 CLI 使う) | あり (spawn 先が CLI) | なし (logic 内製化) | あり (server :3334 が running) |
| 失敗時の rollback | boss 手動 | server.mjs の transactional logic | server.mjs の transactional logic | server.mjs の transactional logic |
| 本 batch 実装規模 | 小 (server action は薄い、CLI 起動を UI で案内) | 中 (spawn 安全性 review が必要) | 大 (server.mjs refactor) | 小 (server action が薄い + fetch) |

### 7-2. CONFIRMED: **Option D (HTTP bridge)** — Q-2B3-1 ✅ (2026-05-21)

boss confirmed: dashboard が `localhost:3334/api/inbox/approve-and-register` を fetch で call する **option D (HTTP bridge to running Visual Register CLI)** を採用。

採用理由:
- server.mjs は **既に HTTP server** として動作している (`http://localhost:3334`)
- HTTP API (`/api/inbox/approve-and-register`) は実運用で 16+ asset の registration を成功させている
- 既存の dashboard read API (`/api/visual-review/*`) と同じ「localhost CLI に依存する dev tool 統合」 pattern
- option B (subprocess spawn) の shell-escaping リスク回避
- option C (`server.mjs` の share library 化) 必要な refactor 不要
- option A (command preparation のみ、boss が手動 run) より UX が直接的

採用しない選択肢 (Q-2B3-1 confirmed reject):
- ❌ Option A (prepare command only): boss が手動 run する step が増える、orchestrator としての価値が薄い
- ❌ Option B (subprocess spawn): Next.js runtime からの shell escaping / env injection / process lifecycle 管理リスクが高い
- ❌ Option C (shared module extraction): `server.mjs` の refactor を本 Phase で行わない、bridge first 原則 (Q-3 confirmed) と整合

### 7-3. Function signature (proposed)

```ts
'use server'

export interface ApproveVisualCandidateInput {
  assetId: string                  // 例: 'visualAssetPlan.building-hitori-media-os.x-hook-main-v1'
  campaignSlug: string             // 例: 'building-hitori-media-os'
  assetSlug: string                // 例: 'x-hook-main-v1'
  candidateFile: string            // 例: 'v003.png' (= relative to inbox folder)
  reviewNotes?: string             // optional, merged into patch JSON
  overwriteConfirmed?: boolean     // execute mode only; preview always permits "would overwrite" warning
  mode: 'preview' | 'execute'
}

export type ApproveVisualCandidateResult =
  | {
      ok: true
      mode: 'preview'
      assetId: string
      candidateAbsolutePath: string         // for boss reference only (string), file not opened
      plannedFinalAssetPath: string
      plannedPatchPath: string
      finalAssetExists: boolean              // hint for overwrite confirm
      patchExists: boolean
    }
  | {
      ok: true
      mode: 'execute'
      assetId: string
      registeredAtIso: string
      finalAssetPath: string
      patchPath: string
      manifestUpdated: boolean
      nextStepsHint: {
        sanityReflectCommand: string         // 'node tools/sanity/reflect-working-pipeline-visual-assets.mjs --execute'
        publishPackageCommand: string        // 'npm run publish:package'
      }
    }
  | {
      ok: false
      error:
        | 'validation'
        | 'write-disabled'
        | 'localfs-disabled'
        | 'visual-register-not-running'
        | 'candidate-not-found'
        | 'invalid-candidate'
        | 'overwrite-required'
        | 'permission'
        | 'unknown'
      message: string
    }
```

### 7-4. 9-step server action flow

1. `enableWriteActions` check → `write-disabled` if false
2. `enableLocalFsRoutes` check → `localfs-disabled` if false
3. Input validation (regex / length / mode enum / `candidateFile` ファイル名 format)
4. Path allowlist construction (campaignSlug + assetSlug + candidateFile から `expected inbox path` を build)
5. `localhost:3334` への health check (`GET /api/health`) → `visual-register-not-running` on ECONNREFUSED / timeout (短い timeout、~3s)
6. `mode === 'preview'`:
   - server.mjs に `GET /api/visual-asset-plans` 等で final asset / patch path 計算結果を fetch
   - dashboard 側でも path allowlist 再 check
   - `plannedFinalAssetPath` / `plannedPatchPath` / `finalAssetExists` / `patchExists` を返す
7. `mode === 'execute'`:
   - dashboard 側で path allowlist 再 check (defense-in-depth)
   - `POST /api/inbox/approve-and-register` with JSON body (`{campaignSlug, assetSlug, candidateFile, overwriteConfirmed, reviewNotes}`)
   - server.mjs が transactional に file copy + patch write + manifest update
   - response から `finalAssetPath` / `patchPath` / `manifestUpdated` を抽出
8. Error mapping (HTTP status code → error kind)
9. Return result with `nextStepsHint`

### 7-5. Server log (`[approveCandidate:stage]`)

Phase 2B-1/2 と同じ pattern、metadata only:
- stage: `start`, `rejected`, `preview-ok`, `execute-ok`, `error`, `visual-register-down`
- emit: `mode`, `assetId`, `campaignSlug`, `assetSlug`, `candidateFile`, `elapsedMs`, `httpStatus` (from CLI), `finalAssetExists`, `patchExists`, `overwriteConfirmed`
- **never log**: `reviewNotes` 本文 / candidate file bytes / token (本 batch では token そもそも使わない) / Visual Register response の raw body (parsed metadata のみ)

---

## 8. UI design

### 8-1. Render states (4 affordance + 1 fallback)

`<ApproveCandidateAction>` (`'use client'`):

```
writeReady=false  OR  enableLocalFsRoutes=false:
  → [採用 🔒 編集不可]
     (slate disabled pill + tooltip about env vars)

selectedCandidate=null:
  → [採用する] (disabled, tooltip: "候補画像を選択してください")

writeReady=true && localFs=true && selectedCandidate set && no error:
  → [採用する (Visual Register に登録) ▶]   ← primary blue button
     click → preview → confirm modal → execute

saving (preview or execute in flight):
  → [採用する...] (spinner + aria-busy)

after success:
  → [✓ 登録済み] (slate, small) + 結果 panel + next steps hint
```

Status badge は表示専用 (Phase 2B-2 で確立した「badge ≠ trigger」 原則を踏襲)。

### 8-2. Confirm modal layout

```
┌────────────────────────────────────────────────┐
│ 候補画像を採用しますか?                         │
│                                                │
│ Asset:    x-hook-main-v1                       │
│ Campaign: building-hitori-media-os             │
│ 候補:     v003.png                              │
│                                                │
│ 採用後に作成されるファイル:                     │
│   final: assets/visuals/.../x-hook-main-v1.png │
│   patch: patches/visual-assets/.../...json     │
│                                                │
│ ⚠️ 既存ファイルあり (overwrite される):          │
│   - assets/visuals/.../x-hook-main-v1.png      │
│   (確認: □ 既存ファイルを上書きする)             │
│                                                │
│ ※ ファイル操作は元に戻せません。Studio / Sanity│
│   反映は別途実行が必要です。                    │
│                                                │
│             [キャンセル] [実行]                 │
└────────────────────────────────────────────────┘
```

- Terminal-style modal (Phase 2B-2 と同じ overlay pattern、`absolute top-full left-0` or central overlay)
- overwrite warning は preview step で `finalAssetExists === true` のときのみ
- 「実行」 button は overwrite warning がある場合 checkbox tick が前提 (boss が overwrite を意識的に承認する step)

### 8-3. Success / result panel

modal close 後、右カラムに inline result:

```
┌──── 採用結果 ────┐
│ ✓ Visual Register に登録しました。 │
│                                    │
│ 登録時刻:     2026-05-21T...       │
│ Final:        assets/visuals/.../  │
│ Patch:        patches/.../json     │
│ Manifest:     ✓ 更新済み            │
│                                    │
│ 次のステップ:                       │
│   1. Sanity に反映                  │
│      → node tools/sanity/...        │
│         (clipboard copy button)    │
│   2. publish-package に配布         │
│      → npm run publish:package      │
│                                    │
│ ※ 元に戻すには手動でファイルを削除 │
│   する必要があります。              │
└────────────────────────────────────┘
```

### 8-4. Disabled states (env unavailable)

- `writeReady=false`: 既存の Visual Register external link は維持、本 batch の action だけが disabled
- `enableLocalFsRoutes=false`: 既存の "local FS disabled" empty state がそのまま render される (本 batch で別 message は追加しない、boss は production-mode preview を理解している)

### 8-5. Conflict / reload state

- 万一 Visual Register から `409` or 「manifest 更新中」 系のエラー → `error: 'unknown'` + UI に「画面を更新してください」 + 「更新」 button (`router.refresh()`、Phase 2B-1/2 と同じ pattern)

### 8-6. Local-only warning

Topbar pill 「ローカル書き込み有効」 (Phase 2B-1 で実装済) が visible なら writeReady=true、boss は context として認識済。本 batch では追加の local-only warning は **入れない** (UI 重複)。

### 8-7. NO hidden status badge click

Phase 2B-2 smoke fix 1 (handoff/0183) で確立した「badge ≠ trigger」 原則を本 batch でも厳守。`<StatusBadge>` (visualAssetPlan.status の表示) は click 不可。action は青系 button のみ。

---

## 9. Undo / rollback — Q-2B3-5 CONFIRMED (2026-05-21)

### 9-1. NO automatic undo for file operations

Phase 2B-1 / 2B-2 の 10秒 in-memory undo (`<UndoToastHost>`) は **本 batch では採用しない** (Q-2B3-5 confirmed)。理由:

| | reactionNotes / gate state | visual approve & register |
|---|---|---|
| 操作内容 | Sanity の単一 field を `set` | filesystem に file copy + JSON write + manifest update + (将来) Sanity write |
| 元に戻す難易度 | 反対 patch 1 回で完了 | file 削除 + manifest revert + (将来) Sanity revert |
| Atomicity | server action 内で transactional | server.mjs 内で transactional だが、3 file ops を「逆方向」 で undo する logic は重い |
| Race condition | `expectedRevision` で防御 | file system race (boss が別 process で開いてる、git operations、etc.) |
| 一般原則 | reversible op → 自動 undo OK | irreversible-ish op → explicit confirm が安全 |

→ undo は **採用しない**。代わりに **preview + confirm** が rollback の代替手段:
- 失敗 / 誤操作のリスクは preview step + confirm modal で吸収
- 万一 boss が「やっぱり違うやつだった」 と気づいたら、Visual Register が manifest を transactional に書いてくれているので、boss が CLI で別 candidate を選び直して再 approve できる (server.mjs の overwrite path)

### 9-2. Manual rollback procedure (documented in success panel)

success result panel に「※ 元に戻すには手動でファイルを削除する必要があります」 と明示 (§8-3 で示した)。具体的な手動手順は README または devlog で `cleanup` チェックリストとして残す:

```
1. assets/visuals/<slug>/<platform>/<placement>/<asset>.png を削除
2. patches/visual-assets/<slug>/<asset>.json を削除
3. assets/inbox/generated/<slug>/review-manifest.json の該当 candidate を `pending` に revert
   (boss が手動で edit、または `npm run visual:register` 経由で別 candidate を approve すれば overwrite される)
```

Phase 2B-2.1 / 2B-3.1 (Sanity write 追加時) で undo 戦略を再評価。

### 9-3. Conflict / reload で部分書き込みが残った場合

server.mjs は file copy → patch JSON → manifest の順で書く。途中で fail すると一部だけ残る可能性:
- file copy 成功 / patch write 失敗 → `assets/visuals/.../...png` が残る
- file copy + patch write 成功 / manifest 失敗 → 2 ファイル + 古い manifest

server.mjs 側で transactional な write (temp file → rename) が実装されていれば部分書き込みは起きないが、現状 audit ではそこまで確認していない (Q-2B3-5)。boss が cleanup checklist で対応する前提。

---

## 10. Scope exclusions

本 batch では **やらない** (明示):

- ✗ Auto image generation (candidate 自体を作る、Codex exec spawn、API 呼び出し)
- ✗ Candidate regeneration (prompt 編集 + 再生成)
- ✗ Prompt editing (`prompt.md` の write)
- ✗ Publish-package automatic rebuild (`tools/publish-package-builder/build.mjs` の trigger)
- ✗ Social posting / auto-post (X / note / Substack / Threads)
- ✗ Production file writes (Vercel 上で動かさない、`enableLocalFsRoutes` で gate)
- ✗ Audit-log schema (Q-4 で議論中)
- ✗ Multi-user reviewer assignment / approval (solo boss workflow)
- ✗ Visual Register CLI の full reimplementation (Q-3 で option B を deferred 確定)
- ✗ Sanity 直接 write (本 batch では patch JSON 生成までで止める、Sanity 反映は別 batch)
- ✗ 自動 devlog 生成 (Q-10 confirmed)
- ✗ Batch / multi-asset approve (1 candidate / 1 transaction、Phase 2B-3.2 候補)
- ✗ 認証 / RBAC (`localhost:3334` の Visual Register に新規認証層を追加しない)

---

## 11. Acceptance criteria (smoke checklist)

12 項目。Phase 2B-1 / 2B-2 の 10 項目 + filesystem-specific 2 項目:

1. **Build**: `cd dashboard && npm run build` が 23 routes すべて green、TypeScript clean
2. **Default behavior (writeReady=false or localFs=false)**: `/visual-assets/[assetId]/candidates` が **完全 read-only**、既存 `<DeferredActionButton>` + Visual Register external link が動作、新 `<ApproveCandidateAction>` は disabled pill「採用 🔒 編集不可」 表示
3. **Enabled behavior**: `ENABLE_WRITE_ACTIONS=true` + `ENABLE_LOCAL_FS_ROUTES=true` + Visual Register CLI 稼働で:
   - 候補選択 → 「採用する」 button 表示
   - click → preview modal が planned paths + 既存ファイル warning を出す
   - 「実行」 click → server.mjs に POST → result panel で success
4. **Sanity Studio で `assets/visuals/.../<asset>.png` の存在確認**: ファイル copy が動いた証跡
5. **`patches/visual-assets/.../<asset>.json` の shape 確認**: 既存 patch JSON と同じ shape、`set.localAssetPath` / `set.status: "saved"` / `meta.directSanityWrite: false`
6. **`review-manifest.json` の更新確認**: 対象 candidate が `reviewStatus: "registered"` + `registeredAt` + `finalAssetPath` + `patchPath`
7. **Overwrite path**: 既存 final asset がある状態で再度 approve → preview で warning + confirm modal で checkbox 必須 → 実行で正しく上書き
8. **Visual Register down**: `:3334` が落ちている状態で approve → `visual-register-not-running` error + 起動指示 UI
9. **Path traversal reject**: candidateFile に `..` を含めて (DevTools 経由) invoke → server で `validation` reject
10. **Phase 2B-1 reactionNotes**: 並行で動作不変 (regression check)
11. **Phase 2B-2 humanReviewGate state update**: 並行で動作不変 (regression check)
12. **Token leak audit**: `.next/static/chunks/*.js` に `VISUAL_REGISTER` literal が無い (env var name 含めて bundle に含まれない)、`SANITY_WRITE_TOKEN` も依然 client bundle に流れない

---

## 12. Confirmed questions (all resolved 2026-05-21)

すべての Phase 2B-3 specific question は boss confirmed。実装に向けて未解決事項はなし。

| # | Boss-confirmed answer | spec への反映 |
|---|---|---|
| **Q-2B3-1** ✅ | **Option D — HTTP bridge to running Visual Register CLI**。dashboard が `localhost:3334/api/inbox/approve-and-register` を fetch で call、option A / B / C は採用しない | §0 / §2 / §7 |
| **Q-2B3-2** ✅ | Sanity `visualAssetPlan.status: "saved"` reflection は **本 batch に含めない**、Phase 2B-3.1 で別 batch (`tools/sanity/reflect-working-pipeline-visual-assets.mjs` pattern 踏襲) | §0 / §1 / §3-2 / §10 / §16 |
| **Q-2B3-3** ✅ | patch JSON 生成は **`tools/visual-register/server.mjs` が owner**、dashboard 側で重複実装しない (file copy / patch JSON / manifest update のいずれも) | §0 / §2 / §3-1 / §6 / §7 / §13 |
| **Q-2B3-4** ✅ | publish-package 配布 auto-trigger **しない**。success result panel に command と clipboard copy button を表示するに留める | §0 / §6 / §8-3 / §10 / §15 |
| **Q-2B3-5** ✅ | file operations には自動 undo を実装 **しない**。`<UndoToastHost>` 不使用、preview + confirm modal + (必要なら overwrite checkbox) で吸収、manual cleanup 手順を success panel + README に明示 | §0 / §9 / §16 |
| **Q-2B3-6** ✅ | **1 candidate / 1 transaction** 維持。既 registered asset の再 approve は server.mjs の `overwriteConfirmed` flag + UI の explicit checkbox tick で対応。multi-select batch は Phase 2B-3.2 候補 | §0 / §6-2 / §8-2 / §10 |
| **Q-2B3-7** ✅ | dashboard は Visual Register CLI を **subprocess spawn しない / auto-start しない**。boss が `npm run visual:register` で手動起動、起動していない時は `visual-register-not-running` error UI で起動指示 | §0 / §6-3 / §10 |
| **Q-2B3-8** ✅ | `server.mjs` に dry-run / preview API を新規追加 **しない**。dashboard 側で path 計算 + 既存ファイル check を local に行い、execute step でのみ existing `/api/inbox/approve-and-register` を call (`server.mjs` への commit ゼロ) | §0 / §6-1 / §7-4 |

Remaining parent-level open questions (**Q-4 / Q-5 / Q-9**) は parent spec §6 で tracking 継続。Phase 2B-3 implementation には不要 (audit-log schema / reflect-script 段階削除 / W7 promptTemplate save はいずれも本 batch scope 外)。

---

## 13. Files likely affected (implementation batch)

### 13-1. 新規 (3-4 件)

| File | 役割 |
|---|---|
| `dashboard/src/lib/actions/approveVisualCandidate.ts` | `'use server'` action、9 step flow、HTTP bridge to `localhost:3334` |
| `dashboard/src/components/visual-review/ApproveCandidateAction.tsx` | `'use client'` action card (preview button + confirm modal + result panel) |
| `dashboard/src/lib/visualAssets/bridgePaths.ts` | path allowlist + traversal reject + expected path 計算 helper (server.mjs と同じ pattern を dashboard 側で再現) |
| (optional) `dashboard/src/lib/visualAssets/visualRegisterClient.ts` | `localhost:3334` への fetch wrapper (`{healthCheck, approveAndRegister}` 関数 export) |

### 13-2. 更新 (4-5 件)

| File | 変更内容 |
|---|---|
| `dashboard/src/app/visual-assets/[assetId]/candidates/page.tsx` | 右カラムに `<ApproveCandidateAction>` 統合、`<UndoToastHost>` wrap **不要** (undo なし)、server-side `writeReady` + `localFsReady` 評価 |
| `dashboard/src/components/visual-review/*` | 既存 `<BigPreviewCard>` / `<ThumbStrip>` / `<SelectedCandidateMetaCard>` から selection state を `<ApproveCandidateAction>` に渡せるよう型 + prop drilling 微修正 (state lift 不要、既存 selection state を share する) |
| `dashboard/src/lib/featureFlags.ts` | 変更なし (`enableWriteActions` / `enableLocalFsRoutes` 既存) |
| `dashboard/src/components/common/UndoToastHost.tsx` | 変更なし (本 batch では使わない、Phase 2B-1/2 のために残る) |
| `dashboard/README.md` | 「Phase 2B write actions」 section に Phase 2B-3 row を追加、enablement (両 flag 必須 + Visual Register CLI 起動) を documented、6+1 layer safety を documented |

### 13-3. 触らないもの (本 batch + Phase 2B-3 全体で)

- `tools/visual-register/*` (本 batch の前提、boss-controlled、refactor しない)
- `tools/publish-package-builder/*`
- `tools/sanity/reflect-*.mjs` (Phase 2B-3.1 で `reflect-working-pipeline-visual-assets.mjs` を read-only で参照する程度)
- `schemas/visualAssetPlan.ts` (schema 不変)
- `assets/visuals/**` / `assets/inbox/generated/**` (本 batch では git に commit しない、boss が `npm run visual:register` 経由で書く)
- `patches/visual-assets/**` (同上)
- `publish-package/**`
- `package.json` (root + dashboard、依存追加なし)
- `dashboard/src/lib/actions/sanityWriteClient.ts` / `updateReactionNotes.ts` / `updateGateState.ts` (Phase 2B-1 / 2B-2 既存)
- `dashboard/src/components/gates/*` / `dashboard/src/components/analytics/*` (Phase 2B-1 / 2B-2 既存)
- `dashboard/src/app/api/visual-review/*` (本 batch でも touch 不要、既存 read API は維持)

---

## 14. Environment variables

新規 env var **なし**。Phase 2B-1 / 2B-2 / 既存の 3 flag を再利用:

| 変数名 | 設置場所 | 役割 |
|---|---|---|
| `ENABLE_WRITE_ACTIONS` | `dashboard/.env.local` 専用 | Phase 2B 全 batch 共通 master switch |
| `ENABLE_LOCAL_FS_ROUTES` | `dashboard/.env.local` 専用 | filesystem ops + `/api/asset-thumb` + inbox 読みに必要、本 batch では必須 |
| `SANITY_WRITE_TOKEN` | `dashboard/.env.local` 専用 | 本 batch では **使わない** (Sanity 書き込みなし)、Phase 2B-3.1 で必要 |

Visual Register CLI 関連の env (`VISUAL_REGISTER_HOST` / `VISUAL_REGISTER_PORT`) は **dashboard 側で読まない**。boss の CLI 設定を尊重し、dashboard は `localhost:3334` を hardcoded で参照。boss が CLI を別 port で動かしている場合は dashboard が動かないが、これは boss-controlled な dev workflow なので問題なし。

Vercel scope 全 (production / preview / development) に上記 env を **絶対に設定しない**。

---

## 15. Post-spec next step

1. ~~**boss が本 spec を read** + Q-2B3-1〜Q-2B3-8 に judgement~~ → **Done 2026-05-21** (handoff/0188)
2. **次 → Phase 2B-3 implementation batch を起動**
   - 新規 **3-4 ファイル** + 更新 **4-5 ファイル** = 7-9 ファイル変更
   - HTTP bridge to `localhost:3334/api/inbox/approve-and-register` (option D 確定)
   - §11 acceptance criteria 12 項目すべて green が completion 条件
   - 1 PR で完結 (Phase 2B-1 / 2B-2 implementation と同等規模)
3. boss smoke test → 必要なら smoke fix microbatch (Phase 2B-1 / 2B-2 で 2-3 round 必要だった経緯を踏まえる)
4. その後 → **Phase 2B-3.1 spec batch** (Sanity `visualAssetPlan.status: "saved"` reflection、Q-2B3-2 で deferred)
5. その後 → **Phase 2B-3.2 spec batch** (publish-package distribution / batch approve / multi-asset などの advanced 機能、Q-2B3-4 + Q-2B3-6 で deferred)

---

## 16. Phase 2B-3 と Phase 2B-1 / 2B-2 の対比

将来の reader 向けに 1 表で:

| | Phase 2B-1 (W3) | Phase 2B-2 (W5) | Phase 2B-3 (W1、本 spec) |
|---|---|---|---|
| Surface | `/analytics` | `/human-review-gates` | `/visual-assets/[assetId]/candidates` |
| Write 対象 | `campaignPlan.manualPublishingStatus[].reactionNotes` (Sanity field) | `campaignPlan.humanReviewGates[].state` (Sanity field) | `assets/visuals/...`, `patches/visual-assets/...`, `review-manifest.json` (filesystem) |
| Sanity write | あり (server action) | あり (server action) | **なし** (本 batch、Phase 2B-3.1 で別 batch) |
| Filesystem write | なし | なし | **あり** (Visual Register CLI 経由) |
| Safety layers | 4 | 5 (+ transition allow-list) | **6 + 1** (+ localFs flag + path allowlist + traversal reject + dry-run preview) |
| Undo | 10秒 in-memory toast | 10秒 in-memory toast | **なし** (preview + confirm が代替) |
| Confirm modal | 不要 | terminal transitions のみ | **必須** (file ops は元に戻せない) |
| Server action 経路 | direct Sanity client | direct Sanity client | **HTTP bridge to localhost:3334** |
| Edit surface | 1 (但し 2B-1 で 2 card 統合) | 1 (boss decision で 1 page に絞った) | 1 (本 spec で同原則を維持) |
| Production behavior | permanently disabled | permanently disabled | permanently disabled (+ localFs not reachable) |
| Token requirement | SANITY_WRITE_TOKEN | SANITY_WRITE_TOKEN | **なし** (本 batch では Visual Register は localhost、Sanity write は別 batch) |
| Implementation file count | 3 + 6 | 3 + 7 + 1 | 3-4 + 4-5 (見積もり) |
| Smoke fix rounds (実績) | 2 (handoff/0179 で undo + topbar) | 2 (handoff/0183 affordance + 0184 missing-data) | TBD |
