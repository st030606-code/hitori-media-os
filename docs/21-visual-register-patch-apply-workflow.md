# Visual Register Patch Apply Workflow

Visual Registerは、手動生成した画像をローカル保存し、Sanity更新用のpatch JSONを作ります。

このドキュメントは、そのpatch JSONをどう確認し、どう安全にSanityへ反映するかを定義します。

現時点では、Visual RegisterからSanityへ直接writeしません。

Next.js dashboardもまだ追加しません。

`expectedLocalAssetPath` は、保存前から `visualAssetPlan` に持たせる予定パスです。

Visual Registerはこの値を優先して保存先に使います。

`localAssetPath` は、保存後にpatch JSONで更新する実績パスです。

## Current Patch Shape

現在のpatch JSONは、次のような形です。

```json
{
  "_id": "visualAssetPlan.ai-blog-db.note-hero-v1",
  "set": {
    "localAssetPath": "assets/visuals/ai-blog-db/note/hero/note-hero-v1.png",
    "status": "saved",
    "updatedAt": "2026-05-12T13:22:33.610Z",
    "reviewNotes": "Local image saved through Visual Register. Needs visual review."
  },
  "meta": {
    "generatedBy": "tools/visual-register",
    "originalFileName": "note-hero-eye-catch-v1.png",
    "mimeType": "image/png",
    "directSanityWrite": false
  }
}
```

`set` に入っている値だけをSanityへ反映します。

`meta` は人間レビュー用の補足情報です。Sanityへ必ず保存する必要はありません。

## Review Checklist

patch JSONをSanityへ反映する前に、次を確認します。

- `_id` が対象の `visualAssetPlan` document IDと一致しているか。
- `expectedLocalAssetPath` が保存前の予定パスとして妥当か。
- patch JSONの `localAssetPath` がproject内の正しい画像ファイルを指しているか。
- `expectedLocalAssetPath` と `localAssetPath` が一致している、または差分に理由があるか。
- 実際にその画像ファイルが存在するか。
- 画像が対象媒体と配置に合っているか。
- `status` が `saved` でよいか。
- `updatedAt` が今回の登録日時として妥当か。
- `reviewNotes` に古いメモや矛盾した表現が残っていないか。
- `meta.directSanityWrite` が `false` になっているか。
- patch JSONにAPI key、token、project ID、credentialが含まれていないか。

特に `reviewNotes` は注意します。

Visual Registerは、元の `visualAssetPlan.reviewNotes` を引き継ぐ場合があります。

保存前の古いメモが残っている場合は、Sanityへ反映する前に文面を整理します。

## Recommended MVP Workflow

MVPでは、次の順番を推奨します。

1. Visual Registerで画像を登録する。
2. `assets/visuals/...` に画像が保存されたことを確認する。
3. `patches/visual-assets/...` にpatch JSONが作られたことを確認する。
4. patch JSONを開いて内容をレビューする。
5. Sanity Studioで対象の `visualAssetPlan` を開く。
6. `expectedLocalAssetPath` がすでに入っていることを確認する。
7. patch JSONの `set` 内容を手動で入力する。
8. Studio上で保存する。
9. Studioで `localAssetPath`、`status`、`updatedAt`、`reviewNotes` を再確認する。

この方法は少し手間がありますが、初期MVPではもっとも安全です。

理由:

- Sanityへの誤更新を避けやすい。
- UI上で対象documentを目視確認できる。
- patch形式が正しいか運用で学べる。
- direct write実装前に、人間レビューの観点を固められる。

## Manual Studio Update

### Good for

- 初期MVP
- 1件から数件の画像登録
- schemaやfield labelの確認
- patch内容の目視レビュー
- 買い手向けUIを作る前の運用検証

### Steps

1. Sanity Studioを開く。
2. `ビジュアルアセット計画（Visual Asset Plan）` を開く。
3. patch JSONの `_id` と同じdocumentを探す。
4. `expectedLocalAssetPath` が予定パスとして入っていることを確認する。
5. `localAssetPath` を入力する。
6. `status` を `保存済み（saved）` にする。
7. `updatedAt` をpatch JSONの値に合わせる。
8. `reviewNotes` を確認して必要なら整える。
9. 保存する。

### Risks

- 手入力ミスが起きる。
- 件数が増えると遅い。
- `updatedAt` のコピーが面倒。

## CLI Patch Command

CLI patchは、MVPの次段階で検討します。

### Good for

- 数件から十数件のpatch適用
- Studioでの手入力を減らしたいとき
- patch JSON形式が安定した後

### Possible shape

将来、専用スクリプトを作る場合は、次のような流れにします。

