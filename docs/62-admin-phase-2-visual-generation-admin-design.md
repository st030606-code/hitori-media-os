# 62 — Admin Phase 2: Visual Register Integration + Visual Generation Quality System (design)

Date: 2026-05-18
Status: **design-only**, no implementation / no Auth scaffold / no schema activation / no writes / no deploy
Supersedes (scope): [docs/58](58-admin-dashboard-phase-plan.md) Phase Admin 2 節（後段で 2A〜2D に細分化、本 doc が canonical）

Phase Admin 1 は `app.hitorimedia.com` で production-live・Basic Auth・read-only 完了 ([docs/handoff/0119](handoff/0119-admin-phase-1-batch-d3-post-deploy-verification.md))。本 doc は Phase Admin 2 の **設計のみ**: Visual Register を admin dashboard に統合する道筋と、visual generation の品質を仕組み化する設計を扱う。

---

## 1. なぜ Phase Admin 2 が存在するか

### 1.1 現在の運用問題

Visual 1枚を承認するために boss は **5 つの context を行き来している**:

```
Claude Code / Codex (生成 prompt 投入)
   ↓
assets/inbox/generated/<slug>/<asset>/v00N.png  (filesystem)
   ↓
Visual Register http://localhost:3334  (別 process / 別 tab)
   ↓
Sanity Studio                          (手動で localAssetPath / status を反映)
   ↓
publish-package-builder                (CLI / 別 process)
```

これは MVP として正解だったが、**1 campaign 完走に必要な"道具切り替え回数"が多すぎて疲労する**。本 phase の目標は「dashboard を開いたままで visual 工程を完走できる」。

### 1.2 Visual Register が dashboard に入る理由

| 観点 | 別 tool のまま | dashboard 統合後 |
| --- | --- | --- |
| 起動 | `npm run visual:register` が必要 | dashboard ログイン後に即アクセス |
| 候補比較 | inbox の v00N PNG を 1 枚ずつ確認 | v001/v002/v003 を side-by-side で比較 |
| review rubric | `_style-guide.md` を別 tab で参照 | candidate ごとに inline 表示 |
| 承認 → final 反映 | Studio 手動入力 + publish-package CLI | dashboard から 1 action で reflect 可能（Phase 2B+） |
| 監査 | 履歴は `review-manifest.json` のみ | review record / decision log を database で残す（Phase 2C+） |
| product 化 | 個人 local tool のまま | 同じ UI が他ユーザーにも届けられる（Phase 2D） |

→ Visual Register の **既存実装は当面残す**（Phase 1 で動作確認済）。dashboard 側に **読み取り integration** を入れ、書き込み権限は段階的に解禁する。

### 1.3 何が Phase 2 のスコープ「外」か

| 項目 | 理由 |
| --- | --- |
| Auth 実装 | 本 doc 末尾に "次の design batch" として分離。Basic Auth はそのまま続行 |
| 新パッケージ追加 | repo 重量化を避ける、既存依存で完結する設計のみ |
| paid LLM / image API integration | 永続 deferred |
| auto-posting | 永続 deferred |
| Vercel UI 操作 | コードから触らない、人間操作のまま |
| Sanity 本番 mutation | Phase 2C で初めて議論、本 doc では設計のみ |
| 既存 production dashboard 挙動の変更 | 既存 8 page + `/api/asset-thumb` は不変 |
| 既存 Visual Register の削除 | Phase 2C 完了まで存続、その後に判断 |

### 1.4 product 化（販売）への配慮

将来 Hitori Media OS を boss 以外にも届ける可能性を踏まえ、Phase 2 の設計は以下を満たす:

- **storage / content DB / generation provider をすべて差し替え可能** な abstract に倒す
- **brand / design / layout の選択を user 設定として保持**（boss は 1 brand profile、SaaS は N brand profile）
- **workspace / tenant 境界を schema レベルで先に意識**（Phase 2D で実装、Phase 2A-2C は単一 tenant 想定で可）
- **review decision を database 化**（filesystem manifest は boss-only ローカル運用、SaaS では監査ログが必要）

これらは Phase 2D（productization）で実装するが、**2A 段階から命名・データモデルを将来抽象化に耐える形で書く**。

---

## 2. 現状ワークフロー vs 目標ワークフロー

### 2.1 現状（Phase 1 完了時点）

```
Content Idea (Sanity)
  ↓
campaignPlan.requiredVisualAssets[] (Sanity)
  ↓
visualAssetPlan + tasks/visuals/<slug>/<asset>.md (brief)
  ↓
Codex exec --enable image_generation  ← Claude Code / 人間が prompt 投入
  ↓
~/.codex/generated_images/<session>/ig_*.png （元 PNG）
  ↓
sips でリサイズ → assets/inbox/generated/<slug>/<assetSlug>/v00N.png
  ↓
（オプション）prompt.md / review.md を inbox に追加
  ↓
人間が npm run visual:register で http://localhost:3334 を起動
  ↓
Inbox Review カードで approve & register
  ↓
patches/visual-assets/<slug>/<asset>.json （filesystem）
  ↓
assets/visuals/<slug>/<platform>/<placement>/<asset>.png （final）
  ↓
Sanity Studio 手動で localAssetPath / status / reviewNotes を入力
  ↓
（必要なら）npm run publish:package -- <slug>
  ↓
publish-packages/<platform>/<slug>/images/<asset>.png
```

**ボトルネック**: 7 階層の手動 hop、各 hop で異なる UI/CLI、Sanity 反映を忘れると stale。

### 2.2 目標（Phase 2 完了時点）

