# Devlog 0144 — Phase UI-fidelity-7 Visual Review P1 cards

日付: 2026-05-19

## 背景

docs/77 §4-1 (P1) と docs/handoff/0154 §8 で残していた Visual Review の情報層を埋める batch。P0 で layout は揃ったが、rubric / notes / prompt 全文 / file paths / campaign context / consolidated actions が未着手だった。本 batch は **UI のみ** で、書き込みは依然 Visual Register external link 経由。

## 決定・変更

### 新規 helper (1)

- `dashboard/src/lib/visualAssets/inboxLookup.ts`
  - `getLatestInboxCandidate(campaignSlug, assetSlug)` — `v\d{3}\.(png|jpg|jpeg|webp)$` 中で最大番号を選び、relativePath / id / fileName を返す。YAML 解析 / PNG dim 解析なしで cheap
  - `expectedPatchPath(campaignSlug, assetSlug)` — `patches/visual-assets/<campaign>/<asset>.json` を組み立て (existence チェックなし、表示用)
  - `readPromptBody(campaignSlug, assetSlug)` — inbox の prompt.md を生のまま `string` で返す (frontmatter fence ごと、PromptSummaryCard が truncate)
  - slug safety は `^[a-z0-9][a-z0-9-]*$` で inboxReader と同等

### 新規 P1 cards (7)

| File | 用途 |
|---|---|
| `PromptSummaryCard.tsx` | inbox `prompt.md` frontmatter + 本文抜粋 800 字 + 全文 CopyButton |
| `RubricChecklistCard.tsx` | `review.md` の rubricScale / rubricMaxScore / rubricAxes chips / recommendedCandidate / humanDecision / reviewStatus |
| `RubricScoresCard.tsx` | 選択中 candidate の総合点 (色分け) + axes 一覧 + Codex notes。データなしは "—" 表示で値捏造なし |
| `NotesCard.tsx` | candidate.notes + reviewMeta.humanDecision の 2 ソースを統合表示、Phase 2B で writable に |
| `CampaignContextCard.tsx` | sourceCampaign + sourceContentIdea + platform + placement + slugs + coreThesis 抜粋 |
| `FilePathsCard.tsx` | 任意 path 配列を受けて CopyButton 付きで一覧、`FilePathItem.note` で説明 |
| `ActionsCard.tsx` | Visual Register external (primary blue) + 任意の Phase 2B DeferredActionButton 配列 + 推奨 candidate chip |

### CandidateFocusLayout 改修

- 旧: 内部に PromptContextCard ローカル / Visual Register CTA inline / DeferredActionButton 3 つ inline
- 新: `PromptSummaryCard` / `RubricScoresCard` / `NotesCard` / `ActionsCard` で構成、props に `promptBody: string | null` を追加 (page が server-side で読み込み)

### `/visual-assets/[assetId]` 改修

- `Promise.all` で `readAssetCandidates` + `readPromptBody` + `getLatestInboxCandidate` を並列 fetch (enableLocalFsRoutes 時のみ)
- Layout:
  - Left: AssetPreviewCard + PlanMetadataCard + **PromptSummaryCard** (P1 new)
  - Right: **CampaignContextCard** (P1 new) + **RubricChecklistCard** (P1 new) + **FilePathsCard** (9 行: 現在の最終 / 期待される最終 / brief / 公開パッケージ / inbox フォルダ / prompt.md / review.md / 最新候補 / patch JSON) + **ActionsCard** (P1 new)
- inboxFallbackPath は `getLatestInboxCandidate` の結果優先、なければ v001 派生 (production では null → placeholder)

### `/visual-assets/[assetId]/candidates` 改修

- page で `readPromptBody` を並列 fetch、CandidateFocusLayout に `promptBody` props を追加 pass-through
- Layout (CandidateFocusLayout 内):
  - Left: BigPreviewCard + CandidateThumbStrip + **PromptSummaryCard** (P1 new)
  - Right: SelectedCandidateMetaCard + **RubricScoresCard** (P1 new) + **NotesCard** (P1 new) + **ActionsCard** (P1 new) + warnings card

### FilterBar URL sync (`VisualAssetsListView`)

- Page (Server Component) が `searchParams` Promise から `initialFilter` を resolve
- 受け取った値で `useState` 初期化 → SSR と初回 hydration の DOM が一致 (hydration mismatch なし)
- フィルタ変更時に `router.replace(pathname?bucket=...&platform=...&assetType=...&sort=...&q=..., {scroll: false})`
- `bucket` / `platform` / `assetType` / `sort` / `q` (= search) 全 5 軸を URL に反映
- DEFAULT 値は URL に出さず短くする
- 重複 keys / unknown bucket / unknown sort は DEFAULT に fall back

### AssetCard fallback chain 強化

