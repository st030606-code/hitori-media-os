# Devlog 0061: building-hitori-media-os Seed + Publish Package Builder Slug Generalization

Date: 2026-05-14

## 今日の判断

次のbuilding-in-publicキャンペーン `building-hitori-media-os` のseed基盤と、複数Content Ideaに対応するためのPublish Package Builder一般化を、ひとつの安全なバッチとして進めました。

実装方針は次の通りです。

- 新規Content Ideaのseed JSONとplaceholder draftだけを追加する。
- Publish Package Builderは、slug引数を受け取り、下書きを自動検出する。
- ai-blog-dbの既存挙動は完全に維持する。
- Sanity CLI、API連携、自動投稿、画像生成は触らない。

## 変更したこと

### Batch A: building-hitori-media-os campaign seed foundation

- `seed/contentIdea-building-hitori-media-os.json` を追加。
  - `_id: contentIdea.building-hitori-media-os`
  - `slug.current: building-hitori-media-os`
  - title: `AIで「ひとりメディア運営OS」を作っている裏側`
  - coreThesis: `発信を頑張るより、発信が回る仕組みを作る。AIで記事を量産する前に、AIが使える知識DBと制作ワークフローを設計したほうが、ひとりメディア運営は長く続けやすい。`
  - claims、tone、platformAngles、outputChecklist、examples、objectionsを `docs/41-next-campaign-tool-building-in-public.md` の方針に合わせて整理。
- 次のplaceholder draftを追加（すべて `status: draft-placeholder` と明記、TODOのみ）。
  - `outputs/note/2026-05-14--building-hitori-media-os--note.md`
  - `outputs/x/2026-05-14--building-hitori-media-os--x.md`
  - `outputs/threads/2026-05-14--building-hitori-media-os--threads.md`
  - `outputs/substack/2026-05-14--building-hitori-media-os--substack.md`
  - `outputs/youtube/2026-05-14--building-hitori-media-os--youtube.md`
  - `outputs/shorts/2026-05-14--building-hitori-media-os--shorts.md`
  - `outputs/podcast/2026-05-14--building-hitori-media-os--podcast.md`

ai-blog-dbの既存seedとdraftには触れていません。

### Batch B: publish-package-builder slug generalization

- `tools/publish-package-builder/build.mjs` の `packageConfigs` を `draftPath`（日付ハードコード）から `draftSourceDir`（フォルダ指定）へ置き換え。
- `resolveDraftPath(sourceDir, platform, slug)` を追加し、`outputs/<platform>/` 内で `*--<slug>--<platform>.md` の規約に合うファイルを検出。複数ある場合は最新（lexicographic sort）を採用。
- 下書きが見つからない場合のTODOメッセージを `slug=... platform=... (no file matched ...)` へ詳細化。
- 結果JSONに `draftSource` フィールドを追加し、どのファイルから読んだか可視化。
- `instagram` と `github` は `draftSourceDir: null` のまま据え置き、従来通りTODO扱い。
- `README.md` と `docs/32-publish-package-builder.md` に、slug argumentと自動検出仕様を反映。

## 理由

`build.mjs` には `outputs/note/2026-05-11--${contentSlug}--note.md` のように日付がハードコードされており、新しいContent Ideaを増やすとdraftが「見つからない」扱いになる構造でした。Hitori Media OSは「1つのContent Idea → 複数媒体」を繰り返すOSなので、ここを最初に直しておかないと、これからContent Ideaが増えるたびに人間が手で日付を書き換える必要がありました。

Batch AはBatch Bの動作確認も兼ねています。building-hitori-media-osのdraftは、placeholderだとしても自動検出が正しく動くかの検証材料になります。

## APIなしで済ませた理由

今回必要だったのは「次のキャンペーンの素材設計」と「複数Content Ideaを扱えるビルダー」だけです。

- 自動投稿は不要
- LLM API呼び出しも不要
- 画像生成API呼び出しも不要
- Sanity direct writeも不要

ファイル追加とビルダー修正だけで、Hitori Media OSの汎用性が一段上がりました。

## CodexとClaude Codeの役割分担

- Codex: ai-blog-db release-prep packageの整備までを担当（前バッチ）。
- Claude Code: 次キャンペーンseedと、Publish Package Builderの一般化を担当。

Claude Codeが担当した今回は、すべて追加変更（additive）に留め、ai-blog-dbや既存テストseedには触っていません。

## 発信コンテンツにできる切り口

- 次のキャンペーン `building-hitori-media-os` を、ai-blog-dbリリースと並走で土台だけ用意した。
- ハードコードされた日付を外して、複数Content Ideaに耐えるビルダーへ進化させた。
- 「APIを増やす前にビルダー本体を一般化する」順番がHitori Media OSらしい意思決定。
- 自分でも実感した、開発ログそのものがbuilding-in-publicの素材になる流れ。

## Validation

次のコマンドはすべて成功しました。

- `node --check tools/publish-package-builder/build.mjs`
- `node --check tools/local-check.mjs`
- `npm run local:check`
- `npm run publish:package -- ai-blog-db`
- `npm run publish:package -- building-hitori-media-os`
- `npm run build`

`npm run publish:package -- ai-blog-db` は引き続き `safe-skip-existing-files` で動作し、既存ファイルは上書きされませんでした。`building-hitori-media-os` 側は9媒体すべてのpackage folderが新規生成されました（instagramとgithubのみTODO placeholder付き）。

## 次にテストすること

1. `outputs/note/2026-05-14--building-hitori-media-os--note.md` のTODOを実際の下書きに置き換え、`npm run publish:package -- building-hitori-media-os` で再生成しても既存ファイルが保たれることを確認する。
2. `publish-packages/note/building-hitori-media-os/article.md` を実下書きで更新するワークフローを決める（既存ファイル温存なので、置き換え方を人間レビューで決める）。
3. ai-blog-dbリリース完了後、building-hitori-media-osの最初のX / Substack投稿を準備する。
