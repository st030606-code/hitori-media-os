# Handoff: Admin Dashboard Architecture Plan (design only)

Date: 2026-05-14
Status: **design-only / no implementation / no Next.js scaffold / no DNS changes**
Correction: 2026-05-14（batch 0095/0106）— Phase Admin 0 → 1 trigger の Visual Register 項目を `[x]` に更新。x-hook-main-v1 が同日中に承認・配布完了。残るは schema activate + seed 投入の 2 条件のみ。詳細は [docs/handoff/0106-x-hook-main-v1-visual-register-approval.md](0106-x-hook-main-v1-visual-register-approval.md)。

## 1. Task Goal

`hitorimedia.com` ドメイン取得を踏まえ、admin dashboard の **architecture / domain split / phase roadmap** を 1 セットの design doc に落とす。実装は 1 行もしない。Next.js / Auth / write 機能はいずれも本バッチで導入しない。

## 2. Constraints Followed

- Next.jsを実装していない（依存追加 0、scaffold 0）。
- Auth を実装していない。
- paid API integration を追加していない。
- OpenAI API / Anthropic API クライアントを repo に追加していない。
- auto-postingを実装していない。
- Sanity direct write を実装していない（grep 0 hits 維持）。
- Sanity CLI commands を自動実行していない。
- `seed --replace` を実行していない。
- proposed schemas を activate していない（`schemas/index.ts` 不変）。
- `sanity.config.ts` を変更していない（本バッチでは structure builder 拡張も Phase Admin 1 trigger まで保留）。
- 既存 active schemas を破壊的に変更していない。
- 画像 candidate を本バッチで生成していない。
- `assets/visuals/...` / `patches/...` / `assets/inbox/` 既存ファイルを変更していない。
- DNS / 証明書 / hosting provider の実作業を行っていない。

## 3. Changed Files

### Added — Docs

- `docs/56-admin-dashboard-architecture.md`（dashboard IA + 12 主要画面 + 現 tool との role mapping）
- `docs/57-hitorimedia-domain-app-plan.md`（hitorimedia.com 公開サイト / app.hitorimedia.com admin app の分離 + subdomain 候補）
- `docs/58-admin-dashboard-phase-plan.md`（Phase Admin 0〜4 のロードマップ + Next.js 導入 trigger）
- `docs/devlog/0094-admin-dashboard-architecture-plan.md`
- `docs/handoff/0105-admin-dashboard-architecture-plan.md`

### Modified

- `docs/handoff/latest.md`（本 0105 にミラー）

### Confirmed unchanged

- `schemas/` 全件（active 12 / proposed 11）
- `sanity.config.ts`
- `structure/index.ts`
- `tools/` 配下すべて
- `package.json` / `package-lock.json`
- 既存 seed / outputs / publish-packages / private / ai-blog-db 関連
- `assets/visuals/` / `patches/` / `assets/inbox/`
- domain / DNS / hosting / Auth：いずれの設定にも触れていない

## 4. Summary of Changes

### A. docs/56 — Admin Dashboard Architecture

- Content Idea / Campaign 中心の理由
- Phase Admin 1 read-only の根拠
- データ層: Sanity (read-only) / local files / Visual Register API
- **12 主要画面の IA**: Dashboard Home / Content Ideas / Campaigns / Campaign Detail / Platform Outputs / Visual Assets / Inbox Review / Prompt Templates / Publish Packages / Human Review Gates / Manual Publishing Log / Settings / Brand Profiles
- 各画面に: Purpose / Primary data source / Key fields / Future write actions / Not yet implemented
- 現 local tools → 将来 dashboard 画面の **9 件マッピング表**
- Sanity Studio との役割分担（Studio: 編集 / dashboard: 運用 view）
- データ取得方針 + Auth 方針（Phase 1 では Auth なし）
- **永続 deferred の明文化**: auto-posting / paid LLM / AI auto-review / analytics / billing / multi-user

### B. docs/57 — hitorimedia.com Domain & App Plan

- root と app subdomain の **責任分離** 4 理由（責任 / Auth scope / cache / scale）
- `hitorimedia.com` 公開サイト route 10 件（/ /about /now /blog /concepts /links /privacy /contact 等）
- `app.hitorimedia.com` admin route 16 件（Phase Admin 1 想定）
- 任意 subdomain 候補 3 件（docs / demo / status）— MVP では作らない
- 何を public に / 何を private にするか
- building-in-public ↔ 商品化動線（dashboard と product 販売を混ぜない）
- DNS / 証明書は本バッチで触らない

