# 59 — Admin Phase 1 Implementation Plan (design)

Date: 2026-05-14
Status: **design-only**, no Next.js scaffolding, no dependencies added

[docs/56](56-admin-dashboard-architecture.md) / [57](57-hitorimedia-domain-app-plan.md) / [58](58-admin-dashboard-phase-plan.md) で設計した admin dashboard の **Phase Admin 1**（read-only Next.js dashboard）を着手するための、scaffold step / 環境変数 / 画面別 GROQ / component 計画 / バッチ分割。

## 1. なぜ Phase Admin 1 を始められるのか

[docs/58 §1](58-admin-dashboard-phase-plan.md#1-phase-admin-0--design-only) の trigger 4 条件すべて達成（2026-05-14、batch 0096/0097）:

| 条件 | 達成バッチ |
| --- | --- |
| 4 proposed schema activate | 0096 |
| campaignPlan seed 投入 | 0097 |
| Visual Register ≥ 2 production asset approve | 0090/0095 |
| publish package distribution が X / note / Substack で動く | 0095 |

Sanity dataset には:

- 16 active type
- `campaignPlan.building-hitori-media-os` 1 件（selectedPlatforms 4 / requiredVisualAssets 7 / promptTemplateSelections 1）
- `brandProfile.hitori-media-os-default` 1 件
- `visualStyleProfile.hitori-media-os.x-hook-image` 1 件
- `promptTemplate.x-hook-image-diagram-rich-v1` 1 件
- ai-blog-db 既存 record、building-hitori-media-os の 既存 record（visualAssetPlan 9 / platformOutput 4 / Substack plan 3）

「読みで判断負荷を下げる」のに十分なデータが揃った。

## 2. なぜ本バッチは依然 design only か

- **Next.js を入れた瞬間に依存・設定・運用 cost が増える**: Tailwind / app router / env / build pipeline / Vercel preview... の前に scaffold step を最小化して docs 化することで、後の implementation バッチを 30 分以内で回せる
- **「最初に建てる画面」を明文化**: 何でも作れる状態だと最も書く価値の高い画面に注力できなくなる。本 doc で 1 画面に絞る
- **GROQ を書ききっておく**: 画面実装段階で GROQ を試行錯誤するのは時間 cost。先に書いて Studio Vision で動作確認できる
- **Auth / write / generation / posting の永続 deferred を再確認**: 本 doc を読めば「やらないもの」が即決まる

## 3. アプリ アーキテクチャ（推奨）

### 3.1 split

- **`hitorimedia.com`** = public site（別 repo / 別 build pipeline、後回し）
- **`app.hitorimedia.com`** = admin app（本 doc の対象）
- **MVP**: localhost only で開発、後で Vercel preview に出す
- **GitHub repo 配置**: 当面 `sanity-ai-content-os` 内に `app/` サブディレクトリを作る案、または別 repo に分離する案。**推奨: 同 repo に `dashboard/` または `app/` サブディレクトリ**（Sanity schema との一貫性 / 同じ env / monorepo 風）

### 3.2 framework / styling / data

| 層 | 選定 |
| --- | --- |
| framework | **Next.js 14+ (App Router)** |
| styling | **Tailwind CSS**（既存 Visual Register と統一感、minimal CSS で速い） |
| data layer | **`@sanity/client`**（read-only token、CDN 利用） |
| filesystem | Phase Admin 1 では使わない（dev だけ `fs/promises` 経由で `docs/devlog/*.md` を render する余地） |
| Auth | **なし**（localhost のみ稼働、Phase Admin 2 で着手） |
| testing | Phase Admin 1 では skip（read-only なので壊れたら build で出る） |

### 3.3 やらないこと（Phase Admin 1）

- Sanity write（`@sanity/client` の write token 使用なし）
- post button（X / Substack / note への直接投稿 UI）
- AI generation trigger（Codex / ChatGPT 呼び出し UI）
- 認証 / Auth middleware / Cookie
- Visual Register への動作リクエスト（外部リンク / iframe のみ）
- 画像生成（既存 Codex exec を別 tab で起動）

## 4. 環境変数（将来）

`.env.local` に書く（commit しない）:

```text
NEXT_PUBLIC_SANITY_PROJECT_ID=<既存 SANITY_STUDIO_PROJECT_ID と同値>
NEXT_PUBLIC_SANITY_DATASET=<既存 SANITY_STUDIO_DATASET と同値、通常 'production'>
NEXT_PUBLIC_SANITY_API_VERSION=2025-08-15
```

任意（private dataset の場合）:

```text
SANITY_READ_TOKEN=<read-only token、server side でのみ使用>
```

### 4.1 rules

- **write token は置かない**（Phase Admin 1 では絶対）
- **OPENAI_API_KEY / ANTHROPIC_API_KEY は置かない**（永続）
- **画像 API key は置かない**
- secrets は **コミットしない**（`.gitignore` で `.env.local` 除外）
- `NEXT_PUBLIC_` プレフィックスは「ブラウザに公開される」意味なので、project ID / dataset / api version のみ
- 既存 `SANITY_STUDIO_*` env はそのまま残す（Studio 用）

## 5. ルートマップ — Phase Admin 1 優先

### 5.1 Must-have (Phase Admin 1 初動で必須)

| route | 画面 | 主データ源 |
| --- | --- | --- |
| `/` | Dashboard Home | campaignPlan / humanReviewGates / requiredVisualAssets |
| `/campaigns` | Campaigns list | campaignPlan |
| `/campaigns/[slug]` | Campaign Detail | campaignPlan + 関連 visualAssetPlan / platformOutput / etc |
| `/visual-assets` | Visual Asset list | visualAssetPlan + thumbnail（`/api/asset-thumb`） |
| `/human-review-gates` | Pending gates 集約 | `*[_type == "campaignPlan"]{humanReviewGates}` flatten |
| `/diagnostics` | local:check 結果 / dataset 数 | local-check JSON + GROQ counts |

### 5.2 Nice-to-have（Phase Admin 1 後半 or Phase Admin 2）

- `/content-ideas` / `/content-ideas/[slug]`
- `/platform-outputs`
- `/prompt-templates` / `/prompt-templates/[slug]`
- `/publish-packages`（filesystem 由来）
- `/manual-publishing-log`
- `/settings/brand-profiles`
- `/settings/visual-style-profiles`
- `/activity-log`（devlog / handoff の markdown render）

### 5.3 やらない

- `/inbox`（Visual Register への外部リンクのみ、Phase Admin 2 で統合）
- `/patches`（Patch Review への外部リンクのみ、Phase Admin 2 で統合）
- `/auth/*`

## 6. 最初に建てる画面 — **Campaign Detail**（推奨）

選定理由:

1. **最も具体**: `campaignPlan.building-hitori-media-os` 1 件で 1 画面を render、validation が容易
2. **最も多くの component を exercise する**: 後述 8 component のうち少なくとも 6 個を使う
3. **最も daily で見る画面になる予定**: 13 段フロー全体を 1 画面で俯瞰、boss が判断する場所
4. **GROQ の複雑度が中間**: simple な listing よりは難しいが、Dashboard Home のような complex aggregation より易しい

代替案（Dashboard Home）の長所:
- 全 campaign の俯瞰、より高層の view
- GROQ が単純

短所:
- 現状 campaign が 1 件しかない（building-hitori-media-os のみ）ので、aggregation の意味が薄い
- component 利用数が少ない（CampaignStatusCard 程度）

→ **Campaign Detail を 1 件目** にして、building-hitori-media-os を実機で render しながら component を作る。

### 6.1 Campaign Detail の画面構成（building-hitori-media-os に当てはめた具体）

```
[Header]
  Title: building-hitori-media-os campaign
  Slug: building-hitori-media-os
  campaignType: build-log    contentMode: building-in-public
  status: draft (badge)    automationLevel: semi-auto

[Source Content Idea]
  ▶ contentIdea.building-hitori-media-os
    title: AIで「ひとりメディア運営OS」を作っている裏側
    [Open in Studio →]

[Brand Profile]
  ▶ Hitori Media OS (brandProfile.hitori-media-os-default)
    voice: 実装者目線... | building-in-public

[Selected Platforms] (chips)
  X P1 hook-only minimal | Threads P2 summary minimal |
  note P1 full-article standard | Substack P1 full-article standard

[Generation Order]
  1. note → 2. substack (shares hero master) → 3. x → 4. threads

[Visual Assets Status]
  Table:
    note-hero-v1            note    hero               P1  done           assets/visuals/.../campaign-hero-v1.png
    substack-header-v1      sub.    hero               P1  done           assets/visuals/.../campaign-hero-v1.png (shared)
    x-hook-main-v1          x       hook-image         P1  pending-review assets/visuals/.../x-hook-main-v1.png ⚠ seed stale
    threads-support-...     threads section-diagram    P2  not-started    —
    note-inline-content-... note    flow-diagram       P2  not-started    —
    note-inline-human-...   note    section-diagram    P2  not-started    —
    substack-inline-...     sub.    section-diagram    P3  not-started    —
  [Open Visual Register →]

[Prompt Template Selections]
  ▶ promptTemplate.x-hook-image-diagram-rich-v1
    image-generation | x | hook-image | semi-auto
    brand: Hitori Media OS | style: hitori-media-os / X / hook-image

[Publish Package Paths]
  • publish-packages/note/building-hitori-media-os/     [Open dir →]
  • publish-packages/substack/building-hitori-media-os/ [Open dir →]
  • publish-packages/x/building-hitori-media-os/        [Open dir →]
  • publish-packages/threads/building-hitori-media-os/  [Open dir →]

[Human Review Gates]
  ✓ selectedPlatforms 確認                            done       self
  ✓ contentIdea claims / objections 最終確認          done       self
  ✓ note-hero-v1 Visual Register approve              done       self  2026-05-14T07:59Z
  ✓ note-hero-v1 / substack-header-v1 Sanity 反映     done       self
  ◐ x-hook-main-v1 Visual Register approve            pending-review     ← (実際は done、seed stale)
  ◐ x-hook-main-v1 Sanity 反映                        not-started
  ○ threads / note inline 3 visual 生成判断           not-started
  ○ release-review final-human-checklist の最終確認   in-progress
  ○ 各 platform への manual publish                   not-started

[Manual Publishing Status]
  X        not-started   —    —
  Threads  not-started   —    —
  note     not-started   —    —
  Substack not-started   —    —

[Progress Status]
  Overall: in-progress
  Text drafts: 4/4 done
  Visuals: 2/7 done, 1/7 pending-review, 4/7 not-started
  Publish packages: 4 dirs scaffolded, hero + x-hook-main-v1 distributed
  Release review: in-progress

[Actions (read-only labels only)]
  ⓘ Edit in Studio: https://<project>.sanity.studio/<dataset>/structure/campaignPlan;...
  ⓘ Open Visual Register: http://localhost:3334
  ⓘ Open Activity Log: /activity-log
```

### 6.2 empty states

- Source content idea が見つからない → "Reference unresolved" + Studio 直リンク
- Visual asset の `localAssetPath` 空 → thumbnail なし、"未保存" badge
- promptTemplate が ref されているが dataset 未投入 → "Template not in dataset" + 候補 ID 表示

### 6.3 read-only な ACTIONS

- すべて表示のみ。**書き戻し UI は付けない**。
- Studio への deep link は OK（read-only）
- Visual Register / publish-package directory への外部リンクは OK

## 7. GROQ Queries（ドラフト）

実装時に `@sanity/client` から呼ぶ用。Sanity Studio Vision で事前検証する。

### 7.1 campaign list（dashboard / campaigns 画面用）

```groq
*[_type == "campaignPlan"] | order(coalesce(updatedAt, _updatedAt) desc) {
  _id,
  title,
  slug,
  campaignType,
  contentMode,
  status,
  automationLevel,
  progressStatus,
  "sourceContentIdea": sourceContentIdea->{_id, title, slug},
  "selectedPlatformsCount": count(selectedPlatforms[enabled == true]),
  "pendingGatesCount": count(humanReviewGates[state == "pending-review" || state == "in-progress"]),
  "doneVisualsCount": count(requiredVisualAssets[state == "done"]),
  "totalVisualsCount": count(requiredVisualAssets)
}
```

### 7.2 campaign detail by slug

```groq
*[_type == "campaignPlan" && slug.current == $slug][0] {
  ...,
  "sourceContentIdea": sourceContentIdea->{
    _id, title, slug, status, summary, coreThesis, audience
  },
  "brandProfile": brandProfile->{
    _id, title, brandName, voiceTone, defaultPlatforms, status
  },
  "visualAssetDetails": requiredVisualAssets[] {
    ...,
    "plan": *[_id == ^.visualAssetPlanId][0]{
      _id, title, status, localAssetPath, publishPackagePath, reviewNotes
    }
  },
  "promptTemplateDetails": promptTemplateSelections[] {
    ...,
    "template": *[_id == ^.promptTemplateId][0]{
      _id, title, category, version, status, automationLevel,
      "brand": brandProfile->{_id, brandName},
      "style": visualStyleProfile->{_id, title}
    }
  },
  "recordDetails": requiredRecords[] {
    ...,
    "doc": *[_id == ^.recordId][0]{_id, _type, status}
  }
}
```

string ID（`visualAssetPlanId` / `promptTemplateId` / `recordId`）の dereference は GROQ の `*[_id == ^.field][0]` 構文で行う。Sanity reference 型ではないため `->` は使えない。

### 7.3 pending human review gates（全 campaign 横断）

```groq
*[_type == "campaignPlan" && count(humanReviewGates[state in ["pending-review","in-progress","blocked"]]) > 0]{
  _id, title, slug, status,
  "pendingGates": humanReviewGates[state in ["pending-review","in-progress","blocked"]]{
    gateName, state, reviewer, notes, completedAt
  }
} | order(title asc)
```

### 7.4 visual asset status from campaignPlan.requiredVisualAssets

```groq
*[_type == "campaignPlan"]{
  _id, title, slug,
  "visuals": requiredVisualAssets[]{
    assetSlug, platform, assetType, priority, state, localAssetPath, sharesMasterWith,
    "plan": *[_id == ^.visualAssetPlanId][0]{_id, title, status, reviewNotes}
  }
}
```

### 7.5 promptTemplate linked from campaignPlan.promptTemplateSelections

```groq
*[_type == "campaignPlan"]{
  _id, title, slug,
  "templates": promptTemplateSelections[]{
    promptTemplateId, category, platform, assetType,
    "template": *[_id == ^.promptTemplateId][0]{
      _id, title, version, status, automationLevel, variationStrategy,
      "brand": brandProfile->{_id, brandName},
      "style": visualStyleProfile->{_id, title}
    }
  }
}
```

### 7.6 brandProfile / visualStyleProfile summary

```groq
{
  "brands": *[_type == "brandProfile"] | order(brandName asc){
    _id, title, brandName, ownerType, status, version,
    "platformCount": count(defaultPlatforms),
    "negativeStyleCount": count(negativeStyleList)
  },
  "styles": *[_type == "visualStyleProfile"] | order(title asc){
    _id, title, assetTypes, applicablePlatforms, defaultLayoutPattern, status,
    "brand": brandProfile->{_id, brandName},
    "referenceCount": count(referenceImagePaths),
    "rubricCount": count(reviewRubric)
  }
}
```

### 7.7 dashboard home（latest campaign + pending gates 集計）

```groq
{
  "campaigns": *[_type == "campaignPlan"] | order(coalesce(updatedAt, _updatedAt) desc)[0..4]{
    _id, title, slug, status, progressStatus
  },
  "pendingGatesTotal": count(*[_type == "campaignPlan"].humanReviewGates[state == "pending-review"]),
  "pendingVisualsTotal": count(*[_type == "campaignPlan"].requiredVisualAssets[state != "done" && state != "skipped"]),
  "lastPublished": *[_type == "campaignPlan"].manualPublishingStatus[publishedUrl != null] | order(publishedAt desc)[0]
}
```

### 7.8 注意

- `requiredVisualAssetPlanId` / `promptTemplateId` / `recordId` が **string** であり Sanity reference ではない → `->` 構文は使えない、`*[_id == ^.X][0]` を使う
- `^.` は parent scope 参照、配列 projection 内で使う
- `$slug` は parameterized query、`client.fetch(groq, {slug})` で渡す

## 8. Component 計画

| component | 入力 | 役割 |
| --- | --- | --- |
| `CampaignStatusCard` | `campaignPlan` summary | dashboard / list の 1 card |
| `HumanReviewGateList` | `humanReviewGates[]` | 9 段 gate を縦並び + state badge |
| `VisualAssetStatusTable` | `requiredVisualAssets[]` + dereferenced `plan` | 7 行 table + thumbnail |
| `SelectedPlatformChips` | `selectedPlatforms[]` | platform / priority chips（4 件） |
| `PublishPackageLinks` | `publishPackagePaths[]` + filesystem check | dir 一覧 + 外部 link |
| `PromptTemplateSummary` | `promptTemplateSelections[].template` | template 名 + category + brand / style |
| `BrandProfileSummary` | `brandProfile` | voice / visual defaults / negative style list 数 |
| `DiagnosticsSummary` | local-check JSON + GROQ counts | 17 check の green/red + dataset 数 |

それぞれ **read-only**、props で受け取り表示するだけの dumb component。state 管理なし。

## 9. 実装バッチ分割（将来）

本 design 後の Next.js scaffold を 4 batch に分ける:

### Batch A — Scaffold + Campaign Detail (最初に書く)

- `app/` または `dashboard/` subdirectory に Next.js scaffold（`npx create-next-app@latest dashboard --typescript --tailwind --app --src-dir`）
- `package.json` の workspace 検討（Sanity と分離するなら独立 package）
- `@sanity/client` 追加
- `.env.local` に project ID / dataset / API version
- `lib/sanity.ts` で client export（read-only、CDN）
- `lib/groq/campaign.ts` に GROQ 集約
- 5 component（`CampaignStatusCard` / `HumanReviewGateList` / `VisualAssetStatusTable` / `SelectedPlatformChips` / `PromptTemplateSummary`）
- `/campaigns/[slug]/page.tsx` 1 画面
- localhost で building-hitori-media-os を render
- README で実行手順

### Batch B — Dashboard Home + Campaign list + Human Review Gates

- `/page.tsx`（Dashboard Home）
- `/campaigns/page.tsx`（list）
- `/human-review-gates/page.tsx`（pending gates 集約）
- 追加 component: `PublishPackageLinks` / `BrandProfileSummary`

### Batch C — Visual Asset / Publish Package / Diagnostics

- `/visual-assets/page.tsx`
- `/publish-packages/page.tsx`（filesystem 由来、dev のみ）
- `/diagnostics/page.tsx`（`npm run local:check` の JSON 取り込み + dataset counts）
- `/activity-log/page.tsx`（docs/devlog + handoff の markdown render）

### Batch D — Deploy to app.hitorimedia.com

- Vercel project 設定
- DNS 設定（`app.hitorimedia.com` の CNAME / A record）
- 環境変数を Vercel に登録
- Basic Auth or middleware で localhost 以外は denied（Phase Admin 2 の Auth 着手まで public 化禁止）

各 batch は **完結する**: 完了時点で前 batch までの dashboard は壊れない。

## 10. やらないこと（再確認）

- Sanity write（write token / mutate / patch）
- 自前 LLM API call（OpenAI / Anthropic SDK）
- 画像生成 trigger UI
- auto-posting
- Auth / Cookie / session
- billing / paid tier UI
- multi-user / collaboration
- analytics fetch
- 公開サイト `hitorimedia.com` の content source 決定（別 design batch）

## 11. 次バッチへの推奨

**Batch A** から始める。推奨 prompt:

```text
Scaffold Phase Admin 1 — Batch A.

Hard Rules:
- Create Next.js scaffold in dashboard/ subdirectory only.
- Do NOT modify schemas/, structure/, sanity.config.ts, tools/.
- Do NOT add Auth / write token / OpenAI API.
- Do NOT auto-post.
- Only Campaign Detail page (1 route) in this batch.

Use:
- docs/59-admin-phase-1-implementation-plan.md (especially §6 and §7.2 and §9 Batch A)
- schemas/campaignPlan.ts / promptTemplate.ts / brandProfile.ts / visualStyleProfile.ts
- existing seed inserted in Sanity

Steps:
1. mkdir dashboard && cd dashboard && npx create-next-app@latest . --typescript --tailwind --app --src-dir
2. npm i @sanity/client
3. .env.local with SANITY_PROJECT_ID / SANITY_DATASET / SANITY_API_VERSION
4. src/lib/sanity.ts (read-only client, CDN)
5. src/lib/groq/campaign.ts (queries from docs/59 §7.2)
6. 5 components per docs/59 §8
7. src/app/campaigns/[slug]/page.tsx
8. npm run dev → confirm localhost:3000/campaigns/building-hitori-media-os renders
9. README with run instructions

Validation:
- root npm run local:check + npm run build (Sanity unaffected)
- dashboard npm run build + npm run dev
- localhost render confirmation
- no Sanity write code added
- no paid API code added
```

## 12. Open Questions（人間判断）

- **app dir vs separate repo**: `dashboard/` を同 repo に置くか、別 repo にするか？（推奨: 同 repo、Phase Admin 1 終了時に分離判断）
- **Tailwind preset**: 既存 Visual Register が使っている色 / フォント / spacing と揃えるか？（既存を見て decide）
- **`hitorimedia.com` 公開サイトを先に立てるか admin を先に立てるか**: [docs/57](57-hitorimedia-domain-app-plan.md) 推奨は admin 先
- **Visual Register UI を最終的に dashboard に統合するか**: Phase Admin 2 着手時の判断、Phase Admin 1 では外部リンクで OK
