# Codex Image Generation Prompt Template

Codex CLI に candidate 画像を生成させたいとき、このテンプレートを fill して渡す。

**重要**: candidate は必ず inbox に保存する。`assets/visuals/...` の final path には書かない（Visual Register の `approve & register` で人間が承認したあとに自動 copy される）。

---

## Asset Metadata

- **contentSlug**: `<例: building-hitori-media-os>`
- **visualAssetPlanId**: `<例: visualAssetPlan.building-hitori-media-os.note-hero-v1>`
- **visualAssetSlug**: `<例: note-hero-v1>`
- **targetPlatform**: `<例: note>`
- **placement**: `<例: note hero / eye-catch>`
- **aspectRatio**: `<例: 16:9>`
- **pixelSize**: `<例: 1456 x 816>`
- **assetType**: `<例: hero>`
- **expectedLocalAssetPath**（参考、Codex は書き込まない）: `<例: assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png>`

## Inbox Candidate Path (Codex は ここに保存する)

```text
assets/inbox/generated/<contentSlug>/<visualAssetSlug>/
  v001.png
  v002.png
  v003.png
```

- 連番命名 v001 から開始。
- 既存ファイルがある場合は次の番号を続ける（上書き禁止）。
- 出力フォーマット: PNG 推奨（透過必要なら）、JPG / WebP も可。
- 最大 v0NN まで（同 batch で N 枚生成してよい）。

## Generation Prompt

`<ここに ChatGPT 用 / Codex 用の生成 prompt を貼り付ける>`

例（building-hitori-media-os / note-hero-v1 の場合）:

```text
1456x816 で生成してください。

Hitori Media OS のキービジュアルを作ります。

レイアウト:
- 画面を左右 50/50 に分ける。
- 左側: 大きな日本語見出し『発信を頑張るより、発信が回る仕組みを作る。』を2〜3行で配置。下に小さく『Hitori Media OS / development log / in progress』。
- 右側: 中央に丸角矩形のノード『Content Idea』を1つ置き、そこから細い線で8つのノード『note』『Substack』『X』『Threads』『YouTube』『Shorts』『Podcast』『Instagram』へ放射状に接続。

スタイル:
- 背景は白〜薄いオフホワイト。
- 主要テキストとノード輪郭は濃いネイビー or チャコールグレー。
- アクセントは控えめなウォーム色 1色のみ。
- sans-serif（Noto Sans JP / Inter / IBM Plex 系）。

避けるもの:
- 完全自動化や稼げる系の煽り。
- 顔写真、人物、AI生成アバター。
- ロボットや脳のシンボル。
- グラデーション、光線、ガラスフレア、ネオン、影過多。
- ロゴ風表現、商標。
```

## Negative Prompt / Avoid List

- 完全自動化 / 稼げる / 誰でも / 保証
- 顔写真 / 人物 / AI generated avatar / AI clone face
- ロボット / 脳 / AI シンボル
- ガラスフレア / 光線 / グラデーション過多 / ネオン
- ロゴ風表現 / 商標
- 有料PDF教材本文の引用 / 公式サービスロゴ
- secret / 実 project ID / API トークン / subscriber メールが画像内に映る

## Review Criteria (Codex が自己レビューする観点)

生成した candidate ごとに次を簡潔にメモする（オプション）:

- coreThesis が中心にあるか
- 文字の可読性
- preview crop で文字が切れない構図
- 色数 3 色以内
- 装飾過多になっていない
- スタイルガイド `_style-guide.md` のトーンと一致
- 有料PDF / secret / 顔写真の混入なし

## Output Naming Convention

```text
assets/inbox/generated/<contentSlug>/<visualAssetSlug>/v001.png
assets/inbox/generated/<contentSlug>/<visualAssetSlug>/v002.png
...
```

加えて、必要に応じて:

- `prompt.md`: 採用 prompt の最新版（任意）
- `review.md`: 人間が candidate ごとに書くレビュー注釈（任意）

## Reminder

- 必ず inbox にだけ保存する。
- `assets/visuals/...` の final path には絶対に書き込まない（Visual Register の `approve & register` 経由のみ）。
- 既存 v00X を上書きしない（次番号で出す）。
- 有料 API を呼ばない。Sanity に直接書き込まない。auto-post しない。

## Hand-Off

candidate を inbox に保存したら、次を人間に伝える:

1. `npm run visual:register` で Visual Register を起動（または再起動）。
2. Inbox Review カードで該当 `<contentSlug>` の candidate を表示。
3. Plan auto-suggest が正しいか確認。
4. v00X のうち採用するものを選び `approve & register`。
5. patch JSON / Sanity 反映は手動。

詳細は [docs/43-visual-register-inbox-review-workflow.md](../../docs/43-visual-register-inbox-review-workflow.md) と [docs/44-codex-cli-optional-workflow.md](../../docs/44-codex-cli-optional-workflow.md) を参照。
