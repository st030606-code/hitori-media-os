# Phase UI-2.5: Dashboard Visual Fidelity Pass

日付: 2026-05-19

## 背景

[docs/70](70-dashboard-ui-fidelity-audit.md) で抽出した 5 領域の P0 visual gap を、boss 確定スコープに従って一気に適用するバッチ。`/` Home の見た目だけを reference design に近づける、新 feature は追加しない。

boss 確定:
- P0 1-5 すべて実施
- ReadOnlyBanner: Topbar pill 化
- KPI trend: 「— 前月比」neutral
- Active Campaigns donut: 採用せず、bar を強化
- Engagement: placeholder card
- Dark navy header bg: `bg-slate-900`

## 決定・変更

### 1. Sidebar dark navy header

`dashboard/src/components/app-shell/Sidebar.tsx`:
- 上部 64px の brand block を `bg-slate-900` に変更
- ロゴ `H` バッジを `bg-blue-500 shadow-inner`、ブランド名を `text-white`、tagline を `text-slate-400`
- nav 本体は white のまま
- 結果: reference の dark navy header + light body 2 層構造を再現

### 2. ReadOnlyBanner を Topbar pill 化

- `dashboard/src/components/ReadOnlyBanner.tsx` を **no-op** (`return null`) に変更。既存 page の import を維持して PR の影響を最小化
- `dashboard/src/components/app-shell/ReadOnlyPill.tsx` を新規作成: ShieldAlert icon + 「読み取り専用」label の amber pill (`text-[11px]`)
- `Topbar.tsx` 右側 actions の先頭 (QuickCreate の左) に pill を配置、`hidden sm:inline-flex` でモバイルは非表示
- 結果: 上部の amber banner が消え、`/` の最上段から PageHeader が始まる。dev mode 識別は Topbar pill で常時表示

### 3. KpiCard 強化

`dashboard/src/components/common/KpiCard.tsx`:
- value typography: `text-2xl` → **`text-3xl font-semibold tabular-nums leading-none`**
- icon pill: `h-8 w-8 rounded-md` → `h-9 w-9 rounded-lg`、tone 別 ring 強化 (`bg-blue-100 text-blue-700 ring-blue-200` 等)
- sparkline: 新規 SVG inline、`viewBox="0 0 64 18"` の polyline、tone-correct stroke
- trend: `direction === 'flat' && value === '—'` で「— 前月比」neutral 表示、それ以外は従来通り up/down icon + value + periodLabel
- 結果: KPI card が「ただの数字」から「動きのある指標」に。reference の hero KPI 感に近づく

### 4. LifecyclePipeline 全 stage tone bg

`dashboard/src/components/common/LifecyclePipeline.tsx`:
- 旧: currentStage のみ tone bg、他は `bg-slate-50`
- 新: **5 stage 全てに tone bg + ring**、currentStage は `ring-2 + shadow-sm` で強調 + 右上に「CURRENT」micro chip
- stage icon を `inline-flex h-6 w-6 rounded-md bg-white/70` の浮き上がり pill に変更
- stage 間 chevron を `strokeWidth=2.5` で太く
- 結果: reference の「5 色が並ぶ horizontal pipeline」に視覚的に到達

### 5. ContentOutputConfiguratorCard hero 化

`dashboard/src/components/dashboard/ContentOutputConfiguratorCard.tsx`:
- 全面書き換え:
  - header に `bg-gradient-to-br from-blue-50/60 via-white to-purple-50/40` の subtle hero gradient
  - icon を `h-10 w-10 rounded-lg bg-blue-100` に強化
  - **header 右に「下書きを生成」(`bg-emerald-600`) primary CTA を配置** — Sparkles icon 付き
  - fake select 8 件: `h-10 border-slate-200 bg-white shadow-sm hover:border-slate-300`、ラベル + chevron 整理
  - footer に `bg-slate-50/60` + `text-xs` の補足 + 大型 blue CTA「出力コンフィギュレーターを開く」 (`bg-blue-600 px-4 py-2`)
- 結果: card が「フォーム preview」から「hero CTA」に格上げ、boss が `/configurator` に進む動線が 2 つ (header + footer) に

### 6. ActiveCampaignsCard 強化

`dashboard/src/components/dashboard/ActiveCampaignsCard.tsx`:
- progress bar: 高さを `h-1.5 → h-2`、bar 色を進捗率で 4 tone (`bg-emerald-500 / blue / amber / slate`) 切替
- 進捗率を右側に **chip 形式** (`rounded-full ring-1` + tabular-nums) で配置 — 数値だけ表示よりも視覚密度が上がる
- 各行に **enabled platform の `PlatformBadge` チップ** をインライン表示 (max 6 件 + overflow count)
- header の Rocket icon を `bg-blue-50 text-blue-600` の rounded pill に
- hover state: `hover:bg-slate-50` + 余白 padding を行内に追加

### 7. EngagementPlaceholder 新規作成

