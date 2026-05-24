# Substack Final Review: building-hitori-media-os

Status: ready-for-human-final-edit
Not auto-posted.

## Source Files

### Publish package

- [publish-packages/substack/building-hitori-media-os/post.md](../../substack/building-hitori-media-os/post.md)
- [publish-packages/substack/building-hitori-media-os/notes.md](../../substack/building-hitori-media-os/notes.md)
- [publish-packages/substack/building-hitori-media-os/about-page.md](../../substack/building-hitori-media-os/about-page.md)
- [publish-packages/substack/building-hitori-media-os/welcome-email.md](../../substack/building-hitori-media-os/welcome-email.md)
- [publish-packages/substack/building-hitori-media-os/title-options.md](../../substack/building-hitori-media-os/title-options.md)
- [publish-packages/substack/building-hitori-media-os/social-preview-image.md](../../substack/building-hitori-media-os/social-preview-image.md)
- [publish-packages/substack/building-hitori-media-os/subscribe-cta.md](../../substack/building-hitori-media-os/subscribe-cta.md)
- [publish-packages/substack/building-hitori-media-os/repurpose-map.md](../../substack/building-hitori-media-os/repurpose-map.md)

### Sanity strategy seeds (local-only, not yet ingested)

- `seed/substack-publication-strategy-building-hitori-media-os.json`
- `seed/substack-post-plan-building-hitori-media-os.json`
- `seed/substack-notes-plan-building-hitori-media-os.json`
- `seed/substack-growth-action-building-hitori-media-os.json`

### Source draft

- [outputs/substack/2026-05-14--building-hitori-media-os--substack.md](../../../outputs/substack/2026-05-14--building-hitori-media-os--substack.md)

## Working Pipeline Step F Status (3-axis readiness)

Working Pipeline 1 周完走の最終 verification。boss が手動公開する前に各 axis を 1 度通す。

### Visual assets ✅

- [x] `campaign-hero-v1.png` (Substack header、**note-hero-v1 と master file を共有**、**1,331,047 bytes**、Step D recovery で原本 restored)
- [x] `substack-inline-reader-system-v1.png` (v001、japanese-editorial-v1、Reader-list funnel、**1,297,423 bytes**、self-rubric 35/35)
- [x] Sanity `visualAssetPlan.building-hitori-media-os.substack-header-v1` / `substack-inline-reader-system-v1` の `localAssetPath` / `status: saved` / `reviewNotes` は Step E atomic transaction `spvtGcqRbreWFzrmNCgxGn`（2026-05-18）で反映、post-write 9/9 PASS
- [x] `publish-packages/substack/building-hitori-media-os/images/campaign-hero-v1.png` distributed（1,331,047 bytes、Step D recovery で master restored 後 Step F で再配布）
- [x] `publish-packages/substack/building-hitori-media-os/images/substack-inline-reader-system-v1.png` distributed（1,297,423 bytes、Step F 新規）

### Text draft ✅

- [x] `outputs/substack/2026-05-14--building-hitori-media-os--substack.md` exists（draftStatus: ready-for-human-edit）
- [x] `publish-packages/substack/building-hitori-media-os/post.md` / `notes.md` / `about-page.md` / `welcome-email.md` / `title-options.md` / `social-preview-image.md` / `subscribe-cta.md` / `repurpose-map.md` is the canonical Substack-side copy set
- [x] redact 不要

### Manual publish readiness ⏳ pending-human-fill

- [ ] Post タイトル / Email subject / Preview text を 1 つずつ確定
- [ ] About Page と Welcome Email を手書きで埋める
- [ ] Subscribe CTA を 1 つに決める
- [ ] Notes 計画から「公開と同時に出すNote」を 1 本選ぶ
- [ ] Reader Question を Post に残すか Notes だけにするか決める
- [ ] paid offer を含めていないことを再確認
- [ ] Social Preview image の有無 / 採用画像を決める
- [ ] [post-publication-log-template.md](post-publication-log-template.md) を `docs/devlog/` に複製して準備
- [ ] Substack アカウントが open
- [ ] 公開予定日（boss 記入）

## Post Title Options

採用は1つ。

- AIで「ひとりメディア運営OS」を作っている裏側
- 発信を頑張るより、発信が回る仕組みを作る
- ひとり運営は「量」より「制作の型」で詰む話
- AIで記事を書く前に、AIが読めるDBを作っている

## Email Subject Options

採用は1つ。

