# Output Configurator Fidelity Spec

最終更新: 2026-05-19
ステータス: Implementation spec (audit-only batch、コード変更なし)
対象 route: `/configurator` (現状 PhasePlaceholder)
依存: docs/68 / docs/69 / docs/handoff/0149 (UI-fidelity-4 完了、design tone 確立済)

## Source materials

- **Ideal**: `docs/ui-design/ChatGPT Image 2026年5月19日 13_02_43 (3).png`
- **Current**: `dashboard/src/app/configurator/page.tsx` = PhasePlaceholder。実コンテンツなし
- **Reference**: docs/68 (Output Configurator §4) / docs/69 (Phase UI-4 計画) / docs/handoff/0149 (UI-fidelity-4 で確立した design tone)

---

## 0. Page concept (Hitori Media OS の中核 monetizable feature)

`/configurator` は Hitori Media OS の **中核 monetizable feature**:

**「1 つの構造化されたアイデアを、複数媒体への下書きに展開する」体験**

教材 / SaaS 化文脈で boss が「読者にも一番見せたい」画面。boss が:
1. 構造化済み `contentIdea` を 1 件選ぶ
2. 出力先 (platform) / 出力形式 (outputType) / 目的 / トーン / CTA / 長さ を選ぶ
3. プレビュー (タイトル案 / 構造 / 成果物 / lifecycle) を確認
4. 「下書きを生成」ボタンを押す → `outputs/<platform>/<slug>.md` に書き出し (P2 で実装)

**現フェーズ (UI-fidelity-5) ではこの画面の UI のみ実装**。実 AI 生成は **scope 外** で、boss が組み上がった prompt を Codex CLI / ChatGPT app に手動でコピペする運用継続。`docs/69` Phase UI-4 計画と整合。

### `/configurator` と他 route の役割分担

| route | 役割 |
|---|---|
| `/configurator` | **アイデア → 下書き派生**: 構造化済み source から media-specific draft を作る |
| `/outputs` | **下書き一覧**: 生成された platformOutput / manualPublishingStatus を横断管理 |
| `/publish-package/[slug]` | **コピー UI**: 手動投稿前の作業画面 |
| `/publish` | **公開状態 + 監視**: publisher 視点の Publish Package 単位の dashboard |
| `/campaigns/[slug]` | **キャンペーン詳細**: contentIdea + brand + 媒体 + 公開状況の sourced view |

---

## 1. Page Structure Diff

### 1-1. Current structure

```
[PhasePlaceholder:
  Title「出力コンフィギュレーター」
  「この画面は次フェーズで実装します (Phase UI-4)」
  ダッシュボードに戻るリンク
]
```

### 1-2. Ideal structure (13_02_43 (3).png)

```
[Breadcrumb: ダッシュボード > 出力コンフィギュレーター]
[PageHeader:
  Title 「コンテンツ出力コンフィギュレーター」
  Description: 「1 つのアイデアを複数媒体への下書きに展開」
  Actions:
    - リセット (ghost, gray)
    - テンプレートとして保存 (outline, slate)
    - 下書きを生成 (primary blue) — 後段は disabled placeholder
]
[2-col main grid (lg:grid-cols-[3fr_2fr]):
  Left (form, ~60%):
    [ContentIdeaSelectorCard:
      Title「元アイデア」+ Lightbulb icon
      Single select with search-typeahead
      Selected preview: title / coreThesis / audience chips / claims count
    ]
    [PlatformAndOutputTypeCard:
      Title「出力先と形式」+ Blocks icon
      multi-select for platform (6+ checkbox chips)
      outputType select (platform-dependent, single per row)
      Purpose select
    ]
    [ToneAndCtaCard:
      Title「トーン・目的・CTA」+ Heart icon
      Tone select / CTA select / 出力長さ select / 媒体オプション
    ]
    [AdvancedOptionsCard:
      Title「詳細オプション」
      図解を含める (toggle)
      レビュー必須 (toggle)
      参照プロンプト (select)
      キーワード (free text)
    ]
  Right (preview, ~40%):
    [GenerationPreviewCard:
      Title「生成プレビュー」+ chip 「公開予定」
      Subtitle: タイトル候補
      3-5 candidates with score
    ]
    [StructurePreviewCard:
      Title「構造プレビュー」
      Outline: 序論 / 本論 / 結論 / CTA
      Each section: bullet count + tone color
    ]
    [DeliverablesCard:
      Title「生成される成果物」
      Grid icons: テキスト本文 / 図解 / カルーセル / 動画 / 音声 / Reply chain / 等
    ]
    [LifecyclePreviewCard:
      Mini Lifecycle: 構造化済み → 下書き → レビュー → 公開
      currentStage: 下書き (これから生成する位置)
    ]
    [RecommendedTemplatesCard:
      Title「おすすめプロンプトテンプレ」
      3-5 promptTemplate rows (name + tag)
    ]
    [RecentOutputsLinkCard:
      Title「最近の出力 / 直近の生成結果」
      5 recent platformOutput rows
      link to /outputs
    ]
]
[Bottom row (full width):
  Action bar with リセット / テンプレートとして保存 / 下書きを生成 (sticky-ready)
]
```

