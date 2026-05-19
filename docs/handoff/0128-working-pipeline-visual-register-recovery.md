# Handoff: Working Pipeline Step D Recovery — Scripted re-approve via replicated Visual Register logic

Date: 2026-05-18
Status: **recovery-executed / 2-of-2 ops succeeded / byte-identical to expected / backup created / publish-package dry-run clean / 0 Sanity write / 0 deploy / Step D complete**

## 1. Task Goal

[docs/handoff/0127](0127-working-pipeline-visual-register-approval.md) で検出した Visual Register UI mis-mapping issue (a: shared master overwritten / b: substack-inline-reader-system-v1 unregistered) を、**boss の手動 UI 操作なしで自動 recover**。Visual Register `server.mjs` の `handleInboxApproveAndRegister` ロジックを byte-structurally-identical で replicate した one-off スクリプトを実行。

## 2. Constraints Followed

- Sanity write: **0**
- publish-package actual: **0**（dry-run のみ）
- deploy: **0**
- production env vars 変更: **0**
- 新規 npm package: **0**
- paid API integration: **0**
- 既存 inbox 候補 PNG (v00N) 編集: **0**（10 件全 byte-identical）
- 触ったのは **2 documented recovery targets + 2 patch JSON + 1 manifest + 1 backup file のみ**
- `tools/visual-register/server.mjs` の編集: **0**（recovery script は別ファイルとして新規）
- 関係ない asset への touch: **0**

## 3. Visual Register code path inspected

- File: `tools/visual-register/server.mjs`
- Target function: `handleInboxApproveAndRegister` (lines 550-648)
- **server.mjs に export なし** → 直接 import 不可
- Helper functions (all module-local):
  - `slugify`, `contentSlugFromPlan`, `assetNameFromPlan`, `placementSlug`
  - `normalizeRelativePath`, `safeProjectPath`, `isInsideInbox`, `safeInboxPath`
  - `slugFromInboxRelativePath`, `expectedAssetPath`, `patchPathFor`
  - `imageMimeFromExt`, `discoverCampaignSeedFiles`, `loadPlans`
  - `loadInboxManifest`, `saveInboxManifest`

→ **Decision: replicate logic verbatim** in new file (no server.mjs modification).

## 4. Reusable logic strategy

- **Replicated**, not refactored. Reason: server.mjs is a running script (no exports), and refactoring it to export helpers is a separate change set best done in its own batch. Recovery prefers minimal scope.
- **Patch JSON shape, field order, terminator `\n`** all match server.mjs exactly:
  - `_id` → `set { localAssetPath, status, updatedAt, reviewNotes }` → `meta { generatedBy, inboxSource, originalFileName, mimeType, directSanityWrite }`
  - `JSON.stringify(patch, null, 2) + '\n'`
- **review-manifest entry shape** matches server.mjs `handleInboxApproveAndRegister`:
  - `{ relativePath, fileName, suggestedAssetPlanId, reviewStatus: 'registered', reviewNotes, finalAssetPath, patchPath, registeredAt, createdAt, updatedAt }`
- **Only meta.generatedBy differs intentionally**: server.mjs uses `tools/visual-register/inbox`, recovery script uses `tools/visual-register/recover-working-pipeline-step-d.mjs` for **traceability** (future audits can identify recovery-generated patches).
- **Manifest strategy added** (recovery-specific): 2 modes selectable per operation:
  - `replace-by-relative-path` (Visual Register default)
  - `append-new` (used by op A for master sharing: same candidate approved under multiple plans)

## 5. Dry-run result

```
node tools/visual-register/recover-working-pipeline-step-d.mjs --dry-run
```

| Op | source | source bytes | target plan | target path | patch path | backup planned | manifest strategy |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A | `note-hero-v1/v001.png` | 1,331,047 ✓ | substack-header-v1 | `shared/campaign-hero-v1.png` | `substack-header-v1.json` | yes (existing target = 1,297,423) | append-new |
| B | `substack-inline-reader-system-v1/v001.png` | 1,297,423 ✓ | substack-inline-reader-system-v1 | `substack/inline/substack-inline-reader-system-v1.png` | `substack-inline-reader-system-v1.json` | none (target did not exist) | replace-by-relative-path |

All checks passed. **Source byte sizes matched expected; target paths derived correctly from seed; patch paths correct; no other writes planned.**

## 6. Execute result

```
node tools/visual-register/recover-working-pipeline-step-d.mjs --execute
```

