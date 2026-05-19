# Devlog 0120 — Working Pipeline Step F: publish-package actual executed

Date: 2026-05-18
Status: **publish-package actual completed / 4 new images copied across 3 platforms / 7-of-7 byte verifications PASS / 0 Sanity write / 0 deploy / 0 auto-post / Step F COMPLETE**

## 今日の判断

Working Pipeline Step F を実行: `npm run publish:package -- building-hitori-media-os` actual。Step E で Sanity 反映が完了している前提で、4 platform 分の publish-packages を生成・更新した。

実際の挙動: **4 new image copies + 0 unintended writes**。
- note: 2 new (note-inline-content-os-flow-v1, note-inline-human-judgment-v1)、既存 hero は skipped
- substack: 1 new (substack-inline-reader-system-v1)、既存 hero は skipped
- threads: 1 new (threads-support-diagram-v1)、threads/.../images/ ディレクトリ新規作成
- x: 0 new (x-hook-main-v1 既存)

skipped 2 record (note-inline-manual-vs-automation-v1 / note-inline-publish-package-folder-v1) は publish-package 出力で TODO として表示されるが、これは仕様通り（Sanity status: skipped で publish-package が source PNG 不在を許容、note 記事は補助図なしで公開可）。

## なぜその設計が回ったか（actual 実行の検証）

- **dry-run と actual が完全一致**: 事前 dry-run の "copied" / "skipped" / "todos" の出力が、actual 実行後の "copied" / "skipped" / "todos" と byte-identical。`replacementCandidates` / `written` / `warnings` も 0 件。サプライズなし。
- **idempotent skip が機能**: 既存 publish-packages の `campaign-hero-v1.png` (2026-05-14 配布) と `x-hook-main-v1.png` (2026-05-14 配布) を **上書きせず** skipped 判定。これは publish-package builder が内容比較で重複検出する設計の通り。
- **threads/images/ ディレクトリの自動作成**: pre-actual 時点で threads/images/ が存在しなかったが、actual 中に `mkdir -p` 相当で自動作成され、`threads-support-diagram-v1.png` (1,224,241 bytes) が copy された。
- **Sanity status: skipped 2 record が publish-package を block しない**: TODO として記録されるが、actual exit code は 0。これは「skipped は仕様、TODO は informational」という publish-package builder の正しい挙動。
- **post-write 検証 7/7 byte match**: 7 image すべて期待 byte 数と一致。recovery 後の真の master (1,331,047 bytes campaign-hero-v1) が note + substack 両方の package で正しく扱われている（既存 copy を上書きせず、内容も同じ）。
- **side effect ゼロ**: `find publish-packages -newer ...` で新規 modified 4 files、すべて期待 copy。`assets/visuals/` / `patches/` / Sanity / `.env.local` / production env vars / Vercel deploy すべて不変。

## なぜその設計にしたか（執行時に再確認）

- **dry-run → actual の 2 段 gate**: actual 直前に dry-run を再実行することで、boss が token を追加した後に何か想定外の変化（例: Sanity 上で別 doc が更新された等）が起きていないかを最終確認。
- **既存 publish-packages の hero を idempotent skip**: 過去配布された hero (1,331,047 bytes) を毎回上書きすると、unnecessary I/O + git diff noise が発生。builder の skip-if-identical logic はこれを正しく避ける。
- **TODO を blocking でなく informational に**: skipped 記録 (note-inline-manual-vs-automation-v1 / note-inline-publish-package-folder-v1) は Sanity で `status: skipped`、その対応 image が `assets/visuals/.../*.png` に存在しないのは仕様。publish-package がこれを fatal error にすると、保留記録があるたびに actual が走らない。warning レベルで TODO 出力する設計が正しい。
- **publish-package builder script を改修しない**: 既に正しく動いている。本 batch は execute のみ。
- **assets/visuals / patches / Sanity を read-only に**: publish-package builder は **filesystem ↔ publish-packages の copy 専用 tool**。source を変えない、Sanity を mutate しない。これは Visual Register approve / Sanity reflection の責務分離と整合。

## Codex と Claude Code の役割分担

| 役割 | 担当 |
| --- | --- |
| 事前 dry-run + 出力 verify | **Claude Code（本バッチ）** |
| `npm run publish:package -- building-hitori-media-os` actual 実行 | Claude Code |
| 7 image byte 検証 | Claude Code（Node script） |
| side effect 監査 (assets/visuals / patches / Sanity / git status) | Claude Code |
| root + dashboard build smoke check | Claude Code |
| devlog 0120 + handoff 0131 起草 + latest.md ミラー | Claude Code |
| release-review 5 markdown 更新 (Step G) | **次バッチ（boss 手動 or Claude Code）** |
| final-human-checklist.md 署名 + 公開予定日 (Step G) | **boss 手動** |
| 実際の manual publish (note / Substack / X / Threads に投稿) | **boss 手動、永続 deferred から外れない** |
| Codex CLI 起動 / 画像生成 / Sanity write / paid API | **0**（本 batch では一切起動していない） |

