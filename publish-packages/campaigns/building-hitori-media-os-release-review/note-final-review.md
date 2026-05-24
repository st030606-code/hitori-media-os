# note Final Review: building-hitori-media-os

Status: ready-for-human-final-edit
Not auto-posted.

## Source Files

- [publish-packages/note/building-hitori-media-os/article.md](../../note/building-hitori-media-os/article.md)
- [outputs/note/2026-05-14--building-hitori-media-os--note.md](../../../outputs/note/2026-05-14--building-hitori-media-os--note.md)
- [publish-packages/note/building-hitori-media-os/insert-map.md](../../note/building-hitori-media-os/insert-map.md)

## Working Pipeline Step F Status (3-axis readiness)

Working Pipeline 1 周完走の最終 verification。boss が手動公開する前に各 axis を 1 度通す。

### Visual assets ✅ (3 ready + 2 skipped)

**Ready (3 件、note 記事冒頭〜中盤に貼れる)**:

- [x] `campaign-hero-v1.png` (note hero / Substack header と master 共有、**1,331,047 bytes**、Step D recovery で原本 restored)
- [x] `note-inline-content-os-flow-v1.png` (v004、japanese-editorial-v1、Before/After + Pipeline、**1,234,240 bytes**、self-rubric 35/35)
- [x] `note-inline-human-judgment-v1.png` (v001、japanese-editorial-v1、Human review journey、**1,375,682 bytes**、self-rubric 35/35)

3 件すべて Sanity Step E atomic transaction `spvtGcqRbreWFzrmNCgxGn` で `status: saved` 反映済、Step F で `publish-packages/note/building-hitori-media-os/images/` に配布完了。

**Skipped (2 件、本フェーズで意図的に保留、補助図、本文公開は可能)**:

- [ ] `note-inline-manual-vs-automation-v1` — Chapter 4 末尾の補助図、Sanity `status: skipped`（reviewNotes: 「本フェーズでは保留。Visual Engine Improvement Phaseで再評価。記事は補助図なしで公開可。」）
- [ ] `note-inline-publish-package-folder-v1` — Chapter 5 末尾の補助図、Sanity `status: skipped`（同上）

→ note 記事は **補助図 2 件なしで公開可能**。後の Visual Engine Improvement Phase で補完候補。

### Text draft ✅

- [x] `outputs/note/2026-05-14--building-hitori-media-os--note.md` exists（draftStatus: ready-for-human-edit）
- [x] `publish-packages/note/building-hitori-media-os/article.md` is the canonical article copy
- [x] `publish-packages/note/building-hitori-media-os/insert-map.md` is the image-placement plan
- [x] redact 不要

### Manual publish readiness ⏳ pending-human-fill

- [ ] 採用タイトルを 1 つに絞る（候補 4 件、推奨「AIで『ひとりメディア運営OS』を作っている裏側」）
- [ ] H2 / H3 の見出しテキストを最終調整
- [ ] 画像挿入位置を確定（insert-map.md と整合、3 件の inline + hero の配置決定、保留 2 件は記事内に空欄か注記）
- [ ] note タグを 3 つ決定
- [ ] CTA を 1〜2 個に絞る
- [ ] 7 章全文を 1 度音読
- [ ] [post-publication-log-template.md](post-publication-log-template.md) を `docs/devlog/` に複製して準備
- [ ] note アカウントが open
- [ ] 公開予定日（boss 記入）

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
https://note.com/potablen/n/nad186a95af61?sub_rt=share_pb
```

## Published Date / Time

```text
2026-05-19 09:57 JST
```

## Reaction Notes

```text
初回公開。スキ / コメント / 滞在感は後で追記。
（後日: スキ数、コメント、引用、検索流入の手応え、Substack への流入有無を記入する）
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

Required (all 3 ready as of 2026-05-18 working pipeline complete):

- [x] **Production visual generated (hero)**: `assets/inbox/generated/building-hitori-media-os/note-hero-v1/v001.png` 存在（2026-05-14 第3候補を採用、Visual Register `approve & register` 完了、`assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` に copy 済み、patch JSON 生成済み、Step D recovery 2026-05-18 で master file が原本に restore された）
- [x] **Production visual generated (inline content-os-flow)**: `assets/inbox/generated/building-hitori-media-os/note-inline-content-os-flow-v1/v004.png` 存在（japanese-editorial-v1、Before/After + Pipeline、1,234,240 bytes、self-rubric 35/35）
- [x] **Production visual generated (inline human-judgment)**: `assets/inbox/generated/building-hitori-media-os/note-inline-human-judgment-v1/v001.png` 存在（japanese-editorial-v1、Human review journey、1,375,682 bytes、self-rubric 35/35）
- [x] **Visual Register approved (all 3)**: `note-hero-v1` / `note-inline-content-os-flow-v1` (v004) / `note-inline-human-judgment-v1` (v001) 全件 `approve & register` 完了（hero は 2026-05-14、2 inline は 2026-05-18）
- [x] **Patch JSON reviewed (all 3)**: `patches/visual-assets/building-hitori-media-os/note-hero-v1.json` / `note-inline-content-os-flow-v1.json` / `note-inline-human-judgment-v1.json` 全件存在（各 `meta.directSanityWrite: false`、`set.status: saved`）
- [x] **Sanity manually reflected (all 3)**: Step E atomic transaction `spvtGcqRbreWFzrmNCgxGn`（2026-05-18）で `visualAssetPlan.note-hero-v1` / `note-inline-content-os-flow-v1` / `note-inline-human-judgment-v1` の `localAssetPath` / `status: saved` / `reviewNotes` を反映、post-write 9/9 PASS
- [x] **Final package image present (all 3)**: `publish-packages/note/building-hitori-media-os/images/` に `campaign-hero-v1.png` (1,331,047 bytes、2026-05-14 配布) / `note-inline-content-os-flow-v1.png` (1,234,240 bytes、Step F 新規) / `note-inline-human-judgment-v1.png` (1,375,682 bytes、Step F 新規)

Intentionally skipped (本フェーズで保留、note 記事は補助図なしで公開可):

- [x] `note-inline-manual-vs-automation-v1` → Sanity `status: skipped`、`localAssetPath` unset、補助図、Visual Engine Improvement Phase で再評価
- [x] `note-inline-publish-package-folder-v1` → Sanity `status: skipped`、`localAssetPath` unset、補助図、Visual Engine Improvement Phase で再評価

詳細フローは [docs/45-building-hitori-media-os-production-visual-generation.md](../../../docs/45-building-hitori-media-os-production-visual-generation.md) を参照。

## Safety

- No auto-posting
- No platform API call
- Manual publish only
- Production visual は inbox 経由のみ。test images / 他キャンペーンの流用画像は使わない。
