# 60 — Admin Phase 1 Batch D: Deploy Plan (design)

Date: 2026-05-15
Status: **design-only**, no deploy, no Vercel project, no DNS change, no Auth code

[Batch A](../docs/devlog/0099-admin-phase-1-batch-a-campaign-detail.md) /
[Batch B](../docs/devlog/0100-admin-phase-1-batch-b-dashboard-home-gates.md) /
[Batch C](../docs/devlog/0101-admin-phase-1-batch-c-ops-pages.md) で
8 route の read-only dashboard が localhost で動く状態になった。次のステップ
（Batch D）で `app.hitorimedia.com` への preview deploy を行うが、そのまま
deploy すると壊れる route / 漏れる情報 / 認証されないアクセスが発生する。
本 doc はそれを **deploy 前に design として整理する**。

## 1. なぜ deploy の前に design が必要か

- **dev-only routes が壊れる**: `/diagnostics` / `/publish-packages` /
  `/activity-log` は server-side で repo の filesystem や `npm` を呼ぶ。
  Vercel runtime（serverless / edge）にはそれら依存物が存在しない。
- **dashboard には下書き / 進行中の戦略が見える**: campaignPlan の `notes` や
  `humanReviewGates[].notes`、`promptTemplate.systemInstruction` 等。これらは
  公開向きではない。Auth なしの URL に置くわけにはいかない。
- **thumbnail が未実装**: `/visual-assets` は `assets/visuals/...` を
  serve していない。production で thumbnail を出すなら snapshot か route handler が要る。
- **環境変数の境界**: `SANITY_READ_TOKEN` は **server-only** にしたい。
  `NEXT_PUBLIC_*` は client bundle に inline されてよい。Vercel の env scopes
  （Production / Preview / Development）と整合を取る必要。
- **小さい deploy で失敗を学習したい**: Phase Admin 2 の Auth 着手より前に、
  「dashboard 全 route が production runtime でどう振る舞うか」を 1 回 preview で
  観察するためのスコープ限定 deploy。

## 2. 何が deploy 可能で何が private のままか

| カテゴリ | 状態 | 補足 |
| --- | --- | --- |
| Sanity dataset 由来の Server Component | **deploy 可**（read-only token） | `@sanity/client` は edge / node runtime 双方で動く |
| `@sanity/client` write helper | **使わない** | Phase Admin 1 は read-only 維持 |
| `NEXT_PUBLIC_SANITY_*` | **deploy 可** | client bundle に inline されるが、project ID / dataset 名は public 情報 |
| `SANITY_READ_TOKEN` | **deploy 可（server scope）** | server runtime のみで参照、client bundle に含めない |
| `/diagnostics`（`npm run local:check` 実行） | **production では disable** | serverless で `npm` も `local-check.mjs` も存在しない |
| `/publish-packages`（fs walk of `publish-packages/`） | **production では disable** | repo の publish-packages は build に含めない方針（重い、private context あり） |
| `/activity-log`（fs walk of `docs/devlog`, `docs/handoff`） | **deploy 可（snapshot 経由）** | build 時に JSON 化して bundle に同梱 |
| `/visual-assets` thumbnails | **後追い実装、Batch D2 以降** | route handler を作るか、build-time snapshot |
| Auth | **必須**（Batch D 着手前に決める） | dashboard の private 内容を URL 直叩きで見せない |

## 3. Hosting provider 選定

3 候補を比較したうえで **Vercel** を推奨。