## API なしで済ませた理由

- 本 batch は filesystem copy + JSON output のみ
- Sanity API: **0 呼び出し**（builder は filesystem を読むだけ）
- paid LLM / image API: **0**
- 新規 npm package: **0**
- Codex / OpenAI: **0**

## このバッチで作ったもの / 変更したもの

### Added — `publish-packages/`

実行で新規作成された 4 file（exit 0、`copied` 配列に記録）:

- `publish-packages/note/building-hitori-media-os/images/note-inline-content-os-flow-v1.png` (1,234,240 bytes)
- `publish-packages/note/building-hitori-media-os/images/note-inline-human-judgment-v1.png` (1,375,682 bytes)
- `publish-packages/substack/building-hitori-media-os/images/substack-inline-reader-system-v1.png` (1,297,423 bytes)
- `publish-packages/threads/building-hitori-media-os/images/threads-support-diagram-v1.png` (1,224,241 bytes、+ 新規 `threads/building-hitori-media-os/images/` ディレクトリ作成)

### Added — `docs/`

- `docs/devlog/0120-working-pipeline-publish-package-actual.md`（本ファイル）
- `docs/handoff/0131-working-pipeline-publish-package-actual.md`

### Modified — `docs/`

- `docs/handoff/latest.md`（本 0131 のミラー）

### Confirmed unchanged

- **publish-package builder script**: `tools/publish-package-builder/build.mjs` — 不変（execute のみ）
- `tools/sanity/reflect-working-pipeline-visual-assets.mjs`, `tools/visual-register/*` — 不変
- schemas / sanity.config / structure / dashboard runtime / proxy.ts / featureFlags.ts
- root + dashboard `package.json` / `package-lock.json`
- `assets/visuals/building-hitori-media-os/` — 6 final PNG byte-identical (Step D recovery 状態維持)
- `patches/visual-assets/building-hitori-media-os/` — 7 patch JSON 不変
- `assets/inbox/generated/.../*.png` — 12 candidate PNG 全 byte-identical
- `seed/` / `outputs/`
- Sanity dataset — **書き込みゼロ**（本 batch では Sanity API を呼んでいない）
- Vercel project / DNS / production env vars / deploy

### Existing publish-packages files NOT touched

publish-package builder が "skipped" 判定した既存 file（上書き禁止が正常動作）:

- `publish-packages/note/building-hitori-media-os/images/campaign-hero-v1.png` (1,331,047 bytes、2026-05-14 配布のまま)
- `publish-packages/substack/building-hitori-media-os/images/campaign-hero-v1.png` (1,331,047 bytes、2026-05-14 配布のまま)
- `publish-packages/x/building-hitori-media-os/images/x-hook-main-v1.png` (655,963 bytes、2026-05-14 配布のまま)
- 各 platform の README.md / article.md / post.md / posts.md / checklist.md / 他 markdown は不変

## 検証結果サマリ

### Pre-actual dry-run

- exit 0, `ok: true`, `dryRun: true`
- planned copies: 4 (note × 2 + substack × 1 + threads × 1)
- planned skipped: 23 (既存 file の idempotent skip、4 priority platform 合計)
- TODOs: 2 (note-inline-manual-vs-automation-v1 / note-inline-publish-package-folder-v1 のソース不在、仕様)

### Actual run

- exit 0, `ok: true`, `dryRun: false`
- 実際 copied: 4 (= planned と完全一致)
- written: 0
- 他 platform (instagram / github / shorts / podcast / youtube) は draft 不在 / visual 不在で 0 copy（warning は出るが exit 0）

### Post-write byte size verification (7/7 PASS)

| Path | Got | Expected |
| --- | --- | --- |
| publish-packages/note/.../campaign-hero-v1.png | 1,331,047 | 1,331,047 ✅ |
| publish-packages/note/.../note-inline-content-os-flow-v1.png | 1,234,240 | 1,234,240 ✅ |
| publish-packages/note/.../note-inline-human-judgment-v1.png | 1,375,682 | 1,375,682 ✅ |
| publish-packages/substack/.../campaign-hero-v1.png | 1,331,047 | 1,331,047 ✅ |
| publish-packages/substack/.../substack-inline-reader-system-v1.png | 1,297,423 | 1,297,423 ✅ |
| publish-packages/x/.../x-hook-main-v1.png | 655,963 | 655,963 ✅ |
| publish-packages/threads/.../threads-support-diagram-v1.png | 1,224,241 | 1,224,241 ✅ |

→ **7 / 7 PASS**。1 件も byte mismatch なし。

### Side effect audit

