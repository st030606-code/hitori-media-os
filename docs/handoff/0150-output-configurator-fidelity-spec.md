# Handoff: Output Configurator Fidelity Spec (docs only)

Date: 2026-05-19

## 1. Task Goal

Hitori Media OS の **中核 monetizable feature** である `/configurator` (Output Configurator) の fidelity spec を作成。reference (`docs/ui-design/ChatGPT Image 2026年5月19日 13_02_43 (3).png`) と現状 PhasePlaceholder を比較し、Phase UI-fidelity-5 実装可能な仕様 + Phase UI-4 generation 実装の boundary を docs に確定する。実装変更なし。

## 2. Constraints Followed

- ✅ docs-only batch、コード変更なし
- ✅ Sanity schema / 書き込み なし
- ✅ publish-package output / assets/visuals / patches 不変
- ✅ deploy / auto-post なし
- ✅ パッケージ追加なし
- ✅ 23 routes 動作維持
- ✅ generation in this batch なし (本 spec は UI のみ scope)

## 3. Changed Files

新規 (3 docs + 1 mirror):

- `docs/76-output-configurator-fidelity-spec.md` — 12 sections の structure diff + 15 行 component diff + ~45 項目 checklist + P0/P1/P2/P3 + files affected + data sources + generation boundary + 5 boss decision points
- `docs/devlog/0139-output-configurator-fidelity-spec.md`
- `docs/handoff/0150-output-configurator-fidelity-spec.md`（本ファイル）
- `docs/handoff/latest.md`（mirror）

実装ファイルは一切変更なし。

## 4. Summary of Changes

### Page concept (中核 monetizable feature)

`/configurator` は「1 つの構造化された contentIdea を複数媒体の下書きに展開する」生成型 UI。教材 / SaaS 化文脈で boss が「読者にも一番見せたい」画面。

5 route の役割分担明文化:
- `/configurator` — アイデア → 下書き派生 (本 spec)
- `/outputs` — 下書き一覧
- `/publish-package/[slug]` — コピー UI (作業者視点)
- `/publish` — 公開状態 + 監視 (publisher 視点)
- `/campaigns/[slug]` — campaign 詳細 (sourced view)

### Target structure (ideal screenshot より)

```
[Breadcrumb + PageHeader (title + description + 3 actions: リセット / テンプレートとして保存 / 下書きを生成)]
[2-col grid lg:grid-cols-[3fr_2fr]:
  Left (form ~60%):
    ContentIdeaSelectorCard (single select + selected preview)
    PlatformAndOutputTypeCard (multi-select platform + dependent outputType + Purpose)
    ToneAndCtaCard (Tone / CTA / 出力長さ)
    AdvancedOptionsCard (P1: 図解 toggle / レビュー / 参照プロンプト / キーワード)
  Right (preview ~40%):
    GenerationPreviewCard (タイトル候補 3-5 件)
    StructurePreviewCard (序論 / 本論 / 結論 / CTA outline)
    DeliverablesCard (icon grid: text / 図解 / カルーセル / 動画 / 音声 / Reply chain)
    LifecyclePreviewCard (P1, common/LifecyclePipeline 再利用)
    RecommendedTemplatesCard (P1, promptTemplate list)
    RecentOutputsLinkCard (P1, Dashboard RecentOutputsTable 流用)
]
[Bottom action bar (P1 sticky)]
```

### Component diff (15 components)

- **新規 P0 (8)**: ConfiguratorForm / ContentIdeaSelectorCard / PlatformAndOutputTypeCard / ToneAndCtaCard / GenerationPreviewCard / StructurePreviewCard / DeliverablesCard + new GROQ helper
- **新規 P1 (4)**: AdvancedOptionsCard / LifecyclePreviewCard / RecommendedTemplatesCard / RecentOutputsLinkCard
- **新規 P2 (3 files for generation)**: `lib/actions/runConfigurator.ts` / `lib/configurator/promptBuilder.ts` / 任意 `tools/output/run-configurator.mjs`
- **Reuse**: PageHeader / Breadcrumb / StatusBadge / PlatformBadge / LifecyclePipeline / KpiCard

