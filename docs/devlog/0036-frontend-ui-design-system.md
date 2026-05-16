# 0036: Frontend UI design system specification

日付: 2026-05-13

## 背景

Local Visual Registerは、静的HTML / CSS / JavaScriptでMVPとして動く状態になりました。

UIの方向性も、dashboard-like、Material Design 3 inspired、日本語優先、card layout、chips、queue table、preview panelに寄ってきています。

次にNext.js dashboardへ進む前に、将来のUI実装方針を明文化しました。

## 変更

追加:

- `docs/20-frontend-ui-design-system.md`

更新:

- `docs/05-future-dashboard.md`
- `docs/19-local-visual-register-ui.md`

## 推奨frontend stack

将来のdashboardでは次を推奨します。

- Next.js
- Tailwind CSS
- shadcn/ui
- lucide-react
- Material Design 3 inspired design principles

## なぜTailwind CSSか

Tailwind CSSは、素早く実装でき、余白・色・responsive・状態表現を一貫して扱いやすいです。

また、shadcn/uiと相性がよく、再利用可能で編集しやすいcomponentを作りやすいため、このプロジェクトに合っています。

## なぜshadcn/uiか

shadcn/uiはcomponentをproject内にコピーして使うため、black-box UI dependencyになりにくいです。

買い手向けdashboardは細かい調整が必要になるため、手元で編集できるcomponent方針が向いています。

## 決定

現在のLocal Visual Registerは、今すぐNext.jsへ移行しません。

理由:

- 現在のMVPはローカル保存とpatch JSON作成の検証が目的。
- 軽量な静的UIで十分に検証できる。
- Next.js追加前に、運用フローを固める方が重要。

将来dashboardへ移すときは、現在のUIをそのまま移植せず、shared component systemで再構築します。

## component候補

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

## 次の一手

すぐにNext.jsを追加するのではなく、まずは次を進めます。

- 複数画像でのBatch Visual Register手動テスト
- 既存ファイル上書き確認の設計
- patch JSONをSanityへ安全に反映する手順設計

Next.jsを追加する段階では、`docs/20-frontend-ui-design-system.md` を参照して最小セットアップを行います。
