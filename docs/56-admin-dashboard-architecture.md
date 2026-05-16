# 56 — Admin Dashboard Architecture (design)

Date: 2026-05-14
Status: **design-only**, no code, no Next.js scaffolding

Hitori Media OS の将来の admin dashboard を、現状の local-first MVP（Sanity Studio + 4 local tools + proposed campaignPlan / promptTemplate / brandProfile / visualStyleProfile）からどう派生させるかの設計。

## 1. なぜ Content Idea / Campaign 中心か

現在の運用で観察された事実:

- **1 Content Idea → 多 platform → 多 record** が中心動作（[docs/48](48-campaign-generation-flow.md)）
- 人間の判断ポイントは「いま何の判断待ち？」を campaign 横断で集約する必要がある（[docs/55](55-proposed-campaign-plan-schema.md)）
- visualAssetPlan / platformOutput / Substack plan は **1 campaign 内で同時並行** で進む

→ dashboard の **第一視点は "Campaign の一覧と detail"**。 "全 visualAssetPlan を flat で見る" / "全 prompt を flat で見る" は **二次的な view**。

Sanity Studio の structure builder で既に [Content Ideas → By Content Idea](docs/46-sanity-content-idea-centered-structure.md) を採用している延長線上。dashboard は同じ思想を Next.js UI で再現する。

## 2. Phase Admin 1 が read-only である理由

- **write を許すと sync 問題が増える**: dashboard で書く / Sanity Studio で書く / 人間が seed JSON を書く、の3経路が並走するとデータ整合が崩れやすい。
- **既存 Visual Register / Studio で write はカバーできる**: 当面は dashboard で読み、書きは既存 tool で行う2層構造を維持。
- **MVP の trigger を明確にしたい**: read-only から始めれば、Auth / write API / 監査ログを後回しにでき、Next.js 導入 cost が最小。
- **auto-posting は永続 deferred**: dashboard で「post button」を作ること自体を後回しにする。

## 3. データ層（dashboard で読むもの）

| 出所 | 内容 | dashboard での扱い |
| --- | --- | --- |
| Sanity dataset | contentIdea / platformOutput / visualAssetPlan / diagramPlan / substackPostPlan / substackNotesPlan / substackGrowthAction / publishedOutput / prompt / workflow / tool / substackPublicationStrategy | GROQ で読む（read-only） |
| Sanity dataset（将来 active 化） | campaignPlan / promptTemplate / brandProfile / visualStyleProfile | activate 後に GROQ で読む |
| local files | `outputs/<platform>/...md` / `publish-packages/<platform>/<slug>/` / `assets/inbox/...` / `assets/visuals/...` / `patches/visual-assets/...` / `tasks/visuals/...` | filesystem 読み出し（next/server などで） |
| local docs | `docs/devlog/*.md` / `docs/handoff/*.md` | Activity Log 表示用 |
| Visual Register | `tools/visual-register/server.mjs` 経由（既存 local HTTP） | iframe / proxy / 別 tab で起動 |

Sanity Studio は **「内部データ管理 + 緊急編集」用** として残す。dashboard ユーザーが触る頻度は低くなる。

## 4. 主要画面（Information Architecture）

### 4.1 Dashboard Home

| 項目 | 設計 |
| --- | --- |
| Purpose | 「今 boss 待ち」「今動いている」を 1 画面で俯瞰 |
| Primary data source | campaignPlan / humanReviewGates / requiredVisualAssets / manualPublishingStatus |
| Key fields (read-only MVP) | open campaigns (status != archived) / pending-review gates count / pending visuals count / last publish |
| Future write actions | （なし） |
| Not yet implemented | analytics / KPI / paid tier |

GROQ 例:

```groq
{
  "openCampaigns": *[_type == "campaignPlan" && status in ["draft","planning","generating","reviewing"]]
                    | order(updatedAt desc),
  "pendingGates": *[_type == "campaignPlan"]{
                    title, slug,
                    "gates": humanReviewGates[state == "pending-review"]
                  }[count(gates) > 0],
  "pendingVisuals": *[_type == "campaignPlan"]{
                    title, slug,
                    "visuals": requiredVisualAssets[state != "done" && state != "skipped"]
                  }[count(visuals) > 0]
}
```

### 4.2 Content Ideas

| 項目 | 設計 |
| --- | --- |
| Purpose | claims / objections / platformAngles を一覧 |
| Primary data source | contentIdea |
| Key fields (read-only MVP) | title / status / summary / coreThesis / audience / contentPillars / platformAngles count |
| Future write actions | claims 追加 / objections 追加 / status 更新 → 当面は Sanity Studio で実施 |
| Not yet implemented | bulk import / AI-assisted idea expansion |

### 4.3 Campaigns

