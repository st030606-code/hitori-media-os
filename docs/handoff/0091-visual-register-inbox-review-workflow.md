# Handoff: Visual Register Inbox + Review + Register Workflow

Date: 2026-05-14

## 1. Task Goal

Visual Register を、既存のアップロード型 register / Patch Review / Content Idea filter / batch register / test seed mode を **すべて維持したまま**、インボックス型の候補レビューフローへ進化させる。「Generate first → review in inbox → approve → save to final path → create patch → manual Sanity reflect」を 1 つの local app に集約する。

## 2. Constraints Followed

- Next.jsは追加していない。
- paid LLM API integration は追加していない。
- paid image generation API integration は追加していない。
- OpenAI API / Anthropic API clients は追加していない。
- external APIは呼んでいない。
- Sanity direct write は実装していない（コード grep で 0 hits 確認）。
- Sanity CLI create/update commandsは実行していない。
- `seed --replace` は実行していない。
- 実project ID、APIキー、トークン、認証情報、シークレットは追加していない。
- 有料PDF本文の引用は含めていない。
- 新規 media file（実画像 / 動画 / 音声）は生成していない。
- 既存 Visual Register 機能を破壊していない。
- destructive bulk overwrite は実装していない（overwrite は明示確認のみ）。
- production-grade auth は追加していない（local 専用）。

## 3. Changed Files

### Modified

- `tools/visual-register/server.mjs`（inbox API、キャンペーン seed 対応、`safeInboxPath`、`validReviewStatuses` などを additive 追加）
- `tools/visual-register/public/index.html`（Inbox Review カードを追加）
- `tools/visual-register/public/app.js`（末尾に inbox ロジックを追加、ブートストラップを `.then(() => loadInbox())` に拡張）
- `tools/visual-register/public/styles.css`（末尾に Inbox Review 用 CSS を追加）
- `README.md`（Local Visual Register 節に Inbox Review の紹介）
- `docs/handoff/latest.md`

### Added

- `assets/inbox/generated/README.md`（フォルダ規約 + manifest 構造 + Safety）
- `docs/43-visual-register-inbox-review-workflow.md`（workflow / API / Plan discovery / Safety / 初回トライアル）
- `docs/devlog/0079-visual-register-inbox-review-workflow.md`
- `docs/handoff/0091-visual-register-inbox-review-workflow.md`

### Confirmed unchanged

- `seed/visual-asset-plan-records.json`（5 records、ai-blog-db）
- `seed/visual-asset-plan-records-test-*.json`（3 records、test）
- `seed/visual-asset-plan-records-building-hitori-media-os.json`（8 records、前バッチで追加）
- `tools/publish-package-builder/build.mjs` / `tools/local-check.mjs`
- `schemas/` / `sanity.config.ts`
- 既存 outputs / publish-packages 本体
- 既存 ai-blog-db 関連すべて

## 4. Summary of Changes

### New API

| Method | Path | 役割 |
| --- | --- | --- |
| GET | `/api/inbox/candidates?slug=<optional>` | inbox 候補一覧 + summary |
| POST | `/api/inbox/review` | reviewStatus / 注釈を保存（最終 copy はしない） |
| POST | `/api/inbox/approve-and-register` | 承認 → 最終パスへ copy → patch JSON 作成 |
| GET | `/inbox-image?path=<path>` | inbox 画像 preview 配信 |

### Plan discovery enhancement

`loadPlans()` がキャンペーン別 seed（`seed/visual-asset-plan-records-<slug>.json`）を自動で読み込むようになった。`test-` 接頭辞のファイルは引き続き `VISUAL_REGISTER_INCLUDE_TEST_SEEDS=true` のみ。

検証時に確認: smoke test で `count=13`（main 5 + building-hitori-media-os 8）、`contentIdeaIds=[ai-blog-db, building-hitori-media-os]`。

### Inbox UI

「画像を選択」カードと「登録キュー」カードの間に **Inbox Review カード** を追加:

- 再読み込みボタン
- サマリーバー（total + 5 状態カウント）
- フィルタ（review status / content slug）
- 候補カードリスト
  - 220x220 preview
  - file name / status badge
  - slug / inbox path / Plan セレクタ / final path / saved path / patch path（saved / patch は registered 状態時のみ）
  - 最終パスに既存ファイルがあれば overwrite 警告
  - review notes textarea
  - アクション: `approve & register` / `approved` / `needs-regeneration` / `reject` / `candidate に戻す`
- レビュー状態のバッジ色:
  - candidate = グレー
  - approved = 緑
  - rejected = 赤
  - needs-regeneration = 黄
  - registered = 青

### Safety guarantees

- `safeInboxPath()` で `assets/inbox/generated/` 配下のみアクセス
- `validReviewStatuses` で reviewStatus を whitelist
- `inboxImageExtensions` で MIME を whitelist（png/jpg/jpeg/webp/gif）
- approve-and-register は overwrite confirmation 必須（既存 409 挙動を継承）
- patch JSON の `meta.directSanityWrite: false` を維持
- 直接 Sanity 書き込みなし（コード grep 0 hits）

## 5. Important Decisions

