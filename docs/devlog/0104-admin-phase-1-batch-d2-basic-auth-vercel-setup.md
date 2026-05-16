# Devlog 0104 — Admin Phase 1 Batch D2: Basic Auth Proxy + Vercel Setup Doc

Date: 2026-05-15
Status: **batch-d2-complete / code-ready-for-deploy / no-vercel-project-created / no-dns-change / 13-of-13-local-auth-tests-pass**

## 今日の判断

[docs/60](0102-admin-phase-1-batch-d-deploy-plan.md) で確定した design を実装側に倒した。Next.js 16 で `middleware.ts` が `proxy.ts` にリネームされた事実を docs/proxy.md で再確認し、`dashboard/src/proxy.ts` として Basic Auth proxy を実装。Vercel / DNS は **人間操作で行う前提** で、`docs/61` に exact human steps を残した。実際の deploy はまだしていない。

Activity snapshot は **commit する** 方針に確定: Vercel の Root Directory が `dashboard/` のとき、repo 親階層の `docs/` が build context に含まれないため、build 時 snapshot 生成は silent fail する。`prebuild` hook は追加せず、deploy 前に手動で `npm run build:activity-snapshot` → commit する flow を README に明文化。

## なぜその設計にしたか

- **`middleware.ts` ではなく `proxy.ts`**: Next.js 16 の docs に「The `middleware` file convention is deprecated and has been renamed to `proxy`」と明記。後方互換のために `middleware.ts` でも動く可能性はあるが、deprecated 警告に従い新名称を採用。dashboard の `AGENTS.md` の指示「heed deprecation notices」と整合。
- **「auth env 片方でも欠けたら素通り」**: dev で `npm run dev` する度に Basic Auth ダイアログが出ると friction 高い。両方 set されない限り proxy は素通り。Vercel の Production / Preview だけに env を set する運用と一致。
- **constant-ish time compare**: 文字列比較で early-return 時間漏れを避けるため XOR ループで diff 集約。crypto-grade ではないが、Basic Auth ＋ 個人運用 dashboard の hardening level として妥当。
- **WWW-Authenticate に realm 明記**: ブラウザのネイティブログイン dialog を出すため必須。`charset="UTF-8"` を加えて非 ASCII パスワードへの安全性を担保。
- **matcher で `_next/static` / `_next/image` / `_next/data` / favicon / robots.txt / sitemap.xml / .well-known を除外**: 静的アセットや TLS 証明書発行で 401 出して deploy が壊れるのを防ぐ。`/api/*` は除外 **しない** ので `/api/asset-thumb` も保護される。
- **Activity snapshot を git で追跡**: Vercel "Root Directory: dashboard/" の build context に `docs/` が無いため、build 中の snapshot 生成は不可。「commit する generated file」は通常 anti-pattern だが、Vercel monorepo 構成のコスト/利点トレードオフで採用。README で生成 → commit → push のフローを明示。
- **`prebuild` 不採用**: `npm run build` の依存に snapshot script を入れると、Vercel build で `../docs` が無くて silent に empty を吐く危険。明示的に手動実行に倒す。

## Codex と Claude Code の役割分担（再確認）

| 役割 | 担当 |
| --- | --- |
| `proxy.ts` 実装 / docs/61 起草 / README 改訂 | **Claude Code（本バッチ）** |
| Vercel project 作成 / env value 入力 / DNS 設定 / 実 deploy | **人間**（docs/61 を順に踏む） |
| Sanity Studio で record 編集 | 人間 |

Auth password は **人間が Vercel UI に直接入力**、Claude Code 側には渡さない（secret hygiene）。

## API なしで済ませた理由（再確認）

- proxy は `node:` / external API 一切不要、`atob()` のみ（Edge / Node 両方で global）
- snapshot script は `node:fs` のみ
- LLM API / 画像 API クライアントの repo 追加 0
- Sanity write / mutation / write token usage 0
- Vercel API / CLI を Claude Code から呼んでいない

## このバッチで作ったもの / 変更したもの

### Added — `dashboard/`

- `src/proxy.ts`（Next.js 16 proxy convention、Basic Auth、constant-time compare、matcher で静的アセット除外）

### Added — `docs/`

- `docs/61-admin-phase-1-batch-d2-vercel-setup.md`（A〜I の 9 セクション、Vercel UI 操作 / env / DNS / 検証手順）
- `docs/devlog/0104-admin-phase-1-batch-d2-basic-auth-vercel-setup.md`（本ファイル）
- `docs/handoff/0115-admin-phase-1-batch-d2-basic-auth-vercel-setup.md`

### Modified — `dashboard/`

- `README.md` — Batch D2 をカバー範囲に追加、`Basic Auth proxy` セクション / Vercel deploy 要点 / activity snapshot lifecycle を新規節として追記、Project layout に `proxy.ts` 追加、Next batches を更新

### Modified — `docs/`

- `docs/handoff/latest.md`（本 handoff 0115 にミラー）

### Confirmed unchanged

