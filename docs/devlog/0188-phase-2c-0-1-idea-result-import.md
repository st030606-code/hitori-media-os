# Phase 2C-0.1 implementation — AI-developed idea result import

日付: 2026-05-21

## 背景

Phase 2C-0 (Raw Idea + Idea Development Package) が land 済 (handoff/0198) で boss が smoke 動作確認済。 ただし AI 結果の保存は boss が手動で `idea-jobs/<slug>/<ts>/result.md` / `result.json` に書く運用で:

- ファイル名 typo の risk
- markdown と JSON block の対応ミス
- dashboard に戻った時に「どの job の結果か」 を boss が忘れる
- expected paths と実 path の照合が boss 任せ

boss が「dashboard に直接 paste して保存する surface が欲しい」 と指示 → 本 batch は Phase 2C-0 success panel の下に **「AI企画化結果を取り込む」** section を追加し、 textarea で paste した markdown を Phase 2C-0 が用意した path に safely write する slice。

Sanity contentIdea 作成は **本 batch では行わない**。 Phase 2C-1 候補。

## 決定・変更

### 新規 (2 ファイル)

- `dashboard/src/lib/ideaJobs/resultParser.ts` — server-only parser (~210 行)
  - `parseAiDevelopmentResult(input)` を export、 markdown / pure JSON / markdown+JSON block の 3 pattern を tolerate
  - 13 expected fields の detection (`proposedTitle` / `coreThesis` / `targetReader` / `audiencePain` / `claims` / `objections` / `examples` / `platformAngles` / `visualPotential` / `recommendedCampaignFraming` / `risks` / `weakPoints` / `nextQuestions`)
  - field alias normalisation (`recommendedCampaign` → `recommendedCampaignFraming` 等の 9 alias)
  - 200 KB byte cap (UTF-8)
  - 末尾の `\`\`\`json ... \`\`\`` block を優先 (多くの AI agent が末尾に metadata を置く)、 複数 block 検出時は warning
  - JSON malformed 時は markdown-only fallback (parser は throw しない)
- `dashboard/src/lib/actions/saveIdeaDevelopmentResult.ts` — `'use server'` (~170 行)
  - input: `ideaSlug` + `timestamp` + `resultText` + `mode: 'preview' | 'execute'`
  - preview: path 安全性 check + parse → planned paths + detected fields + warnings + preview excerpt を return、 filesystem 一切触らず
  - execute: `enableWriteActions` + `enableLocalFsRoutes` の 2 段 env gate → atomic write 2 ファイル (`result.md` 常に書く、 `result.json` は JSON 検出時のみ)
  - 既存 `buildIdeaJobPaths` / `atomicWriteIdeaJobFile` (Phase 2C-0 共有 helper) を再利用、 path 安全層の重複定義しない
  - metadata-only server log (`[saveIdeaDevelopmentResult:start|preview-ok|execute-ok|rejected|write-failed]`)

### 更新 (1 ファイル)

- `dashboard/src/components/ideas/RawIdeaBuilder.tsx` — Phase 2C-0 success panel の下に `<ResultImportSection>` を embed (~210 行 add)
  - textarea + 文字数表示 (KB / 200 KB)
  - 「結果を preview」 / 「結果を保存」 button
  - `<ResultPreviewPanel>` — planned 2 paths + 13 field detection chips (emerald=present / slate=absent) + warnings + 600 char excerpt
  - `<ResultSavedPanel>` — 書き込み済 paths + 13 field chips + warnings + 「Content Idea 用 JSON をコピー」 button (構造化 JSON 検出時のみ) + 「Content Idea 化は次フェーズ」 説明カード
  - 「クリア」 button で再 paste flow に戻れる
  - `executeResult` (Phase 2C-0 success state) が存在する時のみ表示、 unrelated state 露出を回避

加えて Phase 2C-0 SuccessPanel の「次の手順」 instruction #3 を更新 — 「結果は下の『AI企画化結果を取り込む』 に paste」 という文言に書き換え、 boss が新 surface に自然に導かれる動線を establish。

### 触らない (Hard Rules 準拠)

- `schemas/` / Sanity write client / Phase 2B 既存 server action — touch なし
- `tools/`, `assets/`, `patches/`, `publish-package/` — touch なし
- `package.json` (root + dashboard) — dependency 追加なし
- 外部 LLM API client (OpenAI / Anthropic / 他) — 追加なし
- shell execution (`child_process` / `spawn` / `exec*`) — 一切なし

## 理由