| Provider | Next.js 16 親和性 | env vars | Password Protection | filesystem | Cost (Phase Admin 1) | コメント |
| --- | --- | --- | --- | --- | --- | --- |
| **Vercel** | 公式、即時 deploy、Turbopack OK | Production / Preview / Dev 別 scope、CLI も UI も簡単 | Pro plan で 1 click、Free でも middleware で代替可 | filesystem ❌（serverless / edge）。`public/` と build output のみ | Hobby Free（個人 dashboard なら十分） / Pro 必要時に $20 USD/月 | 既定の選択、Phase Admin 1 で他を採る理由なし |
| Cloudflare Pages | Next.js App Router は Edge Runtime 寄り、SSR の API route 制約あり | env vars OK | Cloudflare Access（無料 Zero Trust 50 users）が強い | filesystem ❌、KV / R2 別途 | 無料枠が広い | Next.js 16 + RSC 互換に毎回慎重さが要る、Phase Admin 1 では追加学習 cost が高い |
| Fly.io | Docker container として deploy、Next.js は問題なし | secrets API | 自前で nginx Basic Auth 等 | 限定的に persistent volume 可（dev fs を持ち込める！） | $0〜数 USD/月 | persistent volume で publish-packages / docs を mount できるという魅力はあるが、運用 cost が増える |

**推奨**: Vercel + (Pro 時) Password Protection / (Free 時) middleware Basic Auth。
public site `hitorimedia.com` を別途立てるときも Vercel で揃えるか別判断。

## 4. Dev-only routes の production 挙動

### 4.1 `/diagnostics`

| Option | 概要 | 採否 |
| --- | --- | --- |
| A | production では disable（feature flag `ENABLE_DIAGNOSTICS` 未設定なら 404） | **採用** |
| B | cached snapshot（build 時 1 回実行して JSON を `public/diagnostics-snapshot.json` に） | 保留（運用上 stale で boss が誤判断する） |
| C | local-only via env flag | A と実質同じ |

理由: serverless runtime に `npm` / `local-check.mjs` が存在しない、かつ
request 毎に child process を fork するのは production で危険。`ENABLE_DIAGNOSTICS=true` を **localhost のみ** で立てる前提。

### 4.2 `/publish-packages`

| Option | 概要 | 採否 |
| --- | --- | --- |
| A | production では disable（404） | **採用（暫定）** |
| B | build-time snapshot（fs walk を build 時に JSON 化、bundle 同梱） | 保留（publish-packages はサイズが大きく build artefacts に含めると重い） |
| C | Sanity 由来の publish package メタ化 | 長期、将来 schema 追加で検討 |

理由: publish-packages は repo private 領域（draft 等）。Vercel build context に含めないのが安全。
`ENABLE_LOCAL_FS_ROUTES=true` で localhost のみ enable。

### 4.3 `/activity-log`

| Option | 概要 | 採否 |
| --- | --- | --- |
| A | build-time snapshot（`docs/devlog/` と `docs/handoff/` を build 時に JSON 化） | **採用** |
| B | production では disable | 保留 |
| C | devlog / handoff を Sanity に移して GROQ で読む | 長期 |

理由: `docs/devlog/` と `docs/handoff/` は「公開可能な物が混ざる」が、boss が
deploy 後の dashboard でも変更履歴を見られるのは有用。build 時に
`scripts/build-activity-snapshot.mjs`（仮、Batch D1）で `dashboard/public/activity-snapshot.json` を生成し、
production では fs walk せず snapshot を読む。

ただし snapshot には private 情報を含めない方針（excerpt は title + date + status のみで本文は短く）。
**snapshot 生成は Batch D1**、本 doc では設計まで。

### 4.4 Nav 表示

production で disable された route は **AppNav からも非表示** にする。
feature flag が必要:

```text
ENABLE_DIAGNOSTICS=false           # production default
ENABLE_LOCAL_FS_ROUTES=false       # production default
ACTIVITY_LOG_MODE=snapshot         # build-time snapshot mode in production
```

localhost では `ENABLE_DIAGNOSTICS=true` `ENABLE_LOCAL_FS_ROUTES=true` `ACTIVITY_LOG_MODE=fs`。

## 5. Thumbnail support（`/api/asset-thumb`）

### 5.1 design

