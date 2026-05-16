# tool seed 作成ガイド

このガイドは、`workflow.toolsUsed` から参照される `tool` documentをSanity Studioへ作成するためのメモです。

`workflow` seedは `tool` documentを参照するため、必ず `workflow` seedより先に作成します。

## seedファイル

```text
seed/tool-records.json
```

含まれる `tool`:

- `tool.codex`
- `tool.claude-code`
- `tool.chatgpt`
- `tool.claude-app`
- `tool.sanity`
- `tool.sanity-cli`
- `tool.sanity-studio`
- `tool.local-files`
- `tool.docs-devlog`
- `tool.github`
- `tool.obsidian`
- `tool.capcut`
- `tool.elevenlabs`
- `tool.fish-audio`

## workflowから参照されているtool

現時点の `seed/workflow-records.json` で直接参照されているtoolは次です。

- `tool.chatgpt`
- `tool.codex`
- `tool.docs-devlog`
- `tool.local-files`
- `tool.sanity-cli`
- `tool.sanity-studio`

それ以外のtoolは、今後の制作フローで使う可能性が高いため、先に台帳化しています。

## 方針

- APIキー、トークン、認証情報、シークレットは保存しません。
- `relatedWorkflows` は今回入れません。
- `tool` を先に作り、その後に `workflow` を作ります。
- ElevenLabs、Fish Audio、CapCutはLLM API連携ではなく、媒体化のための制作ツールとして扱います。

## CLIで作成する

事前に `.env.local` が設定されていることを確認します。

```env
SANITY_STUDIO_PROJECT_ID=your_project_id
SANITY_STUDIO_DATASET=production
```

必要ならStudioを起動します。

```bash
npm run dev
```

別ターミナルで、次を実行します。

```bash
npx sanity documents create seed/tool-records.json
```

同じ `_id` のdocumentを作り直す場合だけ、内容を確認したうえで `--replace` を使います。

```bash
npx sanity documents create seed/tool-records.json --replace
```

## Studioで確認すること

- 14件の `tool` documentが作成されているか。
- `category` が制御値で保存されているか。
- `usedFor` が最低1件以上入っているか。
- `costModel` が制作上の費用感として妥当か。
- `notes` にAPIキー、トークン、認証情報、シークレットが入っていないか。

## 次に進む条件

`tool` seedの作成とStudio確認ができたら、`workflow` seedを再実行できます。

```bash
npx sanity documents create seed/workflow-records.json
```
