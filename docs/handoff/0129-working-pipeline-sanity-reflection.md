# Handoff: Working Pipeline Step E — Sanity Reflection (dry-run clean, execute blocked on write-token)

Date: 2026-05-18
Status: **script-built / dry-run-verified / execute-blocked on missing SANITY_WRITE_TOKEN / 0 Sanity write / 0 publish actual / 0 deploy**

## 1. Task Goal

Working Pipeline Step E（Sanity 反映 9 record）を boss の手動 Sanity Studio 操作なしで実行できる **controlled 自動化 tool** を投入。dry-run で計画通り（9 record / 7 saved + 2 skipped / 他 touch 0）を確認、ただし `--execute` は安全機構（`SANITY_WRITE_TOKEN` 必須）により block されたため Sanity 自体は未書き込み。boss が write token を `.env.local` に追加した時点で `--execute` 再実行で完走可能。

## 2. Constraints Followed

- Sanity write 実行: **0**（execute は token 不在で abort）
- `npx sanity dataset import` / `--replace`: **未使用**
- contentIdea / campaignPlan / promptTemplate / visualStyleProfile / brandProfile: **touch 0**
- assets/visuals / patches / publish-packages: **不変**（read のみ）
- publish-package actual: **0**
- deploy: **0**
- 環境変数変更（書き込み）: **0**（読み取りのみ）
- 新規 npm package: **0**
- paid API integration: **0**
- patch/update operations only: ✓（atomic transaction、`tx.patch(...).set(...).unset(...)`）
- dry-run default + `--execute` opt-in: ✓
- allowlist of exactly 9 doc _id: ✓ hardcoded
- 全 target doc の `_type === 'visualAssetPlan'` 検証: ✓
- token print: **0**（`(present, N chars)` 表記のみ）

## 3. Changed Files

### Added — `tools/sanity/`

- `tools/sanity/reflect-working-pipeline-visual-assets.mjs` — controlled Sanity reflection tool (~350 行)

### Added — `docs/`

- `docs/devlog/0118-working-pipeline-sanity-reflection.md`
- `docs/handoff/0129-working-pipeline-sanity-reflection.md`（本ファイル）

### Modified — `docs/`

- `docs/handoff/latest.md`（本 0129 のミラー）

### Confirmed unchanged

- `tools/visual-register/server.mjs`, `tools/visual-register/recover-working-pipeline-step-d.mjs`, `tools/publish-package-builder/`, `tools/local-check.mjs`
- schemas / sanity.config / structure / dashboard runtime
- assets/visuals / patches / inbox / seed / outputs / publish-packages / private
- root + dashboard `package.json` / `package-lock.json`
- Sanity dataset (**書き込み 0**)
- Vercel project / DNS / production env vars / deploy

## 4. Script path

`tools/sanity/reflect-working-pipeline-visual-assets.mjs`

### Usage

```bash
# Dry-run (default)
node tools/sanity/reflect-working-pipeline-visual-assets.mjs --dry-run

# Execute (requires SANITY_WRITE_TOKEN in .env.local)
node tools/sanity/reflect-working-pipeline-visual-assets.mjs --execute
```

### Safety architecture (4 層)

| 層 | 内容 |
| --- | --- |
| 1. allowlist | 9 _id hardcoded。GROQ broad query 不使用 |
| 2. dry-run default | `--execute` opt-in でないと write しない |
| 3. token required | `SANITY_WRITE_TOKEN` env 不在で `--execute` を abort |
| 4. atomic transaction | 9 patch を 1 commit。途中失敗なら all-or-nothing |

### Pre-write validations

- 6 local final PNG existence + 2 critical byte 一致
- 7 patch JSON の `set.localAssetPath` / `set.status: saved` / `meta.directSanityWrite: false`
- 9 Sanity doc の `_type === 'visualAssetPlan'`

これらの 1 つでも fail なら write を abort。

## 5. Dry-run result

```
node tools/sanity/reflect-working-pipeline-visual-assets.mjs --dry-run
```

### Summary

| 項目 | 値 |
| --- | --- |
| Sanity project | 5f79ed6q |
| Sanity dataset | production |
| Sanity apiVersion | 2025-08-15 |
| Read token | (present, 180 chars) |
| Write token | (not present) |
| Mode | DRY-RUN |
| Documents planned | **9** |
| Saved | **7** |
| Skipped | **2** |
| Other docs touched | **0** |
| Local PNG verification | **6/6 PASS** |
| Critical byte check | **2/2 PASS** (shared/campaign-hero-v1.png = 1,331,047, substack-inline-reader-system-v1.png = 1,297,423) |
| Patch JSON verification | **7/7 PASS** |
| Sanity preflight (`_type === visualAssetPlan` × 9) | **9/9 PASS** |

