# Frontend UI Design System

Sanity AI Content OS の将来の買い手向けUIは、Sanity Studioではなく、専用のアプリ型ダッシュボードとして設計します。

このドキュメントは、今後のNext.js dashboard、Visual Register、制作パイプライン画面、出力レビュー画面で共有するUI実装方針です。

現時点ではNext.jsは追加しません。

現在のLocal Visual Registerは、静的HTML / CSS / JavaScriptの軽量ツールとして維持します。

## Recommended Frontend Stack

将来のdashboardでは、次の構成を推奨します。

- Next.js
- Tailwind CSS
- shadcn/ui
- lucide-react
- Material Design 3 inspired design principles

この構成は、買い手向けの操作UI、制作パイプライン、画像登録、出力レビュー、Sanity連携を作るための現実的な土台です。

## Why Tailwind CSS

Tailwind CSSを推奨する理由:

- 実装速度が速い。
- utility classにより、余白、色、レイアウト、状態を一貫して扱える。
- responsive designを書きやすい。
- theme tokenを設定しやすい。
- shadcn/uiと相性が良い。
- reusableで編集しやすいcomponentを作りやすい。
- dashboard / table / card / form / preview panelのような業務UIに向いている。

このプロジェクトでは、UIを「見た目だけのページ」ではなく、日常運用の道具として扱います。

そのため、素早く作れて、後から調整しやすいTailwind CSSが合っています。

## Why shadcn/ui

shadcn/uiを推奨する理由:

- componentがproject内へコピーされる。
- black-box UI dependencyになりにくい。
- Tailwind CSSで編集しやすい。
- dashboard UIに必要な部品が揃っている。
- Dialog、Toast、Table、Tabs、Dropdown、Button、Inputなどを統一しやすい。
- 見た目と挙動をプロジェクト側で管理できる。

このプロジェクトでは、将来の買い手向けUIを細かく育てる必要があります。

そのため、外部ライブラリに閉じ込められるより、componentを手元で編集できるshadcn/uiの方が向いています。

## Material Design 3 Inspired Principles

Material Design 3をそのまま再現する必要はありません。

ただし、次の考え方は採用します。

- 操作対象と状態がすぐ分かる。
- primary actionが明確である。
- card、surface、chip、dialog、toastを一貫して使う。
- soft backgroundと明確なsurfaceで情報を分ける。
- statusやplatformはchipで視認できるようにする。
- destructive actionにはconfirm dialogを使う。
- previewやreviewを画面内に置き、作業の往復を減らす。
- focus state、contrast、keyboard操作を無視しない。

見た目は派手にしすぎず、制作オペレーションに集中できるアプリUIを目指します。

## UI Principles

### Japanese-first labels

UIラベルは日本語を先にします。

必要に応じて英語を補助的に併記します。

例:

- 中心主張（Core Thesis）
- 登録先プラン（Visual Asset Plan）
- 保存予定パス（Expected Path）
- 公開済み（Published）

### App-like dashboard UX

買い手が毎日使う画面は、Webサイトではなくアプリとして設計します。

重要なのは、説明文を読ませることではなく、次の行動が分かることです。

### Card-based layout

画面は、作業単位ごとのcardで構成します。

例:

- 今日の制作キュー
- 出力レビュー
- Visual Register
- Patch JSON確認
- Published output feedback

### Clear primary action

各画面には、もっとも重要なprimary actionを1つ置きます。

例:

- 構造化する
- 下書きを作る
- 登録する
- まとめて登録
- レビュー完了

### Status chips

状態は文章ではなくchipで見せます。

例:

- planned
- prompt-ready
- saved
- reviewed
- approved
- published

### Table / queue views

複数の作業対象はtableまたはqueue viewで扱います。

Visual Register、platformOutput review、publishedOutput管理では、queue viewを基本にします。

### Preview panels

右側または下部にpreview panelを置き、選択中の対象をすぐ確認できるようにします。

例:

- 画像preview
- draft preview
- patch JSON preview
- prompt preview

### Confirm dialogs

次の操作にはconfirm dialogを使います。

- ファイル上書き
- patch適用
- statusの巻き戻し
- document削除
- published扱いへの変更

### Responsive layout

desktopでは、main area + side previewの2カラムを基本にします。

mobileや狭い画面では、縦積みにします。

### Accessibility

最低限、次を守ります。

- contrastを確保する。
- focus stateを見えるようにする。
- buttonやselectにlabelを付ける。
- colorだけで状態を伝えない。
- tableやqueueで操作対象が分かるようにする。

## Reusable Component Candidates

将来dashboardで作る候補:

- `AppShell`
- `TopBar`
- `SideNav`
- `PageHeader`
- `SectionCard`
- `StatusChip`
- `PlatformChip`
- `FileDropzone`
- `QueueTable`
- `PreviewPanel`
- `ConfirmDialog`
- `Toast`
- `PathPreview`
- `PatchJsonPreview`

### AppShell

