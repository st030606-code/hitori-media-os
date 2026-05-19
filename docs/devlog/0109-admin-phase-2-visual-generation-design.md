# Devlog 0109 — Admin Phase 2: Visual Register Integration + Visual Generation Quality System (design only)

Date: 2026-05-18
Status: **design-only / docs-only / 0-code-change / 0-schema-change / 0-write / 0-deploy**

## 今日の判断

Phase Admin 1 が production-live で 2 日経過した時点で、Phase Admin 2 を **4 sub-phase に細分化** した: 2A read-only integration → 2B local write → 2C Sanity write → 2D product / SaaS。

理由: 「Visual Register を dashboard に統合する」を **1 batch で全部やる** と Auth 切り替えと write 解禁が同時に必要になり、リスクが高すぎる。先に 2A で **読みだけ統合** して dashboard を boss の単一 UI にし、その後 2B で filesystem write、2C で Sanity write + Auth 切り替え、2D で product 化、と段階的に拡張する。

Visual Register（`tools/visual-register/`）は **Phase 2C 完了まで残す**: 2A の段階では fallback、2B では「dashboard で大体できる」状態に持っていきつつ削除はしない。Phase 2C で boss が 1 ヶ月以上 dashboard 単独で運用できると確認できた時点で削除判断。

product 化の設計も先送りせずに **本 batch で骨格** を書いた: storage / content DB / generation provider / design profile / user permissions を **plug-in interface に倒す前提** で、Phase 2A から命名・データモデルを将来抽象化に耐える形にする。boss-only から SaaS への移行を「いつでも踏める備え」として持つ。

## なぜその設計にしたか

- **Phase 2 を 4 分割した理由**: 1 batch で「読み統合 + 書き解禁 + Auth 切替 + product 化」を同時に踏むと、retreat の経路がなくなる。各 sub-phase が独立に完走できれば、途中 phase で運用評価を入れて方針調整できる。
- **2A を read-only に絞った**: production dashboard の挙動を変えない integration plan が必要。書きを入れると Phase 1 で守った "production には write endpoint を含めない" 原則を破る可能性がある。
- **2B を localhost only に固定**: filesystem write を production に出すには Auth 切り替えが必須。先に local で書きを慣らし、Auth 設計を別 batch で挟んでから production write 検討。
- **2C で Auth 切り替えを必須化**: dashboard が Sanity を mutate するなら "誰が承認したか" の audit が要る。Basic Auth では誰の操作か特定できない。
- **2D は急がない**: SaaS 化判断は別問題。Phase 2C を 6 ヶ月運用してから再評価する保留判断を docs に明記。
- **schema 提案を 7 件に絞った**: `designProfile` / `layoutPatternPreset` / `visualGenerationRun` / `visualCandidate` / `visualReviewDecision` / `generationJob` / `assetRegistrationLog`。これ以上提案すると active 化のコストが scope を超える。本 batch では **どれも作らない**、提案のみ。
- **Codex integration を Option A (local CLI bridge) 推奨**: Option B（server action 直 spawn）は Codex 認証情報を server に置く必要があって production 不適合。Option C（queue worker）は SaaS 化前に作る価値が低い。A は既存 Codex CLI + ChatGPT OAuth をそのまま使え、localhost only で済む。
- **既存 schema を破壊しない**: visualAssetPlan / campaignPlan / promptTemplate / brandProfile / visualStyleProfile の field を据え置き、`generationProvider` / `generationJobId` などの既存 field を **拡張ポイントとして利用**。後方互換を維持。
- **write boundary table を作った**: dashboard で起こりうる全 mutation を 1 表に列挙し、各 phase でどれが解禁されるかを明示。設計の曖昧さを減らす。
- **failure detection を rubric 化**: 「title card 化を防ぐ」を 8 項目の failure mode に分解し、Phase 2A では human tag、Phase 2B+ で auto-check 候補という段階的な automation。
- **product 化に向け抽象化必須 6 項目を列挙**: storage / content DB / generation provider / publish package / design profile / user permissions。これらが plug-in interface 化された時点が「boss-only → sellable」の分水嶺。
- **Auth 設計を分離**: 本 doc では Phase 2C 着手前に別 batch (docs/63 候補) を挟むとだけ宣言。Auth は Basic Auth → real Auth への移行で深い設計が要るので、本 doc に混ぜない。

## Codex と Claude Code の役割分担

| 役割 | 担当 |
| --- | --- |
| docs/62 起草（13 sections、Phase 2 全体設計） | **Claude Code（本バッチ）** |
| docs/58 更新（Phase 1 完了マーク + 2A-2D 追加） | Claude Code |
| docs/devlog/0109 起草 | Claude Code |
| docs/handoff/0120 起草 + latest.md ミラー | Claude Code |
| 既存 docs/47-50, 56-58, 60-61 の整合性 review | Claude Code |
| 既存 visual register server.mjs / dashboard visual-assets page / featureFlags の挙動 review | Claude Code |
| Auth scheme 確定 / Phase 2A scaffold / generation bridge 実装 | **将来バッチ**（人間 trigger） |
| schema activate（designProfile / visualCandidate 等） | **将来バッチ**（提案のみ、本バッチでは sketch せず） |

Codex は本バッチで **起動していない**: 設計のみ、image 生成ゼロ、CLI 投入ゼロ。

## API なしで済ませた理由

- 設計のみで code に手を入れていない → API 連携の追加 0
- Codex / OpenAI / Sanity write を含めて、本 batch では **paid / external API 呼び出し 0**
- 既存 Sanity read token / ChatGPT OAuth / GitHub OAuth はそのまま、新規認証情報追加 0
- Auth 設計は **後段 batch（docs/63）に分離**、本 batch では Basic Auth のまま

