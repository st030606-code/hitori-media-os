# Handoff: UI Design Spec Import (docs only)

Date: 2026-05-19

## 1. Task Goal

boss がアップロードした UI 仕様書（`docs/ui-design/000-dashbord-desing.md`）を正式リポジトリ docs に import し、現行 dashboard 構造に合わせた段階的リデザイン計画を確立する。実装変更はせず、boss が Phase UI-1 着手前の判断材料を揃える。

## 2. Constraints Followed

- ✅ dashboard runtime code 変更なし
- ✅ Sanity schema 変更なし、Sanity 書き込みなし
- ✅ publish-package output / assets/visuals / patches 不変
- ✅ deploy / auto-post なし
- ✅ パッケージ追加なし
- ✅ 新規画像生成なし
- ✅ docs only
- ✅ 既存 17 route そのまま

## 3. Changed Files

新規 / 更新:

- `docs/68-hitori-media-os-ui-design-system.md` — uploaded spec を repo 整合版に整形（前バッチ内容は破棄）
- `docs/69-dashboard-ui-redesign-implementation-plan.md` — 仕様準拠 phase plan + 現行 route/component mapping + 互換 notes（前バッチ内容は破棄）
- `docs/devlog/0128-ui-design-spec-import.md`（新規）
- `docs/handoff/0139-ui-design-spec-import.md`（本ファイル、新規）
- `docs/handoff/latest.md`（本ファイルをミラー）

削除:

- `docs/devlog/0128-ui-design-system-from-generated-mockups.md`（前バッチで作成、超過のため削除）
- `docs/handoff/0139-ui-design-system-from-generated-mockups.md`（同上）

実装ファイルは一切変更なし。

## 4. Summary of Changes

### docs/68 — Design System

uploaded spec を 12 章構成に整形:

1. Product UI Concept (Idea→Structured→Draft→Review→Published)
2. App Shell (280px sidebar + 64px topbar + max-w-[1440px])
3. Dashboard 9 セクション
4. Publish Package / 公開管理 (7 sub-component)
5. Output Configurator (9 sub-form)
6. Visual Review (6 sub-component)
7. Design Tokens (色 / 文字 / spacing / radius / shadow / border / icon / badge / button)
8. 共通型定義
9. 実装ディレクトリ案 (`src/...` 想定、本リポジトリでは `dashboard/src/...` に adapt)
10. 実装優先順位
11. **Current Repo Compatibility Notes**（新規追加）
12. **Productization Notes**（新規追加）

「Appendix A — Diff vs Previous Iteration」で前バッチ判断との差分を明示（primary color, sidebar 幅, font, icon library 等の上書き）。

### docs/69 — Implementation Plan

10 章構成:

1. Current route inventory（11 route）
2. Target route inventory（12 route + alias）
3. Current → New route mapping
4. Current → New component mapping（13 既存 + 30+ 新規）
5. Phased Implementation Plan (UI-0 〜 UI-7+)
6. Phase sequencing summary
7. **Current Repo Compatibility Notes**（ディレクトリ adaptation / 既存 route 保護 / shadcn 判断 / Tailwind-only / Sanity スキーマ吸収 / Phase UI-1 開始前の 4 決定事項）
8. Productization Notes
9. Out of Scope
10. **Exact Codex Prompt for Phase UI-1**（boss が承認 / 否認したパッケージを埋めて渡す形）

### Key decision: パッケージ追加は Phase UI-1 開始前 boss 決定

uploaded spec は `shadcn/ui` + `lucide-react` + `Recharts` + `Noto Sans JP` を前提とするが、本リポジトリ `CLAUDE.md` は新パッケージ追加に boss 承認を求める。docs では 3 通りのシナリオを明記:

- **全部入れる**: モックアップに最も近い見た目、実装工数最小
- **段階的に入れる**: shadcn のみ先に入れて lucide / Recharts は後段
- **Tailwind-only fallback**: パッケージ追加なしで同等の見た目を手書きで再現（実装工数増、現在の v0.2 方針継続）

Phase UI-1 開始前に boss が選ぶ。

### 既存 component 保護方針

13 既存 component (AppNav / CopyButton / publishPackageReader / StatusBadge / etc.) について、各々の移行先と移行方針（**そのまま継続** / **fallback として再利用** / **deprecate but keep file**）を表で明記。`<CopyButton>` の navigator.clipboard + textarea fallback 設計は移行先でも維持。

## 5. Key Decisions

