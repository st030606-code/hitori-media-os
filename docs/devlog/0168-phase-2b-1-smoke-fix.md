# Phase 2B-1 smoke fix — undo toast lifetime + topbar write-mode indicator

日付: 2026-05-20

## 背景

handoff/0178 で Phase 2B-1 reactionNotes write を実装。boss が手元で実 write を流して smoke test した結果、機能本体は OK だったが UX bug が 2 件出た:

1. **Undo toast が click 前に消える**: 「保存しました — 元に戻す」 button が 10 秒間表示されるはずが、実際は瞬時に消える
2. **Topbar の「読み取り専用」 indicator**: local で `ENABLE_WRITE_ACTIONS=true` + `SANITY_WRITE_TOKEN` 設定済でも「読み取り専用」のまま、boss が「flag 効いてないのでは」と混乱する

加えて smoke test の副産物として: boss が一度「`ture`」(typo) を `ENABLE_WRITE_ACTIONS` に設定して「`true` に戻しても編集不可」と感じた件は user input typo の確認、コード fix 不要。

## 決定・変更

### Root cause of undo bug

`<ReactionNoteEditor>` が `<ReactionNotesCard>` or `<PendingMonitoringCard>` の row 内 `<li>` に置かれており、保存成功 → `router.refresh()` → サーバ再 fetch で row が **filled list と pending list の間を移動** すると、元 `<li>` ごと unmount されて `<ReactionNoteEditor>` も死ぬ。setTimeout は cleanup されるが、toast を render する component も unmount しているので即座に消える。

特に「pending row の reactionNotes を埋めた」ケースで顕著: 保存後その row は 24h+ かつ reactionNotes 未記入条件を満たさなくなる → PendingMonitoringCard から消える → ReactionNotesCard に出現する → 旧 li unmount。

### 修正方針

undo toast の **state owner を row より外** に持ち上げる。row 移動で unmount しない stable parent (analytics ページ列レベル) に置く。

### 新規ファイル (1)

- `dashboard/src/components/analytics/AnalyticsToastHost.tsx` — client wrapper、React Context で `notifySaved(...)` 提供、`useState` + `useRef` で toast 状態と 10 秒 timer を保持、`position: fixed` で bottom-right に floating toast を render

### 更新ファイル (4)

- `dashboard/src/components/analytics/ReactionNoteEditor.tsx` — local toast state 削除、`status: 'saved'` を削除、保存成功時は `useUndoToast().notifySaved({...})` を呼んで read mode に collapse、undo button の render は host 側に移譲
- `dashboard/src/app/analytics/page.tsx` — 右列の `<ReactionNotesCard>` + `<PendingMonitoringCard>` を `<AnalyticsToastHost>` で wrap
- `dashboard/src/components/app-shell/ReadOnlyPill.tsx` — `writeReady` prop を受け、true なら blue 「ローカル書き込み有効」 + Pencil icon、false なら従来の amber 「読み取り専用」 + ShieldAlert icon
- `dashboard/src/components/app-shell/Topbar.tsx` — `writeReady` prop を受けて `<ReadOnlyPill>` に forward
- `dashboard/src/components/app-shell/AppShell.tsx` — `enableWriteActions && Boolean(process.env.SANITY_WRITE_TOKEN)` を **server-side** で評価して `<Topbar>` に boolean だけ渡す (token 値は client に絶対漏らさない)

## 理由

### なぜ Context + 単独 host にしたか

Option A (検討) — toast を `analytics/page.tsx` の Server Component 内に直接書く: 不可。`useState` + `setTimeout` は client 専用。

Option B (検討) — toast state を grand-parent client component に置いてカードに `setToast` を prop drilling: 動くが、cards 自身を client 化する必要があり、cards が現状 Server Component (静的 markup) でいる利点が消える。

Option C (採用) — Provider/Consumer pattern (React Context): `<AnalyticsToastHost>` は client、children は Server Component のまま (両方が混ざる Next.js の標準パターン)。editor だけが Context を消費する。

### なぜ topbar pill を全 page 共通にしたか

