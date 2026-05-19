# Working Pipeline Step G: Release-Review Markdown 更新

日付: 2026-05-18

## 背景

Working Pipeline 1 周完走の最終ステップ (Step G)。Step A–F で 7 件の visual asset を生成・approve・Sanity 反映・publish-package 実配布まで完了したため、boss が手動公開する前に release-review markdown を「技術的に ready、boss 判断のみ pending」状態へ整理する必要があった。

Step F までの状態:

- 9 visualAssetPlan: 7 件 `status: saved` / 2 件 `status: skipped`（Step E atomic transaction `spvtGcqRbreWFzrmNCgxGn`、post-write 9/9 PASS）
- publish-packages 実配布: x 1 / threads 1 / note 3 / substack 2 = 計 7 ファイル

しかし release-review markdown は Step A 時点（2026-05-14）の hero-only 状態のままで、追加 6 件の visual が反映されていなかった。boss が公開判断に進めない。

## 決定・変更

`publish-packages/campaigns/building-hitori-media-os-release-review/` 配下の 5 ファイルを更新。**それ以外の release-review 関連ファイルは触らない**スコープを死守。

更新したファイル:

- `x-final-review.md` — 3-axis section 追加（Visual / Text / Manual publish readiness）、Step F bytes 反映
- `threads-final-review.md` — 3-axis section 追加 + 既存 Production Visual Readiness を all-checked に更新（threads-support-diagram-v1 v004、1,224,241 bytes、self-rubric 35/35）
- `note-final-review.md` — 3-axis section 追加（3 ready + 2 skipped を明示）+ 既存 Required を all-checked に更新、skipped 2 件を `Intentionally skipped` サブセクションで明示
- `substack-final-review.md` — 3-axis section 追加（hero master shared + substack-inline-reader-system-v1 distributed）+ Optional (P3) → 完了に格上げ
- `final-human-checklist.md` — `Technical Readiness Snapshot` 節を追加、text-first 4 platforms の asset 行 4 件を `[ ]` → `[x]` に更新、skipped 2 件を別ブロックで明示、Sanity transaction ID `spvtGcqRbreWFzrmNCgxGn` を全所に記録

すべての 3-axis section に共通の構造:

```
### Visual assets ✅
- [x] ...（filename、bytes、self-rubric）
### Text draft ✅
- [x] outputs / publish-package / redact 状態
### Manual publish readiness ⏳ pending-human-fill
- [ ] boss 判断項目
```

`final-human-checklist.md` で boss-only 領域（Per-Platform Review / Safety Reaffirmation / Final Sign-off / Published URL / Published Date / Reaction Notes）は **意図的に unchecked のまま** 残した。boss が自分で読んで自分でチェックする領域として扱う。

## 理由

- 「3-axis readiness」を統一フォーマットにしたのは、boss が公開前に「何が ready で何が pending か」を 3 秒で読めるようにするため。媒体ごとに章構成が違うと、毎回読み直しが必要になる。
- `Intentionally skipped` を別ブロックで明示したのは、note 記事を「補助図なしでも公開可」と確証する必要があったため。skipped を `[ ]` のままにすると「未完成」に見える、`[x]` で「処理済（skip 判断）」と明示することで状態を曖昧にしない。
- `final-human-checklist.md` で boss-only 項目を絶対に auto-check しなかったのは、技術的 ready と「boss が読んで納得した」を区別するため。signature を agent が代行すると、checklist が儀礼化して意味を失う。
- Sanity transaction ID を全ファイルに明記したのは、後日「どの atomic write でこの reviewNotes が入ったか」を 1 検索で追跡できるようにするため。

## 影響

- **Working Pipeline 1 周完走**: Step A (generate) → B (approve) → C (skip judgment) → D (recover) → E (Sanity reflect) → F (publish-package) → G (release-review) の 7 段すべてに実例ができた。
- **release-review template の事実上の確立**: 3-axis section のフォーマットは次キャンペーンでも再利用可能。今後 release-review を新規作成する際の参考になる。
- **boss handoff の責任境界が明確化**: 技術完了は agent / signature と公開判断は boss、というラインが checklist 構造に埋め込まれた。
- **発信ネタ**: 「Working Pipeline を 1 周回した」という building-in-public ログとして、note / Substack の本キャンペーンそのもののメタ素材になる。

## 次の一手

- boss が `final-human-checklist.md` の Per-Platform Review / Safety Reaffirmation / 各 final-review 内 publish 判断を読み終える
- boss が公開予定日を記入し、媒体ごとに手動公開
- 公開後、各 final-review の `Published URL` / `Published Date` / `Reaction Notes` 欄を手動更新、`post-publication-log-template.md` を `docs/devlog/` にコピーして post-publication log を書く
- Working Pipeline 完走の振り返り devlog（「1 周回して見えた手動工程・自動候補・改善点」）を別エントリーで起こす — これは note 第 6・7 章の更新材料になる
