# Handoff: Phase 2C-0 implementation — Raw Idea + Idea Development Package

Date: 2026-05-21

## 1. Task Goal

Phase 2C spec が CONFIRMED 状態に到達 (handoff/0197) → boss が最初の staged sub-batch **Phase 2C-0: Raw Idea → Idea Development Package** の implementation を指示。 dashboard に rough idea を入力する surface + AI 企画化用 prompt package を local filesystem (`idea-jobs/<slug>/...`) に書き出す機能を land。

dashboard は AI を呼ばない、 prompt を作るだけ。 boss が ChatGPT / Claude Code / Codex を手動で実行する分業構造を実装で establish。

完了内容:
- `/ideas` 新規 route — Raw Idea form + preview + execute success panel
- `createIdeaDevelopmentPackage` server action — preview / execute 2 mode + 2 段 env gate + atomic write
- filesystem safety helpers (path allowlist / 拡張子 / size cap / null byte / traversal reject / atomic write)
- prompt builder + suggested CLI command 表示 (codex / claude / pbcopy 3 種、 dashboard は実行しない)
- nav item「アイデア開発」 追加 (Lightbulb icon、 知識 & 分析 group)
- build green、 23 → 24 routes

## 2. Constraints Followed

- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし (本 sub-batch では server action が Sanity を一切触らない)
- ✅ 外部 LLM API client (OpenAI / Anthropic) 追加なし、 API 呼び出しなし
- ✅ Claude Code / Codex を dashboard から spawn / 制御しない
- ✅ shell execution なし (`child_process` / `spawn` / `exec*` 一切なし)
- ✅ `tools/`, `assets/`, `patches/`, `publish-package/` 触らず
- ✅ deploy なし
- ✅ `package.json` (root + dashboard) 追加なし
- ✅ 24 routes すべて build green (23 + `/ideas`)
- ✅ Production writes 永久 disabled (`enableWriteActions` + `enableLocalFsRoutes` の 2 段 env gate)
- ✅ filesystem write は `idea-jobs/` のみ、 `.md` / `.json` のみ、 200 KB cap、 atomic write
- ✅ Token / 本文 を log しない (metadata only)
- ✅ Phase 2B-1 / 2B-2 / 2B-3 / 2B-3.1 動作不変

## 3. Changed Files

### 新規 (5 ファイル)

- [dashboard/src/lib/ideaJobs/paths.ts](dashboard/src/lib/ideaJobs/paths.ts) — filesystem 安全層 (~265 行)
  - `validateIdeaSlug` (lowercase + alphanumeric + hyphen、 length 80 cap)
  - `slugifyTitle` (CJK fallback `idea-<6hex>`)
  - `nowTimestamp` (UTC `YYYYMMDD-HHMMSS`)
  - `buildIdeaJobPaths` (4 path 構築: `_raw.json` / `prompt.md` / `job.json` / `result.md` (expected) / `result.json` (expected))
  - `resolveIdeaJobAbsolutePath` (absolute / `..` / URL encoded / null byte / 拡張子 / `idea-jobs/` prefix check)
  - `atomicWriteIdeaJobFile` (write `<target>.tmp-<rand>` with O_EXCL → `rename`、 mkdir recursive、 200 KB cap)
- [dashboard/src/lib/ideaJobs/promptBuilder.ts](dashboard/src/lib/ideaJobs/promptBuilder.ts) — prompt + job.json + _raw.json render (~280 行)
  - `normaliseRawIdea` (入力検証: roughMemo 4000 chars、 rawTitle / sourceContext / intendedTheme 400 chars、 urgency / relatedProject / ideaSource enum、 platforms 12 max + supported list)
  - `renderPromptPackage` (3 種の text を pure function で生成)
  - `buildSuggestedCommands` (codex / claude / cat-pbcopy 3 種の string、 表示のみ)
