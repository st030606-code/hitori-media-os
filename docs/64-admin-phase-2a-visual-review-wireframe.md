# 64 — Admin Phase 2A: Visual Review Wireframe Design (design)

Date: 2026-05-18
Status: **design-only / wireframes / no implementation / no schema activation / no Sanity writes / no deploy**
Scope: Phase Admin 2 sub-phase 2A の **dashboard-integrated visual candidate review (read-only)** を、 route / screen / data source / API / component / coexistence の levels で詳細設計する。

本 doc は [docs/62 § 3.1](62-admin-phase-2-visual-generation-admin-design.md#31-phase-2a--dashboard-integrated-visual-review-read-only)（Phase 2A 概念設計）と [docs/63](63-cross-platform-content-visual-generation-core.md)（Content / Visual Package Core）の **wireframe レイヤー**。実装は次の Phase 2A-1〜2A-3 batches で段階着手。

---

## 1. Phase 2A goal / scope

### 1.1 目標

`app.hitorimedia.com` にログインしている boss が、**dashboard を開いたまま**:

- どの visual asset がいま review 待ちか俯瞰
- candidate v001 / v002 / v003 を **side-by-side で見比べる**
- review rubric を candidate と同じ画面で確認
- どの candidate を採用すべきか、Codex self-review + 自分の判断で **暫定推し** を決める

…までを完走する。**実 approve & register（filesystem write / patch JSON 生成）は依然 Visual Register に任せる**: dashboard 内のボタンは "Open in Visual Register" / "Copy review notes" / "Mark preferred (local UI only)" の 3 種に限定。

### 1.2 In scope（本バッチで設計するもの）

| 区分 | 内容 |
| --- | --- |
| route | 11 件提案（§3）、Phase 2A で必要な 8 件 + Phase 2A-3 で必要な 3 件 |
| screen | primary `/visual-assets/[assetId]/candidates`（§4 で wireframe）, secondary 5 screen の section 構成 |
| data source | Sanity + filesystem dev-only + future schema の責務分離（§5） |
| dev-only API | 6 endpoint 提案、`ENABLE_LOCAL_FS_ROUTES` gate（§6） |
| production behavior | Sanity metadata だけで動かす safe fallback（§7） |
| component | 14 件提案、props と data source（§8） |
| Content Package integration | `/content-packages/[slug]/visuals` の overview（§9） |
| candidate scoring display | 35 点 rubric の threshold（24+ / 18-23 / <18）（§10） |
| Visual Register coexistence | 2A / 2B / 2C 各 phase での役割と deprecation 条件（§11） |
| implementation batches | 2A-1 / 2A-2 / 2A-3 / 2B-1 の 4 batch 分割（§12） |

### 1.3 Out of scope（本バッチでやらない）

| Out | 理由 |
| --- | --- |
| route 実装 | wireframe のみ |
| React component 追加 | 本 batch では design のみ、構造体に倒さない |
| API route 実装 | dev-only API spec のみ、実装は 2A-1 |
| schema 変更 / proposed sketch | 本 batch では 1 件も `schemas/proposed/` に置かない |
| Sanity mutation / read token 変更 | mutation はゼロ |
| dashboard runtime 挙動の変更 | 既存 8 page + `/api/asset-thumb` は不変 |
| Visual Register 改修 / 削除 | 2C 完了まで存続、本 batch では触らない |
| 画像生成 / Codex 起動 | ゼロ |
| Auth scheme 変更 | Basic Auth のまま、別 batch（docs/65 候補） |
| paid API integration | 永続 deferred |
| auto-post | 永続 deferred |
| deploy | ゼロ |
| Vercel UI 操作 | ゼロ |

### 1.4 関係する既存 docs / code

- [docs/62](62-admin-phase-2-visual-generation-admin-design.md): Phase 2 全体設計、§5 で route の Phase 別解禁、§6 で candidate review UI 概要、§8 で提案 schema 7 件
- [docs/63](63-cross-platform-content-visual-generation-core.md): Content Package / Visual Package / Repurpose Engine、§6 layout pattern 19 種、§7 Text-to-Visual Module Mapper 25 項目、§12 test case
- [docs/50](50-visual-prompt-quality-system.md): 35 点 review rubric（7 axes）の原型
- [docs/47](47-prompt-template-system.md): promptTemplate / reviewRubric / negativeInstructions / variationStrategy の field 構造
- [docs/48](48-campaign-generation-flow.md): visualAssetPlan / inbox / patch / publish の 13 段フロー
- [docs/49](49-platform-selection-model.md): selectedPlatforms 構造（X / Threads / note / Substack / YouTube / Shorts / Instagram / Podcast / ...）
- [docs/58](58-admin-dashboard-phase-plan.md): Phase 1 完了マーク + Phase 2 を 2A-2D に細分化
- `dashboard/src/app/visual-assets/page.tsx`: 既存 read-only listing（変更しない）
- `dashboard/src/lib/featureFlags.ts`: `ENABLE_LOCAL_FS_ROUTES` / `ENABLE_DIAGNOSTICS` / `ACTIVITY_LOG_MODE`（既存 flag を流用、新規 flag は本 batch では追加しない）
- `dashboard/src/proxy.ts`: Basic Auth proxy（不変）
- `tools/visual-register/server.mjs`: `/api/inbox/candidates` / `/api/inbox/review` / `/api/inbox/approve-and-register` / `/inbox-image`（参考、本 batch では起動しない）

### 1.5 Phase 2A の "完了とみなす" 条件

- [ ] `/visual-assets/[assetId]/candidates` で v001 / v002 / v003 を side-by-side 比較できる（localhost）
- [ ] review rubric が candidate と同じ画面で読める
- [ ] "Open in Visual Register" / "Copy review notes" / "Mark preferred" の 3 action が UI 上に存在し、書き action は disabled / `Phase 2B` ラベル付き
- [ ] production（`app.hitorimedia.com`）では filesystem 依存の candidate preview が **clean に degrade**（"Local candidate review unavailable in production mode" を表示）
- [ ] 1 週間以上 daily で使い、「読みでは足りない、approve action が欲しい」具体的不便を 3 件記録
- [ ] [docs/62](62-admin-phase-2-visual-generation-admin-design.md) § 3.1 の完了基準 4 件すべて満たす

---

## 2. Core user flows

### 2.1 Flow A — Campaign → Required Visual Assets → Asset Detail → Candidate Review

| step | entry / action | data needed | UI section | next action |
| --- | --- | --- | --- | --- |
| 1 | boss が `/campaigns/[slug]` を開く（既存 page） | `campaignPlan.requiredVisualAssets[]` | 既存 Campaign Detail | 「review 待ち」 visual を click |
| 2 | `/visual-assets/[assetId]` へ遷移 | `visualAssetPlan` + `campaignPlan.requiredVisualAssets[i]` 参照 | Header + 既存 final asset preview + brief link | 「candidate を見る」 click |
| 3 | `/visual-assets/[assetId]/candidates` へ遷移 | inbox candidates + review-manifest + prompt.md / review.md | Header / Candidate Grid / Detail Panel / Rubric Panel / Suggested Action Panel | "Open in Visual Register" or "Mark preferred (local)" |

**entry point**: Dashboard Home の "pending visuals" / Campaign Detail の "requiredVisualAssets"
**user intent**: 「いまどの visual の review 待ちか → どの candidate を採用するか」を完了する
**deferred write**: approve & register → Visual Register に外部リンク（Phase 2B で内部化）

### 2.2 Flow B — Content Package → Visual Package → Candidate Review

| step | entry / action | data needed | UI section | next action |
| --- | --- | --- | --- | --- |
| 1 | boss が `/content-packages` を開く（Phase 2A-3 で追加） | `contentPackage` (proposed) または campaignPlan を擬似 ContentPackage view として | Content Package list | 1 package を選ぶ |
| 2 | `/content-packages/[slug]` へ | ContentPackage detail | coreThesis / pointDecomposition[] の overview | 「visuals」 tab |
| 3 | `/content-packages/[slug]/visuals` へ | Visual Package overview + per-asset candidate review status | platform 別に visualAssetPlan を grid 表示 | 1 visual asset を click |
| 4 | `/visual-assets/[assetId]/candidates` へ（Flow A と同じ画面） | （同上） | （同上） | （同上） |

**Phase 2A-3 で追加**: Content Package 概念が schema active 化されるまでは **campaignPlan を擬似 ContentPackage** として view する fallback で対応（§9 で詳細）。

### 2.3 Flow C — Inbox Candidate List → Candidate Detail → Review Rubric

| step | entry / action | data needed | UI section | next action |
| --- | --- | --- | --- | --- |
| 1 | boss が `/visual-review/inbox` を開く | inbox 横断 review-manifest + candidate metadata | Inbox 全件 flat list（filter: status / campaign / asset） | candidate row を click |
| 2 | `/visual-review/inbox/[candidateId]` へ | 1 candidate の preview + prompt.md / review.md + rubric default | Larger preview + Rubric Panel + Suggested Action | "Open in Visual Register" or "Mark preferred (local)" |

**entry point**: dashboard nav の `Visual Review` link
**user intent**: 「campaign を跨いだ全 inbox」を 1 画面で見る、queue 管理的な使い方

### 2.4 Flow D — Candidate selected in dashboard → 人間が Visual Register で approve

| step | dashboard 側 | Visual Register 側 |
| --- | --- | --- |
| 1 | candidate を見比べて preferred を local mark | （未操作） |
| 2 | "Open in Visual Register" 押下 | localhost:3334 起動 / 該当 candidate を選択 |
| 3 | "Copy review notes" で notes を clipboard へ | Visual Register の Inbox Review カードに paste |
| 4 | （dashboard は読み終わり） | `approve & register` で final asset path に copy + patch JSON 生成 |

→ Phase 2A の唯一の **書き経路**は Visual Register 側にある。dashboard は **decision support tool**。

### 2.5 Flow E — needs-regeneration → 次の Codex run 準備（実行は Phase 2A では deferred）

| step | dashboard 側 | next action（人間 / 次バッチ） |
| --- | --- | --- |
| 1 | candidate に "Mark needs regeneration (Phase 2B)" UI（disabled） | 押せない |
| 2 | 代替: "Copy regeneration prompt preview" を click | 改変 prompt（variant 切替 / module 強調等）が clipboard へ |
| 3 | boss が手動で Codex CLI を起動（既存運用） | `codex exec -m gpt-5.4 --enable image_generation ...` |
| 4 | 新 v00N が inbox に追加 | dashboard 側は次回 reload で表示 |

→ Phase 2A は trigger を **発火しない**。Phase 2B で local CLI bridge を入れて初めて dashboard から発火可能（[docs/62 § 9.1](62-admin-phase-2-visual-generation-admin-design.md#91-option-a--local-cli-bridge推奨phase-2b)）。

---

## 3. Route map

### 3.1 全 11 route の責務表

| Route | Purpose | Phase 投入 | Data source | Read/Write | Production behavior | Localhost only? | Visual Register との関係 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/visual-assets` | 既存。visualAssetPlan listing | Phase 1（既存） | Sanity | read | ✓ available | no | 補助（外部リンク） |
| `/visual-assets/[assetId]` | 1 asset の detail（brief / metadata / 採用 final / 履歴） | **2A-1** | Sanity + filesystem(dev) | read | ✓ metadata だけ available | partial | 補助 |
| `/visual-assets/[assetId]/candidates` | candidate v00N grid + side-by-side compare + rubric inline | **2A-1** | filesystem inbox + review-manifest + prompt.md / review.md | read（2A） / write（2B） | "Local review unavailable" banner | **yes（candidate preview）** | **同 surface を内部化**、Visual Register への deep-link を残す |
| `/visual-review` | candidate review の入口 / queue 俯瞰 | **2A-2** | filesystem inbox 全件 | read | summary だけ available | partial | queue view を提供 |
| `/visual-review/inbox` | 全 candidate を flat list（filter: status / campaign / asset） | **2A-2** | filesystem inbox | read | 同上 | **yes** | 代替 |
| `/visual-review/inbox/[candidateId]` | 1 candidate の zoom + rubric + action | **2A-2** | inbox + manifest | read | 同上 | **yes** | 代替 |
| `/content-packages` | ContentPackage listing（active 化前は campaignPlan を擬似化） | **2A-3** | Sanity（active 化前は campaignPlan） | read | ✓ available | no | 無関係 |
| `/content-packages/[slug]` | 1 package の coreThesis / pointDecomposition / repurpose overview | **2A-3** | Sanity | read | ✓ available | no | 無関係 |
| `/content-packages/[slug]/visuals` | Visual Package overview（platform 別 grid + per-asset review status） | **2A-3** | Sanity + filesystem(dev, optional) | read | metadata + saved final asset thumbnail | partial | 補助 |
| `/visual-generation` | generation run の横断 view（active 化前は filesystem prompt.md / review.md history で代替） | Phase 2B+ | Sanity（active 化後）/ filesystem | read | 限定的 | partial | 補助 |
| `/visual-generation/runs/[id]` | 1 run の detail | Phase 2B+ | 同上 | read | 同上 | partial | 補助 |

### 3.2 既存 route との関係

- `/visual-assets` listing は **変更しない**（Phase 1 production runtime 不変）
- 既存 listing から detail へのリンクは **追加**（next/link 1 行、Phase 2A-1 で実装）
- nav menu に `Visual Review` link を追加（Phase 2A-2）
- nav menu に `Content Packages` link を追加（Phase 2A-3、active 化前は擬似化）

### 3.3 production vs localhost

| Route | localhost (`npm run dev`) | production (`app.hitorimedia.com`) |
| --- | --- | --- |
| `/visual-assets` | ✓ | ✓ |
| `/visual-assets/[assetId]` | ✓ | ✓ metadata + saved final（thumb は `ENABLE_LOCAL_FS_ROUTES` 次第） |
| `/visual-assets/[assetId]/candidates` | ✓ | banner で degrade（candidate preview は dev のみ） |
| `/visual-review/*` | ✓ | banner で degrade（filesystem reader 不在） |
| `/content-packages` / `/content-packages/[slug]` | ✓ | ✓ |
| `/content-packages/[slug]/visuals` | ✓ | metadata + saved final |
| `/visual-generation/*` | ✓ | filesystem mode 限定（Phase 2A は最小） |

### 3.4 全 route で守る不変条件

- すべて **read-only**（Phase 2A 中は GET のみ）
- production では filesystem 依存を必ず flag で gate（`ENABLE_LOCAL_FS_ROUTES`）
- Basic Auth proxy を通過しないと 401（既存 `dashboard/src/proxy.ts` を変更しない）
- Sanity write token を server-side でも参照しない（既存方針継続）
- private/ パス / secret / 実 project ID を **route URL / page content に出さない**

---

## 4. Primary screen wireframe — `/visual-assets/[assetId]/candidates`

### 4.1 全体レイアウト（ASCII wireframe）

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  app.hitorimedia.com   [ Home  Campaigns  Visual Assets  Visual Review … ]  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Read-only · Phase 2A · Local mode                          [ LocalModeBanner ] │
├─────────────────────────────────────────────────────────────────────────────┤
│  ╔═══════════════════════════════════════════════════════════════════════╗ │
│  ║  threads-support-diagram-v1                            (asset.title)  ║ │
│  ║  Campaign: building-hitori-media-os                                    ║ │
│  ║  Platform: threads        Asset type: paired-post-visual               ║ │
│  ║  Aspect ratio: 4:5        Pixel size: 1080 × 1350                      ║ │
│  ║  Status: brief-ready (no final asset saved yet)                        ║ │
│  ║  Expected final path: assets/visuals/.../threads-support-diagram-v1.png║ │
│  ║  Current final path: —                                                  ║ │
│  ║  Reuse policy: variant-required                                         ║ │
│  ╚═══════════════════════════════════════════════════════════════════════╝ │
│   ↑ VisualAssetHeader                                                       │
│                                                                             │
│  Candidate Comparison Grid                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                       │
│  │  v001        │  │  v002        │  │  v003        │                       │
│  │  diagram-    │  │  typography- │  │  metaphor-   │                       │
│  │  first       │  │  hybrid      │  │  mix         │                       │
│  │              │  │              │  │              │                       │
│  │  [preview]   │  │  [preview]   │  │  [preview]   │                       │
│  │              │  │              │  │              │                       │
│  │  1080×1350   │  │  1080×1350   │  │  1080×1350   │                       │
│  │  1.07 MB     │  │  1.12 MB     │  │  1.10 MB     │                       │
│  │  22:31 JST   │  │  08:38 JST   │  │  08:54 JST   │                       │
│  │  promptv2    │  │  promptv2    │  │  promptv2    │                       │
│  │  self: 24/35 │  │  self: 22/35 │  │  self: 25/35 │                       │
│  │  [candidate] │  │  [candidate] │  │  [candidate] │                       │
│  └──────────────┘  └──────────────┘  └──────────────┘                       │
│   ↑ CandidateGrid (CandidateCard × N)                                       │
│                                                                             │
│  Candidate Detail — v003 (metaphor-mix) ─────────────────────────────────── │
│  ┌──────────────────────────┐  ┌────────────────────────────────────────┐  │
│  │                          │  │ Visual intent:                          │  │
│  │  [larger preview]        │  │   metaphor を 1 点だけ加えた hub & spoke│  │
│  │                          │  │ Layout pattern: centralHeroFourCards    │  │
│  │  open in new tab ↗       │  │ Required modules:                       │  │
│  │  zoom 1.5×               │  │   centralNode / supportNodes ×4 / dashed│  │
│  │                          │  │   enclosure / connectors                │  │
│  └──────────────────────────┘  │ Prompt summary: (prompt.md の variant   │  │
│                                │   セクションを inline render)            │  │
│                                │ Style anchors used:                     │  │
│                                │   shared/campaign-hero-v1.png            │  │
│                                │   x/hook/x-hook-main-v1.png              │  │
│                                └────────────────────────────────────────┘  │
│   ↑ CandidatePreview            ↑ CandidateDetailPanel                      │
│                                                                             │
│  Review Rubric — v003 ──────────────────────────────────────────────────── │
│  ┌────────────────────────────────────────────────────────────────────────┐│
│  │ diagram richness         ★★★★☆  4 / 5                                   ││
│  │ readability              ★★★★★  5 / 5                                   ││
│  │ Japanese legibility      ★★★★★  5 / 5                                   ││
│  │ platform fit (Threads)   ★★★★☆  4 / 5                                   ││
│  │ brand consistency        ★★★★☆  4 / 5                                   ││
│  │ not text-only            ★★★★★  5 / 5                                   ││
│  │ information hierarchy    ★★★★☆  4 / 5                                   ││
│  │ publish usability        ★★★★☆  4 / 5                                   ││
│  │ ────────────────────────────────────────                                ││
│  │ Codex self-review        25 / 35   (candidate threshold ≥ 24)          ││
│  │ Human override           — / 35    (write disabled in Phase 2A)         ││
│  └────────────────────────────────────────────────────────────────────────┘│
│   ↑ ReviewRubricPanel                                                       │
│                                                                             │
│  Suggested Action ─────────────────────────────────────────────────────── │
│  ┌────────────────────────────────────────────────────────────────────────┐│
│  │ Recommended candidate: v003 (metaphor-mix)                              ││
│  │ Why: highest self-review (25/35), warm accent #E5B486 matches anchors,  ││
│  │     diagram structure clearly readable in Threads preview crops.        ││
│  │                                                                          ││
│  │ [ Open in Visual Register ↗ ]   (localhost:3334, deep link)             ││
│  │ [ Copy review notes ]          (clipboard)                              ││
│  │ [ Mark preferred (local UI)  ] (session-only, no write)                 ││
│  │ [ Regenerate prompt preview ] (Phase 2B — disabled)                     ││
│  │ [ Approve & register ]        (Phase 2B — disabled, use Visual Register) ││
│  └────────────────────────────────────────────────────────────────────────┘│
│   ↑ SuggestedActionPanel (DeferredActionButton for 2B labeled)              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Header の振る舞い

- 既存 `visual-assets/page.tsx` の StatusBadge / FilePathBlock を再利用
- `expectedLocalAssetPath` は `visualAssetPlan` から、`localAssetPath` がある場合は "Current final path" 行に表示
- production で `localAssetPath` が saved 状態 → サムネを `ENABLE_LOCAL_FS_ROUTES=true` の場合のみ `/api/asset-thumb` 経由で表示（既存）

### 4.3 Candidate Comparison Grid の振る舞い

- 3 列 grid（v001 / v002 / v003）、4+ 件あれば横スクロール
- candidate の **生成順** を保ち、deletion 不可
- variant label は `prompt.md` の frontmatter（`variant: diagram-first | typography-hybrid | metaphor-mix | custom`）
- self-review score は `review.md` の集計 or `visualGenerationRun.selfReviewScore`（future schema）
- status badge: `candidate` / `approved` / `rejected` / `needs-regeneration` / `registered`

### 4.4 Candidate Detail Panel の振る舞い

- grid で選んだ 1 candidate を **larger preview** で表示
- "Open in new tab" / "Zoom 1.5×" の補助 action（読み専用）
- Visual intent / layout pattern / required modules は prompt.md frontmatter から
- Prompt summary は prompt.md の該当 variant 節を **inline render**（読みやすい markdown rendering）
- Style anchors used は [docs/63 § 8](63-cross-platform-content-visual-generation-core.md#8-visual-package-template-v1) の `referenceStyleAnchors` を表示

### 4.5 Review Rubric Panel の振る舞い

- 7 axes × 1-5 score = 35 点満点（§10 で詳細）
- Codex self-review と Human override の 2 列を **並列表示**
- Phase 2A では Human override は **入力 disabled**、表示のみ（`review.md` の保存値があればそれを read）
- threshold 24+ / 18-23 / <18 を色分け表示

### 4.6 Suggested Action Panel の振る舞い

| action | Phase 2A | 挙動 |
| --- | --- | --- |
| Open in Visual Register ↗ | ✓ active | `http://localhost:3334/?slug=<contentSlug>&assetSlug=<assetSlug>` を新タブで開く |
| Copy review notes | ✓ active | review.md の該当 candidate 節を clipboard へ |
| Mark preferred (local UI) | ✓ active | session-only state、ページ離脱で消える、書きなし |
| Regenerate prompt preview | ✗ disabled | "Phase 2B" ラベル、tooltip で説明 |
| Approve & register | ✗ disabled | "Phase 2B — use Visual Register" ラベル |

### 4.7 secondary screen wireframes（要約）

**`/visual-assets/[assetId]`**:

```
[ ReadOnlyBanner ]
[ VisualAssetHeader ]
[ existing final preview (if saved) ]
[ Brief reference link → tasks/visuals/<slug>/<asset>.md ]
[ "View candidates →" button → /visual-assets/[assetId]/candidates ]
[ Open in Visual Register ↗ ]
```

**`/visual-review/inbox`**:

```
[ ReadOnlyBanner ]
[ Header: Visual Review Inbox / total candidates / by status ]
[ Filter row: campaign / asset / status (candidate/approved/needs-regen/rejected/registered) ]
[ Table:
    image | campaign | asset | variant | self | status | updatedAt | link  ]
[ Empty state: "No candidates in inbox" / "Local mode required" banner ]
```

**`/visual-review/inbox/[candidateId]`**:

```
[ ReadOnlyBanner ]
[ Candidate larger preview ]
[ Header: campaign / asset / variant / status ]
[ ReviewRubricPanel ]
[ PromptSummaryBlock ]
[ SuggestedActionPanel ]
```

**`/content-packages/[slug]/visuals`** (Phase 2A-3):

```
[ ReadOnlyBanner ]
[ Header: ContentPackage title + coreThesis 1 行 ]
[ Visual Package grid: platform 別に visualAssetPlan を表示 ]
  ┌─────────────────────────┬─────────────────────────┐
  │ Threads main visual     │ X hook visual           │
  │ status: brief-ready     │ status: saved           │
  │ candidates: 3           │ candidates: 1 (saved)   │
  │ [View candidates →]     │ [View asset →]          │
  └─────────────────────────┴─────────────────────────┘
[ Inline diagrams grid ... ]
```

---

## 5. Data sources

### 5.1 source 一覧

| Source | 内容 | 利用 phase | environment |
| --- | --- | --- | --- |
| **Sanity** | `visualAssetPlan` / `campaignPlan.requiredVisualAssets[]` / `contentIdea` / `brandProfile` / `visualStyleProfile` / `promptTemplate` | 2A | both |
| **filesystem (dev-only)** | `assets/inbox/generated/<campaign>/<assetSlug>/v00N.png` / `review-manifest.json` / `prompt.md` / `review.md` | 2A | localhost / `ENABLE_LOCAL_FS_ROUTES=true` |
| **filesystem (dev-only, final)** | `assets/visuals/<campaign>/<platform>/<placement>/<asset>.png` | 2A | localhost / `ENABLE_LOCAL_FS_ROUTES=true` (既存) |
| **future schema (Sanity)** | `contentPackage` / `visualPackage` / `visualCandidate` / `visualGenerationRun` / `designProfile` / `visualReviewDecision` / `assetRegistrationLog` | 2C+ (active 化後) | both |
| **build-time snapshot** | dashboard `public/activity-snapshot.json` の延長で `candidate-snapshot.json` 等を将来導入 | Phase 2B+ で評価 | production（限定 preview 用） |

### 5.2 Sanity から読むもの（Phase 2A、既存方針）

- read token only（既存 `@sanity/client`、`useCdn` 自動）
- write token は server-side でも読み込まない
- GROQ query 例（新規、2A-1 で実装）:

```groq
*[_type == "visualAssetPlan" && _id == $assetId][0]{
  _id,
  title,
  targetPlatform,
  placement,
  assetType,
  aspectRatio,
  reusePolicy,
  status,
  expectedLocalAssetPath,
  localAssetPath,
  imagePrompt,
  textToInclude,
  textToAvoid,
  visualDirection,
  reviewNotes,
  generatedWith,
  generationProvider,
  sourcePromptVersion,
  updatedAt,
  "sourceContentIdea": sourceContentIdea->{_id, title, "slug": slug.current},
  "sourceCampaign": *[_type == "campaignPlan" && references(^._id)][0]{
    _id, title, "slug": slug.current
  },
}
```

### 5.3 filesystem reader（Phase 2A、dev-only）

| 場所 | 読みたいもの | 既存 Visual Register 相当 |
| --- | --- | --- |
| `assets/inbox/generated/<slug>/` | candidate v00N.png 一覧 | `listInboxImageFiles` |
| `assets/inbox/generated/<slug>/review-manifest.json` | candidate review status | `loadInboxManifest` |
| `assets/inbox/generated/<slug>/<asset>/prompt.md` | variant 別 prompt | (Visual Register に該当なし、本 doc 新規) |
| `assets/inbox/generated/<slug>/<asset>/review.md` | self-review score / human notes | (同上) |
| `tasks/visuals/<slug>/<asset>.md` | brief（参考） | (同上) |

dashboard 側に **`tools/visual-register/server.mjs` を import しない**: Visual Register を `npm run visual:register` で起動していなくても dashboard が動くこと。`dashboard/src/lib/inboxReader.ts` を新規（§6 で API、§8 で component）、Visual Register の読みロジックは concept だけ参考にし、code は再実装。

### 5.4 Phase 2A での availability matrix

| データ | localhost dev | production (`app.hitorimedia.com`) |
| --- | --- | --- |
| visualAssetPlan metadata | ✓ | ✓ |
| campaignPlan.requiredVisualAssets[] | ✓ | ✓ |
| 既存 final asset thumb (`/api/asset-thumb`) | ✓ | flag 次第 |
| candidate v00N preview | ✓ | **✗**（filesystem 不在） |
| review-manifest.json | ✓ | **✗** |
| prompt.md / review.md | ✓ | **✗** |
| Codex self-review score | ✓ | **✗**（review.md 由来） |
| brandProfile / visualStyleProfile / promptTemplate | ✓ | ✓ |
| future schema (contentPackage / visualCandidate 等) | future | future |

### 5.5 production fallback 戦略

production で candidate preview が不在の場合、以下に degrade:

- candidate grid を **disable**、"Local candidate review unavailable in production mode" banner
- review rubric は **promptTemplate.reviewRubric の default scheme** だけ表示（score 空欄）
- "Open in Visual Register" / "Copy review notes" / "Mark preferred" は **本 batch では disable**（Visual Register が production からアクセス不能なため）
- 代替: "View saved final asset" / "View brief in tasks/" link を提示

**Phase 2B+** で評価する選択肢:

- candidate preview の **build-time snapshot**（PNG を base64 で snapshot json に焼く）→ ファイルサイズ上限が課題、Phase 2B で再評価
- candidate を Sanity asset に upload → write 解禁が必要、Phase 2C 範囲

---

## 6. Dev-only API design

### 6.1 endpoint 一覧（**設計のみ、実装は 2A-1**）

| Method | Path | Purpose | Validation |
| --- | --- | --- | --- |
| GET | `/api/visual-review/inbox` | inbox 全 candidate listing (filter: slug / status) | `ENABLE_LOCAL_FS_ROUTES`、slug 正規化、最大 200 件 |
| GET | `/api/visual-review/assets/[assetId]/candidates` | 1 asset の candidate listing + manifest | 同上 + assetId validation |
| GET | `/api/visual-review/candidate-image?path=...` | candidate PNG を serve | 既存 `/api/asset-thumb` と同じ path validation、prefix `assets/inbox/generated/` 限定 |
| GET | `/api/visual-review/review-manifest?slug=...` | review-manifest.json を JSON で返す | slug 正規化、JSON parse |
| GET | `/api/visual-review/prompt?path=...` | prompt.md を markdown text で返す | path validation、prefix `assets/inbox/generated/` または `tasks/visuals/` |
| GET | `/api/visual-review/review-notes?path=...` | review.md を markdown text で返す | 同上 |

### 6.2 共通 rules

- **すべて GET のみ**（Phase 2A は read-only）
- `ENABLE_LOCAL_FS_ROUTES === true` でない場合は **403 + 短い JSON**
- path validation は既存 `/api/asset-thumb` のパターンに揃える:
  - 絶対パス禁止
  - `..` 含むパス禁止
  - 正規化後、許可 prefix のみ通す
  - 拡張子 whitelist（PNG / JPG / JPEG / WEBP / GIF for image、`.md` for text、`.json` for manifest）
  - サイズ上限 8 MB（既存 asset-thumb と同じ）
- **Sanity mutation 呼び出しゼロ**
- **filesystem write ゼロ**
- **Codex / paid API 呼び出しゼロ**
- response cache: `cache-control: no-store`
- error response はメッセージのみ、stack trace を漏らさない

### 6.3 既存 Visual Register API との関係

| Visual Register | 本 doc dashboard API | 関係 |
| --- | --- | --- |
| `GET /api/inbox/candidates` | `GET /api/visual-review/inbox` | concept 同等、dashboard 側に独立実装 |
| `GET /inbox-image?path=` | `GET /api/visual-review/candidate-image?path=` | concept 同等、prefix limit を厳格化 |
| `POST /api/inbox/review` | (Phase 2B で `POST /api/visual-review/inbox/[cid]/status`) | Phase 2A では実装しない |
| `POST /api/inbox/approve-and-register` | (Phase 2B で `POST /api/visual-review/approve-and-register`) | 同上 |
| `GET /api/visual-asset-plans` | dashboard は Sanity 直 fetch（既存 GROQ） | dashboard は Visual Register に依存しない |
| `GET /api/visual-patches` | (Phase 2B で `/api/visual-review/patches/...`) | 同上 |

→ **Visual Register process を起動していなくても dashboard が動く**。dashboard と Visual Register は **互いに依存しない兄弟プロセス**。

### 6.4 path validation の具体

```ts
// dashboard/src/lib/inboxPath.ts （未実装、設計のみ）
const ALLOWED_PREFIXES = [
  'assets/inbox/generated/',
  'assets/visuals/',         // 既存 /api/asset-thumb と整合
  'tasks/visuals/',
] as const

const ALLOWED_IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif'])
const ALLOWED_TEXT_EXT = new Set(['.md'])
const ALLOWED_JSON_EXT = new Set(['.json'])
const MAX_BYTES = 8 * 1024 * 1024

function safeRepoPath(p: string, kind: 'image' | 'text' | 'json') {
  // 1. 正規化
  // 2. 絶対パス禁止
  // 3. .. 禁止
  // 4. ALLOWED_PREFIXES のいずれかに該当
  // 5. 拡張子 whitelist
  // 6. 存在確認 + サイズ上限
  // 7. repo root 配下確認（既存 `/api/asset-thumb` と同じ）
}
```

→ Phase 2A-1 で実装、本 batch は仕様のみ。

---

## 7. Production behavior

### 7.1 Phase 2A production の振る舞い

`app.hitorimedia.com` （Basic Auth 通過後）:

| route | behavior |
| --- | --- |
| `/visual-assets` | 既存通り。listing が見える |
| `/visual-assets/[assetId]` | metadata + saved final（`localAssetPath` がある場合の thumb は flag 次第） |
| `/visual-assets/[assetId]/candidates` | **`LocalModeBanner`** で "Local candidate review unavailable in production mode" / Visual Register への deep link は **本 batch では表示しない**（production から localhost:3334 にアクセス不能） |
| `/visual-review/*` | 同 banner、empty state |
| `/content-packages/[slug]/visuals` | platform 別の visualAssetPlan grid + saved final の thumb（候補は表示しない） |

### 7.2 production で見せる内容（候補比較なし版）

```
┌────────────────────────────────────────────────────────────────────┐
│ Visual asset: threads-support-diagram-v1                             │
│ Status: brief-ready                                                   │
│ Expected final path: assets/visuals/.../threads-support-diagram-v1.png│
│ Current final path: — (not saved yet)                                 │
│                                                                       │
│ Candidate review is local-only in Phase 2A.                          │
│ To review candidates, run the dashboard on localhost                  │
│ with `npm run dev` and `ENABLE_LOCAL_FS_ROUTES=true`.                 │
│                                                                       │
│ [ View asset metadata ]                                              │
│ [ View campaign context ]                                            │
│ [ View saved final asset ]   (if exists)                              │
└────────────────────────────────────────────────────────────────────┘
```

### 7.3 deferred 判断（Phase 2B 着手時に再評価）

- **build-time snapshot による production candidate preview**: 採用 / 不採用 を Phase 2B で評価
  - 採用: candidate を PNG → base64 化して `public/candidate-snapshot.json` に焼く。ファイルサイズ上限が課題、Phase 2A では決めない
  - 不採用: production では candidate review を諦め、localhost dev を唯一の review surface に
- **Sanity asset 経由の candidate preview**: write 解禁が必要、Phase 2C 範囲
- **app subdomain でも generation bridge を動かす**: Codex 認証情報を server に置くことになり [docs/62 § 9.2](62-admin-phase-2-visual-generation-admin-design.md#92-option-b--server-action-directly-invokes-generation) で却下済、永続 deferred

### 7.4 production read-only 不変条件

| 不変条件 | 確認方法 |
| --- | --- |
| すべて GET、書き action は 0 | Phase 2A 中の route map に POST / PUT / DELETE がない |
| filesystem read は flag で gate | `ENABLE_LOCAL_FS_ROUTES === false` の production で 403 / banner degrade |
| Sanity mutation は呼ばない | dashboard server で `client.create` / `patch` / `commit` の grep 0 hits 維持 |
| Visual Register process に依存しない | localhost:3334 が落ちていても dashboard が起動できる |
| Basic Auth proxy を通る | 全 route が proxy matcher 内、`/api/visual-review/*` も含める |
| secret / project ID / private path を URL に乗せない | route 設計で slug-based、id-based は OK、絶対パスは API 側で reject |

---

## 8. Component breakdown

### 8.1 component 一覧

| # | Component | Props | Data source | Phase | Reusable across routes |
| --- | --- | --- | --- | --- | --- |
| 1 | **VisualAssetHeader** | `{ asset: VisualAssetPlan, campaign?: CampaignPlanRef }` | Sanity | 2A-1 | ✓（detail / candidates / Content Package visuals 共通） |
| 2 | **CandidateGrid** | `{ candidates: CandidateMeta[], selectedId?: string, onSelect?: (id) => void }` | filesystem | 2A-1 | ✓（candidates / inbox 共通） |
| 3 | **CandidateCard** | `{ candidate: CandidateMeta, selected?: boolean }` | (prop drilling) | 2A-1 | ✓ |
| 4 | **CandidatePreview** | `{ candidate: CandidateMeta, zoom?: 1 \| 1.5 \| 2 }` | `/api/visual-review/candidate-image` | 2A-1 | ✓ |
| 5 | **CandidateDetailPanel** | `{ candidate: CandidateMeta, promptText?: string, anchors: string[] }` | filesystem + Sanity | 2A-2 | ✓ |
| 6 | **ReviewRubricPanel** | `{ rubric: RubricScheme, scores?: RubricScores, humanOverride?: RubricScores }` | filesystem (review.md) + Sanity (promptTemplate.reviewRubric) | 2A-2 | ✓ |
| 7 | **SuggestedActionPanel** | `{ candidate: CandidateMeta, recommended?: string, why?: string, deferredActions: DeferredAction[] }` | (composition) | 2A-2 | ✓ |
| 8 | **VisualModuleChecklist** | `{ required: string[], present: string[] }` | filesystem (prompt.md frontmatter) | 2A-2 | ✓（candidate detail / Content Package overview） |
| 9 | **PromptSummaryBlock** | `{ markdown: string, variant?: string }` | filesystem | 2A-2 | ✓ |
| 10 | **StyleAnchorList** | `{ anchors: string[] }` | Sanity (visualStyleProfile.referenceImagePaths) | 2A-2 | ✓ |
| 11 | **LocalModeBanner** | `{ mode: 'localhost' \| 'production', enableLocalFsRoutes: boolean }` | featureFlags | 2A-1 | ✓（全 candidate route 共通） |
| 12 | **DeferredActionButton** | `{ label: string, phase: '2B' \| '2C' \| '2D', tooltip?: string, disabled: true }` | (props only) | 2A-1 | ✓ |
| 13 | **EmptyCandidateState** | `{ reason: 'no-candidates' \| 'local-only' \| 'asset-not-found' }` | (props only) | 2A-1 | ✓ |
| 14 | **CandidateStatusBadge** | `{ status: 'candidate' \| 'approved' \| 'rejected' \| 'needs-regeneration' \| 'registered' }` | (props only) | 2A-1 | ✓（既存 StatusBadge と responsibility 分離） |

### 8.2 既存 component との関係

| 既存 (Phase 1) | Phase 2A 追加 | 関係 |
| --- | --- | --- |
| `ReadOnlyBanner` | (再利用) | candidate 画面でも上部に表示 |
| `StatusBadge` | `CandidateStatusBadge`（新規） | StatusBadge は visualAssetPlan.status 用、Candidate～ は candidate review status 用に分離 |
| `SummaryCard` | (再利用) | Visual Review queue overview で |
| `EmptyState` | `EmptyCandidateState`（候補なし用 specialized） | 既存 EmptyState を内部で利用 |
| `FilePathBlock` | (再利用) | expected/current path display |
| `SectionHeader` | (再利用) | Detail Panel / Rubric Panel 内 |

### 8.3 component の責務分離

- **data fetching は page で**、component には props 経由で渡す（Next.js App Router の Server Component 慣行）
- **filesystem 読み出し用 API は server-only route**、component から fetch
- **clipboard / "Mark preferred" などの client interaction は Client Component**（`use client` directive）
- **画像 preview は `<img>` で**（既存 `/api/asset-thumb` と同じ理由、Next.js image optimization を経由しない）

---

## 9. Content Package integration（`/content-packages/[slug]/visuals`）

### 9.1 目的

Phase 2A-3 で追加する画面。**1 Content Package** に対する **Visual Package 全 asset の overview**:

- platform ごとに visualAssetPlan を grid 表示
- 各 visual asset の review status / candidate 数 / saved final 有無を一覧
- 1 click で `/visual-assets/[assetId]/candidates` へ移動

### 9.2 ContentPackage 概念の現実装ギャップ

`contentPackage` schema は active 化されていない。Phase 2A-3 では:

| 段階 | source | 実装 |
| --- | --- | --- |
| 2A-3 a | **campaignPlan を擬似 ContentPackage として view** | campaignPlan.title / .coreThesis / .selectedPlatforms / .requiredVisualAssets[] を ContentPackage 風に render |
| 2C で active 化後 | `contentPackage` schema を読む | GROQ で contentPackage を fetch、`requiredVisualAssets` の代わりに `visualPackage.*` を表示 |

### 9.3 ContentPackage → 1-to-N platform visual mapping

[docs/63 § 12](63-cross-platform-content-visual-generation-core.md#12-test-case--aiでひとりメディア運営osを作っている裏側) の test case を画面に翻訳:

```
┌────────────────────────────────────────────────────────────────────┐
│ Content Package: building-hitori-media-os                            │
│ Core thesis: ひとり運営は "発信" を増やすより "Content Idea を構造  │
│              化して仕組みに変える" ほうが続く                        │
│                                                                       │
│ Visual Package overview                                              │
│ ┌─────────────────┬─────────────────┬─────────────────┐              │
│ │ X main          │ Threads main    │ note hero       │              │
│ │ x-hook-main-v1  │ threads-...-v1  │ note-hero-v1    │              │
│ │ status: saved   │ status: brief-r │ status: saved   │              │
│ │ candidates: 1   │ candidates: 3   │ candidates: 1   │              │
│ │ layout: hubAnd- │ layout: cent... │ layout: contO.. │              │
│ │ Spoke           │ HeroFourCards   │ Flow            │              │
│ │ [View →]        │ [View →]        │ [View →]        │              │
│ └─────────────────┴─────────────────┴─────────────────┘              │
│ ┌─────────────────┬─────────────────┬─────────────────┐              │
│ │ Threads reply 1 │ Threads reply 2 │ Threads reply 3 │              │
│ │ thr-supp-1-...  │ thr-supp-2-...  │ thr-supp-3-...  │              │
│ │ status: planned │ status: planned │ status: planned │              │
│ │ candidates: 0   │ candidates: 0   │ candidates: 0   │              │
│ │ layout: workfl..│ layout: ngOkC.. │ layout: automa..│              │
│ │ [View →]        │ [View →]        │ [View →]        │              │
│ └─────────────────┴─────────────────┴─────────────────┘              │
│ ┌─────────────────┬─────────────────┐                                │
│ │ note inline-1   │ Substack header │                                │
│ │ ...             │ substack-head-1 │                                │
│ │ status: brief-r │ status: planned │                                │
│ │ ...             │ ...             │                                │
│ └─────────────────┴─────────────────┘                                │
└────────────────────────────────────────────────────────────────────┘
```

### 9.4 platform groupings

| group | platforms | visual roles |
| --- | --- | --- |
| **short-form** | X / Threads | main hook / Threads main + replies |
| **long-form** | note / Substack | hero / inline diagrams / header banner |
| **video** | YouTube / Shorts | thumbnail / cover |
| **carousel** | Instagram | cover + breakdown slides |
| **future** | Podcast / GitHub / others | (UI place holder) |

各 group は collapsible section で。group 単位で「全 asset の review status」を summary 表示。

### 9.5 data source（Phase 2A-3）

```groq
*[_type == "campaignPlan" && slug.current == $slug][0]{
  _id,
  title,
  coreThesis,
  selectedPlatforms,
  requiredVisualAssets[]{
    visualAssetPlanId,
    assetSlug,
    platform,
    assetType,
    priority,
    state,
    localAssetPath,
    "asset": *[_type == "visualAssetPlan" && _id == ^.visualAssetPlanId][0]{
      _id, title, targetPlatform, placement, assetType, status, localAssetPath, expectedLocalAssetPath
    }
  }
}
```

candidate 数は filesystem reader（`/api/visual-review/inbox?slug=<slug>`）から取得。

---

## 10. Candidate scoring display

### 10.1 35 点 rubric（7 axes × 1-5）

[docs/62 § 6.3](62-admin-phase-2-visual-generation-admin-design.md#63-review-panelcandidate-ごと) / [docs/63 § 8](63-cross-platform-content-visual-generation-core.md#8-visual-package-template-v1) の axes:

| # | axis | weight | criteria（pass） |
| --- | --- | --- | --- |
| 1 | diagram richness | 1× | 構造が立っている、nodes ≥ 2 |
| 2 | clarity / readability | 1× | 一瞬で読める |
| 3 | Japanese legibility | 1× | 日本語ラベル全て読める / フォント崩れなし |
| 4 | brand consistency | 1× | campaign-hero-v1 / x-hook-main-v1 とトーン揃い |
| 5 | platform fit | 1× | preview crop / aspect ratio 適合 |
| 6 | not text-only | 1× | タイトルカード化していない |
| 7 | publish / save usability | 1× | 公開素材として使える |

→ **35 点満点**（5 × 7）。

### 10.2 threshold

| score | 判定 | UI |
| --- | --- | --- |
| **24 ≤ score** | **candidate**（採用候補） | 緑バッジ |
| **18 ≤ score < 24** | **needs review**（要詳細確認） | 黄バッジ |
| **score < 18** | **regenerate recommended** | 赤バッジ |

### 10.3 score display

```
┌──────────────────────────────────────────────────────┐
│ diagram richness         ★★★★☆  4 / 5    (codex)     │
│ clarity / readability    ★★★★★  5 / 5                │
│ Japanese legibility      ★★★★★  5 / 5                │
│ brand consistency        ★★★★☆  4 / 5                │
│ platform fit (Threads)   ★★★★☆  4 / 5                │
│ not text-only            ★★★★★  5 / 5                │
│ publish usability        ★★★★☆  4 / 5                │
│ ─────────────────────────────────────                │
│ Codex self-review        25 / 35   ✓ candidate       │
│                                                       │
│ Human override           — / 35                       │
│ (input disabled in Phase 2A — write available in 2B)  │
└──────────────────────────────────────────────────────┘
```

### 10.4 Codex self-review vs human override

| source | Phase 2A | Phase 2B |
| --- | --- | --- |
| Codex self-review | review.md 由来、read-only display | 同じ |
| Human override | display-only（過去に review.md に記入があれば read） | **入力可能**（filesystem write へ） |

→ Phase 2A では human override は read のみ。Phase 2B で入力 form を解禁。

### 10.5 human override が Codex と乖離した場合の見せ方

```
Codex self-review:  25 / 35  ✓
Human override:     19 / 35  ⚠ disagreement

(Diff: Codex rated brand consistency 4/5,
 human rated 2/5 — investigate before approving)
```

→ Phase 2A では disagreement banner を表示するだけ、blocking はしない。

---

## 11. Visual Register coexistence

### 11.1 phase 別の役割分担

| Phase | dashboard | Visual Register |
| --- | --- | --- |
| 1 (現状) | listing のみ（読み） | approve & register（書き）、唯一の visual review surface |
| **2A** | candidate review surface（読み）、decision support | approve & register（書き）、Phase 2A 中は依然必須 |
| 2B | approve & register（書き、localhost only） | fallback / 並走（dashboard だけで完走できることを確認するための比較） |
| 2C | Sanity 反映含む完全な write surface | deprecate 判断（人間が 1 ヶ月以上 Visual Register を起動していなければ削除候補） |

### 11.2 deprecation 条件（Visual Register を消す判断）

- [ ] Phase 2C 完了
- [ ] boss が **1 ヶ月以上** Visual Register process を起動していない（`tools/visual-register/server.mjs` を `npm run visual:register` で起動した形跡が 0）
- [ ] approve & register / patch JSON 生成 / Sanity 反映 / publish-package dry-run のすべてが dashboard で代替できている
- [ ] 失敗時の fallback が用意されている（Sanity Studio で手動 mutation、filesystem を直接編集できる）

→ 上記 4 件すべて満たして初めて削除判断。本 batch では **削除しない、宣言だけ**。

### 11.3 coexistence の実装上の注意

- dashboard は Visual Register process に依存しない（§5.3）
- 同一 inbox / 同一 review-manifest.json を 2 プロセスが触る場合、書きは **どちらか片方のみ**（Phase 2A は dashboard が書かない、Visual Register が書く）
- Phase 2B 以降で両方が書く場合: `review-manifest.json` の `updatedAt` を最終 writer の責務に、最後に書いた方が勝つ（last-writer-wins）。並行書き込み conflict は Phase 2B 設計で再評価

### 11.4 dashboard → Visual Register への deep link

localhost 環境のみ:

```ts
const url = new URL('http://localhost:3334/')
url.searchParams.set('slug', contentSlug)
url.searchParams.set('assetSlug', assetSlug)
// 必要なら url.searchParams.set('candidate', candidateRelativePath)
```

production 環境では deep link は **表示しない**（localhost:3334 にアクセスできないため）。

---

## 12. Implementation batches after this wireframe

### 12.1 batches 4 件

| Batch | 内容 | route 投入 | API 投入 | Component 投入 | 完了基準 |
| --- | --- | --- | --- | --- | --- |
| **2A-1** | read-only candidate route, image preview API, no write | `/visual-assets/[assetId]`, `/visual-assets/[assetId]/candidates` | `GET /api/visual-review/inbox`, `/api/visual-review/assets/[assetId]/candidates`, `/api/visual-review/candidate-image`, `/api/visual-review/review-manifest` | VisualAssetHeader, CandidateGrid, CandidateCard, CandidatePreview, LocalModeBanner, EmptyCandidateState, CandidateStatusBadge, DeferredActionButton | localhost で `/visual-assets/<id>/candidates` で v00N grid + preview が見える、production で degrade banner |
| **2A-2** | candidate detail page, rubric display, prompt/review markdown display | (既存 route 拡張) | `GET /api/visual-review/prompt`, `/api/visual-review/review-notes` | CandidateDetailPanel, ReviewRubricPanel, SuggestedActionPanel, VisualModuleChecklist, PromptSummaryBlock, StyleAnchorList | candidate detail で prompt summary / rubric / style anchor が見える、"Open in Visual Register" deep link が動く |
| **2A-3** | content package visual overview, candidate comparison across platforms | `/content-packages`, `/content-packages/[slug]`, `/content-packages/[slug]/visuals`, `/visual-review`, `/visual-review/inbox`, `/visual-review/inbox/[cid]` | (既存 API 拡張、新規不要) | (既存 component 再利用) | 1 campaign の Visual Package を 1 画面で俯瞰できる、`/visual-review/inbox` で全 candidate を flat 表示 |
| **2B-1** | approve & register write endpoint in dashboard, localhost only | (route 不変) | `POST /api/visual-review/approve-and-register`, `POST /api/visual-review/inbox/[cid]/status` | (既存 component に write action 追加) | dashboard 1 click で approve & register が localhost で動く、Visual Register と並走確認 |

### 12.2 batches 間の依存

```
2A-1 (route + image preview)
   ↓
2A-2 (rubric + prompt detail) ← 2A-1 の component を depend
   ↓
2A-3 (content package overview) ← 2A-1 / 2A-2 の component を depend
   ↓
[Phase 2A 完了]
   ↓
2B-1 (write endpoint) ← Phase 2A 全体を depend
```

各 batch は **1 PR / 1 commit batch** で済む粒度を狙う。

### 12.3 各 batch の Out（共通）

- schema 変更 / activate
- Sanity mutation
- Auth 切り替え
- production deploy（Phase 2A は localhost dev 主、production は degrade banner のみ）
- paid API integration
- auto-post

---

## 13. Risks / open questions

| Risk | Mitigation |
| --- | --- |
| Phase 2A の component が Phase 2B で書き action を追加するときに **再設計** になる | DeferredActionButton を Phase 2A で先に置き、phase prop で動作を切り替える設計 |
| filesystem reader が **Visual Register と重複実装** になり drift する | 2A-1 で `dashboard/src/lib/inboxReader.ts` を新規、Visual Register の logic は参考だけ、code は再実装、テストで behavior parity 検証 |
| production で candidate review が **使えない** ことが boss の混乱を招く | LocalModeBanner を全 candidate 画面の top に固定、"localhost で開いてください" を明示 |
| `prompt.md` / `review.md` の **frontmatter 仕様未確定** | Phase 2A-1 で frontmatter 仕様（variant / layoutPattern / requiredModules / selfReviewScore）を docs/64 に append、既存 inbox の 2 件（threads-support-diagram-v1 / note-inline-content-os-flow-v1）を仕様適合させる別 batch を挟む |
| candidate scoring の **threshold（24/18）** が実運用と乖離 | Phase 2A 1 週間運用後に再評価、調整は本 batch では確定しない |
| **`/api/visual-review/*` 名前空間** が将来 Phase 2B の write 解禁時に汚染される | Phase 2A は GET 限定、Phase 2B で write 追加するときに `POST /api/visual-review/...` を **明示的に别 docs で承認** |
| dashboard と Visual Register が **同 review-manifest.json を同時に書く** | Phase 2A 中は dashboard が書かないので発生しない、Phase 2B 設計で last-writer-wins を再評価 |

---

## 14. Phase 2A frontmatter spec（補足、Phase 2A-1 で確定）

candidate detail UI が `prompt.md` / `review.md` から拾うべき最低限の field。**本 batch は提案、Phase 2A-1 で確定**:

```yaml
# assets/inbox/generated/<slug>/<asset>/prompt.md frontmatter
---
contentSlug: building-hitori-media-os
visualAssetPlanId: visualAssetPlan.building-hitori-media-os.threads-support-diagram-v1
assetSlug: threads-support-diagram-v1
generator: codex-cli-0.120.0
batch: production-visual-generation-batch-2
date: 2026-05-18
variants:
  - id: v001
    label: diagram-first
    layoutPattern: top-headline-bottom-flow
    requiredModules: [centralNode, supportNodes, connectors]
  - id: v002
    label: typography-hybrid
    layoutPattern: title-with-single-diagram
    requiredModules: [headline, centralNode, supportLabels]
  - id: v003
    label: metaphor-mix
    layoutPattern: centralHeroFourCards
    requiredModules: [centralNode, supportNodes, dashedEnclosure, connectors]
---
```

```yaml
# assets/inbox/generated/<slug>/<asset>/review.md frontmatter
---
contentSlug: building-hitori-media-os
assetSlug: threads-support-diagram-v1
batch: production-visual-generation-batch-2
rubricVersion: v1
candidates:
  - id: v001
    selfReviewScores:
      diagramRichness: 4
      clarity: 5
      japaneseLegibility: 5
      brandConsistency: 4
      platformFit: 4
      notTextOnly: 5
      publishUsability: 4
    total: 31
  - id: v002
    ...
  - id: v003
    ...
recommended: v003
recommendedReason: highest self-review (25/35), warm accent matches anchors
---
```

→ frontmatter 適合は Phase 2A-1 着手時に **既存 2 件の inbox 文書を update する別 mini-batch** を挟む。本 batch では仕様提案のみ。

---

## 15. 連番について

- docs: 63 → **64**
- devlog: 0110 → **0111**
- handoff: 0121 → **0122**
- Auth 設計（旧 docs/65 候補）は引き続き保留、Phase 2C 着手前に独立 batch

---

## 16. Safety（本 batch、design-only）

- schema 変更 / activate / proposed sketch: **0 件**
- code 変更（dashboard / tools / sanity.config / proxy.ts / schemas / structure）: **0 件**
- API route 追加: **0 件**（仕様提案のみ）
- React component 追加: **0 件**（仕様提案のみ）
- assets / patches / inbox / seed / publish-packages の編集: **0 件**
- Sanity mutation: **0 件**
- 画像生成 / Codex CLI 起動: **0 件**
- 新規パッケージ: **0 件**
- Auth 実装 / 変更: **0 件**
- 環境変数変更 / Vercel UI 操作: **0 件**
- deployment: **0 件**
- 既存 production dashboard (`app.hitorimedia.com`) の挙動: **不変**
- Visual Register (`tools/visual-register/`) の挙動: **不変**

→ validation 結果は handoff §10 に記録。
