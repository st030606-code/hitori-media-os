# Publication State Sanity Reflection: building-hitori-media-os

日付: 2026-05-19

## 背景

手動公開フェーズ (`docs/devlog/0125-working-pipeline-publication-log.md`) で release-review markdown に Published URL / Date を反映済み。本バッチではそれを Sanity 側の構造化フィールドへ controlled atomic write で同期する。

対象:
- `campaignPlan.building-hitori-media-os.manualPublishingStatus[ x / threads / note / substack ]`
- `contentIdea.building-hitori-media-os.outputChecklist[ x-post / note-article / substack-post ]`
- `substackPostPlan.building-hitori-media-os.publishedUrl`（doc が存在する場合のみ）

非対象（hard rule で除外）:
- `reactionNotes`（反応データが揃ってから次バッチで反映）
- `substackGrowthAction.resultNotes`（同上）
- 他キャンペーン / 他 platform / 他フィールド

## 決定・変更

### 設計: Step E パターンの再利用

`tools/sanity/reflect-publication-state.mjs` を新規作成。`tools/sanity/reflect-working-pipeline-visual-assets.mjs`（Step E）と同じ 4-layer safety を踏襲:

1. `--dry-run` がデフォルト、`--execute` が必要
2. ハードコード allowlist の 3 _id 限定（campaignPlan / contentIdea / substackPostPlan）
3. `SANITY_WRITE_TOKEN` を `--execute` の必須環境変数
4. `client.transaction()` でアトミック書き込み + post-write verification

token をログ出力しない、broad query update なし、dataset import なし、`--replace` フラグなし。

### Dry-run で発覚した課題と対処

`campaignPlan.manualPublishingStatus` の既存 4 entry（x / threads / note / substack）すべてに `_key` が無いことを dry-run で検知。これは初期 seed で `_key` を生成しなかった結果。Sanity の patch-by-key（`set: { 'manualPublishingStatus[_key=="..."]': ... }`）は使えない。

ambiguity gate（hard rule の "Stop if target documents/fields are ambiguous"）で停止し、boss に対処方法を確認:

- ✅ **採用**: replace entire array — 既存 4 entry は `platform`/`state: not-started` のみで他フィールドはすべて空 (`publishedUrl`/`publishedAt`/`reactionNotes` どれも未設定) のため、新 4-item 配列で safe-replace
- ❌ generate _key first → 2-step transaction（複雑、order-dependent）
- ❌ Studio で手動修正

script に `replaceArrayMode` 分岐を追加: `allKeyless && allEmptyBeyondPlatformState && platformsMatchExpected && ambiguityErrors.length === 0` でのみ replace を選択。それ以外は元の patch-by-key/append のままで安全側に倒す。

### 実行結果

Sanity atomic transaction `yXtPUwiZ1lHhdch3ju9FI9`（2026-05-19）で 2 ドキュメント反映:

#### campaignPlan.building-hitori-media-os
新 4-item `manualPublishingStatus`:

| platform | state | publishedUrl | publishedAt | _key |
|---|---|---|---|---|
| x | done | https://x.com/potablenx/status/2056534823737720925 | 2026-05-19T09:38:00+09:00 | e1a54ad8125e |
| note | done | https://note.com/potablen/n/nad186a95af61?sub_rt=share_pb | 2026-05-19T09:57:00+09:00 | 56112221f558 |
| substack | done | https://404runner.substack.com/p/note-substack-x-threads-youtube-podcast1os | 2026-05-19T09:57:00+09:00 | beaeb005ab83 |
| threads | not-started | (unset) | (unset) | c0d08b804e67 |

#### contentIdea.building-hitori-media-os
`outputChecklist` 3 entry に `publishedUrl` 追加:
- `output-x-post` → X URL
- `output-note-article` → note URL
- `output-substack-post` → Substack URL

#### substackPostPlan.building-hitori-media-os
**スキップ**: ドキュメント自体が dataset に存在しない（seed が ingest されていない）。Hard rule「target document does not exist → do not create」に従い、報告のみ。

### Post-write verification

re-read で 7/7 check 全て PASS:
- 4 campaignPlan エントリー: platform / state / publishedUrl / publishedAt 一致
- 3 contentIdea outputChecklist エントリー: publishedUrl 一致
- reactionNotes が変更されていないことを_key 別に追加検証（replace mode では新 _key が前 read に無いため vacuously pass + 新アイテムには reactionNotes フィールド未含有）

## 理由

- **Step E と同じ controlled write パターンを再利用**: 4-layer safety を再発明せず、すでに動いている設計を踏襲することで「Sanity 直書き = 危険」の感覚を維持
- **ambiguity gate を厳格に**: dry-run で `_key` 欠落を発見 → 自動で進めず boss に判断を仰いだ。これがなければ書き間違いやデータ損失が起きていた可能性
- **replace-array モードを限定条件下のみ有効化**: `allKeyless && allEmptyBeyondPlatformState && platformsMatchExpected && ambiguityErrors.length === 0` の 4 条件すべて満たす場合のみ。次回キャンペーンで `_key` が既にある状態で再実行しても、自動で「危険な replace」モードには入らない
- **reactionNotes / resultNotes を意図的に保留**: 反応データが揃ってから次バッチで反映。同じ controlled write tool を再実行する想定で、今は publishedUrl/Date まで
- **substackPostPlan が無い場合は create しない**: 「seed が未 ingest」という事実を残し、boss が判断する。dataset 構造を勝手に増やさない

## 影響

- dashboard `/campaigns/building-hitori-media-os` の Sanity-derived フィールド（manualPublishingStatus 等）から実際の Published URL を読めるようになった
- `/publish-package/building-hitori-media-os` で「公開済み」フラグを Sanity 経由で derive する v0.2 改善が unblocked
- contentIdea.outputChecklist の publishedUrl が正規 source として揃った → 後続の Substack Notes / X retweet 等の文脈追跡に使える
- Working Pipeline 1 周完走 + Sanity 反映まで通った最初のキャンペーンに

## 次の一手

- 24-72 時間後の Reaction Notes 反映: 同 script を再利用するか、新規 `reflect-reaction-notes.mjs` を作るか判断
- substackPostPlan seed の ingest 要否を boss に確認（seed JSON は repo にあるが、Sanity への投入はまだ）
- Threads 公開判断: X / note / Substack の反応が出揃ったら boss が再判断、公開時に同じ script で `threads` entry を `state: done` + URL/Date に再 reflect
- dashboard `/publish-package/[slug]` v0.2: 公開済みバッジを `manualPublishingStatus.state` から derive
- Working Pipeline 1 周完走の振り返り devlog: 「何が手動で残ったか / どこが自動化候補か」
