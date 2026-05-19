# 58 — Admin Dashboard Phase Plan (design)

Date: 2026-05-14
Last updated: 2026-05-18 (Phase Admin 1 complete / Phase Admin 2 subphases 2A-2D 追加)
Status: **design-only**, no implementation

Phase Admin 1〜4 の段階的ロードマップと、各 Phase の着手 trigger / 完了基準 / 永続 deferred を明示する。

Phase Admin 2 の詳細（2A / 2B / 2C / 2D）は [docs/62](62-admin-phase-2-visual-generation-admin-design.md) が canonical。本 doc は roadmap 全体俯瞰、docs/62 は Phase Admin 2 の design 本体。

## 0. 全体俯瞰

```
Phase Admin 0:  design only            ← 完了（docs/47〜61）
Phase Admin 1:  read-only dashboard    ← 完了（2026-05-16、app.hitorimedia.com production）
Phase Admin 2:  Visual Register 統合 + Visual Generation Quality
  Phase 2A:  dashboard-integrated review (read-only)
  Phase 2B:  local self-host write mode (filesystem)
  Phase 2C:  Sanity write mode (mutation + audit log + Auth 切替)
  Phase 2D:  product / SaaS-ready mode (storage / DB / provider 抽象化)
Phase Admin 3:  generation 統合         ← campaign 生成 + promptTemplate runner
Phase Admin 4:  publish 統合            ← 公開URL記録 + reactionNotes（auto-posting は依然 deferred）
```

各 Phase は **完全に独立**: 後の Phase に行かなくても前 Phase は単独で使い物になる。Phase 2 の 4 sub-phase も同様に独立に完了できる。

## 1. Phase Admin 0 — Design Only（現在地）

| 項目 | 状態 |
| --- | --- |
| Next.js | **未導入** |
| Auth | **未導入** |
| 4 proposed schemas | 提案のみ（schemas/proposed/ にある、index.ts 未登録） |
| 4 design docs | docs/47, 48, 49, 50 完成 |
| 4 schema followup docs | docs/54, 55 完成、56-58 が本バッチ |
| seed files | brandProfile / visualStyleProfile / promptTemplate / campaignPlan の 4 件 local-only |
| 既存 local tools | Sanity Studio / Visual Register / Patch Review / Publish Package Builder / local-check 稼働中 |

**完了基準（Phase Admin 0 → 1 の trigger）**:

- [x] **4 proposed schema が Studio に activate されている**（schemas/index.ts に 4 件登録 + structure/index.ts に追加 + build green、batch 0096）
- [x] **少なくとも 1 件の campaignPlan が Sanity に投入されている**（`campaignPlan.building-hitori-media-os`、batch 0097/0108 で `npx sanity documents create` 実行、ref 解決確認済）
- [x] building-hitori-media-os に以下が揃っている:
  - [x] selectedPlatforms（4 platforms: x P1 / threads P2 / note P1 / substack P1）
  - [x] requiredVisualAssets（7 件、ID + assetSlug + platform + state）
  - [x] promptTemplateSelections（`promptTemplate.x-hook-image-diagram-rich-v1` を x-hook-main-v1 用に登録）
  - [x] humanReviewGates（9 段、現状: done 4 / pending-review 1 / in-progress 1 / not-started 3）
  - [x] manualPublishingStatus（4 platforms 分の枠、すべて not-started）
- [x] **Visual Register で少なくとも 2 件の production asset が approve 済み**（note-hero-v1 / x-hook-main-v1、両方 2026-05-14 承認完了）
- [x] **publish package distribution が X / note / Substack で動く**（hero / x-hook-main-v1 を実配布で確認済 2026-05-14）

**Phase Admin 0 → 1 trigger 4 条件、すべて達成（2026-05-14、batch 0097/0108）。Next.js 着手可能段階。**

**Status correction (2026-05-14, batch 0095/0106)**: 旧記述では Visual Register 項目を「note-hero-v1 完了、x-hook-main-v1 は v001 inbox 段階」として `[ ]` のままだったが、人間が同日中に Visual Register Inbox Review で x-hook-main-v1/v001.png を `approve & register` 完了（registeredAt: 2026-05-14T13:47:16.465Z）、Sanity Studio 手動反映済、`npm run publish:package -- building-hitori-media-os` 実行で `publish-packages/x/building-hitori-media-os/images/x-hook-main-v1.png` 配布済。よって本項目を `[x]` に更新。
残るは **schema activate + seed 投入** の 2 条件のみ。

## 2. Phase Admin 1 — Read-only Dashboard

**目的**: 既存 record を1画面に集約して **判断負荷を下げる**。書きは Sanity Studio に残す。

### 2.1 スコープ

