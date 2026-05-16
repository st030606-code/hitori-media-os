# Next Phase Plan

日付: 2026-05-14

Phase 1では、local-first / no-API / manual-review のMVPを固めます。

次の開発は、いきなり自動化へ進まず、product polish、dashboard、automation の順で進めます。

2026-05-14以降は、Content OSをHitori Media OS v0.2として扱います。

v0.2では、ひとつのContent Ideaを、text、visual、video、audio、Substack、note、X、Threads、Instagram、YouTube、Shorts、Podcast、future sales / education contentへ展開するmedia campaignとして設計します。

## Phase 2A: Product Polish

目的: 既存MVPを実運用しやすくする。

- Visual Registerのplatform filter
- Visual RegisterのassetType filter
- Visual Registerのstatus filter
- Patch Review copy buttons
- publish package builder polish
- video/audio planning docs
- strategy module ingestion workflow
- cross-platform campaign prompt
- Windows launcher
- Linux launcher
- onboarding document
- seed作成手順の整理
- demo datasetの整理
- overwrite前backup
- patch applied / archived status

## Phase 2B: Dashboard

目的: buyer-facing operation UI を作る。

- Next.js dashboard
- Tailwind CSS
- shadcn/ui
- lucide-react
- shared UI components
- AppShell / TopBar / SideNav
- Content Idea input screen
- Visual Register dashboard migration
- Patch Review dashboard migration
- Sanity connection status
- visual asset pipeline view
- video/audio asset pipeline view
- campaign planning view
- strategy module library
- manual review workflow view

## Phase 2C: Automation

目的: 人間レビューを残したまま、必要な部分だけ自動化する。

- Sanity direct write with confirmation
- CLI patch helper
- image generation API option
- local model option
- generation job status
- scheduling
- publish package export
- result tracking
- strategy module assisted workflows
- social platform integration
- auto-posting later

## Recommended Order

1. Phase 1 E2E testを人間が完了する。
2. demoで見つかった不具合だけ直す。
3. Phase 2Aのproduct polishに進む。
4. Windows launcherとPatch Review copy buttonsを先に実装する。
5. その後、Next.js dashboardへ進む。
6. API generation / auto-postingは、dashboardとreview workflowが安定してから検討する。

## Phase 2A Progress

2026-05-14時点で、Patch Review copy buttons、platform / assetType filter、minimal publish package builder、local diagnosticsは実装済みです。

Substack教材インサイトをもとに、Substackを単なるplatformOutputではなく、publication / email / Notes / subscriber assetの戦略レイヤーとして扱う方針も追加しました。

Hitori Media OS v0.2として、video/audio asset planning、strategy module ingestion、cross-platform campaign prompt、Substack/Threads/Shorts/Podcast package targetsも追加しました。

次のPhase 2Aでは、実ブラウザ確認、copy UXの微調整、Substack package polish、Windows launcher、campaign package polishを検討します。

## Do Not Rush

Phase 2で急いで自動化すると、Phase 1で大事にした「人間が判断しながら進めるContent OS」の強みが薄くなります。

まずはローカルMVPを安定させ、どの作業が本当に繰り返し発生するかを確認してから、自動化する範囲を決めます。
