# 57 — hitorimedia.com Domain & App Plan (design)

Date: 2026-05-14
Status: **design-only**, no DNS / hosting / deployment changes

`hitorimedia.com` ドメインは取得済み。本 doc は、public site / admin app / 補助 subdomain の分離方針と、各 path の役割を設計する。

## 1. 全体方針

```
hitorimedia.com           ← 公開サイト（who am I / what is Hitori Media OS / blog 一覧）
app.hitorimedia.com       ← admin dashboard（自分用、Phase Admin 1 から）
（任意・将来）
docs.hitorimedia.com      ← 公開ドキュメント / Architecture / patterns
demo.hitorimedia.com      ← 体験版（read-only sample campaign view）
status.hitorimedia.com    ← uptime / changelog（cron jobs / publish-package activity）
```

**MVP では `hitorimedia.com` と `app.hitorimedia.com` の2つだけ**。残りはアイデア段階。

## 2. なぜ root と app で分けるか

- **責任分離**: public 静的サイトと admin app は完全に違う配信特性（root: SSG / CDN、app: SSR + 認証）。
- **Auth scope を絞る**: app subdomain にだけ Auth、root には Auth を付けない。Cookie scope の事故を防ぐ。
- **キャッシュ戦略**: root は long-cache、app は no-cache。CDN ルールを subdomain で分けると単純。
- **将来のスケール**: public がバズったとき、app の負荷と無関係でいられる。

## 3. hitorimedia.com（public site）

### 3.1 ページ構成（MVP は静的）

```
/                        ← トップ（自己紹介 + Hitori Media OS の概要 + 最新 building-in-public 記事3件）
/about                   ← 個人プロフィール（brandProfile.persona の公開可な部分）
/now                     ← 今何やってる（Substack最新号 / 進行中 campaignの公開可な部分）
/blog                    ← building-in-public ブログ（note / Substack へリンク、または mirror）
/blog/[slug]             ← 個別記事（content sourcing は未定: note mirror or 独自）
/concepts                ← Hitori Media OS の core concepts（contentIdea / campaign / promptTemplate / visualStyleProfile の解説）
/links                   ← 各 platform（X / Threads / note / Substack / GitHub）への hub
/privacy                 ← プライバシー（最小限）
/contact                 ← 連絡先（メールフォーム or X DM 誘導）
```

### 3.2 何を載せる / 何を載せない

| 載せる | 載せない |
| --- | --- |
| building-in-public の進捗（公開可な範囲） | private/ 配下のいずれか |
| 採用済み visual（campaign-hero-v1.png のような） | 開発中 inbox candidate v00N.png |
| concept 解説 | 実 project ID / secret / API token |
| Substack 購読 CTA（soft） | paid offer（まだない） |
| 自分の name / persona | client / 顧客名 |

### 3.3 source of content

- **MVP**: `outputs/note/...md` や `publish-packages/note/.../article.md` を git submodule または fetch で取り込み。
- **長期**: GROQ で Sanity から fetch、page generation は build-time。
- **重要**: hitorimedia.com **本体は MVP では Next.js を入れない**。astro / 11ty / 素 HTML のいずれかでも可。Phase Admin 1 とは独立に進める。

### 3.4 building-in-public ↔ 商品化の動線

将来:

- 公開サイトの blog で「Hitori Media OS の使い方」をしばらく無料で連載
- 一定の Substack subscriber / X フォロワーが溜まった時点で paid newsletter / paid PDF / paid Notion template を出す
- product のローンチ自体も建設過程の一部として記録

**dashboard と product 販売を混ぜない**: app.hitorimedia.com は自分用に固定。商品販売は別 path（例: `/shop` 配下）か Substack paid tier。

## 4. app.hitorimedia.com（admin app）

### 4.1 想定 route（Phase Admin 1）