```
Content Idea
  ↓
Campaign Plan
  ↓
Required Visual Assets         ← dashboard でフィルタ・優先度・state を確認
  ↓
Design Profile / Layout Pattern を選択   ← dashboard UI
  ↓
Generate Candidates              ← dashboard が job request を local CLI bridge に投げる
  ↓
Candidate Review                 ← dashboard 内で v00N の side-by-side 比較
  ↓
Approve / Regenerate / Reject    ← dashboard 1 action（Phase 2B 以降）
  ↓
Register Final Asset             ← dashboard → patch JSON / inbox manifest（Phase 2B）
  ↓
Reflect to Sanity / Content DB   ← dashboard → confirmation gate → Sanity patch（Phase 2C）
  ↓
Publish Package / Platform Output ← dashboard → publish-package dry-run / actual（Phase 2C+）
```

**変わるもの**:

- 5 つの context が **1 つの dashboard tab** に集約
- v00N の比較は **side-by-side**（CLI / filesystem ハンドリング不要）
- review rubric が candidate と同じ画面に表示される
- Sanity 反映は dashboard → confirmation → patch path（手動コピーから消える）

**変わらないもの**:

- 公開 (publish) は **手動操作** のまま（auto-posting なし、永続 deferred）
- visual approve は **人間 review が唯一の gate**（AI auto-approve なし、永続 deferred）
- 失敗時は inbox / Visual Register / Studio で manual recover できる（fallback 経路を残す）

---

## 3. Phase Admin 2 を 2A / 2B / 2C / 2D に分割

各 sub-phase は **独立** に完了でき、後段に進まなくても前段単体で使い物になる。

### 3.1 Phase 2A — Dashboard-integrated visual review (read-only)

**目標**: dashboard を開いたまま candidate を見比べる。書き込みは依然 Visual Register / Studio に任せる。

| 機能 | 設計 |
| --- | --- |
| Inbox candidate 一覧 | `assets/inbox/generated/<slug>/<asset>/v00N.png` を dashboard で listing（既存 `tools/visual-register/server.mjs` の `/api/inbox/candidates` 相当を Next route として再実装、または同一 API を localhost で proxy） |
| v00N side-by-side 比較 | candidate grid（3 列）+ image preview + prompt.md / review.md の同フォルダ markdown を inline 表示 |
| review rubric inline | promptTemplate.reviewRubric / visualStyleProfile を candidate 横に表示 |
| 「人間がどれを推すか」 | local UI state のみ（filesystem に書かない）、ログイン session 内で保持。実 action は Phase 2B 以降 |
| Visual Register への外部リンク | 残す。Inbox approve & register は **本 sub-phase ではまだ Visual Register 側で実行** |

**制約**:

- filesystem **書き込みなし**
- Sanity **書き込みなし**
- production filesystem 読み出しなし（Phase 1 と同じく `ENABLE_LOCAL_FS_ROUTES` の dev-only flag で gate）
- Auth は Basic Auth のまま、新規 Auth scheme 未導入

**完了基準**:

- [ ] `/visual-assets` ページから candidate を辿って comparison view に到達できる
- [ ] v001/v002/v003 が **同じ画面で見比べられる**
- [ ] review rubric が candidate と同じ画面に出る
- [ ] 一週間以上使い、「読みでは足りない、approve action が欲しい」という具体的不便を 3 件以上記録できる

### 3.2 Phase 2B — Local self-host write mode

**目標**: dashboard から **filesystem への書き込み** を解禁。Sanity / 公開は依然手動。

| 機能 | 設計 |
| --- | --- |
| approve & register（dashboard） | candidate を `assets/visuals/<slug>/<platform>/<placement>/<asset>.png` にコピー（既存 Visual Register の `handleInboxApproveAndRegister` ロジックを Next API として再実装） |
| patch JSON 生成 | `patches/visual-assets/<slug>/<asset>.json` を書き出す（既存 schema 不変） |
| inbox review-manifest 更新 | `assets/inbox/generated/<slug>/review-manifest.json` を更新 |
| publish-package dry-run | dashboard ボタンから `npm run publish:package -- --dry-run <slug>` を実行、結果を dashboard に表示（実配布はしない） |
| auto-posting | **なし**（永続 deferred） |
| Sanity mutation | **なし**（Phase 2C） |

**制約**:

- **localhost only** で書き込みが可能（production には書き込み権限を持たせない、`ENABLE_LOCAL_FS_ROUTES=true` + 別の `ENABLE_WRITE_ACTIONS=true` の二重 flag で gate）
- production deploy には write API endpoint を含めない（build-time で route を除外、または runtime で 403）
- existing final asset を **silent overwrite しない**（既存 Visual Register の `overwriteConfirmed: true` パターンを継承）
- candidate history は inbox に残す（採用後も v00N PNG を削除しない、`registered` status だけ更新）

**完了基準**:

- [ ] dashboard から approve & register が成功する（localhost）
- [ ] patch JSON / review-manifest 更新が確認できる
- [ ] publish-package dry-run の結果が dashboard で読める
- [ ] **既存 Visual Register をほぼ起動しなくて済むようになった**（dashboard で済むようになったかを 1 週間以上で実感）

### 3.3 Phase 2C — Sanity write mode

**目標**: dashboard が **明示的な confirmation 付き** で Sanity を mutate できる。

| 機能 | 設計 |
| --- | --- |
| visualAssetPlan の `localAssetPath` / `status: saved` / `reviewNotes` を update | patch JSON ベースで dashboard が Sanity mutation を発火（既存 patch 形式と互換） |
| 確認 gate | mutation 直前に diff preview + "confirm with type-to-confirm" UI |
| write token 運用 | production env に `SANITY_WRITE_TOKEN` を入れる場合、production 側 dashboard でも mutation が可能になる選択肢が生まれる。**ただし Phase 2C ではまず localhost のみ許可、production の write token 投入は別判断** |
| audit log | mutation 履歴を database / filesystem に残す（仕様は `assetRegistrationLog` で後述） |
| rollback / undo | 直近 N 件の mutation を inverse-patch として保存、dashboard から再適用可能 |
| Sanity Studio | 引き続き稼働（fallback / emergency edit） |

**Auth 要件**:

- 本 sub-phase で **Auth を Basic Auth から差し替える**判断が必要（誰が approve / mutate したかを log に書くため）
- 候補: Sanity session（`useCurrentUser`）/ GitHub OAuth / magic link
- **Auth は別 design doc**（docs/63 候補）で取り扱い、本 doc では「2C 着手前に Auth design batch を挟む」とだけ宣言

**完了基準**:

- [ ] dashboard 1 action で visualAssetPlan が saved 状態に遷移する（localhost）
- [ ] audit log に who / when / what / before / after が残る
- [ ] mutation 履歴の undo が動く
- [ ] write token を repo / dashboard build に含めていない（env 経由のみ）

### 3.4 Phase 2D — Product / SaaS-ready mode

**目標**: 個人 local tool を **複数 user / 複数 brand / 複数 workspace に拡張可能** にする。

| 抽象化対象 | 現状 | SaaS 化後 |
| --- | --- | --- |
| storage | local filesystem（`assets/`、`patches/`、`publish-packages/`） | cloud object storage（S3 / R2 / GCS）+ signed URL |
| content DB | Sanity dataset（boss 個人 project） | Sanity multi-tenant or 自前 DB（tenant-scoped） |
| generation provider | Codex exec + image_gen（ChatGPT OAuth） | abstract provider interface（Codex / OpenAI image / Replicate / 等を plug-in） |
| publish package | local filesystem ディレクトリ | cloud storage + download endpoint |
| design profile | seed JSON（個人 brand 1 件） | user-scoped record（複数 brand / 複数 style profile） |
| user permissions | Basic Auth password 1 つ | 個別 user account + role |
| billing | なし | 別 doc（Stripe / paid tier） |

**Phase 2D は本 doc では設計の方向性のみ** 示す。実装着手 trigger は別途。

**完了基準（将来）**:

- [ ] boss 以外の 1 user が同じ dashboard で 1 campaign を完走できる
- [ ] tenant 間の data 分離が schema レベルで担保されている
- [ ] storage / content DB / generation provider が plug-in 化されている
- [ ] 個人 filesystem 前提のロジックが残っていない（grep で 0 hits）

---

## 4. Write operation boundary

dashboard が触る可能性のある書き込み操作と、各 phase での解禁状態:

| Operation | Phase 1 | Phase 2A | Phase 2B | Phase 2C | SaaS future (2D) |
| --- | --- | --- | --- | --- | --- |
| read visualAssetPlan from Sanity | ✓ | ✓ | ✓ | ✓ | ✓ |
| read inbox candidates (filesystem) | dev only | ✓ (dev) | ✓ (dev) | ✓ (dev) | ✓ (cloud storage) |
| read review-manifest.json | dev only | ✓ (dev) | ✓ (dev) | ✓ (dev) | ✓ (database) |
| read campaignPlan / promptTemplate / brandProfile | ✓ | ✓ | ✓ | ✓ | ✓ |
| trigger candidate generation | ✗ | ✗ | ✓ via local CLI bridge | ✓ via local CLI bridge | ✓ via queue worker |
| save candidate to inbox (filesystem) | ✗ | ✗ | ✓ (dev) | ✓ (dev) | ✓ (cloud storage) |
| mark candidate review status (review-manifest update) | ✗ | ✗ | ✓ (dev) | ✓ (dev) | ✓ (database) |
| copy candidate → final asset path | ✗ | ✗ | ✓ (dev) | ✓ (dev) | ✓ (cloud storage, no overwrite) |
| create patch JSON | ✗ | ✗ | ✓ (dev) | ✓ (dev) | ✓ (database row) |
| update Sanity visualAssetPlan (localAssetPath / status / reviewNotes) | ✗ | ✗ | ✗ | ✓ + confirmation | ✓ + audit log |
| update Sanity campaignPlan (requiredVisualAssets[i].state) | ✗ | ✗ | ✗ | ✓ + confirmation | ✓ + audit log |
| run publish-package dry-run | ✗ | ✗ | ✓ (dev) | ✓ (dev) | ✓ (cloud worker) |
| run publish-package actual | ✗ | ✗ | ✗（手動 CLI 継続） | ✓ + confirmation | ✓ + audit log |
| auto-post to X / Substack / note / Threads | ✗ **deferred 永続** | ✗ deferred | ✗ deferred | ✗ deferred | ✗ deferred |

**規範（全 phase 共通）**:

1. **auto-posting は永続 deferred**。dashboard に post button を実装しない。
2. **書き込みを段階的に解禁**。1 phase で 1 種類だけ unlock。
3. **すべての mutation に明示的 confirmation**（idempotent な action でも diff preview を出す）。
4. **既存 final asset を silent overwrite しない**（既存 Visual Register の `overwriteConfirmed: true` を維持）。
5. **candidate history を残す**（採用後も v00N PNG を削除しない、`registered` status だけ追加）。
6. **production には write endpoint を含めない**まで Phase 2C の Auth design が終わるまで。

---

## 5. Dashboard route design

新規 route の提案。Phase introduction を併記。