### Op A (substack-header-v1 master restore)

- ✓ `backup`: `assets/visuals/.../shared/campaign-hero-v1.png.recovery-backup-2026-05-18T12-01-45-584Z` (1,297,423 bytes)
- ✓ `overwrite-final`: `assets/visuals/.../shared/campaign-hero-v1.png` (1,297,423 → **1,331,047 bytes**)
- ✓ `overwrite-patch`: `patches/visual-assets/.../substack-header-v1.json` (meta.inboxSource now `note-hero-v1/v001.png`)
- ✓ `manifest-append-entry`: entry[7] (master sharing mapping appended; entry[1] preserved)
- ✓ `manifest-saved`
- ✓ target byte size: **1,331,047** (matches expected)

### Op B (substack-inline-reader-system-v1 register)

- ✓ `create-final`: `assets/visuals/.../substack/inline/substack-inline-reader-system-v1.png` (NEW, **1,297,423 bytes**)
- ✓ `create-patch`: `patches/visual-assets/.../substack-inline-reader-system-v1.json` (NEW)
- ✓ `manifest-replace-entry`: entry[5] (suggestedAssetPlanId: substack-header-v1 → **substack-inline-reader-system-v1**, createdAt preserved)
- ✓ `manifest-saved`
- ✓ target byte size: **1,297,423** (matches expected)

## 7. Backup path created

```
assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png.recovery-backup-2026-05-18T12-01-45-584Z
  size: 1,297,423 bytes
  content: substack-inline-reader-system-v1/v001.png (the wrong overwrite from previous UI session)
```

→ Preserved as forensic evidence of the original mis-mapping. Safe to delete after Sanity reflection completes if disk space matters.

## 8. Final asset paths (post-recovery)

| Path | bytes | 状態 |
| --- | --- | --- |
| `assets/visuals/.../shared/campaign-hero-v1.png` | **1,331,047** | ✅ RESTORED to original |
| `assets/visuals/.../shared/campaign-hero-v1.png.recovery-backup-...` | 1,297,423 | NEW backup |
| `assets/visuals/.../substack/inline/substack-inline-reader-system-v1.png` | **1,297,423** | ✅ NEW |
| `assets/visuals/.../note/inline/note-inline-content-os-flow-v1.png` | 1,234,240 | unchanged |
| `assets/visuals/.../note/inline/note-inline-human-judgment-v1.png` | 1,375,682 | unchanged |
| `assets/visuals/.../threads/support/threads-support-diagram-v1.png` | 1,224,241 | unchanged |
| `assets/visuals/.../x/hook/x-hook-main-v1.png` | 655,963 | unchanged |

## 9. Patch JSON paths (post-recovery)

| Patch | bytes | meta.inboxSource | 状態 |
| --- | --- | --- | --- |
| `patches/.../note-hero-v1.json` | 1,031 | `note-hero-v1/v001.png` | unchanged (existing, correct) |
| `patches/.../substack-header-v1.json` | **1,117** | **`note-hero-v1/v001.png`** ✓ | OVERWRITTEN (fixed) |
| `patches/.../substack-inline-reader-system-v1.json` | **1,072** | `substack-inline-reader-system-v1/v001.png` ✓ | **NEW** |
| `patches/.../x-hook-main-v1.json` | 696 | (existing, correct) | unchanged |
| `patches/.../note-inline-content-os-flow-v1.json` | 871 | `note-inline-content-os-flow-v1/v004.png` | unchanged |
| `patches/.../note-inline-human-judgment-v1.json` | 814 | `note-inline-human-judgment-v1/v001.png` | unchanged |
| `patches/.../threads-support-diagram-v1.json` | 813 | `threads-support-diagram-v1/v004.png` | unchanged |

All 7 patches now correct. Each contains:
- `set.localAssetPath`: 正しい final path
- `set.status`: `saved`
- `meta.directSanityWrite`: `false`
- `meta.inboxSource`: 正しい source

## 10. Manifest status (post-recovery)

`assets/inbox/generated/building-hitori-media-os/review-manifest.json`:

- Total entries: **8** (was 7)
- All entries: `reviewStatus: registered`
- updatedAt: 2026-05-18T12:01:45.593Z

