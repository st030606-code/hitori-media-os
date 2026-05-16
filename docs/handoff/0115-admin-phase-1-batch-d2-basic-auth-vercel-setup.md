# Handoff: Admin Phase 1 — Batch D2 (Basic Auth Proxy + Vercel Setup Doc)

Date: 2026-05-15
Status: **batch-d2-complete / code-ready / no-deploy / 13-of-13-local-auth-tests-pass / docs/61-ready-for-human-deploy**

## 1. Task Goal

[docs/60 §6 / §7 / §8 / §9.2](../60-admin-phase-1-batch-d-deploy-plan.md) で確定した Batch D2 を実装。Vercel project は作成せず、middleware（Next.js 16 の名称: `proxy`）と Vercel UI 手順 doc に倒した。Deploy は依然として人間操作。

## 2. Constraints Followed

- deploy していない（Vercel project 0 / DNS 0 / Vercel CLI 0）
- `dashboard/` subdirectory + `docs/` 以外の root を触っていない
- Auth provider 追加なし（Basic Auth proxy のみ）
- Sanity write token usage 0
- Sanity mutation 0
- OpenAI / Anthropic / paid image API クライアント 0
- auto-postingなし
- `schemas/` / `structure/` / `sanity.config.ts` / `tools/` 不変
- `assets/visuals/...` / `patches/...` / `assets/inbox/` 不変
- 画像生成 0 件
- 既存 8 page route + `/api/asset-thumb` を破壊していない（local mode で 200 維持を curl 確認）
- root `npm run build` (Sanity Studio) green を維持

## 3. Changed Files

### Added — `dashboard/`

- `src/proxy.ts` — Next.js 16 proxy convention（旧名 middleware）。Basic Auth、constant-ish-time compare、matcher で静的アセット除外。

### Added — `docs/`

- `docs/61-admin-phase-1-batch-d2-vercel-setup.md` — Vercel UI / env / DNS / 検証手順
- `docs/devlog/0104-admin-phase-1-batch-d2-basic-auth-vercel-setup.md`
- `docs/handoff/0115-admin-phase-1-batch-d2-basic-auth-vercel-setup.md`

### Modified — `dashboard/`

- `README.md` — Batch D2 をカバー範囲に追加、`Basic Auth proxy` セクション / Vercel deploy 要点 / activity snapshot lifecycle を新規追記、Project layout に `proxy.ts` 追加、Next batches を更新

### Modified — `docs/`

- `docs/handoff/latest.md`（本 0115 にミラー）

### Confirmed unchanged

- `schemas/` 全件 / `sanity.config.ts` / `structure/index.ts` / `tools/`
- root `package.json` / `package-lock.json`
- dashboard `package.json` / `package-lock.json`（**意図的に `prebuild` を追加しない**）
- 既存 8 page route + `/api/asset-thumb` のコード
- 既存 component / lib（featureFlags / repoRoot / sanity / groq）
- 既存 seed / outputs / publish-packages / private / ai-blog-db
- `assets/visuals/` / `patches/` / `assets/inbox/`
- 既存 Sanity dataset record
- Vercel project / DNS / Auth env 値（**未設定**）

## 4. Summary of Changes

### A. `src/proxy.ts`（Next.js 16 proxy）

実装ハイライト:

- `ADMIN_BASIC_AUTH_USER` + `ADMIN_BASIC_AUTH_PASSWORD` 両方 set → Basic Auth 要求
- どちらか欠ければ素通り（localhost dev friction を下げる）
- `atob()` で base64 デコード（Edge / Node 両方で global）
- constant-ish-time XOR diff loop で文字列比較
- 401 時に `WWW-Authenticate: Basic realm="Hitori Media OS Admin", charset="UTF-8"` ヘッダ
- Cookie / session 一切なし、credential を log / cookie に書き出さない
- matcher で `_next/static` / `_next/image` / `_next/data` / `favicon.ico` / `robots.txt` / `sitemap.xml` / `.well-known/` を除外
- `/api/*` は **除外しない** ので `/api/asset-thumb` も保護される

### B. `docs/61` — Vercel setup doc

9 セクション (A〜I):

- **A**: 事前に `npm run build:activity-snapshot` を走らせて snapshot を refresh
- **B**: Vercel project 作成（Root Directory: `dashboard/`、Framework: Next.js）
- **C**: 環境変数 8 件（NEXT_PUBLIC_SANITY_* / SANITY_READ_TOKEN / ADMIN_BASIC_AUTH_* / ENABLE_DIAGNOSTICS / ENABLE_LOCAL_FS_ROUTES / ACTIVITY_LOG_MODE）+ 設定しないもの（write token / OPENAI_API_KEY 等）
- **D**: ドメイン `app.hitorimedia.com` 追加 + DNS 設定 + 証明書発行
- **E**: 初回 deploy 手順 + secret 漏れチェック
- **F**: post-deploy 検証 8 項目
- **G**: パスワード / token rotation
- **H**: scope 外（multi-user / public site / write API / auto-posting）
- **I**: 次バッチ Batch D3 への引き継ぎ

