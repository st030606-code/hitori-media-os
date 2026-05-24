# Phase 2C-0 implementation — Raw Idea + Idea Development Package

日付: 2026-05-21

## 背景

Phase 2C spec が CONFIRMED 状態に到達 (handoff/0197) → boss が最初の staged sub-batch (**Phase 2C-0: Raw Idea → Idea Development Package**) の implementation を指示。

本 batch は dashboard に「rough idea を保存して、 AI 企画化用の prompt package を local filesystem に書き出す」 surface を追加する Phase 2C 最初の slice。 dashboard が prompt を作り、 boss が手動で ChatGPT / Claude Code / Codex を実行する分業構造を実装で establish する。

## 決定・変更

### 新規 (8 ファイル)

- `dashboard/src/lib/ideaJobs/paths.ts` — filesystem 安全層: ideaSlug 検証、 `idea-jobs/<slug>/<ts>/...` パス build、 traversal / 拡張子 / 絶対パス / null byte / URL encoded reject、 atomic write helper (temp file + rename)、 200 KB / file cap
- `dashboard/src/lib/ideaJobs/promptBuilder.ts` — 入力正規化 + prompt.md / job.json / _raw.json の text render、 suggested CLI command builder (codex / claude / pbcopy 3 種、 表示のみ)
- `dashboard/src/lib/actions/createIdeaDevelopmentPackage.ts` — 'use server'、 preview / execute 2 mode、 enableWriteActions + enableLocalFsRoutes の 2 段 env gate、 metadata-only server log
- `dashboard/src/components/ideas/RawIdeaBuilder.tsx` — 'use client'、 form + preview + execute success panel、 CopyButton で prompt / 3 種 CLI command の clipboard copy
- `dashboard/src/app/ideas/page.tsx` — Server Component、 PageHeader + 説明カード + RawIdeaBuilder
- (上記 8 ファイル中 1 個は既存)

### 更新 (1 ファイル)

- `dashboard/src/lib/navigation.ts` — 知識 & 分析 group に「アイデア開発」 nav item を追加 (Lightbulb icon、 `/ideas`)

### 触らない (Q-2C ハードルール準拠)

- `schemas/` — Sanity schema 不変
- `dashboard/src/lib/sanity*` — Sanity write client 触らず
- `dashboard/src/lib/actions/{updateReactionNotes, updateGateState, approveVisualCandidate, reflectVisualAssetPatch}.ts` — Phase 2B 既存 server action は全 touch なし
- `tools/visual-register/`, `tools/sanity/reflect-*.mjs` — 触らず
- `assets/`, `patches/`, `publish-package/` — 触らず
- `package.json` (root + dashboard) — dependency 追加なし
- 外部 LLM API client (OpenAI / Anthropic / etc.) — 追加なし
- shell execution (`child_process` / `spawn` / `exec*`) — 一切なし

### 既存 23 routes → 24 routes に拡張

`/ideas` を追加。 build 後 route 一覧で確認:

```
✓ Compiled successfully in 1549ms
  Finished TypeScript in 2.3s ...
ƒ /ideas    ← 新規
ƒ /knowledge
ƒ /campaigns
...
```

他 23 routes は不変、 順序保持。 `/visual-assets/[assetId]/candidates` を含む既存 dynamic routes も影響なし。

## 理由

### なぜ filesystem-only raw idea を採用するか (Path A、 Q-2C-2 confirmed)

Phase 2C spec §5 で 3 path を比較 → boss が Path A (filesystem-only raw + contentIdea 流用 schema 不変) を CONFIRMED。 本 batch は spec の意思決定をそのまま実装に落とす:

- `idea-jobs/<slug>/_raw.json` に rough memo を保存 → Sanity 内が structured material のみで埋まる衛生を維持
- 既存 `contentIdea.rawInput` (text rows:6) は promote 時に boss が手動で埋める想定
- 「filesystem 限界が見えた」 と boss が判断したら Phase 2C-X で `rawIdea` doc 新設 (Path C) に昇格する余地を残す

### なぜ 2 段 env gate (enableWriteActions + enableLocalFsRoutes) を要求するか (Q-2C-7 confirmed)

- `enableWriteActions` = Phase 2B master switch、 production deploy で永久 off
- `enableLocalFsRoutes` = Phase 2B-3 で確立した local filesystem 操作の専用 switch
- 両方 ON が dev / localhost でのみ揃う設計 → production write の事故を 2 層で防ぐ
- `SANITY_WRITE_TOKEN` は Phase 2C-0 では **要求しない** (Sanity write を一切行わないため)

これは Phase 2B-3 (Visual approve / register HTTP bridge) と同じ pattern。 Phase 2B-1 / 2B-2 / 2B-3.1 のような Sanity-only action とは AND-gate の構成が違うことを意図的に維持。

### なぜ preview / execute 2 mode を採用するか

Phase 2B 全 sub-batch で確立した「dry-run / execute」 pattern を Phase 2C にも適用:

- **preview**: filesystem 一切触らず、 prompt.md / job.json / _raw.json をメモリ上で render → planned paths + body bytes を表示
- **execute**: env gate 通過後に atomic write (temp file + rename) で 3 ファイルを書き出し

これにより boss が「これでよいか」 を文字通り目視確認してから commit できる。 prompt が weak だった場合は execute 前に form を修正する flow が自然に成立。

### なぜ atomic write (temp file + rename) を選ぶか

filesystem partial write の防止:
- `writeFile(target, content, {flag: 'wx'})` 一発で書くと、 途中で fail した場合に `target` が破損する risk
- temp file `<target>.tmp-<random>` に書いた後 `rename` で原子的に置き換える
- Phase 2B-3 visual register CLI でも同じ pattern (file copy + rename pair) を採用

200 KB / file cap は Phase 2C spec §9 の規定。 roughMemo 自体は 4000 chars cap、 prompt.md は通常 ~5-10 KB に収まる。

### なぜ shell execution を一切しないか (Q-2C-6 confirmed)

dashboard 内で `child_process.spawn` / `exec` を使わない設計は本 sub-batch の必須条件:
- CLI command の表示は **string output のみ**、 「copy → terminal で手動 run」 が前提
- ChatGPT / Claude / Codex への投げ込みも copy → 手動 paste
- これにより:
  - dashboard が AI agent の lifecycle / token / cost を保持しない
  - boss が agent を切り替えやすい (今日は Claude、 明日は Codex)
  - safety review の surface が「filesystem write のみ」 に絞られる

### なぜ server action ログは metadata only か

Phase 2B 全 sub-batch の logging contract を踏襲:
- 書き出さない: roughMemo 本文、 prompt.md 本文、 rawIdeaJson 本文、 sourceContext 本文、 SANITY_WRITE_TOKEN、 OPENAI_API_KEY、 ANTHROPIC_API_KEY (本 batch では env var 自体使わないが、 念のため log にも出さない)
- 書き出す: ideaSlug、 timestamp、 各 file byte 数、 roughMemo の **長さ**、 elapsed ms、 reject reason

将来 audit-log schema (parent Q-4) が land したら永続 audit log に昇格する候補。

### なぜ `/ideas` を独立 route にするか (`/knowledge` tab 拡張ではない)

Phase 2C spec §10-2 で示した 3 tab 構造 (`/knowledge` に Content Ideas / Raw Ideas / In Development の tab) を本 batch では採用 **せず**、 独立 route `/ideas` で start:

- `/knowledge` は読み取り専用 surface (4 doc type の横断閲覧)、 編集 surface と統合すると性質が混在
- Phase 2B-2 で確立した「観察 vs 編集 surface 分離」 原則と整合
- `/ideas` は Phase 2C-0 / 2C-2 / 2C-3 で機能を漸進的に追加する想定の編集 surface
- nav 「知識 & 分析」 group の冒頭に置くことで boss workflow の起点として可視化

将来 boss が「`/knowledge` と統合した方が見やすい」 と判断したら別 batch で tab 化検討。

### なぜ ideaSlug を rawTitle から自動生成 + random suffix fallback にするか

boss が rawTitle を CJK で書いた場合、 そのままだと slug 規則 `^[a-z0-9][a-z0-9-]{0,79}$` を満たせない。 そこで:

- `slugifyTitle()` で ASCII normalize → 空なら fallback `idea-<random6hex>`
- boss が明示的に `ideaSlug` を override する path も残す (将来 UI 拡張で対応、 本 batch は自動生成のみ)
- validateIdeaSlug で最終チェック → regex 不一致なら validation error

これにより日本語タイトルで入れても `idea-3f8a2c/` 等の安全な slug が生成される。

### なぜ result.md / result.json は dashboard が **書かない** か

AI 結果は boss が手動で書き戻す ファイル (`idea-jobs/<slug>/<ts>/result.md` / `result.json`)。 dashboard が空ファイルを先に作っておくと:
- boss が「dashboard が AI を実行した」 と誤解する risk
- 既存 result が boss から見えない問題 (touch だけでは内容空、 atomic write の意味も薄い)

そこで本 batch では **expected paths を表示するのみ**、 実 file は boss が AI agent 実行後に書き戻す。 import (preview) は Phase 2C-0 続編 or Phase 2C-1 で別 server action として実装予定。

### Optional result import slot を本 batch では実装しないか

task §6 で「low-risk なら import slot 追加可」 と書かれていたが、 本 batch では **deferred**:
- import は filesystem read + markdown parse + JSON block 抽出 + preview の組み合わせ、 server action 1 個追加 + UI 1 個追加で 6-8 ファイル相当
- Phase 2C-0 (Raw Idea + Package 書き出し) の core scope を 1 PR 完結に保つため
- Phase 2C-0.1 microbatch or Phase 2C-1 (Campaign creation helper) と並行で扱う方が design discipline が保てる