| # | candidate | → plan | 状態 |
| --- | --- | --- | --- |
| 0 | note-hero-v1-attempt-1.png | note-hero-v1 | unchanged |
| 1 | note-hero-v1/v001.png | note-hero-v1 | unchanged (preserved by append strategy) |
| 2 | x-hook-main-v1/v001.png | x-hook-main-v1 | unchanged |
| 3 | note-inline-content-os-flow-v1/v004.png | note-inline-content-os-flow-v1 | unchanged |
| 4 | threads-support-diagram-v1/v004.png | threads-support-diagram-v1 | unchanged |
| 5 | substack-inline-reader-system-v1/v001.png | **substack-inline-reader-system-v1** | **FIXED** (was substack-header-v1) |
| 6 | note-inline-human-judgment-v1/v001.png | note-inline-human-judgment-v1 | unchanged |
| 7 | note-hero-v1/v001.png | **substack-header-v1** | **NEW** (master sharing mapping) |

## 11. publish-package dry-run result

```
npm run publish:package -- building-hitori-media-os --dry-run
```

`ok: true`, `dryRun: true`, exit 0.

| Platform | copied (new) | replaced | TODOs | warnings |
| --- | --- | --- | --- | --- |
| **note** | 2 (note-inline-content-os-flow-v1, note-inline-human-judgment-v1) | 0 | 2× missing source for skipped records (仕様) | — |
| **x** | 0 (x-hook-main-v1 already in publish-packages) | 0 | — | — |
| **substack** | **1 (substack-inline-reader-system-v1)** ← 解決 | 0 | — ← **previous TODO is now gone** | — |
| **threads** | 1 (threads-support-diagram-v1) | 0 | — | — |
| podcast / shorts / youtube | drafts ready | 0 | — | — |
| instagram / github | drafts missing (仕様) | 0 | — | "No draft source dir configured" |

→ 前回 dry-run の `TODO: source image missing for substack-inline-reader-system-v1.png` が **消滅**。campaign-hero-v1 上書き問題も解消。

## 12. Sanity write confirmation

- Total Sanity API calls this batch: **0**
- Total Sanity `client.create / patch / commit / mutate / transaction` invocations: **0**
- Total dataset modifications: **0**
- `meta.directSanityWrite: false` confirmed in all 2 generated patches

## 13. Validation Results

実行結果（2026-05-18 JST）:

| Check | Result |
| --- | --- |
| `npm run local:check` | **17 ok / 0 fail** |
| root `npm run build`（Sanity Studio） | **green** (7894ms) |
| `cd dashboard && npm run build` | **green**（既存 routes 不変） |
| publish-package dry-run | exit 0, `ok: true`, no missing-source TODO for substack-inline-reader-system-v1 |
| publish-package actual | **未実行** (Sanity 反映後に boss が実行) |
| direct Sanity write grep | **0 hits**（本 batch のコード新規追加にも該当なし） |
| paid LLM / image API SDK grep | **0 hits** |
| 新規 package | **0** |
| 候補 PNG (v00N) 編集 | **0**（10 件全 byte-identical） |
| Visual Register server.mjs 編集 | **0** |

## 14. Is Step D now complete?

**Yes — Working Pipeline Step D is COMPLETE.**

- ✅ 7 visualAssetPlan の final asset が assets/visuals/ に揃っている
- ✅ 7 patch JSON が揃っており全件 `meta.directSanityWrite: false`、`set.status: saved`、正しい `localAssetPath` / `meta.inboxSource`
- ✅ review-manifest に 8 entries、全 `registered`、wrong mapping 修正済、master sharing 用 append 追加
- ✅ publish-package dry-run で priority 4 platform 全 clean (1 TODO は skipped 仕様)
- ✅ shared/campaign-hero-v1.png が原本 (1,331,047 bytes) に restore
- ✅ backup ファイルが forensic 用に残っている
- ✅ Sanity write 0、deploy 0、production 影響 0

→ 次は **Step E: Sanity Studio 反映 (boss 手動)**。

## 15. Next exact step: Sanity Studio manual reflection (Step E)