- 既存機能を破壊しない方針を最優先。新カードを追加し、既存セクションは触らない。
- inbox は `assets/inbox/generated/<content-slug>/` のフラット構造（サブフォルダ可）。
- review-manifest.json は **各 content-slug ごと** に1ファイル。手書きも可能だが UI が source of truth。
- approve-and-register は inbox 画像を **copy**（move ではない）。inbox の元ファイルはそのまま残る。
- 既存 `/api/register-visual`（アップロード型）は変更なし。
- Sanity Studio への反映は **引き続き手動**。auto-write しない方針を維持。
- キャンペーン seed の自動読み込みは Visual Register 側も対応（publish-package-builder と挙動を揃えた）。

## 6. Human Review Questions

- Inbox Review カードの位置は適切か（現状: 画像選択 → Inbox Review → 登録キュー → Patch Review）。
- 候補カードの情報量は多すぎないか（preview / slug / inbox / plan / final / notes / actions）。
- レビュー状態のバッジ色は妥当か。
- `approve & register` 時の overwrite confirmation ダイアログ（`window.confirm`）はそのままでよいか、UI 内のモーダルにするか。
- inbox manifest を Sanity の visualAssetPlan に統合するかどうか（現状は local-only）。
- 顔写真ワークフロー（後続バッチ）で、`assets/inbox/face/` のような別フォルダを切るか。

## 7. Risks or Uncertainties

- 既存ブラウザタブで古い Visual Register（port 3334）が走っていると、新コードが反映されない。`lsof -ti :3334 | xargs kill` などで停止してから `npm run visual:register` を再起動する必要がある。docs と handoff で明記済み。
- inbox manifest は人間が手書きできるため、UI と整合が取れない状態を作れる。基本は UI から書く運用にする。
- `safeInboxPath()` は `assets/inbox/generated/` 配下のみ許可するが、symlink 等の trick で外に出ようとすると `safeProjectPath()` の root check で弾かれる。さらなる検証は不要と判断。
- `approve & register` で `meta.inboxSource` を patch JSON に保存している。Sanity Studio で手動反映するとき、この情報は捨ててよい（trail として残しても可）。docs に説明あり。
- inbox の画像は `.gitignore` していない（既存の `assets/visuals/` も同様）。secret / 顔写真 / 有料PDF 図版を inbox に置くと commit されるリスク。`assets/inbox/generated/README.md` で警告済み。

## 8. Recommended Next Step

- 人間が次の手順で 1 サイクル試す:
  1. `lsof -ti :3334 | xargs kill` で既存 Visual Register を停止
  2. `npm run visual:register` で再起動
  3. `assets/inbox/generated/building-hitori-media-os/note-hero-v1-attempt-1.png` に試験画像を置く（小さなダミー画像で OK、まだ本生成しなくてよい）
  4. Inbox Review カードを開き、Plan 自動 suggest を確認
  5. `approve & register` を押し、overwrite confirmation を確認（最初はファイル不在なので即 OK）
  6. `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` への copy / patch JSON 作成を確認
  7. Patch Review カードで新 patch を確認
- 動作が確認できたら、本生成（`tasks/visuals/building-hitori-media-os/note-hero-v1.md` の Generation Prompt）に進む。

## 9. Exact Prompt to Give Codex Next

```text
Walk the boss through the first end-to-end Inbox Review trial for building-hitori-media-os.

Do not add Next.js.
Do not add paid LLM or image generation API integrations.
Do not call external APIs.
Do not auto-post.
Do not write directly to Sanity from code.
Do not run seed --replace.
Do not commit the original paid PDF or any verbatim long passages from it.
Do not use existing Visual Register test images as public assets.

Use:
- tools/visual-register/ (server + public/index.html + public/app.js + public/styles.css)
- docs/43-visual-register-inbox-review-workflow.md
- assets/inbox/generated/README.md
- tasks/visuals/building-hitori-media-os/note-hero-v1.md
- seed/visual-asset-plan-records-building-hitori-media-os.json

Workflow:
1. Ensure no old Visual Register process is bound to port 3334. If yes, the human should kill it (lsof -ti :3334 | xargs kill).
2. Start Visual Register: npm run visual:register.
3. Have the human paste the Generation Prompt from tasks/visuals/building-hitori-media-os/note-hero-v1.md into ChatGPT.
4. Save the accepted candidate to assets/inbox/generated/building-hitori-media-os/note-hero-v1-attempt-1.png.
5. Open the Inbox Review card, verify Plan auto-suggest, set review notes, click "approve & register".
6. Verify:
   - assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png exists
   - patches/visual-assets/building-hitori-media-os/note-hero-v1.json exists
   - manifest at assets/inbox/generated/building-hitori-media-os/review-manifest.json has reviewStatus: registered
7. Have the human open Sanity Studio and update BOTH visualAssetPlan.note-hero-v1.localAssetPath AND visualAssetPlan.substack-header-v1.localAssetPath to the same path.
8. Run "npm run publish:package -- building-hitori-media-os --dry-run" to confirm the file is planned for copy into both note/ and substack/ publish-packages.

Document:
- which inbox file became the master campaign-hero-v1.png
- the actual ChatGPT image used (timestamp + prompt version)
- any UI / overwrite-confirmation / patch JSON issues encountered
- whether the inbox-review flow felt natural to use

Update devlog and handoff.
```