### 1-3. Missing sections

current は PhasePlaceholder のみ → ideal の全 sections が missing。net-new で構築:

- Breadcrumb
- PageHeader (with 3 actions)
- ContentIdeaSelectorCard
- PlatformAndOutputTypeCard
- ToneAndCtaCard
- AdvancedOptionsCard
- GenerationPreviewCard
- StructurePreviewCard
- DeliverablesCard
- LifecyclePreviewCard
- RecommendedTemplatesCard
- RecentOutputsLinkCard
- Bottom action bar

### 1-4. Wrong sections

なし (current が空)。PhasePlaceholder は本実装 land 後に削除。

### 1-5. Reorder needs

該当なし (新規構築)。

---

## 2. Component Diff

| Component | 現在 | 目標 (ideal) | 判定 | Likely file |
|---|---|---|---|---|
| PhasePlaceholder | あり | 削除 | **replace** | `configurator/page.tsx` |
| PageHeader | (placeholder) | breadcrumb + 3 actions | **reuse** | `common/PageHeader.tsx` |
| ContentIdeaSelectorCard (新) | なし | single select with preview | **add** (P0) | 新規 `configurator/ContentIdeaSelectorCard.tsx` |
| PlatformAndOutputTypeCard (新) | なし | multi-select + dependent outputType | **add** (P0) | 新規 `configurator/PlatformAndOutputTypeCard.tsx` |
| ToneAndCtaCard (新) | なし | tone/cta/length selects | **add** (P0) | 新規 `configurator/ToneAndCtaCard.tsx` |
| AdvancedOptionsCard (新) | なし | toggle + select + free text | **add** (P1) | 新規 `configurator/AdvancedOptionsCard.tsx` |
| GenerationPreviewCard (新) | なし | title candidates | **add** (P0) | 新規 `configurator/GenerationPreviewCard.tsx` |
| StructurePreviewCard (新) | なし | outline preview | **add** (P0) | 新規 `configurator/StructurePreviewCard.tsx` |
| DeliverablesCard (新) | なし | icon grid | **add** (P0) | 新規 `configurator/DeliverablesCard.tsx` |
| LifecyclePreviewCard (新) | なし | mini lifecycle | **add** (P1) | 新規 `configurator/LifecyclePreviewCard.tsx` (or reuse `common/LifecyclePipeline`) |
| RecommendedTemplatesCard (新) | なし | promptTemplate list | **add** (P1) | 新規 `configurator/RecommendedTemplatesCard.tsx` |
| RecentOutputsLinkCard (新) | なし | 5 recent outputs | **add** (P1) | 新規 `configurator/RecentOutputsLinkCard.tsx` (or reuse Dashboard `RecentOutputsTable`) |
| ConfiguratorForm (新) | なし | client wrapper for form state | **add** (P0) | 新規 `configurator/ConfiguratorForm.tsx` |
| Breadcrumb / StatusBadge / PlatformBadge / KpiCard | あり | reuse | **keep** | 既存 |

---

## 3. Visual Fidelity Checklist (measurable)

### Page Header

- [ ] Breadcrumb: `ダッシュボード > 出力コンフィギュレーター`
- [ ] Title `text-2xl font-semibold` 「コンテンツ出力コンフィギュレーター」
- [ ] Description: 「1 つのアイデアを複数媒体への下書きに展開します。フル機能は Phase UI-4 で実装。」
- [ ] Header actions (右側 group):
  - 「リセット」ghost button (slate-600)
  - 「テンプレートとして保存」outline button
  - 「下書きを生成」primary blue button (`bg-blue-600`) — disabled placeholder

