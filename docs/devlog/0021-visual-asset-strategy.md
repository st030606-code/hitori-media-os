# 0021: ビジュアルアセット配置戦略を追加

日付: 2026-05-12

## 背景

`diagramPlan` seedでは、Before / After、Obsidian vs Sanity、Manual first / API later、Content OS pipeline、Instagram carouselの5つの概念レベルの図解計画を作りました。

ただし、実際のメディア運用では、それだけでは足りません。

必要なのは、どの媒体のどこに、どのサイズで、何枚の画像を置くかという配置計画です。

## 決定・変更

`docs/09-visual-asset-strategy.md` を追加しました。

この文書では、次を整理しました。

- `diagramPlan` とビジュアルアセット配置計画の違い
- 媒体別のビジュアルアセット表
- 推奨ビジュアルカテゴリ
- 最初に作るべきビジュアルの優先順位
- 既存の `diagramPlan` を複数媒体へ再利用する考え方
- 将来の `visualAssetPlan` / `visualPlacementPlan` スキーマ候補

また、`docs/05-future-dashboard.md` に、将来ダッシュボードがビジュアルアセット制作パイプラインを表示すべきことを追記しました。

## なぜdiagramPlanだけでは足りないか

`diagramPlan` は「何を図解するか」を扱います。

しかし実運用では、次も必要になります。

- noteのアイキャッチにするのか。
- note本文のH2下に置くのか。
- Xのhook画像にするのか。
- Instagramカルーセルの何枚目にするのか。
- YouTubeサムネイルなのか、動画内スライドなのか。
- GitHub READMEの構造図なのか。

同じBefore / After図解でも、note、X、Instagram、YouTubeでは比率、文字量、役割が変わります。

そのため、概念計画と配置計画を分けて考える必要があります。

## なぜ画像生成をまだ待つか

画像生成は、作り始めるとすぐに枚数が増えます。

先に配置計画を作らないと、次の問題が起きます。

- 作った画像の使い道が曖昧になる。
- 同じ図を媒体別に作り直しすぎる。
- note、X、Instagram、GitHubのどれを優先するか判断しにくい。
- アスペクト比や図内テキスト量が後から合わなくなる。

そのため、まずは必要枚数、使う場所、再利用方針、優先順位を決めました。

## 画像生成前にやること

実際に画像を作る前に、次を確認します。

- 最初に作るnote hero / eye-catchの方向性
- note main concept diagramの元にする `diagramPlan`
- X hook diagramとして使う文言
- Instagramカルーセルの表紙と最初の3枚の構成
- GitHub architecture diagramに含める要素

この確認ができてから、1枚ずつ生成・レビューします。

## no-API MVPの維持

今回の変更はドキュメント整備のみです。

Next.js、フロントエンドコード、有料LLM API連携、OpenAI API / Anthropic API クライアント、自動生成、自動投稿は追加していません。

実project ID、APIキー、トークン、認証情報、シークレットも追加していません。

実画像ファイルも作成していません。

## 次の一手

画像生成へ進む前に、`workflow` seedを作り、ここまでのPhase 1からseed作成までの手動ワークフローを記録します。

その後、最初に作るビジュアルをnote hero / eye-catchから選ぶのがよいです。
