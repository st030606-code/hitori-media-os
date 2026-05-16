# Devlog 0094 — Admin Dashboard Architecture Plan (design only)

Date: 2026-05-14
Status: **design-only**, no implementation, no Next.js scaffolding
Correction: 2026-05-14（batch 0095）— Phase Admin 0 → 1 trigger の Visual Register 項目を `[x]` に更新。詳細は [docs/devlog/0095-x-hook-main-v1-visual-register-approval.md](0095-x-hook-main-v1-visual-register-approval.md) と [docs/58 §1 末尾](../58-admin-dashboard-phase-plan.md#1-phase-admin-0--design-only) を参照。

## 今日の判断

`hitorimedia.com` ドメイン取得を契機に、admin dashboard の architecture / domain split / phase roadmap を1セットの design doc に落とした。**実装は1行も行わない**。Phase Admin 0（design only）から Phase Admin 1（read-only dashboard）への trigger を明示し、それまで Next.js を導入しない判断を強調した。

## なぜその設計にしたか

- **Content Idea / Campaign 中心**: 既存の Sanity Studio structure（Content Ideas → By Content Idea）と campaignPlan proposed schema の設計と整合させた。dashboard で新しい思想を持ち込まず、既存の中心軸を強化する。
- **read-only から始める**: Phase Admin 1 を完全 read-only にすることで、Auth / write sync / 監査ログを後回しにできる。Next.js 導入 cost を最小化。
- **root と app subdomain を分ける**: hitorimedia.com（public）と app.hitorimedia.com（admin）は **責任が違う**ので最初から subdomain で分離。Cookie scope / Auth scope / cache 戦略を分離しやすい。
- **永続 deferred を明文化**: auto-posting / paid LLM SDK / AI auto-review / multi-user / billing は Phase 4 でもやらない、を docs/58 に明記。判断を毎回再開しなくて済む。
- **Next.js 導入 trigger を 4 条件で固定**: 4 proposed schema activate / 1 campaignPlan 投入 / Visual Register ≥ 2 approve / publish package distribution 動作確認。曖昧な「準備ができたら」を排除。

## Codex と Claude Code の役割分担（再確認）

| 役割 | 担当 |
| --- | --- |
| dashboard architecture 設計 | Claude Code（本バッチ） |
| domain / subdomain 設計 | Claude Code（本バッチ） |
| phase roadmap 設計 | Claude Code（本バッチ） |
| schema activate / seed 投入 | 人間 |
| Phase Admin 1 着手判断 | 人間 + Claude Code（trigger 満たしたら別バッチ） |
| Next.js scaffold | 将来の別バッチ |

## API なしで済ませた理由（再確認）

- 設計 doc のみ。code / schema 変更なし。
- paid API integration / OpenAI API client を repo に追加していない。
- Sanity CLI を実行していない。
- 画像生成を行っていない。
- DNS / 証明書 / hosting provider のいずれも実作業なし。

## このバッチで作ったもの

| ファイル | 種別 |
| --- | --- |
| `docs/56-admin-dashboard-architecture.md` | IA + 12 主要画面 + データ層 + 既存 tool との関係 |
| `docs/57-hitorimedia-domain-app-plan.md` | hitorimedia.com / app.hitorimedia.com 分離方針、subdomain 候補、building-in-public 整合 |
| `docs/58-admin-dashboard-phase-plan.md` | Phase Admin 0〜4 の roadmap、各 phase の trigger / 完了基準 / 永続 deferred |
| `docs/devlog/0094-admin-dashboard-architecture-plan.md` | 本ファイル |
| `docs/handoff/0105-admin-dashboard-architecture-plan.md` | (次に書く) |
| `docs/handoff/latest.md` | 0105 をミラー |

`schemas/` / `tools/` / `sanity.config.ts` / `structure/index.ts` / `package.json` / `package-lock.json` / 既存 outputs / publish-packages / `assets/visuals/` / `patches/` / `private/` / ai-blog-db 関連 すべて **不変**。

## 連番について

- devlog: 0093 → **0094**
- handoff: 0104 → **0105**
- docs: 55 → **56 / 57 / 58**（3 件連番取得）

## 発信ネタになりそうな切り口

1. **「ドメイン取得 ≠ 即実装」**: hitorimedia.com を取ったあと、すぐ Next.js を建てない判断。trigger を 4 条件で固定して「いつ建てるか」を未来の自分に渡す。
2. **「Phase 0 を独立した phase として呼ぶ」**: 設計だけの phase に明示的な番号と完了基準を与える。コードを書かない時間も building 過程の一部、と公にする。
3. **「read-only から始める dashboard」**: write 機能を後回しにする判断の根拠。Auth / sync / 監査ログを deferred にする trade-off。
4. **「dashboard と Sanity Studio の役割分担」**: 一つの UI で全部やろうとせず、Studio を残す。緊急修正 / schema 編集は Studio、運用 view は dashboard。
5. **「永続 deferred のリスト」**: auto-posting / paid LLM / multi-user / billing をやらない判断を毎回再開しないために、phase plan に明文化する設計手法。

## Safety Verified

- `schemas/index.ts` 不変
- `sanity.config.ts` 不変
- `tools/` 不変
- `package.json` / `package-lock.json` 不変
- `npm run build`: 成功（design doc 追加のみで build に影響なし）
- `npm run local:check`: ok: true（17 green）
- direct Sanity write の grep: 0 hits
- paid API integration の grep: 0 hits
- 画像生成: 0 件
- DNS / hosting / Auth: いずれも触れていない（設計のみ）
- ai-blog-db 関連: 不変
