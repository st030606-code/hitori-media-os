# Devlog 0116 — Working Pipeline Step D: Visual Register Approval Verification (issue detected)

Date: 2026-05-18
Status: **verification-only / 4-of-5 approvals correct / 1 mis-mapping detected / recovery action required (boss manual)**

## 今日の判断

Working Pipeline Step D の Visual Register 承認結果を検証した。**4 件は正しく approve & register された**が、**1 件で human UI 操作ミスにより 2 つの問題が同時発生**。

最重要発見: **substack-header-v1 を Visual Register で承認するとき、誤って substack-inline-reader-system-v1 の v001.png を candidate に選んだ** ことが原因で:

1. `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` が **上書き** された
   - 元: 1,331,047 bytes（note-hero-v1/v001.png 由来、note hero + Substack header の共有マスター）
   - 現在: 1,297,423 bytes（substack-inline-reader-system-v1/v001.png の中身）
2. `assets/visuals/building-hitori-media-os/substack/inline/substack-inline-reader-system-v1.png` が **未生成**（その visualAssetPlan は approve されなかった）

→ **publish-package actual を実行する前に boss 手動で recover が必要**。本 batch は recovery しない（hard rules 「Only verify and document」）。

## 検出根拠

### review-manifest.json の該当 entry

```json
{
  "relativePath": "assets/inbox/generated/building-hitori-media-os/substack-inline-reader-system-v1/v001.png",
  "fileName": "v001.png",
  "suggestedAssetPlanId": "visualAssetPlan.building-hitori-media-os.substack-header-v1",
  "reviewStatus": "registered",
  "finalAssetPath": "assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png",
  "patchPath": "patches/visual-assets/building-hitori-media-os/substack-header-v1.json",
  "registeredAt": "2026-05-18T11:40:12.303Z"
}
```

`relativePath`（candidate source）が `substack-inline-reader-system-v1/v001.png` なのに、`suggestedAssetPlanId` が `substack-header-v1` で、`finalAssetPath` が `shared/campaign-hero-v1.png`。Visual Register の Inbox Review UI で boss が candidate を選択するときに、別 asset の candidate を誤って選択した結果。

### patch JSON の証拠

`patches/visual-assets/building-hitori-media-os/substack-header-v1.json`:

```json
{
  "_id": "visualAssetPlan.building-hitori-media-os.substack-header-v1",
  "set": {
    "localAssetPath": "assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png",
    "status": "saved"
  },
  "meta": {
    "inboxSource": "assets/inbox/generated/building-hitori-media-os/substack-inline-reader-system-v1/v001.png",
    "originalFileName": "v001.png",
    "directSanityWrite": false
  }
}
```

`meta.inboxSource` が間違った candidate を指している。

### `substack-inline-reader-system-v1` patch が **存在しない**

```bash
ls patches/visual-assets/building-hitori-media-os/substack-inline-reader-system-v1.json
# → No such file or directory
```

→ substack-inline-reader-system-v1 は Visual Register で **approve されていない**。

## 回復可能性

原本（1,331,047 bytes の campaign-hero-v1.png）は **3 箇所に残っている**:

| 場所 | bytes | 状態 |
| --- | --- | --- |
| `assets/inbox/generated/building-hitori-media-os/note-hero-v1/v001.png` | 1,331,047 | **元 inbox candidate**、回復用 source として使える |
| `publish-packages/note/building-hitori-media-os/images/campaign-hero-v1.png` | 1,331,047 | 前回 publish-package で配布された copy |
| `publish-packages/substack/building-hitori-media-os/images/campaign-hero-v1.png` | 1,331,047 | 同上 |

substack-inline-reader-system-v1/v001.png も inbox に intact:
- `assets/inbox/generated/building-hitori-media-os/substack-inline-reader-system-v1/v001.png` (1,297,423 bytes)

→ **boss は Visual Register UI で再度 approve すれば両方とも 正しく回復できる**（本 batch では実行しない）。

## なぜその設計にしたか