### Left column (form)

#### ContentIdeaSelectorCard

- [ ] Title 「元アイデア」+ Lightbulb icon (blue pill)
- [ ] Single `<select>` with all contentIdea options (title + slug)
- [ ] Selected preview area:
  - Title `text-base font-medium`
  - coreThesis `text-sm text-slate-700` (truncate 2 lines)
  - Audience chips (max 4 + overflow count)
  - claims count badge: 「主張 X 件 / 反論 Y 件」
- [ ] empty state: 「アイデアを選択してください」

#### PlatformAndOutputTypeCard

- [ ] Title 「出力先と形式」+ Blocks icon (purple pill)
- [ ] Platform multi-select: 10 platform chips (X / Threads / note / Substack / YouTube / Shorts / Podcast / 図解 / Instagram / ブログ)、click で toggle
- [ ] outputType select (single):
  - filter options by selected platforms (e.g. `note` 選択 → `note-article`、`x` 選択 → `single_post|thread`)
  - default は最初の platform に紐づく outputType
- [ ] 目的 (Purpose) select: 7 options (認知拡大 / リード獲得 / 信頼形成 / 販売 / 教育 / コミュニティ / 検索流入)

#### ToneAndCtaCard

- [ ] Title 「トーン・目的・CTA」+ Heart icon (orange pill)
- [ ] Tone select: 7 options (フレンドリー / 専門的 / 実践的 / 分析的 / ストーリー / 主張強め / 教材風)
- [ ] CTA select: 8 options (CTA なし / フォロー / Substack 購読 / ブログ / note 購入 / 相談 / DL / 事前登録)
- [ ] 出力長さ select: short / medium / long (短:〜800字 / 中:2,000-4,000 / 長:〜10,000)

#### AdvancedOptionsCard (P1)

- [ ] Title 「詳細オプション」
- [ ] 図解を含める (checkbox / toggle)
- [ ] レビュー必須 (checkbox)
- [ ] 参照プロンプトテンプレ (select、promptTemplate list)
- [ ] キーワード (free text input、tag chips)

### Right column (preview)

#### GenerationPreviewCard

- [ ] Title 「生成プレビュー」+ small chip「タイトル候補」
- [ ] 3-5 candidate titles (auto-derive from coreThesis + tone heuristic)
- [ ] Each candidate: title text + score chip (★N/5)
- [ ] empty state: 「アイデアと出力条件を設定するとここにプレビューが表示されます」

#### StructurePreviewCard

- [ ] Title 「構造プレビュー」
- [ ] Outline list:
  - 序論 (bullet count + tone color: blue)
  - 本論 (purple)
  - 結論 (orange)
  - CTA (emerald)
- [ ] Each section: small description (1 行)

#### DeliverablesCard

- [ ] Title 「生成される成果物」
- [ ] Grid 3x2 of icons + label + count:
  - テキスト本文 (FileText)
  - 図解 (Image, conditional on 図解オプション)
  - カルーセル (Layers, conditional)
  - 動画台本 (Video, conditional)
  - 音声台本 (Mic, conditional)
  - Reply chain (MessageCircle, conditional on platform)

#### LifecyclePreviewCard (P1)

- [ ] Mini `<LifecyclePipeline>` (common 既存) を使用
- [ ] currentStage = `draft` (これから下書きを生成する位置)
- [ ] 5 stage (idea / structured / draft / review / published)、count は static placeholder

#### RecommendedTemplatesCard (P1)

- [ ] Title 「おすすめプロンプトテンプレ」+ ChevronRight to `/knowledge`
- [ ] 3-5 promptTemplate rows:
  - template name
  - category badge
  - tag chips
  - select button (clicking sets the `referencePromptId` in form state)

#### RecentOutputsLinkCard (P1)

- [ ] Title 「直近の生成結果」+ link to `/outputs`
- [ ] 5 platformOutput rows (compact、Dashboard `RecentOutputsTable` を流用検討)

### Bottom action bar (sticky-ready)

