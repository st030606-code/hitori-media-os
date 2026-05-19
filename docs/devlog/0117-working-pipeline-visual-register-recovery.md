# Devlog 0117 — Working Pipeline Step D Recovery via Replicated Visual Register Logic

Date: 2026-05-18
Status: **recovery-executed / 2-of-2 ops succeeded / byte-identical to expected / backup created / 0 Sanity write / 0 deploy / 0 publish actual / Step D complete**

## 今日の判断

[docs/handoff/0127](handoff/0127-working-pipeline-visual-register-approval.md) で検出した Visual Register UI mis-mapping を、**boss の手動 UI 操作なしで自動 recover** した。代わりに、Visual Register `server.mjs` の `handleInboxApproveAndRegister` ロジックを **byte-structurally-identical で replicate した one-off 復旧スクリプト** を `tools/visual-register/recover-working-pipeline-step-d.mjs` に作り、`--dry-run` で内容を確認後 `--execute` で実行。両 operation が予期通り成功。

最重要設計判断:

- **server.mjs を変更しない**: server.mjs は exports を持たない script なので、helper を直接 import する選択肢がない。**replicate vs refactor** で **replicate（mirror）** を選んだ理由は: (a) server.mjs を回復 PR の一部として touch すると "復旧スクリプトが server を変えた" 副作用が混入する、(b) refactor は本来別 batch でやるべき変更、(c) helpers の挙動は完成 安定しており replicate コストは ~120 行で済む。
- **`--dry-run` を default、`--execute` を opt-in**: 破壊的 operation を 1 命令で実行可能にしない。dry-run の出力を docs として残し、boss が "exactly correct" と判断してから execute。
- **byte-identical patch / manifest format**: server.mjs の `handleInboxApproveAndRegister` (lines 550-648) を逐語的に mirror。patch JSON の field order (`_id` → `set` → `meta`)、`JSON.stringify(patch, null, 2) + '\n'` の終端 newline、`reviewNotesValue` の 3-part concat (`'Approved via Visual Register...' + body.reviewNotes + plan.reviewNotes` joined by space)、manifest entry の field order まで一致。**boss が後で Visual Register UI から正常 approve した場合と patch の bytes が同じになる**（updatedAt timestamp 以外）。
- **2 operation の manifest 戦略を分けた**:
  - **A (substack-header-v1 master restore)**: `append-new`。Master sharing で同じ `relativePath: note-hero-v1/v001.png` が **既に entry[1]** (`→ note-hero-v1`) として存在。default の `findIndex by relativePath` で overwrite すると note-hero-v1 mapping が消える。意図的に append して manifest に **両方の mapping** を残した（entry[1]: note-hero-v1 / entry[7]: substack-header-v1）。
  - **B (substack-inline-reader-system-v1 register)**: `replace-by-relative-path` (Visual Register default)。同 relativePath の **wrong entry[5]** が `substack-header-v1` に bound していたので、これを `substack-inline-reader-system-v1` に上書き fix。これが boss の意図した正しい状態。
- **backup を 自動生成**: 上書き前に `assets/visuals/.../shared/campaign-hero-v1.png.recovery-backup-2026-05-18T12-01-45-584Z` (1,297,423 bytes、誤動作で書かれた substack-inline-reader-system content) を保存。元の master overwrite の証拠として残し、必要なら forensic 比較可能。
- **`meta.generatedBy` を recovery script に変更**: 元 server.mjs は `tools/visual-register/inbox` と書く。本スクリプトは `tools/visual-register/recover-working-pipeline-step-d.mjs` と明示 → 将来 audit で「これは recovery 由来の patch」と一目で判別可能。Visual Register UI から正規 approve された patch とは traceably distinct。
- **operation A の reviewNotes に "Recovery" 由来を明示**: reviewNotes field に `Recovery 2026-05-18: re-approved substack-header-v1 with note-hero-v1/v001.png (master shared source) to restore shared/campaign-hero-v1.png after previous mis-selection ... See docs/handoff/0127.` を書いた → 半年後に Sanity Studio で record を見たときに "なぜここで recovery したか" が分かる。
- **publish-package actual は実行禁止 維持**: 本 batch では actual を走らせない。Sanity 反映を boss が手動で行い、整合確認後に publish-package actual を別 batch で実行する flow を維持。

