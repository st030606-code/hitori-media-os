# Devlog 0102 — Admin Phase 1 Batch D: Deploy Plan (design only)

Date: 2026-05-15
Status: **design-only**, no Vercel project, no DNS change, no middleware code, no env set

## 今日の判断

[Batch C](0101-admin-phase-1-batch-c-ops-pages.md) で 8 route の dashboard が
localhost で動く状態まで来た。次は `app.hitorimedia.com` に preview deploy したい
が、3 route が dev fs / child process に依存し、Auth もまだ無い。**deploy 前に
1 doc で全選択肢を整理**し、後続 Batch D1 / D2 / D3 に分割する設計を確定する。

実装は 1 行もしない。

## なぜその設計にしたか

- **Vercel 推奨**: Next.js 16 + App Router の親和性が最も高い。Hobby Free でも
  preview deploy + custom domain + managed cert が無料。Pro なら Password
  Protection が 1 click。dashboard を凝った構成にする前に「とりあえず deploy」
  を最短で回せるのが大事。
- **dev-only routes を flag で disable**: production で `/diagnostics`（child
  process fork）と `/publish-packages`（filesystem walk）が動くと、serverless
  runtime に存在しない依存で 500 か、最悪 hang する。`ENABLE_DIAGNOSTICS` /
  `ENABLE_LOCAL_FS_ROUTES` env で 404 にする。AppNav からも flag に応じて hide。
- **`/activity-log` だけは snapshot で生かす**: boss が deploy 後の dashboard
  でも変更履歴を見たいニーズはある。build 時に `docs/devlog/` + `docs/handoff/`
  を JSON 化して `dashboard/public/activity-snapshot.json` に書き出す script を
  Batch D1 で用意、production はそれを読む。private 情報の漏れリスクを下げるため
  snapshot は **title / status / date / 短い excerpt まで**に絞る。
- **Auth は middleware Basic Auth をデフォルト**: Vercel Password Protection は
  Pro 限定。Hobby Free でも `middleware.ts` で Basic Auth するのは正当な方法。
  password を env で管理、Phase Admin 2 で本物の Auth provider に差し替えやすい。
  最大の guardrail は「`app.hitorimedia.com` を Auth なしで公開しない」。
- **thumbnail 用 `/api/asset-thumb` を route handler で**: `/visual-assets` の
  thumbnail を出すなら、`assets/visuals/` 配下を Next.js から serve する handler
  が必要。本 doc では **spec を fix**（path normalize / prefix 制限 / ext 白名簿 /
  size cap / 404 fallback）。実装は Batch D1。production では default 404、
  `ENABLE_LOCAL_FS_ROUTES=true` の localhost でのみ動く。
- **後続を 3 batch に分割**: D1 = feature flags + thumbnail + activity snapshot
  script（local 開発）、D2 = Vercel + DNS + Auth + 初回 preview deploy、D3 =
  post-deploy verification checklist。

## Codex と Claude Code の役割分担（再確認）

| 役割 | 担当 |
| --- | --- |
| design doc 起草（docs/60） | **Claude Code（本バッチ）** |
| Batch D1 implementation（feature flags / thumbnail / snapshot） | Claude Code（次バッチ） |
| Vercel project 作成 / DNS / env var 入力 / Auth password 設定 | **人間**（Batch D2） |
| middleware.ts 実装 | Claude Code（Batch D2 着手時） |
| post-deploy 動作確認 | 人間 + Claude Code（Batch D3） |

## API なしで済ませた理由（再確認）

- design doc のみ。Vercel API / Sanity write / paid LLM 一切呼ばない。
- middleware Basic Auth は **既存 Node ランタイムだけで完結**（外部 Auth provider なし）。
- thumbnail handler も **fs と built-in stream のみ**で書ける spec。

## このバッチで作ったもの

- `docs/60-admin-phase-1-batch-d-deploy-plan.md`（design 全文、12 節）
- `docs/devlog/0102-admin-phase-1-batch-d-deploy-plan.md`（本ファイル）
- `docs/handoff/0113-admin-phase-1-batch-d-deploy-plan.md`
- `docs/handoff/latest.md`（0113 のミラー）
- `dashboard/README.md`（Next batches セクションに docs/60 への pointer 1 行追加）

`schemas/` / `tools/` / `sanity.config.ts` / `structure/index.ts` / `package.json`（root / dashboard 双方）/ 既存 outputs / publish-packages / `assets/visuals/` / `patches/` / `private/` / ai-blog-db 関連 **すべて不変**。

## 連番について

- devlog: 0101 → **0102**
- handoff: 0112 → **0113**
- docs: 59 → **60**

## 発信ネタになりそうな切り口

1. **「deploy する前に design batch を 1 つ挟む」**: dev で動いた dashboard を
   本番に出すと壊れる route がある、を visible にする。`pnpm deploy` 1 発を
   避ける運用パターン。
2. **「feature flag で dev-only route を disable する」**: 環境変数 1 つで
   404 になる route が dashboard に存在する。Vercel が想定する典型構成では
   ないので、application-side で対応する設計の説明。
3. **「Hobby Free でも middleware Basic Auth で守れる」**: $20/月 払わずに
   personal dashboard を保護する現実的な手順。Phase Admin 2 で本物の Auth に
   差し替える前提の暫定 layer。
4. **「production で localhost のみ enable 路線」**: dashboard を「production
   で 8 route 全部生きてる」状態にする必要はない。boss が 5 route + activity
   snapshot を見られれば足りる、という割り切り。
5. **「DNS は public site と admin app を subdomain で分ける」**: 1 ドメイン
   1 役割。`hitorimedia.com` ルートは public、`app.` だけ admin。Cookie scope /
   キャッシュ / Auth が混ざらない。

## Safety Verified

- `schemas/index.ts` / `sanity.config.ts` / `structure/index.ts` / `tools/`: 不変
- root `package.json` / `package-lock.json`: 不変
- dashboard `package.json` / `package-lock.json`: 不変
- `npm run local:check`（root）: 17 ok / 0 fail（最終確認時）
- root `npm run build`（Sanity Studio）: 成功
- dashboard `npm run build`（Next.js 16）: 成功（既存 9 routes 不変）
- direct Sanity write の grep: 0 hits（不変）
- paid LLM / image API SDK の grep: 0 hits（不変）
- `assets/visuals/` / `patches/` / `assets/inbox/`: 不変
- 画像生成: 0 件
- schema 変更: 0 件
- Auth 実装: 0 行
- Vercel project / DNS: 触れていない
- ai-blog-db 関連: 不変