Success panel に「次の手順」 として「結果を保存したら dashboard `/ideas` 画面で『結果を取り込む』 + Studio で contentIdea を作成」 の文言を入れて future surface を予告。

## 影響

- リポジトリ:
  - `dashboard/src/lib/ideaJobs/paths.ts` (新規 261 行)
  - `dashboard/src/lib/ideaJobs/promptBuilder.ts` (新規 ~280 行)
  - `dashboard/src/lib/actions/createIdeaDevelopmentPackage.ts` (新規 ~190 行)
  - `dashboard/src/components/ideas/RawIdeaBuilder.tsx` (新規 ~370 行)
  - `dashboard/src/app/ideas/page.tsx` (新規 ~80 行)
  - `dashboard/src/lib/navigation.ts` (更新 — 1 nav item 追加 + Lightbulb icon import)
  - schemas / tools / assets / patches / publish-package / package.json: touch なし
  - docs/devlog/0187 + docs/handoff/0198 + docs/handoff/latest.md (本 batch で land)
- ワークフロー:
  - dashboard で「rough idea を入力 → prompt package 書き出し → 手動で AI 実行 → 結果を保存 → (将来) import → Studio で contentIdea」 の前半 stage が動作可能に
  - 24 routes (前 23 routes + `/ideas`)、 build green、 TypeScript clean
  - Phase 2B 既存 surface (`/analytics` / `/human-review-gates` / `/visual-assets/...`) 動作不変
- スキーマ: 不変
- プロダクト方針:
  - 「dashboard が orchestrator、 AI 実行は外部」 という Phase 2C 中心原則が **動く実装**として establish
  - filesystem 安全契約 (4 dir allowlist の中で本 batch は `idea-jobs/` のみ、 拡張子 `.md`+`.json` only、 200 KB cap、 atomic write、 no shell exec、 2 段 env gate) が Phase 2C 系の reusable pattern として確立
  - 「Raw Idea ≠ Content Idea」 「dashboard が doc create しない」 「No-API」 の 3 原則を UI + 説明カード + 推奨 CLI command 表示で boss に明示

## 次の一手

**Option A (推奨) — boss smoke test**

boss が手元で:
1. `cd dashboard && npm run dev` (`.env.local` で `ENABLE_WRITE_ACTIONS=true` + `ENABLE_LOCAL_FS_ROUTES=true` 確認)
2. `/ideas` にアクセス
3. roughMemo に「Phase 2C smoke 用の rough idea」 を入力 (boss の本物 raw idea 推奨、 Q-2C-10 confirmed)
4. 「プロンプトを preview」 → planned paths + prompt body を確認
5. 「アイデアパッケージを作成」 → 3 ファイル書き出しを確認
6. `idea-jobs/<slug>/_raw.json` + `idea-jobs/<slug>/<ts>/prompt.md` + `job.json` の中身を boss が読んで質を判定
7. 「プロンプトをコピー」 → ChatGPT / Claude / Codex に貼り付けて結果を取得
8. `idea-jobs/<slug>/<ts>/result.md` に結果を手動保存
9. (現時点では dashboard で import UI は未実装、 boss が直接 file を read)
10. env flag 片方 off → execute button が disabled になることを確認
11. Phase 2B-1 / 2B-2 / 2B-3 / 2B-3.1 既存動作の regression なしを確認

問題なければ **smoke PASS** を docs に記録、 Phase 2C-0.1 (result import) or Phase 2C-1 (Campaign creation helper) に進む。 問題があれば smoke fix microbatch。

**Option B — Phase 2B-4 Q 確定 microbatch を先行**

Phase 2C-0 smoke と並行で Phase 2B-4 (publish/revision、 handoff/0195) の Q 確定 + implement を進める path。 Phase 2C-4 の prerequisite を解消する利点。

**Option C — Phase 2C-0.1 result import を即追加**

Phase 2C-0 implementation の延長として result.md preview + JSON block 抽出 + Studio deeplink を追加する microbatch。 boss が「import まで揃ってから smoke」 と判断すれば。

発信ネタ案:
- 「dashboard が AI を呼ばないという design 判断 — Phase 2C-0 で prompt package を書き出すだけにした理由」
- 「filesystem-only raw stage を実装してみて見えたこと — Sanity 衛生と experimental velocity の trade-off」
- 「2 段 env gate (enableWriteActions + enableLocalFsRoutes) の役割分担 — Phase 2B-3 pattern を Phase 2C で踏襲する理由」
- 「atomic write (temp file + rename) を Next.js server action に実装する話 — Node fs.promises だけで十分」
- 「`/ideas` を独立 route にした理由 — 観察 vs 編集 surface 分離原則の応用」
- 「ideaSlug を rawTitle から自動生成 + random suffix fallback にする judgement — CJK タイトルへの対応」
- 「『AI 結果は dashboard が書かない』 という small design ethic — boss の手動 paste / save を残す意義」
