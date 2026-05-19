# Threads Final Review: building-hitori-media-os

Status: ready-for-human-final-edit
Not auto-posted.

## Source Files

- [publish-packages/threads/building-hitori-media-os/posts.md](../../threads/building-hitori-media-os/posts.md)
- [outputs/threads/2026-05-14--building-hitori-media-os--threads.md](../../../outputs/threads/2026-05-14--building-hitori-media-os--threads.md)

## Working Pipeline Step F Status (3-axis readiness)

Working Pipeline 1 周完走の最終 verification。boss が手動公開する前に各 axis を 1 度通す。

### Visual assets ✅

- [x] `threads-support-diagram-v1.png` registered in Visual Register（v004 採用、variant: japanese-editorial-v1、Problem-to-system 3-band portrait、self-rubric 35/35）
- [x] Sanity `visualAssetPlan.building-hitori-media-os.threads-support-diagram-v1` is `status: saved`（Step E atomic transaction `spvtGcqRbreWFzrmNCgxGn`、2026-05-18）
- [x] `publish-packages/threads/building-hitori-media-os/images/threads-support-diagram-v1.png` distributed（**1,224,241 bytes**、Step F で新規 copy、`publish-packages/threads/building-hitori-media-os/images/` ディレクトリ新規作成）

### Text draft ✅

- [x] `outputs/threads/2026-05-14--building-hitori-media-os--threads.md` exists（draftStatus: ready-for-human-edit）
- [x] `publish-packages/threads/building-hitori-media-os/posts.md` is the canonical post + replies copy
- [x] redact 不要

### Manual publish readiness ⏳ pending-human-fill

- [ ] 採用 main post を 1 案に確定
- [ ] reply chain 4 / 5 / 7本のどれかを選ぶ
- [ ] discussion question を Threads 版で微調整
- [ ] X 版との差分を確認（媒体役割の差を保つ）
- [ ] 各投稿が Threads 文字数制限（500字目安）に収まっているか確認
- [ ] [post-publication-log-template.md](post-publication-log-template.md) を `docs/devlog/` に複製して準備
- [ ] Threads アカウントが open
- [ ] 公開予定日（boss 記入）

## Recommended Main Post

> 最近、発信そのものを増やすのを一度やめて、「発信が回る仕組み」を作る方向に時間を回しています。
>
> note も Substack も YouTube も Podcast も、全部を毎週走らせると、ひとりではかなり消耗する。
>
> なので、1つのテーマから複数媒体へ展開できる「制作の型」のほうを先に整え直しています。
>
> 完成版じゃなくて、まだ手動運用の途中。でも、ようやく「これなら続けられるかも」と思えるところまで形になってきました。
>
> 同じところで止まっている人がいたら、軽く話せたら嬉しいです。

採用は1つ。alternate hooks（source ファイル参照）と比較してから決定する。

## Optional Reply Chain

7 reply（source の "Optional Reply Chain" 節）。最終的に 4〜5本へ削るのが推奨。

## Discussion Question

> いま自分の発信のうち、1つだけ仕組み化するとしたら、最初に手を入れたいのはどこですか？
>
> 候補:
> - 下書き作成
> - 公開判断 / 最終チェック
> - 素材保存（主張・根拠・反論の整理）
> - 媒体ごとの切り口の使い分け
> - 公開後の反応の記録

X 版より、答えを誘導しすぎない。

## Final Human Decision Points

- [ ] 採用する main post を1案に決める
- [ ] reply chain は 4 / 5 / 7本のどれにするか
- [ ] discussion question を Threads 版で微調整するか
- [ ] X 版とほぼ同じ本文になっていないか（媒体役割の差を確認）
- [ ] CTA は「返信ください」を主軸、購読誘導は控えめにする

## Before Posting Checklist

- [ ] X 版と本文がほぼ同じになっていない
- [ ] 完成済みツールの宣伝になっていない
- [ ] coreThesis「発信を頑張るより、発信が回る仕組みを作る」が中心にある
- [ ] reply chain が冗長になっていない
- [ ] discussion question が押し付けがましくない
- [ ] AI礼賛 / 根拠のない数字 / 抽象語が混ざっていない
- [ ] 有料PDFの引用がない
- [ ] 各投稿が Threads の文字数制限（500字目安）に収まっている

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
TODO: 公開後に記入する。返信数、対話の質、X からの流入の有無、subscriber への波及など。
```

## Production Visual Readiness

公開前に production visual を inbox 経由で揃える必要があります。テスト画像 / 他キャンペーンの流用画像は使わない。

対象 asset: `threads-support-diagram-v1`（brief: [tasks/visuals/building-hitori-media-os/threads-support-diagram-v1.md](../../../tasks/visuals/building-hitori-media-os/threads-support-diagram-v1.md)）

- [x] **Production visual generated**: `assets/inbox/generated/building-hitori-media-os/threads-support-diagram-v1/v004.png` に candidate が存在（japanese-editorial-v1、1080×1350、1,224,241 bytes、Codex exec + image_gen で 2026-05-18 生成、self-rubric 35/35）。historical v001-v003 も保存。
- [x] **Visual Register approved**: Inbox Review で v004 を `approve & register` 完了（2026-05-18T11:35:32.973Z、reviewStatus: registered）
- [x] **Patch JSON reviewed**: `patches/visual-assets/building-hitori-media-os/threads-support-diagram-v1.json` 生成済（`set.status: saved`、`meta.directSanityWrite: false`、`meta.inboxSource: threads-support-diagram-v1/v004.png`）
- [x] **Sanity manually reflected**: `visualAssetPlan.building-hitori-media-os.threads-support-diagram-v1.localAssetPath` / `status: saved` / `reviewNotes` を Step E atomic transaction `spvtGcqRbreWFzrmNCgxGn` で反映完了（2026-05-18、post-write verification 9/9 PASS）
- [x] **Final package image present**: `publish-packages/threads/building-hitori-media-os/images/threads-support-diagram-v1.png` 配布完了（Step F、2026-05-18、1,224,241 bytes、`publish-packages/threads/building-hitori-media-os/images/` ディレクトリ新規作成）

詳細フローは [docs/45-building-hitori-media-os-production-visual-generation.md](../../../docs/45-building-hitori-media-os-production-visual-generation.md) を参照。

## Safety

- No auto-posting
- No platform API call
- Manual publish only
- Production visual は inbox 経由のみ。test images / 他キャンペーンの流用画像は使わない。
