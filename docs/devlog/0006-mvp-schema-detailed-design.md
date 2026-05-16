# 0006: MVP 7スキーマ詳細設計

日付: 2026-05-11

## 背景

Phase 1 では、ひとつのローカルJSONから複数媒体の下書きを作れるか検証しました。

作成した出力:

- note
- Substack
- Threads
- X
- YouTube
- Shorts
- Podcast
- Diagram

その結果、ローカルJSONワークフローは成立する一方で、Sanityに移行する前にスキーマ境界を明確にする必要があると分かりました。

## 決定・変更

`docs/02-schema-design.md` を、MVP 7スキーマの詳細設計として更新しました。

設計したスキーマ:

- `contentIdea`
- `prompt`
- `workflow`
- `platformOutput`
- `diagramPlan`
- `publishedOutput`
- `tool`

TypeScriptスキーマコードはまだ書いていません。

Sanity Studioも初期化していません。

## スキーマ境界の判断

`contentIdea` は、元になる構造化知識だけを持ちます。

生成された下書きは `platformOutput` に分けます。

図解、カルーセル、サムネイル、図解ペア投稿は `diagramPlan` に分けます。

公開URL、公開日、公開後の反応は `publishedOutput` に分けます。

どの入力から、どのプロンプト・ツールで、どの出力を作ったかは `workflow` に記録します。

プロンプトは `prompt` として再利用可能な資産にします。

Codex、Claude Code、ChatGPT、Claude アプリ、CapCut、ElevenLabs、Fish Audio などは `tool` に記録します。

## Phase 1 から反映した学び

文章系では、`coreThesis`、`audiencePain`、`claims`、`objections`、`platformAngles` が特に効きました。

動画・音声・図解では、`outputLength`、`targetFormat`、`aspectRatio` のような出力側の制約が必要だと分かりました。

Xでは、`primaryCTA` と図解ペア投稿の扱いが重要でした。

SubstackとPodcastでは、発信者本人の体験を入れるために `personalContext` が必要です。

noteやYouTubeでは、ミニJSONや具体的な作業例として `concreteExample` が効きます。

## no-API MVPを保つ理由

今回の設計でも、OpenAI API や Anthropic API を組み込む前提にはしていません。

MVPでは、Codex、Claude Code、ChatGPT、Claude アプリに入力レコードとプロンプトを渡し、人間がレビューしながら出力を作ります。

自動化する前に、どのフィールドが効くか、どの媒体で人間レビューが必要かを見極めるためです。

## まだ人間レビューが必要な点

次の点は、TypeScriptスキーマを書く前に人間レビューが必要です。

- `contentIdea` の必須項目が多すぎないか
- `platformOutput` と `diagramPlan` の分離が実務上わかりやすいか
- `prompt` をSanityで管理する必要があるか、Markdown管理だけでよいか
- `workflow` の記録粒度が細かすぎないか
- `tool` にどこまで制作ツールを含めるか
- `publishedOutput` で最低限どの反応メモを残すか

## 次の一手

人間レビュー後、Sanity TypeScriptスキーマへ進めます。

ただし、いきなりStudio全体を作るのではなく、まずは次の順番がよさそうです。

1. `contentIdea`
2. `prompt`
3. `platformOutput`
4. `diagramPlan`
5. `workflow`
6. `publishedOutput`
7. `tool`

この順番なら、まず元レコードと出力下書きの関係を固められます。