### Data sources (新規 GROQ 1 件)

`dashboard/src/lib/groq/configurator.ts` で `configuratorOptionsQuery`:
- `contentIdea` list (max 100、title + coreThesis + audience + claims count)
- `promptTemplate` list (max 50、category + version + brand + style)
- `brandProfile` list (voice + default platforms)
- `visualStyleProfile` list (title)

Sanity schema 変更なし、既存 doc type を query するだけ。

### Generation boundary (3 phase)

| Phase | scope |
|---|---|
| **UI-fidelity-5** (本 spec の対象) | UI のみ、書き込みなし、disabled placeholder buttons |
| **UI-4 P2** (boss API 連携承認後) | filesystem 出力 + Sanity `platformOutput` write、3 option (Codex CLI / OpenAI API / boss 手動) |
| **UI-7+** | 多媒体同時 / async job / 履歴再生成 |

明示的に scope 外: AI clone voice / multi-user / auto-post (全 phase で除外、CLAUDE.md と整合)

### Implementation order

- **P0**: 10 件 — PhasePlaceholder 削除 + PageHeader + 6 form/preview cards + ConfiguratorForm wrapper + 2-col layout + Sanity fetch
- **P1**: 6 件 — AdvancedOptions / LifecyclePreview / RecommendedTemplates / RecentOutputs / validation summary / sticky action bar
- **P2**: 7 件 — 実 generation 連携 (filesystem / Codex CLI / API / Sanity write / job history)
- **P3**: 5 件 — 多媒体同時 / async / 履歴

## 5. Key Decisions

- **中核 monetizable feature と冒頭明示**: 教材 / SaaS 化文脈での価値中心を docs 上で固定
- **5 route 役割分担を明文化**: /configurator / /outputs / /publish-package / /publish / /campaigns/[slug] の混乱を仕様で防ぐ
- **Generation を 3 phase に切り分け**: UI fidelity と AI 連携を分離、Phase UI-fidelity-5 を visual only で land 可能に
- **新規 GROQ 1 query 集約**: `configuratorOptionsQuery` で 4 doc type を一括 fetch、initial load 最適化
- **AI 連携 3 option (Codex CLI / API / 手動 copy)**: boss が CLAUDE.md 方針との整合を判断する材料を提示
- **5 boss decision points 明示**: shadcn / button 動作 / candidate heuristic / persistence / dataset 投入 — 着手前の判断を 5 件に絞った
- **`platformOutput` schema は既存維持**: schema 変更なしで Phase UI-4 P2 generation 統合可能
- **Form state は client `useState`**: persistence は P2 / P3、まずは visual only

## 6. Human Review Questions

### Phase UI-fidelity-5 着手前の 5 件

1. **shadcn primitive 採用判断**:
   - `Select` / `Checkbox` / `Switch` / `Combobox` を採用するか
   - 全部 / 一部 / 0 件 hand-roll (現状の /outputs FilterBar / CampaignSwitcher と同じ Tailwind-only path)
2. **「下書きを生成」 button**:
   - P0 段階で disabled placeholder のみ
   - 「prompt を copy する」モードのみ
   - P2 で本格生成 (boss API 連携承認後)
3. **Title candidate auto-derive**:
   - heuristic (coreThesis 切り出し)
   - 完全 hardcoded placeholder
   - AI 連携待ち (空欄表示)
4. **Form state persistence**:
   - URL searchParam (bookmarkable)
   - localStorage (boss が同じ browser で続行)
   - なし (リロードで消える、minimum)
5. **PromptTemplate dataset 投入状況**:
   - dataset 確認後、空なら RecommendedTemplatesCard は fallback message
   - boss が「これは事前に投入したい」ならどの templates を投入するか

### 中長期 (Phase UI-4 P2 着手前)

6. **AI 連携の方式**:
   - Codex CLI を server-side で spawn
   - OpenAI / Anthropic API を直接 call (CLAUDE.md と相談)
   - boss 手動 copy → AI ツール (現状継続)
7. **生成結果の Sanity write**:
   - 自動 `platformOutput` 新規作成
   - 手動承認 step (controlled write tool 経由)