| 項目 | 設計 |
| --- | --- |
| Purpose | campaignPlan の一覧、status / progress を column 表示 |
| Primary data source | campaignPlan |
| Key fields (read-only MVP) | title / slug / campaignType / status / contentMode / selectedPlatforms (chips) / progressStatus.overall / pending gates 数 |
| Future write actions | （Phase Admin 3 で「new campaign」 button） |
| Not yet implemented | filter by brandProfile / campaignType cross-tab |

### 4.4 Campaign Detail（最重要）

| 項目 | 設計 |
| --- | --- |
| Purpose | 1 campaign の 13 段フロー全体を 1 画面に |
| Primary data source | campaignPlan + GROQ で derived の visualAssetPlan / platformOutput / Substack plan / publishedOutput |
| Key fields (read-only MVP) | selectedPlatforms detail / platformGenerationSettings / requiredRecords (with linked state) / requiredVisualAssets (with thumbnail if saved) / promptTemplateSelections / publishPackagePaths / humanReviewGates checklist / manualPublishingStatus |
| Future write actions | gate を `pending-review → done` に更新 / publishedUrl 入力 / reactionNotes 編集（Phase Admin 2-4） |
| Not yet implemented | timeline / per-day activity chart |

### 4.5 Platform Outputs

| 項目 | 設計 |
| --- | --- |
| Purpose | text draft の一覧、camp x platform x outputType 軸で listing |
| Primary data source | platformOutput + outputs/<platform>/...md（localOutputPath） |
| Key fields (read-only MVP) | platform / outputType / status / sourceContentIdea / localOutputPath / publishedUrl |
| Future write actions | （Phase Admin 3 で draft 再生成 trigger） |
| Not yet implemented | inline editor / paragraph diff |

### 4.6 Visual Assets

