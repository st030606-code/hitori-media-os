# Devlog 0113 — Admin Phase 2A-1: Read-only Candidate Review Implementation

Date: 2026-05-18
Status: **implemented / read-only / 0 write / 0 schema change / 0 sanity write / 0 deploy / 0 new package / 0 image generation**

## 今日の判断

Phase Admin 2A の 1 つ目の implementation batch を出した。dashboard に 2 page + 4 dev-only API + 8 component + 2 lib を追加して、`/visual-assets/[assetId]/candidates` で **v001 / v002 / v003 を side-by-side 比較** できるようにした。書きは一切しない。production-like モードでは filesystem 依存を flag で gate、`LocalModeBanner` で degrade。

最も重要な設計判断:

- **YAML parser は外部 package を入れずに自前実装**。`yaml` package は repo 親階層の `node_modules` から resolve できるが、Vercel の Root Directory `dashboard/` build には届かない。`dashboard/src/lib/frontmatter.ts` に minimal recursive-descent parser を書いて依存 0 を維持（contract の YAML subset で十分動く）。実 4 inbox file への parse は **0 warning** で全 key 正解、本 batch の対面検証で確認。
- **dashboard と Visual Register を import 上で切り離す**。`tools/visual-register/server.mjs` を dashboard から require していない。Phase 2A-1 は inbox を **再実装** で読む。これにより Visual Register process を起動していなくても dashboard が動く（runtime independence）。
- **書き API を一切作らない**。`/api/visual-review/*` を 4 endpoint 作ったが、すべて **GET のみ**。POST / PUT / DELETE を 1 個も生やさず、route ファイル内に書き method を export していない。Phase 2B で同 prefix の下に POST を追加できる名前空間予約として機能。
- **`/api/asset-thumb` の安全パターンを丸ごと継承**。candidate-image route は (1) flag off → 404 / (2) 絶対パス禁止 / (3) `..` traversal 禁止 / (4) prefix limit `assets/inbox/generated/` / (5) ext whitelist / (6) ファイル名 `v00N.png` 必須 / (7) 8 MB cap / (8) resolve 後 root containment 再確認、を順守。さらに `isAllowedCandidateImage` で **ファイル名 pattern も検証**（`prompt.md` や `random.png` を弾く）。Asset-thumb の `assets/visuals/` prefix と **意図的に別 prefix**（inbox 配下のみ）、cross-leak しない。
- **production で page を 404 にせず 200 で degrade**。filesystem API は 404、page は `LocalModeBanner` + `EmptyCandidateState` で「localhost で開け」を案内。404 にすると "実装が壊れている" と誤読されるが、degrade banner なら "そういう設計" と読める。
- **AppNav に `/visual-review` link を追加しない**。Phase 2A-1 のスコープは `/visual-assets/[assetId]*` のみ。`/visual-review/*` 系の page は Phase 2A-2 で導入予定なので、nav link を先に出すと 404 のみが出る link になる。Page 出現と nav 出現は同 batch で揃える。
- **`/api/visual-review/inbox` だけは Phase 2A-1 で実装**。これは page 経由ではなく **scripts / curl からの動作確認** に必要なので、API だけ先行で投入。
- **page 内で API を経由せず inboxReader を直接呼ぶ**。Next.js Server Component なので自己 fetch round-trip を避け、`readAssetCandidates` を server で直接呼ぶ。API は外部 curl / 将来 Phase 2A-2 component などのため。
- **assetId 文字列の parse を最初の dot 1 つだけで切る**: `visualAssetPlan.<campaign>.<asset>` で `prefix.dot.rest` の rest を最初の dot で切る。両側 slug を `/^[a-z0-9][a-z0-9-]*$/` で validate。これ以上柔軟にすると ambiguity が出る（現状の slug 命名規約には十分）。
- **35 点 rubric の score 色分けを既存パレットに揃える**: 24+ emerald / 18-23 amber / <18 rose、既存 `StatusBadge` と同じ tailwind family。Phase 2A は score 表示のみ、Human override は disabled の DeferredActionButton。

## なぜその設計にしたか

