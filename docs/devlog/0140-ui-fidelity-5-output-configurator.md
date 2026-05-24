# Devlog 0140 — Phase UI-fidelity-5 Output Configurator

日付: 2026-05-19

## 背景

`/configurator` は Hitori Media OS の中核 monetizable feature（「1 つの構造化アイデアを複数媒体へ展開する」体験）。これまでは PhasePlaceholder で空のままだったが、docs/76 で fidelity spec を確定済み。Phase UI-fidelity-5 として **UI のみ** を本実装する段に入った。AI 連携・FS 書き込み・Sanity 書き込みは **scope 外**、boss の運用は「組み上がったプロンプトを Codex / ChatGPT に手動でコピペ」のまま。

## 決定・変更

`/configurator` を PhasePlaceholder から full implementation に置き換え。1 page + 10 component + 3 helper (GROQ / options / promptBuilder)。

- **scope（boss 確定）**:
  - shadcn primitives（Select / Checkbox / Switch / Combobox）: 全て **NO** → native HTML + Tailwind で hand-roll
  - 「下書きを生成」button: **prompt copy preview** モード（実 AI 呼び出しなし）
  - title candidate auto-derive: **coreThesis heuristic**（pure 関数 `buildTitleCandidates`）
  - form state persistence: `useState` のみ（リロードで消える）
  - promptTemplate dataset: **空 fallback OK**（RecommendedTemplatesCard で graceful empty state）

- **新規ファイル**:
  - `dashboard/src/lib/groq/configurator.ts` — contentIdea / promptTemplate / brandProfile / visualStyleProfile を一括 fetch する `configuratorOptionsQuery` + types
  - `dashboard/src/lib/configurator/options.ts` — `FormValue` 型 + 7 種類の option constants + `RECOMMENDED_OUTPUT_TYPE_BY_PLATFORM` map
  - `dashboard/src/lib/configurator/promptBuilder.ts` — `buildTitleCandidates` + `buildPrompt`（どちらも純粋関数、AI 呼び出しなし）
  - `dashboard/src/components/configurator/ContentIdeaSelectorCard.tsx`
  - `dashboard/src/components/configurator/PlatformAndOutputTypeCard.tsx`
  - `dashboard/src/components/configurator/ToneAndCtaCard.tsx`
  - `dashboard/src/components/configurator/AdvancedOptionsCard.tsx`（P1）
  - `dashboard/src/components/configurator/GenerationPreviewCard.tsx`
  - `dashboard/src/components/configurator/StructurePreviewCard.tsx`
  - `dashboard/src/components/configurator/DeliverablesCard.tsx`
  - `dashboard/src/components/configurator/LifecyclePreviewCard.tsx`（P1、common LifecyclePipeline を再利用）
  - `dashboard/src/components/configurator/RecommendedTemplatesCard.tsx`（P1）
  - `dashboard/src/components/configurator/RecentOutputsLinkCard.tsx`（P1）
  - `dashboard/src/components/configurator/ConfiguratorForm.tsx` — client wrapper、useState、2-col grid、底部に sticky action bar + プロンプトプレビュー

- **更新**:
  - `dashboard/src/app/configurator/page.tsx` — PhasePlaceholder 削除、Server Component で 3 query 並列 fetch して `<ConfiguratorForm>` に props

- **scope 外**:
  - 実 AI 連携（Phase UI-4 P2）
  - Sanity 書き込み（同上）
  - filesystem 書き込み（同上）
  - shadcn 採用判断（不採用で確定）

## 理由

- **shadcn 全 NO**: dependency 追加を避け、Phase UI-fidelity-1〜4 で確立した「hand-roll で十分」原則を継続。Configurator は select / checkbox / button の組み合わせで、native HTML + Tailwind で十分な fidelity が出る
- **prompt copy preview**: 「ひとり運営の OS は API なしでも回る」を CLAUDE.md で boss が明文化済み。実 AI 連携を入れるよりも、boss が ChatGPT / Codex に貼り付ける運用を素早く回せるほうが価値が大きい
- **coreThesis heuristic**: 完全 placeholder（hardcoded）だと preview の意味がなく、AI 呼び出しは scope 外。中間として coreThesis を 5 パターン（生 / 出力形式冠 / 実践記 / 疑問形 / 逆張り）に展開する pure 関数で「ちゃんと変化する preview」を確保
- **useState のみ**: URL searchParam / localStorage は P2 議論。MVP は state が消えても prompt 構築フローは数十秒で完結するので、リロード問題は許容

## 影響

- **23 routes 動作維持**（dashboard）、Sanity Studio 7.6s clean
- `/configurator` の Sidebar nav active highlight が機能する
- contentIdea / promptTemplate が dataset に既に投入されていれば実 data でプレビュー、なければ empty state（dataset 投入は boss 担当）
- Dashboard `ContentOutputConfiguratorCard` は **未変更**: Phase UI-fidelity-6 cleanup で本実装と整合 (boss feedback 次第)
- スキーマ変更なし、API 連携なし、書き込みなし、deploy なし（CLAUDE.md 整合）

## 次の一手

1. **boss が `cd dashboard && npm run dev` で `/configurator` を実機確認**
   - 各 card の tone / spacing / a11y 確認
   - contentIdea を選んでタイトル候補 5 件が変化するか
   - 「プロンプトをコピー」が clipboard に乗るか（macOS Safari / Chrome）
   - 「下書きを生成」が disabled 状態で starts、必要条件が揃ったら enable になるか
2. 違和感あれば microbatch（layout / tone / wording）
3. なければ次の選択肢:
   - **Visual Review fidelity spec**（`13_02_43 (6).png` → docs/77）
   - **Dashboard ContentOutputConfiguratorCard cleanup**（Phase UI-fidelity-6: 本実装と整合させる、または「最後に選択した state を表示」化）
   - **promptTemplate dataset 投入**（boss 担当、UI 側の RecommendedTemplatesCard を埋めるため）
   - **Phase UI-4 P2 (実 generation)** 議論開始

## 発信ネタ候補

- 「AI 連携なしで Output Configurator UI を作る理由」: hitri 運営の workflow は実は「組み立て → 手動コピペ」で十分回る話
- 「shadcn を全部断った日」: hand-roll の手間と引き換えに、build 軽量化 / dependency 削減 / 振る舞いの完全把握を取った判断記
- 「coreThesis heuristic で 5 タイトル」: AI 呼び出しなしで「変化するプレビュー」を作る pure 関数の話