| Route | Purpose | Data source | Read/Write | Phase | Prod / Local |
| --- | --- | --- | --- | --- | --- |
| `/visual-assets` (existing) | list of visualAssetPlan | Sanity GROQ | read | 1 | both |
| `/visual-assets/[assetId]` | 1 asset の detail（brief / metadata / 採用 final / history） | Sanity + filesystem (dev) | read | 2A | both |
| `/visual-assets/[assetId]/candidates` | candidate grid (v00N) + side-by-side compare | filesystem inbox + review-manifest | read (2A) / write (2B) | 2A | dev only |
| `/visual-assets/[assetId]/generate` | trigger candidate generation（job request UI） | local CLI bridge | write | 2B | dev only |
| `/visual-review` | cross-asset の inbox 横断 view | inbox + review-manifest | read (2A) / write (2B) | 2A | dev only |
| `/visual-review/inbox` | 全 candidate を flat に列挙 | inbox + review-manifest | read (2A) / write (2B) | 2A | dev only |
| `/visual-review/inbox/[candidateId]` | 1 candidate の zoom + review rubric + action | inbox + review-manifest | read (2A) / write (2B) | 2A | dev only |
| `/visual-review/queue` | 採用候補 queue / "next action" | inbox + visualAssetPlan | read | 2A | both（meta だけ） |
| `/settings/brand-profiles` | brandProfile listing / detail | Sanity GROQ | read (2A) / write (2C) | 2A | both |
| `/settings/visual-style-profiles` | visualStyleProfile listing / detail | Sanity GROQ | read (2A) / write (2C) | 2A | both |
| `/settings/prompt-templates` | promptTemplate listing / detail / reviewRubric | Sanity GROQ | read (2A) / write (2C) | 2A | both |
| `/settings/design-profiles` (proposed) | Design Profile（layoutPattern + module 構成） | Sanity GROQ (after schema activation) | read | 2A (after activation) | both |

**route 設計原則**:

- `/visual-assets/*` は **Sanity データの読み**（campaign / asset の文脈、boss が main で使う）
- `/visual-review/*` は **inbox candidate の review**（実際の picking / approve action）
- `/settings/*` は **brand / style / prompt / design の設定**（Sanity Studio 代替の view、書きは 2C+）
- すべての write route は dev-only（feature flag で production 404）

### 5.1 route 別 read/write の解禁順

```
Phase 2A:
  read:  /visual-assets/[id], /visual-assets/[id]/candidates,
         /visual-review, /visual-review/inbox, /visual-review/inbox/[cid],
         /settings/brand-profiles, /settings/visual-style-profiles,
         /settings/prompt-templates
  write: なし

Phase 2B:
  write: /visual-review/inbox/[cid] (review status update),
         /visual-assets/[id]/candidates (approve & register, patch JSON 生成),
         /visual-assets/[id]/generate (candidate 生成 job request)

Phase 2C:
  write: Sanity mutation を伴う action（patch JSON → confirmation → Sanity patch）
         /settings/* で profile を update（Sanity Studio fallback は維持）
```

---

## 6. Candidate review UI 仕様

1 visual asset の review UI 1 画面の構成。各要素は **設計のみ**、Phase 2A で実装。

### 6.1 Header（asset metadata）

```
┌──────────────────────────────────────────────────────────────┐
│  threads-support-diagram-v1                                  │
│  campaign: building-hitori-media-os                          │
│  platform: threads        asset type: paired-post-visual     │
│  aspect ratio: 4:5        pixel size: 1080 x 1350            │
│  current status: brief-ready (no final asset saved)          │
│  expected final path: assets/visuals/.../threads-support-... │
│  reuse policy: variant-required                              │
└──────────────────────────────────────────────────────────────┘
```

Read from: `visualAssetPlan` + `campaignPlan.requiredVisualAssets`.

### 6.2 Candidate grid

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│  v001    │  │  v002    │  │  v003    │
│ diagram- │  │ typogr-  │  │ metaphor-│
│ first    │  │ hybrid   │  │ mix      │
│          │  │          │  │          │
│ [image]  │  │ [image]  │  │ [image]  │
│          │  │          │  │          │
│ 1080x1350│  │ 1080x1350│  │ 1080x1350│
│ 1.07 MB  │  │ 1.12 MB  │  │ 1.10 MB  │
│ 22:31 JST│  │ 08:38 JST│  │ 08:54 JST│
│ promptv2 │  │ promptv2 │  │ promptv2 │
│ self: 24 │  │ self: 22 │  │ self: 25 │
└──────────┘  └──────────┘  └──────────┘
```

Read from: `assets/inbox/generated/<slug>/<asset>/v00N.png` + 同 folder の `prompt.md` / `review.md`.

Variant label は prompt.md frontmatter で記録（`variant: diagram-first | typography-hybrid | metaphor-mix | custom`）。
self-review score は review.md の集計（人間が記入する rubric の合計）または future の auto-rubric。

### 6.3 Review panel（candidate ごと）

| 評価軸 | スコア (1-5) | コメント |
| --- | --- | --- |
| diagram richness | _ | _ |
| Japanese readability | _ | _ |
| platform fit (Threads / note / X / Substack) | _ | _ |
| brand consistency (vs style anchors) | _ | _ |
| not text-only (構造が立っているか) | _ | _ |
| information hierarchy | _ | _ |
| publish usability (preview crop 耐性) | _ | _ |

→ 7 axes、合計 35 点満点。

Read from: `promptTemplate.reviewRubric` を default rubric として inline、candidate ごとの個別記入は `review.md` に保存。

### 6.4 Actions（candidate ごと）

| Action | Phase | 挙動 |
| --- | --- | --- |
| **Approve** | 2B+ | inbox → final asset コピー、patch JSON 生成、review-manifest 更新 |
| **Needs regeneration** | 2A (local state) / 2B (manifest update) | review-manifest に `reviewStatus: needs-regeneration` を書く |
| **Reject** | 2A (local state) / 2B (manifest update) | `reviewStatus: rejected` |
| **Compare full screen** | 2A | 2-pane / 3-pane で zoom |
| **Copy prompt** | 2A | prompt.md の該当 variant 節を clipboard へ |
| **Open final path** | 2A | local file path を表示（`open` cmd で OS finder） |
| **Open in Sanity** | 2A | Sanity Studio の deep link（`https://<project>.sanity.studio/desk/...`） |

**重要**:

- Action 設計のみで本 batch では実装しない
- Approve は **Phase 2B でようやく動く**（filesystem write 解禁後）
- Sanity mutation は **Phase 2C**

---

## 7. High-quality visual generation system

[docs/50](50-visual-prompt-quality-system.md) で定義した quality system を、dashboard UI と組み合わせて使える形に整理。

### 7.1 Design Profile（提案、新規概念）

