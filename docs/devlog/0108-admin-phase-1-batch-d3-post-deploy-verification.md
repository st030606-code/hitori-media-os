# Devlog 0108 — Admin Phase 1 Batch D3: Post-deploy verification of app.hitorimedia.com

Date: 2026-05-16
Status: **production-live / basic-auth-active / dev-only-routes-gated / tls-valid / leak-check-clean**

## 今日の判断

[docs/61](../61-admin-phase-1-batch-d2-vercel-setup.md) §F の post-deploy verification checklist を、production の `https://app.hitorimedia.com` に対して実行。Claude Code は production credentials を持たないため、**anonymous な HTTP HEAD と TLS 検査 + repo 内 secret grep** に絞った read-only verification を行った。Basic Auth 後のログイン UI 動作は **人間が確認済み**で、その結果を本 doc に記録する。

主要な観察:

- `/` への anonymous request は **401 + `WWW-Authenticate: Basic realm="Hitori Media OS Admin"`** で proxy が正しく fire。
- `/diagnostics` `/publish-packages` `/api/asset-thumb` も anonymous で **401**（proxy が flag-off の 404 ロジックより先に走る、2 段防御）。
- `/favicon.ico` は **200**（matcher 除外、auth 不要、公開資産）。
- `/robots.txt` `/sitemap.xml` は **404**（matcher 除外で auth は要求されないが、ファイル自体は配置していない — 意図通り）。
- TLS は **TLSv1.3 / Let's Encrypt R13 issuer / Aug 14 2026 expire / SAN match**、HSTS `max-age=63072000`（2 年）も発行。
- repo 内の secret leak grep（`SANITY_WRITE_TOKEN` / `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / 直 Sanity mutation / 既知 token shape / env / private / node_modules / `.claude/` / `.vercel/` / POTA sibling）すべて **0 hits**。docs 内のヒットは "do not add" 文脈のみで、実 token ではない。

## なぜその設計にしたか

- **anonymous-only の HTTP check**: Claude Code に credentials を渡さないことで「agent が production を意図せず触る」リスクをゼロに。Basic Auth 後の UI 動作は人間判断で確認、agent はその report を docs に転記。
- **`-vI` の TLS chain 抜粋を sanitize**: cert subject / issuer / expire / SAN は公開情報なので転記、private key / 接続元 IP 等は意図的に grep で落とした。
- **`git grep -nI` で docs と code を区別せず一括 grep**: 「コード内に embed」と「docs 内に文脈引用」の両方を見つける。今回は docs hit のみ、code hit はゼロを確認。
- **2 段防御（proxy 401 → page 404）を明文化**: anonymous で 401、authenticated で 404。dev-only route を defense-in-depth で守る現状の設計が production で動作している、と record する。

## Codex と Claude Code の役割分担（再確認）

| 役割 | 担当 |
| --- | --- |
| anonymous HTTP HEAD / TLS 検査 / repo grep / docs 起草 / commit + push | **Claude Code（本バッチ）** |
| Basic Auth 後の UI 動作確認 / Vercel build log の secret 漏れ目視 | 人間（人間からの report を本 doc に転記） |
| Sanity dataset / Vercel project / DNS / Auth password | 触らない |

## このバッチで作ったもの / 変更したもの

### Added — `docs/`

- `docs/devlog/0108-admin-phase-1-batch-d3-post-deploy-verification.md`（本ファイル）
- `docs/handoff/0119-admin-phase-1-batch-d3-post-deploy-verification.md`

### Modified — `docs/`

- `docs/handoff/latest.md`（0119 のミラー）

### Confirmed unchanged

- code（schemas / tools / dashboard/src / sanity.config / structure / proxy.ts 等）— 1 byte も変えていない
- assets / patches / seed / private / publish-packages — 不変
- `npm run local:check` 17/17 green、`npm run build`（Sanity Studio）green、`dashboard/ npm run build` green
- Vercel project / DNS / Auth secrets — 触らない
- POTA_Empire/.git — 不変
- 兄弟 POTA project — 不変

## Verification Matrix（本バッチで集約）

### A. Human-confirmed in browser

| 項目 | 結果 |
| --- | --- |
| `https://app.hitorimedia.com/` Basic Auth dialog 表示 | ✓ 表示された |
| 認証成功後 Dashboard render | ✓ render された |
| `/campaigns/building-hitori-media-os` render | ✓ render された |
| `/diagnostics` 認証後 404 | ✓ 404 |
| `/publish-packages` 認証後 404 | ✓ 404 |
| Vercel domain status | ✓ Valid Configuration |
| DNS provider | Cloudflare（CNAME / A 設定済） |
| `hitorimedia.com` root | 未着手（public site は将来別 project） |

### B. Anonymous HTTP HEAD (Claude Code が curl で確認、credentials 不送信)

| Route | Expected | Actual |
| --- | --- | --- |
| `GET /` | 401 + WWW-Authenticate | **HTTP/2 401** ✓、`www-authenticate: Basic realm="Hitori Media OS Admin", charset="UTF-8"` ✓ |
| `GET /favicon.ico` | non-401（matcher 除外） | **HTTP/2 200**、`image/vnd.microsoft.icon` ✓ |
| `GET /robots.txt` | non-401（matcher 除外） | **HTTP/2 404** ✓（auth 要求なし、file 未配置で 404、想定通り） |
| `GET /sitemap.xml` | non-401（matcher 除外） | **HTTP/2 404** ✓（同上） |
| `GET /diagnostics` | 401（proxy 先行） | **HTTP/2 401** ✓ |
| `GET /publish-packages` | 401（proxy 先行） | **HTTP/2 401** ✓ |
| `GET /api/asset-thumb?path=...` | 401（proxy 先行） | **HTTP/2 401** ✓ |

