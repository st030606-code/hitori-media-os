# 将来のダッシュボード設計

Sanity AI Content OS の長期的な操作画面は、Sanity Studio ではなく、将来の Next.js ダッシュボードにします。

Sanity はデータバックエンドです。Sanity Studio は開発者・管理者・上級ユーザー向けの管理画面です。

買い手や日々の運用者が使う画面は、コンテンツ制作の流れに合わせた専用ダッシュボードとして設計します。

## なぜダッシュボードを主UIにするのか

Sanity Studio はスキーマに沿ってデータを直接編集するには優れています。

一方で、買い手が毎日使う画面としては、次の点で重くなりやすいです。

- すべてのSanityフィールドを理解する必要がある。
- `claims`、`evidence`、`platformAngles` などの構造入力が初見では難しい。
- 「今どこまで進んでいるか」という制作パイプラインが見えにくい。
- AIに整理させる前の雑なアイデア入力に向いていない。
- 出力生成、レビュー、公開後の振り返りが1つの流れとして見えにくい。

そのため、将来の主UIでは、ユーザーにSanityの全フィールドを直接入力させません。

ユーザーは短いメモ、音声メモ、箇条書き、URL、参考資料などを入れます。その後、AI支援と人間レビューを通して、構造化された `contentIdea` と各種出力へ変換します。

## Sanity Studio の役割

Sanity Studio は、次の用途に使います。

- スキーマ検証
- 初期データ入力のテスト
- 開発者・管理者によるデータ確認
- 参照関係や保存状態のデバッグ
- 高度な手動編集
- 将来ダッシュボードが書き込んだデータのバックオフィス確認

Studio は重要ですが、買い手の日常入力UIとして最適化しすぎないようにします。

## 未来のダッシュボードに必要なもの

将来のNext.jsダッシュボードには、少なくとも次の画面や機能が必要です。

- 生アイデア入力画面
- AI構造化プレビュー
- 人間レビュー画面
- 媒体別出力生成画面
- note / Substack / Threads / X / YouTube / Shorts / Podcast / Diagram の出力一覧
- 制作パイプライン表示
- ビジュアルアセット制作パイプライン表示
- Visual Register page
- ローカルserver / Sanity接続 / visual asset folderの状態表示
- 公開済みコンテンツとURLの管理
- 公開後の反応メモ
- プロンプトとワークフローの改善メモ

MVPではAPI自動化を急がず、まずは手動・半自動の流れをダッシュボードに落とし込めるかを設計します。

## Frontend stack and design system

将来のdashboard UIでは、次の構成を推奨します。

- Next.js
- Tailwind CSS
- shadcn/ui
- lucide-react
- Material Design 3 inspired design principles

UIは、日本語優先、アプリ型dashboard、card layout、status chips、queue table、preview panel、confirm dialog、toastを基本にします。

詳細は `docs/20-frontend-ui-design-system.md` にまとめます。

現在のLocal Visual Registerは静的HTML / CSS / JavaScriptのまま維持します。

Next.js dashboardへ移す段階では、現在のUIをそのまま移植するのではなく、shared component systemで再構築します。

## 将来のユーザーフロー

1. Raw idea input

ユーザーが雑なアイデアを入力します。

例:

- 思いつきのメモ
- Obsidianからの貼り付け
- 参考URL
- 音声メモの文字起こし
- 箇条書き

2. AI structuring

AI支援で、生の入力を `contentIdea` の形へ整理します。

ここでは `coreThesis`、`audiencePain`、`claims`、`examples`、`platformAngles` などの候補を作ります。

3. Human review

人間が中心主張、根拠、言い過ぎ、トーン、媒体別の切り口を確認します。

この段階で、AIが作った構造をそのまま信じるのではなく、発信者本人の視点を戻します。

4. Output generation

承認された `contentIdea` から、媒体別の初稿を作ります。

出力は `platformOutput` や `diagramPlan` に保存します。

5. Pipeline tracking

下書き、レビュー中、修正済み、公開準備OK、公開済みといった状態を一覧で追跡します。

ここで `workflow` が、どのプロンプト・ツール・判断を使ったかを記録します。

6. Visual asset pipeline

媒体別下書きとは別に、必要なビジュアルも追跡します。

例:

- needed visuals
- planned visuals
- generated visuals
- reviewed visuals
- published visuals

将来のダッシュボードでは、noteのアイキャッチ、Xのhook画像、Instagramカルーセル、YouTubeサムネイル、GitHubアーキテクチャ図などを、どの `contentIdea` / `diagramPlan` から作るか見えるようにします。

ダッシュボードは `visualAssetPlan` を管理します。

現在のno-APIモードでは、ユーザーがプロンプトをコピーし、ChatGPT画像生成やデザインツールで手動生成し、画像をローカルに保存し、`saved` / `reviewed` へ状態を進めます。

将来のAPIモードでは、同じ `visualAssetPlan` から生成ジョブをAPI providerへ送り、`generationJobId` を保存し、生成結果を保存して状態を更新します。

手動モードとAPIモードは、同じ `visualAssetPlan` モデルを使います。

ダッシュボードには、将来 `Visual Register` page を用意します。

この画面では、手動生成した画像を選択し、対象の `visualAssetPlan` を選び、期待される `localAssetPath` を確認し、ローカルserver経由で正しいフォルダへ保存します。

また、次の状態も表示します。

- local server status
- Sanity connection status
- visual asset folder status

ただし、ダッシュボード自身が自分を起動する責任は持ちません。

ローカルアプリの起動は、ランチャーまたは将来のデスクトップラッパーが担当します。

7. Published output feedback

公開後、URL、公開日、反応、学び、次の行動を `publishedOutput` に保存します。

この学びは、次のアイデア、プロンプト改善、媒体別戦略に戻します。

## 設計上の結論

Sanity Studioは、データの管理画面です。

未来のNext.jsダッシュボードは、買い手の制作オペレーション画面です。

スキーマ設計では、Studioで直接入力できることも大事ですが、それ以上に、将来のダッシュボードが最小入力から構造化データを書き込めることを重視します。
