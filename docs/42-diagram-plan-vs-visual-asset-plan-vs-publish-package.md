# diagramPlan vs visualAssetPlan vs publish-package

Date: 2026-05-14

Hitori Media OS の visual 周りは、3つの異なるレイヤーで管理されています。混同しないこと。

## 3 Layers

### 1. `diagramPlan`（Sanity schema）= Concept

**「この図解は何を伝えるか」** を扱う概念レベルのレコード。

- どの contentIdea を元にしているか
- 何を視覚化したいか（before/after、pipeline、ハブ&スポーク、etc.）
- 一般的なレイアウトアイデア、入れたい labels、避ける表現
- まだ「どの platform で / どの解像度で / どのファイル名で」は決めない

例:

- `diagramPlan.ai-blog-db.before-after` =「記事の山 → AIが使えるDB」というbefore/after の概念

1つの diagramPlan から、複数の visualAssetPlan が派生する。

### 2. `visualAssetPlan`（Sanity schema）= Production Unit

**「実際に生成・保存・使用する1つのアセット」** を扱う制作レコード。

- どの diagramPlan が元か（任意）
- target platform / asset type / aspect ratio
- expectedLocalAssetPath（保存予定パス）
- localAssetPath（実保存後の実パス）
- imagePrompt / textToInclude / textToAvoid / visualDirection
- status: planned / brief-ready / prompt-ready / generated-needs-save / saved / reviewed / approved / packaged / published / archived
- taskFilePath（人間レビュー用ブリーフへのリンク）
- publishPackagePath（公開準備フォルダへのリンク）

例:

- `visualAssetPlan.ai-blog-db.note-hero-v1` = ai-blog-db note hero、16:9、ChatGPT手動生成、保存予定パスあり
- `visualAssetPlan.building-hitori-media-os.note-hero-v1` = building-hitori-media-os note hero、別ファイル

1つの visualAssetPlan = 1つのファイル管理単位。

### 3. `publish-packages/<platform>/<slug>/images/`（local folder）= Distribution

**「人間レビュー直前の公開準備フォルダ」** にある実画像ファイル。

- Publish Package Builder が、`localAssetPath` が埋まっている `visualAssetPlan` から自動でここへコピーする
- `publish-packages/note/building-hitori-media-os/images/campaign-hero-v1.png` のような形
- ここのファイルはあくまで「公開ワークフローへの持ち出し用」。元ファイルは `assets/visuals/...` に1つだけ存在し、publish-packages はそのコピー

## Lifecycle

```text
1. diagramPlan を作る（概念）
   ↓
2. visualAssetPlan を作る（制作1単位、status=planned）
   ↓
3. Brief を書く（tasks/visuals/<slug>/<asset-id>.md）→ status=brief-ready
   ↓
4. 画像を手動生成（ChatGPT等）→ status=generated-needs-save
   ↓
5. Visual Register でローカル保存＋patch JSON 生成 → status=saved
   ↓
6. Patch Review で確認 → 人間が Sanity Studio で手動反映 → status=reviewed
   ↓
7. Publish Package Builder が publish-packages/<platform>/<slug>/images/ へコピー → status=packaged
   ↓
8. 人間が手動公開 → status=published
```

各段階で **副作用は限定的**:

- diagramPlan / visualAssetPlan は Sanity の document、書き込みは Studio 経由
- Visual Register は patches/ JSON を出すだけで Sanity に直接書かない
- Publish Package Builder は publish-packages/ にコピーするだけ、上書きは原則しない（オプトインの `--replace-placeholder-package` を除く）

## Why The 3-Layer Split

- **diagramPlan は「概念の再利用」**。同じ before/after 構造を複数キャンペーンで使い回せる。
- **visualAssetPlan は「単位の管理」**。1枚 = 1レコードで、生成状況・保存場所・公開準備状況を追える。
- **publish-package images/ は「公開作業の単位」**。媒体ごとに必要なファイルだけ揃える。

これらを混ぜると次の問題が起きる:

- diagramPlan に保存パスを書く → 媒体ごとに違う解像度を扱えない
- visualAssetPlan に concept-level を入れる → 同じ概念を別 platform で使うとき重複する
- publish-package を source of truth にする → 元ファイルがどこか分からなくなる

## How They Relate For building-hitori-media-os

- `diagramPlan` 側にこのキャンペーン専用レコードは **まだ作っていない**。各 visualAssetPlan が概念を直接記述する形で進めている（builder で困らない範囲で簡略化）。
- `visualAssetPlan` 側に8レコードを追加（`seed/visual-asset-plan-records-building-hitori-media-os.json`）。
- `publish-packages/{note,x,substack,threads}/building-hitori-media-os/images/` には、画像が実保存されてから順次コピーされる。

将来、ai-blog-db の `diagramPlan.before-after` のような共通概念を使いたいときは、`sourceDiagramPlan` 参照を visualAssetPlan に追加する。

## Where To Look For Each

| 知りたいこと | 見る場所 |
| --- | --- |
| 何を視覚化するか（概念） | `seed/diagram-plan-records.json` の diagramPlan |
| どの asset を作る予定か | `seed/visual-asset-plan-records.json` / `seed/visual-asset-plan-records-<slug>.json` |
| 1 asset の brief（生成プロンプト含む） | `tasks/visuals/<slug>/<asset-id>.md` |
| 全体の inventory | `tasks/visuals/<slug>/_inventory.md` |
| 生成・登録・反映ワークフロー | `tasks/visuals/<slug>/_workflow.md` |
| 公開直前にどの画像をどこに使うか | `publish-packages/<platform>/<slug>/images/` + `publish-packages/<platform>/<slug>/insert-map.md`（note） |
| 公開準備全体のレビュー | `publish-packages/campaigns/<slug>-release-review/` |

## What This Document Is Not

- 既存スキーマの変更指針ではない。
- diagramPlan / visualAssetPlan の細かいフィールド定義は `schemas/diagramPlan.ts` / `schemas/visualAssetPlan.ts` を見る。
- このドキュメント自体が source of truth ではなく、混乱したときの参照地図として使う。