- **frontmatter parser を自作した理由**: 「no new package」制約と Vercel Root Directory の制約を両立する唯一の道。`yaml` package を入れると `dashboard/package.json` に dep 追加が必要、それは「絶対に必要なら」という条件付きで許容されるが、本 batch の YAML subset は ~120 行で安全に実装できる。parse 失敗時は `{ok:false, value:{}, warnings}` で graceful degrade、abort せず docs/65 §5 の contract を満たす。
- **inboxReader を独立ファイルにした理由**: page と API の **両方** が同じロジックを使うため。1 箇所に集中させて security path validation を二重に書かない。`isAllowedCandidateImage` のような関数を export して、candidate-image route 内で再利用。
- **PNG dimensions を自前で**: `image-size` package を入れずに、PNG signature + IHDR の 24 bytes だけ読む。candidate v00N は PNG 限定運用（生成 pipeline からそう）、ヘッダだけ peek。それ以外の拡張子は `null` dimensions で OK。
- **`/api/visual-review/inbox` を Phase 2A-1 に入れた**: page `/visual-review` は 2A-2 で来るが、API は curl で振る舞いを確認したい。「実装した route が一覧で見える」のはセキュリティ・運用観点で価値が高い。
- **AppNav 更新を見送った**: 一度 nav に Visual Review を入れたが、page がない状態で click が 404 になるので revert。Phase 2A-2 で page と nav を **同時に** 出す方が boss から見て一貫。
- **書き label を UI に置いた（Approve & register / Mark needs regeneration / Regenerate prompt preview）**: 既に **Phase 2B disabled** で 3 button 並べている。次の phase で何ができるようになるかが boss から見える。これが Phase 2B の trigger 議論を呼ぶ。
- **既存 `/visual-assets` listing を 1 列だけ拡張**: `Review` 列を追加して `候補を見る` link を貼った。本体テーブルは触らず、追加列だけ。既存挙動の不変条件を守りつつ次の入口を作る。
- **`/visual-assets/[assetId]` を新規 detail page にした**: 既存 listing から 1 click で行ける landing。候補 page との中継としても機能、Sanity metadata だけで production で開ける。
- **`<img>` を `next/image` ではなく素のまま使う**: 既存 `/api/asset-thumb` の慣行と一致。dev-only PNG preview なので Next.js image optimization を経由する意味がない（むしろ動かないリスクがある）。

## Codex と Claude Code の役割分担

| 役割 | 担当 |
| --- | --- |
| frontmatter.ts + parser sanity test | **Claude Code（本バッチ）** |
| inboxReader.ts + PNG dims peek + asset id derivation | Claude Code |
| visualAssetPlanByIdQuery + VisualAssetPlanDetail type 追加 | Claude Code |
| 4 dev-only GET API（inbox / assets-candidates / candidate-image / review-manifest） | Claude Code |
| 8 component（VisualAssetHeader / CandidateGrid / CandidateCard / CandidatePreview / LocalModeBanner / DeferredActionButton / EmptyCandidateState / CandidateStatusBadge） | Claude Code |
| 2 page（`/visual-assets/[assetId]`, `/visual-assets/[assetId]/candidates`） | Claude Code |
| 既存 `/visual-assets/page.tsx` に Review 列 1 個追加 | Claude Code |
| 9 curl 機能テスト + 9 security 攻撃テスト + 7 production-like テスト | Claude Code |
| Phase 2A-2 component / `/visual-review/*` page | **将来バッチ** |
| 書き action（approve & register など）の実装 | **Phase 2B 着手バッチ** |
| Auth 切替（Basic Auth → real Auth） | **Phase 2C 着手前の別 batch** |
| Codex CLI 実行 / 画像生成 | **0**（本 batch では起動していない） |

## API なしで済ませた理由

- 既存 Sanity read token / ChatGPT OAuth はそのまま、新規認証情報追加 0
- paid LLM / image API integration 追加 0
- 新規 npm package 追加 0（yaml parser は自前）
- Codex / OpenAI / Sanity write の呼び出し 0
- Visual Register process を起動せず（API 移植は code 上で独立に再実装）
- Auth 設計は別 batch（docs/66 候補）

## このバッチで作ったもの / 変更したもの

### Added — `dashboard/src/lib/`

- `frontmatter.ts`（minimal YAML splitter + parser、~165 行、依存 0）
- `inboxReader.ts`（filesystem reader + asset id derivation + PNG dims peek + path validation、~280 行）

### Added — `dashboard/src/app/api/visual-review/`

- `inbox/route.ts`（GET）
- `assets/[assetId]/candidates/route.ts`（GET）
- `candidate-image/route.ts`（GET、`/api/asset-thumb` の security pattern を拡張）
- `review-manifest/route.ts`（GET）

