# Handoff: Phase UI-fidelity-5 Output Configurator

Date: 2026-05-19

## 1. Task Goal

`/configurator` を docs/76 (Output Configurator Fidelity Spec) 準拠で **UI のみ** 本実装する。Phase UI-fidelity-1〜4 で確立した design tone（5 page 揃い）に整合させ、native HTML + Tailwind のみで hand-roll。実 AI 連携 / FS 書き込み / Sanity 書き込みは scope 外、boss は「プロンプトを ChatGPT / Codex CLI に手動で貼り付け」運用を継続。

## 2. Constraints Followed

- ✅ Sanity 書き込みなし / schema 変更なし
- ✅ publish-package / assets/visuals / patches 不変
- ✅ deploy / auto-post なし
- ✅ パッケージ追加なし（shadcn primitives 全断り、lucide-react は既存）
- ✅ 23 routes 動作維持（dashboard build green）
- ✅ Sanity Studio 7.6s clean
- ✅ AppShell / Sidebar / Topbar structural 無変更
- ✅ `/publish-package/[slug]` v0.2 / `/campaigns/[slug]` / `/outputs` / `/publish` / `/` 既存実装に touch なし
- ✅ OpenAI / Anthropic API client 追加なし（CLAUDE.md 整合）
- ✅ auto-generation / auto-posting なし

## 3. Changed Files

### 新規 (14)

- `dashboard/src/lib/groq/configurator.ts` — `configuratorOptionsQuery` + 4 types (`ContentIdeaOption` / `PromptTemplateOption` / `BrandOption` / `StyleOption`) + `ConfiguratorOptions` wrapper
- `dashboard/src/lib/configurator/options.ts` — `FormValue` 型 + `DEFAULT_FORM_VALUE` + 7 enum sets (PLATFORM / OUTPUT_TYPE / PURPOSE / TONE / CTA / LENGTH / REVIEW_LEVEL) + `RECOMMENDED_OUTPUT_TYPE_BY_PLATFORM`
- `dashboard/src/lib/configurator/promptBuilder.ts` — `buildTitleCandidates(thesis, outputType, tone)` + `buildPrompt({form, contentIdea, promptTemplate})`（純粋関数、AI 呼び出しなし）
- `dashboard/src/components/configurator/ContentIdeaSelectorCard.tsx` — single select + selected preview（title / slug / coreThesis / audience chips / audiencePain / 3 stat tiles）
- `dashboard/src/components/configurator/PlatformAndOutputTypeCard.tsx` — 8 platform chips（multi-select toggle）+ outputType select（★ で推奨表示）+ purpose select
- `dashboard/src/components/configurator/ToneAndCtaCard.tsx` — 3 select（tone / cta / length）
- `dashboard/src/components/configurator/AdvancedOptionsCard.tsx` — 図解 toggle / reviewLevel select / promptTemplate select / キーワード input（comma 区切り → chips）
- `dashboard/src/components/configurator/GenerationPreviewCard.tsx` — `buildTitleCandidates` の 5 件を numbered list で表示
- `dashboard/src/components/configurator/StructurePreviewCard.tsx` — 4 section（序論 / 本論 / 結論 / CTA）を tone bg で
- `dashboard/src/components/configurator/DeliverablesCard.tsx` — 6 icon grid（active 条件で opacity 切り替え）
- `dashboard/src/components/configurator/LifecyclePreviewCard.tsx` — common `LifecyclePipeline` ラッパー（currentStage=`draft`）
- `dashboard/src/components/configurator/RecommendedTemplatesCard.tsx` — promptTemplate 5 行（採用ボタン）+ empty fallback
- `dashboard/src/components/configurator/RecentOutputsLinkCard.tsx` — 直近 5 件の OutputRow を compact 表示
- `dashboard/src/components/configurator/ConfiguratorForm.tsx` — client wrapper、useState、2-col grid、底部に sticky action bar + プロンプトプレビュー（`<pre>` + `<CopyButton>`）

### 更新 (1)

- `dashboard/src/app/configurator/page.tsx` — PhasePlaceholder 削除、Server Component で 3 query 並列 fetch → `<ConfiguratorForm>` に props

### 新規 docs

- `docs/devlog/0140-ui-fidelity-5-output-configurator.md`
- `docs/handoff/0151-ui-fidelity-5-output-configurator.md`（本ファイル）
- `docs/handoff/latest.md`（mirror）

## 4. Summary of Changes

### Page structure (実装後)

```
[PageHeader: Breadcrumb + Title「出力コンフィギュレーター」+ description]
[ConfiguratorForm (client):
  2-col grid (lg:grid-cols-[3fr_2fr]):
    Left (form):
      - ContentIdeaSelectorCard
      - PlatformAndOutputTypeCard
      - ToneAndCtaCard
      - AdvancedOptionsCard (P1)
    Right (preview):
      - GenerationPreviewCard (title candidates)
      - StructurePreviewCard (4 section outline)
      - DeliverablesCard (6 icon grid)
      - LifecyclePreviewCard (P1, LifecyclePipeline 再利用)
      - RecommendedTemplatesCard (P1)
      - RecentOutputsLinkCard (P1)
  プロンプトプレビュー section (full width):
    <pre> with prompt text + CopyButton tone=primary
  Bottom sticky action bar:
    リセット / テンプレートとして保存 (disabled) / 下書きを生成 (= プロンプトコピー)
]
```

