# Sanity seed の _key ルール

Sanityでは、配列内のobject itemやreference itemに `_key` が必要です。

Studioで `Missing keys` が出た場合、CLI/API経由で作成したseed JSONの配列itemに `_key` が入っていない可能性があります。

## _key が必要なもの

document内部の配列で、itemがobjectまたはreferenceの場合は `_key` を付けます。

例:

```json
{
  "_key": "prompt-note-article",
  "_type": "reference",
  "_ref": "prompt.generate-note-article"
}
```

content objectの場合:

```json
{
  "_key": "claim-ai-usable-db",
  "claim": "AI時代のブログは、完成記事の置き場ではなく、AIが再利用できる知識データベースとして設計したほうが価値が高い。"
}
```

## _key が不要なもの

文字列だけの配列には `_key` は不要です。

例:

```json
[
  "title",
  "summary",
  "coreThesis"
]
```

また、seedファイル自体が複数documentの配列になっている場合、そのトップレベル配列のdocument itemには `_key` は不要です。

例:

```json
[
  {
    "_id": "prompt.generate-note-article",
    "_type": "prompt"
  },
  {
    "_id": "prompt.generate-substack-post",
    "_type": "prompt"
  }
]
```

## 命名方針

`_key` は安定して読める値にします。

例:

- `prompt-note-article`
- `prompt-substack-post`
- `tool-codex`
- `tool-chatgpt`
- `output-note`
- `output-youtube`
- `diagram-before-after`
- `claim-ai-usable-db`
- `angle-note`
- `output-note-article`

ランダム文字列よりも、人間が見て意味の分かるキーを優先します。

## 今回確認したseed

確認対象:

- `seed/contentIdea-ai-blog-db.json`
- `seed/prompt-records.json`
- `seed/platform-output-records.json`
- `seed/diagram-plan-records.json`
- `seed/tool-records.json`
- `seed/workflow-records.json`

確認結果:

- `contentIdea` はobject配列に `_key` が入っている。
- `prompt` は文字列配列のみで、追加の `_key` は不要。
- `platformOutput` はdocument内部にobject配列がないため、追加の `_key` は不要。
- `diagramPlan` は文字列配列のみで、追加の `_key` は不要。
- `tool` は文字列配列のみで、追加の `_key` は不要。
- `workflow` はreference配列に `_key` が入っている。

## 置き換え時の注意

既存documentをseedで修正する場合は、内容を確認したうえで `--replace` を使います。

```bash
npx sanity documents create seed/workflow-records.json --replace
```

`--replace` はStudio上の手動編集を上書きする可能性があります。

実行前に、Studioで編集した内容がseedに反映されているか確認します。
