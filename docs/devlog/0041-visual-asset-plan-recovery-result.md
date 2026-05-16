# 0041: visualAssetPlan seed --replace recovery result

日付: 2026-05-13

## 背景

`expectedLocalAssetPath` backfill前に、誤って次のコマンドが実行されました。

```bash
npx sanity documents create seed/visual-asset-plan-records.json --replace
```

この結果、`expectedLocalAssetPath` は5件すべてに入りましたが、既存の `localAssetPath`、`status`、`reviewNotes` がseed値へ戻った可能性がありました。

## 復旧結果

Studioでnote heroを確認し、必要な復旧を行いました。

- note hero `localAssetPath`: restored
- note hero `status`: `saved`
- note hero `reviewNotes`: 現在の保存済み / レビュー待ち状態に合わせて復旧
- local image exists: yes
- `localAssetPath` restored if needed: yes
- `status` restored to `saved` if needed: yes
- `expectedLocalAssetPath` still present for all 5 docs: yes

復旧対象のローカル画像:

```text
assets/visuals/ai-blog-db/note/hero/note-hero-v1.png
```

## 現在の状態

note heroについては、保存予定パスと実保存パスの両方が揃いました。

- `expectedLocalAssetPath`: 保存予定パス
- `localAssetPath`: 実際に保存された画像パス

X hook、Instagram carousel、GitHub architecture、YouTube thumbnailについても、`expectedLocalAssetPath` はStudioに存在しています。

## まだ必要な確認

Visual Registerの再テストはまだ記録されていません。

次に確認すること:

- Visual Registerで5件の `expectedLocalAssetPath` が表示されるか。
- note heroで `localAssetPath` と `expectedLocalAssetPath` が一致して見えるか。
- 既存画像を登録し直す場合に上書き確認が必要か。
- 複数画像batch registrationを改めてテストするか。

## 今後のルール

partial field backfillでは `seed --replace` を使いません。

既存documentの一部fieldを更新する場合は、次を使います。

- Studio manual update
- patch JSON
- 将来の確認付きCLI patch helper

`--replace` は、初期seed作成またはdocument全体を意図的に置き換える場合だけ使います。

## 次の一手

次は、Visual Registerに既存ファイル上書き確認を追加するのがよいです。

理由:

- すでにnote hero画像が存在している。
- 再登録時に意図せず上書きするリスクがある。
- batch registration前に、上書き安全性を入れておく方が安心。
