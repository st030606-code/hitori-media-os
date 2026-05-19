# Handoff: Working Pipeline Step D — Visual Register Approval Verification (issue detected, recovery required)

Date: 2026-05-18
Status: **verify-only / 4-of-5 approvals OK / 1 mis-mapping detected / recovery action required by boss / publish-package actual NOT run**

## 1. Task Goal

Working Pipeline Step D の Visual Register approve & register 結果を **verify-only で検証**。boss が UI で承認した 5 件のうち、4 件は正常、1 件で human UI 操作ミスにより 2 問題（master 上書き + 別 asset 未承認）が発生したことを検出し、recovery 手順を documentation 化した。本 batch では **recovery を Claude Code は実行しない**（hard rule）。

## 2. Constraints Followed

- Sanity write: **0**
- 手動 patch JSON 作成: **0**
- 手動 final asset コピー: **0**
- 既存ファイル上書き: **0**（boss UI 操作で発生した上書きは検出のみ、復元なし）
- deploy: **0**
- publish-package actual: **0**（dry-run のみ実行）
- Verify + document only

## 3. Changed Files

### Added — `docs/`

- `docs/devlog/0116-working-pipeline-visual-register-approval.md`
- `docs/handoff/0127-working-pipeline-visual-register-approval.md`（本ファイル）

### Modified — `docs/`

- `docs/handoff/latest.md`（本 0127 のミラー）

### Confirmed unchanged (by Claude Code this batch)

- すべての PNG / patch JSON / review-manifest.json / prompt.md / review.md
- schemas / dashboard runtime / tools / proxy.ts / featureFlags.ts
- root + dashboard `package.json` / `package-lock.json`
- Sanity dataset / Vercel project / DNS / production env vars / deploy
- POTA_Empire/.git / 兄弟 POTA project

注: boss が Visual Register UI 経由で 5 件 approve & register した結果、`assets/visuals/`, `patches/`, `assets/inbox/.../review-manifest.json` は **本 batch 外で更新済み**。本 batch はそれを **検証** したのみ。

## 4. Approved assets verified

### 4.1 正常承認 4 件（このまま Sanity 反映へ進める）

| # | Asset | Selected candidate | Final asset path | bytes | Patch JSON | Manifest |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | note-inline-content-os-flow-v1 | v004 | `assets/visuals/.../note/inline/note-inline-content-os-flow-v1.png` (1600×900) | 1,234,240 | ✅ 正常 | ✅ registered |
| 2 | threads-support-diagram-v1 | v004 | `assets/visuals/.../threads/support/threads-support-diagram-v1.png` (1080×1350) | 1,224,241 | ✅ 正常 | ✅ registered |
| 3 | note-inline-human-judgment-v1 | v001 | `assets/visuals/.../note/inline/note-inline-human-judgment-v1.png` (1600×900) | 1,375,682 | ✅ 正常 | ✅ registered |
| 4 (既存) | note-hero-v1 | v001 (2026-05-14) | `assets/visuals/.../shared/campaign-hero-v1.png`（共有 master） | **本来 1,331,047 のはず → 現在 1,297,423 に上書きされている** ❌ | ✅ note-hero-v1.json は正常 | ✅ registered (2026-05-14) |

→ #1 / #2 / #3 は完全 OK。#4 (note-hero-v1) は patch / manifest は正常だが、共有先 final PNG が #5 の事故で上書きされた。

### 4.2 ⚠️ Mis-mapping 1 件

| Asset | 問題 |
| --- | --- |
| **substack-header-v1** | review-manifest の同 asset entry が `relativePath: substack-inline-reader-system-v1/v001.png` を指している。本来は note-hero-v1/v001.png（master shared source）であるべき。Visual Register UI で boss が candidate を選択するときに、別 asset の inbox candidate を間違えて選んだ結果。最終的に `shared/campaign-hero-v1.png` が **substack-inline-reader-system-v1 の中身で上書きされた**（1,331,047 → 1,297,423 bytes） |

