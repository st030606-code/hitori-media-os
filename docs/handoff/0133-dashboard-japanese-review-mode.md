# Handoff: Admin Dashboard Japanese Review Mode v0.2

Date: 2026-05-18

## 1. Task Goal

Working Pipeline Step G が完了し、boss が最終公開判断に進む前のフェーズで dashboard UI を日本語化 + 公開前レビュー視点に組み替える。Phase Admin 1 の read-only 性は維持し、Sanity 書き込み・スキーマ変更・auth 変更は行わない。

## 2. Constraints Followed

- ✅ Sanity への書き込みなし
- ✅ `assets/visuals` 改変なし
- ✅ `patches/` 改変なし
- ✅ `publish-packages` の dashboard 外 outputs 改変なし
- ✅ deploy なし
- ✅ 自動投稿なし
- ✅ auth 変更なし
- ✅ パッケージ追加なし（依存変更なし）
- ✅ data model / schema 変更なし
- ✅ 既存ルート全 16 件動作維持
- ✅ 開発者向け詳細を消さず `<details>` の中へ移動

## 3. Changed Files

新規:

- `dashboard/src/lib/statusJa.ts` — `statusLabelJa(status)` / `statusTone(status)`
- `dashboard/src/lib/assetRoleJa.ts` — `assetRoleJa(slug)` / `assetSlugFromId(id)`
- `dashboard/src/components/WorkingPipelineStatus.tsx` — Working Pipeline 6 段表示
- `dashboard/src/components/NextActionChecklist.tsx` — boss の次のアクション 5 ステップ
- `dashboard/src/components/ReleaseReviewLinks.tsx` — 5 release-review markdown へのパス一覧
- `dashboard/src/components/PublishReadinessBoard.tsx` — 媒体別 ready / 画像サマリ / 残り作業

変更:

- `dashboard/src/components/AppNav.tsx` — 7 nav ラベルを日本語化（URL 不変）
- `dashboard/src/app/page.tsx` — Home 全面リライト（Working Pipeline / Next Action / Release Review Links を主役、データセット数値カードは `<details>` の中）
- `dashboard/src/app/campaigns/[slug]/page.tsx` — `PublishReadinessBoard` + `ReleaseReviewLinks` を `CampaignStatusCard` の直後に挿入
- `dashboard/src/app/visual-assets/page.tsx` — 見出し・summary・bucket section・テーブルヘッダを日本語化、`assetRoleJa()` を主表示、開発者向け詳細を `<details>` へ

新規 docs:

- `docs/devlog/0122-dashboard-japanese-review-mode.md`
- `docs/handoff/0133-dashboard-japanese-review-mode.md`（本ファイル）
- `docs/handoff/latest.md`（本ファイルをミラー）

## 4. Summary of Changes

UI 変更を「ラベル翻訳」ではなく「視点の組み替え」として実施。

- **Home** は「対象キャンペーン → Working Pipeline 進捗 → 次にやること（ボス）→ 公開前レビュー資料 → 詳細情報（dataset 数値）→ 外部ツール」の順に構成し直し、boss が 3 秒で技術完了 + 残作業を読み取れる。
- **Campaign detail** は既存セクションを保ちつつ、`CampaignStatusCard` の直下に `PublishReadinessBoard` + `ReleaseReviewLinks` を挿入。下流の `NextActionSummary` / `ContentIdea` / `BrandProfile` / `SelectedPlatform` / `HumanReviewGate` / `VisualAssetStatusTable` / `PromptTemplateSummary` / `PublishPackageLinks` / `ManualPublishingStatusList` / `ExternalLinks` はそのまま。
- **Visual Assets** は bucket に `skipped` を追加して 2 件の意図的保留を別 section で表示、`asset` 列で人間可読な役割（例: 「note本文図解：人間判断」）を主表示し、技術 ID / path は `<details>詳細情報</details>` へ。

`StatusBadge` 自体は触らず、呼び出し側で `label={statusLabelJa(status)}` を渡す方針。toneFor の英語 enum マッチはそのまま機能する。

## 5. Key Decisions

- **Working Pipeline / 公開準備ボードは静的に表現**: Sanity クエリ結果の揺れで状態が変わると boss の信頼が下がる。「2026-05-18 時点の人間確認済 Working Pipeline 状態」を component 内に固定し、次の Working Pipeline サイクルで再評価する。
- **開発者向け詳細は <details> の中に保存**: 削除すると後日のトラブル再現性が失われる。boss の視界からは外しつつ、必要なときに 1 クリックで開ける。
- **status 日本語ラベルは外部マップに集約**: `statusLabelJa` を 1 ファイルに集めたので、新ステータスが増えても追加点は 1 箇所。`StatusBadge.toneFor` は触らず（英語 enum のまま）。
- **依存・スキーマ追加なし**: 全変更が既存 React/Next + Tailwind の範疇で完結。npm install / sanity schema 変更不要。
- **per-campaign 拡張は v0.3 で**: 現状 Working Pipeline / 公開準備ボード / Release Review Links は building-hitori-media-os 固定。次キャンペーンが入ったときに per-campaign で derive する設計に発展。

