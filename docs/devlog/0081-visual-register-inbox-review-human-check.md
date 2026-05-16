# Devlog 0081: Visual Register Inbox Review — Human UI Check (passed)

Date: 2026-05-14

## 今日の判断

前バッチで実装した **Visual Register Inbox Review** を人間がブラウザで確認し、運用に進める判断をしました。

- Inbox Review カードの表示・動作は OK。
- candidate review flow（candidate / approved / rejected / needs-regeneration / registered）が想定通り。
- Visual Register が引き続き「承認・final adoption の source of truth」として機能。
- 既存のアップロード型 register / Patch Review / Content Idea filter / batch registration / test seed mode は壊れていない見込み（人間レビューで再確認）。
- direct Sanity write なし / paid API integration なし。
- 次は production image generation を進めてよい。**ただし画像は必ず inbox 経由**で final asset path に渡る。

## 確認できたこと

- Visual Register を `npm run visual:register` で起動し、`http://localhost:3334` で開いた。
- 「Inbox Review（候補画像レビュー）」カードが Upload Card と 登録キュー の間に表示された。
- 候補が無い状態でも、サマリー（total / candidate / approved / rejected / needs-regen / registered）と空状態メッセージが想定通り表示。
- Content Slug フィルタ・レビュー状態フィルタが動作。
- `seed/visual-asset-plan-records-building-hitori-media-os.json` の 8 visualAssetPlan が Visual Register 側でも表示される（loadPlans のキャンペーン seed 自動 load）。
- 既存アップロード型 register / Patch Review の UI が引き続き同じ位置に存在。

## なぜ production image generation に進める判断にしたか

- Visual Register Inbox Review の構造が、候補生成・承認・登録・patch JSON 作成・Sanity 手動反映を1つのローカル UI でカバーできることが確認できた。
- 候補画像 → final asset path への **直接書き込みを許さない** 設計が UI とサーバー側で揃った（`approve & register` 経由のみ）。
- Codex CLI オプションワークフローと組み合わせると、ChatGPT 手動生成 / Codex 手動生成のいずれでも同じ inbox を経由できる。

## なぜ完全自動化に進めないか

- 候補画像の品質は ChatGPT / Codex どちらでも揺らぐ。人間レビューが品質ゲートとして残る。
- AI clone / 顔写真 / 有料PDF教材の本文混入リスクは、自動化ではなく目視で弾く方が安全。
- subscribers が動き出してから自動化を進めても遅くない。

## 次にやること

1. `tasks/visuals/building-hitori-media-os/` 配下に **production visual task files** を整える（次の Part 3 で実施）。
2. text-first 4 platforms（X / Threads / note / Substack）の image candidate を ChatGPT or Codex で生成し、`assets/inbox/generated/building-hitori-media-os/<asset-slug>/v001.png` 形式で保存。
3. Visual Register Inbox Review で 1 サイクル: candidate → approve & register → patch JSON → Sanity Studio 手動反映。
4. Codex Phase 1 safety review packet（`tasks/reviews/visual-register-inbox-codex-review.md`）を必要に応じて Codex に渡す。

## 安全方針の再確認

- Production image を Codex / 自動スクリプトから final asset path に直接書かない。inbox 経由のみ。
- Sanity への反映は手動。direct write しない。
- auto-posting / paid API integration / `seed --replace` / 顔写真ワークフロー / 有料PDF引用 は禁止のまま。
- private/ には触らない。