- **「Only verify and document」hard rule を守った**: recovery を私が手動 (Edit / Write / cp) で行うと、Visual Register の review-manifest と patch JSON が手動編集と乖離して整合が崩れる。boss が Visual Register UI 経由で再 approve した方が、manifest と patch が一気通貫で更新される。
- **publish-package actual は実行禁止 (boss 判断待ち)**: 現状の `shared/campaign-hero-v1.png` で publish 実行すると、note と substack の package に **間違った hero** が配布される。dry-run は実行して計画を docs に残す。
- **既存 publish-packages の campaign-hero-v1.png は ORIGINAL のまま**（再配布前なので上書きされていない）: 万一の bridge 状態で記事を公開しても、publish-package 内の hero は正しい original。ただし `assets/visuals/` 側が壊れているのは事実なので、本 batch で必ず handoff に明記。
- **4 件の正常 approve は十分検証**: note-inline-content-os-flow-v1 v004 / threads-support-diagram-v1 v004 / note-inline-human-judgment-v1 v001 → 各 patch / final / manifest すべて整合。これらの Sanity 反映は **進めて良い**。
- **substack-header-v1 と substack-inline-reader-system-v1 の Sanity 反映は recovery 後にする**: 現状の patch / manifest を Sanity に書き込むと、Sanity に間違った `localAssetPath` 情報が登録される（substack-header-v1 が間違った source の hero を指す状態）。

## Codex と Claude Code の役割分担

| 役割 | 担当 |
| --- | --- |
| Visual Register UI で 4 件正常承認 + 1 件誤承認 | **boss（人間操作、Visual Register tool 経由）** |
| 検証 (final PNG / patch JSON / manifest / dims / sizes) | **Claude Code（本バッチ）** |
| 問題検出と原因特定 | Claude Code |
| publish-package dry-run 実行 | Claude Code |
| Sanity Studio 更新項目の list 化 | Claude Code |
| **recovery（誤った patch / 上書きされた campaign-hero-v1.png / 未承認 substack-inline-reader-system-v1）** | **boss（次バッチで Visual Register UI 経由）** |
| Sanity 反映 (9 record) | **boss（手動、recovery 後）** |
| publish-package actual | **boss（手動、recovery + Sanity 反映後）** |
| Codex CLI 起動 / 画像生成 | **0**（本 batch では起動していない） |

## API なしで済ませた理由

- 検証 + docs のみ → API 連携追加 0
- Visual Register への HTTP 呼び出し 0
- Codex / OpenAI / Sanity write の呼び出し 0
- 新規 npm package 追加 0
- 既存 patches / final assets / manifest は **read のみ**

## このバッチで作ったもの / 変更したもの

### Added — `docs/`

- `docs/devlog/0116-working-pipeline-visual-register-approval.md`（本ファイル）
- `docs/handoff/0127-working-pipeline-visual-register-approval.md`

### Modified — `docs/`

- `docs/handoff/latest.md`（本 0127 のミラー）

### Confirmed unchanged (by Claude Code this batch)

- `assets/visuals/building-hitori-media-os/` の中身（Visual Register が boss UI 操作で更新したが、Claude Code は touch していない）
- `patches/visual-assets/building-hitori-media-os/` の中身（同上）
- `assets/inbox/generated/building-hitori-media-os/review-manifest.json`（同上）
- 候補 PNG（全件 byte-identical、Claude Code は touch なし）
- prompt.md / review.md（全 5 asset folder、Claude Code は touch なし）
- `schemas/` / `dashboard/src/` / `tools/` / `sanity.config.ts` / `proxy.ts` / `featureFlags.ts` 全 件
- root + dashboard `package.json` / `package-lock.json`
- `seed/` / `outputs/` / `publish-packages/`（dry-run のみ、actual 未実行）
- Sanity dataset（**書き込みゼロ**）
- Vercel project / DNS / production env vars
- production deployment（**未触**）

## 検証サマリ

### Step 1: Final PNG 検証 (5 件)

| Asset | 期待 final path | 状態 |
| --- | --- | --- |
| note-inline-content-os-flow-v1 | `assets/visuals/.../note/inline/note-inline-content-os-flow-v1.png` | ✅ 1600x900, 1,234,240 bytes (v004 から正しくコピー済) |
| threads-support-diagram-v1 | `assets/visuals/.../threads/support/threads-support-diagram-v1.png` | ✅ 1080x1350, 1,224,241 bytes (v004 から正しくコピー済) |
| note-inline-human-judgment-v1 | `assets/visuals/.../note/inline/note-inline-human-judgment-v1.png` | ✅ 1600x900, 1,375,682 bytes (v001 から正しくコピー済) |
| substack-inline-reader-system-v1 | `assets/visuals/.../substack/inline/substack-inline-reader-system-v1.png` | ❌ **MISSING** |
| substack-header-v1 (shared) | `assets/visuals/.../shared/campaign-hero-v1.png` | ⚠️ **OVERWRITTEN** (1,331,047 → 1,297,423 bytes、内容が substack-inline-reader-system content に置き換わった) |