### Planned field changes

| _id | status (before → after) | localAssetPath | reviewNotes | updatedAt |
| --- | --- | --- | --- | --- |
| note-hero-v1 | `saved` → `saved` (no-op) | (unchanged) | replaced | new ISO |
| substack-header-v1 | `saved` → `saved` (no-op) | (unchanged) | replaced | new ISO |
| x-hook-main-v1 | `saved` → `saved` (no-op) | (unchanged) | replaced | new ISO |
| threads-support-diagram-v1 | `brief-ready` → `saved` | `""` → `assets/.../threads-support-diagram-v1.png` | replaced | new ISO |
| note-inline-content-os-flow-v1 | `brief-ready` → `saved` | `""` → `assets/.../note-inline-content-os-flow-v1.png` | replaced | new ISO |
| note-inline-human-judgment-v1 | `brief-ready` → `saved` | `""` → `assets/.../note-inline-human-judgment-v1.png` | replaced | new ISO |
| substack-inline-reader-system-v1 | `brief-ready` → `saved` | `""` → `assets/.../substack-inline-reader-system-v1.png` | replaced | new ISO |
| note-inline-manual-vs-automation-v1 | `brief-ready` → `skipped` | (unchanged, stays `""`) | replaced | new ISO |
| note-inline-publish-package-folder-v1 | `brief-ready` → `skipped` | (unchanged, stays `""`) | replaced | new ISO |

`updatedAt` は既存 record が `2026-05-14T00:00:00.000Z` を持っていることを検知して、schema convention に合わせて新 ISO timestamp を書く動的処理。

## 6. Execute result

```
node tools/sanity/reflect-working-pipeline-visual-assets.mjs --execute
```

### Outcome: **BLOCKED — Sanity write 0 件**

```
FATAL: SANITY_WRITE_TOKEN is required for --execute mode and is not present.
```

→ exit code 1, abort before any Sanity API call.

### Why blocked

`.env.local` (repo root) には現在 `SANITY_STUDIO_PROJECT_ID` と `SANITY_STUDIO_DATASET` のみ。`dashboard/.env.local` には `NEXT_PUBLIC_SANITY_*` と `SANITY_READ_TOKEN`（180 chars、read-only token）のみ。**write token は存在しない**。

これは hard rule "do not write if SANITY_WRITE_TOKEN or equivalent is missing; explain what is needed" を script が正しく実装した結果。

## 7. Sanity records updated

**0 件**（execute abort のため）。

dry-run 時点で **正確な計画** が確認できているので、boss が write token を追加すれば `--execute` で 9 record すべて atomic commit される。

## 8. Post-write verification result

**未実施**（execute 自体が abort されたため）。

`--execute` 完了後、script は自動で post-write verification を走らせる仕様:

- 9 doc を re-fetch
- 各 doc の `status` / `localAssetPath` / `reviewNotes` / `updatedAt` が exactly expected に一致するか確認
- 1 件でも mismatch なら FATAL + exit code 1（rollback は実行しないが、boss にずれを明示）

## 9. publish-package dry-run result

```
npm run publish:package -- building-hitori-media-os --dry-run
```

exit 0, `ok: true`, `dryRun: true`。Step D 復旧完了状態のまま:

| Platform | copied | TODOs | 状態 |
| --- | --- | --- | --- |
| note | 2 (note-inline-content-os-flow-v1, note-inline-human-judgment-v1) | 2 (skipped 記録分、仕様) | ✅ |
| x | 0 (既存) | — | ✅ |
| substack | 1 (substack-inline-reader-system-v1) | — | ✅ |
| threads | 1 (threads-support-diagram-v1) | — | ✅ |

→ Sanity 未更新だが、publish-package script は patch JSON / filesystem を読むので、Sanity 反映前でも dry-run 結果は変わらない。actual を走らせれば 4 platform 分の image + text が配布される。**ただし Sanity 反映前に actual を走らせるのは推奨しない** — Sanity と filesystem の整合が崩れた状態で配布物が出ると、後の追跡が複雑化する。

## 10. Validation Results

| Check | Result |
| --- | --- |
| `npm run local:check` | **15 ok / 1 fail** (新 controlled Sanity write tool が "no direct Sanity write code paths in local tools" policy に flag される — **意図的 exception**、§13 で詳細) |
| root `npm run build`（Sanity Studio） | **green** (8124ms) |
| `cd dashboard && npm run build` | **green**（既存 routes 不変、12 page route + 5 API route + Proxy） |
| publish-package dry-run | exit 0, `ok: true` |
| publish-package actual | **未実行** |
| Sanity write 実行回数 | **0** |
| token 値 print 回数 | **0** |
| paid LLM/image API SDK grep | **0 hits** |
| 新規 package | **0** |
| 画像生成 / Codex CLI 起動 | **0** |