## このバッチで作ったもの / 変更したもの

### Added — `docs/`

- `docs/62-admin-phase-2-visual-generation-admin-design.md`（13 sections、Phase 2 設計本体）
- `docs/devlog/0109-admin-phase-2-visual-generation-design.md`（本ファイル）
- `docs/handoff/0120-admin-phase-2-visual-generation-design.md`（次バッチへのハンドオフ）

### Modified — `docs/`

- `docs/58-admin-dashboard-phase-plan.md`（Phase Admin 1 完了マーク + Phase 2 を 2A/2B/2C/2D に分割）
- `docs/handoff/latest.md`（本 0120 のミラー）

### Confirmed unchanged

- `schemas/` 全件（brandProfile / visualStyleProfile / promptTemplate / campaignPlan / visualAssetPlan / contentIdea / ...）
- `schemas/index.ts` / `sanity.config.ts` / `structure/index.ts`
- `dashboard/src/` 全件（page route / api route / lib / components / proxy.ts）
- `dashboard/package.json` / `package-lock.json`
- root `package.json` / `package-lock.json`
- `tools/visual-register/` / `tools/publish-package-builder/` / `tools/local-check.mjs` / `tools/asset-thumb/` 等
- `assets/visuals/` / `assets/inbox/` / `patches/` / `seed/` / `outputs/` / `publish-packages/`
- Sanity dataset（**書き込みゼロ**）
- Vercel project / DNS / production env vars
- production deployment（**未触**、本 batch では deploy していない）
- `dashboard/public/activity-snapshot.json`（既存 commit 済み snapshot のまま）

## Phase Admin 2 sub-phase まとめ

| Sub-phase | Write 解禁 | 環境 | 主要新規 route | Auth 状態 |
| --- | --- | --- | --- | --- |
| 2A read-only integration | なし | both（filesystem は dev only） | `/visual-assets/[id]/candidates`, `/visual-review/*` | Basic Auth のまま |
| 2B local write | filesystem | **dev only** | `/visual-assets/[id]/generate`, write endpoints | Basic Auth のまま |
| 2C Sanity write | filesystem + Sanity | both（confirmation gate） | mutation routes | **real Auth へ切替**（docs/63 候補） |
| 2D product / SaaS | tenant-scoped storage + DB | cloud | tenant routes / billing | per-user auth |

## 提案 schema 7 件（active 化なし、本 batch では sketch も書かない）

| 提案 | 主目的 | 着手 phase |
| --- | --- | --- |
| `designProfile` | brand × style × layout の preset selector | 2A sketch / 2D activate |
| `layoutPatternPreset` | layoutPattern 別の require/forbid modules | 2D |
| `visualGenerationRun` | 1 生成 job の record | 2B+ |
| `visualCandidate` | 1 candidate を database 化 | 2B read / 2C write |
| `visualReviewDecision` | approve/reject の audit log | 2C |
| `generationJob` | SaaS の生成 queue 項目 | 2D |
| `assetRegistrationLog` | final 登録の audit | 2C |

→ いずれも **本 batch では schemas/proposed/ に置かない**。将来バッチで sketch、本 batch は提案のみ。

## 次に来る design batch（候補）

1. **docs/63 — Auth migration design**（Basic Auth → real Auth、Phase 2C 着手前）
2. **docs/64 — Phase Admin 2A implementation plan**（read-only integration の component 設計、route スキーマ確定）
3. **docs/65 — generation-bridge tool design**（`tools/generation-bridge/` を新規、Option A の filesystem queue 仕様）
4. **docs/66 — Phase Admin 2B implementation plan**（local write endpoints の design）

優先度: 2A 着手前に 64 を先に書く、2C 着手前に 63 を書く。

## 発信ネタになりそうな切り口

1. **「dashboard 統合を 4 sub-phase に切る理由」**: 1 batch で読み + 書き + Auth + product 化を全部やると retreat の経路がなくなる。段階的に解禁することで、各 phase ごとに運用評価を入れて方針調整できる、という Hitori Media OS 的な慎重さ。
2. **「Visual Register を消さずに dashboard と並走させる」**: 新ツールに移行するとき、旧ツールを **すぐ消さない** ことで安全網を残す。Phase 2C 完了まで Visual Register を生かす設計判断。
3. **「Codex 認証情報を dashboard server に置かない」**: Option A (local CLI bridge) を選ぶ理由。production dashboard に paid API key を入れない、認証は boss machine 上のみで完結する設計の延長。
4. **「product 化を急がない判断」**: SaaS 化は技術的可能性で判断せず、運用 6 ヶ月後の実感で判断する。boss-only から sellable への分水嶺を docs に書いた話。
5. **「write boundary table」**: dashboard で起こりうる全 mutation を 1 表に列挙し、各 phase でどれが解禁されるかを明示。設計の曖昧さを減らす frame。

## Safety Verified

- direct Sanity write を含むコード変更: **0 件**（schemas / tools / dashboard / sanity.config 全て不変）
- paid LLM / image API client 追加: **0 件**
- `SANITY_WRITE_TOKEN` / `writeToken` grep: 0 hits（docs 内の rule 引用のみ）
- 環境変数変更 / Vercel UI 操作: **0 件**
- 画像生成 / Codex CLI 起動: **0 件**
- schema 変更 / activate / proposed/ 追加: **0 件**
- assets / patches / Sanity / publish-packages: **不変**
- 既存 production dashboard (`app.hitorimedia.com`) の挙動: **不変**
- Visual Register (`tools/visual-register/`) の挙動: **不変**
- root `npm run local:check`: 後段 §13 で実行・結果記録
- root `npm run build`（Sanity Studio）: 後段 §13 で実行・結果記録
- `cd dashboard && npm run build`: 後段 §13 で実行・結果記録