Phase Admin 1 では `/visual-assets` で thumbnail を表示する route handler を
**localhost 限定で** 提供。production では snapshot 経路を別途検討（Batch D2 以降）。

API: `GET /api/asset-thumb?path=<relative-path>`

```ts
// Pseudocode — implementation lands in Batch D1.
import path from 'node:path'
import {createReadStream, promises as fs} from 'node:fs'
import {repoRoot} from '@/lib/repoRoot'

const ALLOWED_PREFIX = 'assets/visuals/'
const ALLOWED_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif'])
const MAX_BYTES = 8 * 1024 * 1024

export async function GET(req: Request) {
  if (process.env.ENABLE_LOCAL_FS_ROUTES !== 'true') {
    return new Response('disabled', {status: 404})
  }
  const url = new URL(req.url)
  const relRaw = url.searchParams.get('path') ?? ''
  // 1. reject absolute paths
  if (relRaw.startsWith('/')) return new Response('bad path', {status: 400})
  // 2. require allowed prefix
  if (!relRaw.startsWith(ALLOWED_PREFIX)) return new Response('forbidden', {status: 403})
  // 3. normalize and reject traversal
  const norm = path.normalize(relRaw)
  if (norm.includes('..')) return new Response('traversal', {status: 400})
  // 4. extension whitelist
  const ext = path.extname(norm).toLowerCase()
  if (!ALLOWED_EXT.has(ext)) return new Response('bad ext', {status: 415})
  // 5. resolve absolute path inside repo
  const abs = path.resolve(repoRoot(), norm)
  if (!abs.startsWith(path.resolve(repoRoot(), ALLOWED_PREFIX))) {
    return new Response('out of allowed root', {status: 403})
  }
  // 6. size cap
  try {
    const stat = await fs.stat(abs)
    if (stat.size > MAX_BYTES) return new Response('too large', {status: 413})
  } catch {
    return new Response('not found', {status: 404})
  }
  // 7. stream
  const mime =
    ext === '.png' ? 'image/png' :
    ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
    ext === '.webp' ? 'image/webp' :
    ext === '.gif' ? 'image/gif' :
    'application/octet-stream'
  return new Response(createReadStream(abs) as unknown as ReadableStream, {
    status: 200,
    headers: {
      'Content-Type': mime,
      'Cache-Control': 'private, max-age=60, no-store',
    },
  })
}
```

### 5.2 Rules（再列挙）

- **only** paths under `assets/visuals/`
- reject absolute paths
- reject `..` after `path.normalize`
- extension whitelist: `.png / .jpg / .jpeg / .webp / .gif`
- read-only（no directory listing、no write）
- size cap: 8 MB
- 404 / 403 / 413 / 415 を適切に
- no directory traversal: `abs.startsWith(<allowed root abs>)` で二重チェック

### 5.3 production behavior

- **default: 404**（`ENABLE_LOCAL_FS_ROUTES != "true"`）
- 将来オプション: build-time に `assets/visuals/<slug>/<asset>.png` のうち
  「採用済み（visualAssetPlan.status in saved/...）」だけを `public/visuals/` に
  copy する snapshot script → production でも 1 部の thumbnail が出せる。
  Batch D2 で再評価。

## 6. Auth / protection 推奨

### 6.1 比較

| Option | 強み | 弱み | Phase Admin 1 推奨 |
| --- | --- | --- | --- |
| Vercel Password Protection（Pro） | Vercel 1 click、確実 | $20 USD/月、Free plan 不可 | Pro 契約済みなら **採用**、そうでなければ次 |
| Next.js middleware Basic Auth | Free plan で OK、code-level で管理 | password を env で持つ、ローテーション手動 | **デフォルト推奨**（Free plan の現実解） |
| IP allowlist | 漏えい時のリスクほぼゼロ | 出先 / モバイル / VPN で詰まる、自分用には硬すぎ | 採用しない |
| Cloudflare Access in front of Vercel | Free 50 users まで、SSO 連携可 | 構成が増える、DNS が Cloudflare 経由になる | 将来検討 |
| Phase Admin 2 の本格 Auth | 多人数化したらこちら | 今は overkill | Phase Admin 2 で |