## 11. Assets / patches confirmation (NOT modified by this batch)

| 確認対象 | 状態 |
| --- | --- |
| `assets/visuals/.../shared/campaign-hero-v1.png` | 1,331,047 bytes（Step D 復旧の正しい状態） |
| `assets/visuals/.../substack/inline/substack-inline-reader-system-v1.png` | 1,297,423 bytes |
| `assets/visuals/.../note/inline/note-inline-content-os-flow-v1.png` | 1,234,240 bytes |
| `assets/visuals/.../note/inline/note-inline-human-judgment-v1.png` | 1,375,682 bytes |
| `assets/visuals/.../threads/support/threads-support-diagram-v1.png` | 1,224,241 bytes |
| `assets/visuals/.../x/hook/x-hook-main-v1.png` | 655,963 bytes |
| backup file（campaign-hero-v1.png.recovery-backup-...）| 1,297,423 bytes（Step D backup、不変） |
| 7 patch JSON 全件 | Step D 復旧後の正しい状態、不変 |
| review-manifest.json | Step D 復旧後の 8 entries、不変 |
| inbox 候補 PNG 12 件 | byte-identical |

## 12. Important Decisions

- **dry-run を default** → 初回 Sanity write batch、roll-back コストが高いので 2 段 gate
- **9 _id allowlist** → broad query 厳禁、cataloged batch update
- **`_type === 'visualAssetPlan'` 検証** → 型 mismatch を安全側で止める
- **atomic transaction** → 途中失敗で半端な state を残さない
- **local 状態の事前検証** → Sanity 更新前に filesystem 実態と整合確認
- **post-write 検証** → write 後に re-fetch して expected と一致確認、mismatch なら fail
- **`updatedAt` を schema convention に dynamic 追随** → 既存 record の field 有無で判定
- **skipped record の `localAssetPath`** → 既存 `""` をそのまま維持（unset 不要、type 維持）
- **token 値 を絶対に log しない** → `(present, N chars)` 表記のみ
- **local:check policy fail を許容**（§13）→ 新 controlled write tool は **意図的例外**、policy 更新は別 batch

## 13. local:check fail について

### 何が fail したか

```
✗ no direct Sanity write code paths in local tools
  — tools/sanity/reflect-working-pipeline-visual-assets.mjs
```

### なぜ fail したか

- 既存 `tools/local-check.mjs` は local tool 内で Sanity client の write メソッド（`client.create / patch / commit / mutate / transaction`）を使う code path を **policy violation として grep 検出**。
- 旧 phase（Phase Admin 0 / 1 / 2A）では「local tool は Sanity に書かない」が正しい safety model だった。
- 本 batch は **boss の明示的指示** で controlled Sanity write tool を投入。これは旧 policy の **意図された例外**。

### なぜ "expected exception" として許容するか

新 tool は以下のすべてを満たし、ad-hoc Sanity write とは質的に異なる:

| Safety property | 新 tool | ad-hoc tool（policy が想定する危険例） |
| --- | --- | --- |
| document allowlist | 9 _id hardcoded | broad GROQ query |
| dry-run gate | default | なし |
| --execute opt-in | 必須 | なし |
| token 必須 | env check + abort | token 無くても書く |
| _type 検証 | 全 doc 検証 | 検証なし |
| atomic transaction | 9 patch を 1 commit | 1 件ずつ |
| post-write verification | 自動 re-fetch + diff | なし |
| log policy | token を絶対 print しない | print する可能性 |

### どう扱うか

| 選択肢 | 評価 |
| --- | --- |
| (A) 何もしない、fail は signal として受容 | ✅ **本 batch の選択**。最小 scope、policy intent を docs で明示 |
| (B) local-check.mjs に新 tool を allowlist で追加 | 別 batch、policy 改修 |
| (C) 新 tool を policy が誤検出しないよう refactor（grep を avoid） | 不健全、隠す目的の変更は反対 |
| (D) 新 tool を削除し、boss が Sanity Studio で手動更新 | 本 batch の目的に反する |

→ **A を選択**。boss が後で policy intent を整理したいなら別 batch で B。

## 14. Human Review Questions

- `SANITY_WRITE_TOKEN` を生成 + `.env.local` に追記して `--execute` 再実行する手順を進めるか？
  - 手順: handoff §15 の "Next exact step" 参照
