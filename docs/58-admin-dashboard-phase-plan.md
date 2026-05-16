# 58 — Admin Dashboard Phase Plan (design)

Date: 2026-05-14
Status: **design-only**, no implementation

Phase Admin 1〜4 の段階的ロードマップと、各 Phase の着手 trigger / 完了基準 / 永続 deferred を明示する。

## 0. 全体俯瞰

```
Phase Admin 0:  design only            ← 現在地（本 doc を含む docs/47〜58）
Phase Admin 1:  read-only dashboard    ← Next.js 初導入の最小スコープ
Phase Admin 2:  Visual Register 統合   ← inbox approve / patch review を dashboard で
Phase Admin 3:  generation 統合         ← campaign 生成 + promptTemplate runner
Phase Admin 4:  publish 統合            ← 公開URL記録 + reactionNotes（auto-posting は依然 deferred）
```

各 Phase は **完全に独立**: 後の Phase に行かなくても前 Phase は単独で使い物になる。

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

- [ ] 全画面が読み込みできる
- [ ] Sanity dataset を read-only で読める
- [ ] Visual Register 外部リンクが動く
- [ ] 1 週間以上 daily で使い、判断負荷が下がったことを実感
- [ ] 「読みでは足りない、書きが欲しい」具体的な 3 ケースが言える

## 3. Phase Admin 2 — Visual Register Integration

**目的**: Inbox Review / Patch Review を dashboard で完結させる。

### 3.1 追加機能

- Inbox Review カードを dashboard 内に統合（Visual Register 機能の取り込み）
- candidate v00N.png の側 by 側 比較表示
- approve & register / mark needs-regeneration / drop の3 action
- Patch JSON view + Sanity Studio に手動反映するためのコピー UI
- reviewRubric を inline 表示（promptTemplate / visualStyleProfile から引く）

### 3.2 制約（変わらないもの）

- **Sanity write は依然なし**（patch JSON は filesystem に書く、Sanity への反映は手動）
- **auto-posting なし**
- **paid API なし**

### 3.3 Auth 着手 trigger

Phase Admin 2 に入った時点で **Auth が必要**:
- dashboard で approve action が起こると、誰がやったかの監査が必要
- production preview を出せるようになる（自分以外には access させない）

候補: Sanity session / GitHub OAuth / magic link。Phase Admin 2 着手時に別 design doc で決定。

### 3.4 完了基準（Phase Admin 2 → 3 の trigger）

- [ ] approve & register が dashboard でできる
- [ ] patch JSON が dashboard で生成・閲覧できる
- [ ] Sanity 反映の手動コピー UI が動く
- [ ] Visual Register（旧）をほぼ起動しなくて済むようになる
- [ ] Auth が稼働している

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