### なぜ resultParser を server-side module にするか

Parser は `Buffer.byteLength` (Node.js global) を使うため server-side 限定 — client bundle に出さない。 加えて parser は将来 Phase 2C-1 (Studio deeplink + clipboard) で contentIdea field を mapping する layer で再利用される想定。 共有 module として `ideaJobs/` に置くことで、 import surface が `paths.ts` (path 安全) / `promptBuilder.ts` (prompt 構築) / `resultParser.ts` (結果 parse) の 3 module 構成に整う。

### なぜ JSON 検出を「末尾優先」 にするか

ChatGPT / Claude / Codex の典型的な response:
- markdown で 12 項目を説明
- 末尾に `\`\`\`json` の構造化 block を付ける (boss が prompt で「markdown の末尾に JSON block を埋めて」 と指示しているため)

複数 block を返した場合 (例: 中間で example 用 JSON snippet + 末尾で完成版 JSON) は **末尾を採用** + warning 表示。 これにより boss が「思った JSON が拾われているか」 を UI で即座に確認可能。

### なぜ markdown-only fallback を採用するか

JSON が必須でないケース:
- 軽い議論で markdown だけ返ってきた
- AI が JSON block を忘れた
- boss が短い revise を paste した

これらを reject せず markdown-only で `result.md` だけ保存する path を残す → boss が「何度も AI に往復してから 1 度に保存」 できる workflow を支える。 JSON malformed 時も同じ pattern (warning 表示 + markdown-only 保存)。

### なぜ field alias normalisation を入れるか

Phase 2C-0 prompt builder は `recommendedCampaign` を emit、 task description は `recommendedCampaignFraming` を要求 → naming drift が存在。 加えて AI agent は `title` / `proposed_title` / `target_reader` 等の snake_case variant を返すことが多い。

alias table (`recommendedCampaign → recommendedCampaignFraming` 等の 9 件) で canonical key に揃える:
- detected fields の正確性が上がる (alias で書かれた field を欠落扱いしない)
- 将来 Phase 2C-1 で contentIdea field mapping するときに boss が再 normalise する必要なし
- normalisation 発生時は warning を立て、 boss が paste 元 (どの AI が何を返したか) を debug できる

### なぜ「Content Idea 用 JSON をコピー」 button を実装したか (optional task §4)

low-risk:
- 既存 `<CopyButton>` を流用、 新 dependency なし
- copy 内容は parser が normalise 済の JSON text、 client side で再 mutate しない
- 「Studio で contentIdea を作る」 deeplink は本 batch では未実装、 Phase 2C-1 候補
- それまで boss は Studio で contentIdea を手動 new、 必要 field を clipboard から paste する flow

これで boss が AI 結果を Studio に持ち込むまでの摩擦が「JSON copy → Studio 開く → 各 field に paste」 に短縮。 ただし dashboard は doc create しない (Q-2B3.1-7 原則踏襲)。

### なぜ result.md を「always 書く」 にし result.json を「JSON 検出時のみ」 にするか

- result.md は boss が paste した raw response そのまま、 後から re-parse 可能、 audit 可能
- result.json は 「dashboard が JSON 検出に成功した結果」 のみ、 misleading な空 / 部分 JSON file を作らない
- Phase 2C-1 で Studio mapping するときの source は **必ず result.json** が存在する、 という暗黙の契約を establish

### なぜ overwrite を許容するか

boss workflow:
- 1 回目の paste → 「足りない、 AI に追加質問」
- 再 paste → 同 timestamp 下に上書き

これを `existingFileMode: 'overwrite'` で許容。 Phase 2C-0 では `_raw.json` も同じ pattern。 result file は **時系列の唯一の source** ではなく **boss が選んだ最新版**、 という位置付け。 過去の result が必要なら別 timestamp で新 job を作る。

### なぜ executeResult が存在するときだけ result import UI を表示するか

Phase 2C-0 で package を未作成の状態で result section を出すと:
- どこに保存するか (`ideaSlug` + `timestamp`) が未確定 → button が意味を持たない
- boss が「先に package を作って」 と気付かない動線

そこで `executeResult` (package execute 成功 state) を必須 trigger に。 これにより:
- Phase 2C-0 package 作成 → 自動で下に result import UI が現れる
- boss が「次に何をするか」 を考えなくて済む linear flow が成立

clear button を出して新たな package で作り直す path も残す (`onReset` で section state を全 clear)。

### なぜ build artifact に LLM API key 文字列がないことを確認するか