8. **Job history の保存先**:
   - Sanity `workflow` doc に紐付ける
   - filesystem JSON
   - なし (将来検討)

## 7. Risks or Uncertainties

- **AI 生成の責任分界**: 自動生成すると「AI 礼賛 / 根拠なし数字」が混入するリスク。CLAUDE.md 「content quality 基準」と整合させるため、Phase UI-4 P2 で生成された draft は **必ず boss レビュー前提** (status `drafted` で保存、`reviewed` に進めるのは boss 手動)
- **`platformOutput` doc が空**: dataset 上 0 件の場合、`/outputs` 同様 `/configurator` の RecentOutputs も empty state。Phase UI-fidelity-5 完了後に dataset 投入判断
- **promptTemplate dataset 投入状況**: ナレッジ DB (Phase UI-6) で本格管理予定だが、Configurator は P0/P1 で使う。空ならフォールバック (empty state) を spec に明記
- **Form の複雑性**: 12+ form fields があり、boss が「過剰」と感じる可能性。AdvancedOptions を P1 にしたのはその吸収余地のため
- **Dashboard ContentOutputConfiguratorCard との重複**: 同じ form を 2 場所に出すと UX 矛盾。/configurator land 後に Dashboard 側を「summary preview + open link」に縮小する microbatch が必要
- **「下書きを生成」 disabled placeholder の boss 体験**: visual のみの configurator で「ボタンが反応しない」失望感が出ないよう、Phase UI-fidelity-5 では「prompt を生成 (preview)」のような行動可能な代替動作も検討する余地

## 8. Recommended Next Step

1. boss が docs/76 を音読、特に:
   - § 0 (Page concept、中核 monetizable)
   - § 4 (Implementation Order P0/P1/P2/P3)
   - § 7 (Generation boundary 3 phase)
   - § 9 (5 Boss Decision Points)
2. 5 boss decision に回答を埋めて **Phase UI-fidelity-5 (Output Configurator 実装)** に着手:
   - handoff §9 の Codex prompt を使用
   - P0 10 components 一括 land
   - shadcn 採用判断を反映
3. Phase UI-fidelity-5 完了後 → 次の選択肢:
   - **Phase UI-4 P2 (実 AI 連携)** に進む (boss API 承認後)
   - **残 4 page spec** (Visual Review / Knowledge / Analytics / Settings) 一括化
   - **24-72h reactionNotes 反映バッチ** (Sanity write、別系統)

並行候補:
- Threads 公開判断
- dead code cleanup (PublishReadinessBoard / NextActionSummary / etc 6 components)
- DataTable 共通抽出 (PublishingMediaTable + PublishingScheduleTable + OutputsTable 3 件から)
- `/publish-package/[slug]` v0.3 (Phase UI-3 server action 経由 URL inline edit)

## 9. Exact Codex Prompt for Phase UI-fidelity-5

