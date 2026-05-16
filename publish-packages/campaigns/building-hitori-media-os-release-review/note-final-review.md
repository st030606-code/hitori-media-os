# note Final Review: building-hitori-media-os

Status: ready-for-human-final-edit
Not auto-posted.

## Source Files

- [publish-packages/note/building-hitori-media-os/article.md](../../note/building-hitori-media-os/article.md)
- [outputs/note/2026-05-14--building-hitori-media-os--note.md](../../../outputs/note/2026-05-14--building-hitori-media-os--note.md)
- [publish-packages/note/building-hitori-media-os/insert-map.md](../../note/building-hitori-media-os/insert-map.md)

## Title Options

採用は1つ。

- AIで「ひとりメディア運営OS」を作っている裏側
- 発信を頑張るより、発信が回る仕組みを作る
- ひとりメディア運営は「コンテンツの量」ではなく「制作の型」で詰む
- AIで記事を書く前に、AIが読めるDBを作っている話

## Recommended Title

> AIで「ひとりメディア運営OS」を作っている裏側

note の検索流入と building-in-public の文脈をいちばん素直に表す案。最終的に本人判断で1つに決める。

## Lead Paragraph

> これは、完成したツールを紹介する記事ではありません。AIを使って「ひとりメディア運営OS」を組み立て直している途中の、building-in-publicな実験ログです。
>
> （以下、source 参照）

冒頭リードを「実験ログ」と明示してあるため、ここを削らない。

## Section Outline

1. 発信を頑張るほど消耗する構造
2. 中心にあるのは「1つの構造化されたContent Idea」
3. AIに記事を書かせる前に、AIが読めるDBを作る
4. 自動化は最後、まず手動で回る型を作る
5. text / visual / video / audio を1つのアイデアから捌く
6. いま手動に残している作業
7. 真似できる最初の1ステップ

各章は source の本文ドラフトを直接参照。

## Image Insertion Checklist

- [ ] 第2章 H2 直下: contentIdea を中心に各媒体へ展開している関係図
- [ ] 第4章 H2 末尾: 「手動 → 半自動 → 自動」の優先順位イメージ
- [ ] 第5章 末尾: Publish Package Builder のフォルダ構造図
- [ ] 記事冒頭または末尾: building-hitori-media-os キャンペーン全体の地図

Visual Register で登録済みの画像があれば優先する。無ければ note 公開後に追加するか、TODO のまま残す。

## CTA

- soft: 続きや制作判断は Substack の開発ログに少しずつ書いています。気が向いたら覗いてみてください。
- soft: 同じテーマで「自分はこの作業を仕組み化したい」と感じた人は、note のコメント欄か X で教えてもらえると嬉しいです。

派手な購読煽りはしない。

## Final Human Decision Points

- [ ] 採用するタイトルを1つに絞る
- [ ] H2 / H3 の見出しテキストを最終調整する
- [ ] 画像挿入を出発時にどこまで揃えるか（公開前に全てか、最初は2枚かなど）
- [ ] note のタグを3つ程度決める
- [ ] CTA は1〜2個に絞る
- [ ] 7章全文を1度音読する

## Before Posting Checklist

- [ ] 元レコード（`seed/contentIdea-building-hitori-media-os.json`）の主張・反論から逸脱していない
- [ ] 「Hitori Media OS は未完成」のスタンスを保っている
- [ ] coreThesis「発信を頑張るより、発信が回る仕組みを作る」が記事全体で守られている
- [ ] note 特有の検索キーワード（ひとりメディア運営、AI、ContentDB、Substack、Sanity）が自然に含まれている
- [ ] AI礼賛・根拠のない数字・煽り表現がない
- [ ] 有料PDFの文章がコピーされていない
- [ ] note の見出しレベル（H2 / H3）が表示で崩れていない
- [ ] 自動投稿しない（手動公開）

## Published URL

```text
TODO: 公開後に貼り付ける
```

## Published Date / Time

```text
TODO: 公開後に記入
```

## Reaction Notes

```text
TODO: 公開後に記入。スキ数、コメント、引用、検索流入の手応え、Substack への流入有無など。
```

## Production Visual Readiness

公開前に production visual を inbox 経由で揃える必要があります。**テスト画像 / 他キャンペーンの流用画像は使わない**。

### First Visual Action

**`note-hero-v1` を最初に生成する**。実行ガイドは [tasks/visuals/building-hitori-media-os/_first-production-image-run.md](../../../tasks/visuals/building-hitori-media-os/_first-production-image-run.md)。

- candidate inbox path: `assets/inbox/generated/building-hitori-media-os/note-hero-v1/v001.png`
- final path（Visual Register が approve & register で copy 先）: `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png`
- master を Substack header と共有するため、Sanity Studio で `visualAssetPlan.note-hero-v1` と `visualAssetPlan.substack-header-v1` の両方に同じ `localAssetPath` を入力する。

対象 assets:

- `note-hero-v1`（hero、Substack と共有マスター）
- `note-inline-content-os-flow-v1`（第2章付近、ContentIdea ハブ&スポーク）
- `note-inline-human-judgment-v1`（第3〜4章付近、AI→人間判断→公開のflow）

各 brief は [tasks/visuals/building-hitori-media-os/](../../../tasks/visuals/building-hitori-media-os/) を参照。

Required:

- [x] **Production visual generated (hero)**: `assets/inbox/generated/building-hitori-media-os/note-hero-v1/v001.png` 存在（2026-05-14 第3候補を採用、Visual Register `approve & register` 完了、`assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` に copy 済み、patch JSON 生成済み）
- [ ] **Production visual generated (inline content-os-flow)**: `assets/inbox/generated/building-hitori-media-os/note-inline-content-os-flow-v1/v00X.png` 存在
- [ ] **Production visual generated (inline human-judgment)**: `assets/inbox/generated/building-hitori-media-os/note-inline-human-judgment-v1/v00X.png` 存在
- [x] **Visual Register approved (hero only)**: `note-hero-v1` の v001 を `approve & register` 済み。他 inline は未生成。
- [x] **Patch JSON reviewed (hero only)**: `patches/visual-assets/building-hitori-media-os/note-hero-v1.json` 存在。他 inline は未生成。
- [x] **Sanity manually reflected (hero)**: Studio で `visualAssetPlan.note-hero-v1` の `localAssetPath: assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` / `status: saved` / `reviewNotes` を手動更新済み（human-confirmed 2026-05-14）。`note-inline-content-os-flow-v1` / `note-inline-human-judgment-v1` は未生成のためまだ。
- [x] **Final package image present (hero)**: `publish-packages/note/building-hitori-media-os/images/campaign-hero-v1.png` 配布完了（2026-05-14、`npm run publish:package -- building-hitori-media-os` 実行）。inline 3 点は未配布（未生成のため）。

Optional (P3):

- [ ] `note-inline-publish-package-folder-v1` を追加するかは反応を見てから判断

詳細フローは [docs/45-building-hitori-media-os-production-visual-generation.md](../../../docs/45-building-hitori-media-os-production-visual-generation.md) を参照。

## Safety

- No auto-posting
- No platform API call
- Manual publish only
- Production visual は inbox 経由のみ。test images / 他キャンペーンの流用画像は使わない。