「**brand × style × layout の組み合わせを user が選びやすい preset**」。複数の visualStyleProfile / brandProfile を束ねたもの。

例（boss-only 段階）:

| Design Profile | 構成 |
| --- | --- |
| **Hitori Media OS Default** | brandProfile = hitori-media-os, visualStyleProfile = inline-diagram-v1, layoutPattern = top-headline-bottom-flow |
| **Hitori Media OS Hero** | brandProfile = hitori-media-os, visualStyleProfile = hero-v1, layoutPattern = title-with-single-diagram |
| **Hitori Media OS Hub-and-Spoke** | brandProfile = hitori-media-os, visualStyleProfile = inline-diagram-v1, layoutPattern = grid-of-modules |

例（SaaS 段階の想定）:

| Design Profile | 想定ユーザー |
| --- | --- |
| Minimal SaaS Diagram | エンジニア発信者 / 技術 SaaS 系 |
| Japanese Infographic | 日本語 long-form 記事 / 教育系 |
| Bold Creator Style | クリエイター / カラフル / 大文字タイポ |
| Magazine Editorial | カルチャー雑誌風 / 写真主体 |
| Business Slide | 経営コンサル / プレゼン素材 |
| Startup Product UI | プロダクト紹介 mockup |
| Educational Explainer | 教材 / ステップ図 |
| Developer Architecture | コードレベル architecture diagram |

→ Phase 2A では **boss-only の 1 brandProfile + 既存 visualStyleProfile** を使う。Design Profile という抽象を **dashboard UI の selector として導入する設計**は 2A で済ませ、複数 profile への拡張は 2D で。

### 7.2 Layout Pattern（既存 + 拡張）

docs/50 § 3 の 7 種に加えて、product 化に向けて広げる候補:

| Pattern | 既存 (docs/50) | 提案追加 |
| --- | --- | --- |
| centered-title-only | ✓ | （最終手段、既存） |
| title-with-single-diagram | ✓ | |
| split-left-text-right-diagram | ✓ | |
| top-headline-bottom-flow | ✓ | |
| grid-of-modules | ✓ | |
| before-after-comparison | ✓ | |
| architecture-stack | ✓ | |
| **3-step-flow** | — | 新規（左→中→右の3段プロセス） |
| **hub-and-spoke** | — | 新規（中央 1 + 周辺 N） |
| **central-node-map** | — | 新規（中央ノード + 内部項目 + 外接ノード） |
| **layered-system** | — | 新規（縦に重なる layer、architecture-stack のサブ） |
| **checklist-infographic** | — | 新規（チェックリスト風） |
| **comparison-matrix** | — | 新規（n×m grid） |
| **timeline** | — | 新規（横軸 / 縦軸時系列） |
| **dashboard-mockup** | — | 新規（product UI 模擬） |
| **stacked-cards** | — | 新規（カード重ね） |
| **process-pipeline** | — | 新規（パイプライン状） |

→ visualStyleProfile.layoutPatterns の enum 拡張は **Phase 2D**（または schema 改訂が必要になった任意の時点）。本 doc では候補として記録。

### 7.3 Required Visual Modules（既存 + 拡張）

docs/50 § 4 の `visualModuleSet` を **dashboard で require / forbid を選べる UI** にする想定:

| Module | 既存 (docs/50) | 提案追加 |
| --- | --- | --- |
| headline | ✓ | |
| subtitle | ✓ | |
| diagramNodes | ✓ | "central node" / "support nodes" に細分化 |
| diagramEdges | ✓ | "connectors" に統一表記 |
| iconHints | ✓ | "mini icons" に統一表記 |
| bracketingLine | ✓ | |
| watermarkOrTag | ✓ | |
| **section cards** | — | 新規（複数情報を区画分割） |
| **principle badge** | — | 新規（"独自原則" を強調するバッジ） |
| **human review checkpoint** | — | 新規（"人間レビュー必須" を視覚化） |
| **explanatory caption** | — | 新規（subtitle 以外の補足説明枠） |
| **platform cards** | — | 新規（各 platform のロゴ抜き表現、本 design では note/X/Substack/Threads のテキストラベルで代用） |

### 7.4 Failure Detection

「title card 化」を防ぐ自動 rubric。Phase 2A では human が rubric を当てる、Phase 2B+ で auto-check 候補:

| Failure | 検出方法 |
| --- | --- |
| text-only title card | OCR 後の文字面積が画像面積の > 40% で flag（heuristic） |
| fewer than 2 diagram nodes | 視覚モジュール手動 tag（dashboard で human input） |
| no connectors | 同上 |
| unreadable Japanese | 解像度 + フォント size から visual inspection、human が tag |
| overdecorated AI/neon style | promptTemplate.negativeInstructions に違反していないか human check |
| missing platform fit | aspect ratio / pixel size が visualAssetPlan の spec に合っているかは自動可 |
| no visual hierarchy | human inspection |
| no relation to Content Idea | human inspection |

**Phase 2A 段階の運用**: human が candidate ごとに上記を tag、`review.md` に記録。auto-check の実装は 2B+ で評価。

### 7.5 Variation Strategy

[docs/50](50-visual-prompt-quality-system.md) § 8 の `3-pattern-default` を踏襲:

| Variant | Layout Pattern 候補 | Required modules |
| --- | --- | --- |
| **v001 diagram-first** | top-headline-bottom-flow / grid-of-modules / hub-and-spoke | nodes ≥ 3, connectors ≥ 2 |
| **v002 typography-hybrid** | title-with-single-diagram / split-left-text-right-diagram | nodes 2-3, headline large |
| **v003 metaphor-mix** | grid-of-modules / before-after-comparison | nodes ≥ 2, iconHints 1-2, metaphor controlled |

→ dashboard の "Generate" UI（Phase 2B）で 3 variant チェックボックスをデフォルト ON、人間が個別 toggle 可能。

### 7.6 Self Review Rubric