## なぜその設計にしたか

- **手動 UI 操作を回避した理由**: 同じ mis-mapping を別の場所で再発する可能性がある。スクリプト化することで「次に同じ問題が起きたとき、人間が UI を操作する代わりに recovery tool を走らせる」前例を作った。
- **replicate を選んだ理由 (vs refactor)**: server.mjs を refactor して helpers を export 化することは正解だが、それは **server.mjs 改修バッチ**として独立にやるべき。recovery は最小範囲で済ませる。
- **--dry-run を default にした理由**: 「とりあえず実行」したら 2 件の破壊的書き込みが走る。dry-run output を boss が見て、source / target / patch / backup を確認できる状態を保証する設計。
- **byte-identical を目指した理由**: 将来 dashboard が patch JSON を読んで Sanity に反映するロジック (Phase 2C) が来たとき、recovery 由来 patch と UI 由来 patch を **同じ shape** で処理できる。recovery patch だけ別 path で扱うロジック分岐を作らなくて済む。
- **append-new strategy を A に当てた理由**: master sharing は Visual Register の design に組み込まれていない (one-candidate-one-mapping を assume)。recovery で正しく直すには manifest に履歴を追加する。**今後 master sharing を多用するなら Visual Register 自体に "master-share approve" モードを追加** する余地（Phase 2B でのちのち議論）。
- **backup file name に ISO 8601 timestamp 使用**: `.recovery-backup-2026-05-18T12-01-45-584Z` のようにファイル名で「いつの recovery か」が分かる。複数 recovery が走っても collision しない。
- **Sanity write を実装しなかった理由**: 9 record × 4 field の手動 update を boss が Sanity Studio で行うフローを維持（[docs/handoff/0127 §9](handoff/0127-working-pipeline-visual-register-approval.md) のチェックリスト）。Phase 2C で dashboard write が解禁されてから初めて自動 mutation を入れる。
- **publish-package actual を実行しなかった理由**: Sanity 反映前に actual を走らせると、Sanity の `localAssetPath` field と publish-package の image copy 元 path が乖離する可能性。先に Sanity を更新してから actual、の順序が正しい。

## Codex と Claude Code の役割分担

| 役割 | 担当 |
| --- | --- |
| Visual Register code path inspection | **Claude Code（本バッチ）** |
| recover-working-pipeline-step-d.mjs 起草 + helpers replicate | Claude Code |
| --dry-run 実行 + 確認 | Claude Code |
| --execute 実行 + 検証 | Claude Code |
| backup file 自動生成 | Claude Code (script logic) |
| patch JSON 2 件 byte-identical 出力 | Claude Code (replicate from server.mjs) |
| review-manifest entry 2 件適用（A append, B replace） | Claude Code |
| publish-package dry-run | Claude Code |
| validation (local:check, root build, dashboard build) | Claude Code |
| docs/devlog/0117 + handoff/0128 起草 + latest.md mirror | Claude Code |
| Sanity Studio 手動 mutation (9 record) | **boss（次の手動操作）** |
| publish-package actual | **boss（Sanity 反映後の別 batch）** |
| release-review 5 markdown 更新 + final-human-checklist 署名 | **boss（手動）** |
| server.mjs の refactor（recovery 用 export 化） | **将来別 batch（必要なら）** |
| Codex CLI 起動 / 画像生成 | **0**（本 batch では起動していない） |

## API なしで済ませた理由

- 検証 + 1 スクリプト追加 + 2 ファイル新規 + 5 ファイル変更（うち 1 はファイル content overwrite、1 は append、1 は new file）
- Codex / OpenAI / Sanity write の呼び出し 0
- 新規 npm package 追加 0
- paid LLM / image API integration 追加 0
- 既存 Sanity read token / ChatGPT OAuth はそのまま

## このバッチで作ったもの / 変更したもの

### Added — `tools/`

- `tools/visual-register/recover-working-pipeline-step-d.mjs` — one-off recovery script (350+ 行、replicates server.mjs handleInboxApproveAndRegister logic)

### Added — `docs/`

- `docs/devlog/0117-working-pipeline-visual-register-recovery.md`（本ファイル）
- `docs/handoff/0128-working-pipeline-visual-register-recovery.md`

### Modified — `docs/`