### C. Activity snapshot 決定

- `public/activity-snapshot.json` は **git で追跡**（Vercel Root Directory: `dashboard/` で `../docs/` が build context 外）
- `prebuild` hook は **追加しない**（silent empty fail 防止）
- Deploy 前 flow: `cd dashboard && npm run build:activity-snapshot` → commit → push（README に明文化）

### D. Local Auth Test Results — 13 / 13 pass

3 mode で curl 検証:

**Mode 1 (auth env 未設定 + dev flags ON)**:
- `/` → 200 ✓
- `/campaigns/[slug]` → 200 ✓

**Mode 2 (auth env set + dev flags ON)**:
- `/` no header → 401 ✓
- `/` wrong → 401 ✓
- `/` correct → 200 ✓
- `/campaigns/[slug]` correct → 200 ✓
- `/api/asset-thumb?path=...png` correct + flags on → 200 ✓
- `/api/asset-thumb?path=...png` no auth → 401 ✓
- `WWW-Authenticate` header: `Basic realm="Hitori Media OS Admin", charset="UTF-8"` ✓
- `/_next/static/chunks/...css` no auth → 200 ✓（matcher 除外）
- `/favicon.ico` no auth → 200 ✓（matcher 除外）

**Mode 3 (production-like flags + auth set)**:
- `/` correct → 200 ✓
- `/diagnostics` correct → 404 ✓（flag off）
- `/publish-packages` correct → 404 ✓（flag off）
- `/activity-log` correct → 200 ✓（snapshot mode）
- `/` no auth → 401 ✓

### E. Validation Results

- dashboard `npm run build`: ✓ 10 routes + `ƒ Proxy (Middleware)` line
- root `npm run build` (Sanity Studio): ✓ green
- root `npm run local:check`: ✓ 17 ok / 0 fail
- `console.log(.*password|.*PASSWORD|.*token|.*TOKEN)` grep in dashboard/src: 0 hits
- `cookies\(\)` grep in proxy.ts: 0 hits
- `SANITY_WRITE_TOKEN` / `writeToken` grep: 0 hits

## 5. Important Decisions

- **`proxy.ts` (Next.js 16) を採用**: `middleware.ts` は deprecated。`AGENTS.md` の指示 "heed deprecation notices" と整合
- **両方の env 揃わなければ素通り**: localhost dev friction を下げる、Vercel の Production / Preview だけに env を set する
- **constant-ish time compare**: crypto-grade ではないが、文字列比較の早期 return 時間漏れを避ける最低限
- **matcher で `/api/*` を除外しない**: `/api/asset-thumb` も保護
- **`public/activity-snapshot.json` を commit**: Vercel monorepo 制限への対応、anti-pattern を意図的に採用
- **Vercel project / DNS / Auth password を人間に倒す**: secret を agent に渡さない、deploy 操作を agent に任せない
- **`docs/61` を 9 セクション構成にする**: A〜I で順に踏める checklist、各セクションが独立して再実行可能

## 6. Human Review Questions

- Vercel Hobby Free で deploy する想定で良いか？ Pro なら Vercel Password Protection に切替する価値があるか？
- Basic Auth password の長さ / 形式は ?（推奨: 24 文字以上の random、`openssl rand -base64 24 | tr -d '/+=' | head -c 24`）
- Activity snapshot を毎 deploy 前に refresh する運用が許容できるか？ それとも別の自動化を Batch D3 で入れたいか？
- `/diagnostics` を production で完全 404 する方針で OK か？ 緊急時に有効化したいケースはあるか？
- `app.hitorimedia.com` の DNS は Cloudflare 経由か、registrar 直か？ Cloudflare 経由なら proxy 設定 (Orange / Grey) を Batch D3 で確認

## 7. Risks or Uncertainties

- **`public/activity-snapshot.json` の commit 忘れ**: 古い snapshot が production に残る。最大の影響は `/activity-log` の表示が古いだけで、機能としては動く
- **Vercel build に `../docs/` を含めたくなった場合**: 「Include source files outside of the Root Directory」を有効化する選択肢があるが、build size が膨らむ trade-off。Batch D3 以降に再評価
- **Cloudflare proxy 経由で Basic Auth が干渉する可能性**: 通常 Cloudflare は `Authorization` header を pass-through するが、`Cache Reserve` / `Tiered Cache` が ON だと壊れる事例あり。Batch D3 で確認
- **Vercel preview branch URL が複数発生**: ブランチごとに `<branch>.app.vercel.app` URL が発行され、同じ Basic Auth で守られる。robots.txt は matcher 除外で配信されるので noindex を `app/robots.ts` 系で別途検討
- **Basic Auth credentials のブラウザキャッシュ**: realm 文字列で識別、rotation 時に realm を bump する運用を README / docs/61 に明記済
- **proxy が Edge runtime で動く前提**: Next.js 16 の proxy は Edge default。`Buffer` / `node:fs` 等を proxy 内で使うと壊れる。今回は `atob()` のみ使用、Edge / Node 両方で動く