- 発信を頑張るのをやめて、仕組みを作っている話
- AIで記事を書く前に、AIが読めるDBを作っている
- ひとり運営は「制作の型」で詰む

## Preview Text

> note / Substack / X / Threads / YouTube / Podcast。全部頑張ると、ひとり運営はだいたい消耗する。だから今、1つのアイデアから複数媒体へ展開するOSをローカル中心で組み立て直している。

## Subscriber CTA

> Hitori Media OSの開発過程は、これからもこのSubstackで書いていきます。派手な完成発表ではなく、迷っているところや、まだ手動で残している作業をそのまま共有していく予定です。
>
> （過度な購読煽りはしません。気が向いたタイミングで購読してください。）

soft CTA。煽らない。

## Reader Question

> もしあなたが、自分の発信を1つ仕組み化するとしたら、最初に手を入れたいのは「下書き作成」「公開判断」「素材保存」のどれですか？
>
> 返信欄でも、コメント欄でもよいです。

## Notes Follow-Up Plan

source の "Substack Notes Plan" 節を参照。最終的に投稿する Notes は2〜3本に絞る。

- Pre-Post Notes 3案（question / build-log / lesson-learned）から1〜2本
- Post Launch Notes 2案（build-log / soft CTA）から1本
- 1週間に4本以上同じ Notes を出さない

## About Page Alignment Checklist

- [ ] 誰のための publication か3秒で分かる
- [ ] 何が届くか（開発ログ / 制作判断 / 迷い）が分かる
- [ ] X / note / Substack の役割が混ざっていない
- [ ] paid への誘導を急いでいない
- [ ] coreTopics（Hitori Media OS / AI-assisted media workflow / Substack reader-list growth）が反映されている
- [ ] 完成版ツールの宣伝にも、誇張にもなっていない

source: `publish-packages/substack/building-hitori-media-os/about-page.md` を埋める前提。

## Welcome Email Alignment Checklist

- [ ] 登録へのお礼がある
- [ ] 今後届く内容が分かる
- [ ] 返信したくなる問いがある
- [ ] 過度な販売感がない
- [ ] 完成版を期待させる表現になっていない

source: `publish-packages/substack/building-hitori-media-os/welcome-email.md` を埋める前提。

## GrowthAction Checklist

`substackGrowthAction.building-hitori-media-os.about-page-update`（Sanity seed）を、Substack Post 公開と同時に実施候補にする。

- [ ] About Page を「ひとりメディア運営OSの開発ログ」として整理する
- [ ] subscriberCTA を About Page にも反映する
- [ ] expectedOutcome（初回訪問者の理解と期待値合わせ）が満たされる構成になっている
- [ ] safetyNotes（自動投稿しない / API 不使用 / 個人情報を扱わない）を守る
- [ ] 実施後に `resultNotes` を Sanity Studio で手動更新する

## Final Human Decision Points

- [ ] Post タイトル、Email subject、Preview text を1つずつ確定
- [ ] About Page と Welcome Email の本文を手書きで埋める
- [ ] Subscribe CTA の文言を1つに決める
- [ ] Notes 計画から「公開と同時に出すNote」を1本選ぶ
- [ ] Reader Question を Post に最終的に残すか、Notes だけにするか決める
- [ ] paid offer を含めていないことを再確認
- [ ] Social Preview image の有無 / 採用画像を決める

## Before Posting Checklist

- [ ] 元レコードにない断言・数字を足していない
- [ ] 完成済みツールの宣伝になっていない
- [ ] coreThesis「発信を頑張るより、発信が回る仕組みを作る」が守られている
- [ ] subscribe CTA が煽っていない
- [ ] paid offer を含めていない
- [ ] 教材本文の引用が混ざっていない
- [ ] Substack Strategy Module（信頼形成・email・archive・subscriber asset）の役割を踏襲している
- [ ] Reader Question が返信したくなる形になっている
- [ ] 公開前に1度音読する
- [ ] Substack の comment / reply 設定を確認

## Published URL

```text
https://404runner.substack.com/p/note-substack-x-threads-youtube-podcast1os
```

公開後の Sanity 反映（pending、本バッチでは Sanity 書き込みなし）:
- `substackPostPlan.publishedUrl` を Studio で手動更新する

## Published Date / Time

```text
2026-05-19 09:57 JST
```

## Subscriber / Reply Notes