### Step 2: Patch JSON 検証 (5 件)

| Patch | 状態 | 問題 |
| --- | --- | --- |
| note-inline-content-os-flow-v1.json | ✅ 正常 | — |
| threads-support-diagram-v1.json | ✅ 正常 | — |
| note-inline-human-judgment-v1.json | ✅ 正常 | — |
| substack-inline-reader-system-v1.json | ❌ **MISSING** | substack-inline-reader-system-v1 の承認が行われていない |
| substack-header-v1.json | ⚠️ **存在するが meta.inboxSource が誤っている** | source = `substack-inline-reader-system-v1/v001.png`（本来は note-hero-v1/v001.png 由来の master を指すべき） |

正常 3 件はすべて要件を満たす:
- `set.localAssetPath`: 期待 path
- `set.status`: `saved`
- `meta.directSanityWrite`: `false`

### Step 3: Review-manifest.json 検証

| Asset | manifest entry | reviewStatus |
| --- | --- | --- |
| note-inline-content-os-flow-v1 v004 | ✅ ある | `registered` |
| threads-support-diagram-v1 v004 | ✅ ある | `registered` |
| note-inline-human-judgment-v1 v001 | ✅ ある | `registered` |
| substack-header-v1（substack-inline-reader-system-v1/v001.png を source として誤登録） | ⚠️ あるが mapping が誤 | `registered` |
| substack-inline-reader-system-v1 | ❌ entry なし | — |

### Step 4: publish-package dry-run 結果

注: dry-run のみ実行、actual 未実行。

| Platform | visualCount | copied | warnings/todos |
| --- | --- | --- | --- |
| **note** | 5 | 2 copied: note-inline-content-os-flow-v1.png, note-inline-human-judgment-v1.png / 1 skipped: campaign-hero-v1.png (既存) | TODO: 2 missing (manual-vs-automation / publish-package-folder = skipped 記録分) |
| **x** | 1 | 0 copied / 4 skipped (x-hook-main-v1.png 等、既存) | — |
| **substack** | 2 | 0 copied / 11 skipped (campaign-hero-v1.png 等、既存) | **TODO: source image missing for substack-inline-reader-system-v1.png** |
| **threads** | 1 | 1 copied: threads-support-diagram-v1.png | — |

`publish-packages/<note,substack>/.../images/campaign-hero-v1.png` は **既存 (1,331,047 bytes、ORIGINAL)** で skipped 扱い。actual を走らせると `replacementCandidates` の logic 次第で上書きされる可能性があるので、recovery 前に actual 実行は **しないこと**。

### Step 5: Recovery actions (boss が Visual Register UI で実行)

1. **Visual Register を起動**: `npm run visual:register` (localhost:3334)
2. **`substack-header-v1` を再承認**:
   - Inbox Review カードで campaign=building-hitori-media-os に絞る
   - asset filter: `substack-header-v1`
   - candidate selector で **`note-hero-v1/v001.png` (1,331,047 bytes、master の原本)** を選び直す
   - reviewNotes: "Master sharing with note-hero-v1. Re-approve to restore the original shared campaign-hero-v1.png that was accidentally overwritten in the previous approve cycle."
   - `approve & register` → `shared/campaign-hero-v1.png` が ORIGINAL に上書きで戻る、patch JSON も `meta.inboxSource: note-hero-v1/v001.png` で正しい状態に
   - 検証: `stat -f '%z' assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` が 1,331,047 bytes に戻る
3. **`substack-inline-reader-system-v1` を承認**:
   - Inbox Review カードで `substack-inline-reader-system-v1/v001.png` を選ぶ
   - asset slot: `substack-inline-reader-system-v1`
   - reviewNotes: "Japanese-editorial-v1 candidate, Reader-list funnel layout. Self-rubric 35/35. Working pipeline acceptance line 24/35 cleared."
   - `approve & register` → `assets/visuals/.../substack/inline/substack-inline-reader-system-v1.png` (1,297,423 bytes) が新規作成、patch JSON 生成
   - 検証: 新規 final PNG 存在 + patch JSON 存在

その後 boss は本 handoff §11 (Sanity 反映チェックリスト) に進める。

## Sanity Studio 反映チェックリスト (recovery 後)

下記 9 record を Sanity Studio で手動更新。**recovery 完了後に実施すること**。

