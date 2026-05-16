# Devlog 0087: Sanity Studio Content Idea-Centered Structure

Date: 2026-05-14

## 今日の判断

Sanity Studio の左ナビを **Content Idea を中心** に組み替えました。

- これまでは document type ごとのフラットリスト（Visual Asset Plan / Diagram Plan / Platform Output / Substack 戦略系...）。
- Content Idea が `ai-blog-db` / `building-hitori-media-os` に増え、各リストに複数 Content Idea のレコードが混在 → 探すのが手間。
- Hitori Media OS は「1 Content Idea → 複数媒体」が基本単位なので、Studio の入口も同じ単位にする。
- 既存の by-type フラットリストも `By Type (flat)` セクションに残し、debugging / power use を維持。
- 将来の管理ダッシュボード（Next.js 段階）でも同じ Content Idea 中心モデルを流用できる。

このバッチでは Studio structure の組み換えのみ。**既存 schema・既存 dataset には一切触っていない**。

## 変更したこと

### Added

- `structure/index.ts` — structure resolver と child list builder
- `docs/46-sanity-content-idea-centered-structure.md` — 設計・運用ドキュメント
- `docs/devlog/0087-sanity-content-idea-centered-structure.md`（本devlog）
- `docs/handoff/0098-sanity-content-idea-centered-structure.md`

### Modified

- `sanity.config.ts`（`import {structure} from './structure'` を追加、`structureTool({structure})` に変更）
- `docs/handoff/latest.md`

### Confirmed unchanged

- 全 schema ファイル（`schemas/contentIdea.ts` / `visualAssetPlan.ts` / etc.）— 触っていない
- `schemas/index.ts` — 触っていない
- 既存 outputs / publish-packages / private / 既存 seed — 触っていない
- ai-blog-db 関連 — 触っていない

## Navigation 構造

```text
Sanity Studio 左ナビ
├── Content Ideas (hub)
│   ├── All Content Ideas
│   └── By Content Idea
│       └── <select contentIdea>
│           ├── Overview                                  （contentIdea editor）
│           ├── Visual Asset Plans                         （sourceContentIdea._ref）
│           ├── Diagram Plans                              （同上）
│           ├── Platform Outputs                           （同上）
│           ├── Workflows                                  （同上）
│           ├── Substack Post Plans                        （同上）
│           ├── Substack Notes Plans                       （同上）
│           ├── Substack Growth Actions                    （同上）
│           └── Substack Publication Strategies            （references($contentIdeaId)）
├── divider
└── By Type (flat)
    ├── Content Ideas
    ├── Prompts
    ├── Platform Outputs
    ├── Diagram Plans
    ├── Visual Asset Plans
    ├── Workflows
    ├── Published Outputs
    ├── Tools
    ├── Substack Publication Strategies
    ├── Substack Post Plans
    ├── Substack Notes Plans
    └── Substack Growth Actions
```

## Filter Logic

- 7 直接 reference schemas（visualAssetPlan / diagramPlan / platformOutput / workflow / substackPostPlan / substackNotesPlan / substackGrowthAction）→ `_type == $type && sourceContentIdea._ref == $contentIdeaId`
- `substackPublicationStrategy`（sourceContentIdea + relatedContentIdeas 配列）→ `references($contentIdeaId)` で包括
- `prompt` / `publishedOutput` / `tool` は Content Idea reference 無し → `By Type (flat)` のみアクセス可能、backlog として記載

## なぜこの方針にしたか

- Hitori Media OS の運用視点では「ai-blog-db キャンペーンの状態」「building-hitori-media-os キャンペーンの状態」を1か所で把握したい。
- フラット by-type では複数キャンペーンが混在し、目視で探す手間がかかる。
- ただし、power user は引き続き by-type アクセスが欲しい場面がある（横断比較 / debug / promotion / tool 一覧など）。
- 両方を1つの structure に共存させる（hub + by-type flat）ことで、認知負荷を下げつつ既存挙動を温存。
- 将来の Next.js 管理ダッシュボードでも、同じ Content Idea 中心モデルが情報設計の基盤になる。

## 制約

- Studio structure の組み換えのみ。schema や dataset は触らない。
- Next.js は引き続き未導入。
- 管理ダッシュボードは引き続き保留。
- direct Sanity write / paid API / auto-post / `seed --replace` / Sanity CLI 実行は全て無し。
- 既存 ai-blog-db の visualAssetPlan / publish-package / outputs に影響なし。

## 安全性の担保

- direct Sanity write の grep → 0 hits（不変）
- paid API integration の grep → 0 hits（不変）
- 既存 schema → 未変更
- 既存 seed → 未変更
- 既存 outputs / publish-packages → 未変更
- private/ → 未変更
- ai-blog-db 既存レコード（5 visualAssetPlan / diagramPlan / 等）は Studio 上の `By Type (flat)` および `Content Ideas → By Content Idea → ai-blog-db` の両方からアクセス可能

## 検証

- `npm run build`（sanity build）→ 7.5s で成功（custom structure を含む bundle が通る）
- `npm run local:check` → `ok: true`（全 15 チェック green）
- `node --check structure/index.ts` は TypeScript ファイルなので native parser では check しない（Sanity bundler が build 時に検証する）。build 成功で実質的に検証済み。

## CodexとClaude Codeの役割分担

Claude Code（今回）: structure 設計・実装・docs。
人間（次のアクション）: `npm run dev` で Studio を起動し、Content Ideas hub の動作確認。

Codex（任意）: Phase 1 safety review で structure/index.ts の GROQ filter / 安全性を再チェック可能。

## 発信コンテンツにできる切り口

- フラット by-type → Content Idea 中心への組み換えは、Sanity Studio らしい設計判断。
- 「Studio の入口を整える」だけで、Next.js dashboard を入れる前に Hitori Media OS の運用感は大きく改善できる。
- 既存リストを残しつつ、新しい hub を共存させるアプローチ。

## 次にテストすること

1. 人間が `npm run dev` で Studio を起動し、左ナビに「Content Ideas」セクションが出ることを確認。
2. `Content Ideas → By Content Idea → ai-blog-db` を選び、Visual Asset Plans に 5 件、Diagram Plans / Platform Outputs / Workflows / Substack 系（あれば）に該当レコードが表示されることを確認。
3. `building-hitori-media-os` の visualAssetPlan / substackPublicationStrategy などが Sanity dataset に投入済みの場合、それも同じ hub から見えることを確認。
4. divider の下の `By Type (flat)` で 12 種類の document type 全てにアクセスできることを確認。
5. 違和感があれば structure/index.ts を修正し、再 build。

## Backlog

- `prompt` schema に `contentIdea` reference を足し、hub に組み込むかの判断。
- `publishedOutput` を `sourceContentIdea` 直 reference にするか、2-hop GROQ で hub に組み込むか。
- Content Idea サブビューに status 別フィルタ（saved / brief-ready / planned 等）を追加。
- substack の subscriber milestone / paid readiness が active 化したら hub に追加。
- 多数の Content Idea を扱うようになった段階で、preview / order / search のチューニング。