### 6.2 推奨

Phase Admin 1 preview deploy では **Next.js middleware Basic Auth**:

```ts
// middleware.ts (design only — Batch D2 で実装)
import {NextResponse, type NextRequest} from 'next/server'

const USER = process.env.ADMIN_BASIC_AUTH_USER
const PASS = process.env.ADMIN_BASIC_AUTH_PASSWORD

export function middleware(req: NextRequest) {
  if (!USER || !PASS) return NextResponse.next() // dev / localhost
  const header = req.headers.get('authorization')
  if (header) {
    const [scheme, encoded] = header.split(' ')
    if (scheme === 'Basic' && encoded) {
      const [u, p] = Buffer.from(encoded, 'base64').toString('utf-8').split(':')
      if (u === USER && p === PASS) return NextResponse.next()
    }
  }
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {'WWW-Authenticate': 'Basic realm="Hitori Media OS Admin"'},
  })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

- 簡単で revert しやすい
- `ADMIN_BASIC_AUTH_USER` / `ADMIN_BASIC_AUTH_PASSWORD` を Vercel env に
- localhost では env 未設定で素通り
- Phase Admin 2 で本物の Auth provider に差し替えやすい

### 6.3 注意

- **`app.hitorimedia.com` を Auth なしで公開しない**: dashboard には campaign の
  下書き戦略 / human review notes が見える
- preview branch URL（`xxx-vercel.app`）も同じ middleware で守られる
- Basic Auth は HTTPS 必須（Vercel は managed cert なので OK）

## 7. DNS / domain 計画

- `hitorimedia.com` = **public site**（後ほど別 Vercel project or 静的 host で立てる）
- `app.hitorimedia.com` = **admin dashboard**（本 doc の対象）

Vercel 設定:

1. Vercel project を新規作成（`hitori-media-os-dashboard` 等）
2. GitHub repo を connect（root: `dashboard/`）
3. Production branch: `main`、Preview branch: 任意
4. Domains に `app.hitorimedia.com` を追加
5. DNS（取得ドメインの DNS で）`app` を Vercel の指示通り CNAME（または A/AAAA）に
6. HTTPS は Vercel managed certificate（自動）
7. `hitorimedia.com` のままドメイン購入元に残し、`app.` だけ Vercel に向ける

Phase Admin 1 では `hitorimedia.com` のルートは **触らない**（後で public site を建てる時に決める）。

## 8. 環境変数戦略

### 8.1 必須（Production / Preview）

```text
NEXT_PUBLIC_SANITY_PROJECT_ID=5f79ed6q
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-08-15
SANITY_READ_TOKEN=<viewer-token>   # server-only, never NEXT_PUBLIC_
```

### 8.2 任意（Auth）

```text
ADMIN_BASIC_AUTH_USER=<short-username>
ADMIN_BASIC_AUTH_PASSWORD=<long-random>
```

### 8.3 任意（Feature flags）

```text
ENABLE_DIAGNOSTICS=false           # production default
ENABLE_LOCAL_FS_ROUTES=false       # production default
ACTIVITY_LOG_MODE=snapshot         # snapshot | fs
```

localhost では:

```text
ENABLE_DIAGNOSTICS=true
ENABLE_LOCAL_FS_ROUTES=true
ACTIVITY_LOG_MODE=fs
ADMIN_BASIC_AUTH_USER=  # unset で middleware 素通り
ADMIN_BASIC_AUTH_PASSWORD=
```

### 8.4 ルール

- 書き込み token を **置かない**: `SANITY_WRITE_TOKEN` / 似た名前のすべて
- LLM API keys を **置かない**: `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` 等
- 画像 API keys を **置かない**
- secrets は repo に commit しない（`.env*` は `.gitignore` 済）
- preview / production の env を別 scope に（Vercel の standard なので無料 plan でも OK）

## 9. 後続バッチ（design 後の implementation plan）

### 9.1 Batch D1 — Feature flags + thumbnail handler + activity snapshot script（local 開発）

- `dashboard/src/lib/featureFlags.ts` で env を 1 箇所に集約
- `/diagnostics` / `/publish-packages` page top で flag チェック → 404
- `AppNav.tsx` で flag に応じて link 表示制御
- `dashboard/src/app/api/asset-thumb/route.ts` を §5.1 spec で実装
- `/visual-assets` から `<img src="/api/asset-thumb?path=..." />` を出す（local mode のみ）
- `dashboard/scripts/build-activity-snapshot.mjs`（仮）で build 時に
  `docs/devlog/` + `docs/handoff/` を `dashboard/public/activity-snapshot.json` に書き出し
- `/activity-log` を flag で fs / snapshot 切替
- **まだ deploy しない**

### 9.2 Batch D2 — Vercel project + DNS + Auth + preview deploy

- Vercel project 作成（subdirectory: `dashboard/`）
- Build command: `npm run build`（dashboard/）
- Environment variables を §8.1〜8.3 で設定（preview / production 別 scope）
- `middleware.ts` を §6.2 spec で追加（Basic Auth）
- Domains に `app.hitorimedia.com` を追加 + DNS 設定
- 初回 preview deploy → Basic Auth で守られていること確認
- `/`、`/campaigns`、`/campaigns/[slug]`、`/human-review-gates`、`/visual-assets` が production で render すること確認
- `/diagnostics`、`/publish-packages` が 404 になることを確認
- `/activity-log` が snapshot で render することを確認

### 9.3 Batch D3 — Post-deploy verification checklist

- 8 route の HTTP status を production / preview で curl
- AppNav から見える link が flag どおりに hide されていることを目視確認
- `SANITY_READ_TOKEN` が client bundle に inline されていないことを `view-source` で確認
- thumbnail handler が production で 404 になることを確認（local では動く）
- Vercel build log で env vars が secret として扱われている（ログに値が出ていない）ことを確認
- Sanity dataset の test query を Vercel 経由で投げて、CORS / 認証エラーが出ないことを確認
- Basic Auth header を外したリクエストで 401 が返ることを確認
- DNS の TTL / cert / redirect chain を確認

## 10. やらないこと（本 doc）

- **Vercel project の実際の作成**（人間 + Batch D2）
- DNS の実変更（人間 + Batch D2）
- middleware.ts の実装（Batch D1 / D2）
- env vars の実設定（人間が Vercel UI で）
- Phase Admin 2 の本格 Auth design（Phase Admin 2 着手前に別 doc）
- public site `hitorimedia.com` の構築（別 phase）
- Sanity write の解禁
- LLM / 画像 API integration

## 11. Open Questions（人間判断）

- Vercel は **Hobby（無料）か Pro（$20/月）か**？ Pro なら Password Protection が即使えるが、middleware Basic Auth でも実用上十分
- `dashboard/` を **同 repo のままで Vercel に subdir build** させるか、**別 repo に切り出すか**？ Phase Admin 1 では subdir 推奨、Phase Admin 2 で再判断
- `/activity-log` の snapshot に **どこまで本文を含めるか**？ title + status + date + 100 char excerpt 程度なら private 情報の漏れリスクが低い
- thumbnail を production でも見せる必要があるか？ ない場合は production で 404 のままで OK、`/visual-assets` 表は path 文字列のみで運用

## 12. Next batch

**Batch D1** から着手（Batch D2 / D3 は別 prompt で）。Exact prompt は
[docs/handoff/0113-admin-phase-1-batch-d-deploy-plan.md §9](handoff/0113-admin-phase-1-batch-d-deploy-plan.md) を参照。