- **Uploaded spec を唯一の source of truth に**: 前バッチの逆算 spec は破棄、判断の二重化を防ぐ
- **前バッチの devlog/handoff を削除**: 同番号で 2 つの docs を残すと検索 / 比較時に混乱
- **shadcn / lucide / Recharts / font は boss 決定保留**: docs では「Phase UI-1 開始前に決定」と明示、勝手に「入れる前提」「入れない前提」と書かない
- **Phase UI-1 から段階的着手**: big-bang リライト禁止、既存 17 route 動作維持を全 phase の最低条件
- **`/publish-package/[slug]` v0.2 を UI-3 で in-place upgrade**: 既存の copy UI / publish state badges は機能維持しつつ `<ManualPublishCopyPanel>` に拡張
- **Output Configurator (UI-4) を中核 monetizable feature と明記**: boss が phase 順序を考えるときの判断材料、UI-2/3 と前後入替も可
- **route param 名は `[slug]` のまま**: spec の `[id]` は内部表現、URL は既存 `[slug]` を保護（既存リンクが壊れない）

## 6. Human Review Questions

Phase UI-1 開始前に決定が必要:

1. **shadcn/ui 導入 yes/no** — モックアップに最も近い見た目だが、初パッケージ追加。CLAUDE.md の "API 連携を追加しない" は LLM API のみ対象、UI ライブラリは別議論
2. **lucide-react 導入 yes/no** — 仕様では Sidebar 全 nav item に icon を期待。fallback は Unicode + emoji + 手書き SVG
3. **Noto Sans JP + Inter 導入 yes/no** — `next/font/google` で読込、パッケージ追加不要だが Web font 読込が新規発生
4. **`/` を `/dashboard` redirect にするか** — spec は `/dashboard` 想定。`/` を維持して内部的に dashboard、`/dashboard` を alias とする案もあり
5. Phase 順序の入替 — Output Configurator (UI-4) を UI-2/3 より先に試したいか
6. `/publish-package/[slug]` v0.3 で URL / reactionNotes inline edit を入れる方針で良いか（server action 経由 controlled write tool wrapper として実装）

## 7. Risks or Uncertainties

- **Uploaded spec の前提パッケージが本リポジトリと衝突**: shadcn / lucide / Recharts / Noto を boss が承認しない場合、実装工数が増える。fallback プランを書いたが、見た目は本物の shadcn 採用版とは少し異なる
- **既存 17 route + 6 新 placeholder route の全動作維持**: Phase UI-1 の AppShell 置換時、各ページの top-level layout 仮定が壊れないか毎回確認必要
- **Sanity スキーマと UI enum の不一致**: `ManualPublishStatus.copied` / `needs_fix` 等は Sanity に該当 field なし、UI 内のみで保持する必要。helper 関数の責任範囲を Phase UI-3 で明確化
- **Output Configurator MVP の actual generation**: 仕様の `onGenerate` は AI 生成を想定するが、CLAUDE.md 方針で LLM API は scope 外。boss が "API なしで進める" を堅持するなら placeholder のままに（prompt 組み立て → コピー → 別ツール経由）

## 8. Recommended Next Step

1. boss が docs/68 §11 と docs/69 §7-7 の **Phase UI-1 開始前の 4 決定事項** を読み、回答
2. 決定事項を docs/69 §10 の Codex prompt template の `[yes | no]` に埋め、Phase UI-1 着手 prompt を完成させる
3. **Phase UI-1 着手**:
   - 新規 component: AppShell / Sidebar / Topbar / WorkspaceBlock / QuickCreateButton / UserMenu
   - 新規 placeholder route: `/configurator` / `/outputs` / `/publish` / `/knowledge` / `/analytics` / `/settings`
   - Tailwind config 最小拡張（spacing.70 等）
   - 既存 `<AppNav>` を deprecate（削除せず）
   - 既存 17 route の動作確認

並行候補（UI と独立）:
- 24-72 時間後の reactionNotes 反映バッチ
- Threads 公開判断
- Working Pipeline 1 周完走の振り返り devlog

## 9. Exact Prompt for Codex (Phase UI-1)

docs/69 §10 にテンプレ作成済。boss 4 決定事項を埋めて使う。

```text
Implement dashboard Phase UI-1: AppShell / Sidebar / Topbar replacement.

References:
- docs/68-hitori-media-os-ui-design-system.md (sections 1, 6, 11)
- docs/69-dashboard-ui-redesign-implementation-plan.md (phase UI-1 task list)

Hard Rules:
- Do NOT modify Sanity schema.
- Do NOT write to Sanity.
- Do NOT modify publish-package files.
- Do NOT modify assets/visuals or patches.
- Do NOT deploy.
- Keep all existing 17 routes working.
- Do NOT touch page body content; only swap the shell.
- Package additions require explicit boss approval before this batch
  starts. If denied, fall back to Tailwind-only + Unicode + emoji + local SVG.

Boss-approved packages for this phase (fill in before running):
- shadcn/ui:       [yes | no]
- lucide-react:    [yes | no]
- Noto Sans JP:    [yes | no]
- Inter:           [yes | no]

[残りのタスク詳細は docs/69 §10 参照]
```

完成した prompt を boss が承認すれば Phase UI-1 実装に進む。