- [ ] 3 buttons aligned right:
  - リセット (ghost)
  - テンプレートとして保存 (outline)
  - 下書きを生成 (primary blue) — disabled in MVP、Phase UI-4 P2 で実装
- [ ] sticky bottom on long pages (任意 P2)

### Layout container

- [ ] `<main className="mx-auto max-w-[1280px] gap-5 px-4 py-6 sm:px-6 lg:px-8">`
- [ ] 2-col grid `lg:grid-cols-[3fr_2fr] gap-5`
- [ ] 全 card `rounded-lg border-slate-200 bg-white p-5 shadow-sm`

### Sidebar / Topbar

- [ ] Sidebar の「出力コンフィギュレーター」が active highlight
- [ ] Topbar ReadOnlyPill 表示

---

## 4. Implementation Order

### P0 (Output Configurator visual fidelity に必須)

- [ ] **PhasePlaceholder 削除 → 本実装 page**
- [ ] **PageHeader (breadcrumb + 3 actions、すべて disabled placeholder)**
- [ ] **ContentIdeaSelectorCard** (single select、選択時 preview)
- [ ] **PlatformAndOutputTypeCard** (multi-select platform + dependent outputType + Purpose select)
- [ ] **ToneAndCtaCard** (3 select)
- [ ] **GenerationPreviewCard** (3-5 title candidates、auto-derive from coreThesis heuristic)
- [ ] **StructurePreviewCard** (outline 4 section)
- [ ] **DeliverablesCard** (icon grid、condition で表示制御)
- [ ] **ConfiguratorForm** (client wrapper、`useState<FormValue>`)
- [ ] **2-col layout** (左 form / 右 preview)
- [ ] **Sanity から data fetch**: contentIdea list + promptTemplate list

### P1 (重要な polish)

- [ ] **AdvancedOptionsCard** (図解 toggle / レビュー必須 / 参照プロンプト / キーワード)
- [ ] **LifecyclePreviewCard** (`<LifecyclePipeline>` 再利用、`currentStage="draft"`)
- [ ] **RecommendedTemplatesCard** (promptTemplate list、select で `referencePromptId` set)
- [ ] **RecentOutputsLinkCard** (Dashboard `RecentOutputsTable` 流用 or 軽量版)
- [ ] **Form validation summary** (要素未選択時 warning chip)
- [ ] **Bottom action bar** (sticky on scroll)

### P2 (実 generation 機能、Phase UI-4 完成)

- [ ] **「下書きを生成」 button を enable**
- [ ] 押下時に **filesystem 出力**: `outputs/<platform>/<slug>-<timestamp>.md` を生成
- [ ] 生成 prompt の組み立てロジック (contentIdea + tone + CTA + length + promptTemplate)
- [ ] AI 連携:
  - Option A: Codex CLI を server-side で spawn (`tools/output/run-configurator.mjs`)
  - Option B: OpenAI / Anthropic API direct call (CLAUDE.md 方針と要相談)
  - Option C: boss 手動 copy → 別ツール → output ファイル手動配置
- [ ] Sanity write: `platformOutput` doc 新規作成 (server action 経由、controlled write tool として)
- [ ] Job history list (前回までの生成結果)
- [ ] テンプレート保存 button の実装

### P3 (将来検討)

- [ ] 多媒体同時生成 (platform multi-select の本実装、複数 platformOutput を 1 click で)
- [ ] preview 内 candidate を click → 自動採用
- [ ] 生成中の async job status (Server-Sent Events / polling)
- [ ] テンプレート別 cost / latency 表示
- [ ] 履歴からの再生成 / 派生

---

## 5. Files Likely Affected

### 新規 (P0)

| File | 内容 |
|---|---|
| `dashboard/src/components/configurator/ConfiguratorForm.tsx` | client wrapper、form state (`useState<FormValue>`)、子 component に value/onChange を渡す |
| `dashboard/src/components/configurator/ContentIdeaSelectorCard.tsx` | single select + selected preview |
| `dashboard/src/components/configurator/PlatformAndOutputTypeCard.tsx` | multi-select platform + dependent outputType + Purpose |
| `dashboard/src/components/configurator/ToneAndCtaCard.tsx` | 3 select (tone / cta / length) |
| `dashboard/src/components/configurator/GenerationPreviewCard.tsx` | title candidate list |
| `dashboard/src/components/configurator/StructurePreviewCard.tsx` | outline preview |
| `dashboard/src/components/configurator/DeliverablesCard.tsx` | icon grid |
| `dashboard/src/lib/groq/configurator.ts` | configuratorOptionsQuery (contentIdea / promptTemplate / brandProfile / visualStyleProfile 等を一括 fetch) |