### C. docs/58 — Admin Dashboard Phase Plan

- **Phase Admin 0 — Design Only**（現在地）
- **Phase Admin 1 — Read-only Dashboard**: スコープ 14 画面 / 技術スタック / 制約 / 完了基準
- **Phase Admin 2 — Visual Register Integration**: inbox approve / patch review / Auth 着手 trigger
- **Phase Admin 3 — Generation Integration**: New Campaign wizard / draft 生成 / image candidate 生成 trigger
- **Phase Admin 4 — Publish Integration**: publishedUrl 記録 / reactionNotes / auto-posting は依然 deferred
- **永続 deferred 6 項目**: automated publishing / paid OpenAI Images API / AI auto-review / multi-user / billing / analytics fetch
- **Phase 横断 guardrails 7 件**: Visual Register approval gate / Studio 残存 / seed --replace 禁止 / paid LLM 禁止 / private file 隠蔽 等
- **Next.js 導入 trigger 4 条件**: 4 schema activate / campaignPlan 1 件投入 / Visual Register ≥ 2 approve / publish package 動作確認

### D. Validation Results

- `npm run build`: **成功**（design doc 追加のみで build に影響なし）
- `npm run local:check`: **ok: true**（17 green / 0 fail）
- `schemas/index.ts` 不変（grep で `campaignPlan|promptTemplate|brandProfile|visualStyleProfile`: 0 hits）
- `sanity.config.ts` 不変
- direct Sanity write の grep: 0 hits
- paid LLM/image API client/SDK の repo 追加: 0 hits
- Sanity CLI auto-exec: 0 hits
- 画像生成: 0 件
- `assets/visuals/` / `patches/` / 既存 inbox: 不変

## 5. Important Decisions

- **ドメイン取得 ≠ 即実装**: `hitorimedia.com` を取ったあと、Phase Admin 0 trigger 4 条件を満たすまで Next.js を入れない。
- **root と app の subdomain 分離**: 最初から `app.hitorimedia.com` を admin、`hitorimedia.com` を public、として割る。
- **Phase Admin 1 は read-only**: Auth / write / sync を後回しにする trade-off。
- **永続 deferred を明文化**: auto-posting / paid LLM / AI auto-review / multi-user / billing / analytics をどの phase でも実装しない。Phase 4 ですら manual publish 維持。
- **Next.js 導入 trigger 4 条件**: 4 schema activate / campaignPlan 投入 / Visual Register ≥ 2 approve / publish package 動作。曖昧な「準備ができたら」を排除。
- **Sanity Studio を残す**: dashboard と Studio は併存、Studio は緊急編集 / schema 管理用。

## 6. Human Review Questions

- **Phase Admin 0 → 1 trigger 4 条件のうち、現状未満たしの項目**（2026-05-14 batch 0095/0106 で再確認）:
  - [ ] 4 proposed schema activate（**未**）
  - [ ] campaignPlan seed 投入（**未**、JSON は作成済）
  - [x] Visual Register ≥ 2 approve（note-hero-v1 / x-hook-main-v1、両方 2026-05-14 承認完了、後者は registeredAt: 2026-05-14T13:47:16.465Z）
  - [x] publish package distribution 動作確認（note / substack hero + x-hook-main-v1 配布済 2026-05-14）

  → trigger を満たすには **schema activate と seed 投入の 2 バッチ** が残り。
- `hitorimedia.com` 公開サイトと `app.hitorimedia.com` admin app の **どちらを先に建てるか**？（推奨: admin、public site は後回し）
- 公開サイトの content source（note mirror / Substack mirror / 独自 GROQ）はどれを選ぶか？
- Auth scheme を Phase Admin 2 着手時に決めるか、もっと早く方針だけ決めておくか？
- `tools/codex-workflow/` に diff watcher（Codex agent overreach 検知）を **Phase Admin 1 着手前に**追加するか？

## 7. Risks or Uncertainties