### Added — `dashboard/src/components/visual-review/`

- `VisualAssetHeader.tsx`
- `CandidateGrid.tsx`
- `CandidateCard.tsx`
- `CandidatePreview.tsx`
- `LocalModeBanner.tsx`
- `DeferredActionButton.tsx`
- `EmptyCandidateState.tsx`
- `CandidateStatusBadge.tsx`

### Added — `dashboard/src/app/visual-assets/[assetId]/`

- `page.tsx`（asset detail landing）
- `candidates/page.tsx`（v00N side-by-side review）

### Modified — `dashboard/src/`

- `app/visual-assets/page.tsx`（既存 listing に "Review" 列を追加、`Link` import 追加。本体テーブル本流は不変）
- `lib/groq/campaign.ts`（`visualAssetPlanByIdQuery` + `VisualAssetPlanDetail` 型を追加。既存 query / 型は不変）

### Confirmed unchanged

- `dashboard/src/proxy.ts`（Basic Auth 不変）
- `dashboard/src/lib/featureFlags.ts`（既存 flag を流用、新規追加 0）
- `dashboard/src/lib/sanity.ts` / `lib/repoRoot.ts`（不変）
- 既存 8 page route の挙動: `/`, `/campaigns`, `/campaigns/[slug]`, `/diagnostics`, `/human-review-gates`, `/publish-packages`, `/activity-log`, `/visual-assets` listing（listing は表 column 追加のみ）
- `/api/asset-thumb` の挙動
- `dashboard/package.json` / `package-lock.json`（**新規 dependency 0**）
- `schemas/` 全件、`sanity.config.ts`, `structure/index.ts`
- `assets/visuals/` / `patches/` / `seed/` / `outputs/` / `publish-packages/` / `private/`
- `assets/inbox/generated/` の candidate PNG bytes / md 本文（前 batch で frontmatter は既に追加、本 batch では touch していない）
- Sanity dataset（mutation 0）
- Vercel project / DNS / production env vars / deploy（**未触**）
- Visual Register `tools/visual-register/server.mjs`（**不変**）

## 動作確認サマリ

### Local mode（ENABLE_LOCAL_FS_ROUTES=true、port 3401）

| Test | Expected | Actual |
| --- | --- | --- |
| `GET /visual-assets/<threads>/candidates` | 200 + 3 candidates | **200** |
| `GET /api/visual-review/assets/<threads>/candidates` | 200, candidates=3, v001-v003 各 dims/size | **200, 3 cand, 1080×1350 / 1117386b / 1170769b / 1155943b** |
| `GET /api/visual-review/candidate-image?path=...v001.png` | 200 + image/png + 1.07MB | **200, image/png, 1,117,386 bytes** |
| `GET /api/visual-review/inbox` | 200, count=4 (note-hero, note-inline, threads-support, x-hook) | **200, count=4** |
| `GET /api/visual-review/review-manifest?slug=building-hitori-media-os` | 200 | **200** |
| `GET /visual-assets/<note-inline>/candidates` | 200 + empty state | **200** |
| `GET /api/visual-review/assets/<note-inline>/candidates` | 200, candidates=0, hasPrompt=true | **200, 0 cand, hasPrompt=true, hasReview=true** |
| `GET /visual-assets` (既存 listing) | 200, 挙動不変 | **200** |

### Security checks

| Attack | Expected | Actual |
| --- | --- | --- |
| `?path=../package.json` | 4xx | **403** |
| `?path=/etc/passwd` | 4xx | **400** |
| `?path=assets/visuals/...campaign-hero-v1.png` (final asset) | 4xx | **403** |
| `?path=assets/inbox/generated/../../package.json` (encoded traversal) | 4xx | **400** |
| `?path=...prompt.md` (wrong ext) | 415 | **415** |
| `?path=.../random.png` (wrong filename pattern) | 415 | **415** |
| invalid assetId (no prefix) | 400 | **400** |
| invalid assetId (no dot) | 400 | **400** |
| non-existent slug | 200 + empty (not 500) | **200, 0 cand, hasPrompt=false** |

### Production-like mode（ENABLE_LOCAL_FS_ROUTES=false、port 3402）