- `docs/handoff/latest.md`（本 0128 のミラー）

### Modified — `assets/visuals/` (by recovery script execution)

- `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` — OVERWRITTEN (1,297,423 → **1,331,047 bytes**、原本に restore)

### Added — `assets/visuals/` (by recovery script execution)

- `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png.recovery-backup-2026-05-18T12-01-45-584Z` — backup of the wrong content (1,297,423 bytes)
- `assets/visuals/building-hitori-media-os/substack/inline/substack-inline-reader-system-v1.png` — NEW (1,297,423 bytes)

### Modified — `patches/visual-assets/` (by recovery script execution)

- `patches/visual-assets/building-hitori-media-os/substack-header-v1.json` — OVERWRITTEN
  - `meta.inboxSource`: `substack-inline-reader-system-v1/v001.png` → **`note-hero-v1/v001.png`** ✓
  - `meta.generatedBy`: `tools/visual-register/inbox` → `tools/visual-register/recover-working-pipeline-step-d.mjs` (traceability)
  - `set.localAssetPath` 不変（`shared/campaign-hero-v1.png`、これは元から正しかった）
  - `set.status` 不変（`saved`）

### Added — `patches/visual-assets/` (by recovery script execution)

- `patches/visual-assets/building-hitori-media-os/substack-inline-reader-system-v1.json` — NEW
  - `_id`: `visualAssetPlan.building-hitori-media-os.substack-inline-reader-system-v1`
  - `set.localAssetPath`: `assets/visuals/.../substack/inline/substack-inline-reader-system-v1.png`
  - `set.status`: `saved`
  - `meta.directSanityWrite`: `false`
  - `meta.inboxSource`: `substack-inline-reader-system-v1/v001.png`

### Modified — `assets/inbox/generated/.../review-manifest.json` (by recovery script execution)

- entry[5] REPLACED: substack-inline-reader-system-v1/v001.png の suggestedAssetPlanId を `substack-header-v1` → **`substack-inline-reader-system-v1`** に修正。createdAt は 2026-05-18T11:37:03.322Z (原 UI 登録時刻) を保持。
- entry[7] NEW: note-hero-v1/v001.png → substack-header-v1 mapping (master sharing 用、append-new)
- manifest 全体: 7 entries → **8 entries**
- updatedAt: 2026-05-18T12:01:45.593Z

### Confirmed unchanged

- `tools/visual-register/server.mjs` — **不変**（recovery script は replicate のみ）
- `schemas/` 全件 / `sanity.config.ts` / `structure/index.ts`
- `dashboard/src/` 全件
- root + dashboard `package.json` / `package-lock.json`
- `seed/` / `outputs/` / `publish-packages/` （actual 未実行）
- 他 5 candidate PNG 全件 byte-identical（threads / note-inline-content-os-flow / note-inline-human-judgment / substack-inline-reader / note-hero / x-hook 全 v00N + 1 finals 不変）
- Sanity dataset（**書き込みゼロ**）
- Vercel project / DNS / production env vars / deploy（**未触**）

## 検証結果サマリ

### Final asset state (post-recovery)

| Path | bytes | 期待 | 状態 |
| --- | --- | --- | --- |
| `assets/visuals/.../shared/campaign-hero-v1.png` | **1,331,047** | 1,331,047 (original) | ✅ RESTORED |
| `assets/visuals/.../shared/campaign-hero-v1.png.recovery-backup-2026-05-18T12-01-45-584Z` | 1,297,423 | (wrong content backup) | ✅ NEW backup |
| `assets/visuals/.../substack/inline/substack-inline-reader-system-v1.png` | **1,297,423** | 1,297,423 | ✅ NEW |
| `assets/visuals/.../note/inline/note-inline-content-os-flow-v1.png` | 1,234,240 | — | ✅ unchanged |
| `assets/visuals/.../threads/support/threads-support-diagram-v1.png` | 1,224,241 | — | ✅ unchanged |
| `assets/visuals/.../note/inline/note-inline-human-judgment-v1.png` | 1,375,682 | — | ✅ unchanged |
| `assets/visuals/.../x/hook/x-hook-main-v1.png` | 655,963 | — | ✅ unchanged |

### Patch state

7 patch JSON 全件存在、9 visualAssetPlan 中 7 が saved （残り 2 は skipped 予定）。