| 画面 | MVP 機能 |
| --- | --- |
| Dashboard Home | open campaigns / pending gates / pending visuals 数 |
| Content Ideas | listing + detail link |
| Campaigns | listing |
| Campaign Detail | 13 段フロー俯瞰、すべて read-only |
| Platform Outputs | listing + localOutputPath / publishedUrl 表示 |
| Visual Assets | listing + thumbnail |
| Inbox Review | Visual Register への外部リンク or iframe |
| Prompt Templates | listing + detail |
| Publish Packages | filesystem 由来の directory tree + markdown preview |
| Human Review Gates | 全 campaign の pending-review 集約 |
| Manual Publishing Log | publishedUrl が入っている記録のみ |
| Diagnostics | `npm run local:check` 結果を JSON 取り込み表示 |
| Activity Log | `docs/devlog/*.md` + `docs/handoff/*.md` 一覧 |
| Settings / Brand Profiles | brandProfile / visualStyleProfile view（write 不可） |

### 2.2 技術スタック（推奨）

| 項目 | 推奨 |
| --- | --- |
| framework | Next.js 14+ (App Router) |
| data | `@sanity/client`（read token、CDN） |
| filesystem | `fs/promises` from `app/api/`（dev のみ） |
| styling | Tailwind CSS（既存 Visual Register と統一感） |
| Auth | **なし**（localhost only） |
| hosting | dev は localhost、production preview は Vercel preview（要 Auth 検討） |

### 2.3 制約

- **Auth なし**（localhost のみ稼働）
- **Sanity write なし**（read token のみ、write 操作は Sanity Studio で実施）
- **filesystem 書き込みなし**（read-only）
- **Visual Register への post なし**（外部リンクで起動するのみ）
- **auto-posting なし**（永続 deferred）
- **paid LLM 呼び出しなし**

### 2.4 完了基準（Phase Admin 1 → 2 の trigger）

- [x] 全画面が読み込みできる（8 page + `/api/asset-thumb`）
- [x] Sanity dataset を read-only で読める（CDN + optional read token）
- [x] Visual Register 外部リンクが動く（`/visual-assets` から localhost:3334 へ）
- [x] Vercel に preview deploy 済 → `app.hitorimedia.com` に production deploy 完了（2026-05-15）
- [x] Basic Auth で production が守られている
- [x] TLS / HSTS 健全（Let's Encrypt R13、HSTS 2 年）
- [x] secret leak grep 0 hits、`b60a8a5` まで push 済
- [x] 1 週間以上 daily で使う → **継続中**（2026-05-16 production 開始）
- [x] 「読みでは足りない、書きが欲しい」具体不便を蓄積 → 本格的にやるのは Phase 2A 完了後の運用フェーズ

**Phase Admin 1 完了済**（2026-05-16、batch d3、[docs/handoff/0119](handoff/0119-admin-phase-1-batch-d3-post-deploy-verification.md)）。Phase Admin 2 design へ移行可能。

## 3. Phase Admin 2 — Visual Register Integration + Visual Generation Quality System

**目的**: dashboard を開いたままで「inbox 確認 → approve → final 反映 → Sanity 更新」を完走できる。Visual generation の品質を schema / UI で仕組み化する。productization も視野。

詳細は [docs/62](62-admin-phase-2-visual-generation-admin-design.md) を参照。本節は roadmap 抜粋。

### 3.1 4 sub-phase 構成

| Sub-phase | スコープ | Write 解禁 | 完了の意味 |
| --- | --- | --- | --- |
| **2A** Dashboard-integrated visual review (read-only) | inbox candidate を dashboard で listing / side-by-side 比較 / review rubric inline | なし | Visual Register と並走、見比べは dashboard に寄せる |
| **2B** Local self-host write mode | dashboard から approve & register / patch JSON 生成 / publish-package dry-run（localhost only） | filesystem | Visual Register をほぼ使わなくなる、localhost で完結 |
| **2C** Sanity write mode | confirmation gate 付きで visualAssetPlan を Sanity mutate / audit log / undo | Sanity | Sanity Studio の手動反映が消える、Auth 切り替え必須 |
| **2D** Product / SaaS-ready mode | storage / content DB / generation provider / design profile を plug-in 化、tenant 境界 | （tenant scoped） | boss 以外の 1 user が同じ dashboard で運用できる |

### 3.2 各 sub-phase の制約

- **2A**: 既存 production dashboard 挙動 不変、Auth は Basic Auth のまま、書き込みゼロ。
- **2B**: localhost only、production には write endpoint を含めない（feature flag で gate）、Sanity mutation なし。
- **2C**: Auth 切り替え後にのみ着手。write token は env 経由、repo / build に含めない。
- **2D**: SaaS 化判断後に着手。Phase 2C 完了 + 6 ヶ月運用後に再評価。

### 3.3 Auth 着手 trigger

**Phase 2C 着手前** に Auth design batch（docs/63 候補）を挟む:

- 候補: Sanity session / GitHub OAuth / magic link
- 2A / 2B では Basic Auth のまま
- Auth 実装は本 Phase Admin 2 design batch（[docs/62](62-admin-phase-2-visual-generation-admin-design.md)）では扱わない

### 3.4 完了基準（Phase Admin 2 → 3 の trigger）

