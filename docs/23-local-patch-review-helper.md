# Local Patch Review Helper Design

Local Patch Review helperは、Visual Registerが作成したpatch JSONをSanity Studioへ反映する前に、人間が安全に確認するためのローカル補助機能です。

現時点ではSanityへ直接writeしません。

Next.js dashboardもまだ追加しません。

## Goal

patch JSONの手動確認ミスを減らします。

特に、次を画面で確認できるようにします。

- 対象document ID
- 更新されるfield
- `localAssetPath`
- `status`
- `updatedAt`
- `reviewNotes`
- ローカル画像ファイルが存在するか
- patch JSONに直接Sanity writeやsecretが含まれていないか

## Recommended Implementation Location

MVPでは、Patch Review helperはVisual Registerの一部として実装することを推奨します。

理由:

- Visual Registerがpatch JSONを作るため、同じUI内で確認できる方が自然。
- 買い手が別ツールを開く必要がない。
- 現在のLocal Node helper serverで `patches/visual-assets/` と `assets/visuals/` を読める。
- 将来Next.js dashboardへ移行するときも、`PatchJsonPreview` componentとして再利用しやすい。

別ツールにする案もありますが、MVPでは非推奨です。

理由:

- 起動手順が増える。
- Visual Registerとの文脈が分かれる。
- 買い手にとって「どこで何を確認するのか」が増える。

## Proposed UI

Visual Registerに、次のようなPatch Review sectionを追加します。

配置候補:

- top barのtab
- 右側preview panelの下
- 登録キューの下に「Patch Review」card

MVPでは、登録キューの下にcardを追加するのが低リスクです。

### Patch list

`patches/visual-assets/` 以下のpatch JSONを一覧表示します。

表示項目:

- file path
- target document ID
- status
- localAssetPath
- local file exists
- updatedAt

### Patch detail

patchを選ぶと、右側preview panelまたはdetail areaに詳細を表示します。

表示項目:

- `_id`
- `set.localAssetPath`
- `set.status`
- `set.updatedAt`
- `set.reviewNotes`
- `meta.generatedBy`
- `meta.originalFileName`
- `meta.mimeType`
- `meta.directSanityWrite`

Phase 2Aでは、Studio手動反映を楽にするためのcopy buttonsも追加します。

コピーできる値:

- `localAssetPath`
- `status`
- `reviewNotes`
- `updatedAt`
- patch fields compact block

Clipboard APIが使えない場合は、画面上の値を手動でコピーします。

### Validation chips

確認結果はchipで表示します。

- `画像あり`
- `画像なし`
- `direct writeなし`
- `reviewNotes確認`
- `status: saved`

## Validation Rules

Patch Review helperは、最低限次を確認します。

### Required

- patch JSONがvalid JSONである。
- `_id` が存在する。
- `set` が存在する。
- `set.localAssetPath` が存在する。
- `set.status` が存在する。
- `set.updatedAt` が存在する。
- `set.reviewNotes` が存在する。

### File safety

- `set.localAssetPath` がproject root外を指していない。
- `set.localAssetPath` のファイルが存在する。
- path traversalがない。

### Sanity safety

- `meta.directSanityWrite` が `false` である。
- patch JSONにAPI key、token、credential、secretが含まれていない。
- helperはSanityへwriteしない。

### Human review

- `reviewNotes` が現在の状態に合っている。
- `status` が `saved` でよい。
- 画像が対象媒体に合っている。

## Server Endpoint Design

将来実装する場合、Local Visual Register serverに次のread-only endpointを追加します。

```text
GET /api/visual-patches
GET /api/visual-patches/:encodedPath
```

ただし、path parameterの扱いは慎重にします。

より安全なMVP案:

```text
GET /api/visual-patches
```

この1つのendpointで、一覧と詳細をまとめて返します。

返す内容:

```json
{
  "ok": true,
  "patchesRoot": "patches/visual-assets",
  "count": 1,
  "patches": [
    {
      "filePath": "patches/visual-assets/ai-blog-db/note-hero-v1.json",
      "_id": "visualAssetPlan.ai-blog-db.note-hero-v1",
      "set": {
        "localAssetPath": "assets/visuals/ai-blog-db/note/hero/note-hero-v1.png",
        "status": "saved",
        "updatedAt": "2026-05-12T13:22:33.610Z",
        "reviewNotes": "..."
      },
      "meta": {
        "directSanityWrite": false
      },
      "validation": {
        "validJson": true,
        "localAssetPathExists": true,
        "safeLocalAssetPath": true,
        "directSanityWrite": false
      }
    }
  ]
}
```

`patches/visual-assets/` 以下はrecursiveに読みます。

例:

```text
patches/visual-assets/ai-blog-db/note-hero-v1.json
```

patch JSONがない場合も、plain textではなくJSONを返します。

```json
{
  "ok": true,
  "patchesRoot": "patches/visual-assets",
  "count": 0,
  "patches": []
}
```

未知の `/api/*` routeもJSON errorを返します。

```json
{
  "ok": false,
  "error": "Not found",
  "path": "/api/example"
}
```

## What It Should Not Do Yet

MVPでは次をしません。

- Sanityへ直接writeする。
- Sanity tokenを読む。
- patchを自動適用する。
- patch JSONを自動削除する。
- 画像を生成する。
- 自動投稿する。

## Manual Studio Apply Flow

Patch Review helperで確認後、人間がSanity Studioで反映します。

流れ:

1. Patch Reviewでpatchを選ぶ。
2. `_id` を確認する。
3. `localAssetPath` のファイル存在を確認する。
4. `status`、`updatedAt`、`reviewNotes` を確認する。
5. Sanity Studioで同じ `visualAssetPlan` を開く。
6. `set` の内容を手動で反映する。
7. Studioで保存する。
8. Studioで表示を再確認する。

Visual RegisterのPatch Review detailには `Studio反映メモ` を表示します。

このメモは、Sanity Studioでどのfieldを更新するかを確認するための補助です。Patch Review自体はSanityへwriteしません。

## Future Automation

Patch Review helperが安定した後、次を検討できます。

1. patch JSON validationだけ自動化
2. Studio手入力用のcopy buttons
3. confirmed patch list
4. CLI patch helper with confirmation
5. Next.js dashboard Patch Review page
6. Dashboard direct Sanity write

direct writeは最後です。

まず、人間が安心して確認できるUIを作ります。

## Recommended MVP Order

1. Patch Review helper design
2. Visual Register内にread-only Patch Review sectionを追加
3. patch list / detail / validation chipsを表示
4. copy buttonsを追加
5. manual Studio applyをテスト
6. 必要ならconfirm付きCLI patch helperを検討
7. Next.js dashboardへ移行

## Open Questions

- Patch Review sectionをVisual Registerの下部に置くか、tabにするか。
- copy buttonを最初から入れるか。
- patch適用済みをどう記録するか。
- patch JSONのarchive folderを作るか。

MVPでは、まずread-only reviewに絞ります。

## Implementation Status

2026-05-13に、Visual Register内へread-only Patch Review sectionを実装しました。

実装済み:

- `GET /api/visual-patches`
- `patches/visual-assets/` 以下のpatch JSON一覧
- target document ID表示
- `localAssetPath`、`status`、`updatedAt`、`reviewNotes` 表示
- `meta.generatedBy`、`meta.originalFileName`、`meta.mimeType`、`meta.directSanityWrite` の確認
- `localAssetPath` のファイル存在確認
- project root外を指すpathの検出
- direct writeなし / secretらしき値なしのvalidation chips
- Patch Review API failureを登録キューのrow errorと分離
- 未知API routeのJSON error response
- static fileとAPI responseの `no-store` cache control
- 2026-05-13のbrowser retestで、Patch Review reloadのJSON parse errorが解消され、既存patchが表示されることを確認

未実装:

- Sanity direct write
- copy button
- patch適用済み管理
- patch archive
- CLI patch helper
