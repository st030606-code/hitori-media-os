# Output Configurator Fidelity Spec (docs only)

日付: 2026-05-19

## 背景

UI fidelity 4-page batch (Dashboard / Campaign Detail / Output Management / Publish Management) が完了し、5 page 目 `/configurator` の fidelity spec を作成。これは Hitori Media OS の **中核 monetizable feature** で、boss が長期的に最重要視している画面 (教材 / SaaS 化文脈で「アイデアから派生」を体感させる体験そのもの)。

reference (`docs/ui-design/ChatGPT Image 2026年5月19日 13_02_43 (3).png`) と現状 PhasePlaceholder を比較し、Phase UI-fidelity-5 で実装可能な spec + Phase UI-4 generation 実装の boundary を docs に確定する。

## 決定・変更

### Page concept の明確化

`/configurator` は「1 つの構造化された contentIdea を複数媒体の下書きに展開する」**生成型 UI**:

| route | 役割 |
|---|---|
| `/configurator` | アイデア → 下書き派生 (本 spec) |
| `/outputs` | 下書き一覧 |
| `/publish-package/[slug]` | コピー UI (作業者視点) |
| `/publish` | 公開状態 + 監視 (publisher 視点) |
| `/campaigns/[slug]` | campaign 詳細 (sourced view) |

5 route が役割分担済みになり、本 spec が完成すれば 5/12 page (UI 主要面) が fidelity 整合する状態に。

### 作成 docs (4 件)

1. [docs/76-output-configurator-fidelity-spec.md](76-output-configurator-fidelity-spec.md):
   - Page concept (中核 monetizable feature) を冒頭で明示
   - Page structure diff (current PhasePlaceholder vs ideal の 12 sections + bottom action bar)
   - Component diff table (15 行、12 新規 + 3 reuse)
   - Visual fidelity checklist (~45 項目)
   - Implementation order: **P0 10 件** / **P1 6 件** / **P2 7 件** (実 generation) / P3 5 件 (将来)
   - Files affected table (P0/P1/P2 で分離)
   - Data sources (新規 `configuratorOptionsQuery` 必要、schema 変更なし)
   - **Future Write / Generation Boundary section** で Phase UI-fidelity-5 / Phase UI-4 P2 / Phase UI-7+ の責任分界を明示
   - **Boss Decision Points** (Phase UI-fidelity-5 着手前): shadcn 採用 / generation button / title candidate / persistence / dataset 投入確認
2. `docs/devlog/0139-output-configurator-fidelity-spec.md` (本ファイル)
3. `docs/handoff/0150-output-configurator-fidelity-spec.md` (Phase UI-fidelity-5 Codex prompt 含む)
4. `docs/handoff/latest.md` (mirror)

### Generation boundary の明示

Phase の段階を明確に切り分けた:

- **Phase UI-fidelity-5 (本 spec の対象)**: UI のみ、書き込みなし、「下書きを生成」は disabled placeholder
- **Phase UI-4 P2**: 実 generation 連携 (filesystem 出力 / Codex CLI / OpenAI API / boss 手動 copy の 3 option)
- **Phase UI-7+**: 多媒体同時生成 / async job / 履歴

**boss API 連携承認待ち** が UI-4 P2 着手の前提条件。CLAUDE.md の方針 (「明示的に依頼されるまで API 連携を追加しない」) と整合させた。

### Data sources

新規 `dashboard/src/lib/groq/configurator.ts` が必要 (`configuratorOptionsQuery`):
- `contentIdea` list (max 100、title / coreThesis / audience / claims count)
- `promptTemplate` list (max 50、category / version / brand / style)
- `brandProfile` list (voice / default platforms)
- `visualStyleProfile` list (title only)

新規 Sanity schema 変更なし、既存 doc type を query するだけ。

### Implementation 順序

12 components を 3 phase に分離:

**P0 (10 components)**:
- PageHeader (reuse)
- ContentIdeaSelectorCard / PlatformAndOutputTypeCard / ToneAndCtaCard
- GenerationPreviewCard / StructurePreviewCard / DeliverablesCard
- ConfiguratorForm (client wrapper)
- 2-col layout + breadcrumb + 3 disabled actions

