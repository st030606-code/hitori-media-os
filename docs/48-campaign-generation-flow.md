# 48 — Campaign Generation Flow (design)

Date: 2026-05-14
Status: **design-only, no schema activation**
Scope: 1 Content Idea を複数プラットフォームへ展開するフローを記述する。本 doc は code / schema 変更を行わない。

## 1. 全体像（人間が触る順序）

```
1. ContentIdea を作る／編集する
        ↓
2. selectedPlatforms を決める（X / Threads / note / Substack / YouTube / ...）
        ↓
3. Campaign Plan が generate される（per-platform 設定 + 必要 asset 一覧）
        ↓
4. 各 platform 用 record を生成する
   - platformOutput (text draft)
   - substackPostPlan / substackNotesPlan / substackGrowthAction（Substack の場合）
   - visualAssetPlan（必要数）
   - diagramPlan（任意）
        ↓
5. 自動 prompt 選定（promptTemplate を Selection Keys で引く）
        ↓
6. text draft 生成 → outputs/<platform>/<date>--<slug>.md
        ↓
7. visual asset の image prompt task を `tasks/visuals/<slug>/<assetSlug>.md` に書き出し
        ↓
8. 候補画像 を inbox `assets/inbox/generated/<slug>/<assetSlug>/v00N.png` に生成（Codex `image_gen` or ChatGPT 手動）
        ↓
9. Visual Register Inbox Review で人間が承認 → `assets/visuals/<slug>/.../*.png` に copy + patch JSON
        ↓
10. Sanity Studio で visualAssetPlan の localAssetPath / status: saved / reviewNotes を手動更新
        ↓
11. publish-package-builder で publish-packages/<platform>/<slug>/ を build
        ↓
12. 人間が release-review checklist を埋め、最終確認後 manual publish
        ↓
13. （将来）半自動公開へ移行
```

各段ごとに **明示的な human gate** が入る。auto-posting は long-term deferred。

## 2. 段階ごとに生成する record

| 段階 | record type | 補足 |
| --- | --- | --- |
| 1 | `contentIdea` | claims / objections / audience / tone / platformAngles |
| 2 | （Campaign Plan） | proposed schema `campaignPlan` で represent。本バッチでは未活性 |
| 4-text | `platformOutput` × N | platform / outputType / status: draft |
| 4-substack | `substackPostPlan` / `substackNotesPlan` / `substackGrowthAction` | publication ごとに |
| 4-visual | `visualAssetPlan` × N | hero / inline / hook / thumbnail など、後で Visual Register で saved 状態へ |
| 4-diagram | `diagramPlan` | 概念図の構造化（任意） |
| 5 | `prompt` (instance) / 将来 `promptTemplate` ref | template を引いて instance 化 |
| 6 | `outputs/<platform>/...md`（ファイル） | Sanity record の `localOutputPath` で binding |
| 7 | `tasks/visuals/<slug>/<assetSlug>.md`（ファイル） | brief、Generation Prompt、Review Checklist |
| 8 | `assets/inbox/generated/<slug>/<assetSlug>/v00N.png` | 上書き禁止 |
| 9 | `patches/visual-assets/<slug>/<assetSlug>.json` | Visual Register が生成、Sanity 手動反映用 |
| 10 | Sanity Studio（人間） | `visualAssetPlan.localAssetPath` 等を手動入力 |
| 11 | `publish-packages/<platform>/<slug>/...` | builder script で生成 |
| 12 | `publish-packages/campaigns/<slug>-release-review/*.md` | 人間レビュー文書 |

## 3. 例: building-hitori-media-os（selected: X / Threads / note / Substack）

### Generated text records

| platform | platformOutput | 補助 plan record |
| --- | --- | --- |
| X | `platformOutput.building-hitori-media-os.x` | （なし） |
| Threads | `platformOutput.building-hitori-media-os.threads` | （なし） |
| note | `platformOutput.building-hitori-media-os.note` | （なし） |
| Substack | `platformOutput.building-hitori-media-os.substack` | `substackPostPlan.building-hitori-media-os` + `substackNotesPlan.building-hitori-media-os` + `substackGrowthAction.building-hitori-media-os.about-page-update` |

### Generated visual records (visualAssetPlan)

| ID | platform | assetType | priority | reusePolicy |
| --- | --- | --- | --- | --- |
| `note-hero-v1` | note | hero | P1 | platform-specific（master を substack-header と共有） |
| `substack-header-v1` | substack | hero | P1 | platform-specific（master 共有） |
| `x-hook-main-v1` | x | hook-image | P1 | variant-required |
| `threads-support-diagram-v1` | threads | section-diagram | P2 | variant-required |
| `note-inline-content-os-flow-v1` | note | flow-diagram | P2 | platform-specific |
| `note-inline-human-judgment-v1` | note | section-diagram | P2 | platform-specific |
| `note-inline-manual-vs-automation-v1` | note | comparison-diagram | P2 | platform-specific |
| `note-inline-publish-package-folder-v1` | note | architecture-diagram | P3 | platform-specific |
| `substack-inline-reader-system-v1` | substack | section-diagram | P3 | platform-specific |

### Generated prompt tasks（image / draft）

- `tasks/visuals/building-hitori-media-os/note-hero-v1.md`
- `tasks/visuals/building-hitori-media-os/x-hook-main-v1.md`
- `tasks/visuals/building-hitori-media-os/threads-support-diagram-v1.md`
- ... 各 visualAssetPlan に対応する brief 1 ファイル
- text draft 用は `outputs/<platform>/<date>--<slug>--<platform>.md` に直接生成

### Generated publish packages

```
publish-packages/
  note/building-hitori-media-os/
    article.md / insert-map.md / images/
  substack/building-hitori-media-os/
    post.md / notes.md / about-page.md / welcome-email.md / images/
  x/building-hitori-media-os/
    threads.md / hooks.md
  threads/building-hitori-media-os/
    support-thread.md
  campaigns/building-hitori-media-os-release-review/
    final-human-checklist.md / note-final-review.md / substack-final-review.md / x-final-review.md / threads-final-review.md
```

### Human gates in this example

1. selectedPlatforms 決定（人間）
2. claims / objections の最終確認（人間）
3. visual candidate の v00N から採用版選定（Visual Register Inbox Review）
4. Sanity Studio で visualAssetPlan.localAssetPath 手動入力
5. release-review checklist の最終確認
6. 各 platform への manual publish

## 4. Automation Level の3層

| Level | 範囲 | 例 |
| --- | --- | --- |
| **manual** | 全 step を人間が trigger、AI は generation のみ補助 | 現在の building-hitori-media-os |
| **semi-auto** | text draft / image prompt の生成は automated、人間レビューゲートあり | 次フェーズ |
| **auto-eligible** | image_gen までを自動、ただし Visual Register と公開は依然 human gate | long-term |

`promptTemplate.automationLevel` がこの3層を決める。**完全な auto-posting は scope 外**（長期凍結）。

## 5. Future Hooks（Campaign Plan schema を入れる場合）

提案中: `schemas/proposed/_design-campaignPlan.md`（[本バッチで生成](../schemas/proposed/_design-campaignPlan.md)）。

このフローの「2. selectedPlatforms 決定」と「3. Campaign Plan generate」を Sanity document 化することで:

- selectedPlatforms / per-platform 設定を 1 record で管理
- progress tracking（draft / visual / publish-package / published）を campaign 単位で観測
- structure builder に「By Campaign」ビューを追加

ただし、本バッチでは activate しない。

## 6. Out of scope

- automated publishing（X / Substack / note API 呼び出し）
- paid LLM ベースの draft 生成（Anthropic / OpenAI SDK 追加）
- 既存 schema の破壊的変更
- ai-blog-db キャンペーンへの影響

## 7. 次バッチへの推奨

1. `schemas/proposed/campaignPlan.ts` を sketch（active 化なし）
2. building-hitori-media-os を 1 件目の campaignPlan seed として書き出す（`seed/campaign-plan-building-hitori-media-os.json`）
3. visualAssetPlan の expected list と campaignPlan の requiredAssets の対応を確認
4. structure builder の "By Content Idea" を将来 "By Campaign" にも拡張できるよう余地を残す
