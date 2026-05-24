# Handoff: Phase 2C-0.1 implementation — AI-developed idea result import

Date: 2026-05-21

## 1. Task Goal

Phase 2C-0 (Raw Idea + Idea Development Package、 handoff/0198) は smoke 動作確認済。 ただし AI 結果 (ChatGPT / Claude / Codex 出力) を `idea-jobs/<slug>/<ts>/result.md` / `result.json` に書き戻す手段が「boss が手で file 保存」 のみで、 path typo / markdown-JSON 対応ミス / dashboard に戻った時の context loss が weak UX。

本 batch (Phase 2C-0.1) は dashboard `/ideas` の Phase 2C-0 success panel の下に **「AI企画化結果を取り込む」** section を追加し、 textarea に paste した markdown を Phase 2C-0 が用意した path に safely write する slice。

完了内容:
- result text parser (markdown / pure JSON / markdown + ```json block の 3 pattern tolerate、 200 KB cap、 13 field detection + 9 alias normalisation)
- `saveIdeaDevelopmentResult` server action (preview / execute 2 mode、 2 段 env gate、 atomic write、 result.md は always 書く / result.json は JSON 検出時のみ)
- RawIdeaBuilder に `<ResultImportSection>` を embed (paste textarea + preview panel + saved panel + 13 field chips + warnings + 「Content Idea 用 JSON をコピー」 button + 「Content Idea 化は次フェーズ」 案内カード)
- build green、 24 routes 維持
- Sanity write なし、 外部 LLM API 通信なし、 shell exec なし

## 2. Constraints Followed

- ✅ Sanity schema 変更なし
- ✅ Sanity 書き込みなし (本 sub-batch では server action が Sanity を一切触らない)
- ✅ 外部 LLM API client (OpenAI / Anthropic) 追加なし
- ✅ Claude Code / Codex を dashboard から spawn / 制御しない
- ✅ shell execution なし (`child_process` / `spawn` / `exec*` 一切なし、 audit 0 hits)
- ✅ `tools/`, `assets/`, `patches/`, `publish-package/` 触らず
- ✅ deploy なし
- ✅ `package.json` (root + dashboard) 追加なし
- ✅ 24 routes すべて build green (Phase 2C-0 と同じ)
- ✅ Production write 永久 disabled (`enableWriteActions` + `enableLocalFsRoutes` の 2 段 env gate)
- ✅ filesystem write は既存 Phase 2C-0 path 安全層を再利用、 `idea-jobs/<slug>/<ts>/` 下のみ、 `.md` / `.json` のみ、 200 KB cap、 atomic
- ✅ Token / 本文 / result body を log しない (metadata only: byte size / field count / warning count / elapsed)
- ✅ Phase 2B-1 〜 2B-3.1 + Phase 2C-0 動作不変

## 3. Changed Files

### 新規 (2 ファイル)

- [dashboard/src/lib/ideaJobs/resultParser.ts](dashboard/src/lib/ideaJobs/resultParser.ts) — server-only parser (~210 行)
  - `parseAiDevelopmentResult(input: string)` を export
  - Pattern 1: 入力全体が JSON object → 直接 parse
  - Pattern 2: markdown に \`\`\`json ... \`\`\` block (末尾優先、 複数 block で warning)
  - Pattern 3: markdown only → markdown-only return
  - 13 expected fields detection: proposedTitle / coreThesis / targetReader / audiencePain / claims / objections / examples / platformAngles / visualPotential / recommendedCampaignFraming / risks / weakPoints / nextQuestions
  - 9 alias normalisation (`recommendedCampaign` → `recommendedCampaignFraming` 他)
  - 200 KB byte cap (UTF-8、 `MAX_RESULT_BYTES` export)
  - Malformed JSON でも throw せず markdown-only fallback + warning
  - 600 文字 preview excerpt
- [dashboard/src/lib/actions/saveIdeaDevelopmentResult.ts](dashboard/src/lib/actions/saveIdeaDevelopmentResult.ts) — `'use server'` (~170 行)
  - Input: `ideaSlug` / `timestamp` / `resultText` / `mode: 'preview' | 'execute'`
  - Preview: `buildIdeaJobPaths` で path 検証 → parse → planned paths + detected fields + warnings + excerpt + metrics、 filesystem 一切触らず
  - Execute: `enableWriteActions` → `enableLocalFsRoutes` → atomic write 2 ファイル (`result.md` always、 `result.json` JSON 検出時のみ、 両方 `overwrite` mode)
  - 既存 `buildIdeaJobPaths` / `atomicWriteIdeaJobFile` (Phase 2C-0 共有) を再利用、 path 安全層の重複定義しない
  - Metadata-only server log

### 更新 (1 ファイル)

- [dashboard/src/components/ideas/RawIdeaBuilder.tsx](dashboard/src/components/ideas/RawIdeaBuilder.tsx) — `<ResultImportSection>` + 2 sub-panel を追加 (~210 行 net add)
  - Phase 2C-0 SuccessPanel の「次の手順」 instruction を更新 — 「下の『AI企画化結果を取り込む』 に paste」 への動線
  - `<ResultImportSection>` — textarea + KB / 200 KB indicator + preview / save button + クリア button
  - `<ResultPreviewPanel>` (blue tone) — planned 2 paths + 13 field detection chips + warnings + 600 char excerpt
  - `<ResultSavedPanel>` (emerald tone) — saved 2 paths + 13 field chips + warnings + 「Content Idea 用 JSON をコピー」 button (構造化 JSON 検出時のみ) + 「Content Idea 化は次フェーズ」 案内カード
  - `executeResult` (Phase 2C-0 package execute 成功 state) を必須 trigger に、 unrelated state 露出を回避

### 触らない

- `schemas/` / `dashboard/src/lib/sanity*` / Phase 2B 既存 server action / `tools/` / `assets/` / `patches/` / `publish-package/` / `package.json` (root + dashboard) — 全 touch なし

## 4. Result parser behavior

`dashboard/src/lib/ideaJobs/resultParser.ts`:

### 入力 → 出力

| Pattern | 入力 | markdownText | structuredJson | detectedFields | warnings |
|---|---|---|---|---|---|
| 全体 JSON | `{"proposedTitle": "...", ...}` | `""` | normalised object | 検出 fields | (alias remap があれば) |
| markdown + JSON block | `... \`\`\`json\n{...}\n\`\`\` ...` | full input (block 保持) | normalised object | 検出 fields | 複数 block 時に warning |
| markdown only | `# 案 1...` | full input | `null` | `[]` | `'No JSON code block detected — markdown-only result'` |
| JSON block malformed | `... \`\`\`json\n{bad,\n\`\`\` ...` | full input | `null` | `[]` | `'JSON code block found but failed to parse — falling back to markdown-only'` |
| size 超過 | 200 KB+ | — | — | — | `{ok: false, error: 'too-large'}` |
| 空 | `''` / 空白のみ | — | — | — | `{ok: false, error: 'empty'}` |

### Field alias 9 件

| Canonical | Aliases |
|---|---|
| `recommendedCampaignFraming` | `recommendedCampaign` / `recommended_campaign` / `campaignFraming` |
| `proposedTitle` | `title` / `proposed_title` |
| `coreThesis` | `thesis` / `core_thesis` |
| `targetReader` | `target_reader` / `audience` |
| `audiencePain` | `audience_pain` / `pain` |
| `platformAngles` | `platform_angles` / `angles` |
| `visualPotential` | `visual_potential` / `visual` |
| `weakPoints` | `weak_points` / `weaknesses` |
| `nextQuestions` | `next_questions` / `questions` |

Alias 適用時は warning `Aliased keys normalised: <alias> → <canonical>, ...` で boss に通知。

### Field detection 条件

- 値が `undefined` / `null` → 検出されない
- 文字列で trim 後空 → 検出されない
- 配列で空 → 検出されない
- object で 0 key → 検出されない
- それ以外 (truthy + 内容あり) → 検出

## 5. Server action behavior

`saveIdeaDevelopmentResult(input)`:

### Mode='preview'

1. input shape check (object / mode validation)
2. `buildIdeaJobPaths(ideaSlug, timestamp)` で path 検証 (既存 Phase 2C-0 helper、 slug 正規表現 + timestamp 'YYYYMMDD-HHMMSS' + path 安全層)
3. `parseAiDevelopmentResult(resultText)` で parse (markdown / JSON / 混合 / malformed / empty / too-large)
4. metadata log + return preview payload (`mode: 'preview'` / paths / detected fields / warnings / excerpt / metrics / structuredJsonText)
5. **filesystem 一切触らず**

### Mode='execute'

1-3 は preview と同じ
4. `enableWriteActions` チェック → off なら `write-disabled` reject
5. `enableLocalFsRoutes` チェック → off なら `localfs-disabled` reject
6. atomic write:
   - `idea-jobs/<slug>/<ts>/result.md` (overwrite 許可、 boss が再 paste 可)
   - `idea-jobs/<slug>/<ts>/result.json` (JSON 検出時のみ、 overwrite 許可)
7. metadata log + return execute payload (preview payload + `committedAt` + `mode: 'execute'`)

### Error types

`validation` / `write-disabled` / `localfs-disabled` / `path-rejected` / `parse-error` / `write-failed` / `unknown` の 7 種。 UI 側で日本語 message に mapping。

## 6. UI behavior

`<ResultImportSection>` (Phase 2C-0 SuccessPanel の下に表示):

- **show 条件**: `executeResult` (Phase 2C-0 package execute 成功 state) が存在する時のみ
- **textarea**: rows=10、 font-mono、 KB / 200 KB indicator、 200 KB 超で rose 警告
- **「結果を preview」** button: textarea が非空かつ size ≦ 200 KB なら active
- **「結果を保存」** button: 上記 + writeReady + localFsReady (env flag 両方 ON) で active、 env flag off 時に title attr で理由表示
- **「クリア」** button: textarea + preview + saved state を全 reset
- **`<ResultPreviewPanel>`** (blue):
  - 予定 paths (result.md + result.json or "(JSON 未検出 → markdown のみ保存)")
  - 13 field chip (emerald=detected、 slate=undetected)
  - warning list (amber tone)
  - 600 char excerpt (折りたたみ details)
- **`<ResultSavedPanel>`** (emerald):
  - 書き込み済 paths + size 表示
  - 13 field chip
  - warning list
  - 「Content Idea 用 JSON をコピー」 button (構造化 JSON 検出時のみ、 existing `<CopyButton>` 流用、 normalised JSON を copy)
  - 「Content Idea 化は次フェーズ」 案内 (3 bullet: 今は file 保存まで / Phase 2C-1 で Studio deeplink / それまでは手動 Studio + clipboard)
- **env flag off 時**: amber 説明文を表示、 save button disabled、 preview button は動く

加えて Phase 2C-0 `<SuccessPanel>` の「次の手順」 step #3 を更新 — boss が AI 結果を受け取ったあと「下の section に paste」 という linear flow を提示。

## 7. Build validation

```
> dashboard@0.1.0 build
> next build

▲ Next.js 16.2.6 (Turbopack)
✓ Compiled successfully in 1954ms
  Finished TypeScript in 2.4s
✓ Generating static pages using 13 workers (3/3) in 65ms
24 routes (was 24, unchanged — no new route)
```

TypeScript clean。 Pre-existing Turbopack `next.config.ts → publishPackageReader.ts` 警告は本 batch 無関係。

## 8. Security checks

| Check | Result |
|---|---|
| 外部 LLM API client 追加 | ✅ none (grep `openai\|anthropic` 0 hits in new files) |
| `child_process` / `spawn` / `exec*` 使用 | ✅ none (grep 0 hits in new files) |
| Shell execution | ✅ none (server action は filesystem write のみ) |
| Sanity write | ✅ none (`getSanityWriteClient` / `sanityWriteClient` import 0 hits in new files) |
| filesystem write 範囲 | ✅ `idea-jobs/<slug>/<ts>/` のみ、 既存 `atomicWriteIdeaJobFile` 再利用 |
| 拡張子 | ✅ `.md` / `.json` のみ、 `resolveIdeaJobAbsolutePath` で enforce |
| Token / result body の log | ✅ metadata only (byte size / field count / warning count / elapsed / wroteJson flag) |
| Client bundle に `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` 文字列 | ✅ 0 hits |
| Production write disable | ✅ `enableWriteActions` は dev/localhost のみ |

## 9. Manual smoke checklist

Boss が手元で実行:

| # | シナリオ | 期待結果 |
|---|---|---|
| 1 | `.env.local` で `ENABLE_WRITE_ACTIONS=true` + `ENABLE_LOCAL_FS_ROUTES=true` 確認 | 設定 OK |
| 2 | `cd dashboard && npm run dev` → `/ideas` アクセス | PageHeader + form 表示 |
| 3 | rough idea 入力 + 「アイデアパッケージを作成」 | SuccessPanel + その下に「AI企画化結果を取り込む」 section |
| 4 | 「プロンプトをコピー」 → ChatGPT / Claude / Codex に paste → AI 実行 | AI 結果取得 |
| 5 | AI 結果 (markdown のみ) を dashboard textarea に paste → 「結果を preview」 | PreviewPanel 表示、 detected fields は 0、 warning「No JSON code block detected」 |
| 6 | 「結果を保存」 | SavedPanel 表示、 result.md のみ書き込み、 result.json は `(JSON 未検出 → 書き込みなし)` 表示 |
| 7 | `cat idea-jobs/<slug>/<ts>/result.md` で内容確認 | paste した markdown が保存されている |
| 8 | 「クリア」 → 新たに markdown + ```json ... ``` block を paste → 「結果を preview」 | detected fields chip が emerald 着色、 warning 0 件 (or alias remap) |
| 9 | 「結果を保存」 | result.md + result.json 両方書き込み |
| 10 | 「Content Idea 用 JSON をコピー」 button click | clipboard に normalised JSON |
| 11 | `cat idea-jobs/<slug>/<ts>/result.json` で内容確認 | parser が normalise した JSON |
| 12 | malformed JSON block (`{"a":,` 等) を含む paste → preview | warning「JSON code block found but failed to parse」 + markdown-only fallback |
| 13 | 「結果を保存」 (malformed JSON 時) | result.md のみ書き込み、 result.json 書き込みなし |
| 14 | 200 KB 超の paste → preview | reject、 `parse-error` (too-large) 表示 |
| 15 | env flag `ENABLE_WRITE_ACTIONS=false` で再起動 → preview / save | preview 動く、 save disabled (amber 説明文) |
| 16 | env flag `ENABLE_LOCAL_FS_ROUTES=false` で再起動 → preview / save | save disabled |
| 17 | Phase 2C-0 (Raw Idea + Package 作成) 動作不変確認 | regression なし |
| 18 | Phase 2B-1 / 2B-2 / 2B-3 / 2B-3.1 既存動作確認 | regression なし |
| 19 | DevTools network tab で外部 LLM API 通信を verify | 0 件 |
| 20 | Sanity Studio で contentIdea / 他 doc が新規作成されていないこと確認 | 0 件 (dashboard は Sanity 触らない) |

## 10. Remaining issues

- **Studio deeplink + clipboard mapping UI 未実装**: 「Content Idea 用 JSON をコピー」 button は raw JSON copy のみ、 field 別 clipboard / Studio deeplink (`/structure/contentIdea;new`) は Phase 2C-1 候補
- **In Development 一覧 UI 未実装**: 過去 job を `/ideas` で list する surface はなし、 boss は filesystem 直接見る必要あり (Phase 2C-1 候補)
- **既存 result file の検知なし**: 同 timestamp 下に既に result が存在しても warning を出さない (overwrite で上書きされる)、 boss が「これは未保存の result か?」 を判別する surface なし。 boss feedback で必要なら overwrite confirm modal を追加 (Phase 2C-0.2 候補)
- **alias normalisation の visibility**: warning に列挙はするが、 「どの field が原本でどの alias から来たか」 の per-field 表示は未実装。 boss が「これは AI が変な key 使ったから dashboard が直したのか」 を debug する場面で不足する可能性
- **field 検出は string presence のみ、 schema validation はしない**: 例えば `claims` が `string` で返ってきた場合 (期待は array) でも detected 扱い。 厳密な schema check は Phase 2C-1 (Studio mapping) で行う
- **大量 paste 時の memory**: 200 KB textarea + parse + preview の合計が server action で ~1 MB 食う可能性、 Next.js server action body limit (default 1MB) に近い。 実運用で問題なし想定だが、 ROI 次第で boss 判断
- **Turbopack 警告 (pre-existing)**: handoff/0192 以前から存在、 本 batch 無関係

## 11. Next Recommended Step

**Option A (推奨) — Boss smoke test**

boss が §9 の 20 step を実施。 PASS なら docs-only batch (Phase 2C-0 + 2C-0.1 まとめての smoke PASS 記録) を起こす:
- spec header status update (Phase 2C-0 + 2C-0.1 ✅ implemented + smoke PASS)
- parent §0.5 Phase 2C entry を「Phase 2C-0 + 2C-0.1 ✅ smoke PASS、 残り Phase 2C-1〜2C-5 pending」 に拡張
- devlog + handoff 1 ペア

問題があれば smoke fix microbatch を起こす。

**Option B — Phase 2C-1 (Campaign creation helper) 着手**

Phase 2C-0.1 で生成された `result.json` を Phase 2C-1 で読んで:
- contentIdea promote helper (Studio deeplink + field-mapped clipboard)
- contentIdea が存在する場合の campaignPlan creation helper (Studio deeplink + selectedPlatforms draft)
- `/ideas` に「In Development jobs」 list (`idea-jobs/*/<ts>/` 一覧)

新規 ~5 + 更新 ~2 = ~7 ファイル想定。 Phase 2C-0.1 smoke PASS 後の natural next step。

**Option C — Phase 2B-4 Q 確定 microbatch (並行)**

Phase 2B-4 (publish/revision) の Q-2B4-1〜Q-2B4-7 を confirm。 Phase 2C-4 prerequisite 解消。

---

### Exact prompt for next Claude Code session (Phase 2C-0 + 2C-0.1 smoke PASS 記録)

```
Record Phase 2C-0 + Phase 2C-0.1 smoke test PASS.

Reference:
- docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md
- docs/handoff/0198-phase-2c-0-raw-idea-package.md
- docs/handoff/0199-phase-2c-0-1-idea-result-import.md
- docs/specs/phase-2b-write-actions.md (parent §0.5 Phase 2C entry)

Boss smoke result (PASS、 evidence は boss が記入):
- /ideas で raw idea 入力 + package 作成 → idea-jobs/<slug>/_raw.json + prompt.md + job.json 確認
- ChatGPT / Claude / Codex 手動実行 → markdown / markdown + JSON block 結果取得
- dashboard textarea に paste → preview で detected fields + warnings 確認
- 「結果を保存」 → result.md + (JSON 検出時) result.json 書き込み確認
- 「Content Idea 用 JSON をコピー」 button 動作確認
- 200 KB 超 / malformed JSON / env flag off の reject 動作確認
- 外部 LLM API 通信 0 件
- Phase 2B-1〜2B-3.1 regression なし
- observed issues: [boss が記入]

Tasks (docs only):
1. Update docs/specs/phase-2c-end-to-end-no-api-publishing-workflow.md
   - Header status を「Phase 2C-0 + 2C-0.1 ✅ implemented + smoke PASS (handoff/<NNNN>)」 に
2. Update docs/specs/phase-2b-write-actions.md §0.5
   - Phase 2C entry を拡張: Phase 2C-0 + 2C-0.1 ✅ smoke PASS、 残り Phase 2C-1〜2C-5 pending
3. Create docs/devlog/<NNNN>-phase-2c-0-and-0-1-smoke-pass.md
4. Create docs/handoff/<NNNN>-phase-2c-0-and-0-1-smoke-pass.md
5. Mirror to docs/handoff/latest.md

Docs only. dashboard/src, tools, schemas, assets, patches, publish-package, package.json 触らない。 build 不要。

End-of-run summary:
- Smoke PASS results recorded for 2C-0 + 2C-0.1
- Spec section updates
- Parent spec section update
- Next: Phase 2C-1 (Campaign creation helper) or 2B-4 Q 確定
```

## 12. Validation

```
=== A. Files changed in this batch (newer than handoff/0198) ===
dashboard/src/lib/ideaJobs/resultParser.ts                            (new)
dashboard/src/lib/actions/saveIdeaDevelopmentResult.ts                (new)
dashboard/src/components/ideas/RawIdeaBuilder.tsx                     (updated: ResultImportSection embed + 2 sub-panel)
docs/devlog/0188-phase-2c-0-1-idea-result-import.md                   (new)
docs/handoff/0199-phase-2c-0-1-idea-result-import.md                  (new, this file)
docs/handoff/latest.md                                                 (mirror of 0199)

=== B. Touch check on out-of-scope dirs (expect empty) ===
schemas / tools / assets / patches / publish-package: (empty)
package.json (root + dashboard): (empty)

=== C. Build ===
cd dashboard && npm run build
→ ✓ Compiled successfully in 1954ms
→ Finished TypeScript in 2.4s
→ 24 routes (no new route, /ideas extended in-place)
→ Turbopack pre-existing warning (本 batch 無関係)

=== D. Security audit (grep over new/updated files) ===
child_process / spawn / exec*: 0 hits
openai / anthropic / api.openai.com / api.anthropic.com: 0 hits
getSanityWriteClient / sanityWriteClient: 0 hits in new files

=== E. Client bundle token leak ===
OPENAI_API_KEY value in .next/static/chunks/*.js: 0 hits
ANTHROPIC_API_KEY value: 0 hits
```

Build green。 No TypeScript errors。 No external LLM API client。 No shell execution。 Sanity schema 不変。 Phase 2B-1 〜 2B-3.1 + Phase 2C-0 動作不変。

Phase 2C MVP の 2 番目の slice (Phase 2C-0.1) が land。 boss smoke 待ち。
