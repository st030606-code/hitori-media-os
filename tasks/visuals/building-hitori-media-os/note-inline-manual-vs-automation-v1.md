# Brief: note-inline-manual-vs-automation-v1

Priority: P2
Status: brief-ready

## Asset Metadata

- Asset ID: `note-inline-manual-vs-automation-v1`
- Visual Asset Plan ID: `visualAssetPlan.building-hitori-media-os.note-inline-manual-vs-automation-v1`
- Source Content Idea: `contentIdea.building-hitori-media-os`
- Target Platform: note（inline）
- Asset Type: comparison-diagram
- Aspect Ratio: 16:9
- Pixel size: 1600 x 900
- Reuse Policy: reusable

## Objective

note 記事 **第4章「自動化は最後、まず手動で回る型を作る」** の H2 末尾に配置する inline 比較図。
「いま実際にやっている作業」と「次に自動化したい作業」を対比し、**下書き作成より公開判断 / Sanity 反映の自動化が優先**という気づきを視覚化する。

## Message

自動化は最後。下書き生成より、公開判断・反映・URL記録のほうが自動化優先度が高い。

## Audience

第4章まで読み進めて「自動化って結局どこから？」と疑問を持っている読者。

## Placement

- note 記事の本文第4章 H2 末尾に配置。
- 図の前で「自動化候補はこの中から決めます」と本文で予告したあと、図で具体例を見せる流れ。

## Visual Style

- 横軸の段階表示 + 上下2段の対比
- アクセント色は「最初に自動化すべき候補」だけに使う
- ほかはモノトーン寄り

## Layout Guidance

- 画面横軸を左から右へ3段階に分け、ラベル `手動` `半自動` `自動` を置く。
- 上段「今やっている作業」: 横長のスペースに、7項目を散らす形で並べる。
  - `下書き作成` / `画像生成` / `下書き編集` / `公開判断` / `Sanity反映` / `公開・投稿` / `URL記録`
- 下段「自動化候補（優先度高め）」: 横長スペースの「半自動 / 自動」寄りに、ピックアップした候補だけを並べる。
  - `公開判断補助` / `Sanity反映補助` / `patch JSON生成` / `placeholder検出`
- 上段の中の `下書き作成` から、下段の `公開判断補助` のあたりへ細い矢印を引き、「最初に自動化すべきは下書き作成ではない」を視覚的に強調。
- アクセント色は下段の「自動化候補」と矢印にだけ使う。

## Text To Include

- 手動 / 半自動 / 自動（横軸ラベル）
- 下書き作成 / 画像生成 / 下書き編集 / 公開判断 / Sanity反映 / 公開・投稿 / URL記録（上段7項目）
- 公開判断補助 / Sanity反映補助 / patch JSON生成 / placeholder検出（下段4項目）
- 自動化候補（節タイトル）

## Text To Avoid

- 全自動化 / AIに任せれば良い
- 稼げる / 完成

## Reuse Notes

- Substack 同テーマ Post にも転用可。reusable。

## Generation Prompt (paste-ready)

```text
1600x900 で生成してください（16:9 横長）。

note 記事内の inline 比較図です。テーマは「自動化は最後、まず手動で回る型を作る」。

レイアウト:
- 画面の横軸を左→右に3段階に分け、上端に小さなラベル『手動』『半自動』『自動』を等間隔で配置。
- 画面を上下2段に分ける。

上段（今やっている作業）:
- 7項目を散らして配置。『下書き作成』『画像生成』『下書き編集』『公開判断』『Sanity反映』『公開・投稿』『URL記録』。
- 全項目は小さめの丸角矩形ノード。色はモノトーン（濃いネイビーまたはチャコール）。
- 配置は左寄り（『手動』寄り）に多め。

下段（自動化候補・優先度高め）:
- 4項目を「半自動」「自動」寄りに配置。『公開判断補助』『Sanity反映補助』『patch JSON生成』『placeholder検出』。
- これら4項目だけアクセント色1色で塗り、強調する。
- 下段の上に小さく節タイトル『自動化候補』。

矢印:
- 上段の『下書き作成』から、下段の『公開判断補助』のあたりへ細い矢印を1本だけ引く。
- 矢印もアクセント色。
- 矢印の意味は「最初に自動化すべきは下書き作成ではなく、公開判断や Sanity 反映」。

スタイル:
- 背景は白。
- 主要テキストは濃いネイビー or チャコールグレー。
- アクセントは1色のみ（下段の候補と矢印）。
- sans-serif（Noto Sans JP / Inter / IBM Plex 系）。
- 装飾なし、影なし、グラデーションなし。

避けるもの:
- 全自動化、AIに任せれば良い、稼げる、完成といった煽り。
- 顔写真、人物、ロボット、脳のシンボル。
- ロゴ風表現、商標。

ユースケース:
- note 記事の長文中に埋め込む比較図。
- 「自動化したい順位」が一瞬で読み取れること。

3段階の横軸と上下2段の関係が、過剰な装飾なしで一瞬で読めるようにしてください。
```

## Review Checklist

- [ ] 横軸の `手動 / 半自動 / 自動` ラベルが読める
- [ ] 上段7項目・下段4項目がすべて読める
- [ ] アクセント色は下段候補と矢印だけに使われている
- [ ] 矢印の意味が読み取れる（下書き作成 → 公開判断補助）
- [ ] 完成品の宣伝感がない
- [ ] secret / 実project ID / private/ パスが映っていない
- [ ] 顔写真なし
- [ ] 有料PDF教材本文の図版が混ざっていない

## Save Path & Registration

- Save to: `assets/visuals/building-hitori-media-os/note/inline/note-inline-manual-vs-automation-v1.png`
- Visual Register で登録:
  1. `npm run visual:register`
  2. Content Idea filter = `contentIdea.building-hitori-media-os`
  3. visualAssetPlan `note-inline-manual-vs-automation-v1` を選択
  4. 画像 drop → 登録
- Sanity Studio で `localAssetPath` 反映 / `status: saved`。

## Safety

- No paid image generation API
- No auto-posting
- No face photo
- No paid PDF content copied
- Manual generation, manual registration, manual Sanity update