### 新規 (P1)

| File | 内容 |
|---|---|
| `dashboard/src/components/configurator/AdvancedOptionsCard.tsx` | toggle + select + free text |
| `dashboard/src/components/configurator/LifecyclePreviewCard.tsx` | wrap `<LifecyclePipeline>` で configurator 専用表示 |
| `dashboard/src/components/configurator/RecommendedTemplatesCard.tsx` | promptTemplate list with select |
| `dashboard/src/components/configurator/RecentOutputsLinkCard.tsx` | recent outputs preview |

### 新規 (P2、generation 実装段階)

| File | 内容 |
|---|---|
| `dashboard/src/lib/actions/runConfigurator.ts` | server action wrapper for filesystem write + Sanity platformOutput create |
| `tools/output/run-configurator.mjs` (任意) | CLI で同じ生成 logic を実行できる版、controlled atomic write pattern |
| `dashboard/src/lib/configurator/promptBuilder.ts` | contentIdea + tone + CTA + length から prompt 文字列を構築する pure 関数 |

### 更新

| File | 想定変更 |
|---|---|
| `dashboard/src/app/configurator/page.tsx` | PhasePlaceholder 削除、Server Component で options fetch → `<ConfiguratorForm>` に props |
| `dashboard/src/components/dashboard/ContentOutputConfiguratorCard.tsx` | Dashboard preview card の selectors を本実装と整合させる (Phase UI-fidelity-5 cleanup) |

---

## 6. Data Sources

### 既存 query で取得済み

- `outputsListQuery` (`lib/groq/outputs.ts`): RecentOutputsLinkCard で `buildOutputRows` を再利用
- `campaignListQuery` (`lib/groq/campaign.ts`): "デフォルトキャンペーン" のような optional context 表示用

### 新規 query が必要 (`lib/groq/configurator.ts` 新規作成)

```groq
{
  "contentIdeas": *[_type == "contentIdea"] | order(coalesce(updatedAt, _updatedAt) desc) [0..99] {
    _id,
    title,
    "slug": slug.current,
    status,
    summary,
    coreThesis,
    audience,
    audiencePain,
    "claimsCount": count(claims),
    "examplesCount": count(examples),
    "objectionsCount": count(objections),
    "platformAnglesCount": count(platformAngles),
    updatedAt,
    _updatedAt
  },
  "promptTemplates": *[_type == "promptTemplate"] | order(title asc) [0..49] {
    _id,
    title,
    category,
    version,
    status,
    automationLevel,
    variationStrategy,
    "brandName": brandProfile->brandName,
    "styleTitle": visualStyleProfile->title
  },
  "brandProfiles": *[_type == "brandProfile"] | order(brandName asc) {
    _id,
    title,
    brandName,
    ownerType,
    "voiceTone": voiceTone.voice,
    defaultPlatforms,
    status
  },
  "visualStyleProfiles": *[_type == "visualStyleProfile"] | order(title asc) {
    _id,
    title,
    status
  }
}
```

新規 Sanity schema 変更なし、既存 doc type を query するだけ。

### Future (P2 generation 実装)

- **`outputs/<platform>/<slug>-<timestamp>.md`**: 生成された draft の FS 出力先
- **`platformOutput`** (Sanity schema 既存): server action 経由で新規作成、`status: 'drafted'` で start
- **`workflow` ref** (任意): 生成タスク 1 件を `workflow` doc として記録、job history 用

### Future (P3 analytics)

- 生成履歴の latency / token cost / 採用率 → boss が「どの promptTemplate が一番効率的か」判断

---

## 7. Future Write / Generation Boundary

### Phase UI-fidelity-5 (本 spec の対象)

- **完全に UI のみ**、書き込みなし
- Form state は client-side `useState`、リロードで消える
- 「下書きを生成」button は **disabled placeholder**
- 「テンプレートとして保存」も **disabled placeholder**
- preview cards は selected idea + form state から derive (静的計算、AI 呼び出しなし)