```text
Implement Phase UI-fidelity-5: Output Configurator implementation.

References:
- docs/76-output-configurator-fidelity-spec.md (P0/P1 sections, measurable checklist)
- docs/ui-design/ChatGPT Image 2026年5月19日 13_02_43 (3).png (ideal)
- docs/68-hitori-media-os-ui-design-system.md (tokens)
- docs/handoff/0150-output-configurator-fidelity-spec.md (this spec batch context)
- docs/handoff/0149-ui-fidelity-4-publish-management.md (latest design tone)

Hard Rules:
- Do NOT modify Sanity schema.
- Do NOT write to Sanity in this batch.
- Do NOT modify publish-package files.
- Do NOT modify assets/visuals or patches.
- Do NOT deploy.
- Do NOT auto-post.
- Do NOT generate actual AI drafts in this batch (UI only).
- Keep all 23 routes working.
- Keep AppShell / Sidebar / Topbar / WorkspaceBlock intact.
- Keep /publish-package/[slug] v0.2 untouched.
- Keep / Dashboard, /campaigns/[slug], /outputs, /publish (UI-fidelity-1/2/3/4) untouched.
- Reuse design tone established in UI-2.5 → UI-fidelity-4.

Boss-confirmed scope (fill in before running):
- shadcn primitives:
  - Select:   [yes | no]
  - Checkbox: [yes | no]
  - Switch:   [yes | no]
  - Combobox: [yes | no]
  (if no, hand-roll using native <select> / <input type="checkbox"> + Tailwind)
- "下書きを生成" button behavior in this batch:
  - [disabled placeholder | prompt copy preview | AI integration]
- Title candidate auto-derive:
  - [coreThesis heuristic | hardcoded placeholder | empty waiting state]
- Form state persistence:
  - [URL searchParam | localStorage | none (useState only)]
- promptTemplate dataset:
  - [confirmed populated | empty fallback OK | seed before batch]

Package policy:
- Add packages only if shadcn primitive selected:
    npx shadcn@latest add select       (only if yes)
    npx shadcn@latest add checkbox     (only if yes)
    npx shadcn@latest add switch       (only if yes)
- Do NOT add shadcn templates.
- Hand-rolled dropdown / select patterns are available in
  QuickCreateButton.tsx, CampaignSwitcher.tsx, OutputsFilterBar.tsx.

Tasks:

1. New GROQ helper:
   - dashboard/src/lib/groq/configurator.ts
     - configuratorOptionsQuery
     - Types for ContentIdeaOption / PromptTemplateOption / BrandOption / StyleOption

2. New configurator components (P0):
   - dashboard/src/components/configurator/ConfiguratorForm.tsx
       Client wrapper. useState<FormValue>. Passes value/onChange to children.
   - dashboard/src/components/configurator/ContentIdeaSelectorCard.tsx
       Single select + preview (title / coreThesis / audience chips / claims count).
   - dashboard/src/components/configurator/PlatformAndOutputTypeCard.tsx
       Multi-select platform (chips). Dependent outputType select. Purpose select.
   - dashboard/src/components/configurator/ToneAndCtaCard.tsx
       Tone / CTA / 出力長さ selects.
   - dashboard/src/components/configurator/GenerationPreviewCard.tsx
       3-5 title candidates (per chosen auto-derive strategy).
   - dashboard/src/components/configurator/StructurePreviewCard.tsx
       Outline 序論 / 本論 / 結論 / CTA.
   - dashboard/src/components/configurator/DeliverablesCard.tsx
       Icon grid (text / 図解 / カルーセル / 動画 / 音声 / Reply chain).

3. New configurator components (P1, include if boss-confirmed):
   - AdvancedOptionsCard.tsx (図解 toggle / レビュー / 参照プロンプト / キーワード)
   - LifecyclePreviewCard.tsx (wrap common/LifecyclePipeline, currentStage="draft")
   - RecommendedTemplatesCard.tsx (promptTemplate list)
   - RecentOutputsLinkCard.tsx (5 recent OutputRow, reuse Dashboard pattern)

4. Replace dashboard/src/app/configurator/page.tsx:
   - Delete PhasePlaceholder
   - Server Component fetching configuratorOptionsQuery
   - Render PageHeader (breadcrumb + 3 disabled actions)
   - Mount <ConfiguratorForm options={...} /> with all card children

5. Validation summary (P1):
   - Show warning chip in right column if contentIdea / platform / outputType missing

6. Bottom action bar (P1 sticky):
   - 3 buttons (リセット / テンプレートとして保存 / 下書きを生成)
   - All disabled in this batch unless boss selects "prompt copy preview"

Validation:
- cd dashboard && npm run build
- npm run build
- Manual check at /configurator:
  - PageHeader + 3 disabled actions
  - ContentIdeaSelectorCard shows N options
  - Platform chips toggle
  - Tone / CTA / Length selects work
  - GenerationPreviewCard shows N title candidates when contentIdea selected
  - StructurePreviewCard renders outline
  - DeliverablesCard renders icon grid
  - Right column 4 P1 cards (if included)

Docs:
- docs/devlog/<番号>-ui-fidelity-5-output-configurator.md
- docs/handoff/<番号>-ui-fidelity-5-output-configurator.md
- docs/handoff/latest.md (mirror)
```