- [ ] 2A: dashboard で v001/v002/v003 を side-by-side 比較できる
- [ ] 2A: review rubric が candidate と同じ画面に出る
- [ ] 2B: dashboard 1 action で approve & register が動く（localhost）
- [ ] 2B: Visual Register を 1 ヶ月以上起動しなくて済む
- [ ] 2C: dashboard から Sanity の visualAssetPlan を確認付き mutation できる
- [ ] 2C: audit log に who / when / what / before / after が残る
- [ ] 2C: Auth が Basic Auth から切り替わっている
- [ ] 2D: 着手判断は別途（必須ではない、最低でも 2C 完了が前提）

### 3.5 永続 deferred（Phase 2 全体）

- auto-posting（X / Substack / note / Threads API 直投稿）
- AI auto-approval（人間 review が唯一の gate）
- paid LLM / image API integration（ChatGPT OAuth + Codex で完結）

## 4. Phase Admin 3 — Generation Integration

**目的**: campaign 生成 / draft 生成 / image candidate 生成を dashboard で trigger する。

### 4.1 追加機能

- New Campaign wizard（contentIdea 選択 → selectedPlatforms → promptTemplateSelections 自動引き当て → campaignPlan 作成）
- Draft generation trigger（promptTemplate を引いて ChatGPT or Claude or Codex に流す）
- Image candidate generation trigger（Codex exec + image_gen を dashboard から起動）
- 進捗 polling / streaming output

### 4.2 制約（変わらないもの）

- **Sanity write は trigger 経由のみ**: dashboard から直接 mutate せず、必ず人間レビュー gate を挟む patch JSON workflow を踏む
- **auto-posting なし**
- **paid LLM client integration を導入する判断は Phase Admin 3 着手時に再評価**

### 4.3 完了基準（Phase Admin 3 → 4 の trigger）

- [ ] dashboard から新規 campaign を作成できる
- [ ] dashboard から draft を生成できる
- [ ] dashboard から image candidate を生成できる
- [ ] 生成結果は inbox / outputs に保存され、Visual Register / 人間レビューを経由する

## 5. Phase Admin 4 — Publish Integration

**目的**: 公開 URL 入力 / reactionNotes 編集を dashboard で行う。

### 5.1 追加機能

- publishedUrl 入力フォーム（dashboard 上で）
- publishedAt timestamp 自動補完
- reactionNotes inline editor
- per-platform publish status の遷移 UI（not-started → in-progress → done）
- Manual Publishing Log のカード化（campaign × platform 別）

### 5.2 永続 deferred

- **auto-posting**（X / Substack / note への API 直投稿）— 本フェーズでも未実装。**手動公開を維持**。
- **engagement metrics 自動取得**（X analytics / note view count 等）— 手書きで reactionNotes に残す方針継続。

### 5.3 完了基準

- [ ] publishedUrl を dashboard で入力できる
- [ ] reactionNotes が dashboard で書ける
- [ ] Manual Publishing Log が見やすい
- [ ] 1 campaign の完走（draft → visual → publish → reaction）が dashboard だけで追える

## 6. 永続 deferred（どの Phase でもやらない）

- **automated publishing**（X / Substack / note / Threads API 直接投稿）
- **paid OpenAI Images API integration**（ChatGPT OAuth + Codex `image_gen` で十分）
- **AI auto-review of drafts**（人間レビューゲートを残す）
- **multi-user collaboration tooling**（solo 前提）
- **paid tier / billing / Stripe integration**（自分用 dashboard、商品化は別）
- **analytics fetch / dashboards with charts**（reactionNotes 手書きを維持）

## 7. Phase 横断の guardrails

各 Phase に共通する不変条件:

- [ ] Visual Register Inbox Review は **唯一の visual approval gate**
- [ ] Sanity Studio は活きている（緊急編集用）
- [ ] `seed --replace` は禁止
- [ ] paid LLM client / image API を repo に追加しない
- [ ] `OPENAI_API_KEY` を repo に置かない
- [ ] auto-posting は実装しない
- [ ] private/ ファイル名 / secret / 実 project ID を **dashboard でも本番ログでも出さない**
- [ ] 既存 4 proposed schemas を独断で破壊的変更しない

## 8. Next.js を導入する正確な trigger

`Phase Admin 0 完了基準` を満たしたとき。すなわち:

1. **4 proposed schema activate 済み**
2. **campaignPlan seed が Sanity に投入され、building-hitori-media-os が現実の record として存在**
3. **Visual Register で ≥ 2 production asset が approve 済み**
4. **publish package distribution が X / note / Substack で動く**

これら4つすべて true になった時点で初めて、Next.js を導入する **別バッチ** を Claude Code に依頼する。それまでは現在の local-first MVP のまま運用する。

## 9. Out of scope（本 doc）

- 個別画面の wireframe / mockup
- Auth scheme の確定
- hosting provider の確定
- Phase Admin 1 の implementation step（着手時に別 doc）

## 10. 次バッチへの推奨

- Phase Admin 0 → 1 trigger の各項目を **チェックリスト化** して `docs/handoff/latest.md` に貼る運用に
- trigger 満たしたら、`docs/59-admin-phase-1-implementation-plan.md` を新規作成して Next.js scaffold step を design
- それまでは Phase Admin 0 の design 補強（structure builder 拡張 / tools/campaign-plan 系 sketch）に集中