write が有効なのは `/analytics` だけだが、boss が「今 write mode に居る」 のは **session-wide** な事実。`/settings` 等の他 page を回遊している最中も同じ pill が見えると安心 (= 「local 環境で開発中」と一目で分かる)。production deploy には永遠に出ない indicator なので prod の UI 汚染ゼロ。

### なぜ topbar に "ローカル書き込み有効" と書いたか

候補:
- 「編集モード」 — 短い、しかし「何の編集?」が曖昧
- 「書き込み有効」 — production も有効に見える危険
- 「ローカル書き込み有効」 (採用) — production deploy では絶対に出ない、local-only の明示、boss が安心

tooltip 補足: 「ローカル環境で Phase 2B-1 write actions が有効です。Vercel 上では常に読み取り専用のままです。」

### なぜ icon を Pencil に変えたか

ShieldAlert (amber) は「危険」感、Pencil (blue) は「編集可能」感。色も切り替えて視認性を高めた。

## 影響

- リポジトリ:
  - dashboard runtime: 1 新規 + 4 更新 = 5 ファイル変更
  - docs: devlog 0168 + handoff 0179 + latest.md mirror
  - その他 (`schemas/` / `tools/` / `publish-package/` / `assets/visuals/` / `patches/` / `package.json`): touch なし
- ワークフロー:
  - boss は再 `npm run dev` で smoke test → undo toast が 10 秒間表示・click 可能、topbar が状況を反映
- スキーマ: 不変
- プロダクト方針:
  - 「server component を保ちつつ client surface に hook を inject する」 pattern を 1 件 establish (`Provider` + `useContext`)
  - 同 pattern は Phase 2B-2 (W5 gate state) の confirm modal / undo にも転用可

## Build 結果

- `cd dashboard && npm run build`: 23 routes すべて green、TypeScript clean
- `npm run build` (Sanity Studio): clean
- `.next/static/` の token audit: env var **名** の i18n string のみ (`SANITY_WRITE_TOKEN が設定されていません` / `SANITY_WRITE_TOKEN 設定時のみ`)、token **値** は出ない

`process.env.SANITY_WRITE_TOKEN` の参照は server 側 3 か所のみ:
- `lib/actions/sanityWriteClient.ts:29` — actual token 読み出し
- `app/analytics/page.tsx:252` — `Boolean(...)` で boolean 化
- `components/app-shell/AppShell.tsx:21` — `Boolean(...)` で boolean 化 (topbar pill 用)

## 次の一手

**Option A (推奨) — Re-test smoke checklist on localhost**

boss が再度 `.env.local` の Phase 2B-1 設定で `npm run dev` し、以下を確認:

1. Topbar が「ローカル書き込み有効」 + 青 Pencil icon
2. `/analytics` 上で `<ReactionNotesCard>` row の「編集」 → 編集 → 保存 → 編集 UI が即 collapse + undo toast が **右下に 10 秒間** 出る + click 可能
3. `<PendingMonitoringCard>` row の inline editor → 保存 → row が ReactionNotesCard に移動した後も undo toast が消えずに残る
4. 10 秒以内に「元に戻す」 click → 旧値に restore + toast 消える + 「ローカル書き込み有効」 indicator はそのまま
5. `ENABLE_WRITE_ACTIONS=false` で再起動 → topbar が amber 「読み取り専用」 + 編集 button が disabled
6. `SANITY_WRITE_TOKEN` 削除で再起動 → 同上
7. server stdout で token / 本文が出ていないことを confirm

**Option B — Phase 2B-2 spec batch (W5 humanReviewGate state)**

Smoke test OK 確認後、`<AnalyticsToastHost>` の Context pattern を W5 の dropdown UI + undo に転用。

**Option C — Topbar pill polish microbatch**

「ローカル書き込み有効」 のラベルが長いと感じた場合、もう少し短くする ("local-write" 等英語化 or icon-only 化) microbatch。

発信ネタ案: 「server component + client context のハイブリッド設計 — undo toast を row unmount から守る話」「Topbar indicator を 1 色変えるだけで boss の "今どの mode に居る?" 疑問が消えた」「smoke test で出るのは "機能 bug" より "状態認識 bug" — UX の認知層」