- 旧: final (assets/visuals/) → v001 派生 → placeholder
- 新: final → **server-precomputed latestInboxPath** (最大番号 v00N) → v001 派生 → placeholder
- `AssetCardGrid` が `latestInboxPaths?: Record<string, string>` を受け、AssetCard に分配
- AssetCard 内に「最終 / 最新候補 / v001」のラベル chip を thumbnail 右上に表示
- list page が `enableLocalFsRoutes` 時に全 plan の `getLatestInboxCandidate` を `Promise.all` で並列実行 → `Record<plan._id, relativePath>` を構築

### Sanity / Schema / 外部書き込み / dependencies

すべて **無変更**:
- Sanity schema: 不変
- Sanity write: なし
- packages: lucide-react のみ既存追加なし、shadcn なし
- publish-package / assets/visuals / patches: 不変
- deploy / auto-post: なし
- `/api/asset-thumb` security: P0 で拡張済みの 2-prefix matchedPrefix 設計を維持、本 batch では touch なし

## 理由

- **`promptBody` を server-side で読む**: client component が `fs` を読めない、また`/api/visual-review/candidate-image` のように prompt 専用 endpoint を新設するより、page が 1 度読んで props 渡しの方が round-trip 0 で軽い
- **`readPromptBody` は body 全文を返す**: PromptSummaryCard 側で 800 字 truncate + 全文 CopyButton。truncate ロジックを 1 か所に集中
- **`getLatestInboxCandidate` は YAML 解析なし**: list page で N 件の plan に対して呼ぶので、YAML 解析や PNG dim 解析のコストは避けたい (readAssetCandidates は重い)
- **slug safety + 既存 prefix lock 再利用**: inboxLookup.ts は `repoPath` 経由でしかパスを組み立てない、`^[a-z0-9][a-z0-9-]*$` で slug を弾く。inboxReader.ts と同じ contract を踏襲
- **`RubricScoresCard` で score を捏造しない**: per-axis スコアは現 schema にないので "—" を表示。総合点 (candidate.score) は review.md にあれば表示、なければ "—" + color slate
- **`ActionsCard` props 設計**: detail page と candidates page で labels が違うので、`deferred: DeferredAction[]` + `visualRegisterLabel` + `helperText` で再利用
- **FilterBar URL sync の "初期は server / 以降は client" 方式**: SSR で `initialFilter` から filtered grid を render、useState 初期値も同じ → 初回 hydration で同じ DOM ツリー。`useEffect` で URL replace するので scroll を奪わない (`scroll: false`)
- **AssetCard fallback の thumbnail chip**: どの source の画像かを 1 視野で boss に伝える。色は subtle に (slate-700 / 白半透明)

## 影響

- **23 routes 動作維持**、dashboard TypeScript clean、Sanity Studio 7.6s clean
- `/visual-assets` の URL が `?bucket=approved&sort=platform&q=hero` 等で shareable に
- AssetCard で「最終 / 最新候補 / v001」ラベルが thumbnail に表示
- detail page で inbox prompt.md / review.md があれば PromptSummary / Rubric / Notes が埋まる、なければ各 card で graceful empty state
- candidates page で右側 stack に rubric / notes / actions が並ぶ
- `/configurator`, `/publish`, `/outputs`, `/campaigns/[slug]`, `/publish-package/[slug]`, `/` は touch なし (shared common components: PageHeader / KpiCard / PlatformBadge / StatusBadge / CopyButton のみ reuse)

## 次の一手

1. **boss が `cd dashboard && npm run dev` で 3 route 実機確認**:
   - `/visual-assets?bucket=approved` → 初回 render で approved bucket がアクティブ、URL リロードで状態保持
   - `/visual-assets/visualAssetPlan.building-hitori-media-os.x-hook-main-v1` → 右列に Campaign / Rubric / FilePaths / Actions が並ぶ
   - `/visual-assets/visualAssetPlan.building-hitori-media-os.x-hook-main-v1/candidates` → 右列に Meta / RubricScores / Notes / Actions
   - PromptSummary の collapsible で本文抜粋を確認、CopyButton で全文 clipboard
   - AssetCard の thumbnail label chip が文脈 (最終 / 最新候補 / v001) を示すか
2. 違和感あれば microbatch
3. 次の選択肢:
   - **Dead code cleanup batch** (旧 VisualAssetHeader / CandidateGrid / CandidateCard / CandidatePreview / CandidateStatusBadge / SummaryCard / SectionHeader / EmptyState / FilePathBlock / AppNav 等を一括削除)
   - **`/analytics`, `/knowledge`, `/settings` fidelity spec** (残り fidelity 系)
   - **Phase 2B 実 write 議論** (Approve & register / Regenerate prompt / Sanity controlled atomic write)

## 発信ネタ候補

- 「URL sync 設計の "初期は server / 以降は client"」: hydration mismatch を避けつつ、フィルタ状態を shareable にする方法
- 「review console の右列構成」: SelectedMeta → RubricScores → Notes → Actions の順は人間判断の流れと一致する話
- 「fallback chain にラベルを付ける」: thumbnail にどのソースから来た画像かを示すと、boss の確認が一歩速くなる
