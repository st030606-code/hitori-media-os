# Production Visual Generation Guide: building-hitori-media-os

Date: 2026-05-14

このドキュメントは、building-hitori-media-os キャンペーンの **production visual** を、Visual Register Inbox Review 経由で生成・採用するための実行ガイドです。

## Why Production Visuals Are Needed Before Publishing

- text 本文だけで X / note / Substack を公開しても、preview や header が空のままだと「未完成感」が出る。
- Visual Register Inbox Review のテストで使った **デモ画像 / 試験画像は public asset に転用しない**。デモ画像が SNS preview に出ると、completion / build-in-public のトーンが崩れる。
- ChatGPT / Codex 候補 → 人間レビュー → final 採用、というフローを1サイクル回しておかないと、公開直前にバタつく。

## Why Test Images Must Not Be Used

- Visual Register の test seed 画像（`visual-asset-plan-records-test-trail-training.json` で参照されるもの）は **開発検証用**。
- ai-blog-db の既存 final 画像（`note-hero-v1.png` / `x-hook-before-after-v1.png` 等）は **別キャンペーン用** であり、building-hitori-media-os の visual には流用しない。
- Visual Register Inbox Review でフロー検証に置いたダミー画像があるなら、production 採用前に削除し、本生成 candidate に置き換える。

## Scope: Text-First 4 Platforms

このバッチで扱うのは text-first 4 platforms 向けの production visual:

- X（main hook image）
- Threads（support diagram）
- note（hero + inline 図解 ×2）
- Substack（header（note hero と共有） + inline 図解）

合計 7 visualAssetPlan（canonical）。詳細は [tasks/visuals/building-hitori-media-os/_inventory.md](../tasks/visuals/building-hitori-media-os/_inventory.md) を参照。

## Intentionally Deferred

このバッチでは扱わない:

- **YouTube long-form サムネ**（顔写真を含む可能性）
- **Shorts thumbnail / face-based cover** バリエーション
- **Podcast cover**（顔写真を使うかどうか未確定）
- **Instagram carousel slides**（2〜7 枚）
- **GitHub README architecture diagram**（ai-blog-db の流用検討）

顔写真を扱うワークフローは、別バッチで設計・実装する。本バッチでは触らない。

## Generation Order

公開可能性を最短で確保する順:

1. **`note-hero-v1`**（同時に `substack-header-v1` のマスターとして流用）
2. **`x-hook-main-v1`**
3. **`threads-support-diagram-v1`**
4. **`note-inline-content-os-flow-v1`**
5. **`note-inline-human-judgment-v1`**
6. **`substack-inline-reader-system-v1`**（任意 P3）

`note-hero-v1` + `x-hook-main-v1` だけでも、X 投稿 + Substack ヘッダーつき初公開は成立する。

## Local Inbox Flow

各 asset について、次のフローで進める:

```text
1. 生成（手動）
   ChatGPT / Codex CLI で candidate 画像を出す
   ↓
2. inbox 保存
   assets/inbox/generated/building-hitori-media-os/<asset-slug>/v001.png
   ↓
3. Visual Register 起動 / 再起動
   npm run visual:register
   ↓
4. Inbox Review で candidate を確認
   - Plan auto-suggest
   - サムネ / final path / 警告 を確認
   ↓
5. approve & register
   - assets/visuals/.../<final>.png へ copy
   - patches/visual-assets/<slug>/<asset-name>.json 作成
   - manifest の reviewStatus が registered に
   ↓
6. patch JSON 確認
   Patch Review カードで内容を check
   ↓
7. Sanity Studio で手動反映
   localAssetPath / status / reviewNotes を Studio で更新
   ↓
8. Publish Package を必要に応じて refresh
   npm run publish:package -- building-hitori-media-os --dry-run
   問題なければ flag なしで実行（safe-skip 動作のため上書きされない）
```

**important**: candidate を **直接 final path に保存しない**。必ず inbox 経由 → Visual Register approve & register。

## Visual Review Criteria

各 candidate を Visual Register Inbox Review で判定するときの観点:

1. **Message clarity**: coreThesis「発信を頑張るより、発信が回る仕組みを作る」が中心にあるか
2. **Readability**: preview crop（特に 1.91:1 / 4:5 / 1:1 のいずれか）で文字が読めるか
3. **Visual consistency**: 同キャンペーン内の他アセットと base / accent / font が揃っているか
4. **No misleading claims**: 「完全自動化」「稼げる」「保証」などの煽りが含まれていないか
5. **No fake UI data**: 偽の subscriber 数、偽の dashboard 画面、偽の reaction 数などを描いていないか
6. **No private/secret info**: secret / 実 project ID / API トークン / subscriber メール / private/ ファイル名が画像に映っていないか
7. **Platform fit**: 対象 platform の aspect / preview crop で適切に表示されるか
8. **No face photo**: このバッチでは顔写真ワークフローを扱わないため、顔写真 / AI generated avatar が含まれていないか

不合格項目があれば `needs-regeneration` で manifest に記録し、再生成する。

## When To Use Codex CLI (Optional)

Codex CLI を持っている場合:

- Phase 1（コードレビュー）: バッチ完了時に `tasks/reviews/codex-code-review-template.md` で safety review。
- Phase 2（prompt 推敲）: 候補がうまく出ないとき、Codex に prompt を直してもらう。
- Phase 3（candidate 生成）: Codex に直接画像を生成してもらい inbox に保存。

Codex を使わない場合: ChatGPT 画像生成 + Visual Register Inbox Review で完結する。

詳細は [docs/44-codex-cli-optional-workflow.md](44-codex-cli-optional-workflow.md) を参照。

## Safety Reaffirmation

- 候補は inbox にのみ保存。final path への直接書き込み禁止。
- Visual Register approve & register が承認ゲート。
- Sanity への反映は手動。`localAssetPath` / `status` / `reviewNotes` を Studio で更新。
- paid image generation API / direct Sanity write / auto-posting / `seed --replace` / 顔写真 / 有料PDF引用 / secret コミット は禁止。
- 既存 ai-blog-db 関連 / private/ には触らない。

## Related Docs / Files

- [docs/43-visual-register-inbox-review-workflow.md](43-visual-register-inbox-review-workflow.md)
- [docs/44-codex-cli-optional-workflow.md](44-codex-cli-optional-workflow.md)
- [docs/42-diagram-plan-vs-visual-asset-plan-vs-publish-package.md](42-diagram-plan-vs-visual-asset-plan-vs-publish-package.md)
- [tasks/visuals/building-hitori-media-os/_inventory.md](../tasks/visuals/building-hitori-media-os/_inventory.md)
- [tasks/visuals/building-hitori-media-os/_style-guide.md](../tasks/visuals/building-hitori-media-os/_style-guide.md)
- [tasks/visuals/building-hitori-media-os/_workflow.md](../tasks/visuals/building-hitori-media-os/_workflow.md)
- [tasks/visuals/_codex-image-generation-template.md](../tasks/visuals/_codex-image-generation-template.md)
- [assets/inbox/generated/README.md](../assets/inbox/generated/README.md)
- [publish-packages/campaigns/building-hitori-media-os-release-review/visual-completion-summary.md](../publish-packages/campaigns/building-hitori-media-os-release-review/visual-completion-summary.md)