boss が Sanity Studio で **9 record × 4 fields** を手動更新。チェックリストは [docs/handoff/0127 §9](0127-working-pipeline-visual-register-approval.md#9-sanity-manual-reflection-checklist-recovery-完了後) を参照。

**注意**: handoff/0127 §9 の reviewNotes 案は recovery 完了前を想定した文言。recovery 完了済の今、以下を反映:

| _id | status | localAssetPath | reviewNotes（recovery 完了後の文言案） |
| --- | --- | --- | --- |
| visualAssetPlan.building-hitori-media-os.note-hero-v1 | `saved` | `assets/visuals/.../shared/campaign-hero-v1.png` | "Master shared with substack-header-v1. Approved 2026-05-14 by Visual Register UI. Master file preserved after 2026-05-18 recovery." |
| visualAssetPlan.building-hitori-media-os.substack-header-v1 | `saved` | `assets/visuals/.../shared/campaign-hero-v1.png` | "Master sharing with note-hero-v1. Re-approved 2026-05-18 via scripted recovery (tools/visual-register/recover-working-pipeline-step-d.mjs) after initial UI mis-selection on 2026-05-18T11:40. See docs/handoff/0128." |
| visualAssetPlan.building-hitori-media-os.x-hook-main-v1 | `saved` | `assets/visuals/.../x/hook/x-hook-main-v1.png` | "Hook image v1, approved 2026-05-14." |
| visualAssetPlan.building-hitori-media-os.threads-support-diagram-v1 | `saved` | `assets/visuals/.../threads/support/threads-support-diagram-v1.png` | "v004 (japanese-editorial-v1), Problem-to-system 3-band portrait. Self-rubric 35/35. Approved 2026-05-18." |
| visualAssetPlan.building-hitori-media-os.note-inline-content-os-flow-v1 | `saved` | `assets/visuals/.../note/inline/note-inline-content-os-flow-v1.png` | "v004 (japanese-editorial-v1), Before/After + Pipeline. Self-rubric 35/35. Approved 2026-05-18." |
| visualAssetPlan.building-hitori-media-os.note-inline-human-judgment-v1 | `saved` | `assets/visuals/.../note/inline/note-inline-human-judgment-v1.png` | "v001 (japanese-editorial-v1), Human review journey 3-section. Self-rubric 35/35. Approved 2026-05-18." |
| visualAssetPlan.building-hitori-media-os.substack-inline-reader-system-v1 | `saved` | `assets/visuals/.../substack/inline/substack-inline-reader-system-v1.png` | "v001 (japanese-editorial-v1), Reader-list funnel. Self-rubric 35/35. Approved 2026-05-18 via scripted recovery (tools/visual-register/recover-working-pipeline-step-d.mjs). See docs/handoff/0128." |
| visualAssetPlan.building-hitori-media-os.note-inline-manual-vs-automation-v1 | `skipped` | (空) | "本フェーズでは保留、Visual Engine Improvement Phase で再評価。記事は補助図なしで公開可。" |
| visualAssetPlan.building-hitori-media-os.note-inline-publish-package-folder-v1 | `skipped` | (空) | "本フェーズでは保留、Visual Engine Improvement Phase で再評価。記事は補助図なしで公開可。" |

各 record で `updatedAt` を Sanity 更新時の ISO 8601 timestamp に。

更新後の確認:

- Sanity Studio listing で全 9 record の status / localAssetPath 反映済
- dashboard `/visual-assets` listing で Done 7 + Skipped 2 で表示

## 16. Remaining steps to complete Working Pipeline

| Step | Action | Owner |
| --- | --- | --- |
| **Step E** | Sanity Studio で 9 record 手動更新（§15） | **boss 手動** |
| Step F | `npm run publish:package -- building-hitori-media-os` actual 実行 | boss CLI |
| Step F-verify | publish-packages/ の image + text を目視確認、4 platform 揃っているか | boss |
| Step G | release-review 5 markdown 更新（[docs/handoff/0126 §11](0126-working-pipeline-completion-plan.md)） | boss 手動 |
| Step G-final | `final-human-checklist.md` に boss 署名 + 公開予定日 | boss |
| **Step H** | working pipeline complete → 別 batch で Visual Engine Improvement Phase を再評価 | 別 batch |

## 17. Important Decisions

- server.mjs を refactor せず replicate（最小 scope の recovery）
- `--dry-run` を default にして破壊的 operation を 1 命令で実行可能にしない
- byte-identical patch / manifest format（将来の dashboard write 解禁時に同じ shape で処理可能）
- `append-new` strategy を op A に当てる（master sharing 履歴を保持）
- backup ファイル名に ISO 8601 timestamp（collision 回避 + 人間可読）
- `meta.generatedBy` で recovery script 由来を明示（traceability）

## 18. Human Review Questions

- recovery script (`tools/visual-register/recover-working-pipeline-step-d.mjs`) を **commit に含めるか**? 将来再利用する可能性は低いが、build-in-public 素材として残す価値はある
- backup ファイル (`campaign-hero-v1.png.recovery-backup-...`) を **commit に含めるか**? gitignore 対象にする方が clean？
- handoff/0127 § 5 の note-hero-v1 行に「shared master file は currently corrupt; do not update localAssetPath until recovery is done」と書いた warning は今 stale。Sanity 反映時は § 15 の table を見ること
- Visual Register 自体に **「master sharing approve」モード** を追加する将来作業を、Phase 2B (dashboard write 解禁) 設計と合わせて議論するか？
- recovery script を将来 reusable にする (`tools/visual-register/recover.mjs` などに rename + 引数化) かは別 batch 議論

## 19. Recommended Next Step

### Immediate (this batch)

本 batch を commit + push（複数バッチの uncommitted 状態と一緒に整理する判断は boss）:

```bash
cd /Users/sugawaratakuya/Documents/POTA_Empire/10_Development/sanity-ai-content-os

git status --short

# 本 batch で touch されたもの:
# - tools/visual-register/recover-working-pipeline-step-d.mjs (new)
# - docs/devlog/0117-working-pipeline-visual-register-recovery.md (new)
# - docs/handoff/0128-working-pipeline-visual-register-recovery.md (new)
# - docs/handoff/latest.md (modified, mirror of 0128)
# - assets/visuals/.../shared/campaign-hero-v1.png (modified, restored)
# - assets/visuals/.../shared/campaign-hero-v1.png.recovery-backup-... (new)
# - assets/visuals/.../substack/inline/substack-inline-reader-system-v1.png (new)
# - patches/visual-assets/.../substack-header-v1.json (modified)
# - patches/visual-assets/.../substack-inline-reader-system-v1.json (new)
# - assets/inbox/generated/.../review-manifest.json (modified, but inbox dir is currently untracked)

# Stage selectively. Backup ファイルを commit するかは判断分け。
git add docs/devlog/0117-working-pipeline-visual-register-recovery.md \
        docs/handoff/0128-working-pipeline-visual-register-recovery.md \
        docs/handoff/latest.md \
        tools/visual-register/recover-working-pipeline-step-d.mjs

# 必要なら final assets / patches もまとめて
# git add assets/visuals/building-hitori-media-os/ patches/visual-assets/building-hitori-media-os/

git diff --staged --stat
git commit -m "recover: working pipeline step D mis-mapping via replicated visual register logic"
git push
```

### Next Implementation Batch — Step E (Sanity Studio manual reflection)

boss が Sanity Studio で §15 の 9 record × 4 fields を手動更新。Claude Code 介入なし。

完了後、Claude Code に **Step E 検証バッチ** を依頼:
- Sanity dataset を read してdashboard `/visual-assets` listing で 9 record の status / localAssetPath が反映済か確認
- dry-run を再実行して `replacementCandidates` がどう変わるか観察

### Deferred (永続)

- paid LLM / image API integration
- auto-posting
- AI auto-approval
- multi-user collaboration（Phase 2D 以降）
- billing / paid tier

## 20. Exact Next Prompt (Step E verification, after boss completes Sanity Studio update)

```text
Verify Sanity Studio manual reflection results for Working Pipeline Step E.

Boss completed Sanity Studio manual update for 9 visualAssetPlan records per
docs/handoff/0128 §15.

Hard Rules:
- Do NOT write to Sanity.
- Do NOT modify assets/visuals/ / patches/ / review-manifest.
- Do NOT run publish-package actual yet.
- Only verify and document.

Tasks:
1. Read Sanity dataset via /api/visual-review or sanity client read-only:
   - Confirm 7 records have status: saved with correct localAssetPath
   - Confirm 2 records (note-inline-manual-vs-automation-v1,
     note-inline-publish-package-folder-v1) have status: skipped
   - Confirm all updatedAt fields are recent (today's reflection date)
2. Open dashboard /visual-assets and confirm:
   - 7 records appear in "Done" bucket with correct localAssetPath
   - 2 records appear in expected bucket (Other / Skipped depending on implementation)
3. Re-run publish-package --dry-run and confirm:
   - No new TODOs introduced by Sanity changes
   - replacementCandidates list is what we expect
4. Create docs/devlog/0118-* and docs/handoff/0129-*.
```

## 21. 連番について

- docs: 67 → **(no new docs/ this batch)** (Auth migration design は docs/68 候補のまま保留)
- devlog: 0116 → **0117**
- handoff: 0127 → **0128**