### Phase UI-4 P2 (実 generation)

- 「下書きを生成」を enable、押下で server action 実行:
  1. form state から prompt 文字列を組み立てる (pure function `promptBuilder`)
  2. 出力先を確定:
     - **Option A**: filesystem only (`outputs/<platform>/<slug>-<timestamp>.md` に prompt + 空 body を書き込み、boss が手動で AI 呼び出して body 埋める)
     - **Option B**: Codex CLI spawn (`tools/output/run-configurator.mjs` 経由、controlled atomic write pattern)
     - **Option C**: 直接 OpenAI / Anthropic API call (CLAUDE.md 方針確認必要)
  3. 完了後 Sanity `platformOutput` doc を **dry-run / execute** 2 段 pattern で新規作成 (server action wrapper)
- **boss 判断点**:
  - API 連携を許可するか (CLAUDE.md 方針)
  - filesystem 出力先の命名規則
  - Sanity write の責任分界 (server action vs controlled tool)

### Phase UI-7+ (将来)

- 多媒体同時生成
- async job status (SSE)
- 履歴からの再生成 / 派生
- テンプレート保存 (boss 専用 prompt の DB 登録)

### 明示的に scope 外

- **AI clone voice / avatar 自動生成**: CLAUDE.md の意図 ("発信者の視点を残す") と矛盾、本人承認が必要
- **multi-user 編集 / team workspace**: Phase UI-7+
- **auto-post**: 全 phase で scope 外

---

## 8. Compatibility / Risk

- **Dashboard の `ContentOutputConfiguratorCard` との整合**: Dashboard preview に同じ form 要素が出ているが現状 placeholder。`/configurator` 本実装が land したら Dashboard 側 fake select を「最後に選択した state を表示」する形で再構成する microbatch を Phase UI-fidelity-6 cleanup で
- **`platformOutput` schema との整合**: 既存 schema (`schemas/platformOutput.ts`) の status enum (drafted / reviewed / revised / ready / archived) と Configurator の outputType enum がほぼ一致、新規 schema 変更なしで integration 可能
- **`promptTemplate` doc の存在**: dataset 投入状況確認必要。RecommendedTemplatesCard が空になっても graceful fallback
- **`brandProfile` / `visualStyleProfile` の存在**: 同上、empty fallback
- **Form state persistence**: `useState` のみだとリロードで消える。Phase UI-4 P2 で URL searchParam or localStorage 検討
- **shadcn 採用判断**: Configurator の form 要素 (Select / Checkbox / Switch / Combobox) は shadcn が綺麗。boss 確認次第で 1 件ずつ追加 (Phase UI-fidelity-5 着手時に決定)

---

## 9. Boss Decision Points (Phase UI-fidelity-5 着手前)

1. **shadcn primitive 採用判断**:
   - `Select` (今回主力、native `<select>` でも可)
   - `Checkbox` / `Switch` (AdvancedOptionsCard)
   - `Combobox` (ContentIdeaSelectorCard search-typeahead)
   - 全部追加 / 一部のみ / 0 件 hand-roll
2. **「下書きを生成」 button**: P0 で完全 disabled / P1 で「prompt を copy する」モードのみ / P2 で本格生成
3. **Title candidate auto-derive**: heuristic (coreThesis 切り出し) で生成 / 完全 hardcoded placeholder / AI 連携待ち
4. **Form state persistence**: URL searchParam / localStorage / なし (リロードで消える)
5. **PromptTemplate dataset 投入状況**: dataset 確認後、空ならどう RecommendedTemplatesCard をフォールバックさせるか

---

## Out of scope (本 spec の範囲外)

- AppShell / Sidebar / Topbar (UI-1/UI-2.5 完成済)
- Sanity schema 変更 (既存 `platformOutput` schema を使う)
- 実 AI 生成連携 (Phase UI-4 P2、boss API 連携承認待ち)
- 多媒体同時生成 (P3)
- Job history / async status (P3)
- Sanity write (P2 で server action 経由 controlled write tool として実装)
- `/outputs` への navigation (既に Dashboard / Publish からリンク済)
- contentIdea / promptTemplate の dataset 投入作業 (boss 担当、Phase UI-4 P0 前に投入確認)