- `schemas/` 全件 / `sanity.config.ts` / `structure/index.ts` / `tools/`
- root `package.json` / `package-lock.json`
- dashboard `package.json` / `package-lock.json`（**意図的に prebuild 追加なし**）
- 既存 8 page route + `/api/asset-thumb` のコード
- `lib/featureFlags.ts` / `lib/repoRoot.ts` / `lib/sanity.ts` / `lib/groq/campaign.ts`
- 既存 component 群
- 既存 seed / outputs / publish-packages / private / ai-blog-db 関連
- `assets/visuals/` / `patches/` / `assets/inbox/`
- 既存 Sanity dataset record
- DNS / Vercel project（**未作成のまま**）

## Local Auth Test Results

3 mode × 13 個別チェック、**全て期待通り**:

### Mode 1: `ADMIN_BASIC_AUTH_*` 未設定 + dev flags ON（pass-through）

| Path | Expected | Actual |
| --- | --- | --- |
| `/` | 200 | 200 ✓ |
| `/campaigns/building-hitori-media-os` | 200 | 200 ✓ |

### Mode 2: `ADMIN_BASIC_AUTH_USER=admin` `ADMIN_BASIC_AUTH_PASSWORD=test-password-only` + dev flags ON

| Path | Header | Expected | Actual |
| --- | --- | --- | --- |
| `/` | (none) | 401 | 401 ✓ |
| `/` | wrong | 401 | 401 ✓ |
| `/` | correct | 200 | 200 ✓ |
| `/campaigns/building-hitori-media-os` | correct | 200 | 200 ✓ |
| `/api/asset-thumb?path=...png` | correct | 200 | 200 ✓ |
| `/api/asset-thumb?path=...png` | (none) | 401 | 401 ✓ |
| `WWW-Authenticate` response header | — | `Basic realm="Hitori Media OS Admin", charset="UTF-8"` | matched ✓ |
| `/_next/static/chunks/...css` | (none) | 200 (excluded by matcher) | 200 ✓ |
| `/favicon.ico` | (none) | non-401 | 200 ✓ |

### Mode 3: production-like flags + auth set

| Path | Header | Expected | Actual |
| --- | --- | --- | --- |
| `/` | correct | 200 | 200 ✓ |
| `/diagnostics` | correct | 404（flag off） | 404 ✓ |
| `/publish-packages` | correct | 404（flag off） | 404 ✓ |
| `/activity-log` | correct | 200（snapshot） | 200 ✓ |
| `/` | (none) | 401 | 401 ✓ |

→ 13 / 13 pass、proxy が flag より先に走るが flag による 404 が proxy 通過後に正しく返る順序も確認。

## Activity Snapshot Decision Recorded

| 項目 | 決定 |
| --- | --- |
| `public/activity-snapshot.json` の git 追跡 | **commit する**（Vercel build context 制限の都合） |
| `prebuild` hook 追加 | **しない**（`../docs/` 不存在で silent empty fail を防ぐ） |
| Deploy 前の手順 | `cd dashboard && npm run build:activity-snapshot` → commit → push |
| 失念時の挙動 | 古い snapshot がそのまま production に残る（壊れない、stale なだけ） |

将来 Vercel project 設定で「Include source files outside of the Root Directory」を有効にして `../docs` を build context に含める案もあり得るが、Batch D2 では採用せず Batch D3 以降で再評価。

## 連番について

- devlog: 0103 → **0104**
- handoff: 0114 → **0115**
- docs: 60 → **61**

## 発信ネタになりそうな切り口

1. **「`middleware` が `proxy` にリネームされた事実を AGENTS.md と node_modules/dist/docs/ で再確認する」**: training data のままだと壊れる Next.js 16 の breaking change。`heed deprecation notices` を毎バッチ意識する設計。
2. **「両方の env が揃ったときだけ proxy が auth を要求する」**: localhost dev の friction を下げつつ、Vercel の Production / Preview で deploy 直後に守られる。env scope の二段運用パターン。
3. **「constant-ish time compare を 5 行で書く」**: crypto-grade ではないが、文字列比較の early-return 時間漏れを避ける最低限。個人 admin dashboard の hardening level として妥当。
4. **「commit する generated file という妥協」**: 通常 anti-pattern だが、Vercel monorepo 制限 × Sanity 不要の snapshot で正当化される。代替案（Include source files、別 repo 分離、Vercel CLI deploy）の trade-off を docs に残しておく。
5. **「deploy ステップを doc に倒す」**: Claude Code が Vercel UI / DNS を触らない、人間が docs/61 を順に踏む。secret を agent に握らせない設計の延長。

## Safety Verified

- direct Sanity write の grep（dashboard/src）: 0 hits
- paid LLM / image API SDK の grep（dashboard）: 0 hits
- `SANITY_WRITE_TOKEN` / `writeToken` の grep: 0 hits
- `process.env.ADMIN_BASIC_AUTH_PASSWORD` の log / cookie 書き込み: 0 件（proxy.ts 内に `console.log` / `cookies` API 不在）
- `npm run local:check`（root）: 17 ok / 0 fail
- root `npm run build`（Sanity Studio）: 成功
- dashboard `npm run build`（Next.js 16、proxy 含む 10 routes）: 成功
- Vercel deploy 実行: 0 回
- DNS 変更: 0 件
- ai-blog-db 関連: 不変
- 画像生成: 0 件
- schema 変更: 0 件
