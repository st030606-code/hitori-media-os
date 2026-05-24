# Devlog 0152 — Final ReadOnlyBanner pages fidelity spec

日付: 2026-05-20

## 背景

Phase UI-fidelity-1〜9 で Sidebar 9 nav items + utility 3 page が fidelity 化完了。残るは `<ReadOnlyBanner />` を依然 import している 3 page (`/campaigns` list / `/human-review-gates` / `/publish-package/[slug]`)。これらを fidelity 化すれば `ReadOnlyBanner` import 数が 0 になり、続く microbatch で `ReadOnlyBanner.tsx` を `rm` 可能 → **Hitori Media OS UI fidelity cycle の完全終了**。

本 batch は docs-only の audit + implementation-ready spec。

## 決定・変更

### 新規 docs (4)

- `docs/80-final-readonlybanner-pages-fidelity-spec.md` (本 spec) — A: /campaigns, B: /human-review-gates, C: /publish-package/[slug] + D 章 cleanup chain + E 章 implementation order + F〜I 章 constraints/decisions/out-of-scope/post-state
- `docs/devlog/0152-final-readonlybanner-pages-fidelity-spec.md` (本ファイル)
- `docs/handoff/0163-final-readonlybanner-pages-fidelity-spec.md`
- `docs/handoff/latest.md` (mirror)

### コード変更

**なし**。runtime / schema / publish-package / assets/visuals / patches / package.json / deploy はいずれも touch なし。

### spec の主な内容

3 page を **異なる touch 深度** で扱う設計を明文化:

1. **`/campaigns` list** — 既に PageHeader + max-w-[1280px] + table 構造 → 軽い追加 (Breadcrumb + KpiCardsRow + ReadOnlyBanner 削除) のみ
2. **`/human-review-gates`** — 最も outdated (英語 title / max-w-6xl / `<header>` + h1 / py-8) → 完全 fidelity 再構成 (PageHeader + 4 KpiCard + 日本語 rename + inline `<header>` per bucket)
3. **`/publish-package/[slug]`** — 740 行の copy-friendly worker UI、boss が「触らない」と明示 → **surgical edit (3 行) のみ**、ReadOnlyBanner import + 2 呼び出し削除

加えて、削除候補 ReadOnlyBanner.tsx の cleanup chain (D 章) を明文化:
- 本 spec → Phase UI-fidelity-10 実装 → ReadOnlyBanner import 0 確認 → follow-up microbatch で `rm`

## 理由

- **3 page を一括スコープで扱う必要性**: ReadOnlyBanner 削除のためには 3 page すべてから import を除去する必要、1 PR で完結する方が microbatch との接続が単純
- **`/publish-package/[slug]` の surgical edit 制限**: 740 行で boss workflow に密接最適化済、layout 変更のリスクが投資対効果と見合わない。「ReadOnlyBanner 削除のみ」で十分な fidelity 改善になる (Topbar の ReadOnlyPill が代替)
- **`/human-review-gates` を機会に日本語 rename**: 他 Sidebar nav items はすべて日本語、English のままだと不揃い。boss confirmation pending
- **`/campaigns` を pilot に**: 既に大半 fidelity 整合、3 アイテム追加のみで完了。pattern 確認に最適
- **cleanup chain を明文化**: 実装 → grep 確認 → 削除 の 3 ステップを spec に書いて microbatch の前提を共有
- **shadcn 全 NO 継続**: Phase UI-fidelity-1〜9 と同方針

## 影響

- code 変更ゼロ、23 routes 動作維持、build 不変
- Phase UI-fidelity-10 着手の前提が確定
- 実装完了後 + follow-up microbatch で:
  - `ReadOnlyBanner` import 数 = 0
  - `ReadOnlyBanner.tsx` ファイル削除
  - **Hitori Media OS UI fidelity cycle 完全終了**

## 次の一手

1. **boss が docs/80 を読む**:
   - §A / B / C で各 page の target に違和感ないか
   - §G boss decision points 6 件 (rename / Actions / bucket 並び順 / Breadcrumb / GateBucketSection 共通化 / KpiCard 4 件構成) を回答
   - §E implementation order の Option A (pilot は /campaigns) で進めるか
2. boss OK → Phase UI-fidelity-10 着手 (handoff §9 exact Codex prompt 起動)
3. 実装完了 → follow-up microbatch で ReadOnlyBanner.tsx 削除
4. その後の選択肢:
   - dashboard/README.md 全体書き直し (Phase UI-fidelity-1〜10 反映)
   - Phase Admin 1 Batch A/B/C 時代 component audit
   - Phase 2B 議論 (実 write actions)

## 発信ネタ候補

- 「3 page を 3 つの違う深度で扱う」: 1 batch だが page ごとに「軽い追加 / 完全再構成 / surgical edit」を使い分ける戦略の話
- 「触らないと決めた UI に手を入れない」: `/publish-package/[slug]` が boss workflow に深く最適化されている件、fidelity のために壊さない判断
- 「cleanup chain を spec に書く」: 実装 → grep → 削除の 3-stage cleanup を spec docs に明記する習慣、microbatch 間の前提共有を簡素化
