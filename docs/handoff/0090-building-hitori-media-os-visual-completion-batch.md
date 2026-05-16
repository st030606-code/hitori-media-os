# Handoff: building-hitori-media-os Visual Completion Batch (text-first 4)

Date: 2026-05-14

## 1. Task Goal

公開を急がず、text-first 4 platforms（X / Threads / note / Substack）の **production visual** を準備する。8 個の production visualAssetPlan を additive seed で定義し、それぞれに paste-ready な generation prompt を含む brief を用意し、公開直前レビュー側にも per-platform images-plan + summary を配置する。video / audio 系と顔写真ワークフローは意図的に対象外。

## 2. Constraints Followed

- Next.jsは追加していない。
- paid image generation API integration は追加していない。
- paid LLM API integration は追加していない。
- OpenAI API / Anthropic API clients は追加していない。
- external APIは呼んでいない。
- Sanity direct writeは実装していない。
- Sanity CLI create/update commandsは実行していない。
- `seed --replace` は実行していない。
- 実project ID、APIキー、トークン、認証情報、シークレットは追加していない。
- 有料PDF本文の引用は含めていない。
- 新規 media file（実画像 / 動画 / 音声）は生成していない。
- fake final image file は作っていない（実生成前は `localAssetPath` 空のまま）。
- 既存の Visual Register test 画像を public asset として転用していない。
- 既存ファイルを破壊的に上書きしていない。
- 顔写真ワークフローはこのバッチで扱っていない。

## 3. Changed Files

### Added (seed)

- `seed/visual-asset-plan-records-building-hitori-media-os.json`（8 records、additive）

### Modified (tooling, additive only)

- `tools/publish-package-builder/build.mjs`（per-slug seed file `seed/visual-asset-plan-records-${contentSlug}.json` を追加 load する数行の拡張）

### Added (briefs)

- `tasks/visuals/building-hitori-media-os/_inventory.md`
- `tasks/visuals/building-hitori-media-os/_style-guide.md`
- `tasks/visuals/building-hitori-media-os/_workflow.md`
- `tasks/visuals/building-hitori-media-os/note-hero-v1.md`
- `tasks/visuals/building-hitori-media-os/substack-header-v1.md`（shares master）
- `tasks/visuals/building-hitori-media-os/x-hook-main-v1.md`
- `tasks/visuals/building-hitori-media-os/threads-support-v1.md`
- `tasks/visuals/building-hitori-media-os/note-inline-content-os-flow-v1.md`
- `tasks/visuals/building-hitori-media-os/note-inline-manual-vs-automation-v1.md`
- `tasks/visuals/building-hitori-media-os/note-inline-publish-package-folder-v1.md`
- `tasks/visuals/building-hitori-media-os/substack-inline-reader-system-v1.md`

### Added (docs)

- `docs/42-diagram-plan-vs-visual-asset-plan-vs-publish-package.md`
- `docs/devlog/0078-building-hitori-media-os-visual-completion-batch.md`
- `docs/handoff/0090-building-hitori-media-os-visual-completion-batch.md`

### Added (release-review)

- `publish-packages/campaigns/building-hitori-media-os-release-review/x-images-plan.md`
- `publish-packages/campaigns/building-hitori-media-os-release-review/threads-images-plan.md`
- `publish-packages/campaigns/building-hitori-media-os-release-review/note-images-plan.md`
- `publish-packages/campaigns/building-hitori-media-os-release-review/substack-images-plan.md`
- `publish-packages/campaigns/building-hitori-media-os-release-review/visual-completion-summary.md`

### Modified (handoff index)

- `docs/handoff/latest.md`

### Confirmed unchanged

- `seed/visual-asset-plan-records.json`（5 records、既存 ai-blog-db）
- `seed/visual-asset-plan-records-test-*.json`（3 records、既存 test）
- `schemas/index.ts`, `sanity.config.ts`, 既存スキーマ全般
- 既存 outputs / publish-packages 本体
- ai-blog-db の visualAssetPlan / publish-package
- `tools/local-check.mjs`（count 期待値は main=5 / test=3 のまま green）

## 4. Summary of Changes

### 8 Production visualAssetPlan records

| ID | Platform | Type | Aspect | Reuse | Priority |
| --- | --- | --- | --- | --- | --- |
| `note-hero-v1` | note | hero | 16:9 | reusable (shared with substack-header) | P1 |
| `substack-header-v1` | substack | hero | 16:9 | reusable (shares master) | P1 |
| `x-hook-main-v1` | x | hook-image | 16:9 | variant-required | P1 |
| `threads-support-v1` | threads | paired-post-visual | 4:5 | variant-required | P2 |
| `note-inline-content-os-flow-v1` | note (inline) | flow-diagram | 16:9 | reusable | P2 |
| `note-inline-manual-vs-automation-v1` | note (inline) | comparison-diagram | 16:9 | reusable | P2 |
| `note-inline-publish-package-folder-v1` | note (inline) | architecture-diagram | 16:9 | reusable | P3 |
| `substack-inline-reader-system-v1` | substack (inline) | section-diagram | 16:9 | platform-specific | P3 |

### Builder Enhancement

```js
// 既存
const baseVisualPlans = await readJsonIfExists('seed/visual-asset-plan-records.json', [])
// 追加
const campaignVisualPlans = await readJsonIfExists(
  `seed/visual-asset-plan-records-${contentSlug}.json`,
  [],
)
const visualPlans = [...baseVisualPlans, ...campaignVisualPlans]
```

ai-blog-db には `seed/visual-asset-plan-records-ai-blog-db.json` が存在しないため挙動不変。test seeds は別命名なので未読込みのまま。

### Concept Doc

`docs/42-diagram-plan-vs-visual-asset-plan-vs-publish-package.md` で:

- diagramPlan = concept
- visualAssetPlan = production unit
- publish-package images/ = distribution

の3層を明示。混同したときに参照する地図。

## 5. Important Decisions

- 公開を急がず、visual を先に揃える方針へ転換。
- 8 asset で P1 = 3、P2 = 3、P3 = 2 と優先度を明示。
- `note-hero-v1` と `substack-header-v1` は **同じ master file** を共有（1ファイルで2用途）。
- video / audio / 顔写真 / Instagram carousel は out-of-scope。
- builder への変更は最小限（数行 additive）。既存挙動は完全に維持。
- スタイル・ガイドを先に書いて、トーンが asset 間でブレないようにした。
- 実生成前は `localAssetPath` を空のままにする（fake 状態を避ける）。

## 6. Human Review Questions

- 8 asset の優先度（P1 / P2 / P3）と `_inventory.md` の生成順は妥当か。
- `_style-guide.md` の visual vocabulary（app-like / structured / clean / diagram-friendly / trust-building）に違和感はないか。
- アクセント色を「控えめなウォーム or 落ち着いた青緑」と曖昧にしているが、ChatGPT 生成前に1色を確定するか、生成後に選ぶか。
- `note-hero-v1` と `substack-header-v1` を同 master で運用する方針でよいか。
- note inline 3点を全部揃えてから note を公開するか、hero だけで先に公開するか。
- Substack inline (P3) を Substack 初回公開と同時に出すか、後追いで出すか。

## 7. Risks or Uncertainties

- ChatGPT 画像生成は出力品質にばらつきがある。1 asset で 2〜3回再生成が必要になる可能性が高い。
- スタイル・ガイドはあるが、最初の `note-hero-v1` が出来上がるまで「トーンの基準」は確定しない。1枚目の review に時間を使う想定。
- `campaign-hero-v1.png` を note と Substack で **完全に同じファイル** にする運用は、Visual Register の二重登録ミスが起きやすい。`_workflow.md` の Shared File Handling 節に明記してあるが、人間レビュー時に再確認が必要。
- `note-inline-publish-package-folder-v1` の brief は実装の英字スペル（`safe-skip-existing-files` / `placeholder detection` / `dry-run` / `--replace-placeholder-package`）を含むため、ChatGPT 生成時にハイフン / アンダースコアの誤字が起きやすい。生成後の目視確認が重要。
- builder の per-slug seed 拡張により、将来「`visual-asset-plan-records-<slug>.json`」という命名ルールが暗黙の前提になる。docs/42 と handoff で明示済みだが、別途 README に書く案もあり。

## 8. Recommended Next Step

短期（人間レビュー駆動・コード変更ゼロ）:

1. 人間がこのhandoffと `visual-completion-summary.md` を読む。
2. `_inventory.md` と `_style-guide.md` のトーンに合意する。
3. `note-hero-v1.md` の "Generation Prompt" を ChatGPT に貼り付けて1枚目を生成する。
4. `_workflow.md` の8ステップに従って Visual Register 登録 → Sanity 反映 → publish-package 配布まで1サイクル回す。
5. その master file を「トーンの基準」として、`x-hook-main-v1` を続けて生成。
6. P1 が揃ったら、`npm run publish:package -- building-hitori-media-os --dry-run --replace-placeholder-package` で配布計画を確認。
7. 反応次第で P2 / P3 へ進む。

中期（後続バッチ候補）:

- 顔写真ワークフロー設計（YouTube / Shorts thumbnail / podcast artwork で顔合成を扱う場合）
- Instagram carousel slides 2〜7
- GitHub README architecture（ai-blog-db の流用検討）
- `substackSubscriberMilestone` / `substackPaidReadiness` 活性化（subscribers が動き始めたら）

## 9. Exact Prompt to Give Codex Next

```text
Generate and register note-hero-v1 (shared with substack-header-v1) for building-hitori-media-os.

Do not add Next.js.
Do not add paid LLM or image generation API integrations.
Do not call external APIs.
Do not auto-post.
Do not write directly to Sanity from code.
Do not run seed --replace.
Do not commit the original paid PDF or any verbatim long passages from it.
Do not use existing Visual Register test images as public assets.
Do not create fake final image files.

Use:
- tasks/visuals/building-hitori-media-os/_inventory.md
- tasks/visuals/building-hitori-media-os/_style-guide.md
- tasks/visuals/building-hitori-media-os/_workflow.md
- tasks/visuals/building-hitori-media-os/note-hero-v1.md
- tasks/visuals/building-hitori-media-os/substack-header-v1.md
- seed/visual-asset-plan-records-building-hitori-media-os.json
- publish-packages/campaigns/building-hitori-media-os-release-review/visual-completion-summary.md

Workflow:
1. Read the Generation Prompt from tasks/visuals/building-hitori-media-os/note-hero-v1.md.
2. Wait for the human to paste it into ChatGPT image generation and produce an acceptable image.
3. Once the human confirms the image is acceptable, support the manual save at:
   assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png
4. Walk the human through Visual Register registration (npm run visual:register) and verify the patch JSON output.
5. Walk the human through updating Sanity Studio for BOTH visualAssetPlan.note-hero-v1 AND visualAssetPlan.substack-header-v1 (same localAssetPath).
6. Run "npm run publish:package -- building-hitori-media-os --dry-run" to confirm the file is planned for copy into publish-packages/note/.../images/ and publish-packages/substack/.../images/.
7. Do not regenerate, double-register, or write any fake localAssetPath value.

Document:
- the exact image used (with timestamp)
- the prompt version (file path + last commit hash if useful)
- any Visual Register / Sanity issues encountered
- whether the master file is considered "tone reference" for the remaining 7 assets

Update devlog and handoff.
```