| 項目 | 設計 |
| --- | --- |
| Purpose | visualAssetPlan の一覧 + thumbnail |
| Primary data source | visualAssetPlan + assets/visuals/<slug>/.../*.png |
| Key fields (read-only MVP) | title / platform / assetType / status / localAssetPath（preview） / reusePolicy / sharesMasterWith |
| Future write actions | （Phase Admin 2 で Visual Register に飛ぶ） |
| Not yet implemented | per-asset version history / approval graph |

### 4.7 Inbox Review

| 項目 | 設計 |
| --- | --- |
| Purpose | candidate v00N.png の前段確認、Visual Register を埋め込み |
| Primary data source | `assets/inbox/generated/<slug>/<assetSlug>/v00N.png` / `tools/visual-register/` の inbox manifest API |
| Key fields (read-only MVP) | candidate path / pixel size / file size / reviewStatus / reviewNotes |
| Future write actions | approve & register / mark needs-regeneration（Phase Admin 2 で実装） |
| Not yet implemented | side-by-side comparison / batch approve |

MVP では Visual Register を **iframe で埋め込み** か、`/inbox` route から外部リンク。完全統合は Phase Admin 2。

### 4.8 Prompt Templates

| 項目 | 設計 |
| --- | --- |
| Purpose | promptTemplate の一覧、Selection Keys でのフィルタ |
| Primary data source | promptTemplate（active 化後） |
| Key fields (read-only MVP) | title / category / targetPlatform / assetType / contentMode / brandProfile / status / version / priority |
| Future write actions | new instance → Codex exec runner（Phase Admin 3） |
| Not yet implemented | A/B test / auto rubric scoring |

### 4.9 Publish Packages

| 項目 | 設計 |
| --- | --- |
| Purpose | publish-packages/ ディレクトリの一覧、各 markdown の preview |
| Primary data source | filesystem (`publish-packages/<platform>/<slug>/`) + campaignPlan.publishPackagePaths |
| Key fields (read-only MVP) | platform / slug / 含まれる .md ファイル一覧 / image 配布状況 |
| Future write actions | （Phase Admin 4 で `npm run publish:package` を trigger） |
| Not yet implemented | live preview / WYSIWYG |

### 4.10 Human Review Gates

| 項目 | 設計 |
| --- | --- |
| Purpose | 全 campaign の pending gates を集約 |
| Primary data source | campaignPlan.humanReviewGates |
| Key fields (read-only MVP) | campaign title / gateName / state / reviewer / completedAt / notes |
| Future write actions | gate を `pending-review → done` に更新（Phase Admin 2） |
| Not yet implemented | reminder通知 / SLA |

### 4.11 Manual Publishing Log

| 項目 | 設計 |
| --- | --- |
| Purpose | 公開済み実績 + 反応メモを並べる |
| Primary data source | campaignPlan.manualPublishingStatus + publishedOutput |
| Key fields (read-only MVP) | campaign / platform / publishedUrl / publishedAt / reactionNotes |
| Future write actions | publishedUrl 入力 / reactionNotes 編集（Phase Admin 4） |
| Not yet implemented | engagement metrics fetch / chart |

### 4.12 Settings / Brand Profiles

| 項目 | 設計 |
| --- | --- |
| Purpose | brandProfile / visualStyleProfile を view |
| Primary data source | brandProfile / visualStyleProfile（active 化後） |
| Key fields (read-only MVP) | brandName / voiceTone / visualDefaults / negativeStyleList |
| Future write actions | （Sanity Studio で書く想定、dashboard では view-only を継続） |
| Not yet implemented | multi-brand 切替 UI |

## 5. 現 local tools → 将来 dashboard screens

| 現状 | 将来 dashboard 画面 | Phase | 統合方針 |
| --- | --- | --- | --- |
| **Sanity Studio** | （独立、admin 緊急編集用） | n/a | dashboard と並走、消さない |
| **Visual Register** (`tools/visual-register/`) | Inbox Review / Visual Asset Review | Admin 2 | iframe → 機能統合の順 |
| **Patch Review** (Visual Register 内) | Patch / Sanity Reflect panel | Admin 2 | Inbox Review 完了後に Patch UI を別 tab |
| **Publish Package Builder** (`tools/publish-package-builder/`) | Publish Package 画面 | Admin 4 | dry-run を dashboard で trigger、実配布も同じ |
| **local-check** (`tools/local-check.mjs`) | Diagnostics 画面 | Admin 1 | dashboard 起動時に1回走らせて表示 |
| **docs/devlog + handoff** | Activity Log | Admin 1 | filesystem 読み出し、markdown render |
| **proposed `campaignPlan`** | Campaigns / Campaign Detail | Admin 1 | activate 後に GROQ で読む |
| **proposed `promptTemplate`** | Prompt Templates / 生成 template selector | Admin 1 (view) → Admin 3 (trigger) | |
| **proposed `brandProfile`** | Settings / Brand Profiles | Admin 1 (view) | |
| **proposed `visualStyleProfile`** | Style anchor view（Visual Assets 画面の sub-view） | Admin 1 (view) | |

## 6. Sanity Studio との役割分担

| Studio で続ける | dashboard で代替 |
| --- | --- |
| schema を編集 / activate | n/a |
| seed JSON を投入 | n/a |
| 緊急修正（campaign 名 typo 等） | （将来 inline edit） |
| 1 record の全フィールドを見る | overview / cross-record view |
| reference のたどり | 1-2 hop までは dashboard、深い掘りは Studio |

「Studio はデータの全件編集、dashboard は運用 view」の分業。

## 7. データ取得方針（read-only MVP）

- **Sanity から**: 公開済み dataset を `@sanity/client` の **read token** で fetch（write token は使わない、CDN 利用、CORS は Sanity 側で設定）
- **localhost filesystem から**: dashboard を local で開発する場合は Node.js の fs から、本番運用に乗せる場合は filesystem を読まず、すべて Sanity / GitHub / S3 経由（**production では filesystem 依存をやめる** ことを前提に設計）
- **Visual Register API から**: 当面は `http://localhost:3334/api/*` を proxy、本番 dashboard では未統合（Visual Register 側を public path に出すかは別判断）

→ **本番運用に乗せる際は**「Sanity dataset と GitHub（commit 済みの publish-packages / docs）」が source-of-truth。inbox / assets/visuals は dev machine local。

## 8. Authentication 方針（Phase Admin 1 では未導入）

- Phase Admin 1 は **localhost only** で動かす。Auth は付けない。
- Phase Admin 2 以降で書きが入る前に Auth 必要。choices:
  - Sanity の `currentUser` を利用（既存 Studio session）
  - 自前 magic link（Substack-style）
  - GitHub OAuth（個人 repo limit）
- 本バッチでは Auth 設計を decoupling、Phase Admin 2 で別 design doc で扱う。

## 9. 何を書かないか / 永続 deferred

| 項目 | 理由 |
| --- | --- |
| auto-posting（X / Substack / note API 直接投稿） | manual publish を維持。dashboard でも post button は作らない。 |
| paid LLM client integration | 既存 ChatGPT OAuth + Codex `image_gen` で十分。 |
| AI auto-review of drafts | 人間レビューゲートを残す。 |
| analytics fetch（X analytics / note view count） | scope 外、reactionNotes に手書きで残す。 |
| billing / paid tier | 自分用 dashboard。商品化は別フェーズ。 |
| multi-user collaboration | solo 運用前提、collaborator は brandProfile.ownerType で表現するだけ。 |

## 10. Out of scope（本 doc）

- 個別画面の URL 設計 / route 表（[docs/57](57-hitorimedia-domain-app-plan.md) で扱う）
- Phase ごとの implementation step（[docs/58](58-admin-dashboard-phase-plan.md) で扱う）
- Auth 実装
- Sanity write token の運用
- 本番 hosting（Vercel / Fly.io / Cloudflare Pages）
- Logging / Monitoring

## 11. 次バッチへの推奨

- [docs/57](57-hitorimedia-domain-app-plan.md) / [docs/58](58-admin-dashboard-phase-plan.md) と合わせて、Phase Admin 1 の implementation 開始 trigger を確認
- trigger を満たした時点で初めて Next.js scaffold を提案する
