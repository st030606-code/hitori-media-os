# Devlog 0079: Visual Register Inbox + Review + Register Workflow

Date: 2026-05-14

## 今日の判断

Visual Register を、既存のアップロード機能を維持したまま、**インボックス型の候補レビュー UI** へ進化させました。

「Generate first → review in inbox → approve → save to final path → create patch → manual Sanity reflect」を 1 つの local app で完結させるのが狙いです。

破壊的変更なし。既存のアップロード型 register / Patch Review / Content Idea filter / batch registration / overwrite protection / test seed mode は **すべて維持**。

## 変更したこと

### Server (`tools/visual-register/server.mjs`)

- 新規 API:
  - `GET /api/inbox/candidates?slug=<optional>` — inbox 候補一覧 + summary
  - `POST /api/inbox/review` — レビュー状態 / メモを保存（最終 copy はしない）
  - `POST /api/inbox/approve-and-register` — 承認 → 最終パスへ copy → patch JSON 作成
  - `GET /inbox-image?path=<inbox-relative-path>` — inbox 画像 preview 配信
- 既存 `loadPlans()` を **キャンペーン別 seed 対応** へ拡張。`seed/visual-asset-plan-records-<slug>.json` を自動で読み込む（test seeds は引き続き `VISUAL_REGISTER_INCLUDE_TEST_SEEDS=true` のみ）。
- 安全弁追加:
  - `safeInboxPath()`: パスは必ず `assets/inbox/generated/` 配下のみ許可
  - `validReviewStatuses`: `candidate / approved / rejected / needs-regeneration / registered` のみ受理
  - `inboxImageExtensions`: `.png / .jpg / .jpeg / .webp / .gif` のみ画像とみなす
- `approve-and-register` は既存の overwrite protection 挙動を完全継承（409 + `overwriteRequired: true` を返し、UI 側で確認）。
- patch JSON 出力フォーマットは既存と互換、`meta.generatedBy: 'tools/visual-register/inbox'` と `meta.inboxSource: <relativePath>` を追加。

### Client (`tools/visual-register/public/`)

- `index.html`: 「画像を選択」カードと「登録キュー」カードの間に **Inbox Review カード** を追加。
  - 再読み込みボタン、サマリーバー（total + 5 状態カウント）、レビュー状態フィルタ、Content Slug フィルタ、候補リスト、空状態メッセージ。
- `app.js`: 既存コードは触らず、末尾にインボックスロジックを追加。
  - 状態: `inboxCandidates` / `inboxSummaryData` / `activeInboxStatusFilter` / `activeInboxSlugFilter`
  - 関数: `loadInbox()` / `renderInbox()` / `renderInboxItem()` / `postInboxReview()` / `approveAndRegisterCandidate()`
  - 既存の `Promise.all([loadPlans(), loadPatches()])` ブートストラップを `.then(() => loadInbox())` へ拡張。
- `styles.css`: 既存スタイルの末尾に Inbox Review 用 CSS を追記。
  - `.inboxCard / .inboxItem / .inboxItemImage / .inboxItemBody / .inboxItemHeader / .inboxStatus--*` などのクラスを追加。
  - レビュー状態の 5 色バッジ（candidate / approved / rejected / needs-regeneration / registered）。
  - 既存トークン（`--surface` / `--outline` / `--primary` 等）と Material Design 3 風のトーンを維持。

### Folder convention

- `assets/inbox/generated/` を新規作成。
- `assets/inbox/generated/README.md` を追加し、フォルダ規約 / manifest 構造 / Safety を明文化。

### Docs

- `docs/43-visual-register-inbox-review-workflow.md` — workflow / API / Plan discovery / Safety / 初回トライアル手順
- `README.md` — Local Visual Register 節に Inbox Review の短い紹介を追加
- `docs/devlog/0079-visual-register-inbox-review-workflow.md`
- `docs/handoff/0091-visual-register-inbox-review-workflow.md`

## 変更していないもの

- 既存アップロード型 register（`POST /api/register-visual`）
- Patch Review（`GET /api/visual-patches`）
- Content Idea / Platform / Asset Type フィルタ
- overwrite protection
- batch registration（複数選択 → 「まとめて登録」）
- test seed mode（`VISUAL_REGISTER_INCLUDE_TEST_SEEDS=true`）
- patch JSON 出力フォーマット（既存フィールド構造は維持）
- ai-blog-db の visualAssetPlan / publish-package
- Sanity schemas / `sanity.config.ts`
- `seed/visual-asset-plan-records.json`（main 5 records のまま）
- `seed/visual-asset-plan-records-test-*.json`（test 3 records のまま）