### Boss-confirmed scope

| 項目 | 決定 | 実装方法 |
|---|---|---|
| shadcn Select | NO | native `<select>` (h-10) |
| shadcn Checkbox | NO | native `<input type="checkbox">` |
| shadcn Switch | NO | native checkbox（toggle 視覚は P3） |
| shadcn Combobox | NO | native `<select>`（typeahead 検索は P3） |
| 「下書きを生成」 button | prompt copy preview | `<CopyButton text={prompt} tone="primary" />` |
| Title candidate 派生 | coreThesis heuristic | `buildTitleCandidates` 純粋関数（5 パターン） |
| Form state persistence | none, useState | リロードで消える、URL sync は P2 |
| promptTemplate dataset | 空 fallback OK | RecommendedTemplatesCard に empty state、AdvancedOptionsCard の select は disabled |

### 5-page tone consistency 検証

| 項目 | / | /campaigns/[slug] | /outputs | /publish-package/[slug] | /publish | /configurator | 結果 |
|---|---|---|---|---|---|---|---|
| max-w | `1280px` | 同 | 同 | 同 | 同 | 同 | ✓ |
| section gap | `gap-5` | 同 | 同 | 同 | 同 | 同 | ✓ |
| card | `rounded-lg border-slate-200 bg-white p-5 shadow-sm` | 同 | 同 | 同 | 同 | 同 | ✓ |
| heading | `text-base font-semibold text-slate-900` | 同 | 同 | 同 | 同 | 同 | ✓ |
| icon pill | h-7 w-7 + tone bg + ring | 同 | 同 | 同 | 同 | 同 | ✓ |
| select | h-10（FilterBar は h-9） | — | h-9 | — | — | h-10 | 微差（form は h-10 で揃え） |

### Build result

```
dashboard:
  ✓ TypeScript clean
  ✓ 23 routes (unchanged)

Sanity Studio:
  ✓ build (7651ms) clean
```

## 5. Key Decisions

- **shadcn 全 NO**: boss 確定。dependency 追加を避け、hand-roll で 5 page tone consistency を維持。Native `<select>` でも UI fidelity は十分（FilterBar / Configurator FakeSelect で既に証明済み）
- **下書きを生成 = prompt copy**: 実 AI 呼び出しは Phase UI-4 P2 議論待ち。中間としては「組み立てたプロンプトを `<pre>` で見せて、クリックで clipboard」が最速で boss の手動運用と接続する
- **coreThesis heuristic 5 パターン**: 生 / 出力形式冠 / 実践記 or 教材ベース / 疑問形 / 逆張り。完全 hardcoded だと preview の意味がなく、AI 連携も scope 外。中間としてちゃんと変化する preview を確保
- **useState のみ**: URL searchParam だと shareability あるが state が増える。MVP は state リセットを「リセット」ボタンで明示、リロードで消えるのも数十秒で再入力可能なので許容
- **キーワード input**: native `<input>` + `defaultValue` で初期表示、`onChange` で parse → `string[]`。chips 表示は visual feedback のみ
- **「テンプレートとして保存」 disabled**: Phase UI-fidelity-6 以降で実装。先に Visual Review fidelity に進む選択肢を残す
- **底部 sticky action bar**: long scroll の preview 側で「保存 / コピー」が常に画面下に見えるよう `sticky bottom-0` で固定。`-mx-*` で page padding を相殺
- **3 query 並列 fetch**: `Promise.all([fetchOptions(), fetchOutputs(), fetchHome()])` で TTFB 影響最小化。lifecycle 数字を dashboardHomeQuery から流用（重複なし）
- **ContentOutputConfiguratorCard (Dashboard) は untouched**: 本実装と整合させる cleanup は Phase UI-fidelity-6 で。今 batch は configurator 本体に集中
- **`PromptTemplate` 空対応**: dataset 投入は boss 担当のため、UI 側は empty state + disabled select で graceful degradation

## 6. Human Review Questions

1. **「下書きを生成」ボタンが prompt copy なのは boss の運用と合致するか?** → Codex CLI が動かない時の fallback として、ChatGPT に貼り付けて生成する流れは想定通りか
2. **title candidate 5 パターンの品質**: coreThesis を「ひとり運営は朝の 30 分で構造化〜」みたいに長文で入れると「実践記: 〜〜〜」が冗長になる可能性。短縮 heuristic を追加するか
3. **AdvancedOptionsCard の chip 表示**: キーワードを入力して chip が下に並ぶ視覚 feedback、過剰でないか
4. **promptTemplate dataset 投入タイミング**: 投入後に RecommendedTemplatesCard が動くが、今は空 fallback。boss が dataset 投入後に screenshot 共有してもらえると polish しやすい
5. **底部 sticky action bar**: long page で常に見えるが、scroll しない短い state だと「リセット」が他 button と重なる。layout 違和感ないか
6. **shadcn 全 NO 判断**: 今後 Combobox が欲しくなる場面（contentIdea が 100 件超えで native select が辛い）に再検討するか、それとも引き続き hand-roll で押し切るか