candidate ごとに `review.md` で記録、または Phase 2C+ で `visualReviewDecision` 候補 schema に永続化:

7 axes × 1-5 score = 35 点満点。閾値: ≥ 24 / 35 で approve 候補、< 18 で reject 推奨。

(後述の § 8.3 で schema 化を提案)

### 7.7 Reference Style Anchors

採用済み visual を **style anchor として参照** する loop:

```
v001/v002/v003 生成
  ↓
人間が approve
  ↓
final asset path に copy
  ↓
visualStyleProfile.referenceImagePaths に append (Phase 2C 自動化)
  ↓
次回同 assetType 生成時に prompt へ inline
```

Phase 2A では `referenceImagePaths` を手動更新（Sanity Studio）。Phase 2C で auto append。

---

## 8. Schema 拡張提案

**本 batch では schema を変更しない**。提案のみ。各提案 schema は将来 batch で `schemas/proposed/<name>.ts` を sketch 段階に置く想定。

### 8.1 既存 schema で足りるもの

| 既存 schema | 拡張不要な範囲 | 拡張余地 |
| --- | --- | --- |
| `brandProfile` | brand voice / visual defaults / negativeStyleList | tenant / user 紐付け（Phase 2D） |
| `visualStyleProfile` | layoutPattern / visualModuleSet / typography / color / density | layoutPattern enum 拡張、referenceImagePaths の auto-append |
| `promptTemplate` | systemInstruction / userPromptTemplate / reviewRubric / negativeInstructions | "selection key" を Phase 2D で tenant-scoped に拡張 |
| `campaignPlan` | requiredVisualAssets / promptTemplateSelections / humanReviewGates | requiredVisualAssets[i].state の reconcile（NextActionSummary stale 問題） |
| `visualAssetPlan` | title / platform / placement / status / localAssetPath | candidate history への参照、generationProvider の plug-in 化 |

### 8.2 提案 schema（新規、active 化なし）

| 提案 schema | 目的 | キーフィールド | 既存で足りない理由 | 着手 phase |
| --- | --- | --- | --- | --- |
| **`designProfile`** | brand × style × layout の preset を user が選ぶ | `title`, `slug`, `brandProfile (ref)`, `visualStyleProfile (ref)`, `defaultLayoutPattern`, `defaultVariationStrategy`, `tenantId (将来)` | brandProfile / visualStyleProfile を組合せた "pickable preset" は現状なく、dashboard UI で選択肢に出せない | 2A (sketch) / 2D (activate) |
| **`layoutPatternPreset`** | layoutPattern の詳細（モジュール構成 / spacing / density） | `slug`, `patternId (centered-title-only \| top-headline-bottom-flow \| ...)`, `requiredModules`, `forbiddenModules`, `aspectRatio` | visualStyleProfile に enum しかなく、preset 単位で require/forbid を細かく扱えない | 2D |
| **`visualGenerationRun`** | "1 回の生成 job" の記録 | `slug`, `visualAssetPlan (ref)`, `designProfile (ref)`, `variant`, `prompt`, `model`, `generationProvider`, `requestedAt`, `completedAt`, `inboxRelativePath`, `pixelSize`, `fileSize`, `accentColor`, `status (requested\|generated\|failed\|retried)`, `error` | 現状 prompt.md / 元 PNG / inbox は filesystem に分散、generation history が record として残らない | 2B+ |
| **`visualCandidate`** | "1 candidate" を database 化 | `slug`, `visualGenerationRun (ref)`, `variant`, `inboxRelativePath`, `pixelSize`, `fileSize`, `reviewStatus (candidate\|approved\|rejected\|needs-regeneration\|registered)`, `reviewNotes`, `selfReviewScore`, `selfReviewRubric (object)`, `createdAt` | 現状 review-manifest.json で filesystem に書いているが、database で扱うと cross-asset の集計や product 化に耐える | 2B (read view) / 2C (write) |
| **`visualReviewDecision`** | "approve / reject の人間判断" を log | `slug`, `visualCandidate (ref)`, `decidedBy (user)`, `decidedAt`, `decision (approve\|reject\|needs-regeneration)`, `rubricScores (7 axes)`, `comment` | review-manifest にも reviewStatus は書くが、"誰が・いつ・なぜ" の audit に弱い | 2C |
| **`generationJob`** | "生成依頼の queue 項目"（SaaS の generation worker 用） | `slug`, `requestedBy`, `requestedAt`, `visualAssetPlan (ref)`, `designProfile (ref)`, `variant`, `priority`, `status (queued\|in-progress\|done\|failed)`, `workerId`, `result (ref to visualCandidate)` | local CLI bridge では filesystem trigger で十分だが、SaaS では queue 抽象が必須 | 2D |
| **`assetRegistrationLog`** | "final asset への登録" の audit log | `slug`, `visualCandidate (ref)`, `visualAssetPlan (ref)`, `registeredBy`, `registeredAt`, `finalAssetPath`, `patchPath`, `sanityMutationPatchId`, `overwriteOf (任意)` | 現状 patches JSON しか残らず、誰が registered したかが不明 | 2C |

### 8.3 selfReviewRubric の永続化形

7 axes × 1-5 score を以下の object として扱う:

```json
{
  "diagramRichness": 4,
  "japaneseReadability": 5,
  "platformFit": 4,
  "brandConsistency": 4,
  "notTextOnly": 5,
  "informationHierarchy": 4,
  "publishUsability": 4,
  "comment": "v003 metaphor-mix; central node accent #E5B486 が hero と整合"
}
```

- Phase 2A は `review.md`（filesystem markdown）に記録
- Phase 2B は review-manifest.json に rubric field 追加
- Phase 2C は `visualReviewDecision` を Sanity に作成

### 8.4 既存 schema の **破壊的変更は行わない**