## 理由

ChatGPT 画像生成は **複数回の試行** が前提です。1枚目で採用ということは少なく、3〜5枚生成して比較するのが普通の流れ。既存のアップロード型 UI は「1枚を選んで即登録」を前提にしていたため、複数候補の比較・保留・再生成依頼を扱いにくい構造でした。

inbox 型に進化させると:

- 候補を全部ローカルに置く → ブラウザで一覧で比較できる
- 即 register しなくてよい（保留・再生成依頼 OK）
- 採用したものだけ最終パスへ copy
- manifest が「どの候補が何の状態か」を local-first で記録

既存のオプトイン安全弁（overwrite confirmation / Patch Review / 手動 Sanity 反映）はそのまま組み合わさるので、追加リスクは最小限。

## 安全性の担保

- 直接 Sanity 書き込みなし（`grep` で確認: 0 hits）
- paid API integration / image generation API 不使用
- auto-posting なし
- `seed --replace` 不使用
- 任意ファイル削除なし（inbox の中身は人間が管理）
- `safeInboxPath()` で `assets/inbox/generated/` 配下のみアクセス可
- `safeProjectPath()` で project root の外には絶対書き込まない
- overwrite protection は 409 + `overwriteRequired: true` で既存挙動を継承
- `validReviewStatuses` で reviewStatus を制限
- 画像拡張子の whitelist で他の MIME を弾く

## CodexとClaude Codeの役割分担

Claude Code がこのバッチを実装。Codex には、初回トライアル（`note-hero-v1` を ChatGPT 生成 → inbox 配置 → Visual Register で `approve & register` → patch JSON 確認 → Sanity Studio 手動反映）の運用検証を渡す想定。

## APIなしで済ませた理由

- すべて Node 標準 + 既存の Visual Register アーキテクチャの拡張で完結。
- LLM API / 画像生成 API / Sanity API / 外部翻訳 API は一切使わない。
- Studio への反映は手動レビュー前提で、自動化していない。

## 発信コンテンツにできる切り口

- 既存ローカルツールを段階的に進化させる設計（破壊なし）。
- 「Generate first → review → approve → save → patch → manual reflect」フローを 1 つの local app に集約。
- 複数候補を比較してから採用する、ChatGPT 画像生成の現実に合わせた UI 設計。
- material design 3 風の app-like な UI を local-first で保つ。
- 安全弁 4 種（overwrite confirmation / safeInboxPath / status whitelist / mime whitelist）を仕組みで残す。

## 検証

- `node --check tools/visual-register/server.mjs` → 成功
- `node --check tools/visual-register/public/app.js` → 成功
- `node --check tools/publish-package-builder/build.mjs` → 成功
- `node --check tools/local-check.mjs` → 成功
- `npm run local:check` → `ok: true`（全 15 チェック green）
- `npm run build`（sanity build）→ 8.2s で成功
- `grep` で直接 Sanity 書き込み / API トークンを検索 → 0 hits
- 一時的に `VISUAL_REGISTER_PORT=3335` で server を起動して smoke test:
  - `/api/health` → ok, count=13（main 5 + building-hitori-media-os 8）, contentIdeaIds=`[ai-blog-db, building-hitori-media-os]`
  - `/api/inbox/candidates` → ok, count=0, summary 全 0（inbox 空のため期待通り）

`seed/visual-asset-plan-records-building-hitori-media-os.json` が自動で読み込まれるようになったため、Visual Register UI で building-hitori-media-os の 8 visualAssetPlan も見えるようになった点が大きな運用改善。

## 既存 Visual Register 稼働中の注意

開発中に port 3334 で別の Visual Register が稼働している場合、ブラウザでアクセスすると **古いコード** が走ります。

新コードを反映するには:

1. 既存プロセスを停止（ターミナル Ctrl-C もしくは `lsof -ti :3334 | xargs kill`）
2. `npm run visual:register` で再起動

## 次にテストすること

1. `assets/inbox/generated/building-hitori-media-os/note-hero-v1-attempt-1.png` などのテスト画像を1枚置いてみる。
2. Visual Register を再起動して Inbox Review に表示されるか確認。
3. `approve & register` を押して `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` に copy され、patch JSON が出ることを確認。
4. 同 master file を共有する `substack-header-v1` の `localAssetPath` を Sanity Studio で手動入力。
5. Publish Package Builder の dry-run で copy 計画が更新されるか確認。
6. 既存アップロード型登録が壊れていないかを ai-blog-db で念のため確認。