## 7. Risks or Uncertainties

- **大量 contentIdea 時の native select UX**: 100 件超でも scrollable native select で対応可能だが、検索 typeahead がほしくなる可能性。Phase UI-7+ で `<Combobox>` 候補
- **prompt copy preview の長さ**: `<pre>` 内で 1000 行近くになるケース（contentIdea の audiencePain が 30 件等）。max-h-[420px] + overflow-auto で抑えているが、boss の dataset 状況次第で再調整
- **useState 揮発性**: 「あれ、reload で消えた」体感が boss にあれば、Phase UI-fidelity-6 で URL searchParam sync を入れる
- **「下書きを生成」label に括弧で「プロンプトをコピー」**: 二重表現で長い。Phase UI-4 P2 で実 generation 入った時に label 再考
- **Sticky action bar が backdrop-blur で薄い**: brightness が高い背景の上で見づらい可能性。boss が違和感感じれば solid 化
- **LifecyclePreviewCard の数値表示**: Home のと完全に同じ source（dashboardHomeQuery）で同期。`/configurator` を開いて「ここで作る draft は left/right どっち」が直感的に分かる位置か、boss feedback ほしい
- **DeliverablesCard の active 条件**: `isShortPost = outputType === 'short-post' || platforms.includes('x') || platforms.includes('threads')` のように OR で多めに active 化している。boss が「Threads 選んだだけで動画台本も active になる」と違和感感じれば AND 化

## 8. Recommended Next Step

1. **boss が `cd dashboard && npm run dev` で実機確認**:
   - `/configurator` を開く → 全 card が並ぶ
   - contentIdea を選ぶ → 右側のタイトル候補・構造プレビュー・成果物・lifecycle・直近の出力が連動
   - platform chip を 1-2 個 toggle → outputType に ★（推奨）が付くことを確認
   - 「プロンプトをコピー」ボタン → 必要条件揃ったら enable、クリックで clipboard
   - リセット → state 戻る
   - Sidebar の「出力コンフィギュレーター」が active highlight
2. 違和感あれば microbatch（layout / wording / tone）
3. なければ次の選択肢:
   - **Visual Review fidelity spec**（`13_02_43 (6).png` → docs/77、audit-only 1 batch）
   - **Dashboard `ContentOutputConfiguratorCard` cleanup**（Phase UI-fidelity-6、本実装と整合 or 「最後の state を表示」化）
   - **promptTemplate dataset 投入**（boss 担当 1 件で十分）
   - **Phase UI-4 P2（実 generation）議論** 開始: AI 連携方針 / Sanity write 方針 / FS 出力規則

並行候補:
- 24-72h 後の reactionNotes 反映バッチ
- Threads 公開判断
- dead code cleanup（PublishReadinessBoard / NextActionSummary / WorkingPipelineStatus / NextActionChecklist / CampaignStatusCard / AppNav 等）

## 9. Exact Codex Prompt for "Visual Review fidelity spec"

```text
Create fidelity spec for /visual-assets and /visual-assets/[assetId]/candidates (Visual Review) pages.

Inputs:
- Ideal screenshot: docs/ui-design/ChatGPT Image 2026年5月19日 13_02_43 (6).png
- Current state:
  - dashboard/src/app/visual-assets/page.tsx (asset list)
  - dashboard/src/app/visual-assets/[assetId]/page.tsx (asset detail)
  - dashboard/src/app/visual-assets/[assetId]/candidates/page.tsx (candidate comparison)
- Reference docs:
  - docs/68 (design system)
  - docs/69 (implementation plan)
  - docs/handoff/0151 (latest design tone after fidelity 1-5)

Hard Rules (audit + spec docs only):
- Do NOT modify code in this batch.
- Do NOT modify Sanity schema.
- Do NOT add packages.
- Do NOT modify other pages.
- Audit-only docs deliverable.

Tasks:

1. Analyze ideal screenshot and identify:
   - page structure (3 connected routes)
   - components (candidate thumbnail / approval workflow / status pipeline / etc)
   - color tones
   - missing data sources

2. Compare with current state:
   - audit existing /visual-assets implementation
   - list components that need replacement vs reuse

3. Create docs:
   - docs/77-visual-review-fidelity-spec.md
     - page structure diff per route
     - component diff (table)
     - visual fidelity checklist (~30+ items)
     - P0/P1/P2 implementation order
     - files likely affected
     - data sources (requiredVisualAssets / visualAssetPlan / candidate references)
   - docs/devlog/<番号>-visual-review-fidelity-spec.md
   - docs/handoff/<番号>-visual-review-fidelity-spec.md
   - docs/handoff/latest.md (mirror)

4. Exact Codex prompt for Phase UI-fidelity-6 (Visual Review implementation) included in handoff §9.

Validation:
- npm run build
- cd dashboard && npm run build
(docs-only, both builds remain unchanged)
```
