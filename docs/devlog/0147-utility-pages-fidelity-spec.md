# Devlog 0147 — Utility pages fidelity spec

日付: 2026-05-20

## 背景

Phase UI-fidelity-1〜7 で fidelity 化された 6 page (`/` / `/campaigns/[slug]` / `/outputs` / `/publish` / `/publish-package/[slug]` / `/configurator` / `/visual-assets` 3 route) と異なり、`/publish-packages` / `/activity-log` / `/diagnostics` の 3 page は **Phase Admin 1 Batch C/D 時代の古い tone** のまま残っていた。

これら 3 page だけが旧 component (`SummaryCard` / `SectionHeader` / `EmptyState` / `FilePathBlock`) を使い続けていることが、handoff/0156 §6「中期」削除候補のブロッカーになっていた。fidelity 化すれば旧 component の import 数が一気に 0 になり、別 cleanup microbatch で削除可能になる。

本 batch は **docs only** の audit + implementation-ready spec として `docs/78-utility-pages-fidelity-spec.md` を作成。

## 決定・変更

### 新規 docs

- `docs/78-utility-pages-fidelity-spec.md` — 3 page の current/target structure 比較 + 旧 component 置換マップ + P0/P1/P2 scope + boss decision points 6 件
- `docs/devlog/0147-utility-pages-fidelity-spec.md` (本ファイル)
- `docs/handoff/0158-utility-pages-fidelity-spec.md`
- `docs/handoff/latest.md` (mirror)

### コード変更

**なし**。runtime / schema / publish-package / assets/visuals / patches / package.json / deploy はいずれも touch なし。

### spec の主な内容

1. **3 page の current structure 完全 audit** — それぞれの header / SummaryCard 配置 / EmptyState 使用箇所 / SectionHeader 使用箇所を行番号付きで記録
2. **target structure** — PageHeader + Breadcrumb + KpiCardsRow + 新 section card + inline empty/error の現行 fidelity pattern に統一
3. **component replacement plan (D 章)** — `SummaryCard → KpiCard` / `SectionHeader → inline <header>` / `EmptyState → inline border-dashed or border-rose-200` / `FilePathBlock → inline <code> + CopyButton` の 4 種類を実装サンプルコード付きで明記
4. **implementation order (E 章)** — `/diagnostics → /activity-log → /publish-packages` の段階実装、または 1 batch でまとめて (推奨)
5. **clean-up 連鎖 (I 章)** — 実装完了後の dead-code-cleanup microbatch でどの旧 component が削除可能になるか
6. **boss decision points (G 章)** — 日本語 rename / Breadcrumb 親 / 「再実行」action 位置付け / FilePathsCard 共通化 / filter polish 等の 6 件

## 理由

- **`docs only` で確定させる**: 3 page を実装する batch が大きくなる予測 (合計 ~700 行の置換)。先に spec を boss 確認すれば、実装中の往復が減る
- **1 batch でまとめる推奨**: 3 page は独立だが、削除可能な旧 component が共通なので 1 PR で完結する方が dead-code-cleanup 連鎖がきれい
- **データ取得ロジックは touch なし**: `scanPackages` / `readDocsFromFs` / `loadSnapshot` / `runLocalCheck` は完全に温存。fidelity batch の scope を「layout / 表示」に限定することで回帰リスクを最小化
- **`/diagnostics` を pilot に**: 3 page で最小の構造、pattern を 1 page で確認してから他 2 page に展開する手順を spec に明記

## 影響

- code 変更ゼロ、23 routes 動作維持、build green
- Phase UI-fidelity-8 着手の前提が確定
- 実装後の dead-code-cleanup で `SummaryCard / SectionHeader / EmptyState / FilePathBlock` の 4 ファイル削除可能 (handoff/0156 §6「中期」)

## 次の一手

1. **boss が docs/78 を読む**:
   - 各 page の target structure に違和感ないか
   - §G の boss decision points 6 件を回答 (日本語 rename / Breadcrumb 親 / etc)
   - §E の implementation order で OK か (1 batch でまとめる推奨)
2. boss OK → Phase UI-fidelity-8 着手 (handoff §9 の Codex prompt をそのまま起動)
3. 微調整があれば microbatch
4. 実装完了後、dead-code-cleanup microbatch で 4 旧 component 削除

## 発信ネタ候補

- 「utility page が fidelity から取り残される話」: メインの user-facing page を先に揃えてから、内部 utility page を後で揃える順序は意図的、ROI 観点で正解
- 「dead code 削除の連鎖戦略」: 旧 component を残し続ける page 群を fidelity 化することで、別 microbatch で一気に旧 component を消せる連鎖計画
- 「spec を読まずに実装する vs spec を読む」: 3 page まとめて変える batch は spec があると安心、変更箇所が読む側にも明確