- `visualAssetPlan` の field 名は据え置き、`generationProvider` / `generationJobId` などの既存 field を **拡張ポイント** として利用
- `campaignPlan.requiredVisualAssets[i].state` も据え置き、reconcile ロジックを別 tool で書く
- `promptTemplate` / `brandProfile` / `visualStyleProfile` の active 構造を変更しない

---

## 9. Codex / image_gen integration inside admin

Dashboard から visual 生成を起動する方法。**security / 複雑性 / SaaS 拡張性** のトレードオフで選ぶ。

### 9.1 Option A — Local CLI bridge（**推奨、Phase 2B**）

```
[Dashboard UI]                      [Local CLI bridge process]
   |                                    |
   | POST /api/generation-job           |
   |  { assetId, variant, prompt }      |
   |                                    |
   |---------+              filesystem  |
             |              (job queue) |
             v                          |
   <repo>/generation-queue/             |
     pending/<jobId>.json               |
                                        |
                                        | polls pending/
                                        |
                                        | runs: codex exec -m gpt-5.4 \
                                        |   --enable image_generation \
                                        |   --dangerously-bypass-... \
                                        |   "<prompt>"
                                        |
                                        | writes:
                                        |   inbox/<slug>/<asset>/v00N.png
                                        |   generation-queue/done/<jobId>.json
                                        |
                                        v
   | <- GET /api/generation-job/<id>    |
```

**長所**:

- production dashboard に Codex 認証情報を入れる必要がない
- 既存 Codex CLI / ChatGPT OAuth 認証をそのまま使える
- local CLI bridge は **boss の machine 上のみで動く**（productionではこの endpoint を 404）
- 失敗時は filesystem queue を覗いて手動 recover 可能

**短所**:

- localhost only（production dashboard では generation 不可）
- bridge process を常駐させる必要がある（`npm run generation:bridge` のような script）

**Phase 2B 実装メモ**:

- bridge process は `tools/generation-bridge/` 配下に新規（**本 batch では作らない**）
- queue は filesystem ベース（json 投入 → 完了 json 戻し）
- security: `codex exec` の prompt に hard rules を inline（output path 制限 / `git diff --stat` 自己確認）
- timeout: 5 分（前回 batch で 60 分張り付きを経験、ハード上限必須）

### 9.2 Option B — Server action directly invokes generation

dashboard server から直接 `codex exec` を spawn する。

**問題**:

- production dashboard で生成する場合、Codex 認証情報を server に入れる必要 → secret 管理リスク
- Codex CLI が production runtime に常駐する設計は Vercel と相性が悪い
- 失敗時の rollback / retry が server action 内で完結しない

→ **本 phase では採用しない**。

### 9.3 Option C — Queue-based worker（**SaaS future, Phase 2D**）

```
[Dashboard]
   |
   | POST /api/generation-job
   v
[Job queue (Redis / SQS / pg)]
   |
   v
[Worker fleet]
   - generation provider plug-in (Codex / OpenAI / Replicate / ...)
   - uploads result to cloud storage
   - writes back to database (visualCandidate)
   v
[Dashboard polls / SSE]
```

**長所**: tenant 分離 / 並列実行 / provider plug-in / audit。
**短所**: infra が増える、SaaS 化前に作る価値が低い。

→ Phase 2D 着手 trigger を満たすまで pending。

### 9.4 Phase 別の採用案

| Phase | Option |
| --- | --- |
| 2A | (なし、generation は手動で Codex 起動を継続) |
| 2B | **Option A**（local CLI bridge） |
| 2C | Option A 維持 + 部分的に Sanity write を絡める |
| 2D | **Option C**（queue worker） |

**Phase 2A はあえて Option A を入れない**: dashboard 内で読みだけ、generation は boss が手動で Codex を叩く既存運用を保つ。bridge の複雑さを back-load する。

---

## 10. Productization path（boss-only → SaaS）

「自分用 local tool」から「他人が買って使えるツール」への抽象化。Phase 2D の実装着手前に **設計の骨格** をここで定義しておく。

### 10.1 比較

| 観点 | boss-only (現状 + Phase 2A-2C) | sellable product (Phase 2D) |
| --- | --- | --- |
| storage | local filesystem (`assets/`, `patches/`, `publish-packages/`) | cloud object storage (S3 / R2 / GCS) + signed URL |
| content DB | Sanity dataset (boss 個人 project) | Sanity multi-tenant / 自前 DB（tenant-scoped） |
| Auth | Basic Auth | per-user account（OAuth / magic link / SSO） |
| Generation provider | Codex exec + image_gen (ChatGPT OAuth) | plug-in interface（Codex / OpenAI Images / Replicate / Anthropic 等を tenant 設定で選ぶ） |
| brand profile | seed JSON 1 件（boss） | user-scoped record（複数 brand） |
| design profile | seed JSON / Sanity 1 件 | user-scoped record（複数 design） |
| review records | review-manifest.json + review.md (filesystem) | database row（visualReviewDecision / assetRegistrationLog） |
| publish package | local filesystem ディレクトリ | cloud storage + download / direct export |
| optional CMS connection | Sanity 固定 | Sanity / Contentful / Notion / Strapi 等を plug-in |
| billing | なし | 別 doc（Stripe / paid tier） |

### 10.2 抽象化必須項目

```
[Storage abstraction]
  read/write/list/delete を interface 化、実装を local-fs / s3 / r2 で差し替え

[Content DB abstraction]
  read/write/mutate を interface 化、実装を sanity / sanity-multi-tenant / postgres で差し替え

[Generation provider abstraction]
  generateImage(prompt, options) → { storagePath, pixelSize, fileSize }
  実装: codex-exec / openai-images / replicate / dummy

[Publish package abstraction]
  build(packageInput) → packageOutput
  output: local-dir / cloud-zip / direct-upload-to-platform

[Design profile abstraction]
  user 単位で複数 design profile を持つ、selector は dashboard UI

[User permissions]
  role: viewer / reviewer / admin / owner
  tenant 境界を schema 全 record に
```

