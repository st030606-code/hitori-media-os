# Brief: threads-support-diagram-v1 (canonical)

Priority: P2
Status: brief-ready
Supersedes: `threads-support-v1.md`（前バッチの命名。Visual Register / seed は本ファイルの slug が正）

## Asset Metadata

- **contentSlug**: `building-hitori-media-os`
- **visualAssetPlanId**: `visualAssetPlan.building-hitori-media-os.threads-support-diagram-v1`
- **targetPlatform**: `threads`
- **placement**: Threads main post visual (4:5 portrait)
- **aspectRatio**: `4:5`
- **pixelSize**: 1080 x 1350
- **assetType**: `paired-post-visual`
- **reusePolicy**: variant-required
- **expectedLocalAssetPath**: `assets/visuals/building-hitori-media-os/threads/support/threads-support-diagram-v1.png`

## Inbox Candidate Path

候補画像は必ず以下に保存する。**final path には直接書かない**。

```text
assets/inbox/generated/building-hitori-media-os/threads-support-diagram-v1/
  v001.png
  v002.png
  v003.png
```

連番命名（v001 から、上書き禁止）。

## Objective

Threads main post に添える **縦長 supporting visual**。会話・関係づくり媒体役割に合わせ、X より柔らかく、文字密度を低く。

## Core Message

> 発信を頑張るより、仕組みを作る。

短い口語的バリエーション。

## Audience

Threads フィードで偶然この投稿を見た発信者。タップして本文を読む or 返信する手前の温度感。

## Visual Style

`_style-guide.md` 準拠:

- 縦長レイアウト、余白多め
- X / note と同じ base / accent
- 装飾より会話性、柔らかさ

## Layout Guidance

- 画面上 3 分の 1: 日本語見出し `発信を頑張るより、仕組みを作る。` を2行で配置。
- 画面下 3 分の 2: 控えめな構造図。中央に `Content Idea` ノード1つ、その下に小さなラベル `note` `Substack` `X` `Threads` を3〜4個、縦並びまたは少し放射状に配置。
- 装飾要素は最小限。背景余白を多くする。

## Generation Prompt (paste-ready)

```text
1080x1350 で生成してください（縦長 4:5）。

Threads フィード向けの縦長 supporting visual です。

レイアウト:
- 画面上 3 分の 1 に日本語見出し『発信を頑張るより、仕組みを作る。』を2行で配置。
- 画面下 3 分の 2 に控えめな構造図。中央に丸角矩形のノード『Content Idea』を1つ、その下または周囲に小さなラベル『note』『Substack』『X』『Threads』を3〜4個、縦並びまたは少し放射状に配置。
- ノードとラベルは小さめ、装飾は最小限。

スタイル:
- 背景は白〜薄ウォームグレー。
- 主要テキストは濃いネイビー or チャコールグレー。
- アクセントは控えめなウォーム色 1色のみ。
- sans-serif（Noto Sans JP / Inter / IBM Plex 系）。
- 余白を多めに、Xよりも視覚的にやわらかく。

避けるもの:
- 完全自動化や稼げる系の煽り。
- 顔写真、人物、AI生成アバター。
- ロボットや脳のシンボル。
- グラデーション、光線、ガラスフレア、ネオン、影過多。
- ロゴ風表現、商標。

ユースケース:
- Threads main post の inline 画像。
- 会話・関係づくり媒体に合うやわらかい温度感。
- preview crop は 4:5 / 1.91:1 / 1:1 が混在するので、重要要素は中央 60% に収める。

X 版とトーンの色は揃えつつ、Threads 用に文字量と装飾を控えめにしてください。
```

## Negative Prompt / Avoid List

- 完全自動化 / 全自動化
- 稼げる / 誰でも / 保証 / 完成
- 顔写真 / 人物 / AI generated avatar / AI clone face
- ロボット / 脳 / AI シンボル
- グラデーション / 光線 / ガラスフレア / ネオン / 影過多
- ロゴ風表現 / 商標
- 有料PDF教材本文 / secret / 実 project ID / API トークン

## Review Criteria

- coreThesis が中心にあるか
- 縦長で読んでも横長 crop で読んでも、見出しと中央ノードが見える
- X 版とトーンが揃っている（base / accent / font）
- X 版より柔らかい印象
- 完成品の宣伝感がない
- 文字とコントラスト最優先

## Output Naming Convention

```text
assets/inbox/generated/building-hitori-media-os/threads-support-diagram-v1/v001.png
assets/inbox/generated/building-hitori-media-os/threads-support-diagram-v1/v002.png
...
```

任意で `prompt.md` / `review.md` を同フォルダに追加。

## Reminder

- candidate は **inbox にのみ保存**。final path（`assets/visuals/...`）には書き込まない。
- 既存 v00X を **上書きしない**（次番号で出す）。
- final 採用は Visual Register Inbox Review の `approve & register` 経由のみ。
- Sanity Studio への反映は **手動**。`localAssetPath` / `status` / `reviewNotes` を Studio で手動更新。
- paid API / direct Sanity write / auto-post 禁止。

## Hand-Off

candidate を inbox に保存したら、次を人間が実施:

1. `npm run visual:register` で Visual Register を起動 / 再起動。
2. Inbox Review カードで `building-hitori-media-os` フィルタを当てる。
3. `threads-support-diagram-v1` の candidate（v001 / v002 ...）から採用版を選ぶ。
4. Plan auto-suggest が `visualAssetPlan.building-hitori-media-os.threads-support-diagram-v1` であることを確認。
5. レビュー注釈を書き、`approve & register`。
6. 最終 `assets/visuals/building-hitori-media-os/threads/support/threads-support-diagram-v1.png` に copy + patch JSON 作成。
7. Sanity Studio で `localAssetPath` / `status: saved` を手動入力。
