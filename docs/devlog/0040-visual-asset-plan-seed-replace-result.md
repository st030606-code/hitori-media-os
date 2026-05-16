# 0040: visualAssetPlan seed --replace result

日付: 2026-05-13

## 背景

`expectedLocalAssetPath` を既存Sanity `visualAssetPlan` documentsへ追加するため、patch-only workflowを推奨していました。

しかし、patch-only workflowを適用する前に、誤って次のコマンドが実行されました。

```bash
npx sanity documents create seed/visual-asset-plan-records.json --replace
```

## 結果

`expectedLocalAssetPath` は5件すべてに入りました。

Studioで表示確認済み:

- note hero
- X hook
- Instagram carousel cover
- GitHub architecture
- YouTube thumbnail

つまり、backfill自体は技術的には成功しています。

## リスク

`--replace` はdocument全体を置き換えます。

そのため、既存の次のfieldがseedの値へ戻った可能性があります。

- `localAssetPath`
- `status`
- `reviewNotes`

特に、以前Visual Registerで保存済みだったnote heroの `localAssetPath` がStudio上で空に見えるため、手動復旧が必要かもしれません。

## Recovery note

ローカル画像ファイルは存在しています。

```text
assets/visuals/ai-blog-db/note/hero/note-hero-v1.png
```

必要であれば、Sanity Studioで `visualAssetPlan.ai-blog-db.note-hero-v1` を開き、次を手動復旧します。

- `localAssetPath`: `assets/visuals/ai-blog-db/note/hero/note-hero-v1.png`
- `status`: `saved`
- `reviewNotes`: 現在の状態に合う文面へ整理

復旧参考:

```text
patches/visual-assets/ai-blog-db/note-hero-v1.json
```

## 今後のルール

partial field backfillでは `seed --replace` を使わないようにします。

既存documentにfieldを足す場合は、次のどちらかを使います。

- Studio manual update
- patch JSON + 将来の確認付きCLI patch helper

`--replace` は、初期seed作成または全置換が明確に必要な場合だけ使います。

## 次の一手

Studioでnote heroの `localAssetPath`、`status`、`reviewNotes` を確認します。

必要なら手動復旧し、その後Visual Registerで保存予定パスと実保存パスの表示を再テストします。

## 復旧結果

Studioでnote heroの状態を確認し、必要な復旧を行いました。

- note hero `localAssetPath`: restored
- note hero `status`: `saved`
- note hero `reviewNotes`: 現在の保存済み / レビュー待ち状態に合わせて復旧
- local image exists: yes
- `localAssetPath` restored if needed: yes
- `status` restored to `saved` if needed: yes
- `expectedLocalAssetPath` still present for all 5 docs: yes

これで、note heroについては `expectedLocalAssetPath` と `localAssetPath` の両方が意図した状態に戻りました。

Visual Registerの再テストはまだ記録されていないため、次に確認します。