- それとも本 batch では Sanity 反映を **deferred** にし、別 phase で改めて考えるか？
- `local-check.mjs` に本 tool を allowlist で組み込む policy 改修を **別 batch** で行うか？
- write token を `.env.local` に追加した後、誰が `--execute` を走らせるか？（boss 自身 / Claude Code に依頼）
- post-write verification の expected mismatch（例: `updatedAt` が race 条件で一致しない等）への対応方針

## 15. Next exact step

### Sanity write token を準備 → --execute

```
1. https://www.sanity.io/manage を開く
2. Project ID `5f79ed6q` を選択
3. API → Tokens → Add API token
4. 名前: "working-pipeline-step-e-reflect" (推奨、識別可能であれば何でも)
5. Permission: **Editor** (visualAssetPlan patch には十分)
6. "Save" を押す
7. 表示された token を copy（1 度しか見えない）
8. .env.local at repo root を開いて以下を追記:
   SANITY_WRITE_TOKEN=<paste token here>
9. Save .env.local
10. ターミナルで再実行:
    cd /Users/sugawaratakuya/Documents/POTA_Empire/10_Development/sanity-ai-content-os
    node tools/sanity/reflect-working-pipeline-visual-assets.mjs --dry-run
    (output が同じであることを確認)
    node tools/sanity/reflect-working-pipeline-visual-assets.mjs --execute
11. Script が以下を完了するのを観察:
    - 9 patch atomic commit
    - transactionId / documentIds 出力
    - post-write verification 9/9 PASS
12. dashboard /visual-assets を開いて 9 record の listing を目視確認
```

### 完了後の Step F / G

```
F. publish-package actual 実行:
   npm run publish:package -- building-hitori-media-os

G. release-review 5 markdown 更新 + final-human-checklist.md 署名
   (docs/handoff/0126 §11 参照)
```

## 16. Exact Next Prompt（write token 準備後）

```text
Execute Working Pipeline Step E Sanity reflection (write token now present).

Hard Rules:
- Do NOT modify the recover/reflect scripts.
- Do NOT manually edit Sanity documents outside the 9-record allowlist.
- Do NOT run publish-package actual yet.
- Do NOT deploy.
- Use only the existing tool: tools/sanity/reflect-working-pipeline-visual-assets.mjs
- Verify post-write before reporting success.

Tasks:
1. Re-run dry-run, confirm output matches handoff/0129 §5 exactly.
2. Run --execute.
3. Confirm 9/9 post-write verification PASS.
4. Open Sanity Studio (or fetch via @sanity/client) and confirm 9 records updated.
5. Run publish-package dry-run again, confirm no change to copy plan vs handoff/0129 §9.
6. Create docs/devlog/0119-* and docs/handoff/0130-*.

Do NOT proceed to publish-package actual yet — that is Step F (next batch).
```

## 17. Is Step E complete?

**No (not yet — execute blocked).**

| 条件 | 状態 |
| --- | --- |
| reflection script 完成 | ✅ |
| dry-run 結果が正しい（9 record / 7 saved + 2 skipped） | ✅ |
| local 状態と patch JSON が Sanity 更新可能な整合 | ✅ |
| Sanity 9 record が `saved` / `skipped` で反映済 | ❌ (blocked、token absent) |
| post-write verification 9/9 PASS | ❌ (blocked、未実行) |

→ boss が **`SANITY_WRITE_TOKEN` を `.env.local` に追加** → `--execute` 再実行 → 全項目 ✅ で Step E 完了。

## 18. Recommended Next Step

### Immediate (this batch)

本 batch を commit + push:

```bash
cd /Users/sugawaratakuya/Documents/POTA_Empire/10_Development/sanity-ai-content-os

git status --short

git add tools/sanity/reflect-working-pipeline-visual-assets.mjs \
        docs/devlog/0118-working-pipeline-sanity-reflection.md \
        docs/handoff/0129-working-pipeline-sanity-reflection.md \
        docs/handoff/latest.md

git diff --staged --stat
git commit -m "tools: controlled sanity reflection script for working pipeline step E"
git push
```

### Next Implementation Batch — Step E execute (after write token)

boss が write token を `.env.local` に追加した後、Claude Code に §16 の prompt を渡す。

### Deferred (permanent)

- paid LLM / image API integration
- auto-posting
- AI auto-approval
- multi-user collaboration
- billing / paid tier

## 19. 連番について

- docs: 67 → **(no new docs/ this batch)** (Auth migration design は引き続き保留)
- devlog: 0117 → **0118**
- handoff: 0128 → **0129**