### 4.3 ❌ 未承認 1 件

| Asset | 問題 |
| --- | --- |
| **substack-inline-reader-system-v1** | 上記 mis-mapping の副作用として、本来 approve すべき自身の visualAssetPlan slot で承認されていない。patch JSON 不存在、final PNG 不存在、manifest entry も自身としては不存在（substack-header-v1 用 entry に間違って吸収された）。**recovery で再 approve 必要** |

## 5. Final asset paths summary

| Path | bytes | 期待 | 状態 |
| --- | --- | --- | --- |
| `assets/visuals/.../note/inline/note-inline-content-os-flow-v1.png` | 1,234,240 | v004 由来 | ✅ |
| `assets/visuals/.../threads/support/threads-support-diagram-v1.png` | 1,224,241 | v004 由来 | ✅ |
| `assets/visuals/.../note/inline/note-inline-human-judgment-v1.png` | 1,375,682 | v001 由来 | ✅ |
| `assets/visuals/.../substack/inline/substack-inline-reader-system-v1.png` | — | v001 由来 | ❌ **MISSING** |
| `assets/visuals/.../shared/campaign-hero-v1.png` | **1,297,423** | **1,331,047 (原本)** | ⚠️ **OVERWRITTEN** |
| `assets/visuals/.../x/hook/x-hook-main-v1.png` | 655,963 | 2026-05-14 承認済 | ✅（本 batch 範囲外、既存） |

## 6. Patch JSON paths summary

| Patch | bytes | 内容 | 状態 |
| --- | --- | --- | --- |
| `patches/visual-assets/.../note-inline-content-os-flow-v1.json` | 871 | `localAssetPath` 正、`set.status: saved`, `meta.directSanityWrite: false`, `meta.inboxSource: ...v004.png` | ✅ |
| `patches/visual-assets/.../threads-support-diagram-v1.json` | 813 | 同 (v004 source) | ✅ |
| `patches/visual-assets/.../note-inline-human-judgment-v1.json` | 814 | 同 (v001 source) | ✅ |
| `patches/visual-assets/.../substack-inline-reader-system-v1.json` | — | — | ❌ **MISSING** |
| `patches/visual-assets/.../substack-header-v1.json` | 853 | `localAssetPath: .../shared/campaign-hero-v1.png` ✓ だが **`meta.inboxSource: .../substack-inline-reader-system-v1/v001.png`** ❌ (本来 note-hero-v1/v001.png 経由の master) | ⚠️ **wrong source** |
| `patches/visual-assets/.../note-hero-v1.json` | 1,031 | 2026-05-14 承認の正しい patch、`meta.inboxSource: .../note-hero-v1/v001.png` | ✅（既存、不変） |
| `patches/visual-assets/.../x-hook-main-v1.json` | 696 | 2026-05-14 承認の正しい patch | ✅（既存、不変） |

## 7. Manifest status

`assets/inbox/generated/building-hitori-media-os/review-manifest.json` の `candidates` 配列（合計 7 entries）:

| # | candidate path | suggestedAssetPlanId | reviewStatus | finalAssetPath |
| --- | --- | --- | --- | --- |
| 1 | `.../note-hero-v1-attempt-1.png` | note-hero-v1 | registered | shared/campaign-hero-v1.png |
| 2 | `.../note-hero-v1/v001.png` | note-hero-v1 | registered | shared/campaign-hero-v1.png |
| 3 | `.../x-hook-main-v1/v001.png` | x-hook-main-v1 | registered | x/hook/x-hook-main-v1.png |
| 4 | `.../note-inline-content-os-flow-v1/v004.png` | note-inline-content-os-flow-v1 | registered | note/inline/note-inline-content-os-flow-v1.png |
| 5 | `.../threads-support-diagram-v1/v004.png` | threads-support-diagram-v1 | registered | threads/support/threads-support-diagram-v1.png |
| 6 | **`.../substack-inline-reader-system-v1/v001.png`** | **substack-header-v1** ⚠️ | registered | **shared/campaign-hero-v1.png** ⚠️ (上書き) |
| 7 | `.../note-inline-human-judgment-v1/v001.png` | note-inline-human-judgment-v1 | registered | note/inline/note-inline-human-judgment-v1.png |

