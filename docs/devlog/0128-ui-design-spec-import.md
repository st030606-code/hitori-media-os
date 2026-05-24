# UI Design Spec Import (docs only)

日付: 2026-05-19

## 背景

前バッチで「モックアップから逆算した design system + phase plan」を `docs/68` / `docs/69` に書いたが、その後 boss から **正式な UI 仕様書** がアップロードされた:

- `/Users/sugawaratakuya/Documents/POTA_Empire/10_Development/sanity-ai-content-os/docs/ui-design/000-dashbord-desing.md`

このアップロード版を **唯一の正式 source** として `docs/68` と `docs/69` を全面書き換え、前バッチの内容は **破棄** する。実装はまだ行わず、docs だけを揃える。

## 決定・変更

実装変更なし。新規 / 更新 docs のみ:

- `docs/ui-design/000-dashbord-desing.md` — boss アップロード（リポジトリに保存済、source of truth）
- `docs/68-hitori-media-os-ui-design-system.md` — **全面書き換え**: uploaded spec を整形 + 既存 repo 互換 notes を追加
- `docs/69-dashboard-ui-redesign-implementation-plan.md` — **全面書き換え**: 仕様準拠の phase plan + 現行 route / component mapping + 互換 notes
- `docs/devlog/0128-ui-design-spec-import.md`（本ファイル）— 旧 0128-ui-design-system-from-generated-mockups.md は削除
- `docs/handoff/0139-ui-design-spec-import.md` — 旧 0139-ui-design-system-from-generated-mockups.md は削除
- `docs/handoff/latest.md`（mirror）

### Uploaded spec の要点

- スタック: Next.js App Router + TypeScript + Tailwind + **shadcn/ui** + **lucide-react** + **Recharts** + Sanity
- 中心概念: **Idea → Structured → Draft → Review → Published** ライフサイクル
- 9 nav: ダッシュボード / キャンペーン / 出力コンフィギュレーター / 出力管理 / 公開管理 / 図解レビュー / ナレッジDB / アナリティクス / 設定
- AppShell grid: 280px sidebar + 64px topbar + max-w-[1440px] main
- Primary: `#2563EB` (Tailwind の `blue-600`)
- Typography: Noto Sans JP + Inter
- Spacing: 8px grid
- 設計判断は §1〜§10 に詳細

### 重要な互換注意

uploaded spec は本リポジトリと 3 点で衝突する:

1. **パッケージ追加禁止 vs shadcn/lucide/Recharts**: 本リポジトリ `CLAUDE.md` 方針で新パッケージ追加には boss 承認が必要。Phase UI-1 開始前に決定
2. **ディレクトリ `src/` vs `dashboard/src/`**: 本リポジトリは monorepo 風で dashboard 配下。docs/69 §7-1 で fl mapping を提示
3. **既存 17 route の動作維持**: spec の新 IA に切り替える際、`/publish-package/[slug]` 等の v0.2 動作を全 phase で保つことを最低条件にした

すべて docs/68 §11 (Current Repo Compatibility Notes) と docs/69 §7 (Current Repo Compatibility Notes) に明記。

### Phase 順序

```
UI-0  docs only         ← 本バッチ
UI-1  AppShell / Sidebar / Topbar replacement
UI-2  Dashboard + Campaign detail
UI-3  Publish Package v0.3 + /publish + /outputs
UI-4  Output Configurator MVP (中核 monetizable)
UI-5  Visual Review 統合
UI-6  Knowledge DB + Analytics
UI-7+ Settings / Multi-user / Theming
```

順序入替可能。boss が Output Configurator (UI-4) を中核機能として優先したい場合は UI-2/3 と前後入替も検討可。

## 理由

- **uploaded spec を唯一の source にした**: 前バッチは「モックアップ画像を見ずに description から書いた逆算 spec」だった。boss の正式アップロード版が出た以上、矛盾する判断（primary color が `sky-600` vs `blue-600`、sidebar 280 vs 240 等）を残すと実装時の意思決定が割れる
- **前バッチの devlog/handoff を削除して書き換え**: 0128 と 0139 の番号は維持しつつ、suffix を `-ui-design-spec-import` に変更して内容を import 中心に。同じ番号が 2 つあると docs 検索時に混乱する
- **パッケージ追加判断を Phase UI-1 開始前に切り出した**: shadcn / lucide / Recharts / Noto は **全部入れる / 段階的に入れる / Tailwind-only fallback** の 3 通りある。docs で「決まっている」と書くと boss の判断機会が失われるので、明示的に「Phase UI-1 開始前に決定」と書いた
- **既存 17 route + 6 placeholder の動作維持を Phase UI-1 の最低条件に**: big-bang リライト禁止、phase ごとに boss review、回帰点を毎 phase 確認できる単位

## 影響

- 実装変更なし、build 結果不変
- boss が「次に何をどの順序で着手するか」を 1 ファイルで読める state に
- 仕様の正式版がリポジトリに固定化された（`docs/ui-design/000-dashbord-desing.md` が source of truth、docs/68 は repo 整合版）
- 前バッチの sky-600 / 240px sidebar / Geist-only 等の判断は **正式に破棄**
- パッケージ判断と route alias 判断が Phase UI-1 開始前の boss 課題として明確化

## 次の一手

1. boss が docs/68 と docs/69 の §11 / §7 の互換 notes を音読し、**Phase UI-1 開始前の 4 決定事項** に回答:
   - shadcn/ui 導入 yes/no
   - lucide-react 導入 yes/no
   - Noto Sans JP + Inter 導入 yes/no
   - `/` を `/dashboard` redirect にするか `/` 自体を dashboard とするか
2. 決定事項を docs/69 §10 (Codex prompt template) に書き込み、Phase UI-1 着手
3. 並行候補（UI と独立）: 24-72h 後の reactionNotes 反映 / Threads 公開判断 / Working Pipeline 1 周完走の振り返り devlog