### 10.3 product 化を**しない**判断ポイント

- billing / payments を扱う気がない場合は Phase 2D 着手しない
- Hitori Media OS の哲学（"自分の判断を保留しない、AI に任せない"）を守れる範囲でのみ展開する
- boss が build-in-public で売る case studyとして公開する場合は、その時点で初めて 2D 設計を実装に倒す

→ 本 doc は **「いつでも 2D に行ける備え」** であって、急がない。Phase 2A → 2B → 2C を 1 年単位で運用し、不便を蓄積してから 2D 判断。

---

## 11. Risks / Open questions

| Risk | 影響 | 対策 |
| --- | --- | --- |
| local CLI bridge の常駐忘れ | 生成が走らない | dashboard 起動時に bridge alive check を `/api/health` で確認 |
| candidate history が膨張 | 数百 MB の inbox | retention policy（90 日経過した rejected を archive） |
| Sanity mutation の誤反映 | 既存 record を壊す | Phase 2C で diff preview + type-to-confirm 必須 |
| Codex CLI が再度 hang | 5 分以上張り付く | bridge 側で 5 分 hard timeout、kill + status=failed |
| production への write endpoint 漏れ | filesystem に書ける状態で deploy される | `ENABLE_WRITE_ACTIONS` flag + production で route 404 + integration test |
| Auth 移行のタイミング | Phase 2C 着手前に必須、preview branch / staging で先に試す | 別 design batch（docs/63 候補）を Phase 2C 着手前に挟む |
| SaaS 化判断の混乱 | Phase 2D を急に始めると重い | Phase 2C 完了 + 6 ヶ月運用後に再評価 |

---

## 12. Out of scope（本 doc）

- Auth scheme の確定（別 design batch）
- 個別画面の wireframe / mockup（Phase 2A 着手時に component level の design）
- Sanity multi-tenant 検討の深掘り（Phase 2D 着手時）
- billing / Stripe（永続 deferred）
- analytics / engagement fetch（永続 deferred）
- public site `hitorimedia.com` 設計（別 doc / docs/57 拡張）

---

## 13. Recommended next implementation batch

### 13.1 Phase Admin 2A 実装着手 trigger

- [x] Phase Admin 1 完全完了（[docs/handoff/0119](handoff/0119-admin-phase-1-batch-d3-post-deploy-verification.md)）
- [x] 本 design doc（docs/62）が boss に approve されている
- [ ] 既存 production dashboard の挙動を変えない integration plan が固まっている（本 doc § 5）
- [ ] candidate review UI の component-level wireframe が次バッチで設計できる

### 13.2 推奨 Phase 2A 実装バッチ（Phase Admin 2 Batch A）

**スコープ** (read-only integration, dev-only routes):

1. `dashboard/src/app/visual-assets/[assetId]/page.tsx` 新規（asset detail）
2. `dashboard/src/app/visual-assets/[assetId]/candidates/page.tsx` 新規（candidate grid + side-by-side）
3. `dashboard/src/app/visual-review/page.tsx` 新規（cross-asset inbox overview）
4. `dashboard/src/app/visual-review/inbox/page.tsx` 新規（flat candidate list）
5. `dashboard/src/lib/groq/visualAsset.ts` 新規（asset detail + candidate metadata GROQ）
6. `dashboard/src/lib/inbox.ts` 新規（dev-only filesystem reader、`ENABLE_LOCAL_FS_ROUTES` gate）
7. `/api/inbox-candidates` route 新規（dev-only、Visual Register の `/api/inbox/candidates` 移植）
8. `/api/inbox-image` route 新規（dev-only、Visual Register の `/inbox-image` 移植）
9. `/api/prompt-md` / `/api/review-md` route 新規（dev-only、inbox の markdown を読む）
10. UI components: `CandidateGrid` / `CandidateCard` / `ReviewRubricInline` / `SideBySideCompare`
11. Visual Register への外部リンクは **残す**（fallback）

**Out**:

- すべての write action（approve & register, patch JSON 生成 etc.）
- Sanity mutation
- Auth 切り替え

**完了基準**:

- localhost で `npm run dev` 後、`/visual-assets/threads-support-diagram-v1/candidates` で v001/v002/v003 を side-by-side で見比べられる
- review rubric が candidate と同じ画面に出る
- production build (`cd dashboard && npm run build`) で write route が含まれない（grep）

### 13.3 Phase 2A の次に来る design batch

- **docs/63** — Auth migration design（Basic Auth → real Auth、Phase 2C 着手前）
- **docs/64** — Phase Admin 2B implementation plan（local CLI bridge + write endpoints）
- **docs/65** — generation-bridge tool design（`tools/generation-bridge/` 新規）

### 13.4 Phase Admin 2 の Done definition（全 sub-phase 後）

- [ ] boss が dashboard を開いたまま 1 visual を **inbox 確認 → approve → final 反映 → Sanity 更新** まで完走できる
- [ ] Visual Register（localhost:3334）を 1 ヶ月以上起動していない
- [ ] candidate history / review decision が database に残っている
- [ ] design profile が 1 件以上動いている（boss 用 default）
- [ ] product 化のための抽象化が schema / interface レベルで 50% 以上の準備済み

---

## 14. 連番について

- docs: 60 → 61 → **62**
- devlog: 0108 → **0109**
- handoff: 0119 → **0120**
- docs/58 を Phase 2A-2D に細分化するため update（本 doc が canonical 詳細）

---

## 15. 安全性（本 batch、design-only）

- schema 変更: **0**
- code 変更: **0**（dashboard / tools / schemas 全て不変）
- assets 変更: **0**
- patches 変更: **0**
- Sanity mutation: **0**
- 画像生成: **0**
- 新規パッケージ: **0**
- Auth 実装: **0**
- 環境変数変更: **0**
- Vercel UI 操作: **0**
- deployment: **0**
- 既存 Visual Register / dashboard の挙動: **不変**