entry #6 が **本 issue の証拠**。candidate (relativePath) と suggestedAssetPlanId が **不一致 mapping**。

`substack-inline-reader-system-v1` の自前 entry は manifest に **存在しない**。

## 8. publish-package dry-run result

`npm run publish:package -- building-hitori-media-os --dry-run` (2026-05-18T11:43:54Z)、`ok: true`:

| Platform | draft | visualCount | copied | TODOs / warnings |
| --- | --- | --- | --- | --- |
| **note** | `outputs/note/...md` (ready-for-human-edit) | 5 | **2 new** (note-inline-content-os-flow-v1.png / note-inline-human-judgment-v1.png) / 1 skipped (campaign-hero-v1.png 既存) | TODO × 2: skipped 2 record (manual-vs-automation / publish-package-folder) の source 不在（仕様、`status: skipped` で OK） |
| **x** | `outputs/x/...md` | 1 | 0 (x-hook-main-v1.png 既存) | — |
| **substack** | `outputs/substack/...md` | 2 | 0 (campaign-hero-v1.png 既存) | **TODO: substack-inline-reader-system-v1.png 不在** ⚠️ |
| **threads** | `outputs/threads/...md` | 1 | **1 new** (threads-support-diagram-v1.png) | — |
| podcast / shorts / youtube | drafts 有 | 0 | — | — |
| instagram / github | drafts 無 | 0 | — | warnings: "No draft source dir configured" |

**重要**:
- 既存 `publish-packages/note,substack/.../images/campaign-hero-v1.png` は **本物の original (1,331,047 bytes)**。前回 publish-package で配布された copy がそのまま残っており、boss が今 actual を走らせると `replacePlaceholderPackage` ロジック次第で `assets/visuals/.../shared/campaign-hero-v1.png` (現在は wrong content) で上書きされる **可能性が高い**。
- → **publish-package actual を recovery 完了前に走らせないこと**。

## 9. Sanity manual reflection checklist (recovery 完了後)

下記 9 record を Sanity Studio で **boss 手動更新**。**recovery が完了し、shared/campaign-hero-v1.png が 1,331,047 bytes に戻り、substack/inline/substack-inline-reader-system-v1.png が新規作成された後に実施すること**。

