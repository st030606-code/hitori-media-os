# Handoff: Publication State Sanity Reflection — building-hitori-media-os

Date: 2026-05-19

## 1. Task Goal

手動公開済みの building-hitori-media-os キャンペーン (X / note / Substack published、Threads pending) の publishedUrl / publishedAt / state を Sanity の構造化フィールドへ controlled atomic write で反映する。reactionNotes / resultNotes は意図的に保留。

## 2. Constraints Followed

- ✅ Sanity 書き込みは Step E 同じ 4-layer safety で実施
- ✅ release-review markdown / publish-package output / assets/visuals / patches すべて触らず
- ✅ deploy / auto-post なし、パッケージ追加なし、schema 変更なし
- ✅ reactionNotes / substackGrowthAction.resultNotes は未反映（hard rule で deferred）
- ✅ dry-run 先行、`--execute` は `SANITY_WRITE_TOKEN` 必須
- ✅ 不在ドキュメントを勝手に create しない（substackPostPlan は skip）
- ✅ ambiguity 検知時は停止して boss 判断を仰いだ

## 3. Changed Files

新規:
- `tools/sanity/reflect-publication-state.mjs` — controlled write 用 script（dry-run default、execute モード、ambiguity gate、post-write verification、replaceArrayMode 分岐）
- `docs/devlog/0126-publication-state-sanity-reflect.md`
- `docs/handoff/0137-publication-state-sanity-reflect.md`（本ファイル）
- `docs/handoff/latest.md`（本ファイルをミラー）

Sanity 書き込み（atomic transaction `yXtPUwiZ1lHhdch3ju9FI9`、2 documents）:
- `campaignPlan.building-hitori-media-os.manualPublishingStatus` — 4 entry を新 _key 付きで replace
- `contentIdea.building-hitori-media-os.outputChecklist` — 3 entry に publishedUrl set

リポジトリ内 markdown / image / patches / dashboard は変更なし。

## 4. Summary of Changes

### Sanity 反映後の状態

#### campaignPlan.building-hitori-media-os.manualPublishingStatus
| platform | state | publishedUrl | publishedAt |
|---|---|---|---|
| x | done | `https://x.com/potablenx/status/2056534823737720925` | 2026-05-19T09:38:00+09:00 |
| note | done | `https://note.com/potablen/n/nad186a95af61?sub_rt=share_pb` | 2026-05-19T09:57:00+09:00 |
| substack | done | `https://404runner.substack.com/p/note-substack-x-threads-youtube-podcast1os` | 2026-05-19T09:57:00+09:00 |
| threads | not-started | (unset) | (unset) |

`reactionNotes` は 4/4 すべて未設定（hard rule で deferred）

#### contentIdea.building-hitori-media-os.outputChecklist
`publishedUrl` set:
- `output-x-post` → X URL
- `output-note-article` → note URL
- `output-substack-post` → Substack URL

Threads (`output-threads-thread`) は意図的にスキップ。

#### substackPostPlan.building-hitori-media-os
**Skipped** — ドキュメントが dataset に存在しないため。Hard rule「target が無いものは create しない」。

### Dry-run → Ambiguity → Replace mode

dry-run で `campaignPlan.manualPublishingStatus` の 4 entry すべてに `_key` 欠落を検知。安全のため停止して boss に確認。boss-confirmed の上で `replaceArrayMode` を追加実装:

- 既存 4 entry がすべて `platform`/`state: not-started` のみで `publishedUrl`/`publishedAt`/`reactionNotes` どれも空であることを 4 条件すべて満たすときのみ array-replace を許可
- 新 4-item 配列に `_key` を生成して set
- 次回キャンペーン以降は通常の patch-by-key パスに戻る（条件不一致のため）

### Post-write verification

- 4 campaignPlan エントリー: platform / state / publishedUrl / publishedAt 一致 ✓
- 3 contentIdea outputChecklist エントリー: publishedUrl 一致 ✓
- reactionNotes が変更されていないことを_key 別に検証 ✓ (replace mode: vacuously pass + 新アイテムには reactionNotes フィールド未含有)
- 7/7 check 全 PASS

## 5. Key Decisions

- **Step E パターンを忠実に再利用**: 4-layer safety / dry-run default / token gate / atomic transaction を再発明せず、reflect-working-pipeline-visual-assets.mjs と同じ構造を踏襲
- **Ambiguity を automation で進めず boss に確認**: 「_key 欠落」を script が自動で扱わず、boss が方針を選んでから replaceArrayMode を追加。これにより「危険な replace」が初期実装で混入するのを回避
- **replaceArrayMode を 4 条件で制限**: `allKeyless` + `allEmptyBeyondPlatformState` + `platformsMatchExpected` + `no ambiguity` の AND。これにより、次キャンペーンで `_key` 付きデータが既にある状態で再実行しても自動 replace モードに入らない
- **`reactionNotes` を保留**: 反応データが揃うのは公開後 24-72 時間後。今 batch では state/url/at まで反映、reactionNotes は次バッチ
- **substackPostPlan を create しない**: Doc 不在を「seed 未 ingest 状態」として明示記録、boss が判断