- [dashboard/src/lib/actions/createIdeaDevelopmentPackage.ts](dashboard/src/lib/actions/createIdeaDevelopmentPackage.ts) — server action (~190 行)
  - `'use server'`、 preview / execute 2 mode
  - safety layer ordering: input shape → normaliseRawIdea → slug derive + validate → buildIdeaJobPaths → renderPromptPackage → (execute のみ) enableWriteActions → enableLocalFsRoutes → atomic write
  - metadata-only server log (`[createIdeaDevelopmentPackage:start|preview-ok|execute-ok|rejected|write-failed]`)
- [dashboard/src/components/ideas/RawIdeaBuilder.tsx](dashboard/src/components/ideas/RawIdeaBuilder.tsx) — client UI (~370 行)
  - `'use client'`、 form 9 field + preview + execute、 useTransition で pending state
  - PreviewPanel + SuccessPanel + PathRow sub-components
  - CopyButton (既存) を 4 箇所使用: プロンプト本文 / codex / claude / pbcopy ワンライナー
  - `writeReady` / `localFsReady` props で UI disabling
- [dashboard/src/app/ideas/page.tsx](dashboard/src/app/ideas/page.tsx) — route (~80 行)
  - Server Component、 `enableLocalFsRoutes` / `enableWriteActions` を server-side で確認
  - PageHeader (breadcrumb + meta) + 説明カード (Lightbulb icon 付き) + `<RawIdeaBuilder>`

### 更新 (1 ファイル)

- [dashboard/src/lib/navigation.ts](dashboard/src/lib/navigation.ts) — 知識 & 分析 group 冒頭に「アイデア開発」 nav item を追加 (Lightbulb icon、 `/ideas`)

### 触らない

- `schemas/`、 `dashboard/src/lib/sanity*`、 Phase 2B 既存 server action (`updateReactionNotes` / `updateGateState` / `approveVisualCandidate` / `reflectVisualAssetPatch`) すべて touch なし
- `tools/`, `assets/`, `patches/`, `publish-package/`、 `package.json` (root + dashboard) すべて不変

## 4. Build Validation

```
> dashboard@0.1.0 build
> next build

▲ Next.js 16.2.6 (Turbopack)
- Environments: .env.local

✓ Compiled successfully in 1549ms
  Finished TypeScript in 2.3s ...
✓ Generating static pages using 13 workers (3/3) in 65ms

Route (app)
├ ƒ /ideas      ← 新規
├ ƒ /knowledge
├ ƒ /campaigns
... (合計 24 routes、 前 23 routes + /ideas)
```

TypeScript clean。 Turbopack の `next.config.ts → publishPackageReader.ts` 警告は pre-existing、 本 batch 無関係。

## 5. Idea job filesystem safety behavior

`dashboard/src/lib/ideaJobs/paths.ts` で実装される 9 層安全:

1. **input shape**: 文字列でなければ reject
2. **null byte**: `\x00` を含む path / slug は reject (`null-byte` error)
3. **URL encoded traversal**: `%2e%2e` / `%2f` / `%5c` を含むものは reject (`url-encoded-traversal`)
4. **absolute path**: `/`, `\`, `C:\` 等で始まるものは reject (`absolute`)
5. **traversal segment**: `..` / `.` 単体セグメントは reject (`traversal`)
6. **prefix lock**: `idea-jobs/` で始まらない relative path は reject (`outside-idea-jobs`)
7. **slug regex**: `/^[a-z0-9][a-z0-9-]{0,79}$/` で第 2 セグメントを validate (`bad-slug`)
8. **leaf shape**: 3 番目以降のセグメントは `[a-zA-Z0-9._-]{1,128}` のみ
9. **extension allow-list**: `.md` / `.json` のみ (`bad-extension`)
10. **size cap**: 200 KB / file (UTF-8 byte length 計算、 atomic write helper 内で enforce、 `too-large` 相当の Error throw)
11. **absolute resolution check**: `path.resolve` 後に `<repo>/idea-jobs/` prefix を再確認 (defensive、 normalisation drift を catch)

Atomic write: `<target>.tmp-<8hex>` に O_EXCL (`flag: 'wx'`) で書く → `rename` で原子置換。 失敗時は temp cleanup を best effort。

## 6. Prompt builder behavior

`dashboard/src/lib/ideaJobs/promptBuilder.ts`:

- **入力フィールド** (`RawIdeaInput`): rawTitle / **roughMemo** (必須) / sourceContext / intendedTheme / urgency / relatedProject / initialPlatforms / ideaSource
- **検証 cap**: roughMemo 4000 chars、 自由テキスト 400 chars、 platforms 12 max
- **enum validation**: urgency (4 値) / relatedProject (5 値) / ideaSource (8 値) / platforms (12 値)
- **prompt.md 構成** (`renderPromptMd`):
  - header (ideaSlug / timestamp / promptVersion / boundary / createdAt)
  - 「役割と目的」 (企画化 partner、 final post を書かない、 boss が review する前提)
  - 「Raw Idea (入力)」 (yaml block で boss 入力を埋め込む)
  - 「返すべき構造化された結果」 (12 項目 reference list)
  - 「出力形式」 (markdown + JSON block in code fence、 Sanity contentIdea schema shape を template として提示)
  - 「レビュー観点」 (5 点)
  - 「結果の保存先」 (expected paths)
- **job.json**: ideaJobId / ideaSlug / timestamp / promptVersion / boundary / createdAt / 4 paths / rawIdeaSummary (本文を含めずメタデータのみ)
- **_raw.json**: ideaSlug / createdAt / 全 raw input field (roughMemo を含む)
- **suggestedCommands**: `codex` / `claude` / `cat | pbcopy` の 3 種 string (dashboard 実行しない、 display only)
- 出力 language: 日本語 (boss が明示変更しない限り、 prompt.md に「日本語で答えてください」 と書き込む)

## 7. Server action behavior

`createIdeaDevelopmentPackage(input)`:

### Mode='preview'

1. input shape check (object / mode validation)
2. `normaliseRawIdea` で input 検証 (roughMemo 必須 / 各長さ cap / enum)
3. ideaSlug derive (`input.ideaSlug` あれば use、 なければ `slugifyTitle(rawTitle, 'idea-<6hex>')`)
4. `validateIdeaSlug` で slug を最終 check
5. `buildIdeaJobPaths` で 5 paths 構築 (timestamp UTC 'YYYYMMDD-HHMMSS')
6. `renderPromptPackage` で prompt.md / jobJson / rawIdeaJson を pure render
7. metadata log (`preview-ok`) + return preview payload (path strings + body text + suggested commands + metrics)
8. **filesystem 一切触らず**

### Mode='execute'

1〜6 は preview と同じ
7. `enableWriteActions` チェック → off なら `write-disabled` reject
8. `enableLocalFsRoutes` チェック → off なら `localfs-disabled` reject
9. atomic write 3 ファイル:
   - `idea-jobs/<slug>/_raw.json` (overwrite 可、 boss が rough idea を更新する想定)
   - `idea-jobs/<slug>/<ts>/prompt.md` (timestamp dir なので衝突しない)
   - `idea-jobs/<slug>/<ts>/job.json`
10. metadata log (`execute-ok` または `write-failed`)
11. return execute payload (preview payload + `committedAt`)

### Error types

`validation` / `write-disabled` / `localfs-disabled` / `path-rejected` / `write-failed` / `unknown` の 6 種。 UI 側で日本語 message に mapping。

## 8. UI behavior

`/ideas` page:

- **PageHeader**: title「アイデア開発」、 description、 breadcrumb (ダッシュボード → アイデア開発)、 actions に Studio link、 meta に `writeReady` + `localFsReady` の現在値表示 (boss が env 状態を一目で確認可能)
- **説明カード** (amber tone): 「Raw Idea ≠ Content Idea」「Dashboard は AI を呼ばない」「raw は idea-jobs/ に保存」「filesystem 書き込みは 2 段 env gate 必須」 の 4 点を Lightbulb icon 付きで表示
- **`<RawIdeaBuilder>`**:
  - **Form**: rawTitle / **roughMemo** (textarea rows:8) / sourceContext / intendedTheme / urgency dropdown / relatedProject dropdown / initialPlatforms 12 platform chips (multi-select) / ideaSource dropdown
  - **文字数表示**: rawTitle + sourceContext + intendedTheme は 400 cap、 roughMemo は 4000 cap、 超過時に rose-600 表示
  - **「プロンプトを preview」** button (gray): roughMemo 入力時のみ active、 click で server action mode='preview' を呼ぶ
  - **「アイデアパッケージを作成」** button (blue): writeReady && localFsReady && form 検証通過時のみ active
  - env flag off 時: amber tone の説明文を表示
  - **PreviewPanel** (blue tone): planned 5 paths を mono font で表示 + prompt body を `<details>` で折りたたみ
  - **SuccessPanel** (emerald tone): 書き込み完了の 5 paths + 4 種 copy button + 「次の手順」 3 step
  - **エラー banner** (rose): server action 失敗時に日本語 message 表示
  - **isPending state**: 「処理中…」 を button 横に表示

CopyButton は既存 component を再利用、 4 箇所で使用:
1. プロンプト本文 (primary tone、 emerald)
2. codex exec コマンド
3. claude コマンド
4. pbcopy ワンライナー

## 9. Route / navigation changes

- 新規 route `/ideas` (server component、 dynamic、 revalidate=0)
- nav 「知識 & 分析」 group に新規 item「アイデア開発」 (Lightbulb icon、 `/knowledge` の上)
- 既存 23 routes 順序不変、 build 出力で確認済

## 10. Security checks

- ✅ 外部 LLM API client 追加なし (OpenAI / Anthropic / 他)
- ✅ `child_process` / `spawn` / `exec*` 使用なし (grep 結果: paths.ts のコメント 1 件のみ、 「NEVER spawns」 と書いてある説明テキスト)
- ✅ shell execution なし (推奨 CLI コマンドは string output のみ)
- ✅ Sanity write なし (server action が `getSanityWriteClient` を import せず)
- ✅ filesystem write は `idea-jobs/` のみ、 4 dir allowlist のうち本 batch で使うのは 1 dir
- ✅ 拡張子 `.md` / `.json` のみ、 `resolveIdeaJobAbsolutePath` で enforce
- ✅ Token / 本文を log しない (metadata only: byte length / slug / timestamp / elapsed ms / reject reason)
- ✅ Production write 永久 disabled (`enableWriteActions` は dev/localhost のみ、 prod では env 設定で永久 off)
- ✅ Client bundle に `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` 文字列なし (build artifact grep で 0 件)、 `SANITY_WRITE_TOKEN` は名前のみ (値なし、 通常の error message 文脈)

## 11. Manual smoke checklist

Boss が手元で実行:

| # | シナリオ | 期待結果 |
|---|---|---|
| 1 | `.env.local` で `ENABLE_WRITE_ACTIONS=true` + `ENABLE_LOCAL_FS_ROUTES=true` 設定 | 設定確認 |
| 2 | `cd dashboard && npm run dev` | 起動 |
| 3 | `/ideas` にアクセス | PageHeader + 説明カード + form 表示、 meta の writeReady=true / localFsReady=true |
| 4 | roughMemo に boss の本物 rough idea を 200-1000 字入力 (Q-2C-10 confirmed) | 文字数表示が更新 |
| 5 | initialPlatforms から X / Threads / Substack 等を選択 | チップが青く反転 |
| 6 | 「プロンプトを preview」 click | PreviewPanel が表示、 planned paths + prompt body を確認 |
| 7 | 「アイデアパッケージを作成」 click | SuccessPanel が表示、 committedAt + 5 paths + 4 copy button |
| 8 | terminal で `cat idea-jobs/<slug>/_raw.json` | rough idea が保存されている |
| 9 | terminal で `cat idea-jobs/<slug>/<ts>/prompt.md` | prompt body 全文 |
| 10 | terminal で `cat idea-jobs/<slug>/<ts>/job.json` | job metadata |
| 11 | 「プロンプトをコピー」 → ChatGPT / Claude / Codex に paste | AI が企画化を実行、 result を返す |
| 12 | result を `idea-jobs/<slug>/<ts>/result.md` に手動保存 | filesystem に AI 結果 |
| 13 | (dashboard import UI は本 batch 未実装、 boss が file 直接 read で確認) | 結果が markdown + JSON block で揃っている |
| 14 | env flag を片方 off (`ENABLE_WRITE_ACTIONS=false`) → 再起動 | execute button が disabled、 説明文 amber 表示 |
| 15 | env flag を両方 off | preview button は依然動く (filesystem 触らないため)、 execute disabled |
| 16 | Phase 2B-1 / 2B-2 / 2B-3 / 2B-3.1 既存動作確認 | 全て regression なし |
| 17 | DevTools network tab で外部 LLM API 通信を verify | 0 件 (api.openai.com / api.anthropic.com / etc 全て non-occurring) |
| 18 | `.next/static/chunks/*.js` で `SANITY_WRITE_TOKEN` / `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` の **値** を grep | 値漏洩なし |

Negative tests (server action 直接 invoke で確認推奨):
- ideaSlug に `/` / `..` / 大文字 / 空文字 → `validation` reject
- 200 KB 超の roughMemo → `validation` (rough-memo-too-long) reject (cap は 4000 chars だが size cap は 200 KB)
- urgency 不正値 → `validation` (bad-urgency) reject
- env flag off → `write-disabled` / `localfs-disabled` reject
- NODE_ENV=production → `enableWriteActions` env が `true` でも production deploy では env 設定で永久 off (Vercel 設定契約)

## 12. Remaining issues

- **Result import UI not yet implemented**: SuccessPanel に「結果を取り込む」 entry がない。 boss は terminal で `cat result.md` する必要あり。 Phase 2C-0.1 microbatch or Phase 2C-1 で追加候補
- **In Development 一覧 UI not yet implemented**: 過去に作った idea-job (`idea-jobs/*/<ts>/`) を dashboard で一覧する UI はなし。 boss は filesystem を直接見る必要あり。 Phase 2C-0.1 or 2C-1 候補
- **Sanity contentIdea promote helper not yet implemented**: 「Studio で contentIdea を作る」 deeplink + clipboard copy (rawInput / coreThesis / claims 等の draft 値を boss にコピーで渡す) UI が未実装。 Phase 2C-1 で追加候補
- **rawTitle slug override UI なし**: 現状は boss が ideaSlug を直接指定できない、 自動生成のみ。 boss が「この slug にしたい」 と思った時に明示的に入力する UI を将来追加
- **CJK タイトル時の slug 衝突可能性**: random suffix が 6hex (16M 通り) で 100 件 / day だと 2-3 年で衝突可能性出てくる。 Phase 2C 全体で 1000 件超えるなら衝突検知を追加
- **Phase 2C spec で言及した 4 OS positioning は今回は documented のみ**: nav / 説明カードで「思考 OS = Obsidian」 のリンクや bridge は本 batch では未実装、 別 Phase
- **Turbopack 警告 (pre-existing)**: `next.config.ts → publishPackageReader.ts` の NFT trace 警告は handoff/0192 以前から存在、 本 batch 無関係。 修正は Phase 2B-X cleanup 候補

## 13. Next Recommended Step

**Option A (推奨) — Boss smoke test**

boss が §11 の 18 step を実施 → smoke PASS であれば docs-only batch で記録:
- spec header status update (CONFIRMED → implemented + smoke PASS for 2C-0)
- parent spec §0.5 Phase 2C row を「Phase 2C-0 ✅ implemented + smoke PASS」 に拡張
- devlog + handoff 1 ペア (smoke-pass 専用)

smoke issue があれば smoke fix microbatch を起こす。

**Option B — Phase 2C-0.1 (result import + in-development list) を即追加**

Phase 2C-0 の延長として:
- `idea-jobs/*/_raw.json` を read してリスト表示
- `idea-jobs/<slug>/<ts>/result.md` を read して preview
- Studio deeplink + clipboard copy で contentIdea promote 補助

新規 ~5 ファイル + 更新 ~1 ファイル、 1 PR 完結可能。

**Option C — Phase 2B-4 Q 確定 microbatch (並行)**

Phase 2B-4 spec (handoff/0195) の Q-2B4-1〜Q-2B4-7 を boss が confirm → docs-only で spec を CONFIRMED 化、 Phase 2C-4 prerequisite 解消。

---

### Exact prompt for next Claude Code session (Phase 2C-0 smoke PASS 記録)

```
Record Phase 2C-0 smoke test PASS.

Reference:
- docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md
- docs/handoff/0198-phase-2c-0-raw-idea-package.md
- docs/specs/phase-2b-write-actions.md (parent §0.5 Phase 2C entry)

Boss smoke result (PASS):
- /ideas で raw idea 入力 + preview + execute 動作
- idea-jobs/<slug>/_raw.json + prompt.md + job.json 書き込み確認
- ChatGPT / Claude / Codex 手動実行 → result.md 保存確認
- env flag off で execute disabled
- 外部 LLM API 通信 0 件
- Phase 2B-1〜2B-3.1 regression なし
- observed issues: [boss が記入]

Tasks (docs only):
1. Update docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md
   - Header status: "spec-finalized, decisions CONFIRMED, implementation pending"
     → "Phase 2C-0 ✅ implemented + smoke PASS (handoff/<NNNN>)、 Phase 2C-1 以降は pending"
2. Update docs/specs/phase-2b-write-actions.md §0.5
   - Phase 2C entry を拡張: Phase 2C-0 ✅ smoke PASS、 残り Phase 2C-1〜2C-5 pending
3. Create docs/devlog/<NNNN>-phase-2c-0-smoke-pass.md
4. Create docs/handoff/<NNNN>-phase-2c-0-smoke-pass.md
5. Mirror to docs/handoff/latest.md

Docs only. dashboard/src, tools, schemas, assets, patches, publish-package, package.json 触らない。 build 不要。

End-of-run summary:
- Smoke PASS results recorded
- Spec section updates
- Parent spec section update
- Next: Phase 2C-0.1 (result import) or Phase 2C-1 (Campaign helper) or 2B-4 Q 確定
```

## 14. Validation

```
=== A. Runtime / protected paths newer than handoff/0197 (5 spec files + 1 nav update expected) ===
dashboard/src/lib/ideaJobs/paths.ts                            (new)
dashboard/src/lib/ideaJobs/promptBuilder.ts                    (new)
dashboard/src/lib/actions/createIdeaDevelopmentPackage.ts      (new)
dashboard/src/components/ideas/RawIdeaBuilder.tsx              (new)
dashboard/src/app/ideas/page.tsx                               (new)
dashboard/src/lib/navigation.ts                                (updated: アイデア開発 nav item + Lightbulb icon)

=== B. schemas / tools / publish-package / assets / patches / package.json newer (expect empty) ===
(expect empty)

=== C. Build ===
cd dashboard && npm run build
→ ✓ Compiled successfully in 1549ms
→ Finished TypeScript in 2.3s
→ 24 routes (added /ideas)
→ Turbopack pre-existing warning (next.config.ts NFT trace, handoff/0192 以前から存在、 本 batch 無関係)
```

Build green。 No TypeScript errors。 No external LLM API client。 No shell execution。 Sanity schema 不変。 Phase 2B-1〜2B-3.1 動作不変。

Phase 2C MVP の最初の slice (Phase 2C-0) が land。 boss smoke 待ち。