```text
node tools/visual-register/apply-patch.mjs patches/visual-assets/ai-blog-db/note-hero-v1.json
```

または:

```text
node tools/visual-register/apply-patches.mjs patches/visual-assets/ai-blog-db/
```

ただし、現時点では実装しません。

実装する場合も、次を必須にします。

- patch内容を表示する。
- 対象 `_id` を表示する。
- 変更されるfieldを表示する。
- human confirmationを求める。
- secretsを読まない。
- direct writeが発生することを明示する。

### Risks

- 誤ったpatchを一括反映する可能性がある。
- Sanity auth token管理が必要になる。
- no-API MVPの安全性が下がる。

このため、CLI patchは「patch形式が安定してから」の段階に置きます。

## Future Dashboard Direct Write

将来のNext.js dashboardでは、Visual Registerの画面からSanityへ直接writeできる可能性があります。

ただし、これは後の段階です。

### Good for

- 買い手向けの日常運用
- 画像登録からstatus更新までを1画面で完結させたい場合
- patch JSON preview、confirm dialog、audit logが揃った後

### Required UI

shared component systemでは、次のcomponentが必要です。

- `PreviewPanel`
- `PathPreview`
- `PatchJsonPreview`
- `ConfirmDialog`
- `Toast`
- `StatusChip`

direct write前には、必ずconfirm dialogを表示します。

確認内容:

- target document
- changed fields
- current value
- next value
- local image path
- status transition

### Risks

- 誤操作でSanity documentを更新する可能性がある。
- 認証・権限設計が必要。
- token管理が必要。
- local file保存とSanity writeの失敗時に状態差分が出る。

このため、dashboard direct writeは、Visual Registerの運用が固まり、patch review UIができた後にします。

## Comparison

| option | Pros | Cons | Recommended timing |
| --- | --- | --- | --- |
| Manual Studio update | 安全。対象documentを目視できる。初期検証に向く。 | 手入力が遅い。件数が増えると面倒。 | 今すぐのMVP |
| CLI patch command | 手入力を減らせる。複数patchに向く。 | token管理と確認UIが必要。誤反映リスクがある。 | patch形式が安定した後 |
| Future dashboard direct write | 買い手にとって最も自然。操作が1画面で完結する。 | 認証、権限、confirm UI、失敗時処理が必要。 | Next.js dashboard以降 |

## Recommended Order

1. Manual Studio update
2. Patch JSON review checklist
3. Multi-image batch registration test
4. Overwrite confirmation in Visual Register
5. Optional CLI patch helper with confirmation
6. Next.js dashboard patch preview UI
7. Dashboard direct Sanity write

## Backfilling expectedLocalAssetPath

`expectedLocalAssetPath` を既存の `visualAssetPlan` documentsへ追加する場合は、document全体のseed replaceではなく、小さなpatch JSON方式を推奨します。

詳細は `docs/22-expected-local-asset-path-backfill.md` にまとめます。

今回のbackfill patchは、`expectedLocalAssetPath` だけを `set` します。

既存の `localAssetPath`、`status`、`reviewNotes` は触りません。

## What Remains Manual

現時点で手動のままにすること:

- 画像生成
- 画像の見た目レビュー
- patch JSONの内容確認
- Sanity Studioでのfield入力
- 公開パッケージへの組み込み
- note、X、Instagram、YouTubeなどへの投稿

## What Can Be Automated Later

後で自動化できること:

- patch JSON validation
- 対象document存在確認
- local image path存在確認
- patch JSON preview UI
- Studio入力の代わりになるCLI patch helper
- dashboard direct write
- status transition validation
- visualAssetPlan audit log

## Local Patch Review Helper

patch JSONの手動確認ミスを減らすために、Local Patch Review helperを設計します。

詳細は `docs/23-local-patch-review-helper.md` にまとめます。

MVPでは、Visual Register内にread-only Patch Review sectionとして追加する方針です。

このhelperはpatch JSONを一覧し、対象document ID、更新field、`localAssetPath`、`status`、`updatedAt`、`reviewNotes`、ローカル画像ファイルの存在を表示します。

Sanityへ直接writeはしません。

2026-05-13時点で、Visual Register内にread-only Patch Review sectionを実装済みです。

次は、Sanity Studioへ手動反映するときのcopy buttonを追加するか、まず現行UIで手動レビューをテストします。

## Next.js Should Still Wait

Next.jsはまだ追加しません。

理由:

- まずpatch運用の安全性を確認する必要がある。
- Visual Registerのbatch registrationも複数画像では未テスト。
- direct writeより前に、review checklistとconfirm flowを固めるべき。
- 現在の静的UI + patch JSONで、まだ十分にMVP検証できる。
