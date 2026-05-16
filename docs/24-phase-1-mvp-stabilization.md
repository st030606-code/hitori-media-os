# Phase 1 MVP Stabilization

Phase 1 MVPは、Sanity AI Content OSを「ローカルファースト・手動/半自動」で安全に動かせる状態に固定する段階です。

この段階では、新しい自動化を増やすより、すでに動いている流れを壊さず確認できることを優先します。

## Completion Criteria

Phase 1 MVPは、次を満たしたら完了とします。

### Sanity Studio

- Sanity Studioがローカルで起動する。
- `.env.local` で `SANITY_STUDIO_PROJECT_ID` と `SANITY_STUDIO_DATASET` を設定できる。
- required Sanity schemasが読み込まれる。
- Studio上で主要document typeが見える。

### Seed Data

- `contentIdea` seedを作成できる。
- `prompt` seedを作成できる。
- `platformOutput` seedを作成できる。
- `diagramPlan` seedを作成できる。
- `tool` seedを作成できる。
- `workflow` seedを作成できる。
- `visualAssetPlan` seedを作成できる。
- seed作成では `--replace` を安易に使わない。

### Existing Seed Validation

- `contentIdea.ai-blog-db` がStudioで確認できる。
- prompt recordsがStudioで確認できる。
- platformOutput recordsがStudioで確認できる。
- diagramPlan recordsがStudioで確認できる。
- tool recordsがStudioで確認できる。
- workflow recordsがStudioで確認できる。
- visualAssetPlan recordsがStudioで確認できる。

### Launcher

- `launchers/start-mac.command` をダブルクリックしてローカル作業を開始できる。
- Terminalはログウィンドウとして残る。
- ユーザーは通常利用で `npm run dev` を手入力しなくてよい。

### Visual Register

- Visual Registerが起動する。
- `visualAssetPlan` recordsを読み込める。
- `expectedLocalAssetPath` を表示できる。
- 画像を選択できる。
- 画像をpreviewできる。
- `visualAssetPlan` を選べる。
- 画像を `assets/visuals/...` へ保存できる。
- patch JSONを `patches/visual-assets/...` へ作成できる。
- overwrite protectionが誤上書きを防ぐ。
- 登録成功後はsaved stateとして表示される。
- Patch Reviewがpatch JSONをread-onlyで表示できる。
- Patch Reviewがlocal file existsを検証できる。
- Content Idea displayが見える。
- Content Idea filter / groupingが動く。
- test seed modeが動く。

### Explicit Non-Goals

Phase 1 MVPでは、次は実装しません。

- Sanity direct write
- image generation API
- OpenAI API / Anthropic API client
- paid LLM API integration
- auto-posting
- social platform integration
- Next.js dashboard
- production desktop app

## Stabilization Rule

Phase 1では、便利そうな機能を増やす前に、現在のlocal-first workflowを通しで確認します。

新機能は `docs/26-phase-1-known-backlog.md` に移し、MVPの安全性と再現性を優先します。
