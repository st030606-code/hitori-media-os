# Brief: note-inline-human-judgment-v1

Priority: P2
Status: brief-ready

## Asset Metadata

- **contentSlug**: `building-hitori-media-os`
- **visualAssetPlanId**: `visualAssetPlan.building-hitori-media-os.note-inline-human-judgment-v1`
- **targetPlatform**: `note`（inline）
- **placement**: note 記事の第3〜4章付近、AI/人間判断の話題に近い場所
- **aspectRatio**: `16:9`
- **pixelSize**: 1600 x 900
- **assetType**: `flow-diagram`
- **reusePolicy**: reusable

## Inbox Candidate Path

```text
assets/inbox/generated/building-hitori-media-os/note-inline-human-judgment-v1/
  v001.png
  v002.png
  v003.png
```

連番命名（v001 から、上書き禁止）。

## Objective

note記事の inline 構造図。**「AIに丸投げではなく、人間の判断を残す」** という coreThesis の柱を、`生成 → 候補 → 人間判断 → 採用 → 公開` の4段階フローとして視覚化。

Visual Register Inbox Review + Codex CLI Optional Workflow の運用方針（人間レビューを品質ゲートに残す）を、読者にも分かる形で伝える。

## Core Message

> AIに丸投げではなく、人間の判断を残す。

> 自動化の連鎖の真ん中に、人間レビューを置く設計。

## Audience

note 記事の長文読者。AI生成を試したことがあり、「品質をどう担保するか」に関心がある人。

## Visual Style

`_style-guide.md` 準拠:

- app-like / structured / clean
- アクセント色1色は「人間レビュー」ノードだけに使う
- ほかはモノトーン寄り
- テクニカルすぎず、人間レビューの位置が一目で分かる

## Layout Guidance

- 画面横軸に4段階のflow:
  1. **AI generate candidates**（左端）
  2. **Inbox / human review**（中央、アクセント色で強調）
  3. **approve**
  4. **publish**（右端）
- 各段階は同サイズの丸角矩形。
- 段階間に細い右向き矢印。
- 下部に小さくサブテキスト: `human judgment stays in the loop` + 日本語『AIに丸投げではなく、人間の判断を残す』
- 中央の `Inbox / human review` ノードを **アクセント色1色** で塗り、ここが品質ゲートであることを強調。

## Text To Include

- AI generate candidates
- Inbox
- human review
- approve
- publish
- human judgment stays in the loop
- AIに丸投げではなく、人間の判断を残す

## Negative Prompt / Avoid List

- 全自動化 / AIに任せれば良い / 自動公開
- 稼げる / 誰でも / 保証 / 完成
- AI clone / AI generated avatar
- 顔写真 / 人物
- ロボット / 脳 / AI シンボル
- グラデーション / 光線 / ガラスフレア / ネオン / 影過多
- ロゴ風表現 / 商標
- 有料PDF教材本文 / secret / 実 project ID / API トークン

## Generation Prompt (paste-ready)

```text
1600x900 で生成してください（16:9 横長）。

note 記事の inline flow 図です。テーマは「AIに丸投げではなく、人間の判断を残す」。

レイアウト:
- 画面横軸に4段階のflow:
  1. 左端: 丸角矩形ノード『AI generate candidates』
  2. 中央: 丸角矩形ノード『Inbox / human review』（アクセント色1色で塗る）
  3. その右: 丸角矩形ノード『approve』
  4. 右端: 丸角矩形ノード『publish』
- 各段階の間に細い右向き矢印を1本ずつ。
- 画面下部に小さく英字『human judgment stays in the loop』、その上に日本語『AIに丸投げではなく、人間の判断を残す』

強調:
- 中央の『Inbox / human review』ノードだけアクセント色1色（控えめなウォーム or 落ち着いた青緑）。
- ほかの3ノードはモノトーン（濃いネイビー or チャコールグレーの輪郭、塗りは白）。

スタイル:
- 背景は白〜薄いオフホワイト。
- 主要テキストは濃いネイビー or チャコールグレー。
- sans-serif（Noto Sans JP / Inter / IBM Plex 系）。
- 装飾なし、影なし、グラデーションなし。

避けるもの:
- 全自動化、AIに任せれば良い、自動公開といった煽り。
- 顔写真、人物、AI generated avatar、AI clone。
- ロボットや脳のシンボル。
- ロゴ風表現、商標。

ユースケース:
- note 記事の長文中に埋め込む inline 図。
- 4段階の関係が一瞬で読めること。
- 中央の human review ノードがゲートであることが視覚的に伝わること。
```

## Review Criteria

- coreThesis「AIに丸投げではなく、人間の判断を残す」が中心にある
- 4段階flow が一瞬で読める
- 中央ノードがアクセント色1色で強調されている
- ほかのノードはモノトーン
- 完成品の宣伝感がない
- AI clone / 顔写真の混入なし
- secret / 実project ID / private/ パスが映っていない
- 有料PDF教材本文の図版が混ざっていない
- 文字とコントラスト最優先

## Output Naming Convention

```text
assets/inbox/generated/building-hitori-media-os/note-inline-human-judgment-v1/v001.png
assets/inbox/generated/building-hitori-media-os/note-inline-human-judgment-v1/v002.png
...
```

任意で `prompt.md` / `review.md` を同フォルダに追加。

## Reminder

- candidate は **inbox にのみ保存**。final path（`assets/visuals/...`）には書き込まない。
- 既存 v00X を **上書きしない**（次番号で出す）。
- final 採用は Visual Register Inbox Review の `approve & register` 経由のみ。
- Sanity Studio への反映は **手動**。
- paid API / direct Sanity write / auto-post 禁止。

## Hand-Off

candidate を inbox に保存したら、次を人間が実施:

1. `npm run visual:register` で Visual Register を起動 / 再起動。
2. Inbox Review カードで `building-hitori-media-os` フィルタを当てる。
3. `note-inline-human-judgment-v1` の candidate から採用版を選ぶ。
4. Plan auto-suggest が `visualAssetPlan.building-hitori-media-os.note-inline-human-judgment-v1` か確認。
5. レビュー注釈を書き、`approve & register`。
6. 最終 `assets/visuals/building-hitori-media-os/note/inline/note-inline-human-judgment-v1.png` に copy + patch JSON 作成。
7. Sanity Studio で `localAssetPath` / `status: saved` を手動入力。

## Relationship To Other Inline Diagrams

- `note-inline-content-os-flow-v1`: contentIdea から複数媒体への展開を見せる図（第2章付近）
- `note-inline-human-judgment-v1`（このアセット）: 生成→人間判断→公開のflowを見せる図（第3〜4章付近）
- `note-inline-manual-vs-automation-v1`（historical, optional）: 手動 / 半自動 / 自動の優先順位図（先行バッチで作成、人間判断の側面とは別軸）