## 8. Recommended Next Step

### Immediate Human Actions（順序厳守）

1. **`docs/61` を頭から読む** — A 節から I 節まで
2. **A 節**: `cd dashboard && npm run build:activity-snapshot` で snapshot を refresh
3. **A 節**: 生成された `dashboard/public/activity-snapshot.json` を git commit して push
4. **B 節**: Vercel project を新規作成（Root Directory: `dashboard/`）。**まだ deploy しない**
5. **C 節**: 環境変数 8 件を Production / Preview / Development scope に設定
6. **C 節**: `SANITY_READ_TOKEN` を Sanity manage で発行（viewer role）してから Vercel UI に貼り付け
7. **C 節**: Basic Auth password を `openssl rand -base64 24 | tr -d '/+=' | head -c 24` で生成して Vercel UI に貼り付け
8. **D 節**: domain `app.hitorimedia.com` を追加、registrar の DNS で CNAME / A を設定
9. **E 節**: 初回 deploy を trigger、build log を眺めて secret 漏れがないことを確認
10. **F 節**: 8 項目の post-deploy 検証を実行

### Next Implementation Batch — **Batch D3**（post-deploy verification）

deploy 成功後、以下を別 batch で実施:

1. 8 page route + `/api/asset-thumb` 全部 curl して期待 HTTP code 確認
2. `<view-source>` で `SANITY_READ_TOKEN` `ADMIN_BASIC_AUTH_PASSWORD` `OPENAI_API_KEY` が客側 bundle に漏れていないか grep
3. AppNav の link 数が production mode の期待値（5 link、`/diagnostics` `/publish-packages` 非表示）と合致するか
4. Cloudflare 経由なら `Cache-Control` / `Authorization` の挙動を確認
5. Vercel build artifact から `public/activity-snapshot.json` が含まれていることを確認
6. `app.hitorimedia.com` の TLS 証明書 / HSTS / preload status を確認
7. `/sitemap.xml` `/robots.txt` `/.well-known/*` が認証なしで配信されているか（matcher 除外）
8. preview branch deploy も同じ password で守られているか

### Mid-term

- Phase Admin 2（real Auth、Visual Register dashboard 統合）の design batch
- public site `hitorimedia.com` 着手判断
- `tools/campaign-plan/sync-state.mjs` の概念 sketch（campaign stale 自動 reconciliation）
- 残り 5 visual の生成サイクル

### Deferred（永続）

- paid LLM / image API integration
- auto-posting / automated publish
- AI auto-review of drafts
- multi-user / collaboration tooling
- billing / paid tier
- analytics fetch / charts
- public site の content source 決定

## 9. Exact Prompt to Give Codex Next

```text
Run Phase Admin 1 — Batch D3: post-deploy verification of app.hitorimedia.com.

Hard Rules:
- Do NOT modify schemas/, structure/, sanity.config.ts, tools/.
- Do NOT modify dashboard/src/ unless fixing a bug surfaced by the verification.
- Do NOT add Auth provider changes.
- Do NOT add Sanity write token usage.
- Do NOT add Sanity mutations.
- Do NOT add OpenAI / Anthropic API clients.
- Do NOT add paid API integrations.
- Do NOT auto-post.
- Do NOT modify assets/visuals or patches.
- Do NOT generate images.

Prerequisite:
- Human has deployed dashboard to app.hitorimedia.com per docs/61.
- ADMIN_BASIC_AUTH_USER and ADMIN_BASIC_AUTH_PASSWORD are set in Vercel.
- Human has shared verification user/pass via secure channel (not in chat).

Tasks:
1. Read docs/61 §F (post-deploy checks).
2. Walk through each verification point. For each, document expected vs actual.
3. If discrepancies found, file them as Issues / TODO in docs/devlog with severity.
4. Confirm no secrets leak in production page source via `<view-source>` or curl-then-grep.
5. Confirm Vercel build log did not print SANITY_READ_TOKEN or ADMIN_BASIC_AUTH_PASSWORD.
6. Confirm DNS / TLS / cert chain via curl -vI https://app.hitorimedia.com/.
7. Write docs/devlog/0105-* and docs/handoff/0116-*.
8. Mirror to docs/handoff/latest.md.

Do NOT take destructive action on Vercel project, DNS, or Sanity.
If verification fails, stop and surface the failure rather than auto-fix.
```