```text
初回公開。購読 / クリック / 返信は後で追記。
（後日: subscriber 流入数、返信数、引用、Notes での会話、X / note からの流入の有無を記入する）
（後日: substackGrowthAction.resultNotes にも Sanity Studio から手動反映する）
```

## Production Visual Readiness

公開前に production visual を inbox 経由で揃える必要があります。**テスト画像 / 他キャンペーンの流用画像は使わない**。

### First Visual Action (shared master with note hero)

Substack header は **`note-hero-v1` と master file を共有**。Substack 側で別 candidate を生成しない。

実行ガイドは [tasks/visuals/building-hitori-media-os/_first-production-image-run.md](../../../tasks/visuals/building-hitori-media-os/_first-production-image-run.md)。手順:

- まず note 側で `note-hero-v1` を生成し、Visual Register Inbox Review で `approve & register`。
- master file は `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` に保存される。
- Sanity Studio で `visualAssetPlan.substack-header-v1.localAssetPath` に **同じパス** を手動入力（再生成・再登録しない）。
- Publish Package Builder が両方の publish-package にコピーする。


対象 assets:

- `substack-header-v1`（note hero とマスターを共有。inbox は note 側 `note-hero-v1/v00X.png` を使用）
- `substack-inline-reader-system-v1`（任意 P3、Reader-List Connection 節）

各 brief は [tasks/visuals/building-hitori-media-os/](../../../tasks/visuals/building-hitori-media-os/) を参照。

Required:

- [x] **Production visual generated (header)**: `note-hero-v1` の master が `assets/inbox/generated/building-hitori-media-os/note-hero-v1/v001.png` に存在、Visual Register `approve & register` 完了（2026-05-14、第3候補を採用）。master file は `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png`、Step D recovery 2026-05-18 で原本に restore 済み（1,331,047 bytes）。
- [x] **Substack header reuses note master**: Sanity の `visualAssetPlan.substack-header-v1.localAssetPath` に `assets/visuals/building-hitori-media-os/shared/campaign-hero-v1.png` を入力済（note hero と同一パス）。`status: saved` / `reviewNotes` は Step E atomic transaction `spvtGcqRbreWFzrmNCgxGn`（2026-05-18）で反映、post-write 9/9 PASS。
- [x] **Patch JSON reviewed**: `patches/visual-assets/building-hitori-media-os/note-hero-v1.json` を確認可能（Visual Register の Patch Review カードに表示される）。Substack 専用 patch は不要（master 共有）。
- [x] **Final package image present (header)**: `publish-packages/substack/building-hitori-media-os/images/campaign-hero-v1.png` 配布完了（1,331,047 bytes、Step D recovery で master restored 後 Step F で再配布）。

Optional (P3) → 完了:

- [x] **Production visual generated (inline reader-system)**: `assets/inbox/generated/building-hitori-media-os/substack-inline-reader-system-v1/v001.png` 存在（japanese-editorial-v1、Reader-list funnel、1,297,423 bytes、self-rubric 35/35、2026-05-18 生成）
- [x] **Visual Register approved (inline reader-system)**: scripted recovery (`tools/visual-register/recover-working-pipeline-step-d.mjs`) で `approve & register` 完了（2026-05-18、reviewStatus: registered、manifestStrategy: replace-by-relative-path）
- [x] **Patch JSON reviewed (inline reader-system)**: `patches/visual-assets/building-hitori-media-os/substack-inline-reader-system-v1.json` 生成済（`set.status: saved`、`meta.directSanityWrite: false`、`meta.inboxSource: substack-inline-reader-system-v1/v001.png`）
- [x] **Sanity manually reflected (inline reader-system)**: Step E atomic transaction `spvtGcqRbreWFzrmNCgxGn`（2026-05-18）で `visualAssetPlan.substack-inline-reader-system-v1.localAssetPath` / `status: saved` / `reviewNotes` を反映、post-write 9/9 PASS
- [x] **Final package image present (inline reader-system)**: `publish-packages/substack/building-hitori-media-os/images/substack-inline-reader-system-v1.png` 配布完了（1,297,423 bytes、Step F 新規）

詳細フローは [docs/45-building-hitori-media-os-production-visual-generation.md](../../../docs/45-building-hitori-media-os-production-visual-generation.md) を参照。

## Safety

- No auto-posting
- No email send automation
- No Substack API call
- No paid PDF content copied
- Manual publish only
- Production visual は inbox 経由のみ。test images / 他キャンペーンの流用画像は使わない。