### Manifest state

8 entries 全て `reviewStatus: registered`、wrong mapping は entry[5] で修正済、master-sharing 用 entry[7] を新規。

### publish-package dry-run (post-recovery)

| Platform | copied | TODO | 状態 |
| --- | --- | --- | --- |
| note | 2 (note-inline-content-os-flow-v1, note-inline-human-judgment-v1) | 2 (skipped 記録分、仕様) | ✅ |
| x | 0 | — | ✅ |
| substack | **1 (substack-inline-reader-system-v1)** ← 解決 | — ← **TODO 解消** | ✅ |
| threads | 1 (threads-support-diagram-v1) | — | ✅ |

→ 前回 dry-run にあった `TODO: source image missing for substack-inline-reader-system-v1.png` が**消滅**。

### Validation

| Check | Result |
| --- | --- |
| `npm run local:check` | **17 ok / 0 fail** |
| root `npm run build`（Sanity Studio） | **green** (7894ms) |
| `cd dashboard && npm run build` | **green**（既存 routes 不変） |
| publish-package dry-run | exit 0, `ok: true` |
| publish-package actual | **未実行**（Sanity 反映後に boss が実行） |
| Sanity write | **0** |
| paid LLM / image API SDK grep | **0 hits** |
| 新規 package | **0** |

## Step D 完了判定

| Working Pipeline Step D 条件 | 状態 |
| --- | --- |
| 7 visualAssetPlan の final asset が assets/visuals/ に揃う | ✅ 7/7 ready (note-hero shared + substack-header shared + x-hook + threads-support + note-inline-content-os-flow + note-inline-human-judgment + substack-inline-reader-system) |
| 各 patch JSON が揃う | ✅ 7/7 |
| review-manifest が registered 状態 | ✅ 全 candidates registered |
| publish-package dry-run 健全 | ✅ priority 4 platforms 全 clean |
| 残り 2 record は skipped 予定 | docs に明記済、Sanity 反映で `skipped` 入力 |

→ **Step D is COMPLETE.** 次は Sanity Studio 反映 (Step E) → publish-package actual (Step F) → release-review 更新 + 署名 (Step G)。

## 発信ネタになりそうな切り口

1. **「人間の UI 操作ミスを script で復旧する」設計**: Visual Register UI mis-selection → master file overwrite を script で safe recover。手動 UI 操作 vs スクリプト化のトレードオフを実 case で説明できる。
2. **「server.mjs を refactor せず replicate」する判断**: 緊急 recovery で「直すべき場所」と「直すべき timing」を分ける。本筋の改修は別 batch、recovery は最小範囲で。
3. **「byte-identical patch JSON」を目指す価値**: 将来 dashboard write 解禁 (Phase 2C) で recovery patch と UI patch が同じ shape で扱える。
4. **「backup ファイル命名」**: `<final>.recovery-backup-<ISO8601>` 形式で人間が一目で「いつ・何の」backup か分かる。複数 recovery でも collision しない。
5. **「master sharing への対応」**: Visual Register は one-candidate-one-mapping を assume。master sharing （複数 plan が同 final を共有）で `append-new` strategy が必要だった。Visual Register に master-share approve mode を追加する将来作業の前段で実 case を出した。
6. **「dry-run / execute の 2 段化」**: 破壊的 operation を 1 命令で実行可能にしない、設計の基本。

## Safety Verified

- direct Sanity write を含むコード変更: **0 件**
- paid LLM / image API client 追加: **0 件**
- 環境変数変更 / Vercel UI 操作: **0 件**
- 画像生成 / Codex CLI 起動: **0 件**
- schema 変更 / activate / proposed sketch 追加: **0 件**
- Sanity mutation: **0 件**
- publish-package actual: **未実行**
- 候補 PNG (inbox v00N): **全 10 件 byte-identical（recovery script は inbox から読むだけ、書かない）**
- 既存 production dashboard (`app.hitorimedia.com`) の挙動: **不変**
- Visual Register (`tools/visual-register/server.mjs`) の挙動: **不変**（recovery script は別ファイル）
- root `npm run local:check`: **17 ok / 0 fail**
- root `npm run build`（Sanity Studio）: **green**
- `cd dashboard && npm run build`: **green**