**P1 (6 components)**:
- AdvancedOptionsCard / LifecyclePreviewCard / RecommendedTemplatesCard / RecentOutputsLinkCard
- Form validation summary
- Bottom sticky action bar

**P2 (実 generation)**:
- 「下書きを生成」 button enable
- filesystem 出力 + Sanity platformOutput write
- 3 generation option の boss 判断
- Job history

**P3**: 多媒体同時 / async / 履歴再生成

### 5 boss decision points

着手前に boss に確認する 5 項目:

1. shadcn primitive (Select / Checkbox / Switch / Combobox) を採用するか
2. 「下書きを生成」 button の P0 段階での動作 (disabled / prompt copy / 本格生成)
3. Title candidate の auto-derive heuristic か AI 呼び出し
4. Form state persistence (URL searchParam / localStorage / なし)
5. promptTemplate dataset 投入状況確認

## 理由

- **中核 monetizable feature** と明示: 教材 / SaaS 化文脈での価値中心、boss が phase 順序を判断する材料に
- **5 route の役割分担を明文化**: 名前が似た /publish / /publish-package / /outputs / /configurator の混乱を仕様で固定
- **Generation boundary を 3 phase で切り分け**: UI fidelity と実 AI 連携を分離、Phase UI-fidelity-5 は UI のみで land 可能
- **Data sources GROQ は 1 query 集約**: contentIdea + promptTemplate + brandProfile + visualStyleProfile を `configuratorOptionsQuery` 1 件で fetch、page initial load 最小化
- **5 boss decision points を明示**: 着手前の判断点を 5 件に絞り、boss が回答しやすく
- **「実 AI 連携を P2 に押し下げる」判断**: Phase UI-fidelity-5 を visual only でこなせれば、boss が「とりあえず画面の輪郭が見える」状態を素早く得られる、次の判断 (API 連携要否) に進める
- **`platformOutput` schema は既存のまま使う**: schema 変更なし、Phase UI-4 P2 で書き込み時に既存 enum (drafted/reviewed/revised/ready/archived) に整合
- **AI clone voice / multi-user / auto-post は scope 外**: 全 phase で明示的に除外、CLAUDE.md と整合

## 影響

- 実装変更なし、build 結果不変
- 5/12 page (Dashboard / Campaign / Output / Publish / Configurator) の fidelity spec が docs に揃った
- 残 4 page (Visual Review / Knowledge / Analytics / Settings) の spec 化判断を boss に委ねる準備
- Phase UI-fidelity-5 着手で 5 page UI 完成、boss が次に「実 AI 連携 (UI-4 P2)」を選ぶか「残 4 page spec → 6 page 完成」を選ぶかの判断点

## 次の一手

1. boss が docs/76 を音読、特に:
   - Page concept § (役割分担)
   - Implementation Order (P0/P1/P2/P3 のスコープ感)
   - Boss Decision Points (5 項目への回答)
   - Future Write / Generation Boundary (Phase 切り分け)
2. 違和感なければ **Phase UI-fidelity-5 (Output Configurator 実装)** に着手:
   - docs/76 + handoff/0150 §9 の Codex prompt 使用
   - 5 boss decision を埋めて Codex に渡す
   - P0 10 components 一括 land (Phase UI-fidelity-4 と同様の規模感)
3. Phase UI-fidelity-5 完了後 → 次の選択肢:
   - **Phase UI-4 P2 (実 AI 連携)** に進む (boss 承認必要)
   - **残 4 page spec** 一括化 (Visual Review / Knowledge / Analytics / Settings)
   - **24-72h reactionNotes 反映バッチ** (Sanity write、別系統)

並行候補:
- Threads 公開判断
- dead code cleanup (PublishReadinessBoard / NextActionSummary / etc 6 components)
- DataTable 共通抽出 (Phase UI-fidelity-6 cleanup)
- `/publish-package/[slug]` v0.3 (Phase UI-3 server action 経由 URL inline edit)