`dashboard/src/components/dashboard/EngagementPlaceholder.tsx`:
- 4 metric tile grid (視聴数 / スキ・♥ / 購読・フォロー / 返信・引用) — 値はすべて `—` (`text-slate-300`)
- dashed-border の placeholder chart area
- header に `Phase UI-6` amber chip
- 「Phase UI-6 (Analytics) で `manualPublishingStatus.reactionNotes` から自動集計します」note
- 結果: 右列下に「公開後の手応えはここに来る」明示プレースホルダ

### 8. Home page layout 再構成

`dashboard/src/app/page.tsx`:
- 旧: 2-col grid (左 2/3: Configurator + Lifecycle + Campaigns + Outputs / 右 1/3: Tasks + Insights + ReleaseReviewLinks) + 外部ツール
- 新:
  1. PageHeader (full width)
  2. KpiCardsRow (5 KPI、すべて sparkline + 「— 前月比」neutral trend 付き)
  3. **Upper grid 2-col**: Configurator (lg:col-span-2 = 65%) + TodayTasks (lg:col-span-1 = 35%)
  4. **LifecyclePipeline (full width)**
  5. **Middle row 2-col**: ActiveCampaigns + RecentOutputs
  6. **Lower row 2-col**: LearningInsights + **EngagementPlaceholder**
  7. ReleaseReviewLinks (less prominent、下部)
  8. 外部ツール section
- ReadOnlyBanner の import を削除
- 結果: reference の 4 row × 多 column の dashboard レイアウトに整列

## 理由

- **ReadOnlyBanner を no-op に**: 全 page の import を維持できる。banner を完全削除すると 10+ ファイルから import 削除が必要、PR が膨らむ。`return null` で hop-out しつつ、`/publish` や `/configurator` で write actions が入ったときに「dev/prod 識別」を再活用できる選択肢を残した
- **trend の neutral 表示**: hardcode の placeholder 数値は「捏造」感が出る。`「— 前月比」` で「データ収集中」を明示しつつ、UI に trend slot がある事実は伝える。Phase UI-6 で真値に置換するだけで滑らかに移行できる
- **sparkline は hardcoded placeholder array**: 真の時系列データは UI-6 まで取得できない。SVG inline で軽量、tone-correct のため装飾扱い。boss が「捏造データに見える」と感じた場合は sparkline prop を削除するだけで非表示にできる
- **LifecyclePipeline の "CURRENT" chip**: 旧設計では currentStage だけ tone bg、他は slate。全 stage tone bg に変えると currentStage 識別が弱くなるので、`ring-2 + shadow-sm + chip` で識別を強化
- **ContentOutputConfiguratorCard の CTA を 2 箇所に**: hero 上に primary CTA、footer に open CTA。boss の視線がどちらに行っても `/configurator` に到達できる
- **Donut chart 不採用**: SVG arc 直書きは可能だが、reference 画像でも donut は小さく目立たない。bar 強化（4 tone 切替 + chip 表示）の方が「進捗を一覧で読む」UX には素直
- **EngagementPlaceholder を Phase UI-2.5 範囲に**: 右列下を ReleaseReviewLinks のままにすると「campaign-specific 情報がダッシュボードに混入」して見える。明示プレースホルダで「公開後の手応えはここに来る」を visual に保つ
- **ReleaseReviewLinks を下に移動**: building-hitori-media-os 固有の release-review file リンク。campaign-scoped 情報なので dashboard 上では下部に。完全削除はしない（boss が直接 final-review に辿る導線として有効）

## 影響

- `/` の見た目が大きく reference に寄った
- 23 routes (17 既存 + 6 placeholder) すべて build 通過、`/publish-package/[slug]` v0.2 動作維持
- `/campaigns` / `/campaigns/[slug]` は shared component (KpiCard / LifecyclePipeline) の更新が反映される（tone bg / value sizing が同様に強化）— 別途 fidelity audit は別バッチ
- AppShell の structural grid は無変更
- パッケージ追加なし、schema 変更なし

## 次の一手

1. boss が `cd dashboard && npm run dev` で `/` を実機確認:
   - Sidebar 上部の dark navy header
   - Topbar 右の `読み取り専用` pill
   - 5 KPI card の sparkline + neutral trend
   - LifecyclePipeline の 5 色 tone + CURRENT chip
   - Configurator card の hero gradient + 2 CTA
   - ActiveCampaigns の 4 tone progress bar + platform badges
   - EngagementPlaceholder の dashed chart area
   - Layout が 4 row × 2 col 構造
2. boss feedback で microbatch 修正
3. 違和感なければ次:
   - **Dashboard polish v2** (細部、色味調整、density tweak) — 必要ならば
   - または **Campaign detail fidelity audit** (`/campaigns` / `/campaigns/[slug]`) — boss が reference 画像を出したら
4. Phase UI-3 (Publish Package v0.3 + /publish + /outputs) に着手

並行候補:
- 24-72h 後の reactionNotes 反映バッチ
- Threads 公開判断
- 旧 component (`AppNav` / `WorkingPipelineStatus` / `NextActionChecklist` / `CampaignStatusCard`) の削除 cleanup