```yaml
# 7 saved records
1. visualAssetPlan.building-hitori-media-os.note-hero-v1
   status: saved
   localAssetPath: assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png
   reviewNotes: "Master shared with substack-header-v1. Approved 2026-05-14, master file preserved after Visual Register UI mis-selection recovery."
   updatedAt: <ISO 8601 now>

2. visualAssetPlan.building-hitori-media-os.substack-header-v1
   status: saved
   localAssetPath: assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png
   reviewNotes: "Master sharing with note-hero-v1. Re-approved 2026-05-18 after initial mis-selection."
   updatedAt: <ISO 8601 now>

3. visualAssetPlan.building-hitori-media-os.x-hook-main-v1
   status: saved
   localAssetPath: assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png
   reviewNotes: "Hook image v1, approved 2026-05-14."
   updatedAt: <ISO 8601 now>

4. visualAssetPlan.building-hitori-media-os.threads-support-diagram-v1
   status: saved
   localAssetPath: assets/visuals/building-hitori-media-os/threads/support/threads-support-diagram-v1.png
   reviewNotes: "v004 (japanese-editorial-v1), Problem-to-system 3-band portrait. Self-rubric 35/35."
   updatedAt: <ISO 8601 now>

5. visualAssetPlan.building-hitori-media-os.note-inline-content-os-flow-v1
   status: saved
   localAssetPath: assets/visuals/building-hitori-media-os/note/inline/note-inline-content-os-flow-v1.png
   reviewNotes: "v004 (japanese-editorial-v1), Before/After + Pipeline. Self-rubric 35/35."
   updatedAt: <ISO 8601 now>

6. visualAssetPlan.building-hitori-media-os.note-inline-human-judgment-v1
   status: saved
   localAssetPath: assets/visuals/building-hitori-media-os/note/inline/note-inline-human-judgment-v1.png
   reviewNotes: "v001 (japanese-editorial-v1), Human review journey 3-section. Self-rubric 35/35."
   updatedAt: <ISO 8601 now>

7. visualAssetPlan.building-hitori-media-os.substack-inline-reader-system-v1
   status: saved
   localAssetPath: assets/visuals/building-hitori-media-os/substack/inline/substack-inline-reader-system-v1.png
   reviewNotes: "v001 (japanese-editorial-v1), Reader-list funnel. Self-rubric 35/35. Approved after recovery."
   updatedAt: <ISO 8601 now>

# 2 skipped records (本フェーズで保留、補助図、後の phase で再評価)
8. visualAssetPlan.building-hitori-media-os.note-inline-manual-vs-automation-v1
   status: skipped
   localAssetPath: (空のまま、何も入力しない)
   reviewNotes: "本フェーズでは保留。Visual Engine Improvement Phase で再評価。記事は補助図なしで公開可。"
   updatedAt: <ISO 8601 now>

9. visualAssetPlan.building-hitori-media-os.note-inline-publish-package-folder-v1
   status: skipped
   localAssetPath: (空のまま)
   reviewNotes: "本フェーズでは保留。Visual Engine Improvement Phase で再評価。記事は補助図なしで公開可。"
   updatedAt: <ISO 8601 now>
```

更新後の確認:

- Sanity Studio listing で全 9 record の status / localAssetPath 反映済か目視
- dashboard `/visual-assets` listing で Done バケット 7 件 + （Skipped または Other バケット）2 件で表示

## 10. Validation Results

実行結果（2026-05-18 JST）:

| Check | Result |
| --- | --- |
| `npm run local:check` | **17 ok / 0 fail** |
| root `npm run build`（Sanity Studio） | **green** |
| `cd dashboard && npm run build` | **green**（既存 routes 不変） |
| `git status --short`（Claude Code が本 batch で変更したもの） | docs 3 件のみ + dashboard preexisting uncommitted |
| direct Sanity write grep | **0 hits** |
| paid LLM / image API SDK grep | **0 hits** |
| 新規 package | **0** |
| publish-package dry-run | exit 0, JSON ok=true |
| publish-package actual | **未実行** (recovery 完了まで停止) |

## 11. Important Decisions

- **Verify-only**（hard rule "Only verify and document"）: Claude Code は手動 cp / Edit / patch generation を行わない。recovery は boss が Visual Register UI 経由で実行
- **publish-package actual は recovery 完了まで停止**: 現状で actual を走らせると wrong hero が distributed される可能性
- **正常 4 件分のみ Sanity 反映を先行することも可**（任意）: recovery が遅れる場合、note-inline-content-os-flow-v1 / threads-support-diagram-v1 / note-inline-human-judgment-v1 / note-hero-v1（master 復元後）の 4 record だけ先に Sanity 反映してもよい。ただし整合性最優先なら recovery 完了 → 9 record 一括反映が clean
- **既存 publish-packages の ORIGINAL hero が 3 箇所に残る冗長性**（note-hero/v001.png + 2 publish-packages の campaign-hero-v1.png copy）が recovery を trivial にした → 偶発的 fault tolerance

## 12. Recovery action plan (Recommended Next Step)

### Step D-recovery: Visual Register で 2 件 re-approve（boss 手動）

```bash
# 1. Visual Register を起動
cd /Users/sugawaratakuya/Documents/POTA_Empire/10_Development/sanity-ai-content-os
npm run visual:register
# → http://localhost:3334
```

その後 Visual Register UI で:

#### A. substack-header-v1 を再承認 (master 復元)

