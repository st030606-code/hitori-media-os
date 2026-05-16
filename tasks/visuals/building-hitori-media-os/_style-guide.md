# Style Guide: building-hitori-media-os Visual Language

Date: 2026-05-14

## Visual Vocabulary

Hitori Media OS の visual は次のキーワードに収める:

- **app-like**: 派手な装飾より、構造とノードが見えるUI/ダイアグラム調
- **structured**: グリッド・整列・余白で読みやすさを優先
- **modern**: 角丸の控えめなノード、細めの罫線、sans-serif
- **clean**: 色数3色以内、ノイズなし、不要な装飾なし
- **diagram-friendly**: 関係性・優先順位・段階を1枚で説明できる
- **trust-building**: 派手な煽り、AIユートピア感、稼げる系を避ける

## Color Palette

- **Base**: 白〜薄いオフホワイト（純白を避けて目に優しく）
- **Primary text**: 濃いネイビー or チャコールグレー
- **Accent**: 1色のみ（控えめなウォーム or 落ち着いた青緑）

色をたくさん使わない。アクセント色は「強調したい1点」だけに当てる。

## Typography

- **Font family**: クリーンな sans-serif（Noto Sans JP / Inter / IBM Plex 系）
- **Sizes**: 見出し大 / 本文中 / ノードラベル小、の3階層程度
- **Mixed Japanese + English**: 日本語が主役、英字はモノスペース or 小さく添える
- **Avoid**: ハンドライト風、装飾文字、フチ取り、影、ネオン

## Layout Principles

- **Margin > Density**: 詰め込まない
- **Center-weighted**: 媒体に応じた preview crop で見えなくなる端には重要要素を置かない
- **Grid-based**: ノードや列を等しいサイズで揃える
- **Hierarchy**: 主役1個 + 補助2〜4個、それ以上の要素は次のレイヤーに分ける

## What To Avoid

- 顔写真（このバッチは text-first のみ、顔ワークフローは別バッチ）
- ロボット・脳・AI シンボル系の使い古された画像
- ガラスフレア / 光線 / グラデーション過多
- 「完成版ツールの売り込み」風のキラキラ感
- 根拠のない数字、矢印で「↑1000%」みたいな煽り
- ハッキング / ターミナル一画面どん、みたいなテック誇示
- 旗 / 国 / 政治シンボル / 宗教シンボル
- ロゴ / 商標 / 既存サービスの公式ロゴ風表現
- 有料PDF教材の本文・図版のコピー

## Consistency Across The Campaign

8 assets 全体で次を統一する:

- 同じ base 色
- 同じ accent 色（強調対象は asset ごとに異なってよい）
- 同じ font family
- 同じノード形状（丸角矩形）
- 同じ線太さの規則（主要 1px 強、補助 0.5px）

`note-hero-v1` を最初に作って、それを **トーンの基準** にする。残り 7 assets は note-hero と並べたときに統一感が出るかをチェックする。

## Asset-Level Tone Differences

媒体役割に応じて以下を調整:

- **X / Substack header**: 視認性最優先。文字は大きく、図解要素は最小限。
- **note hero**: 構造図を1個だけ添える。文字とアクセント色のバランス。
- **Threads support**: 縦長、余白多め、会話を促す柔らかさ。
- **note inline 3点**: 図解中心。文字より構造で語る。
- **Substack inline**: 4列の役割分担を明示。情報量は inline 並み。

## Safety

- 顔写真ワークフローはこのバッチでは扱わない。
- 有料PDFや教材本文の引用、スクリーンショットは含めない。
- 実 project ID / API トークン / subscriber メール / private/ ファイル名は画像内に絶対に映さない。
- AI generated avatar / AI clone face は使わない（本人承認まで保留）。