## 6. Human Review Questions

- nav labels（「確認待ち」「画像・図解素材」「作業ログ」「診断」「配布パッケージ」）の単語選定は boss の語感と合うか？特に「Human Review Gates → 確認待ち」が妥当か。
- `PublishReadinessBoard` の「note本文図解：2枚完了 / 2枚保留」表記は正確に読み取れるか？「2/4 完了」表記の方が直感的か。
- Home から英語 Overview card 4 件を `<details>` に格納したが、表示頻度が高ければ視認性を優先して戻すべきか。
- `assetRoleJa` の 9 件ラベル（「note / Substack 共通ヒーロー」「Threads補助図解」など）は boss 用語と合っているか。

## 7. Risks or Uncertainties

- **building-hitori-media-os ハードコード**: `WorkingPipelineStatus` / `PublishReadinessBoard` / `ReleaseReviewLinks` が campaign を区別しない。次キャンペーンが入ると古い campaign の状態を全画面で出してしまうリスク。v0.3 で per-campaign 化が必要。
- **dataset から取得できる豊富な dynamic 情報を Home 最上段から外したことで、複数 campaign 運用時に「対象キャンペーン」が古いままになる可能性**: 現状は `dashboardHomeQuery.latest` が「最終更新キャンペーン」を返すので 1 campaign 運用では問題ないが、複数 campaign 並走時は「対象」表示が混乱する。
- **`<details>` 折り畳みを開かないと dev info が見えない**: トラブル時に boss / 開発者が `_id` / `localAssetPath` を探すとき、`<details>` を開く必要があることを伝えていないと探しにくい。
- **Next.js 16.2.6 + Turbopack**: turbopack の `unexpected file in NFT list` 警告（既存）はそのまま残存。本変更で増えていない。

## 8. Recommended Next Step

1. boss が dashboard を `npm run dev`（dashboard 配下）で起動し、Home → Campaigns/[slug] → Visual Assets の 3 画面を音読
2. nav labels / Working Pipeline 段ラベル / 公開準備ボード ラベル / status 日本語に違和感があれば修正
3. 違和感なければ v0.3 計画へ: `WorkingPipelineStatus` / `PublishReadinessBoard` を per-campaign 化（slug を prop で受け、release-review path を derive）
4. v0.3 ではあわせて `StatusBadge` に `labelJa?: boolean` prop を追加し、呼び出し側で `statusLabelJa` を 1 つずつ通さない設計へ整理

## 9. Exact Prompt to Give Codex Next

```text
Implement Admin Dashboard Japanese Review Mode v0.3:
per-campaign expansion of v0.2 static components.

Goal:
Replace the building-hitori-media-os hardcoded state in
WorkingPipelineStatus / PublishReadinessBoard / ReleaseReviewLinks
with per-campaign derivation.

Hard Rules:
- Do NOT write to Sanity.
- Do NOT modify assets/visuals.
- Do NOT modify patches.
- Do NOT change data model/schema.
- Do NOT add new packages.
- Keep all existing routes working.

Tasks:
1. Accept a `slug` (or `campaignId`) prop in WorkingPipelineStatus,
   PublishReadinessBoard, ReleaseReviewLinks.
2. Derive ReleaseReviewLinks file paths from
   campaignPlan.releaseReviewPath in Sanity. If absent, fall back to
   publish-packages/campaigns/<slug>-release-review/.
3. Derive PublishReadinessBoard platform readiness from
   campaignPlan.selectedPlatforms + manualPublishingStatus +
   visualAssetDetails (saved / skipped / pending).
4. Derive WorkingPipelineStatus from a small lookup table indexed by
   campaignPlan.slug. Keep the static fallback for unknown slugs.
5. Update Home to pass `data.latest.slug` into the 3 components.
6. Update Campaigns/[slug] to pass campaign.slug into the 3 components.
7. Optional: add StatusBadge `useJaLabel?: boolean` prop that calls
   statusLabelJa() internally. Migrate one page first as a check.

Validation:
- cd dashboard && npm run build
- npm run build (Sanity Studio)
- Open / and /campaigns/building-hitori-media-os, confirm
  no visual regression.

Docs:
- docs/devlog/<番号>-dashboard-japanese-review-mode-v0-3.md
- docs/handoff/<番号>-dashboard-japanese-review-mode-v0-3.md
- docs/handoff/latest.md (mirror)
```
