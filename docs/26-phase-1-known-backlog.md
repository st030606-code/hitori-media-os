# Phase 1 Known Backlog

ここには、Phase 1 MVPに入れない改善を移します。

MVPでは「動くローカル手動/半自動ワークフロー」を優先し、便利機能や自動化は後回しにします。

## Visual Register Backlog

- platform filter
- assetType filter
- status filter
- Patch Review copy buttons
- overwrite confirmation dialog
- overwrite前のbackup作成
- patch archive
- patch applied status
- multi-image batch registration test with real images
- better image size handling
- publish package builder polish
- video/audio asset planner implementation
- campaign planner implementation
- Mac launcherのtest mode選択

## Sanity / Data Backlog

- CLI patch helper
- direct Sanity write
- validation for state transitions
- richer visualAssetPlan lifecycle
- publishedOutput seed after actual publishing
- visualAssetPlanとpatch JSONのapplied履歴
- seed file管理ルールの強化

## Dashboard Backlog

- Next.js dashboard
- Tailwind CSS
- shadcn/ui
- lucide-react
- shared UI components
- Visual Register dashboard migration
- Sanity auth / permissions
- dashboard-side Content Idea input
- dashboard-side Patch Review
- campaign planning view
- strategy module library
- video/audio asset planning view

## Automation Backlog

- API image generation
- local model generation
- automatic image save
- auto-posting
- social platform integrations
- scheduling
- generation job queue
- provider-specific generation metadata
- direct publishing remains later only after manual workflow is stable

## Productization Backlog

- Windows launcher
- Linux launcher
- Tauri/Electron desktop app
- buyer onboarding flow
- sample project templates
- documentation site
- packaged demo dataset
- safe update/backup flow for non-technical buyers
- strategy module ingestion templates for purchased courses

## Rule

Backlog itemを実装する前に、次を確認します。

- Phase 1 E2E testが安定しているか。
- その改善がMVP completion criteriaに必要か。
- 既存のlocal-first/no-API原則を壊さないか。
- 人間レビューを飛ばして危険な自動化にならないか。