Phase 2C 中心原則「No external LLM API」 を CI 級の品質で validate するため。 grep で `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` の **値** が出ないだけでなく、 **文字列** 自体が client bundle に現れない → これらの env を読む code path が dashboard 内に存在しないことの間接 evidence。

(`SANITY_WRITE_TOKEN` は名前文字列は出るが値は出ない、 Phase 2B-1 で確立した既存 contract と同じ。 本 batch では Sanity 触らないため、 token は最初から関与しない。)

## 影響

- リポジトリ:
  - `dashboard/src/lib/ideaJobs/resultParser.ts` (新規 ~210 行)
  - `dashboard/src/lib/actions/saveIdeaDevelopmentResult.ts` (新規 ~170 行)
  - `dashboard/src/components/ideas/RawIdeaBuilder.tsx` (更新、 ~210 行 net add)
  - docs/devlog/0188 + docs/handoff/0199 + docs/handoff/latest.md
  - schemas / tools / assets / patches / publish-package / package.json: touch なし
- ワークフロー:
  - boss が `/ideas` で raw idea 入力 → package 作成 → AI 実行 → **dashboard に戻って結果を paste → 保存** という 1-page flow が完結
  - 「dashboard → terminal → editor → terminal → dashboard」 の往復が「dashboard → AI agent → dashboard」 に短縮
  - 24 routes 不変、 build green、 TypeScript clean
- スキーマ: 不変
- プロダクト方針:
  - 「dashboard が AI の result を **書き戻す**」 という Phase 2C 中心 mechanic が完成
  - field alias normalisation で「AI agent 個体差」 を dashboard 内で吸収する pattern を establish
  - 13 expected fields を chip で visual feedback する pattern が、 将来 Sanity field mapping の base になる
  - 「Content Idea 化は次フェーズ」 をパネル末尾で明示することで、 boss が Phase 2C-1 を待つ design discipline を可視化

## 次の一手

**Option A (推奨) — boss smoke test**

boss が手元で:
1. `cd dashboard && npm run dev` (`.env.local` 確認)
2. `/ideas` で raw idea 入力 + 「アイデアパッケージを作成」
3. 「プロンプトをコピー」 → ChatGPT / Claude / Codex に paste
4. AI 結果 (markdown のみ、 markdown + JSON block の 2 pattern) を dashboard textarea に paste
5. 「結果を preview」 で detected fields + warnings 確認
6. 「結果を保存」 → `result.md` (markdown のみ) または `result.md` + `result.json` 書き込み確認
7. JSON 検出時に「Content Idea 用 JSON をコピー」 button 動作確認
8. env flag 片方 off で save disabled、 preview は動作することを確認
9. malformed JSON paste で markdown-only fallback + warning 動作確認
10. 200 KB 超 paste で reject 確認
11. Phase 2B-1 〜 2B-3.1 + Phase 2C-0 動作不変
12. DevTools network で外部 LLM API 通信 0 件

問題なければ **smoke PASS** を docs に記録、 Phase 2C-1 (Campaign creation helper) or Phase 2B-4 Q 確定 microbatch に進む。

**Option B — Phase 2C-1 を即着手**

Phase 2C-1 = Campaign creation helper の MVP:
- contentIdea 一覧 (既存 `/knowledge` data) から「campaign を作る」 deeplink
- Studio で campaignPlan new create 用の clipboard helper (`sourceContentIdea` ref / `title` draft / `selectedPlatforms` draft 等)
- Phase 2C-0.1 で書いた `result.json` を読んで title / coreThesis draft を補完

Phase 2C-0.1 smoke が PASS してから着手する方が安全。

**Option C — Phase 2B-4 Q 確定 microbatch**

Phase 2C 並行で Phase 2B-4 (publish/revision) の Q-2B4-1〜Q-2B4-7 を confirm → Phase 2C-4 の prerequisite 解消。

発信ネタ案:
- 「dashboard が AI 結果を書き戻すという design — Phase 2C-0.1 で result import を実装」
- 「markdown / pure JSON / markdown+JSON block の 3 pattern を tolerate する parser design」
- 「Field alias normalisation で AI agent 個体差を吸収する pattern — Phase 2C で確立」
- 「`result.md` を always 書き、 `result.json` を JSON 検出時のみ書く 2-file 戦略」
- 「executeResult を trigger に result import UI を出す linear flow design — boss が次に何をするか考えなくて済む」
- 「『Content Idea 化は次フェーズ』 を UI で明示する design discipline — staged batch の境界線を user に伝える」
