# Devlog 0084: First Production Visual Run Prep (note-hero-v1)

Date: 2026-05-14

## 今日の判断

production visual の最初の1サイクルを人間が回せる状態に揃えました。

- Codex Phase 1 safety review の **公式記録場所** を `docs/devlog/0083-codex-safety-review-result-2026-05-14.md` に placeholder として作成（status: `pending-human-codex-review`）。実行は人間判断。
- 最初の production image generation handoff を `tasks/visuals/building-hitori-media-os/_first-production-image-run.md` に集約。
- 対象は `note-hero-v1`（Substack header と master 共有のため、1枚で2用途）。
- release-review package（final-human-checklist / note-final-review / substack-final-review）に "First Visual Action" 項目を追加。
- 実画像を1枚も生成していない。`assets/visuals/...` / `private/` は本バッチで触っていない。

## 変更したこと

### Added

- `docs/devlog/0083-codex-safety-review-result-2026-05-14.md`（placeholder、`pending-human-codex-review`）
- `tasks/visuals/building-hitori-media-os/_first-production-image-run.md`（最初の生成 handoff、11 セクション）
- `docs/devlog/0084-first-production-visual-run-prep.md`（本devlog）
- `docs/handoff/0095-first-production-visual-run-prep.md`

### Modified

- `publish-packages/campaigns/building-hitori-media-os-release-review/final-human-checklist.md`（First Visual Action ブロックを Production Visual Readiness 節の冒頭に追加）
- `publish-packages/campaigns/building-hitori-media-os-release-review/note-final-review.md`（First Visual Action サブ節を追加）
- `publish-packages/campaigns/building-hitori-media-os-release-review/substack-final-review.md`（First Visual Action サブ節を追加、master 共有方針を再強調）
- `docs/handoff/latest.md`

### Confirmed unchanged

- `tools/visual-register/`、`tools/publish-package-builder/`、`tools/local-check.mjs`、`schemas/`、`sanity.config.ts`
- `outputs/...` テキスト本文
- `assets/visuals/...`（実画像 0 枚生成）
- `private/` 配下
- 既存 ai-blog-db 関連

## なぜ note-hero-v1 が最初か

- shared master: note hero と Substack header の両方で同じ master file を使う。1 枚生成すれば 2 用途に貢献。
- 公開ゲート: X / note / Substack の初回手動公開で、note 記事冒頭と Substack header / Social Preview が空のままだと "未完成感" が出る。
- flow 全段テスト: 「生成 → inbox 保存 → Visual Register Inbox Review → approve & register → patch JSON → Sanity 手動反映 → publish-package 配布」の 8 段階を 1 サイクル通して、運用ルールの抜けを早く見つける。

## Codex Phase 1 safety review status

- 実行 **任意**。
- 実行しなくても、人間目視レビューで `tasks/reviews/visual-register-inbox-codex-review.md` の A〜I を確認できれば同等の品質ゲート。
- 実行する場合、結果は `docs/devlog/0083-codex-safety-review-result-2026-05-14.md` の "Codex Review Output" / "Outcome" セクションに paste。
- Critical Issues があれば、production image registration に進む前に新バッチで Claude Code に修正を依頼。
- Warnings は `docs/handoff/latest.md` の "Risks or Uncertainties" に転記。

## first production image generation handoff の構造

`tasks/visuals/building-hitori-media-os/_first-production-image-run.md` は次を含む:

1. First Target Asset（note-hero-v1）
2. Why This Asset First（shared master / 公開ゲート / flow 全段テスト）
3. Source Brief（`note-hero-v1.md`）
4. Candidate Save Path（inbox v00X 連番）
5. Final Expected Path（seed の `expectedLocalAssetPath` に従う）
6. Human Steps（10 step）
7. Review Criteria（9 観点）
8. Regeneration Loop（v00X 連番、上書き禁止）
9. After This First Cycle（次の asset 順）
10. Safety（インボックス経由 / 手動 Sanity 反映 / private/ 不触）
11. Related Files

## release-review package 更新

- `final-human-checklist.md`: Production Visual Readiness 節の冒頭に **First Visual Action** ブロックを追加。`note-hero-v1` を最初に処理することを明示。
- `note-final-review.md`: Production Visual Readiness 節の冒頭に **First Visual Action** サブ節を追加。candidate path / final path / master 共有の Sanity 反映を明示。
- `substack-final-review.md`: 同じく **First Visual Action** サブ節を追加。Substack 側は再生成せず、note master を流用する手順を強調。

`outputs/...` テキスト本文 / publish-packages 本体は touch していない。

## 安全性の担保

- 実画像 0 枚生成。`assets/visuals/...` 未変更。
- private/ 未変更。
- direct Sanity write の grep → 0 hits（不変）。
- paid API integration の grep → 0 hits（不変）。
- Visual Register Inbox Review の bypass なし。
- `seed --replace` / Sanity CLI 未実行。

## CodexとClaude Codeの役割分担

- Claude Code（今回）: Codex review placeholder / 生成 handoff / release-review 更新。
- 人間: 実画像生成（ChatGPT or Codex）→ inbox 保存 → Visual Register 承認 → Sanity 手動反映。
- Codex（任意）: Phase 1 safety review、Phase 2 prompt 推敲、Phase 3 candidate 生成。

## APIなしで済ませた理由

設計と docs のみ。LLM API / 画像生成 API / Sanity API / 外部翻訳 API は一切呼んでいない。

## 発信コンテンツにできる切り口

- 「最初の1枚」をどう設計するかの判断（shared master を選ぶ理由）。
- placeholder を意図的に用意して「未実行」を記録する運用。
- production cycle を急がず、1 asset で flow 全段を試す段階主義。

## 検証

- `node --check tools/visual-register/server.mjs` / `tools/visual-register/public/app.js` / `tools/publish-package-builder/build.mjs` / `tools/local-check.mjs` → 全て成功
- `npm run local:check` → `ok: true`（全 15 チェック green）
- `npm run build`（sanity build）→ 7.6s で成功
- direct Sanity write の grep → 0 hits
- paid API integration の grep → 0 hits
- `assets/visuals/building-hitori-media-os` 配下に新規ファイル無し（前バッチ以前から残るファイルは未変更）
- `private/` 配下に新規ファイル無し

## 次にテストすること

人間レビュー駆動:

1. （任意）Codex Phase 1 safety review を実行 → 結果を `docs/devlog/0083-...md` に貼る。
2. ChatGPT or Codex で `note-hero-v1` の candidate を生成。
3. `assets/inbox/generated/building-hitori-media-os/note-hero-v1/v001.png` に保存。
4. Visual Register を起動（旧プロセスは `lsof -ti :3334 | xargs kill`）。
5. Inbox Review で `approve & register`。
6. patch JSON / Sanity 手動反映を完了。
7. `npm run publish:package -- building-hitori-media-os --dry-run` で配布計画確認。
8. 採用後の v001 以外の candidate は inbox に残す or 人間が削除する判断。
9. 次は `x-hook-main-v1` 。
