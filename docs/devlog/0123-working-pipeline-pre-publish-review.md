# Working Pipeline Pre-Publish Review 完了

日付: 2026-05-18

## 背景

Working Pipeline Step G（release-review markdown 更新）完了後、boss が最終公開判断に進む前に **dual-reviewer の公開前レビュー** を実施するフェーズ。当初設計は「Claude Code が技術整合性 review、Codex CLI が editorial review」の独立 2 観点。

ところが editorial review 実行時に Codex CLI（v1.0.3）が model version mismatch で起動不能（既定 `gpt-5.5` は CLI 未対応、ChatGPT subscription が `gpt-4o` / `gpt-5.3-codex-spark` を許可せず）。boss 判断で editorial review を Claude Code に代替実行させた。

## 決定・変更

### Technical review: PASS

Claude Code が以下を実行（blocking issues: none）:

- Step A–G 完了状態の確認
- Sanity transaction `spvtGcqRbreWFzrmNCgxGn` の patch JSON 7 件 / handoff / release-review 5 ファイル間整合性
- publish-package 画像 7 件の byte 一致（1,331,047 / 1,234,240 / 1,375,682 / 1,331,047 / 1,297,423 / 655,963 / 1,224,241）
- master file 6 件の存在確認（shared/campaign-hero-v1.png + 各 platform inline）
- patch JSON consistency（`status: saved` 7/7、`directSanityWrite: false` 7/7、`inboxSource` / `reviewNotes` 7/7）
- 5 release-review markdown の 3-axis section + boss-only field placeholder
- skipped 2 件（note-inline-manual-vs-automation-v1 / note-inline-publish-package-folder-v1）の明示記録
- secret / token / private key / paid PDF leak scan（5 release-review + 4 platform publish-package = 全 0 件）
- `npm run build`（Sanity Studio、7.8s）/ `cd dashboard && npm run build`（Next.js 16.2.6、16 routes）両者 clean

### Editorial review: PASS_WITH_NOTES（Claude Code 代替実行）

Codex CLI 不通のため Claude Code が代行（blocking issues: none）:

- 4 媒体 main draft（X / Threads / note / Substack post.md）すべて publishable
- coreThesis「発信を頑張るより、発信が回る仕組みを作る」全媒体保持
- 完成済みツール宣伝になっていない / 過度な購読煽りなし / 内部 ID 漏出なし / paid PDF 引用なし

Non-blocking notes:

- `publish-packages/note/building-hitori-media-os/insert-map.md` が stale（Step F 配布済み 3 枚未反映）
- `publish-packages/note/building-hitori-media-os/article.md` Section 4 に skipped-image を指す `> 想定画像挿入:` マーカー残存
- `publish-packages/substack/building-hitori-media-os/{about-page,welcome-email,notes}.md` は TODO stub（release-review で「手書きで埋める」と既述）
- X 6 投稿スレッド / Threads 7 投稿 reply chain は冗長気味（release-review で「4-5 本に絞る判断あり」既述）

すべて boss の手動編集パスで吸収可能 / 既に release-review に明示済み。

### Codex CLI 不通の影響

- 本来期待した「異なるモデルによる独立 2 観点」は成立しない（Technical + Editorial が同モデル）
- 致命的でないが、後日 Codex CLI 復旧時に editorial 軸の再 review を行うかどうかは boss 判断
- Codex CLI 更新は `npm install -g @openai/codex@latest` 推奨（user-level 操作、本リポジトリには影響なし）

## 理由

- **Codex 不通時に代替を選んだ理由**: Working Pipeline 1 周完走の test として「最後まで通す」優先度を boss が選択。dual-reviewer 独立性は本来 OS 設計上重要だが、本キャンペーンは「building-in-public 実験ログ」として失敗してもリカバリ可能なため、片肺で進める判断が成立。
- **代替実行を Pre-Publish Review Result に明示記録した理由**: 後日同じパイプラインを次キャンペーンで回すときに「Codex CLI 復旧チェックを公開前に強制する」trigger になる。記録しないと「dual-reviewer 失敗が起きていた」事実が消える。
- **non-blocking notes を blocking と区別した理由**: insert-map stale / Section 4 marker / Substack stubs / reply chain length はすべて publish パイプラインの停止要件ではなく、boss の手動編集パスで自然に吸収される項目。boss を急かさないために PASS 判定にした。

## 影響

- Working Pipeline 1 周（Step A→G）+ 公開前 dual-reviewer review が成立
- 「Codex CLI が落ちたら Claude Code に代替させる」が運用パターンとして実例化（次回も使える）
- 次キャンペーンでは「Codex CLI version check を Working Pipeline Step G 完了時に自動実行する」改善候補
- final-human-checklist.md に Pre-Publish Review Result セクションが追加され、boss が公開判断前に「technical + editorial の review 状態」を 1 画面で確認できる

## 次の一手

- boss が `final-human-checklist.md` の Safety Reaffirmation / Pause Conditions を読み終える
- 公開予定日を記入し、媒体ごとに手動公開（推奨順は `publish-order.md`）
- 公開後、各 final-review の `Published URL` / `Published Date` / `Reaction Notes` を手動更新
- `post-publication-log-template.md` を `docs/devlog/` にコピーして post-publication log を書く
- Codex CLI 復旧後、editorial 軸の再 review を行うか boss 判断
- Working Pipeline 1 周完走の振り返り devlog を別エントリーで起こす（note 第 6・7 章 / Visual Engine Improvement Phase の更新材料）
