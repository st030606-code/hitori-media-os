# x-hook-main-v1 — Generation Prompt (paste-ready)

Created: 2026-05-14
Status: ready-for-human-paste
Codex CLI image generation: **unavailable** (Codex CLI v1 has no image generation subcommand; only `exec` / `review` / `mcp` / `apply` / etc.)

人間が ChatGPT などに以下の prompt を貼り付けて candidate を生成し、`v001.png` として **このフォルダ** に保存する。
**`assets/visuals/...` の final path には保存しない**。

## Source Brief

- [tasks/visuals/building-hitori-media-os/x-hook-main-v1.md](../../../../../tasks/visuals/building-hitori-media-os/x-hook-main-v1.md)
- [tasks/visuals/building-hitori-media-os/_style-guide.md](../../../../../tasks/visuals/building-hitori-media-os/_style-guide.md)
- [tasks/visuals/_codex-image-generation-template.md](../../../../../tasks/visuals/_codex-image-generation-template.md)

## Asset Metadata

| Field | Value |
| --- | --- |
| contentSlug | `building-hitori-media-os` |
| visualAssetPlanId | `visualAssetPlan.building-hitori-media-os.x-hook-main-v1` |
| visualAssetSlug | `x-hook-main-v1` |
| targetPlatform | X (formerly Twitter) |
| placement | X main post inline image |
| aspectRatio | 16:9 |
| pixelSize | 1200 x 675 |
| assetType | hook-image |
| reusePolicy | variant-required |
| toneReference | `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png`（note-hero-v1 master） |
| expectedLocalAssetPath（参考、Visual Register が approve & register で copy する先） | `assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png` |

## Paste-Ready Generation Prompt

```text
1200x675 で生成してください。

X タイムライン向けの hook 画像です。

レイアウト:
- 画面中央に大きな日本語見出し『発信を頑張るより、発信が回る仕組みを作る。』を2〜3行で配置。
- 見出しの下に小さく『Hitori Media OS / development log』。
- 構造的なノードや矢印は使わない、または使ってもごく控えめに1〜2個まで。
- 重要要素は中央 70% に収める（X の inline preview crop は 1.91:1 / 1:1 など可変なため、上下左右がトリミングされても文字が切れない構図）。

スタイル:
- 背景は白〜薄いオフホワイト。
- 主要テキストは濃いネイビー or チャコールグレー。
- アクセントは控えめなウォーム色 1色のみ。
- sans-serif（Noto Sans JP / Inter / IBM Plex 系）。
- 余白を多めに、文字とコントラスト最優先。
- note hero（campaign-hero-v1.png）と base / accent / font を一貫させ、装飾は note hero よりも1段階控えめにする。

避けるもの:
- 完全自動化 / 全自動化 / 稼げる / 誰でも / AIに任せる時代 / 保証 / 完成 などの煽り。
- 顔写真、人物、AI生成アバター、AIクローン顔。
- ロボット / 脳 / AI シンボル。
- グラデーション過多、光線、ガラスフレア、ネオン、影過多。
- ロゴ風表現、商標、絵文字の装飾。
- 有料PDF教材の本文・図版のコピー。
- 実 project ID / API トークン / subscriber メール / private/ ファイル名。

ユースケース:
- X タイムラインの inline preview で読めるよう、視認性を最優先。
- スクロール中の1秒で内容が伝わること。
- 完成品の宣伝には見えないこと（building-in-public トーン）。
```

## Tone Reference Match (vs campaign-hero-v1.png)

採用前に並べて目視確認:

- base color が同じか（白〜薄オフホワイト）
- accent color が同じか（落ち着いたウォーム1色）
- font family が同じ系統か
- ノード形状（使う場合）が丸角矩形か
- 装飾密度が note hero よりも **控えめ** か

## Output Naming

```text
assets/inbox/generated/building-hitori-media-os/x-hook-main-v1/
  v001.png   ← 最初の候補
  v002.png   ← 再生成する場合（v001 上書き禁止）
  v003.png
  ...
```

連番命名（v001 から、上書き禁止）。

## After Saving Candidate

1. `npm run visual:register` を起動（既存プロセスがあれば `lsof -ti :3334 | xargs kill` で停止してから）
2. ブラウザで Inbox Review カードを開く
3. `building-hitori-media-os` フィルタ、Plan auto-suggest = `visualAssetPlan.building-hitori-media-os.x-hook-main-v1` を確認
4. v00X の中から採用版を選び、レビューメモを書いて `approve & register`
5. final path `assets/visuals/building-hitori-media-os/x/hook/x-hook-main-v1.png` に copy + `patches/visual-assets/building-hitori-media-os/x-hook-main-v1.json` 生成を確認

## Codex Hand-off Recap

Codex CLI（`/usr/local/bin/codex`）は code-generation 専用で、`codex --help` のサブコマンドに image generation 系は存在しない（`exec` / `review` / `login` / `mcp` / `apply` / `fork` など）。本環境では Codex から画像を直接生成する手段がない。

代替: ChatGPT（または Claude / 任意の画像生成 UI）で上記 prompt を実行し、結果を `v001.png` としてここに保存する。

## Safety

- No paid image generation API
- No auto-posting
- No face photo / AI generated avatar
- No paid PDF content copied
- Manual generation, manual registration, manual Sanity update