1. Inbox Review カードで campaign=building-hitori-media-os に絞る
2. asset filter: `substack-header-v1`
3. candidate selector: **`note-hero-v1/v001.png` (1,331,047 bytes)** を選ぶ（master の原本）
4. reviewNotes:
   ```
   Master sharing with note-hero-v1. Re-approve to restore the original
   shared campaign-hero-v1.png (1,331,047 bytes) that was accidentally
   overwritten by substack-inline-reader-system-v1/v001.png in the
   previous approve cycle (2026-05-18T11:40:12Z).
   ```
5. `approve & register` → `shared/campaign-hero-v1.png` が原本に復元、patch JSON も正しい `meta.inboxSource` に更新
6. 検証:
   ```bash
   stat -f '%z' assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png
   # → 1331047 bytes に戻ること
   ```

#### B. substack-inline-reader-system-v1 を承認

1. asset filter: `substack-inline-reader-system-v1`
2. candidate selector: **`substack-inline-reader-system-v1/v001.png`** (1,297,423 bytes)
3. reviewNotes:
   ```
   v001 (japanese-editorial-v1), Reader-list funnel layout, 
   Japanese-first 12+ labels, 8+ icons, reader outcome banner.
   Self-rubric 35/35. Working pipeline acceptance line 24/35 cleared.
   Approved after recovery of substack-header-v1 mis-mapping.
   ```
4. `approve & register` → 新規 final + patch
5. 検証:
   ```bash
   ls -la assets/visuals/building-hitori-media-os/substack/inline/substack-inline-reader-system-v1.png
   # → 新規 1,297,423 bytes
   ls -la patches/visual-assets/building-hitori-media-os/substack-inline-reader-system-v1.json
   # → 新規 patch JSON
   ```

### Step D-verify: dry-run 再実行

```bash
npm run publish:package -- building-hitori-media-os --dry-run
```

期待:
- `substack` の TODO `source image missing for substack-inline-reader-system-v1.png` が消える
- `substack` の copied リストに `substack-inline-reader-system-v1.png` が現れる（または既存と判定）
- `shared/campaign-hero-v1.png` が 1,331,047 bytes に戻った状態で processing される

### Step E: Sanity Studio 反映（boss 手動）

§9 のチェックリストに従って 9 record 更新。

### Step F: publish-package actual

Sanity 反映後、`assets/visuals/...` が正しい状態であることを確認してから:

```bash
npm run publish:package -- building-hitori-media-os
```

### Step G: release-review markdown 更新 + final-human-checklist 署名