アプリ全体の土台です。

TopBar、SideNav、main area、status areaを持ちます。

### TopBar

現在の接続状態や主要アクションを置きます。

例:

- Local server status
- Sanity connection status
- 現在のworkspace
- 設定

### SideNav

主要画面を移動するためのナビゲーションです。

例:

- Ideas
- Outputs
- Visuals
- Workflows
- Published
- Prompts
- Tools

### SectionCard

画面内の作業単位を囲むcardです。

cards inside cardsは避け、section単位または繰り返しitem単位で使います。

### StatusChip / PlatformChip

状態や媒体を視覚的に表示します。

stored valueは英語のまま、表示は日本語優先にします。

### FileDropzone

画像、Markdown、JSONなどのローカルファイル選択に使います。

Visual Registerやseed import補助に使えます。

### QueueTable

複数対象を一括処理するためのtableです。

例:

- visual asset registration queue
- platform output review queue
- publish preparation queue

### PreviewPanel

選択中の対象を確認するside panelです。

画像、draft、patch JSON、promptなどを扱います。

### ConfirmDialog

上書き、patch適用、削除などの確認に使います。

### Toast

保存成功、登録完了、エラー、警告を短く知らせます。

### PathPreview

`localAssetPath` や `outputPathPattern` を確認するためのcomponentです。

### PatchJsonPreview

Sanityへ反映する前のpatch JSONを確認するcomponentです。

Visual Registerでは、現在patch JSONを作るだけでSanityへ直接writeしません。

将来dashboardでdirect writeを追加する場合も、まず `PatchJsonPreview` と `ConfirmDialog` で変更内容を確認してから反映します。

patch apply workflowの詳細は `docs/21-visual-register-patch-apply-workflow.md` にまとめます。

Local Patch Review helperでは、`PatchJsonPreview` を中心componentとして使います。

表示するべき情報:

- target document ID
- changed fields
- `localAssetPath`
- local file exists
- `status`
- `updatedAt`
- `reviewNotes`
- `meta.directSanityWrite`

MVPではread-only previewに留め、Sanity direct writeは行いません。

## Design Tokens

### Colors

推奨token:

- `background`: app全体の淡い背景
- `surface`: cardやpanelの背景
- `surface-muted`: input areaやempty state
- `border`: 通常の境界線
- `border-strong`: drag areaや重要な境界線
- `primary`: 主要アクション
- `primary-muted`: primary系chipや補助背景
- `success`: 保存済み、承認済み
- `warning`: 確認必要、未レビュー
- `danger`: エラー、削除、上書き注意
- `text`: 本文
- `text-muted`: 補助説明

### Spacing

推奨scale:

- `4px`: tight gap
- `8px`: component内gap
- `12px`: compact padding
- `16px`: card padding
- `24px`: section gap
- `32px`: page padding

### Border radius

基本は8px以下にします。

- button / chip: pillでもよい
- card: 8px
- input / select: 6px
- preview media: 8px

### Shadow

shadowは控えめに使います。

制作UIでは、強い浮遊感よりも読みやすさを優先します。

### Typography

推奨:

- system font stack
- headingは大きすぎない
- dashboard内headingは18pxから24px程度
- table textは12pxから14px程度
- letter spacingは0
- viewport widthでfont sizeを変えない

### Chip variants

候補:

- `status-planned`
- `status-ready`
- `status-saved`
- `status-reviewed`
- `status-approved`
- `status-published`
- `platform-note`
- `platform-x`
- `platform-youtube`
- `platform-instagram`
- `platform-github`

### Button variants

候補:

- `primary`
- `secondary`
- `ghost`
- `danger`
- `compact`
- `icon`

primary actionは1画面に多く置きすぎないようにします。

## Current Local Visual Register

現在のLocal Visual Registerは、静的HTML / CSS / JavaScriptで実装されています。

これはMVPとして正しい判断です。

理由:

- Next.js導入前でも動く。
- ローカルファイル保存とpatch JSON作成に集中できる。
- 買い手向けdashboardの前に、運用フローを検証できる。
- 依存を増やしすぎない。

今すぐNext.jsへ移行しません。

将来dashboardへ移すときは、現在の機能をそのまま移植するのではなく、上記のshared component systemで再構築します。

移行対象:

- FileDropzone
- QueueTable
- PreviewPanel
- StatusChip
- PlatformChip
- PathPreview
- PatchJsonPreview
- Toast
- ConfirmDialog

## Implementation Order Later

Next.jsを追加する段階では、次の順番を推奨します。

1. Next.js + Tailwind CSS + shadcn/uiの最小セットアップ。
2. `AppShell`、`TopBar`、`SectionCard`、`StatusChip` を作る。
3. Visual RegisterのUIをcomponent単位で再設計する。
4. Sanity readは最小から始める。
5. patch JSON previewを先に作る。
6. direct Sanity writeは、人間レビューと安全確認後に追加する。
7. image generation APIはさらに後に追加する。