## 6. Human Review Questions

- `substackPostPlan.building-hitori-media-os` の seed JSON は repo にあるが dataset 未 ingest。次キャンペーン前に ingest するか、本構造をやめるか判断必要か？
- `manualPublishingStatus` の 4 entry が初期 seed で `_key` なしだった件、他キャンペーンの seed JSON も同様の状態か確認したほうが良いか？
- Threads 公開判断のタイミング（24-72 時間後のどこか）と、その際の controlled write 再実行手順を整理しておくか？
- reactionNotes の反映タイミング・フォーマット（自由テキスト / 指標テンプレ）をどう決めるか？

## 7. Risks or Uncertainties

- **`_key` 欠落の他キャンペーンへの波及**: 本件は seed JSON が `_key` を生成していなかった結果。他の campaignPlan seed も同様なら、次キャンペーンで再発する。seed フォーマット側で `_key` 自動付与（`autoGenerateArrayKeys: true` を Studio で常時 ON にする等）が必要かも
- **`replaceArrayMode` の誤発動リスク**: 4 条件 AND で守っているが、もし「すべて keyless で reactionNotes も空」状態を boss が意図的に作っていた場合に上書きされる。本件は dry-run output を読めば気づくので致命的ではないが、ドキュメントで強調しておく
- **substackPostPlan の seed 不在**: dataset 上は missing のため publishedUrl が Studio 経由でない限り反映されない。dashboard などが substackPostPlan を直接読むコードを書くと NotFound エラーになる可能性
- **datetime のタイムゾーン**: `+09:00` 形式で書き込んだが、Sanity Studio の表示はブラウザのロケールに依存。Studio で見ると `2026-05-19 00:38 UTC` 等の表示になる可能性あり

## 8. Recommended Next Step

1. **24-72 時間後の reactionNotes 反映** — 反応データが揃ったタイミングで `tools/sanity/reflect-reaction-notes.mjs` を新規作成 or 本 script を拡張して reactionNotes set。`substackGrowthAction.resultNotes` も同タイミング
2. **dashboard `/publish-package/[slug]` v0.2** — `manualPublishingStatus.state` から ✓公開済み / ⏳未公開 バッジを表示、`publishedUrl` をクリック可能リンクとして出す（次キャンペーンの加速）
3. **Threads 公開判断** — X / note / Substack の反応を見て公開すると判断したら、本 script を `threads` entry のみ patch する mode で再実行。replaceArrayMode は通らず（既に _key 付きなので）通常の patch-by-key になる
4. **seed `_key` 監査** — 他キャンペーンの seed JSON / dataset 上 array にも `_key` 欠落が無いか確認、必要なら同じ controlled tool で `_key` 補正バッチを別途作る
5. **Working Pipeline 1 周完走の振り返り devlog** — 「何が手動で残ったか / どこが自動化候補か」を別エントリー

## 9. Exact Prompt to Give Codex Next

```text
Implement dashboard /publish-package/[slug] v0.2:
Surface published state derived from Sanity manualPublishingStatus.

Hard Rules:
- Do NOT write to Sanity (still read-only UI).
- Do NOT modify publish-package output files.
- Do NOT modify assets/visuals or patches.
- Do NOT deploy.
- Do NOT auto-post.
- Do NOT add packages.
- Keep all existing routes working.

Tasks:
1. Extend dashboard/src/lib/groq/campaign.ts (or create a small
   GROQ helper) so /publish-package/[slug] can fetch the matching
   campaignPlan's manualPublishingStatus array (platform, state,
   publishedUrl, publishedAt).
2. In dashboard/src/app/publish-package/[slug]/page.tsx PlatformOverviewCards:
   - Show ✓ 公開済み / ⏳ 未公開 badge per platform card based on
     manualPublishingStatus[platform].state === 'done'.
   - Show publishedAt date (short JST format) when published.
3. In each platform section (X / Threads / note / Substack):
   - Add a "公開済みURL" line linking to publishedUrl (target=_blank,
     rel=noopener noreferrer) when state === 'done'.
   - Show "公開予定: pending" when state !== 'done'.
4. Keep all existing copy-friendly UI as-is.
5. publishedAt rendering: `2026-05-19 09:38 JST` style (locale-aware
   formatter, with explicit JST suffix to avoid Sanity Studio TZ confusion).

Validation:
- cd dashboard && npm run build
- npm run build (Sanity Studio)
- Open /publish-package/building-hitori-media-os, confirm:
  - X / note / Substack cards show ✓ 公開済み
  - Threads card shows ⏳ 未公開
  - publishedUrl links open in new tab

Docs:
- docs/devlog/<番号>-dashboard-publish-package-v0-2-published-badges.md
- docs/handoff/<番号>-dashboard-publish-package-v0-2-published-badges.md
- docs/handoff/latest.md (mirror)
```