| Test | Expected | Actual |
| --- | --- | --- |
| `/visual-assets/<threads>/candidates` | 200 + degrade banner | **200**, "Local candidate review unavailable in production mode" 表示, EmptyCandidateState `local-only` 描画 |
| `/api/visual-review/assets/.../candidates` | 404 | **404** |
| `/api/visual-review/candidate-image?path=...` | 404 | **404** |
| `/api/visual-review/inbox` | 404 | **404** |
| `/api/visual-review/review-manifest` | 404 | **404** |
| `/visual-assets` (既存 listing) | 200, 挙動不変 | **200** |

→ 全 31 chain pass。

## 既知の制限 / 次に解消すべき項目

- **`/visual-review/*` page 系は未実装**。Phase 2A-2 で `/visual-review`, `/visual-review/inbox`, `/visual-review/inbox/[candidateId]` を投入する際に AppNav に "Visual Review" link を追加予定。
- **CandidateDetailPanel / ReviewRubricPanel / SuggestedActionPanel / VisualModuleChecklist / PromptSummaryBlock / StyleAnchorList は未実装**（Phase 2A-2）。本 batch の `/visual-assets/[assetId]/candidates` は **prompt context** と **review rubric default** を inline section として表示しているが、candidate-level の rubric 入力 UI は未実装。
- **`/content-packages/*` 系は未実装**（Phase 2A-3）。
- **生成済みの 4 inbox folder のうち、`note-hero-v1` と `x-hook-main-v1` には prompt.md / review.md frontmatter が **無い**。dashboard はこの 2 件を inbox listing には拾うが、`hasPrompt: false` / `hasReview: false` として degrade 表示する。frontmatter mini-batch は新規 candidate に対して優先適用、過去 candidate へは別判断（採用済みなので review UI で扱う必要が低い）。
- **score 入力 UI / approve action / Sanity mutation はすべて Phase 2B 以降**。本 batch では `DeferredActionButton` で disabled として表示。
- **build 時 turbopack の "Encountered unexpected file in NFT list" warning** は既存（activity-log の filesystem read 由来）、本 batch では新規発生なし、build success には影響しない。

## 発信ネタになりそうな切り口

1. **「YAML parser を自前で書く」判断**: 既存 package を入れる vs 自作、依存ゼロ運用 + Vercel build context の制約を満たす自作の合理性。~120 行で済む subset を見極める設計。
2. **「dashboard と Visual Register を兄弟プロセス化」**: filesystem を共有しつつ code は別。new tool への移行で **旧 tool を import で抱え込まない** 原則。1 process 落ちても他が生きる。
3. **「production で 404 ではなく 200 + degrade banner」**: 実装が壊れていないことを UI で示す。404 だと「URL を間違えた / 機能がない」と誤読、200 + 説明だと「設計通りの degrade」と読める。
4. **「`DeferredActionButton` で未来を見せる」**: 未実装機能を UI 上に "近い未来の form" として disabled で置く。boss が次の phase で何ができるかを 1 画面で読める scope の透明性。
5. **「既存 `/api/asset-thumb` の security pattern を継承」**: 1 度書いた攻撃面の防御を新 endpoint で複製、prefix だけ変える。security 観点で新しい思考をしないことが正しい。

## Safety Verified

- direct Sanity write を含むコード変更: **0 件**（client.create / patch / commit / mutate / transaction の grep 0 hits）
- paid LLM / image API client 追加: **0 件**（imports 0）
- 環境変数変更 / Vercel UI 操作: **0 件**
- 画像生成 / Codex CLI 起動: **0 件**
- schema 変更 / activate / proposed sketch 追加: **0 件**
- assets/visuals / patches / Sanity / publish-packages: **不変**
- 新規 npm package: **0**（dashboard/package.json 不変）
- 既存 production dashboard (`app.hitorimedia.com`) の挙動: **不変**（次回 deploy までは production 上の routes も増えない）
- Visual Register (`tools/visual-register/`) の挙動: **不変**（import / 起動 0 回）
- root `npm run local:check`: **17 ok / 0 fail**
- root `npm run build`（Sanity Studio）: **green**
- `cd dashboard && npm run build`: **green** (TypeScript clean、12 page route + 5 API route 認識)
- Local mode curl tests: **8/8 pass**
- Security checks: **9/9 pass**（path traversal / absolute / wrong prefix / wrong ext / wrong filename / invalid id × 各種）
- Production-like mode curl tests: **6/6 pass**