[docs/handoff/0126 §11](0126-working-pipeline-completion-plan.md#11-release-review-checklist-updates) に従う。

## 13. Risks / Uncertainties

- `publish-packages/.../campaign-hero-v1.png` (各 1,331,047 bytes、original) が前回 publish 時のままなので、publish-package actual を実行すると `replacePlaceholderPackage` が **wrong content の master で上書きする可能性**。**recovery 完了まで publish-package actual を走らせない**。
- review-manifest.json の entry #6（substack-header-v1 として誤登録）は Visual Register が `approve & register` を再実行した時点で同じ asset slot の entry が **同じ relativePath で update** される挙動（Visual Register の `handleInboxApproveAndRegister` 実装）。今回は relativePath が `substack-inline-reader-system-v1/v001.png` と特殊なので、recovery で `note-hero-v1/v001.png` を select すると **new entry が追加** されて、entry #6 が古いまま残る可能性。manifest は append-only history なので OK だが、**最終 finalAssetPath は最新 entry が決める**。後で manifest を読むツール（dashboard / Visual Register 自身）の動作確認が望ましい。
- candidate PNG (v00N.png) は **全件 byte-identical で保存** されている。今回の事故は final asset / patch / manifest にのみ影響、candidate 自体は無事。

## 14. Human Review Questions

- recovery を Visual Register UI で 2 件再 approve する方針で OK か？（boss の手動操作になる）
- recovery 前に **正常 4 件分の Sanity 反映を先行する** か、それとも recovery 完了 → 9 record 一括反映するか？（後者が docs 上は clean）
- review-manifest.json の entry #6（誤った mapping の履歴）を **そのまま履歴として残す** か、それとも boss が手動で entry を削除 / 修正するか？（履歴として残す方が build-in-public 的に有用）
- Visual Register UI 側で「同一 final path を複数 asset が指す場合、明示的な確認 dialog を出す」改修を Phase 2B 想定の dashboard write 解禁前に入れるか？
- 本 batch 後の Step E (Sanity 反映) も Claude Code が verify-only で行うか、boss が直接 Sanity Studio で実行するか？

## 15. Validation runs

実行結果（2026-05-18 JST）:

- `npm run local:check`: **17 ok / 0 fail**
- root `npm run build`（Sanity Studio）: **green** (7956ms)
- `cd dashboard && npm run build`: **green**（12 page route + 5 API route + Proxy middleware、Phase 2A-1 routes 不変）
- publish-package dry-run exit code: **0**, JSON `ok: true`
- direct Sanity write grep: **0 hits**
- paid LLM / image API SDK grep: **0 hits**
- 新規 package: **0**
- 既存 candidate PNG 編集 / 削除 / 上書き: **0**（10 件全て byte-identical）

## 16. Exact Next Prompt

### Option A: boss が Visual Register で recovery 完了したことを Claude Code に検証させる

```text
Verify Visual Register recovery for substack-header-v1 + substack-inline-reader-system-v1.

Boss completed Visual Register recovery:
1. Re-approved substack-header-v1 with note-hero-v1/v001.png as source
   (to restore the master shared campaign-hero-v1.png).
2. Approved substack-inline-reader-system-v1 with its own v001.png
   (to create the missing final asset + patch).

Hard Rules:
- Do NOT write to Sanity.
- Do NOT manually create patch JSON.
- Do NOT manually copy final assets.
- Do NOT overwrite existing files.
- Do NOT deploy.
- Do NOT run publish-package actual yet.
- Only verify and document results.

Tasks:
1. Confirm assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png
   is 1,331,047 bytes (original).
2. Confirm assets/visuals/.../substack/inline/substack-inline-reader-system-v1.png
   exists with the inbox v001.png content.
3. Confirm patches/visual-assets/building-hitori-media-os/substack-header-v1.json
   meta.inboxSource is now note-hero-v1/v001.png.
4. Confirm patches/visual-assets/.../substack-inline-reader-system-v1.json
   exists with correct fields.
5. Confirm review-manifest.json has both entries with correct mappings.
6. Run publish-package dry-run again, confirm no TODOs for substack-inline-reader-system-v1
   and no warnings about wrong hero.
7. Create docs/devlog/0117-* and docs/handoff/0128-*.
```

### Option B: 正常 4 件のみ Sanity 反映（boss 手動）

```text
Boss has completed Sanity Studio manual update for the 4 cleanly approved records:
- note-inline-content-os-flow-v1
- threads-support-diagram-v1
- note-inline-human-judgment-v1
- note-hero-v1 (but note: shared master file is currently corrupt; do not update
  localAssetPath until recovery is done — only update reviewNotes for now)

Verify Sanity dataset reflects the 4 records. Hold substack-header-v1 +
substack-inline-reader-system-v1 + 2 skipped records until recovery.
```

## 17. Is the Visual Register approve & register step complete?

**No (incomplete due to 1 mis-mapping):**

- 4 件正常承認: note-inline-content-os-flow-v1 v004 / threads-support-diagram-v1 v004 / note-inline-human-judgment-v1 v001 / note-hero-v1 (既存)
- 1 件 mis-mapping: substack-header-v1 (wrong source) → master overwritten
- 1 件未承認: substack-inline-reader-system-v1 (副作用で漏れ)

**Recovery completion 後に Working Pipeline Step D 完了とみなす**。

## 18. 連番について

- docs: 67 → **(未追加、本 batch では new docs/ 番号なし)**
- devlog: 0115 → **0116**
- handoff: 0126 → **0127**