| _id | status | localAssetPath | reviewNotes |
| --- | --- | --- | --- |
| visualAssetPlan.building-hitori-media-os.note-hero-v1 | `saved` | `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` | "Master shared with substack-header-v1." |
| visualAssetPlan.building-hitori-media-os.substack-header-v1 | `saved` | `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` | "Master sharing with note-hero-v1." |
| visualAssetPlan.building-hitori-media-os.x-hook-main-v1 | `saved` | `assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png` | "Hook image v1, approved 2026-05-14." |
| visualAssetPlan.building-hitori-media-os.threads-support-diagram-v1 | `saved` | `assets/visuals/building-hitori-media-os/threads/support/threads-support-diagram-v1.png` | "v004 (japanese-editorial-v1), self-rubric 35/35." |
| visualAssetPlan.building-hitori-media-os.note-inline-content-os-flow-v1 | `saved` | `assets/visuals/building-hitori-media-os/note/inline/note-inline-content-os-flow-v1.png` | "v004 (japanese-editorial-v1), self-rubric 35/35." |
| visualAssetPlan.building-hitori-media-os.note-inline-human-judgment-v1 | `saved` | `assets/visuals/building-hitori-media-os/note/inline/note-inline-human-judgment-v1.png` | "v001 (japanese-editorial-v1), Human review journey layout, self-rubric 35/35." |
| visualAssetPlan.building-hitori-media-os.substack-inline-reader-system-v1 | `saved` | `assets/visuals/building-hitori-media-os/substack/inline/substack-inline-reader-system-v1.png` | "v001 (japanese-editorial-v1), Reader-list funnel, self-rubric 35/35. Approved after recovery." |

**Skipped records (本 working pipeline では visual を作らない)**:

| _id | status | reviewNotes |
| --- | --- | --- |
| visualAssetPlan.building-hitori-media-os.note-inline-manual-vs-automation-v1 | `skipped` | "本フェーズでは保留、Visual Engine Improvement Phase で再評価。記事は補助図なしで公開可。" |
| visualAssetPlan.building-hitori-media-os.note-inline-publish-package-folder-v1 | `skipped` | "本フェーズでは保留、Visual Engine Improvement Phase で再評価。記事は補助図なしで公開可。" |

各 record で `updatedAt` を Sanity 更新時の ISO 8601 timestamp に。

## 発信ネタになりそうな切り口

1. **「Visual Register UI 操作ミスで master shared file が上書きされた」**: master sharing パターンの落とし穴。同一 final path を指す複数 visualAssetPlan があるとき、不注意な candidate 選択が破壊的 overwrite を生む。
2. **「自動化を急がない判断の根拠」**: dashboard で approve & register を解禁する Phase 2B 着手前に、Visual Register UI の "誤操作" を 1 回観察したことで、書き解禁時に必要な確認 gate (diff preview / type-to-confirm) の設計理由が肉付きで分かった。
3. **「破壊的操作の冗長性」**: campaign-hero-v1.png の **原本が 3 箇所に残っていた** ことで recovery が trivial。publish-packages 配布 / inbox 原本 / git history（git で tracked なら）の冗長性が偶発的に救った。
4. **「dashboard が detect しないこと」**: dashboard `/visual-assets` listing は patch JSON 経由ではなく Sanity を読むので、本 mishap を直接表示しない。Phase 2B / 2C で `patches/` を読む追加 view が必要。
5. **「Verify-only batch が回復計画を含む」**: Claude Code が「自動修復しない、人間が直す」を hard rule として守ることで、boss の手動経路を学習する機会が温存される。

## Safety Verified

- direct Sanity write を含むコード変更: **0 件**
- paid LLM / image API client 追加: **0 件**
- 環境変数変更 / Vercel UI 操作: **0 件**
- 画像生成 / Codex CLI 起動: **0 件**
- assets/visuals / patches / Sanity / publish-packages を本 batch で変更: **0 件**（Visual Register の boss 操作で 4 patch + 4 final が更新済、5 件目で誤動作、Claude Code は touch していない）
- candidate PNG 編集 / 削除 / 上書き: **0 件**（既存 全 10 件 byte-identical）
- prompt.md / review.md 編集: **0 件**（本 batch 内）
- React component / API route / page route 追加: **0**
- 新規 npm package: **0**
- 既存 production dashboard (`app.hitorimedia.com`) の挙動: **不変**
- Visual Register (`tools/visual-register/`) の挙動: **不変**
- publish-package actual: **未実行**（dry-run のみ）
- root `npm run local:check`: 後段 handoff §12 で実行・結果記録
- root `npm run build`（Sanity Studio）: 後段 handoff §12 で実行・結果記録
- `cd dashboard && npm run build`: 後段 handoff §12 で実行・結果記録