```
/                                  ← Dashboard Home（"今 boss 待ち" + 進捗）
/content-ideas                     ← Content Ideas list
/content-ideas/[slug]              ← Content Idea detail
/campaigns                         ← Campaigns list
/campaigns/[slug]                  ← Campaign Detail（13 段フロー全体）
/platform-outputs                  ← Platform Output list
/visual-assets                     ← Visual Asset Plan list + thumbnail
/inbox                             ← Inbox Review（Visual Register iframe or proxy）
/patches                           ← Patch JSON review
/prompt-templates                  ← Prompt Template list
/publish-packages                  ← Publish package directory tree + markdown preview
/review-gates                      ← Human Review Gates 集約（pending-review 一覧）
/publishing-log                    ← Manual Publishing Log
/diagnostics                       ← local:check 結果
/activity-log                      ← devlog / handoff の markdown render
/settings/brand-profiles           ← Brand Profile view
/settings/visual-style-profiles    ← Visual Style Profile view
```

### 4.2 機能スコープ（Phase 別）

[docs/58](58-admin-dashboard-phase-plan.md) を参照。Phase Admin 1 は上記すべて **read-only**。

### 4.3 Auth

- **Phase Admin 1**: Auth なし、localhost のみ
- **Phase Admin 2+**: Auth 必須（候補: Sanity session / GitHub OAuth / magic link）
- 本 doc では Auth scheme を決めない、Phase Admin 2 着手時に決定

### 4.4 ホスティング先

候補:

- **Vercel**（Next.js standard、ISR / Edge runtime）
- **Cloudflare Pages**（cost 控えめ、Edge worker）
- **Fly.io / Render**（Sanity webhook 等 long-running が要るなら）

MVP は Vercel が最短だが、本バッチでは確定しない。

### 4.5 何を public に出さないか

- **app.hitorimedia.com そのもの**: Auth で保護、検索 indexing を無効化
- **GROQ で読み取る token**: Sanity の write token は app に置かない、read token のみ
- **filesystem 読み出し**: production 環境では filesystem 依存をやめる、dev のみ
- **`assets/inbox/...`** や **`patches/...`**: production 環境からはアクセス不可、dev only

## 5. 任意・将来の subdomain（MVP では作らない）

| subdomain | 用途 | 優先度 |
| --- | --- | --- |
| `docs.hitorimedia.com` | OSS 化したときの公開 docs / architecture / patterns | P3、将来 |
| `demo.hitorimedia.com` | dummy campaign / sample dashboard を体験できる public read-only view | P3、商品化以降 |
| `status.hitorimedia.com` | uptime / changelog / cron 状況 | P3、自動化が増えてから |

これらを MVP に含めない理由: 維持 cost が増える + 個人運用には早い + 必要になってから判断できる。

## 6. DNS / 証明書（本バッチでは触らない）

本 doc は **DNS 設定を変更しない**。実装時:

- A record / CNAME: hosting 先（Vercel / Cloudflare）の指示に従う
- subdomain: wildcard 証明書 or 個別証明書（Let's Encrypt）
- email: Substack / Newsletter 用に `me@hitorimedia.com` を別途確保（Fastmail / ProtonMail 候補）

これらは Phase Admin 1 着手前の運用作業として、別 doc で取り扱う。

## 7. building-in-public 整合性

「hitorimedia.com 開発過程」自体が Hitori Media OS の最大の case study になる:

- public site の launch を Substack post 1 本にまとめる
- admin app の Phase Admin 1 read-only スクリーンショットを note 記事に
- domain / subdomain 設計（本 doc）を「設計の決め方の参考」として公開（適切に redact）

paid offer に直結しない、あくまで信頼形成。

## 8. Out of scope（本 doc）

- 個別画面の wireframe
- Auth scheme の決定
- hosting provider の確定
- DNS / 証明書の実作業
- email server / newsletter integration

## 9. 次バッチへの推奨

- [docs/58](58-admin-dashboard-phase-plan.md) で Phase Admin 1 着手 trigger を確認
- trigger を満たしたら、`app.hitorimedia.com` を Vercel preview に紐づけて Phase Admin 1 の Next.js scaffold を提案
- `hitorimedia.com` 公開サイトは admin app と独立に、別 timing で建てる