注: anonymous で `/diagnostics` 等が 401 なのは proxy が先に走るため。**人間が認証後に確認した 404 と合わせて 2 段防御が機能**。

### C. TLS / HTTPS

| 項目 | 値 |
| --- | --- |
| protocol | TLSv1.3 |
| cipher | AEAD-CHACHA20-POLY1305-SHA256 |
| subject CN | `app.hitorimedia.com` |
| issuer | C=US; O=Let's Encrypt; CN=R13 |
| expire date | Aug 14 2026 GMT（≈ 3 months 有効） |
| SAN match | `app.hitorimedia.com` 一致 ✓ |
| HSTS | `strict-transport-security: max-age=63072000`（2 年） |
| Server | Vercel |

### D. Repo-level secret leak grep（Claude Code 実施）

すべて **0 hits**（"do not add" の docs 文脈は除く）:

- `SANITY_WRITE_TOKEN` / `writeToken`: 0 code hit（docs に rule のみ）
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`: 0 code hit（docs に rule のみ）
- imports of paid LLM/image SDK: 0
- direct Sanity mutation (`client.create|patch|delete|commit|transaction|mutate`): 0
- env-shaped files tracked: 0
- `dashboard/.env*` tracked: 0
- `private/` tracked: 0
- `node_modules/` tracked: 0
- `.claude/` / `.vercel/` tracked: 0
- token-shaped strings (`sk_test_` / `sk-proj-` / `sk-ant-` / `AKIA` / `github_pat_`): 0
- POTA sibling project files: 0
- total tracked files: 604

### E. Local repo sync

| Check | Value |
| --- | --- |
| `git rev-parse HEAD` | `b60a8a5ea95a1509d7b50e6e6f62b39d97aab7c2` |
| `git ls-remote --heads origin main` | `b60a8a5ea95a1509d7b50e6e6f62b39d97aab7c2` |
| `git branch -vv` | `* main b60a8a5 [origin/main] docs: record git repo initialization and GitHub remote push` |
| `git status --short` (before this batch's docs) | empty |

Local と remote 完全 sync、push 後の改竄なし。

### F. Validation

- `npm run local:check`（root Sanity）: 17 ok / 0 fail
- `npm run build`（root Sanity Studio）: green
- `cd dashboard && npm run build`: green
- direct Sanity write grep（dashboard/src + tools + schemas）: 0 hits
- paid LLM/image API SDK grep (dashboard): 0 hits

## Known issues

1. **`/diagnostics` / `/publish-packages` の anonymous response が 401**: production の意図通り（proxy 先行 + flag-off 404 の defense-in-depth）だが、boss 視点では「認証後だけ 404 で隠す」運用なので、operational note として認識しておくと混乱が少ない。
2. **`/robots.txt` / `/sitemap.xml` が 404**: matcher で excluded されているので auth は要求されないが、ファイル自体は配置していない。public でない dashboard なので問題なし。public site `hitorimedia.com` 着手時に決定。
3. **TLS cert 期限が 3 ヶ月**: Let's Encrypt の標準。Vercel が自動更新するので人手は不要、ただし `Aug 14 2026` 前後で更新ログを確認する習慣を持つと安心。
4. **Cloudflare 経由 DNS**: Authorization header の pass-through が標準で動いているが、将来 Cloudflare の Cache Reserve / Tiered Cache を有効にすると Auth が壊れる事例あり。Phase Admin 2 で要再確認。
5. **`b60a8a5` 直後の docs 4 件（0106 / 0107 / 0117 / 0118）は既に GitHub にいる**: 本バッチの 0108 / 0119 / latest.md update は次の commit で push される（後述）。

## 連番について

- devlog: 0107 → **0108**
- handoff: 0118 → **0119**

## 発信ネタになりそうな切り口

1. **「production 動作を agent に確認させずに人間と分担する」**: credentials を agent に渡さず、agent は anonymous HTTP と repo grep のみ。boss が UI 操作した結果を agent が記録するワークフロー。
2. **「proxy 先行 + page 404 の 2 段防御」**: anonymous なら 401、authenticated なら 404。同じ目的（dev-only route の production exposure 防止）を 2 層で。
3. **「Let's Encrypt R13 の cert chain」**: TLSv1.3 / AEAD-CHACHA20-POLY1305-SHA256 / SAN match を curl `-vI` で確認する習慣。
4. **「`/robots.txt` を意図的に 404 で返す」**: 個人 admin dashboard なら crawler に来てほしくない、`robots.txt` を出さない方が `Disallow: *` を出すより clean な選択（404 → crawler は素直に去る）。
5. **「`git grep -nI`で code と docs を一度に grep する習慣」**: code に embed された secret と docs の rule 文脈を一度に visible にして、何が hit したか即判断できる。

## Safety Verified

- direct Sanity write code: 0 hits（不変）
- paid LLM / image API SDK: 0 hits（不変）
- written tokens / write tokens: 0 hits
- POTA_Empire/.git: 不変
- 兄弟 POTA project: 不変
- Vercel project / DNS / Auth secrets: 触れていない
- `assets/visuals/` / `patches/` / `seed/` / `private/`: 不変
- 画像生成: 0 件
- schema 変更: 0 件
- `npx sanity documents create` 実行: 0 回
- ai-blog-db 関連: 不変
- Sanity Studio / dashboard build: 双方 green