- **Phase Admin 1 trigger を急いで満たすと、設計の検証が不十分なまま実装に入る危険**: campaignPlan の field shape が運用で「実は足りない」と分かる可能性。schema activate → 1〜2 週間運用 → trigger 達成、の順序を推奨。
- **`app.hitorimedia.com` を localhost only から始める判断のリスク**: Vercel preview で「インターネット越しに見える URL」が即必要になった場合、Auth を Phase Admin 1 で前倒し導入する判断あり得る。
- **公開サイト `hitorimedia.com` の content source 未確定**: note mirror か独自 CMS か、それとも単純な静的サイトかで build pipeline が変わる。design 段階で choice を立てておかないと、`app.hitorimedia.com` 着手後に「あれ、root site どうやって配信？」となる。
- **永続 deferred の項目が将来変わる可能性**: 例えば paid Substack API integration が安価になれば、auto-posting を再評価する場面が来る。`docs/58 §6` を「現時点での deferred」として記載、再評価 trigger も明文化する余地。
- **dashboard を作る前に schema が変わる可能性**: Phase Admin 0 期間中に campaignPlan / promptTemplate の field を追加・削除する判断があれば、seed JSON も同時更新が必要。

## 8. Recommended Next Step

### Immediate Human Actions

- `docs/56` / `docs/57` / `docs/58` を読み、**Phase Admin 1 trigger 4 条件**が現実的か確認
- 4 proposed schema を Studio activate する判断のタイミングを確定
- 公開サイト vs admin app のどちらを先に建てるか方針決定（推奨: admin が先、public は building-in-public の進捗に合わせて）

### Next Implementation Batches（推奨順）

1. **4 proposed schema を Studio activate するバッチ**（dependency 順、`npm run build` 成功確認、seed 投入は別バッチ）
2. **campaignPlan / brandProfile / visualStyleProfile / promptTemplate の seed を Sanity に投入するバッチ**（依存順、`npx sanity documents create` を1件ずつ、`--replace` 禁止）
3. （任意）`structure/index.ts` 拡張: "By Campaign" 子ノード追加
4. （任意）`tools/codex-workflow/` に Codex agent diff watcher script を追加（[devlog 0090](../docs/devlog/0090-x-hook-main-v1-codex-exec-imagegen-success.md) の lesson）
5. **Phase Admin 0 → 1 trigger 4 条件を満たしたあと**: `docs/59-admin-phase-1-implementation-plan.md` を design batch で起こす（Next.js scaffold step を細分化）
6. Next.js scaffold バッチ（最小限の app router + 1 画面 read-only）

### Mid-term

- Auth scheme 決定（Phase Admin 2 着手時、別 design doc）
- `hitorimedia.com` 公開サイトの content source 決定（note mirror / Sanity mirror / 静的）
- `tools/campaign-plan/derive-visual-asset-plans.mjs` script の概念 sketch

### Deferred（永続）

- paid LLM / image generation API integration
- auto-posting / automated publish
- AI auto-review of drafts
- multi-user / collaboration tooling
- billing / paid tier
- analytics fetch / dashboard charts

## 9. Exact Prompt to Give Codex Next

```text
Activate the 4 proposed schemas in Studio in dependency order.

Hard Rules:
- Activate in this exact order: brandProfile → visualStyleProfile → promptTemplate → campaignPlan.
- After each activation, run `npm run build` and confirm success before moving to the next.
- Do NOT touch any other schema file.
- Do NOT call paid APIs.
- Do NOT run `npx sanity documents create` yet (seed insertion is a separate batch).
- Do NOT auto-post.
- Do NOT modify assets/visuals/... or patches/...
- Do NOT modify structure/index.ts in this batch (Phase Admin 1 trigger does not require it).

Use:
- schemas/proposed/brandProfile.ts
- schemas/proposed/visualStyleProfile.ts
- schemas/proposed/promptTemplate.ts
- schemas/proposed/campaignPlan.ts
- schemas/index.ts
- sanity.config.ts
- docs/58-admin-dashboard-phase-plan.md (for Phase Admin 0 → 1 trigger context)

Workflow:
1. Move (or copy) each proposed schema file into schemas/ (or keep in schemas/proposed/ but import — your choice).
2. Update schemas/index.ts to import and export each new type, in dependency order:
   first brandProfile, then visualStyleProfile, then promptTemplate, then campaignPlan.
3. Update sanity.config.ts only if structure changes are required (typically not needed).
4. After each activation step: `npm run build` and confirm success.
5. After all 4 are active: `npm run dev`, open Studio, confirm 4 new types appear in "By Type (flat)" view.
6. Run `git diff --stat` at the end. Confirm only schemas/ files + docs/devlog/ + docs/handoff/ touched.
7. Do NOT yet insert any seed file. Stop and report status.

End-of-run output:
- list of files moved / modified
- npm run build result per step
- Studio rendering confirmation
- git diff --stat summary
```