| 確認対象 | 状態 |
| --- | --- |
| assets/visuals/ | 6 final PNG 全 byte-identical（Step D recovery 状態維持） |
| patches/visual-assets/ | 7 patch JSON 不変 |
| assets/inbox/generated/ | 12 candidate PNG 全 byte-identical、review-manifest 不変 |
| recovery backup file | 残存 (1,297,423 bytes、Step D 時点の forensic backup) |
| Sanity dataset | **書き込みゼロ**（本 batch で Sanity API 呼び出し 0） |
| `.env.local` | Claude Code 編集 0、read-only |
| Vercel / DNS / production env vars / deploy | **未触** |
| Codex CLI | 起動 0 |
| 新規 npm package | 0 |
| auto-post | 0 |

`find publish-packages -newer /tmp/pkg-dryrun-pre-actual.txt -type f` の結果が **正確に 4 件**（期待 copy のみ）。他は touch されていない。

### Build smoke checks

| Check | Result |
| --- | --- |
| root `npm run build`（Sanity Studio） | **green** (8161ms) |
| `cd dashboard && npm run build` | **green** (12 page route + 5 API route + Proxy 不変) |
| publish-package actual exit code | **0** |

## Step F 完了判定

| 条件 | 状態 |
| --- | --- |
| publish-package actual 実行 exit 0 | ✅ |
| note package に hero + 2 inline | ✅ |
| substack package に shared header + 1 inline | ✅ |
| x package に x-hook-main-v1 | ✅ |
| threads package に threads-support-diagram-v1 | ✅ |
| skipped 2 record が package を block しない | ✅ (TODO 出力のみ、exit 0) |
| 7 image byte 検証 | **7 / 7 PASS** |
| assets/visuals / patches / Sanity / Vercel / deploy 不変 | ✅ |
| build (root + dashboard) green | ✅ |

→ **Working Pipeline Step F is COMPLETE.**

## Working Pipeline 進捗

| Step | Action | 状態 |
| --- | --- | --- |
| A | threads-support-diagram-v1 v004 生成 | ✅ |
| B | note-inline-human-judgment-v1 v001 生成 | ✅ |
| C | substack-inline-reader-system-v1 v001 生成 | ✅ |
| D | Visual Register approve & register（mis-mapping detect + recovery 含む） | ✅ |
| D-recovery | substack-header-v1 + substack-inline-reader-system-v1 recovery via replicated logic | ✅ |
| E | Sanity 反映 9 record（atomic、automated、transactionId `spvtGcqRbreWFzrmNCgxGn`） | ✅ |
| **F** | **publish-package actual 実行** | **✅**（本 batch） |
| G | release-review 5 markdown 更新 + final-human-checklist 署名 | **次バッチ** |
| H | working pipeline 完走 → Visual Engine Improvement Phase 再評価 | 別 batch |

→ 残り **G のみ**。

## 発信ネタになりそうな切り口

1. **「dry-run と actual の出力 byte-identical」が嬉しい**: pre-actual dry-run の "copied" list が actual の "copied" list と完全一致。サプライズなしの publish は boss の心理的安全を作る。
2. **「skipped 2 record を blocking 失敗にせず informational TODO に」**: 「全部揃わないと公開できない」設計から離れた小さな決断。working pipeline 完走を優先する哲学の具現化。
3. **「idempotent skip が hero を守る」**: 既存 hero file を毎回上書きせず内容比較で skip。recovery 後の "正しい hero" を消さない設計が偶発的に役立った。
4. **「filesystem だけ触る、Sanity は触らない」**: publish-package builder の責務分離。Visual Register が approve + patch、sanity reflection script が Sanity 更新、publish-package が filesystem copy。各 step が単一責任で動く。
5. **「Working Pipeline 1 周完走目前」**: A → F まで完了、残るは G の release-review markdown 更新 + 署名のみ。10 step ほどの design / generate / approve / recover / sanity / publish の連鎖が完走できる「動く仕組み」 として残った。

## Safety Verified

- direct Sanity write 実行回数: **0** (本 batch 内)
- paid LLM / image API client 追加: **0 件**
- 環境変数変更 / Vercel UI 操作: **0 件**
- 画像生成 / Codex CLI 起動: **0 件**
- schema 変更 / activate / proposed sketch 追加: **0 件**
- assets/visuals / patches / inbox 編集: **0**
- React component / API route / page route 追加: **0**
- 新規 npm package: **0**
- 既存 production dashboard (`app.hitorimedia.com`) の挙動: **不変**
- Visual Register / publish-package builder / sanity reflection script: **全 source 不変**（execute のみ）
- auto-post: **0**
- publish-package actual exit code: **0**
- root `npm run build`（Sanity Studio）: green
- `cd dashboard && npm run build`: green
- post-write byte 検証: **7 / 7 PASS**
